export type PageFooterSettings = {
  enabled: boolean;
  logo: string;
  trustBadgeImage: string;
  trustBadgeAlt: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  showRadlinkBranding: boolean;
  brandingText: string;
};

export const DEFAULT_PAGE_FOOTER: PageFooterSettings = {
  enabled: true,
  logo: "",
  trustBadgeImage: "",
  trustBadgeAlt: "نماد اعتماد",
  description: "",
  backgroundColor: "rgba(255,255,255,0.78)",
  textColor: "#475569",
  accentColor: "#064789",
  borderColor: "rgba(15,23,42,0.10)",
  showRadlinkBranding: true,
  brandingText: "این سایت ساخته شده توسط رادلینک می‌باشد",
};

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function cleanBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizePageFooterSettings(
  value: unknown,
  fallback: Partial<PageFooterSettings> = {},
): PageFooterSettings {
  const source =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const base = {
    ...DEFAULT_PAGE_FOOTER,
    ...fallback,
  };

  return {
    enabled: cleanBoolean(source.enabled, base.enabled),
    logo: cleanString(source.logo, base.logo),
    trustBadgeImage: cleanString(
      source.trustBadgeImage,
      base.trustBadgeImage,
    ),
    trustBadgeAlt: cleanString(source.trustBadgeAlt, base.trustBadgeAlt),
    description: cleanString(source.description, base.description),
    backgroundColor: cleanString(
      source.backgroundColor,
      base.backgroundColor,
    ),
    textColor: cleanString(source.textColor, base.textColor),
    accentColor: cleanString(source.accentColor, base.accentColor),
    borderColor: cleanString(source.borderColor, base.borderColor),
    showRadlinkBranding: cleanBoolean(
      source.showRadlinkBranding,
      base.showRadlinkBranding,
    ),
    brandingText: cleanString(source.brandingText, base.brandingText),
  };
}
