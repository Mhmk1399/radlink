"use client";

import Link from "next/link";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  typography,
  layout,
  animation,
  components,
  accentTokens,
  animDelay,
  toPersian,
  type AccentColor,
} from "@/lib/design/design-system";

/* ──────────────────────────────────────────────
   SHARED BG — static, one orb, desktop only.
   (Animated blur-3xl orbs re-run the GPU filter
   every frame — main source of scroll lag.)
   ────────────────────────────────────────────── */

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
          "absolute right-0 top-1/3 hidden h-56 w-56 rounded-full blur-2xl lg:block",
          backgrounds.glow.skyOrb,
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

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn("h-4 w-4", className)}
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   DATA — TARGET AUDIENCE
   ────────────────────────────────────────────── */

interface AudienceCard {
  title: string;
  description: string;
  color: AccentColor;
  icon: React.ReactNode;
}

const audienceCards: AudienceCard[] = [
  {
    title: "افراد و برندهای شخصی",
    description:
      "مناسب اینفلوئنسرها، فریلنسرها، مشاوران، مدرس‌ها، هنرمندان، طراحان و تولیدکنندگان محتوا.",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372c1.035 0 2.03-.167 2.96-.474M15 19.128v-.378c0-.62.504-1.125 1.125-1.125h.375c1.621 0 3.057-.81 3.924-2.05M15 19.128a9.714 9.714 0 0 1-3 .372m-3 0a9.714 9.714 0 0 1-3-.372m3 .372v-.378c0-.62-.504-1.125-1.125-1.125H7.5c-1.621 0-3.057-.81-3.924-2.05M9 19.128a9.38 9.38 0 0 1-2.625.372c-1.035 0-2.03-.167-2.96-.474M12 15a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm7.5-3a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Zm-15 0a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "کسب‌وکارهای کوچک",
    description:
      "مناسب سالن‌های زیبایی، کلینیک‌ها، مزون‌ها، کافه‌ها، رستوران‌ها، آموزشگاه‌ها و کسب‌وکارهای محلی.",
    color: "pink",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M3.75 21h16.5M4.5 3h15l-.75 6a3 3 0 0 1-3 2.625H8.25A3 3 0 0 1 5.25 9L4.5 3Zm2.25 18v-7.5A1.5 1.5 0 0 1 8.25 12h7.5a1.5 1.5 0 0 1 1.5 1.5V21M9.75 21v-4.5h4.5V21"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "شرکت‌ها و تیم‌های خدماتی",
    description:
      "برای نمایش اطلاعات تماس، مسیرهای ارتباطی، نمونه‌کارها، لینک‌های مهم و خدمات شرکت.",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M3.75 21h16.5M5.25 21V6.75A.75.75 0 0 1 6 6h4.5a.75.75 0 0 1 .75.75V21m-6 0h12m-6 0V3.75A.75.75 0 0 1 12 3h6a.75.75 0 0 1 .75.75V21M8.25 9.75h.008v.008H8.25V9.75Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm6-6h.008v.008h-.008V9.75Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "کمپین‌ها و رویدادها",
    description:
      "برای معرفی رویداد، ثبت‌نام، اطلاع‌رسانی، کمپین تبلیغاتی یا صفحه معرفی سریع.",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M6.75 3v2.25M17.25 3v2.25M3 8.25h18M5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V8.25A2.25 2.25 0 0 0 18.75 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21Zm9-8.25h.008v.008h-.008V12.75Zm-4.5 0h.008v.008H9.75V12.75Zm0 3.75h.008v.008H9.75V16.5Zm4.5 0h.008v.008h-.008V16.5Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/* ──────────────────────────────────────────────
   DATA — HOW IT WORKS
   ────────────────────────────────────────────── */

interface StepItem {
  title: string;
  text: string;
  color: AccentColor;
  icon: React.ReactNode;
}

const steps: StepItem[] = [
  {
    title: "ثبت‌نام کن",
    text: "با شماره موبایل یا ایمیل وارد شو و حساب کاربری خودت را بساز.",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "صفحه‌ات را طراحی کن",
    text: "نام کاربری انتخاب کن، بلوک‌ها را اضافه کن، رنگ و ظاهر صفحه را شخصی‌سازی کن.",
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "لینکت را منتشر کن",
    text: "لینک صفحه یا QR Code را در شبکه‌های اجتماعی، کارت ویزیت و تبلیغات به اشتراک بگذار.",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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
];

/* ──────────────────────────────────────────────
   AUDIENCE CARD
   ────────────────────────────────────────────── */

function AudienceCardComponent({
  item,
  index,
}: {
  item: AudienceCard;
  index: number;
}) {
  const tokens = accentTokens[item.color];

  return (
    <article
      className={cn(
        animation.classes.fadeUp,
        animDelay(index + 2),
        "group relative overflow-hidden p-6 sm:p-8",
        layout.radius.xl,
        borders.subtle,
        backgrounds.surface.card,
        animation.smooth,
        tokens.borderHover,
        tokens.shadow,
        animation.hoverLiftLg,
        "hover:shadow-[0_30px_60px_-25px]",
      )}
    >
      {/* Corner glow — smaller blur, opacity-only */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl",
          tokens.glow,
          "opacity-0 group-hover:opacity-100",
          animation.opacity,
        )}
      />

      <div
        className={cn(
          "relative inline-flex p-0.5 shadow-lg",
          components.iconBox.lg,
          borders.light,
          `bg-linear-to-br ${tokens.gradient}`,
        )}
      >
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-[14px] text-white",
            backgrounds.surface.darkAlt,
          )}
        >
          {item.icon}
        </div>
      </div>

      <div
        className={cn(
          components.numberBadge,
          "absolute left-6 top-6 sm:left-8 sm:top-8",
        )}
      >
        {toPersian(index + 1)}
      </div>

      <h3 className={cn("mt-5", typography.cardTitle)}>{item.title}</h3>
      <p className={cn("mt-3", typography.cardDescription)}>
        {item.description}
      </p>

      <div className={cn("mt-5 flex items-center gap-2", typography.link)}>
        <span>مناسب برای این گروه</span>
        <ArrowIcon
          className={cn(
            "-scale-x-100",
            "transition-transform duration-200",
            "group-hover:-translate-x-1",
          )}
        />
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────
   STEP CARD
   ────────────────────────────────────────────── */

function StepCard({
  step,
  index,
  isLast,
}: {
  step: StepItem;
  index: number;
  isLast: boolean;
}) {
  const t = accentTokens[step.color];
  const stepNum = toPersian(index + 1);

  return (
    <div className="relative flex flex-col items-center">
      {/* ── Card ── */}
      <article
        className={cn(
          animation.classes.fadeUp,
          "group relative flex h-full w-full flex-col overflow-hidden",
          "min-h-55",
          "rounded-3xl border p-6 sm:p-7",
          borders.subtle,
          backgrounds.surface.card,
          "transition-[border-color,transform,box-shadow] duration-300",
          "hover:-translate-y-1 hover:border-white/12",
          "hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]",
        )}
        style={{ animationDelay: `${index * 0.12 + 0.15}s` }}
      >
        {/* Corner glow — smaller blur, opacity-only */}
        <div
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl",
            t.glow,
            "opacity-0 group-hover:opacity-100",
            animation.opacity,
          )}
        />

        {/* ── Header row: Number + Icon ── */}
        <div className="relative flex items-center justify-between">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl border",
              t.border,
              t.bg,
              "transition-transform duration-300 group-hover:scale-105",
            )}
          >
            <span className={cn("text-base font-black", t.text)}>
              {stepNum}
            </span>
          </div>

          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border p-0.5",
              "bg-linear-to-br",
              t.gradient,
              borders.light,
              "shadow-lg",
              "transition-transform duration-300 group-hover:scale-105",
            )}
          >
            <div
              className={cn(
                "flex h-full w-full items-center justify-center rounded-[14px] text-white",
                backgrounds.surface.darkAlt,
              )}
            >
              {step.icon}
            </div>
          </div>
        </div>

        {/* ── Title ── */}
        <h3 className="mt-5 text-lg font-bold text-white sm:text-xl">
          {step.title}
        </h3>

        {/* ── Description ── */}
        <p className="mt-2.5 flex-1 text-[13px] leading-6 text-slate-300/80 sm:text-sm sm:leading-7">
          {step.text}
        </p>

        {/* ── Bottom indicator ── */}
        <div className="mt-5 flex items-center gap-2">
          {/* Progress dots — the old runtime-built shadow class
              (t.dot.replace("bg-","shadow-")) never compiled in
              Tailwind; a static ring renders the same halo */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, di) => (
              <div
                key={di}
                className={cn(
                  "h-1.5 rounded-full",
                  di === index
                    ? cn("w-5", t.dot, "ring-2 ring-white/10")
                    : di < index
                      ? "w-1.5 bg-white/20"
                      : "w-1.5 bg-white/8",
                )}
              />
            ))}
          </div>

          <span
            className={cn("mr-auto text-[10px] font-medium opacity-60", t.text)}
          >
            مرحله {stepNum} از {toPersian(steps.length)}
          </span>
        </div>
      </article>

      {/* ── Connectors —
          the old `from-${step.color}-400/30` classes were built at
          runtime, so Tailwind never generated them and the gradient
          lines were invisible; replaced with static classes ── */}
      {!isLast && (
        <>
          {/* Mobile: vertical */}
          <div className="flex flex-col items-center py-2 lg:hidden">
            <div className="h-6 w-px bg-linear-to-b from-white/20 to-transparent" />
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border",
                borders.subtle,
                backgrounds.surface.glassMedium,
              )}
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3 text-slate-500"
              >
                <path
                  fillRule="evenodd"
                  d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="h-6 w-px bg-linear-to-b from-transparent to-white/20" />
          </div>

          {/* Desktop: horizontal — positioned between cards */}
          <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-x-full -translate-y-1/2 items-center px-1 lg:flex">
            <div className="h-px w-4 bg-linear-to-r from-white/15 to-transparent" />
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border",
                borders.subtle,
                backgrounds.surface.glassMedium,
              )}
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3 -scale-x-100 text-slate-500"
              >
                <path
                  fillRule="evenodd"
                  d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="h-px w-4 bg-linear-to-l from-transparent to-white/15" />
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   TARGET AUDIENCE SECTION
   ────────────────────────────────────────────── */

export function TargetAudienceSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="use-cases"
        dir="rtl"
        className={cn(
          "relative overflow-hidden",
          layout.section,
          "[content-visibility:auto] [contain-intrinsic-size:auto_1000px]",
        )}
      >
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          <div className={components.sectionHeader}>
            <div
              className={cn(
                animation.classes.fadeUp,
                components.badge.base,
                components.badge.violet,
              )}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-violet-300"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 0 0-4 4v.126a4 4 0 0 0-2.386 6.98l3.89 3.696a3.5 3.5 0 0 0 4.992 0l3.89-3.696A4 4 0 0 0 14 6.126V6a4 4 0 0 0-4-4Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={cn(typography.badge, "text-violet-200")}>
                گروه‌های هدف
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
              این پلتفرم برای چه کسانی{" "}
              <span className={gradients.textPrimary}>مناسب است؟</span>
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mt-5",
                typography.body,
              )}
            >
              هر کسی که نیاز دارد خودش، خدماتش یا برندش را حرفه‌ای‌تر معرفی کند،
              می‌تواند از این ابزار استفاده کند.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:mt-16 md:grid-cols-2 xl:mt-20 xl:grid-cols-4 xl:gap-6">
            {audienceCards.map((item, i) => (
              <AudienceCardComponent key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────
   HOW IT WORKS SECTION
   ────────────────────────────────────────────── */

export function HowItWorksSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="how-it-works"
        dir="rtl"
        className={cn(
          "relative overflow-hidden",
          layout.section,
          "[content-visibility:auto] [contain-intrinsic-size:auto_1100px]",
        )}
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
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.53-9.28a.75.75 0 0 0-1.06-1.06L9.75 10.38 8.53 9.16a.75.75 0 1 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l3.25-3.25Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={cn(typography.badge, "text-sky-200")}>
                شروع سریع
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
              ساخت صفحه در{" "}
              <span className={gradients.textPrimary}>سه مرحله ساده</span>
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mt-4",
                typography.body,
              )}
            >
              بدون نیاز به هیچ دانش فنی، صفحه اختصاصی خودت را بساز و منتشر کن.
            </p>
          </div>

          {/* ── Steps timeline ── */}
          <div className="mx-auto mt-12 max-w-5xl sm:mt-14 lg:mt-16">
            {/* Desktop: top progress bar */}
            <div className="mb-8 hidden lg:block">
              <div className="relative mx-auto max-w-2xl">
                <div className="h-1 rounded-full bg-white/6" />
                <div className="absolute inset-y-0 right-0 w-full rounded-full bg-linear-to-l from-sky-400/30 via-cyan-400/20 to-emerald-400/30" />

                {/* Dots — static ring instead of the broken
                    runtime-built shadow class */}
                <div className="absolute inset-y-0 right-0 flex w-full items-center justify-between">
                  {steps.map((step, i) => {
                    const t = accentTokens[step.color];
                    return (
                      <div
                        key={i}
                        className="relative flex flex-col items-center"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2",
                            t.border,
                            "bg-[#060e1b]",
                            "ring-4 ring-white/5",
                          )}
                        >
                          <span className={cn("text-xs font-bold", t.text)}>
                            {toPersian(i + 1)}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "mt-2 text-[10px] font-medium opacity-50",
                            t.text,
                          )}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="grid gap-0 lg:grid-cols-3 lg:gap-5">
              {steps.map((step, i) => (
                <StepCard
                  key={step.title}
                  step={step}
                  index={i}
                  isLast={i === steps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(5),
              "mt-12 flex justify-center sm:mt-14",
            )}
          >
            <div
              className={cn(
                "flex flex-col items-center gap-4 rounded-2xl border px-8 py-6 text-center sm:flex-row sm:gap-6",
                borders.subtle,
                backgrounds.surface.glassMedium,
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border",
                  accentTokens.emerald.border,
                  accentTokens.emerald.bg,
                )}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={cn("h-6 w-6", accentTokens.emerald.text)}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-sm font-bold text-white">
                  همین الان شروع کن
                </p>
                <p className={cn("mt-0.5", typography.bodySmall)}>
                  کمتر از ۲ دقیقه طول می‌کشه
                </p>
              </div>

              <Link
                href="/auth"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold",
                  accentTokens.emerald.border,
                  accentTokens.emerald.bg,
                  accentTokens.emerald.text,
                  "transition-[filter,transform] duration-200",
                  "hover:brightness-125",
                  "active:scale-[0.96]",
                )}
              >
                <span>ساخت حساب رایگان</span>
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5 -scale-x-100"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
