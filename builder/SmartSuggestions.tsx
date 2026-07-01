// builder/components/SmartSuggestions.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowPath,
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import { blockRegistry } from "@/builder/blocks/blockRegistry";

import { useTheme } from "@/contexts/ThemeContext";
type Template = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  blocks: string[];
};

const TEMPLATES: Template[] = [
  {
    id: "landing",
    title: "صفحه فرود",
    description: "بنر + لینک‌ها + دکمه اقدام",
    emoji: "🚀",
    gradient: "from-blue-500 to-indigo-600",
    blocks: ["banner", "simpleLink", "cta"],
  },
  {
    id: "shop",
    title: "فروشگاه",
    description: "بنر + محصولات + نظرات + تماس",
    emoji: "🛍",
    gradient: "from-emerald-500 to-teal-600",
    blocks: ["banner", "slider", "productCards", "testimonial", "contactInfo"],
  },
  {
    id: "personal",
    title: "پروفایل شخصی",
    description: "بنر + لینک‌ها + پیام‌رسان‌ها + استوری",
    emoji: "👤",
    gradient: "from-purple-500 to-pink-600",
    blocks: ["banner", "storyHighlights", "superLink", "messengerLinks"],
  },
  {
    id: "business",
    title: "کسب‌وکار",
    description: "بنر + خدمات + سوالات + نقشه + تماس",
    emoji: "🏢",
    gradient: "from-amber-500 to-orange-600",
    blocks: ["banner", "richText", "faq", "mapLinks", "contactInfo"],
  },
  {
    id: "event",
    title: "رویداد / کمپین",
    description: "بنر + شمارش معکوس + ویدیو + ثبت‌نام",
    emoji: "🎉",
    gradient: "from-rose-500 to-red-600",
    blocks: ["banner", "countdown", "video", "bookingForm", "cta"],
  },
  {
    id: "minimal",
    title: "مینیمال",
    description: "بنر + لینک‌ها",
    emoji: "✨",
    gradient: "from-neutral-600 to-neutral-800",
    blocks: ["banner", "simpleLink"],
  },
  {
    id: "content",
    title: "محتوایی",
    description: "بنر + متن + ویدیو + سوالات متداول",
    emoji: "📝",
    gradient: "from-cyan-500 to-blue-600",
    blocks: ["banner", "richText", "video", "separator", "faq"],
  },
  {
    id: "full",
    title: "صفحه کامل",
    description: "همه چیز! بنر + اسلایدر + محصولات + نظرات + ...",
    emoji: "💎",
    gradient: "from-violet-500 to-purple-700",
    blocks: [
      "banner",
      "slider",
      "storyHighlights",
      "productCards",
      "testimonial",
      "faq",
      "contactInfo",
      "messengerLinks",
      "cta",
    ],
  },
];

export function LegacySmartSuggestions({
  onApplyTemplate,
  onOpenCatalog,
  availableBlockTypes,
}: {
  onApplyTemplate: (blockTypes: string[]) => void;
  onOpenCatalog: () => void;
  availableBlockTypes?: string[];
}) {
  const availableTypes = useMemo(
    () => new Set(availableBlockTypes ?? Object.keys(blockRegistry)),
    [availableBlockTypes],
  );

  // فقط قالب‌هایی که همه بلاک‌هاشون موجوده
  const validTemplates = useMemo(
    () => TEMPLATES.filter((t) => t.blocks.every((b) => availableTypes.has(b))),
    [availableTypes],
  );

  const handleApply = (blockTypes: string[]) => {
    const valid = blockTypes.filter((t) => availableTypes.has(t));
    if (valid.length === 0) return;
    onApplyTemplate(valid);
  };

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200">
          <span className="text-3xl">🎨</span>
        </div>
        <h2 className="text-[18px] font-black text-neutral-800">
          صفحه‌ات رو بساز
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-neutral-400">
          یه قالب آماده انتخاب کن یا از صفر شروع کن
        </p>
      </div>

      {/* Templates */}
      {validTemplates.length > 0 && (
        <div className="mb-8 w-full max-w-md space-y-3">
          <div className="flex items-center gap-2 px-1">
            <HiOutlineSparkles size={14} className="text-amber-500" />
            <span className="text-[12px] font-bold text-neutral-600">
              شروع سریع
            </span>
          </div>

          <div className="grid gap-3">
            {validTemplates.map((template) => {
              const blockLabels = template.blocks
                .map(
                  (t) =>
                    blockRegistry[t as keyof typeof blockRegistry]?.label ?? t,
                )
                .join("  ·  ");

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleApply(template.blocks)}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-neutral-100 bg-white p-4 text-right transition-all duration-200 hover:border-neutral-200 hover:shadow-md active:scale-[0.98]"
                >
                  {/* Emoji */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${template.gradient} text-xl shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md`}
                  >
                    <span className="drop-shadow-sm">{template.emoji}</span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-neutral-800 group-hover:text-neutral-900">
                      {template.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-neutral-400 group-hover:text-neutral-500">
                      {template.description}
                    </p>
                    <p className="mt-1.5 truncate text-[10px] text-neutral-300">
                      {blockLabels}
                    </p>
                  </div>

                  {/* Block count */}
                  <div className="flex shrink-0 items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 transition-colors group-hover:bg-neutral-200">
                    <span className="text-[10px] font-bold tabular-nums text-neutral-500">
                      {template.blocks.length}
                    </span>
                    <span className="text-[9px] text-neutral-400">بلاک</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mb-6 flex w-full max-w-md items-center gap-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[11px] font-medium text-neutral-400">یا</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Manual */}
      <button
        type="button"
        onClick={onOpenCatalog}
        className="flex items-center gap-2.5 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-8 py-4 text-[13px] font-bold text-neutral-500 transition-all hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 hover:shadow-sm active:scale-[0.98]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
          ➕
        </span>
        شروع از صفر
      </button>
    </div>
  );
}

const themeTokens = {
  dark: {
    pageBg: "bg-[#141418]",
    cardBg: "bg-[#1c1c22]",
    cardBgHover: "hover:bg-[#22222a]",
    inputBg: "bg-[#1e1e26]",
    modalBg: "bg-[#1a1a20]",
    dropdownBg: "bg-[#1e1e26]/98 backdrop-blur-xl",
    hoverBg: "hover:bg-[#ffffff08]",
    activeBg: "bg-[#c9a84c]/8",
    selectedBg: "bg-[#c9a84c]/[0.04]",
    textPrimary: "text-[#e8e6e3]",
    textSecondary: "text-[#9e9a93]",
    textMuted: "text-[#706c65]",
    textDisabled: "text-[#4a4740]",
    textAccent: "text-[#d4b863]",
    textError: "text-[#e87c7c]",
    textOnAccent: "text-[#1a1a1f]",
    borderSubtle: "border-[#2a2a32]",
    borderInput: "border-[#2e2e38]",
    borderAccent: "border-[#c9a84c]/20",
    borderHover: "hover:border-[#3a3a44]",
    divider: "border-[#2a2a32]/60",
    cardShadow: "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.4)]",
    dropdownShadow: "shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",
    accentSoft: "bg-[#c9a84c]/6",
    accentMedium: "bg-[#c9a84c]/10",
    accentMediumHover: "hover:bg-[#c9a84c]/10",
    accentGradient:
      "bg-gradient-to-r from-[#a0833a] via-[#c9a84c] to-[#dfc06a]",
    accentGradientHover:
      "group-hover:bg-gradient-to-r group-hover:from-[#a0833a] group-hover:via-[#c9a84c] group-hover:to-[#dfc06a] group-hover:text-[#1a1a1f]",
    accentText: "#d4b863",
    accentBorder: "#c9a84c",
    successBg: "bg-[#2a6e4e]/12",
    successText: "text-[#6ec99a]",
    errorBg: "bg-[#8c3a3a]/12",
    errorText: "text-[#e87c7c]",
    warningBg: "bg-[#8c6e2a]/12",
    warningText: "text-[#d4b863]",
    loadingOverlay: "bg-[#1a1a20]/75",
  },
  light: {
    pageBg: "bg-[#f8f6f1]",
    cardBg: "bg-white",
    cardBgHover: "hover:bg-[#fafaf8]",
    inputBg: "bg-[#f5f3ee]",
    modalBg: "bg-white",
    dropdownBg: "bg-white/98 backdrop-blur-xl",
    hoverBg: "hover:bg-[#00000006]",
    activeBg: "bg-[#8a7032]/6",
    selectedBg: "bg-[#8a7032]/[0.03]",
    textPrimary: "text-[#2c2a25]",
    textSecondary: "text-[#6b665c]",
    textMuted: "text-[#9e9788]",
    textDisabled: "text-[#c4bfb4]",
    textAccent: "text-[#7a6428]",
    textError: "text-[#c44040]",
    textOnAccent: "text-white",
    borderSubtle: "border-[#e8e4dc]",
    borderInput: "border-[#ddd9d0]",
    borderAccent: "border-[#8a7032]/20",
    borderHover: "hover:border-[#ccc7bc]",
    divider: "border-[#e8e4dc]/70",
    cardShadow: "shadow-[0_1px_8px_-2px_rgba(0,0,0,0.06)]",
    dropdownShadow: "shadow-[0_6px_24px_-6px_rgba(0,0,0,0.1)]",
    accentSoft: "bg-[#8a7032]/5",
    accentMedium: "bg-[#8a7032]/8",
    accentMediumHover: "hover:bg-[#8a7032]/8",
    accentGradient: "bg-[#8a7032]",
    accentGradientHover: "group-hover:bg-[#8a7032] group-hover:text-white",
    accentText: "#7a6428",
    accentBorder: "#8a7032",
    successBg: "bg-[#e6f5ed]",
    successText: "text-[#2d7a50]",
    errorBg: "bg-[#fce8e8]",
    errorText: "text-[#c44040]",
    warningBg: "bg-[#f5f0e0]",
    warningText: "text-[#8a7032]",
    loadingOverlay: "bg-white/75",
  },
} as const;

type CatalogCategory = {
  id: string;
  name: string;
  description: string;
};

type CatalogTemplate = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  categoryId: string;
};

type CatalogResponse = {
  categories?: CatalogCategory[];
  templates?: CatalogTemplate[];
  message?: string;
};

export function SmartSuggestions({
  open,
  onStartBlank,
  onSelectTemplate,
  onBack,
}: {
  open: boolean;
  onStartBlank: () => void;
  onSelectTemplate: (
    template: Record<string, unknown>,
    summary: CatalogTemplate,
  ) => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const t = themeTokens[theme];

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [templates, setTemplates] = useState<CatalogTemplate[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectingTemplateId, setSelectingTemplateId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadCatalog() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("auth_token") ?? "";
        const response = await fetch("/api/builder/template-catalog", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = (await response
          .json()
          .catch(() => null)) as CatalogResponse | null;

        if (!response.ok) {
          throw new Error(
            json?.message ?? "دریافت دسته‌بندی‌ها و قالب‌ها انجام نشد.",
          );
        }

        if (cancelled) return;
        setCategories(Array.isArray(json?.categories) ? json.categories : []);
        setTemplates(Array.isArray(json?.templates) ? json.templates : []);
      } catch (loadError) {
        if (!cancelled) {
          setCategories([]);
          setTemplates([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "دریافت دسته‌بندی‌ها و قالب‌ها انجام نشد.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, [open, retryKey]);

  const hasUncategorized = templates.some((template) => !template.categoryId);
  const filteredTemplates = useMemo(() => {
    if (activeCategoryId === "all") return templates;
    if (activeCategoryId === "uncategorized") {
      return templates.filter((template) => !template.categoryId);
    }
    return templates.filter(
      (template) => template.categoryId === activeCategoryId,
    );
  }, [activeCategoryId, templates]);

  const templateCountForCategory = (categoryId: string) =>
    templates.filter((template) => template.categoryId === categoryId).length;

  async function selectTemplate(template: CatalogTemplate) {
    if (selectingTemplateId) return;

    try {
      setSelectingTemplateId(template.id);
      setError(null);
      const token = localStorage.getItem("auth_token") ?? "";
      const response = await fetch(
        `/api/builder/template-catalog?id=${encodeURIComponent(template.id)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      const json = (await response.json().catch(() => null)) as {
        template?: Record<string, unknown>;
        message?: string;
      } | null;

      if (!response.ok || !json?.template) {
        throw new Error(json?.message ?? "بارگذاری قالب انجام نشد.");
      }

      onSelectTemplate(json.template, template);
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : "بارگذاری قالب انجام نشد.",
      );
    } finally {
      setSelectingTemplateId(null);
    }
  }

  if (!open) return null;

  const activeLabel =
    activeCategoryId === "all"
      ? "همه قالب‌ها"
      : activeCategoryId === "uncategorized"
        ? "بدون دسته‌بندی"
        : (categories.find((category) => category.id === activeCategoryId)
            ?.name ?? "قالب‌ها");

  const categoryButtonClass = (active: boolean) =>
    [
      "group/cat flex w-full min-w-[150px] items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-right transition-all",
      active
        ? `${t.borderAccent} ${t.accentMedium} ${t.textAccent} ${t.cardShadow}`
        : `border-transparent ${t.textSecondary} ${t.borderHover} ${t.hoverBg}`,
    ].join(" ");

  const countBadgeClass = (active: boolean) =>
    [
      "rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums transition",
      active
        ? `${t.accentMedium} ${t.textAccent}`
        : `${t.inputBg} ${t.textMuted}`,
    ].join(" ");
  const customScrollbar = `
  [scrollbar-width:thin]
  [scrollbar-color:rgba(148,163,184,0.55)_transparent]

  [&::-webkit-scrollbar]:h-1.5
  [&::-webkit-scrollbar]:w-1.5

  [&::-webkit-scrollbar-track]:bg-transparent

  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-slate-400/40

  hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/70
`;
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/10 p-3 backdrop-blur-xs sm:p-6"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-start-title"
    >
      {/* Modal box: fixed static size, never grows/shrinks with content */}
      <section
        className={`flex h-[88vh] max-h-[760px] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border ${t.borderSubtle} ${t.modalBg} ${t.dropdownShadow}`}
      >
        {/* Header */}
        <header
          className={`flex shrink-0 items-center justify-between gap-3 border-b ${t.borderSubtle} ${t.cardBg} px-4 py-4 sm:px-6`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${t.accentGradient} ${t.textOnAccent} ${t.cardShadow}`}
            >
              <HiOutlineSparkles size={22} />
            </span>
            <div className="min-w-0">
              <h1
                id="builder-start-title"
                className={`truncate text-base font-black ${t.textPrimary} sm:text-xl`}
              >
                صفحه جدید را چطور شروع می‌کنید؟
              </h1>
              <p className={`mt-0.5 text-xs ${t.textSecondary} sm:text-sm`}>
                یک دسته‌بندی و قالب انتخاب کنید یا صفحه را از صفر بسازید.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border ${t.borderInput} ${t.inputBg} px-3 text-xs font-bold ${t.textSecondary} transition ${t.borderHover} ${t.cardBgHover}`}
          >
            <HiOutlineArrowLeft size={16} />
            <span className="hidden sm:inline">بازگشت</span>
          </button>
        </header>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {loading ? (
            <div
              className={`flex flex-1 flex-col items-center justify-center gap-4 ${t.textSecondary}`}
            >
              <span
                className={`h-10 w-10 animate-spin rounded-full border-2 ${t.borderSubtle}`}
                style={{ borderTopColor: t.accentBorder }}
              />
              <p className="text-sm font-semibold">
                در حال دریافت دسته‌بندی‌ها و قالب‌ها...
              </p>
            </div>
          ) : error && categories.length === 0 && templates.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${t.errorBg} ${t.errorText}`}
              >
                <HiOutlineArrowPath size={24} />
              </span>
              <p className={`mt-4 max-w-md text-sm font-bold ${t.textPrimary}`}>
                {error}
              </p>
              <button
                type="button"
                onClick={() => setRetryKey((value) => value + 1)}
                className={`mt-5 inline-flex items-center gap-2 rounded-xl ${t.accentGradient} px-5 py-3 text-sm font-bold ${t.textOnAccent} transition hover:opacity-90`}
              >
                <HiOutlineArrowPath size={17} />
                تلاش دوباره
              </button>
              <button
                type="button"
                onClick={onStartBlank}
                className={`mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-dashed ${t.borderAccent} ${t.accentSoft} px-5 py-3 text-sm font-bold ${t.textAccent} transition ${t.accentMediumHover}`}
              >
                <HiOutlinePlus size={17} />
                شروع از صفحه خالی
              </button>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {/* Sidebar — static container, list scrolls internally if long */}
              <aside
                className={`flex shrink-0 flex-col border-b ${t.borderSubtle} ${t.pageBg} lg:w-[268px] lg:border-b-0 lg:border-l`}
              >
                <div className="flex items-center gap-2 px-4 pb-3 pt-4 lg:px-5">
                  <HiOutlineSquares2X2 size={16} className={t.textAccent} />
                  <h2 className={`text-sm font-black ${t.textPrimary}`}>
                    دسته‌بندی‌ها
                  </h2>
                </div>

                <div
                  className={`
    flex gap-2 overflow-x-auto overscroll-contain px-4 pb-4
    lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-1
    lg:overflow-x-hidden lg:overflow-y-auto lg:px-4
    ${customScrollbar}
  `}
                >
                  {" "}
                  <button
                    type="button"
                    onClick={() => setActiveCategoryId("all")}
                    className={categoryButtonClass(activeCategoryId === "all")}
                  >
                    <span className="font-bold text-sm">همه قالب‌ها</span>
                    <span
                      className={countBadgeClass(activeCategoryId === "all")}
                    >
                      {templates.length.toLocaleString("fa-IR")}
                    </span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategoryId(category.id)}
                      className={categoryButtonClass(
                        activeCategoryId === category.id,
                      )}
                      title={category.description || category.name}
                    >
                      <span className="truncate font-bold  text-xs">
                        {category.name}
                      </span>
                      <span
                        className={countBadgeClass(
                          activeCategoryId === category.id,
                        )}
                      >
                        {templateCountForCategory(category.id).toLocaleString(
                          "fa-IR",
                        )}
                      </span>
                    </button>
                  ))}
                  {hasUncategorized && (
                    <button
                      type="button"
                      onClick={() => setActiveCategoryId("uncategorized")}
                      className={categoryButtonClass(
                        activeCategoryId === "uncategorized",
                      )}
                    >
                      <span className="font-bold">بدون دسته‌بندی</span>
                      <span
                        className={countBadgeClass(
                          activeCategoryId === "uncategorized",
                        )}
                      >
                        {templates
                          .filter((template) => !template.categoryId)
                          .length.toLocaleString("fa-IR")}
                      </span>
                    </button>
                  )}
                </div>

                <div
                  className={`mt-auto border-t ${t.borderSubtle} p-4 lg:p-3`}
                >
                  <button
                    type="button"
                    onClick={onStartBlank}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed ${t.borderAccent} ${t.accentSoft} px-4 py-3 text-sm font-black ${t.textAccent} transition ${t.accentMediumHover}`}
                  >
                    <HiOutlinePlus size={18} />
                    شروع از صفحه خالی
                  </button>
                </div>
              </aside>

              {/* Main — only the templates list scrolls */}
              <main className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div
                  className={`flex shrink-0 items-center justify-between gap-3 border-b ${t.borderSubtle} ${t.modalBg} px-4 py-3.5 sm:px-6`}
                >
                  <div className="min-w-0">
                    <h2
                      className={`truncate text-sm font-black ${t.textPrimary}`}
                    >
                      {activeLabel}
                    </h2>
                    <p className={`mt-0.5 text-xs ${t.textSecondary}`}>
                      تمام محتوا و استایل‌های قالب به صفحه جدید منتقل می‌شود.
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-lg ${t.accentMedium} px-2.5 py-1.5 text-xs font-bold tabular-nums ${t.textAccent}`}
                  >
                    {filteredTemplates.length.toLocaleString("fa-IR")} مورد
                  </span>
                </div>

                <div
                  className={`min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 ${customScrollbar}`}
                >
                  {" "}
                  {error && (
                    <div
                      className={`mb-4 rounded-xl border ${t.borderAccent} ${t.errorBg} px-4 py-3 text-xs font-semibold ${t.errorText}`}
                    >
                      {error}
                    </div>
                  )}
                  {filteredTemplates.length === 0 ? (
                    <div
                      className={`flex min-h-[330px] flex-col items-center justify-center rounded-2xl border-2 border-dashed ${t.borderSubtle} ${t.cardBg} px-4 text-center`}
                    >
                      <HiOutlinePhoto size={30} className={t.textDisabled} />
                      <p className={`mt-3 text-sm font-bold ${t.textPrimary}`}>
                        قالبی در این دسته‌بندی وجود ندارد
                      </p>
                      <p className={`mt-1 text-xs ${t.textMuted}`}>
                        می‌توانید دسته دیگری انتخاب کنید یا از صفحه خالی شروع
                        کنید.
                      </p>
                    </div>
                  ) : (
                    <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredTemplates.map((template) => {
                        const selecting = selectingTemplateId === template.id;
                        return (
                          <button
                            key={template.id}
                            type="button"
                            disabled={Boolean(selectingTemplateId)}
                            onClick={() => void selectTemplate(template)}
                            className={`group flex flex-col overflow-hidden rounded-2xl border ${t.borderSubtle} ${t.cardBg} text-right ${t.cardShadow} transition-all duration-200 hover:-translate-y-1 ${t.borderHover} ${t.cardBgHover} disabled:cursor-wait disabled:opacity-65`}
                          >
                            <span
                              className={`relative block aspect-[16/10] overflow-hidden ${t.pageBg}`}
                            >
                              {template.thumbnail ? (
                                <span
                                  role="img"
                                  aria-label={template.name}
                                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
                                  style={{
                                    backgroundImage: `url("${template.thumbnail}")`,
                                  }}
                                />
                              ) : (
                                <span
                                  className={`absolute inset-0 flex items-center justify-center ${t.textDisabled}`}
                                >
                                  <HiOutlinePhoto size={34} />
                                </span>
                              )}
                              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                              {selecting && (
                                <span
                                  className={`absolute inset-0 flex items-center justify-center ${t.loadingOverlay} backdrop-blur-sm`}
                                >
                                  <span
                                    className={`h-8 w-8 animate-spin rounded-full border-2 ${t.borderSubtle}`}
                                    style={{ borderTopColor: t.accentBorder }}
                                  />
                                </span>
                              )}
                            </span>
                            <span className="flex flex-1 flex-col p-4">
                              <span
                                className={`block truncate text-sm font-black ${t.textPrimary}`}
                              >
                                {template.name}
                              </span>
                              <span
                                className={`mt-1.5 block min-h-10 text-xs leading-5 ${t.textSecondary} line-clamp-2`}
                              >
                                {template.description ||
                                  "بدون توضیحات برای این قالب"}
                              </span>
                              <span className="mt-auto pt-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg ${t.accentMedium} px-3 py-1.5 text-[11px] font-bold ${t.textAccent} transition ${t.accentGradientHover}`}
                                >
                                  انتخاب و ساخت صفحه
                                  <HiOutlineArrowLeft size={13} />
                                </span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </main>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
