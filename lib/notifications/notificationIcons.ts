export const NOTIFICATION_ICON_OPTIONS = [
  { key: "info", label: "اطلاعات" },
  { key: "warning", label: "هشدار" },
  { key: "success", label: "موفقیت" },
  { key: "error", label: "خطا" },
  { key: "bell", label: "زنگ اعلان" },
  { key: "megaphone", label: "اطلاع‌رسانی" },
  { key: "message", label: "پیام" },
  { key: "calendar", label: "تقویم" },
  { key: "clock", label: "زمان" },
  { key: "gift", label: "هدیه" },
  { key: "star", label: "ویژه" },
  { key: "heart", label: "علاقه‌مندی" },
  { key: "shield", label: "امنیت" },
  { key: "lock", label: "قفل" },
  { key: "tools", label: "نگهداری" },
  { key: "user", label: "کاربر" },
  { key: "payment", label: "پرداخت" },
  { key: "document", label: "سند" },
  { key: "globe", label: "عمومی" },
  { key: "bolt", label: "فوری" },
] as const;

export type NotificationIconKey =
  (typeof NOTIFICATION_ICON_OPTIONS)[number]["key"];

export const NOTIFICATION_ICON_KEYS = NOTIFICATION_ICON_OPTIONS.map(
  (option) => option.key,
);

export function isNotificationIconKey(
  value: unknown,
): value is NotificationIconKey {
  return (
    typeof value === "string" &&
    NOTIFICATION_ICON_KEYS.includes(value as NotificationIconKey)
  );
}

export function resolveNotificationIconKey(
  iconKey: unknown,
  type: "info" | "danger",
): NotificationIconKey {
  if (isNotificationIconKey(iconKey)) return iconKey;
  return type === "danger" ? "warning" : "info";
}
