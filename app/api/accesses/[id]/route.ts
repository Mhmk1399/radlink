import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Access from "@/models/access";
import Permission from "@/models/permission";
import { accessCache } from "@/lib/auth/accessCache";

type RouteContext = { params: Promise<{ id: string }> };

// Bust cache for all users that have a permission referencing this access
async function bustByAccessId(accessId: string) {
    const permissions = await Permission.find({ accesses: accessId }).lean();
    const userIds = permissions.flatMap((p) => p.assignedToUsers.map(String));
    accessCache.delMany(userIds);
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const access = await Access.findById(id).lean();
    if (!access) return NextResponse.json({ message: "Access not found" }, { status: 404 });

    return NextResponse.json({ access });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const { staticComponents, dynamicAccess } = await req.json();

    const access = await Access.findById(id);
    if (!access) return NextResponse.json({ message: "Access not found" }, { status: 404 });

    if (staticComponents !== undefined) access.staticComponents = staticComponents;
    if (dynamicAccess !== undefined) {
        if (dynamicAccess.templates !== undefined) access.dynamicAccess.templates = dynamicAccess.templates;
        if (dynamicAccess.blocks !== undefined) access.dynamicAccess.blocks = dynamicAccess.blocks;
        if (dynamicAccess.pages !== undefined) access.dynamicAccess.pages = dynamicAccess.pages;
    }

    await access.save();
    await bustByAccessId(id);

    return NextResponse.json({ access });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const access = await Access.findById(id);
    if (!access) return NextResponse.json({ message: "Access not found" }, { status: 404 });

    // Remove this access from all permissions that reference it
    await Permission.updateMany({ accesses: id }, { $pull: { accesses: id } });
    await access.deleteOne();
    await bustByAccessId(id);

    return NextResponse.json({ message: "Access deleted" });
});
