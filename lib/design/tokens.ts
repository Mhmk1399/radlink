// lib/ds/tokens.ts
// ─────────────────────────────────────────────────────────────────
// Raw design tokens — no logic, no functions, pure constants
// Soft warm palette: charcoal + muted gold (dark), ivory + bronze (light)
// ─────────────────────────────────────────────────────────────────

/* ══════════════════════════════════════════════
   BACKGROUNDS
   ══════════════════════════════════════════════ */
export const backgrounds = {
    page: "bg-linear-to-b from-[#111116] via-[#141419] to-[#18181f]",
    pageAlt: "bg-linear-to-b from-[#18181f] via-[#141419] to-[#111116]",

    surface: {
        glass: "bg-white/[0.03] backdrop-blur-xl",
        glassHover: "hover:bg-white/[0.055]",
        glassStrong: "bg-white/[0.045] backdrop-blur-xl",
        glassMedium: "bg-white/[0.02] backdrop-blur-sm",
        card: "bg-linear-to-b from-white/[0.035] to-[#c8a84b]/[0.012]",
        cardHover: "hover:bg-linear-to-b hover:from-white/[0.05] hover:to-[#c8a84b]/[0.02]",
        dark: "bg-[#16161b]/92 backdrop-blur-xl",
        darkAlt: "bg-[#1a1a20]/85",
        overlay: "bg-[#0a0a0e]/70 backdrop-blur-xl",
    },

    navbar: "bg-linear-to-br from-[#111116]/96 via-[#16161b]/94 to-[#1c1c23]/92",
    navbarScrolled: "bg-linear-to-br from-[#0e0e13]/98 via-[#141419]/96 to-[#1a1a20]/94",

    glow: {
        hero: "bg-linear-to-b from-[#c8a84b]/[0.06] to-transparent",
        skyOrb: "bg-[#c8a84b]/[0.04]",
        blueOrb: "bg-[#a07830]/[0.04]",
        skyCenter: "bg-[#d2b660]/[0.025]",
    },

    grid: {
        lines:
            "bg-[linear-gradient(rgba(200,168,75,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(200,168,75,.12)_1px,transparent_1px)] bg-[length:60px_60px] opacity-[0.03]",
        dots: "bg-[radial-gradient(rgba(210,182,96,.14)_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.025]",
        dotsDense:
            "bg-[radial-gradient(rgba(210,182,96,.12)_1px,transparent_1px)] bg-[length:32px_32px] opacity-[0.025]",
    },
} as const;

/* ══════════════════════════════════════════════
   GRADIENTS
   ══════════════════════════════════════════════ */
export const gradients = {
    primary: "bg-linear-to-r from-[#a07830] via-[#c8a84b] to-[#d2b660]",
    primaryReverse: "bg-linear-to-l from-[#a07830] via-[#c8a84b] to-[#d2b660]",

    textPrimary:
        "bg-linear-to-l from-[#e8d8a0] via-[#d2b660] to-[#c8a84b] bg-clip-text text-transparent",
    textSecondary:
        "bg-linear-to-l from-[#d2b660] via-[#c8a84b] to-[#a07830] bg-clip-text text-transparent",

    logo: "bg-linear-to-br from-[#111116] via-[#a07830] to-[#d2b660]",
    orb: "bg-linear-to-br from-[#131318] via-[#1e1a10] to-[#2a2414]",

    divider: "bg-linear-to-r from-transparent via-[#c8a84b]/18 to-transparent",
    dividerLight: "bg-linear-to-r from-transparent via-white/7 to-transparent",
    dividerSky: "bg-linear-to-r from-transparent via-[#d2b660]/35 to-transparent",

    innerHighlight: "bg-linear-to-br from-white/12 via-[#d2b660]/7 to-transparent",
    innerHighlightCircle: "bg-linear-to-br from-[#d2b660]/8 via-transparent to-transparent",

    accent: {
        // ── Gold family (brand) ──────────────────────────────────
        sky: "from-[#d2b660] to-[#c8a84b]",
        amber: "from-[#d2b660] via-[#c8a84b] to-[#a07830]",
        orange: "from-[#e8b44a] to-[#a07830]",

        // ── Cool blues ───────────────────────────────────────────
        blue: "from-[#93C5FD] to-[#3B82F6]",
        indigo: "from-[#A5B4FC] to-[#6366F1]",
        violet: "from-[#C4B5FD] to-[#7C3AED]",

        // ── Teals & greens ───────────────────────────────────────
        cyan: "from-[#67E8F9] to-[#06B6D4]",
        teal: "from-[#5EEAD4] to-[#0D9488]",
        emerald: "from-[#6EE7B7] to-[#059669]",

        // ── Warm reds & pinks ────────────────────────────────────
        rose: "from-[#FDA4AF] to-[#E11D48]",
        pink: "from-[#F9A8D4] to-[#DB2777]",
        red: "from-[#FCA5A5] to-[#DC2626]",
    },
} as const;

/* ══════════════════════════════════════════════
   BORDERS
   ══════════════════════════════════════════════ */
export const borders = {
    // ── Structure ────────────────────────────────────────────────
    subtle: "border border-[#26262f]",
    light: "border border-[#2c2c36]",
    medium: "border border-[#c8a84b]/10",
    strong: "border border-[#c8a84b]/15",

    // ── Hover states ─────────────────────────────────────────────
    hoverLight: "hover:border-[#c8a84b]/14",
    hoverMedium: "hover:border-[#c8a84b]/20",
    hoverSky: "hover:border-[#c8a84b]/20",
    hoverSkyStrong: "hover:border-[#d2b660]/22",

    // ── Gold family ──────────────────────────────────────────────
    sky: "border-[#c8a84b]/16",
    skyStrong: "border-[#d2b660]/20",
    amber: "border-[#c8a84b]/16",
    orange: "border-[#e8944a]/20",

    // ── Cool blues ───────────────────────────────────────────────
    blue: "border-[#3B82F6]/22",
    indigo: "border-[#6366F1]/22",
    violet: "border-[#7C3AED]/22",

    // ── Teals & greens ───────────────────────────────────────────
    cyan: "border-[#06B6D4]/22",
    teal: "border-[#0D9488]/22",
    emerald: "border-[#059669]/22",

    // ── Warm reds & pinks ────────────────────────────────────────
    rose: "border-[#E11D48]/22",
    pink: "border-[#DB2777]/22",
    red: "border-[#DC2626]/22",

    // ── Utility ──────────────────────────────────────────────────
    dashed: "border border-dashed border-[#c8a84b]/14",
    inner: "border border-white/4",
    innerLight: "border border-[#c8a84b]/6",
} as const;

/* ══════════════════════════════════════════════
   SHADOWS
   ══════════════════════════════════════════════ */
export const shadows = {
    navbar:
        "shadow-[0_20px_60px_-28px_rgba(0,0,0,0.6),0_12px_35px_-18px_rgba(200,168,75,0.18)]",
    card: "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)]",
    cardHover: "hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)]",
    cardFeature: "hover:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.4)]",
    phone:
        "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_16px_32px_-10px_rgba(200,168,75,0.12)]",

    ctaPrimary: "shadow-[0_14px_40px_-16px_rgba(200,168,75,0.5)]",
    ctaPrimaryHover: "hover:shadow-[0_20px_48px_-14px_rgba(210,182,96,0.45)]",
    ctaSmall: "shadow-[0_12px_30px_-14px_rgba(200,168,75,0.55)]",
    ctaSmallHover: "hover:shadow-[0_16px_36px_-12px_rgba(210,182,96,0.45)]",

    logo: "shadow-[0_14px_28px_-14px_rgba(210,182,96,0.5)]",

    innerLight: "shadow-inner shadow-white/3",
    insetGlow: "shadow-[inset_0_1px_0_rgba(232,216,160,0.06)]",

    orb: "shadow-[0_0_50px_-12px_rgba(200,168,75,0.25)]",
    dot: "shadow-[0_0_10px_rgba(255,255,255,0.5)]",
    dotSky: "shadow-[0_0_10px_rgba(210,182,96,0.45)]",
    dotCyan: "shadow-[0_0_10px_rgba(6,182,212,0.4)]",
} as const;

/* ══════════════════════════════════════════════
   TYPOGRAPHY
   ══════════════════════════════════════════════ */
export const typography = {
    h1: "text-3xl font-extrabold leading-[1.3] tracking-tight text-[#e6e3de] sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.25]",
    h2: "text-2xl font-extrabold leading-snug tracking-tight text-[#e6e3de] sm:text-3xl md:text-4xl",
    h3: "text-lg font-bold sm:text-xl",
    h4: "text-base font-bold",

    body: "text-sm leading-relaxed text-[#9c9890] sm:text-base sm:leading-8",
    bodyLg: "text-sm leading-relaxed text-[#a8a49c] sm:text-base sm:leading-8 lg:text-lg",
    bodySmall: "text-xs leading-5 text-[#6e6a62]",

    cardTitle: "text-lg font-bold text-[#e6e3de] sm:text-xl",
    cardDescription: "text-sm leading-7 text-[#9c9890]",

    badge: "text-xs font-medium sm:text-sm",
    label: "text-xs font-medium text-[#6e6a62]",
    labelSmall: "text-[10px] text-[#6e6a62]",
    labelMuted: "text-[11px] font-medium text-[#c8a84b]/50",

    brandName: "text-sm font-semibold tracking-tight text-[#e6e3de] sm:text-base",
    brandSub: "text-[11px] font-medium text-[#c8a84b]/45",

    link: "text-xs font-medium text-[#d2b660]/50 group-hover:text-[#d2b660]",
    ctaText: "text-sm font-semibold text-[#e6e3de] sm:text-base",
    ctaSecondaryText: "text-sm font-medium text-[#c8c4bc]",

    navItem: "text-sm font-medium text-[#9c9890]",
    navItemActive: "text-sm font-medium text-[#e6e3de]",

    counter: "text-lg font-bold",
    number: "text-xs font-bold text-white/18 group-hover:text-white/30",
} as const;

/* ══════════════════════════════════════════════
   LAYOUT
   ══════════════════════════════════════════════ */
export const layout = {
    container: "mx-auto max-w-7xl",
    containerNarrow: "mx-auto max-w-3xl",
    containerWide: "mx-auto max-w-[90rem]",

    section: "px-4 py-20 sm:px-6 sm:py-28 lg:py-36",
    sectionCompact: "px-4 py-14 sm:px-6 sm:py-20 lg:py-28",

    headerOuter: "sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4",

    gap: {
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-5",
        xl: "gap-6",
        section: "gap-12 lg:gap-16",
        sectionLarge: "gap-14 lg:gap-20",
    },

    grid: {
        features: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
        blocks: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4",
        ctaPair: "grid grid-cols-1 gap-2 sm:grid-cols-2",
        stats: "grid grid-cols-2 gap-2",
    },

    radius: {
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
        full: "rounded-full",
        navbar: "rounded-[1.75rem]",
        navbarInner: "rounded-[1.35rem]",
        phone: "rounded-[2.5rem]",
        phoneInner: "rounded-8",
    },
} as const;

/* ══════════════════════════════════════════════
   ANIMATION
   ══════════════════════════════════════════════ */
export const animation = {
    fast: "duration-200",
    normal: "duration-300",
    slow: "duration-500",

    base: "transition-all duration-200",
    smooth: "transition-all duration-300",
    colors: "transition-colors duration-200",
    transform: "transition-transform duration-200",
    opacity: "transition-opacity duration-300",

    hoverLift: "hover:-translate-y-0.5",
    hoverLiftLg: "hover:-translate-y-1",
    hoverScale: "hover:scale-[1.02]",
    activePress: "active:scale-[0.98]",
    activePressSmall: "active:scale-[0.99]",
    activeRestore: "active:translate-y-0",

    motionSafe: "motion-reduce:transition-none",

    classes: {
        fadeUp: "s-fade-up",
        floatSlow: "s-float-slow",
        floatMedium: "s-float-medium",
        pulseRing: "s-pulse-ring",
        shimmer: "s-shimmer",
        blockPop: "b-block-pop",
        dragHint: "b-drag-hint",
    },

    delayClasses: [
        "s-fade-d1",
        "s-fade-d2",
        "s-fade-d3",
        "s-fade-d4",
        "s-fade-d5",
        "s-fade-d6",
        "s-fade-d7",
        "s-fade-d8",
    ] as const,

    keyframes: `
@keyframes fade-up{0%{opacity:0;transform:translateY(28px)}100%{opacity:1;transform:translateY(0)}}
@keyframes float-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes float-medium{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pulse-ring{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.8);opacity:0}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes pulse-glow{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.8;transform:scale(1.08)}}
@keyframes icon-rotate{0%,100%{transform:rotate(0deg)}50%{transform:rotate(6deg)}}
@keyframes block-pop{0%{opacity:0;transform:scale(.92) translateY(12px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes count-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
.s-fade-up{animation:fade-up .7s cubic-bezier(.22,1,.36,1) both}
.s-fade-d1{animation-delay:.1s}.s-fade-d2{animation-delay:.2s}
.s-fade-d3{animation-delay:.25s}.s-fade-d4{animation-delay:.3s}
.s-fade-d5{animation-delay:.35s}.s-fade-d6{animation-delay:.4s}
.s-fade-d7{animation-delay:.45s}.s-fade-d8{animation-delay:.5s}
.s-float-slow{animation:float-slow 7s ease-in-out infinite}
.s-float-medium{animation:float-medium 5s ease-in-out infinite}
.s-pulse-ring{animation:pulse-ring 2.5s cubic-bezier(.4,0,.6,1) infinite}
.s-shimmer{background-size:200% 100%;animation:shimmer 5s linear infinite}
.s-pulse-glow{animation:pulse-glow 4s ease-in-out infinite}
.s-icon-hover:hover .s-icon-rotate{animation:icon-rotate .5s ease-in-out}
.b-block-pop{animation:block-pop .5s cubic-bezier(.22,1,.36,1) both}
.b-float-slow{animation:float-slow 7s ease-in-out infinite}
.b-float-medium{animation:float-medium 5s ease-in-out infinite}
.anim-count-pulse{animation:count-pulse 3s ease-in-out infinite}
`,
} as const;

/* ══════════════════════════════════════════════
   FOCUS / ACCESSIBILITY
   ══════════════════════════════════════════════ */
export const focus = {
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",
    ringLight:
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b660]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",
    none: "focus-visible:outline-none",
} as const;

/* ══════════════════════════════════════════════
   INTERACTIVE
   ══════════════════════════════════════════════ */
export const interactive = {
    touch: "touch-manipulation",
    button:
        "transition-all duration-200 touch-manipulation active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",
    linkHover: "hover:text-[#e6e3de] transition-colors duration-200",
    cardHover:
        "transition-all duration-300 hover:-translate-y-1 hover:border-[#c8a84b]/16 hover:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",
} as const;

/* ══════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════ */
export const components = {
    badge: {
        base: "inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm",

        // ── Gold family ──────────────────────────────────────────
        sky: "border border-[#c8a84b]/16 bg-[#c8a84b]/[0.06] text-[#d2b660]",
        amber: "border border-[#c8a84b]/16 bg-[#c8a84b]/[0.06] text-[#e8d8a0]",

        // ── Cool blues ───────────────────────────────────────────
        blue: "border border-[#3B82F6]/20 bg-[#3B82F6]/[0.07] text-[#93C5FD]",
        indigo: "border border-[#6366F1]/20 bg-[#6366F1]/[0.07] text-[#A5B4FC]",
        violet: "border border-[#7C3AED]/20 bg-[#7C3AED]/[0.07] text-[#C4B5FD]",

        // ── Teals & greens ───────────────────────────────────────
        emerald: "border border-[#059669]/20 bg-[#059669]/[0.07] text-[#6EE7B7]",
        teal: "border border-[#0D9488]/20 bg-[#0D9488]/[0.07] text-[#5EEAD4]",
        cyan: "border border-[#06B6D4]/20 bg-[#06B6D4]/[0.07] text-[#67E8F9]",

        // ── Warm reds & pinks ────────────────────────────────────
        rose: "border border-[#E11D48]/20 bg-[#E11D48]/[0.07] text-[#FDA4AF]",
        pink: "border border-[#DB2777]/20 bg-[#DB2777]/[0.07] text-[#F9A8D4]",
        orange: "border border-[#FB923C]/20 bg-[#FB923C]/[0.07] text-[#FED7AA]",
    },

    ctaPrimary:
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-[#d2b660]/22 bg-linear-to-r from-[#a07830] via-[#c8a84b] to-[#d2b660] px-8 py-3.5 text-sm font-semibold text-[#111116] shadow-[0_14px_40px_-16px_rgba(200,168,75,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-14px_rgba(210,182,96,0.45)] active:translate-y-0 active:scale-[0.98] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b660]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",

    ctaSecondary:
        "group inline-flex items-center justify-center gap-2 rounded-2xl border border-[#c8a84b]/14 bg-white/[0.03] px-7 py-3.5 text-sm font-medium text-[#c8c4bc] shadow-[inset_0_1px_0_rgba(232,216,160,0.06)] backdrop-blur-sm transition-all duration-200 hover:border-[#d2b660]/22 hover:bg-[#c8a84b]/[0.06] hover:text-[#e6e3de] active:scale-[0.98] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",

    ctaSmall:
        "group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d2b660]/20 bg-linear-to-r from-[#a07830] via-[#c8a84b] to-[#d2b660] px-5 text-sm font-semibold text-[#111116] shadow-[0_12px_30px_-14px_rgba(200,168,75,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(210,182,96,0.45)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d2b660]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",

    ghostButton:
        "inline-flex h-11 items-center justify-center rounded-full border border-[#c8a84b]/14 px-5 text-sm font-medium shadow-[inset_0_1px_0_rgba(232,216,160,0.06)] transition-all duration-200 hover:border-[#d2b660]/22 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",

    navItem:
        "group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#9c9890] transition-all duration-200 hover:bg-[#c8a84b]/[0.06] hover:text-[#e6e3de] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",

    navItemActive:
        "group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#d2b660] bg-[#c8a84b]/[0.07] shadow-inner shadow-white/3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a84b]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]",

    featureCard:
        "group relative overflow-hidden rounded-3xl border border-[#c8a84b]/10 bg-linear-to-b from-white/[0.035] to-[#c8a84b]/[0.012] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1",

    miniFeature:
        "inline-flex items-center gap-2 rounded-full border border-[#c8a84b]/10 bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-[#9c9890] transition-all duration-200 hover:border-[#c8a84b]/20 hover:bg-[#c8a84b]/[0.06] hover:text-[#e6e3de]",

    iconBox: {
        sm: "flex h-6 w-6 items-center justify-center rounded-lg",
        md: "flex h-10 w-10 items-center justify-center rounded-xl",
        lg: "flex h-14 w-14 items-center justify-center rounded-2xl",
        circle: "flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a84b]/16",
    },

    numberBadge:
        "flex h-8 w-8 items-center justify-center rounded-full border border-[#c8a84b]/10 bg-white/[0.03] text-xs font-bold text-white/18 transition-colors duration-300 group-hover:text-[#d2b660]/50",

    phoneMockup: {
        outer:
            "relative overflow-hidden rounded-[2.5rem] border border-[#c8a84b]/14 bg-linear-to-b from-[#1a1a20] via-[#16161b] to-[#111116] p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_16px_32px_-10px_rgba(200,168,75,0.12)]",
        inner:
            "relative overflow-hidden rounded-8 border border-[#c8a84b]/10 bg-linear-to-b from-[#18181e] to-[#111116]",
        notch: "mx-auto mt-2 h-5 w-24 rounded-full bg-[#0a0a0e]/85 border border-[#c8a84b]/10",
        homeBar: "mx-auto mb-2 h-1 w-16 rounded-full bg-[#c8a84b]/25",
    },

    sectionHeader: "mx-auto max-w-3xl text-center",

    connector: {
        line: "h-12 w-px bg-linear-to-b from-[#c8a84b]/16 to-transparent",
        dot: "flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a84b]/16 bg-[#c8a84b]/[0.06]",
    },
} as const;