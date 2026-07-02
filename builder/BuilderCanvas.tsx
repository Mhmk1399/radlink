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
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineTrash,
  HiOutlineDocumentDuplicate,
} from "react-icons/hi2";
import {
  DraggableBlockItem,
  DropGap,
} from "@/builder/editor/DraggableBlockItem";
import type { PageBlock } from "@/types/blocks/builder.types";
import { LegacySmartSuggestions } from "./SmartSuggestions";

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

export function PageLogoPreview({
  logo,
  logoShape = "square",
}: {
  logo?: string;
  logoShape?: "square" | "circle";
}) {
  if (!logo?.trim()) return null;

  return (
    <div className="flex justify-center px-4 pb-5 pt-6">
      <div
        className={[
          "h-24 w-24 overflow-hidden border border-black/10 bg-white shadow-sm",
          logoShape === "circle" ? "rounded-full" : "rounded-xl",
        ].join(" ")}
      >
        <img
          src={logo}
          alt="لوگوی صفحه"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

export function CanvasContent({
  background,
  logo,
  logoShape,
  sortedBlocks,
  availableBlockTypes,
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
  onApplyTemplate,
  floatingActions,
  showSmartSuggestions = true,
}: {
  background?: {
    color?: string;
    image?: string;
  };
  logo?: string;
  logoShape?: "square" | "circle";
  sortedBlocks: PageBlock[];
  availableBlockTypes?: string[];
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
  onApplyTemplate: (blockTypes: string[]) => void;
  floatingActions?: React.ReactNode;
  showSmartSuggestions?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-drop-zone" });
  const isPaletteDragging = activePaletteType !== null;
  const isActive = isOver || isOverCanvas;
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: background?.color || "#ffffff",
    backgroundImage: background?.image
      ? `url(${JSON.stringify(background.image)})`
      : undefined,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
  };

  // ── Empty state ──
  if (sortedBlocks.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={[
          "relative min-h-[420px] rounded-3xl border-2 transition-all duration-300",
          isActive
            ? "border-blue-400 bg-blue-50/50 shadow-[inset_0_0_40px_rgba(59,130,246,0.06)]"
            : "border-neutral-200/60 bg-white/80",
        ].join(" ")}
        style={backgroundStyle}
      >
        <PageLogoPreview logo={logo} logoShape={logoShape} />
        {isActive ? (
          /* حالت drag فعال */
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 scale-110 animate-bounce">
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-[15px] font-bold text-blue-700">اینجا رها کن!</p>
            <p className="mt-2 text-[13px] text-blue-500">بلاک اضافه می‌شه</p>
          </div>
        ) : showSmartSuggestions ? (
          <LegacySmartSuggestions
            onApplyTemplate={onApplyTemplate}
            onOpenCatalog={onOpenCatalog}
            availableBlockTypes={availableBlockTypes}
          />
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl">
              +
            </span>
            <h2 className="mt-4 text-base font-black text-neutral-800">
              صفحه خالی آماده است
            </h2>
            <p className="mt-2 max-w-sm text-xs leading-6 text-neutral-500">
              اولین بلاک را از فهرست کامپوننت‌های در دسترس اضافه کنید.
            </p>
            <button
              type="button"
              onClick={onOpenCatalog}
              className="mt-5 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              افزودن اولین بلاک
            </button>
          </div>
        )}
        {floatingActions}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className="relative min-h-[420px] rounded-3xl"
      style={backgroundStyle}
    >
      <PageLogoPreview logo={logo} logoShape={logoShape} />
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        {sortedBlocks.map((block, index) => (
          <div key={block.instanceId}>
            {/* ── Gap قبل از هر بلاک (فقط وقتی palette drag فعاله) ── */}
            {isPaletteDragging && (
              <DropGap id={`gap-before-${block.instanceId}`} isActive={false} />
            )}
            <div className={block.hidden ? "relative" : ""}>
              {block.hidden && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-3xl bg-neutral-100/80 backdrop-blur-[2px] border-2 border-dashed border-neutral-300">
                  <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-neutral-200">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-neutral-400"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                    <span className="text-[11px] font-bold text-neutral-500">
                      مخفی در پیش‌نمایش
                    </span>
                  </div>
                </div>
              )}
              <div className={block.hidden ? "opacity-30 grayscale" : ""}>
                {" "}
                {/* ── خود بلاک ── */}
                <DraggableBlockItem
                  block={block}
                  selectedBlockId={selectedBlockId}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                  onUpdateContent={onUpdateContent}
                  onMoveBlock={onMoveBlock}
                  onDuplicateBlock={onDuplicateBlock}
                  onDeleteBlock={onDeleteBlock}
                  isFirst={index === 0}
                  isLast={index === sortedBlocks.length - 1}
                  index={index} // ← اضافه شد
                />
              </div>
            </div>

            {/* ── Gap بعد از آخرین بلاک ── */}
            {isPaletteDragging && index === sortedBlocks.length - 1 && (
              <DropGap id={`gap-after-${block.instanceId}`} isActive={false} />
            )}

            {/* ── فاصله بین بلاک‌ها (وقتی drag نیست) ── */}
            {!isPaletteDragging && index < sortedBlocks.length - 1 && (
              <div className="h-5" />
            )}
          </div>
        ))}
      </SortableContext>
      {floatingActions}
    </div>
  );
}
