import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import File from "@/models/files";
import "@/models/pages";
import "@/models/users";

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

    const isAdmin = ["admin", "superAdmin"].includes(user.role);
    const query = isAdmin ? {} : { owner: user._id };

    const [files, total] = await Promise.all([
        File.find(query)
            .populate("owner", "firstName lastName phoneNumber email")
            .populate("page", "title url")
            .sort({ createdAt: -1, _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        File.countDocuments(query),
    ]);

    return NextResponse.json({ files, total, page, limit });
});
