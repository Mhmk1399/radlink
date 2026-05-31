// lib/ds/accents.ts
// ─────────────────────────────────────────────────────────────────
// Accent color token system — 12 colors, consistent API
// ─────────────────────────────────────────────────────────────────

export type AccentColor =
    | "sky"
    | "blue"
    | "cyan"
    | "emerald"
    | "violet"
    | "amber"
    | "rose"
    | "pink"
    | "red"
    | "indigo"
    | "orange"
    | "teal";

export interface AccentTokens {
    gradient: string;
    bg: string;
    bgHover: string;
    border: string;
    borderHover: string;
    text: string;
    glow: string;
    shadow: string;
    dot: string;
}

export const accentTokens: Record<AccentColor, AccentTokens> = {
    sky: {
        gradient: "from-sky-400 to-blue-500",
        bg: "bg-sky-400/10",
        bgHover: "group-hover:bg-sky-400/15",
        border: "border-sky-400/20",
        borderHover: "group-hover:border-sky-400/25",
        text: "text-sky-300",
        glow: "bg-sky-400/15",
        shadow: "hover:shadow-sky-400/20",
        dot: "bg-sky-300",
    },
    blue: {
        gradient: "from-blue-400 to-indigo-500",
        bg: "bg-blue-400/10",
        bgHover: "group-hover:bg-blue-400/15",
        border: "border-blue-400/20",
        borderHover: "group-hover:border-blue-400/25",
        text: "text-blue-300",
        glow: "bg-blue-400/15",
        shadow: "hover:shadow-blue-400/20",
        dot: "bg-blue-300",
    },
    cyan: {
        gradient: "from-cyan-400 to-teal-500",
        bg: "bg-cyan-400/10",
        bgHover: "group-hover:bg-cyan-400/15",
        border: "border-cyan-400/20",
        borderHover: "group-hover:border-cyan-400/25",
        text: "text-cyan-300",
        glow: "bg-cyan-400/15",
        shadow: "hover:shadow-cyan-400/20",
        dot: "bg-cyan-300",
    },
    emerald: {
        gradient: "from-emerald-400 to-green-500",
        bg: "bg-emerald-400/10",
        bgHover: "group-hover:bg-emerald-400/15",
        border: "border-emerald-400/20",
        borderHover: "hover:border-emerald-400/25",
        text: "text-emerald-300",
        glow: "bg-emerald-400/15",
        shadow: "hover:shadow-emerald-400/20",
        dot: "bg-emerald-300",
    },
    violet: {
        gradient: "from-violet-400 to-purple-500",
        bg: "bg-violet-400/10",
        bgHover: "group-hover:bg-violet-400/15",
        border: "border-violet-400/20",
        borderHover: "group-hover:border-violet-400/25",
        text: "text-violet-300",
        glow: "bg-violet-400/15",
        shadow: "hover:shadow-violet-400/20",
        dot: "bg-violet-300",
    },
    amber: {
        gradient: "from-amber-400 to-orange-500",
        bg: "bg-amber-400/10",
        bgHover: "group-hover:bg-amber-400/15",
        border: "border-amber-400/20",
        borderHover: "group-hover:border-amber-400/25",
        text: "text-amber-300",
        glow: "bg-amber-400/15",
        shadow: "hover:shadow-amber-400/20",
        dot: "bg-amber-300",
    },
    rose: {
        gradient: "from-rose-400 to-pink-500",
        bg: "bg-rose-400/10",
        bgHover: "group-hover:bg-rose-400/15",
        border: "border-rose-400/20",
        borderHover: "group-hover:border-rose-400/25",
        text: "text-rose-300",
        glow: "bg-rose-400/15",
        shadow: "hover:shadow-rose-400/20",
        dot: "bg-rose-300",
    },
    pink: {
        gradient: "from-pink-400 to-rose-500",
        bg: "bg-pink-400/10",
        bgHover: "group-hover:bg-pink-400/15",
        border: "border-pink-400/20",
        borderHover: "group-hover:border-pink-400/25",
        text: "text-pink-300",
        glow: "bg-pink-400/15",
        shadow: "hover:shadow-pink-400/20",
        dot: "bg-pink-300",
    },
    red: {
        gradient: "from-red-400 to-rose-500",
        bg: "bg-red-400/10",
        bgHover: "group-hover:bg-red-400/15",
        border: "border-red-400/20",
        borderHover: "group-hover:border-red-400/25",
        text: "text-red-300",
        glow: "bg-red-400/15",
        shadow: "hover:shadow-red-400/20",
        dot: "bg-red-300",
    },
    indigo: {
        gradient: "from-indigo-400 to-violet-500",
        bg: "bg-indigo-400/10",
        bgHover: "group-hover:bg-indigo-400/15",
        border: "border-indigo-400/20",
        borderHover: "group-hover:border-indigo-400/25",
        text: "text-indigo-300",
        glow: "bg-indigo-400/15",
        shadow: "hover:shadow-indigo-400/20",
        dot: "bg-indigo-300",
    },
    orange: {
        gradient: "from-orange-400 to-amber-500",
        bg: "bg-orange-400/10",
        bgHover: "group-hover:bg-orange-400/15",
        border: "border-orange-400/20",
        borderHover: "group-hover:border-orange-400/25",
        text: "text-orange-300",
        glow: "bg-orange-400/15",
        shadow: "hover:shadow-orange-400/20",
        dot: "bg-orange-300",
    },
    teal: {
        gradient: "from-teal-400 to-cyan-500",
        bg: "bg-teal-400/10",
        bgHover: "group-hover:bg-teal-400/15",
        border: "border-teal-400/20",
        borderHover: "group-hover:border-teal-400/25",
        text: "text-teal-300",
        glow: "bg-teal-400/15",
        shadow: "hover:shadow-teal-400/20",
        dot: "bg-teal-300",
    },
};