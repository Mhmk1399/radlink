"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
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

type InstallMode = "native" | "ios";

type LandingInstallPromptProps = {
  pageId: string;
  pageTitle: string;
  pageUrl: string;
  iconSrc: string;
  backgroundColor?: string;
  accentColor?: string;
  secondaryColor?: string;
};

const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
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

function isLikelyMobile() {
  return (
    /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

function getStorageKeys(pageId: string, pageUrl: string) {
  const key = pageId || pageUrl || "landing";
  return {
    dismissed: `radlink:pwa-install:dismissed:${key}`,
    installed: `radlink:pwa-install:installed:${key}`,
  };
}

function hasRecentDismissal(key: string) {
  try {
    const value = Number(localStorage.getItem(key) ?? 0);
    return value > 0 && Date.now() - value < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function hasInstalled(key: string) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function saveTimestamp(key: string) {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // Ignore blocked storage; the prompt still works for the current visit.
  }
}

function markInstalled(key: string) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // Ignore blocked storage.
  }
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
  pageId,
  pageTitle,
  pageUrl,
  iconSrc,
  backgroundColor,
  accentColor,
  secondaryColor,
}: LandingInstallPromptProps) {
  const storageKeys = useMemo(
    () => getStorageKeys(pageId, pageUrl),
    [pageId, pageUrl],
  );
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<InstallMode | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setMode("native");
    };

    const handleAppInstalled = () => {
      markInstalled(storageKeys.installed);
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
  }, [storageKeys.installed]);

  useEffect(() => {
    if (isStandalone) return;
    if (hasInstalled(storageKeys.installed)) return;
    if (hasRecentDismissal(storageKeys.dismissed)) return;

    const ios = isIosDevice();
    const mobile = isLikelyMobile();

    if (!deferredPrompt && !(ios && mobile)) return;

    const timer = window.setTimeout(() => {
      setMode(deferredPrompt ? "native" : "ios");
      setVisible(true);
    }, PROMPT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [deferredPrompt, isStandalone, storageKeys.dismissed, storageKeys.installed]);

  function dismiss() {
    saveTimestamp(storageKeys.dismissed);
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt || installing) return;

    try {
      setInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        markInstalled(storageKeys.installed);
      } else {
        saveTimestamp(storageKeys.dismissed);
      }

      setVisible(false);
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  }

  if (!visible || !mode || isStandalone) return null;

  const safeTitle = pageTitle.trim() || "این لندینگ";
  const nativeMode = mode === "native";
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
        onClick={dismiss}
      />
      <div
        className="fixed inset-x-0 top-3 z-[260] flex justify-center px-3 pt-[max(env(safe-area-inset-top),0px)] sm:top-5 sm:px-5"
        dir="rtl"
        role="region"
        aria-label="افزودن لندینگ به صفحه اصلی"
      >
        <section
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/22 text-white shadow-2xl shadow-black/30 backdrop-blur-xl sm:max-w-lg"
          style={cardStyle}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.20),transparent_42%)]" />
          <div className="relative flex items-start gap-3 p-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white">
            {iconSrc ? (
              <img
                src={iconSrc}
                alt=""
                className="h-full w-full object-contain p-1.5"
                draggable={false}
              />
            ) : (
              <FaMobileScreenButton className="h-6 w-6 text-slate-700" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black leading-6">
                  {nativeMode
                    ? `${safeTitle} را نصب کن`
                    : `${safeTitle} را به صفحه اصلی اضافه کن`}
                </p>
                <p className="mt-1 text-xs leading-6 text-white/68">
                  دسترسی سریع‌تر، بدون نیاز به جستجو یا وارد کردن آدرس.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="بستن پیشنهاد نصب"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </div>

            {nativeMode ? (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void install()}
                  disabled={installing}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {installing ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <FaDownload className="h-4 w-4" />
                  )}
                  {installing ? "در حال آماده‌سازی..." : "نصب سریع"}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="h-10 rounded-xl border border-white/15 px-3 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  بعداً
                </button>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-white/12 bg-white/[0.06] p-3">
                <div className="flex items-start gap-2 text-xs leading-6 text-white/80">
                  <FaShareNodes className="mt-1 h-3.5 w-3.5 shrink-0 text-white" />
                  <span>
                    در Safari دکمه Share را بزن، سپس گزینه Add to Home Screen را
                    انتخاب کن.
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-200">
                  <FaCheck className="h-3.5 w-3.5" />
                  آیکون صفحه اصلی مطابق تنظیمات همین لندینگ نمایش داده می‌شود.
                </div>
              </div>
            )}
          </div>
        </div>
        </section>
      </div>
    </>
  );
}
