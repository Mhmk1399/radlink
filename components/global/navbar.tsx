"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
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
  interactive,
  accentTokens,
} from "@/lib/design/design-system";
import { usePathname } from "next/navigation";
import Image from "next/image";

/* ──────────────────────────────────────────────
   KEYFRAMES
   ────────────────────────────────────────────── */

const navKeyframes = `
@keyframes nav-slide-down{0%{opacity:0;transform:translateY(-100%)}100%{opacity:1;transform:translateY(0)}}
@keyframes nav-item-fade{0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:translateY(0)}}
@keyframes nav-underline{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}
@keyframes nav-mobile-item{0%{opacity:0;transform:translateX(16px)}100%{opacity:1;transform:translateX(0)}}
@keyframes nav-logo-pulse{0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,0.4)}50%{box-shadow:0 0 0 8px rgba(56,189,248,0)}}
.nav-slide-down{animation:nav-slide-down .5s cubic-bezier(.22,1,.36,1) both}
.nav-item-fade{animation:nav-item-fade .4s cubic-bezier(.22,1,.36,1) both}
.nav-mobile-item{animation:nav-mobile-item .35s cubic-bezier(.22,1,.36,1) both}
.nav-logo-pulse{animation:nav-logo-pulse 3s ease-in-out infinite}
`;

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

type NavItem = {
  label: string;
  href: string;
  current?: boolean;
};

const navItems: NavItem[] = [
  { label: "خانه", href: "#home", current: true },
  { label: "امکانات", href: "#features" },
  { label: "کاربردها", href: "#use-cases" },
  { label: "نمونه صفحات", href: "#templates" },
  { label: "مراحل", href: "#how-it-works" },
  { label: "سوالات متداول", href: "#faq" },
];

/* ──────────────────────────────────────────────
   HOOKS
   ────────────────────────────────────────────── */

function useScrollState() {
  const [state, setState] = useState({
    scrolled: false,
    hidden: false,
    atTop: true,
  });

  useEffect(() => {
    let lastY = 0;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const down = y > lastY;
      const scrolled = y > 20;
      const atTop = y < 5;
      const hidden = down && y > 200;

      setState({ scrolled, hidden, atTop });
      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return state;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the one with highest intersection ratio
          const best = visible.reduce((a, b) =>
            a.intersectionRatio > b.intersectionRatio ? a : b,
          );
          setActive(`#${best.target.id}`);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id.replace("#", ""));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/* ──────────────────────────────────────────────
   NAVBAR
   ────────────────────────────────────────────── */

export default function SmartLandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const { scrolled, hidden, atTop } = useScrollState();
  const activeSection = useActiveSection(navItems.map((i) => i.href));
  const pathName = usePathname();
  const ctaHref = hasAuthToken ? "/admin" : "/auth";
  const builderHref = hasAuthToken ? "/builder" : "/auth";

  useEffect(() => {
    const syncAuthToken = () => {
      setHasAuthToken(Boolean(localStorage.getItem("auth_token")));
    };

    syncAuthToken();
    window.addEventListener("storage", syncAuthToken);
    window.addEventListener("focus", syncAuthToken);

    return () => {
      window.removeEventListener("storage", syncAuthToken);
      window.removeEventListener("focus", syncAuthToken);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  if (pathName === "/admin") {
    return null;
  }
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: navKeyframes }} />

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
          style={{ animation: "toast-enter-top .3s ease both" }}
        />
      )}

      <header
        dir="rtl"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-3 transition-all  duration-500 ease-out",
          scrolled ? "pt-2 sm:pt-2" : "pt-3 sm:pt-4",
          hidden && !isOpen
            ? "-translate-y-full opacity-0"
            : "translate-y-0 opacity-100",
          scrolled ? backgrounds.navbarScrolled : backgrounds.navbar,
        )}
      >
        <div className={layout.container}>
          <nav
            aria-label="منوی اصلی سایت"
            className={cn(
              "nav-slide-down relative overflow-visible p-1.5 transition-all duration-500 ease-out",
              layout.radius.navbar,
              // Dynamic background using design system
              scrolled
                ? cn(
                    backgrounds.navbarScrolled, // ← DS navbar background
                    borders.inner, // ← DS border
                    shadows.navbar, // ← DS shadow
                  )
                : cn(
                    backgrounds.navbar, // ← DS navbar background
                    borders.inner, // ← DS border
                    shadows.navbar, // ← DS shadow
                  ),
            )}
          >
            {/* ── Top highlight line ── */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-6 top-0 h-px transition-opacity duration-500",
                gradients.dividerSky,
                scrolled ? "opacity-40" : "opacity-70",
              )}
            />

            {/* ── Corner glows ── */}
            <div
              className={cn(
                "pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-sky-400/10 blur-3xl transition-opacity duration-500",
                scrolled ? "opacity-30" : "opacity-60",
              )}
            />
            <div
              className={cn(
                "pointer-events-none absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-cyan-400/10 blur-3xl transition-opacity duration-500",
                scrolled ? "opacity-20" : "opacity-50",
              )}
            />

            {/* ── Inner container ── */}
            <div
              className={cn(
                "relative flex items-center justify-between transition-all duration-500",
                layout.gap.md,
                layout.radius.navbarInner,
                // Inner background changes with scroll
                scrolled
                  ? "border border-white/4 bg-white/2 px-3 py-2 sm:px-4"
                  : cn(
                      borders.inner,
                      backgrounds.surface.glassMedium,
                      "px-3 py-2.5 sm:px-4",
                    ),
              )}
            >
              {/* ══ LOGO ══ */}
              <Link
                href="/base-landing"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("#home");
                }}
                className={cn(
                  "group inline-flex items-center gap-2.5 rounded-2xl px-1 py-1 text-white",
                  animation.base,
                  animation.activePressSmall,
                  animation.motionSafe,
                  focus.ring,
                )}
                aria-label="صفحه اصلی"
              >
                <span className="flex flex-col leading-none">
                  <Image
                    src="/assets/images/logo.png"
                    width={150}
                    height={200}
                    alt="logo"
                    className="object-cover h-10"
                  />
                </span>
              </Link>

              {/* ══ DESKTOP NAV ══ */}
              <div className="hidden lg:flex lg:flex-1 lg:justify-center">
                <ul
                  className={cn(
                    "flex items-center gap-0.5 p-1 transition-all duration-500",
                    layout.radius.full,
                  )}
                >
                  {navItems.map((item, i) => {
                    const isActive = activeSection === item.href;
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => handleNavClick(item.href)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "nav-item-fade group relative inline-flex cursor-pointer items-center px-3.5 py-2 text-[13px] font-medium transition-all duration-300",
                            layout.radius.full,
                            interactive.touch,
                            animation.motionSafe,
                            focus.ring,
                            isActive
                              ? cn(
                                  typography.navItemActive,
                                  borders.inner,
                                  shadows.innerLight,
                                  accentTokens.sky.bgHover,
                                )
                              : cn(
                                  typography.navItem,
                                  "hover:" + accentTokens.sky.bgHover,
                                  animation.activePress,
                                ),
                          )}
                        >
                          <span className="relative z-10">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* ══ DESKTOP CTAs ══ */}
              <div className="hidden lg:flex items-center gap-2.5">
                <Link
                  href={ctaHref}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-4 text-[13px] font-medium text-slate-300 transition-all duration-300",
                    scrolled ? "h-9" : "h-10",
                    scrolled
                      ? "border-white/6 bg-white/3 hover:bg-white/6"
                      : cn(borders.medium, backgrounds.surface.glass),
                    "hover:text-white hover:border-white/15",
                    shadows.insetGlow,
                    animation.activePress,
                    focus.ring,
                  )}
                >
                  {hasAuthToken ? "ورود به پنل" : "ورود به حساب"}
                </Link>

                <Link
                  href={builderHref}
                  className={cn(
                    "group inline-flex items-center justify-center gap-2 rounded-full border transition-all duration-300",
                    scrolled ? "h-9 px-4 text-[13px]" : "h-10 px-5 text-sm",
                    borders.skyStrong,
                    gradients.primary,
                    "font-semibold text-white",
                    scrolled
                      ? shadows.ctaSmall
                      : cn(
                          shadows.ctaSmall,
                          "hover:shadow-[0_22px_42px_-18px_rgba(56,189,248,0.7)]",
                        ),
                    "hover:-translate-y-0.5",
                    animation.activePress,
                    animation.activeRestore,
                    focus.ringLight,
                  )}
                >
                  <span>{hasAuthToken ? "ساخت صفحه" : "شروع رایگان"}</span>
                  <span
                    className={cn(
                      "rounded-full bg-white/90 transition-all duration-300",
                      shadows.dot,
                      "group-hover:scale-125",
                      scrolled ? "h-1.5 w-1.5" : "h-2 w-2",
                    )}
                  />
                </Link>
              </div>

              {/* ══ MOBILE TOGGLE ══ */}
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls="mobile-navigation"
                aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                  "inline-flex items-center justify-center text-white lg:hidden transition-all duration-300",
                  scrolled ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-2xl",
                  borders.light,
                  backgrounds.surface.glass,
                  shadows.insetGlow,
                  animation.base,
                  "hover:bg-white/8",
                  "active:scale-[0.92]",
                  focus.ring,
                  animation.motionSafe,
                )}
              >
                <span
                  className={cn(
                    "relative transition-all duration-300",
                    scrolled ? "h-4 w-4" : "h-5 w-5",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 h-0.5 rounded-full bg-white transition-all duration-300",
                      scrolled ? "w-4" : "w-5",
                      isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-white transition-all duration-300",
                      scrolled ? "w-4" : "w-5",
                      isOpen ? "opacity-0 scale-x-0" : "opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 bottom-0 h-0.5 rounded-full bg-white transition-all duration-300",
                      isOpen
                        ? cn(
                            scrolled ? "w-4" : "w-5",
                            "bottom-1/2 translate-y-1/2 -rotate-45",
                          )
                        : scrolled
                          ? "w-3"
                          : "w-4",
                    )}
                  />
                </span>
              </button>
            </div>

            {/* ══ MOBILE MENU ══ */}
            <div
              className={cn(
                "grid overflow-hidden transition-all duration-500 ease-out lg:hidden",
                animation.motionSafe,
                isOpen
                  ? "mt-2 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div id="mobile-navigation" className="min-h-0">
                <div
                  className={cn(
                    "rounded-2xl p-2.5 transition-all duration-500",
                    borders.subtle,
                    "bg-[#060e1b]/90 backdrop-blur-2xl",
                    shadows.card,
                    isOpen
                      ? "translate-y-0 scale-100"
                      : "-translate-y-3 scale-[0.97]",
                  )}
                >
                  <ul className="space-y-1">
                    {navItems.map((item, i) => {
                      const isActive = activeSection === item.href;
                      return (
                        <li key={item.label}>
                          <button
                            onClick={() => handleNavClick(item.href)}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                              "nav-mobile-item group flex w-full items-center justify-between border px-4 py-3",
                              layout.radius.lg,
                              animation.base,
                              interactive.touch,
                              focus.ring,
                              isActive
                                ? cn(
                                    "border-sky-400/20 bg-sky-400/8 text-white",
                                    "shadow-[inset_0_1px_0_rgba(56,189,248,0.1)]",
                                  )
                                : cn(
                                    "border-white/4 bg-white/2 text-slate-300",
                                    "hover:border-white/8 hover:bg-white/4 hover:text-white",
                                    animation.activePressSmall,
                                  ),
                            )}
                            style={{ animationDelay: `${i * 0.05 + 0.05}s` }}
                          >
                            <span className="text-sm font-medium">
                              {item.label}
                            </span>
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full transition-all duration-300",
                                isActive
                                  ? cn(
                                      "bg-sky-300",
                                      "shadow-[0_0_8px_rgba(125,211,252,0.6)]",
                                    )
                                  : "bg-slate-600 group-hover:bg-cyan-400 group-hover:scale-125",
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Divider */}
                  <div
                    className={cn(
                      "my-2.5 h-px mx-2",
                      gradients.divider,
                      "opacity-30",
                    )}
                  />

                  {/* Mobile CTAs */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={ctaHref}
                      className={cn(
                        "group inline-flex items-center justify-center gap-2 rounded-full border transition-all duration-300",
                        scrolled ? "h-9 px-4 text-[13px]" : "h-10 px-5 text-sm",
                        borders.skyStrong,
                        gradients.primary,
                        typography.ctaText,
                        scrolled ? shadows.ctaSmall : shadows.ctaSmall,
                        "hover:-translate-y-0.5",
                        animation.activePress,
                        animation.activeRestore,
                        focus.ringLight,
                      )}
                    >
                      <span>
                        {hasAuthToken ? "ورود به پنل" : "شروع رایگان"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full",
                          shadows.dot,
                          "group-hover:scale-125",
                          scrolled ? "h-1.5 w-1.5" : "h-2 w-2",
                        )}
                      />
                    </Link>

                    <Link
                      href={builderHref}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "inline-flex h-11 items-center justify-center px-4",
                        layout.radius.lg,
                        "border border-white/6",
                        "bg-white/3",
                        shadows.insetGlow,
                        "text-sm font-medium text-slate-200",
                        animation.base,
                        interactive.touch,
                        "hover:bg-white/6 hover:text-white",
                        focus.ring,
                        animation.activePress,
                      )}
                    >
                      {hasAuthToken ? "  ساخت صفحه  " : "ورود به حساب"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Spacer — prevents content from going under fixed navbar */}
      <div
        className={cn(
          "transition-all duration-500",
          scrolled ? "h-16" : "h-20",
        )}
      />
    </>
  );
}
