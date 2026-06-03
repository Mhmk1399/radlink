import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Product from "@/models/products";

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { name, description, price, images } = await req.json();
    if (!name || price === undefined) {
        return NextResponse.json({ message: "name and price are required" }, { status: 400 });
    }

    const product = await Product.create({ name, description, price, images: images ?? [] });
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
        Product.find().skip((page - 1) * limit).limit(limit).lean(),
        Product.countDocuments(),
    ]);

    return NextResponse.json({ products, total, page, limit });
});
