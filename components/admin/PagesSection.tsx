"use client";

import { useMemo } from "react";
import { FaArrowRight, FaGlobe } from "react-icons/fa6";
import type { ColumnDef } from "@/types/table";
import type { Page } from "@/types/index";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import DynamicTable from "@/components/global/DynamicTable";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { FaFileAlt } from "react-icons/fa";
import { toast } from "../ui/CustomToast";

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

type AdminPageRow = Page & {
  isPublished?: boolean;
};

const columns: ColumnDef<AdminPageRow>[] = [
  {
    key: "title",
    label: "عنوان صفحه",
    sortable: true,
    render: (value) => (
      <span className="font-semibold">{String(value ?? "—")}</span>
    ),
  },
  {
    key: "url",
    label: "آدرس",
    sortable: true,
    copyable: true,
    render: (value) => (
      <span className="text-sm text-slate-400">{String(value ?? "—")}</span>
    ),
  },
  {
    key: "description",
    label: "توضیحات",
    render: (value) => (
      <span className="truncate block max-w-[18rem] text-sm text-slate-500">
        {String(value ?? "—")}
      </span>
    ),
  },
  {
    key: "ownerId",
    label: "سازنده",
    render: (_, row) => {
      const ownerName =
        row.owner?.fullName ||
        [row.owner?.firstName, row.owner?.lastName].filter(Boolean).join(" ") ||
        row.owner?.email;

      return (
        <span className="text-sm text-slate-500">
          {String(ownerName ?? row.ownerId ?? "—")}
        </span>
      );
    },
  },
  {
    key: "createdAt",
    label: "تاریخ ایجاد",
    sortable: true,
    render: (value) => <span>{formatFaDate(String(value ?? ""))}</span>,
  },
];

export default function PagesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();

  const transformResponse = useMemo(
    () => (json: unknown) => {
      const pages =
        typeof json === "object" &&
        json !== null &&
        "pages" in json &&
        Array.isArray((json as any).pages)
          ? (json as any).pages
          : Array.isArray(json)
            ? json
            : [];

      return pages.map((page: any) => {
        const pageId = String(page._id ?? page.id ?? "");

        return {
          ...page,
          _id: pageId,
          id: pageId,
        };
      }) as AdminPageRow[];
    },
    [],
  );

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold",
              t.cardBg,
              t.textPrimary,
            )}
          >
            <FaFileAlt className="h-4 w-4" />
            صفحات
          </div>
          <h1 className={cn("mt-3 text-3xl font-bold", t.textPrimary)}>
            مدیریت صفحات سایت
          </h1>
          <p className={cn("mt-2 text-sm text-slate-500", t.textMuted)}>
            اینجا تمام صفحات ثبت شده در سایت نمایش داده می‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
            `border ${t.borderAccent}`,
            t.textAccent,
            t.hoverBg,
          )}
        >
          <FaArrowRight className="h-4 w-4" />
          بازگشت به داشبورد
        </button>
      </div>

      <DynamicTable<AdminPageRow>
        endpoint="/api/pages"
        updateMethod="PATCH"
        onUpdate={async (item, builtInUpdate) => {
          console.log("UPDATE ITEM:", item);
          console.log("ITEM ID:", item.id);
          console.log("ITEM _ID:", item._id);

          await builtInUpdate(item);
          toast.success("تغییر اعمال شد");
        }}
        columns={columns}
        title="لیست صفحات"
        subtitle="مشاهده، جستجو و مرور تمامی صفحات"
        primaryKey="_id"
        headers={headers}
        pageSize={10}
        pageSizes={[10, 20, 50]}
        searchable
        searchDebounceMs={300}
        exportable
        exportFileName="pages"
        stickyHeader
        showRowNumbers
        enableCellCopy
        transformResponse={transformResponse}
        rowActions={(row) => {
          const href = row.url
            ? String(row.url).startsWith("http")
              ? String(row.url)
              : `/${String(row.url).replace(/^\/+/, "")}`
            : "";
          return href ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                window.open(href, "_blank");
              }}
              title="مشاهده صفحه"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100"
            >
              <FaGlobe className="h-4 w-4" />
            </button>
          ) : null;
        }}
        emptyMessage="صفحه‌ای یافت نشد"
      />
    </div>
  );
}
