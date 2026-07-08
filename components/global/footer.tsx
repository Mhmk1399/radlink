"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/design/design-system";

/* ────────────────────────────────────────────────────────────
   DESIGN NOTES

   1. Logo fixed — same bug as the navbar: 150×200 (portrait)
      intrinsic ratio + object-cover + h-28 was cropping and
      blowing it up. Now object-contain, sane height, true ratio.
      ⚠ Set LOGO_W / LOGO_H to your real PNG dimensions.

   2. Logo link fixed — it had onClick={preventDefault} with no
      handler, so clicking the logo did nothing. Now it navigates.

   3. Links de-duplicated & grouped — "قوانین/حریم خصوصی/تماس"
      appeared twice (link list AND bottom bar). Links are now
      split into two labeled groups (محصول / شرکت), and the
      bottom bar only holds the legal pair.

   4. Layout rhythm — 12-col grid on lg (brand 4 / links 5 /
      CTA 3), consistent gap-y, one spacing scale instead of
      mixed ad-hoc values. Trust items merged into one card.

   5. No keyframes at all — hover color/transform transitions
      only. Cheapest possible footer.
   ──────────────────────────────────────────────────────────── */

const LOGO_W = 160; // ← real pixel width of radlinklogo.png
const LOGO_H = 48; //  ← real pixel height (keeps true ratio)

/* ── DATA ── */

const productLinks = [
  { label: "امکانات", href: "/#features" },
  { label: "نمونه صفحات", href: "/#templates" },
  { label: "تعرفه‌ها", href: "/#pricing" },
  { label: "آموزش", href: "/#learn" },
  { label: "سوالات متداول", href: "/#faq" },
];

const companyLinks = [
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
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

const ENAMAD = {
  id: "6802735",
  code: "P9TZBGkuLhWv4KuLpyEaZdRk7k75NRaQ",
};

/* ── Small shared pieces ── */

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[11px] font-semibold tracking-[0.18em] text-sky-300/90">
      {children}
    </p>
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 py-1 text-sm text-slate-400",
        "transition-colors duration-200 hover:text-white",
        "focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-400/60",
      )}
    >
      <span className="h-1 w-1 rounded-full bg-slate-600 transition-colors duration-200 group-hover:bg-sky-400" />
      {label}
    </Link>
  );
}

function EnamadTrustSeal() {
  const href = `https://trustseal.enamad.ir/?id=${ENAMAD.id}&Code=${ENAMAD.code}`;
  const src = `https://trustseal.enamad.ir/logo.aspx?id=${ENAMAD.id}&Code=${ENAMAD.code}`;

  return (
    <a
      referrerPolicy="origin"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      aria-label="مشاهده نماد اعتماد الکترونیکی رادلینک"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-white/95 p-2",
        "transition-transform duration-200 hover:bg-white active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        referrerPolicy="origin"
        src={src}
        alt="نماد اعتماد الکترونیکی رادلینک"
        loading="lazy"
        className="h-16 w-16 object-contain"
        {...({ code: ENAMAD.code } as Record<string, string>)}
      />
    </a>
  );
}

/* ── FOOTER ── */

export function SmartLandingFooter() {
  const currentYear = new Date().getFullYear().toLocaleString("fa-IR");
  const pathName = usePathname();

  if (pathName?.startsWith("/admin")) return null;

  return (
    <footer
      dir="rtl"
      className="relative overflow-hidden bg-gradient-to-b from-[#060e1b] to-[#091828] font-sans text-white antialiased selection:bg-sky-500/30"
    >
      {/* Top hairline + soft glow — the only decoration */}
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <div className="mx-auto h-px w-3/4 bg-gradient-to-l from-transparent via-sky-400/40 to-transparent" />
        <div className="mx-auto h-40 w-2/3 bg-gradient-to-b from-sky-500/5 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 lg:pt-20">
        {/* ── Main grid: brand 4 / links 5 / CTA 3 ── */}
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
          {/* ══ BRAND ══ */}
          <div className="flex flex-col items-start gap-5 lg:col-span-4">
            <Link
              href="/"
              aria-label="صفحه اصلی رادلینک"
              className={cn(
                "flex items-center rounded-xl transition-opacity duration-200 hover:opacity-85",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#091828]",
              )}
            >
              <Image
                src="/assets/images/radlinklogo.png"
                width={LOGO_W}
                height={LOGO_H}
                alt="رادلینک"
                className="h-10 w-auto object-contain sm:h-12"
              />
            </Link>

            <p className="max-w-xs text-sm leading-7 text-slate-400">
              پلتفرمی برای ساخت لندینگ پیج اختصاصی، لینک بیو و کارت ویزیت
              دیجیتال؛ سریع، ساده، قابل شخصی‌سازی و آماده اشتراک‌گذاری.
            </p>

            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 text-slate-400",
                    "transition-colors duration-200 hover:border-sky-400/25 hover:bg-sky-400/10 hover:text-sky-300",
                    "active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
                  )}
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* ══ LINKS — two labeled groups instead of one anonymous grid ══ */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-5">
            <nav aria-label="لینک‌های محصول">
              <GroupTitle>محصول</GroupTitle>
              <ul className="space-y-1.5">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="لینک‌های شرکت">
              <GroupTitle>شرکت</GroupTitle>
              <ul className="space-y-1.5">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ══ CTA + TRUST ══ */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <GroupTitle>همین حالا شروع کن</GroupTitle>

            <Link
              href="/builder"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-l from-sky-500 to-cyan-400 px-6 text-sm font-semibold text-[#04121f]",
                "shadow-[0_10px_24px_-10px_rgba(56,189,248,0.55)]",
                "transition-[opacity,box-shadow] duration-200 hover:opacity-90 hover:shadow-[0_12px_28px_-10px_rgba(56,189,248,0.7)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
              )}
            >
              ساخت صفحه رایگان
            </Link>

            <Link
              href="/auth"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-6 text-sm font-medium text-slate-300",
                "transition-colors duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
              )}
            >
              ورود به حساب
            </Link>

            {/* One trust card: free-signup note + Enamad, side by side */}
            <div className="mt-2 flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <EnamadTrustSeal />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-white">
                  نماد اعتماد الکترونیکی
                </p>
                <p className="text-xs leading-5 text-slate-400">
                  ثبت‌نام رایگان — بدون نیاز به کارت بانکی
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar — copyright + legal only (no duplicates) ── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {currentYear} رادلینک — تمام حقوق محفوظ است.
          </p>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="#terms"
              className="text-slate-500 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-400/60"
            >
              قوانین
            </Link>
            <span className="h-3 w-px bg-white/10" />
            <Link
              href="#privacy"
              className="text-slate-500 transition-colors duration-200 hover:text-slate-300 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-400/60"
            >
              حریم خصوصی
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SmartLandingFooter;
