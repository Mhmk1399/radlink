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
  HiOutlineBars3,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
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
      <div className="relative w-full max-w-lg max-h-[600px] overflow-auto rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)]">
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
        <div className="grid grid-cols-1 gap-3">
          {available.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                onAdd(item.type);
                onClose();
              }}
              className="group flex max-h-[104px] flex-col items-start rounded-2xl border border-neutral-100 bg-white p-3 text-right transition hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5"
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
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-black text-neutral-900">
              {pageId ? "ویرایش اطلاعات صفحه" : "ساخت صفحه جدید"}
            </h2>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              عنوان، آدرس و توضیح صفحه را وارد کنید
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600"
          >
            <HiOutlineXMark size={16} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-neutral-700">
              عنوان صفحه <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="مثلاً: فروشگاه لوازم خانگی"
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-neutral-700">
              آدرس صفحه (slug) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 transition focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-100">
              <span className="shrink-0 border-l border-neutral-200 bg-neutral-100 px-3 py-3 font-mono text-[11px] text-neutral-500">
                /ir.
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => onUrlChange(slugify(e.target.value))}
                placeholder="my-page"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-[14px] text-neutral-900 outline-none placeholder:text-neutral-400"
                dir="ltr"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-400">
              فقط حروف لاتین، اعداد و خط‌تیره مجاز است
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-bold text-neutral-700">
              توضیح کوتاه
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="یک توضیح کوتاه برای این صفحه..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[14px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            />
          </div>
          {saveError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] text-red-600">
              {saveError}
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-neutral-100 bg-neutral-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[12px] font-bold text-neutral-600 transition hover:bg-neutral-100 active:scale-[0.98]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !title.trim() || !url.trim()}
            className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-[12px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(5,150,105,0.5)] transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "در حال ذخیره..."
              : pageId
                ? "ذخیره تغییرات"
                : "ساخت صفحه"}
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
    isSorting,
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
        "group relative flex items-center gap-2 rounded-2xl border p-2 transition-colors duration-200",
        isDragging
          ? "border-neutral-300 bg-neutral-50 opacity-50 shadow-none"
          : isSelected
            ? "border-neutral-300 bg-neutral-50 shadow-sm"
            : "border-transparent hover:border-neutral-200 hover:bg-neutral-50/60",
      ].join(" ")}
    >
      {/* Drag handle — separate activator */}
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-500 active:cursor-grabbing"
        aria-label="جابه‌جایی"
      >
        <HiOutlineBars3 size={13} />
      </button>

      {/* Icon */}
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[14px] transition-colors duration-200",
          isSelected
            ? "bg-neutral-900 text-white shadow-sm"
            : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200",
        ].join(" ")}
      >
        {config?.icon ?? "□"}
      </div>

      {/* Label — clickable */}
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-right"
      >
        <p
          className={[
            "truncate text-[11px] font-bold leading-tight",
            isSelected ? "text-neutral-900" : "text-neutral-700",
          ].join(" ")}
        >
          {config?.label ?? block.type}
        </p>
        <p className="truncate text-[10px] leading-tight text-neutral-400">
          #{block.order + 1}
        </p>
      </button>

      {/* Quick actions */}
      <div
        className={[
          "flex shrink-0 items-center gap-0.5 transition-opacity duration-150",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600"
          title="کپی"
        >
          <HiOutlineDocumentDuplicate size={12} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
          title="حذف"
        >
          <HiOutlineTrash size={12} />
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Drag Overlay — shared between sidebar & canvas                     */
/* ================================================================== */

function UnifiedDragOverlay({ block }: { block: PageBlock }) {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];
  return (
    <div
      className="pointer-events-none w-64 rounded-2xl border border-neutral-300 bg-white/95 p-3 shadow-2xl backdrop-blur-sm"
      style={{ cursor: "grabbing" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-[14px] text-white shadow-sm">
          {config?.icon ?? "□"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-bold text-neutral-800">
            {config?.label ?? block.type}
          </p>
          <p className="text-[10px] text-neutral-400">رها کن تا جابه‌جا شود</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Blocks Sidebar (desktop only)                                      */
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
        "sticky top-[73px] hidden h-[calc(100dvh-73px)] shrink-0 flex-col border-l border-neutral-200/60 bg-white/95 backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] lg:flex",
        collapsed ? "w-[52px]" : "w-[272px]",
      ].join(" ")}
    >
      {/* Header */}
      <div
        className={[
          "flex shrink-0 items-center border-b border-neutral-100 px-2.5 py-2.5",
          collapsed ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <HiOutlineSquares2X2 size={14} className="text-neutral-500" />
            <span className="text-[11px] font-bold text-neutral-700">
              بلاک‌ها
            </span>
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold text-neutral-500 tabular-nums">
              {blocks.length}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          title={collapsed ? "باز کردن" : "بستن"}
        >
          {collapsed ? (
            <HiOutlineChevronLeft size={13} />
          ) : (
            <HiOutlineChevronRight size={13} />
          )}
        </button>
      </div>

      {/* ── Collapsed: icon-only list ── */}
      {collapsed ? (
        <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-2 scrollbar-none">
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
                  "flex h-8 w-8 items-center justify-center rounded-xl text-[13px] transition-all duration-200",
                  isSelected
                    ? "bg-neutral-900 text-white shadow-sm scale-105"
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
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl border border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-600"
            title="افزودن بلاک"
          >
            <HiOutlinePlus size={13} />
          </button>
        </div>
      ) : (
        <>
          {/* ── Expanded: sortable list ── */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200">
            {sortedBlocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <HiOutlineSquares2X2 size={20} className="text-neutral-300" />
                </div>
                <p className="text-[11px] font-semibold text-neutral-500">
                  هنوز بلاکی نداری
                </p>
                <p className="mt-1 text-[10px] text-neutral-400">
                  از دکمه زیر اضافه کن
                </p>
              </div>
            ) : (
              <SortableContext
                items={blockIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5">
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

          {/* Add button */}
          <div className="shrink-0 border-t border-neutral-100 p-2.5">
            <button
              type="button"
              onClick={onAddBlock}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 px-3 py-2.5 text-[11px] font-semibold text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:scale-[0.98]"
            >
              <HiOutlinePlus size={13} />
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

  const [blocks, setBlocks] = useState<PageBlock[]>(
    externalBlocks && externalBlocks.length > 0
      ? externalBlocks
      : initialState.blocks
  );
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
  const [pageDescription, setPageDescription] = useState(initialDescription || "");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          seo: { title: pageTitle, description: pageDescription, keywords: [] },
          settings: { direction: "rtl" },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ساخت صفحه");
      setPageId(json.page?.id ?? json.page?._id ?? null);
      return json.page;
    } catch (error) {
      setServerSaveError(
        error instanceof Error ? error.message : "خطا در ساخت صفحه",
      );
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [pageTitle, pageUrl, pageDescription, blocks]);

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
          seo: { title: pageTitle, description: pageDescription, keywords: [] },
          settings: { direction: "rtl" },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ذخیره صفحه");
      return json.page;
    } catch (error) {
      setServerSaveError(
        error instanceof Error ? error.message : "خطا در ذخیره صفحه",
      );
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [pageId, pageTitle, pageUrl, pageDescription, blocks, createPageOnServer]);

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
    // If external blocks were provided, don't override with localStorage
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

  /* ── SINGLE shared DndContext sensors ── */

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
      setBlocks((prev) => normalizeOrder([...prev, next]));
      setSelectedBlockId(next.instanceId);
      setSelectedElementId("container");
    },
    [sortedBlocks.length],
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
    [sortedBlocks, selectedBlockId],
  );

  const removeSelectedBlock = useCallback(() => {
    if (selectedBlockId) removeBlockById(selectedBlockId);
  }, [selectedBlockId, removeBlockById]);

  const duplicateBlockById = useCallback(
    (id: string) => {
      const idx = sortedBlocks.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      const dup = {
        ...cloneBlock(sortedBlocks[idx]),
        order: sortedBlocks[idx].order + 1,
      };
      setBlocks((prev) => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const i = sorted.findIndex((b) => b.instanceId === id);
        if (i === -1) return prev;
        const n = [...sorted];
        n.splice(i + 1, 0, dup);
        return normalizeOrder(n);
      });
      setSelectedBlockId(dup.instanceId);
      setSelectedElementId("container");
    },
    [sortedBlocks],
  );

  const duplicateSelectedBlock = useCallback(() => {
    if (selectedBlockId) duplicateBlockById(selectedBlockId);
  }, [selectedBlockId, duplicateBlockById]);

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
              [elementId]: { ...el, style: nextStyle },
            },
          };
        }),
      );
    },
    [selectedBlockId],
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
  }, []);

  /* ── SINGLE DnD handlers (sidebar + canvas share this) ── */

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
      <div
        dir="rtl"
        className="min-h-screen overflow-x-hidden bg-gradient-to-b from-neutral-50 to-blue-100/90"
      >
        {/* ═══════════ Header ═══════════ */}
        <header className="sticky top-0 z-40 border-b border-neutral-200/50 bg-white/80 backdrop-blur-2xl">
          <div className="px-4 pb-3 pt-[calc(env(safe-area-inset-top,0)+12px)] md:pb-3 md:pt-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-neutral-500 ring-1 ring-neutral-200/60">
                        {blocks.length} بلاک
                      </span>
                    </div>
                  </div>
                </div>
                <SaveIndicator saved={justSaved} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhonePreviewOpen(true)}
                  className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3.5 py-2 text-[12px] font-semibold text-neutral-700 shadow-sm transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-md active:scale-[0.97] sm:text-[13px]"
                >
                  <span className="text-[14px] transition-transform group-hover:scale-110">
                    📱
                  </span>
                  <span className="whitespace-nowrap">پیش‌نمایش</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPageMetaOpen(true)}
                  disabled={isServerSaving}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_16px_-6px_rgba(5,150,105,0.5)] transition-all hover:bg-emerald-700 hover:shadow-[0_8px_24px_-8px_rgba(5,150,105,0.5)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[13px]"
                >
                  {isServerSaving ? (
                    <>
                      <HiOutlineArrowPath size={15} className="animate-spin" />
                      <span className="whitespace-nowrap">ذخیره...</span>
                    </>
                  ) : pageId ? (
                    <>
                      <HiOutlineCheck size={15} />
                      <span className="whitespace-nowrap">ذخیره تغییرات</span>
                    </>
                  ) : (
                    <>
                      <HiOutlinePlus size={15} />
                      <span className="whitespace-nowrap">ساخت صفحه</span>
                    </>
                  )}
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

        {/* ═══════════ Body ═══════════ */}
        <div className="flex min-h-0">
          {/* Sidebar */}
          <BlocksSidebar
            blocks={sortedBlocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
            onDeleteBlock={removeBlockById}
            onDuplicateBlock={duplicateBlockById}
            onAddBlock={() => setCatalogOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
          />

          {/* Canvas */}
          <main className="mx-auto min-w-0 max-w-5xl flex-1 px-4 pb-32 pt-6">
            {blocks.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px]">
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

            <div
              className={[
                "rounded-3xl border bg-white p-4 transition-all duration-300 sm:p-6",
                activeBlockId
                  ? "border-neutral-400 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]"
                  : "border-neutral-200/80 shadow-sm",
              ].join(" ")}
            >
              {sortedBlocks.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-gradient-to-b from-neutral-50/50 to-transparent px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 shadow-sm">
                    <HiOutlineSquares2X2
                      size={28}
                      className="text-neutral-400"
                    />
                  </div>
                  <p className="text-[15px] font-bold text-neutral-700">
                    هنوز بلاکی اضافه نشده
                  </p>
                  <p className="mt-1.5 max-w-xs text-[12px] leading-5 text-neutral-400">
                    با دکمه «افزودن بلاک» شروع کن. تنظیمات هر بلاک از نوار بالا
                    قابل دسترسی است.
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
                <SortableContext
                  items={blockIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {sortedBlocks.map((block) => (
                      <div
                        key={block.instanceId}
                        data-block-id={block.instanceId}
                      >
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
        </div>
      </div>

      {/* ═══════════ Drag Overlay (portal) ═══════════ */}
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
    </DndContext>
  );
}
