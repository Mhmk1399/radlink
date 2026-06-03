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
  type AccentColor,
  animDelay,
} from "@/lib/design/design-system";

/* ──────────────────────────────────────────────
   SHARED COMPONENTS
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn("h-3.5 w-3.5", accentTokens.sky.text)}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   DATA — SOLUTION ITEMS
   ────────────────────────────────────────────── */

interface SolutionItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: AccentColor;
}

const solutionItems: SolutionItem[] = [
  {
    title: "لینک بیو",
    desc: "همه لینک‌های مهم در یک صفحه",
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
    title: "کارت ویزیت دیجیتال",
    desc: "اطلاعات تماس و شبکه‌های اجتماعی",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "لندینگ کمپین",
    desc: "صفحه مخصوص تبلیغات و رویدادها",
    color: "cyan",
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
    title: "صفحه معرفی خدمات",
    desc: "نمایش حرفه‌ای خدمات و محصولات",
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const solutionCheckpoints = [
  "بدون نیاز به دانش فنی یا برنامه‌نویسی",
  "مدیریت تمام لینک‌ها و محتواها در یک جا",
  "قابل اشتراک‌گذاری با یک لینک کوتاه",
];

/* ──────────────────────────────────────────────
   DATA — FEATURE CARDS
   ────────────────────────────────────────────── */

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: AccentColor;
}

const featureCards: FeatureCard[] = [
  {
    title: "ساخت صفحه اختصاصی",
    description:
      "یک نام کاربری انتخاب کن و صفحه اختصاصی خودت را با آدرس منحصربه‌فرد بساز.",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 s-icon-rotate">
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
    title: "ویرایشگر بلوکی",
    description:
      "لینک، عکس، ویدئو، متن، شبکه اجتماعی، پیام‌رسان، FAQ، بنر و شمارنده را به‌صورت بلوک اضافه و مدیریت کن.",
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 s-icon-rotate">
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
    title: "شخصی‌سازی ظاهر",
    description:
      "رنگ، فونت، قالب، لوگو، کاور و چینش صفحه را مطابق هویت بصری برندت تنظیم کن.",
    color: "violet",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 s-icon-rotate">
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
    title: "QR Code اختصاصی",
    description:
      "برای هر صفحه QR Code بساز و آن را روی کارت ویزیت، بسته‌بندی، بروشور یا شبکه‌های اجتماعی استفاده کن.",
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 s-icon-rotate">
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
    title: "آمار بازدید و کلیک",
    description:
      "بازدید صفحه، کلیک لینک‌ها، تعامل کاربران و عملکرد مسیرهای ارتباطی را بررسی کن.",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 s-icon-rotate">
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
    title: "پنل مدیریت ساده",
    description:
      "همه صفحات، بلوک‌ها، لینک‌ها، ظاهر، آمار و تنظیمات حساب را از یک داشبورد مدیریت کن.",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 s-icon-rotate">
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
   FEATURE CARD COMPONENT
   ────────────────────────────────────────────── */

function FeatureCardComponent({
  card,
  index,
}: {
  card: FeatureCard;
  index: number;
}) {
  const tokens = accentTokens[card.color];

  return (
    <article
      className={cn(
        animation.classes.fadeUp,
        animDelay(index + 2),
        "s-icon-hover group relative overflow-hidden p-6 sm:p-8",
        layout.radius.xl,
        borders.subtle,
        backgrounds.surface.card,
        animation.smooth,
        animation.hoverLiftLg,
        tokens.borderHover,
        tokens.shadow,
        "hover:shadow-[0_30px_60px_-25px]",
      )}
    >
      {/* Corner glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl",
          tokens.glow,
          "opacity-0 group-hover:opacity-100",
          animation.opacity,
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "relative inline-flex p-0.5 shadow-lg",
          components.iconBox.lg,
          borders.subtle,
          `bg-linear-to-br ${tokens.gradient}`,
          animation.smooth,
        )}
      >
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-[14px] text-white",
            backgrounds.surface.darkAlt,
            animation.smooth,
            tokens.bgHover,
            `group-hover:${tokens.text}`,
          )}
        >
          {card.icon}
        </div>
      </div>

      {/* Number */}
      <div
        className={cn(
          components.numberBadge,
          "absolute left-6 top-6 sm:left-8 sm:top-8",
        )}
      >
        {toPersian(index + 1)}
      </div>

      <h3 className={cn("mt-5", typography.cardTitle)}>{card.title}</h3>
      <p className={cn("mt-3", typography.cardDescription)}>
        {card.description}
      </p>
    </article>
  );
}

/* ──────────────────────────────────────────────
   SOLUTION VISUAL — طراحی جدید بدون overlap
   ────────────────────────────────────────────── */

function SolutionVisual() {
  return (
    <div
      className={cn(
        animation.classes.fadeUp,
        animDelay(2),
        "relative flex flex-1 items-center justify-center py-8",
      )}
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Center orb */}
        <div className="relative">
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "h-40 w-40 rounded-full border border-sky-400/10 sm:h-48 sm:w-48",
                animation.classes.pulseRing,
              )}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "h-32 w-32 rounded-full border border-cyan-400/10 sm:h-40 sm:w-40",
                animation.classes.pulseRing,
              )}
              style={{ animationDelay: "1.2s" }}
            />
          </div>

          {/* Orb */}
          <div
            className={cn(
              "relative z-10 flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28",
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

            {/* Scan line */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div
                className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-sky-400/30 to-transparent"
                style={{ animation: "nf-scan 4s linear infinite", top: "50%" }}
              />
            </div>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className={cn(
                "relative z-10 h-9 w-9 sm:h-10 sm:w-10",
                accentTokens.sky.text,
              )}
            >
              <path
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.553-4.244a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(0.5 2.5) scale(.88)"
              />
            </svg>
          </div>

          {/* Connecting lines from orb to cards */}
          <div className="absolute left-1/2 bottom-0 h-8 w-px -translate-x-1/2 bg-linear-to-b from-sky-400/20 to-transparent" />
        </div>

        {/* Solution cards — گرید 2×2 بدون overlap */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs sm:max-w-sm">
          {solutionItems.map((item, i) => {
            const t = accentTokens[item.color];
            return (
              <div
                key={item.title}
                className={cn(
                  animation.classes.fadeUp,
                  "group relative overflow-hidden rounded-2xl border p-3 sm:p-4",
                  "transition-all duration-300 touch-manipulation",
                  borders.subtle,
                  backgrounds.surface.card,
                  "hover:border-white/12 hover:bg-white/6 hover:-translate-y-0.5",
                  "active:scale-[0.97]",
                )}
                style={{ animationDelay: `${i * 0.08 + 0.3}s` }}
              >
                {/* Corner glow */}
                <div
                  className={cn(
                    "pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl",
                    t.glow,
                    "opacity-0 group-hover:opacity-100",
                    animation.opacity,
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border",
                    t.border,
                    t.bg,
                    t.text,
                    animation.smooth,
                    "group-hover:scale-105",
                  )}
                >
                  {item.icon}
                </div>

                {/* Text */}
                <p className="mt-2 text-[12px] font-bold text-white leading-tight">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400 leading-snug">
                  {item.desc}
                </p>

                {/* Connector dot */}
                <div
                  className={cn(
                    "absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full",
                    t.dot,
                    "opacity-40",
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom label */}
        <div
          className={cn(
            animation.classes.fadeUp,
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
            borders.subtle,
            backgrounds.surface.glassMedium,
          )}
          style={{ animationDelay: "0.7s" }}
        >
          <div className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-300" />
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            همه در یک لینک ساده
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   SOLUTION SECTION
   ────────────────────────────────────────────── */

export function SolutionSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes nf-scan{0%{top:-10%}100%{top:110%}}`,
        }}
      />

      <section
        id="solution"
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          <div
            className={cn(
              "flex flex-col items-center gap-10 lg:flex-row lg:items-center",
              layout.gap.sectionLarge,
            )}
          >
            {/* ── LEFT : Visual ── */}
            <SolutionVisual />

            {/* ── RIGHT : Content ── */}
            <div className="flex-1 text-center lg:text-right">
              {/* Badge */}
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
                  راه‌حل ما
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
                یک لینک، برای تمام{" "}
                <span className={gradients.textPrimary}>مسیرهای ارتباطی</span>{" "}
                تو
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
                این اپلیکیشن به تو کمک می‌کند بدون دانش فنی، یک صفحه اختصاصی
                بسازی و تمام اطلاعات مهمت را داخل آن مدیریت کنی. از لینک بیو و
                کارت ویزیت دیجیتال گرفته تا لندینگ پیج کمپین و صفحه معرفی خدمات،
                همه چیز با چند کلیک ساخته می‌شود.
              </p>

              {/* Key points — طراحی بهتر با کارت‌های جدا */}
              <div
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(3),
                  "mt-8 space-y-2.5 text-right",
                )}
              >
                {solutionCheckpoints.map((point, i) => (
                  <div
                    key={point}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border p-3 sm:p-3.5",
                      "transition-all duration-300",
                      borders.subtle,
                      backgrounds.surface.glass,
                      "hover:border-sky-400/15 hover:bg-sky-400/4",
                    )}
                  >
                    {/* Number + Check */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        accentTokens.sky.border,
                        accentTokens.sky.bg,
                        animation.smooth,
                        "group-hover:scale-105",
                      )}
                    >
                      <CheckIcon />
                    </div>

                    <span
                      className={cn(
                        "text-sm text-slate-200 group-hover:text-white",
                        animation.colors,
                      )}
                    >
                      {point}
                    </span>

                    {/* Hover arrow */}
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className={cn(
                        "mr-auto h-3.5 w-3.5 shrink-0 -scale-x-100 text-slate-600",
                        "transition-all duration-300",
                        "group-hover:text-sky-400 group-hover:-translate-x-1",
                      )}
                    >
                      <path
                        fillRule="evenodd"
                        d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(4),
                  "mt-8 flex items-center justify-center gap-6 lg:justify-start",
                )}
              >
                {[
                  { value: "۳", label: "مرحله ساده", color: accentTokens.sky },
                  { value: "۱۲+", label: "نوع بلوک", color: accentTokens.cyan },
                  {
                    value: "∞",
                    label: "صفحه قابل ساخت",
                    color: accentTokens.emerald,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        "text-xl font-extrabold sm:text-2xl",
                        stat.color.text,
                      )}
                    >
                      {stat.value}
                    </span>
                    <span className={cn(typography.labelSmall)}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div
                className={cn(
                  animation.classes.fadeUp,
                  animDelay(5),
                  "mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start",
                )}
              >
                <Link
                  href="/create"
                  className={cn(components.ctaPrimary, "px-7")}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-0",
                      "bg-linear-to-r from-white/0 via-white/20 to-white/0",
                      "opacity-0 group-hover:opacity-100",
                      animation.opacity,
                      animation.classes.shimmer,
                    )}
                  />
                  <span className="relative z-10">شروع ساخت صفحه</span>
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

/* ──────────────────────────────────────────────
   FEATURES SECTION
   ────────────────────────────────────────────── */

export function FeaturesSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="features"
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        {/* BG */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              "absolute left-1/2 top-0 h-150 w-200 -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl",
              "bg-linear-to-b from-sky-500/6 to-transparent",
            )}
          />
          <div
            className={cn(
              "absolute left-0 top-1/4 h-64 w-64 rounded-full blur-3xl",
              backgrounds.glow.skyOrb,
              animation.classes.floatMedium,
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 right-0 h-64 w-64 rounded-full blur-3xl",
              backgrounds.glow.blueOrb,
              animation.classes.floatSlow,
            )}
          />
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]",
              backgrounds.glow.skyCenter,
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
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
              </svg>
              <span className={cn(typography.badge, "text-sky-200")}>
                امکانات کلیدی
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
              امکانات اصلی <span className={gradients.textPrimary}>پلتفرم</span>
            </h2>

            <p
              className={cn(
                animation.classes.fadeUp,
                animDelay(2),
                "mt-5",
                typography.body,
              )}
            >
              هر چیزی که برای ساخت، مدیریت و اشتراک‌گذاری یک صفحه حرفه‌ای نیاز
              داری، در یک داشبورد ساده و سریع آماده شده است.
            </p>
          </div>

          {/* ── Cards Grid ── */}
          <div className={cn("mt-14 sm:mt-16 lg:mt-20", layout.grid.features)}>
            {featureCards.map((card, i) => (
              <FeatureCardComponent key={card.title} card={card} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
