"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaDownload,
  FaMobileScreenButton,
  FaShareNodes,
  FaXmark,
} from "react-icons/fa6";

type BeforeInstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
};

type InstallMode = "native" | "ios" | "android";

type LandingInstallPromptProps = {
  pageId: string;
  pageTitle: string;
  pageUrl: string;
  iconSrc: string;
  backgroundColor?: string;
  accentColor?: string;
  secondaryColor?: string;
};

const PROMPT_DELAY_MS = 2400;

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIosDevice() {
  const ua = navigator.userAgent.toLowerCase();
  const modernIpad =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return /iphone|ipad|ipod/.test(ua) || modernIpad;
}

function isAndroidDevice() {
  return /android/i.test(navigator.userAgent);
}

function isLikelyMobile() {
  return (
    /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

function isSafeCssColor(value: unknown) {
  return (
    typeof value === "string" &&
    (/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(
      value.trim(),
    ) ||
      /^rgba?\(/i.test(value.trim()))
  );
}

function colorOr(value: unknown, fallback: string) {
  return isSafeCssColor(value) ? String(value).trim() : fallback;
}

export default function LandingInstallPrompt({
  pageTitle,
  iconSrc,
  backgroundColor,
  accentColor,
  secondaryColor,
}: LandingInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<InstallMode | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isStandalone] = useState(
    () => typeof window !== "undefined" && isStandaloneDisplay(),
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setMode("native");
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (isStandalone) return;

    const ios = isIosDevice();
    const android = isAndroidDevice();
    const mobile = isLikelyMobile();

    if (!deferredPrompt && !mobile) return;

    const timer = window.setTimeout(() => {
      setMode(deferredPrompt ? "native" : ios ? "ios" : android ? "android" : "ios");
      setVisible(true);
    }, PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [deferredPrompt, isStandalone]);

  function dismiss() {
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt || installing) return;

    try {
      setInstalling(true);
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;

      setVisible(false);
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  }

  if (!visible || !mode || isStandalone) return null;

  const safeTitle = pageTitle.trim() || "این لندینگ";
  const nativeMode = mode === "native";
  const iosMode = mode === "ios";
  const base = colorOr(backgroundColor, "#0f172a");
  const accent = colorOr(accentColor, "#38bdf8");
  const secondary = colorOr(secondaryColor, "#f472b6");
  const cardStyle = {
    backgroundColor: base,
    background:
      `radial-gradient(circle at 18% 12%, color-mix(in srgb, ${accent} 34%, transparent), transparent 38%), ` +
      `radial-gradient(circle at 88% 8%, color-mix(in srgb, ${secondary} 26%, transparent), transparent 34%), ` +
      `linear-gradient(145deg, color-mix(in srgb, ${base} 86%, #020617), color-mix(in srgb, ${accent} 20%, #020617 80%))`,
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[250] bg-slate-950/22 backdrop-blur-[2.5px]"
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-0 top-3 z-[260] flex justify-center px-3 pt-[max(env(safe-area-inset-top),0px)] sm:top-5 sm:px-5"
        dir="rtl"
      >
        <section
          className="relative w-full max-w-sm overflow-hidden rounded-xl border border-white/20 text-white shadow-xl shadow-black/25 backdrop-blur-xl"
          style={cardStyle}
          role="dialog"
          aria-modal="true"
          aria-labelledby="landing-install-title"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.20),transparent_42%)]" />
          <div className="relative flex items-start gap-2.5 p-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt=""
                width={44}
                height={44}
                unoptimized
                className="h-full w-full object-contain p-1"
                draggable={false}
              />
            ) : (
              <FaMobileScreenButton className="h-5 w-5 text-slate-700" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id="landing-install-title"
                  className="text-sm font-black leading-5"
                >
                  {nativeMode
                    ? `نصب ${safeTitle}`
                    : "افزودن به صفحه اصلی"}
                </p>
                {!nativeMode && (
                  <p className="mt-1 text-[11px] leading-5 text-white/72">
                    {iosMode
                      ? "در Safari روی Share بزن و Add to Home Screen را انتخاب کن."
                      : "در Chrome از منوی مرورگر، Add to Home screen را بزن."}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={dismiss}
                autoFocus
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/65 transition hover:bg-white/10 hover:text-white"
                aria-label="بستن پیشنهاد نصب"
              >
                <FaXmark className="h-3.5 w-3.5" />
              </button>
            </div>

            {nativeMode ? (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => void install()}
                  disabled={installing}
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-black text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {installing ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <FaDownload className="h-4 w-4" />
                  )}
                  {installing ? "در حال نصب..." : "نصب"}
                </button>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-white/82">
                {iosMode ? (
                  <FaShareNodes className="h-3 w-3 shrink-0" />
                ) : (
                  <FaDownload className="h-3 w-3 shrink-0" />
                )}
                {iosMode ? "Safari Share" : "Chrome Menu"}
              </div>
            )}
          </div>
        </div>
        </section>
      </div>
    </>
  );
}
