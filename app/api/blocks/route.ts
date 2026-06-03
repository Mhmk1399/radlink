import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Block from "@/models/blocks";

// POST /api/blocks — admin creates a master block
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { name, type, data, settings, style, icon } = await req.json();

    if (!name || !type || !icon) {
        return NextResponse.json({ message: "name, type and icon are required" }, { status: 400 });
    }

    const block = await Block.create({
        name, type, icon,
        data:     data     ?? {},
        settings: settings ?? {},
        style:    style    ?? {},
    });

    return NextResponse.json({ block }, { status: 201 });
});

// GET /api/blocks — list blocks, filterable by type and isActive
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const type     = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    const query: Record<string, unknown> = {};
    if (type)          query.type     = type;
    if (isActive !== null) query.isActive = isActive === "true";

    const [blocks, total] = await Promise.all([
        Block.find(query).skip((page - 1) * limit).limit(limit).lean(),
        Block.countDocuments(query),
    ]);

    return NextResponse.json({ blocks, total, page, limit });
});
