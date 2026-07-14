"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { toast } from "@/components/ui/CustomToast";
import {
  authorizeBuilderAccess,
  getBuilderAuthToken,
} from "@/hook/auth/builderAuthorization";
import type { PageBlock } from "@/types/blocks/builder.types";
import { useTheme } from "@/contexts/ThemeContext";
import type { LogoHeaderSettings } from "@/lib/design/logo-header";
import type { PageFooterSettings } from "@/lib/design/page-footer";
import type { PageBackgroundPattern } from "@/lib/design/page-background";

type PageMetadata = {
  title: string;
  description: string;
  url: string;
  logo: string;
  logoShape: "square" | "circle";
  font: string;
  logoHeader?: Partial<LogoHeaderSettings>;
  footer?: Partial<PageFooterSettings>;
  favicon: string;
  background: {
    color: string;
    image: string;
    pattern?: Partial<PageBackgroundPattern>;
  };
};

function setClientMetadata(title: string, description: string) {
  document.title = title;

  let meta = document.head.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = description;
}

function LoadingScreen() {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
        isDark ? "bg-[#141418]" : "bg-[#f1f2f4]"
      }`}
    >
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <div className="relative flex   items-center justify-center">
      
          <div
            className={`relative flex h-60 w-60 items-center justify-center rounded-2xl   ${
              isDark
                ? " "
                : ""
            }`}
          >


            <Image
              src="/assets/images/radlinklogo.png"
              width={96}
              height={96}
              alt="رادلینک"
              priority
              className="h-120 w-120 object-contain"
            />
          </div>
        </div>

        <div
          className={`inline-flex h-10 w-10 animate-spin rounded-full border-[3px] border-t-[#c9a84c] ${
            isDark ? "border-[#2e2e38]" : "border-[#d4d4d8]"
          }`}
        />

        <div>
          <h1
            className={`text-xl font-semibold tracking-wide sm:text-2xl ${
              isDark ? "text-[#e8e6e3]" : "text-[#18181b]"
            }`}
          >
        
            <span className="inline-flex w-6 justify-start">
              <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
              <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
              <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
            </span>
                در حال بارگذاری
          </h1>
          <p
            className={`mt-1 text-sm ${
              isDark ? "text-[#9e9a93]" : "text-[#52525b]"
            }`}
          >
            در حال آماده‌سازی صفحه‌ساز رادلینک
          </p>
        </div>
      </div>
    </div>
  );
}

const SimplePageBuilder = dynamic(
  () => import("@/builder/editor/PageBuilder"),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

export default function EditPageBuilder() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.pageId as string;

  const [initialBlocks, setInitialBlocks] = useState<PageBlock[] | null>(null);
  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPage() {
      if (!pageId) {
        setError("شناسه صفحه نامعتبر است");
        setLoading(false);
        return;
      }

      try {
        const authorization = await authorizeBuilderAccess({
          kind: "page-edit",
          pageId,
        });

        if (!authorization.ok) {
          const notify =
            authorization.reason === "forbidden" ? toast.error : toast.warning;
          notify(authorization.message, {
            title:
              authorization.reason === "forbidden"
                ? "دسترسی غیرمجاز"
                : "نیاز به ورود",
          });
          router.replace(
            authorization.reason === "forbidden" ? "/admin" : "/auth",
          );
          return;
        }

        const token = getBuilderAuthToken();
        const res = await fetch(`/api/pages/${pageId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          throw new Error("صفحه یافت نشد");
        }

        const json = await res.json();
        const page = json.page || json;
        
        setInitialBlocks(page.blocks || []);
        setPageMetadata({
          title: page.title || "صفحه جدید",
          description: page.description || "",
          url: page.url || "new-page",
          logo: typeof page.logo === "string" ? page.logo : "",
          logoShape: page.logoShape === "circle" ? "circle" : "square",
          font: typeof page.font === "string" ? page.font : "",
          logoHeader:
            page.logoHeader && typeof page.logoHeader === "object"
              ? page.logoHeader
              : undefined,
          footer:
            page.footer && typeof page.footer === "object"
              ? page.footer
              : undefined,
          favicon: typeof page.favicon === "string" ? page.favicon : "",
          background: {
            color:
              typeof page.background?.color === "string"
                ? page.background.color
                : "#ffffff",
            image:
              typeof page.background?.image === "string"
                ? page.background.image
                : "",
            pattern:
              page.background?.pattern &&
              typeof page.background.pattern === "object"
                ? page.background.pattern
                : undefined,
          },
        });

        // Update favicon dynamically
        if (page.favicon) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (link) {
            link.href = page.favicon;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = page.favicon;
            document.head.appendChild(newLink);
          }
        }

        // Update document title
        if (page.title) {
          document.title = `${page.title} - ویرایش صفحه`;
        }
        const metadataPageTitle = page.title || "صفحه بدون عنوان";
        setClientMetadata(
          `ویرایش صفحه: ${metadataPageTitle} | صفحه‌ساز رادلینک`,
          page.description ||
            `ویرایش صفحه «${metadataPageTitle}» در صفحه‌ساز رادلینک.`,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در بارگذاری صفحه");
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [pageId, router]);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">{error}</h1>
          <button
            onClick={() => router.push("/admin")}
            className="mt-4 rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-700"
          >
            بازگشت به پنل ادمین
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimplePageBuilder
      pageId={pageId}
      initialBlocks={initialBlocks || []}
      initialTitle={pageMetadata?.title}
      initialDescription={pageMetadata?.description}
      initialUrl={pageMetadata?.url}
      initialLogo={pageMetadata?.logo}
      initialLogoShape={pageMetadata?.logoShape}
      initialFont={pageMetadata?.font}
      initialLogoHeader={pageMetadata?.logoHeader}
      initialFooter={pageMetadata?.footer}
      initialFavicon={pageMetadata?.favicon}
      initialBackground={pageMetadata?.background}
    />
  );
}
