// lib/ds/helpers.ts
// آپدیت کامل — همه توابع اینجا هستن

import type { AccentColor, AccentTokens } from "./accents";
import { accentTokens } from "./accents";

/** Merge class strings — filter all falsy values */
export function cn(
    ...classes: (string | false | null | undefined | 0)[]
): string {
    return classes.filter(Boolean).join(" ");
}

/** Get accent tokens by color name */
export function getAccent(color: AccentColor): AccentTokens {
    return accentTokens[color];
}

/**
 * Get animation fade-up delay class by index
 * index 1 → "s-fade-d1" ... index 8+ → "s-fade-d8"
 *
 * Usage:
 *   className={cn(animation.classes.fadeUp, animDelay(2))}
 */
export function animDelay(index: number): string {
    return `s-fade-d${Math.min(Math.max(index, 1), 8)}`;
}

/** @deprecated use animDelay() instead */
export const fadeDelay = animDelay;

/** Convert number to Persian (Farsi) numerals */
export function toPersian(n: number): string {
    return n.toLocaleString("fa-IR");
}