import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Agent from "@/models/agent";
import {
    getManagedUserIds,
    hasAgentScopedRole,
} from "@/lib/auth/agentScope";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import type { AccessAction } from "@/models/access";
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

function getAgentUserId(value: unknown) {
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        return String(record._id ?? record.id ?? "");
    }

    return String(value ?? "");
}

async function hasAgentsPermission(
    user: AuthRequest["ctx"]["user"],
    action: AccessAction,
) {
    if (!user) return false;
    if (user.role === "superAdmin") return true;

    const access = await resolveUserAccess(String(user._id), user.permissions);
    return access.components["admin.agents"]?.has(action) ?? false;
}

async function canAccessAgentUser(
    user: AuthRequest["ctx"]["user"],
    agentUserId: string,
    action: AccessAction,
    options?: { allowSelf?: boolean },
) {
    if (!user) return false;

    const isSelf = agentUserId === String(user._id);
    if (isSelf && options?.allowSelf !== false) return true;
    if (!(await hasAgentsPermission(user, action))) return false;
    if (user.role === "admin" || user.role === "superAdmin") return true;

    if (hasAgentScopedRole(user.role)) {
        const managedUserIds = await getManagedUserIds(user, {
            includeSelf: false,
        });
        return (managedUserIds ?? []).some(
            (managedId) => String(managedId) === agentUserId,
        );
    }

    return false;
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

    const agentUserId = getAgentUserId(agent.user);
    if (!(await canAccessAgentUser(user, agentUserId, "view"))) {
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

    const agentUserId = getAgentUserId(agent.user);
    const isAdmin = ["admin", "superAdmin"].includes(user.role);

    if (!(await canAccessAgentUser(user, agentUserId, "update"))) {
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
    withStatus("active"),
    withRole("agent", "agentManager", "admin", "superAdmin"),
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const user = req.ctx.user!;

    const agent = await Agent.findById(id);
    if (!agent) return NextResponse.json({ message: "نماینده پیدا نشد." }, { status: 404 });

    if (
        !(await canAccessAgentUser(user, getAgentUserId(agent.user), "delete", {
            allowSelf: false,
        }))
    ) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    await agent.deleteOne();

    await Promise.all([
        User.updateOne(
            { _id: agent.user, agentid: agent._id },
            { $unset: { agentid: "" } }
        ),
        User.updateOne(
            { _id: agent.user, role: { $in: ["agent", "agentManager"] } },
            { $set: { role: "user" } }
        ),
        User.updateMany(
            { agentid: agent._id, _id: { $ne: agent.user } },
            { $unset: { agentid: "" } },
        ),
    ]);

    return NextResponse.json({ message: "نماینده حذف شد." });
});
