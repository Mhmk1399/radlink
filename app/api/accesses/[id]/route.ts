import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole, withPermission } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Access from "@/models/access";
import Permission from "@/models/permission";
import { accessCache } from "@/lib/auth/accessCache";
import { forbiddenAccessResponse } from "@/lib/auth/enforceAccess";
import {
    ACCESS_ACTIONS,
    type AccessActionValue,
    type AccessResourceKind,
    getAccessActionsForComponent,
    getAccessActionsForResource,
} from "@/lib/auth/accessCatalog";
import { hasGlobalOwnerScope } from "@/lib/auth/ownership";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import "@/models/template";
import "@/models/blocks";
import "@/models/pages";

type RouteContext = { params: Promise<{ id: string }> };

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
    idKey: "templateId" | "blockId" | "pageId" | "accessId" | "permissionId",
    resource: AccessResourceKind,
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
            accesses: normalizeDynamicItems(dynamicAccess.accesses, "accessId", "accesses"),
            permissions: normalizeDynamicItems(dynamicAccess.permissions, "permissionId", "permissions"),
        },
    };
}

function populateAccessById(id: string) {
    return Access.findById(id)
        .populate("dynamicAccess.templates.templateId", "name thumbnail")
        .populate("dynamicAccess.blocks.blockId", "name type icon category")
        .populate("dynamicAccess.pages.pageId", "title url isPublished")
        .populate("dynamicAccess.accesses.accessId", "name isActive")
        .populate("dynamicAccess.permissions.permissionId", "name isActive");
}

async function assertAccessDocumentAccess(
    req: AuthRequest,
    accessId: string,
    action: AccessActionValue,
) {
    const user = req.ctx.user;
    if (!user || hasGlobalOwnerScope(user)) return null;

    const resolved = await resolveUserAccess(String(user._id), user.permissions);
    if (resolved.accesses[accessId]?.has(action)) return null;

    return forbiddenAccessResponse({
        component: "admin.accesses",
        resource: "accesses",
        resourceId: accessId,
        action,
    });
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
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const accessDenied = await assertAccessDocumentAccess(req, id, "view");
    if (accessDenied) return accessDenied;

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
    const accessDenied = await assertAccessDocumentAccess(req, id, "update");
    if (accessDenied) return accessDenied;
    const body = await req.json();
    const hasRulePayload =
        "staticComponents" in body ||
        "dynamicAccess" in body;
    const hasStatusPayload = typeof body.isActive === "boolean";
    const hasNamePayload = "name" in body;

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

    if (hasNamePayload) {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) {
            return NextResponse.json(
                { message: "نام دسترسی الزامی است." },
                { status: 400 },
            );
        }
        if (name.length > 120) {
            return NextResponse.json(
                { message: "نام دسترسی نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد." },
                { status: 400 },
            );
        }
        if (await Access.exists({ _id: { $ne: id }, name })) {
            return NextResponse.json(
                { message: "دسترسی دیگری با این نام وجود دارد." },
                { status: 409 },
            );
        }
        access.name = name;
    }

    if (hasRulePayload) {
        const payload = normalizeAccessPayload(body);

        access.staticComponents = payload.staticComponents;
        access.dynamicAccess.templates = payload.dynamicAccess.templates;
        access.dynamicAccess.blocks = payload.dynamicAccess.blocks;
        access.dynamicAccess.pages = payload.dynamicAccess.pages;
        access.dynamicAccess.accesses = payload.dynamicAccess.accesses;
        access.dynamicAccess.permissions = payload.dynamicAccess.permissions;
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
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const accessDenied = await assertAccessDocumentAccess(req, id, "delete");
    if (accessDenied) return accessDenied;

    const access = await Access.findById(id);
    if (!access) return NextResponse.json({ message: "اکسس پیدا نشد." }, { status: 404 });

    await bustByAccessId(id);

    // Remove this access from all permissions that reference it
    await Permission.updateMany({ accesses: id }, { $pull: { accesses: id } });
    await access.deleteOne();

    return NextResponse.json({ message: "اکسس حذف شد." });
});
