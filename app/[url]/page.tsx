"use server";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectDB } from "@/lib/data/db";
import Page from "@/models/pages";
import PageRenderer from "./PageRenderer";

type Props = {
  params: Promise<{ url: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { url } = await params;

  await connectDB();
  const page = await Page.findOne({ url }).lean();

  if (!page) {
    return {
      title: "صفحه یافت نشد",
    };
  }

  const favicon = String(
    page.settings?.favicon || page.favicon || "/favicon.ico",
  );
  const appleIcon = String(
    page.settings?.appleTouchIcon || "/apple-touch-icon.png",
  );

  return {
    title: String(page.seo?.title || page.title || "صفحه"),
    description: String(page.seo?.description || page.description || ""),
    keywords: Array.isArray(page.seo?.keywords)
      ? (page.seo.keywords as string[])
      : [],
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: appleIcon,
    },
    openGraph: {
      title: String(page.seo?.title || page.title || ""),
      description: String(page.seo?.description || page.description || ""),
      images: page.seo?.ogImage ? [String(page.seo.ogImage)] : [],
      type: "website",
      locale: "fa_IR",
    },
  };
}

export default async function PageRoute({ params }: Props) {
  const { url } = await params;

  await connectDB();

  const page = await Page.findOne({ url }).lean();
  console.log(page);

  if (!page) return notFound();

  return (
    <div className="w-full px-2 pt-2 pb-10 bg-white">
      <header
        className="mb-8 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm"
        dir="rtl"
      >
        <h1 className="text-4xl font-bold text-neutral-900">{page.title}</h1>
        {page.description && (
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            {page.description}
          </p>
        )}
      </header>

      <section className="space-y-6 overflow-hidden">
        <PageRenderer
          blocks={page.blocks ?? []}
          pageData={{
            title: page.title,
            description: page.description,
            favicon: page.favicon,
            settings: page.settings,
          }}
        />
      </section>
    </div>
  );
}
