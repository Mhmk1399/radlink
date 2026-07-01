import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import User from "@/models/users";
import {
    isValidEmail,
    isValidNationalCode,
    normalizeEmail,
    normalizeNationalCode,
    toEnglishDigits,
} from "@/lib/validation/identityFields";

// Returns the logged-in user + their fully resolved access map.
// Frontend fetches this once on login and caches it — no per-component access calls needed.
export const GET = compose(
    withDB(),
    withAuth({ allowUnverifiedPhone: false }),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;

    const access = await resolveUserAccess(String(user._id), user.permissions);

    // Serialize Sets to arrays for JSON
    const serialized = {
        components: Object.fromEntries(
            Object.entries(access.components).map(([k, v]) => [k, [...v]])
        ),
        templates: Object.fromEntries(
            Object.entries(access.templates).map(([k, v]) => [k, [...v]])
        ),
        blocks: Object.fromEntries(
            Object.entries(access.blocks).map(([k, v]) => [k, [...v]])
        ),
        pages: Object.fromEntries(
            Object.entries(access.pages).map(([k, v]) => [k, [...v]])
        ),
    };

    const userObject =
        typeof user.toObject === "function"
            ? user.toObject()
            : user;

    return NextResponse.json({
        user: {
            ...userObject,
            id: String(user._id),
            permissions: user.permissions?.map(String) ?? [],
        },
        access: serialized,
    });
});

export const PATCH = compose(
    withDB(),
    withAuth({ allowUnverifiedPhone: false }),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { firstName, lastName, email, avatarUrl, nationalCode, fatherName } = await req.json();

    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
        return NextResponse.json(
            { message: "نام الزامی است و باید حداقل ۲ کاراکتر باشد." },
            { status: 400 }
        );
    }

    const normalizedEmail =
        typeof email === "string" ? normalizeEmail(email) : "";
    const normalizedNationalCode =
        typeof nationalCode === "string"
            ? normalizeNationalCode(toEnglishDigits(nationalCode).trim())
            : "";
    if (normalizedEmail && !isValidEmail(normalizedEmail)) {
        return NextResponse.json(
            { message: "فرمت ایمیل معتبر نیست." },
            { status: 400 },
        );
    }
    if (
        normalizedNationalCode &&
        (!isValidNationalCode(toEnglishDigits(nationalCode).trim()) ||
            normalizedNationalCode !== toEnglishDigits(nationalCode).trim())
    ) {
        return NextResponse.json(
            { message: "کد ملی باید دقیقاً ۱۰ رقم باشد." },
            { status: 400 },
        );
    }
    if (
        normalizedNationalCode &&
        (await User.exists({
            _id: { $ne: user._id },
            nationalCode: normalizedNationalCode,
        }))
    ) {
        return NextResponse.json(
            { message: "این کد ملی قبلاً ثبت شده است." },
            { status: 409 },
        );
    }

    const updateData: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName?.trim() || "",
        updatedBy: user._id,
    };

    if (email !== undefined) updateData.email = normalizedEmail || null;
    if (avatarUrl !== undefined)
        updateData.avatarUrl =
            typeof avatarUrl === "string" ? avatarUrl.trim() || null : null;
    if (nationalCode !== undefined)
        updateData.nationalCode = normalizedNationalCode || null;
    if (fatherName !== undefined)
        updateData.fatherName =
            typeof fatherName === "string" ? fatherName.trim() || null : null;

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        updateData,
        { new: true }
    );

    if (!updatedUser) {
        return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
});
