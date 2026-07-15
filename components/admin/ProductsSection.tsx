"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
import { deleteFile, uploadFile } from "@/lib/fileUtils";

type ProductRow = {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ownerId: string;
  pageId: string;
  ownerLabel: string;
  pageLabel: string;
  source: "manual" | "builder";
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type SelectOption = {
  label: string;
  value: string;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getId(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const id = value._id ?? value.id;
  return typeof id === "string" ? id : "";
}

function getRefLabel(value: unknown, kind: "owner" | "page") {
  if (!isRecord(value)) return "";
  if (kind === "owner") {
    const name = [value.firstName, value.lastName]
      .filter((part) => typeof part === "string" && part.trim())
      .join(" ")
      .trim();
    return name || toText(value.phoneNumber) || toText(value.email) || getId(value);
  }
  return toText(value.title) || toText(value.url) || getId(value);
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeImage(value: unknown) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return typeof candidate === "string" ? candidate.trim() : "";
}

function normalizeProduct(value: unknown): ProductRow | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  if (!id) return null;

  const image = normalizeImage(value.image || value.images);
  const ownerId = getId(value.owner);
  const pageId = getId(value.page);

  return {
    ...value,
    _id: id,
    id,
    name: toText(value.name) || "بدون نام",
    description: toText(value.description),
    price: Number(value.price) || 0,
    image,
    ownerId,
    pageId,
    ownerLabel: getRefLabel(value.owner, "owner") || "-",
    pageLabel: getRefLabel(value.page, "page") || "-",
    source: value.source === "builder" ? "builder" : "manual",
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
    image: normalizeImage(item.image),
  };

  delete payload.images;
  delete payload.imageFiles;
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

function ProductImageUploadField({
  value,
  originalValue,
  onChange,
}: {
  value: unknown;
  originalValue?: unknown;
  onChange: (value: unknown) => void;
}) {
  const t = useThemeTokens();
  const image = normalizeImage(value);
  const originalImage = normalizeImage(originalValue);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویر قابل آپلود است.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
      return;
    }

    try {
      setIsUploading(true);
      const previousImage = image;
      const uploaded = await uploadFile(file);
      onChange(uploaded.url);
      if (previousImage && previousImage !== originalImage) {
        deleteFile({ url: previousImage }).catch(() => {
          console.warn("Temporary product image cleanup failed.");
        });
      }
      toast.success("تصویر محصول آپلود شد.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "آپلود تصویر انجام نشد.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function removeImage() {
    if (!image || isDeleting) return;
    try {
      setIsDeleting(true);
      if (image !== originalImage) {
        await deleteFile({ url: image });
      }
      onChange("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "حذف تصویر انجام نشد.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      {image && (
        <div
          className={cn(
            "relative aspect-video overflow-hidden rounded-xl border",
            t.borderSubtle,
            t.inputBg,
          )}
        >
          <Image
            src={image}
            alt="تصویر محصول"
            fill
            unoptimized
            sizes="480px"
            className="object-contain p-2"
          />
          <button
            type="button"
            disabled={isUploading || isDeleting}
            onClick={() => void removeImage()}
            className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/65 text-sm font-black text-white transition hover:bg-red-600 disabled:opacity-50"
            title="حذف تصویر"
          >
            ×
          </button>
        </div>
      )}

      <label
        className={cn(
          "flex min-h-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition",
          t.borderInput,
          t.inputBg,
          isUploading ? "pointer-events-none opacity-60" : t.hoverBg,
        )}
      >
        <span className={cn("text-xs font-bold", t.textMuted)}>
          {isUploading
            ? "در حال آپلود تصویر..."
            : image
              ? "جایگزینی تصویر محصول"
              : "انتخاب تصویر محصول"}
        </span>
        <input
          type="file"
          accept="image/*"
          disabled={isUploading || isDeleting}
          className="hidden"
          onChange={(event) => {
            void uploadImage(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

export default function ProductsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can, user } = useAccess();
  const canUpdateProducts = can("admin.products", "update");
  const canDeleteProducts = can("admin.products", "delete");
  const canViewProducts = can("admin.products", "view");
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const openPreviewImage = useCallback((src: string, title: string) => {
    setPreviewImage({ src, title });
  }, []);
  const closePreviewImage = useCallback(() => setPreviewImage(null), []);
  const [ownerOptions, setOwnerOptions] = useState<SelectOption[]>([]);
  const [pageOptions, setPageOptions] = useState<SelectOption[]>([
    { label: "محصولات دستی", value: "__manual__" },
  ]);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  useEffect(() => {
    if (!headers || !user) return;
    const currentUser = user;
    const controller = new AbortController();

    async function loadPagedOptions(
      endpoint: string,
      arrayKey: "users" | "pages",
      toOption: (item: Record<string, unknown>) => SelectOption | null,
    ) {
      const options = new Map<string, SelectOption>();
      let page = 1;
      let total = 0;

      do {
        const response = await fetch(
          `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page}&limit=100`,
          { headers, signal: controller.signal },
        );
        if (!response.ok) break;
        const json = await response.json();
        const items = Array.isArray(json?.[arrayKey]) ? json[arrayKey] : [];
        items.forEach((item: unknown) => {
          if (!isRecord(item)) return;
          const option = toOption(item);
          if (option) options.set(option.value, option);
        });
        total = Number(json?.total ?? items.length);
        page += 1;
      } while (options.size < total && page <= 100);

      return Array.from(options.values());
    }

    async function loadFilters() {
      try {
        const pagesPromise = loadPagedOptions(
          "/api/pages",
          "pages",
          (page) => {
            const value = getId(page);
            if (!value) return null;
            return {
              value,
              label: toText(page.title) || toText(page.url) || value,
            };
          },
        );

        const usersPromise =
          currentUser.role === "admin" || currentUser.role === "superAdmin"
            ? loadPagedOptions("/api/users", "users", (optionUser) => {
                const value = getId(optionUser);
                if (!value) return null;
                return {
                  value,
                  label: getRefLabel(optionUser, "owner") || value,
                };
              })
            : Promise.resolve(
                [
                  {
                    value: String(currentUser.id ?? ""),
                    label:
                      [currentUser.firstName, currentUser.lastName]
                        .filter(Boolean)
                        .join(" ") ||
                      currentUser.phoneNumber ||
                      "کاربر فعلی",
                  },
                ].filter((option) => option.value),
              );

        const [users, pages] = await Promise.all([usersPromise, pagesPromise]);
        if (controller.signal.aborted) return;
        setOwnerOptions(users);
        setPageOptions([
          { label: "محصولات دستی", value: "__manual__" },
          ...pages,
        ]);
      } catch (error) {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        console.error("Failed to load product filter options", error);
      }
    }

    void loadFilters();
    return () => controller.abort();
  }, [headers, user]);

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
                {row.image
                  ? "دارای تصویر"
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
        key: "ownerId",
        label: "مالک محصول",
        editable: false,
        sortable: true,
        filterable: true,
        filterSearchable: true,
        options: ownerOptions,
        hideOnMobile: true,
        render: (_, row) => (
          <span className={cn("text-sm font-medium", t.textMuted)}>
            {row.ownerLabel}
          </span>
        ),
      },
      {
        key: "pageId",
        label: "صفحه",
        editable: false,
        sortable: true,
        filterable: true,
        filterSearchable: true,
        options: pageOptions,
        hideOnMobile: true,
        render: (_, row) => (
          <span className={cn("text-sm", t.textMuted)}>
            {row.source === "builder" ? row.pageLabel : "محصول دستی"}
          </span>
        ),
      },
      {
        key: "image",
        label: "تصویر",
        inputType: "textarea",
        renderFormField: ({ value, originalValue, onChange }) => (
          <ProductImageUploadField
            value={value}
            originalValue={originalValue}
            onChange={onChange}
          />
        ),
        hideOnMobile: true,
        render: (value) => {
          const image = normalizeImage(value);
          return (
            <span className="flex items-center gap-1.5">
              {image ? (
                <button
                  type="button"
                  aria-label="پیش‌نمایش تصویر محصول"
                  onClick={(event) => {
                    event.stopPropagation();
                    openPreviewImage(image, "تصویر محصول");
                  }}
                  className={cn(
                    "h-10 w-10 shrink-0 rounded-lg border bg-cover bg-center bg-no-repeat",
                    t.borderSubtle,
                  )}
                  style={{ backgroundImage: `url("${image}")` }}
                />
              ) : (
                <span className={cn("inline-flex items-center gap-1.5 text-xs", t.textDisabled)}>
                  <FaImage className="h-3 w-3" />
                  بدون تصویر
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
    [openPreviewImage, ownerOptions, pageOptions, t],
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

  async function cleanupDiscardedProductImage(
    item: Partial<ProductRow>,
    original: ProductRow | null,
  ) {
    const pendingImage = normalizeImage(item.image);
    const originalImage = normalizeImage(original?.image);
    if (!pendingImage || pendingImage === originalImage) return;

    try {
      await deleteFile({ url: pendingImage });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "حذف تصویر انجام نشد.",
      );
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
                ویرایش و مدیریت محصولات و تصاویر آن‌ها
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
        onFormDiscard={cleanupDiscardedProductImage}
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
        canCreate={false}
        canUpdate={canUpdateProducts}
        canDelete={canDeleteProducts}
        transformResponse={transformResponse}
        serverSide
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
          row.image && canViewProducts ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                window.open(row.image, "_blank", "noopener,noreferrer");
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
      <ImagePreviewModal
        open={Boolean(previewImage)}
        src={previewImage?.src ?? ""}
        alt={previewImage?.title}
        title={previewImage?.title}
        onClose={closePreviewImage}
      />
    </div>
  );
}
