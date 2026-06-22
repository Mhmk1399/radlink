"use client";

import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaDownload,
  FaEye,
  FaPowerOff,
  FaQrcode,
} from "react-icons/fa6";
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
  const name = [value.firstName, value.lastName]
    .filter((item) => typeof item === "string" && item.trim())
    .join(" ")
    .trim();
  return name || toText(value.phoneNumber) || getId(value);
}

function getPageLabel(value: unknown) {
  if (!isRecord(value)) return "";
  return toText(value.title) || toText(value.url) || getId(value);
}

function openDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

type QRCodeRow = {
  _id: string;
  id: string;
  pageId: string;
  pageLabel: string;
  ownerId: string;
  ownerLabel: string;
  targetUrl: string;
  imageurl?: string;
  shortcode: string;
  isActive: boolean;
  [key: string]: unknown;
};

export default function QRCodesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const canUpdate = can("admin.qrcodes", "update");
  const canDelete = can("admin.qrcodes", "delete");
  const [tableKey, setTableKey] = useState(0);
  const [refreshToken, setRefreshToken] = useState(0);
  const [togglingQrId, setTogglingQrId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  const columns: ColumnDef<QRCodeRow>[] = useMemo(
    () => [
      {
        key: "imageurl",
        label: "QR",
        editable: false,
        render: (value, row) =>
          typeof value === "string" && value ? (
            <span className="inline-flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1",
                  t.borderSubtle,
                  isDark ? "bg-white" : "bg-white",
                )}
              >
                <img
                  src={value}
                  alt={`QR ${row.shortcode}`}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className={cn("font-mono text-xs", t.textDisabled)}>
                {row.shortcode}
              </span>
            </span>
          ) : (
            <span className={cn("text-xs", t.textDisabled)}>بدون تصویر</span>
          ),
      },
      {
        key: "pageLabel",
        label: "صفحه",
        editable: false,
        sortable: true,
        render: (value, row) => (
          <span className="block">
            <span className={cn("block text-sm font-semibold", t.textPrimary)}>
              {String(value || "-")}
            </span>
            <span
              className={cn(
                "mt-0.5 block font-mono text-[11px]",
                t.textDisabled,
              )}
            >
              {row.pageId.slice(-10)}
            </span>
          </span>
        ),
      },
      {
        key: "ownerLabel",
        label: "سازنده",
        editable: false,
        sortable: true,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-sm", t.textMuted)}>
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "targetUrl",
        label: "آدرس مقصد",
        inputType: "url",
        sortable: true,
        copyable: true,
        hideOnMobile: true,
        render: (value) => (
          <span
            className={cn(
              "block max-w-[20rem] truncate font-mono text-xs",
              t.textMuted,
            )}
            dir="ltr"
          >
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "shortcode",
        label: "کد کوتاه",
        editable: false,
        copyable: true,
        sortable: true,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("font-mono text-sm", t.textMuted)}>
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "وضعیت",
        inputType: "checkbox",
        filterable: true,
        render: (value) => {
          const active = !!value;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                active
                  ? "bg-emerald-500/[0.08] text-emerald-400 ring-emerald-500/15"
                  : isDark
                    ? "bg-[#6e6a62]/10 text-[#9c9890] ring-[#6e6a62]/15"
                    : "bg-black/[0.04] text-[#6B5D3E] ring-black/[0.06]",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  active
                    ? "bg-emerald-400"
                    : isDark
                      ? "bg-[#9c9890]"
                      : "bg-[#A09070]",
                )}
              />
              {active ? "فعال" : "غیرفعال"}
            </span>
          );
        },
      },
    ],
    [t, isDark],
  );

  const transformResponse = useMemo(
    () =>
      (json: unknown): QRCodeRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.qrs)
            ? json.qrs
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((qr) => {
          const id = getId(qr);
          const page = qr.page;
          const owner = qr.owner;

          return {
            ...qr,
            _id: id,
            id,
            pageId: getId(page) || getId(qr.page),
            pageLabel: getPageLabel(page) || getId(qr.page) || "-",
            ownerId: getId(owner) || getId(qr.owner),
            ownerLabel: getUserLabel(owner) || getId(qr.owner) || "-",
            targetUrl: toText(qr.targetUrl),
            imageurl: toText(qr.imageurl),
            shortcode: toText(qr.shortcode),
            isActive: qr.isActive !== false,
          };
        });
      },
    [],
  );

  async function toggleQrStatus(row: QRCodeRow) {
    const nextStatus = !row.isActive;

    try {
      setTogglingQrId(row._id);
      const response = await fetch(`/api/qr/${row._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در تغییر وضعیت QR کد");
      }

      toast.success(nextStatus ? "QR کد فعال شد" : "QR کد غیرفعال شد");
      setTableKey((key) => key + 1);
      setRefreshToken((token) => token + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت QR کد",
      );
    } finally {
      setTogglingQrId(null);
    }
  }

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
                  ? "border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-400"
                  : "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600",
              )}
            >
              <FaQrcode className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت QR کدها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                مشاهده، ویرایش مقصد و کنترل وضعیت QR کدها
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
      <DynamicTable<QRCodeRow>
        key={tableKey}
        endpoint={`/api/qr?refresh=${refreshToken}`}
        updateMethod="PATCH"
        columns={columns}
        title="لیست QR کدها"
        subtitle="QR کدهای ساخته‌شده برای صفحات"
        primaryKey="_id"
        headers={headers}
        pageSize={10}
        pageSizes={[10, 20, 50]}
        searchable
        exportable
        exportFileName="qrcodes"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={canUpdate}
        canDelete={canDelete}
        transformResponse={transformResponse}
        onUpdate={async (item, builtInUpdate) => {
          await builtInUpdate(item);
          toast.success("QR کد ویرایش شد");
        }}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("QR کد حذف شد");
        }}
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {canUpdate && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void toggleQrStatus(row);
                }}
                disabled={togglingQrId === row._id}
                title={row.isActive ? "غیرفعال کردن" : "فعال کردن"}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                  row.isActive
                    ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                    : "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400",
                )}
              >
                <FaPowerOff
                  className={cn(
                    "h-3.5 w-3.5",
                    togglingQrId === row._id && "animate-pulse",
                  )}
                />
                <span className="sr-only">
                  {row.isActive ? "غیرفعال" : "فعال"}
                </span>
              </button>
            )}
            {row.targetUrl && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  window.open(row.targetUrl, "_blank", "noopener,noreferrer");
                }}
                title="مشاهده مقصد"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                  isDark
                    ? "text-blue-400/70 hover:bg-blue-500/10 hover:text-blue-400"
                    : "text-blue-600/70 hover:bg-blue-500/8 hover:text-blue-600",
                )}
              >
                <FaEye className="h-3.5 w-3.5" />
                <span className="sr-only">مشاهده مقصد</span>
              </button>
            )}
            {row.imageurl && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openDownload(
                    row.imageurl!,
                    `qr-${row.shortcode || row._id}.png`,
                  );
                }}
                title="دانلود QR"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                  isDark
                    ? "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                    : "text-emerald-600/70 hover:bg-emerald-500/8 hover:text-emerald-600",
                )}
              >
                <FaDownload className="h-3.5 w-3.5" />
                <span className="sr-only">دانلود QR</span>
              </button>
            )}
          </div>
        )}
        emptyMessage="QR کدی یافت نشد"
      />
    </div>
  );
}
