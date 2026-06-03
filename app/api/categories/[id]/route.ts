import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Category from "@/models/category";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const category = await Category.findById(id).populate("templates", "name thumbnail").lean();
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json({ category });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const { name, description } = await req.json();

    const category = await Category.findByIdAndUpdate(
        id,
        { ...(name && { name }), ...(description !== undefined && { description }) },
        { new: true, runValidators: true }
    );
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json({ category });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });
    return NextResponse.json({ message: "Category deleted" });
});
