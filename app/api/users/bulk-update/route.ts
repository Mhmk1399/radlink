import mongoose from "mongoose";
import { after, NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { getManagedUserIds, hasAgentScopedRole } from "@/lib/auth/agentScope";
import {
  MAX_USER_BULK_UPDATE_TARGETS,
  parseUserBulkUpdatePatch,
} from "@/lib/users/bulkUpdate";
import { processUserBulkUpdateQueue } from "@/lib/users/processBulkUpdateQueue";
import User from "@/models/users";
import UserBulkUpdateJob from "@/models/userBulkUpdateJobs";

export const dynamic = "force-dynamic";

function uniqueValidUserIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((id) => String(id ?? "").trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id)),
    ),
  );
}

export const POST = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
)(async (req: AuthRequest) => {
  const requester = req.ctx.user!;
  if (requester.role === "user") {
    return NextResponse.json(
      { message: "شما اجازه ویرایش گروهی کاربران را ندارید." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const record =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const rawIds = Array.isArray(record.userIds) ? record.userIds : [];
  const userIds = uniqueValidUserIds(rawIds);

  if (userIds.length === 0 || userIds.length !== rawIds.length) {
    return NextResponse.json(
      { message: "شناسه کاربران انتخاب‌شده معتبر نیست." },
      { status: 400 },
    );
  }
  if (userIds.length > MAX_USER_BULK_UPDATE_TARGETS) {
    return NextResponse.json(
      {
        message: `در هر عملیات حداکثر ${MAX_USER_BULK_UPDATE_TARGETS.toLocaleString("fa-IR")} کاربر قابل انتخاب است.`,
      },
      { status: 400 },
    );
  }

  const parsed = parseUserBulkUpdatePatch(record.updates);
  if (!parsed.patch) {
    return NextResponse.json(
      { message: parsed.error ?? "اطلاعات ویرایش گروهی معتبر نیست." },
      { status: 400 },
    );
  }

  if (hasAgentScopedRole(requester.role)) {
    const managedIds = await getManagedUserIds(requester, {
      includeSelf: false,
    });
    const managedIdSet = new Set((managedIds ?? []).map(String));
    if (userIds.some((id) => !managedIdSet.has(id))) {
      return NextResponse.json(
        {
          message:
            "ویرایش گروهی فقط برای کاربران زیرمجموعه شما امکان‌پذیر است.",
        },
        { status: 403 },
      );
    }
  }

  const targetUsers = await User.find({
    _id: { $in: userIds },
    isDeleted: { $ne: true },
  })
    .select("_id role")
    .lean();

  if (targetUsers.length !== userIds.length) {
    return NextResponse.json(
      { message: "یک یا چند کاربر انتخاب‌شده پیدا نشد یا حذف شده است." },
      { status: 409 },
    );
  }
  if (
    requester.role !== "superAdmin" &&
    targetUsers.some((user) => user.role === "superAdmin")
  ) {
    return NextResponse.json(
      { message: "فقط RAD می‌تواند اطلاعات یک حساب RAD را تغییر دهد." },
      { status: 403 },
    );
  }

  const job = await UserBulkUpdateJob.create({
    requestedBy: requester._id,
    targetUserIds: userIds,
    updates: parsed.patch,
    total: userIds.length,
  });

  after(async () => {
    try {
      await processUserBulkUpdateQueue({ maxJobs: 3 });
    } catch (error) {
      console.error("[USER_BULK_UPDATE] شروع پردازش صف با خطا مواجه شد.", error);
    }
  });

  return NextResponse.json(
    {
      job: {
        id: String(job._id),
        status: job.status,
        total: job.total,
        processed: job.processed,
        modified: job.modified,
        failed: job.failed,
        message: "عملیات در صف قرار گرفت.",
      },
    },
    { status: 202 },
  );
});
