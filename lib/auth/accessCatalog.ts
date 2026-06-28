export const ACCESS_ACTIONS = [
  { value: "view", label: "مشاهده" },
  { value: "create", label: "ساخت" },
  { value: "update", label: "ویرایش" },
  { value: "delete", label: "حذف" },
  { value: "publish", label: "انتشار" },
] as const;

export type AccessActionValue = (typeof ACCESS_ACTIONS)[number]["value"];

export const STATIC_COMPONENT_CATALOG = [
  { key: "admin.dashboard", label: "داشبورد ادمین" },
  { key: "admin.users", label: "کاربران" },
  { key: "admin.agents", label: "نمایندگان" },
  { key: "admin.permissions", label: "Permissionها" },
  { key: "admin.accesses", label: "Accessها" },
  { key: "admin.pages", label: "صفحات" },
  { key: "admin.templates", label: "تمپلیت‌ها" },
  { key: "admin.blocks", label: "بلاک‌ها" },
  { key: "admin.categories", label: "دسته‌بندی‌ها" },
  { key: "admin.files", label: "فایل‌ها" },
  { key: "admin.qrcodes", label: "QR کدها" },
  { key: "admin.products", label: "محصولات" },
  { key: "admin.tickets", label: "تیکت‌ها" },
  { key: "admin.notifications", label: "اعلانات" },
  { key: "builder.page", label: "ساخت صفحه از ادمین" },
  { key: "builder.template", label: "صفحه‌ساز تمپلیت‌ها" },
] as const;
