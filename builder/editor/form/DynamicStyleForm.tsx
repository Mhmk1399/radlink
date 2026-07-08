"use client";

import {
  HiOutlinePaintBrush,
  HiOutlineSparkles,
  HiOutlineSwatch,
  HiOutlineEyeDropper,
} from "react-icons/hi2";
import { RxBorderWidth, RxCornerBottomRight, RxFontSize } from "react-icons/rx";

import type {
  EditableStyleKey,
  EditableStyleMap,
  ResponsiveValue,
  AnimationType,
  BlockElement,
} from "@/types/blocks/builder.types";
import {
  ANIMATION_OPTIONS,
  previewAnimation,
} from "../animationOptions";
import { RgbaColorInput } from "./RgbaColorInput";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type Breakpoint = "mobile" | "tablet" | "desktop";

type DynamicStyleFormProps = {
  elementLabel?: string;
  element: BlockElement | null;
  allowedStyleKeys: readonly EditableStyleKey[];
  breakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  onChange: (
    styleKey: EditableStyleKey,
    value: string | number | AnimationType,
  ) => void;
};

type NumericStyleKey = Extract<
  EditableStyleKey,
  "fontSize" | "height" | "borderRadius" | "borderWidth" | "gridColumns"
>;

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const styleLabels: Record<EditableStyleKey, string> = {
  color: "رنگ متن",
  backgroundColor: "رنگ پس‌زمینه",
  fontSize: "اندازه متن",
  height: "ارتفاع",
  borderRadius: "گردی گوشه‌ها",
  borderColor: "رنگ بوردر",
  borderWidth: "ضخامت بوردر",
  gridColumns: "تعداد ستون‌های گرید",
  animation: "انیمیشن",
};

const styleIcons: Partial<Record<EditableStyleKey, React.ReactNode>> = {
  color: <HiOutlineEyeDropper size={15} />,
  backgroundColor: <HiOutlinePaintBrush size={15} />,
  borderColor: <HiOutlineSwatch size={15} />,
  fontSize: <RxFontSize size={15} />,
  height: <RxFontSize size={15} />,
  borderRadius: <RxCornerBottomRight size={15} />,
  borderWidth: <RxBorderWidth size={15} />,
  gridColumns: <HiOutlineSwatch size={15} />,
  animation: <HiOutlineSparkles size={15} />,
};

const numberFieldConfig: Record<
  NumericStyleKey,
  { min: number; max: number; step: number; unit: string }
> = {
  fontSize: { min: 8, max: 120, step: 1, unit: "px" },
  height: { min: 80, max: 1200, step: 10, unit: "px" },
  borderRadius: { min: 0, max: 64, step: 1, unit: "px" },
  borderWidth: { min: 0, max: 20, step: 1, unit: "px" },
  gridColumns: { min: 1, max: 4, step: 1, unit: " ستون" },
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function getResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint,
): T | undefined {
  if (!value) return undefined;
  if (breakpoint === "desktop")
    return value.desktop ?? value.tablet ?? value.mobile;
  if (breakpoint === "tablet") return value.tablet ?? value.mobile;
  return value.mobile;
}

function isColorStyleKey(
  k: EditableStyleKey,
): k is Extract<EditableStyleKey, "color" | "backgroundColor" | "borderColor"> {
  return k === "color" || k === "backgroundColor" || k === "borderColor";
}

function isNumericStyleKey(k: EditableStyleKey): k is NumericStyleKey {
  return (
    k === "fontSize" ||
    k === "height" ||
    k === "borderRadius" ||
    k === "borderWidth" ||
    k === "gridColumns"
  );
}

function getNumericValue(value: string | number | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const p = Number.parseFloat(value);
    if (Number.isFinite(p)) return p;
  }
  return 0;
}

/* ================================================================== */
/*  Sub                                                                */
/* ================================================================== */

function FormNotice({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-neutral-100 bg-neutral-50 px-5 py-10 text-center">
      <span className="mb-3 text-neutral-300">{icon}</span>
      <div className="text-[13px] font-semibold text-neutral-600">{title}</div>
      <p className="mt-1 text-[11px] leading-5 text-neutral-400">
        {description}
      </p>
    </div>
  );
}

function SectionHeader({
  label,
  elementName,
}: {
  label: string;
  elementName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pb-2">
      <div className="flex items-center gap-2">
        <HiOutlinePaintBrush size={15} className="text-neutral-400" />
        <h3 className="text-[14px] font-bold text-neutral-800">{label}</h3>
      </div>
      {elementName && (
        <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
          <HiOutlineSwatch size={11} />
          <span className="max-w-[100px] truncate">{elementName}</span>
        </span>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main                                                               */
/* ================================================================== */

export function DynamicStyleForm({
  elementLabel,
  element,
  allowedStyleKeys,
  breakpoint,
  onBreakpointChange,
  onChange,
}: DynamicStyleFormProps) {
  if (!element) {
    return (
      <section className="space-y-3">
        <SectionHeader label="ظاهر" />
        <FormNotice
          icon={<HiOutlineSwatch size={26} />}
          title="یک المنت را انتخاب کن"
          description="روی بخش موردنظر داخل بلاک کلیک کن."
        />
      </section>
    );
  }

  if (allowedStyleKeys.length === 0) {
    return (
      <section className="space-y-3">
        <SectionHeader
          label="ظاهر"
          elementName={elementLabel ?? element.label}
        />
        <FormNotice
          icon={<HiOutlinePaintBrush size={26} />}
          title="استایل قابل ویرایش ندارد"
          description="برای این المنت style key قابل ویرایشی تعریف نشده."
        />
      </section>
    );
  }

  const s: EditableStyleMap = element.style;

  return (
    <section className="space-y-3">
      <SectionHeader label="ظاهر" elementName={elementLabel ?? element.label} />

      <div className="space-y-2.5">
        {allowedStyleKeys.map((styleKey) => {
          const icon = styleIcons[styleKey];

          /* Animation */
          if (styleKey === "animation") {
            const cur = (s.animation ?? "none") as string;
            return (
              <div
                key={styleKey}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-neutral-500">{icon}</span>
                  <span className="text-[13px] font-semibold text-neutral-700">
                    {styleLabels[styleKey]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ANIMATION_OPTIONS.map((opt) => {
                    const active = cur === opt.value;
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
                          onChange("animation", opt.value);
                        }}
                        className={[
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-right transition-all",
                          active
                            ? "border-neutral-300 bg-white font-semibold text-neutral-900 shadow-sm"
                            : "border-neutral-100 bg-transparent text-neutral-500 hover:border-neutral-200 hover:bg-white hover:text-neutral-700",
                        ].join(" ")}
                      >
                        <span
                          data-animation-preview
                          className="text-[14px] leading-none"
                        >
                          {opt.icon}
                        </span>
                        <span className="text-[12px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          const value = getResponsiveValue(
            s[styleKey] as ResponsiveValue<string | number> | undefined,
            breakpoint,
          );

          /* Color */
          if (isColorStyleKey(styleKey)) {
            const textValue = typeof value === "string" ? value : "";

            return (
              <div
                key={styleKey}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">{icon}</span>
                    <span className="text-[13px] font-semibold text-neutral-700">
                      {styleLabels[styleKey]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* text-base = 16px → no iOS zoom */}
                  <RgbaColorInput
                    value={textValue}
                    label={styleLabels[styleKey]}
                    onChange={(newColor) => onChange(styleKey, newColor)}
                    className="min-w-0 flex-1"
                    swatchClassName="h-11 w-11 rounded-xl"
                    inputClassName="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-mono text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                  />
                </div>
              </div>
            );
          }

          /* Numeric */
          if (isNumericStyleKey(styleKey)) {
            const cfg = numberFieldConfig[styleKey];
            const num = getNumericValue(value);
            const pct = ((num - cfg.min) / (cfg.max - cfg.min)) * 100;

            return (
              <div
                key={styleKey}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">{icon}</span>
                    <span className="text-[13px] font-semibold text-neutral-700">
                      {styleLabels[styleKey]}
                    </span>
                  </div>
                  <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-bold text-neutral-600 shadow-sm">
                    {num}
                    {cfg.unit}
                  </span>
                </div>

                {/* Slider */}
                <div className="relative mb-3">
                  <input
                    type="range"
                    min={cfg.min}
                    max={cfg.max}
                    step={cfg.step}
                    value={num}
                    onChange={(e) => onChange(styleKey, Number(e.target.value))}
                    className="relative z-10 h-8 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-neutral-300 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                    aria-label={styleLabels[styleKey]}
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-neutral-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {/* text-base = 16px → no iOS zoom */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={num}
                    onChange={(e) => onChange(styleKey, Number(e.target.value))}
                    className="w-20 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base font-semibold text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    dir="ltr"
                  />
                  <div className="flex items-center gap-2 text-[10px] font-medium text-neutral-400">
                    <span>
                      {cfg.min}
                      {cfg.unit}
                    </span>
                    <span className="h-px w-3 bg-neutral-300" />
                    <span>
                      {cfg.max}
                      {cfg.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
