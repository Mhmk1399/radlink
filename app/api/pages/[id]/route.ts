// import { NextResponse } from "next/server";
// import { compose } from "@/lib/auth/compose";
// import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
// import { AuthRequest } from "@/lib/auth/types";
// import Page from "@/models/pages";

// type RouteContext = { params: Promise<{ id: string }> };

// function canAccess(user: AuthRequest["ctx"]["user"], ownerId: string) {
//     if (!user) return false;
//     if (["admin", "superAdmin"].includes(user.role)) return true;
//     return String(user._id) === ownerId;
// }

// // GET /api/pages/[id] — full page including blocks
// export const GET = compose(
//     withDB(),
//     withAuth(),
//     withStatus("active")
// )(async (req: AuthRequest, ctx: RouteContext) => {
//     const { id } = await ctx.params;

//     const page = await Page.findById(id)
//         .populate("template", "name style thumbnail")
//         .lean();

//     if (!page) return NextResponse.json({ message: "صفحه پیدا نشد." }, { status: 404 });
//     if (!canAccess(req.ctx.user, String(page.owner))) {
//         return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
//     }

//     return NextResponse.json({ page });
// });

// // PATCH /api/pages/[id] — update page meta and style overrides
// // Does NOT touch blocks array — use /api/pages/[id]/blocks for that
// export const PATCH = compose(
//     withDB(),
//     withAuth(),
//     withStatus("active")
// )(async (req: AuthRequest, ctx: RouteContext) => {
//     const { id } = await ctx.params;
//     const body = await req.json();

//     const page = await Page.findById(id);
//     if (!page) return NextResponse.json({ message: "صفحه پیدا نشد." }, { status: 404 });
//     if (!canAccess(req.ctx.user, String(page.owner))) {
//         return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
//     }

//     const allowed = ["title", "description", "url", "template", "styleOverride", "logo", "favicon", "seo", "extraServices", "subscription", "settings", "isPublished"];
//     for (const key of allowed) {
//         if (key in body) (page as Record<string, unknown>)[key] = body[key];
//     }

//     await page.save();
//     return NextResponse.json({ page });
// });

// // DELETE /api/pages/[id] — hard delete, owner or admin only
// export const DELETE = compose(
//     withDB(),
//     withAuth(),
//     withStatus("active")
// )(async (req: AuthRequest, ctx: RouteContext) => {
//     const { id } = await ctx.params;

//     const page = await Page.findById(id);
//     if (!page) return NextResponse.json({ message: "صفحه پیدا نشد." }, { status: 404 });
//     if (!canAccess(req.ctx.user, String(page.owner))) {
//         return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
//     }

//     await page.deleteOne();
//     return NextResponse.json({ message: "صفحه حذف شد." });
// });
// src/app/api/pages/[pageId]/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { evaluateRequestAccess } from "@/lib/auth/enforceAccess";
import { assertBuilderBlockAccess } from "@/lib/auth/builderBlockAccess";
import type { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";
import User from "@/models/users";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalObjectId(value: unknown) {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
        return value;
    }
    return null;
}

function normalizeBlocks(blocks: unknown) {
    if (!Array.isArray(blocks)) return [];

    return blocks.map((block, index) => {
        const b = isObject(block) ? block : {};

        const result: Record<string, unknown> = {
            instanceId:
                typeof b.instanceId === "string" && b.instanceId.trim()
                    ? b.instanceId
                    : `${String(b.type ?? "block")}-${index}`,

            type:
                typeof b.type === "string" && b.type.trim()
                    ? b.type
                    : "unknown",

            version: typeof b.version === "number" ? b.version : 1,

            order: index,

            isActive: typeof b.isActive === "boolean" ? b.isActive : true,

            data: isObject(b.data) ? b.data : {},

            settings: isObject(b.settings) ? b.settings : { direction: "rtl" },

            elements: isObject(b.elements) ? b.elements : {},

            styleOverride: isObject(b.styleOverride) ? b.styleOverride : {},
        };

        const rawBlockId = b.blockId ?? b._id ?? b.id;
        if (typeof rawBlockId === "string" && mongoose.Types.ObjectId.isValid(rawBlockId)) {
            result.blockId = new mongoose.Types.ObjectId(rawBlockId);
        }

        return result;
    });
}

function normalizeUrl(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]/g, "")
        .replace(/-+/g, "-");
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, context: RouteContext) => {
    const user = req.ctx.user!;
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { message: "شناسه صفحه معتبر نیست" },
            { status: 400 }
        );
    }

    const evaluated = await evaluateRequestAccess(req);
    const isAdmin =
        ["admin", "superAdmin"].includes(user.role) ||
        (evaluated.matched && evaluated.granted);

    const query: Record<string, unknown> = {
        _id: id,
    };

    if (!isAdmin) {
        query.owner = user._id;
    }

    const page = await Page.findOne(query)
        .populate("owner", "firstName lastName email phoneNumber")
        .populate("template", "name thumbnail category")
        .lean();

    if (!page) {
        return NextResponse.json(
            { message: "صفحه پیدا نشد" },
            { status: 404 }
        );
    }

    return NextResponse.json({ page });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, context: RouteContext) => {
    const user = req.ctx.user!;
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { message: "شناسه صفحه معتبر نیست" },
            { status: 400 }
        );
    }

    const body = await req.json();
    const update: Record<string, unknown> = {};

    const evaluated = await evaluateRequestAccess(req);
    const isAdmin =
        ["admin", "superAdmin"].includes(user.role) ||
        (evaluated.matched && evaluated.granted);

    const requestedOwnerId = getOptionalObjectId(body.ownerId);
    if (requestedOwnerId === null) {
        return NextResponse.json(
            { message: "شناسه سازنده صفحه معتبر نیست." },
            { status: 400 }
        );
    }

    if (requestedOwnerId) {
        if (!isAdmin) {
            return NextResponse.json(
                { message: "شما اجازه تغییر سازنده صفحه را ندارید." },
                { status: 403 }
            );
        }

        const ownerExists = await User.exists({
            _id: requestedOwnerId,
            isDeleted: { $ne: true },
        });

        if (!ownerExists) {
            return NextResponse.json(
                { message: "کاربر انتخاب‌شده برای سازنده صفحه پیدا نشد." },
                { status: 404 }
            );
        }

        update.owner = requestedOwnerId;
    }

    if (typeof body.title === "string") {
        update.title = body.title.trim();
    }

    if (typeof body.description === "string") {
        update.description = body.description.trim();
    }

    if (typeof body.url === "string" && body.url.trim()) {
        const nextUrl = normalizeUrl(body.url);

        const existing = await Page.findOne({
            _id: { $ne: id },
            url: nextUrl,
        }).select("_id");

        if (existing) {
            return NextResponse.json(
                { message: "این آدرس قبلاً استفاده شده است" },
                { status: 409 }
            );
        }

        update.url = nextUrl;
    }

    if (body.blocks !== undefined) {
        const blockAccessError = await assertBuilderBlockAccess(req, body.blocks);
        if (blockAccessError) return blockAccessError;
        update.blocks = normalizeBlocks(body.blocks);
    }

    if (typeof body.templateId === "string" && mongoose.Types.ObjectId.isValid(body.templateId)) {
        update.template = body.templateId;
    } else if (typeof body.template === "string" && mongoose.Types.ObjectId.isValid(body.template)) {
        update.template = body.template;
    }

    if (isObject(body.seo)) {
        update.seo = body.seo;
    }

    if (isObject(body.settings)) {
        update.settings = body.settings;
    }

    if (isObject(body.styleOverride)) {
        update.styleOverride = body.styleOverride;
    }

    if (typeof body.logo === "string") {
        update.logo = body.logo.trim();
    }

    if (typeof body.favicon === "string") {
        update.favicon = body.favicon.trim();
    }

    if (typeof body.thumbnail === "string") {
        update.thumbnail = body.thumbnail.trim();
    }

    if (typeof body.isPublished === "boolean") {
        update.isPublished = body.isPublished;
        update.publishedAt = body.isPublished ? new Date() : undefined;
    }

    const query: Record<string, unknown> = {
        _id: id,
    };

    if (!isAdmin) {
        query.owner = user._id;
    }

    const page = await Page.findOneAndUpdate(
        query,
        { $set: update },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("owner", "firstName lastName email phoneNumber")
        .populate("template", "name thumbnail category")
        .lean({ virtuals: true });

    if (!page) {
        return NextResponse.json(
            { message: "صفحه پیدا نشد" },
            { status: 404 }
        );
    }

    return NextResponse.json({ page });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, context: RouteContext) => {
    const user = req.ctx.user!;
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { message: "شناسه صفحه معتبر نیست" },
            { status: 400 }
        );
    }

    const evaluated = await evaluateRequestAccess(req);
    const isAdmin =
        ["admin", "superAdmin"].includes(user.role) ||
        (evaluated.matched && evaluated.granted);

    const query: Record<string, unknown> = {
        _id: id,
    };

    if (!isAdmin) {
        query.owner = user._id;
    }

    const page = await Page.findOneAndDelete(query);

    if (!page) {
        return NextResponse.json(
            { message: "صفحه پیدا نشد" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        message: "صفحه حذف شد",
    });
});
