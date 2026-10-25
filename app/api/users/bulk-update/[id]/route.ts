import mongoose from "mongoose";
import { after, NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withAuth, withDB, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { processUserBulkUpdateQueue } from "@/lib/users/processBulkUpdateQueue";
import UserBulkUpdateJob from "@/models/userBulkUpdateJobs";

type RouteContext = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export const GET = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
)(async (req: AuthRequest, ctx: RouteContext) => {
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "شناسه عملیات گروهی معتبر نیست." },
      { status: 400 },
    );
  }

  const requester = req.ctx.user!;
  const query: Record<string, unknown> = { _id: id };
  if (requester.role !== "superAdmin") query.requestedBy = requester._id;

  const job = await UserBulkUpdateJob.findOne(query).lean();
  if (!job) {
    return NextResponse.json(
      { message: "عملیات گروهی پیدا نشد." },
      { status: 404 },
    );
  }

  if (job.status === "queued") {
    after(async () => {
      try {
        await processUserBulkUpdateQueue({ maxJobs: 3 });
      } catch (error) {
        console.error(
          "[USER_BULK_UPDATE] ادامه پردازش صف با خطا مواجه شد.",
          error,
        );
      }
    });
  }

  return NextResponse.json({
    job: {
      id: String(job._id),
      status: job.status,
      total: job.total,
      processed: job.processed,
      matched: job.matched,
      modified: job.modified,
      failed: job.failed,
      attempts: job.attempts,
      message: job.message ?? "",
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
    },
  });
});
