import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { evaluateRequestAccess } from "@/lib/auth/enforceAccess";
import User from "@/models/users";
import Agent from "@/models/agent";
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
        .populate({
            path: "agentid",
            select: "user type companyName",
            populate: {
                path: "user",
                select: "firstName lastName phoneNumber email",
            },
        })
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

    if (!isValidObjectId(id)) {
        return NextResponse.json(
            { message: "شناسه کاربر معتبر نیست." },
            { status: 400 }
        );
    }

    const body = await req.json();
    const requester = req.ctx.user!;

    if (!(await canAccessUserRequest(req, id))) {
        return NextResponse.json(
            { message: "شما اجازه انجام این عملیات را ندارید." },
            { status: 403 }
        );
    }

    const target = await User.findById(id).select("role");

    if (!target) {
        return NextResponse.json(
            { message: "کاربر پیدا نشد." },
            { status: 404 }
        );
    }

    const isAdmin = ["admin", "superAdmin"].includes(requester.role);
    const isSuperAdmin = requester.role === "superAdmin";
    const isSelf = String(requester._id) === id;

    if (!isSuperAdmin && target.role === "superAdmin") {
        return NextResponse.json(
            { message: "شما اجازه ویرایش سوپر ادمین را ندارید." },
            { status: 403 }
        );
    }

    const selfAllowed = [
        "firstName",
        "lastName",
        "email",
        "avatarUrl",
        "nationalCode",
        "fatherName",
    ];

    const adminOnly = [
        "limits",
        "status",
        "agentid",
        "permissions",
        "isPhoneVerified",
    ];

    const allowedFields = isAdmin
        ? [...selfAllowed, ...adminOnly]
        : selfAllowed;

    if (isSuperAdmin) {
        allowedFields.push("role");
    }

    const updates: Record<string, unknown> = {
        updatedBy: requester._id,
    };
    const unsets: Record<string, ""> = {};

    for (const key of allowedFields) {
        if (!(key in body)) continue;

        let value = body[key];

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

        if (key === "agentid") {
            if (value === "" || value === null) {
                unsets.agentid = "";
                continue;
            } else if (
                typeof value !== "string" ||
                !isValidObjectId(value)
            ) {
                return NextResponse.json(
                    { message: "شناسه نماینده معتبر نیست." },
                    { status: 400 }
                );
            }

            const agentExists = await Agent.exists({ _id: value });
            if (!agentExists) {
                return NextResponse.json(
                    { message: "نماینده انتخاب‌شده پیدا نشد." },
                    { status: 404 }
                );
            }
        }

        if (key === "permissions") {
            if (!Array.isArray(value)) {
                return NextResponse.json(
                    { message: "فرمت دسترسی‌ها معتبر نیست." },
                    { status: 400 }
                );
            }

            const permissionIds = value.map((permission) => {
                if (
                    typeof permission === "object" &&
                    permission !== null &&
                    "_id" in permission
                ) {
                    return String(permission._id);
                }

                return String(permission);
            });

            if (!permissionIds.every(isValidObjectId)) {
                return NextResponse.json(
                    { message: "یکی از شناسه‌های دسترسی معتبر نیست." },
                    { status: 400 }
                );
            }

            value = permissionIds;
        }

        if (key === "limits") {
            if (
                typeof value !== "object" ||
                value === null ||
                Array.isArray(value)
            ) {
                return NextResponse.json(
                    { message: "فرمت محدودیت‌ها معتبر نیست." },
                    { status: 400 }
                );
            }

            const limits = value as Record<string, unknown>;

            value = {
                files: Math.max(0, Number(limits.files) || 0),
                blocks: Math.max(0, Number(limits.blocks) || 0),
                pages: Math.max(0, Number(limits.pages) || 0),
            };
        }

        if (
            ["firstName", "lastName", "email", "avatarUrl", "nationalCode", "fatherName"].includes(
                key
            )
        ) {
            value =
                typeof value === "string"
                    ? value.trim()
                    : value;
        }

        updates[key] = value;
    }

    // A normal user may only update themselves.
    if (!isAdmin && !isSelf) {
        return NextResponse.json(
            { message: "شما فقط می‌توانید حساب خودتان را ویرایش کنید." },
            { status: 403 }
        );
    }

    const user = await User.findByIdAndUpdate(
        id,
        {
            $set: updates,
            ...(Object.keys(unsets).length ? { $unset: unsets } : {}),
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("permissions", "name isActive")
        .populate({
            path: "agentid",
            select: "user type companyName",
            populate: {
                path: "user",
                select: "firstName lastName phoneNumber email",
            },
        })
        .populate(
            "createdBy",
            "firstName lastName phoneNumber role"
        )
        .populate(
            "updatedBy",
            "firstName lastName phoneNumber role"
        );

    if (!user) {
        return NextResponse.json(
            { message: "کاربر پیدا نشد." },
            { status: 404 }
        );
    }

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
