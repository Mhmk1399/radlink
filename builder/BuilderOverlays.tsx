// builder/components/BuilderOverlays.tsx
"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi2";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { HiOutlinePlus } from "react-icons/hi2";
import type { PageBlock } from "@/types/blocks/builder.types";
import { ToastItem } from "@/hook/builder/useBuilderHooks";

/* ================================================================== */
/*  Toast Container                                                    */
/* ================================================================== */

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-6 left-1/2 z-[600] flex -translate-x-1/2 flex-col-reverse items-center gap-2"
      dir="rtl"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-300",
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50/95 text-emerald-700"
              : toast.type === "error"
                ? "border border-red-200 bg-red-50/95 text-red-700"
                : "border border-blue-200 bg-blue-50/95 text-blue-700",
          ].join(" ")}
        >
          {toast.type === "success" && <HiOutlineCheck size={16} />}
          {toast.type === "error" && <HiOutlineXMark size={16} />}
          {toast.type === "info" && <HiOutlineQuestionMarkCircle size={16} />}
          <span className="text-[13px] font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="mr-1 rounded-lg p-1 opacity-50 transition hover:opacity-100"
          >
            <HiOutlineXMark size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}

/* ================================================================== */
/*  Shortcuts Hint                                                     */
/* ================================================================== */

const SHORTCUTS = [
  { keys: "Ctrl+Z", label: "برگشت" },
  { keys: "Ctrl+Y", label: "بعدی" },
  { keys: "Ctrl+D", label: "کپی بلاک" },
  { keys: "Del", label: "حذف" },
  { keys: "Ctrl+S", label: "ذخیره" },
];

export function ShortcutsHint({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-3 rounded-2xl border border-neutral-200/60 bg-white/95 px-5 py-2.5 shadow-lg backdrop-blur-xl md:flex">
      {SHORTCUTS.map((s, i) => (
        <React.Fragment key={s.keys}>
          {i > 0 && <span className="h-4 w-px bg-neutral-200" />}
          <div className="flex items-center gap-1.5">
            <kbd className="rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-neutral-500">
              {s.keys}
            </kbd>
            <span className="text-[10px] font-medium text-neutral-400">
              {s.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Onboarding Overlay                                                 */
/* ================================================================== */

const ONBOARDING_STEPS = [
  {
    title: "🎉 به صفحه‌ساز خوش اومدی!",
    desc: "از سایدبار سمت راست بلاک‌ها رو بکش و توی صفحه رها کن.",
    position: "top-20 left-1/2 -translate-x-1/2",
  },
  {
    title: "📦 بلاک‌ها",
    desc: "همه بلاک‌های موجود توی سایدبار هستن. فقط بکش و بنداز!",
    position: "top-28 right-72",
  },
  {
    title: "🎨 ویرایش",
    desc: "روی هر بخش کلیک کن و از نوار بالا استایل و محتوا رو تغییر بده.",
    position: "top-20 left-1/2 -translate-x-1/2",
  },
];

export function OnboardingOverlay({
  step,
  onNext,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  if (step >= ONBOARDING_STEPS.length) return null;
  const current = ONBOARDING_STEPS[step];

  return createPortal(
    <div className="fixed inset-0 z-[700]" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div
        className={`absolute ${current.position} z-10 w-72 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300`}
      >
        <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-2xl">
          <h3 className="text-[14px] font-black text-neutral-900">
            {current.title}
          </h3>
          <p className="mt-2 text-[12px] leading-5 text-neutral-500">
            {current.desc}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onSkip}
              className="text-[11px] font-medium text-neutral-400 transition hover:text-neutral-600"
            >
              رد شو
            </button>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {ONBOARDING_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "h-1.5 rounded-full transition-all",
                      i === step
                        ? "w-4 bg-neutral-800"
                        : "w-1.5 bg-neutral-300",
                    ].join(" ")}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-neutral-800 active:scale-95"
              >
                {step < ONBOARDING_STEPS.length - 1 ? "بعدی" : "شروع!"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ================================================================== */
/*  Drag Overlays                                                      */
/* ================================================================== */

export function UnifiedDragOverlay({ block }: { block: PageBlock }) {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];
  return (
    <div
      className="pointer-events-none w-64 rounded-2xl border-2 border-emerald-400 bg-white p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] ring-4 ring-emerald-100"
      style={{ cursor: "grabbing" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-[15px] text-white shadow-sm">
          {config?.icon ?? "□"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-neutral-800">
            {config?.label ?? block.type}
          </p>
          <p className="text-[11px] font-medium text-emerald-600">
            رها کن برای جابه‌جایی ↕
          </p>
        </div>
      </div>
    </div>
  );
}

export function PaletteDragOverlay({ blockType }: { blockType: string }) {
  const config = blockRegistry[blockType as keyof typeof blockRegistry];
  if (!config) return null;

  return (
    <div
      className="pointer-events-none w-60 rounded-2xl border-2 border-emerald-400 bg-white p-3 shadow-[0_24px_60px_-10px_rgba(16,185,129,0.3)] ring-4 ring-emerald-100"
      style={{ cursor: "grabbing" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-[16px] text-white shadow-sm animate-pulse">
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-neutral-800">
            {config.label}
          </p>
          <p className="text-[11px] font-medium text-emerald-600">
            بنداز توی صفحه! 🎯
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Block Count Badge                                                  */
/* ================================================================== */

export function BlockCountBadge({ count }: { count: number }) {
  const maxSuggested = 12;
  const percentage = Math.min((count / maxSuggested) * 100, 100);

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={[
            "h-full rounded-full transition-all duration-500",
            percentage > 80 ? "bg-amber-400" : "bg-emerald-400",
          ].join(" ")}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] font-bold tabular-nums text-neutral-400">
        {count}/{maxSuggested}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Save Indicator                                                     */
/* ================================================================== */

export function SaveIndicator({ saved }: { saved: boolean }) {
  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-500",
        saved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
      ].join(" ")}
    >
      {saved ? (
        <HiOutlineCheck size={12} />
      ) : (
        <span className="animate-spin">
          <HiOutlinePlus size={12} className="rotate-45" />
        </span>
      )}
      {saved ? "ذخیره شد" : "ذخیره..."}
    </div>
  );
}
