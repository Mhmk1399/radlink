import sharp from "sharp";
import { connectDB } from "@/lib/data/db";
import {
  RADLINK_MANIFEST_ICON_512,
  getLandingIconConfig,
  isLandingGeneratedIconSize,
} from "@/lib/design/landing-icons";
import { isPageExpired } from "@/lib/pages/pageExpiration";
import Page from "@/models/pages";

type RouteContext = {
  params: Promise<{
    url: string;
    size: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const ICON_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };
const TRANSPARENT_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 0 };
const PNG_SIGNATURE = "89504e470d0a1a0a";

function toAbsoluteUrl(src: string, requestUrl: string) {
  if (/^https?:\/\//i.test(src)) return src;
  return new URL(src, requestUrl).toString();
}

async function readImageBuffer(src: string, requestUrl: string) {
  const absolute = toAbsoluteUrl(src || RADLINK_MANIFEST_ICON_512, requestUrl);
  const response = await fetch(absolute, { cache: "no-store" });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !contentType.toLowerCase().startsWith("image/")) {
    throw new Error("Icon source is not a valid image");
  }

  return Buffer.from(await response.arrayBuffer());
}

function isPngBuffer(source: Buffer) {
  return source.subarray(0, 8).toString("hex") === PNG_SIGNATURE;
}

function extractPngFromIco(source: Buffer, targetSize: number) {
  if (source.length < 6) return null;
  if (source.readUInt16LE(0) !== 0 || source.readUInt16LE(2) !== 1) {
    return null;
  }

  const count = source.readUInt16LE(4);
  const entries = [];

  for (let index = 0; index < count; index += 1) {
    const entryOffset = 6 + index * 16;
    if (entryOffset + 16 > source.length) continue;

    const width = source[entryOffset] || 256;
    const height = source[entryOffset + 1] || 256;
    const bytesInRes = source.readUInt32LE(entryOffset + 8);
    const imageOffset = source.readUInt32LE(entryOffset + 12);
    const end = imageOffset + bytesInRes;

    if (imageOffset < 0 || end > source.length) continue;

    const image = source.subarray(imageOffset, end);
    if (!isPngBuffer(image)) continue;

    entries.push({
      image,
      score: Math.abs(Math.max(width, height) - targetSize),
      area: width * height,
    });
  }

  entries.sort((a, b) => a.score - b.score || b.area - a.area);
  return entries[0]?.image ?? null;
}

async function resizeSourceIcon(source: Buffer, size: number) {
  const padding = Math.max(14, Math.round(size * 0.12));
  const innerSize = size - padding * 2;

  return sharp(source, { animated: false })
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: TRANSPARENT_BACKGROUND,
    })
    .png()
    .toBuffer();
}

async function normalizeSourceIcon(source: Buffer, size: number) {
  try {
    return await resizeSourceIcon(source, size);
  } catch {
    const icoPng = extractPngFromIco(source, size);
    if (!icoPng) throw new Error("Unsupported icon image format");
    return resizeSourceIcon(icoPng, size);
  }
}

async function renderInstallIcon(source: Buffer, size: number) {
  const normalized = await normalizeSourceIcon(source, size);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: ICON_BACKGROUND,
    },
  })
    .composite([{ input: normalized, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function renderFirstUsableSource(
  sources: string[],
  requestUrl: string,
  size: number,
) {
  for (const source of sources) {
    const cleanSource = source.trim();
    if (!cleanSource) continue;

    try {
      const buffer = await readImageBuffer(cleanSource, requestUrl);
      return await renderInstallIcon(buffer, size);
    } catch {
      // Try the next source. Old ICO files, broken uploads, or private files
      // should not make the install manifest fall back to a broken icon.
    }
  }

  const fallback = await readImageBuffer(RADLINK_MANIFEST_ICON_512, requestUrl);
  return renderInstallIcon(fallback, size);
}

export async function GET(request: Request, context: RouteContext) {
  const { url, size: rawSize } = await context.params;
  const size = Number(rawSize);

  if (!isLandingGeneratedIconSize(size)) {
    return new Response("Invalid icon size", { status: 400 });
  }

  await connectDB();

  const page = await Page.findOne({ url })
    .select("title logo favicon settings isPublished expiresAt")
    .lean();

  if (!page || page.isPublished !== true || isPageExpired(page.expiresAt)) {
    return new Response("Icon not found", { status: 404 });
  }

  const iconConfig = getLandingIconConfig({
    favicon: page.favicon,
    settings: page.settings,
  });
  const pageLogo = typeof page.logo === "string" ? page.logo : "";
  const iconSources = iconConfig.customIcon
    ? [iconConfig.customIcon, pageLogo]
    : [RADLINK_MANIFEST_ICON_512];
  const icon = await renderFirstUsableSource(iconSources, request.url, size);

  return new Response(new Uint8Array(icon), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "image/png",
    },
  });
}
