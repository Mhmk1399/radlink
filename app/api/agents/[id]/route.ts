import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Agent from "@/models/agent";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/agents/[id] — admin or the agent themselves
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const user = req.ctx.user!;

    const agent = await Agent.findById(id)
        .populate("user", "firstName lastName phoneNumber email role status")
        .lean();

    if (!agent) return NextResponse.json({ message: "Agent not found" }, { status: 404 });

    // Only admin/superAdmin or the agent's own user can view
    const isSelf = String(agent.user._id ?? agent.user) === String(user._id);
    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    if (!isSelf && !isAdmin) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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
    if (!agent) return NextResponse.json({ message: "Agent not found" }, { status: 404 });

    const isSelf = String(agent.user) === String(user._id);
    const isAdmin = ["admin", "superAdmin"].includes(user.role);

    if (!isSelf && !isAdmin) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Fields the agent can update themselves
    const selfAllowed = ["postalCode", "fixedNumber", "companyName", "ceoName", "economicNumber", "registrationNumber"];

    // Fields only admin can update
    const adminOnly = ["limits", "pricePerLanding", "type"];

    const updates: Record<string, unknown> = {};

    for (const key of selfAllowed) {
        if (key in body) updates[key] = body[key];
    }

    if (isAdmin) {
        for (const key of adminOnly) {
            if (key in body) updates[key] = body[key];
        }
    }

    const updated = await Agent.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("user", "firstName lastName phoneNumber email role status");

    return NextResponse.json({ agent: updated });
});
