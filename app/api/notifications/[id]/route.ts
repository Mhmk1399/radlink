import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Notification from "@/models/notification";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const user = req.ctx.user!;

    const notification = await Notification.findById(id).lean() as
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
