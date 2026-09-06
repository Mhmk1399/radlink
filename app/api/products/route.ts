import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Product from "@/models/products";
import { withActorOwnerScope } from "@/lib/auth/agentScope";
import { applyDateRangeFilters } from "@/lib/api/dateRangeFilters";
import "@/models/users";
import "@/models/pages";
import "@/models/files";
import File from "@/models/files";
import Page from "@/models/pages";
import User from "@/models/users";

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

function normalizeImage(value: unknown) {
    const candidate = Array.isArray(value) ? value[0] : value;
    return typeof candidate === "string" ? candidate.trim() : "";
}

async function findImageFileId(image: string, ownerId: unknown) {
    if (!image) return undefined;
    const file = await File.findOne({
        owner: ownerId,
        path: image,
        kind: "upload",
    }).select("_id").lean();
    return file?._id;
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("agent", "agentManager", "admin", "superAdmin")
)(async (req: AuthRequest) => {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
        typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);

    if (!name) {
        return NextResponse.json({ message: "نام محصول الزامی است." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ message: "قیمت محصول معتبر نیست." }, { status: 400 });
    }

    const image = normalizeImage(body.image ?? body.images);
    const imageFile = await findImageFileId(image, req.ctx.user!._id);
    const product = await Product.create({
        name,
        description,
        price,
        image,
        imageFile,
        owner: req.ctx.user!._id,
        source: "manual",
    });
    return NextResponse.json({ product }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const query: Record<string, unknown> =
        await withActorOwnerScope(req.ctx.user!);
    const ownerId = getFilterParam(searchParams, "ownerId");
    const pageId = getFilterParam(searchParams, "pageId");
    const search = searchParams.get("search")?.trim();
    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
        query.$and = [
            ...((query.$and as unknown[]) ?? []),
            { owner: ownerId },
        ];
    }
    if (pageId === "__manual__") {
        query.page = { $exists: false };
    } else if (pageId && mongoose.Types.ObjectId.isValid(pageId)) {
        query.page = pageId;
    }

    if (search) {
        const pattern = escapeRegex(search);
        const [ownerIds, pageIds] = await Promise.all([
            User.find({
                $or: [
                    { firstName: { $regex: pattern, $options: "i" } },
                    { lastName: { $regex: pattern, $options: "i" } },
                    { phoneNumber: { $regex: pattern, $options: "i" } },
                    { email: { $regex: pattern, $options: "i" } },
                ],
            }).distinct("_id"),
            Page.find({
                $or: [
                    { title: { $regex: pattern, $options: "i" } },
                    { url: { $regex: pattern, $options: "i" } },
                ],
            }).distinct("_id"),
        ]);

        query.$and = [
            ...((query.$and as Record<string, unknown>[]) ?? []),
            {
                $or: [
                    { name: { $regex: pattern, $options: "i" } },
                    { description: { $regex: pattern, $options: "i" } },
                    { displayPrice: { $regex: pattern, $options: "i" } },
                    { oldPrice: { $regex: pattern, $options: "i" } },
                    { productUrl: { $regex: pattern, $options: "i" } },
                    { source: { $regex: pattern, $options: "i" } },
                    { owner: { $in: ownerIds } },
                    { page: { $in: pageIds } },
                ],
            },
        ];
    }

    applyDateRangeFilters(query, searchParams, ["createdAt"]);

    const [products, total] = await Promise.all([
        Product.find(query)
            .populate("owner", "firstName lastName phoneNumber email")
            .populate("page", "title url")
            .populate("imageFile", "filename path mimeType size")
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product.countDocuments(query),
    ]);

    return NextResponse.json({ products, total, page, limit });
});
