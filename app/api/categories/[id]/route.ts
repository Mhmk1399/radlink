import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Category from "@/models/category";
import Template from "@/models/template";

type RouteContext = { params: Promise<{ id: string }> };

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

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const category = await Category.findById(id).lean();
    if (!category) return NextResponse.json({ message: "دسته‌بندی پیدا نشد." }, { status: 404 });
    const templates = await Template.find({ category: id })
        .select("name thumbnail")
        .sort({ name: 1 })
        .lean();

    return NextResponse.json({
        category: {
            ...category,
            templates: templates.map((template) => ({
                _id: String(template._id),
                id: String(template._id),
                name: template.name,
                thumbnail: template.thumbnail,
            })),
            templateCount: templates.length,
        },
    });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const { name, description } = body;

    const currentCategory = await Category.findById(id).select("templates");
    if (!currentCategory) return NextResponse.json({ message: "دسته‌بندی پیدا نشد." }, { status: 404 });

    const updates: Record<string, unknown> = {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...("isActive" in body && { isActive: Boolean(body.isActive) }),
    };

    let nextTemplateIds: string[] | null = null;
    if ("templates" in body || "templateIds" in body) {
        nextTemplateIds = normalizeTemplateIds(body.templates ?? body.templateIds);
        updates.templates = nextTemplateIds;
    }

    const category = await Category.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    }).populate("templates", "name thumbnail");

    if (!category) return NextResponse.json({ message: "دسته‌بندی پیدا نشد." }, { status: 404 });

    if (nextTemplateIds) {
        const previousTemplateIds = currentCategory.templates.map((templateId) =>
            String(templateId)
        );
        const removedTemplateIds = previousTemplateIds.filter(
            (templateId) => !nextTemplateIds?.includes(templateId)
        );

        await Promise.all([
            nextTemplateIds.length
                ? Template.updateMany(
                      { _id: { $in: nextTemplateIds } },
                      { $set: { category: id } }
                  )
                : Promise.resolve(),
            removedTemplateIds.length
                ? Template.updateMany(
                      { _id: { $in: removedTemplateIds }, category: id },
                      { $unset: { category: "" } }
                  )
                : Promise.resolve(),
        ]);
    }

    return NextResponse.json({ category });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ message: "دسته‌بندی پیدا نشد." }, { status: 404 });
    await Template.updateMany({ category: id }, { $unset: { category: "" } });
    return NextResponse.json({ message: "دسته‌بندی حذف شد." });
});
