export const MAX_USER_BULK_UPDATE_TARGETS = 500;

export type UserBulkUpdatePatch = {
  status?: "active" | "inactive";
  limits?: {
    files?: number;
    blocks?: number;
    pages?: number;
  };
};

const LIMIT_KEYS = ["files", "blocks", "pages"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseUserBulkUpdatePatch(value: unknown): {
  patch?: UserBulkUpdatePatch;
  error?: string;
} {
  if (!isRecord(value)) {
    return { error: "اطلاعات ویرایش گروهی معتبر نیست." };
  }

  const patch: UserBulkUpdatePatch = {};

  if (value.status !== undefined) {
    if (value.status !== "active" && value.status !== "inactive") {
      return { error: "وضعیت انتخاب‌شده معتبر نیست." };
    }
    patch.status = value.status;
  }

  if (value.limits !== undefined) {
    if (!isRecord(value.limits)) {
      return { error: "محدودیت‌های انتخاب‌شده معتبر نیستند." };
    }

    const limits: NonNullable<UserBulkUpdatePatch["limits"]> = {};
    for (const key of LIMIT_KEYS) {
      if (value.limits[key] === undefined) continue;

      const numericValue = Number(value.limits[key]);
      if (
        !Number.isSafeInteger(numericValue) ||
        numericValue < 0
      ) {
        return {
          error: "مقدار محدودیت‌ها باید یک عدد صحیح صفر یا بزرگ‌تر باشد.",
        };
      }
      limits[key] = numericValue;
    }

    if (Object.keys(limits).length > 0) patch.limits = limits;
  }

  if (!patch.status && !patch.limits) {
    return { error: "حداقل یک مورد را برای ویرایش انتخاب کنید." };
  }

  return { patch };
}

export function userBulkUpdatePatchToSet(patch: UserBulkUpdatePatch) {
  const update: Record<string, unknown> = {};

  if (patch.status) update.status = patch.status;
  if (patch.limits) {
    for (const key of LIMIT_KEYS) {
      const value = patch.limits[key];
      if (value !== undefined) update[`limits.${key}`] = value;
    }
    update.limitsOverrideEnabled = true;
  }

  return update;
}
