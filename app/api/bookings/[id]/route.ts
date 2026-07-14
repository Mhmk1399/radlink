import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withPermission, withStatus } from "@/lib/auth/middlewares";
import type { AuthRequest } from "@/lib/auth/types";
import { canAccessBooking } from "@/lib/bookings/bookingAccess";
import Booking from "@/models/booking";
import "@/models/pages";
import "@/models/users";
import "@/models/agent";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const BOOKING_STATUSES = ["new", "confirmed", "cancelled", "done"] as const;

type LeanBooking = Record<string, unknown>;

type ScopedBookingResult =
  | { response: NextResponse; booking?: never }
  | { booking: LeanBooking; response?: never };

function isValidStatus(value: unknown): value is (typeof BOOKING_STATUSES)[number] {
  return (
    typeof value === "string" &&
    BOOKING_STATUSES.includes(value as (typeof BOOKING_STATUSES)[number])
  );
}

function populateBookingById(id: string) {
  return Booking.findById(id)
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

async function loadScopedBooking(
  req: AuthRequest,
  id: string,
): Promise<ScopedBookingResult> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { response: NextResponse.json({ message: "شناسه رزرو معتبر نیست." }, { status: 400 }) };
  }

  const booking = (await populateBookingById(id).lean()) as LeanBooking | null;
  if (!booking) {
    return { response: NextResponse.json({ message: "رزرو پیدا نشد." }, { status: 404 }) };
  }

  if (!(await canAccessBooking(req.ctx.user!, booking))) {
    return {
      response: NextResponse.json(
        { message: "شما اجازه دسترسی به این رزرو را ندارید." },
        { status: 403 },
      ),
    };
  }

  return { booking };
}

export const GET = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
  withPermission({ component: "admin.bookings", action: "view" }),
)(async (req: AuthRequest, context: RouteContext) => {
  const { id } = await context.params;
  const result = await loadScopedBooking(req, id);
  if (result.response) return result.response;

  return NextResponse.json({ booking: result.booking });
});

export const PATCH = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
  withPermission({ component: "admin.bookings", action: "update" }),
)(async (req: AuthRequest, context: RouteContext) => {
  const { id } = await context.params;
  const result = await loadScopedBooking(req, id);
  if (result.response) return result.response;

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (isValidStatus(body?.status)) {
    update.status = body.status;
  }

  if (typeof body?.note === "string") {
    update.note = body.note.trim().slice(0, 4000);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { message: "داده‌ای برای تغییر ارسال نشده است." },
      { status: 400 },
    );
  }

  await Booking.updateOne({ _id: id }, { $set: update });
  const booking = await populateBookingById(id).lean();

  return NextResponse.json({ booking });
});

export const DELETE = compose(
  withDB(),
  withAuth(),
  withStatus("active"),
  withPermission({ component: "admin.bookings", action: "delete" }),
)(async (req: AuthRequest, context: RouteContext) => {
  const { id } = await context.params;
  const result = await loadScopedBooking(req, id);
  if (result.response) return result.response;

  await Booking.deleteOne({ _id: id });
  return NextResponse.json({ message: "رزرو حذف شد." });
});
