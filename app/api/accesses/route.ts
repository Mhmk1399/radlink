import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Access from "@/models/access";

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { staticComponents, dynamicAccess } = await req.json();

    const access = await Access.create({
        staticComponents: staticComponents ?? [],
        dynamicAccess: {
            templates: dynamicAccess?.templates ?? [],
            blocks: dynamicAccess?.blocks ?? [],
            pages: dynamicAccess?.pages ?? [],
        },
    });

    return NextResponse.json({ access }, { status: 201 });
});

export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));

    const [accesses, total] = await Promise.all([
        Access.find().skip((page - 1) * limit).limit(limit).lean(),
        Access.countDocuments(),
    ]);

    return NextResponse.json({ accesses, total, page, limit });
});
