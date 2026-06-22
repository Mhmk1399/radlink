import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole, withPermission } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Permission from "@/models/permission";
import "@/models/access";
import User from "@/models/users";
import { accessCache } from "@/lib/auth/accessCache";

type RouteContext = { params: Promise<{ id: string }> };

function uniqueIds(ids: unknown) {
    if (!Array.isArray(ids)) return [];
    return [...new Set(ids.map(String).filter(Boolean))];
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.permissions", action: "view" })
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const permission = await Permission.findById(id)
        .populate("accesses")
        .populate("assignedToUsers", "firstName lastName phoneNumber role")
        .populate("grantedBy", "firstName lastName");

    if (!permission) return NextResponse.json({ message: "پرمیشن پیدا نشد." }, { status: 404 });

    return NextResponse.json({ permission });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.permissions", action: "update" })
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    const permission = await Permission.findById(id);
    if (!permission) return NextResponse.json({ message: "پرمیشن پیدا نشد." }, { status: 404 });

    const previousUserIds = permission.assignedToUsers.map(String);
    const allowed = ["name", "description", "accesses", "assignedToUsers", "isActive"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in body) updates[key] = body[key];
    }

    if ("assignedToUsers" in updates) {
        updates.assignedToUsers = uniqueIds(updates.assignedToUsers);
    }

    Object.assign(permission, updates);
    await permission.save();

    const nextUserIds = permission.assignedToUsers.map(String);
    if (permission.isActive === false) {
        await User.updateMany(
            { permissions: permission._id },
            { $pull: { permissions: permission._id } }
        );
    } else {
        await Promise.all([
            nextUserIds.length > 0
                ? User.updateMany(
                    { _id: { $in: nextUserIds } },
                    { $addToSet: { permissions: permission._id } }
                )
                : Promise.resolve(),
            User.updateMany(
                { permissions: permission._id, _id: { $nin: nextUserIds } },
                { $pull: { permissions: permission._id } }
            ),
        ]);
    }

    // Bust cache for all users affected by this permission
    const userIds = [...new Set([...previousUserIds, ...nextUserIds])];
    accessCache.delMany(userIds);

    return NextResponse.json({ permission });
});

// Soft deactivate — no hard delete
export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin"),
    withPermission({ component: "admin.permissions", action: "delete" })
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const permission = await Permission.findById(id);
    if (!permission) return NextResponse.json({ message: "پرمیشن پیدا نشد." }, { status: 404 });

    permission.isActive = false;
    await permission.save();

    const userIds = permission.assignedToUsers.map(String);
    if (userIds.length > 0) {
        await User.updateMany(
            { _id: { $in: userIds } },
            { $pull: { permissions: permission._id } }
        );
    }
    accessCache.delMany(userIds);

    return NextResponse.json({ message: "پرمیشن غیرفعال شد." });
});
