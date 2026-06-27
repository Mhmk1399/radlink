"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "@/components/ui/CustomToast";
import {
  authorizeBuilderAccess,
  getBuilderAuthToken,
  type BuilderAccessTarget,
} from "@/hook/auth/builderAuthorization";
import { SmartSuggestions } from "@/builder/SmartSuggestions";
import type { PageBlock } from "@/types/blocks/builder.types";

type BuilderMode = "page" | "template";

type BuilderState = {
  loading: boolean;
  error: string | null;
  mode: BuilderMode;
  templateId?: string;
  sourceTemplateId?: string;
  initialBlocks?: PageBlock[];
  initialTitle?: string;
  initialDescription?: string;
  initialUrl?: string;
  initialCategoryId?: string;
  initialThumbnail?: string;
  requiresStartChoice?: boolean;
  suppressSmartSuggestions?: boolean;
};

function MinimalLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30" />
        <div className="inline-flex h-10 w-10 animate-spin rounded-full border-[3px] border-slate-700 border-t-violet-500" />
        <div>
          <h1 className="text-xl font-semibold tracking-wide text-white sm:text-2xl">
           ... در حال بارگذاری صفحه ساز
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
            لطفا صبر کنید
          </p>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15),transparent_60%)]" />
    </div>
  );
}

const SimplePageBuilder = dynamic(
  () => import("@/builder/editor/PageBuilder"),
  {
    ssr: false,
    loading: () => <MinimalLoadingScreen />,
  },
);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTemplateBlocks(template: Record<string, unknown>): PageBlock[] {
  const builderBlocks = Array.isArray(template.builderBlocks)
    ? template.builderBlocks
    : [];

  if (builderBlocks.length > 0) {
    return builderBlocks as PageBlock[];
  }

  const blocks = Array.isArray(template.blocks) ? template.blocks : [];

  return blocks
    .filter(isObject)
    .map((block, index) => ({
      instanceId: `${String(block.type ?? "block")}-${index}`,
      blockId: String(block._id ?? block.id ?? ""),
      type: typeof block.type === "string" ? block.type : "unknown",
      version: typeof block.version === "number" ? block.version : 1,
      order: index,
      isActive: typeof block.isActive === "boolean" ? block.isActive : true,
      data: isObject(block.data) ? block.data : {},
      settings: isObject(block.settings) ? block.settings : { direction: "rtl" },
      elements: isObject(block.elements) ? (block.elements as PageBlock["elements"]) : {},
    }));
}

function getCategoryId(category: unknown) {
  if (typeof category === "string") return category;
  if (!isObject(category)) return "";
  return String(category._id ?? category.id ?? "");
}

async function fetchTemplate(templateId: string) {
  const token = getBuilderAuthToken();
  const res = await fetch(`/api/templates/${templateId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "تمپلیت یافت نشد");
  return (json.template ?? json) as Record<string, unknown>;
}

export default function BuilderPage() {
  const router = useRouter();
  const [state, setState] = useState<BuilderState>({
    loading: true,
    error: null,
    mode: "page",
  });

  useEffect(() => {
    if (!state.requiresStartChoice) return;

    const title = "ساخت صفحه جدید | صفحه‌ساز رادلینک";
    const description =
      "برای ساخت صفحه جدید، یک تمپلیت انتخاب کنید یا از صفحه خالی شروع کنید.";

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
  }, [state.requiresStartChoice]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const params = new URLSearchParams(window.location.search);
        const mode: BuilderMode =
          params.get("mode") === "template" ? "template" : "page";
        const templateId = params.get("templateId") || params.get("id") || "";
        const accessTarget: BuilderAccessTarget =
          mode === "template"
            ? templateId
              ? { kind: "template-edit", templateId }
              : { kind: "template-create" }
            : { kind: "page-create" };
        const authorization = await authorizeBuilderAccess(accessTarget);

        if (cancelled) return;

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

        if (!templateId) {
          setState({
            loading: false,
            error: null,
            mode,
            requiresStartChoice: mode === "page",
            initialTitle: mode === "template" ? "تمپلیت جدید" : undefined,
            initialUrl: mode === "template" ? "new-template" : undefined,
          });
          return;
        }

        const template = await fetchTemplate(templateId);
        if (cancelled) return;

        const initialBlocks = normalizeTemplateBlocks(template);
        const categoryId = getCategoryId(template.category);

        setState({
          loading: false,
          error: null,
          mode,
          templateId: mode === "template" ? templateId : undefined,
          sourceTemplateId: mode === "page" ? templateId : undefined,
          initialBlocks,
          initialTitle:
            mode === "template"
              ? String(template.name ?? "تمپلیت جدید")
              : `صفحه جدید از ${String(template.name ?? "تمپلیت")}`,
          initialDescription: String(template.description ?? ""),
          initialUrl: "new-page",
          initialCategoryId: categoryId,
          initialThumbnail:
            typeof template.thumbnail === "string" ? template.thumbnail : "",
        });
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "خطا در بارگذاری صفحه ساز",
            mode: "page",
          });
        }
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state.loading) return <MinimalLoadingScreen />;

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">{state.error}</h1>
          <button
            onClick={() => router.push("/admin#templates")}
            className="mt-4 rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-700"
          >
            بازگشت به تمپلیت ها
          </button>
        </div>
      </div>
    );
  }

  if (state.requiresStartChoice) {
    return (
      <SmartSuggestions
        open
        onBack={() => router.replace("/admin#pages")}
        onStartBlank={() =>
          setState((current) => ({
            ...current,
            requiresStartChoice: false,
            suppressSmartSuggestions: true,
            initialBlocks: [],
            initialTitle: "صفحه جدید",
            initialDescription: "",
            initialUrl: "new-page",
          }))
        }
        onSelectTemplate={(template, summary) => {
          const initialBlocks = normalizeTemplateBlocks(template);
          const categoryId = getCategoryId(template.category);

          setState((current) => ({
            ...current,
            requiresStartChoice: false,
            suppressSmartSuggestions: true,
            sourceTemplateId: summary.id,
            initialBlocks,
            initialTitle: `صفحه جدید از ${String(
              template.name ?? summary.name ?? "تمپلیت",
            )}`,
            initialDescription: String(template.description ?? ""),
            initialUrl: "new-page",
            initialCategoryId: categoryId,
            initialThumbnail:
              typeof template.thumbnail === "string"
                ? template.thumbnail
                : "",
          }));
        }}
      />
    );
  }

  return (
    <SimplePageBuilder
      saveMode={state.mode}
      templateId={state.templateId}
      sourceTemplateId={state.sourceTemplateId}
      initialBlocks={state.initialBlocks}
      initialTitle={state.initialTitle}
      initialDescription={state.initialDescription}
      initialUrl={state.initialUrl}
      initialCategoryId={state.initialCategoryId}
      initialThumbnail={state.initialThumbnail}
      suppressSmartSuggestions={state.suppressSmartSuggestions}
    />
  );
}
