"use client";

import { useMemo } from "react";
import { FaArrowRight, FaLayerGroup, FaPalette } from "react-icons/fa6";
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

type TemplateSummary = {
  _id?: string;
  id?: string;
  name?: string;
  thumbnail?: string;
};

type CategoryRow = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  templates: TemplateSummary[];
  templateIds: string[];
  templateCount: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export default function CategoriesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const canCreate = can("admin.categories", "create");
  const canUpdate = can("admin.categories", "update");
  const canDelete = can("admin.categories", "delete");

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  /* ── columns inside component so theme tokens are accessible ── */
  const columns: ColumnDef<CategoryRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام دسته‌بندی",
        required: true,
        sortable: true,
        placeholder: "مثلاً خدمات پزشکی",
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
        key: "description",
        label: "توضیحات",
        inputType: "textarea",
        placeholder: "توضیح کوتاه برای دسته‌بندی",
        /* hidden from table view — shown as subtitle in name cell */
        hideOnMobile: true,
        render: (value) => (
          <span
            className={cn("block max-w-[18rem] truncate text-sm", t.textMuted)}
          >
            {String(value ?? "-")}
          </span>
        ),
      },
      {
        key: "templateCount",
        label: "تعداد تمپلیت",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className="inline-flex items-center gap-1.5">
            <FaPalette
              className={cn(
                "h-3 w-3",
                isDark ? "text-sky-400/60" : "text-sky-600/60",
              )}
            />
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                isDark
                  ? "bg-sky-500/[0.08] text-sky-400 ring-sky-500/15"
                  : "bg-sky-500/[0.06] text-sky-600 ring-sky-500/12",
              )}
            >
              {String(value ?? 0)}
            </span>
          </span>
        ),
      },
      {
        key: "templates",
        label: "تمپلیت‌ها",
        editable: false,
        sortable: false,
        copyable: false,
        hideOnMobile: true,
        render: (_, row) => {
          if (!row.templates.length) {
            return <span className={cn("text-xs", t.textDisabled)}>-</span>;
          }
          return (
            <span className="flex max-w-[22rem] flex-wrap gap-1">
              {row.templates.slice(0, 4).map((template) => (
                <span
                  key={String(template._id ?? template.id ?? template.name)}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    t.borderSubtle,
                    t.inputBg,
                    t.textMuted,
                  )}
                >
                  {template.name ?? "بدون نام"}
                </span>
              ))}
              {row.templates.length > 4 && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                    t.inputBg,
                    t.textDisabled,
                  )}
                >
                  +{row.templates.length - 4}
                </span>
              )}
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
      (json: unknown): CategoryRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.categories)
            ? json.categories
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((category) => {
          const id = String(category._id ?? category.id ?? "");
          const templates = Array.isArray(category.templates)
            ? category.templates
            : [];

          return {
            ...category,
            _id: id,
            id,
            name: String(category.name ?? ""),
            description:
              typeof category.description === "string"
                ? category.description
                : undefined,
            templates: templates.filter(isRecord) as TemplateSummary[],
            templateIds: templates.map((template) =>
              isRecord(template)
                ? String(template._id ?? template.id ?? "")
                : String(template),
            ),
            templateCount:
              typeof category.templateCount === "number"
                ? category.templateCount
                : templates.length,
          };
        });
      },
    [],
  );

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      {/* ── Page header card ── */}
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
              <FaLayerGroup className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت دسته‌بندی‌ها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                دسته‌بندی‌ها برای گروه‌بندی تمپلیت‌ها استفاده می‌شوند
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
      <DynamicTable<CategoryRow>
        endpoint="/api/categories"
        updateMethod="PATCH"
        columns={columns}
        title="لیست دسته‌بندی‌ها"
        subtitle="ایجاد، مشاهده و ویرایش دسته‌بندی‌های تمپلیت"
        primaryKey="_id"
        headers={headers}
        pageSize={10}
        pageSizes={[10, 20, 50]}
        searchable
        exportable
        exportFileName="categories"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        transformResponse={transformResponse}
        onCreate={async (item, builtInCreate) => {
          await builtInCreate(item);
          toast.success("دسته‌بندی ایجاد شد");
        }}
        onUpdate={async (item, builtInUpdate) => {
          await builtInUpdate(item);
          toast.success("دسته‌بندی ویرایش شد");
        }}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("دسته‌بندی حذف شد");
        }}
        emptyMessage="دسته‌بندی‌ای یافت نشد"
      />
    </div>
  );
}
