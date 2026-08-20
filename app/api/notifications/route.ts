import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withRole, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import Notification from "@/models/notification";
import Page from "@/models/pages";
import { applyDateRangeFilters } from "@/lib/api/dateRangeFilters";
import { isNotificationIconKey } from "@/lib/notifications/notificationIcons";
import {
    canAccessActorOwner,
    hasAgentScopedRole,
    withActorOwnerScope,
} from "@/lib/auth/agentScope";
import "@/models/users";

const PAGE_POPULATE_FIELDS = "title url owner isPublished";
const USER_POPULATE_FIELDS = "firstName lastName phoneNumber role";
const NOTIFICATION_TYPES = new Set(["info", "danger"]);

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanText(value: unknown, maxLength: number) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getFilterParam(searchParams: URLSearchParams, key: string) {
    return (
        searchParams.get(`filter_${key}`)?.trim() ||
        searchParams.get(key)?.trim() ||
        ""
    );
}

function getBooleanFilter(searchParams: URLSearchParams, key: string) {
    const value = getFilterParam(searchParams, key);
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
}

function getPageId(body: Record<string, unknown>) {
    const value = body.pageId ?? body.page;
    return typeof value === "string" ? value.trim() : "";
}

function normalizeNotificationContent(body: Record<string, unknown>) {
    return {
        title: cleanText(body.title, 120),
        subtitle: cleanText(body.subtitle, 180),
        description: cleanText(body.description, 2000),
    };
}

function getUserDisplayName(user: {
    firstName?: unknown;
    lastName?: unknown;
    phoneNumber?: unknown;
}) {
    const firstName = cleanText(user.firstName, 80);
    const lastName = cleanText(user.lastName, 80);
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || cleanText(user.phoneNumber, 20);
}

// Admin creates a notification for one specific page.
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("agent", "agentManager", "admin", "superAdmin"),
)(async (req: AuthRequest) => {
    const body = (await req.json()) as Record<string, unknown>;
    const isGlobal = Boolean(body.isGlobal);
    const pageId = getPageId(body);
    const content = normalizeNotificationContent(body);
    const type = cleanText(body.type, 20);
    const iconKey = cleanText(body.iconKey, 30);
    if (hasAgentScopedRole(req.ctx.user!.role) && isGlobal) {
        return NextResponse.json(
            { message: "نماینده فقط می‌تواند برای صفحات مجموعه خودش اعلان بسازد." },
            { status: 403 },
        );
    }

    if (!isGlobal && !mongoose.Types.ObjectId.isValid(pageId)) {
        return NextResponse.json(
            { message: "انتخاب صفحه برای اعلان الزامی است." },
            { status: 400 },
        );
    }
    if (!content.title) {
        return NextResponse.json(
            { message: "عنوان اعلان الزامی است." },
            { status: 400 },
        );
    }
    if (!content.description) {
        return NextResponse.json(
            { message: "توضیحات اعلان الزامی است." },
            { status: 400 },
        );
    }
    if (!NOTIFICATION_TYPES.has(type)) {
        return NextResponse.json(
            { message: "نوع اعلان باید اطلاعاتی یا خطر باشد." },
            { status: 400 },
        );
    }
    if (iconKey && !isNotificationIconKey(iconKey)) {
        return NextResponse.json(
            { message: "آیکن انتخاب‌شده برای اعلان معتبر نیست." },
            { status: 400 },
        );
    }

    if (!isGlobal) {
        const page = await Page.findById(pageId).select("owner").lean();
        if (!page) {
            return NextResponse.json(
                { message: "صفحه انتخاب‌شده پیدا نشد." },
                { status: 404 },
            );
        }
        if (!(await canAccessActorOwner(req.ctx.user!, page.owner))) {
            return NextResponse.json(
                { message: "این صفحه متعلق به مجموعه شما نیست." },
                { status: 403 },
            );
        }
    }

    const created = await Notification.create({
        page: isGlobal ? undefined : pageId,
        createdBy: req.ctx.user!._id,
        createdByName: getUserDisplayName(req.ctx.user!),
        ...content,
        type,
        iconKey,
        closeable: body.closeable === undefined ? true : Boolean(body.closeable),
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
        isGlobal,
    });

    const notification = await Notification.findById(created._id)
        .populate("page", PAGE_POPULATE_FIELDS)
        .populate("createdBy", USER_POPULATE_FIELDS)
        .lean();

    revalidatePath("/[url]", "page");

    return NextResponse.json({ notification }, { status: 201 });
});

// Admin sees every notification. Other users see notifications for pages they own.
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
        100,
        Math.max(1, Number(searchParams.get("limit") ?? 20)),
    );

    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    const includeInactive =
        isAdmin && searchParams.get("includeInactive") === "true";
    const conditions: Record<string, unknown>[] = [];
    const typeFilter = getFilterParam(searchParams, "type");
    const globalFilter = getBooleanFilter(searchParams, "isGlobal");
    const closeableFilter = getBooleanFilter(searchParams, "closeable");
    const activeFilter = getBooleanFilter(searchParams, "isActive");
    const search = searchParams.get("search")?.trim();

    if (!includeInactive) {
        conditions.push({ isActive: { $ne: false } });
    }

    if (!isAdmin) {
        const ownedPageQuery = await withActorOwnerScope(user);
        const ownedPageIds = await Page.find(ownedPageQuery).distinct("_id");
        conditions.push({
            ...(hasAgentScopedRole(user.role)
                ? { page: { $in: ownedPageIds } }
                : {
                    $or: [
                        { page: { $in: ownedPageIds } },
                        { isGlobal: true },
                    ],
                }),
        });
    }

    if (NOTIFICATION_TYPES.has(typeFilter)) {
        conditions.push({ type: typeFilter });
    }

    if (globalFilter !== null) {
        conditions.push({ isGlobal: globalFilter });
    }

    if (closeableFilter !== null) {
        conditions.push({ closeable: closeableFilter });
    }

    if (activeFilter !== null) {
        conditions.push({ isActive: activeFilter });
    }

    const dateFilters: Record<string, unknown> = {};
    applyDateRangeFilters(dateFilters, searchParams, ["createdAt"]);
    if (Object.keys(dateFilters).length > 0) {
        conditions.push(dateFilters);
    }

    if (search) {
        const pattern = escapeRegex(search);
        const pageIds = await Page.find({
            $or: [
                { title: { $regex: pattern, $options: "i" } },
                { url: { $regex: pattern, $options: "i" } },
            ],
        }).distinct("_id");

        conditions.push({
            $or: [
                { title: { $regex: pattern, $options: "i" } },
                { subtitle: { $regex: pattern, $options: "i" } },
                { description: { $regex: pattern, $options: "i" } },
                { createdByName: { $regex: pattern, $options: "i" } },
                { page: { $in: pageIds } },
            ],
        });
    }

    const query: Record<string, unknown> =
        conditions.length > 1
            ? { $and: conditions }
            : conditions[0] ?? {};
    const sortFields: Record<string, string> = {
        title: "title",
        subtitle: "subtitle",
        type: "type",
        pageLabel: "page",
        createdByLabel: "createdByName",
        closeable: "closeable",
        isActive: "isActive",
        isGlobal: "isGlobal",
        createdAt: "createdAt",
    };
    const sortField = sortFields[searchParams.get("sortKey") ?? ""] ?? "createdAt";
    const sortDirection = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .populate("page", PAGE_POPULATE_FIELDS)
            .populate("createdBy", USER_POPULATE_FIELDS)
            .sort({ [sortField]: sortDirection, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Notification.countDocuments(query),
    ]);

    return NextResponse.json({ notifications, total, page, limit });
});
