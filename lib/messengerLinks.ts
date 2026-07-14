export type MessengerLinkPreset =
  | "telegram"
  | "instagram"
  | "whatsapp"
  | "eitaa"
  | "soroush"
  | "rubika"
  | "bale"
  | "igap"
  | "signal"
  | "messenger"
  | "discord"
  | "x"
  | "youtube"
  | "linkedin";

const PRESET_CONFIG: Record<
  MessengerLinkPreset,
  {
    prefix: string;
    placeholder: string;
    inputMode?: "text" | "tel";
    maxLength?: number;
  }
> = {
  telegram: { prefix: "https://t.me/", placeholder: "username" },
  instagram: { prefix: "https://instagram.com/", placeholder: "username" },
  whatsapp: {
    prefix: "https://wa.me/",
    placeholder: "989121234567",
    inputMode: "tel",
    maxLength: 15,
  },
  eitaa: { prefix: "https://eitaa.com/", placeholder: "username" },
  soroush: { prefix: "https://splus.ir/", placeholder: "username" },
  rubika: { prefix: "https://rubika.ir/", placeholder: "username" },
  bale: { prefix: "https://ble.ir/", placeholder: "username" },
  igap: { prefix: "https://profile.igap.net/", placeholder: "username" },
  signal: {
    prefix: "https://signal.me/#p/",
    placeholder: "+989121234567",
    inputMode: "tel",
    maxLength: 16,
  },
  messenger: { prefix: "https://m.me/", placeholder: "username" },
  discord: { prefix: "https://discord.gg/", placeholder: "invite-code" },
  x: { prefix: "https://x.com/", placeholder: "username" },
  youtube: { prefix: "https://www.youtube.com/", placeholder: "@channel" },
  linkedin: { prefix: "https://www.linkedin.com/in/", placeholder: "username" },
};
export function getMessengerPresetConfig(preset: MessengerLinkPreset) {
  return PRESET_CONFIG[preset];
}

const PRESET_KEYS = new Set<string>(Object.keys(PRESET_CONFIG));

export function isMessengerLinkPreset(
  value: unknown,
): value is MessengerLinkPreset {
  return typeof value === "string" && PRESET_KEYS.has(value);
}

const STRIP_PATTERNS: Record<MessengerLinkPreset, RegExp[]> = {
  telegram: [/^https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\//i],
  instagram: [/^https?:\/\/(?:www\.)?instagram\.com\//i],
  whatsapp: [
    /^https?:\/\/(?:www\.)?wa\.me\//i,
    /^https?:\/\/(?:api\.)?whatsapp\.com\/send\?phone=/i,
  ],
  eitaa: [/^https?:\/\/(?:www\.)?eitaa\.com\//i],
  soroush: [/^https?:\/\/(?:www\.)?splus\.ir\//i],
  rubika: [/^https?:\/\/(?:www\.)?rubika\.ir\//i],
  bale: [/^https?:\/\/(?:www\.)?ble\.ir\//i],
  igap: [/^https?:\/\/(?:www\.)?profile\.igap\.net\//i],
  signal: [/^https?:\/\/(?:www\.)?signal\.me\/#p\//i],
  messenger: [
    /^https?:\/\/(?:www\.)?m\.me\//i,
    /^https?:\/\/(?:www\.)?facebook\.com\/messages\/t\//i,
  ],
  discord: [
    /^https?:\/\/(?:www\.)?discord\.gg\//i,
    /^https?:\/\/(?:www\.)?discord\.com\/invite\//i,
  ],
  x: [
    /^https?:\/\/(?:www\.)?x\.com\//i,
    /^https?:\/\/(?:www\.)?twitter\.com\//i,
  ],
  youtube: [
    /^https?:\/\/(?:www\.)?youtube\.com\//i,
    /^https?:\/\/youtu\.be\//i,
  ],
  linkedin: [
    /^https?:\/\/(?:www\.)?linkedin\.com\/in\//i,
    /^https?:\/\/(?:www\.)?linkedin\.com\/company\//i,
  ],
};

function stripPresetPrefix(value: string, preset: MessengerLinkPreset) {
  return STRIP_PATTERNS[preset].reduce(
    (current, pattern) => current.replace(pattern, ""),
    value,
  );
}

function normalizeGenericUsername(value: string) {
  return value
    .split(/[/?#]/)[0]
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export function normalizeMessengerIdentifier(
  value: unknown,
  preset: MessengerLinkPreset,
) {
  let normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return "";
  normalized = stripPresetPrefix(normalized, preset).replace(/^\/+/, "");

  if (preset === "telegram" || preset === "eitaa") {
    normalized = normalizeGenericUsername(normalized);
    return normalized.replace(/[^a-zA-Z0-9_]/g, "");
  }

  if (preset === "instagram") {
    normalized = normalizeGenericUsername(normalized);
    return normalized.replace(/[^a-zA-Z0-9._]/g, "");
  }

  if (preset === "whatsapp" || preset === "signal") {
    const queryPhone = normalized.match(/[?&]phone=(\+?\d+)/i)?.[1];
    if (queryPhone) normalized = queryPhone;
    const hasPlus = normalized.trim().startsWith("+");
    const digits = normalized.replace(/\D/g, "");
    return digits ? `${hasPlus ? "+" : ""}${digits}` : "";
  }

  if (preset === "youtube") {
    return normalized
      .split(/[?#]/)[0]
      .replace(/^\/+/, "")
      .replace(/[^a-zA-Z0-9@._/-]/g, "");
  }

  if (preset === "discord") {
    return normalized
      .split(/[?#]/)[0]
      .replace(/^\/+/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "");
  }

  return normalizeGenericUsername(normalized);
}

export function buildPresetMessengerUrl(
  value: unknown,
  preset: MessengerLinkPreset,
) {
  const identifier = normalizeMessengerIdentifier(value, preset);
  return identifier ? `${PRESET_CONFIG[preset].prefix}${identifier}` : "";
}

export function getMessengerPresetForDataKey(
  key: string,
): MessengerLinkPreset | null {
  if (key === "telegramUrl") return "telegram";
  if (key === "instagramUrl") return "instagram";
  if (key === "whatsappUrl") return "whatsapp";
  if (key === "eitaaUrl") return "eitaa";
  if (key === "soroushUrl") return "soroush";
  if (key === "rubikaUrl") return "rubika";
  if (key === "baleUrl") return "bale";
  if (key === "igapUrl") return "igap";
  if (key === "signalUrl") return "signal";
  if (key === "messengerUrl") return "messenger";
  if (key === "discordUrl") return "discord";
  if (key === "xUrl") return "x";
  if (key === "youtubeUrl") return "youtube";
  if (key === "linkedinUrl") return "linkedin";
  return null;
}
