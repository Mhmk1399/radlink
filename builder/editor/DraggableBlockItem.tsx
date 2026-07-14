"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import type { PageBlock } from "@/types/blocks/builder.types";
import {
  BLOCK_SPACING_MAX,
  BLOCK_SPACING_MIN,
  BLOCK_SPACING_STEP,
  getBlockSpacingValue,
  normalizeBlockSpacingValue,
  type BlockSpacingKey,
} from "@/lib/design/block-spacing";
import {
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlinePlus,
  HiOutlineMinus,
} from "react-icons/hi2";
import { RiDraggable } from "react-icons/ri";

/* ================================================================== */
/*  Drop Gap — فضای خالی بین بلاک‌ها برای رها کردن                     */
/* ================================================================== */

export function DropGap({ id, isActive }: { id: string; isActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={[
        "relative mx-2 transition-all duration-300 ease-out",
        isOver || isActive ? "py-6" : "py-1",
      ].join(" ")}
    >
      {/* خط پیش‌فرض */}
      {!isOver && !isActive && (
        <div className="h-[2px] rounded-full bg-transparent transition-all duration-300" />
      )}

      {/* ناحیه فعال drop */}
      {(isOver || isActive) && (
        <div className="flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/70 px-4 py-4 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/30 animate-bounce">
              <HiOutlinePlus size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-blue-700">
                اینجا رها کن
              </p>
              <p className="text-[10px] text-blue-500">
                بلاک اینجا اضافه می‌شه
              </p>
            </div>
            {/* نقاط متحرک */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-blue-400"
                  style={{
                    animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Draggable Block Item                                               */
/* ================================================================== */

type DraggableBlockItemProps = {
  block: PageBlock;
  index?: number; // ← اضافه شد

  selectedBlockId: string | null;
  selectedElementId: string | null;
  onSelectElement: (
    instanceId: string,
    elementId: string,
    options?: { centerBlock?: boolean },
  ) => void;
  onUpdateContent: (instanceId: string, key: string, value: unknown) => void;
  onUpdateBlockSpacing?: (
    instanceId: string,
    key: BlockSpacingKey,
    value: number,
  ) => void;
  onMoveBlock?: (id: string, direction: "up" | "down") => void;
  onDuplicateBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
};

function BlockSpacingControls({
  block,
  visible,
  onSelectContainer,
  onUpdateBlockSpacing,
}: {
  block: PageBlock;
  visible: boolean;
  onSelectContainer: () => void;
  onUpdateBlockSpacing?: (
    instanceId: string,
    key: BlockSpacingKey,
    value: number,
  ) => void;
}) {
  const [activeMode, setActiveMode] = useState<"margin" | "padding">("margin");

  if (!onUpdateBlockSpacing || !visible) return null;

  const top = getBlockSpacingValue(block, "marginTop");
  const bottom = getBlockSpacingValue(block, "marginBottom");
  const paddingTop = getBlockSpacingValue(block, "paddingTop");
  const paddingBottom = getBlockSpacingValue(block, "paddingBottom");

  const update = (key: BlockSpacingKey, value: number) => {
    onSelectContainer();
    onUpdateBlockSpacing(
      block.instanceId,
      key,
      normalizeBlockSpacingValue(value),
    );
  };

  const isMarginMode = activeMode === "margin";
  const activeColorClass = isMarginMode
    ? "bg-amber-500 text-white shadow-sm shadow-amber-500/25"
    : "bg-blue-600 text-white shadow-sm shadow-blue-500/25";
  const inactiveColorClass =
    "text-neutral-500 hover:bg-white hover:text-neutral-900";
  const activeRows: Array<{
    key: BlockSpacingKey;
    label: string;
    value: number;
  }> = isMarginMode
    ? [
        { key: "marginTop", label: "بالا", value: top },
        { key: "marginBottom", label: "پایین", value: bottom },
      ]
    : [
        { key: "paddingTop", label: "بالا", value: paddingTop },
        { key: "paddingBottom", label: "پایین", value: paddingBottom },
      ];
  const resetActiveRows = () => {
    activeRows.forEach((row) => update(row.key, 0));
  };

  const renderRow = (key: BlockSpacingKey, label: string, value: number) => (
    <div
      key={key}
      className="rounded-xl border border-neutral-200 bg-white/95 px-2 py-1.5 shadow-sm"
    >
      <div className="flex items-center gap-1.5">
        <span className="w-8 shrink-0 text-[10px] font-black text-neutral-600">
          {label}
        </span>
        <button
          type="button"
          onClick={() => update(key, value - BLOCK_SPACING_STEP)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
          aria-label={`${label} کمتر`}
        >
          <HiOutlineMinus size={12} />
        </button>
        <input
          type="range"
          min={BLOCK_SPACING_MIN}
          max={BLOCK_SPACING_MAX}
          step={BLOCK_SPACING_STEP}
          value={value}
          onChange={(event) => update(key, Number(event.target.value))}
          className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-900 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:shadow"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => update(key, value + BLOCK_SPACING_STEP)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
          aria-label={`${label} بیشتر`}
        >
          <HiOutlinePlus size={12} />
        </button>
        <input
          type="number"
          min={BLOCK_SPACING_MIN}
          max={BLOCK_SPACING_MAX}
          step={BLOCK_SPACING_STEP}
          value={value}
          onChange={(event) => update(key, Number(event.target.value))}
          onFocus={(event) => event.currentTarget.select()}
          className="h-7 w-11 rounded-lg border border-neutral-200 bg-neutral-50 px-1 text-center font-mono text-[10px] font-black text-neutral-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          aria-label={`${label} به پیکسل`}
        />
      </div>
    </div>
  );

  return (
    <div
      className="absolute bottom-2 left-2 z-30 w-[258px] max-w-[calc(100%-1rem)] rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-[0_14px_36px_rgba(15,23,42,0.16)] backdrop-blur-xl"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      dir="rtl"
    >
      <div className="mb-2 flex items-center gap-1 rounded-xl bg-neutral-100 p-1">
        <button
          type="button"
          onClick={() => setActiveMode("margin")}
          className={[
            "h-7 flex-1 rounded-lg text-[10px] font-black transition",
            isMarginMode ? activeColorClass : inactiveColorClass,
          ].join(" ")}
        >
          بیرونی
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("padding")}
          className={[
            "h-7 flex-1 rounded-lg text-[10px] font-black transition",
            !isMarginMode ? activeColorClass : inactiveColorClass,
          ].join(" ")}
        >
          داخلی
        </button>
        <button
          type="button"
          onClick={resetActiveRows}
          className="h-7 rounded-lg px-2 text-[10px] font-black text-neutral-400 transition hover:bg-white hover:text-neutral-800"
        >
          صفر
        </button>
      </div>
      <div className="space-y-1.5">
        {activeRows.map((row) => renderRow(row.key, row.label, row.value))}
      </div>
    </div>
  );
}

export function DraggableBlockItem({
  block,
  selectedBlockId,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
  onUpdateBlockSpacing,
  onMoveBlock,
  isFirst,
  isLast,
  index, // ← اضافه شد
}: DraggableBlockItemProps) {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];
  const isSelected = selectedBlockId === block.instanceId;

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
      duration: 250,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  if (!config) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        بلاک «{block.type}» ثبت نشده است
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BlockComponent = config.component as React.ComponentType<any>;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.instanceId}
      className={[
        "group/block relative rounded-3xl transition-all duration-200",
        isDragging
          ? "z-50 scale-[1.02] rotate-[0.5deg] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] ring-2 ring-blue-400/50 opacity-50"
          : "",
        !isDragging && isSelected
          ? "shadow-[0_0_0_2px_rgba(59,130,246,0.4),0_8px_30px_-8px_rgba(0,0,0,0.12)]"
          : "",
        !isDragging && !isSelected
          ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
          : "",
      ].join(" ")}
    >
      {/* ── Block Index Badge ── */}
      {typeof index === "number" && (
        <div
          className={[
            "absolute top-2.5 left-2.5 z-20 flex h-6 min-w-[24px] items-center justify-center rounded-lg px-1.5 text-[10px] font-bold tabular-nums transition-all duration-300",
            isSelected
              ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
              : "bg-neutral-900/60 text-white backdrop-blur-sm",
            // hover: نمایش label بلاک
            "group-hover/block:min-w-0",
          ].join(" ")}
        >
          <span>{index + 1}</span>
        </div>
      )}
      {/* ── Drag Handle ── */}
      <div
        className={[
          "absolute -right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-0.5",
          "transition-all duration-300",
          isSelected
            ? "opacity-100 translate-x-0"
            : "opacity-0 group-hover/block:opacity-100 translate-x-2 group-hover/block:translate-x-0",
          "max-md:opacity-100 max-md:translate-x-0",
        ].join(" ")}
      >
        {onMoveBlock && !isFirst && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveBlock(block.instanceId, "up");
            }}
            className="flex h-6 w-8 items-center justify-center rounded-t-xl bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
            title="بالا"
          >
            <HiOutlineChevronUp size={12} />
          </button>
        )}

        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className={[
            "flex h-10 w-8 items-center justify-center bg-white border border-neutral-200 text-neutral-400 transition-all shadow-sm",
            "cursor-grab active:cursor-grabbing",
            "hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200",
            "active:scale-110 active:shadow-lg active:bg-blue-100",
            onMoveBlock && !isFirst ? "" : "rounded-t-xl",
            onMoveBlock && !isLast ? "" : "rounded-b-xl",
          ].join(" ")}
          title="جابه‌جایی بلاک"
          aria-label="Drag to reorder block"
        >
          <RiDraggable size={16} className="rotate-90" />
        </button>

        {onMoveBlock && !isLast && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveBlock(block.instanceId, "down");
            }}
            className="flex h-6 w-8 items-center justify-center rounded-b-xl bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
            title="پایین"
          >
            <HiOutlineChevronDown size={12} />
          </button>
        )}
      </div>

      <BlockSpacingControls
        block={block}
        visible={isSelected}
        onSelectContainer={() =>
          onSelectElement(block.instanceId, "container", {
            centerBlock: false,
          })
        }
        onUpdateBlockSpacing={onUpdateBlockSpacing}
      />

      {/* ── Block Content ── */}
      <div
        className={[
          "transition-opacity duration-200",
          isDragging ? "opacity-50" : "opacity-100",
        ].join(" ")}
        onClick={() => onSelectElement(block.instanceId, "container")}
      >
        <BlockComponent
          block={block}
          mode="editor"
          selectedElementId={isSelected ? selectedElementId : null}
          onSelectElement={onSelectElement}
          onUpdateContent={onUpdateContent}
        />
      </div>
    </div>
  );
}
