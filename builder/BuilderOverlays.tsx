// builder/components/BuilderOverlays.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
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

// داخل BuilderOverlays.tsx

export function UnifiedDragOverlay({ block }: { block: PageBlock }) {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];
  if (!config) return null;

  return (
    <div className="w-full max-w-5xl pointer-events-none">
      <div className="rounded-3xl border-2 border-blue-300 bg-white/95 shadow-[0_24px_80px_-12px_rgba(59,130,246,0.3)] backdrop-blur-xl ring-4 ring-blue-100/50 overflow-hidden">
        {/* Mini header */}
        <div className="flex items-center gap-2.5 border-b border-blue-100 bg-blue-50/80 px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500 text-white text-xs">
            ⋮⋮
          </span>
          <span className="text-[12px] font-bold text-blue-700">
            {config.label}
          </span>
          <span className="mr-auto text-[10px] font-medium text-blue-400">
            جابه‌جایی...
          </span>
        </div>

        {/* Content preview - blurred/dimmed */}
        <div className="max-h-[200px] overflow-hidden opacity-60 blur-[0.5px]">
          {(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const BlockComponent = config.component as React.ComponentType<any>;
            return (
              <BlockComponent
                block={block}
                mode="preview"
                selectedElementId={null}
                onSelectElement={() => {}}
                onUpdateContent={() => {}}
              />
            );
          })()}
        </div>

        {/* Fade out bottom */}
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
}

export function UndoSnackbar({
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}: {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      dir="rtl"
      className="fixed bottom-6 left-1/2 z-[500] -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl shadow-black/30">
        <div
          className="absolute bottom-0 right-0 h-[3px] rounded-full bg-amber-400 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-400"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </div>

          <span className="text-[13px] font-medium text-white">{message}</span>

          <button
            type="button"
            onClick={onUndo}
            className="rounded-xl bg-white px-4 py-1.5 text-[12px] font-bold text-neutral-900 transition-all hover:bg-amber-100 active:scale-95"
          >
            برگردون
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-neutral-500 transition hover:text-white"
          >
            <HiOutlineXMark size={14} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function PaletteDragOverlay({ blockType }: { blockType: string }) {
  const config = blockRegistry[blockType as keyof typeof blockRegistry];
  if (!config) return null;

  return (
    <div className="pointer-events-none w-72">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-300 bg-white/95 px-4 py-3.5 shadow-[0_16px_60px_-8px_rgba(59,130,246,0.35)] backdrop-blur-xl ring-4 ring-blue-100/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg text-blue-600 animate-pulse">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-blue-800">{config.label}</p>
          <p className="text-[10px] text-blue-400">روی خط آبی رها کن</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
          <HiOutlinePlus size={14} />
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
