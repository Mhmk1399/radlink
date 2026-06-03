import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Category from "@/models/category";

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ message: "name is required" }, { status: 400 });

    const category = await Category.create({ name, description });
    return NextResponse.json({ category }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));

    const [categories, total] = await Promise.all([
        Category.find()
            .populate("templates", "name thumbnail")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Category.countDocuments(),
    ]);

    return NextResponse.json({ categories, total, page, limit });
});
