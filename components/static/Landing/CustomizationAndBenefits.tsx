"use client";

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

/* ──────────────────────────────────────────────
   CUSTOMIZATION — DATA
   ────────────────────────────────────────────── */

interface CustomItem {
  label: string;
  color: AccentColor;
  icon: React.ReactNode;
}

const customItems: CustomItem[] = [
  {
    label: "انتخاب قالب آماده",
    color: "sky",
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
    label: "تغییر رنگ پس‌زمینه و دکمه‌ها",
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
    label: "افزودن لوگو و کاور",
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
    label: "انتخاب فونت",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M7.5 3.75H6a3 3 0 0 0-3 3v1.5m4.5-4.5h10.5a3 3 0 0 1 3 3v1.5M7.5 3.75v16.5m0-16.5h9m-9 16.5H6a3 3 0 0 1-3-3v-1.5m4.5 4.5h10.5a3 3 0 0 0 3-3v-1.5M16.5 3.75v16.5"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "تنظیم چینش بلوک‌ها",
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "پیش‌نمایش زنده تغییرات",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
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
   CUSTOMIZATION — PHONE MOCKUP
   ────────────────────────────────────────────── */

const themeColors = [
  { bg: "from-sky-500 to-blue-600", active: true },
  { bg: "from-violet-500 to-purple-600", active: false },
  { bg: "from-emerald-500 to-teal-600", active: false },
  { bg: "from-rose-500 to-pink-600", active: false },
  { bg: "from-amber-500 to-orange-600", active: false },
];

function CustomizationMockup() {  
  return (
    <div className="relative mx-auto w-65 sm:w-70 lg:w-75">
      <div className="absolute -inset-6 rounded-[3rem] bg-linear-to-b from-violet-400/15 via-sky-500/10 to-transparent blur-2xl" />

      {/* Phone body */}
      <div className={components.phoneMockup.outer}>
        <div className={components.phoneMockup.inner}>
          <div className={components.phoneMockup.notch} />

          <div className="p-3 space-y-3 pt-3">
            {/* Toolbar */}
            <div
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2",
                borders.subtle,
                backgrounds.surface.glass,
              )}
            >
              <span className="text-[10px] font-medium text-slate-300">
                شخصی‌سازی
              </span>
              <div className="flex gap-1">
                <div className="h-4 w-8 rounded border border-white/10 bg-white/6 flex items-center justify-center">
                  <span className="text-[8px] text-slate-400">قالب</span>
                </div>
                <div className="h-4 w-8 rounded border border-sky-400/20 bg-sky-400/8 flex items-center justify-center">
                  <span className="text-[8px] text-sky-300">رنگ</span>
                </div>
              </div>
            </div>

            {/* Preview window */}
            <div className={cn("overflow-hidden rounded-xl", borders.subtle)}>
              {/* Cover */}
              <div className="h-14 bg-linear-to-br from-sky-500 via-blue-500 to-indigo-600 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
              </div>

              {/* Profile */}
              <div className={cn("px-3 pb-3 -mt-5", backgrounds.surface.dark)}>
                <div
                  className={cn(
                    "h-10 w-10 rounded-full border-2 border-[#091828] bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg",
                  )}
                >
                  <span className="text-xs font-bold text-white">ل</span>
                </div>
                <p className="mt-1.5 text-xs font-bold text-white">برند شخصی</p>
                <p className="text-[9px] text-slate-400">smartlanding.ir/me</p>

                {/* Link blocks */}
                <div className="mt-2.5 space-y-1.5">
                  {["وب‌سایت اصلی", "اینستاگرام"].map((t) => (
                    <div
                      key={t}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-2.5 py-1.5",
                        "border-sky-400/20 bg-sky-400/6",
                      )}
                    >
                      <span className="text-[9px] font-medium text-sky-200">
                        {t}
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Color picker */}
            <div
              className={cn(
                "rounded-xl p-3",
                borders.subtle,
                backgrounds.surface.glass,
              )}
            >
              <p className="text-[9px] font-medium text-slate-400 mb-2">
                رنگ قالب
              </p>
              <div className="flex gap-1.5">
                {themeColors.map((c, i) => (
                  <button
                    key={i} 
                    className={cn(
                      "h-6 w-6 shrink-0 rounded-full bg-linear-to-br",
                      c.bg,
                      animation.base,
                      c.active &&
                        "ring-2 ring-white/40 ring-offset-1 ring-offset-[#091828]",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Font selector */}
            <div
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2",
                borders.subtle,
                backgrounds.surface.glass,
              )}
            >
              <span className="text-[9px] font-medium text-slate-400">
                فونت
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-medium text-white">
                  وزیرمتن
                </span>
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3 w-3 text-slate-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Live preview badge */}
            <div
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl py-2",
                borders.subtle,
                "border-emerald-400/20 bg-emerald-400/6",
              )}
            >
              <div className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </div>
              <span className="text-[9px] font-medium text-emerald-300">
                پیش‌نمایش زنده فعال
              </span>
            </div>
          </div>

          <div className={components.phoneMockup.homeBar} />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CUSTOMIZATION SECTION
   ────────────────────────────────────────────── */

export function CustomizationSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="customization"
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
            {/* Phone mockup — left on desktop */}
            <div
              className={cn(
                animation.classes.fadeUp,
                animDelay(3),
                "shrink-0 order-2 lg:order-1",
                animation.classes.floatSlow,
              )}
            >
              <CustomizationMockup />
            </div>

            {/* Content — right on desktop */}
            <div className="flex-1 order-1 lg:order-2 text-center lg:text-right">
              {/* Badge */}
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
                    d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786.11.935-.3a7.012 7.012 0 0 1 .361-1.035c.137-.31.55-.42.83-.214 1.32.968 1.673 2.485.714 3.576A7.002 7.002 0 0 1 5.5 10a7 7 0 0 1 2.08-4.947A7 7 0 0 1 13.5 4.938Zm-1.447 7.512a5 5 0 1 0-6.136 2.5 5 5 0 0 0 6.136-2.5Zm.002-4.376a5 5 0 0 0-7.5 6.62L9.25 9.5l2.805-1.426Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className={cn(typography.badge, "text-violet-200")}>
                  شخصی‌سازی
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
                ظاهر صفحه را{" "}
                <span className={gradients.textPrimary}>مطابق برندت</span> بساز
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
                قالب آماده انتخاب کن، رنگ‌ها را تغییر بده، فونت دلخواه بگذار،
                لوگو و کاور اضافه کن و قبل از انتشار، همه چیز را به‌صورت زنده
                پیش‌نمایش بگیر.
              </p>

              {/* Items grid */}
              <div
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(3),
                  "mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 text-right",
                )}
              >
                {customItems.map((item) => {
                  const t = accentTokens[item.color];
                  return (
                    <div
                      key={item.label}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl border p-3.5",
                        borders.subtle,
                        backgrounds.surface.glass,
                        animation.smooth,
                        "hover:border-white/12 hover:bg-white/6",
                        animation.hoverLift,
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center",
                          layout.radius.md,
                          "border",
                          t.border,
                          t.bg,
                          t.text,
                          animation.colors,
                          t.bgHover,
                        )}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium text-slate-200 group-hover:text-white",
                          animation.colors,
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ──────────────────────────────────────────────
   BENEFITS — DATA
   ────────────────────────────────────────────── */

const userBenefits = [
  "ساخت صفحه اختصاصی بدون دانش فنی",
  "جمع کردن تمام لینک‌ها در یک صفحه",
  "ارتباط سریع‌تر با مخاطبان",
  "افزایش اعتماد برند",
  "دسترسی به آمار بازدید و کلیک",
];

const platformBenefits = [
  "امکان جذب کاربران زیاد",
  "ورود به بازار کسب‌وکارهای کوچک",
  "ارائه خدمات اختصاصی",
  "فروش قالب‌های ویژه",
  "شخصی‌سازی صفحات",
  "درآمدزایی از پشتیبانی فنی",
];

interface BenefitsCard {
  title: string;
  description: string;
  benefits: string[];
  color: AccentColor;
  icon: React.ReactNode;
}

const benefitsCards: BenefitsCard[] = [
  {
    title: "برای کاربران",
    description:
      "ساخت صفحه اختصاصی بدون دانش فنی، جمع کردن تمام لینک‌ها در یک صفحه، ارتباط سریع‌تر با مخاطبان، افزایش اعتماد برند و دسترسی به آمار بازدید و کلیک.",
    benefits: userBenefits,
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372c1.035 0 2.03-.167 2.96-.474M15 19.128v-.378c0-.62.504-1.125 1.125-1.125h.375c1.621 0 3.057-.81 3.924-2.05M15 19.128a9.714 9.714 0 0 1-3 .372m-3 0a9.714 9.714 0 0 1-3-.372m3 .372v-.378c0-.62-.504-1.125-1.125-1.125H7.5c-1.621 0-3.057-.81-3.924-2.05M9 19.128a9.38 9.38 0 0 1-2.625.372c-1.035 0-2.03-.167-2.96-.474M12 15a3.75 3.75 0 1 0 0-7.5A3.75 3.75 0 0 0 12 15Zm7.5-3a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Zm-15 0a2.25 2.25 0 1 0-4.5 0 2.25 2.25 0 0 0 4.5 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "برای مالک پلتفرم",
    description:
      "امکان جذب کاربران زیاد، ورود به بازار کسب‌وکارهای کوچک، ارائه خدمات اختصاصی، فروش قالب‌های ویژه، شخصی‌سازی صفحات و درآمدزایی از پشتیبانی فنی.",
    benefits: platformBenefits,
    color: "emerald",
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
  },
];

/* ──────────────────────────────────────────────
   BENEFIT CARD
   ────────────────────────────────────────────── */

function BenefitCard({ card, index }: { card: BenefitsCard; index: number }) {
  const t = accentTokens[card.color];

  return (
    <article
      className={cn(
        animation.classes.fadeUp,
        animDelay(index + 2),
        "group relative overflow-hidden p-7 sm:p-9",
        layout.radius.xl,
        borders.subtle,
        backgrounds.surface.card,
        animation.smooth,
        t.borderHover,
        t.shadow,
        animation.hoverLiftLg,
        "hover:shadow-[0_30px_60px_-25px]",
      )}
    >
      {/* Corner glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl",
          t.glow,
          "opacity-0 group-hover:opacity-100",
          animation.opacity,
        )}
      />

     

      {/* Icon */}
      <div
        className={cn(
          "relative inline-flex p-0.5 shadow-lg",
          components.iconBox.lg,
          borders.light,
          `bg-linear-to-br ${t.gradient}`,
        )}
      >
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-[14px] text-white",
            backgrounds.surface.darkAlt,
          )}
        >
          {card.icon}
        </div>
      </div>

      <h3 className={cn("mt-6", typography.h3)}>{card.title}</h3>
      <p className={cn("mt-3 leading-7", typography.cardDescription)}>
        {card.description}
      </p>

      {/* Benefits list */}
      <ul className="mt-6 space-y-2.5">
        {card.benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-center gap-3 text-sm text-slate-200"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                t.border,
                t.bg,
              )}
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className={cn("h-3 w-3", t.text)}
              >
                <path
                  fillRule="evenodd"
                  d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* ──────────────────────────────────────────────
   BENEFITS SECTION
   ────────────────────────────────────────────── */

export function BenefitsSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="benefits"
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
                components.badge.emerald,
              )}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-emerald-300"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={cn(typography.badge, "text-emerald-200")}>
                مزایا
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
              مزایای استفاده از{" "}
              <span className={gradients.textPrimary}>این اپلیکیشن</span>
            </h2>
          </div>

          {/* Cards */}
          <div className="mt-14 grid gap-6 sm:mt-16 lg:mt-20 lg:grid-cols-2 lg:gap-8">
            {benefitsCards.map((card, i) => (
              <BenefitCard key={card.title} card={card} index={i} />
            ))}
          </div>

          {/* Bottom summary strip */}
          <div
            className={cn(
              animation.classes.fadeUp,
              animDelay(4),
              "mt-12 sm:mt-14",
            )}
          >
            <div
              className={cn(
                "flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border px-8 py-6",
                borders.subtle,
                backgrounds.surface.glassMedium,
              )}
            >
              {[
                {
                  value: "۳",
                  label: "مرحله ساده برای شروع",
                  color: "sky" as AccentColor,
                },
                {
                  value: "۱۲+",
                  label: "نوع بلوک آماده",
                  color: "cyan" as AccentColor,
                },
                {
                  value: "۱۰۰٪",
                  label: "بدون کدنویسی",
                  color: "emerald" as AccentColor,
                },
              ].map((stat) => {
                const t = accentTokens[stat.color];
                return (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-1 text-center"
                  >
                    <span
                      className={cn(
                        "text-2xl font-extrabold sm:text-3xl",
                        t.text,
                      )}
                    >
                      {stat.value}
                    </span>
                    <span className={typography.label}>{stat.label}</span>
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
