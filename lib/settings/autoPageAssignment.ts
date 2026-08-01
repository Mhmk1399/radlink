import mongoose from "mongoose";
import SystemSetting from "@/models/systemSetting";
import User from "@/models/users";

export const AUTO_PAGE_ASSIGNMENT_TARGET_USER_SETTING_KEY =
  "autoPageAssignment.targetUserId";

export const AUTO_PAGE_ASSIGNMENT_SOURCE = "AUTO_24H";
export const AUTO_PAGE_ASSIGNMENT_DELAY_MS = 24 * 60 * 60 * 1000;

export type AutoPageAssignmentTarget = {
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
};

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function getAutoPageAssignmentTargetUserId() {
  const setting = await SystemSetting.findOne({
    key: AUTO_PAGE_ASSIGNMENT_TARGET_USER_SETTING_KEY,
  })
    .select("value")
    .lean();

  return typeof setting?.value === "string" ? setting.value.trim() : "";
}

export async function getActiveAutoPageAssignmentTarget() {
  const targetUserId = await getAutoPageAssignmentTargetUserId();
  if (!targetUserId) {
    return {
      ok: false as const,
      code: "AUTO_ASSIGN_TARGET_NOT_CONFIGURED",
      message: "کاربر مقصد تخصیص خودکار صفحات تنظیم نشده است.",
    };
  }

  if (!isValidObjectId(targetUserId)) {
    return {
      ok: false as const,
      code: "AUTO_ASSIGN_TARGET_INVALID",
      message: "شناسه کاربر مقصد تخصیص خودکار معتبر نیست.",
    };
  }

  const user = await User.findOne({
    _id: targetUserId,
    status: "active",
    isDeleted: { $ne: true },
  })
    .select("firstName lastName phoneNumber email role status")
    .lean();

  if (!user) {
    return {
      ok: false as const,
      code: "AUTO_ASSIGN_TARGET_USER_NOT_ACTIVE",
      message: "کاربر مقصد تخصیص خودکار پیدا نشد یا فعال نیست.",
    };
  }

  return {
    ok: true as const,
    user,
    target: {
      id: String(user._id),
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    } satisfies AutoPageAssignmentTarget,
  };
}

export async function saveAutoPageAssignmentTargetUserId({
  targetUserId,
  updatedBy,
}: {
  targetUserId: string;
  updatedBy: unknown;
}) {
  const normalizedTargetUserId = targetUserId.trim();

  if (!normalizedTargetUserId) {
    await SystemSetting.deleteOne({
      key: AUTO_PAGE_ASSIGNMENT_TARGET_USER_SETTING_KEY,
    });
    return { targetUserId: "" };
  }

  if (!isValidObjectId(normalizedTargetUserId)) {
    throw new Error("شناسه کاربر مقصد معتبر نیست.");
  }

  const targetUser = await User.findOne({
    _id: normalizedTargetUserId,
    status: "active",
    isDeleted: { $ne: true },
  })
    .select("_id")
    .lean();

  if (!targetUser) {
    throw new Error("کاربر مقصد پیدا نشد یا فعال نیست.");
  }

  await SystemSetting.updateOne(
    { key: AUTO_PAGE_ASSIGNMENT_TARGET_USER_SETTING_KEY },
    {
      $set: {
        value: normalizedTargetUserId,
        updatedBy,
      },
    },
    { upsert: true },
  );

  return { targetUserId: normalizedTargetUserId };
}
