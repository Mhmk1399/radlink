import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";

type RouteContext = { params: Promise<{ id: string }> };

function canAccess(user: AuthRequest["ctx"]["user"], ownerId: string) {
    if (!user) return false;
    if (["admin", "superAdmin"].includes(user.role)) return true;
    return String(user._id) === ownerId;
}

// GET /api/pages/[id] — full page including blocks
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const page = await Page.findById(id)
        .populate("template", "name style thumbnail")
        .lean();

    if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(page.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ page });
});

// PATCH /api/pages/[id] — update page meta and style overrides
// Does NOT touch blocks array — use /api/pages/[id]/blocks for that
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    const page = await Page.findById(id);
    if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(page.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const allowed = ["title", "description", "url", "template", "styleOverride", "logo", "favicon", "seo", "extraServices", "subscription", "settings", "isPublished"];
    for (const key of allowed) {
        if (key in body) (page as Record<string, unknown>)[key] = body[key];
    }

    await page.save();
    return NextResponse.json({ page });
});

// DELETE /api/pages/[id] — hard delete, owner or admin only
export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const page = await Page.findById(id);
    if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(page.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await page.deleteOne();
    return NextResponse.json({ message: "Page deleted" });
});
