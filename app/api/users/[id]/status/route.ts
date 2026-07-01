import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["active", "inactive"];

// PATCH /api/users/[id]/status
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ message: "وضعیت کاربر معتبر نیست." }, { status: 400 });
    }

    const target = await User.findById(id).select("role");
    if (!target) {
        return NextResponse.json(
            { message: "کاربر پیدا نشد." },
            { status: 404 },
        );
    }
    if (
        target.role === "superAdmin" &&
        req.ctx.user!.role !== "superAdmin"
    ) {
        return NextResponse.json(
            { message: "فقط R A D می‌تواند وضعیت R A D را تغییر دهد." },
            { status: 403 },
        );
    }

    const user = await User.findByIdAndUpdate(
        id,
        { status, updatedBy: req.ctx.user!._id },
        { new: true }
    ).select("status role phoneNumber firstName lastName");

    if (!user) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });
    return NextResponse.json({ user });
});
