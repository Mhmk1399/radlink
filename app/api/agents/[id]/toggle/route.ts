import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Agent from "@/models/agent";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/agents/[id]/toggle — flip isActive
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const agent = await Agent.findById(id);
    if (!agent) return NextResponse.json({ message: "Agent not found" }, { status: 404 });

    agent.isActive = !agent.isActive;
    await agent.save();

    return NextResponse.json({
        message: `Agent ${agent.isActive ? "activated" : "deactivated"}`,
        isActive: agent.isActive,
    });
});
