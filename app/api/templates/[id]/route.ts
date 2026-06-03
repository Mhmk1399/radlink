import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Template from "@/models/template";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const template = await Template.findById(id)
        .populate("category", "name")
        .populate("blocks", "name type icon data settings style")
        .lean();

    if (!template) return NextResponse.json({ message: "Template not found" }, { status: 404 });
    return NextResponse.json({ template });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    const allowed = ["name", "description", "thumbnail", "style", "category", "blocks", "isActive"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in body) updates[key] = body[key];
    }

    const template = await Template.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
        .populate("blocks", "name type icon style");

    if (!template) return NextResponse.json({ message: "Template not found" }, { status: 404 });
    return NextResponse.json({ template });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const template = await Template.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!template) return NextResponse.json({ message: "Template not found" }, { status: 404 });
    return NextResponse.json({ message: "Template deactivated" });
});
