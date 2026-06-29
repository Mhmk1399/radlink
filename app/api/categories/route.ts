import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Category from "@/models/category";
import Template from "@/models/template";

function normalizeTemplateIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) =>
            typeof item === "object" && item !== null
                ? String((item as Record<string, unknown>)._id ?? (item as Record<string, unknown>).id ?? "")
                : String(item ?? "")
        )
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { name, description, templates, templateIds, isActive } = await req.json();
    if (!name) return NextResponse.json({ message: "نام دسته‌بندی الزامی است." }, { status: 400 });

    const normalizedTemplateIds = normalizeTemplateIds(templates ?? templateIds);

    const category = await Category.create({
        name,
        description,
        templates: normalizedTemplateIds,
        isActive: isActive === undefined ? true : Boolean(isActive),
    });

    if (normalizedTemplateIds.length > 0) {
        await Template.updateMany(
            { _id: { $in: normalizedTemplateIds } },
            { $set: { category: category._id } }
        );
    }

    return NextResponse.json({ category }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? searchParams.get("pageSize") ?? 100));
    const mode = searchParams.get("mode");

    if (mode === "options") {
        const categories = await Category.find({ isActive: { $ne: false } })
            .select("name isActive")
            .sort({ name: 1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            categories: categories.map((category) => ({
                _id: category._id,
                id: String(category._id),
                name: category.name,
            })),
            total: categories.length,
            page: 1,
            limit,
        });
    }

    const [categories, total] = await Promise.all([
        Category.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Category.countDocuments(),
    ]);

    const categoryIds = categories.map((category) => category._id);
    const templates = categoryIds.length
        ? await Template.find({ category: { $in: categoryIds } })
              .select("name thumbnail category")
              .sort({ name: 1 })
              .lean()
        : [];
    const templatesByCategory = new Map<
        string,
        Array<{ _id: string; id: string; name: string; thumbnail?: string }>
    >();

    templates.forEach((template) => {
        const categoryId = String(template.category ?? "");
        if (!categoryId) return;

        const items = templatesByCategory.get(categoryId) ?? [];
        items.push({
            _id: String(template._id),
            id: String(template._id),
            name: template.name,
            thumbnail: template.thumbnail,
        });
        templatesByCategory.set(categoryId, items);
    });

    const rows = categories.map((category) => {
        const linkedTemplates = templatesByCategory.get(String(category._id)) ?? [];
        return {
            ...category,
            templates: linkedTemplates,
            templateCount: linkedTemplates.length,
        };
    });

    return NextResponse.json({ categories: rows, total, page, limit });
});
