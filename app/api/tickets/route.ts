import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Ticket from "@/models/tickets";

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { title, description, priority, category, attachments } = await req.json();

    if (!title) return NextResponse.json({ message: "title is required" }, { status: 400 });

    const ticket = await Ticket.create({
        title, description,
        priority:    priority    ?? "medium",
        category:    category    ?? undefined,
        attachments: attachments ?? [],
        requester:   user._id,
    });

    return NextResponse.json({ ticket }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")     ?? 1));
    const limit    = Math.min(100, Number(searchParams.get("limit")  ?? 20));
    const status   = searchParams.get("status");
    const priority = searchParams.get("priority");

    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    const query: Record<string, unknown> = isAdmin ? {} : { requester: user._id };
    if (status)   query.status   = status;
    if (priority) query.priority = priority;

    const [tickets, total] = await Promise.all([
        Ticket.find(query)
            .populate("requester", "firstName lastName phoneNumber")
            .populate("assignee",  "firstName lastName phoneNumber")
            .populate("category",  "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Ticket.countDocuments(query),
    ]);

    return NextResponse.json({ tickets, total, page, limit });
});
