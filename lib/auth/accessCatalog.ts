export const ACCESS_ACTIONS = [
  { value: "view", label: "مشاهده" },
  { value: "create", label: "ساخت" },
  { value: "update", label: "ویرایش" },
  { value: "delete", label: "حذف" },
  { value: "publish", label: "انتشار" },
] as const;

export type AccessActionValue = (typeof ACCESS_ACTIONS)[number]["value"];

export const COMMON_ACCESS_ACTIONS = ACCESS_ACTIONS.filter(
  (action) => action.value !== "publish",
);

export const VIEW_ONLY_ACCESS_ACTIONS = ACCESS_ACTIONS.filter(
  (action) => action.value === "view",
);

export const PAGE_ACCESS_ACTIONS = ACCESS_ACTIONS;

export const BLOCK_ACCESS_ACTIONS = ACCESS_ACTIONS.filter(
  (action) => action.value !== "delete",
);

export function getAccessActionsForComponent(componentName: string) {
  if (componentName === "admin.dashboard") return VIEW_ONLY_ACCESS_ACTIONS;
  if (componentName === "admin.pages") return PAGE_ACCESS_ACTIONS;
  if (componentName === "admin.blocks") return BLOCK_ACCESS_ACTIONS;

  return COMMON_ACCESS_ACTIONS;
}

export function getAccessActionsForResource(
  resource: "templates" | "blocks" | "pages",
) {
  if (resource === "pages") return PAGE_ACCESS_ACTIONS;
  if (resource === "blocks") return BLOCK_ACCESS_ACTIONS;

  return COMMON_ACCESS_ACTIONS;
}

export const STATIC_COMPONENT_CATALOG = [
  { key: "admin.dashboard", label: "داشبورد ادمین" },
  { key: "admin.users", label: "کاربران" },
  { key: "admin.agents", label: "نمایندگان" },
  { key: "admin.permissions", label: "Permissionها" },
  { key: "admin.accesses", label: "Accessها" },
  { key: "admin.pages", label: "صفحات" },
  { key: "admin.templates", label: "قالب‌ها" },
  { key: "admin.blocks", label: "بلاک‌ها" },
  { key: "admin.categories", label: "دسته‌بندی‌ها" },
  { key: "admin.files", label: "فایل‌ها" },
  { key: "admin.qrcodes", label: "QR کدها" },
  { key: "admin.products", label: "محصولات" },
  { key: "admin.tickets", label: "تیکت‌ها" },
  { key: "admin.bookings", label: "رزروها" },
  { key: "admin.notifications", label: "اعلانات" },
  { key: "builder.page", label: "ساخت صفحه از ادمین" },
  { key: "builder.template", label: "صفحه‌ساز قالب‌ها" },
  { key: "landing.floatingActions", label: "دکمه شناور لندینگ" },
] as const;
