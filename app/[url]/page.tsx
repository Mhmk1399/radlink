import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Types } from "mongoose";
import { cache } from "react";
import { connectDB } from "@/lib/data/db";
import Notification from "@/models/notification";
import Image from "next/image";
import Page from "@/models/pages";
import QR from "@/models/qr";
import User from "@/models/users";
import { resolveUserAccess } from "@/lib/auth/resolveUserAccess";
import LandingFloatingActions from "@/components/landing/LandingFloatingActions";
import { LogoHeaderFrame } from "@/components/landing/LogoHeaderFrame";
import { normalizeLogoHeaderSettings } from "@/lib/design/logo-header";
import PageNotificationModal, {
  type PublicPageNotification,
} from "./PageNotificationModal";
import PageRenderer from "./PageRenderer";
import { isPageExpired } from "@/lib/pages/pageExpiration";
import type { PageBlock } from "@/types/blocks/builder.types";

type Props = {
  params: Promise<{ url: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      Object.entries(value).map(([key, item]) => [key, toClientValue(item)]),
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

  const page = (await getPublicPage(url))!;

  if (!page) {
    return {
      title: "صفحه یافت نشد",
    };
  }
  if (page.isPublished !== true || isPageExpired(page.expiresAt)) {
    return {
      title: "صفحه در دسترس نیست",
      robots: { index: false, follow: false },
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

  const page = (await getPublicPage(url))!;

  if (!page) return notFound();
  const pageExpired = isPageExpired(page.expiresAt);

  if (pageExpired && page.isPublished === true) {
    await Page.updateOne(
      { _id: page._id, isPublished: true },
      { $set: { isPublished: false }, $unset: { publishedAt: 1 } },
    );
  }

  const backgroundColor = isValidBackgroundColor(page.background?.color)
    ? page.background.color.trim()
    : "#ffffff";
  const backgroundImage =
    typeof page.background?.image === "string" &&
    /^https?:\/\//i.test(page.background.image)
      ? page.background.image
      : "";
  const logoHeader = normalizeLogoHeaderSettings(page.logoHeader);

  if (page.isPublished !== true || pageExpired) {
    // Replace with your actual support phone number
    const supportPhoneNumber = "02112345678";

    return (
      <main className="relative isolate min-h-screen  overflow-hidden">
        {/* Background Layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 scale-105 transition-transform duration-700"
          style={{
            backgroundColor: backgroundColor || "#f3f4f6",
            backgroundImage: backgroundImage
              ? `url(${JSON.stringify(backgroundImage)})`
              : undefined,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />

        {/* Overlay & Content */}
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md sm:p-6">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unpublished-page-title"
            aria-describedby="unpublished-page-description"
            className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl transition-all sm:p-8"
            dir="rtl"
          >
            {/* Icon Container */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-8 ring-slate-50/50">
              {/* Eye Off SVG Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            </div>

            {/* Text Content */}
            <h1
              id="unpublished-page-title"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              این صفحه در دسترس نیست
            </h1>
            <p
              id="unpublished-page-description"
              className="mt-3 text-sm leading-relaxed text-slate-500"
            >
              {pageExpired
                ? "زمان اعتبار این صفحه به پایان رسیده است. برای اطلاعات بیشتر می‌توانید با پشتیبانی تماس بگیرید."
                : "این صفحه در حال حاضر غیرفعال است یا هنوز منتشر نشده است. برای اطلاعات بیشتر می‌توانید با پشتیبانی تماس بگیرید."}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/* Primary Action: Call Button */}
              <a
                href={`tel:${supportPhoneNumber}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                    clipRule="evenodd"
                  />
                </svg>
                تماس با پشتیبانی
              </a>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const [rawNotifications, qr, owner] = await Promise.all([
    Notification.find({
      $and: [
        { isActive: { $ne: false } },
        { $or: [{ page: page._id }, { isGlobal: true }] },
      ],
    })
      .select("title subtitle description type iconKey closeable createdAt")
      .sort({ createdAt: -1 })
      .lean(),
    QR.findOne({ page: page._id, isActive: { $ne: false } })
      .select("targetUrl imageurl")
      .lean(),
    User.findById(page.owner).select("role permissions").lean(),
  ]);
  const ownerAccess =
    owner && owner.role !== "superAdmin"
      ? await resolveUserAccess(String(owner._id), owner.permissions ?? [])
      : null;
  const showFloatingActions = Boolean(
    owner &&
      (owner.role === "superAdmin" ||
        ownerAccess?.components["landing.floatingActions"]?.has("view")),
  );
  const notifications: PublicPageNotification[] = rawNotifications
    .map((notification) => ({
      id: String(notification._id),
      title: String(notification.title || "اعلان"),
      subtitle: String(notification.subtitle || ""),
      description: String(notification.description || ""),
      type: (notification.type === "danger"
        ? "danger"
        : "info") as PublicPageNotification["type"],
      iconKey: String(notification.iconKey || ""),
      closeable: Boolean(notification.closeable),
    }))
    .filter((notification) => notification.description);
  const clientBlocks = (page.blocks ?? []).map(
    (block) => toClientValue(block) as Record<string, unknown>,
  );
  const contactSaveBlock =
    clientBlocks.find(
      (block) =>
        block.type === "contactSave" &&
        block.isActive !== false &&
        block.hidden !== true,
    ) ?? null;
  return (
    <div className="relative isolate min-h-screen w-full px-2 pb-10  ">
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
        className="flex flex-col items-center justify-center "
        dir="rtl"
      >
        <LogoHeaderFrame
          settings={logoHeader}
          logo={typeof page.logo === "string" ? page.logo : ""}
          logoShape={page.logoShape === "circle" ? "circle" : "square"}
          title={String(page.title || "")}
        />
        {false ? (
          <div
            className={`relative mb-5 h-24 w-24 overflow-hidden border border-neutral-200 bg-white shadow-sm ${
              page!.logoShape === "circle" ? "rounded-full" : "rounded-xl"
            }`}
          >
            <Image
              src={String(page!.logo || "")}
              alt={`لوگوی ${page.title}`}
              fill
              unoptimized
              sizes="96px"
              className="object-contain "
            />
          </div>
        ) : null}
        {/* <h1 className="text-4xl font-bold text-neutral-900">{page.title}</h1>
        {page.description && (
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            {page.description}
          </p>
        )} */}
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
      <LandingFloatingActions
        contactBlock={contactSaveBlock as PageBlock | null}
        pageUrl={String(qr?.targetUrl || page.url)}
        qrImageUrl={String(qr?.imageurl || "")}
        mode="public"
        enabled={showFloatingActions}
      />
    </div>
  );
}
