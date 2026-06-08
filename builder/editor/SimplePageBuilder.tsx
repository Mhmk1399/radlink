// SimplePageBuilder.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

import {
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineSquares2X2,
  HiOutlineArrowPath,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineDocumentDuplicate,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineArrowUturnRight,
  HiOutlineArrowUturnLeft,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi2";

import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { DraggableBlockItem } from "@/builder/editor/DraggableBlockItem";
import { DynamicIslandPanel } from "@/builder/editor/DynamicIslandPanel";

import type {
  AnimationType,
  EditableStyleKey,
  EditableStyleMap,
  PageBlock,
  ResponsiveValue,
} from "@/types/blocks/builder.types";
import PhonePreviewModal from "./PhoneLivePreview";
import { FaTrash } from "react-icons/fa";
import { HiOutlineEye } from "react-icons/hi2";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type Breakpoint = "mobile" | "tablet" | "desktop";

/* ================================================================== */
/*  Toast Notification System                                          */
/* ================================================================== */

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

function ToastContainer({
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

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

/* ================================================================== */
/*  Undo/Redo History Hook                                             */
/* ================================================================== */

function useHistory<T>(initial: T, maxSize = 30) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);
  const skipRecordRef = useRef(false);

  const push = useCallback(
    (newState: T) => {
      if (skipRecordRef.current) {
        skipRecordRef.current = false;
        setPresent(newState);
        return;
      }
      setPast((prev) => [...prev.slice(-maxSize), present]);
      setPresent(newState);
      setFuture([]);
    },
    [present, maxSize],
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [present, ...prev]);
    skipRecordRef.current = true;
    setPresent(previous);
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, present]);
    skipRecordRef.current = true;
    setPresent(next);
  }, [future, present]);

  return {
    state: present,
    set: push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historySize: past.length,
  };
}

/* ================================================================== */
/*  Keyboard Shortcuts Bar                                             */
/* ================================================================== */

function ShortcutsHint({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const shortcuts = [
    { keys: "Ctrl+Z", label: "برگشت" },
    { keys: "Ctrl+Y", label: "بعدی" },
    { keys: "Ctrl+D", label: "کپی بلاک" },
    { keys: "Del", label: "حذف" },
    { keys: "Ctrl+S", label: "ذخیره" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-3 rounded-2xl border border-neutral-200/60 bg-white/95 px-5 py-2.5 shadow-lg backdrop-blur-xl md:flex">
      {shortcuts.map((s, i) => (
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
/*  Block Quick Actions Overlay (on canvas hover)                      */
/* ================================================================== */

function BlockQuickActions({
  block,
  totalBlocks,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  block: PageBlock;
  totalBlocks: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isFirst = block.order === 0;
  const isLast = block.order === totalBlocks - 1;

  return (
    <div className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-neutral-200 bg-white px-1.5 py-1 shadow-lg opacity-0 transition-all duration-200 group-hover/block:opacity-100">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        disabled={isFirst}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="انتقال بالا"
      >
        <HiOutlineChevronUp size={14} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        disabled={isLast}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="انتقال پایین"
      >
        <HiOutlineChevronDown size={14} />
      </button>
      <span className="h-4 w-px bg-neutral-200" />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        title="کپی"
      >
        <HiOutlineDocumentDuplicate size={13} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
        title="حذف"
      >
        <HiOutlineTrash size={13} />
      </button>
    </div>
  );
}

/* ================================================================== */
/*  Breadcrumb Navigation                                              */
/* ================================================================== */

function SelectionBreadcrumb({
  blockLabel,
  elementLabel,
  onClickBlock,
  onClickPage,
}: {
  blockLabel: string | null;
  elementLabel: string | null;
  onClickBlock: () => void;
  onClickPage: () => void;
}) {
  if (!blockLabel) return null;

  return (
    <div className="mb-4 flex items-center gap-1.5 text-[11px]" dir="rtl">
      <button
        type="button"
        onClick={onClickPage}
        className="font-medium text-neutral-400 transition hover:text-neutral-600"
      >
        صفحه
      </button>
      <span className="text-neutral-300">/</span>
      <button
        type="button"
        onClick={onClickBlock}
        className={[
          "font-semibold transition",
          elementLabel
            ? "text-neutral-500 hover:text-neutral-700"
            : "text-neutral-800",
        ].join(" ")}
      >
        {blockLabel}
      </button>
      {elementLabel && (
        <>
          <span className="text-neutral-300">/</span>
          <span className="font-bold text-neutral-800">{elementLabel}</span>
        </>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Onboarding Coach Marks                                             */
/* ================================================================== */

function OnboardingOverlay({
  step,
  onNext,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const steps = [
    {
      title: "🎉 به صفحه‌ساز خوش اومدی!",
      desc: "با دکمه «بلاک جدید» اولین بلاکت رو اضافه کن.",
      position: "top-20 left-1/2 -translate-x-1/2",
    },
    {
      title: "📦 بلاک‌ها",
      desc: "از سایدبار سمت راست، بلاک‌هات رو مدیریت و مرتب کن.",
      position: "top-28 right-72",
    },
    {
      title: "🎨 ویرایش",
      desc: "روی هر بخش کلیک کن و از نوار بالا استایل و محتوا رو تغییر بده.",
      position: "top-20 left-1/2 -translate-x-1/2",
    },
  ];

  if (step >= steps.length) return null;
  const current = steps[step];

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
                {steps.map((_, i) => (
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
                {step < steps.length - 1 ? "بعدی" : "شروع!"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function useOnboarding() {
  const [step, setStep] = useState(-1); // -1 = done/hidden

  useEffect(() => {
    try {
      const done = localStorage.getItem("builder-onboarding-done");
      if (!done) setStep(0);
    } catch {
      /* SSR */
    }
  }, []);

  const next = useCallback(() => {
    setStep((prev) => {
      const nextStep = prev + 1;
      if (nextStep >= 3) {
        try {
          localStorage.setItem("builder-onboarding-done", "true");
        } catch {
          /* */
        }
        return -1;
      }
      return nextStep;
    });
  }, []);

  const skip = useCallback(() => {
    setStep(-1);
    try {
      localStorage.setItem("builder-onboarding-done", "true");
    } catch {
      /* */
    }
  }, []);

  return { step, next, skip, isActive: step >= 0 };
}

/* ================================================================== */
/*  Block Count Progress                                               */
/* ================================================================== */

function BlockCountBadge({ count }: { count: number }) {
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
/*  Helpers                                                            */
/* ================================================================== */

const STORAGE_KEY = "page-builder-blocks";

function normalizeStyleValue(
  styleKey: EditableStyleKey,
  value: string | number | AnimationType,
): string | number | AnimationType {
  if (
    styleKey === "fontSize" ||
    styleKey === "borderRadius" ||
    styleKey === "borderWidth"
  ) {
    const numericValue =
      typeof value === "number" ? value : Number.parseFloat(String(value));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  return value;
}

function updateResponsiveValue<T>(
  current: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint,
  value: T,
): ResponsiveValue<T> {
  return { ...(current ?? {}), [breakpoint]: value };
}

function createInitialBuilderState() {
  const firstBlock = blockRegistry.banner.createDefaultBlock(0);
  return {
    blocks: [firstBlock] as PageBlock[],
    selectedBlockId: firstBlock.instanceId as string | null,
    selectedElementId: "container" as string | null,
  };
}

function normalizeOrder(blocks: PageBlock[]): PageBlock[] {
  return blocks.map((block, index) => ({ ...block, order: index }));
}

function cloneBlock(block: PageBlock): PageBlock {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${block.type}-${Date.now()}`;
  return { ...structuredClone(block), instanceId: id };
}

function saveToStorage(blocks: PageBlock[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  } catch {
    /* quota exceeded or SSR */
  }
}

function loadFromStorage(): PageBlock[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* corrupted data */
  }
  return null;
}

/* ================================================================== */
/*  Clear All Confirm Modal                                            */
/* ================================================================== */

function ClearAllConfirmModal({
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
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

function BlockCatalogModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
}) {
  const available = useMemo(() => Object.values(blockRegistry), []);
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
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg max-h-[85vh] sm:max-h-[600px] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 overflow-hidden rounded-t-[28px] sm:rounded-[28px] border border-neutral-200/60 bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] sm:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)]">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

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

          {/* Search */}
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

        <div className="overflow-y-auto px-4 pb-6 max-h-[calc(85vh-180px)] sm:max-h-[380px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-3xl mb-3">🔍</span>
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-xl transition-all duration-200 group-hover:bg-emerald-100 group-hover:scale-110">
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
/*  Save indicator                                                     */
/* ================================================================== */

function SaveIndicator({ saved }: { saved: boolean }) {
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
        <HiOutlineArrowPath size={12} className="animate-spin" />
      )}
      {saved ? "ذخیره شد" : "ذخیره..."}
    </div>
  );
}

/* ================================================================== */
/*  Page Meta Modal                                                    */
/* ================================================================== */

function PageMetaModal({
  open,
  title,
  description,
  url,
  pageId,
  onTitleChange,
  onDescriptionChange,
  onUrlChange,
  onClose,
  onSave,
  isSaving,
  saveError,
}: {
  open: boolean;
  title: string;
  description: string;
  url: string;
  pageId: string | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveError: string | null;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  const slugify = (val: string) =>
    val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300 overflow-hidden rounded-t-[28px] sm:rounded-[28px] border border-white/60 bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.25)]">
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h2 className="text-[16px] font-black text-neutral-900">
              {pageId ? "ویرایش صفحه" : "ساخت صفحه جدید"}
            </h2>
            <p className="mt-0.5 text-[12px] text-neutral-400">
              اطلاعات صفحه رو وارد کن
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-600"
          >
            <HiOutlineXMark size={16} />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-[13px] font-bold text-neutral-700">
              عنوان صفحه <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="مثلاً: فروشگاه لوازم خانگی"
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3.5 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-neutral-700">
              آدرس (slug) <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/80 transition focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-100">
              <span className="shrink-0 border-l border-neutral-200 bg-neutral-100/80 px-3 py-3.5 font-mono text-[12px] text-neutral-400">
                /ir.
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => onUrlChange(slugify(e.target.value))}
                placeholder="my-page"
                className="min-w-0 flex-1 bg-transparent px-3 py-3.5 font-mono text-[15px] text-neutral-900 outline-none placeholder:text-neutral-300"
                dir="ltr"
              />
            </div>
          </div>
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
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {saveError}
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
            disabled={isSaving || !title.trim() || !url.trim()}
            className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "ذخیره..." : pageId ? "ذخیره تغییرات" : "ساخت صفحه"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ================================================================== */
/*  Sidebar Sortable Block Item                                        */
/* ================================================================== */

function SidebarSortableItem({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: PageBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.instanceId,
    transition: {
      duration: 350,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "group relative flex items-center gap-2.5 rounded-2xl border-2 p-2.5 transition-all duration-200",
        isDragging
          ? "border-emerald-300 bg-emerald-50/50 opacity-60 shadow-lg shadow-emerald-100"
          : isSelected
            ? "border-neutral-900 bg-neutral-50 shadow-sm"
            : "border-transparent hover:border-neutral-200 hover:bg-neutral-50/80",
      ].join(" ")}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        className={[
          "flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg transition-all duration-200",
          isDragging
            ? "bg-emerald-100 text-emerald-600"
            : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500 active:cursor-grabbing",
        ].join(" ")}
        aria-label="جابه‌جایی"
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
          <circle cx="3" cy="3" r="1.5" />
          <circle cx="9" cy="3" r="1.5" />
          <circle cx="3" cy="10" r="1.5" />
          <circle cx="9" cy="10" r="1.5" />
          <circle cx="3" cy="17" r="1.5" />
          <circle cx="9" cy="17" r="1.5" />
        </svg>
      </button>

      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] transition-all duration-200",
          isSelected
            ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/20"
            : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200/80",
        ].join(" ")}
      >
        {config?.icon ?? "□"}
      </div>

      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-right"
      >
        <p
          className={[
            "truncate text-[12px] font-bold leading-tight",
            isSelected ? "text-neutral-900" : "text-neutral-700",
          ].join(" ")}
        >
          {config?.label ?? block.type}
        </p>
        <p className="truncate text-[10px] leading-tight text-neutral-400 mt-0.5">
          بلاک {block.order + 1}
        </p>
      </button>

      <div
        className={[
          "flex shrink-0 items-center gap-0.5 transition-all duration-200",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-all hover:bg-neutral-200 hover:text-neutral-600"
          title="کپی"
        >
          <HiOutlineDocumentDuplicate size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-all hover:bg-red-50 hover:text-red-500"
          title="حذف"
        >
          <HiOutlineTrash size={13} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Drag Overlay                                                       */
/* ================================================================== */

function UnifiedDragOverlay({ block }: { block: PageBlock }) {
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
          <p className="text-[11px] text-emerald-600 font-medium">
            رها کن برای جابه‌جایی ↕
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Blocks Sidebar                                                     */
/* ================================================================== */

function BlocksSidebar({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onAddBlock,
  collapsed,
  onToggleCollapse,
}: {
  blocks: PageBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onAddBlock: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );

  const blockIds = useMemo(
    () => sortedBlocks.map((b) => b.instanceId),
    [sortedBlocks],
  );

  return (
    <aside
      className={[
        "sticky top-[73px] hidden h-[calc(100dvh-73px)] shrink-0 flex-col border-l border-neutral-200/60 bg-white transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] lg:flex",
        collapsed ? "w-[56px]" : "w-[280px]",
      ].join(" ")}
    >
      <div
        className={[
          "flex shrink-0 items-center border-b border-neutral-100 px-3 py-3",
          collapsed ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900">
              <HiOutlineSquares2X2 size={13} className="text-white" />
            </div>
            <span className="text-[13px] font-bold text-neutral-800">
              بلاک‌ها
            </span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-100 px-1.5 text-[10px] font-bold text-neutral-500 tabular-nums">
              {blocks.length}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
          title={collapsed ? "باز کردن" : "بستن"}
        >
          {collapsed ? (
            <HiOutlineChevronLeft size={14} />
          ) : (
            <HiOutlineChevronRight size={14} />
          )}
        </button>
      </div>

      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto py-3 scrollbar-none">
          {sortedBlocks.map((block) => {
            const config =
              blockRegistry[block.type as keyof typeof blockRegistry];
            const isSelected = block.instanceId === selectedBlockId;
            return (
              <button
                key={block.instanceId}
                type="button"
                onClick={() => onSelectBlock(block.instanceId)}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-xl text-[14px] transition-all duration-200",
                  isSelected
                    ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/20 scale-110"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:scale-105",
                ].join(" ")}
                title={config?.label ?? block.type}
              >
                {config?.icon ?? "□"}
              </button>
            );
          })}
          <button
            type="button"
            onClick={onAddBlock}
            className="mt-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50"
            title="افزودن بلاک"
          >
            <HiOutlinePlus size={14} />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200">
            {sortedBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                  <HiOutlineSquares2X2 size={28} className="text-neutral-300" />
                </div>
                <p className="text-[14px] font-bold text-neutral-600">
                  هنوز بلاکی نداری
                </p>
                <p className="mt-1.5 text-[12px] text-neutral-400 leading-5">
                  از دکمه زیر اولین بلاک رو اضافه کن
                </p>
              </div>
            ) : (
              <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
                  <span className="text-[13px]">💡</span>
                  <span className="text-[10px] font-medium text-amber-700">
                    با گرفتن نقاط، ترتیب بلاک‌ها رو عوض کن
                  </span>
                </div>
                <div className="space-y-1">
                  {sortedBlocks.map((block) => (
                    <SidebarSortableItem
                      key={block.instanceId}
                      block={block}
                      isSelected={block.instanceId === selectedBlockId}
                      onSelect={() => onSelectBlock(block.instanceId)}
                      onDelete={() => onDeleteBlock(block.instanceId)}
                      onDuplicate={() => onDuplicateBlock(block.instanceId)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>

          <div className="shrink-0 border-t border-neutral-100 p-3">
            <button
              type="button"
              onClick={onAddBlock}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-3 py-3 text-[12px] font-bold text-white shadow-md shadow-neutral-900/10 transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]"
            >
              <HiOutlinePlus size={14} />
              افزودن بلاک
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

type SimplePageBuilderProps = {
  pageId?: string;
  initialBlocks?: PageBlock[];
  initialTitle?: string;
  initialDescription?: string;
  initialUrl?: string;
};

export default function SimplePageBuilder({
  pageId: initialPageId,
  initialBlocks: externalBlocks,
  initialTitle,
  initialDescription,
  initialUrl,
}: SimplePageBuilderProps = {}) {
  const initialState = useMemo(() => createInitialBuilderState(), []);

  /* ── Undo/Redo history ── */
  const history = useHistory<PageBlock[]>(
    externalBlocks && externalBlocks.length > 0
      ? externalBlocks
      : initialState.blocks,
  );

  const blocks = history.state;
  const setBlocks = history.set;

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    externalBlocks && externalBlocks.length > 0
      ? externalBlocks[0]?.instanceId || null
      : initialState.selectedBlockId,
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    externalBlocks && externalBlocks.length > 0
      ? "container"
      : initialState.selectedElementId,
  );
  const [pageId, setPageId] = useState<string | null>(initialPageId || null);
  const [pageTitle, setPageTitle] = useState(initialTitle || "صفحه جدید");
  const [pageUrl, setPageUrl] = useState(initialUrl || "new-page");
  const [isServerSaving, setIsServerSaving] = useState(false);
  const [serverSaveError, setServerSaveError] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(true);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [pageMetaOpen, setPageMetaOpen] = useState(false);
  const [pageDescription, setPageDescription] = useState(
    initialDescription || "",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Toast ── */
  const toast = useToast();

  /* ── Onboarding ── */
  const onboarding = useOnboarding();

  /* ── Scroll detection ── */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      if (isInput) return;

      // Ctrl+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        history.undo();
        toast.show("برگشت به حالت قبل", "info");
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z = Redo
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        history.redo();
        toast.show("اعمال مجدد", "info");
        return;
      }

      // Ctrl+D = Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (selectedBlockId) {
          duplicateBlockById(selectedBlockId);
          toast.show("بلاک کپی شد", "success");
        }
        return;
      }

      // Delete or Backspace = Delete block
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBlockId) {
          removeBlockById(selectedBlockId);
          toast.show("بلاک حذف شد", "success");
        }
        return;
      }

      // Ctrl+S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setPageMetaOpen(true);
        return;
      }

      // ? = Toggle shortcuts
      if (e.key === "?") {
        setShowShortcuts((p) => !p);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history, selectedBlockId, toast]);

  /* ── Server save ── */

  const createPageOnServer = useCallback(async () => {
    try {
      setIsServerSaving(true);
      setServerSaveError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: pageTitle,
          url: pageUrl,
          description: pageDescription,
          blocks,
          seo: {
            title: pageTitle,
            description: pageDescription,
            keywords: [],
          },
          settings: { direction: "rtl" },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ساخت صفحه");
      setPageId(json.page?.id ?? json.page?._id ?? null);
      toast.show("صفحه با موفقیت ساخته شد! 🎉", "success");
      return json.page;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطا در ساخت صفحه";
      setServerSaveError(msg);
      toast.show(msg, "error");
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [pageTitle, pageUrl, pageDescription, blocks, toast]);

  const updatePageOnServer = useCallback(async () => {
    if (!pageId) return createPageOnServer();
    try {
      setIsServerSaving(true);
      setServerSaveError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: pageTitle,
          url: pageUrl,
          description: pageDescription,
          blocks,
          seo: {
            title: pageTitle,
            description: pageDescription,
            keywords: [],
          },
          settings: { direction: "rtl" },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ذخیره صفحه");
      toast.show("تغییرات ذخیره شد ✅", "success");
      return json.page;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطا در ذخیره صفحه";
      setServerSaveError(msg);
      toast.show(msg, "error");
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [
    pageId,
    pageTitle,
    pageUrl,
    pageDescription,
    blocks,
    createPageOnServer,
    toast,
  ]);

  const handleMetaSave = useCallback(async () => {
    const savedPage = await updatePageOnServer();
    if (savedPage) {
      setJustSaved(true);
      setPageMetaOpen(false);
    }
  }, [updatePageOnServer]);

  /* ── Derived ── */

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );

  const blockIds = useMemo(
    () => sortedBlocks.map((b) => b.instanceId),
    [sortedBlocks],
  );

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.instanceId === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );

  const activeBlock = useMemo(
    () => blocks.find((b) => b.instanceId === activeBlockId) ?? null,
    [activeBlockId, blocks],
  );

  const selectedConfig = selectedBlock
    ? (blockRegistry[selectedBlock.type as keyof typeof blockRegistry] ?? null)
    : null;

  const selectedSchema = selectedConfig?.schema ?? null;

  // Breadcrumb labels
  const selectedBlockLabel = selectedBlock
    ? (blockRegistry[selectedBlock.type as keyof typeof blockRegistry]?.label ??
      selectedBlock.type)
    : null;

  const selectedElementLabel = useMemo(() => {
    if (!selectedElementId || !selectedSchema) return null;
    const elementSchema = selectedSchema.elements[selectedElementId as keyof typeof selectedSchema.elements];
    return elementSchema?.label ?? selectedElementId;
  }, [selectedElementId, selectedSchema]);

  /* ── Storage sync ── */

  useEffect(() => {
    if (!storageHydrated) return;
    setJustSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToStorage(blocks);
      setJustSaved(true);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [blocks, storageHydrated]);

  useEffect(() => {
    if (externalBlocks && externalBlocks.length > 0) {
      setStorageHydrated(true);
      return;
    }
    const stored = loadFromStorage();
    if (stored && stored.length > 0) {
      const normalized = normalizeOrder(stored);
      setBlocks(normalized);
      setSelectedBlockId((prev) => {
        if (prev && normalized.some((b) => b.instanceId === prev)) return prev;
        return normalized[0]?.instanceId ?? null;
      });
      setSelectedElementId(normalized[0] ? "container" : null);
    }
    setStorageHydrated(true);
  }, [externalBlocks]);

  /* ── Sensors ── */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ── Block CRUD ── */

  const addBlock = useCallback(
    (type: string) => {
      const config = blockRegistry[type as keyof typeof blockRegistry];
      if (!config) return;
      const next = config.createDefaultBlock(sortedBlocks.length);
      setBlocks(normalizeOrder([...blocks, next]));
      setSelectedBlockId(next.instanceId);
      setSelectedElementId("container");
      toast.show(`بلاک "${config.label}" اضافه شد`, "success");
    },
    [sortedBlocks.length, blocks, setBlocks, toast],
  );

  const removeBlockById = useCallback(
    (id: string) => {
      const idx = sortedBlocks.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      const remaining = sortedBlocks.filter((b) => b.instanceId !== id);
      const next = remaining[idx] ?? remaining[idx - 1] ?? null;
      setBlocks(normalizeOrder(remaining));
      if (selectedBlockId === id) {
        setSelectedBlockId(next?.instanceId ?? null);
        setSelectedElementId(next ? "container" : null);
      }
    },
    [sortedBlocks, selectedBlockId, setBlocks],
  );

  const removeSelectedBlock = useCallback(() => {
    if (selectedBlockId) {
      removeBlockById(selectedBlockId);
      toast.show("بلاک حذف شد", "success");
    }
  }, [selectedBlockId, removeBlockById, toast]);

  const duplicateBlockById = useCallback(
    (id: string) => {
      const idx = sortedBlocks.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      const dup = {
        ...cloneBlock(sortedBlocks[idx]),
        order: sortedBlocks[idx].order + 1,
      };
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((b) => b.instanceId === id);
      if (i === -1) return;
      const n = [...sorted];
      n.splice(i + 1, 0, dup);
      setBlocks(normalizeOrder(n));
      setSelectedBlockId(dup.instanceId);
      setSelectedElementId("container");
    },
    [sortedBlocks, blocks, setBlocks],
  );

  const duplicateSelectedBlock = useCallback(() => {
    if (selectedBlockId) {
      duplicateBlockById(selectedBlockId);
      toast.show("بلاک کپی شد", "success");
    }
  }, [selectedBlockId, duplicateBlockById, toast]);

  /* ── Move block up/down ── */

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return;
      setBlocks(normalizeOrder(arrayMove(sorted, idx, targetIdx)));
    },
    [blocks, setBlocks],
  );

  /* ── Selection ── */

  const handleSelectElement = useCallback(
    (instanceId: string, elementId: string) => {
      setSelectedBlockId(instanceId);
      setSelectedElementId(elementId);
    },
    [],
  );

  const handleSelectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
    setSelectedElementId("container");
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-block-id="${id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  /* ── Content & style ── */

  const updateSelectedContent = useCallback(
    (key: string, value: unknown) => {
      if (!selectedBlockId) return;
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== selectedBlockId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [selectedBlockId, blocks, setBlocks],
  );

  const handleInlineUpdateContent = useCallback(
    (instanceId: string, key: string, value: string) => {
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== instanceId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [blocks, setBlocks],
  );

  const updateSelectedElementStyle = useCallback(
    (
      elementId: string,
      styleKey: EditableStyleKey,
      value: string | number | AnimationType,
    ) => {
      if (!selectedBlockId) return;
      setBlocks(
        blocks.map((b) => {
          if (b.instanceId !== selectedBlockId) return b;
          const el = b.elements[elementId];
          if (!el) return b;
          const currentStyle = el.style;
          const normalizedValue = normalizeStyleValue(styleKey, value);
          let nextStyle: EditableStyleMap;
          if (styleKey === "animation") {
            nextStyle = {
              ...currentStyle,
              animation: normalizedValue as AnimationType,
            };
          } else {
            const currentResponsiveValue = currentStyle[styleKey] as
              | ResponsiveValue<string | number>
              | undefined;
            nextStyle = {
              ...currentStyle,
              [styleKey]: updateResponsiveValue(
                currentResponsiveValue,
                "mobile",
                normalizedValue as string | number,
              ),
            };
          }
          return {
            ...b,
            elements: {
              ...b.elements,
              [elementId]: { ...el, style: nextStyle },
            },
          };
        }),
      );
    },
    [selectedBlockId, blocks, setBlocks],
  );

  /* ── Clear all ── */

  const requestClearAllBlocks = useCallback(() => {
    setClearConfirmOpen(true);
  }, []);

  const confirmClearAllBlocks = useCallback(() => {
    setBlocks([]);
    setSelectedBlockId(null);
    setSelectedElementId(null);
    localStorage.removeItem(STORAGE_KEY);
    setClearConfirmOpen(false);
    toast.show("همه بلاک‌ها حذف شدند", "success");
  }, [setBlocks, toast]);

  /* ── DnD handlers ── */

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveBlockId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveBlockId(null);
      const { active, over } = e;
      if (!over) return;
      const aId = String(active.id);
      const oId = String(over.id);
      if (aId === oId) return;
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const oi = sorted.findIndex((b) => b.instanceId === aId);
      const ni = sorted.findIndex((b) => b.instanceId === oId);
      if (oi === -1 || ni === -1) return;
      setBlocks(normalizeOrder(arrayMove(sorted, oi, ni)));
      toast.show("ترتیب بلاک‌ها تغییر کرد", "info");
    },
    [blocks, setBlocks, toast],
  );

  const handleDragCancel = useCallback(() => {
    setActiveBlockId(null);
  }, []);

  /* ════════════════════════════════════════════ */
  /*  RENDER                                      */
  /* ════════════════════════════════════════════ */

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      measuring={{
        droppable: { strategy: MeasuringStrategy.Always },
      }}
    >
      <div dir="rtl" className="min-h-screen overflow-x-hidden bg-[#f5f5f7]">
        {/* ═══════════ Header ═══════════ */}
        <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/90 backdrop-blur-2xl">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left side */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-[13px] font-black text-white shadow-lg shadow-neutral-900/20">
                  ص
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-[15px] font-extrabold text-neutral-900">
                    صفحه‌ساز
                  </h1>
                </div>
                <SaveIndicator saved={justSaved} />
                <BlockCountBadge count={blocks.length} />
              </div>

              {/* Right side — actions */}
              <div className="flex items-center gap-2">
                {/* Undo/Redo */}
                <div className="hidden items-center gap-1 md:flex">
                  <button
                    type="button"
                    onClick={() => {
                      history.undo();
                      toast.show("برگشت", "info");
                    }}
                    disabled={!history.canUndo}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="برگشت (Ctrl+Z)"
                  >
                    <HiOutlineArrowUturnRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      history.redo();
                      toast.show("بعدی", "info");
                    }}
                    disabled={!history.canRedo}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="بعدی (Ctrl+Y)"
                  >
                    <HiOutlineArrowUturnLeft size={15} />
                  </button>
                </div>
 

                {/* Preview */}
                <button
                  type="button"
                  onClick={() => setIsPhonePreviewOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 hover:shadow-sm active:scale-95 sm:w-auto sm:gap-2 sm:px-4"
                >
                  <HiOutlineEye size={16} />
                  <span className="hidden sm:inline text-[12px] font-semibold">
                    پیش‌نمایش
                  </span>
                </button>

                {/* Save / Create */}
                <button
                  type="button"
                  onClick={() => setPageMetaOpen(true)}
                  disabled={isServerSaving}
                  className="flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-[12px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isServerSaving ? (
                    <HiOutlineArrowPath size={14} className="animate-spin" />
                  ) : pageId ? (
                    <HiOutlineCheck size={14} />
                  ) : (
                    <HiOutlinePlus size={14} />
                  )}
                  <span className="hidden sm:inline">
                    {isServerSaving
                      ? "ذخیره..."
                      : pageId
                        ? "ذخیره"
                        : "ساخت صفحه"}
                  </span>
                </button>

                {/* Add block */}
                <button
                  type="button"
                  onClick={() => setCatalogOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-[12px] font-bold text-white shadow-lg shadow-neutral-900/15 transition-all hover:bg-neutral-800 hover:shadow-xl active:scale-95"
                >
                  <HiOutlinePlus size={14} />
                  <span className="hidden sm:inline">بلاک جدید</span>
                </button>

                {/* Clear */}
                {blocks.length > 0 && (
                  <button
                    type="button"
                    onClick={requestClearAllBlocks}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-all hover:bg-red-100 active:scale-95"
                    title="پاک کردن همه"
                  >
                    <HiOutlineTrash size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ═══════════ Body ═══════════ */}
        <div className="flex min-h-0">
          {/* Sidebar */}
          <BlocksSidebar
            blocks={sortedBlocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
            onDeleteBlock={(id) => {
              removeBlockById(id);
              toast.show("بلاک حذف شد", "success");
            }}
            onDuplicateBlock={(id) => {
              duplicateBlockById(id);
              toast.show("بلاک کپی شد", "success");
            }}
            onAddBlock={() => setCatalogOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
          />

          {/* Canvas */}
          <main className="mx-auto min-w-0 max-w-5xl flex-1 px-4 pb-32 pt-6">
            {/* Breadcrumb */}
            <SelectionBreadcrumb
              blockLabel={selectedBlockLabel}
              elementLabel={
                selectedElementId === "container" ? null : selectedElementLabel
              }
              onClickBlock={() => {
                if (selectedBlockId) handleSelectBlock(selectedBlockId);
              }}
              onClickPage={() => {
                setSelectedBlockId(null);
                setSelectedElementId(null);
              }}
            />

            {/* Quick tips */}
            {blocks.length > 0 && blocks.length <= 2 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {[
                  { emoji: "👆", text: "کلیک = انتخاب" },
                  { emoji: "✏️", text: "دابل‌کلیک = ویرایش" },
                  { emoji: "↕️", text: "دراگ = جابه‌جایی" },
                  { emoji: "⌨️", text: "? = میان‌بر" },
                ].map((tip) => (
                  <span
                    key={tip.text}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-100"
                  >
                    <span className="text-[12px]">{tip.emoji}</span>
                    {tip.text}
                  </span>
                ))}
              </div>
            )}

            {/* Canvas area */}
            <div
              className={[
                "rounded-[24px] border-2 bg-white transition-all duration-300",
                activeBlockId
                  ? "border-emerald-300 shadow-xl shadow-emerald-100/50"
                  : "border-neutral-200/60 shadow-sm",
                sortedBlocks.length > 0 ? "p-4 sm:p-6" : "",
              ].join(" ")}
            >
              {sortedBlocks.length === 0 ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[20px] px-8 text-center">
                  <div className="relative mb-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-50 shadow-inner">
                      <HiOutlineSquares2X2
                        size={40}
                        className="text-neutral-300"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-bounce">
                      <HiOutlinePlus size={16} />
                    </div>
                  </div>

                  <h2 className="text-[18px] font-black text-neutral-800">
                    صفحه‌ت رو بساز
                  </h2>
                  <p className="mt-2 max-w-sm text-[14px] leading-7 text-neutral-400">
                    با اضافه کردن بلاک‌ها، صفحه دلخواهت رو طراحی کن.
                    <br />
                    هر بلاک قابل ویرایش و جابه‌جاییه.
                  </p>

                  <button
                    type="button"
                    onClick={() => setCatalogOpen(true)}
                    className="mt-8 flex items-center gap-2.5 rounded-2xl bg-neutral-900 px-7 py-4 text-[14px] font-bold text-white shadow-xl shadow-neutral-900/20 transition-all hover:bg-neutral-800 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <HiOutlinePlus size={18} />
                    اولین بلاک رو اضافه کن
                  </button>

                  <div className="mt-6 flex items-center gap-2 text-[12px] text-neutral-400">
                    <span className="h-px w-8 bg-neutral-200" />
                    یا از سایدبار سمت راست استفاده کن
                    <span className="h-px w-8 bg-neutral-200" />
                  </div>
                </div>
              ) : (
                <SortableContext
                  items={blockIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {sortedBlocks.map((block) => (
                      <div
                        key={block.instanceId}
                        data-block-id={block.instanceId}
                        className="group/block relative"
                      >
                        {/* Quick actions on hover */}
                        <BlockQuickActions
                          block={block}
                          totalBlocks={sortedBlocks.length}
                          onMoveUp={() => moveBlock(block.instanceId, "up")}
                          onMoveDown={() => moveBlock(block.instanceId, "down")}
                          onDuplicate={() => {
                            duplicateBlockById(block.instanceId);
                            toast.show("بلاک کپی شد", "success");
                          }}
                          onDelete={() => {
                            removeBlockById(block.instanceId);
                            toast.show("بلاک حذف شد", "success");
                          }}
                        />
                        <DraggableBlockItem
                          block={block}
                          selectedBlockId={selectedBlockId}
                          selectedElementId={selectedElementId}
                          onSelectElement={handleSelectElement}
                          onUpdateContent={handleInlineUpdateContent}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>

            {/* Bottom add button */}
            {sortedBlocks.length > 0 && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setCatalogOpen(true)}
                  className="group flex items-center gap-2.5 rounded-2xl border-2 border-dashed border-neutral-300 bg-white px-8 py-4 text-[13px] font-semibold text-neutral-400 shadow-sm transition-all hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 hover:shadow-md active:scale-[0.98]"
                >
                  <HiOutlinePlus
                    size={16}
                    className="transition-transform group-hover:rotate-90"
                  />
                  افزودن بلاک جدید
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ═══════════ Drag Overlay ═══════════ */}
      <DragOverlay
        dropAnimation={{
          duration: 300,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        style={{ cursor: "grabbing" }}
      >
        {activeBlock ? <UnifiedDragOverlay block={activeBlock} /> : null}
      </DragOverlay>

      {/* ═══════════ Modals & Panels ═══════════ */}
      <BlockCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onAdd={addBlock}
      />

      <PageMetaModal
        open={pageMetaOpen}
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        pageId={pageId}
        onTitleChange={setPageTitle}
        onDescriptionChange={setPageDescription}
        onUrlChange={setPageUrl}
        onClose={() => setPageMetaOpen(false)}
        onSave={handleMetaSave}
        isSaving={isServerSaving}
        saveError={serverSaveError}
      />

      <PhonePreviewModal
        open={isPhonePreviewOpen}
        blocks={blocks}
        onClose={() => setIsPhonePreviewOpen(false)}
      />

      <DynamicIslandPanel
        block={selectedBlock}
        schema={selectedSchema}
        selectedElementId={selectedElementId}
        breakpoint={breakpoint}
        isScrolled={isScrolled}
        onBreakpointChange={setBreakpoint}
        onUpdateContent={updateSelectedContent}
        onUpdateStyle={updateSelectedElementStyle}
        onClose={() => {
          setSelectedBlockId(null);
          setSelectedElementId(null);
        }}
        onDeleteBlock={removeSelectedBlock}
        onDuplicateBlock={duplicateSelectedBlock}
      />

      <ClearAllConfirmModal
        open={clearConfirmOpen}
        blocksCount={blocks.length}
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={confirmClearAllBlocks}
      />

      {/* ═══════════ New UX features ═══════════ */}
      <ShortcutsHint visible={showShortcuts} />
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
      {onboarding.isActive && (
        <OnboardingOverlay
          step={onboarding.step}
          onNext={onboarding.next}
          onSkip={onboarding.skip}
        />
      )}
    </DndContext>
  );
}
