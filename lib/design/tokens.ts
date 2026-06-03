// lib/ds/tokens.ts
// ─────────────────────────────────────────────────────────────────
// Raw design tokens — no logic, no functions, pure constants
// ─────────────────────────────────────────────────────────────────

/* ══════════════════════════════════════════════
   BACKGROUNDS
   ══════════════════════════════════════════════ */
export const backgrounds = {
    page: "bg-linear-to-b from-[#030303] via-[#090806] to-[#141006]",
    pageAlt: "bg-linear-to-b from-[#120E05] via-[#080706] to-[#030303]",

    surface: {
        glass: "bg-white/[0.035] backdrop-blur-xl",
        glassHover: "hover:bg-white/[0.07]",
        glassStrong: "bg-white/[0.055] backdrop-blur-xl",
        glassMedium: "bg-white/2.5 backdrop-blur-sm",
        card: "bg-linear-to-b from-white/[0.045] to-[#D4AF37]/[0.018]",
        cardHover: "hover:bg-linear-to-b hover:from-white/[0.065] hover:to-[#D4AF37]/3",
        dark: "bg-[#0B0905]/90 backdrop-blur-xl",
        darkAlt: "bg-[#11100C]/80",
        overlay: "bg-[#050505]/80 backdrop-blur-xl",
    },

    navbar: "bg-linear-to-br from-[#050505]/96 via-[#0E0B05]/94 to-[#1A1304]/90",
    navbarScrolled: "bg-linear-to-br from-[#030303]/98 via-[#0B0905]/96 to-[#161004]/92",

    glow: {
        hero: "bg-linear-to-b from-[#D4AF37]/[0.09] to-transparent",
        skyOrb: "bg-[#D4AF37]/6",
        blueOrb: "bg-[#B8860B]/6",
        skyCenter: "bg-[#F5D76E]/[0.035]",
    },

    grid: {
        lines:
            "bg-[linear-gradient(rgba(212,175,55,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,.18)_1px,transparent_1px)] bg-[length:60px_60px] opacity-[0.035]",
        dots: "bg-[radial-gradient(rgba(245,215,110,.22)_1px,transparent_1px)] bg-[length:40px_40px] opacity-2.5",
        dotsDense:
            "bg-[radial-gradient(rgba(245,215,110,.18)_1px,transparent_1px)] bg-[length:32px_32px] opacity-2.5",
    },
} as const;

/* ══════════════════════════════════════════════
   GRADIENTS
   ══════════════════════════════════════════════ */
export const gradients = {
    primary: "bg-linear-to-r from-[#B8860B] via-[#D4AF37] to-[#F5D76E]",
    primaryReverse: "bg-linear-to-l from-[#B8860B] via-[#D4AF37] to-[#F5D76E]",

    textPrimary:
        "bg-linear-to-l from-[#FFE8A3] via-[#F5D76E] to-[#D4AF37] bg-clip-text text-transparent",
    textSecondary:
        "bg-linear-to-l from-[#F5D76E] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent",

    logo: "bg-linear-to-br from-[#050505] via-[#B8860B] to-[#F5D76E]",
    orb: "bg-linear-to-br from-[#080705] via-[#191204] to-[#3A2904]",

    divider: "bg-linear-to-r from-transparent via-[#D4AF37]/25 to-transparent",
    dividerLight: "bg-linear-to-r from-transparent via-white/10 to-transparent",
    dividerSky: "bg-linear-to-r from-transparent via-[#F5D76E]/55 to-transparent",

    innerHighlight: "bg-linear-to-br from-white/18 via-[#F5D76E]/10 to-transparent",
    innerHighlightCircle: "bg-linear-to-br from-[#F5D76E]/12 via-transparent to-transparent",

    accent: {
        sky: "from-[#F5D76E] to-[#D4AF37]",
        blue: "from-[#FFE8A3] to-[#D4AF37]",
        cyan: "from-[#E9C46A] to-[#B8860B]",
        emerald: "from-[#D4AF37] to-[#8A6A12]",
        violet: "from-[#F5D76E] to-[#9A7A16]",
        amber: "from-[#F5D76E] via-[#D4AF37] to-[#B8860B]",
        rose: "from-[#FFE8A3] to-[#C99700]",
        pink: "from-[#F7E7A1] to-[#D4AF37]",
        red: "from-[#E0B84F] to-[#8A5A00]",
        indigo: "from-[#F5D76E] to-[#A67C00]",
        orange: "from-[#FFC857] to-[#B8860B]",
        teal: "from-[#D4AF37] to-[#5C4300]",
    },
} as const;

/* ══════════════════════════════════════════════
   BORDERS
   ══════════════════════════════════════════════ */
export const borders = {
    subtle: "border border-white/8",
    light: "border border-white/10",
    medium: "border border-[#D4AF37]/12",
    strong: "border border-[#D4AF37]/18",

    hoverLight: "hover:border-[#D4AF37]/18",
    hoverMedium: "hover:border-[#D4AF37]/25",
    hoverSky: "hover:border-[#D4AF37]/25",
    hoverSkyStrong: "hover:border-[#F5D76E]/30",

    sky: "border-[#D4AF37]/20",
    skyStrong: "border-[#F5D76E]/25",
    cyan: "border-[#E9C46A]/20",
    emerald: "border-[#D4AF37]/20",
    violet: "border-[#F5D76E]/20",
    amber: "border-[#D4AF37]/20",
    rose: "border-[#FFE8A3]/20",
    blue: "border-[#FFE8A3]/20",
    indigo: "border-[#F5D76E]/20",
    orange: "border-[#FFC857]/20",
    teal: "border-[#D4AF37]/20",
    pink: "border-[#F7E7A1]/20",
    red: "border-[#E0B84F]/20",

    dashed: "border border-dashed border-[#D4AF37]/18",
    inner: "border border-white/5",
    innerLight: "border border-[#D4AF37]/8",
} as const;


/* ══════════════════════════════════════════════
   SHADOWS
   ══════════════════════════════════════════════ */
export const shadows = {
    navbar:
        "shadow-[0_24px_70px_-32px_rgba(0,0,0,0.95),0_16px_40px_-22px_rgba(212,175,55,0.32)]",
    card: "shadow-[0_20px_50px_-28px_rgba(0,0,0,0.95)]",
    cardHover: "hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]",
    cardFeature: "hover:shadow-[0_30px_60px_-25px]",
    phone:
        "shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95),0_20px_40px_-15px_rgba(212,175,55,0.22)]",

    ctaPrimary: "shadow-[0_20px_50px_-20px_rgba(212,175,55,0.75)]",
    ctaPrimaryHover: "hover:shadow-[0_28px_60px_-18px_rgba(245,215,110,0.65)]",
    ctaSmall: "shadow-[0_18px_38px_-20px_rgba(212,175,55,0.8)]",
    ctaSmallHover: "hover:shadow-[0_22px_42px_-18px_rgba(245,215,110,0.65)]",

    logo: "shadow-[0_18px_35px_-18px_rgba(245,215,110,0.75)]",

    innerLight: "shadow-inner shadow-white/5",
    insetGlow: "shadow-[inset_0_1px_0_rgba(255,232,163,0.08)]",

    orb: "shadow-[0_0_60px_-15px_rgba(212,175,55,0.42)]",
    dot: "shadow-[0_0_12px_rgba(255,255,255,0.8)]",
    dotSky: "shadow-[0_0_12px_rgba(245,215,110,0.75)]",
    dotCyan: "shadow-[0_0_12px_rgba(212,175,55,0.75)]",
} as const;

/* ══════════════════════════════════════════════
   TYPOGRAPHY
   ══════════════════════════════════════════════ */
export const typography = {
    h1: "text-3xl font-extrabold leading-[1.3] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.25]",
    h2: "text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl md:text-4xl",
    h3: "text-lg font-bold text-white sm:text-xl",
    h4: "text-base font-bold text-white",

    body: "text-sm leading-relaxed text-slate-300/80 sm:text-base sm:leading-8",
    bodyLg: "text-sm leading-relaxed text-slate-300/90 sm:text-base sm:leading-8 lg:text-lg",
    bodySmall: "text-xs leading-5 text-slate-400",

    cardTitle: "text-lg font-bold text-white sm:text-xl",
    cardDescription: "text-sm leading-7 text-slate-300/80",

    badge: "text-xs font-medium sm:text-sm",
    label: "text-xs font-medium text-slate-400",
    labelSmall: "text-[10px] text-slate-400",
    labelMuted: "text-[11px] font-medium text-[#FFE8A3]/55",

    brandName: "text-sm font-semibold tracking-tight text-white sm:text-base",
    brandSub: "text-[11px] font-medium text-[#FFE8A3]/55",

    link: "text-xs font-medium text-[#F5D76E]/60 group-hover:text-[#F5D76E]",
    ctaText: "text-sm font-semibold text-white sm:text-base",
    ctaSecondaryText: "text-sm font-medium text-slate-100",

    navItem: "text-sm font-medium text-slate-300",
    navItemActive: "text-sm font-medium text-white",

    counter: "text-lg font-bold",
    number: "text-xs font-bold text-white/25 group-hover:text-white/40",
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

    // ── CSS class names for keyframe animations ──
    classes: {
        fadeUp: "s-fade-up",
        floatSlow: "s-float-slow",
        floatMedium: "s-float-medium",
        pulseRing: "s-pulse-ring",
        shimmer: "s-shimmer",
        blockPop: "b-block-pop",
        dragHint: "b-drag-hint",
    },

    // ── Delay class prefix map (use animDelay() helper instead) ──
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
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",
    ringLight:
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D76E]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",
    none: "focus-visible:outline-none",
} as const;

/* ══════════════════════════════════════════════
   INTERACTIVE
   ══════════════════════════════════════════════ */
export const interactive = {
    touch: "touch-manipulation",
    button: "transition-all duration-200 touch-manipulation active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",
    linkHover: "hover:text-white transition-colors duration-200",
    cardHover: "transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/20 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",
} as const;

/* ══════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════ */
export const components = {
    badge: {
        base: "inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm",
        sky: "border border-[#D4AF37]/20 bg-[#D4AF37]/8",
        emerald: "border border-[#D4AF37]/20 bg-[#D4AF37]/8",
        rose: "border border-[#FFE8A3]/20 bg-[#FFE8A3]/8",
        amber: "border border-[#D4AF37]/20 bg-[#D4AF37]/8",
        violet: "border border-[#F5D76E]/20 bg-[#F5D76E]/8",
    },

    ctaPrimary:
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-[#F5D76E]/30 bg-linear-to-r from-[#B8860B] via-[#D4AF37] to-[#F5D76E] px-8 py-3.5 text-sm font-semibold text-[#050505] shadow-[0_20px_50px_-20px_rgba(212,175,55,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-18px_rgba(245,215,110,0.65)] active:translate-y-0 active:scale-[0.98] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D76E]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",

    ctaSecondary:
        "group inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D4AF37]/18 bg-white/4 px-7 py-3.5 text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,232,163,0.08)] backdrop-blur-sm transition-all duration-200 hover:border-[#F5D76E]/30 hover:bg-[#D4AF37]/8 hover:text-white active:scale-[0.98] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",

    ctaSmall:
        "group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#F5D76E]/25 bg-linear-to-r from-[#B8860B] via-[#D4AF37] to-[#F5D76E] px-5 text-sm font-semibold text-[#050505] shadow-[0_18px_38px_-20px_rgba(212,175,55,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-18px_rgba(245,215,110,0.65)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5D76E]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",

    ghostButton:
        "inline-flex h-11 items-center justify-center rounded-full border border-[#D4AF37]/18 bg-white/4 px-5 text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,232,163,0.08)] transition-all duration-200 hover:border-[#F5D76E]/30 hover:bg-[#D4AF37]/8 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",

    navItem:
        "group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-[#D4AF37]/8 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",

    navItemActive:
        "group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#FFE8A3] bg-[#D4AF37]/[0.10] shadow-inner shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",

    featureCard:
        "group relative overflow-hidden rounded-3xl border border-[#D4AF37]/12 bg-linear-to-b from-white/[0.045] to-[#D4AF37]/[0.018] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1",

    miniFeature:
        "inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/12 bg-white/3 px-3.5 py-2 text-xs font-medium text-slate-300 transition-all duration-200 hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/8 hover:text-white",

    iconBox: {
        sm: "flex h-6 w-6 items-center justify-center rounded-lg",
        md: "flex h-10 w-10 items-center justify-center rounded-xl",
        lg: "flex h-14 w-14 items-center justify-center rounded-2xl",
        circle: "flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/20",
    },

    numberBadge:
        "flex h-8 w-8 items-center justify-center rounded-full border border-[#D4AF37]/12 bg-white/4 text-xs font-bold text-white/25 transition-colors duration-300 group-hover:text-[#FFE8A3]/60",

    phoneMockup: {
        outer:
            "relative overflow-hidden rounded-[2.5rem] border border-[#D4AF37]/18 bg-linear-to-b from-[#151007] via-[#0E0B05] to-[#050505] p-1.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95),0_20px_40px_-15px_rgba(212,175,55,0.22)]",
        inner:
            "relative overflow-hidden rounded-8 border border-[#D4AF37]/12 bg-linear-to-b from-[#100C05] to-[#030303]",
        notch: "mx-auto mt-2 h-5 w-24 rounded-full bg-black/85 border border-[#D4AF37]/15",
        homeBar: "mx-auto mb-2 h-1 w-16 rounded-full bg-[#D4AF37]/35",
    },

    sectionHeader: "mx-auto max-w-3xl text-center",

    connector: {
        line: "h-12 w-px bg-linear-to-b from-[#D4AF37]/20 to-transparent",
        dot: "flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/8",
    },
} as const;