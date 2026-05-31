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
  focus,
  components,
  accentTokens,
  animDelay,
  toPersian,
  type AccentColor,
} from "@/lib/design/design-system";

/* ──────────────────────────────────────────────
   SHARED
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

/* ──────────────────────────────────────────────
   DASHBOARD — DATA
   ────────────────────────────────────────────── */

interface DashboardFeature {
  title: string;
  color: AccentColor;
  icon: React.ReactNode;
}

const dashboardFeatures: DashboardFeature[] = [
  {
    title: "مدیریت صفحه‌ها",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.727-3.558"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "ویرایش بلوک‌ها",
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "تغییر ظاهر صفحه",
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "مشاهده آمار بازدید",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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
  {
    title: "مدیریت لینک اشتراک‌گذاری",
    color: "blue",
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
    title: "تنظیمات حساب کاربری",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
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
   DASHBOARD — MOCKUP
   ────────────────────────────────────────────── */

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-xl lg:max-w-none">
      {/* Outer glow */}
      <div className="absolute -inset-6 rounded-3xl bg-linear-to-b from-sky-400/15 via-blue-500/8 to-transparent blur-2xl" />

      {/* Window */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          borders.strong,
          "bg-linear-to-b from-[#0c1a30] via-[#0f2340] to-[#071427]",
          "p-1 shadow-[0_40px_80px_-30px_rgba(2,8,23,0.9),0_20px_40px_-15px_rgba(59,130,246,0.2)]",
        )}
      >
        <div
          className={cn(
            "overflow-hidden rounded-xl",
            borders.subtle,
            "bg-linear-to-b from-[#091828] to-[#060f1e]",
          )}
        >
          {/* Title bar */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              borders.subtle,
              "border-t-0 border-x-0",
            )}
          >
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400/60" />
              <div className="h-3 w-3 rounded-full bg-amber-400/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/60" />
            </div>
            <div
              className={cn(
                "mx-auto flex-1 max-w-xs rounded-lg px-3 py-1.5 text-center",
                borders.subtle,
                "bg-white/[0.03]",
              )}
            >
              <span className={typography.labelSmall}>
                dashboard.smartlanding.ir
              </span>
            </div>
            <div className="w-12" />
          </div>

          {/* Dashboard body */}
          <div className="flex min-h-[320px] sm:min-h-[380px]">
            {/* Sidebar */}
            <div
              className={cn(
                "hidden w-48 flex-shrink-0 border-l border-white/8 p-3 sm:block",
              )}
            >
              <div className="flex items-center gap-2 px-2 py-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    gradients.logo,
                  )}
                >
                  <span className="text-xs font-bold text-white">ل</span>
                </div>
                <span className="text-xs font-semibold text-white">
                  داشبورد
                </span>
              </div>

              <div className="mt-4 space-y-1">
                {dashboardFeatures.map((f, i) => {
                  const t = accentTokens[f.color];
                  const isActive = i === 0;
                  return (
                    <div
                      key={f.title}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium",
                        animation.base,
                        isActive
                          ? cn(t.bg, t.border, "border text-white")
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
                      )}
                    >
                      <span
                        className={cn(isActive ? t.text : "text-slate-500")}
                      >
                        {f.icon}
                      </span>
                      <span className="truncate">{f.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 sm:p-5">
              {/* Header bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">صفحه‌های من</h4>
                  <p className={cn("mt-0.5", typography.labelSmall)}>
                    ۳ صفحه فعال
                  </p>
                </div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
                    borders.sky,
                    "border",
                    accentTokens.sky.bg,
                    "text-xs font-medium",
                    accentTokens.sky.text,
                  )}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3"
                  >
                    <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
                  </svg>
                  <span>صفحه جدید</span>
                </div>
              </div>

              {/* Cards */}
              <div className="mt-4 space-y-2.5">
                {[
                  {
                    name: "صفحه اصلی برند",
                    views: "۲,۸۴۷",
                    color: "sky" as AccentColor,
                  },
                  {
                    name: "کمپین تابستانی",
                    views: "۱,۴۶۳",
                    color: "emerald" as AccentColor,
                  },
                  {
                    name: "کارت ویزیت دیجیتال",
                    views: "۹۲۸",
                    color: "violet" as AccentColor,
                  },
                ].map((page) => {
                  const t = accentTokens[page.color];
                  return (
                    <div
                      key={page.name}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-3 border",
                        borders.subtle,
                        backgrounds.surface.glass,
                        animation.base,
                        "hover:border-white/12 hover:bg-white/[0.06]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("h-2 w-2 rounded-full", t.dot)} />
                        <span className="text-xs font-medium text-slate-200">
                          {page.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-medium", t.text)}>
                          {page.views} بازدید
                        </span>
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5 text-slate-500 -scale-x-100"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mini chart */}
              <div
                className={cn(
                  "mt-4 rounded-xl p-4 border",
                  borders.subtle,
                  backgrounds.surface.glass,
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-300">
                    بازدید هفتگی
                  </span>
                  <span
                    className={cn("text-xs font-bold", accentTokens.sky.text)}
                  >
                    +۲۳٪
                  </span>
                </div>
                <div className="flex items-end gap-1.5 h-16">
                  {[35, 52, 45, 68, 58, 82, 75].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div
                        className={cn(
                          "w-full rounded-t-sm transition-all duration-500",
                          i === 5
                            ? "bg-linear-to-t from-sky-500 to-sky-300"
                            : "bg-white/10 hover:bg-white/20",
                        )}
                        style={{
                          height: `${h}%`,
                          transitionDelay: `${i * 50}ms`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   DASHBOARD SECTION
   ────────────────────────────────────────────── */

export function DashboardSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="dashboard"
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
                  d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={cn(typography.badge, "text-sky-200")}>
                پنل مدیریت
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
              داشبوردی ساده برای{" "}
              <span className={gradients.textPrimary}>مدیریت همه چیز</span>
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mt-5",
                typography.body,
              )}
            >
              از داخل پنل کاربری می‌توانی صفحه‌ها، بلوک‌ها، ظاهر، لینک‌ها،
              شبکه‌های اجتماعی، پیام‌رسان‌ها، QR Code و آمار بازدید را مدیریت
              کنی. همه چیز سریع، مرتب و قابل کنترل است.
            </p>
          </div>

          {/* Feature pills */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(3),
              "mt-10 flex flex-wrap items-center justify-center gap-3",
            )}
          >
            {dashboardFeatures.map((f) => {
              const t = accentTokens[f.color];
              return (
                <div
                  key={f.title}
                  className={cn(components.miniFeature, "gap-2.5")}
                >
                  <span className={t.text}>{f.icon}</span>
                  <span>{f.title}</span>
                </div>
              );
            })}
          </div>

          {/* Mockup */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(4),
              "mt-14 sm:mt-16 lg:mt-20",
            )}
          >
            <DashboardMockup />
          </div>
        </div>
      </section>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   QR CODE — DATA
   ══════════════════════════════════════════════════════════════════ */

const qrUseCases = [
  {
    label: "کارت ویزیت",
    icon: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z",
  },
  {
    label: "بسته‌بندی محصول",
    icon: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  },
  {
    label: "بروشور و تبلیغات",
    icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z",
  },
  {
    label: "استند و بنر",
    icon: "M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5",
  },
  {
    label: "شبکه‌های اجتماعی",
    icon: "M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 2.186 0m-2.186 0c.324.18.696.283 1.093.283s.77-.103 1.093-.283m-2.186 12.814a2.25 2.25 0 1 0 2.186 0m-2.186 0c.324.18.696.283 1.093.283s.77-.103 1.093-.283",
  },
];

/* ──────────────────────────────────────────────
   QR CODE — VISUAL
   ────────────────────────────────────────────── */

function QrCodeVisual() {
  return (
    <div className="relative mx-auto w-[240px] sm:w-[280px]">
      {/* Outer glow */}
      <div className="absolute -inset-8 rounded-3xl bg-linear-to-b from-sky-400/15 via-blue-500/8 to-transparent blur-2xl s-pulse-glow" />

      {/* QR Container */}
      <div
        className={cn(
          "relative overflow-hidden p-1.5",
          layout.radius.xl,
          borders.strong,
          "bg-linear-to-b from-[#0c1a30] via-[#0f2340] to-[#071427]",
          shadows.phone,
        )}
      >
        <div
          className={cn(
            "overflow-hidden p-6 sm:p-8",
            layout.radius.lg,
            borders.subtle,
            "bg-linear-to-b from-[#091828] to-[#060f1e]",
          )}
        >
          {/* Faux QR code grid */}
          <div className="mx-auto aspect-square w-full max-w-[200px]">
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 49 }).map((_, i) => {
                const isCorner =
                  ((i < 3 || (i >= 4 && i < 7)) && Math.floor(i / 7) < 3) ||
                  (i % 7 >= 4 && Math.floor(i / 7) < 3) ||
                  (i % 7 < 3 && Math.floor(i / 7) >= 4);
                const isRandom = [
                  8, 10, 13, 15, 17, 19, 22, 24, 26, 29, 31, 33, 36, 38, 40, 43,
                  45, 47,
                ].includes(i);
                const isFilled = isCorner || isRandom;

                return (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-[2px]",
                      animation.smooth,
                      isFilled
                        ? "bg-linear-to-br from-sky-300 to-blue-400"
                        : "bg-white/[0.06] hover:bg-white/[0.12]",
                    )}
                  />
                );
              })}
            </div>

            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  borders.strong,
                  gradients.logo,
                  shadows.logo,
                )}
              >
                <span className="text-lg font-bold text-white">ل</span>
              </div>
            </div>
          </div>

          {/* URL preview */}
          <div
            className={cn(
              "mt-5 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2",
              borders.subtle,
              backgrounds.surface.glass,
              "mx-auto max-w-[180px]",
            )}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-medium text-slate-300 dir-ltr">
              smartlanding.ir/you
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   QR CODE SECTION
   ────────────────────────────────────────────── */

export function QrCodeSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="qr-code"
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          <div
            className={cn(
              "flex flex-col items-center lg:flex-row lg:items-center",
              layout.gap.sectionLarge,
            )}
          >
            {/* Visual */}
            <div
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "flex flex-1 items-center justify-center",
                animation.classes.floatSlow,
              )}
            >
              <QrCodeVisual />
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-right">
              {/* Badge */}
              <div
                className={cn(
                  animation.classes.fadeUp,
                  components.badge.base,
                  components.badge.sky,
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={cn("h-4 w-4", accentTokens.sky.text)}
                >
                  <path
                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className={cn(typography.badge, "text-sky-200")}>
                  QR Code
                </span>
              </div>

              {/* Title */}
              <h2
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(1),
                  "mt-5",
                  typography.h2,
                )}
              >
                صفحه‌ات را با{" "}
                <span className={gradients.textPrimary}>QR Code</span> همه‌جا
                همراه کن
              </h2>

              {/* Description */}
              <p
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(2),
                  "mt-5 lg:max-w-lg",
                  typography.body,
                )}
              >
                برای هر صفحه یک QR Code اختصاصی ساخته می‌شود تا بتوانی آن را روی
                کارت ویزیت، بسته‌بندی محصول، بروشور، استند، تبلیغات چاپی یا
                شبکه‌های اجتماعی قرار دهی.
              </p>

              {/* Use cases */}
              <div
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(3),
                  "mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start",
                )}
              >
                {qrUseCases.map((u) => (
                  <div key={u.label} className={components.miniFeature}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 text-sky-400/70"
                    >
                      <path
                        d={u.icon}
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{u.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div
                className={cn(animation.classes.fadeUp, animDelay(4), "mt-9")}
              >
                <Link href="/create" className={components.ctaPrimary}>
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-0",
                      "bg-linear-to-r from-white/0 via-white/20 to-white/0",
                      "opacity-0 group-hover:opacity-100",
                      animation.opacity,
                      animation.classes.shimmer,
                    )}
                  />
                  <span className="relative z-10">ساخت QR Code اختصاصی</span>
                  <ArrowIcon
                    className={cn(
                      "relative z-10 -scale-x-100",
                      animation.transform,
                      "group-hover:-translate-x-1",
                    )}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
