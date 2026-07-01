import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import otpStore from "@/lib/auth/otp-store";
import User from "@/models/users";
import {
    isValidPhoneNumber,
    normalizePhoneNumber,
    toEnglishDigits,
} from "@/lib/validation/identityFields";

// In production replace this with a real SMS provider (e.g. Kavenegar, Twilio)
async function sendSms(phone: string, otp: string) {
    console.log(`[OTP] ${phone} → ${otp}`);
}

export const POST = compose(withDB())(async (req: AuthRequest) => {
    const body = await req.json();
    const rawPhoneNumber = toEnglishDigits(body.phoneNumber).trim();
    const phoneNumber = normalizePhoneNumber(rawPhoneNumber);

    if (!isValidPhoneNumber(rawPhoneNumber) || phoneNumber !== rawPhoneNumber) {
        return NextResponse.json({ message: "شماره تماس باید دقیقاً ۱۱ رقم باشد." }, { status: 400 });
    }

    // Upsert user — create if first time
    let user = await User.findOne({ phoneNumber });
    if (!user) {
        user = await User.create({ phoneNumber, role: "user", status: "active" });
    }

    if (user.status === "inactive") {
        return NextResponse.json({ message: "حساب کاربری غیرفعال است." }, { status: 403 });
    }

    // Rate limit: 1 OTP per 60s
    const lastRequest = user.lastOtpRequestAt?.getTime() ?? 0;
    if (Date.now() - lastRequest < 60_000) {
        return NextResponse.json({ message: "لطفا قبل از درخواست کد جدید کمی صبر کنید." }, { status: 429 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phoneNumber, { otp, expiresAt: Date.now() + 2 * 60_000 });

    await User.findByIdAndUpdate(user._id, { lastOtpRequestAt: new Date() });
    await sendSms(phoneNumber, otp);

    return NextResponse.json({ message: "کد تایید ارسال شد." });
});
