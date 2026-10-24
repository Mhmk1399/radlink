"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineXMark } from "react-icons/hi2";

type TemplateDraft = { name: string; description: string; categoryId: string };

export function TemplateFromPageModal({ title, description, categories, loading, saving, error, onClose, onSave }: {
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
  const [draft, setDraft] = useState<TemplateDraft>({ name: title, description, categoryId: "" });
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", escape);
    };
  }, [onClose, saving]);

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" dir="rtl"
      onMouseDown={event => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="text-lg font-black text-neutral-900">ذخیره صفحه به‌عنوان قالب</h2>
          <button type="button" disabled={saving} onClick={onClose} aria-label="بستن" className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"><HiOutlineXMark size={20} /></button>
        </div>
        <p className="mt-2 text-xs leading-6 text-neutral-500">بلاک‌ها و طراحی فعلی به‌عنوان یک قالب جدید ذخیره می‌شوند. می‌توانید ویرایش صفحه را ادامه دهید.</p>
        <form className="mt-5 space-y-4" onSubmit={event => { event.preventDefault(); if (!saving && !loading) onSave({ ...draft, name: draft.name.trim() }); }}>
          <fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
            <label className="block text-xs font-bold text-neutral-700">نام قالب
              <input required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-base outline-none focus:border-blue-400" />
            </label>
            <label className="block text-xs font-bold text-neutral-700">دسته‌بندی
              <select required disabled={loading} value={draft.categoryId} onChange={event => setDraft({ ...draft, categoryId: event.target.value })} className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base outline-none focus:border-blue-400">
                <option value="">{loading ? "در حال دریافت دسته‌بندی‌ها..." : "انتخاب دسته‌بندی"}</option>
                {categories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              {!loading && categories.length === 0 && <span className="mt-2 block font-normal text-amber-700">ابتدا یک دسته‌بندی فعال در پنل مدیریت بسازید.</span>}
            </label>
            <label className="block text-xs font-bold text-neutral-700">توضیحات قالب
              <textarea rows={3} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} className="mt-2 w-full resize-y rounded-xl border border-neutral-200 px-3 py-2.5 text-base font-normal outline-none focus:border-blue-400" />
            </label>
          </fieldset>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs leading-6 text-red-700">{error}</p>}
          <button type="submit" disabled={saving || loading || !draft.name.trim() || !draft.categoryId} className="w-full rounded-xl bg-[#064789] px-4 py-3 text-sm font-bold text-white hover:bg-[#05396e] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "در حال ساخت قالب..." : "ساخت قالب از این صفحه"}</button>
        </form>
      </section>
    </div>, document.body,
  );
}
