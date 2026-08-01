import mongoose from "mongoose";
import Permission from "@/models/permission";
import User from "@/models/users";

export const SINGLE_PERMISSION_PER_USER_MESSAGE =
  "هر کاربر فقط می‌تواند یک دسترسی داشته باشد.";

type PermissionAssignmentConflict = {
  userId: string;
  userLabel: string;
  permissionId: string;
  permissionName: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getId(value: unknown) {
  if (value instanceof mongoose.Types.ObjectId) return String(value);
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  return String(value._id ?? value.id ?? "");
}

function getUserLabel(user: Record<string, unknown>, fallback: string) {
  const name = [user.firstName, user.lastName]
    .filter((part): part is string => typeof part === "string" && !!part.trim())
    .join(" ")
    .trim();
  const phoneNumber =
    typeof user.phoneNumber === "string" ? user.phoneNumber.trim() : "";

  return name || phoneNumber || fallback;
}

function getPermissionName(permission: Record<string, unknown>) {
  return typeof permission.name === "string" && permission.name.trim()
    ? permission.name.trim()
    : "دسترسی قبلی";
}

export function normalizeIdList(ids: unknown) {
  if (!Array.isArray(ids)) return [];

  return [
    ...new Set(
      ids
        .map((id) => {
          if (isRecord(id)) return getId(id);
          return String(id ?? "");
        })
        .filter(Boolean),
    ),
  ];
}

export function buildPermissionAssignmentConflictMessage(
  conflicts: PermissionAssignmentConflict[],
) {
  if (conflicts.length === 0) return SINGLE_PERMISSION_PER_USER_MESSAGE;

  if (conflicts.length === 1) {
    const conflict = conflicts[0];
    return `کاربر «${conflict.userLabel}» قبلاً دسترسی «${conflict.permissionName}» را دارد. ${SINGLE_PERMISSION_PER_USER_MESSAGE}`;
  }

  const labels = conflicts
    .slice(0, 4)
    .map((conflict) => `«${conflict.userLabel}»`)
    .join("، ");
  const more =
    conflicts.length > 4 ? ` و ${conflicts.length - 4} کاربر دیگر` : "";

  return `این کاربران قبلاً دسترسی دارند: ${labels}${more}. ${SINGLE_PERMISSION_PER_USER_MESSAGE}`;
}

export async function findExistingActivePermissionAssignments(
  userIds: string[],
  options: { excludePermissionId?: string } = {},
) {
  const normalizedUserIds = [
    ...new Set(userIds.filter((id) => mongoose.Types.ObjectId.isValid(id))),
  ];

  if (normalizedUserIds.length === 0) return [];

  const excludePermissionId = options.excludePermissionId;
  const conflicts = new Map<string, PermissionAssignmentConflict>();

  const users = (await User.find({
    _id: { $in: normalizedUserIds },
    isDeleted: { $ne: true },
  })
    .select("firstName lastName phoneNumber permissions")
    .populate({
      path: "permissions",
      match: { isActive: { $ne: false } },
      select: "name isActive",
    })
    .lean()) as Record<string, unknown>[];

  for (const user of users) {
    const userId = getId(user);
    const permissions = Array.isArray(user.permissions)
      ? user.permissions.filter(isRecord)
      : [];
    const permission = permissions.find((item) => {
      const permissionId = getId(item);
      return permissionId && permissionId !== excludePermissionId;
    });

    if (!userId || !permission) continue;

    conflicts.set(userId, {
      userId,
      userLabel: getUserLabel(user, userId),
      permissionId: getId(permission),
      permissionName: getPermissionName(permission),
    });
  }

  const permissionQuery: Record<string, unknown> = {
    isActive: { $ne: false },
    assignedToUsers: { $in: normalizedUserIds },
  };

  if (
    excludePermissionId &&
    mongoose.Types.ObjectId.isValid(excludePermissionId)
  ) {
    permissionQuery._id = { $ne: excludePermissionId };
  }

  const permissions = (await Permission.find(permissionQuery)
    .select("name assignedToUsers")
    .populate("assignedToUsers", "firstName lastName phoneNumber")
    .lean()) as Record<string, unknown>[];

  const requestedUserIdSet = new Set(normalizedUserIds);
  for (const permission of permissions) {
    const assignedUsers = Array.isArray(permission.assignedToUsers)
      ? permission.assignedToUsers.filter(isRecord)
      : [];

    for (const assignedUser of assignedUsers) {
      const userId = getId(assignedUser);
      if (!requestedUserIdSet.has(userId) || conflicts.has(userId)) continue;

      conflicts.set(userId, {
        userId,
        userLabel: getUserLabel(assignedUser, userId),
        permissionId: getId(permission),
        permissionName: getPermissionName(permission),
      });
    }
  }

  return [...conflicts.values()];
}

export function validateSinglePermissionIdSelection(permissionIds: string[]) {
  if (permissionIds.length <= 1) return null;
  return SINGLE_PERMISSION_PER_USER_MESSAGE;
}
