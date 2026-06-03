"use client";

import { useState, useEffect, useRef } from "react";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  shadows,
  typography,
  layout,
  animation,
  focus,
  components,
  accentTokens,
  animDelay,
  toPersian,
  type AccentColor,
} from "@/lib/design/design-system";

/* ══════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════ */

const blocksKeyframes = `
@keyframes blocks-morph{0%{border-radius:16px}50%{border-radius:20px}100%{border-radius:16px}}
@keyframes blocks-slide-in{0%{opacity:0;transform:translateY(16px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes blocks-phone-float{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-10px) rotate(.5deg)}66%{transform:translateY(-6px) rotate(-.5deg)}}
@keyframes blocks-card-glow{0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,0)}50%{box-shadow:0 0 20px -4px var(--glow-color)}}
.blocks-slide-in{animation:blocks-slide-in .5s cubic-bezier(.22,1,.36,1) both}
.blocks-phone-float{animation:blocks-phone-float 8s ease-in-out infinite}
`;

/* ══════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════ */

interface BlockItem {
  title: string;
  description: string;
  color: AccentColor;
  icon: React.ReactNode;
}

const blockItems: BlockItem[] = [
  {
    title: "لینک ساده",
    description: "سایت، فرم، کمپین یا هر صفحه خارجی",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.553-4.244a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 0 6.364 6.364l-1.757 1.757"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0.5 2.5) scale(.88)"
        />
      </svg>
    ),
  },
  {
    title: "سوپر لینک",
    description: "پیشنهاد ویژه، محصول یا CTA مهم",
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "شبکه‌های اجتماعی",
    description: "اینستاگرام، تلگرام، واتساپ و بقیه",
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 2.186 0m-2.186 0c.324.18.696.283 1.093.283s.77-.103 1.093-.283m-2.186 12.814a2.25 2.25 0 1 0 2.186 0m-2.186 0c.324.18.696.283 1.093.283s.77-.103 1.093-.283"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "پیام‌رسان‌ها",
    description: "تماس، پیامک، واتساپ و تلگرام",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "اطلاعات تماس",
    description: "شماره، ایمیل، آدرس و ساعت کاری",
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "آدرس و مسیریابی",
    description: "موقعیت مکانی و دکمه مسیریابی",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "متن و معرفی",
    description: "معرفی فرد، برند یا خدمات",
    color: "rose",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "تصویر و اسلایدر",
    description: "عکس‌ها، گالری و نمونه‌کارها",
    color: "pink",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "ویدئو",
    description: "آپارات، یوتیوب یا فایل آپلودی",
    color: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "سوالات متداول",
    description: "سوال و جواب آکاردئونی",
    color: "indigo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "شمارنده معکوس",
    description: "کمپین‌ها، رویدادها و تخفیف‌ها",
    color: "orange",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "بنر اطلاع‌رسانی",
    description: "تبلیغ، اعلان یا پیشنهاد ویژه",
    color: "teal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════
   SECTION BG
   ══════════════════════════════════════════════ */

function SectionBackground() {
  return (
    <div className="pointer-events-none absolute inset-0"> 
      <div
        className={cn(
          "absolute left-1/2 top-0 h-150 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
          backgrounds.glow.hero,
        )}
      />
      <div
        className={cn(
          "absolute right-0 top-1/3 h-64 w-64 rounded-full blur-3xl",
          backgrounds.glow.skyOrb,
          animation.classes.floatSlow,
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl",
          backgrounds.glow.blueOrb,
          animation.classes.floatMedium,
        )}
      />
      <div className={cn("absolute inset-0", backgrounds.grid.lines)} />
      <div
        className={cn(
          "absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2",
          gradients.divider,
        )}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   PHONE MOCKUP
   ══════════════════════════════════════════════ */

function PhoneMockup({ activeBlock }: { activeBlock: number }) {
  const preview = blockItems.slice(0, 5);

  return (
    <div className="relative mx-auto w-60 sm:w-65 md:w-67.5 lg:w-70">
      <div className="absolute -inset-5 rounded-[3rem] bg-linear-to-b from-sky-400/12 via-blue-500/8 to-transparent blur-2xl" />

      <div className={components.phoneMockup.outer}>
        <div className={components.phoneMockup.inner}>
          <div className={components.phoneMockup.notch} />

          {/* Toolbar */}
          <div
            className={cn(
              "mx-3 mt-3 flex items-center justify-between px-3 py-2",
              layout.radius.md,
              borders.subtle,
              backgrounds.surface.glass,
            )}
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-[9px] font-medium text-slate-300">
                ویرایشگر بلوکی
              </span>
            </div>
            <div className="flex gap-1">
              {[
                "M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z",
                "M2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Z",
              ].map((d, i) => (
                <div
                  key={i}
                  className="flex h-4 w-4 items-center justify-center rounded border border-white/8 bg-white/4"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-2 w-2 text-slate-500"
                  >
                    <path d={d} />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-1.5 p-3 pt-2">
            {preview.map((block, i) => {
              const t = accentTokens[block.color];
              const isActive = i === activeBlock % preview.length;
              return (
                <div
                  key={block.title} 
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all duration-300",
                    isActive
                      ? cn(t.border, t.bg, "shadow-md")
                      : "border-white/5 bg-white/2",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col gap-0.5 transition-opacity",
                      isActive ? "opacity-70" : "opacity-20",
                    )}
                  > 
                    {[0, 1].map((r) => (
                      <div key={r} className="flex gap-0.5">
                        <div className="h-0.5 w-0.5 rounded-full bg-slate-400" />
                        <div className="h-0.5 w-0.5 rounded-full bg-slate-400" />
                      </div>
                    ))}
                  </div>
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded",
                      isActive
                        ? cn(t.bg, t.text)
                        : "bg-white/4 text-slate-500",
                    )}
                  >
                    <div className="scale-[0.6]">{block.icon}</div>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-white" : "text-slate-400",
                    )}
                  >
                    {block.title}
                  </span>
                  {isActive && (
                    <div
                      className={cn("mr-auto h-1 w-1 rounded-full", t.dot)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Add button */}
          <div className="mx-3 mb-3">
            <div className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-white/10 bg-white/1 py-2">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-2.5 w-2.5 text-sky-400/50"
              >
                <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
              </svg>
              <span className="text-[9px] font-medium text-sky-300/50">
                افزودن بلوک
              </span>
            </div>
          </div>

          <div className={components.phoneMockup.homeBar} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   BLOCK CARD
   ══════════════════════════════════════════════ */

function BlockCard({
  block,
  index,
  isActive,
  onActivate,
}: {
  block: BlockItem;
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) {
  const t = accentTokens[block.color];

  return (
    <button
      type="button"
      onClick={onActivate}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={cn(
        "blocks-slide-in group relative flex items-center gap-3 overflow-hidden text-right",
        // Padding ریسپانسیو
        "p-3 sm:p-3.5 md:p-4",
        // Shape
        "rounded-xl sm:rounded-2xl border",
        // Transitions
        "transition-all duration-300 touch-manipulation",
        focus.ring,
        "active:scale-[0.98]",
        // Active vs default
        isActive
          ? cn(
              t.border,
              "bg-linear-to-r from-white/6 to-white/2",
              "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]", 
            )
          : cn(
              borders.subtle,
              "bg-white/2",
              "hover:border-white/10 hover:bg-white/4",
            ),
      )}
      style={{ animationDelay: `${Math.min(index * 0.03 + 0.1, 0.5)}s` }}
    >
      {/* Glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl transition-opacity duration-500",
          t.glow,
          isActive ? "opacity-80" : "opacity-0",
        )}
      />

      {/* Top line */}
      <div
        className={cn(
          "absolute inset-x-4 top-0 h-px bg-linear-to-r transition-opacity duration-300",
          t.gradient,
          isActive ? "opacity-50" : "opacity-0 group-hover:opacity-20",
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
          isActive
            ? cn(t.border, t.bg, t.text, "scale-105")
            : "border-white/8 bg-white/3 text-slate-500 group-hover:text-slate-300",
        )}
      >
        {block.icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] font-bold leading-tight transition-colors duration-200",
            isActive ? "text-white" : "text-slate-300 group-hover:text-white",
          )}
        >
          {block.title}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[11px] leading-snug transition-colors duration-200",
            isActive
              ? "text-slate-300"
              : "text-slate-500 group-hover:text-slate-400",
          )}
        >
          {block.description}
        </p>
      </div>

      {/* Active dot */}
      <div
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300",
          isActive
            ? cn(
                t.dot,
                `shadow-[0_0_8px] ${t.dot.replace("bg-", "shadow-")}`,
                "scale-100",
              )
            : "scale-0",
        )}
      />
    </button>
  );
}

/* ══════════════════════════════════════════════
   CATEGORY FILTER
   ══════════════════════════════════════════════ */

const categories = [
  { label: "همه", filter: null },
  { label: "لینک‌ها", filter: ["sky", "blue"] },
  { label: "ارتباطی", filter: ["cyan", "emerald", "violet", "amber"] },
  { label: "محتوایی", filter: ["rose", "pink", "red", "indigo"] },
  { label: "ابزارها", filter: ["orange", "teal"] },
];

/* ══════════════════════════════════════════════
   MAIN SECTION
   ══════════════════════════════════════════════ */

export function BlocksSection() {
  const [activeBlock, setActiveBlock] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredBlocks =
    activeCategory === 0
      ? blockItems
      : blockItems.filter((b) =>
          categories[activeCategory].filter?.includes(b.color),
        );

  // Auto-cycle active block
  useEffect(() => {
    const id = setInterval(() => {
      setActiveBlock((prev) => (prev + 1) % filteredBlocks.length);
    }, 3000);
    return () => clearInterval(id);
  }, [filteredBlocks.length]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />
      <style dangerouslySetInnerHTML={{ __html: blocksKeyframes }} />

      <section
        id="blocks"
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          {/* ── Header ── */}
          <div className={components.sectionHeader}>
            <div
              className={cn(
                animation.classes.fadeUp,
                components.badge.base,
                components.badge.sky,
              )}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn("h-4 w-4", accentTokens.sky.text)}
              >
                <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h2.5A2.25 2.25 0 0 1 9 4.25v2.5A2.25 2.25 0 0 1 6.75 9h-2.5A2.25 2.25 0 0 1 2 6.75v-2.5ZM2 13.25A2.25 2.25 0 0 1 4.25 11h2.5A2.25 2.25 0 0 1 9 13.25v2.5A2.25 2.25 0 0 1 6.75 18h-2.5A2.25 2.25 0 0 1 2 15.75v-2.5ZM11 4.25A2.25 2.25 0 0 1 13.25 2h2.5A2.25 2.25 0 0 1 18 4.25v2.5A2.25 2.25 0 0 1 15.75 9h-2.5A2.25 2.25 0 0 1 11 6.75v-2.5Z" />
              </svg>
              <span className={cn(typography.badge, "text-sky-200")}>
                سیستم بلوک‌ساز
              </span>
            </div>

            <h2
              className={cn(
                animation.classes.fadeUp,
                animDelay(1),
                "mt-5",
                typography.h2,
              )}
            >
              هر چیزی را با{" "}
              <span className={gradients.textPrimary}>بلوک‌ها</span> بساز
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mt-4",
                typography.body,
              )}
            >
              هسته اصلی پلتفرم، سیستم بلوک‌ساز است. بخش‌های مختلف صفحه را اضافه،
              ویرایش و جابه‌جا کن.
            </p>
          </div>

          {/* ── Category filter ── */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(3),
              "mt-10 flex justify-center",
            )}
          >
            <div
              ref={scrollRef}
              className={cn(
                "flex items-center gap-1 overflow-x-auto rounded-full border p-1 scrollbar-none",
                borders.subtle,
                backgrounds.surface.glassMedium,
              )}
            >
              {categories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    setActiveCategory(i);
                    setActiveBlock(0);
                  }}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 touch-manipulation",
                    i === activeCategory
                      ? cn(
                          accentTokens.sky.bg,
                          accentTokens.sky.border,
                          "border text-sky-200",
                        )
                      : "text-slate-400 hover:text-white hover:bg-white/4",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content: Grid + Phone ── */}
          <div
            className={cn(
              "mt-10 flex flex-col items-center gap-8 sm:mt-12 lg:mt-14 lg:flex-row lg:items-start lg:gap-10",
            )}
          >
            {/* Block cards */}
            <div className="w-full flex-1 order-2 lg:order-1">
              {/* Grid ریسپانسیو: 1 col mobile → 2 col tablet → 2 col desktop */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
                {filteredBlocks.map((block, i) => (
                  <BlockCard
                    key={block.title}
                    block={block}
                    index={i}
                    isActive={i === activeBlock}
                    onActivate={() => setActiveBlock(i)}
                  />
                ))}
              </div>

              {/* Count badge */}
              <div
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(5),
                  "mt-5 flex justify-center lg:justify-start",
                )}
              >
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-1.5",
                    borders.subtle,
                    backgrounds.surface.glassMedium,
                  )}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3 w-3 text-sky-400/50"
                  >
                    <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h2.5A2.25 2.25 0 0 1 9 4.25v2.5A2.25 2.25 0 0 1 6.75 9h-2.5A2.25 2.25 0 0 1 2 6.75v-2.5Z" />
                  </svg>
                  <span className={cn(typography.labelSmall)}>
                    <span className={accentTokens.sky.text}>
                      {toPersian(blockItems.length)}
                    </span>{" "}
                    نوع بلوک آماده
                  </span>
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div
              className={cn(
                animation.classes.fadeUp,
                animDelay(3),
                "shrink-0 order-1 lg:sticky lg:top-28 lg:order-2",
                "blocks-phone-float",
              )}
            >
              <PhoneMockup activeBlock={activeBlock} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
