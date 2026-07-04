"use client";

import {
  ContentFieldType,
  MessengerLinkPreset,
  RepeaterFieldConfig,
} from "@/types/blocks/builder.types";
import { useCallback, useRef, useState } from "react";

import {
  HiOutlinePencil,
  HiOutlineLink,
  HiOutlinePhoto,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCloudArrowUp,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineFilm,
  HiOutlineBars3,
} from "react-icons/hi2";
import {
  getIdentityInputProps,
  sanitizeIdentityField,
  validateIdentityField,
} from "@/lib/validation/identityFields";
import { PersianDateTimePicker } from "./PersianDateTimePicker";
import { RepeaterField } from "./RepeaterField";
import { SelectField } from "./SelectField";
import type { SelectFieldConfig } from "@/types/blocks/builder.types";
import { uploadFile } from "@/lib/fileUtils";
import { LinkTypeHelp } from "./LinkTypeHelp";
import {
  getMessengerPresetConfig,
  normalizeMessengerIdentifier,
} from "@/lib/messengerLinks";
/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export type DynamicContentField = {
  key: string;
  label: string;
  type: ContentFieldType;
  linkPreset?: MessengerLinkPreset;
};

type DynamicContentFormProps = {
  fields: readonly DynamicContentField[];
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function getFieldIcon(type: ContentFieldType): React.ReactNode {
  switch (type) {
    case "text":
      return <HiOutlinePencil size={14} />;
    case "select":
      return <HiOutlineBars3 size={14} />;

    case "textarea":
      return <HiOutlineDocumentText size={14} />;
    case "url":
      return <HiOutlineLink size={14} />;
    case "video":
      return <HiOutlineFilm size={14} />; // ← اضافه کن

    case "image":
      return <HiOutlinePhoto size={14} />;
    case "boolean":
      return <HiOutlineEye size={14} />;
    case "repeater":
      return <HiOutlineBars3 size={14} />;
    default:
      return <HiOutlinePencil size={14} />;
  }
}

function getFieldTypeLabel(type: ContentFieldType): string {
  switch (type) {
    case "text":
      return "متن";
    case "textarea":
      return "چندخطی";
    case "select":
      return "انتخابی";

    case "url":
      return "لینک";
    case "repeater":
      return "لیست تکراری";

    case "image":
      return "تصویر";
    case "boolean":
      return "روشن/خاموش";
    default:
      return "فیلد";
  }
}

/* ================================================================== */
/*  Separator variant preview (for select dropdown)                    */
/* ================================================================== */

function SeparatorPreview({ variant }: { variant: string }) {
  const baseClass = "h-[20px] w-[48px] flex items-center justify-center";

  switch (variant) {
    case "solid":
      return (
        <div className={baseClass}>
          <div className="h-[2px] w-full rounded-full bg-neutral-400" />
        </div>
      );

    case "dashed":
      return (
        <div className={baseClass}>
          <div className="h-0 w-full border-t-2 border-dashed border-neutral-400" />
        </div>
      );

    case "dotted":
      return (
        <div className={baseClass}>
          <div className="h-0 w-full border-t-2 border-dotted border-neutral-400" />
        </div>
      );

    case "double":
      return (
        <div className={`${baseClass} flex-col gap-[3px]`}>
          <div className="h-[1.5px] w-full rounded-full bg-neutral-400" />
          <div className="h-[1.5px] w-full rounded-full bg-neutral-400" />
        </div>
      );

    case "fade":
      return (
        <div className={baseClass}>
          <div
            className="h-[2px] w-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #9ca3af, transparent)",
            }}
          />
        </div>
      );

    case "zigzag":
      return (
        <div className={baseClass}>
          <span className="text-[8px] tracking-[-1px] text-neutral-400">
            ∧∨∧∨∧∨∧∨
          </span>
        </div>
      );

    case "wave":
      return (
        <div className={baseClass}>
          <span className="text-[10px] tracking-[-1px] text-neutral-400">
            ∿∿∿∿∿∿
          </span>
        </div>
      );

    case "diamond":
      return (
        <div className={`${baseClass} gap-1`}>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
          <span className="text-[10px] text-neutral-500">◆</span>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
        </div>
      );

    case "star":
      return (
        <div className={`${baseClass} gap-1`}>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
          <span className="text-[10px] text-neutral-500">✦</span>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
        </div>
      );

    case "dot-ornament":
      return (
        <div className={`${baseClass} gap-1`}>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
          <span className="text-[8px] tracking-wider text-neutral-500">
            ● ● ●
          </span>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
        </div>
      );

    case "arrow":
      return (
        <div className={`${baseClass} gap-1`}>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
          <span className="text-[10px] text-neutral-500">▼</span>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
        </div>
      );

    case "heart":
      return (
        <div className={`${baseClass} gap-1`}>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
          <span className="text-[10px] text-red-400">♥</span>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
        </div>
      );

    case "leaf":
      return (
        <div className={`${baseClass} gap-1`}>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
          <span className="text-[10px] text-emerald-500">❧</span>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
        </div>
      );

    case "sparkle":
      return (
        <div className={`${baseClass} gap-1`}>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
          <span className="text-[8px] tracking-wider text-amber-400">
            ✧ ✦ ✧
          </span>
          <div className="h-[1.5px] flex-1 bg-neutral-300" />
        </div>
      );

    default:
      return (
        <div className={baseClass}>
          <div className="h-[2px] w-full bg-neutral-300" />
        </div>
      );
  }
}

function getInputType(type: ContentFieldType): "text" | "url" {
  return type === "url" || type === "image" ? "url" : "text";
}

function toInputValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  return "";
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/* ================================================================== */
/*  Image Upload                                                       */
/* ================================================================== */

function ImageUploadField({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (url: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const hasPreview = isValidImageUrl(value) && !previewError;

  const uploadSelectedFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadProgress(20);
      setUploadError(null);
      try {
        const uploaded = await uploadFile(file);
        setUploadProgress(100);
        onChange(uploaded.url);
        setMode("url");
        setPreviewError(false);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "آپلود تصویر با خطا مواجه شد.",
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [onChange],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const f = files[0];
      if (!f.type.startsWith("image/")) return;
      void uploadSelectedFile(f);
    },
    [uploadSelectedFile],
  );

  return (
    <div className="space-y-2.5">
      {/* Mode toggle */}
      <div className="flex gap-[3px] rounded-xl bg-neutral-100 p-[3px]">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all",
            mode === "upload"
              ? "bg-white text-neutral-800 shadow-sm"
              : "text-neutral-400",
          ].join(" ")}
        >
          <HiOutlineCloudArrowUp size={13} /> آپلود
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all",
            mode === "url"
              ? "bg-white text-neutral-800 shadow-sm"
              : "text-neutral-400",
          ].join(" ")}
        >
          <HiOutlineLink size={13} /> لینک
        </button>
      </div>

      {/* Upload zone */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileRef.current?.click()}
          className={[
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all",
            isDragging
              ? "border-neutral-400 bg-neutral-100"
              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white",
            isUploading ? "pointer-events-none" : "",
          ].join(" ")}
        >
          {isUploading ? (
            <>
              <div className="mb-2.5 h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
              <p className="text-[12px] font-semibold text-neutral-600">
                در حال آپلود...
              </p>
              <div className="mt-2.5 h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 font-mono text-[10px] text-neutral-400">
                {Math.round(uploadProgress)}%
              </p>
            </>
          ) : (
            <>
              <HiOutlineCloudArrowUp
                size={32}
                className="mb-2 text-neutral-300"
              />
              <p className="text-[12px] font-semibold text-neutral-600">
                تصویر را بکشید اینجا
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                یا کلیک کنید برای انتخاب
              </p>
              <p className="mt-2.5 text-[10px] text-neutral-400">
                PNG, JPG, WebP — حداکثر 5MB
              </p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* URL input — text-base prevents iOS zoom */}
      {mode === "url" && (
        <div className="relative">
          <HiOutlineLink
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewError(false);
            }}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-3 font-mono text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            dir="ltr"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}

      {/* Preview */}
      {hasPreview && (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200">
          <img
            src={value}
            alt={label}
            onError={() => setPreviewError(true)}
            className="h-36 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setPreviewError(false);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold text-red-600 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <HiOutlineXMark size={13} /> حذف تصویر
            </button>
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-emerald-600 shadow-sm backdrop-blur">
            <HiOutlineCheck size={11} /> آپلود شده
          </div>
        </div>
      )}

      {value && !hasPreview && previewError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-600">
          <HiOutlineXMark size={13} /> لینک تصویر نامعتبر است
        </div>
      )}
      {uploadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-600">
          {uploadError}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Video Upload                                                       */
/* ================================================================== */

function VideoUploadField({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (url: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const hasPreview = Boolean(value);

  const uploadSelectedFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadProgress(20);
      setUploadError(null);
      try {
        const uploaded = await uploadFile(file);
        setUploadProgress(100);
        onChange(uploaded.url);
        setMode("url");
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "آپلود ویدئو با خطا مواجه شد.",
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [onChange],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const f = files[0];
      if (!f.type.startsWith("video/")) return;
      void uploadSelectedFile(f);
    },
    [uploadSelectedFile],
  );

  return (
    <div className="space-y-2.5">
      {/* Mode toggle */}
      <div className="flex gap-[3px] rounded-xl bg-neutral-100 p-[3px]">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all",
            mode === "upload"
              ? "bg-white text-neutral-800 shadow-sm"
              : "text-neutral-400",
          ].join(" ")}
        >
          <HiOutlineCloudArrowUp size={13} />
          آپلود
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={[
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all",
            mode === "url"
              ? "bg-white text-neutral-800 shadow-sm"
              : "text-neutral-400",
          ].join(" ")}
        >
          <HiOutlineLink size={13} />
          لینک
        </button>
      </div>

      {/* Upload zone */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileRef.current?.click()}
          className={[
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all",
            isDragging
              ? "border-neutral-400 bg-neutral-100"
              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white",
            isUploading ? "pointer-events-none" : "",
          ].join(" ")}
        >
          {isUploading ? (
            <>
              <div className="mb-2.5 h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
              <p className="text-[12px] font-semibold text-neutral-600">
                در حال آپلود ویدئو...
              </p>
              <div className="mt-2.5 h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 font-mono text-[10px] text-neutral-400">
                {Math.round(uploadProgress)}%
              </p>
            </>
          ) : (
            <>
              <HiOutlineFilm size={32} className="mb-2 text-neutral-300" />
              <p className="text-[12px] font-semibold text-neutral-600">
                ویدئو را بکشید اینجا
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                یا کلیک کنید برای انتخاب
              </p>
              <p className="mt-2.5 text-[10px] text-neutral-400">
                MP4, WebM, MOV — حداکثر 50MB
              </p>
            </>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* URL input */}
      {mode === "url" && (
        <div className="relative">
          <HiOutlineLink
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-3 font-mono text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            dir="ltr"
            placeholder="https://example.com/video.mp4"
          />
        </div>
      )}

      {/* Preview */}
      {hasPreview && (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200">
          <video
            src={value}
            className="aspect-video w-full bg-black object-cover"
            muted
            playsInline
            preload="metadata"
          />
          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold text-red-600 shadow-lg backdrop-blur transition hover:bg-white"
            >
              <HiOutlineXMark size={13} />
              حذف ویدئو
            </button>
          </div>
          {/* Badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-emerald-600 shadow-sm backdrop-blur">
            <HiOutlineCheck size={11} />
            آپلود شده
          </div>
        </div>
      )}
      {uploadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] font-medium text-red-600">
          {uploadError}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Sub                                                                */
/* ================================================================== */

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 pb-2">
      <div className="flex items-center gap-2">
        <HiOutlinePencil size={15} className="text-neutral-400" />
        <h3 className="text-[14px] font-bold text-neutral-800">{label}</h3>
      </div>
      {count !== undefined && count > 0 && (
        <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-500">
          {count} فیلد
        </span>
      )}
    </div>
  );
}

function EmptyNotice({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-10 text-center">
      <span className="mb-2.5 text-neutral-300">{icon}</span>
      <p className="text-[12px] leading-5 text-neutral-500">{text}</p>
    </div>
  );
}

function FieldCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5 transition hover:border-neutral-200 hover:bg-white",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FieldHeader({
  icon,
  label,
  type,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-neutral-500">{icon}</span>
        <span className="text-[13px] font-semibold text-neutral-700">
          {label}
        </span>
      </div>
      <span className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-400 shadow-sm">
        {type}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Main                                                               */
/* ================================================================== */

export function DynamicContentForm({
  fields,
  data,
  onChange,
}: DynamicContentFormProps) {
  if (fields.length === 0) {
    return (
      <section className="space-y-3">
        <SectionHeader label="محتوا" />
        <EmptyNotice
          icon={<HiOutlineDocumentText size={26} />}
          text="برای این بلاک، فیلد محتوایی تعریف نشده."
        />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <SectionHeader label="محتوا" count={fields.length} />

      <div className="space-y-2.5">
        {fields.map((field) => {
          const value = data[field.key];
          const isUrlLike = field.type === "url";
          const icon = getFieldIcon(field.type);

          /* Boolean */
          if (field.type === "boolean") {
            const checked = Boolean(value);
            return (
              <label key={field.key} className="block cursor-pointer">
                <FieldCard className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500">{icon}</span>
                      <span className="text-[13px] font-semibold text-neutral-700">
                        {field.label}
                      </span>
                    </div>
                    <p className="mt-1 pr-6 text-[11px] text-neutral-400">
                      نمایش یا پنهان‌سازی
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span
                      className={[
                        "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition",
                        checked
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-neutral-100 text-neutral-400",
                      ].join(" ")}
                    >
                      {checked ? (
                        <HiOutlineEye size={12} />
                      ) : (
                        <HiOutlineEyeSlash size={12} />
                      )}
                      {checked ? "فعال" : "غیرفعال"}
                    </span>
                    <span
                      className={[
                        "relative flex h-6 w-10 items-center rounded-full border p-0.5 transition-all duration-200",
                        checked
                          ? "border-emerald-300 bg-emerald-100"
                          : "border-neutral-200 bg-neutral-100",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(field.key, e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className={[
                          "block h-5 w-5 rounded-full shadow-sm transition-all duration-200",
                          checked
                            ? "translate-x-0 bg-emerald-500"
                            : "-translate-x-4 bg-neutral-400",
                        ].join(" ")}
                      />
                    </span>
                  </div>
                </FieldCard>
              </label>
            );
          }
          /* Image */
          if (field.type === "image") {
            return (
              <FieldCard key={field.key}>
                <FieldHeader
                  icon={icon}
                  label={field.label}
                  type={getFieldTypeLabel(field.type)}
                />
                <ImageUploadField
                  value={toInputValue(value)}
                  label={field.label}
                  onChange={(url) => onChange(field.key, url)}
                />
              </FieldCard>
            );
          }

          /* ── Video field with upload ── */
          if (field.type === "video") {
            return (
              <FieldCard key={field.key}>
                <FieldHeader
                  icon={icon}
                  label={field.label}
                  type={getFieldTypeLabel(field.type)}
                />
                <VideoUploadField
                  value={toInputValue(value)}
                  label={field.label}
                  onChange={(url) => onChange(field.key, url)}
                />
              </FieldCard>
            );
          }
          /* ── DateTime field with Persian calendar ── */
          if (field.type === "datetime") {
            return (
              <FieldCard key={field.key}>
                <FieldHeader
                  icon={icon}
                  label={field.label}
                  type={getFieldTypeLabel(field.type)}
                />
                <PersianDateTimePicker
                  value={toInputValue(value)}
                  onChange={(iso) => onChange(field.key, iso)}
                />
              </FieldCard>
            );
          }

          /* ── Repeater field ── */
          if (field.type === "repeater") {
            const repeaterConfig = field as RepeaterFieldConfig;
            const repeaterItems = Array.isArray(value)
              ? (value as Array<Record<string, unknown> & { id: string }>)
              : [];

            return (
              <FieldCard key={field.key}>
                <RepeaterField
                  dataKey={field.key}
                  label={repeaterConfig.label}
                  itemLabel={repeaterConfig.itemLabel}
                  addLabel={repeaterConfig.addLabel}
                  maxItems={repeaterConfig.maxItems}
                  fields={repeaterConfig.fields}
                  items={repeaterItems}
                  onChange={onChange}
                />
              </FieldCard>
            );
          }
          /* ── Select field ── */
          if (field.type === "select") {
            const selectConfig = field as SelectFieldConfig;

            /* Build options with optional preview for separator variants */
            const options = selectConfig.options.map((opt) => {
              let preview: React.ReactNode = undefined;

              /* Separator variant previews */
              if (selectConfig.key === "variant") {
                preview = <SeparatorPreview variant={opt.value} />;
              }

              return {
                value: opt.value,
                label: opt.label,
                preview,
              };
            });

            return (
              <FieldCard key={field.key}>
                <FieldHeader
                  icon={icon}
                  label={field.label}
                  type={getFieldTypeLabel(field.type)}
                />
                <SelectField
                  value={String(value ?? "")}
                  options={options}
                  onChange={(val) => onChange(field.key, val)}
                />
              </FieldCard>
            );
          }

          /* Textarea */
          if (field.type === "textarea") {
            return (
              <FieldCard key={field.key}>
                <FieldHeader
                  icon={icon}
                  label={field.label}
                  type={getFieldTypeLabel(field.type)}
                />
                {/* text-base = 16px → no iOS zoom */}
                <textarea
                  value={toInputValue(value)}
                  rows={4}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base leading-7 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                  placeholder="متن این بخش را وارد کن"
                />
              </FieldCard>
            );
          }

          if (field.linkPreset) {
            const preset = field.linkPreset;
            const presetConfig = getMessengerPresetConfig(preset);
            const identifier = normalizeMessengerIdentifier(value, preset);

            return (
              <FieldCard key={field.key}>
                <FieldHeader
                  icon={<HiOutlineLink size={14} />}
                  label={field.label}
                  type="شناسه"
                />
                <div
                  className="flex min-w-0 items-stretch overflow-hidden rounded-xl border border-neutral-200 bg-white transition focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-100"
                  dir="ltr"
                >
                  <span className="flex shrink-0 select-none items-center border-r border-neutral-200 bg-neutral-100 px-2.5 font-mono text-[12px] font-semibold text-neutral-500">
                    {presetConfig.prefix}
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(event) =>
                      onChange(
                        field.key,
                        normalizeMessengerIdentifier(event.target.value, preset),
                      )
                    }
                    inputMode={preset === "whatsapp" ? "tel" : "text"}
                    maxLength={preset === "whatsapp" ? 15 : 30}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-white px-3 py-2.5 font-mono text-base text-neutral-800 outline-none placeholder:text-neutral-400"
                    placeholder={presetConfig.placeholder}
                    aria-label={field.label}
                  />
                </div>
                <p className="mt-1.5 text-[10px] leading-5 text-neutral-400">
                  فقط شناسه را وارد کنید؛ بخش ابتدایی لینک ثابت است.
                </p>
              </FieldCard>
            );
          }

          /* Text / URL */
          const identityInputProps = getIdentityInputProps(field.key);
          const identityError = validateIdentityField(field.key, value);
          return (
            <FieldCard key={field.key}>
              <FieldHeader
                icon={icon}
                label={field.label}
                type={getFieldTypeLabel(field.type)}
              />
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  {isUrlLike && (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <HiOutlineLink size={14} />
                  </span>
                  )}
                {/* text-base = 16px → no iOS zoom */}
                  <input
                  type={getInputType(field.type)}
                  value={toInputValue(value)}
                  onChange={(e) =>
                    onChange(
                      field.key,
                      sanitizeIdentityField(field.key, e.target.value),
                    )
                  }
                  className={[
                    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100",
                    isUrlLike ? "pl-10 font-mono text-[14px]" : "",
                  ].join(" ")}
                  dir={identityInputProps.dir ?? (isUrlLike ? "ltr" : "rtl")}
                  inputMode={identityInputProps.inputMode}
                  maxLength={identityInputProps.maxLength}
                  aria-invalid={Boolean(identityError)}
                  placeholder={
                    field.type === "url"
                      ? "https://example.com"
                      : "متن را وارد کن"
                  }
                  />
                </div>
                {isUrlLike && <LinkTypeHelp />}
              </div>
              {identityError && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {identityError}
                </p>
              )}
            </FieldCard>
          );
        })}
      </div>
    </section>
  );
}
