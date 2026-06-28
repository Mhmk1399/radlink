import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { canAccessOwnedResource } from "@/lib/auth/ownership";
import { deleteLiaraObject } from "@/lib/liaraStorage";
import File from "@/models/files";
import QR from "@/models/qr";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const qr = await QR.findById(id)
        .populate("page", "title url")
        .populate("file", "filename path mimeType size kind")
        .lean() as
        | { owner?: unknown }
        | null;
    if (!qr) return NextResponse.json({ message: "کد QR پیدا نشد." }, { status: 404 });
    if (!canAccessOwnedResource(req.ctx.user!, qr.owner)) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
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
    if (!qr) return NextResponse.json({ message: "کد QR پیدا نشد." }, { status: 404 });
    if (!canAccessOwnedResource(req.ctx.user!, qr.owner)) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    const allowed = ["targetUrl", "imageurl", "isActive"];
    for (const key of allowed) {
        if (key in body) (qr as unknown as Record<string, unknown>)[key] = body[key];
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
    if (!qr) return NextResponse.json({ message: "کد QR پیدا نشد." }, { status: 404 });
    if (!canAccessOwnedResource(req.ctx.user!, qr.owner)) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }
    const file = qr.file
        ? await File.findById(qr.file).select("path").lean()
        : null;

    await qr.deleteOne();

    if (file) {
        await File.findByIdAndDelete(file._id).catch(() => null);

        try {
            const key = decodeURIComponent(
                new URL(file.path).pathname.replace(/^\/+/, "")
            );
            if (key) await deleteLiaraObject(key);
        } catch {
            // Legacy QR URLs may not map to a Liara object key.
        }
    }

    return NextResponse.json({ message: "کد QR حذف شد." });
});
