import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";

type RouteContext = { params: Promise<{ id: string }> };

function isSelfOrAdmin(user: AuthRequest["ctx"]["user"], targetId: string) {
    if (!user) return false;
    if (["admin", "superAdmin"].includes(user.role)) return true;
    return String(user._id) === targetId;
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (!isSelfOrAdmin(req.ctx.user, id)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const user = await User.findById(id).select("-permissions").lean();
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const requester = req.ctx.user!;

    if (!isSelfOrAdmin(requester, id)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Fields anyone can update on themselves
    const selfAllowed = ["firstName", "lastName", "email", "avatarUrl", "nationalCode", "fatherName"];
    // Admin-only fields
    const adminOnly   = ["limits", "permissions", "createdBy"];

    const isAdmin = ["admin", "superAdmin"].includes(requester.role);
    const allowed = isAdmin ? [...selfAllowed, ...adminOnly] : selfAllowed;

    const updates: Record<string, unknown> = { updatedBy: requester._id };
    for (const key of allowed) {
        if (key in body) updates[key] = body[key];
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .select("-permissions");

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
});

// Soft delete — sets isDeleted: true
export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const requester = req.ctx.user!;

    // superAdmin can delete anyone, admin cannot delete superAdmin
    const target = await User.findById(id);
    if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (requester.role === "admin" && target.role === "superAdmin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    target.isDeleted = true;
    await target.save();

    return NextResponse.json({ message: "User deleted" });
});
