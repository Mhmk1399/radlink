import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { generateQrImageDataUrl, generateUniqueQrShortcode } from "@/lib/qrCode";
import QR from "@/models/qr";
import Page from "@/models/pages";

// POST /api/qr — create QR for a page the user owns
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { pageId, targetUrl, imageurl } = await req.json();

    if (!pageId || !targetUrl) {
        return NextResponse.json({ message: "شناسه صفحه و آدرس مقصد الزامی هستند." }, { status: 400 });
    }

    const page = await Page.findById(pageId);
    if (!page) return NextResponse.json({ message: "صفحه پیدا نشد." }, { status: 404 });

    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    if (!isAdmin && String(page.owner) !== String(user._id)) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    const shortcode = await generateUniqueQrShortcode();
    const qrImageUrl =
        typeof imageurl === "string" && imageurl.trim()
            ? imageurl.trim()
            : await generateQrImageDataUrl(targetUrl);

    const qr = await QR.create({
        page: pageId,
        owner: user._id,
        targetUrl,
        imageurl: qrImageUrl,
        shortcode,
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

    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    const query: Record<string, unknown> = isAdmin ? {} : { owner: user._id };
    if (isActive !== null) query.isActive = isActive === "true";

    const [qrs, total] = await Promise.all([
        QR.find(query)
            .populate("page", "title url")
            .populate("owner", "firstName lastName phoneNumber")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        QR.countDocuments(query),
    ]);

    return NextResponse.json({ qrs, total, page, limit });
});
