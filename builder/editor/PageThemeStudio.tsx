"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineCheck,
  HiOutlinePaintBrush,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import { LogoHeaderFrame } from "@/components/landing/LogoHeaderFrame";
import {
  BUILDER_PAGE_THEMES,
  createThemeDraftFrom,
  loadCustomPageThemes,
  normalizePageThemeDraft,
  saveCustomPageThemes,
  type PageThemeRecipe,
  type PageThemeDefinition,
} from "@/lib/builder/pageThemes";
import {
  LOGO_HEADER_VARIANTS,
  type LogoHeaderSettings,
} from "@/lib/design/logo-header";
import {
  PAGE_BACKGROUND_PATTERNS,
  createPageBackgroundPattern,
  getPageBackgroundStyle,
  type PageBackgroundPattern,
} from "@/lib/design/page-background";

type PageThemeStudioProps = {
  open: boolean;
  logo?: string;
  logoShape: "square" | "circle";
  logoHeader: LogoHeaderSettings;
  title: string;
  onApply: (theme: PageThemeDefinition) => void;
  onClose: () => void;
};

const DEFAULT_DRAFT = createThemeDraftFrom(BUILDER_PAGE_THEMES[0]);

function createCustomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now()}`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[12px] font-bold text-neutral-600">
      {children}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const colorValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2">
        <input
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
          aria-label={label}
        />
        <input
          dir="ltr"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-lg bg-neutral-50 px-3 py-2 font-mono text-[13px] text-neutral-800 outline-none focus:bg-white focus:ring-2 focus:ring-neutral-100"
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold text-neutral-600">{label}</span>
        <span className="font-mono text-[11px] text-neutral-400">
          {value}px
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-neutral-900"
      />
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold text-neutral-600">{label}</span>
        <span className="font-mono text-[11px] text-neutral-400">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-neutral-900"
      />
    </div>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                "rounded-xl border px-3 py-2 text-[11px] font-black transition",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PatternPreview({
  base,
  pattern,
}: {
  base: string;
  pattern: Partial<PageBackgroundPattern>;
}) {
  return (
    <span
      className="block h-full w-full"
      style={getPageBackgroundStyle({
        color: base,
        image: "",
        pattern,
      })}
    />
  );
}

const TWO_COLOR_BACKGROUND_PATTERNS = new Set<PageBackgroundPattern["id"]>([
  "duotone-blur",
  "halftone-gradient",
  "gradient-dots",
  "orbital-circles",
  "blurred-dots",
  "aurora-mesh",
  "soft-spotlight",
  "premium-rings",
  "silk-waves",
]);

function supportsSecondPatternColor(patternId: PageBackgroundPattern["id"]) {
  return TWO_COLOR_BACKGROUND_PATTERNS.has(patternId);
}

const SURFACE_MODE_OPTIONS: Array<{
  value: PageThemeRecipe["surfaceMode"];
  label: string;
}> = [
  { value: "layered", label: "لایه‌ای" },
  { value: "glass", label: "شیشه‌ای" },
  { value: "solid", label: "یکپارچه" },
  { value: "flat", label: "تخت" },
];

const BUTTON_MODE_OPTIONS: Array<{
  value: PageThemeRecipe["buttonMode"];
  label: string;
}> = [
  { value: "solid", label: "یکپارچه" },
  { value: "soft", label: "نرم" },
  { value: "outline", label: "دورخط" },
];

const DENSITY_OPTIONS: Array<{
  value: PageThemeRecipe["density"];
  label: string;
}> = [
  { value: "balanced", label: "متعادل" },
  { value: "compact", label: "فشرده" },
  { value: "airy", label: "باز" },
];

const CONTRAST_OPTIONS: Array<{
  value: PageThemeRecipe["contrast"];
  label: string;
}> = [
  { value: "balanced", label: "متعادل" },
  { value: "soft", label: "نرم" },
  { value: "bold", label: "پررنگ" },
];

export function PageThemeStudio({
  open,
  logo,
  logoShape,
  logoHeader,
  title,
  onApply,
  onClose,
}: PageThemeStudioProps) {
  const [customThemes, setCustomThemes] = useState<PageThemeDefinition[]>(() =>
    loadCustomPageThemes(),
  );
  const [selectedId, setSelectedId] = useState(BUILDER_PAGE_THEMES[0].id);
  const [draft, setDraft] = useState<PageThemeDefinition>(DEFAULT_DRAFT);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const allThemes = useMemo(
    () => [...BUILDER_PAGE_THEMES, ...customThemes],
    [customThemes],
  );

  const previewLogoHeader = useMemo(
    () => ({
      ...logoHeader,
      enabled: true,
      variant: draft.logoVariant,
      primaryColor: draft.palette.accent,
      secondaryColor: draft.palette.surface,
      accentColor: draft.palette.base,
      height: draft.scale.logoHeaderHeight,
      logoSize: draft.scale.logoSize,
      cornerRadius: draft.scale.radius + 4,
    }),
    [draft, logoHeader],
  );

  if (!open) return null;

  const selectedIsCustom = draft.custom === true;

  const selectTheme = (theme: PageThemeDefinition) => {
    setSelectedId(theme.id);
    setDraft(createThemeDraftFrom(theme));
  };

  const updateDraft = (
    updater: (theme: PageThemeDefinition) => PageThemeDefinition,
  ) => {
    setDraft((current) => normalizePageThemeDraft(updater(current)));
  };

  const saveCustomTheme = () => {
    const nextTheme = normalizePageThemeDraft({
      ...draft,
      id: selectedIsCustom ? draft.id : createCustomId(),
      custom: true,
      name: draft.name.trim() || "تم سفارشی",
    });

    const nextThemes = selectedIsCustom
      ? customThemes.map((theme) =>
          theme.id === nextTheme.id ? nextTheme : theme,
        )
      : [...customThemes, nextTheme];

    setCustomThemes(nextThemes);
    saveCustomPageThemes(nextThemes);
    setSelectedId(nextTheme.id);
    setDraft(nextTheme);
  };

  const deleteCustomTheme = () => {
    if (!selectedIsCustom) return;
    const nextThemes = customThemes.filter((theme) => theme.id !== draft.id);
    setCustomThemes(nextThemes);
    saveCustomPageThemes(nextThemes);
    const nextSelected = BUILDER_PAGE_THEMES[0];
    setSelectedId(nextSelected.id);
    setDraft(createThemeDraftFrom(nextSelected));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-500 flex items-end justify-center p-0 sm:items-center sm:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="page-theme-studio-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="بستن"
      />
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[28px] border border-neutral-200 bg-white shadow-2xl sm:rounded-[28px]">
        <header className="flex shrink-0 items-center gap-3 border-b border-neutral-100 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <HiOutlinePaintBrush size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="page-theme-studio-title"
              className="text-[16px] font-black text-neutral-900"
            >
              استودیو تم صفحه
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-neutral-400">
              انتخاب تم فقط پیش‌نمایش و داده‌های لوکال را تغییر می‌دهد؛ ذخیره
              نهایی با دکمه ذخیره صفحه انجام می‌شود.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200"
            aria-label="بستن"
          >
            <HiOutlineXMark size={18} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_390px]">
          <div className="min-h-0 overflow-y-auto p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {allThemes.map((theme) => {
                const active = selectedId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => selectTheme(theme)}
                    className={[
                      "group overflow-hidden rounded-2xl border bg-white p-3 text-right transition-all hover:-translate-y-0.5 hover:shadow-lg",
                      active
                        ? "border-neutral-900 ring-2 ring-neutral-900/10"
                        : "border-neutral-200 hover:border-neutral-300",
                    ].join(" ")}
                  >
                    <div
                      className="relative h-28 overflow-hidden rounded-xl"
                      style={getPageBackgroundStyle({
                        color: theme.palette.base,
                        image: "",
                        pattern: theme.backgroundPattern,
                      })}
                    >
                      <div
                        className="absolute inset-x-4 top-4 h-16 rounded-xl shadow-sm"
                        style={{ backgroundColor: theme.palette.surface }}
                      />
                      <div
                        className="absolute bottom-4 right-4 h-9 w-28 rounded-lg"
                        style={{ backgroundColor: theme.palette.accent }}
                      />
                      <div className="absolute left-4 top-4 flex gap-1.5">
                        {Object.values(theme.palette).map((color) => (
                          <span
                            key={color}
                            className="h-5 w-5 rounded-full border border-white/70 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {active ? (
                        <span className="absolute bottom-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                          <HiOutlineCheck size={16} />
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-black text-neutral-900">
                          {theme.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium text-neutral-400">
                          {theme.custom ? "تم شخصی" : "تم آماده"}
                        </p>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-500">
                        {theme.scale.title}px
                      </span>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  const next = normalizePageThemeDraft({
                    ...createThemeDraftFrom(BUILDER_PAGE_THEMES[0]),
                    id: createCustomId(),
                    name: "تم سفارشی",
                    custom: true,
                  });
                  setSelectedId(next.id);
                  setDraft(next);
                }}
                className="flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-neutral-500 transition hover:border-neutral-300 hover:bg-white"
              >
                <HiOutlinePlus size={24} />
                <span className="mt-2 text-[13px] font-bold">ساخت تم جدید</span>
              </button>
            </div>
          </div>

          <aside className="min-h-0 overflow-y-auto border-t border-neutral-100 bg-neutral-50/80 p-5 lg:border-r lg:border-t-0">
            <div className="space-y-5">
              <section className="rounded-2xl border border-neutral-200 bg-white p-4">
                <FieldLabel>نام تم</FieldLabel>
                <input
                  value={draft.name}
                  onChange={(event) =>
                    updateDraft((theme) => ({
                      ...theme,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] font-bold text-neutral-900 outline-none focus:bg-white focus:ring-2 focus:ring-neutral-100"
                />
              </section>

              <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
                <h3 className="text-[13px] font-black text-neutral-900">
                  رنگ‌ها
                </h3>
                <ColorField
                  label="پس‌زمینه صفحه"
                  value={draft.palette.base}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      palette: { ...theme.palette, base: value },
                    }))
                  }
                />
                <ColorField
                  label="سطح بلاک‌ها"
                  value={draft.palette.surface}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      palette: { ...theme.palette, surface: value },
                    }))
                  }
                />
                <ColorField
                  label="رنگ تاکید و دکمه"
                  value={draft.palette.accent}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      palette: { ...theme.palette, accent: value },
                    }))
                  }
                />
              </section>

              <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
                <h3 className="text-[13px] font-black text-neutral-900">
                  پترن پس‌زمینه
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {PAGE_BACKGROUND_PATTERNS.map((pattern) => {
                    const active = draft.backgroundPattern.id === pattern.id;
                    const previewPattern = createPageBackgroundPattern(
                      pattern.id,
                      {
                        color: draft.palette.accent,
                        secondaryColor:
                          pattern.defaultSecondaryColor ?? draft.palette.base,
                        opacity: pattern.defaultOpacity,
                        size: pattern.defaultSize,
                      },
                    );
                    return (
                      <button
                        key={pattern.id}
                        type="button"
                        onClick={() =>
                          updateDraft((theme) => ({
                            ...theme,
                            backgroundPattern: createPageBackgroundPattern(
                              pattern.id,
                              {
                                color: theme.palette.accent,
                                secondaryColor:
                                  pattern.defaultSecondaryColor ??
                                  theme.palette.base,
                                opacity: pattern.defaultOpacity,
                                size: pattern.defaultSize,
                              },
                            ),
                          }))
                        }
                        className={[
                          "overflow-hidden rounded-xl border bg-white text-right transition hover:border-neutral-300",
                          active
                            ? "border-neutral-900 ring-2 ring-neutral-900/10"
                            : "border-neutral-200",
                        ].join(" ")}
                      >
                        <span className="block h-12 overflow-hidden">
                          <PatternPreview
                            base={draft.palette.base}
                            pattern={previewPattern}
                          />
                        </span>
                        <span className="block truncate px-2 py-2 text-[10px] font-black text-neutral-600">
                          {pattern.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <ColorField
                  label="رنگ پترن"
                  value={draft.backgroundPattern.color}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      backgroundPattern: {
                        ...theme.backgroundPattern,
                        color: value,
                      },
                    }))
                  }
                />
                {supportsSecondPatternColor(draft.backgroundPattern.id) ? (
                  <ColorField
                    label="رنگ دوم گرادینت"
                    value={
                      draft.backgroundPattern.secondaryColor ||
                      draft.palette.base
                    }
                    onChange={(value) =>
                      updateDraft((theme) => ({
                        ...theme,
                        backgroundPattern: {
                          ...theme.backgroundPattern,
                          secondaryColor: value,
                        },
                      }))
                    }
                  />
                ) : null}
                <RangeField
                  label="شدت پترن"
                  min={0}
                  max={28}
                  value={Math.round(draft.backgroundPattern.opacity * 100)}
                  display={`${Math.round(draft.backgroundPattern.opacity * 100)}%`}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      backgroundPattern: {
                        ...theme.backgroundPattern,
                        opacity: value / 100,
                      },
                    }))
                  }
                />
                <RangeField
                  label="اندازه پترن"
                  min={10}
                  max={96}
                  value={draft.backgroundPattern.size}
                  display={`${draft.backgroundPattern.size}px`}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      backgroundPattern: {
                        ...theme.backgroundPattern,
                        size: value,
                      },
                    }))
                  }
                />
              </section>

              <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <h3 className="text-[13px] font-black text-neutral-900">
                  دستور ظاهر
                </h3>
                <SegmentedControl
                  label="سطح‌ها"
                  value={draft.recipe.surfaceMode}
                  options={SURFACE_MODE_OPTIONS}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      recipe: { ...theme.recipe, surfaceMode: value },
                    }))
                  }
                />
                <SegmentedControl
                  label="دکمه‌ها"
                  value={draft.recipe.buttonMode}
                  options={BUTTON_MODE_OPTIONS}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      recipe: { ...theme.recipe, buttonMode: value },
                    }))
                  }
                />
                <SegmentedControl
                  label="تراکم"
                  value={draft.recipe.density}
                  options={DENSITY_OPTIONS}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      recipe: { ...theme.recipe, density: value },
                    }))
                  }
                />
                <SegmentedControl
                  label="کنتراست"
                  value={draft.recipe.contrast}
                  options={CONTRAST_OPTIONS}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      recipe: { ...theme.recipe, contrast: value },
                    }))
                  }
                />
              </section>

              <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <h3 className="text-[13px] font-black text-neutral-900">
                  سایزها
                </h3>
                <NumberField
                  label="عنوان‌ها"
                  min={18}
                  max={38}
                  value={draft.scale.title}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      scale: { ...theme.scale, title: value },
                    }))
                  }
                />
                <NumberField
                  label="توضیحات"
                  min={11}
                  max={20}
                  value={draft.scale.description}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      scale: { ...theme.scale, description: value },
                    }))
                  }
                />
                <NumberField
                  label="آیتم‌ها"
                  min={10}
                  max={18}
                  value={draft.scale.item}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      scale: { ...theme.scale, item: value },
                    }))
                  }
                />
                <NumberField
                  label="دکمه‌ها"
                  min={11}
                  max={20}
                  value={draft.scale.button}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      scale: { ...theme.scale, button: value },
                    }))
                  }
                />
                <NumberField
                  label="گردی بلاک‌ها"
                  min={0}
                  max={48}
                  value={draft.scale.radius}
                  onChange={(value) =>
                    updateDraft((theme) => ({
                      ...theme,
                      scale: { ...theme.scale, radius: value },
                    }))
                  }
                />
              </section>

              <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
                <h3 className="text-[13px] font-black text-neutral-900">
                  هدر لوگو
                </h3>
                <select
                  value={draft.logoVariant}
                  onChange={(event) =>
                    updateDraft((theme) => ({
                      ...theme,
                      logoVariant: event.target
                        .value as PageThemeDefinition["logoVariant"],
                    }))
                  }
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[13px] font-bold text-neutral-800 outline-none focus:bg-white focus:ring-2 focus:ring-neutral-100"
                >
                  {LOGO_HEADER_VARIANTS.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.label}
                    </option>
                  ))}
                </select>
                <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
                  <LogoHeaderFrame
                    settings={previewLogoHeader}
                    logo={logo}
                    logoShape={logoShape}
                    title={title}
                    showPlaceholder
                  />
                </div>
              </section>
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-neutral-100 bg-white p-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-[13px] font-bold text-neutral-600 transition hover:bg-neutral-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={saveCustomTheme}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-3 text-[13px] font-bold text-neutral-700 transition hover:bg-neutral-100"
          >
            {selectedIsCustom ? "ذخیره تغییرات تم" : "ذخیره به عنوان تم شخصی"}
          </button>
          {selectedIsCustom ? (
            <button
              type="button"
              onClick={deleteCustomTheme}
              className="rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-[13px] font-bold text-red-600 transition hover:bg-red-100"
            >
              <span className="inline-flex items-center gap-2">
                <HiOutlineTrash size={15} />
                حذف تم
              </span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              onApply(normalizePageThemeDraft(draft));
            }}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 sm:mr-auto"
          >
            اعمال روی صفحه
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
