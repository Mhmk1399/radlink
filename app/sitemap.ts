import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/data/db";
import { isPageExpired } from "@/lib/pages/pageExpiration";
import Page from "@/models/pages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STATIC_SITEMAP_PATHS = ["/", "/about", "/contact", "/terms"] as const;
const STATIC_SLUGS = new Set(["about", "contact", "terms"]);
type SitemapEntry = MetadataRoute.Sitemap[number];

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://nfcrad.link"
  ).replace(/\/+$/, "");
}

function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalizedPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  await connectDB();

  const pages = await Page.find({
    isPublished: true,
    "seo.allowIndexing": { $ne: false },
    $or: [
      { expiresAt: null },
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } },
    ],
  })
    .select("url updatedAt publishedAt expiresAt")
    .sort({ updatedAt: -1 })
    .limit(50000)
    .lean();

  const staticItems: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.8,
    }),
  );

  const landingItems = pages
    .filter((page) => !isPageExpired(page.expiresAt))
    .map<SitemapEntry | null>((page) => {
      const slug = String(page.url || "").replace(/^\/+/, "");
      if (!slug || STATIC_SLUGS.has(slug)) return null;

      return {
        url: absoluteUrl(slug),
        lastModified:
          page.updatedAt instanceof Date
            ? page.updatedAt
            : new Date(String(page.updatedAt || page.publishedAt || now)),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    })
    .filter((item): item is SitemapEntry => item !== null);

  return [...staticItems, ...landingItems];
}
