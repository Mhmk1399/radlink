import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { canAccessActorOwner } from "@/lib/auth/agentScope";
import { deleteFileByIdentifier, FileDeletionError } from "@/lib/fileDeletion";
import File from "@/models/files";
import "@/models/pages";
import "@/models/users";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const file = await File.findById(id)
        .populate("owner", "firstName lastName phoneNumber email")
        .populate("page", "title url")
        .lean();
    if (!file) return NextResponse.json({ message: "فایل پیدا نشد." }, { status: 404 });
    const ownerId =
        file.owner && typeof file.owner === "object" && "_id" in file.owner
            ? String(file.owner._id)
            : String(file.owner);
    if (!(await canAccessActorOwner(req.ctx.user!, ownerId))) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }
    return NextResponse.json({ file });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    try {
        const result = await deleteFileByIdentifier({ fileId: id }, req.ctx.user!);
        return NextResponse.json({ message: "فایل حذف شد.", data: result });
    } catch (error) {
        if (error instanceof FileDeletionError) {
            return NextResponse.json({ message: error.message }, { status: error.status });
        }
        throw error;
    }
});
