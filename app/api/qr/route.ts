import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import {
    canAccessActorOwner,
    withActorOwnerScope,
} from "@/lib/auth/agentScope";
import { applyDateRangeFilters } from "@/lib/api/dateRangeFilters";
import { createQrForPage } from "@/lib/qrCode";
import QR from "@/models/qr";
import Page from "@/models/pages";
import User from "@/models/users";
import "@/models/files";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFilterParam(searchParams: URLSearchParams, key: string) {
    return (
        searchParams.get(`filter_${key}`)?.trim() ||
        searchParams.get(key)?.trim() ||
        ""
    );
}

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
    const isActive = getFilterParam(searchParams, "isActive");
    const ownerLabel = getFilterParam(searchParams, "ownerLabel");
    const search = searchParams.get("search")?.trim();

    const query: Record<string, unknown> =
        await withActorOwnerScope(user);
    if (isActive === "true" || isActive === "false") {
        query.isActive = isActive === "true";
    }
    if (ownerLabel) {
        const pattern = escapeRegex(ownerLabel);
        const owners = await User.find({
            $or: [
                { firstName: { $regex: pattern, $options: "i" } },
                { lastName: { $regex: pattern, $options: "i" } },
                { phoneNumber: { $regex: pattern, $options: "i" } },
                { email: { $regex: pattern, $options: "i" } },
            ],
        }).distinct("_id");

        query.$and = [
            ...((query.$and as Record<string, unknown>[]) ?? []),
            { owner: { $in: owners } },
        ];
    }
    if (search) {
        const pattern = escapeRegex(search);
        const pageIds = await Page.find({
            $or: [
                { title: { $regex: pattern, $options: "i" } },
                { url: { $regex: pattern, $options: "i" } },
            ],
        }).distinct("_id");

        query.$and = [
            ...((query.$and as Record<string, unknown>[]) ?? []),
            {
                $or: [
                    { targetUrl: { $regex: pattern, $options: "i" } },
                    { shortcode: { $regex: pattern, $options: "i" } },
                    { page: { $in: pageIds } },
                ],
            },
        ];
    }

    applyDateRangeFilters(query, searchParams, ["createdAt"]);
    const sortFields: Record<string, string> = {
        pageLabel: "page",
        ownerLabel: "owner",
        targetUrl: "targetUrl",
        shortcode: "shortcode",
        isActive: "isActive",
        createdAt: "createdAt",
    };
    const sortField = sortFields[searchParams.get("sortKey") ?? ""] ?? "createdAt";
    const sortDirection = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const [qrs, total] = await Promise.all([
        QR.find(query)
            .populate("page", "title url")
            .populate("owner", "firstName lastName phoneNumber")
            .populate("file", "filename path mimeType size kind")
            .sort({ [sortField]: sortDirection, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        QR.countDocuments(query),
    ]);

    return NextResponse.json({ qrs, total, page, limit });
});
