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
//         if (!template) return NextResponse.json({ message: "قالب پیدا نشد." }, { status: 404 });

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
import { assertBuilderBlockMutationAccess } from "@/lib/auth/builderBlockAccess";
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
import Product from "@/models/products";
import {
    isPageExpired,
    parsePageExpiration,
} from "@/lib/pages/pageExpiration";
import "@/models/blocks";
import { syncPageProducts } from "@/lib/products/syncPageProducts";
import { canAccessActorOwner } from "@/lib/auth/agentScope";
import {
    getCachedPageExpiryAlerts,
    invalidatePageExpiryAlertsCache,
    type PageExpiryAlert,
    type PageExpiryAlertsData,
} from "@/lib/pages/pageExpiryAlertsCache";
import { PAGE_EXPIRY_DAY_MS } from "@/lib/pages/pageExpiryStatus";
import { normalizeLogoHeaderSettings } from "@/lib/design/logo-header";
import { normalizeLandingFontId } from "@/lib/design/landing-fonts";
import { normalizePageBackgroundSettings } from "@/lib/design/page-background";
import { normalizePageFooterSettings } from "@/lib/design/page-footer";
import {
    getPageSlugValidationError,
    normalizePageSlugInput,
    PAGE_SLUG_RULE_MESSAGE,
    sanitizePageSlug,
} from "@/lib/validation/pageSlug";
import { CUSTOM_HOME_SCREEN_ICON_SETTING_KEY } from "@/lib/design/landing-icons";

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function loadPageExpiryAlerts(): Promise<PageExpiryAlertsData> {
    const now = new Date();
    const warningLimit = new Date(now.getTime() + 10 * PAGE_EXPIRY_DAY_MS);
    const criticalLimit = new Date(now.getTime() + 3 * PAGE_EXPIRY_DAY_MS);

    const [upcomingPages, expiredPages, expired, critical, warning] =
        await Promise.all([
            Page.find({
                expiresAt: { $gt: now, $lte: warningLimit },
            })
                .select("title url expiresAt owner")
                .sort({ expiresAt: 1 })
                .limit(50)
                .populate("owner", "firstName lastName phoneNumber")
                .lean(),
            Page.find({ expiresAt: { $lte: now } })
                .select("title url expiresAt owner")
                .sort({ expiresAt: -1 })
                .limit(20)
                .populate("owner", "firstName lastName phoneNumber")
                .lean(),
            Page.countDocuments({ expiresAt: { $lte: now } }),
            Page.countDocuments({
                expiresAt: { $gt: now, $lte: criticalLimit },
            }),
            Page.countDocuments({
                expiresAt: { $gt: criticalLimit, $lte: warningLimit },
            }),
        ]);

    const alerts = [...upcomingPages, ...expiredPages]
        .map((page): PageExpiryAlert | null => {
            const pageRecord = page as unknown as Record<string, unknown>;
            const ownerRecord = isObject(pageRecord.owner)
                ? pageRecord.owner
                : null;
            const expiresAt = new Date(String(pageRecord.expiresAt ?? ""));

            if (Number.isNaN(expiresAt.getTime())) return null;

            return {
                id: String(pageRecord._id ?? ""),
                title: String(pageRecord.title ?? "بدون عنوان"),
                url: String(pageRecord.url ?? ""),
                expiresAt: expiresAt.toISOString(),
                owner: ownerRecord
                    ? {
                        id: String(ownerRecord._id ?? ownerRecord.id ?? ""),
                        firstName: String(ownerRecord.firstName ?? ""),
                        lastName: String(ownerRecord.lastName ?? ""),
                        phoneNumber: String(ownerRecord.phoneNumber ?? ""),
                    }
                    : null,
            };
        })
        .filter((page): page is PageExpiryAlert => page !== null);

    return {
        alerts,
        counts: {
            expired,
            critical,
            warning,
            total: expired + critical + warning,
        },
        generatedAt: new Date().toISOString(),
    };
}

function getOptionalObjectId(value: unknown) {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "string" && mongoose.Types.ObjectId.isValid(value)) {
        return value;
    }
    return null;
}

function canAssignPageUser(role: unknown) {
    return role === "agent" || role === "admin" || role === "superAdmin";
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

function normalizePageBackground(value: unknown) {
    return normalizePageBackgroundSettings(value);
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

    const rawUrl = typeof body.url === "string" ? body.url : "";
    const hasExplicitUrl = Boolean(rawUrl.trim());
    const urlSource = hasExplicitUrl ? rawUrl : title;
    const url = sanitizePageSlug(urlSource);

    if (
        hasExplicitUrl &&
        normalizePageSlugInput(rawUrl) !== sanitizePageSlug(rawUrl)
    ) {
        return NextResponse.json(
            { message: PAGE_SLUG_RULE_MESSAGE },
            { status: 400 }
        );
    }

    const urlError = getPageSlugValidationError(url);
    if (urlError) {
        return NextResponse.json(
            { message: urlError },
            { status: 400 }
        );
    }

    const description =
        typeof body.description === "string" ? body.description.trim() : "";
    const logo = typeof body.logo === "string" ? body.logo.trim() : "";
    const requestedSeo = isObject(body.seo) ? body.seo : {};
    const isPublished =
        typeof body.isPublished === "boolean" ? body.isPublished : true;
    const requestedExpiration = parsePageExpiration(body.expiresAt);
    if (requestedExpiration.error) {
        return NextResponse.json(
            { message: requestedExpiration.error },
            { status: 400 },
        );
    }
    if (
        body.expiresAt !== undefined &&
        !["admin", "superAdmin"].includes(user.role)
    ) {
        return NextResponse.json(
            { message: "فقط مدیر می‌تواند تاریخ انقضای صفحه را تعیین کند." },
            { status: 403 },
        );
    }
    const expiresAt = requestedExpiration.value;
    const effectivePublished = isPublished && !isPageExpired(expiresAt);

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

    const requestedAssignedUserId = getOptionalObjectId(body.assignedUserId);
    if (requestedAssignedUserId === null) {
        return NextResponse.json(
            { message: "شناسه کاربر اختصاص‌داده‌شده معتبر نیست." },
            { status: 400 }
        );
    }

    let ownerId: mongoose.Types.ObjectId | string = user._id;
    let ownerUser = user;
    if (requestedOwnerId && requestedOwnerId !== String(user._id)) {
        if (!(await canAccessActorOwner(user, requestedOwnerId))) {
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

    if (requestedAssignedUserId) {
        if (!canAssignPageUser(user.role)) {
            return NextResponse.json(
                { message: "شما اجازه اختصاص صفحه به کاربر دیگر را ندارید." },
                { status: 403 }
            );
        }

        if (!(await canAccessActorOwner(user, requestedAssignedUserId))) {
            return NextResponse.json(
                { message: "شما اجازه اختصاص صفحه به این کاربر را ندارید." },
                { status: 403 }
            );
        }

        const assignedUserExists = await User.exists({
            _id: requestedAssignedUserId,
            isDeleted: { $ne: true },
        });

        if (!assignedUserExists) {
            return NextResponse.json(
                { message: "کاربر انتخاب‌شده برای اختصاص صفحه پیدا نشد." },
                { status: 404 }
            );
        }
    }

    const pageQuota = await checkUserQuota({
        user: ownerUser,
        resource: "pages",
    });
    if (!pageQuota.allowed) return quotaExceededResponse(pageQuota);

    let blocks = Array.isArray(body.blocks) ? normalizeBlocks(body.blocks) : [];
    let templateLogoHeader: unknown;
    let templateFooter: unknown;

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
                { message: "قالب پیدا نشد یا اجازه استفاده از آن را ندارید." },
                { status: 404 }
            );
        }
        templateLogoHeader = template.logoHeader;
        templateFooter = template.footer;

        if (
            template.category &&
            !(await Category.exists({
                _id: template.category,
                isActive: { $ne: false },
            }))
        ) {
            return NextResponse.json(
                { message: "دسته‌بندی این قالب غیرفعال است." },
                { status: 400 }
            );
        }

        if (blocks.length === 0) {
            blocks = getTemplateBlocks(template as Record<string, unknown>);
        }
    }

    const blockAccessError = await assertBuilderBlockMutationAccess(req, {
        currentBlocks: [],
        nextBlocks: blocks,
    });
    if (blockAccessError) return blockAccessError;

    const blockQuota = await checkUserQuota({
        user: ownerUser,
        resource: "blocks",
        absoluteUsage: blocks.length,
        currentUsage: 0,
    });
    if (!blockQuota.allowed) return quotaExceededResponse(blockQuota);

    const pageSettings =
        body.settings && typeof body.settings === "object"
            ? { ...body.settings }
            : {
                direction: "rtl",
            };

    if (user.role === "superAdmin") {
        if (
            Object.prototype.hasOwnProperty.call(
                body,
                CUSTOM_HOME_SCREEN_ICON_SETTING_KEY,
            )
        ) {
            pageSettings[CUSTOM_HOME_SCREEN_ICON_SETTING_KEY] =
                body[CUSTOM_HOME_SCREEN_ICON_SETTING_KEY] !== false;
        }
    } else {
        delete pageSettings[CUSTOM_HOME_SCREEN_ICON_SETTING_KEY];
    }

    const page = await Page.create({
        title,
        description,
        url,
        owner: ownerId,
        assignedUser: requestedAssignedUserId ?? null,
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
        settings: pageSettings,
        styleOverride:
            body.styleOverride && typeof body.styleOverride === "object"
                ? body.styleOverride
                : {},
        background: normalizePageBackground(body.background),
        font: normalizeLandingFontId(body.font),
        logo,
        logoShape: body.logoShape === "circle" ? "circle" : "square",
        logoHeader: normalizeLogoHeaderSettings(
            body.logoHeader ?? templateLogoHeader,
        ),
        footer: normalizePageFooterSettings({
            ...(isObject(body.footer)
                ? body.footer
                : isObject(templateFooter)
                  ? templateFooter
                  : {}),
            logo: "",
            showRadlinkBranding:
                user.role === "superAdmin"
                    ? (isObject(body.footer)
                        ? body.footer.showRadlinkBranding
                        : undefined)
                    : true,
        }),
        favicon: typeof body.favicon === "string" ? body.favicon.trim() : "",
        expiresAt,
        isPublished: effectivePublished,
        publishedAt: effectivePublished ? new Date() : undefined,
    });

    try {
        await syncPageProducts({
            pageId: page._id,
            ownerId,
            blocks: page.blocks,
        });
    } catch (error) {
        console.error("Failed to synchronize page products", error);
        await Product.deleteMany({ page: page._id, source: "builder" }).catch(
            () => null
        );
        await Page.findByIdAndDelete(page._id).catch(() => null);
        return NextResponse.json(
            { message: "ذخیره محصولات صفحه با خطا مواجه شد." },
            { status: 500 }
        );
    }

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
        await Product.deleteMany({ page: page._id, source: "builder" }).catch(
            () => null
        );
        await Page.findByIdAndDelete(page._id).catch(() => null);

        return NextResponse.json(
            { message: "ساخت کد QR برای صفحه با خطا مواجه شد. لطفا دوباره تلاش کنید." },
            { status: 500 }
        );
    }

    const populatedPage = await Page.findById(page._id)
        .populate("owner", "firstName lastName email phoneNumber")
        .populate("assignedUser", "firstName lastName email phoneNumber")
        .populate("template", "name thumbnail category")
        .lean({ virtuals: true });

    revalidatePath(`/${page.url}`);
    revalidatePath("/[url]", "page");
    invalidatePageExpiryAlertsCache();

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

    if (mode === "expiry-alerts") {
        if (user.role !== "admin" && user.role !== "superAdmin") {
            return NextResponse.json(
                { message: "دسترسی به گزارش انقضای صفحات مجاز نیست." },
                { status: 403 },
            );
        }

        const { data, cacheStatus } = await getCachedPageExpiryAlerts(
            loadPageExpiryAlerts,
            searchParams.get("force") === "1",
        );

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
                "X-Radlink-Cache": cacheStatus,
            },
        });
    }

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

    const ownerIdFilter =
        searchParams.get("filter_ownerId") ?? searchParams.get("ownerId");
    if (ownerIdFilter && mongoose.Types.ObjectId.isValid(ownerIdFilter)) {
        filters.owner = ownerIdFilter;
    }

    const assignedUserIdFilter =
        searchParams.get("filter_assignedUserId") ??
        searchParams.get("assignedUserId");
    if (
        assignedUserIdFilter &&
        mongoose.Types.ObjectId.isValid(assignedUserIdFilter)
    ) {
        filters.assignedUser = assignedUserIdFilter;
    }

    const query = await withPageAccessScope(user, filters);

    if (mode === "notification-options") {
        const pages = await Page.find(query)
            .select("title url owner assignedUser isPublished")
            .sort({ updatedAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ pages });
    }

    const [pages, total] = await Promise.all([
        Page.find(query)
            .select("-blocks")
            .sort({ [sortField]: sortDirection, _id: -1 })
            .populate("owner", "firstName lastName email phoneNumber")
            .populate("assignedUser", "firstName lastName email phoneNumber")
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
