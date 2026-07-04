import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import { withActorOwnerScope } from "@/lib/auth/agentScope";
import File from "@/models/files";
import User from "@/models/users";
import "@/models/pages";

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// POST /api/files — register an uploaded file record
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { filename, path } = await req.json();

    if (!filename || !path) {
        return NextResponse.json({ message: "نام فایل و مسیر فایل الزامی هستند." }, { status: 400 });
    }

    const file = await File.create({ filename, path, owner: user._id });
    return NextResponse.json({ file }, { status: 201 });
});

// GET /api/files — owner sees own files, admin sees all
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(100, Number(searchParams.get("limit") ?? 20));

    const query: Record<string, unknown> =
        await withActorOwnerScope(user);
    const search = searchParams.get("search")?.trim();
    const kind = searchParams.get("filter_kind");
    const ownerLabel = searchParams.get("filter_ownerLabel")?.trim();
    const fileType = searchParams.get("filter_fileType");
    const dateFrom = searchParams.get("dateFrom_createdAt");
    const dateTo = searchParams.get("dateTo_createdAt");

    if (search) {
        const pattern = escapeRegex(search);
        query.$or = [
            { filename: { $regex: pattern, $options: "i" } },
            { path: { $regex: pattern, $options: "i" } },
        ];
    }

    if (kind === "upload" || kind === "qr") query.kind = kind;

    if (ownerLabel) {
        const pattern = escapeRegex(ownerLabel);
        const owners = await User.find({
            $or: [
                { firstName: { $regex: pattern, $options: "i" } },
                { lastName: { $regex: pattern, $options: "i" } },
                { phoneNumber: { $regex: pattern, $options: "i" } },
                { email: { $regex: pattern, $options: "i" } },
            ],
        }).distinct("_id");
        query.$and = [
            ...((query.$and as unknown[]) ?? []),
            { owner: { $in: owners } },
        ];
    }

    if (fileType) {
        const extensionPattern =
            fileType === "تصویر"
                ? "\\.(?:jpe?g|png|gif|webp)(?:\\?.*)?$"
                : fileType === "PDF"
                  ? "\\.pdf(?:\\?.*)?$"
                  : fileType === "سند"
                    ? "\\.(?:docx?|txt)(?:\\?.*)?$"
                    : "";
        if (extensionPattern) {
            query.$and = [
                ...((query.$and as unknown[]) ?? []),
                {
                    $or: [
                        { filename: { $regex: extensionPattern, $options: "i" } },
                        { path: { $regex: extensionPattern, $options: "i" } },
                    ],
                },
            ];
        }
    }

    const createdAt: Record<string, Date> = {};
    if (dateFrom) {
        const from = new Date(dateFrom);
        if (!Number.isNaN(from.getTime())) createdAt.$gte = from;
    }
    if (dateTo) {
        const to = new Date(dateTo);
        if (!Number.isNaN(to.getTime())) {
            to.setUTCDate(to.getUTCDate() + 1);
            createdAt.$lt = to;
        }
    }
    if (Object.keys(createdAt).length) query.createdAt = createdAt;

    const requestedSortKey = searchParams.get("sortKey");
    const sortKey = ["filename", "kind", "createdAt"].includes(
        requestedSortKey ?? "",
    )
        ? requestedSortKey!
        : "createdAt";
    const sortDirection = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const [files, total] = await Promise.all([
        File.find(query)
            .populate("owner", "firstName lastName phoneNumber email")
            .populate("page", "title url")
            .sort({ [sortKey]: sortDirection, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        File.countDocuments(query),
    ]);

    return NextResponse.json({ files, total, page, limit });
});
