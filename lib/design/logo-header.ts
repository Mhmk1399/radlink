export type LogoHeaderVariant =
  | "none"
  | "wave-soft"
  | "wave-deep"
  | "wave-split"
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
  | "orbit";

export type LogoHeaderSettings = {
  enabled: boolean;
  variant: LogoHeaderVariant;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
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
  { id: "liquid", label: "Liquid" },
  { id: "mesh-gradient", label: "Mesh" },
  { id: "topography", label: "Topo" },
  { id: "checker", label: "Checker" },
  { id: "bubbles", label: "Bubbles" },
  { id: "scales", label: "Scales" },
  { id: "petals", label: "Petals" },
  { id: "zigzag", label: "Zigzag" },
  { id: "wave-repeat", label: "Wave repeat" },
  { id: "corner-swoop", label: "Corner swoop" },
  { id: "split-circles", label: "Split circles" },
  { id: "plus-grid", label: "Plus grid" },
  { id: "diamonds", label: "Diamonds" },
  { id: "honeycomb", label: "Honeycomb" },
  { id: "barcode", label: "Barcode" },
  { id: "orbit", label: "Orbit" },
];

export const DEFAULT_LOGO_HEADER: LogoHeaderSettings = {
  enabled: false,
  variant: "wave-soft",
  primaryColor: "#064789",
  secondaryColor: "#427AA1",
  accentColor: "#EBF2FA",
  patternOpacity: 0.38,
  height: 190,
  maxWidth: 860,
  logoSize: 96,
  cornerRadius: 28,
};

const variantIds = new Set(LOGO_HEADER_VARIANTS.map((variant) => variant.id));

function isLogoHeaderVariant(value: unknown): value is LogoHeaderVariant {
  return typeof value === "string" && variantIds.has(value as LogoHeaderVariant);
}

function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const color = value.trim();
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color)
    ? color
    : fallback;
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
    primaryColor: normalizeHexColor(
      raw.primaryColor,
      DEFAULT_LOGO_HEADER.primaryColor,
    ),
    secondaryColor: normalizeHexColor(
      raw.secondaryColor,
      DEFAULT_LOGO_HEADER.secondaryColor,
    ),
    accentColor: normalizeHexColor(raw.accentColor, DEFAULT_LOGO_HEADER.accentColor),
    patternOpacity:
      normalizeNumber(
        typeof raw.patternOpacity === "number"
          ? raw.patternOpacity * 100
          : raw.patternOpacity,
        DEFAULT_LOGO_HEADER.patternOpacity * 100,
        5,
        90,
      ) / 100,
    height: normalizeNumber(raw.height, DEFAULT_LOGO_HEADER.height, 110, 360),
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
