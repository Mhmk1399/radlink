"use client";

import { useCallback, useRef, useState } from "react";

import {
  HiOutlinePlus,
  HiOutlineDocumentDuplicate,
  HiOutlineTrash,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineBars3,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLink,
  HiOutlineCloudArrowUp,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineSwatch,
} from "react-icons/hi2";
import {
  getIdentityInputProps,
  sanitizeIdentityField,
  validateIdentityField,
} from "@/lib/validation/identityFields";
import { uploadFile } from "@/lib/fileUtils";
import { LinkTypeHelp } from "./LinkTypeHelp";
import { RgbaColorInput } from "./RgbaColorInput";
import {
  getMessengerPresetConfig,
  isMessengerLinkPreset,
  normalizeMessengerIdentifier,
  type MessengerLinkPreset,
} from "@/lib/messengerLinks";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type RepeaterSubField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "boolean" | "url" | "image" | "color" | "select";
  options?: ReadonlyArray<{
    value: string;
    label: string;
  }>;
  defaultValue?: unknown;
  linkPreset?: MessengerLinkPreset;
  linkPresetFromField?: string;
};

type RepeaterItem = Record<string, unknown> & { id: string };

type RepeaterFieldProps = {
  dataKey: string;
  label: string;
  itemLabel?: string;
  addLabel?: string;
  maxItems?: number;
  fields: ReadonlyArray<RepeaterSubField>;
  items: RepeaterItem[];
  onChange: (key: string, value: unknown) => void;
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function generateItemId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createEmptyItem(
  prefix: string,
  fields: ReadonlyArray<RepeaterSubField>,
): RepeaterItem {
  const item: RepeaterItem = { id: generateItemId(prefix) };

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      item[field.key] = field.defaultValue;
    } else if (field.type === "boolean") {
      item[field.key] = false;
    } else if (field.type === "select") {
      item[field.key] = field.options?.[0]?.value ?? "";
    } else {
      item[field.key] = "";
    }
  }

  return item;
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
/*  Inline Image Upload (for repeater items)                           */
/* ================================================================== */

function RepeaterImageField({
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
          error instanceof Error
            ? error.message
            : "آپلود تصویر با خطا مواجه شد.",
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
    <div className="space-y-2">
      {/* Mode toggle */}
      <div className="flex gap-[2px] rounded-lg bg-neutral-100 p-[2px]">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={[
            "flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-semibold transition-all",
            mode === "upload"
              ? "bg-white text-neutral-800 shadow-sm"
              : "text-neutral-400",
          ].join(" ")}
        >
          <HiOutlineCloudArrowUp size={12} />
          آپلود
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={[
            "flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-[10px] font-semibold transition-all",
            mode === "url"
              ? "bg-white text-neutral-800 shadow-sm"
              : "text-neutral-400",
          ].join(" ")}
        >
          <HiOutlineLink size={12} />
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
            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-5 text-center transition-all",
            isDragging
              ? "border-neutral-400 bg-neutral-100"
              : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white",
            isUploading ? "pointer-events-none" : "",
          ].join(" ")}
        >
          {isUploading ? (
            <>
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
              <p className="text-[11px] font-semibold text-neutral-600">
                در حال آپلود...
              </p>
              <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <HiOutlinePhoto size={24} className="mb-1.5 text-neutral-300" />
              <p className="text-[11px] font-semibold text-neutral-600">
                تصویر را بکشید یا کلیک کنید
              </p>
              <p className="mt-0.5 text-[9px] text-neutral-400">
                PNG, JPG, WebP
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

      {/* URL input */}
      {mode === "url" && (
        <div className="relative">
          <HiOutlineLink
            size={12}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewError(false);
            }}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-8 pr-3 font-mono text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            dir="ltr"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      )}

      {/* Preview */}
      {hasPreview && (
        <div className="group relative overflow-hidden rounded-xl border border-neutral-200">
          <img
            src={value}
            alt={label}
            onError={() => setPreviewError(true)}
            className="h-24 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setPreviewError(false);
              }}
              className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 shadow-lg backdrop-blur"
            >
              <HiOutlineXMark size={12} />
              حذف
            </button>
          </div>
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 shadow-sm backdrop-blur">
            <HiOutlineCheck size={9} />
            آپلود شده
          </div>
        </div>
      )}

      {value && !hasPreview && previewError && (
        <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-medium text-red-600">
          <HiOutlineXMark size={11} />
          لینک نامعتبر
        </div>
      )}
      {uploadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-medium text-red-600">
          {uploadError}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function RepeaterField({
  dataKey,
  label,
  itemLabel = "آیتم",
  addLabel = "افزودن",
  maxItems,
  fields,
  items,
  onChange,
}: RepeaterFieldProps) {
  const safeItems: RepeaterItem[] = Array.isArray(items) ? items : [];
  const canAdd = maxItems === undefined || safeItems.length < maxItems;

  const updateItems = useCallback(
    (next: RepeaterItem[]) => {
      onChange(dataKey, next);
    },
    [dataKey, onChange],
  );

  const addItem = useCallback(() => {
    if (!canAdd) return;
    const newItem = createEmptyItem(dataKey, fields);
    updateItems([...safeItems, newItem]);
  }, [canAdd, dataKey, fields, safeItems, updateItems]);

  const duplicateItem = useCallback(
    (id: string) => {
      if (!canAdd) return;
      const source = safeItems.find((item) => item.id === id);
      if (!source) return;
      updateItems([
        ...safeItems,
        { ...source, id: generateItemId(`${dataKey}-copy`) },
      ]);
    },
    [canAdd, dataKey, safeItems, updateItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      updateItems(safeItems.filter((item) => item.id !== id));
    },
    [safeItems, updateItems],
  );

  const moveItem = useCallback(
    (id: string, direction: "up" | "down") => {
      const idx = safeItems.findIndex((item) => item.id === id);
      if (idx === -1) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= safeItems.length) return;
      const next = [...safeItems];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      updateItems(next);
    },
    [safeItems, updateItems],
  );

  const updateItemField = useCallback(
    (id: string, fieldKey: string, value: unknown) => {
      updateItems(
        safeItems.map((item) =>
          item.id === id ? { ...item, [fieldKey]: value } : item,
        ),
      );
    },
    [safeItems, updateItems],
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineBars3 size={15} className="text-neutral-400" />
          <span className="text-[13px] font-bold text-neutral-800">
            {label}
          </span>
        </div>
        <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-500">
          {safeItems.length} {itemLabel}
        </span>
      </div>

      {/* Items */}
      {safeItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-8 text-center text-[12px] text-neutral-400">
          هنوز {itemLabel}ی اضافه نشده
        </div>
      ) : (
        <div className="space-y-2">
          {safeItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 transition hover:border-neutral-300"
            >
              {/* Item header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-500">
                  {itemLabel} {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, "up")}
                    disabled={index === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30"
                    title="بالا"
                  >
                    <HiOutlineChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(item.id, "down")}
                    disabled={index === safeItems.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30"
                    title="پایین"
                  >
                    <HiOutlineChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateItem(item.id)}
                    disabled={!canAdd}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30"
                    title="کپی"
                  >
                    <HiOutlineDocumentDuplicate size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-500"
                    title="حذف"
                  >
                    <HiOutlineTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Item fields */}
              <div className="space-y-2.5">
                {fields.map((field) => {
                  const fieldValue = item[field.key];

                  /* ── Boolean ── */
                  if (field.type === "boolean") {
                    const checked = Boolean(fieldValue);
                    return (
                      <label
                        key={field.key}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5"
                      >
                        <span className="text-[12px] font-medium text-neutral-600">
                          {field.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold transition",
                              checked
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-neutral-100 text-neutral-400",
                            ].join(" ")}
                          >
                            {checked ? (
                              <HiOutlineEye size={10} />
                            ) : (
                              <HiOutlineEyeSlash size={10} />
                            )}
                            {checked ? "فعال" : "غیرفعال"}
                          </span>
                          <span
                            className={[
                              "relative flex h-5 w-9 items-center rounded-full border p-0.5 transition-all duration-200",
                              checked
                                ? "border-emerald-300 bg-emerald-100"
                                : "border-neutral-200 bg-neutral-100",
                            ].join(" ")}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                updateItemField(
                                  item.id,
                                  field.key,
                                  e.target.checked,
                                )
                              }
                              className="sr-only"
                            />
                            <span
                              className={[
                                "block h-4 w-4 rounded-full shadow-sm transition-all duration-200",
                                checked
                                  ? "translate-x-0 bg-emerald-500"
                                  : "-translate-x-4 bg-neutral-400",
                              ].join(" ")}
                            />
                          </span>
                        </div>
                      </label>
                    );
                  }

                  /* ── Textarea ── */
                  if (field.type === "textarea") {
                    return (
                      <div key={field.key}>
                        <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
                          {field.label}
                        </label>
                        <textarea
                          value={String(fieldValue ?? "")}
                          rows={3}
                          onChange={(e) =>
                            updateItemField(item.id, field.key, e.target.value)
                          }
                          className="w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-base leading-7 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
                          placeholder={field.label}
                        />
                      </div>
                    );
                  }

                  /* ── Image (with upload + url) ── */
                  if (field.type === "image") {
                    return (
                      <div key={field.key}>
                        <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
                          {field.label}
                        </label>
                        <RepeaterImageField
                          value={String(fieldValue ?? "")}
                          label={field.label}
                          onChange={(url) =>
                            updateItemField(item.id, field.key, url)
                          }
                        />
                      </div>
                    );
                  }

                  /* ── URL ── */
                  if (field.type === "color") {
                    return (
                      <div key={field.key}>
                        <label className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                          <HiOutlineSwatch size={12} />
                          {field.label}
                        </label>
                        <RgbaColorInput
                          value={String(fieldValue ?? "")}
                          label={field.label}
                          onChange={(color) =>
                            updateItemField(item.id, field.key, color)
                          }
                          className="min-w-0"
                          swatchClassName="h-10 w-11 rounded-xl"
                          inputClassName="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
                        />
                      </div>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <div key={field.key}>
                        <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
                          {field.label}
                        </label>
                        <select
                          value={String(fieldValue ?? "")}
                          onChange={(e) =>
                            updateItemField(item.id, field.key, e.target.value)
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-base text-neutral-800 outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
                        >
                          {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === "url") {
                    return (
                      <div key={field.key}>
                        <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
                          {field.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative min-w-0 flex-1">
                            <HiOutlineLink
                            size={12}
                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
                          />
                            <input
                            type="url"
                            value={String(fieldValue ?? "")}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                field.key,
                                e.target.value,
                              )
                            }
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-8 pr-3 font-mono text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
                            dir="ltr"
                            placeholder="https://example.com"
                            />
                          </div>
                          <LinkTypeHelp />
                        </div>
                      </div>
                    );
                  }

                  /* ── Text (default) ── */
                  const dynamicPresetValue = field.linkPresetFromField
                    ? item[field.linkPresetFromField]
                    : undefined;
                  const dynamicPreset = isMessengerLinkPreset(
                    dynamicPresetValue,
                  )
                    ? dynamicPresetValue
                    : undefined;
                  const linkPreset = field.linkPreset ?? dynamicPreset;

                  if (linkPreset) {
                    const presetConfig = getMessengerPresetConfig(linkPreset);
                    const identifier = normalizeMessengerIdentifier(
                      fieldValue,
                      linkPreset,
                    );

                    return (
                      <div key={field.key}>
                        <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
                          {field.label}
                        </label>
                        <div
                          className="flex min-w-0 items-stretch overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 transition focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-100"
                          dir="ltr"
                        >
                          <span className="flex shrink-0 select-none items-center border-r border-neutral-200 bg-neutral-100 px-2.5 font-mono text-[11px] font-semibold text-neutral-500">
                            {presetConfig.prefix}
                          </span>
                          <input
                            type="text"
                            value={identifier}
                            onChange={(e) =>
                              updateItemField(
                                item.id,
                                field.key,
                                normalizeMessengerIdentifier(
                                  e.target.value,
                                  linkPreset,
                                ),
                              )
                            }
                            inputMode={presetConfig.inputMode ?? "text"}
                            maxLength={presetConfig.maxLength ?? 50}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-base text-neutral-800 outline-none placeholder:text-neutral-400"
                            placeholder={presetConfig.placeholder}
                          />
                        </div>
                      </div>
                    );
                  }

                  const identityInputProps = getIdentityInputProps(field.key);
                  const identityError = validateIdentityField(
                    field.key,
                    fieldValue,
                  );
                  return (
                    <div key={field.key}>
                      <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={String(fieldValue ?? "")}
                        onChange={(e) =>
                          updateItemField(
                            item.id,
                            field.key,
                            sanitizeIdentityField(field.key, e.target.value),
                          )
                        }
                        inputMode={identityInputProps.inputMode}
                        maxLength={identityInputProps.maxLength}
                        dir={identityInputProps.dir}
                        aria-invalid={Boolean(identityError)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
                        placeholder={field.label}
                      />
                      {identityError && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {identityError}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      {canAdd && (
        <button
          type="button"
          onClick={addItem}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-3 text-[13px] font-bold text-neutral-600 transition hover:border-neutral-400 hover:bg-white active:scale-[0.98]"
        >
          <HiOutlinePlus size={16} />
          {addLabel}
        </button>
      )}

      {maxItems !== undefined && (
        <p className="text-center text-[10px] text-neutral-400">
          حداکثر {maxItems} {itemLabel}
        </p>
      )}
    </div>
  );
}
