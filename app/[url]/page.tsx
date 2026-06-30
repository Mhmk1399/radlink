import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Types } from "mongoose";
import { cache } from "react";
import { connectDB } from "@/lib/data/db";
import Notification from "@/models/notification";
import Image from "next/image";
import Page from "@/models/pages";
import PageNotificationModal, {
  type PublicPageNotification,
} from "./PageNotificationModal";
import PageRenderer from "./PageRenderer";

type Props = {
  params: Promise<{ url: string }>;
};

export const revalidate = 60;

const getPublicPage = cache(async (url: string) => {
  await connectDB();
  return Page.findOne({ url }).lean();
});

function toClientValue(value: unknown): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Types.ObjectId) return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString("base64");
  if (Array.isArray(value)) return value.map(toClientValue);

  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries(), ([key, item]) => [
        String(key),
        toClientValue(item),
      ]),
    );
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        toClientValue(item),
      ]),
    );
  }

  return String(value);
}
function isValidBackgroundColor(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const color = value.trim();

  const isHex =
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(
      color,
    );

  const isRgb =
    /^rgb\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*\)$/i.test(
      color,
    );

  const isRgba =
    /^rgba\(\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(?:0|1|0?\.\d+)\s*\)$/i.test(
      color,
    );

  return isHex || isRgb || isRgba;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { url } = await params;

  const page = await getPublicPage(url);

  if (!page) {
    return {
      title: "صفحه یافت نشد",
    };
  }

  const favicon = String(
    page.settings?.favicon || page.favicon || "/favicon.ico",
  );
  const appleIcon = String(page.settings?.appleTouchIcon || favicon);

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
      images:
        page.seo?.ogImage || page.thumbnail
          ? [String(page.seo?.ogImage || page.thumbnail)]
          : [],
      type: "website",
      locale: "fa_IR",
    },
  };
}

export default async function PageRoute({ params }: Props) {
  const { url } = await params;

  const page = await getPublicPage(url);

  if (!page) return notFound();

  const backgroundColor = isValidBackgroundColor(page.background?.color)
    ? page.background.color.trim()
    : "#ffffff";
  const backgroundImage =
    typeof page.background?.image === "string" &&
    /^https?:\/\//i.test(page.background.image)
      ? page.background.image
      : "";

  if (page.isPublished !== true) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 scale-105"
          style={{
            backgroundColor,
            backgroundImage: backgroundImage
              ? `url(${JSON.stringify(backgroundImage)})`
              : undefined,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div className="fixed inset-0 flex items-center justify-center bg-black/45 p-5 backdrop-blur-xl">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unpublished-page-title"
            aria-describedby="unpublished-page-description"
            className="w-full max-w-md rounded-2xl border border-white/70 bg-white/95 p-6 text-center shadow-2xl sm:p-8"
            dir="rtl"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl font-black text-amber-600 ring-1 ring-amber-200">
              !
            </div>
            <h1
              id="unpublished-page-title"
              className="text-xl font-black text-neutral-900 sm:text-2xl"
            >
              این صفحه غیرفعال است
            </h1>
            <p
              id="unpublished-page-description"
              className="mt-3 text-sm leading-7 text-neutral-600"
            >
              این صفحه در حال حاضر منتشر نشده و محتوای آن قابل مشاهده نیست.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const rawNotifications = await Notification.find({
    $and: [
      { isActive: { $ne: false } },
      { $or: [{ page: page._id }, { isGlobal: true }] },
    ],
  })
    .select("title subtitle description type closeable createdAt")
    .sort({ createdAt: -1 })
    .lean();
  const notifications: PublicPageNotification[] = rawNotifications
    .map((notification) => ({
      id: String(notification._id),
      title: String(notification.title || "اعلان"),
      subtitle: String(notification.subtitle || ""),
      description: String(notification.description || ""),
      type: (notification.type === "danger"
        ? "danger"
        : "info") as PublicPageNotification["type"],
      closeable: Boolean(notification.closeable),
    }))
    .filter((notification) => notification.description);
  const clientBlocks = (page.blocks ?? []).map(
    (block) => toClientValue(block) as Record<string, unknown>,
  );
  return (
    <div className="relative isolate min-h-screen w-full px-2 pb-10 pt-2">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor,
          backgroundImage: backgroundImage
            ? `url(${JSON.stringify(backgroundImage)})`
            : undefined,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <PageNotificationModal notifications={notifications} />
      <header
        className="mb-8 flex flex-col items-center justify-center  p-6 "
        dir="rtl"
      >
        {typeof page.logo === "string" && page.logo ? (
          <Image
            src={page.logo}
            alt={`لوگوی ${page.title}`}
            width={288}
            height={96}
            unoptimized
            className="mb-5 h-auto max-h-24 w-auto max-w-[min(100%,18rem)] object-contain"
          />
        ) : null}
        <h1 className="text-4xl font-bold text-neutral-900">{page.title}</h1>
        {page.description && (
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            {page.description}
          </p>
        )}
      </header>

      <section className="space-y-6 overflow-hidden">
        <PageRenderer
          pageId={String(page._id)}
          blocks={clientBlocks}
          pageData={{
            title: page.title,
            description: page.description,
            favicon: page.favicon,
            settings: {
              favicon:
                typeof page.settings?.favicon === "string"
                  ? page.settings.favicon
                  : undefined,
              appleTouchIcon:
                typeof page.settings?.appleTouchIcon === "string"
                  ? page.settings.appleTouchIcon
                  : undefined,
            },
          }}
        />
      </section>
    </div>
  );
}
