import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import File from "@/models/files";

// POST /api/files — register an uploaded file record
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req: AuthRequest) => {
    const user = req.ctx.user!;
    const { filename, path } = await req.json();

    if (!filename || !path) {
        return NextResponse.json({ message: "filename and path are required" }, { status: 400 });
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
            .populate("owner", "firstName lastName phoneNumber")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        File.countDocuments(query),
    ]);

    return NextResponse.json({ files, total, page, limit });
});
