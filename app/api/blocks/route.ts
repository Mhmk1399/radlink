import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { getBuilderBlocksForRequest } from "@/lib/auth/builderBlockAccess";
import Block from "@/models/blocks";

// POST /api/blocks — admin creates a master block
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req: AuthRequest) => {
    const {
        name,
        type,
        description,
        icon,
        category,
        version,
        data,
        settings,
        elements,
        contentFields,
        defaultBlock,
        isActive,
    } = await req.json();

    if (!name || !type || !icon) {
        return NextResponse.json({ message: "نام، نوع و آیکن الزامی هستند." }, { status: 400 });
    }

    const block = await Block.create({
        name,
        type,
        description,
        icon,
        category,
        version: version ?? 1,
        data: data ?? defaultBlock?.data ?? {},
        settings: settings ?? defaultBlock?.settings ?? { direction: "rtl" },
        elements: elements ?? defaultBlock?.elements ?? {},
        contentFields: contentFields ?? [],
        defaultBlock: defaultBlock ?? {
            instanceId: `${type}-master`,
            blockId: type,
            type,
            version: version ?? 1,
            order: 0,
            isActive: isActive ?? true,
            data: data ?? {},
            settings: settings ?? { direction: "rtl" },
            elements: elements ?? {},
        },
        isActive: isActive ?? true,
        stats: { usageCount: 0 },
    });

    return NextResponse.json({ block }, { status: 201 });
});  

// GET /api/blocks — list blocks, filterable by type and isActive
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Number(searchParams.get("limit") ?? 20));
    const type     = searchParams.get("type");
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    const mode = searchParams.get("mode");

    const query: Record<string, unknown> = {};
    if (type)          query.type     = type;
    if (category)      query.category = category;
    if (isActive !== null) query.isActive = isActive === "true";

    if (mode === "builder") {
        const blocks = await getBuilderBlocksForRequest(req);

        return NextResponse.json({ blocks, total: blocks.length, page: 1, limit: blocks.length });
    }

    const [blocks, total] = await Promise.all([
        Block.find(query)
            .sort({ category: 1, name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Block.countDocuments(query),
    ]);

    return NextResponse.json({ blocks, total, page, limit });
});
