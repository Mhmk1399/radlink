import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Permission from "@/models/permission";
import { accessCache } from "@/lib/auth/accessCache";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const permission = await Permission.findById(id)
        .populate("accesses")
        .populate("assignedToUsers", "firstName lastName phoneNumber role")
        .populate("grantedBy", "firstName lastName");

    if (!permission) return NextResponse.json({ message: "Permission not found" }, { status: 404 });

    return NextResponse.json({ permission });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    const permission = await Permission.findById(id);
    if (!permission) return NextResponse.json({ message: "Permission not found" }, { status: 404 });

    const allowed = ["name", "description", "accesses", "assignedToUsers", "isActive"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in body) updates[key] = body[key];
    }

    Object.assign(permission, updates);
    await permission.save();

    // Bust cache for all users affected by this permission
    const userIds = permission.assignedToUsers.map(String);
    accessCache.delMany(userIds);

    return NextResponse.json({ permission });
});

// Soft deactivate — no hard delete
export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const permission = await Permission.findById(id);
    if (!permission) return NextResponse.json({ message: "Permission not found" }, { status: 404 });

    permission.isActive = false;
    await permission.save();

    const userIds = permission.assignedToUsers.map(String);
    accessCache.delMany(userIds);

    return NextResponse.json({ message: "Permission deactivated" });
});
