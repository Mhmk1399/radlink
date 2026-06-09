// builder/components/BuilderCanvas.tsx
"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineTrash,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi2";
import { DraggableBlockItem } from "@/builder/editor/DraggableBlockItem";
import type { PageBlock } from "@/types/blocks/builder.types";

/* ================================================================== */
/*  Block Quick Actions (hover overlay)                                */
/* ================================================================== */

export function BlockQuickActions({
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

  const actions = [
    {
      icon: <HiOutlineChevronUp size={14} />,
      onClick: onMoveUp,
      disabled: isFirst,
      title: "انتقال بالا",
      hoverClass: "hover:bg-neutral-100 hover:text-neutral-600",
    },
    {
      icon: <HiOutlineChevronDown size={14} />,
      onClick: onMoveDown,
      disabled: isLast,
      title: "انتقال پایین",
      hoverClass: "hover:bg-neutral-100 hover:text-neutral-600",
    },
    "divider" as const,
    {
      icon: <HiOutlineDocumentDuplicate size={13} />,
      onClick: onDuplicate,
      title: "کپی",
      hoverClass: "hover:bg-neutral-100 hover:text-neutral-600",
    },
    {
      icon: <HiOutlineTrash size={13} />,
      onClick: onDelete,
      title: "حذف",
      hoverClass: "hover:bg-red-50 hover:text-red-500",
    },
  ];

  return (
    <div className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-neutral-200 bg-white px-1.5 py-1 shadow-lg opacity-0 transition-all duration-200 group-hover/block:opacity-100">
      {actions.map((action, i) =>
        action === "divider" ? (
          <span key={i} className="h-4 w-px bg-neutral-200" />
        ) : (
          <button
            key={action.title}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            disabled={action.disabled}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition ${action.hoverClass} disabled:cursor-not-allowed disabled:opacity-30`}
            title={action.title}
          >
            {action.icon}
          </button>
        ),
      )}
    </div>
  );
}

/* ================================================================== */
/*  Breadcrumb Navigation                                              */
/* ================================================================== */

export function SelectionBreadcrumb({
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
/*  Canvas Drop Zone                                                   */
/* ================================================================== */

export function CanvasDropZone({
  children,
  isOverCanvas,
  hasBlocks,
}: {
  children: React.ReactNode;
  isOverCanvas: boolean;
  hasBlocks: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop-zone" });
  const showHighlight = isOverCanvas || isOver;

  return (
    <div
      ref={setNodeRef}
      className={[
        "rounded-[24px] border-2 bg-white transition-all duration-300",
        showHighlight
          ? "border-emerald-400 shadow-xl shadow-emerald-100/60 ring-4 ring-emerald-50"
          : "border-neutral-200/60 shadow-sm",
        hasBlocks ? "p-4 sm:p-6" : "",
      ].join(" ")}
    >
      {children}

      {showHighlight && (
        <div className="mt-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 px-6 py-8 transition-all duration-300 animate-in fade-in zoom-in-95">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <HiOutlinePlus size={24} />
            </div>
            <p className="text-[13px] font-bold text-emerald-700">
              اینجا رها کن
            </p>
            <p className="text-[11px] text-emerald-500">
              بلاک به انتهای صفحه اضافه می‌شه
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Canvas Content                                                     */
/* ================================================================== */

export function CanvasContent({
  sortedBlocks,
  blockIds,
  selectedBlockId,
  selectedElementId,
  activePaletteType,
  isOverCanvas,
  onSelectElement,
  onUpdateContent,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onOpenCatalog,
}: {
  sortedBlocks: PageBlock[];
  blockIds: string[];
  selectedBlockId: string | null;
  selectedElementId: string | null;
  activePaletteType: string | null;
  isOverCanvas: boolean;
  onSelectElement: (instanceId: string, elementId: string) => void;
  onUpdateContent: (instanceId: string, key: string, value: string) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onDuplicateBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onOpenCatalog: () => void;
}) {
  return (
    <CanvasDropZone
      isOverCanvas={isOverCanvas && activePaletteType !== null}
      hasBlocks={sortedBlocks.length > 0}
    >
      {sortedBlocks.length === 0 ? (
        /* ─── Empty state ─── */
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[20px] px-8 text-center">
          <div className="relative mb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-50 shadow-inner">
              <HiOutlineSquares2X2 size={40} className="text-neutral-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <HiOutlinePlus size={16} />
            </div>
          </div>
          <h2 className="text-[18px] font-black text-neutral-800">
            صفحه‌ت رو بساز
          </h2>
          <p className="mt-2 max-w-sm text-[14px] leading-7 text-neutral-400">
            از سایدبار سمت راست بلاک دلخواه رو بکش و اینجا رها کن.
            <br />
            یا روی دکمه زیر کلیک کن.
          </p>
          <button
            type="button"
            onClick={onOpenCatalog}
            className="mt-8 flex items-center gap-2.5 rounded-2xl bg-neutral-900 px-7 py-4 text-[14px] font-bold text-white shadow-xl shadow-neutral-900/20 transition-all hover:scale-[1.02] hover:bg-neutral-800 hover:shadow-2xl active:scale-[0.98]"
          >
            <HiOutlinePlus size={18} />
            اولین بلاک رو اضافه کن
          </button>
          <div className="mt-6 flex items-center gap-2 text-[12px] text-neutral-400">
            <span className="h-px w-8 bg-neutral-200" />
            یا از سایدبار بکش و بنداز
            <span className="h-px w-8 bg-neutral-200" />
          </div>
        </div>
      ) : (
        /* ─── Blocks list ─── */
        <SortableContext
          items={blockIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sortedBlocks.map((block, index) => (
              <div
                key={block.instanceId}
                data-block-id={block.instanceId}
                data-tour={index === 0 ? "tour-canvas-first-block" : undefined}
                className="group/block relative"
              >
                <BlockQuickActions
                  block={block}
                  totalBlocks={sortedBlocks.length}
                  onMoveUp={() => onMoveBlock(block.instanceId, "up")}
                  onMoveDown={() => onMoveBlock(block.instanceId, "down")}
                  onDuplicate={() => onDuplicateBlock(block.instanceId)}
                  onDelete={() => onDeleteBlock(block.instanceId)}
                />
                <DraggableBlockItem
                  block={block}
                  selectedBlockId={selectedBlockId}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                  onUpdateContent={onUpdateContent}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      )}
    </CanvasDropZone>
  );
}
