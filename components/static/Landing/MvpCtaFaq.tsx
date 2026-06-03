"use client";

import { useState } from "react";
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
  focus,
  components,
  accentTokens,
  animDelay,
  toPersian,
  type AccentColor,
} from "@/lib/design/design-system";

/* ══════════════════════════════════════════════
   SHARED
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

/* ══════════════════════════════════════════════
   14. MVP SECTION
   ══════════════════════════════════════════════ */

const mvpFeatures = [
  {
    label: "ثبت‌نام سریع",
    color: "sky" as AccentColor,
    icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  },
  {
    label: "ساخت صفحه اختصاصی",
    color: "cyan" as AccentColor,
    icon: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3",
  },
  {
    label: "انتخاب نام کاربری",
    color: "emerald" as AccentColor,
    icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z",
  },
  {
    label: "بلوک‌های عمومی",
    color: "blue" as AccentColor,
    icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Z",
  },
  {
    label: "جابه‌جایی بلوک‌ها",
    color: "violet" as AccentColor,
    icon: "M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5",
  },
  {
    label: "شخصی‌سازی ساده",
    color: "amber" as AccentColor,
    icon: "M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42",
  },
  {
    label: "QR Code",
    color: "sky" as AccentColor,
    icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z",
  },
  {
    label: "آمار پایه",
    color: "emerald" as AccentColor,
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  },
  {
    label: "پنل ادمین اولیه",
    color: "cyan" as AccentColor,
    icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75",
  },
];

export function MvpSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="mvp"
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          {/* Header — centered */}
          <div className={components.sectionHeader}>
            <div
              className={cn(
                animation.classes.fadeUp,
                components.badge.base,
                components.badge.amber,
              )}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-amber-300"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0 1 12 2v5h4a1 1 0 0 1 .82 1.573l-7 10A1 1 0 0 1 8 18v-5H4a1 1 0 0 1-.82-1.573l7-10a1 1 0 0 1 1.12-.38Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={cn(typography.badge, "text-amber-200")}>
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
              نسخه اولیه،{" "}
              <span className={gradients.textPrimary}>سریع و کاربردی</span>
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mt-4 max-w-2xl mx-auto",
                typography.body,
              )}
            >
              برای شروع، نسخه MVP شامل ثبت‌نام، ساخت صفحه، بلوک‌ها، شخصی‌سازی،
              QR Code، آمار و پنل ادمین است.
            </p>
          </div>

          {/* Features grid — ریسپانسیو بهتر */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(3),
              "mx-auto mt-10 max-w-4xl sm:mt-12",
            )}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 sm:gap-2.5">
              {mvpFeatures.map((f, i) => {
                const t = accentTokens[f.color];
                return (
                  <div
                    key={f.label}
                    className={cn(
                      animation.classes.fadeUp,
                      "group flex items-center gap-3 rounded-xl border p-3 sm:p-3.5",
                      borders.subtle,
                      backgrounds.surface.card,
                      animation.smooth,
                      "hover:border-white/12 hover:bg-white/5",
                      "active:scale-[0.98] touch-manipulation",
                    )}
                    style={{ animationDelay: `${i * 0.04 + 0.2}s` }}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        t.border,
                        t.bg,
                        t.text,
                        animation.smooth,
                        "group-hover:scale-105",
                      )}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <path
                          d={f.icon}
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span
                      className={cn(
                        "text-[13px] font-medium text-slate-200 group-hover:text-white",
                        animation.colors,
                      )}
                    >
                      {f.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA row */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(5),
              "mt-10 flex flex-col items-center gap-5 sm:flex-row sm:justify-center",
            )}
          >
            <Link href="/create" className={cn(components.ctaPrimary, "px-8")}>
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100",
                  animation.opacity,
                  animation.classes.shimmer,
                )}
              />
              <span className="relative z-10">شروع با نسخه MVP</span>
              <ArrowIcon
                className={cn(
                  "relative z-10 -scale-x-100",
                  animation.transform,
                  "group-hover:-translate-x-1",
                )}
              />
            </Link>

            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2",
                borders.subtle,
                backgrounds.surface.glassMedium,
              )}
            >
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
              </div>
              <span className={cn(typography.labelSmall, "text-slate-400")}>
                آماده توسعه سریع
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════
   15. CTA SECTION
   ══════════════════════════════════════════════ */

const trustItems = [
  {
    icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    label: "رایگان برای شروع",
    color: "emerald" as AccentColor,
  },
  {
    icon: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
    label: "امن و مطمئن",
    color: "sky" as AccentColor,
  },
  {
    icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    label: "ساخت در ۲ دقیقه",
    color: "amber" as AccentColor,
  },
];

export function CtaSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="cta"
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        {/* Stronger BG */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-b from-sky-500/[0.1] via-blue-500/6 to-transparent blur-[120px]" />
          <div
            className={cn(
              "absolute right-0 top-0 h-80 w-80 rounded-full blur-3xl",
              backgrounds.glow.skyOrb,
              animation.classes.floatSlow,
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 h-80 w-80 rounded-full blur-3xl",
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

        <div className={cn("relative", layout.container)}>
          {/* Centered card */}
          <div
            className={cn(
              "mx-auto max-w-3xl overflow-hidden rounded-3xl border p-8 text-center sm:p-12 md:p-14",
              borders.subtle,
              "bg-linear-to-b from-white/4 to-white/1",
              "shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]",
            )}
          >
            {/* Corner glows */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

            {/* Orb */}
            <div
              className={cn(
                animation.classes.fadeUp,
                "mb-8 flex justify-center",
              )}
            >
              <div
                className={cn(
                  "relative flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24",
                  borders.strong,
                  gradients.orb,
                  shadows.orb,
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0.5 rounded-full",
                    gradients.innerHighlightCircle,
                  )}
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={cn(
                    "relative z-10 h-8 w-8 sm:h-10 sm:w-10",
                    accentTokens.sky.text,
                  )}
                >
                  <path
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h2
              className={cn(
                animation.classes.fadeUp,
                animDelay(1),
                typography.h2,
                "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
              )}
            >
              آماده‌ای صفحه اختصاصی{" "}
              <span className={gradients.textPrimary}>خودت</span> را بسازی؟
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mx-auto mt-5 max-w-xl",
                typography.body,
              )}
            >
              همه لینک‌ها، مسیرها، اطلاعات تماس و محتوای معرفی خودت را در یک
              صفحه حرفه‌ای جمع کن.
            </p>

            {/* CTAs */}
            <div
              className={cn(
                animation.classes.fadeUp,
                animDelay(3),
                "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center",
              )}
            >
              <Link
                href="/create"
                className={cn(
                  components.ctaPrimary,
                  "px-8 py-3.5 sm:px-10 sm:py-4 text-base",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100",
                    animation.opacity,
                    animation.classes.shimmer,
                  )}
                />
                <span className="relative z-10">همین حالا شروع کن</span>
                <ArrowIcon
                  className={cn(
                    "relative z-10 h-5 w-5 -scale-x-100",
                    animation.transform,
                    "group-hover:-translate-x-1",
                  )}
                />
              </Link>

              <Link
                href="#features"
                className={cn(components.ctaSecondary, "px-6 py-3.5 sm:px-8")}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-sky-300/70"
                >
                  <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                  <path
                    fillRule="evenodd"
                    d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>مشاهده امکانات</span>
              </Link>
            </div>

            {/* Trust indicators — بهتر */}
            <div
              className={cn(
                animation.classes.fadeUp,
                animDelay(4),
                "mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4",
              )}
            >
              {trustItems.map((item) => {
                const t = accentTokens[item.color];
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3.5 py-2",
                      borders.subtle,
                      backgrounds.surface.glassMedium,
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md",
                        t.bg,
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={cn("h-3 w-3", t.text)}
                      >
                        <path
                          d={item.icon}
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════
   16. FAQ SECTION
   ══════════════════════════════════════════════ */

const faqs = [
  {
    question: "آیا برای ساخت صفحه نیاز به برنامه‌نویسی دارم؟",
    answer:
      "خیر. تمام مراحل ساخت صفحه از طریق پنل کاربری و سیستم بلوک‌ها انجام می‌شود و نیاز به دانش فنی ندارد.",
  },
  {
    question: "آیا می‌توانم ظاهر صفحه را تغییر دهم؟",
    answer:
      "بله. می‌توانی قالب، رنگ، فونت، لوگو، کاور و چینش بلوک‌ها را مطابق برندت تنظیم کنی.",
  },
  {
    question: "آیا برای صفحه من QR Code ساخته می‌شود؟",
    answer:
      "بله. برای هر صفحه یک QR Code اختصاصی ساخته می‌شود که قابل دانلود و اشتراک‌گذاری است.",
  },
  {
    question: "آیا می‌توانم آمار بازدید و کلیک‌ها را ببینم؟",
    answer:
      "بله. در پنل کاربری می‌توانی تعداد بازدید، کلیک روی لینک‌ها و عملکرد مسیرهای ارتباطی را مشاهده کنی.",
  },
  {
    question: "این پلتفرم برای چه کسب‌وکارهایی مناسب است؟",
    answer:
      "برای برندهای شخصی، فریلنسرها، اینفلوئنسرها، سالن‌ها، کلینیک‌ها، مزون‌ها، کافه‌ها، شرکت‌های خدماتی، رویدادها و کمپین‌ها مناسب است.",
  },
];

function FaqItem({ faq, index }: { faq: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        animation.classes.fadeUp,
        "overflow-hidden border transition-all duration-300",
        // Shape بهتر
        "rounded-2xl",
        open
          ? cn(
              "border-sky-400/20 bg-sky-400/3",
              "shadow-[0_8px_24px_-8px_rgba(56,189,248,0.1)]",
            )
          : cn(
              borders.subtle,
              backgrounds.surface.card,
              "hover:border-white/10",
            ),
      )}
      style={{ animationDelay: `${index * 0.06 + 0.15}s` }}
    >
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-4 px-5 py-4 text-right sm:px-6 sm:py-5",
          focus.ring,
          "touch-manipulation",
        )}
      >
        {/* Number */}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-300",
            open
              ? cn(
                  accentTokens.sky.border,
                  accentTokens.sky.bg,
                  accentTokens.sky.text,
                  "scale-105",
                )
              : cn(borders.subtle, "bg-white/3 text-white/25"),
          )}
        >
          {toPersian(index + 1)}
        </div>

        {/* Question */}
        <span
          className={cn(
            "flex-1 text-[13px] font-semibold leading-relaxed sm:text-sm",
            animation.colors,
            open ? "text-white" : "text-slate-200",
          )}
        >
          {faq.question}
        </span>

        {/* Chevron */}
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
            open
              ? cn(accentTokens.sky.bg, "border border-sky-400/20")
              : "bg-white/3",
          )}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn(
              "h-4 w-4 transition-all duration-300",
              open ? "rotate-180 text-sky-300" : "text-slate-500",
            )}
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Answer */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            {/* Divider */}
            <div className={cn("mb-4 h-px", gradients.divider, "opacity-20")} />
            <p className="text-[13px] leading-7 text-slate-300/80 sm:text-sm sm:leading-7 mr-12">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="faq"
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          {/* Header */}
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
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={cn(typography.badge, "text-sky-200")}>
                پاسخ به سوالات شما
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
              سوالات <span className={gradients.textPrimary}>متداول</span>
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mt-4",
                typography.body,
              )}
            >
              جواب رایج‌ترین سوال‌ها درباره پلتفرم لندینگ‌ساز هوشمند
            </p>
          </div>

          {/* FAQ Items */}
          <div className="mx-auto mt-10 max-w-3xl space-y-2.5 sm:mt-12 lg:mt-14">
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </div>

          {/* Bottom support card */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(6),
              "mt-10 flex justify-center sm:mt-12",
            )}
          >
            <div
              className={cn(
                "w-full max-w-lg overflow-hidden rounded-2xl border",
                borders.subtle,
                backgrounds.surface.card,
              )}
            >
              {/* Top gradient */}
              <div className="h-1 bg-linear-to-r from-sky-400/40 via-cyan-400/30 to-blue-400/40" />

              <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-right sm:gap-5">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                    accentTokens.sky.border,
                    accentTokens.sky.bg,
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={cn("h-6 w-6", accentTokens.sky.text)}
                  >
                    <path
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    سوال دیگه‌ای داری؟
                  </p>
                  <p className={cn("mt-1", typography.bodySmall)}>
                    تیم پشتیبانی آماده پاسخگویی به سوالات شماست
                  </p>
                </div>

                <Link
                  href="/contact"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold",
                    accentTokens.sky.border,
                    accentTokens.sky.bg,
                    accentTokens.sky.text,
                    animation.base,
                    "hover:brightness-125",
                    animation.activePress,
                    focus.ring,
                  )}
                >
                  <span>ارسال پیام</span>
                  <ArrowIcon className="-scale-x-100 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
