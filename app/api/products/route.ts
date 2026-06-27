import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Product from "@/models/products";

function normalizeImages(value: unknown) {
    if (!Array.isArray(value)) return [];
    return [...new Set(
        value
            .filter((image): image is string => typeof image === "string")
            .map((image) => image.trim())
            .filter(Boolean)
    )];
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

    const product = await Product.create({
        name,
        description,
        price,
        images: normalizeImages(body.images),
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

    const [products, total] = await Promise.all([
        Product.find()
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product.countDocuments(),
    ]);

    return NextResponse.json({ products, total, page, limit });
});
