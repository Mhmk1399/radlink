// import { NextResponse } from "next/server";
// import { compose } from "@/lib/auth/compose";
// import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
// import { AuthRequest } from "@/lib/auth/types";
// import Page from "@/models/pages";
// import Template from "@/models/template";
// import { IBlock } from "@/models/blocks";

// // POST /api/pages
// // If templateId is provided, snapshots the template's blocks into the page.
// export const POST = compose(
//     withDB(),
//     withAuth(),
//     withStatus("active")
// )(async (req: AuthRequest) => {
//     const user = req.ctx.user!;
//     const { title, url, description, templateId, seo, settings } = await req.json();

//     if (!title || !url) {
//         return NextResponse.json({ message: "title and url are required" }, { status: 400 });
//     }

//     const existing = await Page.findOne({ url });
//     if (existing) return NextResponse.json({ message: "URL already taken" }, { status: 409 });

//     let blocks: InstanceType<typeof Page>["blocks"] = [];
//     let template = null;

//     if (templateId) {
//         template = await Template.findById(templateId).populate<{ blocks: IBlock[] }>("blocks");
//         if (!template) return NextResponse.json({ message: "Template not found" }, { status: 404 });

//         // Snapshot each block — page owns its own copy
//         blocks = template.blocks.map((b: IBlock, index: number) => ({
//             blockId: b._id,
//             type: b.type,
//             order: index,
//             data: { ...b.data },
//             settings: { ...b.settings },
//             styleOverride: {},             // no overrides at creation time
//         }));
//     }

//     const page = await Page.create({
//         title, url, description,
//         owner: user._id,
//         template: templateId ?? undefined,
//         blocks,
//         seo: seo ?? {},
//         settings: settings ?? {},
//     });

//     return NextResponse.json({ page }, { status: 201 });
// });

// // GET /api/pages — owner sees their own pages, admin sees all
// export const GET = compose(
//     withDB(),
//     withAuth(),
//     withStatus("active")
// )(async (req: AuthRequest) => {
//     const user = req.ctx.user!;
//     const { searchParams } = new URL(req.url);
//     const page = Math.max(1, Number(searchParams.get("page") ?? 1));
//     const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));
//     const isPublished = searchParams.get("isPublished");

//     const isAdmin = ["admin", "superAdmin"].includes(user.role);
//     const query: Record<string, unknown> = isAdmin ? {} : { owner: user._id };
//     if (isPublished !== null) query.isPublished = isPublished === "true";

//     const [pages, total] = await Promise.all([
//         Page.find(query)
//             .select("-blocks")           // exclude blocks array from list view — load on single page GET
//             .populate("template", "name style thumbnail")
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .lean(),
//         Page.countDocuments(query),
//     ]);

//     return NextResponse.json({ pages, total, page, limit });
// });
// src/app/api/pages/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import Page from "@/models/pages";

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeBlocks(blocks: unknown) {
    if (!Array.isArray(blocks)) return [];

    return blocks.map((block, index) => {
        const b = isObject(block) ? block : {};

        const result: Record<string, unknown> = {
            instanceId:
                typeof b.instanceId === "string" && b.instanceId.trim()
                    ? b.instanceId
                    : `${String(b.type ?? "block")}-${index}`,

            type:
                typeof b.type === "string" && b.type.trim()
                    ? b.type
                    : "unknown",

            version: typeof b.version === "number" ? b.version : 1,

            order: typeof b.order === "number" ? b.order : index,

            isActive: typeof b.isActive === "boolean" ? b.isActive : true,

            data: isObject(b.data) ? b.data : {},

            settings: isObject(b.settings) ? b.settings : { direction: "rtl" },

            elements: isObject(b.elements) ? b.elements : {},

            styleOverride: isObject(b.styleOverride) ? b.styleOverride : {},
        };

        if (typeof b.blockId === "string" && mongoose.Types.ObjectId.isValid(b.blockId)) {
            result.blockId = new mongoose.Types.ObjectId(b.blockId);
        }

        return result;
    });
}

function slugifyUrl(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]/g, "")
        .replace(/-+/g, "-");
}

export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;

    const body = await req.json();

    const title =
        typeof body.title === "string" && body.title.trim()
            ? body.title.trim()
            : "صفحه جدید";

    const url =
        typeof body.url === "string" && body.url.trim()
            ? slugifyUrl(body.url)
            : slugifyUrl(title);

    const description =
        typeof body.description === "string" ? body.description.trim() : "";

    const existing = await Page.findOne({ url });

    if (existing) {
        return NextResponse.json(
            { message: "این آدرس قبلاً استفاده شده است" },
            { status: 409 }
        );
    }

    const page = await Page.create({
        title,
        description,
        url,
        owner: user._id,
        blocks: Array.isArray(body.blocks) ? normalizeBlocks(body.blocks) : [],
        seo:
            body.seo && typeof body.seo === "object"
                ? body.seo
                : {
                      title,
                      description,
                      keywords: [],
                  },
        settings:
            body.settings && typeof body.settings === "object"
                ? body.settings
                : {
                    direction: "rtl",
                },
        styleOverride:
            body.styleOverride && typeof body.styleOverride === "object"
                ? body.styleOverride
                : {},
        isPublished: false,
    });

    return NextResponse.json({ page }, { status: 201 });
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
    const isPublished = searchParams.get("isPublished");

    const isAdmin = ["admin", "superAdmin"].includes(user.role);

    const query: Record<string, unknown> = isAdmin ? {} : { owner: user._id };

    if (isPublished !== null) {
        query.isPublished = isPublished === "true";
    }

    const [pages, total] = await Promise.all([
        Page.find(query)
            .sort({ updatedAt: -1 })
            .populate("owner", "firstName lastName email")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean({ virtuals: true }),
        Page.countDocuments(query),
    ]);

    return NextResponse.json({
        pages,
        total,
        page,
        limit,
    });
});