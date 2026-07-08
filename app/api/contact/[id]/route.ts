import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import ContactMessage from "@/models/contactMessage";

type RouteContext = { params: Promise<{ id: string }> };

export const PATCH = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin"),
)(async (req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;
    const body = await req.json();

    if (body.status && !["new", "read", "replied"].includes(body.status)) {
        return NextResponse.json({ message: "وضعیت نامعتبر است." }, { status: 400 });
    }

    const contactMessage = await ContactMessage.findByIdAndUpdate(
        id,
        { $set: { status: body.status } },
        { new: true },
    );

    if (!contactMessage) {
        return NextResponse.json({ message: "پیام پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ contactMessage });
});

export const DELETE = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("superAdmin"),
)(async (_req: AuthRequest, ctx: RouteContext) => {
    const { id } = await ctx.params;

    const contactMessage = await ContactMessage.findByIdAndDelete(id);
    if (!contactMessage) {
        return NextResponse.json({ message: "پیام پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ message: "پیام حذف شد." });
});
