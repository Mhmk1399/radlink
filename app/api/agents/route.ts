import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withRole, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Agent from "@/models/agent";
import User from "@/models/users";
import {
    isValidPhoneNumber,
    normalizePhoneNumber,
    toEnglishDigits,
} from "@/lib/validation/identityFields";

function normalizeLimits(value: unknown) {
    const limits =
        typeof value === "object" && value !== null
            ? (value as Record<string, unknown>)
            : {};

    return {
        files: Math.max(0, Number(limits.files) || 0),
        blocks: Math.max(0, Number(limits.blocks) || 0),
        pages: Math.max(0, Number(limits.pages) || 0),
    };
}

// POST /api/agents — create agent from existing user
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const body = await req.json();
    const { userId, type, postalCode, fixedNumber, pricePerLanding, companyName, ceoName, economicNumber, registrationNumber, limits } = body;
    const rawFixedNumber =
        typeof fixedNumber === "string" ? toEnglishDigits(fixedNumber).trim() : "";
    const normalizedFixedNumber = normalizePhoneNumber(rawFixedNumber);

    if (!userId || !type) {
        return NextResponse.json({ message: "شناسه کاربر و نوع نماینده الزامی هستند." }, { status: 400 });
    }
    if (
        rawFixedNumber &&
        (!isValidPhoneNumber(rawFixedNumber) ||
            normalizedFixedNumber !== rawFixedNumber)
    ) {
        return NextResponse.json(
            { message: "شماره تماس باید دقیقاً ۱۱ رقم باشد." },
            { status: 400 },
        );
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "کاربر پیدا نشد." }, { status: 404 });

    const existing = await Agent.findOne({ user: userId });
    if (existing) return NextResponse.json({ message: "برای این کاربر قبلا نماینده ساخته شده است." }, { status: 409 });

    const normalizedLimits = normalizeLimits(limits);
    const agent = await Agent.create({
        user: userId,
        type,
        postalCode,
        fixedNumber: normalizedFixedNumber || undefined,
        pricePerLanding: pricePerLanding ?? 0,
        companyName,
        ceoName,
        economicNumber,
        registrationNumber,
        limits: normalizedLimits,
    });

    // Promote user role to agent and link agentid
    await User.findByIdAndUpdate(userId, {
        role: "agent",
        agentid: agent._id,
        limits: normalizedLimits,
    });

    return NextResponse.json({ agent }, { status: 201 });
});

// GET /api/agents — list all agents with pagination
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const type = searchParams.get("type");           // filter by personal|company
    const isActive = searchParams.get("isActive");   // filter by active state

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (isActive !== null) query.isActive = isActive === "true";

    const [agents, total] = await Promise.all([
        Agent.find(query)
            .populate("user", "firstName lastName phoneNumber email role status")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Agent.countDocuments(query),
    ]);

    return NextResponse.json({ agents, total, page, limit });
});
