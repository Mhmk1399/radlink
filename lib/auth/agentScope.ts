import type { FilterQuery } from "mongoose";
import Agent from "@/models/agent";
import User, { type IUser } from "@/models/users";

type ScopedUser = Pick<IUser, "_id" | "role">;

export type ActorScope = {
  global: boolean;
  agentId: string | null;
  userIds: unknown[] | null;
};

const ACTOR_SCOPE_CACHE_TTL_MS = 60 * 1000;

type ActorScopeCacheEntry = {
  value: ActorScope;
  expiresAt: number;
};

const actorScopeCacheGlobal = global as typeof globalThis & {
  _actorScopeCache?: Map<string, ActorScopeCacheEntry>;
};

if (!actorScopeCacheGlobal._actorScopeCache) {
  actorScopeCacheGlobal._actorScopeCache = new Map();
}

const actorScopeCache = actorScopeCacheGlobal._actorScopeCache;

function actorScopeCacheKey(user: ScopedUser) {
  return `${String(user._id)}|${user.role}`;
}

function cloneScope(scope: ActorScope): ActorScope {
  return {
    global: scope.global,
    agentId: scope.agentId,
    userIds: scope.userIds ? [...scope.userIds] : null,
  };
}

function getCachedActorScope(key: string) {
  const entry = actorScopeCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    actorScopeCache.delete(key);
    return null;
  }

  return cloneScope(entry.value);
}

function setCachedActorScope(key: string, value: ActorScope) {
  actorScopeCache.set(key, {
    value: cloneScope(value),
    expiresAt: Date.now() + ACTOR_SCOPE_CACHE_TTL_MS,
  });

  return cloneScope(value);
}

export function invalidateActorScope(userIds?: unknown[]) {
  if (!userIds) {
    actorScopeCache.clear();
    return;
  }

  for (const userId of userIds) {
    const id = String(userId);
    for (const key of actorScopeCache.keys()) {
      if (key.startsWith(`${id}|`)) {
        actorScopeCache.delete(key);
      }
    }
  }
}

export async function resolveActorScope(
  user: ScopedUser,
): Promise<ActorScope> {
  const cacheKey = actorScopeCacheKey(user);
  const cached = getCachedActorScope(cacheKey);
  if (cached) return cached;

  if (user.role === "admin" || user.role === "superAdmin") {
    return setCachedActorScope(cacheKey, {
      global: true,
      agentId: null,
      userIds: null,
    });
  }

  if (user.role !== "agent") {
    return setCachedActorScope(cacheKey, {
      global: false,
      agentId: null,
      userIds: [user._id],
    });
  }

  const agent = await Agent.findOne({ user: user._id, isActive: true })
    .select("_id")
    .lean();

  if (!agent) {
    return setCachedActorScope(cacheKey, {
      global: false,
      agentId: null,
      userIds: [user._id],
    });
  }

  const assignedUserIds = await User.find({
    agentid: agent._id,
    isDeleted: false,
    _id: { $ne: user._id },
  }).distinct("_id");

  return setCachedActorScope(cacheKey, {
    global: false,
    agentId: String(agent._id),
    userIds: [user._id, ...assignedUserIds],
  });
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
