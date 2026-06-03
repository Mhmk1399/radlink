import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Template from "@/models/template";

// POST /api/templates — admin creates a template
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { name, description, thumbnail, style, category, blocks } = await req.json();

    if (!name || !style?.colors) {
        return NextResponse.json({ message: "name and style.colors are required" }, { status: 400 });
    }

    const template = await Template.create({
        name, description, thumbnail,
        style,
        category,
        blocks: blocks ?? [],
    });

    return NextResponse.json({ template }, { status: 201 });
});

// GET /api/templates — list, filterable by category and isActive
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const query: Record<string, unknown> = {};
    if (category)          query.category = category;
    if (isActive !== null) query.isActive  = isActive === "true";

    const [templates, total] = await Promise.all([
        Template.find(query)
            .populate("category", "name")
            .populate("blocks", "name type icon style")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Template.countDocuments(query),
    ]);

    return NextResponse.json({ templates, total, page, limit });
});
