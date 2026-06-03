import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { signToken } from "@/lib/auth/jwt";
import User from "@/models/users";

// Same store reference as send-otp (in production use Redis)
declare const otpStore: Map<string, { otp: string; expiresAt: number }>;

export const POST = compose(withDB())(async (req: AuthRequest) => {
    const { phoneNumber, otp } = await req.json();

    if (!phoneNumber || !otp) {
        return NextResponse.json({ message: "phoneNumber and otp are required" }, { status: 400 });
    }

    const record = otpStore?.get(phoneNumber);

    if (!record || record.otp !== otp) {
        return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(phoneNumber);
        return NextResponse.json({ message: "OTP expired" }, { status: 401 });
    }

    otpStore.delete(phoneNumber);

    const user = await User.findOneAndUpdate(
        { phoneNumber },
        { isPhoneVerified: true, phoneVerifiedAt: new Date(), lastLoginAt: new Date() },
        { new: true }
    );

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const token = signToken({ userId: String(user._id), role: user.role, status: user.status });

    return NextResponse.json({ token, user });
});
