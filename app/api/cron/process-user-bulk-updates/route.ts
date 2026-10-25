import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { processUserBulkUpdateQueue } from "@/lib/users/processBulkUpdateQueue";

export const dynamic = "force-dynamic";

function readCronSecret(req: AuthRequest) {
  const authorization = req.headers.get("authorization") ?? "";
  if (authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }
  return req.headers.get("x-cron-secret")?.trim() ?? "";
}

async function handleCronRequest(req: AuthRequest) {
  const configuredSecret =
    process.env.RADLINK_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();

  if (!configuredSecret) {
    console.error("[USER_BULK_UPDATE] cron secret تنظیم نشده است.");
    return NextResponse.json(
      { message: "Secret اجرای job روی سرور تنظیم نشده است." },
      { status: 500 },
    );
  }
  if (readCronSecret(req) !== configuredSecret) {
    console.warn("[USER_BULK_UPDATE] درخواست cron نامعتبر رد شد.");
    return NextResponse.json(
      { message: "اجازه اجرای این job را ندارید." },
      { status: 401 },
    );
  }

  const result = await processUserBulkUpdateQueue({ maxJobs: 10 });
  return NextResponse.json(result, { status: result.ok ? 200 : 207 });
}

export const GET = compose(withDB())(handleCronRequest);
export const POST = compose(withDB())(handleCronRequest);
