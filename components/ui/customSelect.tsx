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

/* ══════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════ */

export interface SelectOption {
  /** Unique value */
  value: string;
  /** Display label */
  label: string;
  /** Optional description below label */
  description?: string;
  /** Optional icon or avatar */
  icon?: ReactNode;
  /** Disable this option */
  disabled?: boolean;
  /** Group header (non-selectable) */
  group?: string;
  /** Any extra data you want to pass */
  meta?: Record<string, unknown>;
}

export interface CustomSelectProps {
  /** Options list */
  options: SelectOption[];
  /** Currently selected value(s) */
  value?: string | string[];
  /** Default value(s) for uncontrolled mode */
  defaultValue?: string | string[];
  /** Callback on change */
  onChange?: (
    value: string | string[],
    option: SelectOption | SelectOption[],
  ) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label above the select */
  label?: string;
  /** Helper/description text below */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Enable search/filter in dropdown */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Allow clearing value */
  clearable?: boolean;
  /** Maximum selections for multiple mode */
  maxSelections?: number;
  /** Custom render for selected value display */
  renderValue?: (selected: SelectOption | SelectOption[]) => ReactNode;
  /** Custom render for each option */
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
  /** Empty state message when no options */
  emptyMessage?: string;
  /** No results message when search has no matches */
  noResultsMessage?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Full width */
  fullWidth?: boolean;
  /** Custom className for wrapper */
  className?: string;
  /** Dropdown position */
  position?: "bottom" | "top" | "auto";
  /** Close dropdown on select (for single mode, defaults true) */
  closeOnSelect?: boolean;
  /** Name for form submission */
  name?: string;
  /** id for accessibility */
  id?: string;
  /** Async search handler — return filtered options */
  onSearch?: (query: string) => Promise<SelectOption[]> | SelectOption[];
  /** Callback on open */
  onOpen?: () => void;
  /** Callback on close */
  onClose?: () => void;
  /** Group options by group field */
  grouped?: boolean;
  /** Max dropdown height */
  maxDropdownHeight?: number;
  /** Show selected count badge in multiple mode */
  showSelectedCount?: boolean;
  /** Allow creating new option */
  creatable?: boolean;
  /** Label for create option */
  createLabel?: (query: string) => string;
  /** Callback when creating new option */
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
      onClose,
      grouped = false,
      maxDropdownHeight = 280,
      showSelectedCount = true,
      creatable = false,
      createLabel = (q) => `ایجاد «${q}»`,
      onCreateOption,
    },
    ref,
  ) => {
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

    // Internal uncontrolled value
    const [internalValue, setInternalValue] = useState<string[]>(() => {
      if (defaultValue) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });

    // Determine controlled vs uncontrolled
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

    /* ── Options source ── */
    const baseOptions = asyncOptions ?? propOptions;

    /* ── Filtered options ── */
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

    /* ── Grouped options ── */
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

    /* ── Flat list for keyboard nav ── */
    const selectableOptions = useMemo(
      () => filteredOptions.filter((o) => !o.disabled),
      [filteredOptions],
    );

    /* ── Selected option objects ── */
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

    /* ── Position detection ── */
    useEffect(() => {
      if (!isOpen || position !== "auto") {
        if (position === "top") setDropDirection("top");
        else setDropDirection("bottom");
        return;
      }
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDropDirection(
        spaceBelow < maxDropdownHeight + 20 && spaceAbove > spaceBelow
          ? "top"
          : "bottom",
      );
    }, [isOpen, position, maxDropdownHeight]);

    /* ── Click outside ── */
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target as Node)
        ) {
          close();
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    /* ── Focus search on open ── */
    useEffect(() => {
      if (isOpen && searchable) {
        setTimeout(() => searchRef.current?.focus(), 50);
      }
    }, [isOpen, searchable]);

    /* ── Reset highlight on search ── */
    useEffect(() => {
      setHighlightIndex(0);
    }, [search]);

    /* ── Scroll highlighted into view ── */
    useEffect(() => {
      if (highlightIndex >= 0 && optionRefs.current[highlightIndex]) {
        optionRefs.current[highlightIndex]?.scrollIntoView({
          block: "nearest",
        });
      }
    }, [highlightIndex]);

    /* ── Actions ── */
    const open = useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      setSearch("");
      setHighlightIndex(0);
      onOpen?.();
    }, [disabled, onOpen]);

    const close = useCallback(() => {
      setIsOpen(false);
      setSearch("");
      setAsyncOptions(null);
      onClose?.();
    }, [onClose]);

    const toggle = useCallback(() => {
      if (isOpen) close();
      else open();
    }, [isOpen, open, close]);

    const clear = useCallback(() => {
      if (!isControlled) setInternalValue([]);
      onChange?.(multiple ? [] : "", multiple ? [] : ({} as SelectOption));
    }, [isControlled, multiple, onChange]);

    /* ── Imperative handle ── */
    useImperativeHandle(ref, () => ({
      open,
      close,
      toggle,
      clear,
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
          const newOptions = newValues
            .map((v) => propOptions.find((o) => o.value === v))
            .filter(Boolean) as SelectOption[];
          onChange?.(newValues, newOptions);
        } else {
          if (!isControlled) setInternalValue([opt.value]);
          onChange?.(opt.value, opt);
        }

        if (shouldCloseOnSelect) close();
      },
      [
        selectedValues,
        multiple,
        maxSelections,
        isControlled,
        propOptions,
        onChange,
        shouldCloseOnSelect,
        close,
      ],
    );

    /* ── Remove tag (multiple) ── */
    const removeTag = useCallback(
      (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newValues = selectedValues.filter((v) => v !== val);
        if (!isControlled) setInternalValue(newValues);
        const newOptions = newValues
          .map((v) => propOptions.find((o) => o.value === v))
          .filter(Boolean) as SelectOption[];
        onChange?.(newValues, newOptions);
      },
      [selectedValues, isControlled, propOptions, onChange],
    );

    /* ── Create option ── */
    const handleCreate = useCallback(() => {
      if (!search.trim()) return;
      onCreateOption?.(search.trim());
      setSearch("");
      if (shouldCloseOnSelect) close();
    }, [search, onCreateOption, shouldCloseOnSelect, close]);

    /* ── Keyboard ── */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            if (!isOpen) {
              open();
            } else {
              setHighlightIndex((prev) =>
                prev < selectableOptions.length - 1 ? prev + 1 : 0,
              );
            }
            break;
          case "ArrowUp":
            e.preventDefault();
            if (!isOpen) {
              open();
            } else {
              setHighlightIndex((prev) =>
                prev > 0 ? prev - 1 : selectableOptions.length - 1,
              );
            }
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (!isOpen) {
              open();
            } else if (
              highlightIndex >= 0 &&
              selectableOptions[highlightIndex]
            ) {
              handleSelect(selectableOptions[highlightIndex]);
            } else if (creatable && search.trim()) {
              handleCreate();
            }
            break;
          case "Escape":
            e.preventDefault();
            close();
            triggerRef.current?.focus();
            break;
          case "Backspace":
            if (multiple && !search && selectedValues.length > 0) {
              const lastVal = selectedValues[selectedValues.length - 1];
              const newValues = selectedValues.slice(0, -1);
              if (!isControlled) setInternalValue(newValues);
              const newOptions = newValues
                .map((v) => propOptions.find((o) => o.value === v))
                .filter(Boolean) as SelectOption[];
              onChange?.(newValues, newOptions);
            }
            break;
          case "Tab":
            close();
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
        open,
        close,
        handleSelect,
        handleCreate,
        creatable,
      ],
    );

    /* ── Render helpers ── */
    const isSelected = (val: string) => selectedValues.includes(val);
    const canShowClear = clearable && selectedValues.length > 0 && !disabled;
    const isLoading = loading || asyncLoading;

    const renderTriggerContent = () => {
      if (selectedOptions.length === 0) {
        return <span className="text-slate-500 truncate">{placeholder}</span>;
      }

      if (renderValue) {
        return renderValue(multiple ? selectedOptions : selectedOptions[0]);
      }

      if (multiple) {
        if (showSelectedCount && selectedOptions.length > 2) {
          return (
            <div className={cn("flex items-center flex-wrap", sz.gap)}>
              {selectedOptions.slice(0, 2).map((opt) => (
                <span
                  key={opt.value}
                  className={cn(
                    "select-tag-in inline-flex items-center gap-1 rounded-lg border",
                    "bg-[#D4AF37]/8 border-[#D4AF37]/20 text-[#F5D76E]",
                    sz.tag,
                  )}
                >
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate max-w-[80px]">{opt.label}</span>
                  <button
                    type="button"
                    onClick={(e) => removeTag(opt.value, e)}
                    className="shrink-0 rounded p-0.5 hover:bg-white/10 transition-colors"
                    aria-label={`حذف ${opt.label}`}
                  >
                    <Icons.X />
                  </button>
                </span>
              ))}
              <span
                className={cn(
                  "inline-flex items-center rounded-lg border",
                  "bg-white/4 border-white/10 text-slate-400",
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
                  "bg-[#D4AF37]/8 border-[#D4AF37]/20 text-[#F5D76E]",
                  sz.tag,
                )}
              >
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span className="truncate max-w-25">{opt.label}</span>
                <button
                  type="button"
                  onClick={(e) => removeTag(opt.value, e)}
                  className="shrink-0 rounded p-0.5 hover:bg-white/10 transition-colors"
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
        <span className="flex items-center gap-2 truncate text-white">
          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
          <span className="truncate">{opt.label}</span>
        </span>
      );
    };

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
              highlighted && "bg-white/4",
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
            highlighted && !selected && "bg-white/4",
            selected && "bg-[#D4AF37]/8",
          )}
        >
          {/* Icon / Avatar */}
          {opt.icon && (
            <span
              className={cn(
                "shrink-0 ml-2.5",
                selected ? "text-[#F5D76E]" : "text-slate-400",
              )}
            >
              {opt.icon}
            </span>
          )}

          {/* Label + Description */}
          <div className="flex-1 min-w-0">
            <span
              className={cn(
                "block truncate font-medium",
                selected ? "text-[#F5D76E]" : "text-slate-200",
              )}
            >
              {opt.label}
            </span>
            {opt.description && (
              <span
                className={cn(
                  "block truncate mt-0.5",
                  "text-[10px] leading-tight",
                  selected ? "text-[#D4AF37]/60" : "text-slate-500",
                )}
              >
                {opt.description}
              </span>
            )}
          </div>

          {/* Check */}
          {selected && (
            <span className="shrink-0 text-[#F5D76E] mr-2">
              <Icons.Check />
            </span>
          )}

          {/* Multiple checkbox visual */}
          {multiple && !selected && (
            <span
              className={cn(
                "shrink-0 mr-2 flex h-4 w-4 items-center justify-center rounded border",
                highlighted ? "border-[#D4AF37]/30" : "border-white/15",
              )}
            />
          )}
        </button>
      );
    };

    /* ── Render dropdown content ── */
    const renderDropdownContent = () => {
      // Loading state
      if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Icons.Spinner />
            <span className="text-xs text-slate-500">در حال بارگذاری…</span>
          </div>
        );
      }

      // Empty state
      if (filteredOptions.length === 0 && !creatable) {
        return (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-500">
            <Icons.Empty />
            <span className="text-xs">
              {search ? noResultsMessage : emptyMessage}
            </span>
          </div>
        );
      }

      let flatIndex = 0;

      // Grouped rendering
      if (grouped && groupedOptions) {
        return (
          <>
            {/* Ungrouped items first */}
            {groupedOptions.ungrouped.map((opt) => {
              const idx = flatIndex++;
              return renderOptionItem(opt, idx);
            })}

            {/* Groups */}
            {Object.entries(groupedOptions.groups).map(([groupName, opts]) => (
              <div key={groupName}>
                {/* Group header */}
                <div
                  className={cn(
                    "sticky top-0 z-10 px-3.5 py-2",
                    "bg-[#0B0905]/95 backdrop-blur-sm",
                    "border-b border-white/4",
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {groupName}
                  </span>
                </div>
                {opts.map((opt) => {
                  const idx = flatIndex++;
                  return renderOptionItem(opt, idx);
                })}
              </div>
            ))}

            {/* Creatable */}
            {creatable && search.trim() && (
              <button
                type="button"
                onClick={handleCreate}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl text-right",
                  sz.option,
                  "text-[#F5D76E] hover:bg-[#D4AF37]/6",
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

      // Flat rendering
      return (
        <>
          {filteredOptions.map((opt, i) => renderOptionItem(opt, i))}

          {/* Creatable */}
          {creatable &&
            search.trim() &&
            !filteredOptions.some((o) => o.label === search.trim()) && (
              <button
                type="button"
                onClick={handleCreate}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl text-right",
                  sz.option,
                  "text-[#F5D76E] hover:bg-[#D4AF37]/6",
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
          {/* Hidden inputs for form submission */}
          {name &&
            selectedValues.map((v) => (
              <input
                key={v}
                type="hidden"
                name={multiple ? `${name}[]` : name}
                value={v}
              />
            ))}

          {/* ── Label ── */}
          {label && (
            <label
              htmlFor={id}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              {label}
              {required && <span className="mr-1 text-[#D4AF37]">*</span>}
            </label>
          )}

          {/* ── Trigger Button ── */}
          <div
            ref={triggerRef as unknown as React.RefObject<HTMLDivElement>}
            id={id}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={label || placeholder}
            tabIndex={disabled ? -1 : 0}
            onClick={disabled ? undefined : toggle}
            onKeyDown={
              disabled
                ? undefined
                : (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle();
                    }
                  }
            }
            className={cn(
              "group flex w-full cursor-pointer items-center justify-between rounded-xl border text-right outline-none select-none",
              "bg-white/[0.035] backdrop-blur-sm",
              sz.trigger,
              error
                ? "border-red-500/40"
                : isOpen
                  ? "border-[#D4AF37]/30 ring-2 ring-[#D4AF37]/15"
                  : borders.subtle,
              !disabled && !error && "hover:border-[#D4AF37]/18",
              disabled && "pointer-events-none opacity-50 cursor-not-allowed",
              animation.base,
              focus.ring,
            )}
          >
            {/* Value display */}
            <div className="flex-1 min-w-0 truncate">
              {renderTriggerContent()}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 shrink-0 mr-2">
              {/* Loading */}
              {isLoading && (
                <span className="text-[#D4AF37]">
                  <Icons.Spinner />
                </span>
              )}

              {/* Clear */}
              {canShowClear && !isLoading && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    clear();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      clear();
                    }
                  }}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md",
                    "text-slate-500 hover:text-red-400 hover:bg-red-500/10",
                    "transition-colors duration-150 cursor-pointer",
                  )}
                  aria-label="پاک کردن"
                >
                  <Icons.X />
                </span>
              )}

              {/* Chevron */}
              <Icons.ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-500 transition-transform duration-200",
                  isOpen && "rotate-180 text-[#D4AF37]",
                )}
              />
            </div>
          </div>

          {/* ── Error ── */}
          {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}

          {/* ── Helper Text ── */}
          {helperText && !error && (
            <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
          )}

          {/* ── Dropdown ── */}
          {isOpen && (
            <div
              role="listbox"
              aria-multiselectable={multiple}
              className={cn(
                "absolute z-[60] w-full overflow-hidden",
                layout.radius.md,
                borders.light,
                "bg-[#0B0905]/98 backdrop-blur-2xl",
                shadows.card,
                dropDirection === "bottom"
                  ? "top-full mt-1.5 select-dropdown-in"
                  : "bottom-full mb-1.5 select-dropdown-in-up",
              )}
            >
              {/* Search bar */}
              {searchable && (
                <div className="relative border-b border-white/6 p-1.5">
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Icons.Search />
                  </span>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={cn(
                      "w-full rounded-lg border-0 bg-white/3 pr-9 pl-3 text-white placeholder-slate-500 outline-none",
                      sz.search,
                      animation.base,
                      "focus:bg-white/5",
                    )}
                    autoComplete="off"
                    aria-label="جستجو در گزینه‌ها"
                  />
                </div>
              )}

              {/* Max selections warning */}
              {multiple &&
                maxSelections &&
                selectedValues.length >= maxSelections && (
                  <div className="px-3.5 py-2 border-b border-white/4">
                    <span className="text-[11px] text-amber-400/80">
                      حداکثر {toPersianDigits(maxSelections)} گزینه قابل انتخاب
                      است
                    </span>
                  </div>
                )}

              {/* Options list */}
              <div
                ref={listRef}
                className="overflow-y-auto p-1.5"
                style={{ maxHeight: maxDropdownHeight }}
              >
                {renderDropdownContent()}
              </div>

              {/* Footer: selected count */}
              {multiple && selectedValues.length > 0 && (
                <div className="flex items-center justify-between border-t border-white/6 px-3.5 py-2">
                  <span className="text-[11px] text-slate-500">
                    {toPersianDigits(selectedValues.length)} مورد انتخاب شده
                    {maxSelections && (
                      <span> از {toPersianDigits(maxSelections)}</span>
                    )}
                  </span>
                  {clearable && (
                    <button
                      type="button"
                      onClick={clear}
                      className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
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
