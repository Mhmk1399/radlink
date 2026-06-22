// builder/components/BuilderSidebar.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineTrash,
  HiOutlineDocumentDuplicate,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from "react-icons/hi2";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import type { PageBlock } from "@/types/blocks/builder.types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
/* ================================================================== */
/*  Sidebar Palette Draggable Item                                     */
/* ================================================================== */

type SidebarCatalogBlock = {
  type: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
};

function SidebarPaletteDraggableItem({
  type,
  icon,
  label,
  description,
  tourId,
}: {
  type: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  tourId?: string;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRef = useRef<HTMLDivElement | null>(null);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { fromPalette: true, blockType: type },
  });

  // وقتی drag شروع میشه preview رو ببند
  useEffect(() => {
    if (isDragging) {
      setShowPreview(false);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    }
  }, [isDragging]);

  return (
    <>
      <div
        ref={(el) => {
          setNodeRef(el);
          itemRef.current = el;
        }}
        data-tour={tourId}
        {...attributes}
        {...listeners}
        className={[
          "group relative flex cursor-grab items-center gap-3 rounded-2xl border-2 p-3 transition-all duration-200 select-none",
          isDragging
            ? "border-emerald-400 bg-emerald-50/80 opacity-50 shadow-lg scale-[0.97]"
            : "border-transparent bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm active:cursor-grabbing active:scale-[0.97]",
        ].join(" ")}
        onMouseEnter={() => {
          hoverTimerRef.current = setTimeout(() => {
            if (!isDragging) setShowPreview(true);
          }, 500);
        }}
        onMouseLeave={() => {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          setShowPreview(false);
        }}
      >
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[16px] transition-all duration-200",
            isDragging
              ? "bg-emerald-500 text-white scale-110"
              : "bg-neutral-100 text-neutral-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:scale-105",
          ].join(" ")}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={[
              "text-[12px] font-bold leading-tight transition-colors",
              isDragging
                ? "text-emerald-700"
                : "text-neutral-700 group-hover:text-emerald-700",
            ].join(" ")}
          >
            {label}
          </p>
          {description && (
            <p className="mt-0.5 truncate text-[10px] leading-tight text-neutral-400">
              {description}
            </p>
          )}
        </div>
        {/* Drag dots */}
        <div className="flex shrink-0 flex-col items-center gap-[3px] opacity-30 transition-opacity group-hover:opacity-60">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-[3px]">
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
              <span className="h-[3px] w-[3px] rounded-full bg-current" />
            </div>
          ))}
        </div>
      </div>

      {/* Preview Tooltip */}
      {showPreview && !isDragging && itemRef.current && (
        <BlockPreviewTooltip
          type={type}
          icon={icon}
          label={label}
          description={description}
          anchorEl={itemRef.current}
        />
      )}
    </>
  );
}

/* ================================================================== */
/*  Block Preview Tooltip                                              */
/* ================================================================== */

function BlockPreviewTooltip({
  type,
  icon,
  label,
  description,
  anchorEl,
}: {
  type: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  anchorEl: HTMLElement;
}) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    side: "left" | "right";
  } | null>(null);

  useLayoutEffect(() => {
    if (!anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();
    const tooltipWidth = 260;
    const estimatedHeight = tooltipRef.current?.offsetHeight ?? 180;

    let top = rect.top + rect.height / 2 - estimatedHeight / 2;
    top = Math.max(
      12,
      Math.min(window.innerHeight - estimatedHeight - 12, top),
    );

    // پیش‌فرض: سمت چپ آیتم
    let left = rect.left - tooltipWidth - 12;
    let side: "left" | "right" = "left";

    // اگر سمت چپ جا نبود، ببر سمت راست
    if (left < 12) {
      left = rect.right + 12;
      side = "right";
    }

    setPosition({ top, left, side });
  }, [anchorEl, label, description, type]);

  if (typeof document === "undefined" || !position) return null;

  const typeColors: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    banner: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    text: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    image: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    default: {
      bg: "bg-neutral-50",
      border: "border-neutral-200",
      text: "text-neutral-700",
    },
  };

  const colors = typeColors[type] ?? typeColors.default;

  return createPortal(
    <div
      ref={tooltipRef}
      dir="rtl"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 600,
      }}
      className={[
        "w-[260px] animate-in fade-in zoom-in-95 duration-150",
        position.side === "left" ? "origin-right" : "origin-left",
      ].join(" ")}
    >
      <div className="relative overflow-visible rounded-2xl border border-neutral-200/80 bg-white shadow-[0_16px_48px_-8px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div
          className={[
            "flex items-center gap-3 rounded-t-2xl border-b px-4 py-3",
            colors.bg,
            colors.border,
          ].join(" ")}
        >
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl text-lg",
              colors.bg,
              colors.text,
            ].join(" ")}
          >
            {icon}
          </div>

          <div>
            <p className={["text-[13px] font-bold", colors.text].join(" ")}>
              {label}
            </p>
            <p className="mt-0.5 text-[10px] text-neutral-400">{type}</p>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="text-[11px] leading-5 text-neutral-600">
              {description}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="rounded-b-2xl bg-neutral-50/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100">
              <span className="text-[10px]">👆</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-500">
              بکش و توی صفحه رها کن
            </span>
          </div>
        </div>

        {/* Arrow */}
        {position.side === "left" ? (
          <div className="absolute top-1/2 -right-[6px] -translate-y-1/2">
            <div className="h-3 w-3 rotate-45 border-r border-t border-neutral-200 bg-white" />
          </div>
        ) : (
          <div className="absolute top-1/2 -left-[6px] -translate-y-1/2">
            <div className="h-3 w-3 rotate-45 border-l border-b border-neutral-200 bg-white" />
          </div>
        )}
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
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onToggleVisibility,
  isHidden,
}: {
  block: PageBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  onToggleVisibility?: () => void;
  isHidden?: boolean;
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
    over,
    active,
  } = useSortable({
    id: block.instanceId,
    transition: {
      duration: 300,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const isOverThis =
    over?.id === block.instanceId && active?.id !== block.instanceId;

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  return (
    <div style={style} ref={setNodeRef} className="relative">
      {/* ── Drop indicator line ── */}
      {isOverThis && (
        <div className="absolute -top-[5px] inset-x-1 z-40 flex items-center pointer-events-none">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/40 ring-[3px] ring-blue-100" />
          <div className="flex-1 h-[2.5px] rounded-full bg-gradient-to-l from-blue-500 via-blue-400 to-blue-200" />
        </div>
      )}

      <div
        className={[
          "group relative flex items-center gap-1.5 rounded-xl border-2 p-1.5 transition-all duration-200",
          isDragging
            ? "border-blue-300 bg-blue-50 shadow-xl shadow-blue-200/50 scale-[1.03] rotate-[0.5deg]"
            : isSelected
              ? "border-neutral-900 bg-neutral-50 shadow-sm"
              : "border-transparent hover:border-neutral-200 hover:bg-neutral-50/80",
        ].join(" ")}
      >
        {/* ── Drag handle ── */}
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          className={[
            "flex h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg transition-all duration-200",
            isDragging
              ? "bg-blue-200 text-blue-600 scale-110"
              : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500 active:cursor-grabbing active:bg-blue-100 active:text-blue-500",
          ].join(" ")}
          aria-label="جابه‌جایی"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
            <circle cx="2" cy="2" r="1.2" />
            <circle cx="6" cy="2" r="1.2" />
            <circle cx="2" cy="7" r="1.2" />
            <circle cx="6" cy="7" r="1.2" />
            <circle cx="2" cy="12" r="1.2" />
            <circle cx="6" cy="12" r="1.2" />
          </svg>
        </button>

        {/* ── Icon ── */}
        <div
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] transition-all duration-200",
            isHidden
              ? "bg-neutral-100 text-neutral-300 grayscale"
              : isSelected
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-neutral-100 text-neutral-500",
          ].join(" ")}
        >
          {config?.icon ?? "□"}
        </div>

        {/* ── Label (clickable to select) ── */}
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-right"
        >
          {/* Label styling برای hidden blocks: */}
          <p
            className={[
              "truncate text-[11px] font-bold leading-tight",
              isHidden
                ? "text-neutral-400 line-through"
                : isSelected
                  ? "text-neutral-900"
                  : "text-neutral-600",
            ].join(" ")}
          >
            {config?.label ?? block.type}
          </p>
        </button>

        {/* ── Quick actions ── */}
        <div
          className={[
            "flex shrink-0 items-center gap-0.5 transition-all duration-200",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          ].join(" ")}
        >
          {/* Visibility toggle */}
          {onToggleVisibility && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className={[
                "flex h-6 w-6 items-center justify-center rounded-md transition-all",
                isHidden
                  ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                  : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600",
              ].join(" ")}
              title={isHidden ? "نمایش" : "مخفی"}
            >
              {isHidden ? (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
          {/* Move up */}
          {onMoveUp && !isFirst && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-neutral-200 hover:text-neutral-600"
              title="بالا"
            >
              <HiOutlineChevronUp size={11} />
            </button>
          )}

          {/* Move down */}
          {onMoveDown && !isLast && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-neutral-200 hover:text-neutral-600"
              title="پایین"
            >
              <HiOutlineChevronDown size={11} />
            </button>
          )}

          {/* Duplicate */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-neutral-200 hover:text-neutral-600"
            title="کپی"
          >
            <HiOutlineDocumentDuplicate size={11} />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-red-50 hover:text-red-500"
            title="حذف"
          >
            <HiOutlineTrash size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Sidebar Layers Panel (با DndContext مستقل)                         */
/* ================================================================== */

function SidebarLayersPanel({
  sortedBlocks,
  blockIds,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onReorder,
  onToggleVisibility, // ← اضافه شد
  onSwitchTab,
}: {
  sortedBlocks: PageBlock[];
  blockIds: string[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onReorder: (activeId: string, overId: string) => void;
  onToggleVisibility: (id: string) => void; // ← اضافه شد
  onSwitchTab: () => void;
}) {
  // ── سنسور مخصوص ساید‌بار — کاملاً جدا از کنواس ──
  const sidebarSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSidebarDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      onReorder(String(active.id), String(over.id));
    },
    [onReorder],
  );

  if (sortedBlocks.length === 0) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
            <HiOutlineSquares2X2 size={24} className="text-neutral-300" />
          </div>
          <p className="text-[13px] font-bold text-neutral-600">
            هنوز بلاکی نداری
          </p>
          <p className="mt-1.5 text-[11px] leading-5 text-neutral-400">
            از تب «بلاک‌ها» بکش و بنداز
          </p>
          <button
            type="button"
            onClick={onSwitchTab}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-emerald-600 active:scale-95"
          >
            <HiOutlinePlus size={12} />
            رفتن به بلاک‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200">
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
          <span className="text-[12px]">💡</span>
          <span className="text-[10px] font-medium text-amber-700">
            با گرفتن نقاط ترتیب رو عوض کن، یا از دکمه‌های ↑↓ استفاده کن
          </span>
        </div>

        {/* ── DndContext مستقل برای ساید‌بار ── */}
        <DndContext
          sensors={sidebarSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSidebarDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={blockIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {sortedBlocks.map((block, index) => (
                <SidebarSortableItem
                  key={block.instanceId}
                  block={block}
                  isSelected={block.instanceId === selectedBlockId}
                  isHidden={block.hidden}
                  onSelect={() => onSelectBlock(block.instanceId)}
                  onDelete={() => onDeleteBlock(block.instanceId)}
                  onDuplicate={() => onDuplicateBlock(block.instanceId)}
                  onMoveUp={() => onMoveBlock(block.instanceId, "up")}
                  onMoveDown={() => onMoveBlock(block.instanceId, "down")}
                  onToggleVisibility={() =>
                    onToggleVisibility(block.instanceId)
                  }
                  isFirst={index === 0}
                  isLast={index === sortedBlocks.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="shrink-0 border-t border-neutral-100 p-3">
        <button
          type="button"
          onClick={onSwitchTab}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-3 py-2.5 text-[11px] font-bold text-neutral-500 transition-all hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 active:scale-[0.98]"
        >
          <HiOutlinePlus size={13} />
          افزودن بلاک جدید
        </button>
      </div>
    </div>
  );
}
/* ================================================================== */
/*  Main Sidebar                                                       */
/* ================================================================== */

export function BlocksSidebar({
  blocks,
  availableBlocks: allowedPaletteBlocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onReorder, // ← اضافه شد
  onAddBlock,
  collapsed,
  onToggleCollapse,
  onToggleVisibility,
}: {
  blocks: PageBlock[];
  availableBlocks?: SidebarCatalogBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onReorder: (activeId: string, overId: string) => void; // ← اضافه شد
  onAddBlock: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleVisibility: (id: string) => void; // ← اضافه
}) {
  const [activeTab, setActiveTab] = useState<"palette" | "layers">("palette");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );

  const blockIds = useMemo(
    () => sortedBlocks.map((b) => b.instanceId),
    [sortedBlocks],
  );

  const availableBlocks = useMemo(
    () => allowedPaletteBlocks ?? Object.values(blockRegistry),
    [allowedPaletteBlocks],
  );

  const filteredPaletteBlocks = useMemo(() => {
    if (!searchQuery.trim()) return availableBlocks;
    const q = searchQuery.toLowerCase();
    return availableBlocks.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q),
    );
  }, [availableBlocks, searchQuery]);

  return (
    <aside
      data-tour="tour-sidebar"
      className={[
        "sticky top-[73px] hidden h-[calc(100vh-73px)] shrink-0 flex-col border-l border-neutral-200/60 bg-white transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] lg:flex",
        collapsed ? "w-[56px]" : "w-[280px]",
      ].join(" ")}
    >
      {/* Header */}
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
          </div>
        )}
       
      </div>

      {collapsed ? (
        /* ─── Collapsed view ─── */
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
            className="mt-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-500"
            title="افزودن بلاک"
          >
            <HiOutlinePlus size={14} />
          </button>
        </div>
      ) : (
        <>
          {/* ─── Tab switcher ─── */}
          <div
            data-tour="tour-sidebar-tabs"
            className="shrink-0 px-3 pb-1 pt-3"
          >
            {" "}
            <div className="flex rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("palette");
                  setSearchQuery("");
                }}
                className={[
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all duration-200",
                  activeTab === "palette"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                ].join(" ")}
              >
                <HiOutlinePlus size={13} />
                بلاک‌ها
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-100 px-1 text-[9px] font-bold tabular-nums text-emerald-700">
                  {availableBlocks.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("layers");
                  setSearchQuery("");
                }}
                className={[
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition-all duration-200",
                  activeTab === "layers"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                ].join(" ")}
              >
                <HiOutlineSquares2X2 size={13} />
                چیدمان  
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-neutral-200 px-1 text-[9px] font-bold tabular-nums text-neutral-600">
                  {blocks.length}
                </span>
              </button>
            </div>
          </div>

          {/* ─── Palette tab ─── */}
          {activeTab === "palette" && (
            <>
              <div
                data-tour="tour-sidebar-search"
                className="shrink-0 px-3 py-2"
              >
                {" "}
                <div className="relative">
                  <HiOutlineMagnifyingGlass
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی بلاک..."
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pr-9 pl-3 text-[12px] text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
                  />
                </div>
              </div>

              <div className="shrink-0 px-3 pb-1">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <span className="text-[14px]">✨</span>
                  <span className="text-[10px] font-medium leading-4 text-emerald-700">
                    بلاک دلخواه رو بکش و توی صفحه رها کن
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200">
                {filteredPaletteBlocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="mb-2 text-2xl">🔍</span>
                    <p className="text-[12px] font-semibold text-neutral-500">
                      بلاکی پیدا نشد
                    </p>
                    <p className="mt-1 text-[10px] text-neutral-400">
                      عبارت دیگه‌ای جستجو کن
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPaletteBlocks.map((item, index) => (
                      <SidebarPaletteDraggableItem
                        key={item.type}
                        type={item.type}
                        icon={item.icon}
                        label={item.label}
                        description={item.description}
                        tourId={
                          index === 0 ? "tour-palette-first-item" : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── Layers tab ─── */}
          {activeTab === "layers" && (
            <SidebarLayersPanel
              sortedBlocks={sortedBlocks}
              blockIds={blockIds}
              selectedBlockId={selectedBlockId}
              onSelectBlock={onSelectBlock}
              onDeleteBlock={onDeleteBlock}
              onDuplicateBlock={onDuplicateBlock}
              onMoveBlock={onMoveBlock}
              onReorder={onReorder}
              onToggleVisibility={onToggleVisibility} // ← اضافه شد
              onSwitchTab={() => setActiveTab("palette")}
            />
          )}
        </>
      )}
    </aside>
  );
}
