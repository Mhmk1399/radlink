import { normalizeCssColorValue } from "./color";

export type LogoHeaderVariant =
  | "none"
  | "wave-soft"
  | "wave-deep"
  | "wave-split"
  | "wave-aurora"
  | "wave-cut"
  | "wave-jagged"
  | "wave-steps"
  | "wave-organic"
  | "wave-slope"
  | "curve-arc"
  | "curve-layer"
  | "blob-center"
  | "blob-side"
  | "ribbon"
  | "ribbon-fold"
  | "diagonal"
  | "diagonal-stripes"
  | "dots"
  | "grid"
  | "arches"
  | "sunburst"
  | "mountains"
  | "steps"
  | "rings"
  | "confetti"
  | "minimal-line"
  | "liquid"
  | "mesh-gradient"
  | "topography"
  | "checker"
  | "bubbles"
  | "scales"
  | "petals"
  | "zigzag"
  | "wave-repeat"
  | "corner-swoop"
  | "split-circles"
  | "plus-grid"
  | "diamonds"
  | "honeycomb"
  | "barcode"
  | "orbit"
  | "glass-aurora"
  | "glass-prism"
  | "liquid-blob"
  | "holo-orbit"
  | "chrome-fold"
  | "mist-bubbles"
  | "neon-caustic"
  | "neon-mist"
  | "frosted-orbit"
  | "laser-veil"
  | "polar-liquid"
  | "blue-vapor";

export type LogoHeaderSettings = {
  enabled: boolean;
  variant: LogoHeaderVariant;
  title: string;
  description: string;
  textColor: string;
  descriptionColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundImage: string;
  patternOpacity: number;
  height: number;
  maxWidth: number;
  logoSize: number;
  cornerRadius: number;
};

export type LogoHeaderVariantOption = {
  id: LogoHeaderVariant;
  label: string;
};

export const LOGO_HEADER_VARIANTS: LogoHeaderVariantOption[] = [
  { id: "none", label: "بدون طرح" },
  { id: "wave-soft", label: "موج نرم" },
  { id: "wave-deep", label: "موج عمیق" },
  { id: "wave-split", label: "موج دو لایه" },
  { id: "wave-aurora", label: "موج شفقی" },
  { id: "wave-cut", label: "موج برشی" },
  { id: "wave-jagged", label: "موج نامنظم" },
  { id: "wave-steps", label: "موج پله‌ای" },
  { id: "wave-organic", label: "موج ارگانیک" },
  { id: "wave-slope", label: "موج شیب‌دار" },
  { id: "curve-arc", label: "قوس مرکزی" },
  { id: "curve-layer", label: "قوس لایه‌ای" },
  { id: "blob-center", label: "لکه مرکزی" },
  { id: "blob-side", label: "لکه کناری" },
  { id: "ribbon", label: "روبان" },
  { id: "ribbon-fold", label: "روبان تاخورده" },
  { id: "diagonal", label: "مورب" },
  { id: "diagonal-stripes", label: "خطوط مورب" },
  { id: "dots", label: "نقطه‌ای" },
  { id: "grid", label: "شبکه‌ای" },
  { id: "arches", label: "طاقی" },
  { id: "sunburst", label: "تابش" },
  { id: "mountains", label: "کوهستانی" },
  { id: "steps", label: "پله‌ای" },
  { id: "rings", label: "حلقه‌ای" },
  { id: "confetti", label: "پترن ریز" },
  { id: "minimal-line", label: "خط مینیمال" },
  { id: "liquid", label: "مایع" },
  { id: "mesh-gradient", label: "مش گرادینتی" },
  { id: "topography", label: "توپوگرافی" },
  { id: "checker", label: "شطرنجی" },
  { id: "bubbles", label: "حباب‌ها" },
  { id: "scales", label: "فلس‌دار" },
  { id: "petals", label: "گلبرگ‌ها" },
  { id: "zigzag", label: "زیگزاگ" },
  { id: "wave-repeat", label: "موج تکراری" },
  { id: "corner-swoop", label: "قوس گوشه‌ای" },
  { id: "split-circles", label: "دایره‌های دوگانه" },
  { id: "plus-grid", label: "شبکه مثبت" },
  { id: "diamonds", label: "لوزی‌ها" },
  { id: "honeycomb", label: "کندویی" },
  { id: "barcode", label: "بارکدی" },
  { id: "orbit", label: "مداری" },
  { id: "glass-aurora", label: "گلس شفقی" },
  { id: "glass-prism", label: "منشور شیشه‌ای" },
  { id: "liquid-blob", label: "لیکویید بلاب" },
  { id: "holo-orbit", label: "مدار هولوگرام" },
  { id: "chrome-fold", label: "تای کرومی" },
  { id: "mist-bubbles", label: "حباب مه‌آلود" },
  { id: "neon-caustic", label: "کاستیک نئونی" },
  { id: "neon-mist", label: "مه نئونی" },
  { id: "frosted-orbit", label: "مدار یخی" },
  { id: "laser-veil", label: "پرده لیزری" },
  { id: "polar-liquid", label: "مایع قطبی" },
  { id: "blue-vapor", label: "بخار آبی" },
];

export const DEFAULT_LOGO_HEADER: LogoHeaderSettings = {
  enabled: true,
  variant: "wave-soft",
  title: "نام سایت شما",
  description: "توضیح کوتاه درباره سایت شما",
  textColor: "#ffffff",
  descriptionColor: "rgba(255,255,255,0.78)",
  primaryColor: "#064789",
  secondaryColor: "#427AA1",
  accentColor: "#EBF2FA",
  backgroundImage: "",
  patternOpacity: 0.38,
  height: 110,
  maxWidth: 860,
  logoSize: 96,
  cornerRadius: 28,
};

const variantIds = new Set(LOGO_HEADER_VARIANTS.map((variant) => variant.id));

function isLogoHeaderVariant(value: unknown): value is LogoHeaderVariant {
  return typeof value === "string" && variantIds.has(value as LogoHeaderVariant);
}

function normalizeColor(value: unknown, fallback: string) {
  return normalizeCssColorValue(value, fallback);
}

function normalizeImageUrl(value: unknown) {
  if (typeof value !== "string") return "";
  const url = value.trim();
  return /^https?:\/\//i.test(url) ? url : "";
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
) {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numberValue)));
}

export function normalizeLogoHeaderSettings(
  value: unknown,
): LogoHeaderSettings {
  const raw =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    enabled:
      typeof raw.enabled === "boolean"
        ? raw.enabled
        : DEFAULT_LOGO_HEADER.enabled,
    variant: isLogoHeaderVariant(raw.variant)
      ? raw.variant
      : DEFAULT_LOGO_HEADER.variant,
    title:
      typeof raw.title === "string" ? raw.title.trim() : DEFAULT_LOGO_HEADER.title,
    description:
      typeof raw.description === "string"
        ? raw.description.trim()
        : DEFAULT_LOGO_HEADER.description,
    textColor: normalizeColor(raw.textColor, DEFAULT_LOGO_HEADER.textColor),
    descriptionColor: normalizeColor(
      raw.descriptionColor,
      DEFAULT_LOGO_HEADER.descriptionColor,
    ),
    primaryColor: normalizeColor(
      raw.primaryColor,
      DEFAULT_LOGO_HEADER.primaryColor,
    ),
    secondaryColor: normalizeColor(
      raw.secondaryColor,
      DEFAULT_LOGO_HEADER.secondaryColor,
    ),
    accentColor: normalizeColor(raw.accentColor, DEFAULT_LOGO_HEADER.accentColor),
    backgroundImage: normalizeImageUrl(raw.backgroundImage),
    patternOpacity:
      normalizeNumber(
        typeof raw.patternOpacity === "number"
          ? raw.patternOpacity * 100
          : raw.patternOpacity,
        DEFAULT_LOGO_HEADER.patternOpacity * 100,
        5,
        90,
      ) / 100,
    height: normalizeNumber(raw.height, DEFAULT_LOGO_HEADER.height, 60, 360),
    maxWidth: normalizeNumber(raw.maxWidth, DEFAULT_LOGO_HEADER.maxWidth, 320, 1920),
    logoSize: normalizeNumber(raw.logoSize, DEFAULT_LOGO_HEADER.logoSize, 56, 180),
    cornerRadius: normalizeNumber(
      raw.cornerRadius,
      DEFAULT_LOGO_HEADER.cornerRadius,
      0,
      80,
    ),
  };
}
