import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import {
    canAccessActorOwner,
    withActorOwnerScope,
} from "@/lib/auth/agentScope";
import { createQrForPage } from "@/lib/qrCode";
import QR from "@/models/qr";
import Page from "@/models/pages";
import "@/models/files";

// POST /api/qr — create QR for a page the user owns
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { pageId, targetUrl } = await req.json();

    if (!pageId || !targetUrl) {
        return NextResponse.json({ message: "شناسه صفحه و آدرس مقصد الزامی هستند." }, { status: 400 });
    }

    const page = await Page.findById(pageId);
    if (!page) return NextResponse.json({ message: "صفحه پیدا نشد." }, { status: 404 });

    if (!(await canAccessActorOwner(user, page.owner))) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    const qr = await createQrForPage({
        pageId: String(page._id),
        creatorId: String(user._id),
        pageUrl: String(targetUrl),
        requestUrl: req.url,
    });
    return NextResponse.json({ qr }, { status: 201 });
});

// GET /api/qr — owner sees own, admin sees all
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const isActive = searchParams.get("isActive");

    const query: Record<string, unknown> =
        await withActorOwnerScope(user);
    if (isActive !== null) query.isActive = isActive === "true";

    const [qrs, total] = await Promise.all([
        QR.find(query)
            .populate("page", "title url")
            .populate("owner", "firstName lastName phoneNumber")
            .populate("file", "filename path mimeType size kind")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        QR.countDocuments(query),
    ]);

    return NextResponse.json({ qrs, total, page, limit });
});
