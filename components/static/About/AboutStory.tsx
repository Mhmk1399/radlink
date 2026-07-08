"use client";

import Link from "next/link";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  shadows,
  typography,
  layout,
  animation,
  components,
  accentTokens,
  toPersian,
  animDelay,
  type AccentColor,
} from "@/lib/design/design-system";

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

interface ValueItem {
  title: string;
  description: string;
  color: AccentColor;
  icon: React.ReactNode;
}

const values: ValueItem[] = [
  {
    title: "سادگی",
    description: "هر بخش از ابزار ساخت صفحه طوری طراحی شده که بدون آموزش هم قابل استفاده باشد.",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5m4.75-11.396c.251-.023.501-.05.75-.082m0 0a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.169.659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.59.659H9.06a2.25 2.25 0 0 1-1.591-.659L5 14.5"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "سرعت",
    description: "از ثبت‌نام تا انتشار صفحه نهایی، تنها چند دقیقه زمان می‌برد.",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M3.75 13.5 9 21l1.5-4.5m3-9L18 3l-6 9h4.5l-1.5 4.5"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "اعتماد",
    description: "امنیت اطلاعات کاربران و صاحبان صفحه، پیش‌فرض همه تصمیم‌های فنی ماست.",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M9 12.75 11.25 15 15 9.75M21 12c0 4.556-3.04 8.353-7.166 9.575a1.5 1.5 0 0 1-.907-.011C8.774 20.352 3 16.585 3 12V6.741a1.5 1.5 0 0 1 .966-1.4l7.5-2.815a1.5 1.5 0 0 1 1.068 0l7.5 2.815a1.5 1.5 0 0 1 .966 1.4V12Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "پشتیبانی واقعی",
    description: "پشت هر تیکت و پیام، یک آدم واقعی از تیم رادلینک پاسخ می‌دهد.",
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm3.75 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.5-1.185C3.964 16.243 3 14.235 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
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
   SHARED BACKGROUND
   ────────────────────────────────────────────── */

function SectionBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className={cn(
          "absolute right-0 top-1/3 hidden h-56 w-56 rounded-full blur-2xl lg:block",
          backgrounds.glow.blueOrb,
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

function ValueCard({ item, index }: { item: ValueItem; index: number }) {
  const tokens = accentTokens[item.color];

  return (
    <article
      className={cn(
        animation.classes.fadeUp,
        animDelay(Math.min(index + 1, 8)),
        "group relative overflow-hidden p-6 sm:p-7",
        layout.radius.xl,
        borders.subtle,
        backgrounds.surface.card,
        animation.smooth,
        borders.hoverMedium,
        animation.hoverLiftLg,
        shadows.cardHover,
      )}
    >
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
          "absolute left-6 top-6 sm:left-7 sm:top-7",
          "text-white/30",
        )}
      >
        {toPersian(index + 1)}
      </div>

      <h3 className={cn("mt-5", typography.cardTitle)}>{item.title}</h3>
      <p className={cn("mt-3", typography.cardDescription)}>{item.description}</p>
    </article>
  );
}

/* ──────────────────────────────────────────────
   ABOUT STORY SECTION
   ────────────────────────────────────────────── */

export function AboutStorySection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="about-story"
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
                components.badge.amber,
              )}
            >
              <span className={cn(typography.badge, "text-amber-200")}>
                داستان ما
              </span>
            </div>

            <h2 className={cn(animation.classes.fadeUp, animDelay(1), "mt-5", typography.h2)}>
              چیزی که ما را{" "}
              <span className={gradients.textPrimary}>راه انداخت</span>
            </h2>

            <p className={cn(animation.classes.fadeUp, animDelay(2), "mt-5", typography.body)}>
              رادلینک از یک نیاز ساده شروع شد: خیلی از کسب‌وکارها و افراد
              وقتشان را صرف چند لینک پراکنده و پروفایل‌های ناهماهنگ می‌کردند.
              تصمیم گرفتیم ابزاری بسازیم که همه این‌ها را در یک صفحه سریع،
              زیبا و قابل مدیریت جمع کند.
            </p>
          </div>

          <div className={cn("mt-14 sm:mt-16", layout.grid.features)}>
            {values.map((item, i) => (
              <ValueCard key={item.title} item={item} index={i} />
            ))}
          </div>

          {/* ── Closing CTA ── */}
          <div
            className={cn(
              animation.classes.fadeUp,
              "mt-14 flex flex-col items-center gap-4 p-8 text-center sm:mt-16 sm:p-10",
              layout.radius.xl,
              borders.subtle,
              backgrounds.surface.card,
              shadows.card,
            )}
          >
            <h3 className={typography.h3}>
              می‌خواهی بیشتر بدانی یا سوالی داری؟
            </h3>
            <p className={cn(typography.body, "max-w-xl")}>
              تیم پشتیبانی رادلینک همیشه آماده پاسخ‌گویی به سوالات شماست.
            </p>
            <Link href="/contact" className={cn(components.ctaSmall, "px-7")}>
              تماس با ما
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutStorySection;
