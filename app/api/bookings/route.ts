import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withPermission, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { withBookingAccessScope } from "@/lib/bookings/bookingAccess";
import {
  isValidEmail,
  normalizeEmail,
  toEnglishDigits,
} from "@/lib/validation/identityFields";
import Booking from "@/models/booking";
import Page from "@/models/pages";
import User from "@/models/users";
import Agent from "@/models/agent";
import "@/models/users";
import "@/models/pages";

type CustomFieldPayload = {
  key?: unknown;
  label?: unknown;
  value?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max = 4000) {
  return String(value ?? "").trim().slice(0, max);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFilterParam(searchParams: URLSearchParams, key: string) {
  return (
    searchParams.get(key)?.trim() ||
    searchParams.get(`filter_${key}`)?.trim() ||
    ""
  );
}

function normalizeSlug(value: unknown) {
  const raw = text(value, 500);
  if (!raw) return "";

  try {
    const parsed = raw.startsWith("http")
      ? new URL(raw)
      : new URL(raw, "http://local");
    const firstSegment = parsed.pathname
      .split("/")
      .filter(Boolean)[0];
    return decodeURIComponent(firstSegment ?? "").trim().toLowerCase();
  } catch {
    return raw.replace(/^\/+|\/+$/g, "").split("/")[0]?.trim().toLowerCase() ?? "";
  }
}

function normalizeCustomFields(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item: CustomFieldPayload) => ({
      key: text(item.key, 80),
      label: text(item.label, 120),
      value: text(item.value, 2000),
    }))
    .filter((item) => item.key || item.label || item.value);
}

function getRequestIp(req: AuthRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    ""
  );
}

async function resolveBookingAgentId(ownerId: unknown, assignedUserId: unknown) {
  const userIds = [ownerId, assignedUserId]
    .filter(Boolean)
    .map((id) => String(id));

  const users = await User.find({ _id: { $in: userIds } })
    .select("_id role agentid")
    .lean();

  const byId = new Map(users.map((user) => [String(user._id), user]));
  const owner = byId.get(String(ownerId));
  const assignedUser = assignedUserId ? byId.get(String(assignedUserId)) : null;

  const directAgentId = assignedUser?.agentid ?? owner?.agentid;
  if (directAgentId) return directAgentId;

  const agentUserId =
    assignedUser?.role === "agent" ? assignedUser._id : owner?.role === "agent" ? owner._id : null;

  if (!agentUserId) return null;

  const agent = await Agent.findOne({ user: agentUserId, isActive: true })
    .select("_id")
    .lean();

  return agent?._id ?? null;
}

function populateBookings(query: Record<string, unknown>) {
  return Booking.find(query)
    .populate({
      path: "page",
      select: "title url owner assignedUser",
      populate: [
        {
          path: "owner",
          select: "firstName lastName phoneNumber email role",
          strictPopulate: false,
        },
        {
          path: "assignedUser",
          select: "firstName lastName phoneNumber email role",
          strictPopulate: false,
        },
      ],
      strictPopulate: false,
    })
    .populate("pageOwner", "firstName lastName phoneNumber email role")
    .populate("assignedUser", "firstName lastName phoneNumber email role")
    .populate({
      path: "agent",
      select: "type companyName user",
      populate: {
        path: "user",
        select: "firstName lastName phoneNumber email role",
      },
      strictPopulate: false,
    });
}

export const POST = compose(withDB())(async (req: AuthRequest) => {
  const body = await req.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json({ message: "داده رزرو معتبر نیست." }, { status: 400 });
  }

  const fullName = text(body.fullName, 160);
  const phone = toEnglishDigits(body.phone ?? "").trim().slice(0, 40);
  const email = normalizeEmail(body.email ?? "");
  const selectedDate = text(body.selectedDate, 120);
  const selectedTime = text(body.selectedTime, 40);
  const note = text(body.note, 4000);
  const blockInstanceId = text(body.blockInstanceId, 160);
  const referer = req.headers.get("referer") ?? "";
  const sourceUrl = text(body.sourceUrl ?? referer, 500);
  const pageId = text(body.pageId ?? body.page, 80);
  const pageUrl = normalizeSlug(body.pageUrl ?? body.url ?? referer);
  const customFields = normalizeCustomFields(body.customFields);

  if (!fullName) {
    return NextResponse.json({ message: "نام و نام خانوادگی الزامی است." }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({ message: "شماره تماس الزامی است." }, { status: 400 });
  }

  if (email && !isValidEmail(email)) {
    return NextResponse.json({ message: "ایمیل واردشده معتبر نیست." }, { status: 400 });
  }

  const pageQuery: Record<string, unknown> | null =
    pageId && mongoose.Types.ObjectId.isValid(pageId)
      ? { _id: pageId }
      : pageUrl
        ? { url: pageUrl }
        : null;

  if (!pageQuery) {
    return NextResponse.json(
      { message: "صفحه مقصد برای ثبت رزرو مشخص نیست." },
      { status: 400 },
    );
  }

  const page = await Page.findOne(pageQuery)
    .select("_id title url owner assignedUser isPublished")
    .lean();

  if (!page || page.isPublished === false) {
    return NextResponse.json({ message: "صفحه مقصد پیدا نشد." }, { status: 404 });
  }

  const agentId = await resolveBookingAgentId(page.owner, page.assignedUser);

  const booking = await Booking.create({
    page: page._id,
    pageOwner: page.owner,
    assignedUser: page.assignedUser ?? null,
    agent: agentId,
    blockInstanceId: blockInstanceId || undefined,
    fullName,
    phone,
    email: email || undefined,
    selectedDate,
    selectedTime,
    note,
    customFields,
    sourceUrl,
    userAgent: text(req.headers.get("user-agent"), 500),
    ip: getRequestIp(req),
    payload: {
      blockType: "bookingForm",
      submittedAt: text(body.submittedAt, 80) || new Date().toISOString(),
    },
  });

  return NextResponse.json(
    { message: "رزرو شما با موفقیت ثبت شد.", bookingId: booking._id },
    { status: 201 },
  );
});

export const GET = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
  withPermission({ component: "admin.bookings", action: "view" }),
)(async (req: AuthRequest) => {
  const user = req.ctx.user!;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const status = searchParams.get("status")?.trim();
  const search = searchParams.get("search")?.trim();
  const pageId = searchParams.get("pageId")?.trim();
  const ownerId = searchParams.get("pageOwner")?.trim();
  const customerFilter = getFilterParam(searchParams, "fullName");
  const pageTitleFilter = getFilterParam(searchParams, "pageTitle");
  const sortKey = searchParams.get("sortKey")?.trim() || "createdAt";
  const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;
  const dateFrom = searchParams.get("dateFrom_createdAt");
  const dateTo = searchParams.get("dateTo_createdAt");

  const baseQuery: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (status && ["new", "confirmed", "cancelled", "done"].includes(status)) {
    baseQuery.status = status;
  }

  if (pageId && mongoose.Types.ObjectId.isValid(pageId)) {
    baseQuery.page = pageId;
  }

  if (pageTitleFilter) {
    const pageRegex = escapeRegex(pageTitleFilter);
    const matchedPageIds = await Page.find({
      $or: [
        { title: { $regex: pageRegex, $options: "i" } },
        { url: { $regex: pageRegex, $options: "i" } },
      ],
    }).distinct("_id");

    if (pageId && mongoose.Types.ObjectId.isValid(pageId)) {
      baseQuery.page = matchedPageIds.some((id) => String(id) === pageId)
        ? pageId
        : { $in: [] };
    } else {
      baseQuery.page = { $in: matchedPageIds };
    }
  }

  if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
    baseQuery.pageOwner = ownerId;
  }

  if (customerFilter) {
    const customerRegex = escapeRegex(customerFilter);
    andConditions.push({
      $or: [
        { fullName: { $regex: customerRegex, $options: "i" } },
        { phone: { $regex: customerRegex, $options: "i" } },
        { email: { $regex: customerRegex, $options: "i" } },
      ],
    });
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (!Number.isNaN(fromDate.getTime())) createdAt.$gte = fromDate;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      if (!Number.isNaN(toDate.getTime())) createdAt.$lte = toDate;
    }
    if (Object.keys(createdAt).length > 0) baseQuery.createdAt = createdAt;
  }

  if (search) {
    const searchRegex = escapeRegex(search);
    baseQuery.$or = [
      { fullName: { $regex: searchRegex, $options: "i" } },
      { phone: { $regex: searchRegex, $options: "i" } },
      { email: { $regex: searchRegex, $options: "i" } },
      { note: { $regex: searchRegex, $options: "i" } },
      { selectedDate: { $regex: searchRegex, $options: "i" } },
      { selectedTime: { $regex: searchRegex, $options: "i" } },
      { "customFields.value": { $regex: searchRegex, $options: "i" } },
      { "customFields.label": { $regex: searchRegex, $options: "i" } },
    ];
  }

  if (andConditions.length > 0) {
    baseQuery.$and = andConditions;
  }

  const query = await withBookingAccessScope(user, baseQuery);
  const sortField = ["createdAt", "updatedAt", "selectedDate", "status", "fullName"].includes(sortKey)
    ? sortKey
    : "createdAt";

  const [bookings, total] = await Promise.all([
    populateBookings(query)
      .sort({ [sortField]: sortDir, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Booking.countDocuments(query),
  ]);

  return NextResponse.json({ bookings, total, page, limit });
});
