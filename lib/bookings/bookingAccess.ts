import type { FilterQuery } from "mongoose";
import { resolveActorScope } from "@/lib/auth/agentScope";
import type { IUser } from "@/models/users";
import Page from "@/models/pages";

type BookingScopeFields = {
  page?: unknown;
  pageOwner?: unknown;
  assignedUser?: unknown;
  agent?: unknown;
};

function getRefId(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record._id ?? record.id ?? value);
  }
  return String(value);
}

export async function withBookingAccessScope<T>(
  user: Pick<IUser, "_id" | "role">,
  query: FilterQuery<T> = {},
) {
  const scope = await resolveActorScope(user);
  if (scope.global) return query;

  const scopedUserIds = scope.userIds ?? [user._id];
  const bookingScope: Record<string, unknown>[] = [
    { pageOwner: { $in: scopedUserIds } },
    { assignedUser: { $in: scopedUserIds } },
  ];
  const scopedPageIds = await Page.find({
    $or: [
      { owner: { $in: scopedUserIds } },
      { assignedUser: { $in: scopedUserIds } },
    ],
  }).distinct("_id");

  if (scopedPageIds.length > 0) {
    bookingScope.push({ page: { $in: scopedPageIds } });
  }

  if (scope.agentId) {
    bookingScope.push({ agent: scope.agentId });
  }

  return {
    $and: [query, { $or: bookingScope }],
  } as FilterQuery<T>;
}

export async function canAccessBooking(
  user: Pick<IUser, "_id" | "role">,
  booking: BookingScopeFields,
) {
  const scope = await resolveActorScope(user);
  if (scope.global) return true;

  const scopedUserIds = new Set((scope.userIds ?? [user._id]).map(String));
  const pageOwnerId = getRefId(booking.pageOwner);
  const assignedUserId = getRefId(booking.assignedUser);
  const agentId = getRefId(booking.agent);

  const hasDirectAccess =
    scopedUserIds.has(pageOwnerId) ||
    scopedUserIds.has(assignedUserId) ||
    Boolean(scope.agentId && agentId === String(scope.agentId));

  if (hasDirectAccess) return true;

  const pageId = getRefId(booking.page);
  if (!pageId) return false;

  const page = await Page.findById(pageId)
    .select("owner assignedUser")
    .lean();

  if (!page) return false;

  return (
    scopedUserIds.has(String(page.owner ?? "")) ||
    scopedUserIds.has(String(page.assignedUser ?? ""))
  );
}
