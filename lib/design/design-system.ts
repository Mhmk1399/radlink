// lib/design-system.ts
// آپدیت barrel — animDelay اضافه شد

export {
    backgrounds,
    gradients,
    borders,
    shadows,
    typography,
    layout,
    animation,
    focus,
    interactive,
    components,
} from "./tokens";

export { accentTokens } from "./accents";
export type { AccentColor, AccentTokens } from "./accents";

export {
    cn,
    getAccent,
    animDelay,
    fadeDelay,
    toPersian,
} from "./helpers";

// ── Unified ds object ──
import {
    backgrounds,
    gradients,
    borders,
    shadows,
    typography,
    layout,
    animation,
    focus,
    interactive,
    components,
} from "./tokens";
import { accentTokens } from "./accents";
import { cn, getAccent, animDelay, toPersian } from "./helpers";

export const ds = {
    bg: backgrounds,
    gradient: gradients,
    border: borders,
    shadow: shadows,
    text: typography,
    layout,
    animation,
    focus,
    interactive,
    component: components,
    accent: accentTokens,
    cn,
    getAccent,
    animDelay,
    toPersian,
} as const;

export default ds;