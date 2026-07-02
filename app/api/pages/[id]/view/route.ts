import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/data/db";
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

  const page = await Page.findOneAndUpdate(
    {
      _id: id,
      isPublished: true,
      $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    },
    {
      $inc: {
        "stats.views": 1,
        "stats.visitors": isNewVisitor ? 1 : 0,
      },
    },
    {
      new: true,
      runValidators: true,
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

  return NextResponse.json(
    { stats: page.stats },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
