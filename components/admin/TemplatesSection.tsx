"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowRight,
  FaFileCirclePlus,
  FaPalette,
  FaPenToSquare,
  FaPowerOff,
  FaCubes,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import type { ColumnDef } from "@/types/table";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatFaDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("fa-IR");
  } catch {
    return value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type TemplateCategory = {
  _id?: string;
  id?: string;
  name?: string;
};

type TemplateRow = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category?: TemplateCategory | string;
  categoryName?: string;
  builderBlockCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export default function TemplatesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const router = useRouter();
  const { can, canOnResource } = useAccess();
  const canCreateTemplates = can("admin.templates", "create");
  const canUpdateTemplates = can("admin.templates", "update");
  const canDeleteTemplates = can("admin.templates", "delete");
  const canCreatePages = can("admin.pages", "create");
  const [tableKey, setTableKey] = useState(0);
  const [refreshToken, setRefreshToken] = useState(0);
  const [togglingTemplateId, setTogglingTemplateId] = useState<string | null>(
    null,
  );

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  /* ── columns inside component so theme tokens are accessible ── */
  const columns: ColumnDef<TemplateRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام تمپلیت",
        sortable: true,
        editable: false,
        render: (value, row) => (
          <span className="block">
            <span className={cn("block text-sm font-semibold", t.textPrimary)}>
              {String(value ?? "-")}
            </span>
            {row.description && (
              <span
                className={cn(
                  "mt-0.5 block max-w-[18rem] truncate text-xs",
                  t.textDisabled,
                )}
              >
                {row.description}
              </span>
            )}
          </span>
        ),
      },
      {
        key: "categoryName",
        label: "دسته‌بندی",
        editable: false,
        filterable: true,
        render: (value) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              isDark
                ? "bg-violet-500/[0.08] text-violet-400 ring-violet-500/15"
                : "bg-violet-500/[0.06] text-violet-600 ring-violet-500/12",
            )}
          >
            {String(value ?? "بدون دسته")}
          </span>
        ),
      },
      {
        key: "builderBlockCount",
        label: "بلاک‌ها",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className="inline-flex items-center gap-1.5">
            <FaCubes className={cn("h-3 w-3", t.textDisabled)} />
            <span className={cn("font-mono text-sm", t.textMuted)}>
              {String(value ?? 0)}
            </span>
          </span>
        ),
      },
      {
        key: "isActive",
        label: "وضعیت",
        editable: false,
        filterable: true,
        options: [
          { label: "فعال", value: "true" },
          { label: "غیرفعال", value: "false" },
        ],
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
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        editable: false,
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

  const transformResponse = useMemo(
    () =>
      (json: unknown): TemplateRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.templates)
            ? json.templates
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((template) => {
          const id = String(template._id ?? template.id ?? "");
          const category = template.category;
          const categoryName = isRecord(category)
            ? String(category.name ?? "")
            : undefined;

          return {
            ...template,
            _id: id,
            id,
            name: String(template.name ?? ""),
            description:
              typeof template.description === "string"
                ? template.description
                : undefined,
            thumbnail:
              typeof template.thumbnail === "string"
                ? template.thumbnail
                : undefined,
            categoryName: categoryName ?? "بدون دسته",
            builderBlockCount: Array.isArray(template.builderBlocks)
              ? template.builderBlocks.length
              : Array.isArray(template.blocks)
                ? template.blocks.length
                : 0,
            isActive: template.isActive !== false,
          };
        });
      },
    [],
  );

  async function toggleTemplateStatus(row: TemplateRow) {
    const nextStatus = !row.isActive;

    try {
      setTogglingTemplateId(row._id);
      const response = await fetch(`/api/templates/${row._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در تغییر وضعیت تمپلیت");
      }

      toast.success(nextStatus ? "تمپلیت فعال شد" : "تمپلیت غیرفعال شد");
      setTableKey((key) => key + 1);
      setRefreshToken((token) => token + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت تمپلیت",
      );
    } finally {
      setTogglingTemplateId(null);
    }
  }

  /* ── shared button styles ── */
  const primaryBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    isDark
      ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
      : "bg-[#8a7030] text-white hover:bg-[#7a6428]",
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
                  ? "border-violet-500/15 bg-violet-500/[0.08] text-violet-400"
                  : "border-violet-500/20 bg-violet-500/[0.06] text-violet-600",
              )}
            >
              <FaPalette className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت تمپلیت‌ها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                تمپلیت‌ها را با صفحه‌ساز بسازید و به دسته‌بندی‌ها وصل کنید
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canCreateTemplates && (
              <button
                type="button"
                onClick={() => router.push("/builder?mode=template")}
                className={cn(primaryBtn, "h-11 flex-1 sm:flex-none")}
              >
                <FaFileCirclePlus className="h-3.5 w-3.5" />
                <span>ساخت تمپلیت</span>
              </button>
            )}
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
      </div>

      {/* ── Table ── */}
      <DynamicTable<TemplateRow>
        key={tableKey}
        endpoint={`/api/templates?refresh=${refreshToken}`}
        updateMethod="PATCH"
        columns={columns}
        title="لیست تمپلیت‌ها"
        subtitle="مشاهده و مدیریت تمپلیت‌های قابل استفاده در صفحه‌ساز"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[10, 20, 50]}
        searchable
        exportable
        exportFileName="templates"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete={canDeleteTemplates}
        transformResponse={transformResponse}
        serverSide
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("تمپلیت غیرفعال شد");
        }}
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {(canUpdateTemplates ||
              canOnResource("templates", row._id, "update")) && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleTemplateStatus(row);
                  }}
                  disabled={togglingTemplateId === row._id}
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
                      togglingTemplateId === row._id && "animate-pulse",
                    )}
                    aria-hidden="true"
                  />
                  <span className="sr-only">
                    {row.isActive ? "غیرفعال کردن" : "فعال کردن"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/builder?mode=template&templateId=${row._id}`);
                  }}
                  title="ویرایش تمپلیت"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    isDark
                      ? "text-violet-400/70 hover:bg-violet-500/10 hover:text-violet-400"
                      : "text-violet-600/70 hover:bg-violet-500/8 hover:text-violet-600",
                  )}
                >
                  <FaPenToSquare className="h-3.5 w-3.5" />
                  <span className="sr-only">ویرایش تمپلیت</span>
                </button>
              </>
            )}

            {canCreatePages && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/builder?templateId=${row._id}`);
                }}
                title="ساخت صفحه از تمپلیت"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                  isDark
                    ? "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                    : "text-emerald-600/70 hover:bg-emerald-500/8 hover:text-emerald-600",
                )}
              >
                <FaFileCirclePlus className="h-3.5 w-3.5" />
                <span className="sr-only">ساخت صفحه از تمپلیت</span>
              </button>
            )}
          </div>
        )}
        emptyMessage="تمپلیتی یافت نشد"
      />
    </div>
  );
}
