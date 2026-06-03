// ─────────────────────────────────────────────────────────────────
// lib/design/theme-tokens.ts
// ─────────────────────────────────────────────────────────────────

export interface ThemeTokens {
    // Backgrounds
    pageBg: string;
    sidebarBg: string;
    cardBg: string;
    cardBgHover: string;
    modalBg: string;
    inputBg: string;
    headerBg: string;
    tooltipBg: string;
    dropdownBg: string;
    activeBg: string;
    hoverBg: string;
    selectedBg: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textDisabled: string;
    textAccent: string;
    textAccentMuted: string;
    textLink: string;
    textError: string;
    textSuccess: string;
    textWarning: string;
    textInfo: string;

    // Borders
    borderSubtle: string;
    borderLight: string;
    borderMedium: string;
    borderAccent: string;
    borderAccentHover: string;
    borderError: string;
    borderSuccess: string;
    borderInput: string;
    borderInputFocus: string;
    divider: string;

    // Shadows
    cardShadow: string;
    dropdownShadow: string;

    // Scrollbar
    scrollbar: string;
}

const dark: ThemeTokens = {
    // Backgrounds
    pageBg: "bg-gradient-to-b from-[#030303] via-[#090806] to-[#141006]",
    sidebarBg: "bg-[#0B0905]/95 backdrop-blur-2xl",
    cardBg: "bg-white/[0.035] backdrop-blur-xl",
    cardBgHover: "hover:bg-white/[0.06]",
    modalBg: "bg-[#0B0905]/95 backdrop-blur-2xl",
    inputBg: "bg-white/[0.035]",
    headerBg: "bg-[#0B0905]/90 backdrop-blur-xl",
    tooltipBg: "bg-[#1A1304]",
    dropdownBg: "bg-[#0B0905]/98 backdrop-blur-2xl",
    activeBg: "bg-[#D4AF37]/[0.08]",
    hoverBg: "hover:bg-white/[0.04]",
    selectedBg: "bg-[#D4AF37]/[0.06]",

    // Text
    textPrimary: "text-white",
    textSecondary: "text-slate-300",
    textMuted: "text-slate-400",
    textDisabled: "text-slate-500",
    textAccent: "text-[#F5D76E]",
    textAccentMuted: "text-[#D4AF37]",
    textLink: "text-[#F5D76E] hover:text-[#FFE8A3]",
    textError: "text-red-400",
    textSuccess: "text-emerald-400",
    textWarning: "text-amber-400",
    textInfo: "text-blue-400",

    // Borders
    borderSubtle: "border-white/[0.06]",
    borderLight: "border-white/[0.08]",
    borderMedium: "border-white/[0.12]",
    borderAccent: "border-[#D4AF37]/20",
    borderAccentHover: "hover:border-[#D4AF37]/30",
    borderError: "border-red-500/30",
    borderSuccess: "border-emerald-500/30",
    borderInput: "border-white/[0.08]",
    borderInputFocus: "focus:border-[#D4AF37]/40",
    divider: "border-white/[0.06]",

    // Shadows
    cardShadow: "shadow-[0_20px_50px_-28px_rgba(0,0,0,0.95)]",
    dropdownShadow: "shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]",

    // Scrollbar
    scrollbar:
        "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full",
};

const light: ThemeTokens = {
    // Backgrounds
    pageBg: "bg-gradient-to-b from-[#FAFAF8] via-[#F5F3EE] to-[#EDE8DC]",
    sidebarBg: "bg-white/90 backdrop-blur-2xl",
    cardBg: "bg-white/70 backdrop-blur-xl",
    cardBgHover: "hover:bg-white/90",
    modalBg: "bg-white/95 backdrop-blur-2xl",
    inputBg: "bg-white/60",
    headerBg: "bg-white/80 backdrop-blur-xl",
    tooltipBg: "bg-[#1A1304]",
    dropdownBg: "bg-white/98 backdrop-blur-2xl",
    activeBg: "bg-[#D4AF37]/[0.06]",
    hoverBg: "hover:bg-black/[0.03]",
    selectedBg: "bg-[#D4AF37]/[0.05]",

    // Text
    textPrimary: "text-[#1A1304]",
    textSecondary: "text-[#3D3520]",
    textMuted: "text-[#6B5D3E]",
    textDisabled: "text-[#A09070]",
    textAccent: "text-[#B8860B]",
    textAccentMuted: "text-[#8A6A12]",
    textLink: "text-[#B8860B] hover:text-[#8A6A12]",
    textError: "text-red-600",
    textSuccess: "text-emerald-600",
    textWarning: "text-amber-600",
    textInfo: "text-blue-600",

    // Borders
    borderSubtle: "border-black/[0.06]",
    borderLight: "border-black/[0.08]",
    borderMedium: "border-black/[0.12]",
    borderAccent: "border-[#D4AF37]/25",
    borderAccentHover: "hover:border-[#D4AF37]/40",
    borderError: "border-red-500/30",
    borderSuccess: "border-emerald-500/30",
    borderInput: "border-black/[0.10]",
    borderInputFocus: "focus:border-[#D4AF37]/50",
    divider: "border-black/[0.06]",

    // Shadows
    cardShadow: "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]",
    dropdownShadow: "shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)]",

    // Scrollbar
    scrollbar:
        "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full",
};

export const themeTokens: Record<"dark" | "light", ThemeTokens> = {
    dark,
    light,
};