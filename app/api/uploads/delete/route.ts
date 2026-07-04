import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { deleteFileByIdentifier, FileDeletionError } from "@/lib/fileDeletion";

function jsonError(message: string, status: number, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

// DELETE /api/uploads/delete — remove a File record and its Object Storage
// object together. Accepts { fileId } or { url } (fileId takes precedence).
export const DELETE = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
)(async (req: AuthRequest) => {
  const body = await req.json().catch(() => null);
  const fileId = typeof body?.fileId === "string" ? body.fileId.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  if (!fileId && !url) {
    return jsonError("شناسه یا آدرس فایل ارسال نشده است.", 400, "FILE_IDENTIFIER_REQUIRED");
  }

  try {
    const result = await deleteFileByIdentifier(
      { fileId, url },
      req.ctx.user!,
    );

    return NextResponse.json({
      success: true,
      message: "فایل با موفقیت حذف شد.",
      data: result,
    });
  } catch (error) {
    if (error instanceof FileDeletionError) {
      return jsonError(error.message, error.status, error.code);
    }

    console.error("Delete upload error:", error);
    return jsonError(
      error instanceof Error ? error.message : "حذف فایل با خطا مواجه شد.",
      500,
    );
  }
});
