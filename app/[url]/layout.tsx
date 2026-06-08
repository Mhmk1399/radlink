import { Metadata } from "next";
 import { connectDB } from "@/lib/data/db";
import Page from "@/models/pages";

export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: Promise<{ url: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ url: string }> }): Promise<Metadata> {
  const { url } = await params;
  await connectDB();
  const page = await Page.findOne({ url }).lean();
  if (!page) return {};

  const title = page.seo?.title || page.title || undefined;
  const description = page.seo?.description || page.description || undefined;
  const ogImage = page.seo?.ogImage || page.thumbnail || undefined;

  const icons = page.favicon
    ? {
        icon: page.favicon,
        shortcut: page.favicon,
        apple: page.favicon,
      }
    : undefined;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons,
  };

  return metadata;
}

export default async function Layout({ children }: Props) {
  return <>{children}</>;
}
