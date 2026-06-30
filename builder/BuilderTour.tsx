"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { HiOutlineSparkles, HiOutlineXMark } from "react-icons/hi2";

type Placement = "top" | "bottom" | "left" | "right";

type BuilderTourProps = {
  hasBlocks: boolean;
  hasInspector?: boolean;
  sidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  forceRun?: boolean;
  onForceRunHandled?: () => void;
};

type TourStep = {
  target: string;
  title: string;
  content: React.ReactNode;
  icon?: string;
  placement?: Placement;
};

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const TOUR_KEY = "builder-tour-done-v5";
const VIEWPORT_GAP = 8;
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_GAP = 16;
const TOOLTIP_MAX_WIDTH = 380;
const TOOLTIP_FALLBACK_HEIGHT = 240;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTargetElement(selector: string): HTMLElement | null {
  return document.querySelector(selector) as HTMLElement | null;
}

function isSidebarTarget(selector: string) {
  return selector.includes("tour-sidebar");
}

function buildSpotlightRect(rect: DOMRect): SpotlightRect {
  return {
    top: Math.max(VIEWPORT_GAP, rect.top - SPOTLIGHT_PADDING),
    left: Math.max(VIEWPORT_GAP, rect.left - SPOTLIGHT_PADDING),
    width: Math.max(0, rect.width + SPOTLIGHT_PADDING * 2),
    height: Math.max(0, rect.height + SPOTLIGHT_PADDING * 2),
  };
}

function getTooltipPosition({
  rect,
  tooltipWidth,
  tooltipHeight,
  preferredPlacement,
}: {
  rect: SpotlightRect;
  tooltipWidth: number;
  tooltipHeight: number;
  preferredPlacement: Placement;
}) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const placementCandidates: Placement[] = [
    preferredPlacement,
    "bottom",
    "top",
    "left",
    "right",
  ];

  const placements = placementCandidates.filter(
    (p, i, arr): p is Placement => arr.indexOf(p) === i,
  );

  const calc = (placement: Placement) => {
    switch (placement) {
      case "top":
        return {
          top: rect.top - tooltipHeight - TOOLTIP_GAP,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
      case "bottom":
        return {
          top: rect.top + rect.height + TOOLTIP_GAP,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
      case "left":
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - TOOLTIP_GAP,
        };
      case "right":
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left + rect.width + TOOLTIP_GAP,
        };
    }
  };

  const fits = (pos: { top: number; left: number }) =>
    pos.top >= VIEWPORT_GAP &&
    pos.left >= VIEWPORT_GAP &&
    pos.top + tooltipHeight <= vh - VIEWPORT_GAP &&
    pos.left + tooltipWidth <= vw - VIEWPORT_GAP;

  for (const placement of placements) {
    const pos = calc(placement);
    if (fits(pos)) {
      return { ...pos, placement };
    }
  }

  const fallback = calc(preferredPlacement);

  return {
    top: clamp(fallback.top, VIEWPORT_GAP, vh - tooltipHeight - VIEWPORT_GAP),
    left: clamp(fallback.left, VIEWPORT_GAP, vw - tooltipWidth - VIEWPORT_GAP),
    placement: preferredPlacement,
  };
}

export function BuilderTour({
  hasBlocks,
  hasInspector = false,
  sidebarCollapsed,
  onExpandSidebar,
  forceRun = false,
  onForceRunHandled,
}: BuilderTourProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(
    null,
  );
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });
  const [tourInitialized, setTourInitialized] = useState(false);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRafRef = useRef<number | null>(null);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const clearRefreshRaf = useCallback(() => {
    if (refreshRafRef.current) {
      cancelAnimationFrame(refreshRafRef.current);
      refreshRafRef.current = null;
    }
  }, []);

  const steps = useMemo<TourStep[]>(() => {
    const baseSteps: TourStep[] = [
      {
        target: "[data-tour='tour-header']",
        placement: "bottom",
        title: "این نوار، مرکز کنترل توئه",
        content:
          "از اینجا می‌تونی پیش‌نمایش بگیری، صفحه رو ذخیره کنی و به ابزارهای اصلی دسترسی داشته باشی.",
        icon: "🧭",
      },
      {
        target: "[data-tour='tour-save-indicator']",
        placement: "bottom",
        title: "وضعیت ذخیره‌سازی",
        content:
          "هر تغییری روی بلاک‌ها انجام بدی، اول محلی ذخیره می‌شه و اینجا وضعیتش رو می‌بینی.",
        icon: "💾",
      },
      {
        target: "[data-tour='tour-back-admin-btn']",
        placement: "bottom",
        title: "بازگشت به ادمین",
        content:
          "با این دکمه می‌تونی از صفحه‌ساز خارج بشی و به پنل ادمین برگردی. اگر تغییری ذخیره نشده باشه، قبل از خروج بهت هشدار داده می‌شه.",
        icon: "↪️",
      },
      {
        target: "[data-tour='tour-preview-btn']",
        placement: "bottom",
        title: "پیش‌نمایش زنده",
        content:
          "قبل از انتشار صفحه، از این دکمه برای دیدن نتیجه نهایی استفاده کن.",
        icon: "👀",
      },
      {
        target: "[data-tour='tour-save-page-btn']",
        placement: "bottom",
        title: "ساخت یا ذخیره صفحه",
        content:
          "از اینجا اطلاعات صفحه مثل عنوان و آدرس رو ثبت می‌کنی و خروجی نهایی رو ذخیره می‌کنی.",
        icon: "✅",
      },
      {
        target: "[data-tour='tour-canvas']",
        placement: isDesktop ? "top" : "bottom",
        title: "بوم اصلی صفحه",
        content:
          "همه بلاک‌هایی که اضافه می‌کنی اینجا نمایش داده می‌شن. می‌تونی انتخاب، ویرایش و جابه‌جاشون کنی.",
        icon: "🧱",
      },
    ];

    const desktopSteps: TourStep[] = [
      {
        target: "[data-tour='tour-history-actions']",
        placement: "bottom",
        title: "برگشت و انجام دوباره",
        content:
          "اگر اشتباهی کردی، با این دکمه‌ها یا Ctrl+Z / Ctrl+Y خیلی سریع به عقب و جلو برو.",
        icon: "↩️",
      },
      {
        target: "[data-tour='tour-clear-btn']",
        placement: "bottom",
        title: "حذف همه بلاک‌ها",
        content:
          "اگر خواستی صفحه رو از اول بسازی، از این دکمه می‌تونی همه بلاک‌ها رو یکجا پاک کنی.",
        icon: "🗑️",
      },
      {
        target: "[data-tour='tour-sidebar']",
        placement: "left",
        title: "سایدبار بلاک‌ها",
        content:
          "در دسکتاپ این سایدبار همیشه کنار صفحه می‌مونه تا سریع به بلاک‌ها و ساختار صفحه دسترسی داشته باشی.",
        icon: "📚",
      },
      {
        target: "[data-tour='tour-sidebar-tabs']",
        placement: "left",
        title: "تب بلاک‌ها و لایه‌ها",
        content:
          "در تب «بلاک‌ها» آیتم‌های آماده رو می‌بینی و در تب «صفحه» ترتیب بلاک‌های فعلی رو مدیریت می‌کنی.",
        icon: "🗂️",
      },
      {
        target: "[data-tour='tour-sidebar-search']",
        placement: "left",
        title: "جستجوی سریع بلاک",
        content: "اگر بلاک خاصی لازم داشتی، از این قسمت خیلی سریع پیداش کن.",
        icon: "🔎",
      },
      {
        target: "[data-tour='tour-palette-first-item']",
        placement: "left",
        title: "اضافه کردن بلاک با درگ",
        content:
          "این بلاک‌ها رو بگیر و داخل صفحه رها کن. این سریع‌ترین راه اضافه کردن بلاکه.",
        icon: "✨",
      },
    ];

    const mobileSteps: TourStep[] = [
      {
        target: "[data-tour='tour-mobile-add-btn']",
        placement: "bottom",
        title: "افزودن بلاک در موبایل",
        content:
          "چون سایدبار در موبایل مخفیه، از این دکمه برای باز کردن لیست بلاک‌ها استفاده کن.",
        icon: "➕",
      },
      {
        target: "[data-tour='tour-clear-btn']",
        placement: "bottom",
        title: "پاک کردن صفحه",
        content: "اگر خواستی همه بلاک‌ها رو حذف کنی، از این دکمه استفاده کن.",
        icon: "🧹",
      },
    ];

    const endSteps: TourStep[] = [];

    if (hasBlocks) {
      endSteps.push({
        target: "[data-tour='tour-canvas-first-block']",
        placement: isDesktop ? "top" : "bottom",
        title: "ویرایش خود بلاک",
        content:
          "روی هر بلاک کلیک کن تا انتخاب بشه. بعد می‌تونی محتوا، استایل و جایگاهش رو تغییر بدی.",
        icon: "🪄",
      });
    } else {
      endSteps.push({
        target: "[data-tour='tour-empty-add-btn']",
        placement: "top",
        title: "شروع سریع از صفحه خالی",
        content:
          "اگر صفحه خالی بود، از این دکمه خیلی سریع اولین بلاک رو اضافه کن.",
        icon: "🚀",
      });
    }

    if (hasInspector) {
      endSteps.push({
        target: "[data-tour='tour-inspector-panel']",
        placement: isDesktop ? "left" : "top",
        title: "پنل ویرایش",
        content:
          "هر وقت یک بلاک یا المان انتخاب بشه، تنظیمات محتوا و استایلش را از این پنل تغییر می‌دی.",
        icon: "🎨",
      });
    }

    if (hasBlocks) {
      endSteps.push({
        target: "[data-tour='tour-bottom-add-btn']",
        placement: "top",
        title: "افزودن بلاک جدید",
        content:
          "برای اضافه کردن بلاک جدید به انتهای صفحه، از این دکمه هم می‌تونی استفاده کنی.",
        icon: "🧩",
      });
    }

    return isDesktop
      ? [
          baseSteps[0],
          baseSteps[1],
          desktopSteps[0],
          baseSteps[2],
          baseSteps[3],
          baseSteps[4],
          desktopSteps[1],
          desktopSteps[2],
          desktopSteps[3],
          desktopSteps[4],
          desktopSteps[5],
          desktopSteps[6],
          baseSteps[5],
          ...endSteps,
        ]
      : [
          baseSteps[0],
          baseSteps[1],
          baseSteps[2],
          baseSteps[3],
          baseSteps[4],
          mobileSteps[0],
          mobileSteps[1],
          baseSteps[5],
          ...endSteps,
        ];
  }, [hasBlocks, hasInspector, isDesktop]);

  const finishTour = useCallback(
    (markAsDone = true) => {
      clearRetryTimer();
      clearRefreshRaf();
      setIsOpen(false);
      setSpotlightRect(null);
      setTooltipStyle({ opacity: 0 });

      if (markAsDone) {
        try {
          localStorage.setItem(TOUR_KEY, "true");
        } catch {
          /* ignore */
        }
      }
    },
    [clearRefreshRaf, clearRetryTimer],
  );

  // Mount effect
  useEffect(() => {
    setMounted(true);

    const updateViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const measureCurrentStep = useCallback(
    (targetSelector?: string) => {
      const selector = targetSelector ?? steps[stepIndex]?.target;
      if (!selector) return;

      const el = getTargetElement(selector);
      if (!el) return;

      const rect = buildSpotlightRect(el.getBoundingClientRect());
      setSpotlightRect(rect);

      const tooltipWidth = Math.min(
        TOOLTIP_MAX_WIDTH,
        window.innerWidth < 420
          ? window.innerWidth - VIEWPORT_GAP * 2
          : Math.max(300, window.innerWidth - VIEWPORT_GAP * 2),
      );
      const tooltipHeight =
        tooltipRef.current?.offsetHeight ?? TOOLTIP_FALLBACK_HEIGHT;

      const pos = getTooltipPosition({
        rect,
        tooltipWidth,
        tooltipHeight,
        preferredPlacement: steps[stepIndex]?.placement ?? "bottom",
      });

      setTooltipStyle({
        top: pos.top,
        left: pos.left,
        width: tooltipWidth,
        opacity: 1,
      });
    },
    [stepIndex, steps],
  );

  const goToStep = useCallback(
    (nextIndex: number, direction: 1 | -1 = 1, retries = 12) => {
      clearRetryTimer();

      if (nextIndex < 0) {
        setStepIndex(0);
        return;
      }

      if (nextIndex >= steps.length) {
        finishTour(true);
        return;
      }

      const step = steps[nextIndex];

      if (isDesktop && sidebarCollapsed && isSidebarTarget(step.target)) {
        onExpandSidebar();
        retryTimerRef.current = setTimeout(() => {
          goToStep(nextIndex, direction, retries);
        }, 450);
        return;
      }

      const targetEl = getTargetElement(step.target);

      if (!targetEl) {
        if (retries > 0) {
          retryTimerRef.current = setTimeout(() => {
            goToStep(nextIndex, direction, retries - 1);
          }, 180);
          return;
        }

        goToStep(nextIndex + direction, direction, 12);
        return;
      }

      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      setStepIndex(nextIndex);

      const initialRect = buildSpotlightRect(targetEl.getBoundingClientRect());
      setSpotlightRect(initialRect);
      setTooltipStyle((prev) => ({ ...prev, opacity: 0 }));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureCurrentStep(step.target);
        });
      });
    },
    [
      clearRetryTimer,
      finishTour,
      isDesktop,
      measureCurrentStep,
      onExpandSidebar,
      sidebarCollapsed,
      steps,
    ],
  );

  // تابع شروع تور
  const startTour = useCallback(() => {
    if (steps.length === 0) return;

    setStepIndex(0);
    setIsOpen(true);
    setTourInitialized(true);

    // تاخیر بیشتر برای اطمینان از render شدن DOM
    setTimeout(() => {
      goToStep(0, 1, 20);
    }, 100);
  }, [goToStep, steps.length]);

  // Effect اصلی برای شروع خودکار تور
  useEffect(() => {
    if (!mounted || tourInitialized) return;

    // چک کردن localStorage
    let done = false;
    try {
      done = localStorage.getItem(TOUR_KEY) === "true";
    } catch {
      done = false;
    }

    if (done) {
      setTourInitialized(true);
      return;
    }

    // صبر برای اطمینان از آماده شدن DOM
    const timer = setTimeout(() => {
      // دوباره چک کن که المان اول وجود داره
      const firstTarget = steps[0]?.target;
      if (firstTarget) {
        const checkElement = () => {
          const el = getTargetElement(firstTarget);
          if (el) {
            startTour();
          } else {
            // اگر المان هنوز نیست، دوباره تلاش کن
            setTimeout(checkElement, 200);
          }
        };
        checkElement();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [mounted, tourInitialized, steps, startTour]);

  // Force run effect
  useEffect(() => {
    if (!forceRun || !mounted) return;

    // ریست کردن state ها
    setTourInitialized(false);

    const timer = setTimeout(() => {
      startTour();
      onForceRunHandled?.();
    }, 300);

    return () => clearTimeout(timer);
  }, [forceRun, mounted, startTour, onForceRunHandled]);

  // اندازه‌گیری مجدد بعد از تغییر step
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      measureCurrentStep();
    }, 80);

    return () => clearTimeout(timer);
  }, [isOpen, measureCurrentStep, stepIndex]);

  // Resize و Scroll handlers
  useEffect(() => {
    if (!isOpen) return;

    const handleRefresh = () => {
      clearRefreshRaf();
      refreshRafRef.current = requestAnimationFrame(() => {
        measureCurrentStep();
      });
    };

    window.addEventListener("resize", handleRefresh, { passive: true });
    window.addEventListener("scroll", handleRefresh, true);

    return () => {
      window.removeEventListener("resize", handleRefresh);
      window.removeEventListener("scroll", handleRefresh, true);
    };
  }, [clearRefreshRaf, isOpen, measureCurrentStep]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearRetryTimer();
      clearRefreshRaf();
    };
  }, [clearRefreshRaf, clearRetryTimer]);

  // اگر آماده نیست، چیزی نشون نده
  if (!mounted || !isOpen || !steps[stepIndex]) {
    return null;
  }

  // اگر spotlightRect هنوز آماده نیست، یک loading ساده نشون بده یا null
  if (!spotlightRect) {
    return null;
  }

  const currentStep = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const topOverlayHeight = Math.max(0, spotlightRect.top);
  const bottomOverlayTop = spotlightRect.top + spotlightRect.height;
  const bottomOverlayHeight = Math.max(
    0,
    window.innerHeight - bottomOverlayTop,
  );

  const leftOverlayWidth = Math.max(0, spotlightRect.left);
  const rightOverlayLeft = spotlightRect.left + spotlightRect.width;
  const rightOverlayWidth = Math.max(0, window.innerWidth - rightOverlayLeft);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[10000]">
      {/* overlays */}
      <div
        className="pointer-events-auto fixed left-0 right-0 top-0 bg-slate-950/55 backdrop-blur-[2px] transition-all duration-200"
        style={{ height: topOverlayHeight }}
      />
      <div
        className="pointer-events-auto fixed left-0 right-0 bg-slate-950/55 backdrop-blur-[2px] transition-all duration-200"
        style={{
          top: bottomOverlayTop,
          height: bottomOverlayHeight,
        }}
      />
      <div
        className="pointer-events-auto fixed bg-slate-950/55 backdrop-blur-[2px] transition-all duration-200"
        style={{
          top: spotlightRect.top,
          left: 0,
          width: leftOverlayWidth,
          height: spotlightRect.height,
        }}
      />
      <div
        className="pointer-events-auto fixed bg-slate-950/55 backdrop-blur-[2px] transition-all duration-200"
        style={{
          top: spotlightRect.top,
          left: rightOverlayLeft,
          width: rightOverlayWidth,
          height: spotlightRect.height,
        }}
      />

      {/* tooltip */}
      <div
        ref={tooltipRef}
        dir="rtl"
        className="pointer-events-auto fixed z-[10001] overflow-hidden rounded-[24px] border border-neutral-200/80 bg-white shadow-[0_24px_80px_-20px_rgba(0,0,0,0.28)] transition-all duration-300"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 bg-gradient-to-l from-emerald-50 via-white to-white px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-lg shadow-neutral-900/15">
              {currentStep.icon ?? <HiOutlineSparkles size={18} />}
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-600">
                راهنمای سریع صفحه‌ساز
              </div>
              <h3 className="mt-0.5 text-[14px] font-black text-neutral-900 sm:text-[15px]">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => finishTour(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-600"
            aria-label="بستن"
          >
            <HiOutlineXMark size={16} />
          </button>
        </div>

        <div className="px-5 py-4 text-[13px] leading-7 text-neutral-600">
          {currentStep.content}
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-100 bg-neutral-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => finishTour(true)}
            className="self-start text-[12px] font-semibold text-neutral-400 transition hover:text-neutral-700 sm:self-auto"
          >
            رد کردن
          </button>
          <div className="order-3 flex items-center gap-1.5 sm:order-none">
            {steps.map((_, i) => (
              <span
                key={i}
                className={[
                  "h-1.5 rounded-full transition-all",
                  i === stepIndex
                    ? "w-5 bg-neutral-900"
                    : "w-1.5 bg-neutral-300",
                ].join(" ")}
              />
            ))}
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            {!isFirstStep && (
              <button
                type="button"
                onClick={() => goToStep(stepIndex - 1, -1, 12)}
                className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[12px] font-bold text-neutral-600 transition hover:bg-neutral-100"
              >
                قبلی
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isLastStep) {
                  finishTour(true);
                  return;
                }
                goToStep(stepIndex + 1, 1, 12);
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-neutral-800"
            >
              {isLastStep ? "بزن بریم" : "بعدی"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
