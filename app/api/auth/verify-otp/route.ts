import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { signToken } from "@/lib/auth/jwt";
import otpStore from "@/lib/auth/otp-store";
import User from "@/models/users";

export const POST = compose(withDB())(async (req: AuthRequest) => {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
        return NextResponse.json({ message: "شماره موبایل و کد تایید الزامی هستند." }, { status: 400 });
    }

    const record = otpStore?.get(phoneNumber);

    // if (!record || record.otp !== otp) {
    //     return NextResponse.json({ message: "کد تایید معتبر نیست." }, { status: 401 });
    // }

    // if (Date.now() > record.expiresAt) {
    //     otpStore.delete(phoneNumber);
    //     return NextResponse.json({ message: "کد تایید منقضی شده است." }, { status: 401 });
    // }

    otpStore.delete(phoneNumber);

    const user = await User.findOneAndUpdate(
        { phoneNumber },
        { isPhoneVerified: true, phoneVerifiedAt: new Date(), lastLoginAt: new Date() },
        { new: true }
    );

    if (!user) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });

    const token = signToken({
        userId: String(user._id),
        role: user.role,
        status: user.status,
        firstName: user.firstName ?? "",   // ← اضافه کنید
        lastName: user.lastName ?? "",     // ← اضافه کنید
        phoneNumber: user.phoneNumber ?? "", // ← اضافه کنید
    });
    return NextResponse.json({ token, user });
});
