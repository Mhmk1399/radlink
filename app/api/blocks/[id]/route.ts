import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Block from "@/models/blocks";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const block = await Block.findById(id).lean();
    if (!block) return NextResponse.json({ message: "بلاک پیدا نشد." }, { status: 404 });
    return NextResponse.json({ block });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    const allowed = ["name", "type", "icon", "data", "settings", "style", "isActive"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
        if (key in body) updates[key] = body[key];
    }

    const block = await Block.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!block) return NextResponse.json({ message: "بلاک پیدا نشد." }, { status: 404 });

    return NextResponse.json({ block });
});

// Soft delete — just flips isActive
export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const block = await Block.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!block) return NextResponse.json({ message: "بلاک پیدا نشد." }, { status: 404 });
    return NextResponse.json({ message: "بلاک غیرفعال شد." });
});
