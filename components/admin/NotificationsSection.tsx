"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaBell, FaGlobe, FaUser } from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useAccess } from "@/hook/auth/useAccess";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
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

function getUserLabel(value: unknown) {
  if (!isRecord(value)) return "";
  const fullName = [value.firstName, value.lastName]
    .filter((item) => typeof item === "string" && item.trim())
    .join(" ")
    .trim();
  return (
    fullName ||
    toText(value.phoneNumber) ||
    toText(value.email) ||
    getId(value)
  );
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
  message: string;
  userId: string;
  userLabel: string;
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
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);

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
    async function loadUsers() {
      try {
        const response = await fetch(
          "/api/users?mode=notification-options&limit=100",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const json = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(json?.message ?? "دریافت کاربران با خطا مواجه شد.");
        }

        const users = isRecord(json) && Array.isArray(json.users) ? json.users : [];
        const options = users.filter(isRecord).map((user) => {
          const id = getId(user);
          return {
            value: id,
            label: getUserLabel(user) || id,
          };
        }).filter((option) => option.value);

        if (!ignore) setUserOptions(options);
      } catch (error) {
        if (!ignore) {
          setUserOptions([]);
          toast.error(
            error instanceof Error
              ? error.message
              : "دریافت کاربران با خطا مواجه شد.",
          );
        }
      }
    }

    void loadUsers();
    return () => {
      ignore = true;
    };
  }, [canCreate, canUpdate, token]);

  const columns: ColumnDef<NotificationRow>[] = useMemo(
    () => [
      {
        key: "message",
        label: "متن اعلان",
        inputType: "textarea",
        required: true,
        sortable: true,
        placeholder: "متن اعلان را وارد کنید",
        render: (value, row) => (
          <span className="block">
            <span className={cn("block text-sm font-semibold", t.textPrimary)}>
              {String(value || "-")}
            </span>
            <span className={cn("mt-1 flex items-center gap-1.5 text-xs", t.textDisabled)}>
              {row.isGlobal ? (
                <>
                  <FaGlobe className="h-3 w-3" />
                  عمومی
                </>
              ) : (
                <>
                  <FaUser className="h-3 w-3" />
                  اختصاصی
                </>
              )}
            </span>
          </span>
        ),
      },
      {
        key: "userLabel",
        label: "کاربر مقصد",
        editable: false,
        sortable: true,
        render: (value, row) => (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              row.isGlobal
                ? isDark
                  ? "bg-sky-500/[0.08] text-sky-400 ring-sky-500/15"
                  : "bg-sky-500/[0.06] text-sky-600 ring-sky-500/12"
                : isDark
                  ? "bg-[#c8a84b]/[0.08] text-[#d2b660] ring-[#c8a84b]/15"
                  : "bg-[#8a7030]/[0.06] text-[#7a6428] ring-[#8a7030]/12",
            )}
          >
            {row.isGlobal ? <FaGlobe className="h-3 w-3" /> : <FaUser className="h-3 w-3" />}
            {row.isGlobal ? "همه کاربران" : String(value || "-")}
          </span>
        ),
      },
      {
        key: "userId",
        label: "انتخاب کاربر",
        visible: false,
        options: userOptions,
        placeholder: "برای اعلان اختصاصی کاربر را انتخاب کنید",
      },
      {
        key: "isGlobal",
        label: "اعلان عمومی",
        inputType: "checkbox",
        filterable: true,
        options: [
          { label: "عمومی", value: "true" },
          { label: "اختصاصی", value: "false" },
        ],
        placeholder: "ارسال برای همه کاربران",
        render: (value) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              value
                ? "bg-emerald-500/[0.08] text-emerald-400 ring-emerald-500/15"
                : isDark
                  ? "bg-white/[0.04] text-[#9c9890] ring-white/10"
                  : "bg-black/[0.04] text-[#6a655c] ring-black/[0.06]",
            )}
          >
            {value ? "عمومی" : "اختصاصی"}
          </span>
        ),
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
    [isDark, t, userOptions],
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
          const user = notification.User;
          const isGlobal = Boolean(notification.isGlobal);

          return {
            ...notification,
            _id: id,
            id,
            message: toText(notification.message),
            userId: getId(user) || getId(notification.User),
            userLabel: getUserLabel(user) || getId(notification.User) || "-",
            isGlobal,
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
                مدیریت اعلانات
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                ساخت، مشاهده، ویرایش و حذف اعلان‌های عمومی یا اختصاصی کاربران
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
            <span className="hidden sm:inline">بازگشت به داشبورد</span>
            <span className="sm:hidden">بازگشت</span>
          </button>
        </div>
      </div>

      <DynamicTable<NotificationRow>
        endpoint="/api/notifications?limit=100"
        updateMethod="PATCH"
        columns={columns}
        title="لیست اعلانات"
        subtitle="اعلان‌های عمومی و اختصاصی ثبت شده در سیستم"
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
