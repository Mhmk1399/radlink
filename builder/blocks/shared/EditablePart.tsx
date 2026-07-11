// src/builder/blocks/shared/EditablePart.tsx

"use client";

import React from "react";

import type { EditorMode } from "@/types/blocks/builder.types";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type EditablePartProps = {
  instanceId: string;
  elementId: string;
  mode: EditorMode;
  selectedElementId?: string | null;
  onSelectElement?: (
    instanceId: string,
    elementId: string,
    options?: { centerBlock?: boolean },
  ) => void;
  children: React.ReactNode;
  className?: string;
};

export function EditablePart({
  instanceId,
  elementId,
  mode,
  selectedElementId,
  onSelectElement,
  children,
  className,
}: EditablePartProps) {
  if (mode !== "editor") {
    return className ? (
      <div className={className}>{children}</div>
    ) : (
      <>{children}</>
    );
  }

  const isSelected = selectedElementId === elementId;

  return (
    <div
      data-editable-element={elementId}
      className={cn(
        className,
        "cursor-pointer transition-all duration-200",
        isSelected &&
          "shadow-[0_0_0_2px_rgba(59,130,246,0.5),0_4px_12px_-2px_rgba(59,130,246,0.25)]",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelectElement?.(instanceId, elementId);
      }}
    >
      {children}
    </div>
  );
}
