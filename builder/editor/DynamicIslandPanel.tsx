"use client";

import React, { useEffect, useRef, useState } from "react";
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
} from "@/types/blocks/builder.types";
import { DynamicContentForm } from "./form/DynamicContentForm";
import { DynamicStyleForm } from "./form/DynamicStyleForm";

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
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  onUpdateContent: (key: string, value: unknown) => void;
  onUpdateStyle: (
    elementId: string,
    styleKey: EditableStyleKey,
    value: string | number | AnimationType,
  ) => void;
  onClose: () => void;
  onDeleteBlock: () => void;
  onDuplicateBlock: () => void;
};

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const ANIMATION_OPTIONS: Array<{
  label: string;
  value: AnimationType;
  desc: string;
  icon: string;
}> = [
  { label: "بدون", value: "none", desc: "بدون انیمیشن", icon: "○" },
  { label: "محو", value: "fade", desc: "ظاهر شدن تدریجی", icon: "◐" },
  { label: "اسلاید", value: "slideUp", desc: "حرکت از پایین", icon: "↑" },
  { label: "زوم", value: "scale", desc: "بزرگ‌نمایی", icon: "⊕" },
  { label: "تپش", value: "pulse", desc: "پالس ملایم", icon: "◉" },
];

const STYLE_LABELS: Record<EditableStyleKey, string> = {
  color: "رنگ متن",
  backgroundColor: "پس‌زمینه",
  fontSize: "سایز فونت",
  borderRadius: "گردی",
  borderColor: "رنگ بوردر",
  borderWidth: "ضخامت بوردر",
  animation: "انیمیشن",
};

const NUMERIC_CONFIG: Record<
  string,
  { min: number; max: number; step: number; unit: string }
> = {
  fontSize: { min: 8, max: 120, step: 1, unit: "px" },
  borderRadius: { min: 0, max: 64, step: 1, unit: "px" },
  borderWidth: { min: 0, max: 20, step: 1, unit: "px" },
};

const COLOR_PRESETS = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
  "#000000",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
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

function toHex(v: string | number | undefined): string {
  return typeof v === "string" && /^#([0-9a-fA-F]{3,8})$/.test(v)
    ? v
    : "#000000";
}

function toNum(v: string | number | undefined): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.7;
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

function Dropdown({
  open,
  onClose,
  children,
  align = "right",
  width = "w-80",
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        if (anchorRef?.current && anchorRef.current.contains(target)) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  return (
    <div
      ref={ref}
      className={[
        "absolute top-full z-[300] mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.12)] transition-all duration-200",
        width,
        align === "right"
          ? "right-0"
          : align === "left"
            ? "left-0"
            : "left-1/2 -translate-x-1/2",
        open
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none -translate-y-2 scale-[0.97] opacity-0",
      ].join(" ")}
    >
      <div
        className={[
          "max-h-[min(65vh,520px)] overflow-y-auto overscroll-contain p-4",
          CUSTOM_SCROLLBAR,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
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
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleInput = (val: string) => {
    setInputValue(val);
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) onChange(val);
  };

  const rgb = hexToRgb(color);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineEyeDropper size={14} className="text-neutral-500" />
          <span className="text-[13px] font-semibold text-neutral-800">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        >
          <HiOutlineXMark size={14} />
        </button>
      </div>

      {/* Preview + Input */}
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
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
              setInputValue(e.target.value);
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </button>

        <div className="flex flex-1 flex-col justify-center gap-1.5">
          {/* text-base (16px) prevents iOS zoom */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-base text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-100"
            dir="ltr"
            placeholder="#000000"
          />
          {rgb && (
            <div className="flex gap-2 px-1 font-mono text-[10px] text-neutral-400">
              <span>R {rgb.r}</span>
              <span>·</span>
              <span>G {rgb.g}</span>
              <span>·</span>
              <span>B {rgb.b}</span>
            </div>
          )}
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="mb-2 text-[11px] font-semibold text-neutral-500">
          پالت رنگ
        </p>
        <div className="grid grid-cols-7 gap-[6px]">
          {COLOR_PRESETS.map((preset) => {
            const active = preset.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onChange(preset);
                  setInputValue(preset);
                }}
                className={[
                  "relative aspect-square w-full rounded-[10px] transition-all hover:scale-110 hover:shadow-md",
                  isLightColor(preset)
                    ? "ring-1 ring-neutral-200 hover:ring-neutral-300"
                    : "hover:ring-1 hover:ring-neutral-300",
                  active
                    ? "ring-2 ring-neutral-800 ring-offset-2 ring-offset-white"
                    : "",
                ].join(" ")}
                style={{ backgroundColor: preset }}
                title={preset}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={[
                        "h-2 w-2 rounded-full shadow-sm",
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
}: {
  color: string;
  label: string;
  styleKey: EditableStyleKey;
  onChange: (hex: string) => void;
  openPickerKey: string | null;
  setOpenPickerKey: (key: string | null) => void;
}) {
  const isOpen = openPickerKey === styleKey;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpenPickerKey(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setOpenPickerKey]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpenPickerKey(isOpen ? null : styleKey)}
        className={[
          "group flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition-all",
          isOpen ? "bg-neutral-100" : "hover:bg-neutral-50",
        ].join(" ")}
        title={label}
      >
        <span
          className={[
            "block h-5 w-5 rounded-full shadow-sm transition-transform group-hover:scale-110",
            isLightColor(color)
              ? "ring-1 ring-neutral-300"
              : "ring-1 ring-neutral-200",
          ].join(" ")}
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-medium text-neutral-600 transition group-hover:text-neutral-800">
          {label}
        </span>
      </button>

      <div
        className={[
          "absolute right-0 top-full z-[400] mt-2.5 w-72 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.12)] transition-all duration-200",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0",
        ].join(" ")}
      >
        <CustomColorPicker
          color={color}
          label={label}
          onChange={onChange}
          onClose={() => setOpenPickerKey(null)}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Inline Slider                                                      */
/* ================================================================== */

function InlineSlider({
  icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition hover:bg-neutral-50">
      <span className="text-neutral-500" title={label}>
        {icon}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-[3px] w-14 cursor-pointer appearance-none rounded-full bg-neutral-200 xl:w-[70px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-300 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
        aria-label={label}
      />
      {/* 16px font to prevent iOS zoom */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        className="w-9 rounded-lg border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-center text-base font-medium text-neutral-700 outline-none transition focus:border-neutral-400 focus:bg-white sm:text-[11px]"
        dir="ltr"
      />
      <span className="text-[10px] font-medium text-neutral-400">{unit}</span>
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
  onBreakpointChange: (bp: Breakpoint) => void;
  onUpdateContent: (key: string, value: unknown) => void;
  onUpdateStyle: (
    elementId: string,
    styleKey: EditableStyleKey,
    value: string | number | AnimationType,
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
  onUpdateContent,
  onUpdateStyle,
  onDeleteBlock,
  onDuplicateBlock,
}: ToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

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
    borderRadius: <RxCornerBottomRight size={13} />,
    borderWidth: <RxBorderWidth size={13} />,
  };

  const numericKeys: EditableStyleKey[] = [
    "fontSize",
    "borderRadius",
    "borderWidth",
  ];

  const activeColors = colorKeys.filter((k) => allowedKeys.includes(k));
  const activeNumerics = numericKeys.filter((k) => allowedKeys.includes(k));
  const hasAnim = allowedKeys.includes("animation");

  const fire = (key: EditableStyleKey, val: string | number | AnimationType) =>
    selectedElementId && onUpdateStyle(selectedElementId, key, val);

  const toggle = (id: DropdownId) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
    setOpenColorPicker(null);
  };

  const hasInline =
    selectedElementId &&
    style &&
    (activeColors.length > 0 || activeNumerics.length > 0 || hasAnim);

  return (
    <div
      className="fixed inset-x-0 top-14 z-[100] flex justify-center px-3 pt-2.5"
      dir="rtl"
    >
      <div className="relative w-full max-w-5xl" ref={barRef}>
        <div className="flex items-center rounded-2xl border border-neutral-200/80 bg-white/[0.97] px-2 py-[5px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_-8px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          {/* ▸ Block */}
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-neutral-50 px-3 py-[6px]">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-25" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-neutral-800">
              {schema.label}
            </span>
          </div>

          {/* ▸ Element */}
          {selectedElementId && (
            <>
              <Sep />
              <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-50 px-2 py-1">
                <HiOutlineSwatch size={11} className="text-neutral-400" />
                <span className="max-w-[90px] truncate text-[10px] font-semibold text-neutral-600">
                  {selLabel}
                </span>
              </div>
            </>
          )}

          <Sep />

          {/* ▸ Content */}
          {hasContent && (
            <div className="relative">
              <BarBtn
                active={openDropdown === "content"}
                icon={<HiOutlinePencil size={13} />}
                label="محتوا"
                onClick={() => toggle("content")}
              />
              <Dropdown
                open={openDropdown === "content"}
                onClose={() => setOpenDropdown(null)}
                anchorRef={barRef}
                width="w-[380px]"
              >
                <DynamicContentForm
                  fields={schema.contentFields}
                  data={block.data}
                  onChange={onUpdateContent}
                />
              </Dropdown>
            </div>
          )}

          {/* ▸ Style */}
          {selectedElementId && allowedKeys.length > 0 && (
            <div className="relative">
              <BarBtn
                active={openDropdown === "style"}
                icon={<HiOutlinePaintBrush size={13} />}
                label="استایل"
                onClick={() => toggle("style")}
              />
              <Dropdown
                open={openDropdown === "style"}
                onClose={() => setOpenDropdown(null)}
                anchorRef={barRef}
                width="w-[380px]"
              >
                <DynamicStyleForm
                  elementLabel={schema.elements[selectedElementId]?.label}
                  element={selEl}
                  allowedStyleKeys={selSchema?.allowedStyleKeys ?? []}
                  breakpoint={breakpoint}
                  onBreakpointChange={() => {}}
                  onChange={(sk, v) => {
                    if (!selectedElementId) return;
                    onUpdateStyle(selectedElementId, sk, v);
                  }}
                />
              </Dropdown>
            </div>
          )}

          {/* ▸ Inline */}
          {hasInline && (
            <>
              <Sep />

              {activeColors.map((key) => {
                const raw = getResp(
                  style![key] as ResponsiveValue<string | number> | undefined,
                  breakpoint,
                );
                return (
                  <InlineColorWithPicker
                    key={key}
                    color={toHex(raw)}
                    label={colorLabels[key] ?? key}
                    styleKey={key}
                    onChange={(hex) => fire(key, hex)}
                    openPickerKey={openColorPicker}
                    setOpenPickerKey={setOpenColorPicker}
                  />
                );
              })}

              {activeColors.length > 0 && activeNumerics.length > 0 && <Sep />}

              {activeNumerics.map((key) => {
                const cfg = NUMERIC_CONFIG[key];
                if (!cfg) return null;
                const raw = getResp(
                  style![key] as ResponsiveValue<string | number> | undefined,
                  breakpoint,
                );
                return (
                  <InlineSlider
                    key={key}
                    icon={numericIcons[key]}
                    label={STYLE_LABELS[key]}
                    value={toNum(raw)}
                    {...cfg}
                    onChange={(v) => fire(key, v)}
                  />
                );
              })}

              {hasAnim && (
                <>
                  {(activeNumerics.length > 0 || activeColors.length > 0) && (
                    <Sep />
                  )}
                  <div className="relative">
                    <BarBtn
                      active={openDropdown === "animation"}
                      icon={<HiOutlineSparkles size={13} />}
                      label={
                        ANIMATION_OPTIONS.find(
                          (o) =>
                            o.value ===
                            ((style!.animation as AnimationType) ?? "none"),
                        )?.label ?? "انیمیشن"
                      }
                      onClick={() => toggle("animation")}
                      compact
                    />
                    <Dropdown
                      open={openDropdown === "animation"}
                      onClose={() => setOpenDropdown(null)}
                      anchorRef={barRef}
                      width="w-60"
                    >
                      <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        انیمیشن ورود
                      </p>
                      <div className="space-y-0.5">
                        {ANIMATION_OPTIONS.map((opt) => {
                          const active =
                            ((style!.animation as AnimationType) ?? "none") ===
                            opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => fire("animation", opt.value)}
                              className={[
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-all",
                                active
                                  ? "bg-neutral-100 text-neutral-900"
                                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "flex h-6 w-6 items-center justify-center rounded-full border text-[12px] transition",
                                  active
                                    ? "border-neutral-400 bg-neutral-800 text-white"
                                    : "border-neutral-200 bg-neutral-50",
                                ].join(" ")}
                              >
                                {opt.icon}
                              </span>
                              <div>
                                <div className="text-[12px] font-semibold">
                                  {opt.label}
                                </div>
                                <div className="text-[10px] text-neutral-400">
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

          <span className="flex-1" />

          {/* ▸ Actions */}
          <div className="relative">
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
              anchorRef={barRef}
              width="w-52"
              align="left"
            >
              <button
                type="button"
                onClick={() => {
                  onDuplicateBlock();
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <HiOutlineDocumentDuplicate size={15} />
                کپی بلاک
              </button>
              <div className="mx-2 my-1.5 h-px bg-neutral-100" />
              <button
                type="button"
                onClick={() => {
                  onDeleteBlock();
                  setOpenDropdown(null);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-red-500 transition hover:bg-red-50"
              >
                <HiOutlineTrash size={15} />
                حذف بلاک
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Micro                                                              */
/* ================================================================== */

function Sep() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-neutral-200/80" />;
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
        "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all",
        active
          ? "bg-neutral-100 text-neutral-900"
          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700",
        compact ? "px-1.5" : "",
      ].join(" ")}
    >
      {icon}
      {label && <span className="hidden xl:inline">{label}</span>}
      {active ? (
        <HiOutlineChevronUp size={9} />
      ) : (
        <HiOutlineChevronDown size={9} />
      )}
    </button>
  );
}

/* ================================================================== */
/*  Mobile                                                             */
/* ================================================================== */

function MobileIsland({
  block,
  schema,
  selEl,
  selSchema,
  selLabel,
  selectedElementId,
  breakpoint,
  onUpdateContent,
  onUpdateStyle,
  onClose,
  onDeleteBlock,
  onDuplicateBlock,
}: ToolbarProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("content");

  useEffect(() => {
    if (!selectedElementId && tab === "style") setTab("content");
  }, [selectedElementId, tab]);

  const hasContent = schema.contentFields.length > 0;
  const hasStyle = Boolean(selSchema?.allowedStyleKeys?.length);

  const TABS: Array<{ key: PanelTab; label: string; icon: React.ReactNode }> = [
    { key: "content", label: "محتوا", icon: <HiOutlinePencil size={16} /> },
    { key: "style", label: "ظاهر", icon: <HiOutlinePaintBrush size={16} /> },
    {
      key: "actions",
      label: "تنظیمات",
      icon: <HiOutlineCog6Tooth size={16} />,
    },
  ];

  return (
    <>
      {/* Pill */}
      <div
        className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-2"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full max-w-sm items-center gap-2.5 rounded-2xl border border-neutral-200/80 bg-white/[0.97] px-3.5 py-2.5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all active:scale-[0.98]"
        >
          <span className="relative flex h-[7px] w-[7px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-25" />
            <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
          </span>
          <span className="text-[12px] font-bold text-neutral-800">
            {schema.label}
          </span>

          {selectedElementId && (
            <>
              <span className="h-3.5 w-px bg-neutral-200" />
              <span className="truncate text-[11px] text-neutral-400">
                {selLabel}
              </span>
            </>
          )}

          <span className="flex-1" />
          <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
            ویرایش
            <HiOutlineChevronDown size={11} />
          </span>
        </button>
      </div>

      {/* Fullscreen */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex flex-col bg-white text-neutral-900"
            dir="rtl"
          >
            {/* Header */}
            <header className="flex shrink-0 items-center gap-2.5 border-b border-neutral-100 px-4 py-3">
              <span className="relative flex h-[7px] w-[7px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-25" />
                <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-emerald-500" />
              </span>
              <span className="text-[13px] font-bold text-neutral-800">
                {schema.label}
              </span>

              {selectedElementId && (
                <>
                  <span className="h-4 w-px bg-neutral-200" />
                  <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                    {selLabel}
                  </span>
                </>
              )}

              <span className="flex-1" />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-600"
                aria-label="بستن"
              >
                <HiOutlineXMark size={18} />
              </button>
            </header>

            {/* Tabs */}
            <nav className="shrink-0 px-4 pb-1 pt-3">
              <div className="flex gap-[3px] rounded-[14px] bg-neutral-100 p-[3px]">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={[
                      "flex flex-1 items-center justify-center gap-1.5 rounded-[11px] py-2.5 text-[13px] transition-all duration-200",
                      tab === t.key
                        ? "bg-white font-bold text-neutral-800 shadow-sm"
                        : "font-medium text-neutral-400",
                    ].join(" ")}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Body */}
            <div
              className={[
                "flex-1 overflow-y-auto overscroll-contain px-4 pb-12 pt-4",
                CUSTOM_SCROLLBAR,
              ].join(" ")}
            >
              {tab === "content" &&
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

              {tab === "style" &&
                (selectedElementId ? (
                  hasStyle ? (
                    <DynamicStyleForm
                      elementLabel={schema.elements[selectedElementId]?.label}
                      element={selEl}
                      allowedStyleKeys={selSchema?.allowedStyleKeys ?? []}
                      breakpoint={breakpoint}
                      onBreakpointChange={() => {}}
                      onChange={(sk, v) => {
                        if (!selectedElementId) return;
                        onUpdateStyle(selectedElementId, sk, v);
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={<HiOutlinePaintBrush size={28} />}
                      title="استایل قابل ویرایش ندارد"
                      desc="برای این المنت style قابل ویرایشی تعریف نشده."
                    />
                  )
                ) : (
                  <EmptyState
                    icon={<HiOutlineSwatch size={28} />}
                    title="المنت انتخاب کن"
                    desc="روی بخش موردنظر داخل بلاک کلیک کن."
                  />
                ))}

              {tab === "actions" && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicateBlock();
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-[14px] font-semibold text-neutral-700 transition active:scale-[0.98] hover:bg-neutral-100"
                  >
                    <HiOutlineDocumentDuplicate size={18} />
                    کپی بلاک
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onDeleteBlock();
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-[14px] font-semibold text-red-600 transition active:scale-[0.98] hover:bg-red-100"
                  >
                    <HiOutlineTrash size={18} />
                    حذف بلاک
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-100 bg-neutral-50 px-6 py-14 text-center">
      <span className="mb-3 text-neutral-300">{icon}</span>
      <p className="text-[14px] font-semibold text-neutral-600">{title}</p>
      <p className="mt-1.5 text-[12px] leading-5 text-neutral-400">{desc}</p>
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
  onBreakpointChange,
  onUpdateContent,
  onUpdateStyle,
  onClose,
  onDeleteBlock,
  onDuplicateBlock,
}: DynamicIslandPanelProps) {
  const isDesktop = useIsDesktop();

  if (!block || !schema) return null;

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
