import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import {
    checkUserQuota,
    quotaExceededResponse,
} from "@/lib/auth/quota";
import { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";
import Block from "@/models/blocks";
import User from "@/models/users";
import { syncPageProducts } from "@/lib/products/syncPageProducts";
import { canAccessActorOwner } from "@/lib/auth/agentScope";

type RouteContext = { params: Promise<{ id: string }> };

async function canAccess(req: AuthRequest, ownerId: string, assignedUserId?: string) {
    const user = req.ctx.user;
    if (!user) return false;
    if (await canAccessActorOwner(user, ownerId)) return true;
    return assignedUserId ? canAccessActorOwner(user, assignedUserId) : false;
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
    if (!page) return NextResponse.json({ message: "صفحه پیدا نشد." }, { status: 404 });
    if (
        !(await canAccess(
            req,
            String(page.owner),
            page.assignedUser ? String(page.assignedUser) : undefined,
        ))
    ) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    switch (action) {
        case "add": {
            const ownerUser =
                String(page.owner) === String(req.ctx.user!._id)
                    ? req.ctx.user!
                    : await User.findById(page.owner);
            if (!ownerUser) {
                return NextResponse.json(
                    { message: "مالک صفحه پیدا نشد." },
                    { status: 404 }
                );
            }

            const blockQuota = await checkUserQuota({
                user: ownerUser,
                resource: "blocks",
                absoluteUsage: page.blocks.length + 1,
                currentUsage: page.blocks.length,
            });
            if (!blockQuota.allowed) return quotaExceededResponse(blockQuota);

            // payload: { blockId }
            const masterBlock = await Block.findById(payload.blockId);
            if (!masterBlock) return NextResponse.json({ message: "بلاک پیدا نشد." }, { status: 404 });

            page.blocks.push({
                instanceId:    `${masterBlock.type}-${Date.now()}`,
                blockId:       masterBlock._id,
                type:          masterBlock.type,
                version:       masterBlock.version ?? 1,
                order:         page.blocks.length,
                isActive:      true,
                data:          { ...masterBlock.data },
                settings:      { ...masterBlock.settings },
                elements:      { ...masterBlock.elements },
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
            if (!target) return NextResponse.json({ message: "این بلاک روی این صفحه وجود ندارد." }, { status: 404 });

            if (payload.data          !== undefined) target.data          = payload.data;
            if (payload.settings      !== undefined) target.settings      = payload.settings;
            if (payload.styleOverride !== undefined) target.styleOverride = payload.styleOverride;
            break;
        }

        default:
            return NextResponse.json({ message: "عملیات معتبر نیست. از add، remove، reorder یا update استفاده کنید." }, { status: 400 });
    }

    await page.save();
    await syncPageProducts({
        pageId: page._id,
        ownerId: page.owner,
        blocks: page.blocks,
    });
    revalidatePath("/[url]", "page");
    return NextResponse.json({ blocks: page.blocks });
});
