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
} from "@/lib/design/design-system";

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const stats = [
  { value: 1200, suffix: "+", label: "صفحه ساخته‌شده" },
  { value: 340, suffix: "+", label: "کسب‌وکار فعال" },
  { value: 99, suffix: "٪", label: "رضایت کاربران" },
];

/* ──────────────────────────────────────────────
   SHARED BACKGROUND
   ────────────────────────────────────────────── */

function SectionBackground({ variant = "default" }: { variant?: "default" | "hero" }) {
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

/* ──────────────────────────────────────────────
   ABOUT HERO SECTION
   ────────────────────────────────────────────── */

export function AboutHeroSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="about-hero"
        dir="rtl"
        className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:pb-24 lg:pt-32"
      >
        <SectionBackground variant="hero" />

        <div className={cn("relative", layout.container)}>
          <div className={cn(components.sectionHeader, "max-w-3xl")}>
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
                <path d="M10 2a1 1 0 0 1 1 1v1.1a6.978 6.978 0 0 1 4.9 4.9H17a1 1 0 1 1 0 2h-1.1a6.978 6.978 0 0 1-4.9 4.9V17a1 1 0 1 1-2 0v-1.1a6.978 6.978 0 0 1-4.9-4.9H3a1 1 0 1 1 0-2h1.1A6.978 6.978 0 0 1 9 4.1V3a1 1 0 0 1 1-1Zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
              </svg>
              <span className={cn(typography.badge, "text-sky-200")}>
                درباره رادلینک
              </span>
            </div>

            <h1
              className={cn(animation.classes.fadeUp, animDelay(1), "mt-6", typography.h1)}
            >
              یک تیم کوچک با هدف ساده:{" "}
              <span className={gradients.textPrimary}>معرفی حرفه‌ای هر برند</span>
            </h1>

            <p
              className={cn(animation.classes.fadeUp, animDelay(2), "mt-6", typography.bodyLg)}
            >
              رادلینک را ساختیم تا هرکسی، بدون نیاز به برنامه‌نویسی یا طراح
              اختصاصی، بتواند در چند دقیقه یک صفحه شخصی یا کسب‌وکاری حرفه‌ای
              بسازد؛ صفحه‌ای که همه لینک‌ها، راه‌های ارتباطی و معرفی برند را در
              یک آدرس ساده جمع می‌کند.
            </p>

            <div
              className={cn(
                animation.classes.fadeUp,
                animDelay(3),
                "mt-8 flex flex-col gap-3 sm:flex-row",
              )}
            >
              <Link href="/builder" className={components.ctaPrimary}>
                <span className="relative z-10">ساخت صفحه من</span>
              </Link>
              <Link href="/contact" className={components.ctaSecondary}>
                تماس با تیم ما
              </Link>
            </div>
          </div>

          {/* ── Stats ── */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(4),
              "mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-3",
            )}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className={cn(
                  "flex flex-col items-center gap-1 p-5 text-center",
                  layout.radius.lg,
                  borders.subtle,
                  backgrounds.surface.card,
                  shadows.card,
                )}
              >
                <span className={cn("text-2xl font-extrabold sm:text-3xl", gradients.textPrimary)}>
                  {toPersian(s.value)}
                  {s.suffix}
                </span>
                <span className={typography.label}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutHeroSection;
