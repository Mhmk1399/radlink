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
  "fontSize" | "borderRadius" | "borderWidth"
>;

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const styleLabels: Record<EditableStyleKey, string> = {
  color: "رنگ متن",
  backgroundColor: "رنگ پس‌زمینه",
  fontSize: "اندازه متن",
  borderRadius: "گردی گوشه‌ها",
  borderColor: "رنگ بوردر",
  borderWidth: "ضخامت بوردر",
  animation: "انیمیشن",
};

const styleIcons: Partial<Record<EditableStyleKey, React.ReactNode>> = {
  color: <HiOutlineEyeDropper size={15} />,
  backgroundColor: <HiOutlinePaintBrush size={15} />,
  borderColor: <HiOutlineSwatch size={15} />,
  fontSize: <RxFontSize size={15} />,
  borderRadius: <RxCornerBottomRight size={15} />,
  borderWidth: <RxBorderWidth size={15} />,
  animation: <HiOutlineSparkles size={15} />,
};

const animationOptions: Array<{
  label: string;
  value: AnimationType;
  icon: string;
}> = [
  { label: "بدون انیمیشن", value: "none", icon: "○" },
  { label: "محو شدن", value: "fade", icon: "◐" },
  { label: "اسلاید به بالا", value: "slideUp", icon: "↑" },
  { label: "بزرگ‌نمایی", value: "scale", icon: "⊕" },
  { label: "تپش", value: "pulse", icon: "◉" },
];

const numberFieldConfig: Record<
  NumericStyleKey,
  { min: number; max: number; step: number; unit: string }
> = {
  fontSize: { min: 8, max: 120, step: 1, unit: "px" },
  borderRadius: { min: 0, max: 64, step: 1, unit: "px" },
  borderWidth: { min: 0, max: 20, step: 1, unit: "px" },
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
  return k === "fontSize" || k === "borderRadius" || k === "borderWidth";
}

function getNumericValue(value: string | number | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const p = Number.parseFloat(value);
    if (Number.isFinite(p)) return p;
  }
  return 0;
}

function getColorPickerValue(value: string | number | undefined): string {
  if (typeof value !== "string") return "#000000";
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : "#000000";
}

function isLightColor(hex: string): boolean {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return false;
  const l =
    (0.299 * parseInt(m[1], 16) +
      0.587 * parseInt(m[2], 16) +
      0.114 * parseInt(m[3], 16)) /
    255;
  return l > 0.7;
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
                  {animationOptions.map((opt) => {
                    const active = cur === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange("animation", opt.value)}
                        className={[
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-right transition-all",
                          active
                            ? "border-neutral-300 bg-white font-semibold text-neutral-900 shadow-sm"
                            : "border-neutral-100 bg-transparent text-neutral-500 hover:border-neutral-200 hover:bg-white hover:text-neutral-700",
                        ].join(" ")}
                      >
                        <span className="text-[14px] leading-none">
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
            const pickerValue = getColorPickerValue(value);

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
                  <span
                    className={[
                      "h-5 w-5 rounded-full shadow-sm",
                      isLightColor(pickerValue)
                        ? "ring-1 ring-neutral-200"
                        : "",
                    ].join(" ")}
                    style={{ backgroundColor: pickerValue }}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="relative shrink-0 cursor-pointer">
                    <span
                      className={[
                        "block h-11 w-11 rounded-xl shadow-sm transition hover:scale-105",
                        isLightColor(pickerValue)
                          ? "ring-1 ring-neutral-200"
                          : "",
                      ].join(" ")}
                      style={{ backgroundColor: pickerValue }}
                    />
                    <input
                      type="color"
                      value={pickerValue}
                      onChange={(e) => onChange(styleKey, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      aria-label={styleLabels[styleKey]}
                    />
                  </label>

                  {/* text-base = 16px → no iOS zoom */}
                  <input
                    type="text"
                    value={textValue}
                    onChange={(e) => onChange(styleKey, e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-mono text-base text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    dir="ltr"
                    placeholder="#000000"
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
