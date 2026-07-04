"use client";

import { useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import {
  FaArrowRight,
  FaBell,
  FaFileLines,
  FaPowerOff,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { NotificationIcon } from "@/components/notifications/NotificationIcon";
import { toast } from "@/components/ui/CustomToast";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccess } from "@/hook/auth/useAccess";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import type { ColumnDef } from "@/types/table";
import {
  NOTIFICATION_ICON_OPTIONS,
  resolveNotificationIconKey,
} from "@/lib/notifications/notificationIcons";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getId(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const id = value._id ?? value.id;
  return typeof id === "string" ? id : "";
}

function getPageLabel(value: unknown) {
  if (!isRecord(value)) return "";
  const title = toText(value.title);
  const url = toText(value.url);
  return title && url ? `${title} (/${url})` : title || url || getId(value);
}

function formatFaDate(value?: string) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Tehran",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

type SelectOption = { label: string; value: string };

type NotificationRow = {
  _id: string;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: "info" | "danger";
  iconKey: string;
  pageId: string;
  pageLabel: string;
  isGlobal: boolean;
  closeable: boolean;
  isActive: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

export default function NotificationsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { mutate: mutateCache } = useSWRConfig();
  const { can, user } = useAccess();
  const canCreate = can("admin.notifications", "create");
  const canUpdate = can("admin.notifications", "update");
  const canDelete = can("admin.notifications", "delete");
  const [pageOptions, setPageOptions] = useState<SelectOption[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  useEffect(() => {
    if (!token || (!canCreate && !canUpdate)) return;

    let ignore = false;

    async function loadPages() {
      try {
        const response = await fetch(
          "/api/pages?mode=notification-options&limit=100",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            json?.message ?? "دریافت صفحات با خطا مواجه شد.",
          );
        }

        const pages =
          isRecord(json) && Array.isArray(json.pages) ? json.pages : [];
        const options = pages
          .filter(isRecord)
          .map((page) => ({
            value: getId(page),
            label: getPageLabel(page),
          }))
          .filter((option) => option.value);

        if (!ignore) setPageOptions(options);
      } catch (error) {
        if (!ignore) {
          setPageOptions([]);
          toast.error(
            error instanceof Error
              ? error.message
              : "دریافت صفحات با خطا مواجه شد.",
          );
        }
      }
    }

    void loadPages();
    return () => {
      ignore = true;
    };
  }, [canCreate, canUpdate, token]);

  const columns: ColumnDef<NotificationRow>[] = useMemo(
    () => [
      {
        key: "title",
        label: "عنوان",
        required: true,
        sortable: true,
        placeholder: "برای مثال: پایان اشتراک صفحه",
        render: (value) => (
          <span className={cn("text-sm font-bold", t.textPrimary)}>
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "subtitle",
        label: "زیرعنوان",
        placeholder: "یک توضیح کوتاه بالای متن اصلی",
        render: (value) => (
          <span className={cn("text-sm", t.textSecondary)}>
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "description",
        label: "توضیحات",
        inputType: "textarea",
        required: true,
        placeholder: "متن کامل اعلان را وارد کنید",
        render: (value) => (
          <span className={cn("block max-w-md text-sm", t.textMuted)}>
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "type",
        label: "نوع اعلان",
        required: true,
        defaultValue: "info",
        filterable: true,
        options: [
          { label: "اطلاعاتی", value: "info" },
          { label: "خطر", value: "danger" },
        ],
        placeholder: "نوع اعلان را انتخاب کنید",
        render: (value) => (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1",
              value === "danger"
                ? isDark
                  ? "bg-red-500/10 text-red-400 ring-red-500/20"
                  : "bg-red-50 text-red-700 ring-red-200"
                : isDark
                  ? "bg-blue-500/10 text-blue-400 ring-blue-500/20"
                  : "bg-blue-50 text-blue-700 ring-blue-200",
            )}
          >
            {value === "danger" ? "خطر" : "اطلاعاتی"}
          </span>
        ),
      },
      {
        key: "iconKey",
        label: "آیکن اعلان",
        defaultValue: "",
        render: (value, row) => {
          const selectedKey = resolveNotificationIconKey(value, row.type);
          const label =
            NOTIFICATION_ICON_OPTIONS.find(
              (option) => option.key === selectedKey,
            )?.label ?? "پیش‌فرض";

          return (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold",
                row.type === "danger"
                  ? isDark
                    ? "bg-red-500/10 text-red-400"
                    : "bg-red-50 text-red-700"
                  : isDark
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-50 text-blue-700",
              )}
            >
              <NotificationIcon
                iconKey={String(value ?? "")}
                type={row.type}
                className="h-4 w-4"
              />
              {label}
            </span>
          );
        },
        renderFormField: ({ value, onChange, formData }) => {
          const selected = typeof value === "string" ? value : "";
          const notificationType =
            formData.type === "danger" ? "danger" : "info";

          return (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onChange("")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition",
                  selected === ""
                    ? isDark
                      ? "border-blue-400/40 bg-blue-500/10 text-blue-300"
                      : "border-blue-300 bg-blue-50 text-blue-800"
                    : cn(t.borderSubtle, t.inputBg, t.textMuted),
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-current/10">
                  <NotificationIcon
                    type={notificationType}
                    className="h-4 w-4"
                  />
                </span>
                <span>
                  <span className="block text-xs font-bold">انتخاب خودکار</span>
                  <span className="mt-0.5 block text-[10px] opacity-70">
                    متناسب با نوع اطلاعاتی یا خطر
                  </span>
                </span>
              </button>

              <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto pe-1 sm:grid-cols-5">
                {NOTIFICATION_ICON_OPTIONS.map((option) => {
                  const active = selected === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => onChange(option.key)}
                      title={option.label}
                      aria-label={`انتخاب آیکن ${option.label}`}
                      aria-pressed={active}
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-center transition",
                        active
                          ? isDark
                            ? "border-sky-400/50 bg-sky-500/15 text-sky-300"
                            : "border-sky-300 bg-sky-50 text-sky-800"
                          : cn(
                              t.borderSubtle,
                              t.inputBg,
                              t.textMuted,
                              t.hoverBg,
                            ),
                      )}
                    >
                      <NotificationIcon
                        iconKey={option.key}
                        type={notificationType}
                        className="h-5 w-5"
                      />
                      <span className="line-clamp-1 text-[9px] font-semibold">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        },
      },
      {
        key: "isGlobal",
        label: "اعلان عمومی",
        inputType: "checkbox",
        defaultValue: false,
        filterable: true,
        options: [
          { label: "عمومی", value: "true" },
          { label: "مخصوص یک صفحه", value: "false" },
        ],
        placeholder: "نمایش این اعلان در تمام صفحات",
        hiddenInForm: () => user?.role === "agent",
        render: (value) => (
          <span className={cn("text-sm font-semibold", value ? t.textAccent : t.textMuted)}>
            {value ? "تمام صفحات" : "یک صفحه"}
          </span>
        ),
      },
      {
        key: "pageLabel",
        label: "صفحه مقصد",
        editable: false,
        sortable: true,
        render: (value, row) => (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              isDark
                ? "bg-sky-500/[0.08] text-sky-400 ring-sky-500/15"
                : "bg-sky-500/[0.06] text-sky-700 ring-sky-500/15",
            )}
          >
            <FaFileLines className="h-3 w-3" />
            {row.isGlobal
              ? "تمام صفحات"
              : String(value || "رکورد قدیمی بدون صفحه")}
          </span>
        ),
      },
      {
        key: "pageId",
        label: "انتخاب صفحه",
        visible: false,
        required: true,
        options: pageOptions,
        placeholder: "صفحه‌ای که اعلان باید روی آن نمایش داده شود",
        hiddenInForm: (formData) => Boolean(formData.isGlobal),
      },
      {
        key: "closeable",
        label: "قابل بستن",
        inputType: "checkbox",
        filterable: true,
        options: [
          { label: "بله", value: "true" },
          { label: "خیر", value: "false" },
        ],
        placeholder: "کاربر بتواند اعلان را ببندد",
        render: (value) => (
          <span className={cn("text-sm", value ? t.textAccent : t.textMuted)}>
            {value ? "بله" : "خیر"}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "وضعیت",
        inputType: "checkbox",
        defaultValue: true,
        filterable: true,
        options: [
          { label: "فعال", value: "true" },
          { label: "غیرفعال", value: "false" },
        ],
        placeholder: "نمایش اعلان برای کاربران",
        render: (value) => (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1",
              value
                ? isDark
                  ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                  : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : isDark
                  ? "bg-red-500/10 text-red-400 ring-red-500/20"
                  : "bg-red-50 text-red-700 ring-red-200",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                value ? "bg-emerald-500" : "bg-red-500",
              )}
            />
            {value ? "فعال" : "غیرفعال"}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        editable: false,
        sortable: true,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {formatFaDate(String(value ?? ""))}
          </span>
        ),
      },
    ],
    [isDark, pageOptions, t, user?.role],
  );

  const transformResponse = useMemo(
    () =>
      (json: unknown): NotificationRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.notifications)
            ? json.notifications
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((notification) => {
          const id = getId(notification);
          const page = notification.page;

          return {
            ...notification,
            _id: id,
            id,
            title: toText(notification.title) || "اعلان",
            subtitle: toText(notification.subtitle),
            description: toText(notification.description),
            type: notification.type === "danger" ? "danger" : "info",
            iconKey: toText(notification.iconKey),
            pageId: getId(page) || getId(notification.page),
            pageLabel: getPageLabel(page),
            isGlobal: Boolean(notification.isGlobal),
            closeable: Boolean(notification.closeable),
            isActive: notification.isActive !== false,
            createdAt: toText(notification.createdAt),
          };
        });
      },
    [],
  );

  async function refreshNotificationCaches() {
    await Promise.all([
      mutateCache("/api/notifications?limit=10"),
      mutateCache(
        (key) =>
          Array.isArray(key) && key[0] === "/api/admin/dashboard",
        undefined,
        { revalidate: true },
      ),
    ]);
  }

  async function toggleNotificationStatus(row: NotificationRow) {
    if (!row._id || togglingId) return;

    try {
      setTogglingId(row._id);
      const response = await fetch(`/api/notifications/${row._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ isActive: !row.isActive }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof json?.message === "string"
            ? json.message
            : "تغییر وضعیت اعلان انجام نشد.",
        );
      }

      toast.success(
        row.isActive ? "اعلان غیرفعال شد." : "اعلان فعال شد.",
      );
      setRefreshToken((value) => value + 1);
      await refreshNotificationCaches();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تغییر وضعیت اعلان انجام نشد.",
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-6",
          t.borderSubtle,
          t.modalBg,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                isDark
                  ? "border-amber-500/15 bg-amber-500/[0.08] text-amber-400"
                  : "border-amber-500/20 bg-amber-500/[0.06] text-amber-700",
              )}
            >
              <FaBell className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn("text-lg font-extrabold sm:text-xl", t.textPrimary)}>
                مدیریت اعلانات صفحات
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                هر اعلان فقط روی صفحه انتخاب‌شده نمایش داده می‌شود.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("dashboard")}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200",
              t.borderAccent,
              t.textAccent,
              t.hoverBg,
            )}
          >
            <FaArrowRight className="h-3.5 w-3.5" />
            بازگشت به داشبورد
          </button>
        </div>
      </div>

      <DynamicTable<NotificationRow>
        endpoint={`/api/notifications?limit=100&includeInactive=true&refresh=${refreshToken}`}
        updateMethod="PATCH"
        columns={columns}
        title="لیست اعلانات صفحات"
        subtitle="پیام‌ها و هشدارهای اختصاصی هر صفحه"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[10, 20, 50]}
        searchable
        exportable
        exportFileName="notifications"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        transformResponse={transformResponse}
        serverSide
        rowActions={(row) =>
          canUpdate ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void toggleNotificationStatus(row);
              }}
              disabled={togglingId === row._id}
              title={row.isActive ? "غیرفعال کردن اعلان" : "فعال کردن اعلان"}
              aria-label={
                row.isActive ? "غیرفعال کردن اعلان" : "فعال کردن اعلان"
              }
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50",
                row.isActive
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-emerald-500 hover:bg-emerald-500/10",
              )}
            >
              {togglingId === row._id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <FaPowerOff className="h-4 w-4" />
              )}
            </button>
          ) : null
        }
        onCreate={async (item, builtInCreate) => {
          await builtInCreate(item);
          await refreshNotificationCaches();
          toast.success("اعلان با موفقیت ساخته شد.");
        }}
        onUpdate={async (item, builtInUpdate) => {
          await builtInUpdate(item);
          await refreshNotificationCaches();
          toast.success("اعلان با موفقیت ویرایش شد.");
        }}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          await refreshNotificationCaches();
          toast.success("اعلان حذف شد.");
        }}
        emptyMessage="اعلانی پیدا نشد"
      />
    </div>
  );
}
