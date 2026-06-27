import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Product from "@/models/products";
import mongoose from "mongoose";

type RouteContext = { params: Promise<{ id: string }> };

function invalidProductId(id: string) {
    return !mongoose.Types.ObjectId.isValid(id);
}

function normalizeImages(value: unknown) {
    if (!Array.isArray(value)) return [];
    return [...new Set(
        value
            .filter((image): image is string => typeof image === "string")
            .map((image) => image.trim())
            .filter(Boolean)
    )];
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    if (invalidProductId(id)) {
        return NextResponse.json({ message: "شناسه محصول معتبر نیست." }, { status: 400 });
    }
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ message: "محصول پیدا نشد." }, { status: 404 });
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

    if ("images" in body) {
        updates.images = normalizeImages(body.images);
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
