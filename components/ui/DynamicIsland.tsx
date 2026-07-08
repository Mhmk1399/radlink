"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/design/design-system";

const islandCss = `
@keyframes island-enter{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
.island-enter{animation:island-enter .5s cubic-bezier(.22,1,.36,1) both}
@media (prefers-reduced-motion:reduce){.island-enter{animation:none}}
`;

/* ── DATA ── */

interface IslandItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const iconProps = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const navIslandItems: IslandItem[] = [
  {
    id: "home",
    label: "خانه",
    href: "#home",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M2.25 12l8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          {...iconProps}
        />
      </svg>
    ),
  },
  {
    id: "features",
    label: "امکانات",
    href: "#features",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
          {...iconProps}
        />
      </svg>
    ),
  },
  {
    id: "how-it-works",
    label: "مراحل",
    href: "#how-it-works",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          {...iconProps}
        />
      </svg>
    ),
  },
  {
    id: "faq",
    label: "سوالات",
    href: "#faq",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
          {...iconProps}
        />
      </svg>
    ),
  },
];

const expandedExtraLinks = [
  {
    label: "مراحل",
    href: "#how-it-works",
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  },
  {
    label: "کاربردها",
    href: "#use-cases",
    icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  },
];

/* ── Active section observer ── */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.3, 0.6] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/* ── Tab button (collapsed row) ── */
function TabButton({
  item,
  isActive,
  onClick,
}: {
  item: IslandItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      style={{ WebkitTapHighlightColor: "transparent" }}
      className={cn(
        "relative flex min-w-[52px] flex-col items-center gap-0.5 rounded-2xl px-1.5 py-1.5",
        "touch-manipulation select-none transition-[color,transform] duration-200",
        "active:scale-90 motion-reduce:active:scale-100",
        isActive ? "text-sky-300" : "text-slate-500",
      )}
    >
      {item.icon}
      <span className="text-[10px] font-medium leading-none">{item.label}</span>
      {/* Active dot — always mounted, scales in/out */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -bottom-0.5 h-1 w-1 rounded-full bg-sky-400",
          "transition-transform duration-300",
          isActive ? "scale-100" : "scale-0",
        )}
      />
    </button>
  );
}

/* ── MAIN ── */

export default function DynamicIsland() {
  const [expanded, setExpanded] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const activeSection = useActiveSection(navIslandItems.map((i) => i.id));
  const islandRef = useRef<HTMLDivElement>(null);
  const pathName = usePathname();

  const primaryHref = hasAuthToken ? "/builder" : "/auth";

  useEffect(() => {
    try {
      setHasAuthToken(Boolean(localStorage.getItem("auth_token")));
    } catch {
      setHasAuthToken(false);
    }
  }, []);

  /* Close on outside tap + Escape */
  useEffect(() => {
    if (!expanded) return;
    const onPointer = (e: PointerEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node))
        setExpanded(false);
    };
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setExpanded(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const handleNavClick = useCallback((href: string) => {
    setExpanded(false);
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  if (pathName?.startsWith("/admin")) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: islandCss }} />

      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={() => setExpanded(false)}
        className={cn(
          "fixed inset-0 z-[998] bg-[#020817]/60 backdrop-blur-sm transition-opacity duration-250 lg:hidden",
          expanded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        ref={islandRef}
        dir="rtl"
        className="fixed inset-x-0 bottom-0 z-[999] flex justify-center px-3 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden"
      >
        <div
          className={cn(
            "island-enter w-full max-w-md overflow-hidden border backdrop-blur-xl",
            "transition-[border-radius,background-color,box-shadow] duration-300",
            expanded
              ? "rounded-[26px] border-white/10 bg-[#060e1b]/92 shadow-[0_20px_50px_-16px_rgba(2,8,23,0.9)]"
              : "rounded-[26px] border-white/8 bg-[#060e1b]/85 shadow-[0_12px_32px_-12px_rgba(2,8,23,0.8)]",
          )}
        >
          {/* ══ EXPANDED PANEL — collapses via grid-rows, stays mounted ══ */}
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
              expanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0 overflow-hidden" aria-hidden={!expanded}>
              <div className="px-3 pt-3">
                {/* Header */}
                <div className="flex items-center justify-between px-1 pb-2.5">
                  <span className="text-[13px] font-bold text-white">
                    لندینگ‌ساز هوشمند
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-label="بستن منو"
                    tabIndex={expanded ? 0 : -1}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 text-slate-400 transition-transform duration-150 active:scale-90"
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

                <div className="mb-2.5 h-px bg-white/8" />

                {/* Extra section links */}

                {/* CTAs — deduped: primary respects auth token, secondary = login */}
                <div className="grid grid-cols-2 gap-2 pb-3">
                  <Link
                    href={primaryHref}
                    onClick={() => setExpanded(false)}
                    tabIndex={expanded ? 0 : -1}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-sky-500 to-cyan-400",
                      "text-[12px] font-semibold text-[#04121f]",
                      "touch-manipulation transition-transform duration-150 active:scale-95",
                    )}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                    <span>{hasAuthToken ? "ساخت صفحه" : "شروع رایگان"}</span>
                  </Link>

                  <Link
                    href={hasAuthToken ? "/admin" : "/auth"}
                    onClick={() => setExpanded(false)}
                    tabIndex={expanded ? 0 : -1}
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.03]",
                      "text-[12px] font-medium text-slate-300",
                      "touch-manipulation transition-transform duration-150 active:scale-95 active:bg-white/5",
                    )}
                  >
                    {hasAuthToken ? "ورود به پنل" : "ورود"}
                  </Link>
                </div>

                <div className="h-px bg-white/8" />
              </div>
            </div>
          </div>

          {/* ══ COLLAPSED ROW — always visible ══ */}
          <div className="flex items-center gap-1 px-2 py-1.5">
            <div className="flex flex-1 items-center justify-around">
              {navIslandItems.map((item) => (
                <TabButton
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => handleNavClick(item.href)}
                />
              ))}

              {/* بیشتر — the missing expand trigger */}
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                aria-expanded={expanded}
                aria-label={expanded ? "بستن منوی بیشتر" : "منوی بیشتر"}
                style={{ WebkitTapHighlightColor: "transparent" }}
                className={cn(
                  "relative flex min-w-[52px] flex-col items-center gap-0.5 rounded-2xl px-1.5 py-1.5",
                  "touch-manipulation select-none transition-[color,transform] duration-200",
                  "active:scale-90 motion-reduce:active:scale-100",
                  expanded ? "text-sky-300" : "text-slate-500",
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    expanded && "rotate-180",
                  )}
                >
                  <path d="M4.5 15.75l7.5-7.5 7.5 7.5" {...iconProps} />
                </svg>
                <span className="text-[10px] font-medium leading-none">
                  بیشتر
                </span>
              </button>
            </div>

            <div className="h-6 w-px shrink-0 bg-white/8" />

            <Link
              href={primaryHref}
              style={{ WebkitTapHighlightColor: "transparent" }}
              className={cn(
                "flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-l from-sky-500 to-cyan-400 px-4",
                "text-[12px] font-semibold text-[#04121f]",
                "shadow-[0_6px_16px_-6px_rgba(56,189,248,0.55)]",
                "touch-manipulation transition-transform duration-150 active:scale-95",
              )}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              <span>ساخت</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
