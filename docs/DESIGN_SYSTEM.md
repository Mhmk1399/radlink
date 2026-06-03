# 🎨 Smart Landing Design System

A comprehensive, dark-themed design system built for **Next.js + TypeScript + Tailwind CSS** projects. It provides a single source of truth for colors, typography, spacing, animations, and component-level tokens — enabling consistent, premium UI across your entire application.

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Architecture](#architecture)
3. [Importing](#importing)
4. [Palette & Colors](#palette--colors)
5. [Backgrounds](#backgrounds)
6. [Gradients](#gradients)
7. [Borders](#borders)
8. [Shadows](#shadows)
9. [Typography](#typography)
10. [Layout & Spacing](#layout--spacing)
11. [Animation](#animation)
12. [Focus & Accessibility](#focus--accessibility)
13. [Interactive States](#interactive-states)
14. [Component Presets](#component-presets)
15. [Accent Color System](#accent-color-system)
16. [Helper Functions](#helper-functions)
17. [Toast System](#toast-system)
18. [Examples](#examples)
19. [Tailwind Config](#tailwind-config)
20. [Best Practices](#best-practices)

---

## Installation & Setup

### File Structure

lib/
├── ds/
│ ├── tokens.ts # All visual tokens (backgrounds, borders, shadows, typography, layout, animation, focus, interactive, components)
│ ├── accents.ts # 12-color accent system with TypeScript types
│ └── helpers.ts # Utility functions: cn(), animDelay(), toPersian(), getAccent()
└── design-system.ts # Barrel re-export file — import everything from here

text

### Required Dependencies

```json
{
  "dependencies": {
    "next": ">=14.0.0",
    "react": ">=18.0.0",
    "tailwindcss": ">=3.4.0"
  },
  "devDependencies": {
    "typescript": ">=5.0.0"
  }
}
No external animation libraries required. All animations use CSS keyframes + Tailwind transitions only.

Architecture
The design system is split into three layers:

Layer	File	Purpose
Tokens	ds/tokens.ts	Pure string constants (as const). No logic, no functions.
Accents	ds/accents.ts	Type-safe 12-color accent system with AccentColor type.
Helpers	ds/helpers.ts	Pure utility functions: cn(), animDelay(), toPersian(), getAccent().
Barrel	design-system.ts	Re-exports everything + unified ds object.
Why split? Turbopack / Webpack handle smaller modules better. A single large file can cause HMR issues and circular dependency detection failures.

Importing
Named Imports (Recommended)
React

import {
  cn,
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
  accentTokens,
  animDelay,
  toPersian,
  getAccent,
  type AccentColor,
} from "@/lib/design-system";
Unified Object Import
React

import ds from "@/lib/design-system";

// Usage:
ds.bg.page
ds.text.h1
ds.border.subtle
ds.accent.sky.text
ds.cn("class-a", condition && "class-b")
ds.animDelay(2)
ds.toPersian(42)
Selective Import (Tree-Shakeable)
React

import { cn } from "@/lib/ds/helpers";
import { borders, typography } from "@/lib/ds/tokens";
import { accentTokens, type AccentColor } from "@/lib/ds/accents";
Palette & Colors
The design system uses a custom deep navy / petroleum blue palette as its foundation:

Core Dark Blues (Backgrounds)
Token	Hex	Usage
navy.950	#040a14	Deepest background
navy.900	#060e1b	Page gradient start
navy.850	#071427	Navbar base
navy.800	#081223	Page gradient middle
navy.750	#091828	Page gradient end
navy.700	#0B2037	Navbar via
navy.650	#0c1a30	Surface dark
navy.600	#0c1e3d	Orb gradient
navy.500	#0f2340	Phone mockup
Petroleum / Dark Cyan
Token	Hex	Usage
petroleum.900	#0A5168	Navbar gradient end
petroleum.700	#0E7490	Logo gradient
Accent Spectrum
Color	Light	Medium	Dark	Usage
Sky	#38bdf8	#0EA5E9	#0369a1	Primary CTA, links, info
Cyan	#22d3ee	#06b6d4	—	Loading, secondary accents
Blue	#3B82F6	#2563EB	#1d4ed8	Primary gradient, QR
Emerald	#34d399	#10b981	—	Success states
Violet	#a78bfa	#8b5cf6	—	Custom, branding
Amber	#fbbf24	#f59e0b	—	Warning states
Rose	#fb7185	#f43f5e	—	Problem section
Red	#f87171	#ef4444	—	Error states
Indigo	#818cf8	#6366f1	—	Features
Orange	#fb923c	#f97316	—	Timer, countdown
Teal	#2dd4bf	#14b8a6	—	Banner blocks
Pink	#f472b6	#ec4899	—	Image blocks
Backgrounds
React

import { backgrounds } from "@/lib/design-system";
Page Backgrounds
React

backgrounds.page        // "bg-linear-to-b from-[#060e1b] via-[#081223] to-[#091828]"
backgrounds.pageAlt     // Reversed gradient
Surface Backgrounds (Cards, Panels)
Token	Value	Usage
surface.glass	bg-white/4 backdrop-blur-xl	Default glass surface
surface.glassHover	hover:bg-white/8	Hover state for glass
surface.glassStrong	bg-white/6 backdrop-blur-xl	Stronger glass
surface.glassMedium	bg-white/3 backdrop-blur-sm	Subtle glass
surface.card	bg-linear-to-b from-white/4 to-white/[0.015]	Card gradient
surface.dark	bg-[#0b1a30]/90 backdrop-blur-xl	Dark surface
surface.darkAlt	bg-[#0c1a30]/80	Icon inner background
surface.overlay	bg-[#081223]/80 backdrop-blur-xl	Modal / overlay
Glow Effects
React

backgrounds.glow.hero      // Large center glow for sections
backgrounds.glow.skyOrb    // Floating cyan orb
backgrounds.glow.blueOrb   // Floating blue orb
backgrounds.glow.skyCenter // Subtle center orb for features
Grid Patterns
React

backgrounds.grid.lines      // 60px line grid, opacity 3%
backgrounds.grid.dots       // 40px dot grid, opacity 2%
backgrounds.grid.dotsDense  // 32px dot grid, opacity 2%
Usage Example
React

<div className={cn(backgrounds.page, "min-h-screen")}>
  <div className={cn(backgrounds.surface.card, borders.subtle, layout.radius.xl, "p-6")}>
    Card content
  </div>
</div>
Gradients
React

import { gradients } from "@/lib/design-system";
Primary
React

gradients.primary         // CTA buttons: sky → blue → indigo (left to right)
gradients.primaryReverse   // Reversed direction
Text Gradients
React

gradients.textPrimary     // "bg-linear-to-l from-sky-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent"
gradients.textSecondary   // Lighter variant
Usage: Apply directly to <span> elements inside headings:

React

<h2 className={typography.h2}>
  امکانات اصلی <span className={gradients.textPrimary}>پلتفرم</span>
</h2>
Structural
Token	Purpose
gradients.logo	Logo icon background
gradients.orb	Center sphere / orb gradient
gradients.divider	Section top divider line (sky)
gradients.dividerLight	Subtle white divider
gradients.dividerSky	Navbar top highlight
gradients.innerHighlight	Card / button inner shine
gradients.innerHighlightCircle	Circular inner shine
Accent Gradients
React

gradients.accent.sky       // "from-sky-400 to-blue-500"
gradients.accent.emerald   // "from-emerald-400 to-green-500"
// ... all 12 colors
Borders
React

import { borders } from "@/lib/design-system";
Intensity Levels
Token	Value	Usage
borders.subtle	border border-white/8	Default, lowest contrast
borders.light	border border-white/10	Standard
borders.medium	border border-white/12	Medium emphasis
borders.strong	border border-white/15	Highest contrast
Hover States
React

borders.hoverLight      // "hover:border-white/12"
borders.hoverMedium     // "hover:border-white/15"
borders.hoverSky        // "hover:border-sky-400/20"
borders.hoverSkyStrong  // "hover:border-sky-300/20"
Accent Borders
React

borders.sky      // "border-sky-400/20"
borders.skyStrong // "border-sky-300/25"
borders.emerald  // "border-emerald-400/20"
// ... all 12 colors
Special
React

borders.dashed      // "border border-dashed border-white/15"
borders.inner       // "border border-white/5"
borders.innerLight  // "border border-white/6"
Shadows
React

import { shadows } from "@/lib/design-system";
Token	Usage
shadows.navbar	Navbar complex shadow with blue tint
shadows.card	Standard card shadow
shadows.cardHover	Card hover state
shadows.phone	Phone mockup deep shadow
shadows.ctaPrimary	Primary CTA button glow
shadows.ctaPrimaryHover	CTA hover glow
shadows.ctaSmall	Smaller CTA (navbar)
shadows.logo	Logo icon sky glow
shadows.innerLight	Inner shadow for active states
shadows.insetGlow	Subtle top inset glow
shadows.orb	Center orb glow
shadows.dot	Small dot glow (white)
shadows.dotSky	Small dot glow (sky)
Typography
React

import { typography } from "@/lib/design-system";
Headings
Token	Sizes	Weight
typography.h1	3xl → 5xl → 3.25rem	extrabold, tracking-tight
typography.h2	2xl → 3xl → 4xl	extrabold, tracking-tight
typography.h3	lg → xl	bold
typography.h4	base	bold
Body
Token	Size	Color
typography.body	sm → base	text-slate-300/80
typography.bodyLg	sm → base → lg	text-slate-300/90
typography.bodySmall	xs	text-slate-400
Card
React

typography.cardTitle        // "text-lg font-bold text-white sm:text-xl"
typography.cardDescription  // "text-sm leading-7 text-slate-300/80"
Labels & Badges
React

typography.badge       // "text-xs font-medium sm:text-sm"
typography.label       // "text-xs font-medium text-slate-400"
typography.labelSmall  // "text-[10px] text-slate-400"
typography.labelMuted  // "text-[11px] font-medium text-sky-100/55"
Brand
React

typography.brandName  // "text-sm font-semibold tracking-tight text-white sm:text-base"
typography.brandSub   // "text-[11px] font-medium text-sky-100/55"
Interactive Text
React

typography.link             // "text-xs font-medium text-sky-300/50 group-hover:text-sky-300"
typography.ctaText          // "text-sm font-semibold text-white sm:text-base"
typography.ctaSecondaryText // "text-sm font-medium text-slate-100"
typography.navItem          // "text-sm font-medium text-slate-300"
typography.navItemActive    // "text-sm font-medium text-white"
Data
React

typography.counter  // "text-lg font-bold"
typography.number   // "text-xs font-bold text-white/25 group-hover:text-white/40"
Layout & Spacing
React

import { layout } from "@/lib/design-system";
Containers
React

layout.container       // "mx-auto max-w-7xl"
layout.containerNarrow // "mx-auto max-w-3xl"
layout.containerWide   // "mx-auto max-w-[90rem]"
Section Padding
React

layout.section        // "px-4 py-20 sm:px-6 sm:py-28 lg:py-36"
layout.sectionCompact // "px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
Header
React

layout.headerOuter  // "sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4"
Gaps
React

layout.gap.xs           // "gap-1"
layout.gap.sm           // "gap-2"
layout.gap.md           // "gap-3"
layout.gap.lg           // "gap-5"
layout.gap.xl           // "gap-6"
layout.gap.section      // "gap-12 lg:gap-16"
layout.gap.sectionLarge // "gap-14 lg:gap-20"
Grid Templates
React

layout.grid.features  // "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
layout.grid.blocks    // "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4"
layout.grid.ctaPair   // "grid grid-cols-1 gap-2 sm:grid-cols-2"
layout.grid.stats     // "grid grid-cols-2 gap-2"
Border Radius
React

layout.radius.sm          // "rounded-lg"
layout.radius.md          // "rounded-xl"
layout.radius.lg          // "rounded-2xl"
layout.radius.xl          // "rounded-3xl"
layout.radius.full        // "rounded-full"
layout.radius.navbar      // "rounded-[1.75rem]"
layout.radius.navbarInner // "rounded-[1.35rem]"
layout.radius.phone       // "rounded-[2.5rem]"
layout.radius.phoneInner  // "rounded-8"
Animation
React

import { animation } from "@/lib/design-system";
import { animDelay } from "@/lib/design-system";
Transitions
Token	Value
animation.base	transition-all duration-200
animation.smooth	transition-all duration-300
animation.colors	transition-colors duration-200
animation.transform	transition-transform duration-200
animation.opacity	transition-opacity duration-300
animation.fast	duration-200
animation.normal	duration-300
animation.slow	duration-500
Hover Transforms
React

animation.hoverLift       // "hover:-translate-y-0.5"
animation.hoverLiftLg     // "hover:-translate-y-1"
animation.hoverScale      // "hover:scale-[1.02]"
animation.activePress     // "active:scale-[0.98]"
animation.activePressSmall // "active:scale-[0.99]"
animation.activeRestore   // "active:translate-y-0"
animation.motionSafe      // "motion-reduce:transition-none"
CSS Keyframe Classes
React

animation.classes.fadeUp      // "s-fade-up"      — fade in from bottom
animation.classes.floatSlow   // "s-float-slow"   — gentle 7s float
animation.classes.floatMedium // "s-float-medium"  — medium 5s float
animation.classes.pulseRing   // "s-pulse-ring"   — expanding ring
animation.classes.shimmer     // "s-shimmer"      — shimmer shine effect
animation.classes.blockPop    // "b-block-pop"    — pop in from scale
animation.classes.dragHint    // "b-drag-hint"    — subtle up/down hint
Delay Function
React

import { animDelay } from "@/lib/design-system";

animDelay(1)  // "s-fade-d1" → 0.1s delay
animDelay(2)  // "s-fade-d2" → 0.2s delay
animDelay(3)  // "s-fade-d3" → 0.25s delay
// ...
animDelay(8)  // "s-fade-d8" → 0.5s delay (max)
animDelay(99) // "s-fade-d8" → capped at 8
⚠️ Important: animDelay() is a function, not a property of animation. Always import it separately:

React

// ✅ Correct
import { animation, animDelay } from "@/lib/design-system";
className={cn(animation.classes.fadeUp, animDelay(2))}

// ❌ Wrong — will throw TypeError
animation.delay(2)
Injecting Keyframes
You must inject the keyframes CSS in any component that uses animation classes:

React

<style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />
Or inject once in your root layout.

Focus & Accessibility
React

import { focus } from "@/lib/design-system";
Token	Ring Color	Usage
focus.ring	sky-400/70	Default focus ring for all interactive elements
focus.ringLight	sky-300/80	Lighter ring for primary CTAs
focus.none	—	Only removes outline (for custom focus handling)
All focus tokens include:

focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-offset-2
focus-visible:ring-offset-[#081223]
Interactive States
React

import { interactive } from "@/lib/design-system";
Token	Includes
interactive.touch	touch-manipulation
interactive.button	transition + touch + active:scale + focus ring
interactive.linkHover	hover:text-white transition-colors
interactive.cardHover	translate + border + shadow + focus ring
Component Presets
React

import { components } from "@/lib/design-system";
Badges
React

components.badge.base     // Base styles (flex, rounded-full, padding, blur)
components.badge.sky      // Sky-colored variant
components.badge.emerald  // Emerald variant
components.badge.rose     // Rose variant
components.badge.amber    // Amber variant
components.badge.violet   // Violet variant
Usage:

React

<div className={cn(components.badge.base, components.badge.sky)}>
  <IconSvg />
  <span className={cn(typography.badge, "text-sky-200")}>Badge Text</span>
</div>
CTA Buttons
Token	Style
components.ctaPrimary	Full gradient, glow shadow, hover lift
components.ctaSecondary	Ghost style, border, backdrop blur
components.ctaSmall	Compact rounded-full, for navbar
components.ghostButton	Transparent with subtle border
Navigation
React

components.navItem       // Inactive nav link
components.navItemActive // Active nav link with background
Cards
React

components.featureCard  // Full card with border, gradient bg, padding, hover
components.miniFeature  // Small pill-style feature tag
Icon Containers
React

components.iconBox.sm      // 24×24, rounded-lg
components.iconBox.md      // 40×40, rounded-xl
components.iconBox.lg      // 56×56, rounded-2xl
components.iconBox.circle  // 40×40, rounded-full, bordered
Number Badge
React

components.numberBadge  // Circular number indicator for card indices
Phone Mockup
React

components.phoneMockup.outer   // Phone body with deep shadow
components.phoneMockup.inner   // Screen container
components.phoneMockup.notch   // Top notch bar
components.phoneMockup.homeBar // Bottom home indicator
Section Header
React

components.sectionHeader  // "mx-auto max-w-3xl text-center"
Connector
React

components.connector.line  // Vertical gradient line
components.connector.dot   // Circular indicator with sky accent
Accent Color System
React

import { accentTokens, type AccentColor } from "@/lib/design-system";
Available Colors (12)
sky · blue · cyan · emerald · violet · amber · rose · pink · red · indigo · orange · teal

Token Structure
Each accent color provides:

React

interface AccentTokens {
  gradient: string;    // "from-sky-400 to-blue-500"
  bg: string;          // "bg-sky-400/10"
  bgHover: string;     // "group-hover:bg-sky-400/15"
  border: string;      // "border-sky-400/20"
  borderHover: string; // "group-hover:border-sky-400/25"
  text: string;        // "text-sky-300"
  glow: string;        // "bg-sky-400/15"
  shadow: string;      // "group-hover:shadow-sky-400/20"
  dot: string;         // "bg-sky-300"
}
Usage
React

const tokens = accentTokens["emerald"];

<div className={cn(
  "border", tokens.border,
  tokens.bg,
  tokens.text
)}>
  Success content
</div>
With getAccent()
React

import { getAccent, type AccentColor } from "@/lib/design-system";

function Card({ color }: { color: AccentColor }) {
  const t = getAccent(color);
  return (
    <div className={cn("border", t.border, t.bg)}>
      <span className={t.text}>Colored text</span>
    </div>
  );
}
Helper Functions
cn(...classes)
Merges class strings, filtering out all falsy values:

React

cn("base-class", condition && "conditional-class", undefined, null, false, "another")
// → "base-class another" (if condition is false)
animDelay(index)
Returns the fade-up delay class (capped at 8):

React

animDelay(1)  // "s-fade-d1"
animDelay(5)  // "s-fade-d5"
animDelay(99) // "s-fade-d8"
toPersian(number)
Converts numbers to Persian/Farsi numerals:

React

toPersian(1234)    // "۱٬۲۳۴"
toPersian(42)      // "۴۲"
getAccent(color)
Type-safe accessor for accent tokens:

React

const t = getAccent("emerald");
// t.text → "text-emerald-300"
// t.bg   → "bg-emerald-400/10"
Toast System
The design system includes a zero-dependency toast notification system with the same visual language.

Setup
React

// app/layout.tsx
import { Toaster } from "@/components/ui/Toast";

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" maxToasts={5} />
      </body>
    </html>
  );
}
API
React

import { toast } from "@/components/ui/Toast";

// Simple
toast.success("Saved successfully!");
toast.error("Connection failed.");
toast.warning("File too large.");
toast.info("New update available.");

// With options
toast.error("Server error", {
  title: "Error 500",
  duration: 8000,
  action: { label: "Retry", onClick: () => retry() },
});

// Loading → Success
const id = toast.loading("Saving...");
setTimeout(() => toast.update(id, { type: "success", message: "Saved!" }), 2000);

// Promise-based
toast.promise(fetchData(), {
  loading: "Loading...",
  success: (data) => `Got ${data.count} items`,
  error: (err) => `Failed: ${err.message}`,
});

// Dismiss
toast.dismiss(id);
toast.dismissAll();
Toast Types
Type	Background	Icon	Duration
success	Deep emerald gradient	Animated ✓ checkmark	4s
error	Deep red gradient	Animated ✕ cross	6s
warning	Deep amber gradient	Animated ⚠ triangle	5s
info	Deep sky gradient	Animated ℹ circle	4s
loading	Deep cyan gradient	Spinning loader	∞
custom	Deep violet gradient	Star icon	4s
Features
Swipe to dismiss on mobile (touch drag)
Pause on hover (timer + progress bar)
Close button always visible (no hover-only)
Progress bar with gradient
Action buttons with styled callbacks
Mobile-safe width: w-[calc(100%-24px)]
6 positions: top/bottom × right/left/center
Examples
Section Background Component
React

function SectionBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={cn(
        "absolute left-1/2 top-0 h-150 w-200",
        "-translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
        backgrounds.glow.hero
      )} />
      <div className={cn(
        "absolute right-0 top-1/3 h-64 w-64 rounded-full blur-3xl",
        backgrounds.glow.skyOrb,
        animation.classes.floatSlow
      )} />
      <div className={cn(
        "absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl",
        backgrounds.glow.blueOrb,
        animation.classes.floatMedium
      )} />
      <div className={cn("absolute inset-0", backgrounds.grid.lines)} />
      <div className={cn(
        "absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2",
        gradients.divider
      )} />
    </div>
  );
}
Feature Card with Accent
React

function FeatureCard({ title, desc, color }: { title: string; desc: string; color: AccentColor }) {
  const t = accentTokens[color];

  return (
    <article className={cn(
      animation.classes.fadeUp,
      "group relative overflow-hidden p-6 sm:p-8",
      layout.radius.xl,
      borders.subtle,
      backgrounds.surface.card,
      animation.smooth,
      t.borderHover,
      t.shadow,
      animation.hoverLiftLg,
      "hover:shadow-[0_30px_60px_-25px]"
    )}>
      {/* Glow on hover */}
      <div className={cn(
        "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl",
        t.glow,
        "opacity-0 group-hover:opacity-100",
        animation.opacity
      )} />

      {/* Top accent line */}
      <div className={cn(
        "absolute inset-x-8 top-0 h-px bg-linear-to-r",
        t.gradient,
        "opacity-0 group-hover:opacity-60",
        animation.smooth
      )} />

      {/* Icon */}
      <div className={cn(
        components.iconBox.lg,
        "relative inline-flex p-0.5 shadow-lg border",
        borders.light,
        `bg-linear-to-br ${t.gradient}`
      )}>
        <div className={cn(
          "flex h-full w-full items-center justify-center rounded-[14px] text-white",
          backgrounds.surface.darkAlt
        )}>
          <IconSvg />
        </div>
      </div>

      <h3 className={cn("mt-5", typography.cardTitle)}>{title}</h3>
      <p className={cn("mt-3", typography.cardDescription)}>{desc}</p>
    </article>
  );
}
Complete Section
React

export function MySection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section dir="rtl" className={cn("relative overflow-hidden", layout.section)}>
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          <div className={components.sectionHeader}>
            <div className={cn(animation.classes.fadeUp, components.badge.base, components.badge.sky)}>
              <span className={cn(typography.badge, "text-sky-200")}>Badge</span>
            </div>

            <h2 className={cn(animation.classes.fadeUp, animDelay(1), "mt-5", typography.h2)}>
              Title with <span className={gradients.textPrimary}>gradient</span>
            </h2>

            <p className={cn(animation.classes.fadeUp, animDelay(2), "mt-5", typography.body)}>
              Description text here.
            </p>
          </div>

          <div className={cn("mt-14 sm:mt-16 lg:mt-20", layout.grid.features)}>
            {items.map((item, i) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
Tailwind Config
Make sure your tailwind.config.ts includes content paths for the design system:

TypeScript

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}", // ← Include design system files
  ],
  theme: {
    extend: {
      // The design system uses Tailwind's default palette.
      // No custom theme extensions required.
    },
  },
  plugins: [],
};

export default config;
Important: Since all design tokens are string constants, Tailwind's JIT compiler will automatically detect and include them — as long as the files are in the content array.

Best Practices
1. Always Use cn() for Conditional Classes
React

// ✅ Good
className={cn(borders.subtle, isActive && accentTokens.sky.border)}

// ❌ Avoid
className={`${borders.subtle} ${isActive ? accentTokens.sky.border : ""}`}
2. Inject Keyframes Once
React

// Best: in root layout
// Good: in each section that uses animations
// Avoid: in every small component
3. Use animDelay() Not animation.delay()
React

// ✅ Correct
animDelay(3) // → "s-fade-d3"

// ❌ TypeError
animation.delay(3)
4. Type Your Accent Colors
React

// ✅ Type-safe
interface Props { color: AccentColor }

// ❌ Loose typing
interface Props { color: string }
5. Compose, Don't Override
React

// ✅ Compose tokens
className={cn(components.featureCard, "custom-extra-class")}

// ❌ Duplicate what tokens already provide
className="group relative overflow-hidden rounded-3xl border border-white/8..."
6. Keep Backgrounds Consistent
Use <SectionBackground /> as a shared component rather than copy-pasting glow + grid markup into every section.

7. Mobile-First
All tokens are designed mobile-first. Responsive adjustments use sm:, md:, lg: prefixes within the token strings.

Version
Smart Landing Design System v1.0

Built for Next.js 14+ · TypeScript 5+ · Tailwind CSS 3.4+

No external animation libraries. No runtime CSS-in-JS. Pure Tailwind + CSS keyframes.

© 2024 Smart Landing. All design tokens are project-specific and not published as a standalone package.





```
