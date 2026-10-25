export const DEFAULT_USER_ACCOUNT_BADGE_COLOR = "#2563eb";
export const USER_ACCOUNT_BADGE_LABEL_MAX_LENGTH = 40;

export type UserAccountBadge = {
  enabled: boolean;
  label: string;
  color: string;
};

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function isRadFirstName(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ").toUpperCase() === "R A D";
}

export function normalizeUserAccountBadge(value: unknown): UserAccountBadge {
  const record = toRecord(value);
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const rawColor =
    typeof record.color === "string" ? record.color.trim() : "";

  return {
    enabled: record.enabled === true,
    label: label.slice(0, USER_ACCOUNT_BADGE_LABEL_MAX_LENGTH),
    color: HEX_COLOR_PATTERN.test(rawColor)
      ? rawColor.toLowerCase()
      : DEFAULT_USER_ACCOUNT_BADGE_COLOR,
  };
}

export function validateUserAccountBadge(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "اطلاعات نشان حساب معتبر نیست.";
  }

  const record = value as Record<string, unknown>;
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const color = typeof record.color === "string" ? record.color.trim() : "";

  if (label.length > USER_ACCOUNT_BADGE_LABEL_MAX_LENGTH) {
    return `عنوان نشان نباید بیشتر از ${USER_ACCOUNT_BADGE_LABEL_MAX_LENGTH} کاراکتر باشد.`;
  }

  if (!HEX_COLOR_PATTERN.test(color)) {
    return "رنگ نشان باید با فرمت شش‌رقمی مانند #2563eb وارد شود.";
  }

  return null;
}

export function parseUserAccountBadge(value: unknown): {
  badge?: UserAccountBadge;
  error?: string;
} {
  const error = validateUserAccountBadge(value);
  if (error) return { error };

  return { badge: normalizeUserAccountBadge(value) };
}
