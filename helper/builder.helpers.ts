// builder/builder.helpers.ts

import type {
    AnimationType,
    EditableStyleKey,
    PageBlock,
    ResponsiveValue,
} from "@/types/blocks/builder.types";
import { blockRegistry } from "@/builder/blocks/blockRegistry";

/* ── Constants ── */
export const STORAGE_KEY = "page-builder-blocks";
export const MAX_SUGGESTED_BLOCKS = 12;

export type Breakpoint = "mobile" | "tablet" | "desktop";

/* ── Style helpers ── */
export function normalizeStyleValue(
    styleKey: EditableStyleKey,
    value: string | number | AnimationType,
): string | number | AnimationType {
    if (
        styleKey === "fontSize" ||
        styleKey === "borderRadius" ||
        styleKey === "borderWidth"
    ) {
        const numericValue =
            typeof value === "number" ? value : Number.parseFloat(String(value));
        return Number.isFinite(numericValue) ? numericValue : 0;
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
    return val
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
  }