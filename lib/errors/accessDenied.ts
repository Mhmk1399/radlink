type AccessDeniedLike = {
  status?: number;
  code?: string;
  body?: string;
  message?: string;
};

const ACCESS_DENIED_CODE_PATTERN = /ACCESS_DENIED/i;
const ACCESS_DENIED_TEXT_PATTERNS = [
  /ACCESS_DENIED/i,
  /BUILDER_BLOCK_ACCESS_DENIED/i,
  /Forbidden/i,
  /دسترسی\s+غیرمجاز/,
  /دسترسی[\s\S]*ندارید/,
  /دسترسی[\s\S]*مجاز\s+نیست/,
  /اجازه\s+دسترسی[\s\S]*ندارید/,
];

function getRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseJsonRecord(value: string | undefined): Record<string, unknown> | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return getRecord(parsed);
  } catch {
    return null;
  }
}

function hasAccessDeniedText(value: string | undefined): boolean {
  if (!value) return false;
  return ACCESS_DENIED_TEXT_PATTERNS.some((pattern) => pattern.test(value));
}

export function isAccessDeniedError(value: unknown): boolean {
  const record = getRecord(value);

  if (!record) {
    return typeof value === "string" && hasAccessDeniedText(value);
  }

  const error = record as AccessDeniedLike;
  if (error.status === 403) return true;
  if (typeof error.code === "string" && ACCESS_DENIED_CODE_PATTERN.test(error.code)) {
    return true;
  }
  if (hasAccessDeniedText(error.message)) return true;

  const bodyRecord = parseJsonRecord(error.body);
  if (!bodyRecord) return false;

  const body = bodyRecord as AccessDeniedLike;
  return (
    body.status === 403 ||
    (typeof body.code === "string" && ACCESS_DENIED_CODE_PATTERN.test(body.code)) ||
    hasAccessDeniedText(body.message)
  );
}
