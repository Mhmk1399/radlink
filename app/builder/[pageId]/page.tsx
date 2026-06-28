"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "@/components/ui/CustomToast";
import {
  authorizeBuilderAccess,
  getBuilderAuthToken,
} from "@/hook/auth/builderAuthorization";
import type { PageBlock } from "@/types/blocks/builder.types";

type PageMetadata = {
  title: string;
  description: string;
  url: string;
  background: {
    color: string;
    image: string;
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30" />
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-[3px] border-slate-700 border-t-violet-500" />
        <div>
          <h1 className="text-xl font-semibold tracking-wide text-white sm:text-2xl">
          ...  در حال بارگذاری
          </h1>
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
          background: {
            color:
              typeof page.background?.color === "string"
                ? page.background.color
                : "#ffffff",
            image:
              typeof page.background?.image === "string"
                ? page.background.image
                : "",
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
      initialBackground={pageMetadata?.background}
    />
  );
}
