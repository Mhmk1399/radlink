import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { evaluateRequestAccess } from "@/lib/auth/enforceAccess";
import User from "@/models/users";
import "@/models/permission";
import mongoose from "mongoose";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_ROLES = ["user", "agent", "admin", "superAdmin"];
const VALID_STATUSES = ["active", "inactive", "blocked", "pending"];

function isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
}

function isSelfOrAdmin(user: AuthRequest["ctx"]["user"], targetId: string) {
    if (!user) return false;
    if (["admin", "superAdmin"].includes(user.role)) return true;
    return String(user._id) === targetId;
}

async function canAccessUserRequest(req: AuthRequest, targetId: string) {
    if (isSelfOrAdmin(req.ctx.user, targetId)) return true;
    const evaluated = await evaluateRequestAccess(req);
    return evaluated.matched && evaluated.granted;
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (!(await canAccessUserRequest(req, id))) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    const user = await User.findById(id)
        .populate("permissions", "name isActive")
        .populate("createdBy", "firstName lastName phoneNumber role")
        .populate("updatedBy", "firstName lastName phoneNumber role")
        .lean();
    if (!user) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });
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

    if (!(await canAccessUserRequest(req, id))) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    const target = await User.findById(id).select("role");
    if (!target) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });

    // Fields anyone can update on themselves
    const selfAllowed = ["firstName", "lastName", "email", "avatarUrl", "nationalCode", "fatherName"];
    // Admin-only fields
    const adminOnly = ["limits", "createdBy", "status"];

    const isAdmin = ["admin", "superAdmin"].includes(requester.role);
    const allowed = isAdmin ? [...selfAllowed, ...adminOnly] : selfAllowed;
    if (requester.role === "superAdmin") allowed.push("role");

    const updates: Record<string, unknown> = { updatedBy: requester._id };
    for (const key of allowed) {
        if (key in body) {
            const value = body[key];
            if (key === "role") {
                if (!VALID_ROLES.includes(String(value))) {
                    return NextResponse.json(
                        { message: "نقش کاربر معتبر نیست." },
                        { status: 400 }
                    );
                }
            }
            if (key === "status") {
                if (!VALID_STATUSES.includes(String(value))) {
                    return NextResponse.json(
                        { message: "وضعیت کاربر معتبر نیست." },
                        { status: 400 }
                    );
                }
            }
            if (requester.role !== "superAdmin" && target.role === "superAdmin") {
                return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
            }
            // Handle ObjectId fields - only accept valid IDs, skip empty/null
            if (key === "createdBy" || key === "updatedBy") {
                if (!value || value === "") continue;
                if (!isValidObjectId(value)) {
                    return NextResponse.json(
                        { message: "فرمت شناسه معتبر نیست." },
                        { status: 400 }
                    );
                }
            }
            updates[key] = value;
        }
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("permissions", "name isActive")
        .populate("createdBy", "firstName lastName phoneNumber role")
        .populate("updatedBy", "firstName lastName phoneNumber role");

    if (!user) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });
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
    if (!target) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });

    if (requester.role !== "superAdmin" && target.role === "superAdmin") {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    target.isDeleted = true;
    await target.save();

    return NextResponse.json({ message: "کاربر حذف شد." });
});
