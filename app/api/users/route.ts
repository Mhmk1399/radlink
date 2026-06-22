import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import User from "@/models/users";
import "@/models/permission";

// GET /api/users — admin lists users, filterable by role/status
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, Number(searchParams.get("page")   ?? 1));
    const limit  = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const role   = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search"); // phone or name
    const mode = searchParams.get("mode");

    const query: Record<string, unknown> = {};
    if (role)   query.role   = role;
    if (status) query.status = status;
    if (mode === "agent-options") {
        query.isDeleted = false;
        query.status = "active";
        query.agentid = { $exists: false };
    }
    if (search) {
        query.$or = [
            { phoneNumber: { $regex: search, $options: "i" } },
            { firstName:   { $regex: search, $options: "i" } },
            { lastName:    { $regex: search, $options: "i" } },
        ];
    }

    if (mode === "agent-options") {
        const users = await User.find(query)
            .select("firstName lastName phoneNumber email role status")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ users, total: users.length, page: 1, limit });
    }

    const [users, total] = await Promise.all([
        User.find(query)
            .populate("permissions", "name isActive")
            .populate("createdBy", "firstName lastName phoneNumber role")
            .populate("updatedBy", "firstName lastName phoneNumber role")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        User.countDocuments(query),
    ]);

    return NextResponse.json({ users, total, page, limit });
});
