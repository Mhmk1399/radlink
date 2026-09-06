import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Ticket from "@/models/tickets";
import File from "@/models/files";
import Page from "@/models/pages";
import "@/models/users";
import "@/models/category";
import { getManagedUserIds } from "@/lib/auth/agentScope";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ticketPopulate = [
    { path: "requester", select: "firstName lastName phoneNumber" },
    { path: "assignee", select: "firstName lastName phoneNumber" },
    { path: "siteOwner", select: "firstName lastName phoneNumber" },
    { path: "page", select: "title url" },
    { path: "category", select: "name" },
    { path: "attachments", select: "filename path url" },
];

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const body = await req.json();
    const {
        title,
        description,
        priority,
        category,
        attachments,
        source,
        pageId,
        message,
    } = body;

    if (user.role === "superAdmin") {
        return NextResponse.json({ message: "سوپرادمین امکان ثبت تیکت ندارد." }, { status: 403 });
    }

    if (source === "landing") {
        if (!mongoose.Types.ObjectId.isValid(String(pageId ?? ""))) {
            return NextResponse.json({ message: "صفحه انتخاب‌شده معتبر نیست." }, { status: 400 });
        }

        const landingPage = await Page.findById(pageId)
            .select("title url owner isPublished")
            .lean();

        if (!landingPage || landingPage.isPublished !== true) {
            return NextResponse.json({ message: "صفحه در دسترس نیست." }, { status: 404 });
        }

        if (!landingPage.owner) {
            return NextResponse.json({ message: "این صفحه مالک فعالی ندارد." }, { status: 400 });
        }

        const landingMessage = String(message ?? description ?? "").trim();
        const landingAttachments = Array.isArray(attachments)
            ? attachments.filter((id) => mongoose.Types.ObjectId.isValid(String(id)))
            : [];

        if (!landingMessage && landingAttachments.length === 0) {
            return NextResponse.json({ message: "پیام یا فایل را ارسال کنید." }, { status: 400 });
        }

        const ticket = await Ticket.create({
            title: `گفت‌وگوی صفحه ${String(landingPage.title || landingPage.url || "").trim() || "لندینگ"}`,
            description: landingMessage,
            priority: "medium",
            attachments: landingAttachments,
            requester: user._id,
            assignee: landingPage.owner,
            siteOwner: landingPage.owner,
            page: landingPage._id,
            source: "landing",
            lastReplyAt: new Date(),
        });

        if (ticket.attachments.length > 0) {
            await File.updateMany(
                { _id: { $in: ticket.attachments } },
                { $set: { kind: "ticket" } },
            );
        }

        const populated = await Ticket.findById(ticket._id)
            .populate(ticketPopulate)
            .lean();
        return NextResponse.json({ ticket: populated ?? ticket }, { status: 201 });
    }

    if (!String(title ?? "").trim()) {
        return NextResponse.json({ message: "عنوان الزامی است." }, { status: 400 });
    }

    const ticket = await Ticket.create({
        title: String(title).trim(),
        description: String(description ?? "").trim(),
        priority: priority ?? "medium",
        category: category ?? undefined,
        attachments: attachments ?? [],
        requester: user._id,
    });

    if (ticket.attachments.length > 0) {
        await File.updateMany(
            { _id: { $in: ticket.attachments } },
            { $set: { kind: "ticket" } },
        );
    }

    return NextResponse.json({ ticket }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search")?.trim();
    const sortKey = searchParams.get("sortKey")?.trim() || "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
    const mode = searchParams.get("mode");
    const pageId = searchParams.get("pageId");

    if (mode === "landing-chat") {
        if (!mongoose.Types.ObjectId.isValid(String(pageId ?? ""))) {
            return NextResponse.json({ ticket: null });
        }

        const ticket = await Ticket.findOne({
            page: pageId,
            requester: user._id,
            source: "landing",
        })
            .populate(ticketPopulate)
            .populate({
                path: "replies.author",
                select: "firstName lastName phoneNumber role",
                strictPopulate: false,
            })
            .populate({
                path: "replies.attachments",
                select: "filename path url",
                strictPopulate: false,
            })
            .sort({ updatedAt: -1, _id: -1 })
            .lean();

        return NextResponse.json({ ticket });
    }

    const isGlobal = user.role === "superAdmin" || user.role === "admin";
    const managedUserIds = isGlobal
        ? null
        : await getManagedUserIds(user);
    const scopedUserIds = managedUserIds ?? [user._id];
    const accessQuery: Record<string, unknown> = isGlobal
        ? {}
        : {
            $or: [
                { requester: { $in: scopedUserIds } },
                { siteOwner: { $in: scopedUserIds } },
                { assignee: { $in: scopedUserIds } },
            ],
        };
    const filters: Record<string, unknown>[] = [accessQuery];
    if (status) filters.push({ status });
    if (priority) filters.push({ priority });
    if (search) {
        const pattern = escapeRegex(search);
        filters.push({
            $or: [
                { title: { $regex: pattern, $options: "i" } },
                { description: { $regex: pattern, $options: "i" } },
                { "replies.message": { $regex: pattern, $options: "i" } },
            ],
        });
    }
    const query =
        filters.length === 1 && Object.keys(filters[0]).length === 0
            ? {}
            : { $and: filters.filter((filter) => Object.keys(filter).length > 0) };

    const sortField = [
        "createdAt",
        "updatedAt",
        "title",
        "status",
        "priority",
        "lastReplyAt",
    ].includes(sortKey)
        ? sortKey
        : "createdAt";

    const [tickets, total] = await Promise.all([
        Ticket.find(query)
            .populate(ticketPopulate)
            .sort({ [sortField]: sortDir, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Ticket.countDocuments(query),
    ]);

    return NextResponse.json({ tickets, total, page, limit });
});
