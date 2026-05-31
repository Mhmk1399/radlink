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
} from "@/lib/design/design-system";

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const footerLinks = [
  { label: "امکانات", href: "#features" },
  { label: "نمونه صفحات", href: "#templates" },
  { label: "تعرفه‌ها", href: "#pricing" },
  { label: "آموزش", href: "#learn" },
  { label: "سوالات متداول", href: "#faq" },
  { label: "تماس با ما", href: "#contact" },
  { label: "قوانین و مقررات", href: "#terms" },
  { label: "حریم خصوصی", href: "#privacy" },
];

const socialLinks = [
  {
    label: "اینستاگرام",
    href: "#instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
      </svg>
    ),
  },
  {
    label: "تلگرام",
    href: "#telegram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
      </svg>
    ),
  },
  {
    label: "لینکدین",
    href: "#linkedin",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
  {
    label: "ایکس (توییتر)",
    href: "#twitter",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

/* ──────────────────────────────────────────────
   FOOTER COMPONENT
   ────────────────────────────────────────────── */

export function SmartLandingFooter() {
  const currentYear = new Date().getFullYear().toLocaleString("fa-IR");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <footer
        dir="rtl"
        className=" relative overflow-hidden bg-linear-to-b from-[#060e1b] via-[#081223] to-[#091828] font-sans text-white antialiased selection:bg-sky-500/30 selection:text-white"
      >
        {/* Top divider glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              "absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2",
              gradients.divider,
            )}
          />
          <div className="absolute left-1/2 top-0 h-48 w-full -translate-x-1/2 bg-linear-to-b from-sky-500/[0.04] to-transparent" />
          <div className={cn("absolute inset-0", backgrounds.grid.lines)} />
        </div>

        {/* ── Main footer body ── */}
        <div
          className={cn(
            "relative",
            layout.container,
            "px-4 pb-6 pt-14 sm:px-6 sm:pt-16 lg:pt-20",
          )}
        >
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_auto]">
            {/* ── Brand column ── */}
            <div className="flex flex-col gap-5">
              {/* Logo */}
              <Link
                href="/"
                className={cn(
                  "group inline-flex w-fit items-center gap-3",
                  layout.radius.lg,
                  animation.base,
                  "hover:opacity-90",
                  focus.ring,
                )}
                aria-label="صفحه اصلی"
              >
                <span
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center overflow-hidden",
                    layout.radius.lg,
                    borders.strong,
                    gradients.logo,
                    shadows.logo,
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-[1px] rounded-[15px]",
                      gradients.innerHighlight,
                    )}
                  />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="relative z-10 h-5 w-5"
                    fill="none"
                  >
                    <rect
                      x="4"
                      y="5"
                      width="16"
                      height="3"
                      rx="1.5"
                      className="fill-white"
                    />
                    <rect
                      x="4"
                      y="10.5"
                      width="11"
                      height="3"
                      rx="1.5"
                      className="fill-sky-100"
                    />
                    <rect
                      x="4"
                      y="16"
                      width="7"
                      height="3"
                      rx="1.5"
                      className="fill-cyan-200"
                    />
                  </svg>
                </span>
                <span className="flex flex-col leading-none">
                  <span className={typography.brandName}>رادلینک</span>
                  <span className={cn("mt-1", typography.brandSub)}>
                    ساخت سریع لندینگ با هوش مصنوعی
                  </span>
                </span>
              </Link>

              {/* Short description */}
              <p
                className={cn(
                  "max-w-xs leading-7",
                  typography.bodySmall,
                  "text-slate-400/90",
                )}
              >
                پلتفرمی برای ساخت لندینگ پیج اختصاصی، لینک بیو و کارت ویزیت
                دیجیتال؛ سریع، ساده، قابل شخصی‌سازی و آماده اشتراک‌گذاری.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center",
                      layout.radius.md,
                      borders.subtle,
                      backgrounds.surface.glass,
                      "text-slate-400",
                      animation.base,
                      "hover:border-sky-400/20 hover:bg-white/[0.07] hover:text-sky-300",
                      animation.activePress,
                      focus.ring,
                    )}
                  >
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Links column ── */}
            <div>
              <p
                className={cn(
                  "mb-4 text-xs font-semibold uppercase tracking-widest",
                  accentTokens.sky.text,
                )}
              >
                لینک‌های مفید
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        "group inline-flex items-center gap-1.5 text-sm text-slate-400",
                        animation.colors,
                        "hover:text-white",
                        focus.ring,
                      )}
                    >
                      <span
                        className={cn(
                          "h-1 w-1 rounded-full bg-slate-600",
                          animation.colors,
                          "group-hover:bg-sky-400",
                        )}
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── CTA column ── */}
            <div className="flex flex-col gap-4">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-widest",
                  accentTokens.emerald.text,
                )}
              >
                همین حالا شروع کن
              </p>

              <Link
                href="/create"
                className={cn(
                  components.ctaSmall,
                  "w-full justify-center px-6",
                )}
              >
                <span>ساخت صفحه رایگان</span>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full bg-white/90",
                    shadows.dot,
                    "transition-transform",
                    animation.fast,
                    "group-hover:scale-110",
                  )}
                />
              </Link>

              <Link
                href="/login"
                className={cn(
                  components.ghostButton,
                  "w-full justify-center px-6",
                )}
              >
                ورود به حساب
              </Link>

              {/* Trust badge */}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2.5",
                  borders.subtle,
                  backgrounds.surface.glassMedium,
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border",
                    accentTokens.emerald.border,
                    accentTokens.emerald.bg,
                  )}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={cn("h-3.5 w-3.5", accentTokens.emerald.text)}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">
                    ثبت‌نام رایگان
                  </p>
                  <p className={cn(typography.labelSmall)}>
                    بدون نیاز به کارت بانکی
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div
            className={cn(
              "mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-700 pt-6 sm:flex-row sm:gap-0"
             
            )}
          >
            {/* Copyright */}
            <p className={cn(typography.labelSmall, "text-slate-500 font-bold")}>
              © {currentYear} رادلینک — تمام حقوق این پلتفرم محفوظ است.
            </p>

            {/* Legal quick links */}
            <div className="flex items-center gap-4">
              {[
                { label: "قوانین", href: "#terms" },
                { label: "حریم خصوصی", href: "#privacy" },
                { label: "تماس", href: "#contact" },
              ].map((link, i) => (
                <span key={link.label} className="flex items-center gap-4">
                  <Link
                    href={link.href}
                    className={cn(
                      typography.labelSmall,
                      "text-slate-500",
                      animation.colors,
                      "hover:text-slate-300",
                      focus.ring,
                    )}
                  >
                    {link.label}
                  </Link>
                  {i < 2 && <span className="h-3 w-px bg-white/10" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default SmartLandingFooter;
