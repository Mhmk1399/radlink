"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaBell, FaFileLines } from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccess } from "@/hook/auth/useAccess";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import type { ColumnDef } from "@/types/table";

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
  pageId: string;
  pageLabel: string;
  isGlobal: boolean;
  closeable: boolean;
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
  const { can } = useAccess();
  const canCreate = can("admin.notifications", "create");
  const canUpdate = can("admin.notifications", "update");
  const canDelete = can("admin.notifications", "delete");
  const [pageOptions, setPageOptions] = useState<SelectOption[]>([]);

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
    [isDark, pageOptions, t],
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
            description:
              toText(notification.description) ||
              toText(notification.message),
            pageId: getId(page) || getId(notification.page),
            pageLabel: getPageLabel(page),
            isGlobal: Boolean(notification.isGlobal),
            closeable: Boolean(notification.closeable),
            createdAt: toText(notification.createdAt),
          };
        });
      },
    [],
  );

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
        endpoint="/api/notifications?limit=100"
        updateMethod="PATCH"
        columns={columns}
        title="لیست اعلانات صفحات"
        subtitle="پیام‌ها و هشدارهای اختصاصی هر صفحه"
        primaryKey="_id"
        headers={headers}
        pageSize={10}
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
        onCreate={async (item, builtInCreate) => {
          await builtInCreate(item);
          toast.success("اعلان با موفقیت ساخته شد.");
        }}
        onUpdate={async (item, builtInUpdate) => {
          await builtInUpdate(item);
          toast.success("اعلان با موفقیت ویرایش شد.");
        }}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("اعلان حذف شد.");
        }}
        emptyMessage="اعلانی پیدا نشد"
      />
    </div>
  );
}
