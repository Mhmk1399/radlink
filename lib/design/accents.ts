// lib/ds/accents.ts
// ─────────────────────────────────────────────────────────────────
// Accent color token system — luxury black & gold edition
// Keeps the same API so existing components do not break
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
        gradient: "from-[#F5D76E] to-[#D4AF37]",
        bg: "bg-[#D4AF37]/10",
        bgHover: "group-hover:bg-[#D4AF37]/15",
        border: "border-[#D4AF37]/20",
        borderHover: "group-hover:border-[#D4AF37]/30",
        text: "text-[#F5D76E]",
        glow: "bg-[#D4AF37]/15",
        shadow: "hover:shadow-[#D4AF37]/20",
        dot: "bg-[#F5D76E]",
    },
    blue: {
        gradient: "from-[#FFE8A3] to-[#D4AF37]",
        bg: "bg-[#FFE8A3]/10",
        bgHover: "group-hover:bg-[#FFE8A3]/15",
        border: "border-[#FFE8A3]/20",
        borderHover: "group-hover:border-[#FFE8A3]/30",
        text: "text-[#FFE8A3]",
        glow: "bg-[#FFE8A3]/15",
        shadow: "hover:shadow-[#FFE8A3]/20",
        dot: "bg-[#FFE8A3]",
    },
    cyan: {
        gradient: "from-[#E9C46A] to-[#B8860B]",
        bg: "bg-[#E9C46A]/10",
        bgHover: "group-hover:bg-[#E9C46A]/15",
        border: "border-[#E9C46A]/20",
        borderHover: "group-hover:border-[#E9C46A]/30",
        text: "text-[#E9C46A]",
        glow: "bg-[#E9C46A]/15",
        shadow: "hover:shadow-[#E9C46A]/20",
        dot: "bg-[#E9C46A]",
    },
    emerald: {
        gradient: "from-[#D4AF37] to-[#8A6A12]",
        bg: "bg-[#D4AF37]/10",
        bgHover: "group-hover:bg-[#D4AF37]/15",
        border: "border-[#D4AF37]/20",
        borderHover: "group-hover:border-[#D4AF37]/30",
        text: "text-[#D4AF37]",
        glow: "bg-[#D4AF37]/15",
        shadow: "hover:shadow-[#D4AF37]/20",
        dot: "bg-[#D4AF37]",
    },
    violet: {
        gradient: "from-[#F5D76E] to-[#9A7A16]",
        bg: "bg-[#F5D76E]/10",
        bgHover: "group-hover:bg-[#F5D76E]/15",
        border: "border-[#F5D76E]/20",
        borderHover: "group-hover:border-[#F5D76E]/30",
        text: "text-[#F5D76E]",
        glow: "bg-[#F5D76E]/15",
        shadow: "hover:shadow-[#F5D76E]/20",
        dot: "bg-[#F5D76E]",
    },
    amber: {
        gradient: "from-[#F5D76E] via-[#D4AF37] to-[#B8860B]",
        bg: "bg-[#D4AF37]/10",
        bgHover: "group-hover:bg-[#D4AF37]/15",
        border: "border-[#D4AF37]/20",
        borderHover: "group-hover:border-[#D4AF37]/30",
        text: "text-[#F5D76E]",
        glow: "bg-[#D4AF37]/15",
        shadow: "hover:shadow-[#D4AF37]/20",
        dot: "bg-[#F5D76E]",
    },
    rose: {
        gradient: "from-[#FFE8A3] to-[#C99700]",
        bg: "bg-[#FFE8A3]/10",
        bgHover: "group-hover:bg-[#FFE8A3]/15",
        border: "border-[#FFE8A3]/20",
        borderHover: "group-hover:border-[#FFE8A3]/30",
        text: "text-[#FFE8A3]",
        glow: "bg-[#FFE8A3]/15",
        shadow: "hover:shadow-[#FFE8A3]/20",
        dot: "bg-[#FFE8A3]",
    },
    pink: {
        gradient: "from-[#F7E7A1] to-[#D4AF37]",
        bg: "bg-[#F7E7A1]/10",
        bgHover: "group-hover:bg-[#F7E7A1]/15",
        border: "border-[#F7E7A1]/20",
        borderHover: "group-hover:border-[#F7E7A1]/30",
        text: "text-[#F7E7A1]",
        glow: "bg-[#F7E7A1]/15",
        shadow: "hover:shadow-[#F7E7A1]/20",
        dot: "bg-[#F7E7A1]",
    },
    red: {
        gradient: "from-[#E0B84F] to-[#8A5A00]",
        bg: "bg-[#E0B84F]/10",
        bgHover: "group-hover:bg-[#E0B84F]/15",
        border: "border-[#E0B84F]/20",
        borderHover: "group-hover:border-[#E0B84F]/30",
        text: "text-[#E0B84F]",
        glow: "bg-[#E0B84F]/15",
        shadow: "hover:shadow-[#E0B84F]/20",
        dot: "bg-[#E0B84F]",
    },
    indigo: {
        gradient: "from-[#F5D76E] to-[#A67C00]",
        bg: "bg-[#F5D76E]/10",
        bgHover: "group-hover:bg-[#F5D76E]/15",
        border: "border-[#F5D76E]/20",
        borderHover: "group-hover:border-[#F5D76E]/30",
        text: "text-[#F5D76E]",
        glow: "bg-[#F5D76E]/15",
        shadow: "hover:shadow-[#F5D76E]/20",
        dot: "bg-[#F5D76E]",
    },
    orange: {
        gradient: "from-[#FFC857] to-[#B8860B]",
        bg: "bg-[#FFC857]/10",
        bgHover: "group-hover:bg-[#FFC857]/15",
        border: "border-[#FFC857]/20",
        borderHover: "group-hover:border-[#FFC857]/30",
        text: "text-[#FFC857]",
        glow: "bg-[#FFC857]/15",
        shadow: "hover:shadow-[#FFC857]/20",
        dot: "bg-[#FFC857]",
    },
    teal: {
        gradient: "from-[#D4AF37] to-[#5C4300]",
        bg: "bg-[#D4AF37]/10",
        bgHover: "group-hover:bg-[#D4AF37]/15",
        border: "border-[#D4AF37]/20",
        borderHover: "group-hover:border-[#D4AF37]/30",
        text: "text-[#D4AF37]",
        glow: "bg-[#D4AF37]/15",
        shadow: "hover:shadow-[#D4AF37]/20",
        dot: "bg-[#D4AF37]",
    },
};