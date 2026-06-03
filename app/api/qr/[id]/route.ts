import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import QR from "@/models/qr";

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
    const qr = await QR.findById(id).populate("page", "title url").lean();
    if (!qr) return NextResponse.json({ message: "QR not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(qr.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ qr });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    const qr = await QR.findById(id);
    if (!qr) return NextResponse.json({ message: "QR not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(qr.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const allowed = ["targetUrl", "imageurl", "isActive"];
    for (const key of allowed) {
        if (key in body) (qr as Record<string, unknown>)[key] = body[key];
    }

    await qr.save();
    return NextResponse.json({ qr });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const qr = await QR.findById(id);
    if (!qr) return NextResponse.json({ message: "QR not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(qr.owner))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    await qr.deleteOne();
    return NextResponse.json({ message: "QR deleted" });
});
