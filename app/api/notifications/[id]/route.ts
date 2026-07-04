import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withRole, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import Notification from "@/models/notification";
import Page from "@/models/pages";
import { isNotificationIconKey } from "@/lib/notifications/notificationIcons";
import { canAccessActorOwner } from "@/lib/auth/agentScope";
import "@/models/users";

type RouteContext = { params: Promise<{ id: string }> };

const PAGE_POPULATE_FIELDS = "title url owner isPublished";
const NOTIFICATION_TYPES = new Set(["info", "danger"]);

function cleanText(value: unknown, maxLength: number) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getReferenceId(value: unknown) {
    if (value instanceof mongoose.Types.ObjectId) return String(value);
    if (typeof value === "string") return value;
    return "";
}

async function canReadNotification(
    notification: { page?: unknown; isGlobal?: boolean; isActive?: boolean },
    user: NonNullable<AuthRequest["ctx"]["user"]>,
) {
    if (["admin", "superAdmin"].includes(user.role)) return true;
    if (notification.isActive === false) return false;
    if (notification.isGlobal) return true;

    const pageId = getReferenceId(notification.page);
    if (pageId) {
        const page = await Page.findById(pageId).select("owner").lean();
        return Boolean(
            page && (await canAccessActorOwner(user, page.owner)),
        );
    }

    return false;
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { message: "شناسه اعلان معتبر نیست." },
            { status: 400 },
        );
    }

    const raw = await Notification.findById(id).lean();
    if (!raw) {
        return NextResponse.json(
            { message: "اعلان پیدا نشد." },
            { status: 404 },
        );
    }

    if (!(await canReadNotification(raw, req.ctx.user!))) {
        return NextResponse.json(
            { message: "شما اجازه مشاهده این اعلان را ندارید." },
            { status: 403 },
        );
    }

    const notification = await Notification.findById(id)
        .populate("page", PAGE_POPULATE_FIELDS)
        .lean();

    return NextResponse.json({ notification });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("agent", "admin", "superAdmin"),
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const user = req.ctx.user!;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { message: "شناسه اعلان معتبر نیست." },
            { status: 400 },
        );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const current = await Notification.findById(id)
        .select("page isGlobal")
        .lean();
    if (!current) {
        return NextResponse.json(
            { message: "اعلان پیدا نشد." },
            { status: 404 },
        );
    }

    const isGlobal =
        "isGlobal" in body ? Boolean(body.isGlobal) : Boolean(current.isGlobal);
    if (user.role === "agent" && isGlobal) {
        return NextResponse.json(
            { message: "نماینده اجازه مدیریت اعلان عمومی را ندارد." },
            { status: 403 },
        );
    }
    const update: Record<string, unknown> = { isGlobal };
    const unset: Record<string, string> = {};

    if (isGlobal) {
        unset.page = "";
    } else {
        const pageValue = body.pageId ?? body.page;
        const pageId =
            pageValue === undefined
                ? getReferenceId(current.page)
                : typeof pageValue === "string"
                  ? pageValue.trim()
                  : "";

        if (!mongoose.Types.ObjectId.isValid(pageId)) {
            return NextResponse.json(
                { message: "انتخاب صفحه برای اعلان الزامی است." },
                { status: 400 },
            );
        }

        const page = await Page.findById(pageId).select("owner").lean();
        if (!page) {
            return NextResponse.json(
                { message: "صفحه انتخاب‌شده پیدا نشد." },
                { status: 404 },
            );
        }
        if (!(await canAccessActorOwner(user, page.owner))) {
            return NextResponse.json(
                { message: "این صفحه متعلق به مجموعه شما نیست." },
                { status: 403 },
            );
        }

        update.page = pageId;
    }

    if ("title" in body) {
        const title = cleanText(body.title, 120);
        if (!title) {
            return NextResponse.json(
                { message: "عنوان اعلان الزامی است." },
                { status: 400 },
            );
        }
        update.title = title;
    }

    if ("subtitle" in body) {
        update.subtitle = cleanText(body.subtitle, 180);
    }

    if ("description" in body) {
        const description = cleanText(body.description, 2000);
        if (!description) {
            return NextResponse.json(
                { message: "توضیحات اعلان الزامی است." },
                { status: 400 },
            );
        }
        update.description = description;
    }

    if ("type" in body) {
        const type = cleanText(body.type, 20);
        if (!NOTIFICATION_TYPES.has(type)) {
            return NextResponse.json(
                { message: "نوع اعلان باید اطلاعاتی یا خطر باشد." },
                { status: 400 },
            );
        }
        update.type = type;
    }

    if ("iconKey" in body) {
        const iconKey = cleanText(body.iconKey, 30);
        if (iconKey && !isNotificationIconKey(iconKey)) {
            return NextResponse.json(
                { message: "آیکن انتخاب‌شده برای اعلان معتبر نیست." },
                { status: 400 },
            );
        }
        update.iconKey = iconKey;
    }

    if ("closeable" in body) update.closeable = Boolean(body.closeable);
    if ("isActive" in body) update.isActive = Boolean(body.isActive);

    const patch: Record<string, unknown> = { ...update };
    if (Object.keys(unset).length) patch.$unset = unset;

    const notification = await Notification.findByIdAndUpdate(id, patch, {
        new: true,
        runValidators: true,
    })
        .populate("page", PAGE_POPULATE_FIELDS)
        .lean();

    revalidatePath("/[url]", "page");

    return NextResponse.json({ notification });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("agent", "admin", "superAdmin"),
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { message: "شناسه اعلان معتبر نیست." },
            { status: 400 },
        );
    }

    const current = await Notification.findById(id)
        .select("page isGlobal")
        .lean();
    if (!current) {
        return NextResponse.json(
            { message: "اعلان پیدا نشد." },
            { status: 404 },
        );
    }
    if (req.ctx.user!.role === "agent") {
        if (current.isGlobal) {
            return NextResponse.json(
                { message: "نماینده اجازه حذف اعلان عمومی را ندارد." },
                { status: 403 },
            );
        }
        const page = await Page.findById(current.page).select("owner").lean();
        if (!page || !(await canAccessActorOwner(req.ctx.user!, page.owner))) {
            return NextResponse.json(
                { message: "این اعلان متعلق به مجموعه شما نیست." },
                { status: 403 },
            );
        }
    }

    await Notification.findByIdAndDelete(id);

    revalidatePath("/[url]", "page");

    return NextResponse.json({ message: "اعلان حذف شد." });
});
