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
import { invalidatePageExpiryAlertsCache } from "@/lib/pages/pageExpiryAlertsCache";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { assertBuilderBlockMutationAccess } from "@/lib/auth/builderBlockAccess";
import { buildPageTargetUrl } from "@/lib/qrCode";
import {
    hasGlobalOwnerScope,
} from "@/lib/auth/ownership";
import { canAccessActorOwner } from "@/lib/auth/agentScope";
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
import Product from "@/models/products";
import {
    isPageExpired,
    parsePageExpiration,
} from "@/lib/pages/pageExpiration";
import { syncPageProducts } from "@/lib/products/syncPageProducts";
import { deleteFileByIdentifier } from "@/lib/fileDeletion";
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

function normalizePageBackground(value: unknown) {
    return normalizePageBackgroundSettings(value);
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
        .populate("assignedUser", "firstName lastName email phoneNumber")
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
    const requestedFooter = isObject(body.footer) ? body.footer : null;

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
            if (!(await canAccessActorOwner(user, requestedOwnerId))) {
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

    if (Object.prototype.hasOwnProperty.call(body, "assignedUserId")) {
        const requestedAssignedUserId = getOptionalObjectId(body.assignedUserId);
        if (requestedAssignedUserId === null) {
            return NextResponse.json(
                { message: "شناسه کاربر اختصاص‌داده‌شده معتبر نیست." },
                { status: 400 }
            );
        }

        if (!canAssignPageUser(user.role)) {
            return NextResponse.json(
                { message: "شما اجازه اختصاص صفحه به کاربر دیگر را ندارید." },
                { status: 403 }
            );
        }

        if (requestedAssignedUserId) {
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

        update.assignedUser = requestedAssignedUserId ?? null;
    }

    if (typeof body.title === "string") {
        update.title = body.title.trim();
    }

    if (typeof body.description === "string") {
        update.description = body.description.trim();
    }

    if (typeof body.url === "string" && body.url.trim()) {
        if (normalizePageSlugInput(body.url) !== sanitizePageSlug(body.url)) {
            return NextResponse.json(
                { message: PAGE_SLUG_RULE_MESSAGE },
                { status: 400 }
            );
        }

        const nextUrl = sanitizePageSlug(body.url);
        const urlError = getPageSlugValidationError(nextUrl);
        if (urlError) {
            return NextResponse.json(
                { message: urlError },
                { status: 400 }
            );
        }

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
                { message: "قالب پیدا نشد یا اجازه استفاده از آن را ندارید." },
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
                { message: "دسته‌بندی این قالب غیرفعال است." },
                { status: 400 }
            );
        }

        update.template = nextTemplateId;
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

    if (Object.prototype.hasOwnProperty.call(body, "font")) {
        update.font = normalizeLandingFontId(body.font);
    }

    if (typeof body.logo === "string") {
        update.logo = body.logo.trim();
    }

    if (body.logoShape === "square" || body.logoShape === "circle") {
        update.logoShape = body.logoShape;
    }

    if (isObject(body.logoHeader)) {
        update.logoHeader = normalizeLogoHeaderSettings(body.logoHeader);
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

    if ("expiresAt" in body) {
        if (!["admin", "superAdmin"].includes(user.role)) {
            return NextResponse.json(
                { message: "فقط مدیر می‌تواند تاریخ انقضای صفحه را تغییر دهد." },
                { status: 403 },
            );
        }
        const expiration = parsePageExpiration(body.expiresAt);
        if (expiration.error) {
            return NextResponse.json(
                { message: expiration.error },
                { status: 400 },
            );
        }
        update.expiresAt = expiration.value;
        if (isPageExpired(expiration.value)) {
            update.isPublished = false;
            update.publishedAt = undefined;
        }
    }

    const query = await withPageAccessScope(user, { _id: id }, "update");
    const currentPage = await Page.findOne(query)
        .select("owner assignedUser blocks url logo favicon footer seo expiresAt")
        .lean();

    if (!currentPage) {
        return NextResponse.json(
            { message: "صفحه پیدا نشد" },
            { status: 404 }
        );
    }

    if (body.blocks !== undefined) {
        const blockAccessError = await assertBuilderBlockMutationAccess(req, {
            currentBlocks: currentPage.blocks,
            nextBlocks: update.blocks,
        });
        if (blockAccessError) return blockAccessError;
    }

    const effectiveExpiration =
        "expiresAt" in update ? update.expiresAt : currentPage.expiresAt;
    if (
        body.isPublished === true &&
        !("expiresAt" in body) &&
        isPageExpired(effectiveExpiration)
    ) {
        return NextResponse.json(
            { message: "ابتدا تاریخ انقضای صفحه را تغییر دهید." },
            { status: 400 },
        );
    }
    if (isPageExpired(effectiveExpiration)) {
        update.isPublished = false;
        update.publishedAt = undefined;
    }

    if (requestedFooter) {
        const footerPatch: Record<string, unknown> = { ...requestedFooter };
        footerPatch.logo = "";

        if (user.role !== "superAdmin") {
            delete footerPatch.showRadlinkBranding;
            delete footerPatch.brandingText;
        }

        update.footer = normalizePageFooterSettings(
            footerPatch,
            isObject(currentPage.footer) ? currentPage.footer : {},
        );
    }

    if (body.blocks !== undefined) {
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

    const currentSeo = isObject(currentPage.seo) ? currentPage.seo : {};
    const requestedSeo = isObject(body.seo) ? body.seo : {};
    const nextUrl =
        typeof update.url === "string" ? update.url : String(currentPage.url);
    const nextLogo =
        typeof update.logo === "string" ? update.logo : String(currentPage.logo ?? "");

    update.seo = {
        ...currentSeo,
        ...requestedSeo,
        canonical: buildPageTargetUrl(nextUrl, req.url),
        ogImage: nextLogo,
    };

    const page = await Page.findOneAndUpdate(
        query,
        { $set: update },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("owner", "firstName lastName email phoneNumber")
        .populate("assignedUser", "firstName lastName email phoneNumber")
        .populate("template", "name thumbnail category")
        .lean({ virtuals: true });

    if (!page) {
        return NextResponse.json(
            { message: "صفحه پیدا نشد" },
            { status: 404 }
        );
    }

    await syncPageProducts({
        pageId: page._id,
        ownerId:
            (update.owner as string | undefined) ??
            String(currentPage.owner),
        blocks: page.blocks,
    });

    const currentFooter = normalizePageFooterSettings(currentPage.footer);
    const nextFooter = update.footer
        ? normalizePageFooterSettings(update.footer, currentFooter)
        : currentFooter;
    const replacedImageUrls = [
        typeof update.logo === "string" &&
        String(currentPage.logo ?? "") &&
        update.logo !== String(currentPage.logo ?? "")
            ? String(currentPage.logo)
            : "",
        typeof update.favicon === "string" &&
        String(currentPage.favicon ?? "") &&
        update.favicon !== String(currentPage.favicon ?? "")
            ? String(currentPage.favicon)
            : "",
        update.footer &&
        currentFooter.logo &&
        currentFooter.logo !== nextFooter.logo
            ? currentFooter.logo
            : "",
        update.footer &&
        currentFooter.trustBadgeImage &&
        currentFooter.trustBadgeImage !== nextFooter.trustBadgeImage
            ? currentFooter.trustBadgeImage
            : "",
    ].filter(Boolean);
    await Promise.allSettled(
        [...new Set(replacedImageUrls)].map((url) =>
            deleteFileByIdentifier({ url }, user),
        ),
    );

    revalidatePath(`/${page.url}`);
    if (String(currentPage.url) !== String(page.url)) {
        revalidatePath(`/${currentPage.url}`);
    }
    revalidatePath("/[url]", "page");
    invalidatePageExpiryAlertsCache();

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

    const builderProducts = await Product.find({
        page: page._id,
        source: "builder",
    })
        .select("image imageFile")
        .lean();

    await Product.deleteMany({ page: page._id, source: "builder" });

    const fileIdentifiers = [
        page.logo ? { url: String(page.logo) } : null,
        page.favicon ? { url: String(page.favicon) } : null,
        page.footer?.logo ? { url: String(page.footer.logo) } : null,
        page.footer?.trustBadgeImage
            ? { url: String(page.footer.trustBadgeImage) }
            : null,
        ...builderProducts.map((product) =>
            product.imageFile
                ? { fileId: String(product.imageFile) }
                : product.image
                  ? { url: String(product.image) }
                  : null,
        ),
    ].filter(
        (identifier): identifier is { fileId: string } | { url: string } =>
            Boolean(identifier),
    );

    await Promise.allSettled(
        fileIdentifiers.map((identifier) =>
            deleteFileByIdentifier(identifier, user),
        ),
    );

    revalidatePath("/[url]", "page");
    invalidatePageExpiryAlertsCache();

    return NextResponse.json({
        message: "صفحه حذف شد",
    });
});
