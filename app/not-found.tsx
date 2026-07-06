"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  shadows,
  typography,
  animation,
  components,
  accentTokens,
} from "@/lib/design/design-system";

/* ══════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════ */

const notFoundKeyframes = `
@keyframes nf-float{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-12px) rotate(1deg)}50%{transform:translateY(-6px) rotate(-1deg)}75%{transform:translateY(-16px) rotate(0.5deg)}}
@keyframes nf-orbit{0%{transform:rotate(0deg) translateX(140px) rotate(0deg)}100%{transform:rotate(360deg) translateX(140px) rotate(-360deg)}}
@keyframes nf-orbit-sm{0%{transform:rotate(0deg) translateX(100px) rotate(0deg)}100%{transform:rotate(-360deg) translateX(100px) rotate(360deg)}}
@keyframes nf-pulse-ring{0%{transform:scale(1);opacity:.3}100%{transform:scale(2.2);opacity:0}}
@keyframes nf-glitch{0%,100%{transform:translate(0)}20%{transform:translate(-2px,2px)}40%{transform:translate(2px,-1px)}60%{transform:translate(-1px,-2px)}80%{transform:translate(1px,1px)}}
@keyframes nf-fade-in{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}
@keyframes nf-blink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes nf-scan{0%{top:-10%}100%{top:110%}}
@keyframes nf-digit-roll{0%{transform:translateY(-100%);opacity:0}50%{transform:translateY(0);opacity:1}100%{transform:translateY(0);opacity:1}}
@keyframes nf-particle{0%{transform:translate(0,0) scale(1);opacity:.6}100%{transform:translate(var(--px),var(--py)) scale(0);opacity:0}}
.nf-float{animation:nf-float 6s ease-in-out infinite}
.nf-orbit{animation:nf-orbit 20s linear infinite}
.nf-orbit-sm{animation:nf-orbit-sm 15s linear infinite}
.nf-pulse-ring{animation:nf-pulse-ring 3s ease-out infinite}
.nf-glitch{animation:nf-glitch .3s ease-in-out}
.nf-fade-in{animation:nf-fade-in .7s cubic-bezier(.22,1,.36,1) both}
.nf-fade-d1{animation-delay:.1s}
.nf-fade-d2{animation-delay:.2s}
.nf-fade-d3{animation-delay:.3s}
.nf-fade-d4{animation-delay:.4s}
.nf-fade-d5{animation-delay:.5s}
.nf-fade-d6{animation-delay:.6s}
.nf-blink{animation:nf-blink 1.5s ease-in-out infinite}
.nf-scan{animation:nf-scan 3s linear infinite}
.nf-digit-roll{animation:nf-digit-roll .6s cubic-bezier(.22,1,.36,1) both}
.nf-digit-d1{animation-delay:.15s}
.nf-digit-d2{animation-delay:.3s}
.nf-digit-d3{animation-delay:.45s}
`;

/* ══════════════════════════════════════════════
   PARTICLES
   ══════════════════════════════════════════════ */

function Particles() {
  const [particles, setParticles] = useState<
    {
      id: number;
      size: number;
      x: number;
      y: number;
      px: number;
      py: number;
      delay: number;
      duration: number;
      color: string;
    }[]
  >([]);

  useEffect(() => {
    const generatedParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      px: (Math.random() - 0.5) * 200,
      py: (Math.random() - 0.5) * 200,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 3,
      color: ["bg-sky-400", "bg-cyan-400", "bg-blue-400", "bg-violet-400"][
        Math.floor(Math.random() * 4)
      ],
    }));

    setParticles(generatedParticles);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={cn("absolute rounded-full", p.color, "opacity-40")}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            ["--px" as string]: `${p.px}px`,
            ["--py" as string]: `${p.py}px`,
            animation: `nf-particle ${p.duration}s ease-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   BROKEN LINK VISUAL
   ══════════════════════════════════════════════ */

function BrokenLinkVisual() {
  return (
    <div className="relative nf-float">
      {/* Pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-44 w-44 rounded-full border border-sky-400/10 nf-pulse-ring sm:h-56 sm:w-56" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-36 w-36 rounded-full border border-cyan-400/10 nf-pulse-ring sm:h-44 sm:w-44"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="h-28 w-28 rounded-full border border-blue-400/10 nf-pulse-ring sm:h-36 sm:w-36"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Center orb */}
      <div
        className={cn(
          "relative z-10 flex h-28 w-28 items-center justify-center rounded-full sm:h-36 sm:w-36",
          borders.strong,
          "bg-linear-to-br  from-[#0c1e3d] via-[#15294d] to-[#0a3a5c]",
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
          <div className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-sky-400/40 to-transparent nf-scan" />
        </div>

        {/* Broken link icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative z-10 h-12 w-12 text-sky-300/80 sm:h-14 sm:w-14"
        >
          <path
            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.81 15.312a4.5 4.5 0 0 1-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 3"
            className="opacity-40"
          />
          {/* Break indicator */}
          <line
            x1="9"
            y1="9"
            x2="15"
            y2="15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-30"
          />
        </svg>
      </div>

      {/* Orbiting elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="nf-orbit">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              borders.light,
              accentTokens.sky.bg,
            )}
          >
            <span className="text-[10px] font-bold text-sky-300">۴</span>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="nf-orbit-sm">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              borders.light,
              accentTokens.cyan.bg,
            )}
          >
            <span className="text-[10px] font-bold text-cyan-300">؟</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   404 DIGIT DISPLAY
   ══════════════════════════════════════════════ */

function DigitDisplay() {
  return (
    <div dir="ltr" className="flex items-center justify-center gap-3 sm:gap-4">
      {["4", "0", "4"].map((digit, i) => (
        <div
          key={i}
          className={cn(
            `nf-digit-roll nf-digit-d${i + 1}`,
            "flex h-20 w-16 items-center justify-center overflow-hidden rounded-2xl border sm:h-28 sm:w-24",
            borders.light,
            "bg-linear-to-b from-white/5 to-white/2",
            "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
          )}
        >
          <span
            className={cn(
              "text-5xl font-black tabular-nums sm:text-7xl",
              digit === "0"
                ? "bg-linear-to-b from-sky-300 to-blue-400 bg-clip-text text-transparent"
                : "bg-linear-to-b from-white to-slate-300 bg-clip-text text-transparent",
            )}
          >
            {digit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SUGGESTED LINKS
   ══════════════════════════════════════════════ */

const suggestedLinks = [
  {
    label: "صفحه اصلی",
    href: "/",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "sky" as const,
  },
  {
    label: "امکانات",
    href: "/#features",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
      </svg>
    ),
    color: "cyan" as const,
  },
  {
    label: "سوالات متداول",
    href: "/#faq",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "emerald" as const,
  },
  {
    label: "تماس با ما",
    href: "/#contact",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M3.505 2.365A41.369 41.369 0 0 1 9 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.249 2.205 2.504a1.535 1.535 0 0 1-1.07 1.509 33.964 33.964 0 0 1-5.63.744c-.124-.005-.25.07-.323.182a40.7 40.7 0 0 1-1.676 2.47A41.382 41.382 0 0 1 3.505 2.365Z" />
        <path d="M2.625 15.375a.625.625 0 1 0 0 1.25h.625a.625.625 0 1 0 0-1.25h-.625Z" />
      </svg>
    ),
    color: "violet" as const,
  },
];

/* ══════════════════════════════════════════════
   COUNTDOWN AUTO-REDIRECT
   ══════════════════════════════════════════════ */

function useAutoRedirect(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      window.location.href = "/";
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  return remaining;
}

/* ══════════════════════════════════════════════
   MAIN 404 PAGE
   ══════════════════════════════════════════════ */

export default function NotFoundPage() {
  const countdown = useAutoRedirect(15);
  const [glitch, setGlitch] = useState(false);

  // Periodic glitch effect
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 300);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const persianCountdown = countdown.toLocaleString("fa-IR");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: notFoundKeyframes }} />
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <div
        dir="rtl"
        className={cn(
          "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10",
          backgrounds.page,
        )}
      >
        {/* ── BG Effects ── */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-200 w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[180px]",
              backgrounds.glow.hero,
            )}
          />
          <div
            className={cn(
              "absolute right-0 top-1/4 h-72 w-72 rounded-full blur-3xl",
              backgrounds.glow.skyOrb,
              animation.classes.floatSlow,
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl",
              backgrounds.glow.blueOrb,
              animation.classes.floatMedium,
            )}
          />
          <div className={cn("absolute inset-0", backgrounds.grid.lines)} />
        </div>

        <Particles />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center gap-8 text-center sm:gap-10">
          {/* Visual */}
          <div className="nf-fade-in">
            <BrokenLinkVisual />
          </div>

          {/* 404 Digits */}
          <div className={cn("nf-fade-in nf-fade-d1", glitch && "nf-glitch")}>
            <DigitDisplay />
          </div>

          {/* Text */}
          <div className="nf-fade-in nf-fade-d2 max-w-md">
            <h1 className={cn(typography.h2, "text-2xl sm:text-3xl")}>
              صفحه‌ای که دنبالش می‌گردی{" "}
              <span className={gradients.textPrimary}>پیدا نشد</span>
            </h1>
            <p className={cn("mt-4", typography.body)}>
              ممکنه آدرس اشتباه باشه، صفحه حذف شده باشه، یا هنوز ساخته نشده
              باشه. نگران نباش، می‌تونی از لینک‌های زیر به مسیر درست برگردی.
            </p>
          </div>

          {/* Primary CTA */}
          <div className="nf-fade-in nf-fade-d3">
            <Link
              href="/"
              className={cn(components.ctaPrimary, "px-8 py-4 text-base")}
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
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="relative z-10 h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="relative z-10">بازگشت به صفحه اصلی</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
