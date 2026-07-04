import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Ticket from "@/models/tickets";
import "@/models/users";
import "@/models/files";
import "@/models/category";
import { canAccessActorOwner } from "@/lib/auth/agentScope";

type RouteContext = { params: Promise<{ id: string }> };

function isObjectId(value: unknown) {
    return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

function getRefId(value: unknown) {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        const id = record._id ?? record.id;
        return id ? String(id) : String(value);
    }
    return "";
}

function populateTicketById(id: string) {
    return Ticket.findById(id)
        .populate("requester", "firstName lastName phoneNumber email role status")
        .populate("assignee", "firstName lastName phoneNumber email role status")
        .populate("category", "name")
        .populate("attachments", "filename path url")
        .populate({
            path: "replies.author",
            select: "firstName lastName phoneNumber role",
            strictPopulate: false,
        })
        .populate({
            path: "replies.attachments",
            select: "filename path url",
            strictPopulate: false,
        });
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const ticket = await populateTicketById(id).lean() as { requester?: unknown } | null;

    if (!ticket) return NextResponse.json({ message: "تیکت پیدا نشد." }, { status: 404 });
    if (!(await canAccessActorOwner(req.ctx.user!, getRefId(ticket.requester)))) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ ticket });
});

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const user = req.ctx.user!;

    const ticket = await Ticket.findById(id).lean() as Record<string, unknown> | null;
    if (!ticket) return NextResponse.json({ message: "تیکت پیدا نشد." }, { status: 404 });
    if (!(await canAccessActorOwner(user, getRefId(ticket.requester)))) {
        return NextResponse.json({ message: "شما اجازه انجام این عملیات را ندارید." }, { status: 403 });
    }

    const isStaff = ["agent", "admin", "superAdmin"].includes(user.role);
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, unknown> = {};
    const update: Record<string, unknown> = {};

    if (isStaff && "title" in body) $set.title = String(body.title ?? "").trim();
    if (isStaff && "description" in body) $set.description = String(body.description ?? "").trim();

    if (isStaff && ["open", "in_progress", "closed"].includes(String(body.status))) {
        $set.status = body.status;
    }

    if (isStaff && ["low", "medium", "high"].includes(String(body.priority))) {
        $set.priority = body.priority;
    }

    const assigneeId = body.assigneeId ?? body.assignee;
    if (isStaff && (assigneeId === null || assigneeId === "")) {
        $unset.assignee = "";
    } else if (isStaff && isObjectId(assigneeId)) {
        if (
            user.role === "agent" &&
            !(await canAccessActorOwner(user, assigneeId))
        ) {
            return NextResponse.json(
                { message: "مسئول انتخاب‌شده در مجموعه شما نیست." },
                { status: 403 },
            );
        }
        $set.assignee = assigneeId;
    }

    const categoryId = body.categoryId ?? body.category;
    if (isStaff && (categoryId === null || categoryId === "")) {
        $unset.category = "";
    } else if (isStaff && isObjectId(categoryId)) {
        $set.category = categoryId;
    }

    const replyMessage = String(body.replyMessage ?? "").trim();
    const replyAttachments = Array.isArray(body.replyAttachments)
        ? body.replyAttachments.filter(isObjectId)
        : [];
    const hasReplyPayload = Boolean(replyMessage) || replyAttachments.length > 0;
    if (hasReplyPayload && String(ticket.status) === "closed") {
        return NextResponse.json(
            { message: "این تیکت بسته شده است و امکان ارسال پاسخ یا فایل جدید وجود ندارد." },
            { status: 400 }
        );
    }

    if (hasReplyPayload) {
        update.$push = {
            replies: {
                author: user._id,
                message: replyMessage,
                isStaff,
                attachments: replyAttachments,
                createdAt: new Date(),
            },
        };
        $set.lastReplyAt = new Date();
        if (isStaff && ticket.status === "open" && !("status" in $set)) {
            $set.status = "in_progress";
        }
    }

    if (Object.keys($set).length > 0) update.$set = $set;
    if (Object.keys($unset).length > 0) update.$unset = $unset;

    if (Object.keys(update).length > 0) {
        await Ticket.updateOne({ _id: id }, update, { strict: false });
    }

    const updatedTicket = await populateTicketById(id).lean();
    return NextResponse.json({ ticket: updatedTicket });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return NextResponse.json({ message: "تیکت پیدا نشد." }, { status: 404 });
    return NextResponse.json({ message: "تیکت حذف شد." });
});
