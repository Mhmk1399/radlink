import type {
  AnimationType,
  ContentAlignValue,
  EditableStyleKey,
  EditableStyleMap,
  PageBlock,
  ResponsiveValue,
  ShadowStyleValue,
  TextAlignValue,
} from "@/types/blocks/builder.types";
import {
  normalizeLogoHeaderSettings,
  type LogoHeaderSettings,
  type LogoHeaderVariant,
} from "@/lib/design/logo-header";
import {
  createPageBackgroundPattern,
  normalizePageBackgroundPattern,
  type PageBackgroundPattern,
  type PageBackgroundPatternId,
} from "@/lib/design/page-background";
import {
  normalizePageFooterSettings,
  type PageFooterSettings,
} from "@/lib/design/page-footer";

export type PageThemePalette = {
  base: string;
  surface: string;
  accent: string;
};

export type PageThemeTypeScale = {
  title: number;
  description: number;
  item: number;
  button: number;
  heroHeight: number;
  radius: number;
  logoHeaderHeight: number;
  logoSize: number;
};

export type PageThemeRecipe = {
  surfaceMode: "flat" | "layered" | "glass" | "solid";
  buttonMode: "solid" | "soft" | "outline";
  density: "compact" | "balanced" | "airy";
  contrast: "soft" | "balanced" | "bold";
};

export type PageThemeDefinition = {
  id: string;
  name: string;
  palette: PageThemePalette;
  scale: PageThemeTypeScale;
  logoVariant: LogoHeaderVariant;
  recipe: PageThemeRecipe;
  backgroundPattern: PageBackgroundPattern;
  custom?: boolean;
};

export type AppliedPageTheme = {
  blocks: PageBlock[];
  backgroundColor: string;
  backgroundPattern: PageBackgroundPattern;
  logoHeader: LogoHeaderSettings;
  footer: PageFooterSettings;
};

export type PageThemeApplyProgress = {
  progress: number;
  label: string;
  completedBlocks?: number;
  totalBlocks?: number;
};

type PageThemeBlockProgress = {
  completedBlocks: number;
  totalBlocks: number;
  progress: number;
};

type ThemeElementRole =
  | "container"
  | "overlay"
  | "title"
  | "description"
  | "buttonPrimary"
  | "buttonSecondary"
  | "item"
  | "field"
  | "media"
  | "accent"
  | "price"
  | "separator";

type ResolvedTheme = {
  base: string;
  surface: string;
  surfaceAlt: string;
  panel: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentFaint: string;
  line: string;
  heroBg: string;
  heroText: string;
  heroMuted: string;
  surfaceText: string;
  surfaceMuted: string;
};

export const BUILDER_CUSTOM_THEMES_KEY = "radlink_builder_custom_themes";

const MOBILE_SCALE: PageThemeTypeScale = {
  title: 16,
  description: 11,
  item: 10,
  button: 11,
  heroHeight: 310,
  radius: 20,
  logoHeaderHeight: 176,
  logoSize: 88,
};

const DEFAULT_THEME_RECIPE: PageThemeRecipe = {
  surfaceMode: "layered",
  buttonMode: "solid",
  density: "balanced",
  contrast: "balanced",
};

const THEME_APPLY_BLOCK_BATCH_SIZE = 8;

const RECIPE_SEQUENCE: PageThemeRecipe[] = [
  {
    surfaceMode: "flat",
    buttonMode: "solid",
    density: "compact",
    contrast: "soft",
  },
  {
    surfaceMode: "layered",
    buttonMode: "solid",
    density: "balanced",
    contrast: "balanced",
  },
  {
    surfaceMode: "glass",
    buttonMode: "soft",
    density: "airy",
    contrast: "balanced",
  },
  {
    surfaceMode: "solid",
    buttonMode: "outline",
    density: "balanced",
    contrast: "bold",
  },
  {
    surfaceMode: "layered",
    buttonMode: "soft",
    density: "compact",
    contrast: "balanced",
  },
  {
    surfaceMode: "glass",
    buttonMode: "solid",
    density: "balanced",
    contrast: "bold",
  },
];

const PATTERN_SEQUENCE: PageBackgroundPatternId[] = [
  "soft-grid",
  "duotone-blur",
  "halftone-gradient",
  "gradient-dots",
  "orbital-circles",
  "blurred-dots",
  "aurora-mesh",
  "soft-spotlight",
  "premium-rings",
  "silk-waves",
  "dot-matrix",
  "diagonal-lines",
  "paper-speckles",
  "topography",
  "plus-grid",
  "crosshatch",
  "vertical-rhythm",
  "calm-waves",
  "liquid-glass-aurora",
  "prism-caustics",
  "hologram-dots",
  "chrome-ribbons",
  "fluid-orbs",
  "cyber-noise",
  "glass-mosaic",
  "neon-fog-glass",
  "arctic-mist-rings",
  "frosted-laser-grid",
  "polar-veil-orbs",
  "blue-vapor-noise",
];

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getDefaultThemeRecipe(id: string): PageThemeRecipe {
  return RECIPE_SEQUENCE[hashString(id) % RECIPE_SEQUENCE.length];
}

function getDefaultThemePattern(
  id: string,
  palette: PageThemePalette,
): PageBackgroundPattern {
  const patternId =
    PATTERN_SEQUENCE[hashString(`${id}-pattern`) % PATTERN_SEQUENCE.length];
  const darkBase = !isLightColor(palette.base);
  return createPageBackgroundPattern(patternId, {
    color: darkBase
      ? palette.accent
      : mixColor(palette.accent, "#0f172a", 0.18),
    secondaryColor: darkBase
      ? mixColor(palette.surface, palette.accent, 0.22)
      : palette.base,
    opacity: darkBase ? 0.12 : 0.08,
    size: 18 + (hashString(id) % 5) * 8,
  });
}

function createTheme(
  id: string,
  name: string,
  palette: PageThemePalette,
  logoVariant: LogoHeaderVariant,
  scale: Partial<PageThemeTypeScale> = {},
  options: {
    recipe?: Partial<PageThemeRecipe>;
    backgroundPattern?: Partial<PageBackgroundPattern> & {
      id?: PageBackgroundPatternId;
    };
  } = {},
): PageThemeDefinition {
  const fallbackPattern = getDefaultThemePattern(id, palette);
  const nextScale = {
    ...MOBILE_SCALE,
    ...scale,
    title: MOBILE_SCALE.title,
    description: MOBILE_SCALE.description,
    item: MOBILE_SCALE.item,
    button: MOBILE_SCALE.button,
  };

  return {
    id,
    name,
    palette,
    logoVariant,
    scale: nextScale,
    recipe: normalizeThemeRecipe({
      ...getDefaultThemeRecipe(id),
      ...options.recipe,
    }),
    backgroundPattern: normalizePageBackgroundPattern(
      options.backgroundPattern,
      fallbackPattern,
    ),
  };
}

export const BUILDER_PAGE_THEMES: PageThemeDefinition[] = [
  createTheme(
    "studio-clear",
    "استودیو شفاف",
    { base: "#f8fafc", surface: "#ffffff", accent: "#111827" },
    "minimal-line",
    { title: 22, heroHeight: 300, radius: 18, logoHeaderHeight: 168 },
  ),
  createTheme(
    "mint-signal",
    "سیگنال نعنایی",
    { base: "#eefbf4", surface: "#ffffff", accent: "#047857" },
    "wave-soft",
    { title: 23, heroHeight: 318, radius: 22 },
  ),
  createTheme(
    "sky-cobalt",
    "آسمان کبالت",
    { base: "#eff6ff", surface: "#ffffff", accent: "#2563eb" },
    "wave-organic",
    { title: 24, description: 14, heroHeight: 330, logoHeaderHeight: 188 },
  ),
  createTheme(
    "rose-graphite",
    "رز گرافیتی",
    { base: "#fff1f2", surface: "#ffffff", accent: "#be123c" },
    "blob-side",
    { title: 24, radius: 24, heroHeight: 326 },
  ),
  createTheme(
    "amber-olive",
    "کهربایی زیتونی",
    { base: "#fffbeb", surface: "#ffffff", accent: "#4d7c0f" },
    "ribbon-fold",
    { title: 23, radius: 18, logoHeaderHeight: 170 },
  ),
  createTheme(
    "graphite-lime",
    "گرافیت لیمویی",
    { base: "#18181b", surface: "#27272a", accent: "#a3e635" },
    "wave-jagged",
    { title: 24, description: 14, heroHeight: 334, logoSize: 94 },
  ),
  createTheme(
    "paper-coral",
    "کاغذی مرجانی",
    { base: "#fdf2f8", surface: "#fff7ed", accent: "#ea580c" },
    "corner-swoop",
    { title: 22, heroHeight: 300, radius: 17, logoHeaderHeight: 166 },
  ),
  createTheme(
    "ocean-paper",
    "کاغذ اقیانوسی",
    { base: "#ecfeff", surface: "#f8fafc", accent: "#0e7490" },
    "wave-repeat",
    { title: 23, heroHeight: 318, radius: 22 },
  ),
  createTheme(
    "violet-moss",
    "بنفش خزه‌ای",
    { base: "#f5f3ff", surface: "#f7fee7", accent: "#6d28d9" },
    "orbit",
    { title: 23, description: 14, heroHeight: 326 },
  ),
  createTheme(
    "clean-cherry",
    "گیلاسی تمیز",
    { base: "#ffffff", surface: "#f1f5f9", accent: "#dc2626" },
    "wave-steps",
    { title: 22, heroHeight: 294, radius: 16, logoHeaderHeight: 164 },
  ),
  createTheme(
    "teal-copper",
    "فیروزه‌ای مسی",
    { base: "#f0fdfa", surface: "#ffffff", accent: "#c2410c" },
    "split-circles",
    { title: 23, radius: 21 },
  ),
  createTheme(
    "forest-sky",
    "آسمان جنگلی",
    { base: "#f0f9ff", surface: "#ffffff", accent: "#166534" },
    "mountains",
    { title: 24, heroHeight: 330, logoHeaderHeight: 190 },
  ),
  createTheme(
    "indigo-peach",
    "نیلی هلویی",
    { base: "#fff7ed", surface: "#eef2ff", accent: "#4338ca" },
    "liquid",
    { title: 23, radius: 24, logoHeaderHeight: 184 },
  ),
  createTheme(
    "noir-gold",
    "طلای تیره",
    { base: "#111827", surface: "#1f2937", accent: "#f59e0b" },
    "sunburst",
    { title: 24, description: 14, heroHeight: 340, logoSize: 94 },
  ),
  createTheme(
    "cloud-berry",
    "ابر شاه‌توتی",
    { base: "#f8fafc", surface: "#ffffff", accent: "#db2777" },
    "confetti",
    { title: 23, radius: 23 },
    {
      backgroundPattern: {
        id: "duotone-blur",
        color: "#60a5fa",
        secondaryColor: "#f9a8d4",
        opacity: 0.22,
        size: 34,
      },
    },
  ),
  createTheme(
    "marine-lemon",
    "دریایی لیمویی",
    { base: "#082f49", surface: "#0f4c5c", accent: "#fde047" },
    "topography",
    { title: 24, description: 14, heroHeight: 338 },
  ),
  createTheme(
    "ruby-ice",
    "یاقوت یخی",
    { base: "#f0f9ff", surface: "#ffffff", accent: "#9f1239" },
    "checker",
    { title: 23, heroHeight: 316, radius: 19 },
  ),
  createTheme(
    "petrol-neon",
    "نئون نفتی",
    { base: "#042f2e", surface: "#134e4a", accent: "#22d3ee" },
    "barcode",
    { title: 24, description: 14, logoHeaderHeight: 188 },
  ),
  createTheme(
    "lilac-citrus",
    "یاسی مرکباتی",
    { base: "#faf5ff", surface: "#ffffff", accent: "#65a30d" },
    "petals",
    { title: 23, radius: 25 },
    {
      backgroundPattern: {
        id: "halftone-gradient",
        color: "#f0abfc",
        secondaryColor: "#67e8f9",
        opacity: 0.2,
        size: 22,
      },
    },
  ),
  createTheme(
    "cyan-poppy",
    "فیروزه‌ای شقایقی",
    { base: "#ecfeff", surface: "#ffffff", accent: "#e11d48" },
    "bubbles",
    { title: 23, heroHeight: 324 },
  ),
  createTheme(
    "midnight-mint",
    "نیمه‌شب نعنایی",
    { base: "#0f172a", surface: "#1e293b", accent: "#34d399" },
    "wave-slope",
    { title: 24, description: 14, heroHeight: 342, radius: 23 },
  ),
  createTheme(
    "paper-blue",
    "آبی کاغذی",
    { base: "#fefce8", surface: "#eff6ff", accent: "#1d4ed8" },
    "arches",
    { title: 23, heroHeight: 314, logoHeaderHeight: 176 },
  ),
  createTheme(
    "spring-ink",
    "جوهر بهاری",
    { base: "#f7fee7", surface: "#ffffff", accent: "#0f172a" },
    "dots",
    { title: 22, radius: 20, heroHeight: 306 },
  ),
  createTheme(
    "aqua-plum",
    "آبی آلویی",
    { base: "#f0fdfa", surface: "#fdf4ff", accent: "#86198f" },
    "diamonds",
    { title: 23, radius: 22, logoHeaderHeight: 182 },
  ),
  createTheme(
    "onyx-atelier",
    "آتلیه اونیکس",
    { base: "#09090b", surface: "#18181b", accent: "#d6b56d" },
    "wave-aurora",
    {
      title: 24,
      description: 14,
      heroHeight: 342,
      radius: 24,
      logoHeaderHeight: 194,
    },
    {
      recipe: { surfaceMode: "glass", buttonMode: "solid", contrast: "bold" },
      backgroundPattern: {
        id: "duotone-blur",
        color: "#d6b56d",
        secondaryColor: "#111827",
        opacity: 0.18,
        size: 34,
      },
    },
  ),
  createTheme(
    "pearl-couture",
    "کوتور صدفی",
    { base: "#f8f4ee", surface: "#fffefd", accent: "#111827" },
    "curve-layer",
    { title: 23, heroHeight: 310, radius: 18, logoHeaderHeight: 170 },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "outline",
        contrast: "soft",
      },
      backgroundPattern: {
        id: "paper-speckles",
        color: "#c8a96a",
        opacity: 0.08,
        size: 22,
      },
    },
  ),
  createTheme(
    "emerald-reserve",
    "رزرو زمردی",
    { base: "#06140f", surface: "#10231c", accent: "#34d399" },
    "wave-organic",
    {
      title: 24,
      description: 14,
      heroHeight: 338,
      radius: 23,
      logoHeaderHeight: 190,
    },
    {
      recipe: { surfaceMode: "glass", buttonMode: "soft", contrast: "bold" },
      backgroundPattern: {
        id: "topography",
        color: "#34d399",
        secondaryColor: "#0f766e",
        opacity: 0.12,
        size: 58,
      },
    },
  ),
  createTheme(
    "sapphire-mono",
    "سفایر مونو",
    { base: "#08111f", surface: "#111827", accent: "#60a5fa" },
    "mesh-gradient",
    {
      title: 24,
      description: 14,
      heroHeight: 340,
      radius: 22,
      logoHeaderHeight: 192,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "orbital-circles",
        color: "#1d4ed8",
        secondaryColor: "#93c5fd",
        opacity: 0.18,
        size: 38,
      },
    },
  ),
  createTheme(
    "rouge-velvet",
    "مخمل روژ",
    { base: "#1c060a", surface: "#2a0f16", accent: "#fb7185" },
    "wave-deep",
    {
      title: 24,
      description: 14,
      heroHeight: 336,
      radius: 26,
      logoHeaderHeight: 188,
    },
    {
      recipe: { surfaceMode: "solid", buttonMode: "soft", contrast: "bold" },
      backgroundPattern: {
        id: "calm-waves",
        color: "#fb7185",
        secondaryColor: "#450a0a",
        opacity: 0.12,
        size: 46,
      },
    },
  ),
  createTheme(
    "platinum-noir",
    "نوآر پلاتینی",
    { base: "#0a0a0a", surface: "#1c1917", accent: "#e7e5e4" },
    "diagonal-stripes",
    {
      title: 24,
      description: 14,
      heroHeight: 344,
      radius: 18,
      logoHeaderHeight: 184,
    },
    {
      recipe: { surfaceMode: "solid", buttonMode: "outline", contrast: "bold" },
      backgroundPattern: {
        id: "crosshatch",
        color: "#e7e5e4",
        secondaryColor: "#78716c",
        opacity: 0.07,
        size: 20,
      },
    },
  ),
  createTheme(
    "champagne-rose",
    "رز شامپاین",
    { base: "#fff7ed", surface: "#fffaf5", accent: "#b76e79" },
    "petals",
    { title: 23, heroHeight: 316, radius: 25, logoHeaderHeight: 180 },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "soft",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "gradient-dots",
        color: "#f9a8d4",
        secondaryColor: "#facc15",
        opacity: 0.18,
        size: 24,
      },
    },
  ),
  createTheme(
    "electric-lux",
    "لوکس الکتریک",
    { base: "#050816", surface: "#111827", accent: "#22d3ee" },
    "orbit",
    {
      title: 24,
      description: 14,
      heroHeight: 342,
      radius: 23,
      logoHeaderHeight: 190,
    },
    {
      recipe: { surfaceMode: "glass", buttonMode: "solid", contrast: "bold" },
      backgroundPattern: {
        id: "blurred-dots",
        color: "#22d3ee",
        secondaryColor: "#8b5cf6",
        opacity: 0.2,
        size: 20,
      },
    },
  ),
  createTheme(
    "caviar-olive",
    "زیتون خاویاری",
    { base: "#11110b", surface: "#1f1f13", accent: "#bef264" },
    "honeycomb",
    {
      title: 24,
      description: 14,
      heroHeight: 332,
      radius: 21,
      logoHeaderHeight: 184,
    },
    {
      recipe: { surfaceMode: "layered", buttonMode: "soft", contrast: "bold" },
      backgroundPattern: {
        id: "plus-grid",
        color: "#bef264",
        secondaryColor: "#3f6212",
        opacity: 0.1,
        size: 30,
      },
    },
  ),
  createTheme(
    "royal-aubergine",
    "بادمجانی رویال",
    { base: "#17051f", surface: "#261030", accent: "#c084fc" },
    "liquid",
    {
      title: 24,
      description: 14,
      heroHeight: 338,
      radius: 27,
      logoHeaderHeight: 190,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "duotone-blur",
        color: "#c084fc",
        secondaryColor: "#f0abfc",
        opacity: 0.18,
        size: 36,
      },
    },
  ),
  createTheme(
    "medical-clarity",
    "پزشکی مدرن",
    { base: "#f0f9ff", surface: "#ffffff", accent: "#0e7490" },
    "minimal-line",
    {
      title: 23,
      description: 14,
      heroHeight: 318,
      radius: 18,
      logoHeaderHeight: 174,
    },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "solid",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "soft-spotlight",
        color: "#0ea5e9",
        secondaryColor: "#14b8a6",
        opacity: 0.16,
        size: 34,
      },
    },
  ),
  createTheme(
    "aesthetic-clinic",
    "کلینیک زیبایی",
    { base: "#fff1f2", surface: "#fff7ed", accent: "#be185d" },
    "curve-layer",
    {
      title: 24,
      description: 14,
      heroHeight: 326,
      radius: 26,
      logoHeaderHeight: 184,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "soft",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "silk-waves",
        color: "#fb7185",
        secondaryColor: "#c084fc",
        opacity: 0.2,
        size: 46,
      },
    },
  ),
  createTheme(
    "organic-farm",
    "کشاورزی ارگانیک",
    { base: "#f7fee7", surface: "#ffffff", accent: "#3f6212" },
    "wave-organic",
    {
      title: 23,
      description: 13,
      heroHeight: 324,
      radius: 22,
      logoHeaderHeight: 180,
    },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "soft",
        contrast: "soft",
      },
      backgroundPattern: {
        id: "topography",
        color: "#65a30d",
        secondaryColor: "#84cc16",
        opacity: 0.13,
        size: 58,
      },
    },
  ),
  createTheme(
    "commercial-premium",
    "تجاری پریمیوم",
    { base: "#f8fafc", surface: "#ffffff", accent: "#1e40af" },
    "diagonal-stripes",
    {
      title: 24,
      description: 14,
      heroHeight: 330,
      radius: 20,
      logoHeaderHeight: 182,
    },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "solid",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "premium-rings",
        color: "#2563eb",
        secondaryColor: "#f59e0b",
        opacity: 0.14,
        size: 48,
      },
    },
  ),
  createTheme(
    "salon-glow",
    "آرایشگاه گلام",
    { base: "#fdf2f8", surface: "#ffffff", accent: "#db2777" },
    "petals",
    {
      title: 24,
      description: 14,
      heroHeight: 328,
      radius: 28,
      logoHeaderHeight: 186,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "silk-waves",
        color: "#ec4899",
        secondaryColor: "#f0abfc",
        opacity: 0.2,
        size: 46,
      },
    },
  ),
  createTheme(
    "fresh-market",
    "سوپرمارکت تازه",
    { base: "#fefce8", surface: "#ffffff", accent: "#16a34a" },
    "confetti",
    {
      title: 23,
      description: 13,
      heroHeight: 316,
      radius: 19,
      logoHeaderHeight: 174,
    },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "solid",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "gradient-dots",
        color: "#22c55e",
        secondaryColor: "#facc15",
        opacity: 0.16,
        size: 22,
      },
    },
  ),
  createTheme(
    "florist-bloom",
    "گل‌فروشی بلوم",
    { base: "#fff7ed", surface: "#fff1f2", accent: "#e11d48" },
    "petals",
    {
      title: 24,
      description: 14,
      heroHeight: 326,
      radius: 27,
      logoHeaderHeight: 184,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "soft",
        contrast: "soft",
      },
      backgroundPattern: {
        id: "silk-waves",
        color: "#fb7185",
        secondaryColor: "#86efac",
        opacity: 0.19,
        size: 44,
      },
    },
  ),
  createTheme(
    "digital-services-neon",
    "خدمات دیجیتال نئون",
    { base: "#0f172a", surface: "#1e293b", accent: "#22d3ee" },
    "mesh-gradient",
    {
      title: 24,
      description: 14,
      heroHeight: 342,
      radius: 22,
      logoHeaderHeight: 194,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "aurora-mesh",
        color: "#22d3ee",
        secondaryColor: "#6366f1",
        opacity: 0.22,
        size: 44,
      },
    },
  ),
  createTheme(
    "warm-cafe-restaurant",
    "کافه و رستوران گرم",
    { base: "#fff7ed", surface: "#fffbeb", accent: "#b45309" },
    "ribbon-fold",
    {
      title: 23,
      description: 14,
      heroHeight: 322,
      radius: 21,
      logoHeaderHeight: 178,
    },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "solid",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "paper-speckles",
        color: "#d97706",
        secondaryColor: "#f59e0b",
        opacity: 0.12,
        size: 24,
      },
    },
  ),
  createTheme(
    "modern-real-estate",
    "املاک مدرن",
    { base: "#f8fafc", surface: "#ffffff", accent: "#0f172a" },
    "arches",
    {
      title: 24,
      description: 14,
      heroHeight: 332,
      radius: 18,
      logoHeaderHeight: 186,
    },
    {
      recipe: {
        surfaceMode: "layered",
        buttonMode: "outline",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "premium-rings",
        color: "#64748b",
        secondaryColor: "#d97706",
        opacity: 0.1,
        size: 52,
      },
    },
  ),
  createTheme(
    "liquid-prism-2026",
    "لیکویید پریسم 2026",
    { base: "#050713", surface: "#12172e", accent: "#7cffcb" },
    "glass-prism",
    {
      heroHeight: 346,
      radius: 28,
      logoHeaderHeight: 196,
      logoSize: 92,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        density: "airy",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "prism-caustics",
        color: "#ff4fd8",
        secondaryColor: "#7cffcb",
        opacity: 0.22,
        size: 34,
      },
    },
  ),
  createTheme(
    "neon-opal-glass",
    "نئون اوپال گلس",
    { base: "#030712", surface: "#101525", accent: "#00e5ff" },
    "glass-aurora",
    {
      heroHeight: 350,
      radius: 30,
      logoHeaderHeight: 200,
      logoSize: 94,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "soft",
        density: "airy",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "liquid-glass-aurora",
        color: "#00e5ff",
        secondaryColor: "#8b5cf6",
        opacity: 0.22,
        size: 38,
      },
    },
  ),
  createTheme(
    "chrome-rose-holo",
    "کروم رز هولو",
    { base: "#fff1fb", surface: "#ffffff", accent: "#ff4fd8" },
    "holo-orbit",
    {
      heroHeight: 340,
      radius: 28,
      logoHeaderHeight: 192,
      logoSize: 90,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        density: "balanced",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "hologram-dots",
        color: "#ff4fd8",
        secondaryColor: "#06b6d4",
        opacity: 0.2,
        size: 20,
      },
    },
  ),
  createTheme(
    "cyber-lime-liquid",
    "سایبر لایم مایع",
    { base: "#07110f", surface: "#101d19", accent: "#ccff00" },
    "liquid-blob",
    {
      heroHeight: 344,
      radius: 30,
      logoHeaderHeight: 198,
      logoSize: 94,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        density: "compact",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "fluid-orbs",
        color: "#ccff00",
        secondaryColor: "#00f5d4",
        opacity: 0.2,
        size: 42,
      },
    },
  ),
  createTheme(
    "ice-violet-glass",
    "آیس وایولت شیشه‌ای",
    { base: "#eff6ff", surface: "#ffffff", accent: "#7c3aed" },
    "mist-bubbles",
    {
      heroHeight: 336,
      radius: 26,
      logoHeaderHeight: 188,
      logoSize: 88,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "soft",
        density: "balanced",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "glass-mosaic",
        color: "#7c3aed",
        secondaryColor: "#facc15",
        opacity: 0.18,
        size: 44,
      },
    },
  ),
  createTheme(
    "lava-future-glass",
    "لاوا فیوچر گلس",
    { base: "#16070a", surface: "#241011", accent: "#ff3d00" },
    "chrome-fold",
    {
      heroHeight: 348,
      radius: 28,
      logoHeaderHeight: 196,
      logoSize: 92,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        density: "balanced",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "chrome-ribbons",
        color: "#ff3d00",
        secondaryColor: "#ec4899",
        opacity: 0.21,
        size: 48,
      },
    },
  ),
  createTheme(
    "holo-mango-dark",
    "هولو مانگو دارک",
    { base: "#0b0715", surface: "#191124", accent: "#facc15" },
    "neon-caustic",
    {
      heroHeight: 346,
      radius: 26,
      logoHeaderHeight: 196,
      logoSize: 92,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "outline",
        density: "airy",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "cyber-noise",
        color: "#facc15",
        secondaryColor: "#a855f7",
        opacity: 0.18,
        size: 18,
      },
    },
  ),
  createTheme(
    "arctic-neon-mist",
    "مه نئون قطبی",
    { base: "#07111f", surface: "#102036", accent: "#67e8f9" },
    "neon-mist",
    {
      heroHeight: 344,
      radius: 28,
      logoHeaderHeight: 194,
      logoSize: 92,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        density: "airy",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "neon-fog-glass",
        color: "#67e8f9",
        secondaryColor: "#8b5cf6",
        opacity: 0.2,
        size: 36,
      },
    },
  ),
  createTheme(
    "frosted-cyan-lilac",
    "یخ فیروزه‌ای یاسی",
    { base: "#eef8ff", surface: "#ffffff", accent: "#4f46e5" },
    "frosted-orbit",
    {
      heroHeight: 338,
      radius: 26,
      logoHeaderHeight: 188,
      logoSize: 88,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "soft",
        density: "balanced",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "arctic-mist-rings",
        color: "#7dd3fc",
        secondaryColor: "#c4b5fd",
        opacity: 0.18,
        size: 46,
      },
    },
  ),
  createTheme(
    "midnight-laser-glass",
    "لیزر گلس نیمه‌شب",
    { base: "#050816", surface: "#101827", accent: "#22d3ee" },
    "laser-veil",
    {
      heroHeight: 346,
      radius: 26,
      logoHeaderHeight: 196,
      logoSize: 92,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "outline",
        density: "compact",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "frosted-laser-grid",
        color: "#22d3ee",
        secondaryColor: "#818cf8",
        opacity: 0.16,
        size: 24,
      },
    },
  ),
  createTheme(
    "polar-glass-orbs",
    "گوی‌های گلس قطبی",
    { base: "#f0fdff", surface: "#ffffff", accent: "#0284c7" },
    "polar-liquid",
    {
      heroHeight: 336,
      radius: 30,
      logoHeaderHeight: 190,
      logoSize: 90,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "solid",
        density: "balanced",
        contrast: "balanced",
      },
      backgroundPattern: {
        id: "polar-veil-orbs",
        color: "#a5f3fc",
        secondaryColor: "#60a5fa",
        opacity: 0.18,
        size: 42,
      },
    },
  ),
  createTheme(
    "blue-vapor-neon",
    "بخار آبی نئون",
    { base: "#071627", surface: "#10243a", accent: "#38bdf8" },
    "blue-vapor",
    {
      heroHeight: 342,
      radius: 27,
      logoHeaderHeight: 192,
      logoSize: 90,
    },
    {
      recipe: {
        surfaceMode: "glass",
        buttonMode: "soft",
        density: "airy",
        contrast: "bold",
      },
      backgroundPattern: {
        id: "blue-vapor-noise",
        color: "#38bdf8",
        secondaryColor: "#a78bfa",
        opacity: 0.18,
        size: 18,
      },
    },
  ),
];

const HERO_BLOCK_TYPES = new Set(["banner", "slider", "cta"]);
const TIGHT_SPACING_BLOCK_TYPES = new Set([
  "simpleLink",
  "superLink",
  "messengerLinks",
  "mapLinks",
  "separator",
  "contactSave",
]);
const FEATURE_SPACING_BLOCK_TYPES = new Set([
  "productCards",
  "bookingForm",
  "testimonial",
  "countdown",
]);

const roleCache = new Map<string, ThemeElementRole>();

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampProgress(value: number) {
  return Math.round(clamp(value, 0, 100));
}

function waitForThemeApplyTurn() {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      setTimeout(resolve, 0);
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

function normalizeThemeRecipe(
  value?: Partial<PageThemeRecipe>,
): PageThemeRecipe {
  const recipe = value && typeof value === "object" ? value : {};
  const surfaceModes: PageThemeRecipe["surfaceMode"][] = [
    "flat",
    "layered",
    "glass",
    "solid",
  ];
  const buttonModes: PageThemeRecipe["buttonMode"][] = [
    "solid",
    "soft",
    "outline",
  ];
  const densities: PageThemeRecipe["density"][] = [
    "compact",
    "balanced",
    "airy",
  ];
  const contrasts: PageThemeRecipe["contrast"][] = ["soft", "balanced", "bold"];

  return {
    surfaceMode: surfaceModes.includes(
      recipe.surfaceMode as PageThemeRecipe["surfaceMode"],
    )
      ? (recipe.surfaceMode as PageThemeRecipe["surfaceMode"])
      : DEFAULT_THEME_RECIPE.surfaceMode,
    buttonMode: buttonModes.includes(
      recipe.buttonMode as PageThemeRecipe["buttonMode"],
    )
      ? (recipe.buttonMode as PageThemeRecipe["buttonMode"])
      : DEFAULT_THEME_RECIPE.buttonMode,
    density: densities.includes(recipe.density as PageThemeRecipe["density"])
      ? (recipe.density as PageThemeRecipe["density"])
      : DEFAULT_THEME_RECIPE.density,
    contrast: contrasts.includes(recipe.contrast as PageThemeRecipe["contrast"])
      ? (recipe.contrast as PageThemeRecipe["contrast"])
      : DEFAULT_THEME_RECIPE.contrast,
  };
}

function parseHexColor(value: string) {
  const hex = value.trim().replace("#", "");
  if (![3, 6].includes(hex.length)) return null;
  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((part) => part + part)
          .join("")
      : hex;
  const int = Number.parseInt(expanded, 16);
  if (!Number.isFinite(int)) return null;
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, "0");
}

function mixColor(from: string, to: string, amount: number) {
  const a = parseHexColor(from);
  const b = parseHexColor(to);
  if (!a || !b) return from;
  const ratio = clamp(amount, 0, 1);
  return `#${toHex(a.r + (b.r - a.r) * ratio)}${toHex(
    a.g + (b.g - a.g) * ratio,
  )}${toHex(a.b + (b.b - a.b) * ratio)}`;
}

function isLightColor(color: string) {
  const rgb = parseHexColor(color);
  if (!rgb) return true;
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.62;
}

function textOn(color: string) {
  return isLightColor(color) ? "#111827" : "#ffffff";
}

function mutedOn(color: string) {
  return isLightColor(color)
    ? "rgba(17, 24, 39, 0.66)"
    : "rgba(255, 255, 255, 0.76)";
}

function alpha(color: string, opacity: number) {
  const rgb = parseHexColor(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

function resolveTheme(theme: PageThemeDefinition): ResolvedTheme {
  const { base, surface, accent } = theme.palette;
  const heroBg = isLightColor(accent)
    ? mixColor(accent, "#111827", 0.72)
    : accent;

  return {
    base,
    surface,
    surfaceAlt: mixColor(surface, base, 0.34),
    panel: mixColor(surface, base, 0.18),
    accent,
    accentStrong: isLightColor(accent)
      ? mixColor(accent, "#111827", 0.38)
      : accent,
    accentSoft: alpha(accent, 0.14),
    accentFaint: alpha(accent, 0.08),
    line: alpha(accent, 0.24),
    heroBg,
    heroText: textOn(heroBg),
    heroMuted: mutedOn(heroBg),
    surfaceText: textOn(surface),
    surfaceMuted: mutedOn(surface),
  };
}

function recipeRadius(theme: PageThemeDefinition, offset = 0) {
  const densityOffset =
    theme.recipe.density === "compact"
      ? -3
      : theme.recipe.density === "airy"
        ? 4
        : 0;
  return clamp(theme.scale.radius + densityOffset + offset, 0, 56);
}

function recipeFontSize(value: number, recipe: PageThemeRecipe, offset = 0) {
  if (value <= 16) return Math.max(10, value + offset);

  const densityOffset =
    recipe.density === "compact" ? -1 : recipe.density === "airy" ? 1 : 0;
  return Math.max(10, value + densityOffset + offset);
}

function recipeLineColor(tones: ResolvedTheme, recipe: PageThemeRecipe) {
  if (recipe.contrast === "bold") return alpha(tones.accent, 0.36);
  if (recipe.contrast === "soft") return alpha(tones.accent, 0.14);
  return tones.line;
}

function recipeSurfaceColor({
  tones,
  recipe,
  isAlternate,
}: {
  tones: ResolvedTheme;
  recipe: PageThemeRecipe;
  isAlternate: boolean;
}) {
  if (recipe.surfaceMode === "flat") return alpha(tones.surface, 0.72);
  if (recipe.surfaceMode === "glass") return alpha(tones.surface, 0.82);
  if (recipe.surfaceMode === "solid") return tones.surface;
  return isAlternate ? tones.surfaceAlt : tones.surface;
}

function recipePanelColor(tones: ResolvedTheme, recipe: PageThemeRecipe) {
  if (recipe.surfaceMode === "flat") return "transparent";
  if (recipe.surfaceMode === "glass") return alpha(tones.panel, 0.74);
  if (recipe.surfaceMode === "solid") return tones.panel;
  return alpha(tones.accent, recipe.contrast === "bold" ? 0.1 : 0.07);
}

function recipeOverlayColor(recipe: PageThemeRecipe) {
  if (recipe.contrast === "bold") return "rgba(0, 0, 0, 0.44)";
  if (recipe.contrast === "soft") return "rgba(0, 0, 0, 0.22)";
  return "rgba(0, 0, 0, 0.34)";
}

function recipeShadowIntensity(recipe: PageThemeRecipe, base: number) {
  if (recipe.surfaceMode === "flat") return 0;
  const densityOffset = recipe.density === "airy" ? 6 : 0;
  const contrastOffset =
    recipe.contrast === "bold" ? 10 : recipe.contrast === "soft" ? -8 : 0;
  return clamp(base + densityOffset + contrastOffset, 0, 100);
}

function applyButtonRecipe({
  style,
  allowed,
  tones,
  theme,
  isHero,
  secondary,
}: {
  style: EditableStyleMap;
  allowed: EditableStyleKey[];
  tones: ResolvedTheme;
  theme: PageThemeDefinition;
  isHero: boolean;
  secondary: boolean;
}) {
  const recipe = theme.recipe;
  const line = recipeLineColor(tones, recipe);
  const radius = Math.max(10, recipeRadius(theme, -8));

  if (secondary) {
    writeColor(style, allowed, "backgroundColor", tones.accentFaint);
    writeColor(
      style,
      allowed,
      "color",
      isHero ? tones.heroText : tones.accentStrong,
    );
    writeColor(style, allowed, "borderColor", line);
    writeNumber(style, allowed, "borderWidth", 1);
  } else if (recipe.buttonMode === "soft") {
    writeColor(style, allowed, "backgroundColor", tones.accentSoft);
    writeColor(style, allowed, "color", tones.accentStrong);
    writeColor(style, allowed, "borderColor", alpha(tones.accent, 0.18));
    writeNumber(style, allowed, "borderWidth", 1);
  } else if (recipe.buttonMode === "outline") {
    writeColor(style, allowed, "backgroundColor", "transparent");
    writeColor(
      style,
      allowed,
      "color",
      isHero ? tones.heroText : tones.accentStrong,
    );
    writeColor(style, allowed, "borderColor", alpha(tones.accent, 0.46));
    writeNumber(style, allowed, "borderWidth", 1);
  } else {
    writeColor(style, allowed, "backgroundColor", tones.accent);
    writeColor(style, allowed, "color", textOn(tones.accent));
    writeColor(style, allowed, "borderColor", "transparent");
    writeNumber(style, allowed, "borderWidth", 0);
  }

  writeNumber(
    style,
    allowed,
    "fontSize",
    recipeFontSize(theme.scale.button, recipe),
  );
  writeNumber(style, allowed, "borderRadius", radius);
  writeShadow(style, allowed, {
    color: alpha(tones.accent, recipe.buttonMode === "outline" ? 0.22 : 0.26),
    intensity: recipeShadowIntensity(recipe, secondary ? 18 : 30),
  });
}

function responsive<T>(mobile: T, tablet?: T, desktop?: T): ResponsiveValue<T> {
  return {
    mobile,
    tablet: tablet ?? mobile,
    desktop: desktop ?? tablet ?? mobile,
  };
}

function writeStyleValue(
  style: EditableStyleMap,
  key: EditableStyleKey,
  value: string | number | ShadowStyleValue,
) {
  if (key === "animation") return;

  if (key === "fontSize") {
    const size = Number(value);
    style.fontSize = responsive(
      size,
      Math.round(size * 1.08),
      Math.round(size * 1.16),
    );
    return;
  }

  if (key === "height") {
    style.height = responsive(Number(value));
    return;
  }

  if (key === "textAlign") {
    style.textAlign = responsive(value as TextAlignValue);
    return;
  }

  if (key === "contentAlign") {
    style.contentAlign = responsive(value as ContentAlignValue);
    return;
  }

  if (key === "marginTop") {
    style.marginTop = responsive(Number(value));
    return;
  }

  if (key === "marginBottom") {
    style.marginBottom = responsive(Number(value));
    return;
  }

  if (key === "paddingTop") {
    style.paddingTop = responsive(Number(value));
    return;
  }

  if (key === "paddingBottom") {
    style.paddingBottom = responsive(Number(value));
    return;
  }

  if (key === "borderRadius") {
    style.borderRadius = responsive(Number(value));
    return;
  }

  if (key === "borderWidth") {
    style.borderWidth = responsive(Number(value));
    return;
  }

  if (key === "color") {
    style.color = responsive(String(value));
    return;
  }

  if (key === "backgroundColor") {
    style.backgroundColor = responsive(String(value));
    return;
  }

  if (key === "borderColor") {
    style.borderColor = responsive(String(value));
    return;
  }

  if (key === "shadow") {
    style.shadow = responsive(value as ShadowStyleValue);
  }
}

function canSet(allowed: EditableStyleKey[], key: EditableStyleKey) {
  return allowed.includes(key);
}

function getElementRole(elementId: string): ThemeElementRole {
  const cached = roleCache.get(elementId);
  if (cached) return cached;

  const id = elementId.toLowerCase();
  let role: ThemeElementRole = "item";

  if (id.includes("overlay")) role = "overlay";
  else if (
    id === "container" ||
    id.includes("wrapper") ||
    id.includes("area")
  ) {
    role = "container";
  } else if (id.includes("oldprice")) role = "description";
  else if (id.includes("price") || id.includes("timernumber")) role = "price";
  else if (
    id.includes("title") ||
    id.includes("heading") ||
    id.includes("question") ||
    id.includes("name")
  ) {
    role = "title";
  } else if (
    id.includes("description") ||
    id.includes("subtitle") ||
    id.includes("caption") ||
    id.includes("answer") ||
    id.includes("role") ||
    id.includes("label") ||
    id.includes("content") ||
    id.includes("message") ||
    id.includes("expiredtext")
  ) {
    role = "description";
  } else if (
    id.includes("secondary") ||
    id.includes("close") ||
    id.includes("navbutton") ||
    id.includes("arrow")
  ) {
    role = "buttonSecondary";
  } else if (
    id.includes("button") ||
    id.includes("submit") ||
    id.includes("link") ||
    id.includes("action")
  ) {
    role = "buttonPrimary";
  } else if (
    id.includes("input") ||
    id.includes("calendar") ||
    id.includes("timeslot") ||
    id.includes("field") ||
    id.includes("form")
  ) {
    role = "field";
  } else if (
    id.includes("image") ||
    id.includes("video") ||
    id.includes("avatar") ||
    id.includes("thumbnail")
  ) {
    role = "media";
  } else if (
    id.includes("line") ||
    id.includes("separator") ||
    id.includes("ornament")
  ) {
    role = "separator";
  } else if (
    id.includes("icon") ||
    id.includes("badge") ||
    id.includes("progress") ||
    id.includes("rating") ||
    id.includes("dot")
  ) {
    role = "accent";
  }

  roleCache.set(elementId, role);
  return role;
}

function writeColor(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  key: EditableStyleKey,
  value: string,
) {
  if (canSet(allowed, key)) writeStyleValue(style, key, value);
}

function writeNumber(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  key: EditableStyleKey,
  value: number,
) {
  if (canSet(allowed, key)) writeStyleValue(style, key, value);
}

function writeShadow(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  value: ShadowStyleValue,
) {
  if (canSet(allowed, "shadow")) writeStyleValue(style, "shadow", value);
}

function getThemeAnimation({
  role,
  recipe,
  blockIndex,
}: {
  role: ThemeElementRole;
  recipe: PageThemeRecipe;
  blockIndex: number;
}): AnimationType | null {
  if (role === "overlay" || role === "separator") return null;
  if (role === "container") return blockIndex % 2 === 0 ? "fade" : "slideUp";
  if (role === "title") return "slideUp";
  if (role === "buttonPrimary" || role === "buttonSecondary") return "riseSoft";
  if (role === "accent" || role === "price") return "scale";
  if (role === "media" && recipe.density === "airy") return "riseSoft";
  return "fade";
}

function writeThemeAnimation(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  role: ThemeElementRole,
  recipe: PageThemeRecipe,
  blockIndex: number,
) {
  const animation = getThemeAnimation({ role, recipe, blockIndex });
  if (animation && canSet(allowed, "animation")) style.animation = animation;
}

function recipeSpacingUnit(recipe: PageThemeRecipe) {
  const densityBase =
    recipe.density === "compact" ? 16 : recipe.density === "airy" ? 30 : 22;
  const surfaceOffset = recipe.surfaceMode === "glass" ? 4 : 0;
  const contrastOffset = recipe.contrast === "bold" ? 2 : 0;
  return densityBase + surfaceOffset + contrastOffset;
}

function getThemeContainerSpacing({
  blockType,
  blockIndex,
  recipe,
}: {
  blockType: string;
  blockIndex: number;
  recipe: PageThemeRecipe;
}) {
  const unit = recipeSpacingUnit(recipe);
  const rhythm = blockIndex % 3 === 1 ? 4 : blockIndex % 3 === 2 ? -2 : 0;
  const isFirst = blockIndex === 0;

  if (blockType === "separator") {
    const compactGap = Math.max(8, Math.round(unit * 0.42));
    return {
      marginTop: isFirst ? 0 : compactGap,
      marginBottom: compactGap,
      paddingTop: Math.max(6, Math.round(unit * 0.25)),
      paddingBottom: Math.max(6, Math.round(unit * 0.25)),
    };
  }

  if (HERO_BLOCK_TYPES.has(blockType)) {
    return {
      marginTop: isFirst ? 0 : unit + 6,
      marginBottom: unit + 8 + rhythm,
      paddingTop: Math.max(22, Math.round(unit * 1.25)),
      paddingBottom: Math.max(24, Math.round(unit * 1.35)),
    };
  }

  if (TIGHT_SPACING_BLOCK_TYPES.has(blockType)) {
    const tightGap = Math.max(8, Math.round(unit * 0.58) + rhythm);
    return {
      marginTop: isFirst ? 0 : Math.max(6, Math.round(tightGap * 0.7)),
      marginBottom: tightGap,
      paddingTop: Math.max(8, Math.round(unit * 0.55)),
      paddingBottom: Math.max(8, Math.round(unit * 0.55)),
    };
  }

  if (FEATURE_SPACING_BLOCK_TYPES.has(blockType)) {
    return {
      marginTop: isFirst ? 0 : unit + 8 + rhythm,
      marginBottom: unit + 12 + rhythm,
      paddingTop: Math.max(18, Math.round(unit * 0.95)),
      paddingBottom: Math.max(18, Math.round(unit * 1.05)),
    };
  }

  return {
    marginTop: isFirst ? 0 : Math.max(10, Math.round(unit * 0.78) + rhythm),
    marginBottom: unit + rhythm,
    paddingTop: Math.max(14, Math.round(unit * 0.78)),
    paddingBottom: Math.max(14, Math.round(unit * 0.85)),
  };
}

function writeThemeSpacing(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  blockType: string,
  blockIndex: number,
  recipe: PageThemeRecipe,
) {
  const spacing = getThemeContainerSpacing({ blockType, blockIndex, recipe });
  writeNumber(style, allowed, "marginTop", spacing.marginTop);
  writeNumber(style, allowed, "marginBottom", spacing.marginBottom);
  writeNumber(style, allowed, "paddingTop", spacing.paddingTop);
  writeNumber(style, allowed, "paddingBottom", spacing.paddingBottom);
}

function styleElement({
  elementId,
  blockType,
  blockIndex,
  style,
  allowed,
  theme,
  tones,
}: {
  elementId: string;
  blockType: string;
  blockIndex: number;
  style: EditableStyleMap;
  allowed: EditableStyleKey[];
  theme: PageThemeDefinition;
  tones: ResolvedTheme;
}) {
  if (allowed.length === 0) return style;

  const role = getElementRole(elementId);
  const recipe = theme.recipe;
  const isHero = HERO_BLOCK_TYPES.has(blockType);
  const isAlternate = blockIndex % 2 === 1;
  const blockSurface = recipeSurfaceColor({ tones, recipe, isAlternate });
  const panelSurface = recipePanelColor(tones, recipe);
  const lineColor = recipeLineColor(tones, recipe);
  const nextStyle: EditableStyleMap = { ...style };

  if (role === "container") {
    const background = isHero ? tones.heroBg : blockSurface;
    writeColor(nextStyle, allowed, "backgroundColor", background);
    writeColor(
      nextStyle,
      allowed,
      "borderColor",
      isHero ? alpha(tones.surface, 0.18) : lineColor,
    );
    writeNumber(
      nextStyle,
      allowed,
      "borderWidth",
      recipe.surfaceMode === "flat" ? 0 : 1,
    );
    writeNumber(nextStyle, allowed, "borderRadius", recipeRadius(theme));
    writeShadow(nextStyle, allowed, {
      color: alpha(tones.accent, isHero ? 0.28 : 0.18),
      intensity: recipeShadowIntensity(recipe, isHero ? 36 : 24),
    });
    writeThemeSpacing(nextStyle, allowed, blockType, blockIndex, recipe);
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    if (isHero)
      writeNumber(nextStyle, allowed, "height", theme.scale.heroHeight);
    return nextStyle;
  }

  if (role === "overlay") {
    writeColor(
      nextStyle,
      allowed,
      "backgroundColor",
      recipeOverlayColor(recipe),
    );
    return nextStyle;
  }

  if (role === "title") {
    writeColor(
      nextStyle,
      allowed,
      "color",
      isHero ? tones.heroText : tones.surfaceText,
    );
    writeNumber(
      nextStyle,
      allowed,
      "fontSize",
      recipeFontSize(theme.scale.title, recipe),
    );
    writeShadow(nextStyle, allowed, {
      color: alpha(isHero ? tones.heroBg : tones.accent, 0.24),
      intensity: recipe.contrast === "soft" ? 8 : 18,
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "description") {
    writeColor(
      nextStyle,
      allowed,
      "color",
      isHero ? tones.heroMuted : tones.surfaceMuted,
    );
    writeNumber(
      nextStyle,
      allowed,
      "fontSize",
      recipeFontSize(theme.scale.description, recipe),
    );
    writeShadow(nextStyle, allowed, {
      color: alpha(isHero ? tones.heroBg : tones.accent, 0.16),
      intensity: recipe.contrast === "soft" ? 4 : 8,
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "buttonPrimary") {
    applyButtonRecipe({
      style: nextStyle,
      allowed, 
      tones,
      theme,
      isHero,
      secondary: false,
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "buttonSecondary") {
    applyButtonRecipe({
      style: nextStyle,
      allowed,
      tones,
      theme,
      isHero,
      secondary: true,
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "field") {
    writeColor(nextStyle, allowed, "backgroundColor", panelSurface);
    writeColor(nextStyle, allowed, "color", tones.surfaceText);
    writeColor(nextStyle, allowed, "borderColor", lineColor);
    writeNumber(
      nextStyle,
      allowed,
      "fontSize",
      recipeFontSize(theme.scale.item, recipe),
    );
    writeNumber(
      nextStyle,
      allowed,
      "borderRadius",
      Math.max(12, recipeRadius(theme, -7)),
    );
    writeNumber(nextStyle, allowed, "borderWidth", 1);
    writeShadow(nextStyle, allowed, {
      color: alpha(tones.accent, 0.12),
      intensity: recipeShadowIntensity(recipe, 10),
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "media") {
    writeColor(nextStyle, allowed, "backgroundColor", panelSurface);
    writeColor(nextStyle, allowed, "borderColor", lineColor);
    writeNumber(
      nextStyle,
      allowed,
      "borderRadius",
      Math.max(12, recipeRadius(theme, -5)),
    );
    writeNumber(nextStyle, allowed, "borderWidth", 1);
    writeShadow(nextStyle, allowed, {
      color: alpha(tones.accent, 0.16),
      intensity: recipeShadowIntensity(recipe, 18),
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "accent") {
    writeColor(nextStyle, allowed, "backgroundColor", tones.accentSoft);
    writeColor(nextStyle, allowed, "color", tones.accentStrong);
    writeColor(nextStyle, allowed, "borderColor", lineColor);
    writeNumber(
      nextStyle,
      allowed,
      "fontSize",
      recipeFontSize(theme.scale.item, recipe),
    );
    writeNumber(
      nextStyle,
      allowed,
      "borderRadius",
      Math.max(10, recipeRadius(theme, -10)),
    );
    writeShadow(nextStyle, allowed, {
      color: alpha(tones.accent, 0.18),
      intensity: recipeShadowIntensity(recipe, 14),
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "price") {
    writeColor(nextStyle, allowed, "color", tones.accentStrong);
    writeColor(nextStyle, allowed, "backgroundColor", tones.accentFaint);
    writeNumber(
      nextStyle,
      allowed,
      "fontSize",
      recipeFontSize(theme.scale.item, recipe, 2),
    );
    writeNumber(
      nextStyle,
      allowed,
      "borderRadius",
      Math.max(10, recipeRadius(theme, -10)),
    );
    writeShadow(nextStyle, allowed, {
      color: alpha(tones.accent, 0.2),
      intensity: recipeShadowIntensity(recipe, 12),
    });
    writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);
    return nextStyle;
  }

  if (role === "separator") {
    writeColor(
      nextStyle,
      allowed,
      "backgroundColor",
      alpha(tones.accent, recipe.contrast === "soft" ? 0.36 : 0.52),
    );
    writeColor(nextStyle, allowed, "color", tones.accentStrong);
    writeColor(nextStyle, allowed, "borderColor", lineColor);
    return nextStyle;
  }

  writeColor(nextStyle, allowed, "backgroundColor", panelSurface);
  writeColor(nextStyle, allowed, "color", tones.surfaceText);
  writeColor(nextStyle, allowed, "borderColor", lineColor);
  writeNumber(
    nextStyle,
    allowed,
    "fontSize",
    recipeFontSize(theme.scale.item, recipe),
  );
  writeNumber(
    nextStyle,
    allowed,
    "borderRadius",
    Math.max(12, recipeRadius(theme, -6)),
  );
  writeNumber(
    nextStyle,
    allowed,
    "borderWidth",
    recipe.surfaceMode === "flat" ? 0 : 1,
  );
  writeShadow(nextStyle, allowed, {
    color: alpha(tones.accent, 0.14),
    intensity: recipeShadowIntensity(recipe, 16),
  });
  writeThemeAnimation(nextStyle, allowed, role, recipe, blockIndex);

  return nextStyle;
}

export function applyPageThemeToBlocks(
  blocks: PageBlock[],
  theme: PageThemeDefinition,
): PageBlock[] {
  const tones = resolveTheme(theme);

  return blocks.map((block, blockIndex) =>
    styleBlockWithTheme({ block, blockIndex, theme, tones }),
  );
}

function styleBlockWithTheme({
  block,
  blockIndex,
  theme,
  tones,
}: {
  block: PageBlock;
  blockIndex: number;
  theme: PageThemeDefinition;
  tones: ResolvedTheme;
}): PageBlock {
  let changed = false;
  const nextElements: PageBlock["elements"] = {};

  for (const [elementId, element] of Object.entries(block.elements ?? {})) {
    const allowed = element.allowedStyleKeys ?? [];
    const nextStyle = styleElement({
      elementId,
      blockType: block.type,
      blockIndex,
      style: element.style ?? {},
      allowed,
      theme,
      tones,
    });

    if (nextStyle === element.style) {
      nextElements[elementId] = element;
      continue;
    }

    changed = true;
    nextElements[elementId] = {
      ...element,
      style: nextStyle,
    };
  }

  return changed
    ? {
        ...block,
        elements: nextElements,
      }
    : block;
}

export async function applyPageThemeToBlocksProgressively(
  blocks: PageBlock[],
  theme: PageThemeDefinition,
  options: {
    batchSize?: number;
    onProgress?: (progress: PageThemeBlockProgress) => void;
  } = {},
): Promise<PageBlock[]> {
  const totalBlocks = blocks.length;

  if (totalBlocks === 0) {
    options.onProgress?.({
      completedBlocks: 0,
      totalBlocks: 0,
      progress: 100,
    });
    return blocks;
  }

  const tones = resolveTheme(theme);
  const nextBlocks = new Array<PageBlock>(totalBlocks);
  const batchSize = Math.max(
    1,
    Math.floor(options.batchSize ?? THEME_APPLY_BLOCK_BATCH_SIZE),
  );

  for (let start = 0; start < totalBlocks; start += batchSize) {
    const end = Math.min(start + batchSize, totalBlocks);

    for (let blockIndex = start; blockIndex < end; blockIndex += 1) {
      nextBlocks[blockIndex] = styleBlockWithTheme({
        block: blocks[blockIndex],
        blockIndex,
        theme,
        tones,
      });
    }

    options.onProgress?.({
      completedBlocks: end,
      totalBlocks,
      progress: clampProgress((end / totalBlocks) * 100),
    });

    if (end < totalBlocks) {
      await waitForThemeApplyTurn();
    }
  }

  return nextBlocks;
}

function createAppliedPageThemeFrame({
  currentLogoHeader,
  currentFooter,
  theme,
}: {
  currentLogoHeader?: Partial<LogoHeaderSettings>;
  currentFooter?: Partial<PageFooterSettings>;
  theme: PageThemeDefinition;
}): Omit<AppliedPageTheme, "blocks"> {
  const { base, surface, accent } = theme.palette;
  const tones = resolveTheme(theme);
  const logoHeader = normalizeLogoHeaderSettings({
    ...currentLogoHeader,
    enabled: true,
    variant: theme.logoVariant,
    primaryColor: accent,
    secondaryColor: surface,
    accentColor: base,
    textColor: textOn(accent),
    descriptionColor: mutedOn(accent),
    patternOpacity: 0.42,
    height: clamp(theme.scale.logoHeaderHeight, 110, 360),
    logoSize: clamp(theme.scale.logoSize, 56, 180),
    cornerRadius: clamp(theme.scale.radius + 4, 0, 80),
  });
  const footer = normalizePageFooterSettings(
    {
      logo: "",
      backgroundColor:
        theme.recipe.surfaceMode === "solid"
          ? surface
          : alpha(surface, theme.recipe.surfaceMode === "glass" ? 0.84 : 0.9),
      textColor: tones.surfaceMuted,
      accentColor: tones.accentStrong,
      borderColor: alpha(accent, theme.recipe.contrast === "bold" ? 0.26 : 0.16),
    },
    currentFooter,
  );

  return {
    backgroundColor: base,
    backgroundPattern: theme.backgroundPattern,
    logoHeader,
    footer,
  };
}

export function applyPageTheme({
  blocks,
  currentLogoHeader,
  currentFooter,
  theme,
}: {
  blocks: PageBlock[];
  currentLogoHeader?: Partial<LogoHeaderSettings>;
  currentFooter?: Partial<PageFooterSettings>;
  theme: PageThemeDefinition;
}): AppliedPageTheme {
  const frame = createAppliedPageThemeFrame({
    currentLogoHeader,
    currentFooter,
    theme,
  });

  return {
    blocks: applyPageThemeToBlocks(blocks, theme),
    ...frame,
  };
}

export async function applyPageThemeProgressively({
  blocks,
  currentLogoHeader,
  currentFooter,
  theme,
  onProgress,
}: {
  blocks: PageBlock[];
  currentLogoHeader?: Partial<LogoHeaderSettings>;
  currentFooter?: Partial<PageFooterSettings>;
  theme: PageThemeDefinition;
  onProgress?: (progress: PageThemeApplyProgress) => void;
}): Promise<AppliedPageTheme> {
  const report = (
    progress: number,
    label: string,
    extra: Partial<PageThemeApplyProgress> = {},
  ) => {
    onProgress?.({
      ...extra,
      progress: clampProgress(progress),
      label,
    });
  };

  report(8, "آماده‌سازی پالت رنگی");
  await waitForThemeApplyTurn();

  const frame = createAppliedPageThemeFrame({
    currentLogoHeader,
    currentFooter,
    theme,
  });

  report(16, "هماهنگ‌سازی هدر، فوتر و پس‌زمینه");
  await waitForThemeApplyTurn();

  const themedBlocks = await applyPageThemeToBlocksProgressively(
    blocks,
    theme,
    {
      onProgress: ({ completedBlocks, totalBlocks, progress }) => {
        report(
          18 + progress * 0.62,
          totalBlocks > 0
            ? `استایل‌دهی بلاک‌ها ${completedBlocks}/${totalBlocks}`
            : "استایل‌دهی بلاک‌ها",
          { completedBlocks, totalBlocks },
        );
      },
    },
  );

  report(100, "آماده‌سازی خروجی تم");
  await waitForThemeApplyTurn();

  return {
    blocks: themedBlocks,
    ...frame,
  };
}

export function normalizePageThemeDraft(
  value: PageThemeDefinition,
): PageThemeDefinition {
  const rawPalette = value.palette ?? {};
  const rawScale = value.scale ?? {};
  const palette = {
    base: rawPalette.base || "#ffffff",
    surface: rawPalette.surface || "#f8fafc",
    accent: rawPalette.accent || "#111827",
  };

  return {
    ...value,
    id: value.id || `custom-${Date.now()}`,
    name: value.name?.trim() || "تم سفارشی",
    palette,
    scale: {
      title: clamp(Number(rawScale.title) || MOBILE_SCALE.title, 14, 32),
      description: clamp(
        Number(rawScale.description) || MOBILE_SCALE.description,
        10,
        18,
      ),
      item: clamp(Number(rawScale.item) || MOBILE_SCALE.item, 10, 16),
      button: clamp(Number(rawScale.button) || MOBILE_SCALE.button, 10, 18),
      heroHeight: clamp(
        Number(rawScale.heroHeight) || MOBILE_SCALE.heroHeight,
        220,
        620,
      ),
      radius: clamp(Number(rawScale.radius) || MOBILE_SCALE.radius, 0, 48),
      logoHeaderHeight: clamp(
        Number(rawScale.logoHeaderHeight) || MOBILE_SCALE.logoHeaderHeight,
        110,
        360,
      ),
      logoSize: clamp(
        Number(rawScale.logoSize) || MOBILE_SCALE.logoSize,
        56,
        180,
      ),
    },
    logoVariant: value.logoVariant || "wave-soft",
    recipe: normalizeThemeRecipe(value.recipe),
    backgroundPattern: normalizePageBackgroundPattern(
      value.backgroundPattern,
      getDefaultThemePattern(value.id || "custom-theme", palette),
    ),
    custom: value.custom === true,
  };
}

export function loadCustomPageThemes(): PageThemeDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BUILDER_CUSTOM_THEMES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is PageThemeDefinition => Boolean(item?.id))
      .map((theme) => normalizePageThemeDraft({ ...theme, custom: true }));
  } catch {
    return [];
  }
}

export function saveCustomPageThemes(themes: PageThemeDefinition[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    BUILDER_CUSTOM_THEMES_KEY,
    JSON.stringify(
      themes.map((theme) =>
        normalizePageThemeDraft({ ...theme, custom: true }),
      ),
    ),
  );
}

export function createThemeDraftFrom(theme: PageThemeDefinition) {
  return cloneJson({
    ...theme,
    custom: theme.custom === true,
  });
}
