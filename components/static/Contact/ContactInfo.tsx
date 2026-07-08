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
  components,
  accentTokens,
  animDelay,
  type AccentColor,
} from "@/lib/design/design-system";

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

interface InfoItem {
  title: string;
  value: string;
  href: string;
  color: AccentColor;
  icon: React.ReactNode;
}

const infoItems: InfoItem[] = [
  {
    title: "ایمیل پشتیبانی",
    value: "info@radlink.ir",
    href: "mailto:info@radlink.ir",
    color: "sky",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M2.25 6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 0 1 2.25 17.25V6.75Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m3 7 8.445 6.316a1.5 1.5 0 0 0 1.81 0L21.75 7"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "شماره تماس",
    value: "09101822840",
    href: "tel:09101822840",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.372a1.125 1.125 0 0 0-.852-1.09l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97a1.125 1.125 0 0 0 .417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "آدرس دفتر",
    value: "تهران، ابوذر",
    href: "#",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
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
    title: "ساعات پاسخ‌گویی",
    value: "شنبه تا چهارشنبه، ۹ تا ۱۷",
    href: "#",
    color: "cyan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M12 6v6l4 2"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
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
    </div>
  );
}

function InfoCard({ item, index }: { item: InfoItem; index: number }) {
  const tokens = accentTokens[item.color];
  const isLink = item.href !== "#";

  const content = (
    <>
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
      <h3 className={cn("mt-5", typography.cardTitle)}>{item.title}</h3>
      <p className={cn("mt-2 text-sm", tokens.text)} dir="ltr">
        {item.value}
      </p>
    </>
  );

  const className = cn(
    animation.classes.fadeUp,
    animDelay(Math.min(index + 1, 8)),
    "group relative block overflow-hidden p-6 sm:p-7",
    layout.radius.xl,
    borders.subtle,
    backgrounds.surface.card,
    animation.smooth,
    borders.hoverMedium,
    animation.hoverLiftLg,
    shadows.cardHover,
  );

  if (isLink) {
    return (
      <a href={item.href} className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

/* ──────────────────────────────────────────────
   CONTACT INFO SECTION
   ────────────────────────────────────────────── */

export function ContactInfoSection() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="contact-info"
        dir="rtl"
        className="relative overflow-hidden px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:pt-32"
      >
        <SectionBackground />

        <div className={cn("relative", layout.container)}>
          <div className={cn(components.sectionHeader, "max-w-3xl")}>
            <div
              className={cn(
                animation.classes.fadeUp,
                components.badge.base,
                components.badge.sky,
              )}
            >
              <span className={cn(typography.badge, "text-sky-200")}>
                در تماس باشید
              </span>
            </div>

            <h1 className={cn(animation.classes.fadeUp, animDelay(1), "mt-6", typography.h1)}>
              سوالی داری؟{" "}
              <span className={gradients.textPrimary}>با ما در ارتباط باش</span>
            </h1>

            <p className={cn(animation.classes.fadeUp, animDelay(2), "mt-6", typography.bodyLg)}>
              چه سوالی درباره ساخت صفحه داری، چه پیشنهاد همکاری یا گزارش مشکل؛
              تیم رادلینک از هر یک از راه‌های زیر پاسخ‌گوی شماست.
            </p>
          </div>

          <div className={cn("mt-12 sm:mt-14", layout.grid.ctaPair)}>
            {infoItems.map((item, i) => (
              <InfoCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactInfoSection;
