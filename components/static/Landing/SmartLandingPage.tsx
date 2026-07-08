"use client";

import Link from "next/link";
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
  components,
  accentTokens,
  toPersian,
  type AccentColor,
} from "@/lib/design/design-system";
import Image from "next/image";

/* ──────────────────────────────────────────────
   1 ─ DATA
   ────────────────────────────────────────────── */

const miniFeatures = [
  {
    label: "بدون کدنویسی",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.59.659H9.06a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0-.75.75M5 14.5l.75.75"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "قابل اشتراک‌گذاری با QR Code",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.375 6.375h.008v.008h-.008V6.375Zm0 9.75h.008v.008h-.008v-.008ZM16.125 6.375h.008v.008h-.008V6.375ZM13.5 13.5h.008v.008H13.5V13.5Zm0 3.75h.008v.008H13.5v-.008Zm3.75-3.75h.008v.008h-.008V13.5Zm0 3.75h.008v.008h-.008v-.008Zm3.75-3.75h.008v.008H21V13.5Zm0 3.75h.008v.008H21v-.008Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "مناسب موبایل و دسکتاپ",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "آمار بازدید و کلیک",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

interface ProblemItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: AccentColor;
}

const problemItems: ProblemItem[] = [
  {
    title: "لینک‌های پراکنده",
    description:
      "دیگر لازم نیست چندین لینک مختلف برای مخاطب ارسال کنی. همه مسیرهای مهم در یک صفحه قرار می‌گیرند.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.553-4.244a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 1 0-6.364 6.364l1.757 1.757"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(1.5 2)"
        />
      </svg>
    ),
    color: "sky",
  },
  {
    title: "معرفی غیرحرفه‌ای",
    description:
      "به‌جای یک پروفایل ساده، یک صفحه برندشده با لوگو، کاور، رنگ اختصاصی و محتوای منظم داشته باش.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "cyan",
  },
  {
    title: "نداشتن آمار واقعی",
    description:
      "ببین چند نفر صفحه‌ات را دیده‌اند، روی کدام لینک‌ها کلیک کرده‌اند و کدام مسیر ارتباطی بهتر جواب داده است.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "blue",
  },
];

/* ──────────────────────────────────────────────
   2 ─ SHARED COMPONENTS
   ────────────────────────────────────────────── */

/**
 * Section background — perf-tuned.
 * blur-3xl layers are the #1 lag source on this page:
 * every animated blurred orb forces expensive GPU filter
 * repaints. So: fewer orbs, NO animation on blurred
 * elements, and orbs only render on lg+ screens.
 */
function SectionBackground({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Large center glow — static */}
      <div
        className={cn(
          "absolute left-1/2 top-0 h-150 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
          backgrounds.glow.hero,
        )}
      />
      {/* Single static side orb, desktop only */}
      <div
        className={cn(
          "absolute right-0 top-1/3 hidden h-56 w-56 rounded-full blur-2xl lg:block",
          backgrounds.glow.skyOrb,
        )}
      />
      {/* Grid pattern */}
      <div className={cn("absolute inset-0", backgrounds.grid.lines)} />
      {/* Top divider (not on hero) */}
      {variant !== "hero" && (
        <div
          className={cn(
            "absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2",
            gradients.divider,
          )}
        />
      )}
    </div>
  );
}

/** Arrow icon — reused in CTAs and links */
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
   3 ─ HOOKS: in-view trigger + rAF counter
   ────────────────────────────────────────────── */

/** Fires once when the element scrolls into view. */
function useInViewOnce<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/**
 * Counter on requestAnimationFrame with ease-out —
 * replaces the old setInterval(16ms) version that
 * forced ~60 React re-renders/sec even off-screen.
 * Only runs once `start` is true, jumps straight to
 * the final value for reduced-motion users.
 */
function useCounter(end: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setCount(end);
      return;
    }

    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(end * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return count;
}

/* ──────────────────────────────────────────────
   4 ─ PHONE MOCKUP
   ────────────────────────────────────────────── */

function PhoneMockup() {
  const { ref } = useInViewOnce<HTMLDivElement>(0.4);
 

  return (
    <div ref={ref} className="relative mx-auto w-65 md:-mt-36  sm:w-70 lg:w-98">
      {/* Outer glow — static (the old pulse animated a blur-2xl
          layer every frame, one of the main lag sources) */}
  
      <Image
        alt="hero"
        src="/assets/images/hero.jpg"
        width={1200}
        height={1200}
        className="h-fit w-full rounded-[1rem] object-contain  "
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   5 ─ PROBLEM CARD
   ────────────────────────────────────────────── */

function ProblemCard({ item, index }: { item: ProblemItem; index: number }) {
  const tokens = accentTokens[item.color];

  return (
    <article
      style={{ animationDelay: `${index * 90}ms` }}
      className={cn(
        animation.classes.fadeUp,
        "group relative overflow-hidden p-6 sm:p-8",
        layout.radius.xl,
        borders.subtle,
        backgrounds.surface.card,
        animation.smooth,
        borders.hoverMedium,
        animation.hoverLiftLg,
        shadows.cardHover,
      )}
    >
      {/* Hover glow — smaller blur radius, opacity-only transition */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl",
          tokens.glow,
          "opacity-0 group-hover:opacity-100",
          animation.opacity,
        )}
      />

      {/* Top accent line */}
      <div
        className={cn(
          "absolute inset-x-8 top-0 h-px bg-linear-to-r",
          tokens.gradient,
          "opacity-0 group-hover:opacity-60",
          animation.opacity,
        )}
      />

      {/* Icon */}
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

      {/* Number */}
      <div
        className={cn(
          components.numberBadge,
          "absolute left-6 top-6 sm:left-8 sm:top-8",
          "text-white/30",
        )}
      >
        {toPersian(index + 1)}
      </div>

      <h3 className={cn("mt-5", typography.cardTitle)}>{item.title}</h3>
      <p className={cn("mt-3", typography.cardDescription)}>
        {item.description}
      </p>
    </article>
  );
}

/* ──────────────────────────────────────────────
   6 ─ HERO SECTION
   ────────────────────────────────────────────── */

export function HeroSection() {
  return (
    <section
      id="home"
      dir="rtl"
      className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:pb-36 lg:pt-32"
    >
      {/* BG */}
      <SectionBackground variant="hero" />

      <div className={cn("relative", layout.container)}>
        <div
          className={cn(
            "flex flex-col items-center lg:flex-row lg:items-center",
            layout.gap.section,
          )}
        >
            {/* ── Right — Phone Mockup ──
              Float animation only on lg+ (and only for users who
              haven't asked for reduced motion): animating a large
              layered element on mobile GPUs is a major jank source. */}
          <div
            className={cn(
              animation.classes.fadeUp,
              "shrink-0",
              `motion-safe:lg:${animation.classes.floatSlow}`,
            )}
            style={{ animationDelay: "200ms" }}
          >
            <PhoneMockup />
          </div>
          {/* ── Left Content ── */}
          <div className="flex-1 text-center lg:text-right">
            {/* Badge */}
            <div
              className={cn(
                animation.classes.fadeUp,
                components.badge.base,
                components.badge.sky,
              )}
            >
              {/* motion-safe: the ping stops for reduced-motion users */}
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
              </span>
              <span className={cn(typography.badge, "text-sky-200")}>
                ساخت صفحه اختصاصی بدون نیاز به برنامه‌نویسی
              </span>
            </div>

            {/* H1 */}
            <h1
              className={cn(animation.classes.fadeUp, "mt-6", typography.h1)}
              style={{ animationDelay: "80ms" }}
            >
              صفحه اختصاصی{" "}
              <span className="relative inline-block">
                <span className={cn("relative z-10", gradients.textPrimary)}>
                  برندت
                </span>
                <span className="absolute -inset-x-2 bottom-0 h-3 rounded-full bg-sky-400/15 blur-sm" />
              </span>{" "}
              را در چند دقیقه بساز
            </h1>

            {/* Description */}
            <p
              className={cn(
                animation.classes.fadeUp,
                "mt-6 lg:max-w-xl",
                typography.bodyLg,
              )}
              style={{ animationDelay: "160ms" }}
            >
              با این پلتفرم می‌توانی برای خودت، کسب‌وکارت، کمپینت یا برند
              شخصی‌ات یک صفحه حرفه‌ای بسازی؛ جایی برای نمایش لینک‌ها، شبکه‌های
              اجتماعی، اطلاعات تماس، ویدئوها، تصاویر، خدمات و مسیرهای ارتباطی،
              همه در یک لینک ساده و قابل اشتراک‌گذاری.
            </p>

            {/* CTA Buttons */}
            <div
              className={cn(
                animation.classes.fadeUp,
                "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start",
              )}
              style={{ animationDelay: "240ms" }}
            >
              {/* Primary CTA — shimmer removed: an animated gradient
                  over a shadowed rounded element repaints constantly */}
              <Link
                href="/builder"
                className={cn(components.ctaPrimary, "px-7")}
              >
                <span className="relative z-10">ساخت صفحه من</span>
                <ArrowIcon
                  className={cn(
                    "relative z-10 -scale-x-100",
                    "transition-transform duration-200",
                    "group-hover:-translate-x-1",
                  )}
                />
              </Link>

              {/* Secondary CTA — gives hesitant visitors a
                  low-commitment next step */}
              <Link
                href="#templates"
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-medium text-slate-300",
                  borders.subtle,
                  backgrounds.surface.glass,
                  "transition-colors duration-200",
                  "hover:border-white/15 hover:bg-white/5 hover:text-white",
                )}
              >
                مشاهده نمونه صفحات
              </Link>
            </div>

            {/* Mini Features */}
            <div
              className={cn(
                animation.classes.fadeUp,
                "mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start",
              )}
              style={{ animationDelay: "320ms" }}
            >
              {miniFeatures.map((f) => (
                <div key={f.label} className={components.miniFeature}>
                  <span className="text-sky-400/70">{f.icon}</span>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

        
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   7 ─ PROBLEM SECTION
   ────────────────────────────────────────────── */

export function ProblemSection() {
  return (
    <section
      id="problems"
      dir="rtl"
      className={cn(
        "relative overflow-hidden",
        layout.section,
        /* Skips layout/paint for the section until it nears the
           viewport — free scroll performance on long pages */
        "[content-visibility:auto] [contain-intrinsic-size:auto_800px]",
      )}
    >
      {/* BG */}
      <SectionBackground />

      <div className={cn("relative", layout.container)}>
        {/* ── Header ── */}
        <div className={components.sectionHeader}>
          {/* Badge */}
          <div
            className={cn(
              animation.classes.fadeUp,
              components.badge.base,
              components.badge.rose,
            )}
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-rose-300"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                clipRule="evenodd"
              />
            </svg>
            <span className={cn(typography.badge, "text-rose-200")}>
              مشکلات رایج
            </span>
          </div>

          {/* Title */}
          <h2 className={cn(animation.classes.fadeUp, "mt-5", typography.h2)}>
            چرا به یک صفحه اختصاصی{" "}
            <span className={gradients.textPrimary}>نیاز داری؟</span>
          </h2>

          {/* Description */}
          <p className={cn(animation.classes.fadeUp, "mt-5", typography.body)}>
            وقتی لینک‌ها، شبکه‌های اجتماعی، شماره تماس، فرم‌ها و مسیرهای ارتباطی
            در چند جای مختلف پخش باشند، مخاطب سردرگم می‌شود. این پلتفرم همه چیز
            را در یک صفحه مرتب، سریع و حرفه‌ای جمع می‌کند تا کاربر راحت‌تر با تو
            ارتباط بگیرد.
          </p>
        </div>

        {/* ── Problem Cards ── */}
        <div className={cn("mt-14 sm:mt-16 lg:mt-20", layout.grid.features)}>
          {problemItems.map((item, i) => (
            <ProblemCard key={item.title} item={item} index={i} />
          ))}
        </div>

        {/* ── Bottom Connector ── */}
        <div className="mx-auto mt-14 flex flex-col items-center gap-3 sm:mt-16">
          <div className={components.connector.line} />
          <div className={components.connector.dot}>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className={cn("h-4 w-4", accentTokens.sky.text)}
            >
              <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className={typography.label}>راه‌حل ما برای هر مشکل</p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   8 ─ MAIN PAGE COMPONENT
   ────────────────────────────────────────────── */

export default function HeroProblemSections() {
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />
      <main>
        <HeroSection />
        <ProblemSection />
      </main>
    </div>
  );
}
