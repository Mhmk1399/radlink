import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Ticket from "@/models/tickets";
import File from "@/models/files";
import "@/models/users";
import "@/models/category";
import { getManagedUserIds } from "@/lib/auth/agentScope";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { title, description, priority, category, attachments } = await req.json();

    if (user.role === "superAdmin") {
        return NextResponse.json({ message: "سوپرادمین امکان ثبت تیکت ندارد." }, { status: 403 });
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

    const isGlobal = user.role === "superAdmin" || user.role === "admin";
    const managedUserIds = isGlobal
        ? null
        : await getManagedUserIds(user);
    const query: Record<string, unknown> = isGlobal
        ? {}
        : { requester: { $in: managedUserIds ?? [user._id] } };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
        const pattern = escapeRegex(search);
        query.$or = [
            { title: { $regex: pattern, $options: "i" } },
            { description: { $regex: pattern, $options: "i" } },
            { "replies.message": { $regex: pattern, $options: "i" } },
        ];
    }

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
            .populate("requester", "firstName lastName phoneNumber")
            .populate("assignee", "firstName lastName phoneNumber")
            .populate("category", "name")
            .populate("attachments", "filename path url")
            .sort({ [sortField]: sortDir, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Ticket.countDocuments(query),
    ]);

    return NextResponse.json({ tickets, total, page, limit });
});
