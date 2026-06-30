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
    trigger: "min-h-[36px] px-3 py-1.5 text-xs",
    tag: "h-5 px-1.5 text-[10px]",
    option: "px-3 py-2 text-xs",
    search: "h-9 px-3 text-xs",
    icon: "h-3.5 w-3.5",
    gap: "gap-1",
  },
  md: {
    trigger: "min-h-[44px] px-3.5 py-2 text-sm",
    tag: "h-6 px-2 text-[11px]",
    option: "px-3 py-2.5 text-sm",
    search: "h-10 px-3.5 text-sm",
    icon: "h-4 w-4",
    gap: "gap-1.5",
  },
  lg: {
    trigger: "min-h-[52px] px-4 py-2.5 text-sm",
    tag: "h-7 px-2.5 text-xs",
    option: "px-4 py-3 text-sm",
    search: "h-11 px-4 text-sm",
    icon: "h-5 w-5",
    gap: "gap-2",
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
   THEME HOOK
   ══════════════════════════════════════════════ */

function useSelectTheme() {
  const t = useThemeTokens();
  const { isDark } = useTheme();

  return {
    t,
    isDark,

    triggerBg: t.inputBg,
    triggerBorder: t.borderInput,
    triggerBorderOpen: isDark
      ? "border-[#c8a84b]/40 ring-1 ring-[#c8a84b]/20"
      : "border-[#8a7030]/40 ring-1 ring-[#8a7030]/20",
    triggerBorderError: "border-red-500/40 ring-1 ring-red-500/15",
    triggerHover: isDark
      ? "hover:border-[#c8a84b]/20"
      : "hover:border-[#8a7030]/20",
    triggerText: t.textPrimary,
    placeholderText: t.textDisabled,

    dropdownBg: t.dropdownBg,
    dropdownBorder: t.borderSubtle,
    dropdownShadow: t.dropdownShadow,
    dropdownDivider: t.divider,

    optionText: t.textSecondary,
    optionTextSelected: isDark ? "text-[#c8a84b]" : "text-[#8a7030]",
    optionBgHover: isDark ? "bg-white/[0.04]" : "bg-black/[0.03]",
    optionBgSelected: isDark ? "bg-[#c8a84b]/[0.06]" : "bg-[#8a7030]/[0.04]",
    optionTextHover: isDark ? "text-white" : "text-[#1A1304]",
    optionDescText: t.textDisabled,
    optionDescSelected: isDark ? "text-[#c8a84b]/60" : "text-[#8a7030]/60",

    tagBg: isDark ? "bg-[#c8a84b]/[0.08]" : "bg-[#8a7030]/[0.06]",
    tagBorder: isDark ? "border-[#c8a84b]/20" : "border-[#8a7030]/15",
    tagText: isDark ? "text-[#c8a84b]" : "text-[#8a7030]",
    tagRemoveHover: isDark
      ? "hover:bg-white/10 hover:text-red-400"
      : "hover:bg-black/8 hover:text-red-500",

    countBg: isDark ? "bg-white/[0.04]" : "bg-black/[0.03]",
    countBorder: isDark ? "border-white/10" : "border-black/8",
    countText: t.textMuted,

    searchBg: "bg-transparent",
    searchFocusBg: isDark ? "focus:bg-white/[0.03]" : "focus:bg-black/[0.02]",
    searchText: t.textPrimary,
    searchPlaceholder: t.textDisabled,
    searchBorder: t.borderSubtle,

    checkColor: isDark ? "text-[#c8a84b]" : "text-[#8a7030]",

    checkboxBorder: isDark ? "border-white/15" : "border-black/12",
    checkboxBorderHighlight: isDark
      ? "border-[#c8a84b]/30"
      : "border-[#8a7030]/25",
    checkboxChecked: isDark
      ? "border-[#c8a84b]/40 bg-[#c8a84b] text-[#111116]"
      : "border-[#8a7030]/40 bg-[#8a7030] text-white",

    spinnerColor: isDark ? "text-[#c8a84b]" : "text-[#8a7030]",

    emptyText: t.textMuted,

    groupBg: isDark
      ? "bg-[#0B0905]/95 backdrop-blur-sm"
      : "bg-white/95 backdrop-blur-sm",
    groupBorder: t.divider,
    groupText: t.textDisabled,

    clearText: t.textDisabled,
    clearHover: "hover:text-red-400 hover:bg-red-500/10",

    footerText: t.textDisabled,
    footerClearText: "text-red-400/70 hover:text-red-400",

    warningText: isDark ? "text-amber-400/80" : "text-amber-600/80",

    createText: isDark ? "text-[#c8a84b]" : "text-[#8a7030]",
    createHover: isDark
      ? "hover:bg-[#c8a84b]/[0.06]"
      : "hover:bg-[#8a7030]/[0.04]",

    labelText: t.textDisabled,
    requiredStar: isDark ? "text-[#c8a84b]" : "text-[#8a7030]",

    helperText: t.textDisabled,
    errorText: t.textError,

    scrollbar: t.scrollbar,
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
      maxDropdownHeight = 260,
      showSelectedCount = true,
      creatable = false,
      createLabel = (q) => `ایجاد «${q}»`,
      onCreateOption,
    },
    ref,
  ) => {
    const theme = useSelectTheme();
    const { t, isDark } = theme;

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

    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sz = sizeConfig[size];
    const shouldCloseOnSelect = closeOnSelect ?? !multiple;

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
            <div className={cn("flex flex-wrap items-center", sz.gap)}>
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
                  <span className="max-w-[80px] truncate">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => removeTag(opt.value, e)}
                    className={cn(
                      "shrink-0 rounded p-0.5 transition-colors duration-150",
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
          <div className={cn("flex flex-wrap items-center", sz.gap)}>
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
                <span className="max-w-[100px] truncate">{opt.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeTag(opt.value, e)}
                  className={cn(
                    "shrink-0 rounded p-0.5 transition-colors duration-150",
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
              "w-full text-right transition-colors duration-150",
              sz.option,
              opt.disabled && "pointer-events-none opacity-40",
              highlighted && theme.optionBgHover,
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
            "flex w-full items-center rounded-lg text-right transition-colors duration-150 touch-manipulation",
            sz.option,
            opt.disabled && "pointer-events-none opacity-40",
            highlighted && !selected && theme.optionBgHover,
            selected && theme.optionBgSelected,
          )}
        >
          {/* Checkbox or check icon */}
          {multiple ? (
            <span
              className={cn(
                "ml-2.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all duration-150",
                selected
                  ? theme.checkboxChecked
                  : highlighted
                    ? theme.checkboxBorderHighlight
                    : theme.checkboxBorder,
              )}
            >
              {selected && <Icons.Check />}
            </span>
          ) : null}

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
          <div className="min-w-0 flex-1">
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
                  "mt-0.5 block truncate text-[11px] leading-tight",
                  selected ? theme.optionDescSelected : theme.optionDescText,
                )}
              >
                {opt.description}
              </span>
            )}
          </div>
          {!multiple && selected && (
            <span className={cn("mr-2 shrink-0", theme.checkColor)}>
              <Icons.Check />
            </span>
          )}
        </button>
      );
    };

    /* ── Dropdown content ── */
    const renderDropdownContent = () => {
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
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
              "flex flex-col items-center justify-center gap-2 py-8",
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
                    "sticky top-0 z-10 border-b px-3 py-2",
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
                  "flex w-full items-center gap-2 rounded-lg text-right transition-colors duration-150",
                  sz.option,
                  theme.createText,
                  theme.createHover,
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
                  "flex w-full items-center gap-2 rounded-lg text-right transition-colors duration-150",
                  sz.option,
                  theme.createText,
                  theme.createHover,
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
            isOpen ? "z-[80]" : "z-0",
            fullWidth ? "w-full" : "inline-block w-auto",
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
              "group flex w-full cursor-pointer select-none items-center justify-between rounded-xl border text-right outline-none transition-all duration-200",
              theme.triggerBg,
              sz.trigger,
              error
                ? theme.triggerBorderError
                : isOpen
                  ? theme.triggerBorderOpen
                  : theme.triggerBorder,
              !disabled && !error && !isOpen && theme.triggerHover,
              disabled && "pointer-events-none cursor-not-allowed opacity-50",
              "focus-visible:outline-none focus-visible:ring-1",
              isDark
                ? "focus-visible:ring-[#c8a84b]/30"
                : "focus-visible:ring-[#8a7030]/30",
            )}
          >
            <div className="min-w-0 flex-1 truncate">
              {renderTriggerContent()}
            </div>
            <div className="mr-2 flex shrink-0 items-center gap-1">
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
                    "flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150",
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

          {/* Error / Helper */}
          {error && (
            <p
              className={cn(
                "mt-1.5 text-[11px] leading-tight",
                theme.errorText,
              )}
            >
              {error}
            </p>
          )}
          {helperText && !error && (
            <p
              className={cn(
                "mt-1.5 text-[11px] leading-tight",
                theme.helperText,
              )}
            >
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
                    "relative border-b px-1.5 py-1.5",
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
                      "w-full rounded-lg border-0 pr-9 pl-3 outline-none transition-all duration-200",
                      theme.searchBg,
                      theme.searchText,
                      theme.searchFocusBg,
                      sz.search,
                      isDark
                        ? "placeholder:text-[#47443e]"
                        : "placeholder:text-[#b0aa9e]",
                    )}
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
                    className={cn("border-b px-3 py-2", theme.dropdownDivider)}
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
                className={cn("overflow-y-auto p-1.5", theme.scrollbar)}
                style={{ maxHeight: maxDropdownHeight }}
              >
                {renderDropdownContent()}
              </div>

              {/* Footer */}
              {multiple && selectedValues.length > 0 && (
                <div
                  className={cn(
                    "flex items-center justify-between border-t px-3 py-2",
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
                        "text-[11px] transition-colors duration-150",
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
