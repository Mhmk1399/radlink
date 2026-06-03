"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  accentTokens,
  backgrounds,
  borders,
  cn,
  gradients,
  shadows,
  typography,
} from "@/lib/design/design-system";
import { usePathname } from "next/navigation";

/* ══════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════ */

const islandKeyframes = `
@keyframes island-enter{0%{opacity:0;transform:translateY(40px) scale(.9)}50%{transform:translateY(-4px) scale(1.01)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes island-expand{0%{max-height:68px;border-radius:9999px}100%{max-height:420px;border-radius:28px}}
@keyframes island-collapse{0%{max-height:420px;border-radius:28px}100%{max-height:68px;border-radius:9999px}}
@keyframes island-item-enter{0%{opacity:0;transform:translateY(10px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes island-ripple{0%{transform:scale(0);opacity:.35}100%{transform:scale(2.5);opacity:0}}
@keyframes island-glow{0%,100%{box-shadow:0 0 15px 0 rgba(56,189,248,.08),0 -4px 24px -8px rgba(0,0,0,.5)}50%{box-shadow:0 0 25px 2px rgba(56,189,248,.15),0 -4px 24px -8px rgba(0,0,0,.5)}}
@keyframes island-overlay-in{0%{opacity:0}100%{opacity:1}}
.island-enter{animation:island-enter .55s cubic-bezier(.22,1,.36,1) both}
.island-expand{animation:island-expand .4s cubic-bezier(.22,1,.36,1) both}
.island-collapse{animation:island-collapse .35s cubic-bezier(.22,1,.36,1) both}
.island-item-enter{animation:island-item-enter .3s cubic-bezier(.22,1,.36,1) both}
.island-glow{animation:island-glow 4s ease-in-out infinite}
.island-overlay-in{animation:island-overlay-in .2s ease both}
`;

/* ══════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════ */

interface IslandItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navIslandItems: IslandItem[] = [
  {
    id: "home",
    label: "خانه",
    href: "#home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[21px] w-[21px]">
        <path
          d="M2.25 12l8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "features",
    label: "امکانات",
    href: "#features",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[21px] w-[21px]">
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
    id: "how-it-works",
    label: "مراحل",
    href: "#how-it-works",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[21px] w-[21px]">
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
    id: "faq",
    label: "سوالات",
    href: "#faq",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[21px] w-[21px]">
        <path
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const expandedExtraLinks = [
  {
    label: "نمونه صفحات",
    href: "#templates",
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  },
  {
    label: "کاربردها",
    href: "#use-cases",
    icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  },
];

/* ══════════════════════════════════════════════
   HOOKS
   ══════════════════════════════════════════════ */

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) {
          const best = visible.reduce((a, b) =>
            a.intersectionRatio > b.intersectionRatio ? a : b,
          );
          setActive(best.target.id);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/* ══════════════════════════════════════════════
   RIPPLE
   ══════════════════════════════════════════════ */

function useRipple() {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const trigger = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
    const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
    setRipple({ x: cx - rect.left, y: cy - rect.top });
    setTimeout(() => setRipple(null), 500);
  }, []);
  return { ripple, trigger };
}

/* ══════════════════════════════════════════════
   NAV BUTTON
   ══════════════════════════════════════════════ */

function NavButton({
  item,
  isActive,
  onClick,
}: {
  item: IslandItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const { ripple, trigger } = useRipple();
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        trigger(e);
        onClick();
      }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setTimeout(() => setPressed(false), 150)}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl px-1 py-2 min-w-[54px]",
        "transition-transform duration-150 touch-manipulation select-none",
        isActive
          ? cn(
              accentTokens.amber.bg, // active background
              borders.inner, // border
              shadows.innerLight, // shadow
              typography.navItemActive, // text color
            )
          : cn(
              typography.navItem, // text color
              borders.inner, // optional border
            ),
        pressed ? "scale-[0.85]" : "scale-100",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {ripple && (
        <span
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
            animation: "island-ripple .5s ease-out forwards",
            backgroundColor: accentTokens.orange.glow.replace("bg-", ""), // gold glow
          }}
        />
      )}

      <div
        className={cn(
          "absolute inset-1 rounded-xl transition-all duration-300",
          isActive
            ? "bg-yellow-400/[0.1] border border-yellow-400/20"
            : "border border-transparent",
        )}
      />

      <div
        className={cn(
          "relative z-10 transition-all duration-200",
          isActive && "drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]",
        )}
      >
        {item.icon}
      </div>

      <span
        className={cn(
          "relative z-10 text-[10px] font-medium leading-none transition-colors duration-200",
          isActive ? typography.navItemActive : typography.navItem,
        )}
      >
        {item.label}
      </span>

      <div
        className={cn(
          "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300",
          isActive
            ? "w-4 bg-yellow-400 shadow-[0_0_6px_rgba(56,189,248,0.5)]"
            : "w-0",
        )}
      />
    </button>
  );
}

/* ══════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════ */

export default function DynamicIsland() {
  const [expanded, setExpanded] = useState(false);
  const activeSection = useActiveSection(navIslandItems.map((i) => i.id));
  const islandRef = useRef<HTMLDivElement>(null);

  const pathName = usePathname();

  // Close on outside touch
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node))
        setExpanded(false);
    };
    document.addEventListener("touchstart", handler);
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [expanded]);

  const handleNavClick = useCallback((href: string) => {
    setExpanded(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  if (pathName === "/admin") {
    return null;
  }
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: islandKeyframes }} />

      {/* Overlay */}
      {expanded && (
        <div
          className="island-overlay-in fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Island — همیشه نمایش داده می‌شود */}
      <div
        ref={islandRef}
        dir="rtl"
        className={cn(
          "fixed z-[999] lg:hidden",
          "bottom-0 left-0 right-0",
          "flex justify-center",
          "px-3 pb-[max(8px,env(safe-area-inset-bottom))]",
          // ❌ هیچ translate-y یا opacity وابسته به اسکرول نداریم
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden",
            expanded ? "rounded-[28px]" : "rounded-full",
            backgrounds.surface.glass, // DS background
            borders.inner, // DS border
            expanded ? shadows.card : shadows.orb, // DS shadow/glow
            expanded ? "island-expand" : "island-collapse",
            "island-enter",
          )}
        >
          {/* Top line */}
          <div
            className={cn(
              "absolute inset-x-4 top-0 h-px",
              gradients.primary,
              expanded ? "opacity-40" : "opacity-25",
            )}
          />

          {/* ── Collapsed ── */}
          {!expanded && (
            <div className="relative flex items-center px-1 py-1">
              <div className="flex flex-1 items-center justify-around">
                {navIslandItems.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    isActive={activeSection === item.id}
                    onClick={() => handleNavClick(item.href)}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 pl-0.5 pr-1">
                <div className="h-5 w-px bg-white/[0.07]" />
                <Link
                  href="/auth"
                  className={cn(
                    "flex h-10 items-center gap-1.5 rounded-full px-4",
                    "bg-linear-to-r from-yellow-500 to-yellow-700",
                    "text-[12px] font-bold text-white",
                    "shadow-[0_2px_12px_-2px_rgba(56,189,248,0.45)]",
                    "active:scale-[0.9] transition-transform duration-150 touch-manipulation",
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                  <span>ساخت</span>
                </Link>
              </div>
            </div>
          )}

          {/* ── Expanded ── */}
          {expanded && (
            <div className="p-3">
              {/* Header */}
              <div className="flex items-center justify-between px-1.5 pb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      gradients.logo,
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
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
                        className="fill-yellow-100"
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
                  </div>
                  <span className="text-[13px] font-bold text-white">
                    لندینگ‌ساز هوشمند
                  </span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/6 bg-white/3 text-slate-400 active:scale-[0.85] transition-transform duration-150 touch-manipulation"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                  </svg>
                </button>
              </div>

              <div
                className={cn(
                  "h-px mx-1 mb-2",
                  gradients.divider,
                  "opacity-15",
                )}
              />

              {/* Nav grid */}
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                {navIslandItems.map((item, i) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "island-item-enter flex flex-col items-center gap-1 rounded-2xl border p-2.5",
                        "transition-all duration-150 touch-manipulation active:scale-[0.9]",
                        isActive
                          ? "border-yellow-400/20 bg-yellow-400/8 text-yellow-300"
                          : "border-white/3 bg-white/2 text-slate-500 active:bg-white/5",
                      )}
                      style={{
                        animationDelay: `${i * 0.04}s`,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {item.icon}
                      <span className="text-[10px] font-medium">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Extra links */}
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                {expandedExtraLinks.map((link, i) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.href)}
                    className={cn(
                      "island-item-enter flex items-center gap-2 rounded-xl border border-white/3 bg-white/2 px-3 py-2",
                      "text-slate-500 active:bg-white/5 active:scale-[0.96]",
                      "transition-all duration-150 touch-manipulation",
                    )}
                    style={{
                      animationDelay: `${(i + 4) * 0.04}s`,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 shrink-0"
                    >
                      <path
                        d={link.icon}
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[11px] font-medium">
                      {link.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth"
                  onClick={() => setExpanded(false)}
                  className={cn(
                    "island-item-enter flex h-10 items-center justify-center gap-1.5 rounded-xl",
                    gradients.primary, // DS gradient
                    typography.ctaText, // DS text color
                    shadows.ctaSmall, // DS shadow
                    "active:scale-[0.93] transition-transform duration-150 touch-manipulation",
                  )}
                  style={{
                    animationDelay: "0.25s",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                  <span>شروع رایگان</span>
                </Link>

                <Link
                  href="/auth"
                  onClick={() => setExpanded(false)}
                  className={cn(
                    "island-item-enter flex h-10 items-center justify-center gap-1.5 rounded-xl",
                    "border border-white/6 bg-white/3",
                    "text-[12px] font-medium text-slate-300",
                    "active:scale-[0.93] active:bg-white/6",
                    "transition-all duration-150 touch-manipulation",
                  )}
                  style={{
                    animationDelay: "0.3s",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>ورود</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
