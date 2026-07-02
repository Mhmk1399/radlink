export function parsePageExpiration(
  value: unknown,
): { value: Date | null; error: string | null } {
  if (value === undefined || value === null || value === "") {
    return { value: null, error: null };
  }

  if (typeof value !== "string" && !(value instanceof Date)) {
    return { value: null, error: "تاریخ انقضای صفحه معتبر نیست." };
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { value: null, error: "تاریخ انقضای صفحه معتبر نیست." };
  }

  return { value: date, error: null };
}

export function isPageExpired(
  expiresAt: unknown,
  now: Date | number = Date.now(),
): boolean {
  if (!expiresAt) return false;
  const expiration = expiresAt instanceof Date ? expiresAt : new Date(String(expiresAt));
  if (Number.isNaN(expiration.getTime())) return false;
  const nowTime = now instanceof Date ? now.getTime() : now;
  return expiration.getTime() <= nowTime;
}
