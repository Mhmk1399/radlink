// DynamicIslandPanel.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  HiOutlinePencil,
  HiOutlinePaintBrush,
  HiOutlineCog6Tooth,
  HiOutlineDocumentDuplicate,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineChevronDown,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineChevronUp,
  HiOutlineEyeDropper,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineLockClosed,
} from "react-icons/hi2";

import { RxBorderWidth, RxCornerBottomRight, RxFontSize } from "react-icons/rx";

import type {
  PageBlock,
  BlockSchema,
  BlockElement,
  EditableStyleKey,
  EditableStyleMap,
  ResponsiveValue,
  AnimationType,
  ShadowStyleValue,
} from "@/types/blocks/builder.types";
import { DynamicContentForm } from "./form/DynamicContentForm";
import { DynamicStyleForm } from "./form/DynamicStyleForm";
import { ANIMATION_OPTIONS, previewAnimation } from "./animationOptions";
import {
  formatCssColor,
  formatHexColor,
  isLightCssColor,
  isValidCssColorValue,
  parseCssColor,
} from "@/lib/design/color";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type Breakpoint = "mobile" | "tablet" | "desktop";
type PanelTab = "content" | "style" | "actions";
type DropdownId = "content" | "style" | "animation" | "actions" | null;

type DynamicIslandPanelProps = {
  block: PageBlock | null;
  schema: BlockSchema | null;
  selectedElementId: string | null;
  breakpoint: Breakpoint;
  isScrolled?: boolean;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  onUpdateContent: (key: string, value: unknown) => void;
  onUpdateStyle: (
    elementId: string,
    styleKey: EditableStyleKey,
    value: string | number | AnimationType | ShadowStyleValue,
  ) => void;
  onClose: () => void;
  onDeleteBlock: () => void;
  onDuplicateBlock: () => void;
  readOnly?: boolean;
};

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const STYLE_LABELS: Partial<Record<EditableStyleKey, string>> = {
  textAlign: "چینش متن",
  contentAlign: "چینش کانتینر",
  color: "رنگ متن",
  backgroundColor: "پس‌زمینه",
  fontSize: "سایز فونت",
  height: "ارتفاع",
  marginTop: "فاصله بالا",
  marginBottom: "فاصله پایین",
  paddingTop: "فضای داخلی بالا",
  paddingBottom: "فضای داخلی پایین",
  borderRadius: "گردی",
  borderColor: "رنگ بوردر",
  borderWidth: "ضخامت بوردر",
  gridColumns: "تعداد ستون‌های گرید",
  animation: "انیمیشن",
};
STYLE_LABELS.shadow = "سایه";

const NUMERIC_CONFIG: Record<
  string,
  { min: number; max: number; step: number; unit: string }
> = {
  fontSize: { min: 8, max: 120, step: 1, unit: "px" },
  height: { min: 80, max: 1200, step: 10, unit: "px" },
  marginTop: { min: 0, max: 160, step: 4, unit: "px" },
  marginBottom: { min: 0, max: 160, step: 4, unit: "px" },
  paddingTop: { min: 0, max: 160, step: 4, unit: "px" },
  paddingBottom: { min: 0, max: 160, step: 4, unit: "px" },
  borderRadius: { min: 0, max: 64, step: 1, unit: "px" },
  borderWidth: { min: 0, max: 20, step: 1, unit: "px" },
  gridColumns: { min: 1, max: 4, step: 1, unit: " ستون" },
};

const RECENT_COLORS_KEY = "radlink_recent_colors";
const MAX_RECENT_COLORS = 10;

function getRecentColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_COLORS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => isValidCssColorValue(item))
      : [];
  } catch {
    return [];
  }
}

function addRecentColor(color: string) {
  if (typeof window === "undefined" || !isValidCssColorValue(color)) return;
  try {
    const recent = getRecentColors().filter(
      (c) => c.toLowerCase() !== color.toLowerCase(),
    );
    recent.unshift(color);
    localStorage.setItem(
      RECENT_COLORS_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT_COLORS)),
    );
  } catch {
    /* ignore */
  }
}

const COLOR_PRESETS = [
  "#ffffff",
  "#f8fafc",
  "#e2e8f0",
  "#94a3b8",
  "#475569",
  "#0f172a",
  "#000000",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "rgba(255, 255, 255, 0.4)",
  "rgba(0, 0, 0, 0.4)",
  "transparent",
];

const CUSTOM_SCROLLBAR = [
  "[&::-webkit-scrollbar]:w-[5px]",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:bg-neutral-200",
  "hover:[&::-webkit-scrollbar-thumb]:bg-neutral-300",
].join(" ");

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function getResp<T>(
  val: ResponsiveValue<T> | undefined,
  bp: Breakpoint,
): T | undefined {
  if (!val) return undefined;
  if (bp === "desktop") return val.desktop ?? val.tablet ?? val.mobile;
  if (bp === "tablet") return val.tablet ?? val.mobile;
  return val.mobile;
}

function toColorString(v: string | number | undefined): string {
  return typeof v === "string" && v.trim() ? v : "#000000";
}

function toNum(v: string | number | undefined): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function getParsedColor(value: string) {
  return parseCssColor(value) ?? parseCssColor("#000000")!;
}

function isLightColor(color: string): boolean {
  return isLightCssColor(color);
}

/* ================================================================== */
/*  Micro-feedback hook (replaces toast-on-every-change)               */
/* ================================================================== */

function useMicroFeedback(timeout = 1200) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(
    (key: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setActiveKey(key);
      timerRef.current = setTimeout(() => setActiveKey(null), timeout);
    },
    [timeout],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { activeKey, flash };
}

/* ================================================================== */
/*  useIsDesktop                                                       */
/* ================================================================== */

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return desktop;
}

/* ================================================================== */
/*  Dropdown                                                           */
/* ================================================================== */
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isColorPopoverTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest('[data-radlink-color-popover="true"]'))
  );
}

function FloatingPortalPanel({
  open,
  onClose,
  children,
  anchorEl,
  align = "right",
  width = "w-80",
  zIndex = 400,
  offset = 12,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  anchorEl: HTMLElement | null;
  align?: "left" | "right" | "center";
  width?: string;
  zIndex?: number;
  offset?: number;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [positioned, setPositioned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: -9999,
    left: -9999,
  });

  // Reset positioned state when panel closes
  useEffect(() => {
    if (!open) {
      // Small delay so exit animation can play before we reset
      const t = setTimeout(() => setPositioned(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const computePosition = useCallback(() => {
    if (!anchorEl || !panelRef.current) return null;

    const anchorRect = anchorEl.getBoundingClientRect();
    const panelEl = panelRef.current;

    // Use actual rendered size — this is why we render invisible first
    const panelWidth = panelEl.offsetWidth;
    const panelHeight = panelEl.offsetHeight;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal
    let left = 0;
    if (align === "left") {
      left = anchorRect.left;
    } else if (align === "center") {
      left = anchorRect.left + anchorRect.width / 2 - panelWidth / 2;
    } else {
      // right-aligned (RTL default)
      left = anchorRect.right - panelWidth;
    }
    left = clamp(left, 12, vw - panelWidth - 12);

    // Vertical — prefer below, flip above if needed
    const belowTop = anchorRect.bottom + offset;
    const aboveTop = anchorRect.top - panelHeight - offset;

    let top: number;
    if (belowTop + panelHeight <= vh - 12) {
      top = belowTop;
    } else if (aboveTop >= 12) {
      top = aboveTop;
    } else {
      top = clamp(belowTop, 12, vh - panelHeight - 12);
    }

    return { top, left };
  }, [anchorEl, align, offset]);

  // Phase 1: mount invisible → measure → position → show
  useLayoutEffect(() => {
    if (!open || !anchorEl || !panelRef.current) return;

    // Use double-rAF to ensure browser has painted the invisible panel
    // so we get accurate offsetWidth/offsetHeight
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const pos = computePosition();
        if (pos) {
          setCoords(pos);
          // Trigger the visible+animated state in next microtask
          // so the browser registers the position change first
          requestAnimationFrame(() => {
            setPositioned(true);
          });
        }
      });
      // Clean up inner rAF if outer is cancelled
      return () => cancelAnimationFrame(raf2);
    });

    return () => cancelAnimationFrame(raf1);
  }, [open, anchorEl, computePosition]);

  // Phase 2: keep position updated on scroll/resize
  useEffect(() => {
    if (!open || !positioned || !anchorEl) return;

    const update = () => {
      const pos = computePosition();
      if (pos) setCoords(pos);
    };

    const resizeObserver = new ResizeObserver(update);
    if (panelRef.current) resizeObserver.observe(panelRef.current);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, positioned, anchorEl, computePosition]);

  // Click outside to close
  useEffect(() => {
    if (!open || !anchorEl) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (isColorPopoverTarget(e.target)) return;
      if (panelRef.current?.contains(target)) return;
      if (anchorEl.contains(target)) return;
      onClose();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, anchorEl, onClose]);

  // Don't render anything if not open or no anchor
  if (!open || !anchorEl || typeof document === "undefined") return null;

  const isVisible = positioned;

  return createPortal(
    <div
      ref={panelRef}
      dir="rtl"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        zIndex,
        // Phase 1 (measuring): fully invisible, no pointer events
        // Phase 2 (positioned): visible with animation
        ...(isVisible
          ? {}
          : {
              visibility: "hidden" as const,
              pointerEvents: "none" as const,
            }),
      }}
      className={[
        width,
        "rounded-2xl border border-neutral-200/80 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.12)]",
        // Smooth enter animation via CSS transition
        "transition-[opacity,transform] duration-200 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-[0.97]",
        className,
      ].join(" ")}
    >
      {children}
    </div>,
    document.body,
  );
}
function Dropdown({
  open,
  onClose,
  children,
  align = "right",
  width = "w-80",
  anchorEl,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  anchorEl: HTMLElement | null;
}) {
  return (
    <FloatingPortalPanel
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      align={align}
      width={width}
      zIndex={300}
    >
      <div
        className={[
          "max-h-[min(78dvh,720px)] overflow-y-auto overscroll-contain p-4",
          CUSTOM_SCROLLBAR,
        ].join(" ")}
      >
        {children}
      </div>
    </FloatingPortalPanel>
  );
}

/* ================================================================== */
/*  Custom Color Picker                                                */
/* ================================================================== */

function CustomColorPicker({
  color,
  label,
  onChange,
  onClose,
}: {
  color: string;
  label: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}) {
  const [inputValue, setInputValue] = useState(color);
  const [recentColors, setRecentColors] = useState<string[]>(() =>
    getRecentColors(),
  );
  const hiddenRef = useRef<HTMLInputElement>(null);
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parsedColor = getParsedColor(inputValue || color);
  const nativeHex = formatHexColor(parsedColor);

  useEffect(() => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(() => {
      setInputValue(color);
    }, 50);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [color]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  const handleInput = (val: string) => {
    setInputValue(val);
    if (isValidCssColorValue(val)) {
      onChange(val);
      addRecentColor(val);
      setRecentColors(getRecentColors());
    }
  };

  const handleColorChange = (newColor: string) => {
    // UI محلی سریع آپدیت بشه
    setInputValue(newColor);

    // اگر هنوز در بازه قفل هستیم، رد کن
    if (isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    onChange(newColor);

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  };

  const handleNativeColor = (newColor: string) => {
    const next = parseCssColor(newColor);
    if (!next) return;
    handleColorChange(formatCssColor({ ...next, a: parsedColor.a }));
  };

  const handleAlpha = (alphaPercent: number) => {
    handleColorChange(
      formatCssColor({
        ...parsedColor,
        a: Math.min(1, Math.max(0, alphaPercent / 100)),
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineEyeDropper size={14} className="text-neutral-500" />
          <span className="text-[13px] font-bold text-neutral-800">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        >
          <HiOutlineXMark size={14} />
        </button>
      </div>

      <div className="flex items-stretch gap-3">
        <button
          type="button"
          onClick={() => hiddenRef.current?.click()}
          className="group relative shrink-0"
        >
          <span
            className={[
              "block h-14 w-14 rounded-xl shadow-sm transition-transform group-hover:scale-105",
              isLightColor(color) ? "ring-1 ring-neutral-200" : "",
            ].join(" ")}
            style={{ backgroundColor: color }}
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
            <HiOutlineEyeDropper size={18} className="text-white" />
          </span>
          <input
            ref={hiddenRef}
            type="color"
            value={nativeHex}
            onChange={(e) => {
              handleNativeColor(e.target.value);
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </button>
        <div className="flex flex-1 flex-col justify-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 font-mono text-base text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            dir="ltr"
            placeholder="rgba(0, 0, 0, 0.4)"
          />
          <div className="flex gap-2 px-1 font-mono text-[10px] text-neutral-400">
            <span>R {parsedColor.r}</span>
            <span>·</span>
            <span>G {parsedColor.g}</span>
            <span>·</span>
            <span>B {parsedColor.b}</span>
            <span>Â·</span>
            <span>A {Math.round(parsedColor.a * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(parsedColor.a * 100)}
            onChange={(event) => handleAlpha(Number(event.target.value))}
            className="w-full accent-neutral-900"
            aria-label={`${label} opacity`}
          />
        </div>
      </div>

      {recentColors.length > 0 && (
        <div>
          <p className="mb-2.5 text-[11px] font-bold text-neutral-500">
            رنگ‌های اخیر
          </p>
          <div className="grid grid-cols-6 gap-2">
            {recentColors.map((recent, idx) => {
              const active = recent.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={`${recent}-${idx}`}
                  type="button"
                  onClick={() => {
                    handleColorChange(recent);
                    setInputValue(recent);
                  }}
                  className={[
                    "relative aspect-square w-full rounded-xl transition-all hover:scale-110 hover:shadow-md",
                    isLightColor(recent)
                      ? "ring-1 ring-neutral-200 hover:ring-neutral-300"
                      : "hover:ring-1 hover:ring-neutral-300",
                    active
                      ? "ring-2 ring-neutral-800 ring-offset-2 ring-offset-white scale-110"
                      : "",
                  ].join(" ")}
                  style={{ backgroundColor: recent }}
                  title={recent}
                >
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={[
                          "h-2.5 w-2.5 rounded-full shadow-sm",
                          isLightColor(recent) ? "bg-neutral-800" : "bg-white",
                        ].join(" ")}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2.5 text-[11px] font-bold text-neutral-500">
          پالت رنگ
        </p>
        <div className="grid grid-cols-7 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const active = preset.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  handleColorChange(preset);
                  setInputValue(preset);
                }}
                className={[
                  "relative aspect-square w-full rounded-xl transition-all hover:scale-110 hover:shadow-md",
                  isLightColor(preset)
                    ? "ring-1 ring-neutral-200 hover:ring-neutral-300"
                    : "hover:ring-1 hover:ring-neutral-300",
                  active
                    ? "ring-2 ring-neutral-800 ring-offset-2 ring-offset-white scale-110"
                    : "",
                ].join(" ")}
                style={{ backgroundColor: preset }}
                title={preset}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full shadow-sm",
                        isLightColor(preset) ? "bg-neutral-800" : "bg-white",
                      ].join(" ")}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Inline Color Swatch with picker                                    */
/* ================================================================== */

function InlineColorWithPicker({
  color,
  label,
  styleKey,
  onChange,
  openPickerKey,
  setOpenPickerKey,
  feedbackActive,
}: {
  color: string;
  label: string;
  styleKey: EditableStyleKey;
  onChange: (hex: string) => void;
  openPickerKey: string | null;
  setOpenPickerKey: (key: string | null) => void;
  feedbackActive?: boolean;
}) {
  const isOpen = openPickerKey === styleKey;
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={triggerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpenPickerKey(isOpen ? null : styleKey)}
        className={[
          "group flex items-center gap-2 rounded-xl px-2 py-2 transition-all",
          feedbackActive
            ? "bg-emerald-50 ring-1 ring-emerald-200"
            : isOpen
              ? "bg-neutral-100"
              : "hover:bg-neutral-50",
        ].join(" ")}
        title={label}
      >
        <span
          className={[
            "block h-5 w-5 rounded-lg shadow-sm transition-transform group-hover:scale-110",
            isLightColor(color)
              ? "ring-1 ring-neutral-300"
              : "ring-1 ring-neutral-200",
          ].join(" ")}
          style={{ backgroundColor: color }}
        />
        <span className="hidden text-[11px] font-semibold text-neutral-600 transition group-hover:text-neutral-800 xl:inline">
          {label}
        </span>
      </button>

      <FloatingPortalPanel
        open={isOpen}
        onClose={() => setOpenPickerKey(null)}
        anchorEl={triggerRef.current}
        align="right"
        width="w-72"
        zIndex={400}
      >
        <div className="p-4">
          <CustomColorPicker
            color={color}
            label={label}
            onChange={onChange}
            onClose={() => setOpenPickerKey(null)}
          />
        </div>
      </FloatingPortalPanel>
    </div>
  );
}

/* ================================================================== */
/*  Desktop Toolbar                                                    */
/* ================================================================== */

type ToolbarProps = {
  block: PageBlock;
  schema: BlockSchema;
  selEl: BlockElement | null;
  selSchema: BlockSchema["elements"][string] | null;
  selLabel: string;
  selectedElementId: string | null;
  breakpoint: Breakpoint;
  isScrolled?: boolean;
  onBreakpointChange: (bp: Breakpoint) => void;
  onUpdateContent: (key: string, value: unknown) => void;
  onUpdateStyle: (
    elementId: string,
    styleKey: EditableStyleKey,
    value: string | number | AnimationType | ShadowStyleValue,
  ) => void;
  onClose: () => void;
  onDeleteBlock: () => void;
  onDuplicateBlock: () => void;
};

function DesktopToolbar({
  block,
  schema,
  selEl,
  selSchema,
  selLabel,
  selectedElementId,
  breakpoint,
  isScrolled,
  onBreakpointChange,
  onUpdateContent,
  onUpdateStyle,
  onClose,
  onDeleteBlock,
  onDuplicateBlock,
}: ToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);
  const [openNumericDropdown, setOpenNumericDropdown] = useState<string | null>(
    null,
  );
  const numericBtnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const feedback = useMicroFeedback();
  const contentTriggerRef = useRef<HTMLDivElement>(null);
  const styleTriggerRef = useRef<HTMLDivElement>(null);
  const animationTriggerRef = useRef<HTMLDivElement>(null);
  const actionsTriggerRef = useRef<HTMLDivElement>(null);
  // ── scroll fade masks ──
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // RTL: scrollLeft is negative in some browsers
    const sl = Math.abs(el.scrollLeft);
    setCanScrollRight(sl > 4);
    setCanScrollLeft(sl + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, selectedElementId]);

  const allowedKeys = selSchema?.allowedStyleKeys ?? [];
  const style: EditableStyleMap | null = selEl ? selEl.style : null;
  const hasContent = schema.contentFields.length > 0;

  const colorKeys: EditableStyleKey[] = [
    "color",
    "backgroundColor",
    "borderColor",
  ];
  const colorLabels: Record<string, string> = {
    color: "متن",
    backgroundColor: "بک‌گراند",
    borderColor: "بوردر",
  };

  const numericIcons: Record<string, React.ReactNode> = {
    fontSize: <RxFontSize size={13} />,
    marginTop: <RxBorderWidth size={13} />,
    marginBottom: <RxBorderWidth size={13} />,
    paddingTop: <RxBorderWidth size={13} />,
    paddingBottom: <RxBorderWidth size={13} />,
    borderRadius: <RxCornerBottomRight size={13} />,
    borderWidth: <RxBorderWidth size={13} />,
    gridColumns: <HiOutlineSwatch size={13} />,
  };

  const numericKeys: EditableStyleKey[] = [
    "fontSize",
    "marginTop",
    "marginBottom",
    "paddingTop",
    "paddingBottom",
    "borderRadius",
    "borderWidth",
    "gridColumns",
  ];

  const activeColors = colorKeys.filter((k) => allowedKeys.includes(k));
  const activeNumerics = numericKeys.filter((k) => allowedKeys.includes(k));
  const hasAnim = allowedKeys.includes("animation");

  // ── fire: update style + local micro-feedback (NO toast) ──
  const fire = (
    key: EditableStyleKey,
    val: string | number | AnimationType | ShadowStyleValue,
  ) => {
    if (!selectedElementId) return;
    onUpdateStyle(selectedElementId, key, val);
    feedback.flash(key);
  };

  const toggle = (id: DropdownId) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
    setOpenColorPicker(null);
    setOpenNumericDropdown(null);
  };

  const hasInline =
    selectedElementId &&
    style &&
    (activeColors.length > 0 || activeNumerics.length > 0 || hasAnim);

  // ── compact vs full ──
  const isCompact = Boolean(isScrolled);

  return (
    <div
      data-tour="tour-inspector-panel"
      className={[
        "fixed inset-x-0 z-[100] flex justify-center px-4 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
        isCompact ? "top-12 pt-1" : "top-[60px] pt-3",
      ].join(" ")}
      dir="rtl"
    >
      <div className="relative w-full max-w-5xl">
        <div
          className={[
            "flex items-center rounded-2xl border border-neutral-200/60 bg-white/[0.97] backdrop-blur-2xl transition-all duration-300",
            isCompact
              ? "px-2 py-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.03),0_8px_24px_-8px_rgba(0,0,0,0.06)]"
              : "px-2.5 py-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.08)]",
          ].join(" ")}
        >
          {/* ── Block badge ── */}
          <div
            className={[
              "flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 transition-all",
              isCompact ? "px-2 py-[5px]" : "px-3 py-[7px]",
            ].join(" ")}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span
              className={[
                "font-bold text-emerald-700 transition-all",
                isCompact ? "text-[10px]" : "text-[12px]",
              ].join(" ")}
            >
              {schema.label}
            </span>
          </div>

          {/* ── Selected element chip ── */}
          {selectedElementId && !isCompact && (
            <>
              <Sep />
              <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1.5">
                <HiOutlineSwatch size={12} className="text-neutral-400" />
                <span className="max-w-[100px] truncate text-[11px] font-semibold text-neutral-600">
                  {selLabel}
                </span>
              </div>
            </>
          )}

          <Sep />

          {/* ══════════════════════════════════════ */}
          {/*  SCROLLABLE QUICK CONTROLS AREA        */}
          {/* ══════════════════════════════════════ */}
          <div className="relative min-w-0 flex-1">
            {/* fade masks */}
            {canScrollLeft && (
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white/95 to-transparent" />
            )}
            {canScrollRight && (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white/95 to-transparent" />
            )}

            <div
              ref={scrollRef}
              className="flex items-center   overflow-x-auto scrollbar-none"
            >
              {/* ▸ Content dropdown */}
              {hasContent && (
                <div ref={contentTriggerRef} className="relative shrink-0">
                  <BarBtn
                    active={openDropdown === "content"}
                    icon={<HiOutlinePencil size={13} />}
                    label={isCompact ? "" : "محتوا"}
                    onClick={() => toggle("content")}
                  />
                  <Dropdown
                    open={openDropdown === "content"}
                    onClose={() => setOpenDropdown(null)}
                    anchorEl={contentTriggerRef.current}
                    width={
                      schema.contentFields.length > 4
                        ? "w-[min(92vw,560px)]"
                        : "w-[min(92vw,440px)]"
                    }
                  >
                    <DynamicContentForm
                      fields={schema.contentFields}
                      data={block.data}
                      onChange={onUpdateContent}
                    />
                  </Dropdown>
                </div>
              )}

              {/* ▸ Style dropdown (Advanced) */}
              {selectedElementId && allowedKeys.length > 0 && (
                <div ref={styleTriggerRef} className="relative shrink-0">
                  <BarBtn
                    active={openDropdown === "style"}
                    icon={<HiOutlineAdjustmentsHorizontal size={13} />}
                    label={isCompact ? "" : "استایل  "}
                    onClick={() => toggle("style")}
                  />
                  <Dropdown
                    open={openDropdown === "style"}
                    onClose={() => setOpenDropdown(null)}
                    anchorEl={styleTriggerRef.current}
                    width={
                      allowedKeys.length > 4
                        ? "w-[min(92vw,560px)]"
                        : "w-[min(92vw,440px)]"
                    }
                  >
                    {/* header inside dropdown */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HiOutlineAdjustmentsHorizontal
                          size={14}
                          className="text-neutral-500"
                        />
                        <span className="text-[13px] font-bold text-neutral-800">
                          استایل پیشرفته
                        </span>
                      </div>
                    </div>
                    <DynamicStyleForm
                      elementLabel={schema.elements[selectedElementId]?.label}
                      element={selEl}
                      allowedStyleKeys={selSchema?.allowedStyleKeys ?? []}
                      breakpoint={breakpoint}
                      onBreakpointChange={onBreakpointChange}
                      onChange={(sk, v) => {
                        if (!selectedElementId) return;
                        onUpdateStyle(selectedElementId, sk, v);
                      }}
                    />
                  </Dropdown>
                </div>
              )}

              {/* ── Quick inline controls ── */}
              {hasInline && (
                <>
                  <Sep />

                  {activeColors.map((key) => {
                    const raw = getResp(
                      style![key] as
                        ResponsiveValue<string | number> | undefined,
                      breakpoint,
                    );
                    return (
                      <InlineColorWithPicker
                        key={key}
                        color={toColorString(raw)}
                        label={colorLabels[key] ?? key}
                        styleKey={key}
                        onChange={(color) => {
                          fire(key, color);
                          addRecentColor(color);
                        }}
                        openPickerKey={openColorPicker}
                        setOpenPickerKey={setOpenColorPicker}
                        feedbackActive={feedback.activeKey === key}
                      />
                    );
                  })}

                  {activeColors.length > 0 && activeNumerics.length > 0 && (
                    <Sep />
                  )}

                  {/* group label */}

                  {activeNumerics.map((key) => {
                    const cfg = NUMERIC_CONFIG[key];
                    if (!cfg) return null;
                    const raw = getResp(
                      style![key] as
                        ResponsiveValue<string | number> | undefined,
                      breakpoint,
                    );
                    const isOpen = openNumericDropdown === key;
                    return (
                      <div
                        key={key}
                        className="relative shrink-0"
                        ref={(el) => {
                          numericBtnRefs.current[key] = el;
                        }}
                      >
                        {" "}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenNumericDropdown(isOpen ? null : key);
                            setOpenDropdown(null);
                            setOpenColorPicker(null);
                          }}
                          className={[
                            "flex items-center gap-1.5 rounded-xl px-2.5 py-2 transition-all",
                            feedback.activeKey === key
                              ? "bg-emerald-50 ring-1 ring-emerald-200"
                              : isOpen
                                ? "bg-neutral-900 text-white"
                                : "text-neutral-500 hover:bg-neutral-100",
                          ].join(" ")}
                          title={STYLE_LABELS[key]}
                        >
                          <span
                            className={
                              isOpen ? "text-white" : "text-neutral-500"
                            }
                          >
                            {numericIcons[key]}
                          </span>
                          <span className="text-[11px] font-semibold">
                            {toNum(raw)}
                            {cfg.unit}
                          </span>
                          {isOpen ? (
                            <HiOutlineChevronUp size={10} />
                          ) : (
                            <HiOutlineChevronDown size={10} />
                          )}
                        </button>
                        {/* numeric dropdown popover */}
                        <FloatingPortalPanel
                          open={isOpen}
                          onClose={() => setOpenNumericDropdown(null)}
                          anchorEl={numericBtnRefs.current[key] ?? null}
                          align="right"
                          width="w-64"
                          zIndex={400}
                        >
                          <div
                            className="space-y-4 p-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-bold text-neutral-800">
                                {STYLE_LABELS[key]}
                              </span>
                              <button
                                type="button"
                                onClick={() => setOpenNumericDropdown(null)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                              >
                                <HiOutlineXMark size={14} />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={cfg.min}
                                max={cfg.max}
                                step={cfg.step}
                                value={toNum(raw)}
                                onChange={(e) =>
                                  fire(key, Number(e.target.value))
                                }
                                className="h-[4px] flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-300 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                              />
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={toNum(raw)}
                                onChange={(e) => {
                                  const n = Number(e.target.value);
                                  if (Number.isFinite(n))
                                    fire(
                                      key,
                                      Math.max(cfg.min, Math.min(cfg.max, n)),
                                    );
                                }}
                                className="w-16 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2 text-center text-[13px] font-medium text-neutral-700 outline-none transition focus:border-neutral-400 focus:bg-white"
                                dir="ltr"
                              />
                              <span className="text-[11px] font-medium text-neutral-400">
                                {cfg.unit}
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                              {[
                                cfg.min,
                                Math.floor((cfg.max - cfg.min) / 3) + cfg.min,
                                Math.floor(((cfg.max - cfg.min) * 2) / 3) +
                                  cfg.min,
                                cfg.max,
                              ].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => fire(key, preset)}
                                  className={[
                                    "rounded-lg border px-2 py-2 text-[11px] font-semibold transition-all",
                                    toNum(raw) === preset
                                      ? "border-neutral-900 bg-neutral-900 text-white"
                                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50",
                                  ].join(" ")}
                                >
                                  {preset}
                                  {cfg.unit}
                                </button>
                              ))}
                            </div>
                          </div>
                        </FloatingPortalPanel>
                      </div>
                    );
                  })}

                  {/* ── Animation ── */}
                  {hasAnim && (
                    <>
                      {(activeNumerics.length > 0 ||
                        activeColors.length > 0) && <Sep />}
                      <div
                        ref={animationTriggerRef}
                        className="relative shrink-0"
                      >
                        <BarBtn
                          active={openDropdown === "animation"}
                          icon={<HiOutlineSparkles size={13} />}
                          label={
                            isCompact
                              ? ""
                              : (ANIMATION_OPTIONS.find(
                                  (o) =>
                                    o.value ===
                                    ((style!.animation as AnimationType) ??
                                      "none"),
                                )?.label ?? "انیمیشن")
                          }
                          onClick={() => toggle("animation")}
                          compact
                        />
                        <Dropdown
                          open={openDropdown === "animation"}
                          onClose={() => setOpenDropdown(null)}
                          anchorEl={animationTriggerRef.current}
                          width="w-64"
                        >
                          <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                            انیمیشن ورود
                          </p>
                          <div className="max-h-[min(62vh,520px)] space-y-1 overflow-y-auto overscroll-contain pe-1 [scrollbar-width:thin]">
                            {ANIMATION_OPTIONS.map((opt) => {
                              const active =
                                ((style!.animation as AnimationType) ??
                                  "none") === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={(event) => {
                                    const icon =
                                      event.currentTarget.querySelector<HTMLElement>(
                                        "[data-animation-preview]",
                                      );
                                    if (icon) previewAnimation(icon, opt.value);
                                    fire("animation", opt.value);
                                  }}
                                  className={[
                                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-all",
                                    active
                                      ? "bg-neutral-900 text-white"
                                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
                                  ].join(" ")}
                                >
                                  <span
                                    data-animation-preview
                                    className={[
                                      "flex h-7 w-7 items-center justify-center rounded-lg text-[13px] transition",
                                      active
                                        ? "bg-white/20 text-white"
                                        : "bg-neutral-100",
                                    ].join(" ")}
                                  >
                                    {opt.icon}
                                  </span>
                                  <div>
                                    <div className="text-[12px] font-bold">
                                      {opt.label}
                                    </div>
                                    <div
                                      className={[
                                        "text-[10px]",
                                        active
                                          ? "text-white/60"
                                          : "text-neutral-400",
                                      ].join(" ")}
                                    >
                                      {opt.desc}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </Dropdown>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          {/* ═══ end scrollable area ═══ */}

          {/* ── micro feedback pulse ── */}
          {/* <SavePulse visible={feedback.activeKey !== null} /> */}

          <Sep />

          {/* ── Actions ── */}
          <div ref={actionsTriggerRef} className="relative shrink-0">
            <BarBtn
              active={openDropdown === "actions"}
              icon={<HiOutlineCog6Tooth size={14} />}
              label=""
              onClick={() => toggle("actions")}
              compact
            />
            <Dropdown
              open={openDropdown === "actions"}
              onClose={() => setOpenDropdown(null)}
              anchorEl={actionsTriggerRef.current}
              width="w-52"
              align="left"
            >
              <button
                type="button"
                onClick={() => {
                  onDuplicateBlock();
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <HiOutlineDocumentDuplicate size={16} />
                کپی بلاک
              </button>
              <div className="mx-2 my-1.5 h-px bg-neutral-100" />
              <button
                type="button"
                onClick={() => {
                  onDeleteBlock();
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-red-500 transition hover:bg-red-50"
              >
                <HiOutlineTrash size={16} />
                حذف بلاک
              </button>
            </Dropdown>
          </div>

          {/* ── Close / deselect ── */}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Micro components                                                   */
/* ================================================================== */

function Sep() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-neutral-200/60" />;
}

function BarBtn({
  active,
  icon,
  label,
  onClick,
  compact,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[12px] font-semibold transition-all",
        active
          ? "bg-neutral-900 text-white"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
        compact ? "px-2" : "",
      ].join(" ")}
    >
      {icon}
      {label && (
        <span className="hidden whitespace-nowrap xl:inline">{label}</span>
      )}
      {active ? (
        <HiOutlineChevronUp size={10} />
      ) : (
        <HiOutlineChevronDown size={10} />
      )}
    </button>
  );
}

/* ================================================================== */
/*  Mobile Island                                                      */
/* ================================================================== */

function MobileIsland({
  block,
  schema,
  selEl,
  selSchema,
  selLabel,
  selectedElementId,
  breakpoint,
  onBreakpointChange,
  onUpdateContent,
  onUpdateStyle,
  onClose,
  onDeleteBlock,
  onDuplicateBlock,
}: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("content");

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const hasContent = schema.contentFields.length > 0;
  const hasStyle = Boolean(selSchema?.allowedStyleKeys?.length);
  const allowedKeys = selSchema?.allowedStyleKeys ?? [];
  const blockHasEditableStyle = Object.values(schema.elements).some(
    (element) => element.allowedStyleKeys.length > 0,
  );

  const TABS: Array<{
    key: PanelTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      key: "content",
      label: "محتوا",
      icon: <HiOutlinePencil size={16} />,
      badge: hasContent ? String(schema.contentFields.length) : undefined,
    },
    {
      key: "style",
      label: "ظاهر",
      icon: <HiOutlinePaintBrush size={16} />,
      badge:
        hasStyle && selectedElementId ? String(allowedKeys.length) : undefined,
    },
    {
      key: "actions",
      label: "عملیات",
      icon: <HiOutlineCog6Tooth size={16} />,
    },
  ];
  const visibleTabs = TABS.filter(
    (item) => item.key !== "style" || blockHasEditableStyle,
  );
  const activeTab: PanelTab =
    tab === "style" && (!selectedElementId || !blockHasEditableStyle)
      ? "content"
      : tab;

  return (
    <>
      {/* ── Floating pill ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,8px)+8px)]"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/[0.98] px-4 py-3.5 shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all active:scale-[0.98]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[13px] font-bold text-neutral-800">
            {schema.label}
          </span>

          {selectedElementId && (
            <>
              <span className="h-4 w-px bg-neutral-200" />
              <span className="truncate text-[12px] text-neutral-400">
                {selLabel}
              </span>
            </>
          )}

          <span className="flex-1" />
          <span className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-bold text-white">
            ویرایش
            <HiOutlineChevronUp size={10} />
          </span>
        </button>
      </div>

      {/* ── Fullscreen panel ── */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex flex-col bg-white text-neutral-900 animate-in slide-in-from-bottom duration-300"
            dir="rtl"
          >
            {/* Header */}
            <header className="flex shrink-0 items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[14px] font-bold text-neutral-800">
                {schema.label}
              </span>

              {selectedElementId && (
                <>
                  <span className="h-4 w-px bg-neutral-200" />
                  <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                    {selLabel}
                  </span>
                </>
              )}

              <span className="flex-1" />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-700"
                aria-label="بستن"
              >
                <HiOutlineXMark size={20} />
              </button>
            </header>

            {/* Tabs */}
            <nav className="shrink-0 px-4 pb-1.5 pt-3.5">
              <div className="flex gap-1 rounded-2xl bg-neutral-100 p-1">
                {visibleTabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={[
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-[13px] transition-all duration-200",
                      activeTab === t.key
                        ? "bg-white font-bold text-neutral-800 shadow-sm"
                        : "font-medium text-neutral-400 active:bg-white/50",
                    ].join(" ")}
                  >
                    {t.icon}
                    {t.label}
                    {t.badge && (
                      <span
                        className={[
                          "flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold",
                          activeTab === t.key
                            ? "bg-neutral-200 text-neutral-600"
                            : "bg-neutral-200/60 text-neutral-400",
                        ].join(" ")}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* Body */}
            <div
              className={[
                "flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] pt-4",
                CUSTOM_SCROLLBAR,
              ].join(" ")}
            >
              {activeTab === "content" &&
                (hasContent ? (
                  <DynamicContentForm
                    fields={schema.contentFields}
                    data={block.data}
                    onChange={onUpdateContent}
                  />
                ) : (
                  <EmptyState
                    icon={<HiOutlinePencil size={28} />}
                    title="فیلد محتوایی ندارد"
                    desc="برای این بلاک فیلد محتوایی تعریف نشده."
                  />
                ))}

              {activeTab === "style" &&
                (selectedElementId ? (
                  hasStyle ? (
                    <DynamicStyleForm
                      elementLabel={schema.elements[selectedElementId]?.label}
                      element={selEl}
                      allowedStyleKeys={selSchema?.allowedStyleKeys ?? []}
                      breakpoint={breakpoint}
                      onBreakpointChange={onBreakpointChange}
                      onChange={(sk, v) => {
                        if (!selectedElementId) return;
                        onUpdateStyle(selectedElementId, sk, v);
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={<HiOutlinePaintBrush size={28} />}
                      title="استایل قابل ویرایشی ندارد"
                      desc="برای این المنت استایلی تعریف نشده."
                    />
                  )
                ) : (
                  <EmptyState
                    icon={<HiOutlineSwatch size={28} />}
                    title="یه المنت انتخاب کن"
                    desc="روی بخش موردنظر داخل بلاک کلیک کن."
                  />
                ))}

              {activeTab === "actions" && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicateBlock();
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-neutral-200 bg-white px-4 py-4 text-[15px] font-bold text-neutral-700 transition-all active:scale-[0.98] hover:bg-neutral-50"
                  >
                    <HiOutlineDocumentDuplicate size={20} />
                    کپی بلاک
                  </button>

                  <div className="my-2 rounded-xl border border-red-100 bg-red-50/50 p-3">
                    <p className="mb-2.5 text-[11px] font-bold text-red-400">
                      ناحیه خطر
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteBlock();
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-200 bg-white px-4 py-4 text-[15px] font-bold text-red-600 transition-all active:scale-[0.98] hover:bg-red-50"
                    >
                      <HiOutlineTrash size={20} />
                      حذف بلاک
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[13px] font-semibold text-neutral-500 transition-all active:scale-[0.98] hover:bg-neutral-100"
                  >
                    <HiOutlineXMark size={16} />
                    لغو انتخاب بلاک
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/* ================================================================== */
/*  Empty State                                                        */
/* ================================================================== */

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 px-6 py-16 text-center">
      <span className="mb-3 text-neutral-300">{icon}</span>
      <p className="text-[15px] font-bold text-neutral-600">{title}</p>
      <p className="mt-2 text-[13px] leading-6 text-neutral-400">{desc}</p>
    </div>
  );
}

/* ================================================================== */
/*  Export                                                             */
/* ================================================================== */

export function DynamicIslandPanel({
  block,
  schema,
  selectedElementId,
  breakpoint,
  isScrolled = false,
  onBreakpointChange,
  onUpdateContent,
  onUpdateStyle,
  onClose,
  onDeleteBlock,
  onDuplicateBlock,
  readOnly = false,
}: DynamicIslandPanelProps) {
  const isDesktop = useIsDesktop();

  if (!block || !schema) return null;

  if (readOnly) {
    return (
      <div
        className="fixed bottom-5 left-1/2 z-100 flex w-[min(92vw,430px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-amber-200 bg-white p-3 shadow-xl"
        dir="rtl"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <HiOutlineLockClosed size={18} />
        </div>
        <p className="min-w-0 flex-1 text-[12px] font-semibold leading-6 text-neutral-700">
          این بلاک فقط قابل مشاهده است. برای تغییر محتوا، استایل، ترتیب یا حذف
          آن به دسترسی «ویرایش» نیاز دارید.
        </p>
        <button
          type="button"
          onClick={onClose}
          title="بستن"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
        >
          <HiOutlineXMark size={17} />
        </button>
      </div>
    );
  }

  const selEl: BlockElement | null = selectedElementId
    ? (block.elements[selectedElementId] ?? null)
    : null;

  const selSchema = selectedElementId
    ? (schema.elements[selectedElementId] ?? null)
    : null;

  const selLabel = selectedElementId
    ? (schema.elements[selectedElementId]?.label ?? selectedElementId)
    : "—";

  const props: ToolbarProps = {
    block,
    schema,
    selEl,
    selSchema,
    selLabel,
    selectedElementId,
    breakpoint,
    isScrolled,
    onBreakpointChange,
    onUpdateContent,
    onUpdateStyle,
    onClose,
    onDeleteBlock,
    onDuplicateBlock,
  };

  return isDesktop ? (
    <DesktopToolbar {...props} />
  ) : (
    <MobileIsland {...props} />
  );
}
