"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineArrowPath,
  HiOutlineDocumentDuplicate,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";
import { SelectField } from "@/builder/editor/form/SelectField";

type TemplateDraft = { name: string; description: string; categoryId: string };

export function TemplateFromPageModal({
  title,
  description,
  categories,
  loading,
  saving,
  error,
  onClose,
  onSave,
}: {
  title: string;
  description: string;
  categories: Array<{ value: string; label: string }>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (draft: TemplateDraft) => void;
}) {
  const id = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<TemplateDraft>({
    name: title,
    description,
    categoryId: "",
  });
  const canSubmit =
    !saving &&
    !loading &&
    Boolean(draft.name.trim()) &&
    Boolean(draft.categoryId);

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const activeElement = document.activeElement;
    const frame = requestAnimationFrame(() => nameInputRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      if (activeElement instanceof HTMLElement) activeElement.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  return createPortal(
    <div
      className="fixed inset-0 z-[500] flex items-end justify-center overflow-hidden bg-black/50 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-5"
      dir="rtl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        className="flex max-h-[92dvh] w-full min-w-0 flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.35)] animate-in slide-in-from-bottom-6 duration-300 sm:max-h-[min(88dvh,680px)] sm:max-w-lg sm:rounded-[28px] sm:zoom-in-95"
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]">
              <HiOutlineDocumentDuplicate size={20} />
            </span>
            <div className="min-w-0">
              <h2
                id={`${id}-title`}
                className="truncate text-[16px] font-black text-neutral-900 sm:text-[17px]"
              >
                ذخیره صفحه به‌عنوان قالب
              </h2>
              <p
                id={`${id}-description`}
                className="mt-1 truncate text-[11px] text-neutral-400 sm:text-xs"
              >
                طراحی فعلی به‌صورت یک قالب جدید ذخیره می‌شود
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="بستن"
            title="بستن"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 transition hover:bg-neutral-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiOutlineXMark size={20} />
          </button>
        </header>

        <form
          noValidate
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSave({ ...draft, name: draft.name.trim() });
          }}
        >
          <div className="builder-modal-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
            <div>
              <label
                htmlFor={`${id}-name`}
                className="mb-2 block text-[13px] font-bold text-neutral-700"
              >
                نام قالب <span className="text-red-400">*</span>
              </label>
              <input
                ref={nameInputRef}
                id={`${id}-name`}
                required
                disabled={saving}
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="مثلاً: قالب معرفی کسب‌وکار"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-bold text-neutral-700">
                دسته‌بندی <span className="text-red-400">*</span>
              </label>
              {loading ? (
                <div
                  role="status"
                  className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-[13px] text-neutral-400"
                >
                  <HiOutlineArrowPath size={16} className="animate-spin" />
                  <span>در حال دریافت دسته‌بندی‌ها...</span>
                </div>
              ) : categories.length > 0 ? (
                <fieldset
                  disabled={saving}
                  className={
                    saving ? "pointer-events-none opacity-60" : undefined
                  }
                >
                  <SelectField
                    value={draft.categoryId}
                    options={categories}
                    onChange={(categoryId) =>
                      setDraft((current) => ({ ...current, categoryId }))
                    }
                    placeholder="دسته‌بندی قالب را انتخاب کنید"
                  />
                </fieldset>
              ) : (
                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-[13px] text-neutral-400">
                  دسته‌بندی فعالی وجود ندارد
                </div>
              )}
            </div>

            {!loading && categories.length === 0 && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-700"
              >
                <HiOutlineExclamationTriangle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  ابتدا یک دسته‌بندی فعال در پنل مدیریت ایجاد کنید.
                </span>
              </div>
            )}

            <div>
              <label
                htmlFor={`${id}-description-field`}
                className="mb-2 block text-[13px] font-bold text-neutral-700"
              >
                توضیحات قالب
              </label>
              <textarea
                id={`${id}-description-field`}
                rows={3}
                disabled={saving}
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="یک توضیح کوتاه درباره کاربرد این قالب..."
                className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base leading-7 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex min-w-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[13px] leading-6 text-red-700"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span className="min-w-0 flex-1 break-words">{error}</span>
              </div>
            )}
          </div>

          <footer className="flex shrink-0 gap-3 border-t border-neutral-100 bg-neutral-50/50 p-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-[13px] font-bold text-neutral-600 transition-all hover:bg-neutral-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              aria-busy={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <HiOutlineArrowPath size={17} className="animate-spin" />}
              <span>{saving ? "در حال ساخت قالب..." : "ساخت قالب"}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
