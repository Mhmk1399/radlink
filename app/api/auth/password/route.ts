import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import {
    hashPassword,
    validateStrongPassword,
    verifyPassword,
} from "@/lib/auth/password";
import User from "@/models/users";

export const PATCH = compose(
    withDB(),
    withAuth({ allowUnverifiedPhone: false }),
    withStatus("active"),
)(async (req: AuthRequest) => {
    const authUser = req.ctx.user!;
    const body = await req.json().catch(() => ({}));
    const currentPassword =
        typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
        typeof body.newPassword === "string" ? body.newPassword : "";
    const newPasswordConfirm =
        typeof body.newPasswordConfirm === "string"
            ? body.newPasswordConfirm
            : "";

    if (newPassword !== newPasswordConfirm) {
        return NextResponse.json(
            { message: "تکرار رمز عبور جدید با رمز عبور یکسان نیست." },
            { status: 400 },
        );
    }

    const passwordError = validateStrongPassword(newPassword, {
        phoneNumber: authUser.phoneNumber,
    });
    if (passwordError) {
        return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const user = await User.findById(authUser._id).select("+passwordHash");
    if (!user) {
        return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });
    }

    const existingPasswordHash = user.passwordHash;
    const hadPassword = Boolean(existingPasswordHash);

    if (existingPasswordHash) {
        if (!currentPassword) {
            return NextResponse.json(
                { message: "رمز عبور فعلی الزامی است." },
                { status: 400 },
            );
        }

        const currentMatches = await verifyPassword(
            currentPassword,
            existingPasswordHash,
        );
        if (!currentMatches) {
            return NextResponse.json(
                { message: "رمز عبور فعلی اشتباه است." },
                { status: 401 },
            );
        }

        const sameAsCurrent = await verifyPassword(
            newPassword,
            existingPasswordHash,
        );
        if (sameAsCurrent) {
            return NextResponse.json(
                { message: "رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد." },
                { status: 400 },
            );
        }
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    user.updatedBy = user._id;
    await user.save();

    return NextResponse.json({
        message: hadPassword
            ? "رمز عبور با موفقیت ذخیره شد."
            : "رمز عبور با موفقیت تنظیم شد.",
        hasPassword: true,
    });
});
