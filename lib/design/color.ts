export type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampByte(value: number): number {
  return Math.round(clamp(value, 0, 255));
}

function clampAlpha(value: number): number {
  return clamp(value, 0, 1);
}

function expandHex(hex: string): string {
  return hex
    .split("")
    .map((char) => `${char}${char}`)
    .join("");
}

function parseHexColor(value: string): RgbaColor | null {
  const hex = value.trim().replace(/^#/, "");

  if (![3, 4, 6, 8].includes(hex.length) || /[^0-9a-fA-F]/.test(hex)) {
    return null;
  }

  const fullHex = hex.length === 3 || hex.length === 4 ? expandHex(hex) : hex;
  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);
  const a =
    fullHex.length === 8
      ? Number((parseInt(fullHex.slice(6, 8), 16) / 255).toFixed(3))
      : 1;

  return { r, g, b, a };
}

function parseRgbColor(value: string): RgbaColor | null {
  const match =
    /^rgba?\(\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*(?:,\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*)?\)$/i.exec(
      value.trim(),
    );

  if (!match) return null;

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  const a = match[4] === undefined ? 1 : Number(match[4]);

  if (![r, g, b, a].every(Number.isFinite)) return null;

  return {
    r: clampByte(r),
    g: clampByte(g),
    b: clampByte(b),
    a: clampAlpha(a),
  };
}

export function parseCssColor(value: unknown): RgbaColor | null {
  if (typeof value !== "string") return null;

  const color = value.trim();
  if (!color) return null;
  if (color.toLowerCase() === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  if (color.startsWith("#")) return parseHexColor(color);
  if (/^rgba?\(/i.test(color)) return parseRgbColor(color);

  return null;
}

export function isValidCssColorValue(value: unknown): value is string {
  return parseCssColor(value) !== null;
}

export function normalizeCssColorValue(value: unknown, fallback: string): string {
  return typeof value === "string" && isValidCssColorValue(value)
    ? value.trim()
    : fallback;
}

export function formatHexColor(color: RgbaColor): string {
  const toHex = (value: number) => clampByte(value).toString(16).padStart(2, "0");
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function formatCssColor(color: RgbaColor): string {
  const alpha = Number(clampAlpha(color.a).toFixed(2));

  if (alpha <= 0) {
    return "transparent";
  }

  if (alpha >= 1) {
    return formatHexColor(color);
  }

  return `rgba(${clampByte(color.r)}, ${clampByte(color.g)}, ${clampByte(
    color.b,
  )}, ${alpha})`;
}

export function isLightCssColor(value: unknown): boolean {
  const color = parseCssColor(value);
  if (!color) return false;

  const luminance =
    (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;

  return color.a < 0.35 || luminance > 0.7;
}
