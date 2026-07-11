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
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import type { PageBlock } from "@/types/blocks/builder.types";
import type { LogoHeaderSettings } from "@/lib/design/logo-header";
import {
  normalizePageBackgroundSettings,
  type PageBackgroundPattern,
} from "@/lib/design/page-background";

type BuilderMode = "page" | "template";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
  initialLogoHeader?: Partial<LogoHeaderSettings>;
  initialBackground?: {
    color: string;
    image: string;
    pattern?: Partial<PageBackgroundPattern>;
  };
  requiresStartChoice?: boolean;
  suppressSmartSuggestions?: boolean;
};

function MinimalLandingCreatorLoading() {
  const t = useThemeTokens();

  return (
    <div
      dir="rtl"
      role="status"
      aria-live="polite"
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden px-6 transition-colors duration-300",
        t.pageBg,
        t.textPrimary,
      )}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-3xl border p-6 transition-colors duration-300 sm:p-7",
          t.cardBg,
          t.borderSubtle,
          t.cardShadow,
        )}
      >
        {/* brand */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-2xl border",
              t.activeBg,
              t.borderAccent,
              t.textAccent,
            )}
          >
            <div
              className={cn(
                "absolute inset-0 animate-pulse rounded-2xl",
                t.selectedBg,
              )}
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="relative h-5 w-5"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 8h10M7 12h6M7 16h8" />
            </svg>
          </div>

          <div>
            <p className={cn("text-sm font-medium", t.textSecondary)}>
              رادلینک
            </p>
          </div>
        </div>

        {/* text */}
        <h1
          className={cn(
            "text-xl font-semibold tracking-tight sm:text-2xl",
            t.textPrimary,
          )}
        >
          در حال آماده‌سازی صفحه
        </h1>
        <p className={cn("mt-2 text-sm leading-6", t.textMuted)}>
          لطفاً چند لحظه صبر کنید تا محیط طراحی و پیش‌نمایش بارگذاری شود.
        </p>
      </div>
    </div>
  );
}

const SimplePageBuilder = dynamic(
  () => import("@/builder/editor/PageBuilder"),
  {
    ssr: false,
    loading: () => <MinimalLandingCreatorLoading />,
  },
);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTemplateBlocks(
  template: Record<string, unknown>,
): PageBlock[] {
  const builderBlocks = Array.isArray(template.builderBlocks)
    ? template.builderBlocks
    : [];

  if (builderBlocks.length > 0) {
    return builderBlocks as PageBlock[];
  }

  const blocks = Array.isArray(template.blocks) ? template.blocks : [];

  return blocks.filter(isObject).map((block, index) => ({
    instanceId: `${String(block.type ?? "block")}-${index}`,
    blockId: String(block._id ?? block.id ?? ""),
    type: typeof block.type === "string" ? block.type : "unknown",
    version: typeof block.version === "number" ? block.version : 1,
    order: index,
    isActive: typeof block.isActive === "boolean" ? block.isActive : true,
    data: isObject(block.data) ? block.data : {},
    settings: isObject(block.settings) ? block.settings : { direction: "rtl" },
    elements: isObject(block.elements)
      ? (block.elements as PageBlock["elements"])
      : {},
  }));
}

function getCategoryId(category: unknown) {
  if (typeof category === "string") return category;
  if (!isObject(category)) return "";
  return String(category._id ?? category.id ?? "");
}

function getTemplateBackground(template: Record<string, unknown>) {
  const background = isObject(template.background) ? template.background : {};
  const style = isObject(template.style) ? template.style : {};
  const colors = isObject(style.colors) ? style.colors : {};
  const rawColor = String(background.color ?? colors.background ?? "").trim();
  const rawImage = String(background.image ?? style.bgImage ?? "").trim();

  return normalizePageBackgroundSettings({
    ...background,
    color: rawColor,
    image: rawImage,
  });
}

function getTemplateLogoHeader(template: Record<string, unknown>) {
  return isObject(template.logoHeader)
    ? (template.logoHeader as Partial<LogoHeaderSettings>)
    : undefined;
}

async function fetchTemplate(templateId: string) {
  const token = getBuilderAuthToken();
  const res = await fetch(`/api/templates/${templateId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "قالب یافت نشد");
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
      "برای ساخت صفحه جدید، یک قالب انتخاب کنید یا از صفحه خالی شروع کنید.";

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
            initialTitle: mode === "template" ? "قالب جدید" : undefined,
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
              ? String(template.name ?? "قالب جدید")
              : `صفحه جدید از ${String(template.name ?? "قالب")}`,
          initialDescription: String(template.description ?? ""),
          initialUrl: "new-page",
          initialCategoryId: categoryId,
          initialThumbnail:
            typeof template.thumbnail === "string" ? template.thumbnail : "",
          initialLogoHeader: getTemplateLogoHeader(template),
          initialBackground: getTemplateBackground(template),
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

  if (state.loading) return <MinimalLandingCreatorLoading />;

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">{state.error}</h1>
          <button
            onClick={() => router.push("/admin#templates")}
            className="mt-4 rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-700"
          >
            بازگشت به قالب ها
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
              template.name ?? summary.name ?? "قالب",
            )}`,
            initialDescription: String(template.description ?? ""),
            initialUrl: "new-page",
            initialCategoryId: categoryId,
            initialThumbnail:
              typeof template.thumbnail === "string" ? template.thumbnail : "",
            initialLogoHeader: getTemplateLogoHeader(template),
            initialBackground: getTemplateBackground(template),
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
      initialLogoHeader={state.initialLogoHeader}
      initialBackground={state.initialBackground}
      suppressSmartSuggestions={state.suppressSmartSuggestions}
    />
  );
}
