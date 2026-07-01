import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Product from "@/models/products";
import mongoose from "mongoose";
import { canAccessOwnedResource } from "@/lib/auth/ownership";
import "@/models/users";
import "@/models/pages";
import "@/models/files";
import File from "@/models/files";

type RouteContext = { params: Promise<{ id: string }> };

function invalidProductId(id: string) {
    return !mongoose.Types.ObjectId.isValid(id);
}

function getOwnerId(value: unknown) {
    if (
        typeof value === "object" &&
        value !== null &&
        "_id" in value
    ) {
        return String(value._id);
    }
    return String(value ?? "");
}

function normalizeImage(value: unknown) {
    const candidate = Array.isArray(value) ? value[0] : value;
    return typeof candidate === "string" ? candidate.trim() : "";
}

async function findImageFileId(image: string) {
    if (!image) return undefined;
    const file = await File.findOne({
        path: image,
        kind: "upload",
    }).select("_id").lean();
    return file?._id;
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (invalidProductId(id)) {
        return NextResponse.json({ message: "شناسه محصول معتبر نیست." }, { status: 400 });
    }
    const product = await Product.findById(id)
        .populate("owner", "firstName lastName phoneNumber email")
        .populate("page", "title url")
        .populate("imageFile", "filename path mimeType size")
        .lean();
    if (!product) return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
    if (!canAccessOwnedResource(req.ctx.user!, getOwnerId(product.owner))) {
        return NextResponse.json(
            { message: "شما اجازه مشاهده این محصول را ندارید." },
            { status: 403 },
        );
    }
    return NextResponse.json({ product });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (invalidProductId(id)) {
        return NextResponse.json({ message: "شناسه محصول معتبر نیست." }, { status: 400 });
    }
    const body = await req.json();

    const updates: Record<string, unknown> = {};

    if ("name" in body) {
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) {
            return NextResponse.json({ message: "نام محصول الزامی است." }, { status: 400 });
        }
        updates.name = name;
    }

    if ("description" in body) {
        updates.description =
            typeof body.description === "string" ? body.description.trim() : "";
    }

    if ("price" in body) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0) {
            return NextResponse.json({ message: "قیمت محصول معتبر نیست." }, { status: 400 });
        }
        updates.price = price;
    }

    if ("image" in body || "images" in body) {
        const image = normalizeImage(body.image ?? body.images);
        updates.image = image;
        updates.imageFile = (await findImageFileId(image)) ?? null;
    }

    const product = await Product.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true },
    );
    if (!product) return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
    return NextResponse.json({ product });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (invalidProductId(id)) {
        return NextResponse.json({ message: "شناسه محصول معتبر نیست." }, { status: 400 });
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
    return NextResponse.json({ message: "محصول حذف شد." });
});
