import type { FilterQuery } from "mongoose";
import Agent from "@/models/agent";
import User, { type IUser } from "@/models/users";

type ScopedUser = Pick<IUser, "_id" | "role">;

export type ActorScope = {
  global: boolean;
  agentId: string | null;
  userIds: unknown[] | null;
};

export async function resolveActorScope(
  user: ScopedUser,
): Promise<ActorScope> {
  if (user.role === "admin" || user.role === "superAdmin") {
    return { global: true, agentId: null, userIds: null };
  }

  if (user.role !== "agent") {
    return { global: false, agentId: null, userIds: [user._id] };
  }

  const agent = await Agent.findOne({ user: user._id, isActive: true })
    .select("_id")
    .lean();

  if (!agent) {
    return { global: false, agentId: null, userIds: [user._id] };
  }

  const assignedUserIds = await User.find({
    agentid: agent._id,
    isDeleted: false,
    _id: { $ne: user._id },
  }).distinct("_id");

  return {
    global: false,
    agentId: String(agent._id),
    userIds: [user._id, ...assignedUserIds],
  };
}

export async function withActorOwnerScope<T>(
  user: ScopedUser,
  query: FilterQuery<T> = {},
  ownerField = "owner",
): Promise<FilterQuery<T>> {
  const scope = await resolveActorScope(user);
  if (scope.global) return query;

  return {
    $and: [query, { [ownerField]: { $in: scope.userIds ?? [user._id] } }],
  } as FilterQuery<T>;
}

export async function canAccessActorOwner(
  user: ScopedUser,
  ownerId: unknown,
) {
  const scope = await resolveActorScope(user);
  if (scope.global) return true;
  return (scope.userIds ?? []).some((id) => String(id) === String(ownerId));
}

export async function getManagedUserIds(
  user: ScopedUser,
  options?: { includeSelf?: boolean },
) {
  const scope = await resolveActorScope(user);
  if (scope.global) return null;

  const ids = scope.userIds ?? [user._id];
  return options?.includeSelf === false
    ? ids.filter((id) => String(id) !== String(user._id))
    : ids;
}
