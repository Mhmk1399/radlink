import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";
import Block from "@/models/blocks";

type RouteContext = { params: Promise<{ id: string }> };

function canAccess(user: AuthRequest["ctx"]["user"], ownerId: string) {
    if (!user) return false;
    if (["admin", "superAdmin"].includes(user.role)) return true;
    return String(user._id) === ownerId;
}

// PATCH /api/pages/[id]/blocks
// Accepts an action in the body:
//
//   action: "add"      — adds a master block snapshot to the page
//   action: "remove"   — removes a block by blockId
//   action: "reorder"  — replaces the full ordered blockId array
//   action: "update"   — updates data / settings / styleOverride of one block
//
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const { action, ...payload } = await req.json();

    const page = await Page.findById(id);
    if (!page) return NextResponse.json({ message: "Page not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(page.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    switch (action) {
        case "add": {
            // payload: { blockId }
            const masterBlock = await Block.findById(payload.blockId);
            if (!masterBlock) return NextResponse.json({ message: "Block not found" }, { status: 404 });

            page.blocks.push({
                blockId:       masterBlock._id,
                type:          masterBlock.type,
                order:         page.blocks.length,
                data:          { ...masterBlock.data },
                settings:      { ...masterBlock.settings },
                styleOverride: {},
            });
            break;
        }

        case "remove": {
            // payload: { blockId }
            page.blocks = page.blocks.filter(
                (b) => String(b.blockId) !== String(payload.blockId)
            );
            // Re-normalise order
            page.blocks.forEach((b, i) => { b.order = i; });
            break;
        }

        case "reorder": {
            // payload: { order: string[] }  — array of blockIds in new order
            const orderMap = new Map<string, number>(
                (payload.order as string[]).map((bid: string, i: number) => [bid, i])
            );
            page.blocks.forEach((b) => {
                const newOrder = orderMap.get(String(b.blockId));
                if (newOrder !== undefined) b.order = newOrder;
            });
            page.blocks.sort((a, b) => a.order - b.order);
            break;
        }

        case "update": {
            // payload: { blockId, data?, settings?, styleOverride? }
            const target = page.blocks.find(
                (b) => String(b.blockId) === String(payload.blockId)
            );
            if (!target) return NextResponse.json({ message: "Block not on this page" }, { status: 404 });

            if (payload.data          !== undefined) target.data          = payload.data;
            if (payload.settings      !== undefined) target.settings      = payload.settings;
            if (payload.styleOverride !== undefined) target.styleOverride = payload.styleOverride;
            break;
        }

        default:
            return NextResponse.json({ message: "Invalid action. Use: add | remove | reorder | update" }, { status: 400 });
    }

    await page.save();
    return NextResponse.json({ blocks: page.blocks });
});
