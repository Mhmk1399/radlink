// builder/components/BuilderSidebar.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
} from "react-icons/hi2";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import type { PageBlock } from "@/types/blocks/builder.types";

/* ================================================================== */
/*  Sidebar Palette Draggable Item                                     */
/* ================================================================== */

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
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { fromPalette: true, blockType: type },
  });

  return (
    <div
      ref={setNodeRef}
      data-tour={tourId}
      {...attributes}
      {...listeners}
      className={[
        "group relative flex cursor-grab items-center gap-3 rounded-2xl border-2 p-3 transition-all duration-200 select-none",
        isDragging
          ? "border-emerald-400 bg-emerald-50/80 opacity-50 shadow-lg scale-[0.97]"
          : "border-transparent bg-white hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm active:cursor-grabbing active:scale-[0.97]",
      ].join(" ")}
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
    transition: { duration: 350, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      data-tour="tour-canvas"
      style={style}
      className={[
        "group relative flex items-center gap-2 rounded-xl border-2 p-2 transition-all duration-200",
        isDragging
          ? "border-emerald-300 bg-emerald-50/50 opacity-60 shadow-lg shadow-emerald-100"
          : isSelected
            ? "border-neutral-900 bg-neutral-50 shadow-sm"
            : "border-transparent hover:border-neutral-200 hover:bg-neutral-50/80",
      ].join(" ")}
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        className={[
          "flex h-7 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md transition-all duration-200",
          isDragging
            ? "bg-emerald-100 text-emerald-600"
            : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500 active:cursor-grabbing",
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

      {/* Icon */}
      <div
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] transition-all duration-200",
          isSelected
            ? "bg-neutral-900 text-white shadow-sm"
            : "bg-neutral-100 text-neutral-500",
        ].join(" ")}
      >
        {config?.icon ?? "□"}
      </div>

      {/* Label */}
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-right"
      >
        <p
          className={[
            "truncate text-[11px] font-bold leading-tight",
            isSelected ? "text-neutral-900" : "text-neutral-600",
          ].join(" ")}
        >
          {config?.label ?? block.type}
        </p>
      </button>

      {/* Actions */}
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
          className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-neutral-200 hover:text-neutral-600"
          title="کپی"
        >
          <HiOutlineDocumentDuplicate size={11} />
        </button>
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
  );
}

/* ================================================================== */
/*  Main Sidebar                                                       */
/* ================================================================== */

export function BlocksSidebar({
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

  const availableBlocks = useMemo(() => Object.values(blockRegistry), []);

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
    collapsed ? "w-[56px]" : "w-[300px]",
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
        <button
          type="button"
          data-tour="tour-sidebar-toggle"
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
                چیدمان بلاک
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
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200">
                {sortedBlocks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                      <HiOutlineSquares2X2
                        size={24}
                        className="text-neutral-300"
                      />
                    </div>
                    <p className="text-[13px] font-bold text-neutral-600">
                      هنوز بلاکی نداری
                    </p>
                    <p className="mt-1.5 text-[11px] leading-5 text-neutral-400">
                      از تب «بلاک‌ها» بکش و بنداز
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("palette")}
                      className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-emerald-600 active:scale-95"
                    >
                      <HiOutlinePlus size={12} />
                      رفتن به بلاک‌ها
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                      <span className="text-[12px]">💡</span>
                      <span className="text-[10px] font-medium text-amber-700">
                        با گرفتن نقاط، ترتیب بلاک‌ها رو عوض کن
                      </span>
                    </div>
                    <SortableContext
                      items={blockIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {sortedBlocks.map((block) => (
                          <SidebarSortableItem
                            key={block.instanceId}
                            block={block}
                            isSelected={block.instanceId === selectedBlockId}
                            onSelect={() => onSelectBlock(block.instanceId)}
                            onDelete={() => onDeleteBlock(block.instanceId)}
                            onDuplicate={() =>
                              onDuplicateBlock(block.instanceId)
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </>
                )}
              </div>

              {sortedBlocks.length > 0 && (
                <div className="shrink-0 border-t border-neutral-100 p-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("palette")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-3 py-2.5 text-[11px] font-bold text-neutral-500 transition-all hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 active:scale-[0.98]"
                  >
                    <HiOutlinePlus size={13} />
                    افزودن بلاک جدید
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
}
