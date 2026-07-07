import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { signToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import User from "@/models/users";
import {
    isValidPhoneNumber,
    normalizePhoneNumber,
    toEnglishDigits,
} from "@/lib/validation/identityFields";

export const POST = compose(withDB())(async (req: AuthRequest) => {
    const body = await req.json().catch(() => ({}));
    const rawPhoneNumber = toEnglishDigits(body.phoneNumber).trim();
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
    const password = typeof body.password === "string" ? body.password : "";

    if (
        !isValidPhoneNumber(rawPhoneNumber) ||
        phoneNumber !== rawPhoneNumber ||
        !password
    ) {
        return NextResponse.json(
            { message: "شماره موبایل و رمز عبور الزامی هستند." },
            { status: 400 },
        );
    }

    const user = await User.findOne({ phoneNumber, isDeleted: false }).select(
        "+passwordHash",
    );

    if (!user || !user.passwordHash) {
        return NextResponse.json(
            { message: "شماره موبایل یا رمز عبور اشتباه است." },
            { status: 401 },
        );
    }

    if (user.status === "inactive") {
        return NextResponse.json(
            { message: "حساب کاربری غیرفعال است." },
            { status: 403 },
        );
    }

    if (!user.isPhoneVerified) {
        return NextResponse.json(
            { message: "برای فعال‌سازی ورود با رمز عبور ابتدا با پیامک وارد شوید." },
            { status: 403 },
        );
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
        return NextResponse.json(
            { message: "شماره موبایل یا رمز عبور اشتباه است." },
            { status: 401 },
        );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({
        userId: String(user._id),
        role: user.role,
        status: user.status,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phoneNumber: user.phoneNumber ?? "",
    });

    const userObject = user.toObject();

    return NextResponse.json({
        token,
        user: {
            ...userObject,
            id: String(user._id),
            hasPassword: true,
        },
    });
});
