"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";

type PermissionOption = { _id: string; name: string; description?: string; isActive: boolean };
type Props = {
  userId: string;
  userName: string;
  headers?: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
};

export default function UserPermissionModal({ userId, userName, headers, onClose, onSaved }: Props) {
  const t = useThemeTokens();
  const dialog = useRef<HTMLDialogElement>(null);
  const [permissions, setPermissions] = useState<PermissionOption[]>([]);
  const [currentIds, setCurrentIds] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/users/${userId}/permission`, { headers, signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "دریافت دسترسی‌ها انجام نشد.");
        setLoaded(true);
        setPermissions(data.permissions);
        setCurrentIds(data.currentPermissionIds);
        setSelected(data.currentPermissionIds.length === 1 ? data.currentPermissionIds[0] : "");
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "خطا در دریافت دسترسی‌ها");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [userId, headers, retry]);
  const inactiveSelection = permissions.some(p => p._id === selected && !p.isActive);
  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/users/${userId}/permission`, {
        method: "PUT", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ permissionId: selected || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "ذخیره دسترسی انجام نشد.");
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ذخیره دسترسی انجام نشد.");
      setSaving(false);
    }
  }
  return createPortal(
    <dialog ref={dialog} dir="rtl" aria-labelledby="user-permission-title"
      onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}
      className={`fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border p-0 shadow-2xl backdrop:bg-black/60 ${t.modalBg} ${t.borderSubtle} ${t.textPrimary}`}>
      <form onSubmit={event => { event.preventDefault(); void save(); }} className="flex max-h-[85dvh] flex-col">
        <div className={`border-b p-5 ${t.borderSubtle}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="user-permission-title" className="font-bold">تخصیص دسترسی</h2>
            <button type="button" onClick={onClose} disabled={saving} aria-label="بستن" className="rounded-lg px-3 py-1 disabled:opacity-40">✕</button>
          </div>
          <p className={`mt-2 text-sm ${t.textSecondary}`}>{userName}</p>
          <p className={`mt-2 text-xs ${t.textMuted}`}>هر کاربر می‌تواند یک گروه دسترسی داشته باشد. انتخاب جدید جایگزین دسترسی قبلی می‌شود.</p>
        </div>
        <div className="min-h-0 overflow-y-auto p-5">
          {loading ? <p role="status">در حال دریافت دسترسی‌ها…</p> : loaded && <>
            <p className={`mb-3 text-sm ${t.textSecondary}`}>دسترسی فعلی: {permissions.filter(p => currentIds.includes(p._id)).map(p => p.name).join("، ") || "بدون دسترسی"}</p>
            <input aria-label="جستجوی دسترسی" placeholder="جستجوی دسترسی…" value={search} onChange={event => setSearch(event.target.value)} disabled={saving}
              className={`mb-3 w-full rounded-xl border px-3 py-2 text-sm ${t.inputBg} ${t.borderInput}`} />
            <fieldset disabled={saving} className="space-y-2">
              <legend className="sr-only">انتخاب گروه دسترسی</legend>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${t.borderSubtle} ${selected === "" ? t.selectedBg : ""}`}>
                <input type="radio" name="permission" value="" checked={!selected} onChange={() => setSelected("")} />
                <span className="text-sm">بدون دسترسی (حذف دسترسی فعلی)</span>
              </label>
              {permissions.filter(p => `${p.name} ${p.description || ""}`.includes(search.trim())).map(p => <label key={p._id}
                className={`flex items-start gap-3 rounded-xl border p-3 ${t.borderSubtle} ${selected === p._id ? t.selectedBg : ""} ${p.isActive ? "cursor-pointer" : "opacity-50"}`}>
                <input className="mt-1" type="radio" name="permission" value={p._id} checked={selected === p._id} disabled={!p.isActive} onChange={() => setSelected(p._id)} />
                <span><span className="text-sm font-medium">{p.name}{!p.isActive && " (غیرفعال)"}</span>
                  {p.description && <span className={`mt-1 block text-xs ${t.textMuted}`}>{p.description}</span>}</span>
              </label>)}
              {!permissions.some(p => p.isActive) && <p className={`text-xs ${t.textMuted}`}>گروه دسترسی فعالی وجود ندارد. ابتدا در بخش دسترسی‌ها یک گروه بسازید.</p>}
            </fieldset>
          </>}
          {error && <div role="alert" className="mt-3 text-sm text-red-500">{error}{!loaded && <button type="button" onClick={() => setRetry(value => value + 1)} className="mr-3 underline">تلاش مجدد</button>}</div>}
        </div>
        <div className={`flex justify-end gap-2 border-t p-4 ${t.borderSubtle}`}>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-4 py-2 text-sm disabled:opacity-40">انصراف</button>
          <button type="submit" disabled={loading || saving || !loaded || inactiveSelection} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">{saving ? "در حال ذخیره…" : "ذخیره دسترسی"}</button>
        </div>
      </form>
    </dialog>, document.body,
  );
}
