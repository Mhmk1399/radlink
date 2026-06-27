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
            json?.message ?? "دریافت دسته‌بندی‌ها و تمپلیت‌ها انجام نشد.",
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
              : "دریافت دسته‌بندی‌ها و تمپلیت‌ها انجام نشد.",
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
        throw new Error(json?.message ?? "بارگذاری تمپلیت انجام نشد.");
      }

      onSelectTemplate(json.template, template);
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : "بارگذاری تمپلیت انجام نشد.",
      );
    } finally {
      setSelectingTemplateId(null);
    }
  }

  if (!open) return null;

  const categoryButtonClass = (active: boolean) =>
    [
      "flex min-w-[150px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-right transition",
      active
        ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
    ].join(" ");

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto bg-neutral-950/20 p-3 backdrop-blur-md sm:p-6"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-start-title"
    >
      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center">
        <section className="flex max-h-[calc(100vh-24px)] w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#f7f7f8] shadow-2xl sm:max-h-[calc(100vh-48px)]">
          <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <HiOutlineSparkles size={22} />
              </span>
              <div className="min-w-0">
                <h1
                  id="builder-start-title"
                  className="truncate text-base font-black text-neutral-900 sm:text-xl"
                >
                  صفحه جدید را چطور شروع می‌کنید؟
                </h1>
                <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                  یک دسته‌بندی و تمپلیت انتخاب کنید یا صفحه را از صفر بسازید.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50"
            >
              <HiOutlineArrowLeft size={16} />
              <span className="hidden sm:inline">بازگشت</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-neutral-500">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-violet-600" />
                <p className="text-sm font-semibold">
                  در حال دریافت دسته‌بندی‌ها و تمپلیت‌ها...
                </p>
              </div>
            ) : error && categories.length === 0 && templates.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center px-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <HiOutlineArrowPath size={24} />
                </span>
                <p className="mt-4 max-w-md text-sm font-bold text-neutral-800">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setRetryKey((value) => value + 1)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
                >
                  <HiOutlineArrowPath size={17} />
                  تلاش دوباره
                </button>
                <button
                  type="button"
                  onClick={onStartBlank}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <HiOutlinePlus size={17} />
                  شروع از صفحه خالی
                </button>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside>
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <HiOutlineSquares2X2
                      size={16}
                      className="text-violet-600"
                    />
                    <h2 className="text-sm font-black text-neutral-800">
                      دسته‌بندی‌ها
                    </h2>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                    <button
                      type="button"
                      onClick={() => setActiveCategoryId("all")}
                      className={categoryButtonClass(
                        activeCategoryId === "all",
                      )}
                    >
                      <span className="font-bold">همه تمپلیت‌ها</span>
                      <span className="rounded-lg bg-black/5 px-2 py-1 text-[11px] font-bold">
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
                        <span className="truncate font-bold">
                          {category.name}
                        </span>
                        <span className="rounded-lg bg-black/5 px-2 py-1 text-[11px] font-bold">
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
                        <span className="rounded-lg bg-black/5 px-2 py-1 text-[11px] font-bold">
                          {templates
                            .filter((template) => !template.categoryId)
                            .length.toLocaleString("fa-IR")}
                        </span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onStartBlank}
                    className="mt-4 flex w-full min-w-[190px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
                  >
                    <HiOutlinePlus size={18} />
                    شروع از صفحه خالی
                  </button>
                </aside>

                <main className="min-w-0">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-black text-neutral-800">
                        انتخاب تمپلیت
                      </h2>
                      <p className="mt-1 text-xs text-neutral-500">
                        تمام محتوا و استایل‌های تمپلیت به صفحه جدید منتقل
                        می‌شود.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-500 shadow-sm">
                      {filteredTemplates.length.toLocaleString("fa-IR")} مورد
                    </span>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                      {error}
                    </div>
                  )}

                  {filteredTemplates.length === 0 ? (
                    <div className="flex min-h-[330px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white px-4 text-center">
                      <HiOutlinePhoto size={30} className="text-neutral-300" />
                      <p className="mt-3 text-sm font-bold text-neutral-700">
                        تمپلیتی در این دسته‌بندی وجود ندارد
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        می‌توانید دسته دیگری انتخاب کنید یا از صفحه خالی شروع
                        کنید.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredTemplates.map((template) => {
                        const selecting = selectingTemplateId === template.id;
                        return (
                          <button
                            key={template.id}
                            type="button"
                            disabled={Boolean(selectingTemplateId)}
                            onClick={() => void selectTemplate(template)}
                            className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white text-right shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg disabled:cursor-wait disabled:opacity-65"
                          >
                            <span className="relative block aspect-[16/10] overflow-hidden bg-neutral-100">
                              {template.thumbnail ? (
                                <span
                                  role="img"
                                  aria-label={template.name}
                                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.03]"
                                  style={{
                                    backgroundImage: `url("${template.thumbnail}")`,
                                  }}
                                />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center text-neutral-300">
                                  <HiOutlinePhoto size={34} />
                                </span>
                              )}
                              {selecting && (
                                <span className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
                                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                                </span>
                              )}
                            </span>
                            <span className="block p-4">
                              <span className="block truncate text-sm font-black text-neutral-900">
                                {template.name}
                              </span>
                              <span className="mt-1.5 block min-h-10 text-xs leading-5 text-neutral-500">
                                {template.description ||
                                  "بدون توضیحات برای این تمپلیت"}
                              </span>
                              <span className="mt-3 inline-flex rounded-lg bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-700">
                                انتخاب و ساخت صفحه
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </main>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
