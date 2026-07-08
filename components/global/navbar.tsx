"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/design/design-system";

const LOGO_W = 160; // ← put the real pixel width of radlinklogo.png
const LOGO_H = 48; //  ← put the real pixel height (keeps the true ratio)

const navCss = `
@keyframes nav-enter{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
.nav-enter{animation:nav-enter .5s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){.nav-enter{animation:none}}
`;

type NavItem = { label: string; href: string };

const navItems: NavItem[] = [
  { label: "خانه", href: "#home" },
  { label: "امکانات", href: "#features" },
  { label: "کاربردها", href: "#use-cases" },
  { label: "سوالات متداول", href: "#faq" },
  { label: "درباره ما", href: "/about" },
  { label: "ارتباط با ما", href: "/contact" },
];

/* ── Scroll state: scrolled flag, hide-on-scroll-down, progress ── */
function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      setScrolled(y > 16);
      // Hysteresis: hide only after clear downward intent, show instantly on up
      if (delta > 6 && y > 240) setHidden(true);
      else if (delta < -4 || y < 120) setHidden(false);

      // Progress line — direct DOM write, no re-render per scroll frame
      if (progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(y / max, 1) : 0;
        progressRef.current.style.transform = `scaleX(${p})`;
      }

      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { scrolled, hidden, progressRef };
}

/* ── Active section via IntersectionObserver ── */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.3, 0.6] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id.slice(1));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function SmartLandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const { scrolled, hidden, progressRef } = useScrollState();
  const pathName = usePathname();
  const router = useRouter();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const sectionIds = navItems
    .filter((i) => i.href.startsWith("#"))
    .map((i) => i.href);
  const activeSection = useActiveSection(sectionIds);

  const ctaHref = hasAuthToken ? "/admin" : "/auth";
  const builderHref = hasAuthToken ? "/builder" : "/auth";

  /* Sync auth token from localStorage */
  useEffect(() => {
    const sync = () => {
      try {
        setHasAuthToken(Boolean(localStorage.getItem("auth_token")));
      } catch {
        setHasAuthToken(false);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  /* Body scroll lock while mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Close on resize-to-desktop and on Escape (returning focus to toggle) */
  useEffect(() => {
    const onResize = () => window.innerWidth >= 1024 && setIsOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const isItemActive = useCallback(
    (item: NavItem) =>
      item.href.startsWith("#")
        ? pathName === "/" && activeSection === item.href
        : pathName === item.href,
    [pathName, activeSection],
  );

  const handleNavClick = useCallback(
    (href: string) => {
      setIsOpen(false);

      // لینک‌های صفحه‌ای مثل /contact یا /about
      if (!href.startsWith("#")) {
        router.push(href);
        return;
      }

      // لینک‌های سکشن — اگر روی صفحه دیگری بودیم، برگرد به خانه
      const el = document.getElementById(href.slice(1));
      if (!el) {
        router.push(`/${href}`);
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      el.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [router],
  );

  if (pathName?.startsWith("/admin")) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: navCss }} />

      {/* Mobile overlay */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-[#020817]/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <header
        dir="rtl"
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-300 ease-out sm:px-4",
          hidden && !isOpen ? "-translate-y-[120%]" : "translate-y-0",
          /* Keyboard users can always reach the navbar even while hidden */
          "focus-within:translate-y-0",
        )}
      >
        <nav
          aria-label="منوی اصلی سایت"
          className={cn(
            "nav-enter relative mx-auto max-w-6xl rounded-2xl border transition-[background-color,border-color,box-shadow] duration-300",
            scrolled || isOpen
              ? "border-white/10 bg-[#060e1b]/85 shadow-[0_16px_40px_-20px_rgba(2,8,23,0.9)] backdrop-blur-xl"
              : "border-white/5 bg-[#060e1b]/40 backdrop-blur-md",
          )}
        >
          {/* Scroll progress — functional detail, transform-only */}
          <div
            className={cn(
              "pointer-events-none absolute inset-x-4 top-0 h-px overflow-hidden rounded-full transition-opacity duration-300",
              scrolled ? "opacity-100" : "opacity-0",
            )}
          >
            <div
              ref={progressRef}
              className="h-full w-full origin-right scale-x-0 bg-gradient-to-l from-sky-400/80 via-cyan-300/60 to-transparent"
            />
          </div>

          {/* ── Row: constant height, nothing resizes on scroll ── */}
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-4">
            {/* ══ LOGO — fixed box, true ratio, no crop ══ */}
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#home");
              }}
              aria-label="صفحه اصلی"
              className={cn(
                "flex h-11 shrink-0 items-center rounded-xl px-1 transition-opacity duration-200 hover:opacity-85",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060e1b]",
              )}
            >
              <Image
                src="/assets/images/radlinklogo.png"
                width={LOGO_W}
                height={LOGO_H}
                alt="رادلینک"
                priority
                className="h-9 w-auto object-contain sm:h-10"
              />
            </Link>

            {/* ══ DESKTOP NAV ══ */}
            <ul className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const isActive = isItemActive(item);
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.href)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
                        isActive
                          ? "text-white"
                          : "text-slate-400 hover:text-white",
                      )}
                    >
                      {item.label}
                      {/* Underline: always mounted, scaleX transition — no keyframe replays */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-3 -bottom-0.5 h-px rounded-full bg-gradient-to-l from-transparent via-sky-300 to-transparent",
                          "origin-center transition-transform duration-300 ease-out",
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-50",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* ══ DESKTOP CTAs ══ */}
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href={ctaHref}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border border-white/10 px-4 text-[13px] font-medium text-slate-300",
                  "transition-colors duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
                )}
              >
                {hasAuthToken ? "ورود به پنل" : "ورود به حساب"}
              </Link>

              <Link
                href={builderHref}
                className={cn(
                  "inline-flex h-9 items-center rounded-full bg-gradient-to-l from-sky-500 to-cyan-400 px-5 text-[13px] font-semibold text-[#04121f]",
                  "shadow-[0_10px_24px_-10px_rgba(56,189,248,0.6)]",
                  "transition-[opacity,box-shadow] duration-200 hover:opacity-90 hover:shadow-[0_12px_28px_-10px_rgba(56,189,248,0.75)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                )}
              >
                {hasAuthToken ? "ساخت صفحه" : "شروع رایگان"}
              </Link>
            </div>

            {/* ══ MOBILE TOGGLE ══ */}
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
              onClick={() => setIsOpen((p) => !p)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white lg:hidden",
                "transition-colors duration-200 hover:bg-white/5 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
              )}
            >
              <span className="relative h-4 w-5">
                <span
                  className={cn(
                    "absolute right-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300",
                    isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute right-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200",
                    isOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-0.5 rounded-full bg-current transition-all duration-300",
                    isOpen
                      ? "bottom-1/2 w-5 translate-y-1/2 -rotate-45"
                      : "w-3.5",
                  )}
                />
              </span>
            </button>
          </div>

          {/* ══ MOBILE MENU — grid-rows collapse (height animates for free) ══ */}
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out lg:hidden",
              isOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div id="mobile-navigation" className="min-h-0 overflow-hidden">
              <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
                <ul className="space-y-1">
                  {navItems.map((item, i) => {
                    const isActive = isItemActive(item);
                    return (
                      <li
                        key={item.href}
                        /* Stagger via transition-delay only — no keyframes */
                        style={{
                          transitionDelay: isOpen ? `${i * 35}ms` : "0ms",
                        }}
                        className={cn(
                          "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                          isOpen
                            ? "translate-x-0 opacity-100"
                            : "translate-x-3 opacity-0",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleNavClick(item.href)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium",
                            "transition-colors duration-200",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
                            isActive
                              ? "bg-sky-400/10 text-white"
                              : "text-slate-300 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          {item.label}
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                              isActive ? "bg-sky-300" : "bg-slate-600",
                            )}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="my-3 h-px bg-white/8" />

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={builderHref}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-l from-sky-500 to-cyan-400 text-sm font-semibold text-[#04121f]",
                      "transition-opacity duration-200 hover:opacity-90",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    )}
                  >
                    {hasAuthToken ? "ساخت صفحه" : "شروع رایگان"}
                  </Link>
                  <Link
                    href={ctaHref}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "inline-flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-slate-200",
                      "transition-colors duration-200 hover:bg-white/5 hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
                    )}
                  >
                    {hasAuthToken ? "ورود به پنل" : "ورود به حساب"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer — CONSTANT height so page content never jumps on scroll */}
      <div aria-hidden="true" className="h-[5.5rem]" />
    </>
  );
}
