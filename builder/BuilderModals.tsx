// builder/components/BuilderModals.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineCloudArrowUp,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaTrash } from "react-icons/fa";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { slugify } from "@/helper/builder.helpers";

type CatalogBlock = {
  type: string;
  label: string;
  description?: string;
  icon: ReactNode;
};

/* ================================================================== */
/*  Clear All Confirm Modal                                            */
/* ================================================================== */

export function ClearAllConfirmModal({
  open,
  blocksCount,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  blocksCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-[380px] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_32px_100px_-20px_rgba(0,0,0,0.4)]">
        <div className="p-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
            <FaTrash size={22} className="text-red-500" />
          </div>
          <h2 className="text-center text-[16px] font-black text-neutral-900">
            حذف همه بلاک‌ها؟
          </h2>
          <p className="mt-2 text-center text-[13px] leading-6 text-neutral-500">
            همه{" "}
            <span className="font-bold text-neutral-700">{blocksCount}</span>{" "}
            بلاک حذف می‌شوند.
            <br />
            این عملیات قابل بازگشت نیست.
          </p>
        </div>
        <div className="flex gap-3 bg-neutral-50/80 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-[13px] font-bold text-neutral-600 transition-all hover:bg-neutral-100 active:scale-[0.97]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-500 px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 active:scale-[0.97]"
          >
            حذف همه
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ================================================================== */
/*  Block Catalog Modal                                                */
/* ================================================================== */

export function BlockCatalogModal({
  open,
  onClose,
  onAdd,
  availableBlocks,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
  availableBlocks?: CatalogBlock[];
}) {
  const available = useMemo(
    () => availableBlocks ?? Object.values(blockRegistry),
    [availableBlocks],
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return available;
    const q = searchQuery.toLowerCase();
    return available.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q),
    );
  }, [available, searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      return;
    }
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center p-0 sm:items-center sm:p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-h-[85vh] animate-in slide-in-from-bottom-6 duration-300 overflow-hidden rounded-t-[28px] border border-neutral-200/60 bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] sm:max-w-lg sm:max-h-[600px] sm:rounded-[28px] sm:zoom-in-95 sm:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)]">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 pt-4 sm:pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-black text-neutral-900">
                افزودن بلاک
              </h2>
              <p className="mt-1 text-[12px] text-neutral-400">
                {filtered.length} بلاک موجود
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-600"
            >
              <HiOutlineXMark size={18} />
            </button>
          </div>

          <div className="mt-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی بلاک..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-[calc(85vh-180px)] overflow-y-auto px-4 pb-6 sm:max-h-[380px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-3 text-3xl">🔍</span>
              <p className="text-[14px] font-semibold text-neutral-500">
                بلاکی پیدا نشد
              </p>
              <p className="mt-1 text-[12px] text-neutral-400">
                عبارت دیگه‌ای جستجو کن
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filtered.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    onAdd(item.type);
                    onClose();
                  }}
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 text-right transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center text-blue-500 justify-center rounded-2xl bg-neutral-100 text-xl transition-all duration-200 group-hover:scale-110 group-hover:bg-emerald-100">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-neutral-800 group-hover:text-emerald-700">
                      {item.label}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[12px] leading-5 text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                  <HiOutlinePlus
                    size={18}
                    className="shrink-0 text-neutral-300 transition group-hover:text-emerald-500"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ================================================================== */
/*  Page Meta Modal                                                    */
/* ================================================================== */

export function PageMetaModal({
  open,
  mode = "page",
  title,
  description,
  url,
  pageId,
  categoryId,
  categoryOptions = [],
  thumbnail,
  onTitleChange,
  onDescriptionChange,
  onUrlChange,
  onCategoryIdChange,
  onThumbnailChange,
  onClose,
  onSave,
  isSaving,
  saveError,
}: {
  open: boolean;
  mode?: "page" | "template";
  title: string;
  description: string;
  url: string;
  pageId: string | null;
  categoryId?: string;
  categoryOptions?: Array<{ value: string; label: string }>;
  thumbnail?: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onCategoryIdChange?: (v: string) => void;
  onThumbnailChange?: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveError: string | null;
}) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<
    string | null
  >(null);

  const handleThumbnailFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setThumbnailUploadError("فقط فایل تصویر قابل آپلود است.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setThumbnailUploadError("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
        return;
      }

      try {
        setIsThumbnailUploading(true);
        setThumbnailUploadError(null);

        const token = localStorage.getItem("auth_token");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploads", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });
        const json = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            json?.message ?? json?.error ?? "آپلود تصویر با خطا مواجه شد.",
          );
        }

        const uploadedUrl =
          typeof json?.url === "string"
            ? json.url
            : typeof json?.data?.url === "string"
              ? json.data.url
              : "";

        if (!uploadedUrl) {
          throw new Error("آدرس تصویر از سرور دریافت نشد.");
        }

        onThumbnailChange?.(uploadedUrl);
      } catch (error) {
        setThumbnailUploadError(
          error instanceof Error
            ? error.message
            : "آپلود تصویر با خطا مواجه شد.",
        );
      } finally {
        setIsThumbnailUploading(false);
      }
    },
    [onThumbnailChange],
  );

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    // Prevent page movement when the browser scrollbar disappears
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, isSaving]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center overflow-hidden bg-black/50 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-5"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-meta-modal-title"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSaving &&
          !isThumbnailUploading
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
        flex
        max-h-[92dvh]
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-t-[28px]
        border
        border-white/70
        bg-white
        shadow-[0_30px_90px_-20px_rgba(0,0,0,0.35)]
        animate-in
        slide-in-from-bottom-6
        duration-300

        sm:max-h-[min(88dvh,760px)]
        sm:max-w-xl
        sm:rounded-[28px]
        sm:zoom-in-95
      "
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div className="min-w-0 flex-1 pl-4">
            <h2
              id="page-meta-modal-title"
              className="truncate text-[16px] font-black text-neutral-900 sm:text-[17px]"
            >
              {mode === "template"
                ? pageId
                  ? "ویرایش تمپلیت"
                  : "ساخت تمپلیت جدید"
                : pageId
                  ? "ویرایش صفحه"
                  : "ساخت صفحه جدید"}
            </h2>

            <p className="mt-1 truncate text-[12px] text-neutral-400">
              {mode === "template"
                ? "اطلاعات و تنظیمات تمپلیت را تکمیل کنید"
                : "اطلاعات و آدرس صفحه را تکمیل کنید"}
            </p>
          </div>
        </div>
        <div
          className="
    builder-modal-scrollbar
    min-h-0
    min-w-0
    flex-1
    space-y-5
    overflow-y-auto
    overflow-x-hidden
    overscroll-contain
    px-5
    py-5
    sm:px-6
    sm:py-6
  "
        >
          <div>
            <label className="mb-2 block text-[13px] font-bold text-neutral-700">
              {mode === "template" ? "نام تمپلیت" : "عنوان صفحه"}{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="مثلاً: فروشگاه لوازم خانگی"
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100"
            />
          </div>
          {mode === "page" ? (
            <div>
              <label className="mb-2 block text-[13px] font-bold text-neutral-700">
                آدرس (slug) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/80 transition focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-100">
                <span className="shrink-0 border-l border-neutral-200 bg-neutral-100/80 px-3 py-3.5 font-mono text-[12px] text-neutral-400">
                  /ir.
                </span>
                {false ? (
                  <>
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (!isThumbnailUploading) setIsThumbnailDragging(true);
                      }}
                      onDragLeave={() => setIsThumbnailDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsThumbnailDragging(false);
                        if (!isThumbnailUploading) {
                          void handleThumbnailFile(
                            event.dataTransfer.files?.[0],
                          );
                        }
                      }}
                      onClick={() => {
                        if (!isThumbnailUploading)
                          thumbnailInputRef.current?.click();
                      }}
                      className={[
                        "relative flex min-h-36 w-full min-w-0 max-w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all",
                        isThumbnailDragging
                          ? "scale-[0.995] border-emerald-400 bg-emerald-50 ring-4 ring-emerald-500/10"
                          : "border-neutral-200 bg-neutral-50/80 hover:border-emerald-300 hover:bg-emerald-50/30",
                        isThumbnailUploading
                          ? "pointer-events-none cursor-wait opacity-80"
                          : "",
                      ].join(" ")}
                    >
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt="Template thumbnail preview"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : null}
                      <div
                        className={[
                          "relative z-10 flex w-full flex-col items-center justify-center px-4 py-6 text-center",
                          thumbnail
                            ? "bg-black/45 text-white"
                            : "text-neutral-500",
                        ].join(" ")}
                      >
                        {isThumbnailUploading ? (
                          <>
                            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                            <p className="text-[13px] font-bold">
                              در حال آپلود تصویر...
                            </p>
                          </>
                        ) : (
                          <>
                            {thumbnail ? (
                              <HiOutlinePhoto className="mb-2 h-8 w-8" />
                            ) : (
                              <HiOutlineCloudArrowUp className="mb-2 h-8 w-8 text-neutral-300" />
                            )}
                            <p className="text-[13px] font-bold">
                              {thumbnail
                                ? "برای تغییر تصویر کلیک کنید"
                                : "تصویر را اینجا بکشید یا کلیک کنید"}
                            </p>
                            <p className="mt-1 text-[11px] opacity-75">
                              JPG, PNG, WebP یا GIF - حداکثر ۵MB
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(event) => {
                          void handleThumbnailFile(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </div>
                    {thumbnail ? (
                      <button
                        type="button"
                        onClick={() => onThumbnailChange?.("")}
                        disabled={isThumbnailUploading}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                        حذف تصویر
                      </button>
                    ) : null}
                    {thumbnailUploadError ? (
                      <p className="mt-2 text-[12px] font-medium text-red-500">
                        {thumbnailUploadError}
                      </p>
                    ) : null}
                  </>
                ) : null}
                <input
                  type="text"
                  value={url}
                  onChange={(e) => onUrlChange(slugify(e.target.value))}
                  placeholder="my-page"
                  className="block min-w-0 max-w-full flex-1 bg-transparent px-3 py-3.5 font-mono text-[14px] text-neutral-900 outline-none placeholder:text-neutral-300 sm:text-[15px]"
                  dir="ltr"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-[13px] font-bold text-neutral-700">
                  دسته بندی تمپلیت
                </label>
                <select
                  value={categoryId ?? ""}
                  onChange={(e) => onCategoryIdChange?.(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 text-[15px] text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100"
                >
                  <option value="">بدون دسته بندی</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-bold text-neutral-700">
                  تصویر بندانگشتی
                </label>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!isThumbnailUploading) setIsThumbnailDragging(true);
                  }}
                  onDragLeave={() => setIsThumbnailDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsThumbnailDragging(false);
                    if (!isThumbnailUploading) {
                      void handleThumbnailFile(event.dataTransfer.files?.[0]);
                    }
                  }}
                  onClick={() => {
                    if (!isThumbnailUploading)
                      thumbnailInputRef.current?.click();
                  }}
                  className={[
                    "relative flex min-h-36 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition",
                    isThumbnailDragging
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-neutral-200 bg-neutral-50/80 hover:border-neutral-300 hover:bg-white",
                    isThumbnailUploading ? "pointer-events-none" : "",
                  ].join(" ")}
                >
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt="Template thumbnail preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <div
                    className={[
                      "relative z-10 flex w-full flex-col items-center justify-center px-4 py-6 text-center",
                      thumbnail ? "bg-black/45 text-white" : "text-neutral-500",
                    ].join(" ")}
                  >
                    {isThumbnailUploading ? (
                      <>
                        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                        <p className="text-[13px] font-bold">
                          در حال آپلود تصویر...
                        </p>
                      </>
                    ) : (
                      <>
                        {thumbnail ? (
                          <HiOutlinePhoto className="mb-2 h-8 w-8" />
                        ) : (
                          <HiOutlineCloudArrowUp className="mb-2 h-8 w-8 text-neutral-300" />
                        )}
                        <p className="text-[13px] font-bold">
                          {thumbnail
                            ? "برای تغییر تصویر کلیک کنید"
                            : "تصویر را اینجا بکشید یا کلیک کنید"}
                        </p>
                        <p className="mt-1 text-[11px] opacity-75">
                          JPG, PNG, WebP یا GIF - حداکثر ۵MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => {
                      void handleThumbnailFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>
                {thumbnail ? (
                  <button
                    type="button"
                    onClick={() => onThumbnailChange?.("")}
                    disabled={isThumbnailUploading}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                    حذف تصویر
                  </button>
                ) : null}
                {thumbnailUploadError ? (
                  <p className="mt-2 text-[12px] font-medium text-red-500">
                    {thumbnailUploadError}
                  </p>
                ) : null}
                <input
                  type="url"
                  value={thumbnail ?? ""}
                  onChange={(e) => {
                    setThumbnailUploadError(null);
                    onThumbnailChange?.(e.target.value);
                  }}
                  placeholder="https://example.com/template.jpg"
                  className="
    mt-3
    block
    w-full
    min-w-0
    max-w-full
    rounded-2xl
    border
    border-neutral-200
    bg-neutral-50/80
    px-4
    py-3.5
    text-left
    font-mono
    text-[13px]
    text-neutral-900
    outline-none
    transition-all
    placeholder:text-neutral-300
    hover:border-neutral-300
    focus:border-emerald-400
    focus:bg-white
    focus:ring-4
    focus:ring-emerald-500/10
  "
                  dir="ltr"
                />
              </div>
            </>
          )}
          <div>
            <label className="mb-2 block text-[13px] font-bold text-neutral-700">
              توضیح کوتاه
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="یک توضیح کوتاه..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100"
            />
          </div>
          {saveError && (
            <div
              role="alert"
              className="flex min-w-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-6 text-red-700"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <span className="min-w-0 flex-1 break-words">{saveError}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-neutral-100 bg-neutral-50/50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-[13px] font-bold text-neutral-600 transition-all hover:bg-neutral-100 active:scale-[0.97]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={
              isSaving || !title.trim() || (mode === "page" && !url.trim())
            }
            className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "ذخیره..."
              : pageId
                ? "ذخیره تغییرات"
                : mode === "template"
                  ? "ساخت تمپلیت"
                  : "ساخت صفحه"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
