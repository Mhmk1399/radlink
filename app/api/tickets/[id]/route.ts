import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Ticket from "@/models/tickets";

type RouteContext = { params: Promise<{ id: string }> };

function canAccess(user: AuthRequest["ctx"]["user"], requesterId: string) {
    if (!user) return false;
    if (["admin", "superAdmin"].includes(user.role)) return true;
    return String(user._id) === requesterId;
}

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const ticket = await Ticket.findById(id)
        .populate("requester", "firstName lastName phoneNumber")
        .populate("assignee",  "firstName lastName phoneNumber")
        .populate("category",  "name")
        .populate("attachments", "filename path")
        .lean();

    if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    if (!canAccess(req.ctx.user, String(ticket.requester))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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

    const ticket = await Ticket.findById(id);
    if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    if (!canAccess(user, String(ticket.requester))) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const isAdmin = ["admin", "superAdmin"].includes(user.role);

    // Requester can update: title, description, priority, attachments
    const requesterAllowed = ["title", "description", "priority", "attachments"];
    // Admin can also update: status, assignee, category
    const adminOnly = ["status", "assignee", "category"];

    const allowed = isAdmin ? [...requesterAllowed, ...adminOnly] : requesterAllowed;
    for (const key of allowed) {
        if (key in body) (ticket as Record<string, unknown>)[key] = body[key];
    }

    await ticket.save();
    return NextResponse.json({ ticket });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    return NextResponse.json({ message: "Ticket deleted" });
});
