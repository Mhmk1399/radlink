"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineCheck,
  HiOutlineEyeDropper,
  HiOutlineSquares2X2,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  formatCssColor,
  formatHexColor,
  isLightCssColor,
  isValidCssColorValue,
  parseCssColor,
  type RgbaColor,
} from "@/lib/design/color";

type RgbaColorInputProps = {
  value: string;
  label: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  swatchClassName?: string;
  inputClassName?: string;
  panelClassName?: string;
};

const RECENT_COLORS_KEY = "radlink_recent_colors";
const MAX_RECENT_COLORS = 10;

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
  "rgba(15, 23, 42, 0.72)",
  "transparent",
];

const CHECKER_BACKGROUND =
  "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)";
const FLOATING_PANEL_MARGIN = 12;
const FLOATING_PANEL_GAP = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sanitizePanelClassName(className: string) {
  const detachedPositionClasses = new Set([
    "absolute",
    "fixed",
    "sticky",
    "relative",
    "left-0",
    "right-0",
    "top-0",
    "bottom-0",
    "top-full",
    "bottom-full",
  ]);

  return className
    .split(/\s+/)
    .filter((part) => {
      if (!part) return false;
      if (detachedPositionClasses.has(part)) return false;
      if (part.startsWith("inset-")) return false;
      return true;
    })
    .join(" ");
}

function isRtlContext(element: HTMLElement | null) {
  if (!element || typeof document === "undefined") return false;
  return (
    Boolean(element.closest('[dir="rtl"]')) ||
    document.documentElement.dir === "rtl" ||
    document.body.dir === "rtl"
  );
}

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

function storeRecentColor(color: string) {
  if (typeof window === "undefined" || !isValidCssColorValue(color)) return;

  try {
    const recent = getRecentColors().filter(
      (item) => item.toLowerCase() !== color.toLowerCase(),
    );
    recent.unshift(color);
    localStorage.setItem(
      RECENT_COLORS_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT_COLORS)),
    );
  } catch {
    /* localStorage is optional here */
  }
}

function fallbackColor(value: string): RgbaColor {
  return (
    parseCssColor(value) ??
    parseCssColor("#000000") ?? { r: 0, g: 0, b: 0, a: 1 }
  );
}

function alphaLabel(alpha: number): string {
  return `${Math.round(alpha * 100)}%`;
}

function Swatch({
  color,
  className,
  selected,
}: {
  color: string;
  className: string;
  selected?: boolean;
}) {
  return (
    <span
      className={[
        "relative block overflow-hidden shadow-sm",
        isLightCssColor(color) ? "ring-1 ring-neutral-200" : "",
        selected
          ? "ring-2 ring-neutral-900 ring-offset-2 ring-offset-white"
          : "",
        className,
      ].join(" ")}
      style={{
        backgroundColor: "#fff",
        backgroundImage: CHECKER_BACKGROUND,
        backgroundPosition: "0 0,0 6px,6px -6px,-6px 0",
        backgroundSize: "12px 12px",
      }}
    >
      <span
        className="absolute inset-0"
        style={{ backgroundColor: color || "transparent" }}
      />
    </span>
  );
}

export function RgbaColorInput({
  value,
  label,
  onChange,
  disabled = false,
  className = "",
  swatchClassName = "h-12 w-14 rounded-xl",
  inputClassName = "min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-3 font-mono text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100",
  panelClassName = "right-0 w-80",
}: RgbaColorInputProps) {
  const externalValue = value || "#000000";
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedValueRef = useRef(externalValue);

  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({
    left: FLOATING_PANEL_MARGIN,
    top: FLOATING_PANEL_MARGIN,
    maxHeight: `calc(100dvh - ${FLOATING_PANEL_MARGIN * 2}px)`,
    maxWidth: `calc(100dvw - ${FLOATING_PANEL_MARGIN * 2}px)`,
    transformOrigin: "top right",
    visibility: "hidden",
  });
  const [draftState, setDraftState] = useState(() => ({
    externalValue,
    draftValue: externalValue,
  }));
  const [recentColors, setRecentColors] = useState<string[]>(() =>
    getRecentColors(),
  );

  const draftValue =
    draftState.externalValue === externalValue
      ? draftState.draftValue
      : externalValue;

  const setDraftValue = (nextValue: string) => {
    setDraftState({ externalValue, draftValue: nextValue });
  };

  const parsedColor = useMemo(
    () => fallbackColor(draftValue || externalValue),
    [draftValue, externalValue],
  );
  const nativeHex = formatHexColor(parsedColor);
  const isValidDraft = isValidCssColorValue(draftValue);
  const cleanPanelClassName = useMemo(
    () => sanitizePanelClassName(panelClassName),
    [panelClassName],
  );

  const updatePanelPosition = useCallback(() => {
    const anchor = wrapperRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel || typeof window === "undefined") return;

    const anchorRect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportMaxWidth = Math.max(
      180,
      viewportWidth - FLOATING_PANEL_MARGIN * 2,
    );
    const viewportMaxHeight = Math.max(
      160,
      viewportHeight - FLOATING_PANEL_MARGIN * 2,
    );

    const panelWidth = Math.min(
      panel.getBoundingClientRect().width || 320,
      viewportMaxWidth,
    );
    const contentHeight = Math.min(
      panel.scrollHeight || panel.getBoundingClientRect().height || 420,
      viewportMaxHeight,
    );
    const spaceBelow = Math.max(
      0,
      viewportHeight -
        anchorRect.bottom -
        FLOATING_PANEL_GAP -
        FLOATING_PANEL_MARGIN,
    );
    const spaceAbove = Math.max(
      0,
      anchorRect.top - FLOATING_PANEL_GAP - FLOATING_PANEL_MARGIN,
    );
    const shouldOpenAbove =
      spaceBelow < contentHeight && spaceAbove > spaceBelow;
    const availableHeight = Math.max(
      120,
      Math.min(viewportMaxHeight, shouldOpenAbove ? spaceAbove : spaceBelow),
    );
    const panelHeight = Math.min(contentHeight, availableHeight);
    const preferredLeft = isRtlContext(anchor)
      ? anchorRect.right - panelWidth
      : anchorRect.left;
    const maxLeft = viewportWidth - panelWidth - FLOATING_PANEL_MARGIN;
    const left = clamp(
      preferredLeft,
      FLOATING_PANEL_MARGIN,
      Math.max(FLOATING_PANEL_MARGIN, maxLeft),
    );
    const rawTop = shouldOpenAbove
      ? anchorRect.top - FLOATING_PANEL_GAP - panelHeight
      : anchorRect.bottom + FLOATING_PANEL_GAP;
    const maxTop = viewportHeight - panelHeight - FLOATING_PANEL_MARGIN;
    const top = clamp(
      rawTop,
      FLOATING_PANEL_MARGIN,
      Math.max(FLOATING_PANEL_MARGIN, maxTop),
    );

    setPanelStyle({
      left: Math.round(left),
      top: Math.round(top),
      maxHeight: Math.round(availableHeight),
      maxWidth: Math.round(viewportMaxWidth),
      transformOrigin: shouldOpenAbove
        ? isRtlContext(anchor)
          ? "bottom right"
          : "bottom left"
        : isRtlContext(anchor)
          ? "top right"
          : "top left",
      visibility: "visible",
    });
  }, []);

  useEffect(() => {
    committedValueRef.current = externalValue;
  }, [externalValue]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    setPanelStyle((current) => ({ ...current, visibility: "hidden" }));

    const frame = window.requestAnimationFrame(updatePanelPosition);
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
  }, []);

  const commitValue = (nextValue: string, immediate = false) => {
    setDraftValue(nextValue);
    const parsedNextValue = parseCssColor(nextValue);
    if (!parsedNextValue) return;

    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);

    const runCommit = () => {
      const trimmed = formatCssColor(parsedNextValue);
      if (trimmed === committedValueRef.current) return;

      committedValueRef.current = trimmed;
      storeRecentColor(trimmed);
      setRecentColors(getRecentColors());
      onChange?.(trimmed);
    };

    if (immediate) {
      runCommit();
      return;
    }

    commitTimerRef.current = setTimeout(runCommit, 120);
  };

  const commitParsedColor = (nextColor: RgbaColor, immediate = false) => {
    commitValue(formatCssColor(nextColor), immediate);
  };

  const handleNativeColor = (hex: string) => {
    const next = parseCssColor(hex);
    if (!next) return;

    commitParsedColor({ ...next, a: parsedColor.a });
  };

  const handleAlpha = (alphaPercent: number) => {
    commitParsedColor({
      ...parsedColor,
      a: Math.min(1, Math.max(0, alphaPercent / 100)),
    });
  };

  return (
    <div
      ref={wrapperRef}
      className={["relative flex items-center gap-3", className].join(" ")}
    >
      <button
        type="button"
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        disabled={disabled}
        className="group relative shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={label}
      >
        <Swatch
          color={isValidDraft ? draftValue : externalValue}
          className={swatchClassName}
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <HiOutlineEyeDropper size={18} className="text-white" />
        </span>
      </button>

      <input
        type="text"
        value={draftValue}
        onChange={(event) => commitValue(event.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (!isValidCssColorValue(draftValue)) {
            setDraftValue(committedValueRef.current || "#000000");
          } else {
            commitValue(draftValue, true);
          }
        }}
        disabled={disabled}
        className={[
          inputClassName,
          isValidDraft
            ? ""
            : "border-red-300 focus:border-red-400 focus:ring-red-100",
        ].join(" ")}
        dir="ltr"
        placeholder="rgba(0, 0, 0, 0.4)"
        spellCheck={false}
      />

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              data-radlink-color-popover="true"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              className={[
                "builder-modal-scrollbar fixed z-[1000] max-w-[calc(100dvw-24px)] overflow-y-auto overscroll-contain rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_24px_80px_-18px_rgba(0,0,0,0.25)]",
                cleanPanelClassName,
              ].join(" ")}
              style={panelStyle}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <HiOutlineEyeDropper
                    size={14}
                    className="shrink-0 text-neutral-500"
                  />
                  <span className="truncate text-[13px] font-bold text-neutral-800">
                    {label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Close color picker"
                >
                  <HiOutlineXMark size={14} />
                </button>
              </div>

              <div className="flex items-stretch gap-3">
                <button
                  type="button"
                  onClick={() => nativeInputRef.current?.click()}
                  className="group relative shrink-0"
                >
                  <Swatch
                    color={formatCssColor(parsedColor)}
                    className="h-16 w-16 rounded-2xl"
                  />
                  <span className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                    <HiOutlineEyeDropper size={20} className="text-white" />
                  </span>
                  <input
                    ref={nativeInputRef}
                    type="color"
                    value={nativeHex}
                    onChange={(event) => handleNativeColor(event.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={label}
                  />
                </button>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-neutral-500">
                    <span className="rounded-lg bg-neutral-50 px-2 py-1">
                      R {parsedColor.r}
                    </span>
                    <span className="rounded-lg bg-neutral-50 px-2 py-1">
                      G {parsedColor.g}
                    </span>
                    <span className="rounded-lg bg-neutral-50 px-2 py-1">
                      B {parsedColor.b}
                    </span>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-2.5">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-neutral-500">
                      <span>Opacity</span>
                      <span className="font-mono">
                        {alphaLabel(parsedColor.a)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(parsedColor.a * 100)}
                        onChange={(event) =>
                          handleAlpha(Number(event.target.value))
                        }
                        className="min-w-0 flex-1 accent-neutral-900"
                        aria-label={`${label} opacity`}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={Math.round(parsedColor.a * 100)}
                        onChange={(event) =>
                          handleAlpha(Number(event.target.value))
                        }
                        className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-center font-mono text-[11px] font-bold text-neutral-700 outline-none focus:border-neutral-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {recentColors.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-neutral-500">
                    <HiOutlineCheck size={12} />
                    <span>Recent</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {recentColors.map((recent, index) => {
                      const active =
                        recent.toLowerCase() ===
                        draftValue.trim().toLowerCase();
                      return (
                        <button
                          key={`${recent}-${index}`}
                          type="button"
                          onClick={() => commitValue(recent, true)}
                          className="transition hover:scale-110"
                          title={recent}
                        >
                          <Swatch
                            color={recent}
                            className="aspect-square w-full rounded-xl"
                            selected={active}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-neutral-500">
                  <HiOutlineSquares2X2 size={12} />
                  <span>Palette</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const active =
                      preset.toLowerCase() === draftValue.trim().toLowerCase();
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => commitValue(preset, true)}
                        className="transition hover:scale-110"
                        title={preset}
                      >
                        <Swatch
                          color={preset}
                          className="aspect-square w-full rounded-xl"
                          selected={active}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
