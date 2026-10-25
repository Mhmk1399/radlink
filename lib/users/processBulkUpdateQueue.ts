import User from "@/models/users";
import UserBulkUpdateJob, {
  type IUserBulkUpdateJob,
} from "@/models/userBulkUpdateJobs";
import { getManagedUserIds, hasAgentScopedRole } from "@/lib/auth/agentScope";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import {
  parseUserBulkUpdatePatch,
  userBulkUpdatePatchToSet,
} from "@/lib/users/bulkUpdate";

const JOB_LEASE_MS = 5 * 60 * 1000;
const MAX_JOB_ATTEMPTS = 3;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "خطای ناشناخته در پردازش صف";
}

async function recoverExpiredJobs(now: Date) {
  await UserBulkUpdateJob.updateMany(
    {
      status: "processing",
      leaseUntil: { $lte: now },
      attempts: { $gte: MAX_JOB_ATTEMPTS },
    },
    {
      $set: {
        status: "failed",
        finishedAt: now,
        message: "پردازش این عملیات پس از چند تلاش ناموفق متوقف شد.",
      },
      $unset: { leaseUntil: "" },
    },
  );

  await UserBulkUpdateJob.updateMany(
    {
      status: "processing",
      leaseUntil: { $lte: now },
      attempts: { $lt: MAX_JOB_ATTEMPTS },
    },
    {
      $set: { status: "queued" },
      $unset: { leaseUntil: "" },
    },
  );
}

async function claimNextJob() {
  const now = new Date();
  await recoverExpiredJobs(now);

  const activeJob = await UserBulkUpdateJob.exists({
    status: "processing",
    leaseUntil: { $gt: now },
  });
  if (activeJob) return null;

  try {
    return await UserBulkUpdateJob.findOneAndUpdate(
      { status: "queued" },
      {
        $set: {
          status: "processing",
          leaseUntil: new Date(now.getTime() + JOB_LEASE_MS),
          startedAt: now,
          message: "در حال پردازش",
        },
        $inc: { attempts: 1 },
      },
      { new: true, sort: { createdAt: 1, _id: 1 } },
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      Number((error as { code?: unknown }).code) === 11000
    ) {
      return null;
    }
    throw error;
  }
}

async function failJob(job: IUserBulkUpdateJob, message: string) {
  await UserBulkUpdateJob.updateOne(
    { _id: job._id, status: "processing" },
    {
      $set: {
        status: "failed",
        failed: job.total,
        finishedAt: new Date(),
        message,
      },
      $unset: { leaseUntil: "" },
    },
  );
}

async function processClaimedJob(job: IUserBulkUpdateJob) {
  const requester = await User.findOne({
    _id: job.requestedBy,
    status: "active",
    isDeleted: { $ne: true },
  }).select("role permissions");

  if (!requester) {
    await failJob(job, "درخواست‌کننده این عملیات دیگر یک کاربر فعال نیست.");
    return false;
  }

  const access =
    requester.role === "superAdmin"
      ? null
      : await resolveUserAccess(String(requester._id), requester.permissions);
  const canUpdateUsers =
    requester.role === "superAdmin" ||
    access?.components["admin.users"]?.has("update") === true;

  if (!canUpdateUsers || requester.role === "user") {
    await failJob(job, "دسترسی درخواست‌کننده برای ویرایش کاربران معتبر نیست.");
    return false;
  }

  const parsed = parseUserBulkUpdatePatch(job.updates);
  if (!parsed.patch) {
    await failJob(job, parsed.error ?? "اطلاعات عملیات گروهی معتبر نیست.");
    return false;
  }

  const targetIds = job.targetUserIds.map(String);
  const targetQuery: Record<string, unknown> = {
    _id: { $in: targetIds },
    isDeleted: { $ne: true },
  };

  if (requester.role !== "superAdmin") {
    targetQuery.role = { $ne: "superAdmin" };
  }

  if (hasAgentScopedRole(requester.role)) {
    const managedIds = await getManagedUserIds(requester, {
      includeSelf: false,
    });
    targetQuery._id = {
      $in: targetIds.filter((id) =>
        (managedIds ?? []).some((managedId) => String(managedId) === id),
      ),
    };
  }

  const validTargetIds = (
    await User.find(targetQuery).select("_id").lean()
  ).map((user) => String(user._id));

  if (validTargetIds.length !== targetIds.length) {
    await failJob(
      job,
      "محدوده دسترسی یا وضعیت بعضی کاربران پس از ثبت عملیات تغییر کرده است.",
    );
    return false;
  }

  const update = {
    ...userBulkUpdatePatchToSet(parsed.patch),
    updatedBy: requester._id,
  };
  const result = await User.bulkWrite(
    validTargetIds.map((userId) => ({
      updateOne: {
        filter: { _id: userId, isDeleted: { $ne: true } },
        update: { $set: update },
      },
    })),
    { ordered: false },
  );

  const matched = result.matchedCount;
  const failed = Math.max(0, job.total - matched);
  await UserBulkUpdateJob.updateOne(
    { _id: job._id, status: "processing" },
    {
      $set: {
        status: failed > 0 ? "failed" : "completed",
        processed: matched,
        matched,
        modified: result.modifiedCount,
        failed,
        finishedAt: new Date(),
        message:
          failed > 0
            ? "برخی کاربران هنگام پردازش در دسترس نبودند."
            : "ویرایش گروهی با موفقیت انجام شد.",
      },
      $unset: { leaseUntil: "" },
    },
  );

  console.info("[USER_BULK_UPDATE]", {
    jobId: String(job._id),
    requestedBy: String(requester._id),
    total: job.total,
    matched,
    modified: result.modifiedCount,
    failed,
  });
  return failed === 0;
}

export async function processUserBulkUpdateQueue(options?: {
  maxJobs?: number;
}) {
  const maxJobs = Math.max(1, Math.min(options?.maxJobs ?? 3, 10));
  let claimed = 0;
  let completed = 0;
  let failed = 0;

  await UserBulkUpdateJob.init();

  for (let index = 0; index < maxJobs; index += 1) {
    const job = await claimNextJob();
    if (!job) break;
    claimed += 1;

    try {
      if (await processClaimedJob(job)) completed += 1;
      else failed += 1;
    } catch (error) {
      failed += 1;
      const message = errorMessage(error);
      await failJob(job, message);
      console.error("[USER_BULK_UPDATE] پردازش job با خطا مواجه شد.", {
        jobId: String(job._id),
        error,
      });
    }
  }

  return { ok: failed === 0, claimed, completed, failed };
}
