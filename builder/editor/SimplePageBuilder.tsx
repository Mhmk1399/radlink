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
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineSquares2X2,
  HiOutlineArrowPath,
  HiOutlineCheck,
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

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type Breakpoint = "mobile" | "tablet" | "desktop";

/* ================================================================== */
/*  Helpers                                                            */
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
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)]">
        <div className="p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl">
              <FaTrash size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-neutral-900">
                حذف همه بلاک‌ها؟
              </h2>
              <p className="mt-1.5 text-[12px] leading-6 text-neutral-500">
                با تأیید این گزینه، همه {blocksCount} بلاک صفحه حذف می‌شوند. این
                عملیات قابل بازگشت نیست.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-[11px] leading-5 text-red-600">
            اگر فقط می‌خواهید یک بلاک را حذف کنید، از پنل ویرایش همان بلاک
            استفاده کنید.
          </div>
        </div>
        <div className="flex gap-2 border-t border-neutral-100 bg-neutral-50 p-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[12px] font-bold text-neutral-600 transition hover:bg-neutral-100 active:scale-[0.98]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-[12px] font-bold text-white shadow-[0_16px_35px_-18px_rgba(220,38,38,0.9)] transition hover:bg-red-700 active:scale-[0.98]"
          >
            بله، حذف کن
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

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
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[600px] overflow-scroll rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)]">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
              <HiOutlineSquares2X2 size={18} className="text-neutral-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-neutral-800">
                افزودن بلاک
              </h2>
              <p className="text-[11px] text-neutral-400">
                یک بلاک انتخاب کن تا به صفحه اضافه شود
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600"
          >
            <HiOutlineXMark size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
          {available.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                onAdd(item.type);
                onClose();
              }}
              className="group flex max-h-[104px] flex-col items-start rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-right transition hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
            >
              <div className="text-sm font-bold text-black flex items-center gap-1 group-hover:text-[#D4AF37]">
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </div>
              <span className="line-clamp-2 text-xs leading-5 text-slate-400">
                {item.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ================================================================== */
/*  Drag overlay                                                       */
/* ================================================================== */

function DragOverlayPreview({ block }: { block: PageBlock }) {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];
  return (
    <div className="w-[min(92vw,480px)] rounded-2xl border border-neutral-300 bg-white px-4 py-4 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-[16px]">
          ⋮⋮
        </div>
        <div>
          <p className="text-[13px] font-bold text-neutral-800">
            {config?.label ?? block.type}
          </p>
          <p className="text-[11px] text-neutral-400">
            رها کن تا ترتیب ثبت شود
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Save indicator                                                     */
/* ================================================================== */

function SaveIndicator({ saved }: { saved: boolean }) {
  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all duration-300",
        saved
          ? "bg-emerald-50 text-emerald-600 shadow-[0_0_12px_-4px_rgba(16,185,129,0.3)]"
          : "bg-neutral-100 text-neutral-400",
      ].join(" ")}
    >
      {saved ? (
        <HiOutlineCheck size={13} />
      ) : (
        <HiOutlineArrowPath size={13} className="animate-spin" />
      )}
      {saved ? "ذخیره شد" : "در حال ذخیره..."}
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function SimplePageBuilder() {
  const initialState = useMemo(() => createInitialBuilderState(), []);

  const [blocks, setBlocks] = useState<PageBlock[]>(initialState.blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialState.selectedBlockId,
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    initialState.selectedElementId,
  );
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(true);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addBlock = useCallback(
    (type: string) => {
      const config = blockRegistry[type as keyof typeof blockRegistry];
      if (!config) return;
      const next = config.createDefaultBlock(sortedBlocks.length);
      setBlocks((prev) => normalizeOrder([...prev, next]));
      setSelectedBlockId(next.instanceId);
      setSelectedElementId("container");
    },
    [sortedBlocks.length],
  );

  const removeSelectedBlock = useCallback(() => {
    if (!selectedBlockId) return;
    const idx = sortedBlocks.findIndex((b) => b.instanceId === selectedBlockId);
    if (idx === -1) return;
    const remaining = sortedBlocks.filter(
      (b) => b.instanceId !== selectedBlockId,
    );
    const next = remaining[idx] ?? remaining[idx - 1] ?? null;
    setBlocks(normalizeOrder(remaining));
    setSelectedBlockId(next?.instanceId ?? null);
    setSelectedElementId(next ? "container" : null);
  }, [selectedBlockId, sortedBlocks]);

  const duplicateSelectedBlock = useCallback(() => {
    if (!selectedBlockId) return;
    const idx = sortedBlocks.findIndex((b) => b.instanceId === selectedBlockId);
    if (idx === -1) return;
    const dup = {
      ...cloneBlock(sortedBlocks[idx]),
      order: sortedBlocks[idx].order + 1,
    };
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((b) => b.instanceId === selectedBlockId);
      if (i === -1) return prev;
      const n = [...sorted];
      n.splice(i + 1, 0, dup);
      return normalizeOrder(n);
    });
    setSelectedBlockId(dup.instanceId);
    setSelectedElementId("container");
  }, [selectedBlockId, sortedBlocks]);

  const handleSelectElement = useCallback(
    (instanceId: string, elementId: string) => {
      setSelectedBlockId(instanceId);
      setSelectedElementId(elementId);
    },
    [],
  );

  const updateSelectedContent = useCallback(
    (key: string, value: unknown) => {
      if (!selectedBlockId) return;
      setBlocks((prev) =>
        prev.map((b) =>
          b.instanceId !== selectedBlockId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [selectedBlockId],
  );

  const handleInlineUpdateContent = useCallback(
    (instanceId: string, key: string, value: string) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.instanceId !== instanceId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [],
  );

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

  const updateSelectedElementStyle = useCallback(
    (
      elementId: string,
      styleKey: EditableStyleKey,
      value: string | number | AnimationType,
    ) => {
      if (!selectedBlockId) return;

      setBlocks((prev) =>
        prev.map((b) => {
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
              [elementId]: {
                ...el,
                style: nextStyle,
              },
            },
          };
        }),
      );
    },
    [selectedBlockId],
  );

  console.log(selectedBlock?.elements?.title?.style?.fontSize);

  const requestClearAllBlocks = useCallback(() => {
    setClearConfirmOpen(true);
  }, []);

  const confirmClearAllBlocks = useCallback(() => {
    setBlocks([]);
    setSelectedBlockId(null);
    setSelectedElementId(null);
    localStorage.removeItem(STORAGE_KEY);
    setClearConfirmOpen(false);
  }, []);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveBlockId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveBlockId(null);
    const { active, over } = e;
    if (!over) return;
    const aId = String(active.id);
    const oId = String(over.id);
    if (aId === oId) return;
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const oi = sorted.findIndex((b) => b.instanceId === aId);
      const ni = sorted.findIndex((b) => b.instanceId === oId);
      if (oi === -1 || ni === -1) return prev;
      return normalizeOrder(arrayMove(sorted, oi, ni));
    });
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveBlockId(null);
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100/50"
    >
      {/* ═══════════ Header ═══════════ */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/50 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+12px)] md:pb-3 md:pt-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Brand + save */}
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-neutral-900 to-neutral-700 text-[12px] font-black text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]">
                  ص
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-[14px] font-extrabold text-neutral-900 sm:text-[15px]">
                      صفحه‌ساز
                    </h1>
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-500 ring-1 ring-neutral-200/60">
                      {blocks.length} بلاک
                    </span>
                  </div>
                </div>
              </div>
              <SaveIndicator saved={justSaved} />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPhonePreviewOpen(true)}
                className="group inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-md active:scale-[0.97] sm:text-[13px]"
              >
                <span className="text-[14px] transition-transform group-hover:scale-110">
                  📱
                </span>
                <span className="whitespace-nowrap">پیش‌نمایش</span>
              </button>

              <button
                type="button"
                onClick={() => setCatalogOpen(true)}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_16px_-6px_rgba(0,0,0,0.4)] transition-all hover:bg-neutral-800 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] active:scale-[0.97] sm:text-[13px]"
              >
                <HiOutlinePlus size={15} />
                <span className="whitespace-nowrap">افزودن بلاک</span>
              </button>

              {blocks.length > 0 && (
                <button
                  type="button"
                  onClick={requestClearAllBlocks}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/60 px-3 py-2 text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.97] sm:text-[13px]"
                >
                  <HiOutlineXMark size={14} />
                  <span className="whitespace-nowrap">پاک کردن</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ Main Canvas ═══════════ */}
      <main className="mx-auto max-w-5xl px-4 pb-32 pt-6">
        {/* Tips */}
        {blocks.length > 0 && (
          <div className="mb-5 mt-10 flex flex-wrap items-center gap-2 text-[11px] md:mt-12">
            <span className="rounded-lg bg-white px-2.5 py-1.5 font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-100">
              کلیک = انتخاب بخش
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1.5 font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-100">
              دابل‌کلیک = ویرایش متن
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1.5 font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-100">
              دستگیره = جابه‌جایی
            </span>
          </div>
        )}

        {/* Canvas */}
        <div
          className={[
            "rounded-3xl border bg-white p-4 transition-all duration-200 sm:p-6",
            activeBlockId
              ? "border-neutral-400 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]"
              : "border-neutral-200/80 shadow-sm",
          ].join(" ")}
        >
          {sortedBlocks.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-gradient-to-b from-neutral-50/50 to-transparent px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 shadow-sm">
                <HiOutlineSquares2X2 size={28} className="text-neutral-400" />
              </div>
              <p className="text-[15px] font-bold text-neutral-700">
                هنوز بلاکی اضافه نشده
              </p>
              <p className="mt-1.5 max-w-xs text-[12px] leading-5 text-neutral-400">
                با دکمه «افزودن بلاک» شروع کن. تنظیمات هر بلاک از نوار بالا قابل
                دسترسی است.
              </p>
              <button
                type="button"
                onClick={() => setCatalogOpen(true)}
                className="mt-5 flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[13px] font-bold text-white shadow-[0_4px_16px_-6px_rgba(0,0,0,0.4)] transition hover:bg-neutral-800 active:scale-[0.97]"
              >
                <HiOutlinePlus size={16} />
                اولین بلاک رو اضافه کن
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sortedBlocks.map((block) => (
                    <DraggableBlockItem
                      key={block.instanceId}
                      block={block}
                      selectedBlockId={selectedBlockId}
                      selectedElementId={selectedElementId}
                      onSelectElement={handleSelectElement}
                      onUpdateContent={handleInlineUpdateContent}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeBlock ? (
                  <DragOverlayPreview block={activeBlock} />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {sortedBlocks.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setCatalogOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-3.5 text-[13px] font-semibold text-neutral-500 shadow-sm transition hover:border-neutral-400 hover:text-neutral-700 active:scale-[0.98]"
            >
              <HiOutlinePlus size={16} />
              افزودن بلاک جدید
            </button>
          </div>
        )}
      </main>

      <BlockCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onAdd={addBlock}
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
    </div>
  );
}
