// lib/ds/tokens.ts
// ─────────────────────────────────────────────────────────────────
// Raw design tokens — no logic, no functions, pure constants
// ─────────────────────────────────────────────────────────────────

/* ══════════════════════════════════════════════
   BACKGROUNDS
   ══════════════════════════════════════════════ */
export const backgrounds = {
    page: "bg-linear-to-b from-[#060e1b] via-[#081223] to-[#091828]",
    pageAlt: "bg-linear-to-b from-[#071427] via-[#081223] to-[#060e1b]",

    surface: {
        glass: "bg-white/[0.04] backdrop-blur-xl",
        glassHover: "hover:bg-white/[0.08]",
        glassStrong: "bg-white/[0.06] backdrop-blur-xl",
        glassMedium: "bg-white/[0.03] backdrop-blur-sm",
        card: "bg-linear-to-b from-white/[0.04] to-white/[0.015]",
        cardHover: "hover:bg-linear-to-b hover:from-white/[0.06] hover:to-white/[0.02]",
        dark: "bg-[#0b1a30]/90 backdrop-blur-xl",
        darkAlt: "bg-[#0c1a30]/80",
        overlay: "bg-[#081223]/80 backdrop-blur-xl",
    },

    navbar: "bg-linear-to-br from-[#071427]/95 via-[#0B2037]/90 to-[#0A5168]/85",
    navbarScrolled: "bg-linear-to-br from-[#071427]/98 via-[#0B2037]/95 to-[#0A5168]/90",

    glow: {
        hero: "bg-linear-to-b from-sky-500/[0.07] to-transparent",
        skyOrb: "bg-cyan-500/[0.05]",
        blueOrb: "bg-blue-600/[0.05]",
        skyCenter: "bg-sky-400/[0.03]",
    },

    grid: {
        lines:
            "bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[length:60px_60px] opacity-[0.03]",
        dots: "bg-[radial-gradient(rgba(255,255,255,.15)_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.02]",
        dotsDense:
            "bg-[radial-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] bg-[length:32px_32px] opacity-[0.02]",
    },
} as const;

/* ══════════════════════════════════════════════
   GRADIENTS
   ══════════════════════════════════════════════ */
export const gradients = {
    primary: "bg-linear-to-r from-[#0EA5E9] via-[#3B82F6] to-[#2563EB]",
    primaryReverse: "bg-linear-to-l from-[#0EA5E9] via-[#3B82F6] to-[#2563EB]",

    textPrimary:
        "bg-linear-to-l from-sky-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent",
    textSecondary:
        "bg-linear-to-l from-cyan-300 via-sky-300 to-blue-300 bg-clip-text text-transparent",

    logo: "bg-linear-to-br from-[#102748] via-[#0E7490] to-[#3B82F6]",
    orb: "bg-linear-to-br from-[#0c1e3d] via-[#0f2d52] to-[#0a3a5c]",

    divider: "bg-linear-to-r from-transparent via-sky-400/20 to-transparent",
    dividerLight: "bg-linear-to-r from-transparent via-white/10 to-transparent",
    dividerSky: "bg-linear-to-r from-transparent via-sky-300/50 to-transparent",

    innerHighlight: "bg-linear-to-br from-white/20 via-white/5 to-transparent",
    innerHighlightCircle: "bg-linear-to-br from-white/10 via-transparent to-transparent",

    accent: {
        sky: "from-sky-400 to-blue-500",
        blue: "from-blue-400 to-indigo-500",
        cyan: "from-cyan-400 to-teal-500",
        emerald: "from-emerald-400 to-green-500",
        violet: "from-violet-400 to-purple-500",
        amber: "from-amber-400 to-orange-500",
        rose: "from-rose-400 to-pink-500",
        pink: "from-pink-400 to-rose-500",
        red: "from-red-400 to-rose-500",
        indigo: "from-indigo-400 to-violet-500",
        orange: "from-orange-400 to-amber-500",
        teal: "from-teal-400 to-cyan-500",
    },
} as const;

/* ══════════════════════════════════════════════
   BORDERS
   ══════════════════════════════════════════════ */
export const borders = {
    subtle: "border border-white/8",
    light: "border border-white/10",
    medium: "border border-white/12",
    strong: "border border-white/15",

    hoverLight: "hover:border-white/12",
    hoverMedium: "hover:border-white/15",
    hoverSky: "hover:border-sky-400/20",
    hoverSkyStrong: "hover:border-sky-300/20",

    sky: "border-sky-400/20",
    skyStrong: "border-sky-300/25",
    cyan: "border-cyan-400/20",
    emerald: "border-emerald-400/20",
    violet: "border-violet-400/20",
    amber: "border-amber-400/20",
    rose: "border-rose-400/20",
    blue: "border-blue-400/20",
    indigo: "border-indigo-400/20",
    orange: "border-orange-400/20",
    teal: "border-teal-400/20",
    pink: "border-pink-400/20",
    red: "border-red-400/20",

    dashed: "border border-dashed border-white/15",
    inner: "border border-white/5",
    innerLight: "border border-white/[0.06]",
} as const;

/* ══════════════════════════════════════════════
   SHADOWS
   ══════════════════════════════════════════════ */
export const shadows = {
    navbar:
        "shadow-[0_24px_70px_-32px_rgba(2,8,23,0.8),0_16px_40px_-20px_rgba(59,130,246,0.28)]",
    card: "shadow-[0_20px_50px_-28px_rgba(2,8,23,0.9)]",
    cardHover: "hover:shadow-[0_30px_60px_-30px_rgba(2,8,23,0.8)]",
    cardFeature: "hover:shadow-[0_30px_60px_-25px]",
    phone:
        "shadow-[0_40px_80px_-30px_rgba(2,8,23,0.9),0_20px_40px_-15px_rgba(59,130,246,0.25)]",

    ctaPrimary: "shadow-[0_20px_50px_-20px_rgba(59,130,246,0.9)]",
    ctaPrimaryHover: "hover:shadow-[0_28px_60px_-18px_rgba(56,189,248,0.7)]",
    ctaSmall: "shadow-[0_18px_38px_-20px_rgba(59,130,246,0.95)]",
    ctaSmallHover: "hover:shadow-[0_22px_42px_-18px_rgba(56,189,248,0.8)]",

    logo: "shadow-[0_18px_35px_-18px_rgba(56,189,248,0.85)]",

    innerLight: "shadow-inner shadow-white/5",
    insetGlow: "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",

    orb: "shadow-[0_0_60px_-15px_rgba(56,189,248,0.4)]",
    dot: "shadow-[0_0_12px_rgba(255,255,255,0.8)]",
    dotSky: "shadow-[0_0_12px_rgba(125,211,252,0.7)]",
    dotCyan: "shadow-[0_0_12px_rgba(103,232,249,0.7)]",
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
    labelMuted: "text-[11px] font-medium text-sky-100/55",

    brandName: "text-sm font-semibold tracking-tight text-white sm:text-base",
    brandSub: "text-[11px] font-medium text-sky-100/55",

    link: "text-xs font-medium text-sky-300/50 group-hover:text-sky-300",
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
        phoneInner: "rounded-[2rem]",
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
    ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",
    ringLight:
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",
    none: "focus-visible:outline-none",
} as const;

/* ══════════════════════════════════════════════
   INTERACTIVE
   ══════════════════════════════════════════════ */
export const interactive = {
    touch: "touch-manipulation",
    button: "transition-all duration-200 touch-manipulation active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",
    linkHover: "hover:text-white transition-colors duration-200",
    cardHover: "transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_30px_60px_-30px_rgba(2,8,23,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",
} as const;

/* ══════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════ */
export const components = {
    badge: {
        base: "inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-sm",
        sky: "border border-sky-400/20 bg-sky-400/[0.08]",
        emerald: "border border-emerald-400/20 bg-emerald-400/[0.08]",
        rose: "border border-rose-400/20 bg-rose-400/[0.08]",
        amber: "border border-amber-400/20 bg-amber-400/[0.08]",
        violet: "border border-violet-400/20 bg-violet-400/[0.08]",
    },

    ctaPrimary:
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-sky-300/25 bg-linear-to-r from-[#0EA5E9] via-[#3B82F6] to-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_20px_50px_-20px_rgba(59,130,246,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-18px_rgba(56,189,248,0.7)] active:translate-y-0 active:scale-[0.98] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",

    ctaSecondary:
        "group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-all duration-200 hover:border-sky-300/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98] sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",

    ctaSmall:
        "group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-sky-300/20 bg-linear-to-r from-[#0EA5E9] via-[#3B82F6] to-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(59,130,246,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-18px_rgba(56,189,248,0.8)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",

    ghostButton:
        "inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:border-sky-300/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",

    navItem:
        "group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",

    navItemActive:
        "group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white bg-white/[0.08] shadow-inner shadow-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081223]",

    featureCard:
        "group relative overflow-hidden rounded-3xl border border-white/8 bg-linear-to-b from-white/[0.04] to-white/[0.015] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1",

    miniFeature:
        "inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-300 transition-all duration-200 hover:border-sky-400/15 hover:bg-white/[0.06] hover:text-white",

    iconBox: {
        sm: "flex h-6 w-6 items-center justify-center rounded-lg",
        md: "flex h-10 w-10 items-center justify-center rounded-xl",
        lg: "flex h-14 w-14 items-center justify-center rounded-2xl",
        circle: "flex h-10 w-10 items-center justify-center rounded-full border border-white/15",
    },

    numberBadge:
        "flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-xs font-bold text-white/25 transition-colors duration-300 group-hover:text-white/40",

    phoneMockup: {
        outer:
            "relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-linear-to-b from-[#0c1a30] via-[#0f2340] to-[#071427] p-1.5 shadow-[0_40px_80px_-30px_rgba(2,8,23,0.9),0_20px_40px_-15px_rgba(59,130,246,0.25)]",
        inner:
            "relative overflow-hidden rounded-[2rem] border border-white/8 bg-linear-to-b from-[#091828] to-[#060f1e]",
        notch: "mx-auto mt-2 h-5 w-24 rounded-full bg-black/80 border border-white/10",
        homeBar: "mx-auto mb-2 h-1 w-16 rounded-full bg-white/20",
    },

    sectionHeader: "mx-auto max-w-3xl text-center",

    connector: {
        line: "h-12 w-px bg-linear-to-b from-white/10 to-transparent",
        dot: "flex h-10 w-10 items-center justify-center rounded-full border border-sky-400/20 bg-sky-400/[0.08]",
    },
} as const;