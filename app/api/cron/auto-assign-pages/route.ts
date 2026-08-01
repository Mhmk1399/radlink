import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { autoAssignUnownedPages24h } from "@/lib/pages/autoAssignUnownedPages";

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
  const providedSecret = readCronSecret(req);

  if (!configuredSecret) {
    console.error("[AUTO_24H_PAGE_ASSIGNMENT] cron secret تنظیم نشده است.");
    return NextResponse.json(
      {
        code: "CRON_SECRET_NOT_CONFIGURED",
        message: "Secret اجرای job روی سرور تنظیم نشده است.",
      },
      { status: 500 },
    );
  }

  if (!providedSecret || providedSecret !== configuredSecret) {
    console.warn("[AUTO_24H_PAGE_ASSIGNMENT] درخواست cron نامعتبر رد شد.");
    return NextResponse.json(
      {
        code: "CRON_UNAUTHORIZED",
        message: "اجازه اجرای این job را ندارید.",
      },
      { status: 401 },
    );
  }

  const result = await autoAssignUnownedPages24h();

  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}

export const GET = compose(withDB())(handleCronRequest);
export const POST = compose(withDB())(handleCronRequest);
