import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole, withPermission } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Access from "@/models/access";
import Permission from "@/models/permission";
import { accessCache } from "@/lib/auth/accessCache";
import "@/models/template";
import "@/models/blocks";
import "@/models/pages";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_ACTIONS = new Set(["view", "create", "update", "delete", "publish"]);

function normalizeActions(value: unknown) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(String).filter((action) => VALID_ACTIONS.has(action)))];
}

function normalizeObjectId(value: unknown) {
    const id =
        typeof value === "object" && value !== null
            ? String((value as Record<string, unknown>)._id ?? (value as Record<string, unknown>).id ?? "")
            : String(value ?? "");

    return mongoose.Types.ObjectId.isValid(id) ? id : null;
}

function normalizeStaticComponents(value: unknown) {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => {
            if (typeof item !== "object" || item === null) return null;
            const componentName = String((item as Record<string, unknown>).componentName ?? "").trim();
            const actions = normalizeActions((item as Record<string, unknown>).actions);
            if (!componentName || actions.length === 0) return null;
            return { componentName, actions };
        })
        .filter(Boolean);
}

function normalizeDynamicItems(value: unknown, idKey: "templateId" | "blockId" | "pageId") {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => {
            if (typeof item !== "object" || item === null) return null;
            const id = normalizeObjectId((item as Record<string, unknown>)[idKey]);
            const actions = normalizeActions((item as Record<string, unknown>).actions);
            if (!id || actions.length === 0) return null;
            return { [idKey]: id, actions };
        })
        .filter(Boolean);
}

function normalizeAccessPayload(body: Record<string, unknown>) {
    const dynamicAccess =
        typeof body.dynamicAccess === "object" && body.dynamicAccess !== null
            ? body.dynamicAccess as Record<string, unknown>
            : {};

    return {
        staticComponents: normalizeStaticComponents(body.staticComponents),
        dynamicAccess: {
            templates: normalizeDynamicItems(dynamicAccess.templates, "templateId"),
            blocks: normalizeDynamicItems(dynamicAccess.blocks, "blockId"),
            pages: normalizeDynamicItems(dynamicAccess.pages, "pageId"),
        },
    };
}

function populateAccessById(id: string) {
    return Access.findById(id)
        .populate("dynamicAccess.templates.templateId", "name thumbnail")
        .populate("dynamicAccess.blocks.blockId", "name type icon category")
        .populate("dynamicAccess.pages.pageId", "title url isPublished");
}

// Bust cache for all users that have a permission referencing this access
async function bustByAccessId(accessId: string) {
    const permissions = await Permission.find({ accesses: accessId }).lean();
    const userIds = permissions.flatMap((p) => p.assignedToUsers.map(String));
    accessCache.delMany(userIds);
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.accesses", action: "view" })
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const access = await populateAccessById(id).lean();
    if (!access) return NextResponse.json({ message: "اکسس پیدا نشد." }, { status: 404 });

    return NextResponse.json({ access });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.accesses", action: "update" })
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const hasRulePayload =
        "staticComponents" in body ||
        "dynamicAccess" in body;
    const hasStatusPayload = typeof body.isActive === "boolean";

    if (hasStatusPayload && !hasRulePayload) {
        const access = await Access.findByIdAndUpdate(
            id,
            { $set: { isActive: body.isActive } },
            { new: true, strict: false },
        );

        if (!access) return NextResponse.json({ message: "اکسس پیدا نشد." }, { status: 404 });

        await bustByAccessId(id);

        return NextResponse.json({ access });
    }

    const access = await Access.findById(id);
    if (!access) return NextResponse.json({ message: "اکسس پیدا نشد." }, { status: 404 });

    if (hasStatusPayload) {
        access.set("isActive", body.isActive, { strict: false });
    }

    if (hasRulePayload) {
        const payload = normalizeAccessPayload(body);

        access.staticComponents = payload.staticComponents;
        access.dynamicAccess.templates = payload.dynamicAccess.templates;
        access.dynamicAccess.blocks = payload.dynamicAccess.blocks;
        access.dynamicAccess.pages = payload.dynamicAccess.pages;
    }

    await access.save();
    if (hasStatusPayload) {
        await Access.updateOne(
            { _id: id },
            { $set: { isActive: body.isActive } },
            { strict: false },
        );
    }
    await bustByAccessId(id);

    return NextResponse.json({ access });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin"),
    withPermission({ component: "admin.accesses", action: "delete" })
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const access = await Access.findById(id);
    if (!access) return NextResponse.json({ message: "اکسس پیدا نشد." }, { status: 404 });

    await bustByAccessId(id);

    // Remove this access from all permissions that reference it
    await Permission.updateMany({ accesses: id }, { $pull: { accesses: id } });
    await access.deleteOne();

    return NextResponse.json({ message: "اکسس حذف شد." });
});
