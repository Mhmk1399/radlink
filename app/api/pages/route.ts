// import { NextResponse } from "next/server";
// import { compose } from "@/lib/auth/compose";
// import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
// import { AuthRequest } from "@/lib/auth/types";
// import Page from "@/models/pages";
// import Template from "@/models/template";
// import { IBlock } from "@/models/blocks";

// // POST /api/pages
// // If templateId is provided, snapshots the template's blocks into the page.
// export const POST = compose(
//     withDB(),
//     withAuth(),
//     withStatus("active")
// )(async (req: AuthRequest) => {
//     const user = req.ctx.user!;
//     const { title, url, description, templateId, seo, settings } = await req.json();

//     if (!title || !url) {
//         return NextResponse.json({ message: "عنوان و آدرس صفحه الزامی هستند." }, { status: 400 });
//     }

//     const existing = await Page.findOne({ url });
//     if (existing) return NextResponse.json({ message: "این آدرس قبلا استفاده شده است." }, { status: 409 });

//     let blocks: InstanceType<typeof Page>["blocks"] = [];
//     let template = null;

//     if (templateId) {
//         template = await Template.findById(templateId).populate<{ blocks: IBlock[] }>("blocks");
//         if (!template) return NextResponse.json({ message: "تمپلیت پیدا نشد." }, { status: 404 });

//         // Snapshot each block — page owns its own copy
//         blocks = template.blocks.map((b: IBlock, index: number) => ({
//             blockId: b._id,
//             type: b.type,
//             order: index,
//             data: { ...b.data },
//             settings: { ...b.settings },
//             styleOverride: {},             // no overrides at creation time
//         }));
//     }

//     const page = await Page.create({
//         title, url, description,
//         owner: user._id,
//         template: templateId ?? undefined,
//         blocks,
//         seo: seo ?? {},
//         settings: settings ?? {},
//     });

//     return NextResponse.json({ page }, { status: 201 });
// });

// // GET /api/pages — owner sees their own pages, admin sees all
// export const GET = compose(
//     withDB(),
//     withAuth(),
//     withStatus("active")
// )(async (req: AuthRequest) => {
//     const user = req.ctx.user!;
//     const { searchParams } = new URL(req.url);
//     const page = Math.max(1, Number(searchParams.get("page") ?? 1));
//     const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
//     const isPublished = searchParams.get("isPublished");

//     const isAdmin = ["admin", "superAdmin"].includes(user.role);
//     const query: Record<string, unknown> = isAdmin ? {} : { owner: user._id };
//     if (isPublished !== null) query.isPublished = isPublished === "true";

//     const [pages, total] = await Promise.all([
//         Page.find(query)
//             .select("-blocks")           // exclude blocks array from list view — load on single page GET
//             .populate("template", "name style thumbnail")
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .lean(),
//         Page.countDocuments(query),
//     ]);

//     return NextResponse.json({ pages, total, page, limit });
// });
// src/app/api/pages/route.ts

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { assertBuilderBlockAccess } from "@/lib/auth/builderBlockAccess";
import {
    withPageAccessScope,
    withTemplateAccessScope,
} from "@/lib/auth/resourceScope";
import { buildPageTargetUrl, createQrForPage } from "@/lib/qrCode";
import {
    checkUserQuota,
    quotaExceededResponse,
} from "@/lib/auth/quota";
import type { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";
import Template from "@/models/template";
import Category from "@/models/category";
import User from "@/models/users";
import "@/models/blocks";

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

            order: typeof b.order === "number" ? b.order : index,

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

function getTemplateBlocks(template: Record<string, unknown> | null) {
    if (!template) return [];

    if (Array.isArray(template.builderBlocks) && template.builderBlocks.length > 0) {
        return normalizeBlocks(template.builderBlocks);
    }

    if (Array.isArray(template.blocks) && template.blocks.length > 0) {
        return normalizeBlocks(
            template.blocks.map((block, index) => {
                const b = isObject(block) ? block : {};
                return {
                    instanceId: `${String(b.type ?? "block")}-${index}`,
                    blockId: b._id ?? b.id,
                    type: b.type,
                    version: b.version,
                    order: index,
                    isActive: b.isActive,
                    data: b.data,
                    settings: b.settings,
                    elements: b.elements,
                    styleOverride: {},
                };
            })
        );
    }

    return [];
}

function slugifyUrl(value: string) {
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

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;

    const body = await req.json();

    const title =
        typeof body.title === "string" && body.title.trim()
            ? body.title.trim()
            : "صفحه جدید";

    const url =
        typeof body.url === "string" && body.url.trim()
            ? slugifyUrl(body.url)
            : slugifyUrl(title);

    if (url.length < 4) {
        return NextResponse.json(
            { message: "آدرس صفحه باید حداقل ۴ کاراکتر باشد." },
            { status: 400 }
        );
    }

    const description =
        typeof body.description === "string" ? body.description.trim() : "";
    const logo = typeof body.logo === "string" ? body.logo.trim() : "";
    const requestedSeo = isObject(body.seo) ? body.seo : {};
    const isPublished =
        typeof body.isPublished === "boolean" ? body.isPublished : true;

    const existing = await Page.findOne({ url });

    if (existing) {
        return NextResponse.json(
            { message: "این آدرس قبلاً استفاده شده است" },
            { status: 409 }
        );
    }

    const templateId =
        typeof body.templateId === "string" && mongoose.Types.ObjectId.isValid(body.templateId)
            ? body.templateId
            : typeof body.template === "string" && mongoose.Types.ObjectId.isValid(body.template)
              ? body.template
              : undefined;

    const requestedOwnerId = getOptionalObjectId(body.ownerId);
    if (requestedOwnerId === null) {
        return NextResponse.json(
            { message: "شناسه سازنده صفحه معتبر نیست." },
            { status: 400 }
        );
    }

    let ownerId: mongoose.Types.ObjectId | string = user._id;
    let ownerUser = user;
    if (requestedOwnerId && requestedOwnerId !== String(user._id)) {
        if (!["admin", "superAdmin"].includes(user.role)) {
            return NextResponse.json(
                { message: "شما اجازه تغییر سازنده صفحه را ندارید." },
                { status: 403 }
            );
        }

        const requestedOwner = await User.findOne({
            _id: requestedOwnerId,
            isDeleted: { $ne: true },
        });

        if (!requestedOwner) {
            return NextResponse.json(
                { message: "کاربر انتخاب‌شده برای سازنده صفحه پیدا نشد." },
                { status: 404 }
            );
        }

        ownerId = requestedOwnerId;
        ownerUser = requestedOwner;
    }

    const pageQuota = await checkUserQuota({
        user: ownerUser,
        resource: "pages",
    });
    if (!pageQuota.allowed) return quotaExceededResponse(pageQuota);

    const blockAccessError = await assertBuilderBlockAccess(req, body.blocks);
    if (blockAccessError) return blockAccessError;

    let blocks = Array.isArray(body.blocks) ? normalizeBlocks(body.blocks) : [];

    if (templateId) {
        const templateQuery = await withTemplateAccessScope(user, {
            _id: templateId,
            isActive: true,
        });
        const template = await Template.findOne(templateQuery)
            .populate("blocks", "type version data settings elements isActive")
            .lean();

        if (!template) {
            return NextResponse.json(
                { message: "تمپلیت پیدا نشد یا اجازه استفاده از آن را ندارید." },
                { status: 404 }
            );
        }

        if (
            template.category &&
            !(await Category.exists({
                _id: template.category,
                isActive: { $ne: false },
            }))
        ) {
            return NextResponse.json(
                { message: "دسته‌بندی این تمپلیت غیرفعال است." },
                { status: 400 }
            );
        }

        if (blocks.length === 0) {
            blocks = getTemplateBlocks(template as Record<string, unknown>);
            const templateBlockAccessError = await assertBuilderBlockAccess(req, blocks);
            if (templateBlockAccessError) return templateBlockAccessError;
        }
    }

    const blockQuota = await checkUserQuota({
        user: ownerUser,
        resource: "blocks",
        absoluteUsage: blocks.length,
        currentUsage: 0,
    });
    if (!blockQuota.allowed) return quotaExceededResponse(blockQuota);

    const page = await Page.create({
        title,
        description,
        url,
        owner: ownerId,
        template: templateId,
        blocks,
        seo: {
            title:
                typeof requestedSeo.title === "string"
                    ? requestedSeo.title.trim()
                    : title,
            description:
                typeof requestedSeo.description === "string"
                    ? requestedSeo.description.trim()
                    : description,
            keywords: Array.isArray(requestedSeo.keywords)
                ? requestedSeo.keywords
                : [],
            canonical: buildPageTargetUrl(url, req.url),
            ogImage: logo,
        },
        settings:
            body.settings && typeof body.settings === "object"
                ? body.settings
                : {
                    direction: "rtl",
                },
        styleOverride:
            body.styleOverride && typeof body.styleOverride === "object"
                ? body.styleOverride
                : {},
        background: normalizePageBackground(body.background),
        logo,
        favicon: typeof body.favicon === "string" ? body.favicon.trim() : "",
        isPublished,
        publishedAt: isPublished ? new Date() : undefined,
    });

    let qr: unknown = null;
    try {
        qr = await createQrForPage({
            pageId: String(page._id),
            creatorId: String(user._id),
            pageUrl: page.url,
            requestUrl: req.url,
        });
    } catch (error) {
        console.error("Failed to create page QR code", error);
        await Page.findByIdAndDelete(page._id).catch(() => null);

        return NextResponse.json(
            { message: "ساخت کد QR برای صفحه با خطا مواجه شد. لطفا دوباره تلاش کنید." },
            { status: 500 }
        );
    }

    const populatedPage = await Page.findById(page._id)
        .populate("owner", "firstName lastName email phoneNumber")
        .populate("template", "name thumbnail category")
        .lean({ virtuals: true });

    revalidatePath(`/${page.url}`);

    return NextResponse.json({ page: populatedPage ?? page, qr }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const isPublished = searchParams.get("isPublished");
    const mode = searchParams.get("mode");
    const sortFields: Record<string, string> = {
        title: "title",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        viewCount: "stats.views",
        visitorCount: "stats.visitors",
    };
    const sortField = sortFields[searchParams.get("sortKey") ?? ""] ?? "updatedAt";
    const sortDirection = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const filters: Record<string, unknown> = {};

    if (isPublished !== null) {
        filters.isPublished = isPublished === "true";
    }

    const query = await withPageAccessScope(user, filters);

    if (mode === "notification-options") {
        const pages = await Page.find(query)
            .select("title url owner isPublished")
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ pages });
    }

    const [pages, total] = await Promise.all([
        Page.find(query)
            .sort({ [sortField]: sortDirection, _id: -1 })
            .populate("owner", "firstName lastName email phoneNumber")
            .populate("template", "name thumbnail category")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean({ virtuals: true }),
        Page.countDocuments(query),
    ]);

    return NextResponse.json({
        pages,
        total,
        page,
        limit,
    });
});
