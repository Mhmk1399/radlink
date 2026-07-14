// builder/components/BuilderModals.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  HiOutlineCloudArrowUp,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaTrash } from "react-icons/fa";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { slugify } from "@/helper/builder.helpers";
import { uploadFile } from "@/lib/fileUtils";
import { LogoHeaderFrame } from "@/components/landing/LogoHeaderFrame";
import LandingFooter from "@/components/landing/LandingFooter";
import {
  DEFAULT_LOGO_HEADER,
  LOGO_HEADER_VARIANTS,
  normalizeLogoHeaderSettings,
  type LogoHeaderSettings,
} from "@/lib/design/logo-header";
import {
  LANDING_FONT_OPTIONS,
  normalizeLandingFontId,
  type LandingFontId,
} from "@/lib/design/landing-fonts";
import {
  getLandingFontClassName,
  getLandingFontStyle,
} from "@/lib/design/landing-fonts.next";
import {
  PAGE_BACKGROUND_PATTERNS,
  createPageBackgroundPattern,
  getPageBackgroundStyle,
  normalizePageBackgroundPattern,
  type PageBackgroundPattern,
} from "@/lib/design/page-background";
import {
  normalizePageFooterSettings,
  type PageFooterSettings,
} from "@/lib/design/page-footer";
import { RgbaColorInput } from "@/builder/editor/form/RgbaColorInput";

type CatalogBlock = {
  type: string;
  label: string;
  description?: string;
  icon: ReactNode;
  canCreate?: boolean;
};

type PageSaveResult = {
  status: "success" | "error";
  message: string;
  pageUrl?: string;
};

const TWO_COLOR_BACKGROUND_PATTERNS = new Set<PageBackgroundPattern["id"]>([
  "duotone-blur",
  "halftone-gradient",
  "gradient-dots",
  "orbital-circles",
  "blurred-dots",
  "aurora-mesh",
  "soft-spotlight",
  "premium-rings",
  "silk-waves",
]);

function supportsSecondPatternColor(patternId: PageBackgroundPattern["id"]) {
  return TWO_COLOR_BACKGROUND_PATTERNS.has(patternId);
}

export function PageSaveResultModal({
  result,
  onClose,
}: {
  result: PageSaveResult | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!result) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, result]);

  if (!result) return null;

  const succeeded = result.status === "success";

  return createPortal(
    <div
      className="fixed inset-0 z-450 flex items-center justify-center p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-save-result-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div
          className={[
            "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
            succeeded
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600",
          ].join(" ")}
        >
          {succeeded ? (
            <HiOutlineCheckCircle size={30} />
          ) : (
            <HiOutlineExclamationTriangle size={30} />
          )}
        </div>

        <div className="mt-4 text-center">
          <h2
            id="page-save-result-title"
            className="text-lg font-black text-neutral-900"
          >
            {succeeded ? "صفحه با موفقیت ذخیره شد" : "ذخیره صفحه ناموفق بود"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-neutral-500">
            {result.message}
          </p>
        </div>

        {succeeded && result.pageUrl && (
          <a
            href={result.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
          >
            مشاهده صفحه
            <HiOutlineArrowTopRightOnSquare size={17} />
          </a>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50"
        >
          بستن
        </button>
      </div>
    </div>,
    document.body,
  );
}

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
      className="fixed inset-0 z-500 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-95 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_32px_100px_-20px_rgba(0,0,0,0.4)]">
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
  isLoading = false,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
  availableBlocks?: CatalogBlock[];
  isLoading?: boolean;
}) {
  const available = useMemo<CatalogBlock[]>(
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
      className="fixed inset-0 z-300 flex items-end justify-center p-0 sm:items-center sm:p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-h-[85vh] animate-in slide-in-from-bottom-6 duration-300 overflow-hidden rounded-t-[28px] border border-neutral-200/60 bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] sm:max-w-lg sm:max-h-150 sm:rounded-[28px] sm:zoom-in-95 sm:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)]">
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
                {isLoading
                  ? "در حال دریافت بلاک‌ها..."
                  : `${filtered.length} بلاک موجود`}
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
              disabled={isLoading}
              placeholder="جستجوی بلاک..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-[calc(85vh-180px)] overflow-y-auto overscroll-contain px-4 pb-6 pl-2 [scrollbar-color:#d4d4d4_transparent] [scrollbar-width:thin] sm:max-h-[380px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400 [&::-webkit-scrollbar-track]:bg-transparent">
          {isLoading ? (
            <div
              className="grid grid-cols-1 gap-2"
              role="status"
              aria-label="در حال دریافت بلاک‌ها"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4 rounded-2xl border border-neutral-100 p-4"
                >
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-neutral-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 rounded bg-neutral-200" />
                    <div className="h-3 w-3/4 rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
              <span className="sr-only">در حال دریافت بلاک‌ها...</span>
            </div>
          ) : filtered.length === 0 ? (
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
                    if (item.canCreate === false) return;
                    onAdd(item.type);
                    onClose();
                  }}
                  disabled={item.canCreate === false}
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 text-right transition-all duration-200 enabled:hover:border-emerald-200 enabled:hover:bg-emerald-50/50 enabled:hover:shadow-sm enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60"
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
                  {item.canCreate === false ? (
                    <span className="shrink-0 text-[10px] font-semibold text-neutral-400">
                      فقط مشاهده
                    </span>
                  ) : (
                    <HiOutlinePlus
                      size={18}
                      className="shrink-0 text-neutral-300 transition group-hover:text-emerald-500"
                    />
                  )}
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

function PageBackgroundPatternSettings({
  baseColor,
  pattern,
  onChange,
}: {
  baseColor: string;
  pattern?: Partial<PageBackgroundPattern>;
  onChange?: (value: PageBackgroundPattern) => void;
}) {
  const currentPattern = normalizePageBackgroundPattern(pattern);
  const patternDisabled = !onChange;

  const updatePattern = (patch: Partial<PageBackgroundPattern>) => {
    onChange?.(
      normalizePageBackgroundPattern(
        {
          ...currentPattern,
          ...patch,
        },
        currentPattern,
      ),
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-black text-neutral-700">
            پترن آماده بکگراند
          </p>
          <p className="mt-1 text-[10px] leading-5 text-neutral-400">
            همین طرح روی خروجی صفحه و قالب ذخیره می‌شود.
          </p>
        </div>
        <span
          className="h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-100 shadow-sm"
          style={getPageBackgroundStyle({
            color: baseColor,
            image: "",
            pattern: currentPattern,
          })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PAGE_BACKGROUND_PATTERNS.map((option) => {
          const active = currentPattern.id === option.id;
          const previewPattern = createPageBackgroundPattern(option.id, {
            color: option.defaultColor,
            secondaryColor:
              option.defaultSecondaryColor ?? currentPattern.secondaryColor,
            opacity: option.defaultOpacity,
            size: option.defaultSize,
          });

          return (
            <button
              key={option.id}
              type="button"
              disabled={patternDisabled}
              onClick={() => onChange?.(previewPattern)}
              className={[
                "overflow-hidden rounded-xl border bg-white text-right transition hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "border-neutral-900 ring-2 ring-neutral-900/10"
                  : "border-neutral-200",
              ].join(" ")}
              title={option.description}
            >
              <span
                className="block h-11"
                style={getPageBackgroundStyle({
                  color: baseColor,
                  image: "",
                  pattern: previewPattern,
                })}
              />
              <span className="block truncate px-2 py-2 text-[10px] font-black text-neutral-600">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {currentPattern.id !== "none" ? (
        <div className="space-y-3 rounded-xl bg-neutral-50 p-3">
          <div>
            <label className="mb-2 block text-[11px] font-bold text-neutral-600">
              رنگ پترن
            </label>
            <RgbaColorInput
              value={currentPattern.color}
              onChange={(value) => updatePattern({ color: value })}
              disabled={patternDisabled}
              className="min-w-0"
              swatchClassName="h-10 w-12 rounded-xl"
              inputClassName="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-mono text-[12px] text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
              panelClassName="right-0 w-72"
              label="انتخاب رنگ پترن"
            />
          </div>

          {supportsSecondPatternColor(currentPattern.id) ? (
            <div>
              <label className="mb-2 block text-[11px] font-bold text-neutral-600">
                رنگ دوم گرادینت
              </label>
              <RgbaColorInput
                value={currentPattern.secondaryColor || baseColor}
                onChange={(value) => updatePattern({ secondaryColor: value })}
                disabled={patternDisabled}
                className="min-w-0"
                swatchClassName="h-10 w-12 rounded-xl"
                inputClassName="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-mono text-[12px] text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                panelClassName="right-0 w-72"
                label="انتخاب رنگ دوم گرادینت"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold text-neutral-600">
                شدت پترن
                <span className="font-mono text-neutral-400">
                  {Math.round(currentPattern.opacity * 100)}%
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={28}
                value={Math.round(currentPattern.opacity * 100)}
                onChange={(event) =>
                  updatePattern({ opacity: Number(event.target.value) / 100 })
                }
                disabled={patternDisabled}
                className="w-full accent-neutral-900 disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold text-neutral-600">
                اندازه پترن
                <span className="font-mono text-neutral-400">
                  {currentPattern.size}px
                </span>
              </span>
              <input
                type="range"
                min={10}
                max={96}
                value={currentPattern.size}
                onChange={(event) =>
                  updatePattern({ size: Number(event.target.value) })
                }
                disabled={patternDisabled}
                className="w-full accent-neutral-900 disabled:opacity-50"
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TemplateBackgroundSettings({
  color,
  image,
  pattern,
  isUploading,
  uploadError,
  inputRef,
  onColorChange,
  onImageChange,
  onPatternChange,
  onFile,
}: {
  color: string;
  image: string;
  pattern?: Partial<PageBackgroundPattern>;
  isUploading: boolean;
  uploadError: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onColorChange?: (value: string) => void;
  onImageChange?: (value: string) => void;
  onPatternChange?: (value: PageBackgroundPattern) => void;
  onFile: (file: File | null | undefined) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
      <div>
        <h3 className="text-[13px] font-black text-neutral-800">
          پس‌زمینه قالب
        </h3>
        <p className="mt-1 text-[11px] leading-5 text-neutral-400">
          این پس‌زمینه هنگام انتخاب قالب، به صفحه جدید منتقل می‌شود.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-bold text-neutral-600">
          رنگ پس‌زمینه
        </label>
        <div className="flex items-center gap-3">
          <RgbaColorInput
            value={color}
            onChange={onColorChange}
            className="min-w-0 flex-1"
            swatchClassName="h-12 w-14 rounded-xl"
            label="انتخاب رنگ پس‌زمینه قالب"
          />
        </div>
      </div>

      <PageBackgroundPatternSettings
        baseColor={color}
        pattern={pattern}
        onChange={onPatternChange}
      />

      <div>
        <label className="mb-2 block text-[12px] font-bold text-neutral-600">
          تصویر پس‌زمینه
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="relative flex min-h-36 w-full overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200 bg-white transition hover:border-emerald-300 disabled:cursor-wait disabled:opacity-75"
        >
          {image && (
            <img
              src={image}
              alt="پیش‌نمایش تصویر پس‌زمینه قالب"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span
            className={[
              "relative z-10 flex w-full flex-col items-center justify-center px-4 py-6 text-center",
              image ? "bg-black/45 text-white" : "text-neutral-500",
            ].join(" ")}
          >
            {isUploading ? (
              <>
                <span className="mb-3 h-9 w-9 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                <span className="text-[12px] font-bold">
                  در حال آپلود تصویر...
                </span>
              </>
            ) : (
              <>
                <HiOutlineCloudArrowUp className="mb-2 h-8 w-8" />
                <span className="text-[12px] font-bold">
                  {image ? "تغییر تصویر پس‌زمینه" : "انتخاب تصویر پس‌زمینه"}
                </span>
                <span className="mt-1 text-[10px] opacity-75">
                  JPG, PNG, WebP, GIF یا AVIF - حداکثر ۱۰MB
                </span>
              </>
            )}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(event) => {
            onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        {image && (
          <button
            type="button"
            onClick={() => onImageChange?.("")}
            disabled={isUploading}
            className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-500 transition hover:bg-red-100 disabled:opacity-60"
          >
            <HiOutlineTrash className="h-4 w-4" />
            حذف تصویر پس‌زمینه
          </button>
        )}

        {uploadError && (
          <p className="mt-2 text-[11px] font-medium text-red-500">
            {uploadError}
          </p>
        )}
      </div>
    </section>
  );
}

function LogoHeaderSettingsPanel({
  value,
  logo,
  logoShape,
  title,
  onChange,
}: {
  value?: Partial<LogoHeaderSettings>;
  logo?: string;
  logoShape?: "square" | "circle";
  title: string;
  onChange?: (value: LogoHeaderSettings) => void;
}) {
  const settings = normalizeLogoHeaderSettings(value);
  const logoHeaderBgInputRef = useRef<HTMLInputElement>(null);
  const [isLogoHeaderBgUploading, setIsLogoHeaderBgUploading] = useState(false);
  const [logoHeaderBgUploadError, setLogoHeaderBgUploadError] = useState<
    string | null
  >(null);

  const update = (patch: Partial<LogoHeaderSettings>) => {
    onChange?.(normalizeLogoHeaderSettings({ ...settings, ...patch }));
  };

  const handleLogoHeaderBgFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setLogoHeaderBgUploadError("فقط فایل تصویر قابل آپلود است.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setLogoHeaderBgUploadError("حجم تصویر باید کمتر از ۱۰ مگابایت باشد.");
        return;
      }

      try {
        setIsLogoHeaderBgUploading(true);
        setLogoHeaderBgUploadError(null);

        const uploaded = await uploadFile(file, { kind: "logo-header" });
        onChange?.(
          normalizeLogoHeaderSettings({
            ...settings,
            backgroundImage: uploaded.url,
            enabled: true,
          }),
        );
      } catch (error) {
        setLogoHeaderBgUploadError(
          error instanceof Error
            ? error.message
            : "آپلود تصویر پس‌زمینه قاب لوگو با خطا مواجه شد.",
        );
      } finally {
        setIsLogoHeaderBgUploading(false);
      }
    },
    [onChange, settings],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-black text-neutral-800">
            قاب لوگوی بالای سایت
          </h3>
          <p className="mt-1 text-[11px] leading-5 text-neutral-400">
            یک طرح موجی یا پترنی برای بالای سایت انتخاب کنید؛ لوگو در مرکز آن
            قرار می‌گیرد.
          </p>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-neutral-600 ring-1 ring-neutral-200">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => update({ enabled: event.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 accent-[#064789]"
          />
          فعال
        </label>
      </div>

      <div className={settings.enabled ? "" : "pointer-events-none opacity-50"}>
        <LogoHeaderFrame
          settings={settings}
          logo={logo}
          logoShape={logoShape}
          title={title}
          showPlaceholder
        />

        <div className="mb-3 grid grid-cols-1 gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
          <label>
            <span className="mb-2 block text-[11px] font-bold text-neutral-600">
              عنوان زیر لوگو
            </span>
            <input
              type="text"
              value={settings.title}
              onChange={(event) =>
                update({ title: event.target.value, enabled: true })
              }
              placeholder="مثلا: کلینیک زیبایی آوینا"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] text-neutral-800 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            />
          </label>
          <label>
            <span className="mb-2 block text-[11px] font-bold text-neutral-600">
              توضیح کوتاه زیر عنوان
            </span>
            <textarea
              value={settings.description}
              onChange={(event) =>
                update({ description: event.target.value, enabled: true })
              }
              rows={2}
              placeholder="مثلا: رزرو سریع خدمات و مشاهده اطلاعات تماس"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            />
          </label>
        </div>

        <label className="mb-3 block rounded-2xl border border-[#064789]/15 bg-white p-3 shadow-sm">
          <span className="flex items-center justify-between gap-3 text-[11px] font-black text-neutral-700">
            ارتفاع قاب لوگو
            <span className="rounded-full bg-[#064789]/8 px-2.5 py-1 font-mono text-[11px] text-[#064789]">
              {settings.height}px
            </span>
          </span>
          <input
            type="range"
            min={60}
            max={360}
            value={settings.height}
            onChange={(event) =>
              update({ height: Number(event.target.value), enabled: true })
            }
            className="mt-3 w-full accent-[#064789]"
          />
        </label>

        <div className="mb-3 rounded-2xl border border-neutral-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black text-neutral-700">
                تصویر پس‌زمینه قاب لوگو
              </p>
              <p className="mt-1 text-[10px] leading-5 text-neutral-400">
                می‌توانید تصویر را به‌تنهایی استفاده کنید یا روی آن پترن و موج
                بیندازید.
              </p>
            </div>
            {settings.backgroundImage ? (
              <button
                type="button"
                onClick={() => update({ backgroundImage: "" })}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                title="حذف تصویر پس‌زمینه"
              >
                <HiOutlineTrash className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <input
            ref={logoHeaderBgInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              void handleLogoHeaderBgFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            disabled={isLogoHeaderBgUploading}
            onClick={() => logoHeaderBgInputRef.current?.click()}
            className={[
              "group relative flex min-h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed transition",
              isLogoHeaderBgUploading
                ? "cursor-wait border-neutral-200 bg-neutral-50 text-neutral-400"
                : "border-neutral-300 bg-neutral-50 text-neutral-500 hover:border-[#064789]/45 hover:bg-[#064789]/5 hover:text-[#064789]",
            ].join(" ")}
          >
            {settings.backgroundImage ? (
              <span
                className="absolute inset-0 bg-cover bg-center transition duration-200 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: `url(${JSON.stringify(settings.backgroundImage)})`,
                }}
              />
            ) : null}
            {settings.backgroundImage ? (
              <span className="absolute inset-0 bg-black/25" />
            ) : null}
            <span className="relative z-10 flex flex-col items-center text-center text-[11px] font-bold">
              {settings.backgroundImage ? (
                <HiOutlinePhoto className="mb-2 h-8 w-8 text-white drop-shadow" />
              ) : (
                <HiOutlineCloudArrowUp className="mb-2 h-8 w-8" />
              )}
              <span
                className={
                  settings.backgroundImage
                    ? "rounded-full bg-white/90 px-3 py-1 text-neutral-700 shadow-sm"
                    : ""
                }
              >
                {isLogoHeaderBgUploading
                  ? "در حال آپلود..."
                  : settings.backgroundImage
                    ? "تعویض تصویر"
                    : "آپلود تصویر پس‌زمینه"}
              </span>
            </span>
          </button>

          {logoHeaderBgUploadError ? (
            <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-500">
              {logoHeaderBgUploadError}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black text-neutral-700">
                موج و پترن قاب
              </p>
              <p className="mt-1 text-[10px] leading-5 text-neutral-400">
                می‌توانید پترن را خاموش کنید و فقط تصویر پس‌زمینه یا گرادیانت را
                نگه دارید.
              </p>
            </div>
            <button
              type="button"
              onClick={() => update({ variant: "none", enabled: true })}
              className={[
                "shrink-0 rounded-xl border px-3 py-2 text-[11px] font-black transition",
                settings.variant === "none"
                  ? "border-[#064789] bg-[#064789] text-white shadow-sm"
                  : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 hover:bg-white",
              ].join(" ")}
            >
              بدون موج
            </button>
          </div>

          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-xl bg-neutral-50 p-2 ring-1 ring-neutral-200 sm:grid-cols-3">
            {LOGO_HEADER_VARIANTS.filter(
              (variant) => variant.id !== "none",
            ).map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => update({ variant: variant.id, enabled: true })}
                className={[
                  "rounded-xl border px-2 py-2 text-[11px] font-bold transition",
                  settings.variant === variant.id
                    ? "border-[#064789] bg-[#064789] text-white shadow-sm"
                    : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-white",
                ].join(" ")}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["primaryColor", "رنگ اصلی"],
            ["secondaryColor", "رنگ شکل"],
            ["accentColor", "رنگ جزئیات"],
            ["textColor", "رنگ عنوان"],
            ["descriptionColor", "رنگ توضیح"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className="mb-2 block text-[11px] font-bold text-neutral-600">
              {label}
            </label>
            <RgbaColorInput
              value={settings[key]}
              onChange={(color) => update({ [key]: color })}
              label={label}
              className="min-w-0"
              swatchClassName="h-10 w-12 rounded-xl"
              inputClassName="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-2 py-2 font-mono text-[11px] text-neutral-700 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
              panelClassName="left-0 w-80"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(
          [
            ["maxWidth", "عرض", 320, 1920, "px"],
            ["logoSize", "اندازه لوگو", 56, 180, "px"],
            ["patternOpacity", "شدت پترن", 5, 90, "%"],
          ] as const
        ).map(([key, label, min, max, suffix]) => {
          const rawValue =
            key === "patternOpacity"
              ? Math.round(settings.patternOpacity * 100)
              : settings[key];

          return (
            <label
              key={key}
              className="rounded-2xl border border-neutral-200 bg-white p-3"
            >
              <span className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                {label}
                <span className="font-mono text-neutral-400">
                  {rawValue}
                  {suffix}
                </span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                value={rawValue}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  update({
                    [key]:
                      key === "patternOpacity" ? nextValue / 100 : nextValue,
                  });
                }}
                className="mt-3 w-full accent-[#064789]"
              />
            </label>
          );
        })}
      </div>

      <label className="block rounded-2xl border border-neutral-200 bg-white p-3">
        <span className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
          انحنا
          <span className="font-mono text-neutral-400">
            {settings.cornerRadius}px
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={80}
          value={settings.cornerRadius}
          onChange={(event) =>
            update({ cornerRadius: Number(event.target.value) })
          }
          className="mt-3 w-full accent-[#064789]"
        />
      </label>

      <button
        type="button"
        onClick={() => onChange?.(DEFAULT_LOGO_HEADER)}
        className="text-[11px] font-bold text-neutral-400 transition hover:text-red-500"
      >
        بازنشانی تنظیمات قاب لوگو
      </button>
    </section>
  );
}

export function LogoHeaderEditorModal({
  open,
  value,
  logo,
  logoShape,
  title,
  onChange,
  onClose,
}: {
  open: boolean;
  value?: Partial<LogoHeaderSettings>;
  logo?: string;
  logoShape?: "square" | "circle";
  title: string;
  onChange: (value: LogoHeaderSettings) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[420] flex items-end justify-center bg-black/5 p-0  sm:items-center sm:p-5"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-header-editor-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-white/90 backdrop-blur-sm shadow-2xl sm:rounded-[28px]">
        <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h2
              id="logo-header-editor-title"
              className="text-[16px] font-black text-neutral-900"
            >
              ویرایش قاب لوگوی بالای سایت
            </h2>
            <p className="mt-1 text-[11px] text-neutral-400">
              تغییرات همین‌جا روی پیش‌نمایش صفحه‌ساز اعمال می‌شود.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-800"
            aria-label="بستن"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </header>
        <div className="builder-modal-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          <LogoHeaderSettingsPanel
            value={value}
            logo={logo}
            logoShape={logoShape}
            title={title}
            onChange={onChange}
          />
        </div>
        <footer className="border-t border-neutral-100 bg-neutral-50/70 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-[13px] font-bold text-white transition hover:bg-neutral-800"
          >
            انجام شد
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export function PageFooterEditorModal({
  open,
  value,
  logo,
  title,
  onChange,
  onClose,
}: {
  open: boolean;
  value?: Partial<PageFooterSettings>;
  logo?: string;
  title: string;
  onChange: (value: PageFooterSettings) => void;
  onClose: () => void;
}) {
  const settings = normalizePageFooterSettings(value);
  const trustBadgeInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const update = useCallback(
    (patch: Partial<PageFooterSettings>) => {
      onChange(
        normalizePageFooterSettings({
          ...settings,
          ...patch,
          logo: "",
        }),
      );
    },
    [onChange, settings],
  );

  const handleTrustBadgeFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setUploadError("فقط فایل تصویر قابل آپلود است.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
        return;
      }

      try {
        setIsUploading(true);
        setUploadError(null);
        const uploaded = await uploadFile(file);
        update({ trustBadgeImage: uploaded.url });
      } catch (error) {
        setUploadError(
          error instanceof Error
            ? error.message
            : "آپلود تصویر نماد انجام نشد.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [update],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUploading) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isUploading, onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[420] flex items-end justify-center bg-black/5 p-0 sm:items-center sm:p-5"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-footer-editor-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isUploading) onClose();
      }}
    >
      <section className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-white/90 shadow-2xl backdrop-blur-sm sm:rounded-[28px]">
        <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h2
              id="page-footer-editor-title"
              className="text-[15px] font-black text-neutral-900"
            >
              ویرایش فوتر لندینگ
            </h2>
            <p className="mt-1 text-[11px] text-neutral-400">
              لوگوی فوتر از لوگوی اصلی صفحه استفاده می‌کند.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 disabled:opacity-50"
            aria-label="بستن"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <LandingFooter
            settings={settings}
            pageLogo={logo}
            pageTitle={title}
            compact
          />

          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-neutral-600 ring-1 ring-neutral-200">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) => update({ enabled: event.target.checked })}
              className="h-4 w-4 rounded border-neutral-300 accent-[#064789]"
            />
            نمایش فوتر
          </label>

          <label className="block">
            <span className="mb-2 block text-[12px] font-bold text-neutral-600">
              متن زیر لوگو
            </span>
            <textarea
              value={settings.description}
              onChange={(event) =>
                update({ description: event.target.value })
              }
              rows={3}
              placeholder="مثلا: همراه شما برای تجربه‌ای بهتر"
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[13px] leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </label>

          <div className="rounded-2xl border border-neutral-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-black text-neutral-700">
                  تصویر نماد اعتماد
                </p>
                <p className="mt-1 text-[10px] leading-5 text-neutral-400">
                  مثل اینماد، مجوز صنفی یا نشان اعتماد.
                </p>
              </div>
              {settings.trustBadgeImage ? (
                <button
                  type="button"
                  onClick={() => update({ trustBadgeImage: "" })}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
                  title="حذف تصویر نماد"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => trustBadgeInputRef.current?.click()}
              disabled={isUploading}
              className="relative flex min-h-[128px] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-neutral-500 transition hover:border-[#064789]/45 hover:bg-[#064789]/5 hover:text-[#064789] disabled:cursor-wait disabled:opacity-70"
            >
              {settings.trustBadgeImage ? (
                <Image
                  src={settings.trustBadgeImage}
                  alt={settings.trustBadgeAlt || "نماد اعتماد"}
                  fill
                  unoptimized
                  sizes="320px"
                  className="object-contain p-5"
                />
              ) : (
                <span className="flex flex-col items-center text-center text-[11px] font-bold">
                  <HiOutlineCloudArrowUp className="mb-2 h-8 w-8" />
                  انتخاب تصویر نماد
                </span>
              )}
              {isUploading ? (
                <span className="relative z-10 h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
            </button>
            <input
              ref={trustBadgeInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void handleTrustBadgeFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />

            {uploadError ? (
              <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] font-bold text-red-500">
                {uploadError}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                {
                  key: "backgroundColor",
                  label: "پس‌زمینه فوتر",
                  element: "بدنه فوتر",
                  helper: "رنگ سطح اصلی فوتر و فضای پشت لوگو و نماد.",
                },
                {
                  key: "textColor",
                  label: "متن‌های فوتر",
                  element: "توضیحات و کپی‌رایت",
                  helper: "رنگ متن زیر لوگو و نوشته پایین فوتر.",
                },
                {
                  key: "accentColor",
                  label: "رنگ تاکید",
                  element: "عنوان و جزئیات برجسته",
                  helper: "رنگ نام صفحه، حرف جایگزین لوگو و تاکیدهای کوچک.",
                },
                {
                  key: "borderColor",
                  label: "خط و حاشیه",
                  element: "کادرها و جداکننده",
                  helper: "رنگ دور فوتر، خط جداکننده و کادر نماد اعتماد.",
                },
              ] as const
            ).map((field) => (
              <div
                key={field.key}
                className="rounded-2xl border border-neutral-200 bg-white p-3"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-black text-neutral-700">
                      {field.label}
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-neutral-400">
                      {field.helper}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-500">
                    {field.element}
                  </span>
                </div>
                <RgbaColorInput
                  value={settings[field.key]}
                  onChange={(value) => update({ [field.key]: value })}
                  label={field.label}
                  swatchClassName="h-10 w-12 rounded-xl"
                  className="min-w-0"
                />
              </div>
            ))}
          </div>
        </div>

        <footer className="border-t border-neutral-100 bg-neutral-50/70 p-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-[13px] font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            انجام شد
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export function PageMetaModal({
  open,
  mode = "page",
  title,
  description,
  url,
  urlError,
  pageId,
  categoryId,
  categoryOptions = [],
  thumbnail,
  logo,
  logoShape = "square",
  favicon,
  font,
  backgroundColor = "#ffffff",
  backgroundImage = "",
  backgroundPattern,
  onTitleChange,
  onDescriptionChange,
  onUrlChange,
  onCategoryIdChange,
  onThumbnailChange,
  onLogoChange,
  onLogoShapeChange,
  onFaviconChange,
  onFontChange,
  onBackgroundColorChange,
  onBackgroundImageChange,
  onBackgroundPatternChange,
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
  urlError?: string | null;
  pageId: string | null;
  categoryId?: string;
  categoryOptions?: Array<{ value: string; label: string }>;
  thumbnail?: string;
  logo?: string;
  logoShape?: "square" | "circle";
  favicon?: string;
  font?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPattern?: Partial<PageBackgroundPattern>;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onCategoryIdChange?: (v: string) => void;
  onThumbnailChange?: (v: string) => void;
  onLogoChange?: (v: string) => void;
  onLogoShapeChange?: (v: "square" | "circle") => void;
  onFaviconChange?: (v: string) => void;
  onFontChange?: (v: LandingFontId) => void;
  onBackgroundColorChange?: (v: string) => void;
  onBackgroundImageChange?: (v: string) => void;
  onBackgroundPatternChange?: (v: PageBackgroundPattern) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveError: string | null;
}) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<
    string | null
  >(null);
  const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
  const [backgroundUploadError, setBackgroundUploadError] = useState<
    string | null
  >(null);
  const [uploadingPageImage, setUploadingPageImage] = useState<
    "logo" | "favicon" | null
  >(null);
  const [pageImageUploadError, setPageImageUploadError] = useState<
    string | null
  >(null);
  const normalizedBackgroundPattern = useMemo(
    () => normalizePageBackgroundPattern(backgroundPattern),
    [backgroundPattern],
  );
  const selectedLandingFont = normalizeLandingFontId(font);

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

        const uploaded = await uploadFile(file);
        onThumbnailChange?.(uploaded.url);
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

  const handleBackgroundFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setBackgroundUploadError("فقط فایل تصویر قابل آپلود است.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setBackgroundUploadError("حجم تصویر باید کمتر از ۱۰ مگابایت باشد.");
        return;
      }

      try {
        setIsBackgroundUploading(true);
        setBackgroundUploadError(null);
        const uploaded = await uploadFile(file);
        onBackgroundImageChange?.(uploaded.url);
      } catch (error) {
        setBackgroundUploadError(
          error instanceof Error
            ? error.message
            : "آپلود تصویر پس‌زمینه با خطا مواجه شد.",
        );
      } finally {
        setIsBackgroundUploading(false);
      }
    },
    [onBackgroundImageChange],
  );

  const handlePageImageFile = useCallback(
    async (kind: "logo" | "favicon", file: File | null | undefined) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setPageImageUploadError("فقط فایل تصویر قابل آپلود است.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setPageImageUploadError("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
        return;
      }

      try {
        setUploadingPageImage(kind);
        setPageImageUploadError(null);
        const uploaded = await uploadFile(file);

        if (kind === "logo") onLogoChange?.(uploaded.url);
        else onFaviconChange?.(uploaded.url);
      } catch (error) {
        setPageImageUploadError(
          error instanceof Error
            ? error.message
            : "آپلود تصویر با خطا مواجه شد.",
        );
      } finally {
        setUploadingPageImage(null);
      }
    },
    [onFaviconChange, onLogoChange],
  );

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !isSaving &&
        !isThumbnailUploading &&
        !isBackgroundUploading &&
        !uploadingPageImage
      ) {
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
  }, [
    open,
    onClose,
    isSaving,
    isThumbnailUploading,
    isBackgroundUploading,
    uploadingPageImage,
  ]);

  useEffect(() => {
    if (!open || mode !== "page" || !urlError) return;

    const frame = requestAnimationFrame(() => {
      slugInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      slugInputRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [open, mode, urlError]);

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
          !isThumbnailUploading &&
          !isBackgroundUploading &&
          !uploadingPageImage
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
                  ? "ویرایش قالب"
                  : "ساخت قالب جدید"
                : pageId
                  ? "ویرایش صفحه"
                  : "ساخت صفحه جدید"}
            </h2>

            <p className="mt-1 truncate text-[12px] text-neutral-400">
              {mode === "template"
                ? "اطلاعات و تنظیمات قالب را تکمیل کنید"
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
              {mode === "template" ? "نام قالب" : "عنوان صفحه"}{" "}
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
            <>
              <div>
                <label className="mb-2 block text-[13px] font-bold text-neutral-700">
                  آدرس (slug) <span className="text-red-400">*</span>
                </label>
                <div
                  className={[
                    "flex items-center overflow-hidden rounded-2xl border bg-neutral-50/80 transition focus-within:ring-4",
                    urlError
                      ? "border-red-400 bg-red-50/50 ring-4 ring-red-100 focus-within:border-red-500 focus-within:ring-red-100"
                      : "border-neutral-200 focus-within:border-neutral-400 focus-within:ring-neutral-100",
                  ].join(" ")}
                >
                  <span className="shrink-0 border-l border-neutral-200 bg-neutral-100/80 px-3 py-3.5 font-mono text-[12px] text-neutral-400">
                    /ir.
                  </span>
                  {false ? (
                    <>
                      <div
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (!isThumbnailUploading)
                            setIsThumbnailDragging(true);
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
                    ref={slugInputRef}
                    type="text"
                    value={url}
                    onChange={(e) => onUrlChange(slugify(e.target.value))}
                    placeholder="my-page"
                    minLength={4}
                    inputMode="url"
                    autoCapitalize="none"
                    spellCheck={false}
                    pattern="[a-z0-9-]*"
                    aria-invalid={Boolean(urlError)}
                    aria-describedby={urlError ? "page-slug-error" : undefined}
                    className="block min-w-0 max-w-full flex-1 bg-transparent px-3 py-3.5 font-mono text-[14px] text-neutral-900 outline-none placeholder:text-neutral-300 sm:text-[15px]"
                    dir="ltr"
                  />
                </div>
                {urlError ? (
                  <p
                    id="page-slug-error"
                    role="alert"
                    className="mt-2 text-[12px] font-bold leading-5 text-red-600"
                  >
                    {urlError}
                  </p>
                ) : null}
                <p className="mt-2 text-[11px] leading-5 text-neutral-400">
                  حداقل ۴ کاراکتر؛ فقط از حروف انگلیسی a-z، اعداد 0-9 و خط تیره
                  (-) استفاده کنید.
                </p>
              </div>

              <section className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                <div>
                  <h3 className="text-[13px] font-black text-neutral-800">
                    فونت لندینگ
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                    فونت فقط برای همین لندینگ اعمال می‌شود و قبل از ذخیره در
                    کانواس قابل مشاهده است.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {LANDING_FONT_OPTIONS.map((option) => {
                    const active = selectedLandingFont === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onFontChange?.(option.id)}
                        className={[
                          "group flex min-h-24 flex-col rounded-2xl border bg-white p-3 text-right transition-all",
                          active
                            ? "border-[#064789] ring-4 ring-[#064789]/10"
                            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-[12px] font-black text-neutral-800">
                            {option.label}
                          </span>
                          <span
                            className={[
                              "h-4 w-4 rounded-full border transition",
                              active
                                ? "border-[#064789] bg-[#064789] shadow-[inset_0_0_0_3px_white]"
                                : "border-neutral-300 bg-white",
                            ].join(" ")}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="mt-1 text-[10px] leading-5 text-neutral-400">
                          {option.description}
                        </span>
                        <span
                          className={[
                            "mt-auto pt-3 text-[15px] leading-7 text-neutral-900",
                            getLandingFontClassName(option.id),
                          ].join(" ")}
                          style={getLandingFontStyle(option.id)}
                        >
                          {option.previewText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                <div>
                  <h3 className="text-[13px] font-black text-neutral-800">
                    لوگو و آیکون صفحه
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                    لوگو بالای صفحه نمایش داده می‌شود و آیکون در تب مرورگر
                    استفاده خواهد شد.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        kind: "logo" as const,
                        label: "لوگوی صفحه",
                        value: logo,
                        inputRef: logoInputRef,
                        hint: "PNG، WebP یا SVG",
                      },
                      {
                        kind: "favicon" as const,
                        label: "آیکون مرورگر",
                        value: favicon,
                        inputRef: faviconInputRef,
                        hint: "تصویر مربع پیشنهاد می‌شود",
                      },
                    ] as const
                  ).map((item) => (
                    <div key={item.kind}>
                      <label className="mb-2 block text-[12px] font-bold text-neutral-600">
                        {item.label}
                      </label>
                      <button
                        type="button"
                        onClick={() => item.inputRef.current?.click()}
                        disabled={Boolean(uploadingPageImage)}
                        className="relative flex min-h-32 w-full overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200 bg-white transition hover:border-emerald-300 disabled:cursor-wait disabled:opacity-70"
                      >
                        {item.value ? (
                          <Image
                            src={item.value}
                            alt={`پیش‌نمایش ${item.label}`}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, 280px"
                            className="absolute inset-0 h-full w-full object-contain p-4"
                          />
                        ) : null}
                        <span
                          className={[
                            "relative z-10 flex w-full flex-col items-center justify-center px-3 py-5 text-center",
                            item.value
                              ? "bg-black/35 text-white opacity-0 transition hover:opacity-100"
                              : "text-neutral-500",
                          ].join(" ")}
                        >
                          {uploadingPageImage === item.kind ? (
                            <span className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <>
                              <HiOutlineCloudArrowUp className="mb-2 h-7 w-7" />
                              <span className="text-[12px] font-bold">
                                {item.value ? "تغییر تصویر" : "انتخاب و آپلود"}
                              </span>
                              <span className="mt-1 text-[10px] opacity-70">
                                {item.hint}
                              </span>
                            </>
                          )}
                        </span>
                      </button>
                      <input
                        ref={item.inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          void handlePageImageFile(
                            item.kind,
                            event.target.files?.[0],
                          );
                          event.target.value = "";
                        }}
                      />
                      {item.value ? (
                        <button
                          type="button"
                          onClick={() =>
                            item.kind === "logo"
                              ? onLogoChange?.("")
                              : onFaviconChange?.("")
                          }
                          disabled={Boolean(uploadingPageImage)}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg text-[11px] font-bold text-red-500 disabled:opacity-50"
                        >
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                          حذف
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div>
                  <span className="mb-2 block text-[12px] font-bold text-neutral-600">
                    شکل نمایش لوگو
                  </span>
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1.5 ring-1 ring-neutral-200">
                    {(
                      [
                        { value: "square", label: "مربعی" },
                        { value: "circle", label: "دایره‌ای" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onLogoShapeChange?.(option.value)}
                        className={[
                          "flex h-10 items-center justify-center gap-2 px-3 text-xs font-bold transition",
                          option.value === "circle"
                            ? "rounded-full"
                            : "rounded-lg",
                          logoShape === option.value
                            ? "bg-[#064789] text-white shadow-sm"
                            : "text-neutral-500 hover:bg-neutral-100",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-4 w-4 border-2",
                            option.value === "circle"
                              ? "rounded-full"
                              : "rounded-[3px]",
                            logoShape === option.value
                              ? "border-white"
                              : "border-neutral-400",
                          ].join(" ")}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {pageImageUploadError ? (
                  <p className="text-[11px] font-medium text-red-500">
                    {pageImageUploadError}
                  </p>
                ) : null}
              </section>

              <section className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
                <div>
                  <h3 className="text-[13px] font-black text-neutral-800">
                    پس‌زمینه صفحه
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                    رنگ پایه همیشه نمایش داده می‌شود و تصویر روی آن قرار
                    می‌گیرد.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-[12px] font-bold text-neutral-600">
                    رنگ پس‌زمینه
                  </label>
                  <div className="flex items-center gap-3">
                    <RgbaColorInput
                      value={backgroundColor}
                      onChange={onBackgroundColorChange}
                      className="min-w-0 flex-1"
                      swatchClassName="h-12 w-14 rounded-xl"
                      label="انتخاب رنگ پس‌زمینه"
                    />
                  </div>
                </div>

                <PageBackgroundPatternSettings
                  baseColor={backgroundColor}
                  pattern={normalizedBackgroundPattern}
                  onChange={onBackgroundPatternChange}
                />

                <div>
                  <label className="mb-2 block text-[12px] font-bold text-neutral-600">
                    تصویر پس‌زمینه
                  </label>
                  <button
                    type="button"
                    onClick={() => backgroundInputRef.current?.click()}
                    disabled={isBackgroundUploading}
                    className="relative flex min-h-36 w-full overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200 bg-white transition hover:border-emerald-300 disabled:cursor-wait disabled:opacity-75"
                  >
                    {backgroundImage && (
                      <img
                        src={backgroundImage}
                        alt="پیش‌نمایش تصویر پس‌زمینه"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <span
                      className={[
                        "relative z-10 flex w-full flex-col items-center justify-center px-4 py-6 text-center",
                        backgroundImage
                          ? "bg-black/45 text-white"
                          : "text-neutral-500",
                      ].join(" ")}
                    >
                      {isBackgroundUploading ? (
                        <>
                          <span className="mb-3 h-9 w-9 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                          <span className="text-[12px] font-bold">
                            در حال آپلود تصویر...
                          </span>
                        </>
                      ) : (
                        <>
                          <HiOutlineCloudArrowUp className="mb-2 h-8 w-8" />
                          <span className="text-[12px] font-bold">
                            {backgroundImage
                              ? "تغییر تصویر پس‌زمینه"
                              : "انتخاب تصویر پس‌زمینه"}
                          </span>
                          <span className="mt-1 text-[10px] opacity-75">
                            JPG, PNG, WebP, GIF یا AVIF - حداکثر ۱۰MB
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={(event) => {
                      void handleBackgroundFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />

                  {backgroundImage && (
                    <button
                      type="button"
                      onClick={() => onBackgroundImageChange?.("")}
                      disabled={isBackgroundUploading}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-500 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                      حذف تصویر پس‌زمینه
                    </button>
                  )}

                  {backgroundUploadError && (
                    <p className="mt-2 text-[11px] font-medium text-red-500">
                      {backgroundUploadError}
                    </p>
                  )}
                </div>
              </section>
            </>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-[13px] font-bold text-neutral-700">
                  دسته بندی قالب
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
              <TemplateBackgroundSettings
                color={backgroundColor}
                image={backgroundImage}
                pattern={normalizedBackgroundPattern}
                isUploading={isBackgroundUploading}
                uploadError={backgroundUploadError}
                inputRef={backgroundInputRef}
                onColorChange={onBackgroundColorChange}
                onImageChange={onBackgroundImageChange}
                onPatternChange={onBackgroundPatternChange}
                onFile={(file) => void handleBackgroundFile(file)}
              />
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
            disabled={
              isThumbnailUploading ||
              isBackgroundUploading ||
              Boolean(uploadingPageImage)
            }
            className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-[13px] font-bold text-neutral-600 transition-all hover:bg-neutral-100 active:scale-[0.97]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={
              isSaving ||
              isThumbnailUploading ||
              isBackgroundUploading ||
              Boolean(uploadingPageImage) ||
              !title.trim() ||
              (mode === "page" && !url.trim())
            }
            className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? mode === "template"
                ? "در حال ذخیره قالب..."
                : "در حال ذخیره صفحه..."
              : mode === "template"
                ? pageId
                  ? "ذخیره تغییرات قالب"
                  : "ساخت قالب"
                : pageId
                  ? "ذخیره تغییرات صفحه"
                  : "ساخت صفحه"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
