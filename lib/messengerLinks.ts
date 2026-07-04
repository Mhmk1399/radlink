export type MessengerLinkPreset = "telegram" | "instagram" | "whatsapp";

const PRESET_CONFIG: Record<
  MessengerLinkPreset,
  { prefix: string; placeholder: string }
> = {
  telegram: { prefix: "https://t.me/", placeholder: "username" },
  instagram: { prefix: "https://instagram.com/", placeholder: "username" },
  whatsapp: { prefix: "https://wa.me/", placeholder: "989121234567" },
};

export function getMessengerPresetConfig(preset: MessengerLinkPreset) {
  return PRESET_CONFIG[preset];
}

export function normalizeMessengerIdentifier(
  value: unknown,
  preset: MessengerLinkPreset,
) {
  let normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return "";

  if (preset === "telegram") {
    normalized = normalized
      .replace(/^https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\//i, "")
      .split(/[/?#]/)[0]
      .replace(/^@+/, "");
    return normalized.replace(/[^a-zA-Z0-9_]/g, "");
  }

  if (preset === "instagram") {
    normalized = normalized
      .replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, "")
      .split(/[/?#]/)[0]
      .replace(/^@+/, "");
    return normalized.replace(/[^a-zA-Z0-9._]/g, "");
  }

  const queryPhone = normalized.match(/[?&]phone=(\+?\d+)/i)?.[1];
  if (queryPhone) normalized = queryPhone;
  return normalized
    .replace(/^https?:\/\/(?:www\.)?wa\.me\//i, "")
    .replace(/\D/g, "");
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
  return null;
}
