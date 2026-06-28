import type { IUser } from "@/models/users";

type OwnerScopedUser = Pick<IUser, "_id" | "role">;

export function hasGlobalOwnerScope(user: OwnerScopedUser) {
  return user.role === "admin" || user.role === "superAdmin";
}

export function withOwnerScope(
  user: OwnerScopedUser,
  query: Record<string, unknown> = {},
  ownerField = "owner",
) {
  if (hasGlobalOwnerScope(user)) return query;

  return {
    ...query,
    [ownerField]: user._id,
  };
}

export function canAccessOwnedResource(
  user: OwnerScopedUser,
  ownerId: unknown,
) {
  return hasGlobalOwnerScope(user) || String(user._id) === String(ownerId);
}
