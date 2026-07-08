import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import ContactMessage from "@/models/contactMessage";
import {
    isValidEmail,
    isValidPhoneNumber,
    normalizeEmail,
    normalizePhoneNumber,
    toEnglishDigits,
} from "@/lib/validation/identityFields";

export const POST = compose(withDB())(async (req: AuthRequest) => {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(body.email ?? "");
    const rawPhone = toEnglishDigits(body.phoneNumber ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name) {
        return NextResponse.json({ message: "نام الزامی است." }, { status: 400 });
    }
    if (!message) {
        return NextResponse.json({ message: "متن پیام الزامی است." }, { status: 400 });
    }
    if (!email && !rawPhone) {
        return NextResponse.json(
            { message: "ایمیل یا شماره تماس را وارد کنید." },
            { status: 400 },
        );
    }
    if (email && !isValidEmail(email)) {
        return NextResponse.json({ message: "ایمیل معتبر نیست." }, { status: 400 });
    }
    if (rawPhone && !isValidPhoneNumber(rawPhone)) {
        return NextResponse.json({ message: "شماره تماس معتبر نیست." }, { status: 400 });
    }

    const contactMessage = await ContactMessage.create({
        name,
        email: email || undefined,
        phoneNumber: rawPhone ? normalizePhoneNumber(rawPhone) : undefined,
        subject: subject || undefined,
        message,
    });

    return NextResponse.json(
        { message: "پیام شما با موفقیت ارسال شد.", id: contactMessage._id },
        { status: 201 },
    );
});

// Only superAdmin may read submitted contact messages.
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin"),
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { subject: { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } },
        ];
    }

    const [contactMessages, total] = await Promise.all([
        ContactMessage.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        ContactMessage.countDocuments(query),
    ]);

    return NextResponse.json({ contactMessages, total, page, limit });
});
