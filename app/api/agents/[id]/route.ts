import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Agent from "@/models/agent";
import {
    isValidPhoneNumber,
    normalizePhoneNumber,
    toEnglishDigits,
} from "@/lib/validation/identityFields";
import User from "@/models/users";

type RouteContext = { params: Promise<{ id: string }> };

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

// GET /api/agents/[id] — admin or the agent themselves
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const user = req.ctx.user!;

    const agent = await Agent.findById(id)
        .populate(
            "user",
            "firstName lastName phoneNumber email nationalCode fatherName avatarUrl role status createdAt",
        )
        .lean();

    if (!agent) return NextResponse.json({ message: "نماینده پیدا نشد." }, { status: 404 });

    // Only admin/superAdmin or the agent's own user can view
    const isSelf = String(agent.user._id ?? agent.user) === String(user._id);
    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    if (!isSelf && !isAdmin) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ agent });
});

// PATCH /api/agents/[id] — update agent fields
// Admin can update everything including limits and pricePerLanding
// Agent can only update their own profile fields
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const user = req.ctx.user!;
    const body = await req.json();

    const agent = await Agent.findById(id);
    if (!agent) return NextResponse.json({ message: "نماینده پیدا نشد." }, { status: 404 });

    const isSelf = String(agent.user) === String(user._id);
    const isAdmin = ["admin", "superAdmin"].includes(user.role);

    if (!isSelf && !isAdmin) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    // Fields the agent can update themselves
    const selfAllowed = ["postalCode", "fixedNumber", "companyName", "ceoName", "economicNumber", "registrationNumber"];

    // Fields only admin can update
    const adminOnly = ["limits", "pricePerLanding", "type"];

    const updates: Record<string, unknown> = {};

    if ("fixedNumber" in body) {
        const rawFixedNumber =
            typeof body.fixedNumber === "string"
                ? toEnglishDigits(body.fixedNumber).trim()
                : "";
        const fixedNumber = normalizePhoneNumber(rawFixedNumber);
        if (
            rawFixedNumber &&
            (!isValidPhoneNumber(rawFixedNumber) ||
                fixedNumber !== rawFixedNumber)
        ) {
            return NextResponse.json(
                { message: "شماره تماس باید دقیقاً ۱۱ رقم باشد." },
                { status: 400 },
            );
        }
        body.fixedNumber = fixedNumber;
    }

    for (const key of selfAllowed) {
        if (key in body) updates[key] = body[key];
    }

    if (isAdmin) {
        for (const key of adminOnly) {
            if (key in body) {
                updates[key] =
                    key === "limits" ? normalizeLimits(body[key]) : body[key];
            }
        }
    }

    const updated = await Agent.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("user", "firstName lastName phoneNumber email role status");

    if (isAdmin && "limits" in body) {
        await User.updateMany(
            {
                agentid: agent._id,
                isDeleted: false,
            },
            { $set: { limits: normalizeLimits(body.limits) } },
        );
    }

    return NextResponse.json({ agent: updated });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const agent = await Agent.findByIdAndDelete(id);
    if (!agent) return NextResponse.json({ message: "نماینده پیدا نشد." }, { status: 404 });

    await Promise.all([
        User.updateOne(
            { _id: agent.user, agentid: agent._id },
            { $unset: { agentid: "" } }
        ),
        User.updateOne(
            { _id: agent.user, role: "agent" },
            { $set: { role: "user" } }
        ),
        User.updateMany(
            { agentid: agent._id, _id: { $ne: agent.user } },
            { $unset: { agentid: "" } },
        ),
    ]);

    return NextResponse.json({ message: "نماینده حذف شد." });
});
