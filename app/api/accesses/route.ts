import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole, withPermission } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Access from "@/models/access";
import {
    ACCESS_ACTIONS,
    getAccessActionsForComponent,
    getAccessActionsForResource,
} from "@/lib/auth/accessCatalog";
import "@/models/template";
import "@/models/blocks";
import "@/models/pages";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeActions(
    value: unknown,
    allowedActions: readonly { value: string }[] = ACCESS_ACTIONS,
) {
    if (!Array.isArray(value)) return [];
    const validActions = new Set<string>(allowedActions.map((action) => action.value));
    return [...new Set(value.map(String).filter((action) => validActions.has(action)))];
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
            const actions = normalizeActions(
                (item as Record<string, unknown>).actions,
                getAccessActionsForComponent(componentName),
            );
            if (!componentName || actions.length === 0) return null;
            return { componentName, actions };
        })
        .filter(Boolean);
}

function normalizeDynamicItems(
    value: unknown,
    idKey: "templateId" | "blockId" | "pageId",
    resource: "templates" | "blocks" | "pages",
) {
    if (!Array.isArray(value)) return [];

    return value
        .map((item) => {
            if (typeof item !== "object" || item === null) return null;
            const id = normalizeObjectId((item as Record<string, unknown>)[idKey]);
            const actions = normalizeActions(
                (item as Record<string, unknown>).actions,
                getAccessActionsForResource(resource),
            );
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
            templates: normalizeDynamicItems(dynamicAccess.templates, "templateId", "templates"),
            blocks: normalizeDynamicItems(dynamicAccess.blocks, "blockId", "blocks"),
            pages: normalizeDynamicItems(dynamicAccess.pages, "pageId", "pages"),
        },
    };
}

function populateAccessQuery() {
    return Access.find()
        .populate("dynamicAccess.templates.templateId", "name thumbnail")
        .populate("dynamicAccess.blocks.blockId", "name type icon category")
        .populate("dynamicAccess.pages.pageId", "title url isPublished");
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.accesses", action: "create" })
)(async (req: AuthRequest) => {
    const body = await req.json();
    const payload = normalizeAccessPayload(body);
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
        return NextResponse.json(
            { message: "نام Access الزامی است." },
            { status: 400 },
        );
    }
    if (name.length > 120) {
        return NextResponse.json(
            { message: "نام Access نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد." },
            { status: 400 },
        );
    }
    if (await Access.exists({ name })) {
        return NextResponse.json(
            { message: "Access دیگری با این نام وجود دارد." },
            { status: 409 },
        );
    }

    const hasAnyAccess =
        payload.staticComponents.length > 0 ||
        payload.dynamicAccess.templates.length > 0 ||
        payload.dynamicAccess.blocks.length > 0 ||
        payload.dynamicAccess.pages.length > 0;

    if (!hasAnyAccess) {
        return NextResponse.json({ message: "حداقل یک قانون دسترسی الزامی است." }, { status: 400 });
    }

    const access = await Access.create({
        name,
        staticComponents: payload.staticComponents,
        dynamicAccess: payload.dynamicAccess,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    });

    return NextResponse.json({ access }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin"),
    withPermission({ component: "admin.accesses", action: "view" })
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const search = String(searchParams.get("search") ?? "").trim();
    const query = search
        ? { name: { $regex: escapeRegex(search), $options: "i" } }
        : {};

    const [accesses, total] = await Promise.all([
        populateAccessQuery()
            .find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Access.countDocuments(query),
    ]);

    return NextResponse.json({ accesses, total, page, limit });
});
