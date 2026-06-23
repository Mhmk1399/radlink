import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Notification from "@/models/notification";
import "@/models/users";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const user = req.ctx.user!;

    const notification = await Notification.findById(id)
        .populate("User", "firstName lastName phoneNumber email role status")
        .lean() as
        | { User?: unknown; isGlobal?: boolean }
        | null;
    if (!notification) return NextResponse.json({ message: "اعلان پیدا نشد." }, { status: 404 });

    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    const isOwn   = String(notification.User) === String(user._id);
    if (!isAdmin && !isOwn && !notification.isGlobal) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ notification });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    const update: Record<string, unknown> = {};
    const unset: Record<string, string> = {};

    if ("message" in body) {
        const message = String(body.message ?? "").trim();
        if (!message) {
            return NextResponse.json({ message: "متن پیام الزامی است." }, { status: 400 });
        }
        update.message = message;
    }

    if ("closeable" in body) update.closeable = Boolean(body.closeable);

    if ("isGlobal" in body) {
        const isGlobal = Boolean(body.isGlobal);
        update.isGlobal = isGlobal;

        if (isGlobal) {
            unset.User = "";
        } else {
            const userId = String(body.userId ?? body.User ?? "").trim();
            if (!userId) {
                return NextResponse.json({ message: "برای اعلان غیرعمومی انتخاب کاربر الزامی است." }, { status: 400 });
            }
            update.User = userId;
        }
    } else if ("userId" in body || "User" in body) {
        const userId = String(body.userId ?? body.User ?? "").trim();
        if (userId) {
            update.User = userId;
            update.isGlobal = false;
        }
    }

    const patch: Record<string, unknown> = { ...update };
    if (Object.keys(unset).length) patch.$unset = unset;

    const notification = await Notification.findByIdAndUpdate(id, patch, {
        new: true,
        runValidators: true,
    })
        .populate("User", "firstName lastName phoneNumber email role status")
        .lean();

    if (!notification) return NextResponse.json({ message: "اعلان پیدا نشد." }, { status: 404 });

    return NextResponse.json({ notification });
});

// Admin hard deletes, user cannot delete notifications
export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) return NextResponse.json({ message: "اعلان پیدا نشد." }, { status: 404 });
    return NextResponse.json({ message: "اعلان حذف شد." });
});
