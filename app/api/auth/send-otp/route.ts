import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";

// In production replace this with a real SMS provider (e.g. Kavenegar, Twilio)
async function sendSms(phone: string, otp: string) {
    console.log(`[OTP] ${phone} → ${otp}`);
}

// OTP store: in production use Redis or a DB field
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const POST = compose(withDB())(async (req: AuthRequest) => {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
        return NextResponse.json({ message: "phoneNumber is required" }, { status: 400 });
    }

    // Upsert user — create if first time
    let user = await User.findOne({ phoneNumber });
    if (!user) {
        user = await User.create({ phoneNumber, role: "user", status: "active" });
    }

    if (user.status === "blocked") {
        return NextResponse.json({ message: "Account is blocked" }, { status: 403 });
    }

    // Rate limit: 1 OTP per 60s
    const lastRequest = user.lastOtpRequestAt?.getTime() ?? 0;
    if (Date.now() - lastRequest < 60_000) {
        return NextResponse.json({ message: "Please wait before requesting a new OTP" }, { status: 429 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phoneNumber, { otp, expiresAt: Date.now() + 2 * 60_000 });

    await User.findByIdAndUpdate(user._id, { lastOtpRequestAt: new Date() });
    await sendSms(phoneNumber, otp);

    return NextResponse.json({ message: "OTP sent" });
});
