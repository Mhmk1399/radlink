export const RADLINK_FAVICON_ICO = "/favicon.ico";
export const RADLINK_FAVICON_PNG = "/favicon-96x96.png";
export const RADLINK_APPLE_TOUCH_ICON = "/apple-touch-icon.png";
export const RADLINK_MANIFEST_ICON_192 = "/web-app-manifest-192x192.png";
export const RADLINK_MANIFEST_ICON_512 = "/web-app-manifest-512x512.png";
export const CUSTOM_HOME_SCREEN_ICON_SETTING_KEY =
  "customHomeScreenIconEnabled";
export const LANDING_GENERATED_ICON_SIZES = [180, 192, 512] as const;

export type LandingGeneratedIconSize =
  (typeof LANDING_GENERATED_ICON_SIZES)[number];

type PageIconSource = {
  favicon?: unknown;
  settings?: unknown;
};

export type ManifestIconEntry = {
  src: string;
  sizes: string;
  type?: string;
  purpose?: "any" | "maskable" | "monochrome" | "any maskable";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanUrl(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isCustomHomeScreenIconEnabled(settings: unknown) {
  if (!isRecord(settings)) return true;
  return settings[CUSTOM_HOME_SCREEN_ICON_SETTING_KEY] !== false;
}

function inferImageType(src: string) {
  const cleanSrc = src.split("?")[0]?.toLowerCase() ?? "";
  if (cleanSrc.endsWith(".png")) return "image/png";
  if (cleanSrc.endsWith(".jpg") || cleanSrc.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (cleanSrc.endsWith(".webp")) return "image/webp";
  if (cleanSrc.endsWith(".svg")) return "image/svg+xml";
  if (cleanSrc.endsWith(".ico")) return "image/x-icon";
  return undefined;
}

export function getLandingCustomIconUrl(page: PageIconSource) {
  if (!isCustomHomeScreenIconEnabled(page.settings)) return "";

  const settingsIcon = isRecord(page.settings)
    ? cleanUrl(page.settings.favicon)
    : "";

  return settingsIcon || cleanUrl(page.favicon);
}

export function getLandingIconConfig(page: PageIconSource) {
  const customIcon = getLandingCustomIconUrl(page);
  const browserIcon = customIcon || RADLINK_FAVICON_ICO;
  const appleIcon = customIcon || RADLINK_APPLE_TOUCH_ICON;

  return {
    customIcon,
    browserIcon,
    shortcutIcon: browserIcon,
    appleIcon,
    manifestIcons: customIcon
      ? ([
          {
            src: customIcon,
            sizes: "192x192",
            type: inferImageType(customIcon),
            purpose: "any maskable",
          },
          {
            src: customIcon,
            sizes: "512x512",
            type: inferImageType(customIcon),
            purpose: "any maskable",
          },
          {
            src: RADLINK_MANIFEST_ICON_192,
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: RADLINK_MANIFEST_ICON_512,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ] satisfies ManifestIconEntry[])
      : ([
          {
            src: RADLINK_MANIFEST_ICON_192,
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: RADLINK_MANIFEST_ICON_512,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ] satisfies ManifestIconEntry[]),
  };
}

export function withIconVersion(src: string, version?: string | number) {
  const cleanSrc = src.trim();
  const cleanVersion =
    version === undefined || version === null ? "" : String(version).trim();

  if (!cleanSrc || !cleanVersion) return cleanSrc;
  if (cleanSrc.startsWith("data:") || cleanSrc.startsWith("blob:")) {
    return cleanSrc;
  }

  try {
    const url = cleanSrc.startsWith("http")
      ? new URL(cleanSrc)
      : new URL(cleanSrc, "https://radlink.local");
    url.searchParams.set("v", cleanVersion);
    return cleanSrc.startsWith("http")
      ? url.toString()
      : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return `${cleanSrc}${cleanSrc.includes("?") ? "&" : "?"}v=${encodeURIComponent(cleanVersion)}`;
  }
}

export function isLandingGeneratedIconSize(
  value: unknown,
): value is LandingGeneratedIconSize {
  const numeric = Number(value);
  return LANDING_GENERATED_ICON_SIZES.includes(
    numeric as LandingGeneratedIconSize,
  );
}

export function getLandingGeneratedIconUrl(
  pageUrl: string,
  size: LandingGeneratedIconSize,
  version?: string | number,
) {
  const base = `/api/landing-icon/${encodeURIComponent(pageUrl)}/${size}`;
  return withIconVersion(base, version);
}
