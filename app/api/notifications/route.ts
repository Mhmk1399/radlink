import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Notification from "@/models/notification";

// POST /api/notifications — admin sends targeted or global notification
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { userId, message, closeable, isGlobal } = await req.json();

    if (!message) return NextResponse.json({ message: "متن پیام الزامی است." }, { status: 400 });
    if (!isGlobal && !userId) {
        return NextResponse.json({ message: "برای اعلان‌های غیرعمومی شناسه کاربر الزامی است." }, { status: 400 });
    }

    const notification = await Notification.create({
        User:      isGlobal ? undefined : userId,
        message,
        closeable: closeable ?? false,
        isGlobal:  isGlobal  ?? false,
    });

    return NextResponse.json({ notification }, { status: 201 });
});

// GET /api/notifications — user gets own + global, admin gets all
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));

    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    const query = isAdmin
        ? {}
        : { $or: [{ User: user._id }, { isGlobal: true }] };

    const [notifications, total] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Notification.countDocuments(query),
    ]);

    return NextResponse.json({ notifications, total, page, limit });
});
