import type { CSSProperties } from "react";

export const PAGE_BACKGROUND_PATTERN_IDS = [
  "none",
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
] as const;

export type PageBackgroundPatternId =
  (typeof PAGE_BACKGROUND_PATTERN_IDS)[number];

export type PageBackgroundPattern = {
  id: PageBackgroundPatternId;
  color: string;
  secondaryColor: string;
  opacity: number;
  size: number;
};

export type PageBackgroundSettings = {
  color: string;
  image: string;
  pattern: PageBackgroundPattern;
};

export type PageBackgroundPatternOption = {
  id: PageBackgroundPatternId;
  label: string;
  description: string;
  defaultColor: string;
  defaultSecondaryColor?: string;
  defaultOpacity: number;
  defaultSize: number;
};

export const DEFAULT_PAGE_BACKGROUND_PATTERN: PageBackgroundPattern = {
  id: "none",
  color: "#0f172a",
  secondaryColor: "#ffffff",
  opacity: 0,
  size: 28,
};

export const PAGE_BACKGROUND_PATTERNS: PageBackgroundPatternOption[] = [
  {
    id: "none",
    label: "بدون پترن",
    description: "پس‌زمینه ساده",
    defaultColor: "#0f172a",
    defaultOpacity: 0,
    defaultSize: 28,
  },
  {
    id: "soft-grid",
    label: "شبکه نرم",
    description: "خطوط ظریف شبکه‌ای",
    defaultColor: "#0f172a",
    defaultOpacity: 0.07,
    defaultSize: 30,
  },
  {
    id: "duotone-blur",
    label: "بلور دو رنگ",
    description: "دو رنگ محو با نقطه‌های نرم",
    defaultColor: "#38bdf8",
    defaultSecondaryColor: "#f9a8d4",
    defaultOpacity: 0.2,
    defaultSize: 34,
  },
  {
    id: "halftone-gradient",
    label: "هافتون گرادینت",
    description: "گرادینت نرم با نقطه‌های محو",
    defaultColor: "#a78bfa",
    defaultSecondaryColor: "#67e8f9",
    defaultOpacity: 0.2,
    defaultSize: 22,
  },
  {
    id: "gradient-dots",
    label: "نقطه گرادینتی",
    description: "نقطه‌های رنگی روی گرادینت نرم",
    defaultColor: "#38bdf8",
    defaultSecondaryColor: "#f472b6",
    defaultOpacity: 0.18,
    defaultSize: 24,
  },
  {
    id: "orbital-circles",
    label: "دایره گرادینتی",
    description: "حلقه‌ها و دایره‌های محو روی گرادینت",
    defaultColor: "#8b5cf6",
    defaultSecondaryColor: "#22d3ee",
    defaultOpacity: 0.16,
    defaultSize: 42,
  },
  {
    id: "blurred-dots",
    label: "بلور نقطه‌ای",
    description: "لکه‌های نقطه‌ای محو با دو رنگ",
    defaultColor: "#fb7185",
    defaultSecondaryColor: "#60a5fa",
    defaultOpacity: 0.18,
    defaultSize: 36,
  },
  {
    id: "aurora-mesh",
    label: "مش شفقی",
    description: "لایه‌های رنگی نرم برای صفحات مدرن",
    defaultColor: "#22d3ee",
    defaultSecondaryColor: "#8b5cf6",
    defaultOpacity: 0.2,
    defaultSize: 44,
  },
  {
    id: "soft-spotlight",
    label: "اسپات‌لایت نرم",
    description: "نور مرکزی تمیز با هاله‌های دو رنگ",
    defaultColor: "#38bdf8",
    defaultSecondaryColor: "#14b8a6",
    defaultOpacity: 0.16,
    defaultSize: 34,
  },
  {
    id: "premium-rings",
    label: "حلقه لاکچری",
    description: "حلقه‌های ظریف برای برندهای پریمیوم",
    defaultColor: "#d97706",
    defaultSecondaryColor: "#1e40af",
    defaultOpacity: 0.14,
    defaultSize: 46,
  },
  {
    id: "silk-waves",
    label: "موج ابریشمی",
    description: "موج‌های لطیف و گرادینتی برای صفحات احساسی",
    defaultColor: "#fb7185",
    defaultSecondaryColor: "#c084fc",
    defaultOpacity: 0.18,
    defaultSize: 48,
  },
  {
    id: "dot-matrix",
    label: "نقطه‌ای",
    description: "نقطه‌های کوچک تکرارشونده",
    defaultColor: "#0f172a",
    defaultOpacity: 0.11,
    defaultSize: 18,
  },
  {
    id: "diagonal-lines",
    label: "مورب",
    description: "خطوط زاویه‌دار سبک",
    defaultColor: "#0f172a",
    defaultOpacity: 0.08,
    defaultSize: 18,
  },
  {
    id: "paper-speckles",
    label: "بافت کاغذی",
    description: "دانه‌های لطیف شبیه کاغذ",
    defaultColor: "#0f172a",
    defaultOpacity: 0.08,
    defaultSize: 24,
  },
  {
    id: "topography",
    label: "توپوگرافی",
    description: "حلقه‌های کانتوری آرام",
    defaultColor: "#0f172a",
    defaultOpacity: 0.08,
    defaultSize: 58,
  },
  {
    id: "plus-grid",
    label: "علامت مثبت",
    description: "علامت‌های مثبت کوچک",
    defaultColor: "#0f172a",
    defaultOpacity: 0.09,
    defaultSize: 28,
  },
  {
    id: "crosshatch",
    label: "هاشور",
    description: "خطوط ظریف بافت‌دار",
    defaultColor: "#0f172a",
    defaultOpacity: 0.06,
    defaultSize: 20,
  },
  {
    id: "vertical-rhythm",
    label: "ریتم عمودی",
    description: "خطوط راهنمای عمودی",
    defaultColor: "#0f172a",
    defaultOpacity: 0.06,
    defaultSize: 26,
  },
  {
    id: "calm-waves",
    label: "موج نرم",
    description: "بافت موجی ملایم",
    defaultColor: "#0f172a",
    defaultOpacity: 0.07,
    defaultSize: 46,
  },
  {
    id: "liquid-glass-aurora",
    label: "لیکویید گلس شفقی",
    description: "هاله‌های شفاف، نورهای محو و شکست نرم رنگ",
    defaultColor: "#7c3aed",
    defaultSecondaryColor: "#22d3ee",
    defaultOpacity: 0.2,
    defaultSize: 38,
  },
  {
    id: "prism-caustics",
    label: "کاستیک منشوری",
    description: "خطوط شکست نور و گرادینت‌های شیشه‌ای",
    defaultColor: "#ff4fd8",
    defaultSecondaryColor: "#7cffcb",
    defaultOpacity: 0.18,
    defaultSize: 34,
  },
  {
    id: "hologram-dots",
    label: "نقطه‌های هولوگرام",
    description: "نقطه‌های درخشان روی گرادینت هولوگرافیک",
    defaultColor: "#8b5cf6",
    defaultSecondaryColor: "#06b6d4",
    defaultOpacity: 0.18,
    defaultSize: 20,
  },
  {
    id: "chrome-ribbons",
    label: "روبان کرومی",
    description: "نوارهای سیال با برق شیشه‌ای و رنگ‌های تند",
    defaultColor: "#f97316",
    defaultSecondaryColor: "#ec4899",
    defaultOpacity: 0.18,
    defaultSize: 48,
  },
  {
    id: "fluid-orbs",
    label: "گوی‌های سیال",
    description: "حباب‌های بزرگ و نرم با حس لیکویید گلس",
    defaultColor: "#ccff00",
    defaultSecondaryColor: "#00e5ff",
    defaultOpacity: 0.17,
    defaultSize: 42,
  },
  {
    id: "cyber-noise",
    label: "نویز سایبری",
    description: "بافت دیجیتال ریز با هاله‌های نئونی",
    defaultColor: "#00f5d4",
    defaultSecondaryColor: "#f15bb5",
    defaultOpacity: 0.16,
    defaultSize: 18,
  },
  {
    id: "glass-mosaic",
    label: "موزاییک شیشه‌ای",
    description: "پنل‌های زاویه‌دار و نیمه‌شفاف روی گرادینت",
    defaultColor: "#a855f7",
    defaultSecondaryColor: "#facc15",
    defaultOpacity: 0.17,
    defaultSize: 44,
  },
  {
    id: "neon-fog-glass",
    label: "مه نئون شیشه‌ای",
    description: "مه سرد با هاله‌های نئون و لایه‌های شفاف",
    defaultColor: "#67e8f9",
    defaultSecondaryColor: "#8b5cf6",
    defaultOpacity: 0.18,
    defaultSize: 36,
  },
  {
    id: "arctic-mist-rings",
    label: "حلقه مه قطبی",
    description: "حلقه‌های یخی محو با نور آبی و یاسی",
    defaultColor: "#7dd3fc",
    defaultSecondaryColor: "#c4b5fd",
    defaultOpacity: 0.16,
    defaultSize: 46,
  },
  {
    id: "frosted-laser-grid",
    label: "گرید لیزری یخی",
    description: "خطوط لیزری ظریف روی شیشه مات و سرد",
    defaultColor: "#22d3ee",
    defaultSecondaryColor: "#818cf8",
    defaultOpacity: 0.14,
    defaultSize: 24,
  },
  {
    id: "polar-veil-orbs",
    label: "گوی‌های پرده قطبی",
    description: "گوی‌های نرم پشت پرده مه‌آلود گلس",
    defaultColor: "#a5f3fc",
    defaultSecondaryColor: "#60a5fa",
    defaultOpacity: 0.17,
    defaultSize: 42,
  },
  {
    id: "blue-vapor-noise",
    label: "بخار آبی نئونی",
    description: "بخار سرد با نویز ظریف و نور نئون",
    defaultColor: "#38bdf8",
    defaultSecondaryColor: "#a78bfa",
    defaultOpacity: 0.16,
    defaultSize: 18,
  },
];

const PATTERN_OPTIONS = new Map(
  PAGE_BACKGROUND_PATTERNS.map((pattern) => [pattern.id, pattern]),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isPageBackgroundPatternId(
  value: unknown,
): value is PageBackgroundPatternId {
  return (
    typeof value === "string" &&
    PAGE_BACKGROUND_PATTERN_IDS.includes(value as PageBackgroundPatternId)
  );
}

export function isValidPageBackgroundColor(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const color = value.trim();

  const isHex =
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
      color,
    );
  const isRgb =
    /^rgb\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*\)$/i.test(
      color,
    );
  const isRgba =
    /^rgba\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:0|1|0?\.\d+)\s*\)$/i.test(
      color,
    );

  return isHex || isRgb || isRgba;
}

function normalizeColor(value: unknown, fallback: string) {
  return isValidPageBackgroundColor(value) ? value.trim() : fallback;
}

function normalizeImageUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const image = value.trim();
  return /^https?:\/\//i.test(image) ? image : "";
}

function hexToRgb(value: string) {
  const hex = value.trim().replace("#", "");
  if (![3, 4, 6, 8].includes(hex.length)) return null;
  const normalized =
    hex.length === 3 || hex.length === 4
      ? hex
          .slice(0, 3)
          .split("")
          .map((part) => part + part)
          .join("")
      : hex.slice(0, 6);
  const int = Number.parseInt(normalized, 16);
  if (!Number.isFinite(int)) return null;
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function colorWithOpacity(color: string, opacity: number) {
  const normalizedOpacity = clamp(opacity, 0, 1);
  const rgb = hexToRgb(color);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedOpacity})`;
  }

  const rgbMatch = color.match(
    /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
  );
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${normalizedOpacity})`;
  }

  const rgbaMatch = color.match(
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(?:0|1|0?\.\d+)\s*\)$/i,
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${normalizedOpacity})`;
  }

  return color;
}

export function createPageBackgroundPattern(
  id: PageBackgroundPatternId,
  overrides: Partial<PageBackgroundPattern> = {},
): PageBackgroundPattern {
  const option = PATTERN_OPTIONS.get(id) ?? PATTERN_OPTIONS.get("none")!;
  return {
    id,
    color: normalizeColor(overrides.color, option.defaultColor),
    secondaryColor: normalizeColor(
      overrides.secondaryColor,
      option.defaultSecondaryColor ??
        DEFAULT_PAGE_BACKGROUND_PATTERN.secondaryColor,
    ),
    opacity: clamp(
      Number(overrides.opacity ?? option.defaultOpacity),
      id === "none" ? 0 : 0.02,
      0.28,
    ),
    size: Math.round(
      clamp(Number(overrides.size ?? option.defaultSize), 10, 96),
    ),
  };
}

export function normalizePageBackgroundPattern(
  value: unknown,
  fallback: PageBackgroundPattern = DEFAULT_PAGE_BACKGROUND_PATTERN,
): PageBackgroundPattern {
  const raw = isRecord(value) ? value : {};
  const id = isPageBackgroundPatternId(raw.id) ? raw.id : fallback.id;
  const opacity =
    typeof raw.opacity === "number" || typeof raw.opacity === "string"
      ? Number(raw.opacity)
      : fallback.opacity;
  const size =
    typeof raw.size === "number" || typeof raw.size === "string"
      ? Number(raw.size)
      : fallback.size;
  const fallbackSecondaryColor =
    typeof fallback.secondaryColor === "string"
      ? fallback.secondaryColor
      : DEFAULT_PAGE_BACKGROUND_PATTERN.secondaryColor;

  return createPageBackgroundPattern(id, {
    color: typeof raw.color === "string" ? raw.color : fallback.color,
    secondaryColor:
      typeof raw.secondaryColor === "string"
        ? raw.secondaryColor
        : fallbackSecondaryColor,
    opacity,
    size,
  });
}

export function normalizePageBackgroundSettings(
  value: unknown,
): PageBackgroundSettings {
  const background = isRecord(value) ? value : {};
  return {
    color: normalizeColor(background.color, "#ffffff"),
    image: normalizeImageUrl(background.image),
    pattern: normalizePageBackgroundPattern(background.pattern),
  };
}

type PatternLayers = {
  images: string[];
  sizes: string[];
  positions: string[];
  repeats: string[];
  attachments: string[];
};

function getPatternLayers(
  pattern: PageBackgroundPattern,
  baseColor = "#ffffff",
): PatternLayers {
  if (pattern.id === "none" || pattern.opacity <= 0) {
    return {
      images: [],
      sizes: [],
      positions: [],
      repeats: [],
      attachments: [],
    };
  }

  const size = Math.max(10, Math.round(pattern.size));
  const color = colorWithOpacity(pattern.color, pattern.opacity);
  const common = {
    positions: ["center"],
    repeats: ["repeat"],
    attachments: ["scroll"],
  };

  switch (pattern.id) {
    case "duotone-blur": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const top = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.5, 0.2, 0.86),
      );
      const topSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 2.2, 0.1, 0.48),
      );
      const bottom = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.8, 0.32, 0.96),
      );
      const bottomSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 2.4, 0.12, 0.52),
      );
      const dot = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 0.85, 0.04, 0.2),
      );

      return {
        images: [
          `radial-gradient(circle at 18% 12%, ${topSoft} 0, transparent 30%)`,
          `radial-gradient(circle at 78% 86%, ${bottomSoft} 0, transparent 34%)`,
          `radial-gradient(circle at 68% 22%, ${top} 0, transparent 24%)`,
          `radial-gradient(circle at 28% 76%, ${bottom} 0, transparent 30%)`,
          `radial-gradient(circle, ${dot} 0 1px, transparent 5px)`,
          `linear-gradient(180deg, ${top} 0%, ${colorWithOpacity(baseColor, 0.42)} 52%, ${bottom} 100%)`,
        ],
        sizes: [
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          `${size}px ${size}px`,
          "100% 100%",
        ],
        positions: ["center", "center", "center", "center", "0 0", "center"],
        repeats: [
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "halftone-gradient": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const dotGap = Math.max(12, size);
      const largeDotGap = Math.round(dotGap * 1.55);
      const top = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.2, 0.26, 0.84),
      );
      const topSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 2.7, 0.14, 0.58),
      );
      const bottom = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.5, 0.28, 0.88),
      );
      const bottomSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 2.8, 0.14, 0.6),
      );
      const centerGlow = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.8, 0.14, 0.44),
      );
      const dot = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.45, 0.12, 0.38),
      );
      const dotSoft = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.92, 0.08, 0.24),
      );
      const tintDot = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 0.55, 0.04, 0.14),
      );

      return {
        images: [
          `radial-gradient(circle, ${dot} 0 1.15px, transparent 1.85px)`,
          `radial-gradient(circle, ${dotSoft} 0 0.9px, transparent 1.7px)`,
          `radial-gradient(circle, ${tintDot} 0 1px, transparent 2.4px)`,
          `radial-gradient(circle at 50% 36%, ${centerGlow} 0, transparent 42%)`,
          `radial-gradient(circle at 12% 6%, ${topSoft} 0, transparent 34%)`,
          `radial-gradient(circle at 92% 10%, ${top} 0, transparent 30%)`,
          `radial-gradient(circle at 8% 90%, ${bottomSoft} 0, transparent 36%)`,
          `radial-gradient(circle at 92% 88%, ${bottom} 0, transparent 34%)`,
          `linear-gradient(145deg, ${top} 0%, ${colorWithOpacity(baseColor, 0.54)} 48%, ${bottom} 100%)`,
        ],
        sizes: [
          `${dotGap}px ${dotGap}px`,
          `${largeDotGap}px ${largeDotGap}px`,
          `${Math.round(dotGap * 1.25)}px ${Math.round(dotGap * 1.25)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(dotGap / 2)}px ${Math.round(dotGap / 3)}px`,
          `${Math.round(dotGap / 4)}px ${Math.round(dotGap / 2)}px`,
          "center",
          "center",
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "gradient-dots": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const dotGap = Math.max(14, size);
      const top = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4, 0.24, 0.78),
      );
      const topSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 2.3, 0.12, 0.48),
      );
      const bottom = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.2, 0.26, 0.82),
      );
      const bottomSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 2.5, 0.12, 0.52),
      );
      const brightDot = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.2, 0.1, 0.3),
      );
      const colorDot = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.15, 0.08, 0.28),
      );
      const secondDot = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.05, 0.08, 0.26),
      );

      return {
        images: [
          `radial-gradient(circle, ${brightDot} 0 1px, transparent 2px)`,
          `radial-gradient(circle, ${colorDot} 0 1.4px, transparent 3px)`,
          `radial-gradient(circle, ${secondDot} 0 1.2px, transparent 2.8px)`,
          `radial-gradient(circle at 20% 18%, ${topSoft} 0, transparent 34%)`,
          `radial-gradient(circle at 82% 82%, ${bottomSoft} 0, transparent 36%)`,
          `linear-gradient(135deg, ${top} 0%, ${colorWithOpacity(baseColor, 0.58)} 52%, ${bottom} 100%)`,
        ],
        sizes: [
          `${dotGap}px ${dotGap}px`,
          `${Math.round(dotGap * 1.6)}px ${Math.round(dotGap * 1.6)}px`,
          `${Math.round(dotGap * 1.25)}px ${Math.round(dotGap * 1.25)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(dotGap / 2)}px ${Math.round(dotGap / 3)}px`,
          `${Math.round(dotGap / 4)}px ${Math.round(dotGap / 2)}px`,
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "orbital-circles": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const circleSize = Math.max(30, size);
      const ring = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.05, 0.06, 0.24),
      );
      const ringSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 0.9, 0.05, 0.2),
      );
      const top = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.4, 0.2, 0.7),
      );
      const bottom = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.8, 0.22, 0.76),
      );
      const glow = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.15, 0.08, 0.28),
      );

      return {
        images: [
          `repeating-radial-gradient(circle at 50% 50%, transparent 0 ${Math.round(circleSize * 0.22)}px, ${ring} ${Math.round(circleSize * 0.24)}px ${Math.round(circleSize * 0.27)}px, transparent ${Math.round(circleSize * 0.29)}px ${Math.round(circleSize * 0.5)}px)`,
          `repeating-radial-gradient(circle at 45% 55%, transparent 0 ${Math.round(circleSize * 0.18)}px, ${ringSoft} ${Math.round(circleSize * 0.2)}px ${Math.round(circleSize * 0.23)}px, transparent ${Math.round(circleSize * 0.25)}px ${Math.round(circleSize * 0.48)}px)`,
          `radial-gradient(circle at 48% 40%, ${glow} 0, transparent 38%)`,
          `radial-gradient(circle at 16% 20%, ${top} 0, transparent 34%)`,
          `radial-gradient(circle at 84% 78%, ${bottom} 0, transparent 36%)`,
          `linear-gradient(155deg, ${colorWithOpacity(baseColor, 0.72)} 0%, ${top} 42%, ${bottom} 100%)`,
        ],
        sizes: [
          `${circleSize * 2}px ${circleSize * 2}px`,
          `${Math.round(circleSize * 1.45)}px ${Math.round(circleSize * 1.45)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(circleSize / 2)}px 0`,
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "blurred-dots": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const blobSize = Math.max(22, size);
      const top = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.4, 0.24, 0.84),
      );
      const topSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 2.2, 0.12, 0.5),
      );
      const bottom = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.6, 0.26, 0.86),
      );
      const bottomSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 2.4, 0.12, 0.54),
      );
      const mist = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.4, 0.1, 0.34),
      );
      const smallDot = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.85, 0.06, 0.22),
      );

      return {
        images: [
          `radial-gradient(circle, ${smallDot} 0 1px, transparent 3px)`,
          `radial-gradient(circle at 12% 16%, ${top} 0, transparent 14%)`,
          `radial-gradient(circle at 32% 68%, ${topSoft} 0, transparent 18%)`,
          `radial-gradient(circle at 82% 18%, ${bottomSoft} 0, transparent 20%)`,
          `radial-gradient(circle at 78% 78%, ${bottom} 0, transparent 16%)`,
          `radial-gradient(circle at 52% 44%, ${mist} 0, transparent 34%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.78)} 0%, ${topSoft} 48%, ${bottomSoft} 100%)`,
        ],
        sizes: [
          `${blobSize}px ${blobSize}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          "center",
          "center",
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "aurora-mesh": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.6, 0.26, 0.86),
      );
      const firstSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 2.2, 0.12, 0.5),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.4, 0.24, 0.84),
      );
      const secondSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 2.3, 0.12, 0.52),
      );
      const whiteMist = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.25, 0.08, 0.28),
      );
      const meshLine = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 0.45, 0.03, 0.12),
      );

      return {
        images: [
          `linear-gradient(115deg, transparent 0 36%, ${meshLine} 36.5% 37%, transparent 37.5% 100%)`,
          `linear-gradient(25deg, transparent 0 42%, ${meshLine} 42.5% 43%, transparent 43.5% 100%)`,
          `radial-gradient(circle at 18% 18%, ${first} 0, transparent 30%)`,
          `radial-gradient(circle at 78% 14%, ${secondSoft} 0, transparent 28%)`,
          `radial-gradient(circle at 20% 82%, ${second} 0, transparent 34%)`,
          `radial-gradient(circle at 82% 76%, ${firstSoft} 0, transparent 32%)`,
          `radial-gradient(circle at 52% 42%, ${whiteMist} 0, transparent 38%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.82)} 0%, ${firstSoft} 48%, ${secondSoft} 100%)`,
        ],
        sizes: [
          `${size * 3}px ${size * 3}px`,
          `${size * 2}px ${size * 2}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(size / 2)}px ${Math.round(size / 3)}px`,
          "center",
          "center",
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "soft-spotlight": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const glow = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.8, 0.14, 0.42),
      );
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.5, 0.2, 0.72),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.6, 0.2, 0.74),
      );
      const speck = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.95, 0.06, 0.2),
      );

      return {
        images: [
          `radial-gradient(circle, ${speck} 0 1px, transparent 2.5px)`,
          `radial-gradient(circle at 50% 28%, ${glow} 0, transparent 36%)`,
          `radial-gradient(circle at 16% 16%, ${first} 0, transparent 28%)`,
          `radial-gradient(circle at 86% 80%, ${second} 0, transparent 32%)`,
          `linear-gradient(180deg, ${colorWithOpacity(baseColor, 0.9)} 0%, ${colorWithOpacity(baseColor, 0.62)} 56%, ${second} 100%)`,
        ],
        sizes: [
          `${Math.max(18, size)}px ${Math.max(18, size)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: ["0 0", "center", "center", "center", "center"],
        repeats: ["repeat", "no-repeat", "no-repeat", "no-repeat", "no-repeat"],
        attachments: ["scroll", "scroll", "scroll", "scroll", "scroll"],
      };
    }
    case "premium-rings": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const ringSize = Math.max(38, size);
      const ring = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.25, 0.08, 0.26),
      );
      const ringSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 0.9, 0.05, 0.2),
      );
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.2, 0.18, 0.64),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.2, 0.18, 0.66),
      );

      return {
        images: [
          `radial-gradient(circle at 18% 24%, transparent 0 ${Math.round(ringSize * 0.54)}px, ${ring} ${Math.round(ringSize * 0.56)}px ${Math.round(ringSize * 0.59)}px, transparent ${Math.round(ringSize * 0.62)}px)`,
          `radial-gradient(circle at 86% 68%, transparent 0 ${Math.round(ringSize * 0.68)}px, ${ringSoft} ${Math.round(ringSize * 0.7)}px ${Math.round(ringSize * 0.74)}px, transparent ${Math.round(ringSize * 0.78)}px)`,
          `repeating-radial-gradient(circle at 50% 50%, transparent 0 ${Math.round(ringSize * 0.32)}px, ${ring} ${Math.round(ringSize * 0.34)}px ${Math.round(ringSize * 0.36)}px, transparent ${Math.round(ringSize * 0.38)}px ${Math.round(ringSize * 0.72)}px)`,
          `radial-gradient(circle at 18% 12%, ${first} 0, transparent 30%)`,
          `radial-gradient(circle at 82% 86%, ${second} 0, transparent 34%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.88)} 0%, ${first} 48%, ${second} 100%)`,
        ],
        sizes: [
          "100% 100%",
          "100% 100%",
          `${ringSize * 2}px ${ringSize * 2}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: ["center", "center", "0 0", "center", "center", "center"],
        repeats: [
          "no-repeat",
          "no-repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "silk-waves": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const waveSize = Math.max(30, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.8, 0.22, 0.76),
      );
      const firstSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.8, 0.1, 0.42),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.8, 0.22, 0.78),
      );
      const secondSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.9, 0.1, 0.44),
      );
      const waveLine = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.72, 0.05, 0.18),
      );

      return {
        images: [
          `radial-gradient(ellipse at 50% 120%, transparent 0 ${Math.round(waveSize * 0.5)}px, ${waveLine} ${Math.round(waveSize * 0.52)}px ${Math.round(waveSize * 0.56)}px, transparent ${Math.round(waveSize * 0.58)}px)`,
          `radial-gradient(ellipse at 50% -20%, transparent 0 ${Math.round(waveSize * 0.44)}px, ${waveLine} ${Math.round(waveSize * 0.46)}px ${Math.round(waveSize * 0.5)}px, transparent ${Math.round(waveSize * 0.52)}px)`,
          `radial-gradient(circle at 18% 22%, ${first} 0, transparent 34%)`,
          `radial-gradient(circle at 82% 72%, ${second} 0, transparent 36%)`,
          `linear-gradient(135deg, ${firstSoft} 0%, ${colorWithOpacity(baseColor, 0.76)} 52%, ${secondSoft} 100%)`,
        ],
        sizes: [
          `${waveSize * 2}px ${waveSize}px`,
          `${Math.round(waveSize * 1.6)}px ${Math.round(waveSize * 0.82)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(waveSize / 2)}px ${Math.round(waveSize / 3)}px`,
          "center",
          "center",
          "center",
        ],
        repeats: ["repeat", "repeat", "no-repeat", "no-repeat", "no-repeat"],
        attachments: ["scroll", "scroll", "scroll", "scroll", "scroll"],
      };
    }
    case "liquid-glass-aurora": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.6, 0.28, 0.9),
      );
      const firstSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 2.4, 0.12, 0.54),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.2, 0.24, 0.84),
      );
      const secondSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 2.2, 0.12, 0.5),
      );
      const glass = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.55, 0.12, 0.36),
      );
      const edge = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.7, 0.05, 0.16),
      );

      return {
        images: [
          `linear-gradient(118deg, transparent 0 18%, ${edge} 19% 20%, transparent 21% 52%, ${edge} 53% 54%, transparent 55% 100%)`,
          `conic-gradient(from 210deg at 54% 42%, transparent 0 18%, ${glass} 22%, transparent 30%, ${secondSoft} 48%, transparent 62%, ${firstSoft} 78%, transparent 100%)`,
          `radial-gradient(circle at 18% 14%, ${first} 0, transparent 30%)`,
          `radial-gradient(circle at 84% 18%, ${secondSoft} 0, transparent 28%)`,
          `radial-gradient(circle at 24% 82%, ${second} 0, transparent 34%)`,
          `radial-gradient(circle at 76% 78%, ${firstSoft} 0, transparent 36%)`,
          `radial-gradient(circle, ${edge} 0 1px, transparent 4px)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.86)} 0%, ${firstSoft} 48%, ${secondSoft} 100%)`,
        ],
        sizes: [
          `${size * 4}px ${size * 4}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          `${Math.max(18, size)}px ${Math.max(18, size)}px`,
          "100% 100%",
        ],
        positions: [
          "0 0",
          "center",
          "center",
          "center",
          "center",
          "center",
          "0 0",
          "center",
        ],
        repeats: [
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "prism-caustics": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const prism = Math.max(18, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.3, 0.24, 0.84),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4, 0.22, 0.78),
      );
      const firstLine = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.1, 0.07, 0.24),
      );
      const secondLine = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.05, 0.07, 0.24),
      );
      const shine = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.3, 0.1, 0.3),
      );

      return {
        images: [
          `repeating-linear-gradient(118deg, transparent 0 ${Math.round(prism * 0.9)}px, ${firstLine} ${Math.round(prism * 0.95)}px ${Math.round(prism * 1.02)}px, transparent ${Math.round(prism * 1.08)}px ${Math.round(prism * 2.1)}px)`,
          `repeating-linear-gradient(32deg, transparent 0 ${Math.round(prism * 1.2)}px, ${secondLine} ${Math.round(prism * 1.25)}px ${Math.round(prism * 1.34)}px, transparent ${Math.round(prism * 1.42)}px ${Math.round(prism * 2.4)}px)`,
          `linear-gradient(64deg, transparent 0 34%, ${shine} 35% 37%, transparent 38% 100%)`,
          `radial-gradient(circle at 14% 18%, ${first} 0, transparent 30%)`,
          `radial-gradient(circle at 86% 78%, ${second} 0, transparent 34%)`,
          `linear-gradient(135deg, ${colorWithOpacity(baseColor, 0.86)} 0%, ${colorWithOpacity(pattern.color, 0.2)} 50%, ${colorWithOpacity(secondaryColor, 0.2)} 100%)`,
        ],
        sizes: [
          `${prism * 3}px ${prism * 3}px`,
          `${Math.round(prism * 2.5)}px ${Math.round(prism * 2.5)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(prism / 2)}px ${Math.round(prism / 3)}px`,
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: ["scroll", "scroll", "scroll", "scroll", "scroll", "scroll"],
      };
    }
    case "hologram-dots": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const dotGap = Math.max(14, size);
      const dot = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.35, 0.1, 0.34),
      );
      const firstDot = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.2, 0.08, 0.28),
      );
      const secondDot = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.15, 0.08, 0.28),
      );
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.8, 0.22, 0.74),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.8, 0.22, 0.74),
      );
      const scan = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.65, 0.04, 0.15),
      );

      return {
        images: [
          `repeating-linear-gradient(180deg, transparent 0 ${Math.round(dotGap * 0.72)}px, ${scan} ${Math.round(dotGap * 0.75)}px ${Math.round(dotGap * 0.82)}px, transparent ${Math.round(dotGap * 0.88)}px ${dotGap}px)`,
          `radial-gradient(circle, ${dot} 0 1px, transparent 2.2px)`,
          `radial-gradient(circle, ${firstDot} 0 1.2px, transparent 2.8px)`,
          `radial-gradient(circle, ${secondDot} 0 1.2px, transparent 2.8px)`,
          `conic-gradient(from 160deg at 50% 48%, ${first} 0 14%, transparent 24%, ${second} 48%, transparent 62%, ${first} 84%, transparent 100%)`,
          `radial-gradient(circle at 50% 36%, ${colorWithOpacity("#ffffff", 0.2)} 0, transparent 36%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.78)} 0%, ${colorWithOpacity(pattern.color, 0.2)} 48%, ${colorWithOpacity(secondaryColor, 0.18)} 100%)`,
        ],
        sizes: [
          `${dotGap}px ${dotGap}px`,
          `${dotGap}px ${dotGap}px`,
          `${Math.round(dotGap * 1.55)}px ${Math.round(dotGap * 1.55)}px`,
          `${Math.round(dotGap * 1.9)}px ${Math.round(dotGap * 1.9)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          "0 0",
          `${Math.round(dotGap / 2)}px ${Math.round(dotGap / 3)}px`,
          `${Math.round(dotGap / 4)}px ${Math.round(dotGap / 2)}px`,
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "chrome-ribbons": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const ribbon = Math.max(34, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.4, 0.24, 0.86),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.1, 0.22, 0.82),
      );
      const firstSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.9, 0.1, 0.44),
      );
      const secondSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.9, 0.1, 0.44),
      );
      const glass = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.2, 0.09, 0.28),
      );

      return {
        images: [
          `linear-gradient(128deg, transparent 0 13%, ${firstSoft} 14% 24%, ${glass} 25% 27%, transparent 28% 100%)`,
          `linear-gradient(318deg, transparent 0 16%, ${secondSoft} 17% 30%, ${glass} 31% 33%, transparent 34% 100%)`,
          `radial-gradient(ellipse at 20% 20%, ${first} 0, transparent 32%)`,
          `radial-gradient(ellipse at 82% 82%, ${second} 0, transparent 34%)`,
          `radial-gradient(circle at 64% 30%, ${glass} 0, transparent 20%)`,
          `linear-gradient(135deg, ${colorWithOpacity(baseColor, 0.84)} 0%, ${firstSoft} 46%, ${secondSoft} 100%)`,
        ],
        sizes: [
          `${ribbon * 4}px ${ribbon * 4}px`,
          `${Math.round(ribbon * 3.5)}px ${Math.round(ribbon * 3.5)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(ribbon / 2)}px 0`,
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: ["scroll", "scroll", "scroll", "scroll", "scroll", "scroll"],
      };
    }
    case "fluid-orbs": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const orbSize = Math.max(28, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.4, 0.25, 0.86),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4.3, 0.24, 0.84),
      );
      const firstRing = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 0.95, 0.06, 0.22),
      );
      const secondRing = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 0.9, 0.06, 0.22),
      );
      const glass = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.45, 0.1, 0.34),
      );

      return {
        images: [
          `radial-gradient(circle at 18% 22%, ${glass} 0 4%, transparent 5% 100%)`,
          `radial-gradient(circle at 18% 22%, ${first} 0, transparent 28%)`,
          `radial-gradient(circle at 78% 18%, ${second} 0, transparent 26%)`,
          `radial-gradient(circle at 30% 78%, ${second} 0, transparent 30%)`,
          `radial-gradient(circle at 82% 78%, ${first} 0, transparent 34%)`,
          `repeating-radial-gradient(circle at 50% 50%, transparent 0 ${Math.round(orbSize * 0.38)}px, ${firstRing} ${Math.round(orbSize * 0.4)}px ${Math.round(orbSize * 0.44)}px, transparent ${Math.round(orbSize * 0.46)}px ${Math.round(orbSize * 0.9)}px)`,
          `repeating-radial-gradient(circle at 45% 55%, transparent 0 ${Math.round(orbSize * 0.3)}px, ${secondRing} ${Math.round(orbSize * 0.32)}px ${Math.round(orbSize * 0.36)}px, transparent ${Math.round(orbSize * 0.38)}px ${Math.round(orbSize * 0.82)}px)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.84)} 0%, ${colorWithOpacity(pattern.color, 0.14)} 48%, ${colorWithOpacity(secondaryColor, 0.16)} 100%)`,
        ],
        sizes: [
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          `${orbSize * 2}px ${orbSize * 2}px`,
          `${Math.round(orbSize * 1.55)}px ${Math.round(orbSize * 1.55)}px`,
          "100% 100%",
        ],
        positions: [
          "center",
          "center",
          "center",
          "center",
          "center",
          "0 0",
          `${Math.round(orbSize / 2)}px ${Math.round(orbSize / 3)}px`,
          "center",
        ],
        repeats: [
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "repeat",
          "repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "cyber-noise": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const pixel = Math.max(12, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.2, 0.22, 0.8),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 4, 0.22, 0.78),
      );
      const line = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 0.85, 0.05, 0.2),
      );
      const dot = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.1, 0.07, 0.25),
      );
      const scan = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.45, 0.03, 0.1),
      );

      return {
        images: [
          `linear-gradient(${line} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          `radial-gradient(circle, ${dot} 0 1px, transparent 2.5px)`,
          `repeating-linear-gradient(180deg, transparent 0 ${Math.round(pixel * 0.65)}px, ${scan} ${Math.round(pixel * 0.68)}px ${Math.round(pixel * 0.72)}px, transparent ${Math.round(pixel * 0.75)}px ${pixel}px)`,
          `radial-gradient(circle at 14% 18%, ${first} 0, transparent 28%)`,
          `radial-gradient(circle at 86% 82%, ${second} 0, transparent 32%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.9)} 0%, ${colorWithOpacity(pattern.color, 0.18)} 46%, ${colorWithOpacity(secondaryColor, 0.18)} 100%)`,
        ],
        sizes: [
          `${pixel}px ${pixel}px`,
          `${pixel}px ${pixel}px`,
          `${Math.round(pixel * 1.65)}px ${Math.round(pixel * 1.65)}px`,
          `${pixel}px ${pixel}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "center",
          "center",
          `${Math.round(pixel / 2)}px ${Math.round(pixel / 3)}px`,
          "0 0",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "glass-mosaic": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const tile = Math.max(24, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.8, 0.22, 0.76),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.8, 0.22, 0.76),
      );
      const firstPanel = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.25, 0.08, 0.3),
      );
      const secondPanel = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.2, 0.08, 0.28),
      );
      const edge = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.8, 0.05, 0.18),
      );

      return {
        images: [
          `linear-gradient(135deg, ${firstPanel} 0 12%, transparent 13% 100%)`,
          `linear-gradient(45deg, transparent 0 60%, ${secondPanel} 61% 78%, transparent 79% 100%)`,
          `linear-gradient(120deg, transparent 0 48%, ${edge} 49% 50%, transparent 51% 100%)`,
          `linear-gradient(30deg, transparent 0 36%, ${edge} 37% 38%, transparent 39% 100%)`,
          `radial-gradient(circle at 18% 18%, ${first} 0, transparent 30%)`,
          `radial-gradient(circle at 82% 78%, ${second} 0, transparent 34%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.86)} 0%, ${colorWithOpacity(pattern.color, 0.16)} 50%, ${colorWithOpacity(secondaryColor, 0.16)} 100%)`,
        ],
        sizes: [
          `${tile * 2}px ${tile * 2}px`,
          `${tile * 2}px ${tile * 2}px`,
          `${tile * 3}px ${tile * 3}px`,
          `${Math.round(tile * 2.5)}px ${Math.round(tile * 2.5)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${tile}px ${Math.round(tile / 2)}px`,
          "0 0",
          `${Math.round(tile / 2)}px ${Math.round(tile / 3)}px`,
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "neon-fog-glass": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const fogSize = Math.max(24, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4.4, 0.24, 0.84),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.8, 0.2, 0.74),
      );
      const firstMist = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.9, 0.1, 0.44),
      );
      const secondMist = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.8, 0.1, 0.42),
      );
      const glass = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.25, 0.09, 0.28),
      );
      const sparkle = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.75, 0.05, 0.16),
      );

      return {
        images: [
          `linear-gradient(128deg, transparent 0 18%, ${glass} 19% 20%, transparent 21% 54%, ${glass} 55% 56%, transparent 57% 100%)`,
          `radial-gradient(circle at 16% 18%, ${first} 0, transparent 28%)`,
          `radial-gradient(circle at 84% 14%, ${secondMist} 0, transparent 30%)`,
          `radial-gradient(circle at 28% 82%, ${second} 0, transparent 34%)`,
          `radial-gradient(circle at 78% 78%, ${firstMist} 0, transparent 34%)`,
          `radial-gradient(circle at 50% 42%, ${colorWithOpacity("#ffffff", 0.16)} 0, transparent 38%)`,
          `radial-gradient(circle, ${sparkle} 0 1px, transparent 4px)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.88)} 0%, ${firstMist} 48%, ${secondMist} 100%)`,
        ],
        sizes: [
          `${fogSize * 4}px ${fogSize * 4}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          `${fogSize}px ${fogSize}px`,
          "100% 100%",
        ],
        positions: [
          "0 0",
          "center",
          "center",
          "center",
          "center",
          "center",
          "0 0",
          "center",
        ],
        repeats: [
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "arctic-mist-rings": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const ringSize = Math.max(34, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.7, 0.2, 0.72),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.5, 0.2, 0.7),
      );
      const ring = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 0.95, 0.06, 0.22),
      );
      const ringSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 0.8, 0.05, 0.18),
      );
      const frost = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.2, 0.09, 0.28),
      );

      return {
        images: [
          `repeating-radial-gradient(circle at 50% 50%, transparent 0 ${Math.round(ringSize * 0.34)}px, ${ring} ${Math.round(ringSize * 0.36)}px ${Math.round(ringSize * 0.39)}px, transparent ${Math.round(ringSize * 0.41)}px ${Math.round(ringSize * 0.86)}px)`,
          `repeating-radial-gradient(circle at 44% 58%, transparent 0 ${Math.round(ringSize * 0.28)}px, ${ringSoft} ${Math.round(ringSize * 0.3)}px ${Math.round(ringSize * 0.34)}px, transparent ${Math.round(ringSize * 0.36)}px ${Math.round(ringSize * 0.78)}px)`,
          `radial-gradient(circle at 18% 16%, ${first} 0, transparent 30%)`,
          `radial-gradient(circle at 82% 78%, ${second} 0, transparent 34%)`,
          `radial-gradient(circle at 54% 38%, ${frost} 0, transparent 36%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.9)} 0%, ${colorWithOpacity(pattern.color, 0.16)} 46%, ${colorWithOpacity(secondaryColor, 0.16)} 100%)`,
        ],
        sizes: [
          `${ringSize * 2}px ${ringSize * 2}px`,
          `${Math.round(ringSize * 1.6)}px ${Math.round(ringSize * 1.6)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          `${Math.round(ringSize / 2)}px ${Math.round(ringSize / 3)}px`,
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: ["scroll", "scroll", "scroll", "scroll", "scroll", "scroll"],
      };
    }
    case "frosted-laser-grid": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const grid = Math.max(14, size);
      const line = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 0.95, 0.05, 0.22),
      );
      const secondLine = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 0.9, 0.05, 0.2),
      );
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.8, 0.2, 0.74),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.5, 0.2, 0.7),
      );
      const shine = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.85, 0.05, 0.18),
      );

      return {
        images: [
          `linear-gradient(${line} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          `repeating-linear-gradient(128deg, transparent 0 ${Math.round(grid * 2)}px, ${secondLine} ${Math.round(grid * 2.05)}px ${Math.round(grid * 2.16)}px, transparent ${Math.round(grid * 2.22)}px ${Math.round(grid * 4)}px)`,
          `linear-gradient(54deg, transparent 0 32%, ${shine} 33% 34%, transparent 35% 100%)`,
          `radial-gradient(circle at 14% 18%, ${first} 0, transparent 26%)`,
          `radial-gradient(circle at 84% 82%, ${second} 0, transparent 30%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.9)} 0%, ${colorWithOpacity(pattern.color, 0.16)} 48%, ${colorWithOpacity(secondaryColor, 0.16)} 100%)`,
        ],
        sizes: [
          `${grid}px ${grid}px`,
          `${grid}px ${grid}px`,
          `${grid * 4}px ${grid * 4}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "center",
          "center",
          "0 0",
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "polar-veil-orbs": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const orbSize = Math.max(28, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 3.8, 0.2, 0.74),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.9, 0.22, 0.76),
      );
      const firstSoft = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.6, 0.09, 0.38),
      );
      const secondSoft = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.55, 0.09, 0.36),
      );
      const veil = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 1.45, 0.1, 0.32),
      );

      return {
        images: [
          `radial-gradient(circle at 16% 18%, ${first} 0, transparent 24%)`,
          `radial-gradient(circle at 82% 22%, ${secondSoft} 0, transparent 28%)`,
          `radial-gradient(circle at 28% 78%, ${second} 0, transparent 30%)`,
          `radial-gradient(circle at 82% 78%, ${firstSoft} 0, transparent 34%)`,
          `radial-gradient(circle at 52% 44%, ${veil} 0, transparent 38%)`,
          `radial-gradient(circle, ${colorWithOpacity("#ffffff", clamp(pattern.opacity * 0.6, 0.04, 0.14))} 0 1px, transparent 4px)`,
          `linear-gradient(180deg, ${colorWithOpacity(baseColor, 0.92)} 0%, ${colorWithOpacity(pattern.color, 0.14)} 48%, ${colorWithOpacity(secondaryColor, 0.16)} 100%)`,
        ],
        sizes: [
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
          `${orbSize}px ${orbSize}px`,
          "100% 100%",
        ],
        positions: ["center", "center", "center", "center", "center", "0 0", "center"],
        repeats: [
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "blue-vapor-noise": {
      const secondaryColor = pattern.secondaryColor || baseColor;
      const noise = Math.max(12, size);
      const first = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 4, 0.22, 0.78),
      );
      const second = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 3.6, 0.2, 0.72),
      );
      const vapor = colorWithOpacity(
        pattern.color,
        clamp(pattern.opacity * 1.25, 0.08, 0.3),
      );
      const vaporSecond = colorWithOpacity(
        secondaryColor,
        clamp(pattern.opacity * 1.15, 0.08, 0.28),
      );
      const speck = colorWithOpacity(
        "#ffffff",
        clamp(pattern.opacity * 0.7, 0.04, 0.15),
      );

      return {
        images: [
          `radial-gradient(circle, ${speck} 0 1px, transparent 2.4px)`,
          `repeating-linear-gradient(162deg, transparent 0 ${Math.round(noise * 2.4)}px, ${vapor} ${Math.round(noise * 2.5)}px ${Math.round(noise * 2.9)}px, transparent ${Math.round(noise * 3)}px ${Math.round(noise * 5.6)}px)`,
          `repeating-linear-gradient(24deg, transparent 0 ${Math.round(noise * 3)}px, ${vaporSecond} ${Math.round(noise * 3.1)}px ${Math.round(noise * 3.55)}px, transparent ${Math.round(noise * 3.7)}px ${Math.round(noise * 6)}px)`,
          `radial-gradient(circle at 18% 16%, ${first} 0, transparent 30%)`,
          `radial-gradient(circle at 82% 78%, ${second} 0, transparent 34%)`,
          `radial-gradient(circle at 52% 42%, ${colorWithOpacity("#ffffff", 0.13)} 0, transparent 36%)`,
          `linear-gradient(145deg, ${colorWithOpacity(baseColor, 0.9)} 0%, ${colorWithOpacity(pattern.color, 0.16)} 48%, ${colorWithOpacity(secondaryColor, 0.16)} 100%)`,
        ],
        sizes: [
          `${noise}px ${noise}px`,
          `${noise * 6}px ${noise * 6}px`,
          `${Math.round(noise * 5)}px ${Math.round(noise * 5)}px`,
          "100% 100%",
          "100% 100%",
          "100% 100%",
          "100% 100%",
        ],
        positions: [
          "0 0",
          "0 0",
          `${Math.round(noise / 2)}px ${Math.round(noise / 3)}px`,
          "center",
          "center",
          "center",
          "center",
        ],
        repeats: [
          "repeat",
          "repeat",
          "repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
          "no-repeat",
        ],
        attachments: [
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
          "scroll",
        ],
      };
    }
    case "soft-grid":
      return {
        images: [
          `linear-gradient(${color} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        ],
        sizes: [`${size}px ${size}px`, `${size}px ${size}px`],
        positions: ["center", "center"],
        repeats: ["repeat", "repeat"],
        attachments: ["scroll", "scroll"],
      };
    case "dot-matrix":
      return {
        images: [`radial-gradient(circle, ${color} 1px, transparent 1.5px)`],
        sizes: [`${size}px ${size}px`],
        ...common,
      };
    case "diagonal-lines":
      return {
        images: [
          `repeating-linear-gradient(135deg, ${color} 0 1px, transparent 1px ${size}px)`,
        ],
        sizes: [`${size}px ${size}px`],
        ...common,
      };
    case "paper-speckles":
      return {
        images: [
          `radial-gradient(circle at 20% 30%, ${color} 0 1px, transparent 1.5px)`,
          `radial-gradient(circle at 80% 70%, ${color} 0 1px, transparent 1.5px)`,
        ],
        sizes: [`${size}px ${size}px`, `${size + 11}px ${size + 11}px`],
        positions: [
          "0 0",
          `${Math.round(size / 2)}px ${Math.round(size / 3)}px`,
        ],
        repeats: ["repeat", "repeat"],
        attachments: ["scroll", "scroll"],
      };
    case "topography":
      return {
        images: [
          `repeating-radial-gradient(circle at 50% 50%, ${color} 0 1px, transparent 1px ${Math.max(12, Math.round(size / 2))}px)`,
        ],
        sizes: [`${size}px ${size}px`],
        ...common,
      };
    case "plus-grid":
      return {
        images: [
          `linear-gradient(${color} 0 0)`,
          `linear-gradient(${color} 0 0)`,
        ],
        sizes: [
          `1px ${Math.round(size / 3)}px`,
          `${Math.round(size / 3)}px 1px`,
        ],
        positions: ["center", "center"],
        repeats: ["repeat", "repeat"],
        attachments: ["scroll", "scroll"],
      };
    case "crosshatch":
      return {
        images: [
          `repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px ${size}px)`,
          `repeating-linear-gradient(135deg, ${color} 0 1px, transparent 1px ${size}px)`,
        ],
        sizes: [`${size}px ${size}px`, `${size}px ${size}px`],
        positions: ["center", "center"],
        repeats: ["repeat", "repeat"],
        attachments: ["scroll", "scroll"],
      };
    case "vertical-rhythm":
      return {
        images: [
          `repeating-linear-gradient(90deg, ${color} 0 1px, transparent 1px ${size}px)`,
        ],
        sizes: [`${size}px ${size}px`],
        ...common,
      };
    case "calm-waves":
      return {
        images: [
          `radial-gradient(ellipse at 50% 100%, transparent 0 ${Math.round(size * 0.28)}px, ${color} ${Math.round(size * 0.3)}px ${Math.round(size * 0.32)}px, transparent ${Math.round(size * 0.34)}px)`,
        ],
        sizes: [`${size}px ${size}px`],
        positions: ["center"],
        repeats: ["repeat"],
        attachments: ["scroll"],
      };
    default:
      return {
        images: [],
        sizes: [],
        positions: [],
        repeats: [],
        attachments: [],
      };
  }
}

export function getPageBackgroundStyle(
  value: unknown,
  options: { fixedImage?: boolean } = {},
): CSSProperties {
  const background = normalizePageBackgroundSettings(value);
  const layers = getPatternLayers(background.pattern, background.color);
  const images = [...layers.images];
  const sizes = [...layers.sizes];
  const positions = [...layers.positions];
  const repeats = [...layers.repeats];
  const attachments = [...layers.attachments];

  if (background.image) {
    images.push(`url(${JSON.stringify(background.image)})`);
    sizes.push("cover");
    positions.push("center");
    repeats.push("no-repeat");
    attachments.push(options.fixedImage ? "fixed" : "scroll");
  }

  return {
    backgroundColor: background.color,
    backgroundImage: images.length ? images.join(", ") : undefined,
    backgroundSize: sizes.length ? sizes.join(", ") : undefined,
    backgroundPosition: positions.length ? positions.join(", ") : undefined,
    backgroundRepeat: repeats.length ? repeats.join(", ") : undefined,
    backgroundAttachment: attachments.length
      ? attachments.join(", ")
      : undefined,
  };
}
