import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import File from "@/models/files";

type RouteContext = { params: Promise<{ id: string }> };

function canAccess(user: AuthRequest["ctx"]["user"], ownerId: string) {
    if (!user) return false;
    if (["admin", "superAdmin"].includes(user.role)) return true;
    return String(user._id) === ownerId;
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const file = await File.findById(id).lean();
    if (!file) return NextResponse.json({ message: "File not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(file.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ file });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const file = await File.findById(id);
    if (!file) return NextResponse.json({ message: "File not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(file.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    await file.deleteOne();
    return NextResponse.json({ message: "File deleted" });
});
