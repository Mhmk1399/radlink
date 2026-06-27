"use client";

import { useMemo } from "react";
import {
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaBoxOpen,
  FaImage,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useTheme } from "@/contexts/ThemeContext";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import type { ColumnDef } from "@/types/table";

type ProductRow = {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  imagesText: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getId(value: unknown) {
  if (!isRecord(value)) return "";
  const id = value._id ?? value.id;
  return typeof id === "string" ? id : "";
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .filter((image): image is string => typeof image === "string")
      .map((image) => image.trim())
      .filter(Boolean),
  )];
}

function parseImageText(value: unknown) {
  if (typeof value !== "string") return [];
  return [...new Set(
    value
      .split(/[\n,]+/)
      .map((image) => image.trim())
      .filter(Boolean),
  )];
}

function normalizeProduct(value: unknown): ProductRow | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  if (!id) return null;

  const images = normalizeImages(value.images);

  return {
    ...value,
    _id: id,
    id,
    name: toText(value.name) || "بدون نام",
    description: toText(value.description),
    price: Number(value.price) || 0,
    images,
    imagesText: images.join("\n"),
    createdAt: toText(value.createdAt) || undefined,
    updatedAt: toText(value.updatedAt) || undefined,
  };
}

function buildProductPayload(
  item: Partial<ProductRow> & Record<string, unknown>,
) {
  const payload: Partial<ProductRow> & Record<string, unknown> = {
    ...item,
    name: typeof item.name === "string" ? item.name.trim() : "",
    description:
      typeof item.description === "string" ? item.description.trim() : "",
    price: Math.max(0, Number(item.price) || 0),
    images: parseImageText(item.imagesText),
  };

  delete payload.imagesText;
  return payload;
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

export default function ProductsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const canCreateProducts = can("admin.products", "create");
  const canUpdateProducts = can("admin.products", "update");
  const canDeleteProducts = can("admin.products", "delete");
  const canViewProducts = can("admin.products", "view");

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  const columns: ColumnDef<ProductRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام محصول",
        required: true,
        sortable: true,
        copyable: true,
        placeholder: "نام محصول",
        render: (value, row) => (
          <span className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
                t.borderSubtle,
                t.inputBg,
                isDark ? "text-violet-400" : "text-violet-600",
              )}
            >
              {row.images[0] ? (
                <span
                  role="img"
                  aria-label={row.name}
                  className="h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${row.images[0]}")` }}
                />
              ) : (
                <FaBoxOpen className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block max-w-[18rem] truncate text-sm font-semibold",
                  t.textPrimary,
                )}
              >
                {String(value || "بدون نام")}
              </span>
              <span className={cn("mt-0.5 block text-xs", t.textDisabled)}>
                {row.images.length
                  ? `${row.images.length.toLocaleString("fa-IR")} تصویر`
                  : "بدون تصویر"}
              </span>
            </span>
          </span>
        ),
      },
      {
        key: "description",
        label: "توضیحات",
        inputType: "textarea",
        placeholder: "توضیحات محصول",
        hideOnMobile: true,
        render: (value) => (
          <span
            className={cn(
              "block max-w-[20rem] truncate text-sm",
              t.textMuted,
            )}
          >
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "price",
        label: "قیمت",
        inputType: "number",
        required: true,
        sortable: true,
        placeholder: "0",
        render: (value) => (
          <span className={cn("font-mono text-sm font-semibold", t.textMuted)}>
            {Number(value ?? 0).toLocaleString("fa-IR")}
          </span>
        ),
      },
      {
        key: "imagesText",
        label: "آدرس تصاویر",
        inputType: "textarea",
        visible: false,
        placeholder: "هر آدرس تصویر را در یک خط وارد کنید",
      },
      {
        key: "images",
        label: "تصاویر",
        editable: false,
        hideOnMobile: true,
        render: (value) => {
          const images = normalizeImages(value);
          return (
            <span className="flex max-w-[14rem] items-center gap-1.5">
              {images.length ? (
                images.slice(0, 3).map((image, index) => (
                  <span
                    key={`${image}-${index}`}
                    role="img"
                    aria-label={`تصویر ${index + 1}`}
                    className={cn(
                      "h-9 w-9 shrink-0 rounded-lg border bg-cover bg-center bg-no-repeat",
                      t.borderSubtle,
                    )}
                    style={{ backgroundImage: `url("${image}")` }}
                  />
                ))
              ) : (
                <span className={cn("inline-flex items-center gap-1.5 text-xs", t.textDisabled)}>
                  <FaImage className="h-3 w-3" />
                  بدون تصویر
                </span>
              )}
              {images.length > 3 && (
                <span className={cn("text-xs font-semibold", t.textDisabled)}>
                  +{(images.length - 3).toLocaleString("fa-IR")}
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
        sortable: true,
        dateFilter: true,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {formatFaDate(typeof value === "string" ? value : undefined)}
          </span>
        ),
      },
    ],
    [isDark, t],
  );

  const transformResponse = useMemo(
    () =>
      (json: unknown): ProductRow[] => {
        const raw =
          isRecord(json) && Array.isArray(json.products)
            ? json.products
            : Array.isArray(json)
              ? json
              : [];

        return raw
          .map(normalizeProduct)
          .filter((product): product is ProductRow => Boolean(product));
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
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                isDark
                  ? "border-violet-500/15 bg-violet-500/[0.08] text-violet-400"
                  : "border-violet-500/20 bg-violet-500/[0.06] text-violet-600",
              )}
            >
              <FaBoxOpen className="h-5 w-5" />
            </span>
            <span>
              <span
                className={cn(
                  "block text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت محصولات
              </span>
              <span className={cn("mt-0.5 block text-xs sm:text-sm", t.textMuted)}>
                ایجاد، ویرایش و مدیریت محصولات و تصاویر آن‌ها
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("dashboard")}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors",
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

      <DynamicTable<ProductRow>
        endpoint="/api/products?limit=100"
        updateMethod="PATCH"
        columns={columns}
        title="لیست محصولات"
        subtitle="محصولات ثبت‌شده و اطلاعات قیمت و تصاویر"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[10, 20, 50, 100]}
        searchable
        exportable
        exportFileName="products"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={canCreateProducts}
        canUpdate={canUpdateProducts}
        canDelete={canDeleteProducts}
        transformResponse={transformResponse}
        onCreate={async (item, builtInCreate) => {
          await builtInCreate(
            buildProductPayload(
              item as Partial<ProductRow> & Record<string, unknown>,
            ),
          );
          toast.success("محصول ایجاد شد.");
        }}
        onUpdate={async (item, builtInUpdate) => {
          await builtInUpdate(buildProductPayload(item) as ProductRow);
          toast.success("محصول ویرایش شد.");
        }}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("محصول حذف شد.");
        }}
        rowActions={(row) =>
          row.images[0] && canViewProducts ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                window.open(row.images[0], "_blank", "noopener,noreferrer");
              }}
              title="مشاهده تصویر اصلی"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                isDark
                  ? "text-violet-400/75 hover:bg-violet-500/10 hover:text-violet-400"
                  : "text-violet-600/75 hover:bg-violet-500/10 hover:text-violet-600",
              )}
            >
              <FaArrowUpRightFromSquare className="h-3.5 w-3.5" />
              <span className="sr-only">مشاهده تصویر اصلی</span>
            </button>
          ) : null
        }
        emptyMessage="محصولی یافت نشد."
      />
    </div>
  );
}
