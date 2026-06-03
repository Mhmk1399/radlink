import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Permission from "@/models/permission";

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { name, description, accesses, assignedToUsers } = await req.json();

    if (!name || !accesses?.length) {
        return NextResponse.json({ message: "name and accesses are required" }, { status: 400 });
    }

    const permission = await Permission.create({
        name,
        description,
        accesses,
        assignedToUsers: assignedToUsers ?? [],
        grantedBy: req.ctx.user!._id,
    });

    return NextResponse.json({ permission }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const isActive = searchParams.get("isActive");

    const query: Record<string, unknown> = {};
    if (isActive !== null) query.isActive = isActive === "true";

    const [permissions, total] = await Promise.all([
        Permission.find(query)
            .populate("accesses")
            .populate("assignedToUsers", "firstName lastName phoneNumber role")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Permission.countDocuments(query),
    ]);

    return NextResponse.json({ permissions, total, page, limit });
});
