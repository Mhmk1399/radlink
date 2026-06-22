import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Ticket from "@/models/tickets";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/tickets/[id]/assign
export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const { assigneeId } = await req.json();

    if (!assigneeId) return NextResponse.json({ message: "شناسه مسئول الزامی است." }, { status: 400 });

    const ticket = await Ticket.findByIdAndUpdate(
        id,
        { assignee: assigneeId, status: "in_progress" },
        { new: true }
    ).populate("assignee", "firstName lastName phoneNumber");

    if (!ticket) return NextResponse.json({ message: "تیکت پیدا نشد." }, { status: 404 });
    return NextResponse.json({ ticket });
});
