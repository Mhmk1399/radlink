import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole, withPermission } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Permission from "@/models/permission";
import "@/models/access";
import User from "@/models/users";
import { accessCache } from "@/lib/auth/accessCache";

function uniqueIds(ids: unknown) {
    if (!Array.isArray(ids)) return [];
    return [...new Set(ids.map(String).filter(Boolean))];
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.permissions", action: "create" })
)(async (req: AuthRequest) => {
    const { name, description, accesses, assignedToUsers } = await req.json();
    const assignedUserIds = uniqueIds(assignedToUsers);

    if (!name || !accesses?.length) {
        return NextResponse.json({ message: "نام و اکسس‌ها الزامی هستند." }, { status: 400 });
    }

    const permission = await Permission.create({
        name,
        description,
        accesses,
        assignedToUsers: assignedUserIds,
        grantedBy: req.ctx.user!._id,
    });

    if (assignedUserIds.length > 0) {
        await User.updateMany(
            { _id: { $in: assignedUserIds } },
            { $addToSet: { permissions: permission._id } }
        );
        accessCache.delMany(assignedUserIds);
    }

    return NextResponse.json({ permission }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.permissions", action: "view" })
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const isActive = searchParams.get("isActive");

    const query: Record<string, unknown> = {};
    if (isActive !== null) query.isActive = isActive === "true";

    const [permissions, total] = await Promise.all([
        Permission.find(query)
            .populate("accesses")
            .populate("assignedToUsers", "firstName lastName phoneNumber role")
            .populate("grantedBy", "firstName lastName phoneNumber role")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Permission.countDocuments(query),
    ]);

    return NextResponse.json({ permissions, total, page, limit });
});
