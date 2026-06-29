import type { FilterQuery } from "mongoose";
import type { IUser } from "@/models/users";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import { hasGlobalOwnerScope } from "@/lib/auth/ownership";

type DynamicResource = "templates" | "pages";
type ScopedUser = Pick<IUser, "_id" | "role" | "permissions">;

export async function getGrantedResourceIds(
  user: ScopedUser,
  resource: DynamicResource,
  action: string,
) {
  if (hasGlobalOwnerScope(user)) return null;

  const access = await resolveUserAccess(String(user._id), user.permissions);

  return Object.entries(access[resource])
    .filter(([, actions]) => actions.has(action))
    .map(([id]) => id);
}

export async function withTemplateAccessScope<T>(
  user: ScopedUser,
  query: FilterQuery<T> = {},
  action = "view",
): Promise<FilterQuery<T>> {
  const grantedIds = await getGrantedResourceIds(user, "templates", action);
  if (grantedIds === null) return query;

  return {
    $and: [query, { _id: { $in: grantedIds } }],
  } as FilterQuery<T>;
}

export async function withPageAccessScope<T>(
  user: ScopedUser,
  query: FilterQuery<T> = {},
  action = "view",
): Promise<FilterQuery<T>> {
  const grantedIds = await getGrantedResourceIds(user, "pages", action);
  if (grantedIds === null) return query;

  return {
    $and: [
      query,
      {
        $or: [{ owner: user._id }, { _id: { $in: grantedIds } }],
      },
    ],
  } as FilterQuery<T>;
}
