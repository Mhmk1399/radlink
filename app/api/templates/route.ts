import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { assertBuilderBlockAccess } from "@/lib/auth/builderBlockAccess";
import Template from "@/models/template";
import Category from "@/models/category";
import "@/models/blocks";

const DEFAULT_TEMPLATE_STYLE = {
    fontFamily: "inherit",
    fontSizeBase: "16px",
    lineHeight: "1.7",
    colors: {
        primary: "#2563eb",
        secondary: "#7c3aed",
        accent: "#10b981",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        textMuted: "#64748b",
        border: "#e2e8f0",
    },
    spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
    },
    button: {},
    card: {},
    extra: {},
};

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

// POST /api/templates — admin creates a template
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const {
        name,
        description,
        thumbnail,
        style,
        category,
        categoryId,
        blocks,
        builderBlocks,
        background,
    } = await req.json();

    if (!name) {
        return NextResponse.json({ message: "نام تمپلیت الزامی است." }, { status: 400 });
    }

    const blockAccessError = await assertBuilderBlockAccess(req, builderBlocks);
    if (blockAccessError) return blockAccessError;
    const templateBlockAccessError = await assertBuilderBlockAccess(req, blocks);
    if (templateBlockAccessError) return templateBlockAccessError;

    const normalizedCategory = normalizeObjectId(category ?? categoryId);

    const template = await Template.create({
        name,
        description,
        thumbnail,
        style: style?.colors ? style : DEFAULT_TEMPLATE_STYLE,
        category: normalizedCategory,
        blocks: normalizeObjectIdArray(blocks),
        builderBlocks: normalizeBuilderBlocks(builderBlocks),
        background: normalizeTemplateBackground(
            background,
            style && typeof style === "object" ? style : undefined
        ),
    });

    if (normalizedCategory) {
        await Category.findByIdAndUpdate(normalizedCategory, {
            $addToSet: { templates: template._id },
        });
    }

    return NextResponse.json({ template }, { status: 201 });
});

// GET /api/templates — list, filterable by category and isActive
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? searchParams.get("pageSize") ?? 100));
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (isActive !== null) query.isActive = isActive === "true";

    const [templates, total] = await Promise.all([
        Template.find(query)
            .populate("category", "name")
            .populate("blocks", "name type icon style")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Template.countDocuments(query),
    ]);

    return NextResponse.json({ templates, total, page, limit });
});
