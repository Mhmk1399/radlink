import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import {
    withDB,
    withAuth,
    withStatus,
    withRole,
    withPermission,
} from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Agent from "@/models/agent";
import { getManagedUserIds, hasAgentScopedRole } from "@/lib/auth/agentScope";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/agents/[id]/toggle — flip isActive
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("agent", "agentManager", "admin", "superAdmin"),
    withPermission({ component: "admin.agents", action: "update" }),
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const requester = req.ctx.user!;

    const agent = await Agent.findById(id);
    if (!agent) return NextResponse.json({ message: "نماینده پیدا نشد." }, { status: 404 });

    if (hasAgentScopedRole(requester.role)) {
        const managedUserIds = await getManagedUserIds(requester, {
            includeSelf: false,
        });
        const canManageTarget = (managedUserIds ?? []).some(
            (managedId) => String(managedId) === String(agent.user),
        );
        if (!canManageTarget) {
            return NextResponse.json(
                { message: "این نماینده زیرمجموعه شما نیست." },
                { status: 403 },
            );
        }
    }

    agent.isActive = !agent.isActive;
    await agent.save();

    return NextResponse.json({
        message: agent.isActive ? "نماینده فعال شد." : "نماینده غیرفعال شد.",
        isActive: agent.isActive,
    });
});
