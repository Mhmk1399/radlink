"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  FaArrowRight,
  FaBan,
  FaCalendarCheck,
  FaCalendarDays,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaEye,
  FaLink,
  FaNoteSticky,
  FaPhone,
  FaUser,
  FaXmark,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useAccess } from "@/hook/auth/useAccess";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import type { ColumnDef } from "@/types/table";

type BookingStatus = "new" | "confirmed" | "cancelled" | "done";

type RefRecord = {
  _id?: string;
  id?: string;
  title?: string;
  url?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
  companyName?: string;
  user?: RefRecord;
};

type BookingCustomField = {
  key?: string;
  label?: string;
  value?: string;
};

type BookingRow = {
  _id: string;
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  selectedDate?: string;
  selectedTime?: string;
  note?: string;
  status: BookingStatus;
  page?: RefRecord | string;
  pageOwner?: RefRecord | string;
  assignedUser?: RefRecord | string | null;
  agent?: RefRecord | string | null;
  customFields: BookingCustomField[];
  pageTitle: string;
  pageUrl: string;
  ownerLabel: string;
  pageOwnerLabel: string;
  assignedUserLabel: string;
  hasAssignedUser: boolean;
  agentLabel: string;
  customFieldsText: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: "new", label: "جدید" },
  { value: "confirmed", label: "تایید شده" },
  { value: "done", label: "انجام شده" },
  { value: "cancelled", label: "لغو شده" },
];

const statusLabel: Record<BookingStatus, string> = Object.fromEntries(
  statusOptions.map((item) => [item.value, item.label]),
) as Record<BookingStatus, string>;

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

function userLabel(value: unknown, fallback = "-") {
  if (!isRecord(value)) return fallback;
  const name = [value.firstName, value.lastName]
    .filter((item) => typeof item === "string" && item.trim())
    .join(" ")
    .trim();

  return (
    name ||
    toText(value.phoneNumber) ||
    toText(value.email) ||
    getId(value) ||
    fallback
  );
}

function pageLabel(value: unknown) {
  if (!isRecord(value)) return { title: "-", url: "" };
  return {
    title: toText(value.title) || toText(value.url) || "-",
    url: toText(value.url),
  };
}

function agentLabel(value: unknown) {
  if (!isRecord(value)) return "-";
  return toText(value.companyName) || userLabel(value.user, userLabel(value));
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

function formatBookingDate(value?: string, time?: string) {
  const cleanTime = time?.trim();
  if (!value) return cleanTime || "-";

  try {
    const date = new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeZone: "Asia/Tehran",
    }).format(new Date(value));
    return cleanTime ? `${date} - ${cleanTime}` : date;
  } catch {
    return cleanTime ? `${value} - ${cleanTime}` : value;
  }
}

function StatusBadge({
  status,
  isDark,
}: {
  status: BookingStatus;
  isDark: boolean;
}) {
  const styles: Record<BookingStatus, string> = {
    new: isDark
      ? "bg-blue-500/10 text-blue-300 ring-blue-500/20"
      : "bg-blue-50 text-blue-700 ring-blue-200",
    confirmed: isDark
      ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200",
    done: isDark
      ? "bg-[#c9a84c]/10 text-[#d4b863] ring-[#c9a84c]/20"
      : "bg-[#f4f4f5] text-[#27272a] ring-[#d4d4d8]",
    cancelled: isDark
      ? "bg-red-500/10 text-red-300 ring-red-500/20"
      : "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1",
        styles[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

type ThemeTokenSet = ReturnType<typeof useThemeTokens>;

function DetailItem({
  icon,
  label,
  value,
  dir,
  t,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  dir?: "rtl" | "ltr";
  t: ThemeTokenSet;
}) {
  return (
    <div className={cn("rounded-2xl border p-3.5", t.borderSubtle, t.inputBg)}>
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("text-sm", t.textDisabled)}>{icon}</span>
        <span className={cn("text-[11px] font-bold", t.textMuted)}>
          {label}
        </span>
      </div>
      <p
        className={cn("break-words text-sm font-bold leading-7", t.textPrimary)}
        dir={dir}
      >
        {value?.trim() || "-"}
      </p>
    </div>
  );
}

function BookingDetailsModal({
  booking,
  isDark,
  t,
  onClose,
}: {
  booking: BookingRow | null;
  isDark: boolean;
  t: ThemeTokenSet;
  onClose: () => void;
}) {
  if (!booking) return null;

  const hasCustomFields = booking.customFields.some(
    (field) => (field.label || field.key || field.value)?.trim(),
  );

  return (
    <div
      className="fixed inset-0 z-[240] flex items-end justify-center bg-black/45 p-0 backdrop-blur-md sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="جزئیات رزرو"
      onMouseDown={onClose}
    >
      <section
        className={cn(
          "max-h-[92dvh] w-full overflow-hidden rounded-t-3xl border shadow-2xl sm:max-w-3xl sm:rounded-3xl",
          t.modalBg,
          t.borderSubtle,
        )}
        onMouseDown={(event) => event.stopPropagation()}
        dir="rtl"
      >
        <header
          className={cn(
            "flex items-start justify-between gap-4 border-b p-4 sm:p-5",
            t.divider,
          )}
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2
                className={cn(
                  "truncate text-base font-extrabold sm:text-lg",
                  t.textPrimary,
                )}
              >
                جزئیات رزرو {booking.fullName || "بدون نام"}
              </h2>
              <StatusBadge status={booking.status} isDark={isDark} />
            </div>
            <p className={cn("text-xs leading-6", t.textMuted)}>
              {booking.pageTitle} {booking.pageUrl ? `- /${booking.pageUrl}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all",
              t.borderSubtle,
              t.hoverBg,
              t.textMuted,
            )}
            aria-label="بستن جزئیات رزرو"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        </header>

        <div className={cn("max-h-[calc(92dvh-86px)] overflow-y-auto p-4 sm:p-5", t.scrollbarWide)}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<FaUser />}
              label="نام مشتری"
              value={booking.fullName}
              t={t}
            />
            <DetailItem
              icon={<FaPhone />}
              label="شماره تماس"
              value={booking.phone}
              dir="ltr"
              t={t}
            />
            <DetailItem
              icon={<FaEnvelope />}
              label="ایمیل"
              value={booking.email}
              dir="ltr"
              t={t}
            />
            <DetailItem
              icon={<FaCalendarDays />}
              label="زمان رزرو"
              value={formatBookingDate(booking.selectedDate, booking.selectedTime)}
              t={t}
            />
            <DetailItem
              icon={<FaLink />}
              label="صفحه"
              value={`${booking.pageTitle}${booking.pageUrl ? ` - /${booking.pageUrl}` : ""}`}
              t={t}
            />
            <DetailItem
              icon={<FaUser />}
              label="صاحب سایت"
              value={booking.ownerLabel}
              t={t}
            />
          </div>

          <div
            className={cn(
              "mt-3 rounded-2xl border p-4",
              t.borderSubtle,
              t.inputBg,
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <FaNoteSticky className={cn("h-4 w-4", t.textDisabled)} />
              <h3 className={cn("text-sm font-extrabold", t.textPrimary)}>
                توضیحات مشتری
              </h3>
            </div>
            <p className={cn("whitespace-pre-wrap text-sm leading-8", t.textSecondary)}>
              {booking.note?.trim() || "توضیحاتی ثبت نشده است."}
            </p>
          </div>

          <div
            className={cn(
              "mt-3 rounded-2xl border p-4",
              t.borderSubtle,
              t.inputBg,
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <FaCalendarCheck className={cn("h-4 w-4", t.textDisabled)} />
              <h3 className={cn("text-sm font-extrabold", t.textPrimary)}>
                فیلدهای اضافه رزرو
              </h3>
            </div>
            {hasCustomFields ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {booking.customFields.map((field, index) => {
                  const label = field.label || field.key || `فیلد ${index + 1}`;
                  return (
                    <div
                      key={`${label}-${index}`}
                      className={cn(
                        "rounded-xl border px-3 py-2.5",
                        t.borderSubtle,
                        isDark ? "bg-white/[0.03]" : "bg-white/70",
                      )}
                    >
                      <p className={cn("text-[11px] font-bold", t.textMuted)}>
                        {label}
                      </p>
                      <p className={cn("mt-1 break-words text-sm font-semibold", t.textPrimary)}>
                        {field.value?.trim() || "-"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={cn("text-sm", t.textMuted)}>
                فیلد اضافه‌ای برای این رزرو ثبت نشده است.
              </p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              icon={<FaClock />}
              label="زمان ثبت درخواست"
              value={formatFaDate(booking.createdAt)}
              t={t}
            />
            <DetailItem
              icon={<FaClock />}
              label="آخرین تغییر"
              value={formatFaDate(booking.updatedAt)}
              t={t}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BookingsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can, isSuperAdmin } = useAccess();
  const [refreshToken, setRefreshToken] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(
    null,
  );

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const canUpdateBooking = isSuperAdmin || can("admin.bookings", "update");
  const canDeleteBooking = isSuperAdmin || can("admin.bookings", "delete");

  const transformResponse = useMemo(
    () =>
      (json: unknown): BookingRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.bookings)
            ? json.bookings
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((item) => {
          const id = String(item._id ?? item.id ?? "");
          const page = pageLabel(item.page);
          const pageRecord = isRecord(item.page) ? item.page : null;
          const effectivePageOwner = item.pageOwner ?? pageRecord?.owner;
          const effectiveAssignedUser =
            item.assignedUser ?? pageRecord?.assignedUser;
          const customFields = Array.isArray(item.customFields)
            ? item.customFields.filter(isRecord).map((field) => ({
                key: toText(field.key),
                label: toText(field.label),
                value: toText(field.value),
              }))
            : [];
          const customFieldsText = customFields
            .map((field) => {
              const label = field.label || field.key;
              return label || field.value ? `${label}: ${field.value}` : "";
            })
            .filter(Boolean)
            .join(" | ");
          const pageOwnerLabel = userLabel(effectivePageOwner);
          const assignedUserLabel = userLabel(effectiveAssignedUser, "");
          const hasAssignedUser = Boolean(assignedUserLabel);

          return {
            ...item,
            _id: id,
            id,
            fullName: String(item.fullName ?? ""),
            phone: String(item.phone ?? ""),
            email: toText(item.email),
            selectedDate: toText(item.selectedDate),
            selectedTime: toText(item.selectedTime),
            note: toText(item.note),
            status:
              item.status === "confirmed" ||
              item.status === "cancelled" ||
              item.status === "done"
                ? item.status
                : "new",
            customFields,
            pageTitle: page.title,
            pageUrl: page.url,
            ownerLabel: assignedUserLabel || pageOwnerLabel,
            pageOwnerLabel,
            assignedUserLabel: assignedUserLabel || "-",
            hasAssignedUser,
            agentLabel: agentLabel(item.agent),
            customFieldsText,
            createdAt: toText(item.createdAt),
            updatedAt: toText(item.updatedAt),
          };
        });
      },
    [],
  );

  async function updateStatus(row: BookingRow, status: BookingStatus) {
    if (updatingId) return;

    try {
      setUpdatingId(row._id);
      const response = await fetch(`/api/bookings/${row._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ status }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در تغییر وضعیت رزرو.");
      }

      toast.success(`وضعیت رزرو به «${statusLabel[status]}» تغییر کرد.`);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت رزرو.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const columns: ColumnDef<BookingRow>[] = useMemo(
    () => [
      {
        key: "fullName",
        label: "مشتری",
        sortable: true,
        filterable: true,
        filterType: "text",
        editable: false,
        render: (_value, row) => (
          <div className="min-w-0">
            <p className={cn("truncate text-sm font-extrabold", t.textPrimary)}>
              {row.fullName || "-"}
            </p>
            <p className={cn("mt-1 truncate text-xs", t.textMuted)} dir="ltr">
              {row.phone || row.email || "-"}
            </p>
          </div>
        ),
      },
      {
        key: "selectedDate",
        label: "زمان رزرو",
        sortable: true,
        editable: false,
        render: (_value, row) => (
          <span className={cn("text-sm font-semibold", t.textSecondary)}>
            {formatBookingDate(row.selectedDate, row.selectedTime)}
          </span>
        ),
      },
      {
        key: "pageTitle",
        label: "صفحه",
        editable: false,
        filterable: true,
        filterType: "text",
        render: (_value, row) => (
          <div className="min-w-0">
            <p className={cn("truncate text-sm font-semibold", t.textPrimary)}>
              {row.pageTitle}
            </p>
            {row.pageUrl && (
              <p
                className={cn("mt-1 truncate text-xs", t.textDisabled)}
                dir="ltr"
              >
                /{row.pageUrl}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "ownerLabel",
        label: "صاحب سایت",
        editable: false,
        hideOnMobile: true,
        render: (_value, row) => (
          <div className="min-w-0">
            <p
              className={cn("truncate text-xs font-semibold", t.textSecondary)}
            >
              {row.ownerLabel}
            </p>
            <p className={cn("mt-1 truncate text-[11px]", t.textDisabled)}>
              {row.hasAssignedUser
                ? `سازنده صفحه: ${row.pageOwnerLabel}`
                : `نماینده: ${row.agentLabel}`}
            </p>
          </div>
        ),
      },
      {
        key: "customFieldsText",
        label: "فیلدهای اضافه",
        editable: false,
        hideOnMobile: true,
        render: (value) => {
          const text = String(value ?? "");
          return (
            <span
              className={cn(
                "block max-w-[260px] truncate text-xs",
                t.textMuted,
              )}
              title={text}
            >
              {text || "-"}
            </span>
          );
        },
      },
      {
        key: "status",
        label: "وضعیت",
        editable: false,
        filterable: true,
        options: statusOptions,
        render: (value) => (
          <StatusBadge status={value as BookingStatus} isDark={isDark} />
        ),
      },
      {
        key: "createdAt",
        label: "ثبت",
        sortable: true,
        dateFilter: true,
        editable: false,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {formatFaDate(String(value ?? ""))}
          </span>
        ),
      },
    ],
    [isDark, t],
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
                  ? "border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-300"
                  : "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-700",
              )}
            >
              <FaCalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                رزروها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                مدیریت درخواست‌های ثبت‌شده از بلاک رزرو وقت
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

      <DynamicTable<BookingRow>
        endpoint="/api/bookings"
        refreshKey={refreshToken}
        updateMethod="PATCH"
        columns={columns}
        title="لیست رزروها"
        subtitle="سوپرادمین همه رزروها را می‌بیند؛ نماینده و کاربر فقط رزروهای محدوده خودشان را می‌بینند."
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[20, 50, 100]}
        searchable
        exportable
        exportFileName="bookings"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete={canDeleteBooking}
        transformResponse={transformResponse}
        serverSide
        rowActions={(row) => (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedBooking(row);
              }}
              title="مشاهده جزئیات رزرو"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                isDark
                  ? "text-sky-300/80 hover:bg-sky-500/10 hover:text-sky-300"
                  : "text-sky-700/80 hover:bg-sky-500/8 hover:text-sky-700",
              )}
            >
              <FaEye className="h-3.5 w-3.5" />
            </button>
            {canUpdateBooking && (
              <>
                {row.status !== "confirmed" && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void updateStatus(row, "confirmed");
                  }}
                  disabled={updatingId === row._id}
                  title="تایید رزرو"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-60",
                    isDark
                      ? "text-emerald-300/80 hover:bg-emerald-500/10 hover:text-emerald-300"
                      : "text-emerald-700/80 hover:bg-emerald-500/8 hover:text-emerald-700",
                  )}
                >
                  <FaCheck className="h-3.5 w-3.5" />
                </button>
                )}
                {row.status !== "done" && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void updateStatus(row, "done");
                  }}
                  disabled={updatingId === row._id}
                  title="انجام شد"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-60",
                    isDark
                      ? "text-[#d4b863]/80 hover:bg-[#c9a84c]/10 hover:text-[#d4b863]"
                      : "text-[#27272a]/80 hover:bg-black/[0.05] hover:text-[#27272a]",
                  )}
                >
                  <FaClock className="h-3.5 w-3.5" />
                </button>
                )}
                {row.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void updateStatus(row, "cancelled");
                  }}
                  disabled={updatingId === row._id}
                  title="لغو رزرو"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-60",
                    isDark
                      ? "text-red-300/70 hover:bg-red-500/10 hover:text-red-300"
                      : "text-red-700/70 hover:bg-red-500/8 hover:text-red-700",
                  )}
                >
                  <FaBan className="h-3.5 w-3.5" />
                </button>
                )}
              </>
            )}
          </>
        )}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("رزرو حذف شد.");
        }}
        emptyMessage="رزروی پیدا نشد."
        pullToRefresh
      />
      <BookingDetailsModal
        booking={selectedBooking}
        isDark={isDark}
        t={t}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
