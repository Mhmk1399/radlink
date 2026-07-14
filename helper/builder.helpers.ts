// builder/builder.helpers.ts

import type {
  AnimationType,
  ContentAlignValue,
  EditableStyleKey,
  PageBlock,
  ResponsiveValue,
  ShadowStyleValue,
  TextAlignValue,
} from "@/types/blocks/builder.types";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { normalizeBlockSpacingValue } from "@/lib/design/block-spacing";
import { sanitizePageSlug } from "@/lib/validation/pageSlug";

/* ── Constants ── */
export const STORAGE_KEY = "page-builder-blocks";
export const MAX_SUGGESTED_BLOCKS = 12;

export type Breakpoint = "mobile" | "tablet" | "desktop";

/* ── Style helpers ── */
const TEXT_ALIGN_VALUES = new Set<TextAlignValue>([
  "left",
  "center",
  "right",
]);

const CONTENT_ALIGN_VALUES = new Set<ContentAlignValue>([
  "left",
  "center",
  "right",
]);

export function normalizeStyleValue(
  styleKey: EditableStyleKey,
  value: string | number | AnimationType | ShadowStyleValue,
): string | number | AnimationType | ShadowStyleValue {
  if (styleKey === "textAlign") {
    const normalized = String(value) as TextAlignValue;
    return TEXT_ALIGN_VALUES.has(normalized) ? normalized : "right";
  }
  if (styleKey === "contentAlign") {
    const normalized = String(value) as ContentAlignValue;
    return CONTENT_ALIGN_VALUES.has(normalized) ? normalized : "right";
  }
  if (
    styleKey === "marginTop" ||
    styleKey === "marginBottom" ||
    styleKey === "paddingTop" ||
    styleKey === "paddingBottom"
  ) {
    return normalizeBlockSpacingValue(value);
  }
  if (
    styleKey === "fontSize" ||
    styleKey === "borderRadius" ||
    styleKey === "borderWidth" ||
    styleKey === "gridColumns"
  ) {
    const numericValue =
      typeof value === "number" ? value : Number.parseFloat(String(value));
    return Number.isFinite(numericValue) ? numericValue : 0;
  }
  if (styleKey === "shadow") {
    const raw =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as ShadowStyleValue)
        : {};
    const intensity = Number(raw.intensity ?? 0);
    return {
      color: typeof raw.color === "string" ? raw.color : "rgba(15,23,42,0.22)",
      intensity: Number.isFinite(intensity)
        ? Math.min(100, Math.max(0, intensity))
        : 0,
    };
  }
  return value;
}

export function updateResponsiveValue<T>(
  current: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint,
  value: T,
): ResponsiveValue<T> {
  return { ...(current ?? {}), [breakpoint]: value };
}

/* ── Block helpers ── */
export function normalizeOrder(blocks: PageBlock[]): PageBlock[] {
  return blocks.map((block, index) => ({ ...block, order: index }));
}

export function cloneBlock(block: PageBlock): PageBlock {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${block.type}-${Date.now()}`;
  return { ...structuredClone(block), instanceId: id };
}

export function createInitialBuilderState() {
  const firstBlock = blockRegistry.banner.createDefaultBlock(0);
  return {
    blocks: [firstBlock] as PageBlock[],
    selectedBlockId: firstBlock.instanceId as string | null,
    selectedElementId: "container" as string | null,
  };
}

/* ── Storage ── */
export function saveToStorage(blocks: PageBlock[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  } catch {
    /* quota exceeded or SSR */
  }
}

export function loadFromStorage(): PageBlock[] | null {
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

/* ── URL slug ── */
export function slugify(val: string): string {
  return sanitizePageSlug(val);
}
