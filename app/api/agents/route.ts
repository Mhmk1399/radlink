import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withRole, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Agent from "@/models/agent";
import User from "@/models/users";

// POST /api/agents — create agent from existing user
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const body = await req.json();
    const { userId, type, postalCode, fixedNumber, pricePerLanding, companyName, ceoName, economicNumber, registrationNumber, limits } = body;

    if (!userId || !type) {
        return NextResponse.json({ message: "userId and type are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const existing = await Agent.findOne({ user: userId });
    if (existing) return NextResponse.json({ message: "Agent already exists for this user" }, { status: 409 });

    const agent = await Agent.create({
        user: userId,
        type,
        postalCode,
        fixedNumber,
        pricePerLanding: pricePerLanding ?? 0,
        companyName,
        ceoName,
        economicNumber,
        registrationNumber,
        limits: limits ?? { files: 0, blocks: 0, pages: 0, landingPages: 0 },
    });

    // Promote user role to agent and link agentid
    await User.findByIdAndUpdate(userId, { role: "agent", agentid: agent._id });

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
