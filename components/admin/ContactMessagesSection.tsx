"use client";

import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
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

type ContactMessageStatus = "new" | "read" | "replied";

type ContactMessageRow = {
  _id: string;
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  subject?: string;
  message: string;
  status: ContactMessageStatus;
  createdAt?: string;
  [key: string]: unknown;
};

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

const STATUS_LABEL: Record<ContactMessageStatus, string> = {
  new: "جدید",
  read: "خوانده‌شده",
  replied: "پاسخ داده‌شده",
};

function StatusBadge({
  status,
  isDark,
}: {
  status: ContactMessageStatus;
  isDark: boolean;
}) {
  const styles: Record<ContactMessageStatus, string> = {
    new: isDark
      ? "bg-blue-500/10 text-blue-400 ring-blue-500/20"
      : "bg-blue-50 text-blue-700 ring-blue-200",
    read: isDark
      ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
      : "bg-amber-50 text-amber-700 ring-amber-200",
    replied: isDark
      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1",
        styles[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function ContactMessagesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [refreshToken, setRefreshToken] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  const transformResponse = useMemo(
    () =>
      (json: unknown): ContactMessageRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.contactMessages)
            ? json.contactMessages
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((item) => {
          const id = String(item._id ?? item.id ?? "");
          return {
            ...item,
            _id: id,
            id,
            name: String(item.name ?? ""),
            email: typeof item.email === "string" ? item.email : "",
            phoneNumber:
              typeof item.phoneNumber === "string" ? item.phoneNumber : "",
            subject: typeof item.subject === "string" ? item.subject : "",
            message: String(item.message ?? ""),
            status:
              item.status === "read" || item.status === "replied"
                ? item.status
                : "new",
            createdAt:
              typeof item.createdAt === "string" ? item.createdAt : undefined,
          };
        });
      },
    [],
  );

  async function updateStatus(
    row: ContactMessageRow,
    status: ContactMessageStatus,
  ) {
    if (updatingId) return;
    try {
      setUpdatingId(row._id);
      const response = await fetch(`/api/contact/${row._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ status }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در تغییر وضعیت پیام.");
      }
      toast.success(`وضعیت پیام به «${STATUS_LABEL[status]}» تغییر کرد.`);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت پیام.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const columns: ColumnDef<ContactMessageRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام",
        editable: false,
        sortable: true,
        filterable: true,
        filterType: "text",
        render: (value) => (
          <span className={cn("text-sm font-semibold", t.textPrimary)}>
            {String(value ?? "-")}
          </span>
        ),
      },
      {
        key: "email",
        label: "ایمیل / شماره تماس",
        editable: false,
        render: (_value, row) => (
          <span className={cn("text-xs", t.textSecondary)} dir="ltr">
            {row.email || row.phoneNumber || "-"}
          </span>
        ),
      },
      {
        key: "subject",
        label: "موضوع",
        editable: false,
        hideOnMobile: true,
        filterable: true,
        filterType: "text",
        render: (value) => (
          <span className={cn("text-sm", t.textMuted)}>
            {String(value ?? "") || "-"}
          </span>
        ),
      },
      {
        key: "message",
        label: "پیام",
        editable: false,
        render: (value) => {
          const text = String(value ?? "");
          const truncated =
            text.length > 60 ? `${text.slice(0, 60)}…` : text || "-";
          return (
            <span
              className={cn("block max-w-xs text-sm", t.textMuted)}
              title={text}
            >
              {truncated}
            </span>
          );
        },
      },
      {
        key: "status",
        label: "وضعیت",
        editable: false,
        filterable: true,
        options: [
          { label: "جدید", value: "new" },
          { label: "خوانده‌شده", value: "read" },
          { label: "پاسخ داده‌شده", value: "replied" },
        ],
        render: (value) => (
          <StatusBadge status={value as ContactMessageStatus} isDark={isDark} />
        ),
      },
      {
        key: "createdAt",
        label: "تاریخ",
        editable: false,
        sortable: true,
        dateFilter: true,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {formatFaDate(String(value ?? ""))}
          </span>
        ),
      },
    ],
    [t, isDark],
  );

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      {/* ── Page header ── */}
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
                  ? "border-sky-500/15 bg-sky-500/[0.08] text-sky-400"
                  : "border-sky-500/20 bg-sky-500/[0.06] text-sky-600",
              )}
            >
              <FaEnvelope className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                پیام‌های تماس
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                پیام‌های ارسال‌شده از فرم تماس با ما
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

      {/* ── Table ── */}
      <DynamicTable<ContactMessageRow>
        endpoint="/api/contact"
        refreshKey={refreshToken}
        updateMethod="PATCH"
        columns={columns}
        title="لیست پیام‌ها"
        subtitle="مشاهده و مدیریت پیام‌های ارسالی از صفحه تماس با ما"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[20, 50, 100]}
        searchable
        exportable
        exportFileName="contact-messages"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("پیام حذف شد.");
        }}
        transformResponse={transformResponse}
        serverSide
        rowActions={(row) => (
          <>
            {row.status !== "read" && row.status !== "replied" && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void updateStatus(row, "read");
                }}
                disabled={updatingId === row._id}
                title="علامت به عنوان خوانده‌شده"
                aria-label="علامت به عنوان خوانده‌شده"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                  isDark
                    ? "text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-400"
                    : "text-amber-600/70 hover:bg-amber-500/8 hover:text-amber-600",
                )}
              >
                <FaEnvelopeOpen className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
            {row.status !== "replied" && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void updateStatus(row, "replied");
                }}
                disabled={updatingId === row._id}
                title="علامت به عنوان پاسخ داده‌شده"
                aria-label="علامت به عنوان پاسخ داده‌شده"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                  isDark
                    ? "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                    : "text-emerald-600/70 hover:bg-emerald-500/8 hover:text-emerald-600",
                )}
              >
                {updatingId === row._id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <FaReply className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            )}
            {row.status === "replied" && (
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                  isDark ? "text-emerald-400/50" : "text-emerald-600/50",
                )}
                title="پاسخ داده‌شده"
              >
                <FaCheck className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            )}
          </>
        )}
        emptyMessage="پیامی یافت نشد."
      />
    </div>
  );
}
