import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_ROLES = ["user", "agent", "admin", "superAdmin"];

// PATCH /api/users/[id]/role — superAdmin only
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const { role } = await req.json();

    if (req.ctx.user!.role !== "superAdmin") {
        return NextResponse.json(
            { message: "فقط R A D اجازه تغییر نقش کاربران را دارد." },
            { status: 403 },
        );
    }

    if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ message: "نقش کاربر معتبر نیست." }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role, updatedBy: req.ctx.user!._id },
        { new: true }
    ).select("role status phoneNumber firstName lastName");

    if (!user) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });
    return NextResponse.json({ user });
});
