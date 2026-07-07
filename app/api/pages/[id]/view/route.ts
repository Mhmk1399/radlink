import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/data/db";
import { queuePageViewIncrement } from "@/lib/pages/pageViewCounter";
import Page from "@/models/pages";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "شناسه صفحه معتبر نیست." },
      { status: 400 },
    );
  }

  await connectDB();
  const body = await request.json().catch(() => null);
  const isNewVisitor =
    typeof body === "object" &&
    body !== null &&
    "isNewVisitor" in body &&
    body.isNewVisitor === true;

  const page = await Page.findOne(
    {
      _id: id,
      isPublished: true,
      $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    },
  )
    .select("stats")
    .lean();

  if (!page) {
    return NextResponse.json(
      { message: "صفحه منتشرشده پیدا نشد." },
      { status: 404 },
    );
  }

  const pendingDelta = queuePageViewIncrement(id, isNewVisitor);
  const currentStats = page.stats ?? { views: 0, visitors: 0 };

  return NextResponse.json(
    {
      stats: {
        views: Number(currentStats.views ?? 0) + pendingDelta.views,
        visitors: Number(currentStats.visitors ?? 0) + pendingDelta.visitors,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
