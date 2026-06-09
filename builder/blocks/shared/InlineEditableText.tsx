// src/builder/blocks/shared/InlineEditableText.tsx

"use client";

import React from "react";

import type { EditorMode } from "@/types/blocks/builder.types";

type InlineEditableTextProps = {
  value: string;
  dataKey: string;
  instanceId: string;
  mode: EditorMode;
  multiline?: boolean;
  onUpdateContent?: (instanceId: string, key: string, value: string) => void;
  children: (value: string) => React.ReactNode;
};

export function InlineEditableText({
  value,
  dataKey,
  instanceId,
  mode,
  multiline = false,
  onUpdateContent,
  children,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const canEdit = mode === "editor" && Boolean(onUpdateContent);

  const save = () => {
    onUpdateContent?.(instanceId, dataKey, draft.trim());
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (!canEdit || !isEditing) {
    return (
      <span
        onDoubleClick={(event) => {
          if (!canEdit) return;

          event.preventDefault();
          event.stopPropagation();
          setIsEditing(true);
        }}
        title={canEdit ? "برای ویرایش دوبار کلیک کنید" : undefined}
      >
        {children(value)}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        value={draft}
        rows={3}
        onChange={(event) => setDraft(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }

          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            save();
          }
        }}
        className="w-full rounded-md bg-white/95 px-2 py-1 text-black shadow-[0_0_0_2px_rgba(59,130,246,0.5),0_4px_12px_-2px_rgba(59,130,246,0.25)]"
        dir="auto"
      />
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          save();
        }

        if (event.key === "Escape") {
          event.preventDefault();
          cancel();
        }
      }}
      className="w-full rounded-md bg-white/95 px-2 py-1 text-black shadow-[0_0_0_2px_rgba(59,130,246,0.5),0_4px_12px_-2px_rgba(59,130,246,0.25)]"
      dir="auto"
    />
  );
}
