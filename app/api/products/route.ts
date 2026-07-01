import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Product from "@/models/products";
import { withOwnerScope } from "@/lib/auth/ownership";
import "@/models/users";
import "@/models/pages";
import "@/models/files";
import File from "@/models/files";

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
    withRole("admin", "superAdmin")
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
    const query: Record<string, unknown> = withOwnerScope(req.ctx.user!);
    const ownerId = searchParams.get("ownerId");
    const pageId = searchParams.get("pageId");
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
