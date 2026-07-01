import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { assertBuilderBlockAccess } from "@/lib/auth/builderBlockAccess";
import { withTemplateAccessScope } from "@/lib/auth/resourceScope";
import Template from "@/models/template";
import Category from "@/models/category";
import "@/models/blocks";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeObjectId(value: unknown) {
    if (typeof value !== "string") return undefined;
    return mongoose.Types.ObjectId.isValid(value) ? value : undefined;
}

function normalizeObjectIdArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) =>
            typeof item === "object" && item !== null
                ? String((item as Record<string, unknown>)._id ?? (item as Record<string, unknown>).id ?? "")
                : String(item ?? "")
        )
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
}

function normalizeBuilderBlocks(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value.filter((block) => typeof block === "object" && block !== null);
}

function normalizeTemplateBackground(value: unknown, style?: Record<string, unknown>) {
    const background =
        typeof value === "object" && value !== null
            ? (value as Record<string, unknown>)
            : {};
    const colors =
        style?.colors && typeof style.colors === "object"
            ? (style.colors as Record<string, unknown>)
            : {};
    const rawColor = String(background.color ?? colors.background ?? "").trim();
    const rawImage = String(background.image ?? style?.bgImage ?? "").trim();

    return {
        color: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(rawColor)
            ? rawColor
            : "#ffffff",
        image: /^https?:\/\//i.test(rawImage) ? rawImage : "",
    };
}

async function syncCategoryLink(
    templateId: string,
    previousCategory?: string,
    nextCategory?: string
) {
    if (previousCategory && previousCategory !== nextCategory) {
        await Category.findByIdAndUpdate(previousCategory, {
            $pull: { templates: templateId },
        });
    }

    if (nextCategory && previousCategory !== nextCategory) {
        await Category.findByIdAndUpdate(nextCategory, {
            $addToSet: { templates: templateId },
        });
    }
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const query = await withTemplateAccessScope(req.ctx.user!, { _id: id });

    const template = await Template.findOne(query)
        .populate("category", "name")
        .populate("blocks", "name type icon data settings elements")
        .lean();

    if (!template) return NextResponse.json({ message: "قالب پیدا نشد." }, { status: 404 });
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

    const template = await Template.findById(id);
    if (!template) return NextResponse.json({ message: "قالب پیدا نشد." }, { status: 404 });

    const previousCategory = template.category ? String(template.category) : undefined;
    if (body.blocks !== undefined || body.builderBlocks !== undefined) {
        const blockAccessError = await assertBuilderBlockAccess(req, body.builderBlocks);
        if (blockAccessError) return blockAccessError;
        const templateBlockAccessError = await assertBuilderBlockAccess(req, body.blocks);
        if (templateBlockAccessError) return templateBlockAccessError;
    }

    if (typeof body.name === "string") template.name = body.name.trim();
    if (typeof body.description === "string") template.description = body.description.trim();
    if (typeof body.thumbnail === "string") template.thumbnail = body.thumbnail.trim();
    if (body.style && typeof body.style === "object") template.style = body.style;
    if (body.background && typeof body.background === "object") {
        template.background = normalizeTemplateBackground(
            body.background,
            body.style && typeof body.style === "object" ? body.style : undefined
        );
    }
    if (body.blocks !== undefined) template.set("blocks", normalizeObjectIdArray(body.blocks));
    if (body.builderBlocks !== undefined) template.builderBlocks = normalizeBuilderBlocks(body.builderBlocks);
    if (typeof body.isActive === "boolean") template.isActive = body.isActive;

    if ("category" in body || "categoryId" in body) {
        const nextCategory = normalizeObjectId(body.category ?? body.categoryId);
        if (
            nextCategory &&
            !(await Category.exists({
                _id: nextCategory,
                isActive: { $ne: false },
            }))
        ) {
            return NextResponse.json(
                { message: "دسته‌بندی انتخاب‌شده غیرفعال است یا پیدا نشد." },
                { status: 400 }
            );
        }
        template.category = nextCategory ? new mongoose.Types.ObjectId(nextCategory) : undefined;
    }

    await template.save();

    const nextCategory = template.category ? String(template.category) : undefined;
    await syncCategoryLink(id, previousCategory, nextCategory);

    const populated = await Template.findById(id)
        .populate("category", "name")
        .populate("blocks", "name type icon data settings elements");

    return NextResponse.json({ template: populated });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const template = await Template.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!template) return NextResponse.json({ message: "قالب پیدا نشد." }, { status: 404 });
    if (template.category) {
        await Category.findByIdAndUpdate(template.category, {
            $pull: { templates: template._id },
        });
    }
    return NextResponse.json({ message: "قالب غیرفعال شد." });
});
