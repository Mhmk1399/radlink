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
import { applyDateRangeFilters } from "@/lib/api/dateRangeFilters";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFilterParam(searchParams: URLSearchParams, key: string) {
    return (
        searchParams.get(`filter_${key}`)?.trim() ||
        searchParams.get(key)?.trim() ||
        ""
    );
}

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
    const status = getFilterParam(searchParams, "status");
    const search = searchParams.get("search")?.trim();
    const nameFilter = getFilterParam(searchParams, "name");
    const subjectFilter = getFilterParam(searchParams, "subject");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (nameFilter) {
        query.name = { $regex: escapeRegex(nameFilter), $options: "i" };
    }
    if (subjectFilter) {
        query.subject = { $regex: escapeRegex(subjectFilter), $options: "i" };
    }
    if (search) {
        const pattern = escapeRegex(search);
        query.$or = [
            { name: { $regex: pattern, $options: "i" } },
            { email: { $regex: pattern, $options: "i" } },
            { phoneNumber: { $regex: pattern, $options: "i" } },
            { subject: { $regex: pattern, $options: "i" } },
            { message: { $regex: pattern, $options: "i" } },
        ];
    }

    applyDateRangeFilters(query, searchParams, ["createdAt"]);
    const sortFields: Record<string, string> = {
        name: "name",
        subject: "subject",
        status: "status",
        createdAt: "createdAt",
    };
    const sortField = sortFields[searchParams.get("sortKey") ?? ""] ?? "createdAt";
    const sortDirection = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const [contactMessages, total] = await Promise.all([
        ContactMessage.find(query)
            .sort({ [sortField]: sortDirection, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        ContactMessage.countDocuments(query),
    ]);

    return NextResponse.json({ contactMessages, total, page, limit });
});
