// ─────────────────────────────────────────────────────────────────
// components/ds/CustomSelect.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  borders,
  shadows,
  layout,
  animation,
  focus,
  interactive,
} from "@/lib/design/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";

/* ══════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════ */

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  group?: string;
  meta?: Record<string, unknown>;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (
    value: string | string[],
    option: SelectOption | SelectOption[],
  ) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  multiple?: boolean;
  clearable?: boolean;
  maxSelections?: number;
  renderValue?: (selected: SelectOption | SelectOption[]) => ReactNode;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
  emptyMessage?: string;
  noResultsMessage?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  position?: "bottom" | "top" | "auto";
  closeOnSelect?: boolean;
  name?: string;
  id?: string;
  onSearch?: (query: string) => Promise<SelectOption[]> | SelectOption[];
  onOpen?: () => void;
  onClose?: () => void;
  grouped?: boolean;
  maxDropdownHeight?: number;
  showSelectedCount?: boolean;
  creatable?: boolean;
  createLabel?: (query: string) => string;
  onCreateOption?: (query: string) => void;
}

export interface CustomSelectRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  clear: () => void;
  focus: () => void;
}

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function toPersianDigits(n: number | string): string {
  const p = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => p[parseInt(d)]);
}

/* ══════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════ */

const Icons = {
  ChevronDown: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className || "h-4 w-4"}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Search: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  X: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3.5 w-3.5"
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  ),
  Check: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Spinner: () => (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  ),
  Empty: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      className="h-8 w-8"
    >
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Plus: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  ),
};

/* ══════════════════════════════════════════════
   SIZE CONFIG
   ══════════════════════════════════════════════ */

const sizeConfig = {
  sm: {
    trigger: "h-9 px-3 text-xs",
    tag: "h-5 px-1.5 text-[10px]",
    option: "px-3 py-2 text-xs",
    search: "h-9 px-3 text-xs",
    icon: "h-3.5 w-3.5",
    gap: "gap-1.5",
  },
  md: {
    trigger: "h-10 px-3.5 text-sm",
    tag: "h-6 px-2 text-[11px]",
    option: "px-3.5 py-2.5 text-sm",
    search: "h-10 px-3.5 text-sm",
    icon: "h-4 w-4",
    gap: "gap-2",
  },
  lg: {
    trigger: "h-12 px-4 text-sm",
    tag: "h-7 px-2.5 text-xs",
    option: "px-4 py-3 text-sm",
    search: "h-11 px-4 text-sm",
    icon: "h-5 w-5",
    gap: "gap-2.5",
  },
};

/* ══════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════ */

const selectKeyframes = `
@keyframes select-dropdown-in{0%{opacity:0;transform:translateY(-6px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes select-dropdown-in-up{0%{opacity:0;transform:translateY(6px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes select-tag-in{0%{opacity:0;transform:scale(.85)}100%{opacity:1;transform:scale(1)}}
.select-dropdown-in{animation:select-dropdown-in .2s cubic-bezier(.22,1,.36,1) both}
.select-dropdown-in-up{animation:select-dropdown-in-up .2s cubic-bezier(.22,1,.36,1) both}
.select-tag-in{animation:select-tag-in .15s cubic-bezier(.22,1,.36,1) both}
`;

/* ══════════════════════════════════════════════
   THEME HOOK FOR SELECT
   ══════════════════════════════════════════════ */

function useSelectTheme() {
  const t = useThemeTokens();
  const { isDark } = useTheme();

  return {
    t,
    isDark,

    // Trigger
    triggerBg: t.inputBg,
    triggerBorder: t.borderInput,
    triggerBorderOpen: cn("border", t.borderAccent, "ring-2 ring-[#D4AF37]/15"),
    triggerBorderError: "border-red-500/40",
    triggerHover: t.borderAccentHover,
    triggerText: t.textPrimary,
    placeholderText: t.textDisabled,

    // Dropdown
    dropdownBg: t.dropdownBg,
    dropdownBorder: t.borderSubtle,
    dropdownShadow: t.dropdownShadow,
    dropdownDivider: t.divider,

    // Options
    optionText: t.textSecondary,
    optionTextSelected: t.textAccent,
    optionBgHover: t.hoverBg,
    optionBgSelected: t.activeBg,
    optionTextHover: isDark ? "text-white" : "text-[#1A1304]",
    optionDescText: t.textDisabled,
    optionDescSelected: isDark ? "text-[#D4AF37]/60" : "text-[#8A6A12]/60",

    // Tags
    tagBg: isDark ? "bg-[#D4AF37]/8" : "bg-[#D4AF37]/10",
    tagBorder: isDark ? "border-[#D4AF37]/20" : "border-[#D4AF37]/25",
    tagText: t.textAccent,
    tagRemoveHover: isDark ? "hover:bg-white/10" : "hover:bg-black/10",

    // Count badge
    countBg: isDark ? "bg-white/4" : "bg-black/4",
    countBorder: isDark ? "border-white/10" : "border-black/10",
    countText: t.textMuted,

    // Search
    searchBg: isDark ? "bg-white/3" : "bg-black/3",
    searchFocusBg: isDark ? "focus:bg-white/5" : "focus:bg-black/5",
    searchText: t.textPrimary,
    searchPlaceholder: t.textDisabled,

    // Check mark
    checkColor: t.textAccent,

    // Checkbox border
    checkboxBorder: isDark ? "border-white/15" : "border-black/15",
    checkboxBorderHighlight: isDark
      ? "border-[#D4AF37]/30"
      : "border-[#D4AF37]/40",

    // Spinner
    spinnerColor: t.textAccent,

    // Empty
    emptyText: t.textMuted,

    // Group header
    groupBg: isDark ? "bg-[#0B0905]/95" : "bg-white/95",
    groupBorder: isDark ? "border-white/4" : "border-black/4",
    groupText: t.textDisabled,

    // Clear button
    clearText: isDark ? "text-slate-500" : "text-[#A09070]",
    clearHover: "hover:text-red-400 hover:bg-red-500/10",

    // Footer
    footerText: t.textDisabled,
    footerClearText: "text-red-400/70 hover:text-red-400",

    // Warning
    warningText: isDark ? "text-amber-400/80" : "text-amber-600/80",

    // Create
    createText: t.textAccent,
    createHover: isDark ? "hover:bg-[#D4AF37]/6" : "hover:bg-[#D4AF37]/8",

    // Label
    labelText: t.textMuted,
    requiredStar: t.textAccent,

    // Helper
    helperText: t.textDisabled,
    errorText: t.textError,
  };
}

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */

const CustomSelect = forwardRef<CustomSelectRef, CustomSelectProps>(
  (
    {
      options: propOptions,
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = "انتخاب کنید…",
      label,
      helperText,
      error,
      required = false,
      disabled = false,
      loading = false,
      searchable = false,
      searchPlaceholder = "جستجو…",
      multiple = false,
      clearable = false,
      maxSelections,
      renderValue,
      renderOption,
      emptyMessage = "گزینه‌ای وجود ندارد",
      noResultsMessage = "نتیجه‌ای یافت نشد",
      size = "md",
      fullWidth = true,
      className,
      position = "auto",
      closeOnSelect,
      name,
      id,
      onSearch,
      onOpen,
      onClose: onCloseProp,
      grouped = false,
      maxDropdownHeight = 280,
      showSelectedCount = true,
      creatable = false,
      createLabel = (q) => `ایجاد «${q}»`,
      onCreateOption,
    },
    ref,
  ) => {
    const theme = useSelectTheme();
    const { t, isDark } = theme;

    /* ── State ── */
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [asyncOptions, setAsyncOptions] = useState<SelectOption[] | null>(
      null,
    );
    const [asyncLoading, setAsyncLoading] = useState(false);
    const [dropDirection, setDropDirection] = useState<"bottom" | "top">(
      "bottom",
    );

    const [internalValue, setInternalValue] = useState<string[]>(() => {
      if (defaultValue)
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      return [];
    });

    const isControlled = controlledValue !== undefined;
    const selectedValues: string[] = isControlled
      ? Array.isArray(controlledValue)
        ? controlledValue
        : controlledValue
          ? [controlledValue]
          : []
      : internalValue;

    /* ── Refs ── */
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sz = sizeConfig[size];
    const shouldCloseOnSelect = closeOnSelect ?? !multiple;

    /* ── Options ── */
    const baseOptions = asyncOptions ?? propOptions;

    const filteredOptions = useMemo(() => {
      if (!search.trim() || onSearch) return baseOptions;
      const q = search.toLowerCase();
      return baseOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          opt.value.toLowerCase().includes(q) ||
          opt.description?.toLowerCase().includes(q),
      );
    }, [baseOptions, search, onSearch]);

    const groupedOptions = useMemo(() => {
      if (!grouped) return null;
      const groups: Record<string, SelectOption[]> = {};
      const ungrouped: SelectOption[] = [];
      filteredOptions.forEach((opt) => {
        if (opt.group) {
          if (!groups[opt.group]) groups[opt.group] = [];
          groups[opt.group].push(opt);
        } else {
          ungrouped.push(opt);
        }
      });
      return { groups, ungrouped };
    }, [filteredOptions, grouped]);

    const selectableOptions = useMemo(
      () => filteredOptions.filter((o) => !o.disabled),
      [filteredOptions],
    );

    const selectedOptions = useMemo(
      () =>
        selectedValues
          .map((v) => propOptions.find((o) => o.value === v))
          .filter(Boolean) as SelectOption[],
      [selectedValues, propOptions],
    );

    /* ── Async search ── */
    useEffect(() => {
      if (!onSearch || !isOpen) return;
      setAsyncLoading(true);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await onSearch(search);
          setAsyncOptions(results);
        } catch {
          setAsyncOptions([]);
        } finally {
          setAsyncLoading(false);
        }
      }, 300);
      return () => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
      };
    }, [search, onSearch, isOpen]);

    /* ── Position ── */
    useEffect(() => {
      if (!isOpen || position !== "auto") {
        setDropDirection(position === "top" ? "top" : "bottom");
        return;
      }
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;
      setDropDirection(
        below < maxDropdownHeight + 20 && above > below ? "top" : "bottom",
      );
    }, [isOpen, position, maxDropdownHeight]);

    /* ── Click outside ── */
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target as Node)
        )
          closeDropdown();
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    /* ── Focus search ── */
    useEffect(() => {
      if (isOpen && searchable)
        setTimeout(() => searchRef.current?.focus(), 50);
    }, [isOpen, searchable]);

    useEffect(() => {
      setHighlightIndex(0);
    }, [search]);

    useEffect(() => {
      if (highlightIndex >= 0 && optionRefs.current[highlightIndex])
        optionRefs.current[highlightIndex]?.scrollIntoView({
          block: "nearest",
        });
    }, [highlightIndex]);

    /* ── Actions ── */
    const openDropdown = useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      setSearch("");
      setHighlightIndex(0);
      onOpen?.();
    }, [disabled, onOpen]);

    const closeDropdown = useCallback(() => {
      setIsOpen(false);
      setSearch("");
      setAsyncOptions(null);
      onCloseProp?.();
    }, [onCloseProp]);

    const toggleDropdown = useCallback(() => {
      if (isOpen) closeDropdown();
      else openDropdown();
    }, [isOpen, openDropdown, closeDropdown]);

    const clearValue = useCallback(() => {
      if (!isControlled) setInternalValue([]);
      onChange?.(multiple ? [] : "", multiple ? [] : ({} as SelectOption));
    }, [isControlled, multiple, onChange]);

    useImperativeHandle(ref, () => ({
      open: openDropdown,
      close: closeDropdown,
      toggle: toggleDropdown,
      clear: clearValue,
      focus: () => triggerRef.current?.focus(),
    }));

    /* ── Select handler ── */
    const handleSelect = useCallback(
      (opt: SelectOption) => {
        if (opt.disabled) return;
        if (multiple) {
          let newValues: string[];
          if (selectedValues.includes(opt.value)) {
            newValues = selectedValues.filter((v) => v !== opt.value);
          } else {
            if (maxSelections && selectedValues.length >= maxSelections) return;
            newValues = [...selectedValues, opt.value];
          }
          if (!isControlled) setInternalValue(newValues);
          const newOpts = newValues
            .map((v) => propOptions.find((o) => o.value === v))
            .filter(Boolean) as SelectOption[];
          onChange?.(newValues, newOpts);
        } else {
          if (!isControlled) setInternalValue([opt.value]);
          onChange?.(opt.value, opt);
        }
        if (shouldCloseOnSelect) closeDropdown();
      },
      [
        selectedValues,
        multiple,
        maxSelections,
        isControlled,
        propOptions,
        onChange,
        shouldCloseOnSelect,
        closeDropdown,
      ],
    );

    const removeTag = useCallback(
      (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newValues = selectedValues.filter((v) => v !== val);
        if (!isControlled) setInternalValue(newValues);
        const newOpts = newValues
          .map((v) => propOptions.find((o) => o.value === v))
          .filter(Boolean) as SelectOption[];
        onChange?.(newValues, newOpts);
      },
      [selectedValues, isControlled, propOptions, onChange],
    );

    const handleCreate = useCallback(() => {
      if (!search.trim()) return;
      onCreateOption?.(search.trim());
      setSearch("");
      if (shouldCloseOnSelect) closeDropdown();
    }, [search, onCreateOption, shouldCloseOnSelect, closeDropdown]);

    /* ── Keyboard ── */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            if (!isOpen) openDropdown();
            else
              setHighlightIndex((p) =>
                p < selectableOptions.length - 1 ? p + 1 : 0,
              );
            break;
          case "ArrowUp":
            e.preventDefault();
            if (!isOpen) openDropdown();
            else
              setHighlightIndex((p) =>
                p > 0 ? p - 1 : selectableOptions.length - 1,
              );
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (!isOpen) openDropdown();
            else if (highlightIndex >= 0 && selectableOptions[highlightIndex])
              handleSelect(selectableOptions[highlightIndex]);
            else if (creatable && search.trim()) handleCreate();
            break;
          case "Escape":
            e.preventDefault();
            closeDropdown();
            triggerRef.current?.focus();
            break;
          case "Backspace":
            if (multiple && !search && selectedValues.length > 0) {
              const newValues = selectedValues.slice(0, -1);
              if (!isControlled) setInternalValue(newValues);
              const newOpts = newValues
                .map((v) => propOptions.find((o) => o.value === v))
                .filter(Boolean) as SelectOption[];
              onChange?.(newValues, newOpts);
            }
            break;
          case "Tab":
            closeDropdown();
            break;
        }
      },
      [
        disabled,
        isOpen,
        highlightIndex,
        selectableOptions,
        selectedValues,
        multiple,
        search,
        isControlled,
        propOptions,
        onChange,
        openDropdown,
        closeDropdown,
        handleSelect,
        handleCreate,
        creatable,
      ],
    );

    /* ── Helpers ── */
    const isSelected = (val: string) => selectedValues.includes(val);
    const canShowClear = clearable && selectedValues.length > 0 && !disabled;
    const isLoading = loading || asyncLoading;

    /* ── Trigger content ── */
    const renderTriggerContent = () => {
      if (selectedOptions.length === 0) {
        return (
          <span className={cn("truncate", theme.placeholderText)}>
            {placeholder}
          </span>
        );
      }

      if (renderValue)
        return renderValue(multiple ? selectedOptions : selectedOptions[0]);

      if (multiple) {
        if (showSelectedCount && selectedOptions.length > 2) {
          return (
            <div className={cn("flex items-center flex-wrap", sz.gap)}>
              {selectedOptions.slice(0, 2).map((opt) => (
                <span
                  key={opt.value}
                  className={cn(
                    "select-tag-in inline-flex items-center gap-1 rounded-lg border",
                    theme.tagBg,
                    theme.tagBorder,
                    theme.tagText,
                    sz.tag,
                  )}
                >
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate max-w-[80px]">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => removeTag(opt.value, e)}
                    className={cn(
                      "shrink-0 rounded p-0.5 transition-colors",
                      theme.tagRemoveHover,
                    )}
                    aria-label={`حذف ${opt.label}`}
                  >
                    <Icons.X />
                  </button>
                </span>
              ))}
              <span
                className={cn(
                  "inline-flex items-center rounded-lg border",
                  theme.countBg,
                  theme.countBorder,
                  theme.countText,
                  sz.tag,
                )}
              >
                +{toPersianDigits(selectedOptions.length - 2)} مورد
              </span>
            </div>
          );
        }

        return (
          <div className={cn("flex items-center flex-wrap", sz.gap)}>
            {selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className={cn(
                  "select-tag-in inline-flex items-center gap-1 rounded-lg border",
                  theme.tagBg,
                  theme.tagBorder,
                  theme.tagText,
                  sz.tag,
                )}
              >
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span className="truncate max-w-25">{opt.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeTag(opt.value, e)}
                  className={cn(
                    "shrink-0 rounded p-0.5 transition-colors",
                    theme.tagRemoveHover,
                  )}
                  aria-label={`حذف ${opt.label}`}
                >
                  <Icons.X />
                </button>
              </span>
            ))}
          </div>
        );
      }

      // Single
      const opt = selectedOptions[0];
      return (
        <span
          className={cn("flex items-center gap-2 truncate", theme.triggerText)}
        >
          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
          <span className="truncate">{opt.label}</span>
        </span>
      );
    };

    /* ── Option item ── */
    const renderOptionItem = (opt: SelectOption, idx: number) => {
      const selected = isSelected(opt.value);
      const highlighted = idx === highlightIndex;

      if (renderOption) {
        return (
          <button
            key={opt.value}
            ref={(el) => {
              optionRefs.current[idx] = el;
            }}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={opt.disabled}
            onClick={() => handleSelect(opt)}
            onMouseEnter={() => setHighlightIndex(idx)}
            className={cn(
              "w-full text-right",
              sz.option,
              animation.colors,
              opt.disabled && "pointer-events-none opacity-40",
              highlighted && (isDark ? "bg-white/4" : "bg-black/4"),
            )}
          >
            {renderOption(opt, selected)}
          </button>
        );
      }

      return (
        <button
          key={opt.value}
          ref={(el) => {
            optionRefs.current[idx] = el;
          }}
          type="button"
          role="option"
          aria-selected={selected}
          disabled={opt.disabled}
          onClick={() => handleSelect(opt)}
          onMouseEnter={() => setHighlightIndex(idx)}
          className={cn(
            "flex w-full items-center text-right rounded-xl",
            sz.option,
            animation.colors,
            interactive.touch,
            opt.disabled && "pointer-events-none opacity-40",
            highlighted && !selected && (isDark ? "bg-white/4" : "bg-black/4"),
            selected && theme.optionBgSelected,
          )}
        >
          {opt.icon && (
            <span
              className={cn(
                "shrink-0 ml-2.5",
                selected ? theme.optionTextSelected : theme.optionDescText,
              )}
            >
              {opt.icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                "block truncate font-medium",
                selected ? theme.optionTextSelected : theme.optionText,
              )}
            >
              {opt.label}
            </span>
            {opt.description && (
              <span
                className={cn(
                  "block truncate mt-0.5 text-[10px] leading-tight",
                  selected ? theme.optionDescSelected : theme.optionDescText,
                )}
              >
                {opt.description}
              </span>
            )}
          </div>
          {selected && (
            <span className={cn("shrink-0 mr-2", theme.checkColor)}>
              <Icons.Check />
            </span>
          )}
          {multiple && !selected && (
            <span
              className={cn(
                "shrink-0 mr-2 flex h-4 w-4 items-center justify-center rounded border",
                highlighted
                  ? theme.checkboxBorderHighlight
                  : theme.checkboxBorder,
              )}
            />
          )}
        </button>
      );
    };

    /* ── Dropdown content ── */
    const renderDropdownContent = () => {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className={theme.spinnerColor}>
              <Icons.Spinner />
            </span>
            <span className={cn("text-xs", theme.emptyText)}>
              در حال بارگذاری…
            </span>
          </div>
        );
      }

      if (filteredOptions.length === 0 && !creatable) {
        return (
          <div
            className={cn(
              "flex flex-col items-center justify-center py-8 gap-2",
              theme.emptyText,
            )}
          >
            <Icons.Empty />
            <span className="text-xs">
              {search ? noResultsMessage : emptyMessage}
            </span>
          </div>
        );
      }

      let flatIndex = 0;

      if (grouped && groupedOptions) {
        return (
          <>
            {groupedOptions.ungrouped.map((opt) =>
              renderOptionItem(opt, flatIndex++),
            )}
            {Object.entries(groupedOptions.groups).map(([groupName, opts]) => (
              <div key={groupName}>
                <div
                  className={cn(
                    "sticky top-0 z-10 px-3.5 py-2 backdrop-blur-sm border-b",
                    theme.groupBg,
                    theme.groupBorder,
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      theme.groupText,
                    )}
                  >
                    {groupName}
                  </span>
                </div>
                {opts.map((opt) => renderOptionItem(opt, flatIndex++))}
              </div>
            ))}
            {creatable && search.trim() && (
              <button
                type="button"
                onClick={handleCreate}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl text-right",
                  sz.option,
                  theme.createText,
                  theme.createHover,
                  animation.colors,
                )}
              >
                <Icons.Plus />
                <span>{createLabel(search.trim())}</span>
              </button>
            )}
          </>
        );
      }

      return (
        <>
          {filteredOptions.map((opt, i) => renderOptionItem(opt, i))}
          {creatable &&
            search.trim() &&
            !filteredOptions.some((o) => o.label === search.trim()) && (
              <button
                type="button"
                onClick={handleCreate}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl text-right",
                  sz.option,
                  theme.createText,
                  theme.createHover,
                  animation.colors,
                )}
              >
                <Icons.Plus />
                <span>{createLabel(search.trim())}</span>
              </button>
            )}
        </>
      );
    };

    /* ══════════════════════════════════════════════
       RENDER
       ══════════════════════════════════════════════ */
    return (
      <>
        <style>{selectKeyframes}</style>

        <div
          ref={wrapperRef}
          dir="rtl"
          className={cn(
            "relative",
            fullWidth ? "w-full" : "w-auto inline-block",
            className,
          )}
          onKeyDown={handleKeyDown}
        >
          {name &&
            selectedValues.map((v) => (
              <input
                key={v}
                type="hidden"
                name={multiple ? `${name}[]` : name}
                value={v}
              />
            ))}

          {/* Label */}
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "mb-1.5 block text-xs font-semibold uppercase tracking-wider",
                theme.labelText,
              )}
            >
              {label}
              {required && (
                <span className={cn("mr-1", theme.requiredStar)}>*</span>
              )}
            </label>
          )}

          {/* Trigger */}
          <div
            ref={triggerRef as unknown as React.RefObject<HTMLDivElement>}
            id={id}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={label || placeholder}
            tabIndex={disabled ? -1 : 0}
            onClick={disabled ? undefined : toggleDropdown}
            onKeyDown={
              disabled
                ? undefined
                : (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleDropdown();
                    }
                  }
            }
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between rounded-xl border text-right outline-none select-none",
              theme.triggerBg,
              "backdrop-blur-sm",
              sz.trigger,
              error
                ? theme.triggerBorderError
                : isOpen
                  ? theme.triggerBorderOpen
                  : cn("border", theme.triggerBorder),
              !disabled && !error && theme.triggerHover,
              disabled && "pointer-events-none opacity-50 cursor-not-allowed",
              animation.base,
              focus.ring,
            )}
          >
            <div className="flex-1 min-w-0 truncate">
              {renderTriggerContent()}
            </div>
            <div className="flex items-center gap-1 shrink-0 mr-2">
              {isLoading && (
                <span className={theme.spinnerColor}>
                  <Icons.Spinner />
                </span>
              )}
              {canShowClear && !isLoading && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    clearValue();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      clearValue();
                    }
                  }}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer",
                    theme.clearText,
                    theme.clearHover,
                  )}
                  aria-label="پاک کردن"
                >
                  <Icons.X />
                </span>
              )}
              <Icons.ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  theme.clearText,
                  isOpen && cn("rotate-180", theme.checkColor),
                )}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className={cn("mt-1 text-[11px]", theme.errorText)}>{error}</p>
          )}

          {/* Helper */}
          {helperText && !error && (
            <p className={cn("mt-1 text-[11px]", theme.helperText)}>
              {helperText}
            </p>
          )}

          {/* Dropdown */}
          {isOpen && (
            <div
              role="listbox"
              aria-multiselectable={multiple}
              className={cn(
                "absolute z-[60] w-full overflow-hidden rounded-xl border",
                theme.dropdownBg,
                "border",
                theme.dropdownBorder,
                theme.dropdownShadow,
                dropDirection === "bottom"
                  ? "top-full mt-1.5 select-dropdown-in"
                  : "bottom-full mb-1.5 select-dropdown-in-up",
              )}
            >
              {/* Search */}
              {searchable && (
                <div
                  className={cn(
                    "relative border-b p-1.5",
                    "border",
                    theme.dropdownDivider,
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2",
                      theme.emptyText,
                    )}
                  >
                    <Icons.Search />
                  </span>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={cn(
                      "w-full rounded-lg border-0 pr-9 pl-3 outline-none",
                      theme.searchBg,
                      theme.searchText,
                      sz.search,
                      animation.base,
                      theme.searchFocusBg,
                    )}
                    style={{ ["--tw-placeholder-opacity" as string]: 1 }}
                    autoComplete="off"
                    aria-label="جستجو در گزینه‌ها"
                  />
                </div>
              )}

              {/* Max warning */}
              {multiple &&
                maxSelections &&
                selectedValues.length >= maxSelections && (
                  <div
                    className={cn(
                      "px-3.5 py-2 border-b",
                      "border",
                      theme.dropdownDivider,
                    )}
                  >
                    <span className={cn("text-[11px]", theme.warningText)}>
                      حداکثر {toPersianDigits(maxSelections)} گزینه قابل انتخاب
                      است
                    </span>
                  </div>
                )}

              {/* Options */}
              <div
                ref={listRef}
                className="overflow-y-auto p-1.5"
                style={{ maxHeight: maxDropdownHeight }}
              >
                {renderDropdownContent()}
              </div>

              {/* Footer */}
              {multiple && selectedValues.length > 0 && (
                <div
                  className={cn(
                    "flex items-center justify-between border-t px-3.5 py-2",
                    "border",
                    theme.dropdownDivider,
                  )}
                >
                  <span className={cn("text-[11px]", theme.footerText)}>
                    {toPersianDigits(selectedValues.length)} مورد انتخاب شده
                    {maxSelections && (
                      <span> از {toPersianDigits(maxSelections)}</span>
                    )}
                  </span>
                  {clearable && (
                    <button
                      type="button"
                      onClick={clearValue}
                      className={cn(
                        "text-[11px] transition-colors",
                        theme.footerClearText,
                      )}
                    >
                      پاک کردن همه
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);

CustomSelect.displayName = "CustomSelect";
export default CustomSelect;
