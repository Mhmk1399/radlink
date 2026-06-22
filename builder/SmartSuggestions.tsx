// builder/components/SmartSuggestions.tsx
"use client";

import { useMemo } from "react";
import { HiOutlineSparkles } from "react-icons/hi2";
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

export function SmartSuggestions({
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
