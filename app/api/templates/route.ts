import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { assertBuilderBlockMutationAccess } from "@/lib/auth/builderBlockAccess";
import { withTemplateAccessScope } from "@/lib/auth/resourceScope";
import Template from "@/models/template";
import Category from "@/models/category";
import "@/models/blocks";
import { normalizeLogoHeaderSettings } from "@/lib/design/logo-header";
import { normalizePageBackgroundSettings } from "@/lib/design/page-background";
import { normalizePageFooterSettings } from "@/lib/design/page-footer";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFilterParam(searchParams: URLSearchParams, key: string) {
    return (
        searchParams.get(`filter_${key}`)?.trim() ||
        searchParams.get(key)?.trim() ||
        ""
    );
}

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

    return normalizePageBackgroundSettings({
        ...background,
        color: rawColor,
        image: rawImage,
    });
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
        logoHeader,
        footer,
    } = await req.json();

    if (!name) {
        return NextResponse.json({ message: "نام قالب الزامی است." }, { status: 400 });
    }

    const blockAccessError = await assertBuilderBlockMutationAccess(req, {
        currentBlocks: [],
        nextBlocks: normalizeBuilderBlocks(builderBlocks),
    });
    if (blockAccessError) return blockAccessError;
    const legacyBlockAccessError = await assertBuilderBlockMutationAccess(req, {
        currentBlocks: [],
        nextBlocks: blocks,
    });
    if (legacyBlockAccessError) return legacyBlockAccessError;

    const normalizedCategory = normalizeObjectId(category ?? categoryId);
    if (
        normalizedCategory &&
        !(await Category.exists({
            _id: normalizedCategory,
            isActive: { $ne: false },
        }))
    ) {
        return NextResponse.json(
            { message: "دسته‌بندی انتخاب‌شده غیرفعال است یا پیدا نشد." },
            { status: 400 }
        );
    }

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
        logoHeader: normalizeLogoHeaderSettings(logoHeader),
        footer: normalizePageFooterSettings({ ...(footer ?? {}), logo: "" }),
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
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? searchParams.get("pageSize") ?? 100));
    const category = getFilterParam(searchParams, "category");
    const categoryName = getFilterParam(searchParams, "categoryName");
    const isActive = getFilterParam(searchParams, "isActive");
    const search = searchParams.get("search")?.trim();

    const filters: Record<string, unknown> = {};
    if (category && mongoose.Types.ObjectId.isValid(category)) {
        filters.category = category;
    }
    if (categoryName) {
        const pattern = escapeRegex(categoryName);
        const categoryIds = await Category.find({
            name: { $regex: pattern, $options: "i" },
        }).distinct("_id");
        filters.category = { $in: categoryIds };
    }
    if (isActive === "true" || isActive === "false") {
        filters.isActive = isActive === "true";
    }
    if (search) {
        const pattern = escapeRegex(search);
        filters.$or = [
            { name: { $regex: pattern, $options: "i" } },
            { description: { $regex: pattern, $options: "i" } },
        ];
    }

    const query = await withTemplateAccessScope(user, filters);
    const sortFields: Record<string, string> = {
        name: "name",
        categoryName: "category",
        builderBlockCount: "createdAt",
        isActive: "isActive",
        createdAt: "createdAt",
    };
    const sortField = sortFields[searchParams.get("sortKey") ?? ""] ?? "createdAt";
    const sortDirection = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const [templates, total] = await Promise.all([
        Template.find(query)
            .populate("category", "name")
            .populate("blocks", "name type icon style")
            .sort({ [sortField]: sortDirection, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Template.countDocuments(query),
    ]);

    return NextResponse.json({ templates, total, page, limit });
});
