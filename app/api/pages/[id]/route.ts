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
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { assertBuilderBlockAccess } from "@/lib/auth/builderBlockAccess";
import {
    hasGlobalOwnerScope,
} from "@/lib/auth/ownership";
import {
    withPageAccessScope,
    withTemplateAccessScope,
} from "@/lib/auth/resourceScope";
import {
    checkUserQuota,
    quotaExceededResponse,
} from "@/lib/auth/quota";
import type { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";
import Template from "@/models/template";
import Category from "@/models/category";
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

function normalizePageBackground(value: unknown) {
    const background = isObject(value) ? value : {};
    const rawColor =
        typeof background.color === "string" ? background.color.trim() : "";
    const rawImage =
        typeof background.image === "string" ? background.image.trim() : "";

    return {
        color: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(rawColor)
            ? rawColor
            : "#ffffff",
        image: /^https?:\/\//i.test(rawImage) ? rawImage : "",
    };
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

    const query = await withPageAccessScope(user, { _id: id }, "view");

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

    revalidatePath("/[url]", "page");

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

    const isAdmin = hasGlobalOwnerScope(user);

    const requestedOwnerId = getOptionalObjectId(body.ownerId);
    if (requestedOwnerId === null) {
        return NextResponse.json(
            { message: "شناسه سازنده صفحه معتبر نیست." },
            { status: 400 }
        );
    }

    if (requestedOwnerId) {
        if (!isAdmin) {
            if (String(requestedOwnerId) !== String(user._id)) {
                return NextResponse.json(
                    { message: "شما اجازه تغییر سازنده صفحه را ندارید." },
                    { status: 403 }
                );
            }
        } else {
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

    const nextTemplateId =
        typeof body.templateId === "string" && mongoose.Types.ObjectId.isValid(body.templateId)
            ? body.templateId
            : typeof body.template === "string" && mongoose.Types.ObjectId.isValid(body.template)
              ? body.template
              : undefined;

    if (nextTemplateId) {
        const templateQuery = await withTemplateAccessScope(user, {
            _id: nextTemplateId,
            isActive: true,
        });
        const selectedTemplate = await Template.findOne(templateQuery)
            .select("category")
            .lean();

        if (!selectedTemplate) {
            return NextResponse.json(
                { message: "تمپلیت پیدا نشد یا اجازه استفاده از آن را ندارید." },
                { status: 404 }
            );
        }

        if (
            selectedTemplate.category &&
            !(await Category.exists({
                _id: selectedTemplate.category,
                isActive: { $ne: false },
            }))
        ) {
            return NextResponse.json(
                { message: "دسته‌بندی این تمپلیت غیرفعال است." },
                { status: 400 }
            );
        }

        update.template = nextTemplateId;
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

    if (isObject(body.background)) {
        update.background = normalizePageBackground(body.background);
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

    const query = await withPageAccessScope(user, { _id: id }, "update");

    if (body.blocks !== undefined) {
        const currentPage = await Page.findOne(query).select("owner blocks");
        if (!currentPage) {
            return NextResponse.json(
                { message: "صفحه پیدا نشد" },
                { status: 404 }
            );
        }

        const ownerUser =
            String(currentPage.owner) === String(user._id)
                ? user
                : await User.findById(currentPage.owner);

        if (!ownerUser) {
            return NextResponse.json(
                { message: "مالک صفحه پیدا نشد." },
                { status: 404 }
            );
        }

        const nextBlocks = Array.isArray(update.blocks) ? update.blocks : [];
        const blockQuota = await checkUserQuota({
            user: ownerUser,
            resource: "blocks",
            absoluteUsage: nextBlocks.length,
            currentUsage: currentPage.blocks.length,
        });
        if (!blockQuota.allowed) return quotaExceededResponse(blockQuota);
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

    revalidatePath(`/${page.url}`);

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

    const query = await withPageAccessScope(user, { _id: id }, "delete");

    const page = await Page.findOneAndDelete(query);

    if (!page) {
        return NextResponse.json(
            { message: "صفحه پیدا نشد" },
            { status: 404 }
        );
    }

    revalidatePath("/[url]", "page");

    return NextResponse.json({
        message: "صفحه حذف شد",
    });
});
