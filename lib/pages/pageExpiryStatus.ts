export const PAGE_EXPIRY_DAY_MS = 24 * 60 * 60 * 1000;

export type PageExpirySeverity =
  | "none"
  | "safe"
  | "warning"
  | "critical"
  | "expired";

export type PageExpiryStatus = {
  severity: PageExpirySeverity;
  daysRemaining: number | null;
  expiresAt: Date | null;
};

export function getPageExpiryStatus(
  value: unknown,
  now: Date | number = Date.now(),
): PageExpiryStatus {
  if (!value) {
    return { severity: "none", daysRemaining: null, expiresAt: null };
  }

  const expiresAt = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(expiresAt.getTime())) {
    return { severity: "none", daysRemaining: null, expiresAt: null };
  }

  const nowTime = now instanceof Date ? now.getTime() : now;
  const remainingMs = expiresAt.getTime() - nowTime;

  if (remainingMs <= 0) {
    return { severity: "expired", daysRemaining: 0, expiresAt };
  }

  const daysRemaining = Math.ceil(remainingMs / PAGE_EXPIRY_DAY_MS);
  const severity =
    daysRemaining <= 3
      ? "critical"
      : daysRemaining <= 10
        ? "warning"
        : "safe";

  return { severity, daysRemaining, expiresAt };
}

export function isPageExpiryDanger(value: unknown, now?: Date | number) {
  const severity = getPageExpiryStatus(value, now).severity;
  return (
    severity === "expired" ||
    severity === "critical" ||
    severity === "warning"
  );
}
