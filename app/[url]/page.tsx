import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Types } from "mongoose";
import { cache } from "react";
import { connectDB } from "@/lib/data/db";
import Notification from "@/models/notification";
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

  const rawNotifications = await Notification.find({
    $or: [{ page: page._id }, { isGlobal: true }],
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
const backgroundColor = isValidBackgroundColor(page.background?.color)
  ? page.background.color.trim()
  : "#ffffff";
  const backgroundImage =
    typeof page.background?.image === "string" &&
    /^https?:\/\//i.test(page.background.image)
      ? page.background.image
      : "";

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
