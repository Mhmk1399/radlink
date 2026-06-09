"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import type { PageBlock } from "@/types/blocks/builder.types";

type DraggableBlockItemProps = {
  block: PageBlock;
  selectedBlockId: string | null;
  selectedElementId: string | null;
  onSelectElement: (instanceId: string, elementId: string) => void;
  onUpdateContent: (instanceId: string, key: string, value: string) => void;
};

export function DraggableBlockItem({
  block,
  selectedBlockId,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: DraggableBlockItemProps) {
  const config = blockRegistry[block.type as keyof typeof blockRegistry];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.instanceId,
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

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 50 : "auto",
      }}
      className={`relative rounded-3xl transition-all duration-200 ${
        selectedBlockId === block.instanceId
          ? "shadow-[0_0_0_2px_rgba(0,0,0,0.1),0_8px_30px_-8px_rgba(0,0,0,0.15),0_0_0_4px_rgba(59,130,246,0.4)]"
          : "shadow-[0_2px_8px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)]"
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`absolute -right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-400 shadow-md backdrop-blur-xl transition-all hover:scale-110 hover:text-neutral-600 active:scale-95 cursor-grab active:cursor-grabbing ${
          isDragging ? "scale-110 shadow-xl" : ""
        }`}
        title="جابه‌جایی بلاک"
        aria-label="Drag to reorder block"
      >
        <span className="text-lg leading-none">⋮⋮</span>
      </button>

      {/* Block Content */}
      <BlockComponent
        block={block}
        mode="editor"
        selectedElementId={
          selectedBlockId === block.instanceId ? selectedElementId : null
        }
        onSelectElement={onSelectElement}
        onUpdateContent={onUpdateContent}
      />
    </div>
  );
}
