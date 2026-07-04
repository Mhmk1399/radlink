import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withRole, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import Notification from "@/models/notification";
import Page from "@/models/pages";
import { isNotificationIconKey } from "@/lib/notifications/notificationIcons";
import {
    canAccessActorOwner,
    withActorOwnerScope,
} from "@/lib/auth/agentScope";
import "@/models/users";

const PAGE_POPULATE_FIELDS = "title url owner isPublished";
const NOTIFICATION_TYPES = new Set(["info", "danger"]);

function cleanText(value: unknown, maxLength: number) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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

// Admin creates a notification for one specific page.
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("agent", "admin", "superAdmin"),
)(async (req: AuthRequest) => {
    const body = (await req.json()) as Record<string, unknown>;
    const isGlobal = Boolean(body.isGlobal);
    const pageId = getPageId(body);
    const content = normalizeNotificationContent(body);
    const type = cleanText(body.type, 20);
    const iconKey = cleanText(body.iconKey, 30);
    if (req.ctx.user!.role === "agent" && isGlobal) {
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
        ...content,
        type,
        iconKey,
        closeable: body.closeable === undefined ? true : Boolean(body.closeable),
        isActive: body.isActive === undefined ? true : Boolean(body.isActive),
        isGlobal,
    });

    const notification = await Notification.findById(created._id)
        .populate("page", PAGE_POPULATE_FIELDS)
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

    if (!includeInactive) {
        conditions.push({ isActive: { $ne: false } });
    }

    if (!isAdmin) {
        const ownedPageQuery = await withActorOwnerScope(user);
        const ownedPageIds = await Page.find(ownedPageQuery).distinct("_id");
        conditions.push({
            ...(user.role === "agent"
                ? { page: { $in: ownedPageIds } }
                : {
                    $or: [
                        { page: { $in: ownedPageIds } },
                        { isGlobal: true },
                    ],
                }),
        });
    }

    const query: Record<string, unknown> =
        conditions.length > 1
            ? { $and: conditions }
            : conditions[0] ?? {};

    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .populate("page", PAGE_POPULATE_FIELDS)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Notification.countDocuments(query),
    ]);

    return NextResponse.json({ notifications, total, page, limit });
});
