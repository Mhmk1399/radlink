import type { CSSProperties } from "react";
import type { EditableStyleMap, PageBlock } from "@/types/blocks/builder.types";

export type BlockSpacingKey =
  | "marginTop"
  | "marginBottom"
  | "paddingTop"
  | "paddingBottom";

const DEFAULT_TOP_SPACING = 0;
const DEFAULT_BOTTOM_SPACING = 24;
const DEFAULT_PADDING = 0;
export const BLOCK_SPACING_MIN = 0;
export const BLOCK_SPACING_MAX = 160;
export const BLOCK_SPACING_STEP = 4;

function clampSpacing(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(
    BLOCK_SPACING_MAX,
    Math.max(BLOCK_SPACING_MIN, Math.round(value)),
  );
}

function readSpacingValue(
  style: EditableStyleMap | undefined,
  key: BlockSpacingKey,
) {
  const value = style?.[key]?.mobile;
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampSpacing(value);
  }

  if (key === "paddingTop" || key === "paddingBottom")
    return DEFAULT_PADDING;

  return key === "marginTop" ? DEFAULT_TOP_SPACING : DEFAULT_BOTTOM_SPACING;
}

export function normalizeBlockSpacingValue(value: unknown) {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return clampSpacing(numericValue);
}

export function getBlockSpacingValue(block: PageBlock, key: BlockSpacingKey) {
  return readSpacingValue(block.elements?.container?.style, key);
}

export function getBlockSpacingStyle(block: PageBlock): CSSProperties {
  return {
    marginTop: getBlockSpacingValue(block, "marginTop"),
    marginBottom: getBlockSpacingValue(block, "marginBottom"),
  };
}
