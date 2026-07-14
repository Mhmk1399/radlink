import { NextResponse } from "next/server";
import { connectDB } from "@/lib/data/db";
import {
  getLandingGeneratedIconUrl,
} from "@/lib/design/landing-icons";
import { isPageExpired } from "@/lib/pages/pageExpiration";
import Page from "@/models/pages";

type RouteContext = {
  params: Promise<{
    url: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function shortName(value: string) {
  const clean = value.trim();
  return clean.length > 24 ? `${clean.slice(0, 24)}` : clean;
}

function iconVersion(page: Record<string, unknown>) {
  const updatedAt = page.updatedAt;
  if (updatedAt instanceof Date) return String(updatedAt.getTime());
  if (typeof updatedAt === "string" && updatedAt.trim()) {
    const timestamp = new Date(updatedAt).getTime();
    return Number.isNaN(timestamp) ? updatedAt : String(timestamp);
  }

  return String(page._id ?? page.id ?? "");
}

export async function GET(_request: Request, context: RouteContext) {
  const { url } = await context.params;

  await connectDB();

  const page = await Page.findOne({ url })
    .select("title description url favicon settings background seo isPublished expiresAt updatedAt")
    .lean();

  if (!page || page.isPublished !== true || isPageExpired(page.expiresAt)) {
    return NextResponse.json(
      { message: "Manifest not found" },
      { status: 404 },
    );
  }

  const title = text(page.seo?.title, text(page.title, "راد لینک"));
  const description = text(
    page.seo?.description,
    text(page.description, "لندینگ ساخته شده با راد لینک"),
  );
  const version = iconVersion(page as Record<string, unknown>);
  const backgroundColor = text(page.background?.color, "#ffffff");

  return NextResponse.json(
    {
      id: `/${page.url}`,
      name: title,
      short_name: shortName(title),
      description,
      start_url: `/${page.url}`,
      scope: `/${page.url}`,
      display: "standalone",
      orientation: "portrait",
      lang: "fa",
      dir: "rtl",
      theme_color: backgroundColor,
      background_color: backgroundColor,
      icons: [
        {
          src: getLandingGeneratedIconUrl(String(page.url), 192, version),
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: getLandingGeneratedIconUrl(String(page.url), 512, version),
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
