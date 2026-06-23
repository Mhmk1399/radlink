// components/ds/DynamicTable.tsx
"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  HiMiniEye,
  HiMiniPencilSquare,
  HiMiniTrash,
  HiMiniPlus,
  HiMiniMagnifyingGlass,
  HiMiniChevronUp,
  HiMiniChevronDown,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniXMark,
  HiMiniExclamationTriangle,
  HiMiniArrowDownTray,
  HiMiniPhoto,
  HiMiniFunnel,
  HiMiniCheck,
  HiMiniCalendarDays,
  HiMiniArrowPath,
  HiMiniExclamationCircle,
  HiMiniDocumentDuplicate,
  HiMiniClipboardDocumentCheck,
} from "react-icons/hi2";
import { LuPackage } from "react-icons/lu";
import {
  
  animation,
  focus,
 
} from "@/lib/design/tokens";
import { useAccess } from "@/hook/auth/useAccess";
import { getAccessTargetForRequest } from "@/lib/auth/accessRules";
import CustomSelect from "../ui/customSelect";
import {
  useTableData,
  type ServerPaginationParams,
} from "@/hook/table/useTableData";
import { useDebounce } from "@/hook/table/useDebounce";
import { usePullToRefresh } from "@/hook/table/usePullToRefresh";
import { useCopyToClipboard } from "@/hook/table/useCopyToClipboard";
import {
  ColumnDef,
  DateRange,
  DynamicTableProps,
  ModalMode,
  SortDir,
} from "@/types/table";
import { useTheme } from "@/contexts/ThemeContext";
import type { CSSProperties } from "react";

/* ══════════════════════════════════════════════
   THEME TOKENS — soft, eye-friendly palette
   ══════════════════════════════════════════════

   Dark  → warm charcoal base (#1a1a1f) not pure black
           muted warm-gold accents, lower contrast
   Light → warm ivory/cream (#faf8f5) not pure white
           rich bronze accents, gentle shadows
   ══════════════════════════════════════════════ */

const themeTokens = {
  dark: {
    // ── Surfaces ──────────────────────────────
    pageBg: "bg-[#141418]",
    cardBg: "bg-[#1c1c22]",
    cardBgHover: "hover:bg-[#22222a]",
    inputBg: "bg-[#1e1e26]",
    modalBg: "bg-[#1a1a20]",
    dropdownBg: "bg-[#1e1e26]/98 backdrop-blur-xl",
    hoverBg: "hover:bg-[#ffffff08]",
    activeBg: "bg-[#c9a84c]/8",
    selectedBg: "bg-[#c9a84c]/[0.04]",

    // ── Text ──────────────────────────────────
    textPrimary: "text-[#e8e6e3]",
    textSecondary: "text-[#9e9a93]",
    textMuted: "text-[#706c65]",
    textDisabled: "text-[#4a4740]",
    textAccent: "text-[#d4b863]",
    textError: "text-[#e87c7c]",
    textOnAccent: "text-[#1a1a1f]",

    // ── Borders ───────────────────────────────
    borderSubtle: "border-[#2a2a32]",
    borderInput: "border-[#2e2e38]",
    borderAccent: "border-[#c9a84c]/20",
    borderHover: "hover:border-[#3a3a44]",
    divider: "border-[#2a2a32]/60",

    // ── Shadows ───────────────────────────────
    cardShadow: "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.4)]",
    dropdownShadow: "shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",

    // ── Accent shades ─────────────────────────
    accentSoft: "bg-[#c9a84c]/6",
    accentMedium: "bg-[#c9a84c]/10",
    accentGradient:
      "bg-gradient-to-r from-[#a0833a] via-[#c9a84c] to-[#dfc06a]",
    accentText: "#d4b863",
    accentBorder: "#c9a84c",

    // ── Status ────────────────────────────────
    successBg: "bg-[#2a6e4e]/12",
    successText: "text-[#6ec99a]",
    errorBg: "bg-[#8c3a3a]/12",
    errorText: "text-[#e87c7c]",
    warningBg: "bg-[#8c6e2a]/12",
    warningText: "text-[#d4b863]",
  },

  light: {
    // ── Surfaces ──────────────────────────────
    pageBg: "bg-[#f8f6f1]",
    cardBg: "bg-white",
    cardBgHover: "hover:bg-[#fafaf8]",
    inputBg: "bg-[#f5f3ee]",
    modalBg: "bg-white",
    dropdownBg: "bg-white/98 backdrop-blur-xl",
    hoverBg: "hover:bg-[#00000006]",
    activeBg: "bg-[#8a7032]/6",
    selectedBg: "bg-[#8a7032]/[0.03]",

    // ── Text ──────────────────────────────────
    textPrimary: "text-[#2c2a25]",
    textSecondary: "text-[#6b665c]",
    textMuted: "text-[#9e9788]",
    textDisabled: "text-[#c4bfb4]",
    textAccent: "text-[#7a6428]",
    textError: "text-[#c44040]",
    textOnAccent: "text-white",

    // ── Borders ───────────────────────────────
    borderSubtle: "border-[#e8e4dc]",
    borderInput: "border-[#ddd9d0]",
    borderAccent: "border-[#8a7032]/20",
    borderHover: "hover:border-[#ccc7bc]",
    divider: "border-[#e8e4dc]/70",

    // ── Shadows ───────────────────────────────
    cardShadow: "shadow-[0_1px_8px_-2px_rgba(0,0,0,0.06)]",
    dropdownShadow: "shadow-[0_6px_24px_-6px_rgba(0,0,0,0.1)]",

    // ── Accent shades ─────────────────────────
    accentSoft: "bg-[#8a7032]/5",
    accentMedium: "bg-[#8a7032]/8",
    accentGradient: "bg-[#8a7032]",
    accentText: "#7a6428",
    accentBorder: "#8a7032",

    // ── Status ────────────────────────────────
    successBg: "bg-[#e6f5ed]",
    successText: "text-[#2d7a50]",
    errorBg: "bg-[#fce8e8]",
    errorText: "text-[#c44040]",
    warningBg: "bg-[#f5f0e0]",
    warningText: "text-[#8a7032]",
  },
} as const;

/* ══════════════════════════════════════════════
   DATEPICKER CUSTOM STYLES
   ══════════════════════════════════════════════ */

const datePickerStyles = `
.rmdp-container { direction: rtl !important; }
.rmdp-wrapper {
  position: fixed !important;
}
.rmdp-wrapper,
.rmdp-shadow {
  background: var(--dt-bg) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid var(--dt-border) !important;
  border-radius: 16px !important;
  box-shadow: var(--dt-shadow) !important;
  padding: 12px !important;
  font-family: inherit !important;
}
.rmdp-header {
  padding: 6px 4px 12px !important;
  border-bottom: 1px solid var(--dt-divider) !important;
  margin-bottom: 8px !important;
}
.rmdp-header-values {
  color: var(--dt-header) !important;
  font-weight: 700 !important;
  font-size: 14px !important;
}
.rmdp-header-values span {
  padding: 4px 10px !important;
  border-radius: 8px !important;
  transition: background 0.2s !important;
}
.rmdp-header-values span:hover {
  background: var(--dt-hover-bg) !important;
}
.rmdp-arrow-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 10px !important;
  background: var(--dt-soft-bg) !important;
  border: 1px solid var(--dt-soft-border) !important;
  transition: all 0.2s !important;
}
.rmdp-arrow-container:hover {
  background: var(--dt-hover-bg) !important;
  border-color: var(--dt-hover-border) !important;
}
.rmdp-arrow-container .rmdp-arrow {
  border-color: var(--dt-muted) !important;
  width: 8px !important;
  height: 8px !important;
  margin: 0 !important;
  padding: 0 !important;
}
.rmdp-arrow-container:hover .rmdp-arrow {
  border-color: var(--dt-header) !important;
}
.rmdp-week-day {
  color: var(--dt-muted) !important;
  font-size: 11px !important;
  font-weight: 600 !important;
}
.rmdp-day {
  width: 38px !important;
  height: 38px !important;
}
.rmdp-day span {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--dt-text) !important;
  border-radius: 10px !important;
  transition: all 0.15s !important;
  width: 34px !important;
  height: 34px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  inset: 2px !important;
}
.rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover {
  background: var(--dt-hover-bg) !important;
  color: var(--dt-header) !important;
  border: 1px solid var(--dt-hover-border) !important;
}
.rmdp-today span {
  background: var(--dt-today-bg) !important;
  color: var(--dt-header) !important;
  border: 1px solid var(--dt-hover-border) !important;
  font-weight: 700 !important;
}
.rmdp-selected span,
.rmdp-day.rmdp-selected span {
  background: var(--dt-selected-bg) !important;
  color: var(--dt-selected-text) !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 8px -2px var(--dt-selected-shadow) !important;
  border: none !important;
}
.rmdp-range {
  background: var(--dt-range-bg) !important;
  box-shadow: none !important;
}
.rmdp-range span { color: var(--dt-header) !important; }
.rmdp-range.start span,
.rmdp-range.end span {
  background: var(--dt-range-edge-bg) !important;
  color: var(--dt-selected-text) !important;
  font-weight: 700 !important;
}
.rmdp-disabled span,
.rmdp-day.rmdp-disabled span { color: var(--dt-disabled) !important; }
.rmdp-deactive span { color: var(--dt-disabled) !important; }
.rmdp-month-picker,
.rmdp-year-picker { background: var(--dt-bg) !important; border-radius: 12px !important; }
.rmdp-month-picker .rmdp-day span,
.rmdp-year-picker .rmdp-day span { font-size: 12px !important; border-radius: 8px !important; }
.rmdp-month-picker .rmdp-day.rmdp-selected span,
.rmdp-year-picker .rmdp-day.rmdp-selected span {
  background: var(--dt-range-edge-bg) !important;
  color: var(--dt-selected-text) !important;
}
.rmdp-range-label { display: none !important; }
.rmdp-action-button {
  border-radius: 10px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  padding: 6px 16px !important;
}
.rmdp-ep-arrow, .rmdp-ep-arrow::after { display: none !important; }
.rmdp-border-top { border-top: 1px solid var(--dt-divider) !important; }
.rmdp-panel-body li {
  background: var(--dt-range-bg) !important;
  border: 1px solid var(--dt-hover-border) !important;
  border-radius: 8px !important;
  color: var(--dt-header) !important;
  font-size: 12px !important;
}
.rmdp-input {
  background: transparent !important;
  border: none !important;
  color: inherit !important;
  font: inherit !important;
  padding: 0 !important;
  width: 100% !important;
  outline: none !important;
}
`;

function getDatePickerVariables(isDark: boolean): CSSProperties {
  return {
    ["--dt-bg" as string]: isDark ? "#1e1e26" : "#ffffff",
    ["--dt-border" as string]: isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.08)",
    ["--dt-divider" as string]: isDark
      ? "rgba(255,255,255,0.05)"
      : "rgba(0,0,0,0.06)",
    ["--dt-header" as string]: isDark ? "#d4b863" : "#7a6428",
    ["--dt-muted" as string]: isDark
      ? "rgba(158,154,147,0.6)"
      : "rgba(107,102,92,0.6)",
    ["--dt-text" as string]: isDark ? "#e8e6e3" : "#2c2a25",
    ["--dt-soft-bg" as string]: isDark
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.03)",
    ["--dt-soft-border" as string]: isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.06)",
    ["--dt-hover-bg" as string]: isDark
      ? "rgba(201,168,76,0.08)"
      : "rgba(138,112,50,0.06)",
    ["--dt-hover-border" as string]: isDark
      ? "rgba(201,168,76,0.16)"
      : "rgba(138,112,50,0.16)",
    ["--dt-today-bg" as string]: isDark
      ? "rgba(201,168,76,0.06)"
      : "rgba(138,112,50,0.06)",
    ["--dt-selected-bg" as string]: isDark ? "#c9a84c" : "#8a7032",
    ["--dt-selected-text" as string]: isDark ? "#1a1a1f" : "#ffffff",
    ["--dt-selected-shadow" as string]: isDark
      ? "rgba(201,168,76,0.3)"
      : "rgba(138,112,50,0.2)",
    ["--dt-range-bg" as string]: isDark
      ? "rgba(201,168,76,0.06)"
      : "rgba(138,112,50,0.06)",
    ["--dt-range-edge-bg" as string]: isDark ? "#c9a84c" : "#8a7032",
    ["--dt-disabled" as string]: isDark
      ? "rgba(158,154,147,0.2)"
      : "rgba(160,154,140,0.3)",
    ["--dt-shadow" as string]: isDark
      ? "0 12px 40px -12px rgba(0,0,0,0.5)"
      : "0 8px 30px -8px rgba(0,0,0,0.1)",
  } as CSSProperties;
}

/* ══════════════════════════════════════════════
   TABLE THEME HOOK
   ══════════════════════════════════════════════ */

function useTableTheme() {
  const { isDark } = useTheme();
  const t = isDark ? themeTokens.dark : themeTokens.light;

  return {
    t,
    isDark,

    tableCard: cn(
      "overflow-hidden rounded-2xl border",
      t.borderSubtle,
      t.cardBg,
      t.cardShadow,
    ),

    fieldBase: cn(
      "w-full rounded-xl border outline-none",
      "transition-all duration-200",
      t.borderInput,
      t.inputBg,
      t.textPrimary,
      isDark ? "placeholder:text-[#5a574f]" : "placeholder:text-[#b0aa9e]",
      t.borderHover,
      focus.ring,
    ),

    fieldError: isDark ? "border-[#c44040]/40" : "border-[#c44040]/30",

    fieldLabel: cn(
      "text-xs font-semibold uppercase tracking-wider",
      t.textMuted,
    ),

    fieldHelp: cn("text-[11px]", t.textDisabled),
    fieldErrorText: cn("text-[11px]", t.textError),

    checkboxBase: cn(
      "h-4 w-4 rounded transition-all duration-200",
      isDark
        ? "border-[#3a3a44] bg-[#1e1e26]"
        : "border-[#ddd9d0] bg-[#f5f3ee]",
      focus.ring,
    ),

    checkboxLabel: t.textSecondary,
    modalCard: cn("border", t.borderSubtle, t.modalBg, t.cardShadow),
    panel: cn("border", t.borderSubtle, t.dropdownBg, t.dropdownShadow),
    input: cn("border", t.borderInput, t.inputBg),

    ghostButton: cn(
      "inline-flex items-center justify-center gap-2 rounded-xl border px-4 h-9 text-xs font-medium transition-all duration-200",
      t.borderSubtle,
      t.inputBg,
      t.textSecondary,
      t.hoverBg,
      isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
      focus.ring,
    ),

    primaryButton: cn(
      "inline-flex items-center justify-center gap-2 rounded-xl px-4 h-9 text-xs font-semibold transition-all duration-200",
      focus.ring,
      isDark
        ? "bg-[#c9a84c] text-[#1a1a1f] hover:bg-[#d4b863]"
        : "bg-[#8a7032] text-white hover:bg-[#7a6428]",
    ),

    iconButton: cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
      t.borderSubtle,
      t.inputBg,
      t.textMuted,
      t.hoverBg,
      isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
      focus.ring,
    ),

    stickyHead: cn(
      isDark ? "bg-[#1c1c22]/97" : "bg-white/97",
      "backdrop-blur-xl",
    ),

    rowHover: isDark ? "hover:bg-[#ffffff04]" : "hover:bg-[#00000003]",
    rowSelected: t.selectedBg,

    cardSection: cn(
      "rounded-2xl border",
      t.cardBg,
      t.borderSubtle,
      t.cardShadow,
    ),
  };
}

/* ══════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════ */

const Icon = {
  Eye: () => <HiMiniEye className="h-4 w-4" />,
  Edit: () => <HiMiniPencilSquare className="h-4 w-4" />,
  Trash: () => <HiMiniTrash className="h-4 w-4" />,
  Plus: () => <HiMiniPlus className="h-4 w-4" />,
  Search: () => <HiMiniMagnifyingGlass className="h-4 w-4" />,
  ChevronUp: () => <HiMiniChevronUp className="h-3.5 w-3.5" />,
  ChevronDown: () => <HiMiniChevronDown className="h-3.5 w-3.5" />,
  ChevronLeft: () => <HiMiniChevronLeft className="h-4 w-4" />,
  ChevronRight: () => <HiMiniChevronRight className="h-4 w-4" />,
  X: () => <HiMiniXMark className="h-5 w-5" />,
  AlertTriangle: () => <HiMiniExclamationTriangle className="h-6 w-6" />,
  Empty: () => <LuPackage className="h-12 w-12" />,
  Download: () => <HiMiniArrowDownTray className="h-4 w-4" />,
  Image: () => <HiMiniPhoto className="h-4 w-4" />,
  Filter: () => <HiMiniFunnel className="h-4 w-4" />,
  Check: () => <HiMiniCheck className="h-4 w-4" />,
  Calendar: () => <HiMiniCalendarDays className="h-4 w-4" />,
  Refresh: () => <HiMiniArrowPath className="h-4 w-4" />,
  AlertCircle: () => <HiMiniExclamationCircle className="h-5 w-5" />,
  Copy: () => <HiMiniDocumentDuplicate className="h-3.5 w-3.5" />,
  CopyDone: () => <HiMiniClipboardDocumentCheck className="h-3.5 w-3.5" />,
};

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function getNestedValue(obj: object, key: string): unknown {
  return key.split(".").reduce((o, k) => {
    if (o && typeof o === "object") return (o as Record<string, unknown>)[k];
    return undefined;
  }, obj as unknown);
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  if (value instanceof Date) return value.toLocaleDateString("fa-IR");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

function toPersianDigits(n: number | string): string {
  const pd = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => pd[parseInt(d)]);
}

function parsePersianDate(val: unknown): DateObject | null {
  if (!val) return null;
  if (val instanceof Date)
    return new DateObject({ date: val, calendar: persian, locale: persian_fa });
  if (val instanceof DateObject)
    return new DateObject(val).convert(persian, persian_fa);
  const str = String(val);
  const nativeDate = new Date(str);
  if (
    !Number.isNaN(nativeDate.getTime()) &&
    (str.includes("T") || /^\d{4}-\d{2}-\d{2}/.test(str))
  )
    return new DateObject({
      date: nativeDate,
      calendar: persian,
      locale: persian_fa,
    });
  const latin = str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const match = latin.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (!match) return null;
  try {
    const year = parseInt(match[1]);
    if (year > 1700)
      return new DateObject({
        date: new Date(year, parseInt(match[2]) - 1, parseInt(match[3])),
        calendar: persian,
        locale: persian_fa,
      });
    return new DateObject({
      year,
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      calendar: persian,
      locale: persian_fa,
    });
  } catch {
    return null;
  }
}

function formatDateForPicker(value: unknown) {
  return parsePersianDate(value)?.format("YYYY/MM/DD") ?? "";
}

function dateObjectToIsoString(date: DateObject) {
  const nativeDate = date.toDate();
  return Number.isNaN(nativeDate.getTime())
    ? date.format("YYYY/MM/DD")
    : nativeDate.toISOString();
}

/* ── Export Utilities ── */

function exportToCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDef<T>[],
  fileName: string,
) {
  const BOM = "\uFEFF";
  const headers = columns.map((c) => c.label).join(",");
  const csvRows = rows.map((row) =>
    columns
      .map((col) => {
        const str = formatCellValue(getNestedValue(row, col.key)).replace(
          /"/g,
          '""',
        );
        return `"${str}"`;
      })
      .join(","),
  );
  downloadBlob(
    new Blob([BOM + [headers, ...csvRows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    }),
    `${fileName}.csv`,
  );
}

function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDef<T>[],
  fileName: string,
) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>td,th{font-family:Tahoma;font-size:11pt;text-align:right;direction:rtl;padding:6px 10px;border:1px solid #ddd}th{background:#2c2a25;color:#d4b863;font-weight:bold}tr:nth-child(even){background:#f9f9f9}</style></head><body dir="rtl"><table><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr>${rows.map((row) => `<tr>${columns.map((col) => `<td>${formatCellValue(getNestedValue(row, col.key))}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
  downloadBlob(
    new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }),
    `${fileName}.xls`,
  );
}

async function exportToPNG<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDef<T>[],
  fileName: string,
) {
  const cp = 12,
    hh = 44,
    rh = 38,
    fs = 13;
  const cw = columns.map((col) => {
    const hl = col.label.length;
    const ml = rows.reduce(
      (m, r) => Math.max(m, formatCellValue(getNestedValue(r, col.key)).length),
      0,
    );
    return Math.max(hl, ml) * 9 + cp * 2 + 20;
  });
  const tw = Math.max(
    cw.reduce((a, b) => a + b, 0),
    600,
  );
  const th = hh + rows.length * rh + 20;
  const canvas = document.createElement("canvas");
  const s = 2;
  canvas.width = tw * s;
  canvas.height = th * s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(s, s);
  // Softer dark background
  ctx.fillStyle = "#1c1c22";
  ctx.fillRect(0, 0, tw, th);
  ctx.fillStyle = "#22222a";
  ctx.fillRect(0, 0, tw, hh);
  ctx.strokeStyle = "rgba(201,168,76,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hh);
  ctx.lineTo(tw, hh);
  ctx.stroke();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#d4b863";
  ctx.font = `bold ${fs}px Tahoma,sans-serif`;
  let xo = tw - 10;
  columns.forEach((col, ci) => {
    ctx.fillText(col.label, xo - 8, hh / 2);
    xo -= cw[ci];
  });
  rows.forEach((row, ri) => {
    const y = hh + ri * rh;
    if (ri % 2 === 1) {
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      ctx.fillRect(0, y, tw, rh);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.moveTo(0, y + rh);
    ctx.lineTo(tw, y + rh);
    ctx.stroke();
    ctx.fillStyle = "#9e9a93";
    ctx.font = `${fs}px Tahoma,sans-serif`;
    let cx = tw - 10;
    columns.forEach((col, ci) => {
      const v = formatCellValue(getNestedValue(row, col.key));
      ctx.fillText(
        v.length > 30 ? v.slice(0, 30) + "…" : v,
        cx - 8,
        y + rh / 2,
      );
      cx -= cw[ci];
    });
  });
  ctx.strokeStyle = "rgba(201,168,76,0.1)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, tw, th);
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, `${fileName}.png`);
  }, "image/png");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════ */

function Overlay({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6",
        isDark
          ? "bg-[#0a0a0e]/70 backdrop-blur-sm"
          : "bg-[#2c2a25]/30 backdrop-blur-sm",
      )}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="پنجره مودال"
      dir="rtl"
    >
      <div
        role="document"
        className={cn(
          "relative w-full",
          wide ? "max-w-2xl" : "max-w-lg",
          "rounded-2xl border",
          isDark
            ? "border-[#2a2a32] bg-[#1a1a20]"
            : "border-[#e8e4dc] bg-white",
          isDark
            ? "shadow-[0_16px_50px_-12px_rgba(0,0,0,0.6)]"
            : "shadow-[0_16px_50px_-12px_rgba(0,0,0,0.12)]",
          "transform transition-all duration-300",
          "animate-[fade-up_.35s_cubic-bezier(.22,1,.36,1)_both]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  title,
  variant = "default",
  children,
}: {
  onClick: () => void;
  title: string;
  variant?: "default" | "danger";
  children: ReactNode;
}) {
  const { t, isDark } = useTableTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg",
        "transition-all duration-200 touch-manipulation",
        focus.ring,
        "active:scale-[0.95]",
        variant === "danger"
          ? isDark
            ? "text-[#e87c7c]/60 hover:bg-[#c44040]/10 hover:text-[#e87c7c]"
            : "text-[#c44040]/50 hover:bg-[#c44040]/6 hover:text-[#c44040]"
          : cn(
              t.textMuted,
              t.hoverBg,
              isDark ? "hover:text-[#d4b863]" : "hover:text-[#7a6428]",
            ),
      )}
    >
      {children}
    </button>
  );
}

function PaginationBtn({
  onClick,
  disabled,
  active,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { t, isDark } = useTableTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium",
        "transition-all duration-200 touch-manipulation",
        focus.ring,
        disabled && "pointer-events-none opacity-30",
        active
          ? cn("border", t.borderAccent, t.activeBg, t.textAccent)
          : cn(
              "border border-transparent",
              t.textMuted,
              t.hoverBg,
              isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
            ),
      )}
    >
      {children}
    </button>
  );
}

function FilterDropdown({
  label,
  options,
  optionLabels,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  optionLabels?: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t, panel, isDark } = useTableTheme();
  const getOptionLabel = (option: string) => optionLabels?.[option] ?? option;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`فیلتر ${label}`}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium",
          "transition-all duration-200",
          value
            ? cn(t.borderAccent, t.textAccent, t.inputBg)
            : cn(t.borderInput, t.inputBg, t.textMuted),
          focus.ring,
          t.hoverBg,
          isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
        )}
      >
        <Icon.Filter />
        <span>{label}</span>
        {value && (
          <span
            className={cn(
              "mr-1 rounded-full px-1.5 py-0.5 text-[10px]",
              t.activeBg,
              t.textAccent,
            )}
          >
            {getOptionLabel(value)}
          </span>
        )}
        <Icon.ChevronDown />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`گزینه‌های ${label}`}
          className={cn(
            "absolute top-full right-0 z-50 mt-1 min-w-40 overflow-hidden rounded-xl",
            panel,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-xs text-right transition-colors duration-200",
              !value
                ? cn(t.activeBg, t.textAccent)
                : cn(
                    t.textMuted,
                    t.hoverBg,
                    isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
                  ),
            )}
          >
            <span className="flex-1">همه</span>
            {!value && <Icon.Check />}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-xs text-right transition-colors duration-200",
                value === opt
                  ? cn(t.activeBg, t.textAccent)
                  : cn(
                      t.textMuted,
                      t.hoverBg,
                      isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
                    ),
              )}
            >
              <span className="flex-1">{getOptionLabel(opt)}</span>
              {value === opt && <Icon.Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateRangeFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const { isDark } = useTheme();
  const hasRange = value.from || value.to;
  const formatRange = () => {
    if (!value.from && !value.to) return "";
    return `${value.from?.format("YYYY/MM/DD") ?? "..."} – ${value.to?.format("YYYY/MM/DD") ?? "..."}`;
  };

  return (
    <div className="relative">
      <DatePicker
        value={
          value.from && value.to
            ? [value.from, value.to]
            : value.from
              ? [value.from]
              : undefined
        }
        onChange={(dates) => {
          if (Array.isArray(dates))
            onChange({
              from: dates[0] ? new DateObject(dates[0]) : null,
              to: dates[1] ? new DateObject(dates[1]) : null,
            });
          else onChange({ from: null, to: null });
        }}
        range
        rangeHover
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        fixMainPosition
        arrow={false}
        numberOfMonths={1}
        render={(val, openCalendar) => (
          <button
            type="button"
            onClick={openCalendar}
            aria-label={`فیلتر تاریخ ${label}`}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium",
              "transition-all duration-200",
              isDark ? "bg-[#1e1e26]" : "bg-[#f5f3ee]",
              hasRange
                ? isDark
                  ? "border-[#c9a84c]/20 text-[#d4b863]"
                  : "border-[#8a7032]/20 text-[#7a6428]"
                : isDark
                  ? "border-[#2e2e38] text-[#706c65]"
                  : "border-[#ddd9d0] text-[#9e9788]",
              focus.ring,
              isDark
                ? "hover:border-[#3a3a44] hover:text-[#9e9a93]"
                : "hover:border-[#ccc7bc] hover:text-[#6b665c]",
              "max-w-70",
            )}
          >
            <Icon.Calendar />
            <span className="whitespace-nowrap">{label}</span>
            {hasRange && (
              <span
                className={cn(
                  "mr-1 max-w-35 truncate whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px]",
                  isDark
                    ? "bg-[#c9a84c]/8 text-[#d4b863]"
                    : "bg-[#8a7032]/6 text-[#7a6428]",
                )}
              >
                {formatRange()}
              </span>
            )}
            <Icon.ChevronDown />
          </button>
        )}
      />
      {hasRange && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange({ from: null, to: null });
          }}
          aria-label="پاک کردن فیلتر تاریخ"
          className={cn(
            "absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-150",
            isDark
              ? "bg-[#c44040]/15 text-[#e87c7c] hover:bg-[#c44040]/25"
              : "bg-[#c44040]/8 text-[#c44040] hover:bg-[#c44040]/15",
          )}
        >
          <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5">
            <path d="M3.404 3.404a.55.55 0 01.778 0L6 5.222l1.818-1.818a.55.55 0 01.778.778L6.778 6l1.818 1.818a.55.55 0 11-.778.778L6 6.778 4.182 8.596a.55.55 0 11-.778-.778L5.222 6 3.404 4.182a.55.55 0 010-.778z" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ExportMenu({
  onExportExcel,
  onExportPNG,
  onExportCSV,
  selectedCount,
}: {
  onExportExcel: (s: boolean) => void;
  onExportPNG: (s: boolean) => void;
  onExportCSV: (s: boolean) => void;
  selectedCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t, isDark, panel } = useTableTheme();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const items = [
    {
      label: "خروجی اکسل (همه)",
      icon: <Icon.Download />,
      action: () => {
        onExportExcel(false);
        setOpen(false);
      },
    },
    ...(selectedCount > 0
      ? [
          {
            label: `خروجی اکسل (${toPersianDigits(selectedCount)} انتخاب شده)`,
            icon: <Icon.Download />,
            action: () => {
              onExportExcel(true);
              setOpen(false);
            },
          },
        ]
      : []),
    {
      label: "خروجی CSV (همه)",
      icon: <Icon.Download />,
      action: () => {
        onExportCSV(false);
        setOpen(false);
      },
    },
    ...(selectedCount > 0
      ? [
          {
            label: `خروجی CSV (${toPersianDigits(selectedCount)} انتخاب شده)`,
            icon: <Icon.Download />,
            action: () => {
              onExportCSV(true);
              setOpen(false);
            },
          },
        ]
      : []),
    {
      label: "خروجی تصویر PNG (همه)",
      icon: <Icon.Image />,
      action: () => {
        onExportPNG(false);
        setOpen(false);
      },
    },
    ...(selectedCount > 0
      ? [
          {
            label: `خروجی تصویر PNG (${toPersianDigits(selectedCount)} انتخاب شده)`,
            icon: <Icon.Image />,
            action: () => {
              onExportPNG(true);
              setOpen(false);
            },
          },
        ]
      : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="منوی خروجی"
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all duration-200",
          t.borderSubtle,
          t.inputBg,
          t.textSecondary,
          t.hoverBg,
          isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
          focus.ring,
        )}
      >
        <Icon.Download />
        <span>خروجی</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="فرمت‌های خروجی"
          className={cn(
            "absolute top-full left-0 z-50 mt-1 min-w-55 overflow-hidden rounded-xl",
            panel,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={item.action}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-xs text-right transition-colors duration-200",
                t.textMuted,
                t.hoverBg,
                isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PageSizeSelector({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (size: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t, panel, isDark } = useTableTheme();

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`تعداد ردیف در هر صفحه: ${toPersianDigits(value)}`}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium",
          "transition-all duration-200",
          t.borderInput,
          t.inputBg,
          t.textMuted,
          t.hoverBg,
          isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
          focus.ring,
        )}
      >
        <span>{toPersianDigits(value)} ردیف</span>
        <Icon.ChevronDown />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="تعداد ردیف"
          className={cn(
            "absolute bottom-full right-0 z-50 mb-1 min-w-25 overflow-hidden rounded-xl",
            panel,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          {options.map((size) => (
            <button
              key={size}
              type="button"
              role="option"
              aria-selected={value === size}
              onClick={() => {
                onChange(size);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-xs transition-colors duration-200",
                value === size
                  ? cn(t.activeBg, t.textAccent)
                  : cn(
                      t.textMuted,
                      t.hoverBg,
                      isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
                    ),
              )}
            >
              <span>{toPersianDigits(size)} ردیف</span>
              {value === size && <Icon.Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorBanner({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const { isDark } = useTheme();
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 mb-3",
        isDark
          ? "border-[#c44040]/15 bg-[#c44040]/6"
          : "border-[#c44040]/12 bg-[#fce8e8]",
      )}
    >
      <div className={isDark ? "text-[#e87c7c]" : "text-[#c44040]"}>
        <Icon.AlertCircle />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            isDark ? "text-[#e87c7c]" : "text-[#c44040]",
          )}
        >
          خطا در دریافت داده
        </p>
        <p
          className={cn(
            "text-xs truncate mt-0.5",
            isDark ? "text-[#e87c7c]/60" : "text-[#c44040]/60",
          )}
        >
          {error.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        aria-label="تلاش مجدد برای دریافت داده"
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-200",
          isDark
            ? "border-[#c44040]/20 text-[#e87c7c] hover:bg-[#c44040]/10"
            : "border-[#c44040]/15 text-[#c44040] hover:bg-[#c44040]/6",
          focus.ring,
        )}
      >
        <Icon.Refresh />
        تلاش مجدد
      </button>
    </div>
  );
}

function CopyToast({ visible }: { visible: boolean }) {
  const { isDark } = useTheme();
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-200 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 border",
        isDark
          ? "bg-[#1c1c22]/97 border-[#2a2a32] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]"
          : "bg-white/97 border-[#e8e4dc] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]",
        "backdrop-blur-xl",
        "animate-[fade-up_.3s_cubic-bezier(.22,1,.36,1)_both]",
      )}
    >
      <div className={isDark ? "text-[#6ec99a]" : "text-[#2d7a50]"}>
        <Icon.CopyDone />
      </div>
      <span
        className={cn(
          "text-xs font-medium",
          isDark ? "text-[#e8e6e3]" : "text-[#2c2a25]",
        )}
      >
        کپی شد!
      </span>
    </div>
  );
}

function PullIndicator({
  distance,
  isRefreshing,
  threshold,
}: {
  distance: number;
  isRefreshing: boolean;
  threshold: number;
}) {
  const { isDark } = useTheme();
  if (distance <= 0 && !isRefreshing) return null;
  const progress = Math.min(distance / threshold, 1);
  const rotation = progress * 360;
  return (
    <div
      role="status"
      aria-label={isRefreshing ? "در حال بارگذاری" : "برای بارگذاری مجدد بکشید"}
      className="flex justify-center py-3 transition-all duration-200"
      style={{
        height: isRefreshing ? 48 : Math.max(0, distance * 0.6),
        opacity: Math.min(progress, 1),
      }}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          isDark
            ? "bg-[#c9a84c]/8 border border-[#c9a84c]/15 text-[#d4b863]"
            : "bg-[#8a7032]/6 border border-[#8a7032]/12 text-[#7a6428]",
          isRefreshing && "animate-spin",
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <Icon.Refresh />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function DynamicTable<T extends Record<string, unknown>>({
  endpoint,
  columns,
  title,
  subtitle,
  onCreate,
  onUpdate,
  onDelete,
  canCreate: requestedCanCreate = true,
  canUpdate: requestedCanUpdate = true,
  canDelete: requestedCanDelete = true,
  primaryKey = "id" as keyof T & string,
  pageSize: initialPageSize = 10,
  pageSizes = [10, 25, 50, 100],
  searchable = true,
  searchDebounceMs = 300,
  emptyMessage = "داده‌ای یافت نشد",
  rowActions,
  exportable = true,
  exportFileName = "export",
  stickyHeader = true,
  showRowNumbers = false,
  doubleClickToEdit = true,
  enableCellCopy = true,
  pullToRefresh: enablePullToRefresh = true,
  serverSide = false,
  transformPaginatedResponse,
  fetcher,
  transformResponse,
  headers,
  updateMethod = "PUT",
  swrConfig,
  enabled = true,
  onError,
  data: staticData,
}: DynamicTableProps<T>) {
  const { can, isLoading: accessLoading, isError: accessError } = useAccess();

  const canUseEndpointAction = useCallback(
    (method: string) => {
      const target = getAccessTargetForRequest(endpoint, method);
      if (!target) return true;
      if (accessLoading || accessError) return false;
      return can(target.component, target.action);
    },
    [accessError, accessLoading, can, endpoint],
  );

  const canCreate = requestedCanCreate && canUseEndpointAction("POST");
  const canUpdate =
    requestedCanUpdate && canUseEndpointAction(updateMethod || "PATCH");
  const canDelete = requestedCanDelete && canUseEndpointAction("DELETE");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(initialPageSize);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRanges, setDateRanges] = useState<Record<string, DateRange>>({});
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const debouncedSearch = useDebounce(search, searchDebounceMs);
  const { copied, copiedCell, copy } = useCopyToClipboard();

  const {
    t,
    isDark,
    tableCard,
    fieldBase,
    fieldError,
    fieldLabel,
    fieldHelp,
    fieldErrorText,
    checkboxBase,
    checkboxLabel,
    primaryButton,
    iconButton,
    stickyHead,
    rowHover,
    rowSelected,
    ghostButton,
  } = useTableTheme();

  const datePickerVars = useMemo(
    () => getDatePickerVariables(isDark),
    [isDark],
  );

  const serverPaginationParams = useMemo<
    ServerPaginationParams | undefined
  >(() => {
    if (!serverSide) return undefined;
    return {
      page,
      pageSize: currentPageSize,
      search: debouncedSearch || undefined,
      sortKey: sortKey || undefined,
      sortDir: (sortDir as "asc" | "desc") || undefined,
      filters: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    };
  }, [
    serverSide,
    page,
    currentPageSize,
    debouncedSearch,
    sortKey,
    sortDir,
    filters,
  ]);

  const {
    data: fetchedData,
    isLoading,
    isValidating,
    error: fetchError,
    mutate,
    create: hookCreate,
    update: hookUpdate,
    remove: hookRemove,
    serverTotal,
    serverTotalPages,
  } = useTableData<T>({
    endpoint,
    fetcher,
    transformResponse,
    headers,
    swrConfig,
    enabled: enabled && !staticData,
    serverSide,
    serverPaginationParams,
    transformPaginatedResponse,
    updateMethod,
  });

  const data = staticData ?? fetchedData;
  const loading = !staticData && isLoading;

  const {
    containerRef: pullRef,
    pullDistance,
    isPulling,
    isRefreshing,
  } = usePullToRefresh({
    onRefresh: async () => {
      await mutate();
    },
    enabled: enablePullToRefresh && !staticData,
    threshold: 80,
  });

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);
  useEffect(() => {
    if (fetchError && onError) onError(fetchError);
  }, [fetchError, onError]);

  const visibleCols = useMemo(
    () => columns.filter((c) => c.visible !== false),
    [columns],
  );
  const editableCols = useMemo(
    () => columns.filter((c) => c.editable !== false && !c.isPrimary),
    [columns],
  );
  const viewableCols = useMemo(
    () => columns.filter((c) => c.viewable !== false),
    [columns],
  );
  const filterableCols = useMemo(
    () => columns.filter((c) => c.filterable),
    [columns],
  );
  const dateFilterCols = useMemo(
    () => columns.filter((c) => c.dateFilter),
    [columns],
  );

  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    filterableCols.forEach((col) => {
      if (col.options?.length) {
        opts[col.key] = col.options.map((option) => option.value);
        return;
      }
      const s = new Set<string>();
      data.forEach((row) => {
        const v = getNestedValue(row, col.key);
        if (v != null) s.add(String(v));
      });
      opts[col.key] = Array.from(s).sort();
    });
    return opts;
  }, [data, filterableCols]);

  const filterOptionLabels = useMemo(() => {
    const labels: Record<string, Record<string, string>> = {};
    filterableCols.forEach((col) => {
      if (!col.options?.length) return;
      labels[col.key] = Object.fromEntries(
        col.options.map((option) => [option.value, option.label]),
      );
    });
    return labels;
  }, [filterableCols]);

  const activeFiltersCount = useMemo(
    () =>
      Object.values(filters).filter(Boolean).length +
      Object.values(dateRanges).filter((r) => r.from || r.to).length,
    [filters, dateRanges],
  );

  const filtered = useMemo(() => {
    if (serverSide) return data;
    let items = [...data];
    Object.entries(filters).forEach(([key, val]) => {
      if (val)
        items = items.filter((row) => {
          const cv = getNestedValue(row, key);
          return cv != null && String(cv) === val;
        });
    });
    Object.entries(dateRanges).forEach(([key, range]) => {
      if (!range.from && !range.to) return;
      items = items.filter((row) => {
        const cd = parsePersianDate(getNestedValue(row, key));
        if (!cd) return false;
        const ct = cd.toUnix();
        if (range.from && range.to)
          return ct >= range.from.toUnix() && ct <= range.to.toUnix();
        if (range.from) return ct >= range.from.toUnix();
        if (range.to) return ct <= range.to.toUnix();
        return true;
      });
    });
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((row) =>
        columns.some((col) => {
          const v = getNestedValue(row, col.key);
          return v != null && String(v).toLowerCase().includes(q);
        }),
      );
    }
    if (sortKey && sortDir) {
      items.sort((a, b) => {
        const as = getNestedValue(a, sortKey),
          bs = getNestedValue(b, sortKey);
        const cmp = (as != null ? String(as) : "").localeCompare(
          bs != null ? String(bs) : "",
          "fa",
          { numeric: true, sensitivity: "base" },
        );
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return items;
  }, [
    data,
    debouncedSearch,
    sortKey,
    sortDir,
    columns,
    filters,
    dateRanges,
    serverSide,
  ]);

  const totalItems = serverSide ? serverTotal : filtered.length;
  const totalPages = serverSide
    ? serverTotalPages
    : Math.max(1, Math.ceil(filtered.length / currentPageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    if (serverSide) return data;
    const start = (currentPage - 1) * currentPageSize;
    return filtered.slice(start, start + currentPageSize);
  }, [filtered, currentPage, currentPageSize, serverSide, data]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, dateRanges]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setCurrentPageSize(newSize);
    setPage(1);
  }, []);

  const toggleRowSelection = useCallback(
    (row: T) => {
      const key = String(row[primaryKey]);
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [primaryKey],
  );

  const toggleAllSelection = useCallback(() => {
    if (selectedRows.size === paginatedRows.length) setSelectedRows(new Set());
    else
      setSelectedRows(new Set(paginatedRows.map((r) => String(r[primaryKey]))));
  }, [paginatedRows, selectedRows, primaryKey]);

  const isAllSelected =
    paginatedRows.length > 0 && selectedRows.size === paginatedRows.length;
  const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

  const getSelectedData = useCallback((): T[] => {
    return filtered.filter((row) => selectedRows.has(String(row[primaryKey])));
  }, [filtered, selectedRows, primaryKey]);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
        if (sortDir === "desc") setSortKey(null);
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey, sortDir],
  );

  const handleCellCopy = useCallback(
    (value: unknown, rowKey: string, colKey: string) => {
      const text = formatCellValue(value);
      if (text && text !== "—") copy(text, `${rowKey}-${colKey}`);
    },
    [copy],
  );

  const openView = useCallback((row: T) => {
    setSelectedRow(row);
    setModalMode("view");
  }, []);
  const openEdit = useCallback(
    (row: T) => {
      setSelectedRow(row);
      const fd: Record<string, unknown> = {};
      editableCols.forEach((c) => {
        fd[c.key] = getNestedValue(row, c.key) ?? "";
      });
      setFormData(fd);
      setFormErrors({});
      setModalMode("edit");
    },
    [editableCols],
  );
  const openCreate = useCallback(() => {
    setSelectedRow(null);
    const fd: Record<string, unknown> = {};
    editableCols.forEach((c) => {
      fd[c.key] = "";
    });
    setFormData(fd);
    setFormErrors({});
    setModalMode("create");
  }, [editableCols]);
  const openDelete = useCallback((row: T) => {
    setSelectedRow(row);
    setModalMode("delete");
  }, []);
  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedRow(null);
    setFormData({});
    setFormErrors({});
    setSubmitting(false);
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    editableCols.forEach((col) => {
      if (col.required) {
        const v = formData[col.key];
        if (v === undefined || v === null || String(v).trim() === "")
          errors[col.key] = `${col.label} الزامی است`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [editableCols, formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;
      setSubmitting(true);
      try {
        if (modalMode === "create") {
          if (onCreate) await onCreate(formData as Partial<T>, hookCreate);
          else await hookCreate(formData as Partial<T>);
        } else if (modalMode === "edit" && selectedRow) {
          const updated = { ...selectedRow, ...formData } as T;
          if (onUpdate)
            await onUpdate(updated, (item) => hookUpdate(item, primaryKey));
          else await hookUpdate(updated, primaryKey);
        }
        closeModal();
      } catch {
        /* parent handles */
      } finally {
        setSubmitting(false);
      }
    },
    [
      modalMode,
      formData,
      selectedRow,
      onCreate,
      onUpdate,
      hookCreate,
      hookUpdate,
      primaryKey,
      validateForm,
      closeModal,
    ],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedRow) return;
    setSubmitting(true);
    try {
      if (onDelete)
        await onDelete(selectedRow, (item) => hookRemove(item, primaryKey));
      else await hookRemove(selectedRow, primaryKey);
      closeModal();
    } catch {
      /* parent handles */
    } finally {
      setSubmitting(false);
    }
  }, [onDelete, selectedRow, hookRemove, primaryKey, closeModal]);

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleRowDoubleClick = useCallback(
    (row: T) => {
      if (doubleClickToEdit && canUpdate) openEdit(row);
    },
    [doubleClickToEdit, canUpdate, openEdit],
  );

  const handleExportExcel = useCallback(
    (s: boolean) =>
      exportToExcel(
        s ? getSelectedData() : filtered,
        visibleCols,
        exportFileName,
      ),
    [filtered, getSelectedData, visibleCols, exportFileName],
  );
  const handleExportPNG = useCallback(
    (s: boolean) =>
      exportToPNG(
        s ? getSelectedData() : filtered,
        visibleCols,
        exportFileName,
      ),
    [filtered, getSelectedData, visibleCols, exportFileName],
  );
  const handleExportCSV = useCallback(
    (s: boolean) =>
      exportToCSV(
        s ? getSelectedData() : filtered,
        visibleCols,
        exportFileName,
      ),
    [filtered, getSelectedData, visibleCols, exportFileName],
  );

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setDateRanges({});
    setSearch("");
  }, []);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    const end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const hasActions = !!(canUpdate || canDelete || rowActions);
  const hasFilters = filterableCols.length > 0 || dateFilterCols.length > 0;
  const totalColCount =
    (showRowNumbers ? 1 : 0) + 1 + visibleCols.length + (hasActions ? 1 : 0);

  /* ── Checkbox helper ── */
  const CheckboxIcon = ({
    checked,
    indeterminate,
  }: {
    checked: boolean;
    indeterminate?: boolean;
  }) => (
    <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
      {checked ? (
        <path d="M10.28 2.22a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 011.06 0z" />
      ) : indeterminate ? (
        <rect x="2" y="5" width="8" height="2" rx="1" />
      ) : null}
    </svg>
  );

  const checkboxClasses = (active: boolean) =>
    cn(
      "flex h-5 w-5 items-center justify-center rounded border transition-all duration-200",
      active
        ? isDark
          ? "bg-[#c9a84c]/15 border-[#c9a84c]/30 text-[#d4b863]"
          : "bg-[#8a7032]/10 border-[#8a7032]/25 text-[#7a6428]"
        : isDark
          ? "border-[#3a3a44] text-transparent hover:border-[#4a4a54]"
          : "border-[#ddd9d0] text-transparent hover:border-[#ccc7bc]",
    );

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */

  return (
    <>
      <style>{animation.keyframes}</style>
      <style>{datePickerStyles}</style>

      <section
        className="w-full"
        dir="rtl"
        role="region"
        aria-label={title || "جدول داده‌ها"}
        style={datePickerVars}
      >
        {/* ── Header Bar ── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2
                className={cn(
                  "text-lg font-bold sm:text-xl mb-1",
                  isDark ? "text-[#e8e6e3]" : "text-[#2c2a25]",
                )}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("text-xs leading-5", t.textMuted)}>{subtitle}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!staticData && (
              <button
                type="button"
                onClick={() => mutate()}
                disabled={isValidating}
                title="بارگذاری مجدد"
                aria-label="بارگذاری مجدد داده‌ها"
                className={cn(iconButton, isValidating && "animate-spin")}
              >
                <Icon.Refresh />
              </button>
            )}
            {searchable && (
              <div className="relative">
                <span
                  className={cn(
                    "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
                    t.textDisabled,
                  )}
                >
                  <Icon.Search />
                </span>
                <input
                  type="search"
                  placeholder="جستجو…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="جستجو در جدول"
                  role="searchbox"
                  className={cn(
                    "h-9 w-full rounded-xl border pr-9 pl-4 text-xs outline-none sm:w-48",
                    "transition-all duration-200",
                    t.borderInput,
                    t.inputBg,
                    t.textPrimary,
                    isDark
                      ? "placeholder:text-[#5a574f]"
                      : "placeholder:text-[#b0aa9e]",
                    focus.ring,
                    t.borderHover,
                  )}
                />
                {search && debouncedSearch !== search && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div
                      className={cn(
                        "h-3 w-3 rounded-full border-2 animate-spin",
                        isDark
                          ? "border-[#c9a84c]/30 border-t-[#d4b863]"
                          : "border-[#8a7032]/20 border-t-[#8a7032]",
                      )}
                    />
                  </div>
                )}
              </div>
            )}
            {exportable && (
              <ExportMenu
                onExportExcel={handleExportExcel}
                onExportPNG={handleExportPNG}
                onExportCSV={handleExportCSV}
                selectedCount={selectedRows.size}
              />
            )}
            {canCreate && (
              <button
                type="button"
                onClick={openCreate}
                aria-label="افزودن رکورد جدید"
                className={primaryButton}
              >
                <Icon.Plus />
                <span>افزودن</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {fetchError && (
          <ErrorBanner error={fetchError} onRetry={() => mutate()} />
        )}

        {/* ── Validating ── */}
        {isValidating && !isLoading && (
          <div
            className={cn(
              "mb-3 flex flex-row-reverse items-center justify-between rounded-xl px-4 py-2.5 border",
              t.activeBg,
              t.borderAccent,
            )}
            role="status"
            aria-live="polite"
          >
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                isDark ? "bg-[#c9a84c]" : "bg-[#8a7032]",
              )}
            />
            <span className={t.textMuted}>در حال بروزرسانی…</span>
          </div>
        )}

        {/* ── Filters ── */}
        {hasFilters && (
          <div
            className="mb-3 flex flex-wrap items-center gap-2"
            role="toolbar"
            aria-label="فیلترها"
          >
            <span
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                t.textMuted,
              )}
            >
              <Icon.Filter />
              فیلترها:
            </span>
            {filterableCols.map((col) => (
              <FilterDropdown
                key={col.key}
                label={col.label}
                options={filterOptions[col.key] || []}
                optionLabels={filterOptionLabels[col.key]}
                value={filters[col.key] || ""}
                onChange={(v) =>
                  setFilters((prev) => ({ ...prev, [col.key]: v }))
                }
              />
            ))}
            {dateFilterCols.map((col) => (
              <DateRangeFilter
                key={col.key}
                label={col.label}
                value={dateRanges[col.key] || { from: null, to: null }}
                onChange={(range) =>
                  setDateRanges((prev) => ({ ...prev, [col.key]: range }))
                }
              />
            ))}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                aria-label="پاک کردن همه فیلترها"
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-medium transition-all duration-200",
                  isDark
                    ? "text-[#e87c7c]/70 hover:text-[#e87c7c] hover:bg-[#c44040]/8"
                    : "text-[#c44040]/70 hover:text-[#c44040] hover:bg-[#c44040]/5",
                  focus.ring,
                )}
              >
                <Icon.X />
                پاک کردن فیلترها ({toPersianDigits(activeFiltersCount)})
              </button>
            )}
          </div>
        )}

        {/* ── Selected ── */}
        {selectedRows.size > 0 && (
          <div
            className={cn(
              "mb-3 flex items-center justify-between rounded-xl px-4 py-2.5 border",
              isDark
                ? "bg-[#c9a84c]/6 border-[#c9a84c]/12"
                : "bg-[#8a7032]/4 border-[#8a7032]/10",
            )}
            role="status"
            aria-live="polite"
          >
            <span className={cn("text-xs font-medium", t.textAccent)}>
              {toPersianDigits(selectedRows.size)} ردیف انتخاب شده
            </span>
            <button
              type="button"
              onClick={() => setSelectedRows(new Set())}
              className={cn(
                "text-xs transition-colors",
                t.textMuted,
                isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
              )}
            >
              لغو انتخاب
            </button>
          </div>
        )}

        {/* ── Table Card ── */}
        <div ref={pullRef as any} className={tableCard}>
          <div className="block md:hidden">
            <PullIndicator
              distance={pullDistance}
              isRefreshing={isRefreshing}
              threshold={80}
            />
          </div>

          {(loading || isValidating) && (
            <div
              className={cn(
                "relative h-0.5 w-full overflow-hidden",
                isDark ? "bg-[#c9a84c]/8" : "bg-[#8a7032]/6",
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-0 right-0 w-1/3 animate-[shimmer_1.5s_linear_infinite]",
                  isDark
                    ? "bg-gradient-to-l from-transparent via-[#c9a84c]/25 to-transparent"
                    : "bg-gradient-to-l from-transparent via-[#8a7032]/20 to-transparent",
                )}
              />
            </div>
          )}

          {/* ── Desktop Table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table
              className="w-full text-right"
              role="table"
              aria-label={title || "جدول"}
              aria-rowcount={totalItems}
            >
              <thead
                className={
                  stickyHeader ? cn("sticky top-0 z-10", stickyHead) : ""
                }
              >
                <tr className={cn("border-b", t.divider)} role="row">
                  <th
                    className="w-10 px-3 py-3"
                    role="columnheader"
                    aria-label="انتخاب همه"
                  >
                    <button
                      type="button"
                      onClick={toggleAllSelection}
                      title={isAllSelected ? "لغو انتخاب همه" : "انتخاب همه"}
                      aria-label={
                        isAllSelected
                          ? "لغو انتخاب همه ردیف‌ها"
                          : "انتخاب همه ردیف‌ها"
                      }
                      aria-pressed={isAllSelected}
                      className={checkboxClasses(
                        isAllSelected || isSomeSelected,
                      )}
                    >
                      <CheckboxIcon
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                      />
                    </button>
                  </th>
                  {showRowNumbers && (
                    <th
                      className={cn(
                        "w-12 px-3 py-3 text-xs font-semibold",
                        t.textMuted,
                      )}
                      role="columnheader"
                      aria-label="شماره ردیف"
                    >
                      #
                    </th>
                  )}
                  {visibleCols.map((col) => {
                    const isSorted = sortKey === col.key;
                    const canSort = col.sortable !== false;
                    return (
                      <th
                        key={col.key}
                        role="columnheader"
                        aria-sort={
                          isSorted
                            ? sortDir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                        className={cn(
                          "px-4 py-3 text-xs font-semibold uppercase tracking-wider",
                          t.textMuted,
                          canSort && "cursor-pointer select-none",
                          "transition-colors duration-200",
                          canSort &&
                            (isDark
                              ? "hover:text-[#d4b863]"
                              : "hover:text-[#7a6428]"),
                        )}
                        onClick={() => canSort && handleSort(col.key)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          {isSorted && sortDir === "asc" && <Icon.ChevronUp />}
                          {isSorted && sortDir === "desc" && (
                            <Icon.ChevronDown />
                          )}
                        </span>
                      </th>
                    );
                  })}
                  {hasActions && (
                    <th
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                        t.textMuted,
                      )}
                      role="columnheader"
                    >
                      عملیات
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading && data.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={`sk-${i}`}
                      className={cn("border-b", t.divider)}
                      role="row"
                      aria-busy="true"
                    >
                      <td className="px-3 py-3">
                        <div
                          className={cn(
                            "h-5 w-5 rounded animate-pulse",
                            isDark ? "bg-[#2a2a32]" : "bg-[#e8e4dc]",
                          )}
                        />
                      </td>
                      {showRowNumbers && (
                        <td className="px-3 py-3">
                          <div
                            className={cn(
                              "h-4 w-6 rounded animate-pulse",
                              isDark ? "bg-[#2a2a32]" : "bg-[#e8e4dc]",
                            )}
                          />
                        </td>
                      )}
                      {visibleCols.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          <div
                            className={cn(
                              "h-4 rounded animate-pulse",
                              isDark ? "bg-[#2a2a32]" : "bg-[#e8e4dc]",
                            )}
                            style={{ width: `${60 + Math.random() * 40}%` }}
                          />
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-4 py-3">
                          <div
                            className={cn(
                              "h-4 w-20 rounded animate-pulse",
                              isDark ? "bg-[#2a2a32]" : "bg-[#e8e4dc]",
                            )}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                ) : paginatedRows.length === 0 ? (
                  <tr role="row">
                    <td colSpan={totalColCount} className="py-16 text-center">
                      <div
                        className={cn(
                          "flex flex-col items-center gap-3",
                          t.textMuted,
                        )}
                      >
                        <Icon.Empty />
                        <p className="text-sm">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, ri) => {
                    const rowKey = String(row[primaryKey] ?? ri);
                    const isSelected = selectedRows.has(rowKey);
                    const globalRowIndex =
                      (currentPage - 1) * currentPageSize + ri + 1;
                    return (
                      <tr
                        key={rowKey}
                        role="row"
                        aria-selected={isSelected}
                        aria-rowindex={globalRowIndex}
                        onDoubleClick={() => handleRowDoubleClick(row)}
                        className={cn(
                          "group border-b last:border-b-0",
                          t.divider,
                          "transition-colors duration-200",
                          isSelected ? rowSelected : rowHover,
                          doubleClickToEdit && canUpdate && "cursor-pointer",
                        )}
                      >
                        <td className="w-10 px-3 py-3" role="cell">
                          <button
                            type="button"
                            onClick={() => toggleRowSelection(row)}
                            aria-label={`${isSelected ? "لغو انتخاب" : "انتخاب"} ردیف ${toPersianDigits(globalRowIndex)}`}
                            aria-pressed={isSelected}
                            className={checkboxClasses(isSelected)}
                          >
                            {isSelected && <CheckboxIcon checked />}
                          </button>
                        </td>
                        {showRowNumbers && (
                          <td
                            className={cn(
                              "w-12 px-3 py-3 text-xs font-mono",
                              t.textMuted,
                            )}
                            role="cell"
                            aria-label={`ردیف ${toPersianDigits(globalRowIndex)}`}
                          >
                            {toPersianDigits(globalRowIndex)}
                          </td>
                        )}
                        {visibleCols.map((col) => {
                          const raw = getNestedValue(row, col.key);
                          const display = col.render
                            ? col.render(raw as T[keyof T], row)
                            : formatCellValue(raw);
                          const cellId = `${rowKey}-${col.key}`;
                          const isCopied = copiedCell === cellId;
                          const canCopy =
                            enableCellCopy && col.copyable !== false;
                          return (
                            <td
                              key={col.key}
                              role="cell"
                              className={cn(
                                "px-4 py-3 text-sm relative group/cell",
                                t.textSecondary,
                                canCopy && "cursor-copy",
                              )}
                              onClick={() =>
                                canCopy && handleCellCopy(raw, rowKey, col.key)
                              }
                              title={canCopy ? "کلیک برای کپی" : undefined}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="flex-1">
                                  {typeof display === "string"
                                    ? truncate(display, 60)
                                    : display}
                                </span>
                                {canCopy && (
                                  <span
                                    className={cn(
                                      "shrink-0 transition-all duration-200",
                                      isCopied
                                        ? isDark
                                          ? "text-[#6ec99a] opacity-100"
                                          : "text-[#2d7a50] opacity-100"
                                        : cn(
                                            "opacity-0 group-hover/cell:opacity-40",
                                            t.textMuted,
                                          ),
                                    )}
                                  >
                                    {isCopied ? (
                                      <Icon.CopyDone />
                                    ) : (
                                      <Icon.Copy />
                                    )}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        {hasActions && (
                          <td className="px-4 py-3" role="cell">
                            <div
                              className="flex items-center justify-start gap-1"
                              role="toolbar"
                              aria-label={`عملیات ردیف ${toPersianDigits(globalRowIndex)}`}
                            >
                              <ActionBtn
                                onClick={() => openView(row)}
                                title="مشاهده جزئیات"
                              >
                                <Icon.Eye />
                              </ActionBtn>
                              {canUpdate && (
                                <ActionBtn
                                  onClick={() => openEdit(row)}
                                  title="ویرایش"
                                >
                                  <Icon.Edit />
                                </ActionBtn>
                              )}
                              {canDelete && (
                                <ActionBtn
                                  onClick={() => openDelete(row)}
                                  title="حذف"
                                  variant="danger"
                                >
                                  <Icon.Trash />
                                </ActionBtn>
                              )}
                              {rowActions?.(row)}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Card List ── */}
          <div className={cn("block md:hidden divide-y", t.divider)}>
            {loading && data.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`msk-${i}`} className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={cn(
                        "h-5 w-5 rounded animate-pulse",
                        isDark ? "bg-[#2a2a32]" : "bg-[#e8e4dc]",
                      )}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className={cn(
                          "h-3 w-16 rounded animate-pulse",
                          isDark ? "bg-[#2a2a32]" : "bg-[#e8e4dc]",
                        )}
                      />
                      <div
                        className={cn(
                          "h-4 w-32 rounded animate-pulse",
                          isDark ? "bg-[#2a2a32]" : "bg-[#e8e4dc]",
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : paginatedRows.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className={cn(
                    "flex flex-col items-center gap-3",
                    t.textMuted,
                  )}
                >
                  <Icon.Empty />
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </div>
            ) : (
              paginatedRows.map((row, ri) => {
                const mobileCols = visibleCols.filter((c) => !c.hideOnMobile);
                const rowKey = String(row[primaryKey] ?? ri);
                const isSelected = selectedRows.has(rowKey);
                const globalIdx = (currentPage - 1) * currentPageSize + ri + 1;
                return (
                  <div
                    key={rowKey}
                    role="article"
                    aria-label={`ردیف ${toPersianDigits(globalIdx)}`}
                    onDoubleClick={() => handleRowDoubleClick(row)}
                    className={cn(
                      "group p-4 transition-colors duration-200",
                      isSelected
                        ? isDark
                          ? "bg-[#c9a84c]/[0.03]"
                          : "bg-[#8a7032]/[0.02]"
                        : isDark
                          ? "active:bg-[#ffffff04]"
                          : "active:bg-[#00000003]",
                    )}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {showRowNumbers && (
                          <span
                            className={cn(
                              "text-[10px] font-mono w-5",
                              t.textMuted,
                            )}
                          >
                            {toPersianDigits(globalIdx)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleRowSelection(row)}
                          aria-label={`${isSelected ? "لغو انتخاب" : "انتخاب"} ردیف`}
                          aria-pressed={isSelected}
                          className={cn(
                            "mt-0.5 shrink-0",
                            checkboxClasses(isSelected),
                          )}
                        >
                          {isSelected && <CheckboxIcon checked />}
                        </button>
                      </div>
                      <div className="flex-1">
                        {mobileCols.slice(0, 1).map((col) => {
                          const raw = getNestedValue(row, col.key);
                          const display = col.render
                            ? col.render(raw as T[keyof T], row)
                            : formatCellValue(raw);
                          return (
                            <div
                              key={col.key}
                              onClick={() =>
                                enableCellCopy &&
                                handleCellCopy(raw, rowKey, col.key)
                              }
                              className={
                                enableCellCopy
                                  ? "cursor-copy active:opacity-70"
                                  : ""
                              }
                            >
                              <p
                                className={cn(
                                  "text-[10px] font-medium uppercase tracking-wider mb-0.5",
                                  t.textMuted,
                                )}
                              >
                                {col.label}
                              </p>
                              <p
                                className={cn(
                                  "text-sm font-semibold",
                                  t.textPrimary,
                                )}
                              >
                                {typeof display === "string"
                                  ? truncate(display, 40)
                                  : display}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 mr-8">
                      {mobileCols.slice(1, 5).map((col) => {
                        const raw = getNestedValue(row, col.key);
                        const display = col.render
                          ? col.render(raw as T[keyof T], row)
                          : formatCellValue(raw);
                        return (
                          <div
                            key={col.key}
                            onClick={() =>
                              enableCellCopy &&
                              handleCellCopy(raw, rowKey, col.key)
                            }
                            className={
                              enableCellCopy
                                ? "cursor-copy active:opacity-70"
                                : ""
                            }
                          >
                            <p
                              className={cn(
                                "text-[10px] font-medium uppercase tracking-wider mb-0.5",
                                t.textMuted,
                              )}
                            >
                              {col.label}
                            </p>
                            <p className={cn("text-xs", t.textSecondary)}>
                              {typeof display === "string"
                                ? truncate(display, 30)
                                : display}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {hasActions && (
                      <div
                        className={cn(
                          "mt-3 flex items-center gap-1 border-t pt-3 mr-8",
                          t.divider,
                        )}
                        role="toolbar"
                        aria-label="عملیات"
                      >
                        <ActionBtn
                          onClick={() => openView(row)}
                          title="مشاهده جزئیات"
                        >
                          <Icon.Eye />
                        </ActionBtn>
                        {canUpdate && (
                          <ActionBtn
                            onClick={() => openEdit(row)}
                            title="ویرایش"
                          >
                            <Icon.Edit />
                          </ActionBtn>
                        )}
                        {canDelete && (
                          <ActionBtn
                            onClick={() => openDelete(row)}
                            title="حذف"
                            variant="danger"
                          >
                            <Icon.Trash />
                          </ActionBtn>
                        )}
                        {rowActions?.(row)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <nav
              aria-label="صفحه‌بندی"
              className={cn(
                "flex flex-col items-center gap-3 border-t px-4 py-3 sm:flex-row sm:justify-between",
                t.divider,
              )}
            >
              <div className="flex items-center gap-3">
                <p className={cn("text-xs", t.textMuted)} aria-live="polite">
                  نمایش{" "}
                  <span className={cn("font-medium", t.textSecondary)}>
                    {toPersianDigits((currentPage - 1) * currentPageSize + 1)}
                  </span>{" "}
                  تا{" "}
                  <span className={cn("font-medium", t.textSecondary)}>
                    {toPersianDigits(
                      Math.min(currentPage * currentPageSize, totalItems),
                    )}
                  </span>{" "}
                  از{" "}
                  <span className={cn("font-medium", t.textSecondary)}>
                    {toPersianDigits(totalItems)}
                  </span>{" "}
                  مورد
                </p>
                <PageSizeSelector
                  value={currentPageSize}
                  options={pageSizes}
                  onChange={handlePageSizeChange}
                />
              </div>

              <div className="hidden sm:flex items-center gap-1" dir="ltr">
                <PaginationBtn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  ariaLabel="صفحه قبلی"
                >
                  <Icon.ChevronLeft />
                </PaginationBtn>
                {pageNumbers.map((n) => (
                  <PaginationBtn
                    key={n}
                    onClick={() => setPage(n)}
                    active={n === currentPage}
                    ariaLabel={`صفحه ${toPersianDigits(n)}`}
                  >
                    {toPersianDigits(n)}
                  </PaginationBtn>
                ))}
                <PaginationBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  ariaLabel="صفحه بعدی"
                >
                  <Icon.ChevronRight />
                </PaginationBtn>
              </div>

              <div className="flex sm:hidden items-center gap-3 w-full justify-between">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="صفحه قبلی"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-xl border px-4 text-xs font-medium transition-all duration-200",
                    t.borderSubtle,
                    focus.ring,
                    currentPage === 1
                      ? cn("opacity-30 pointer-events-none", t.textDisabled)
                      : cn(
                          t.textSecondary,
                          isDark
                            ? "hover:text-[#e8e6e3]"
                            : "hover:text-[#2c2a25]",
                          t.borderHover,
                        ),
                  )}
                >
                  <Icon.ChevronRight />
                  <span>قبلی</span>
                </button>
                <span
                  className={cn("text-xs font-medium", t.textMuted)}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  صفحه {toPersianDigits(currentPage)} از{" "}
                  {toPersianDigits(totalPages)}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="صفحه بعدی"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-xl border px-4 text-xs font-medium transition-all duration-200",
                    t.borderSubtle,
                    focus.ring,
                    currentPage === totalPages
                      ? cn("opacity-30 pointer-events-none", t.textDisabled)
                      : cn(
                          t.textSecondary,
                          isDark
                            ? "hover:text-[#e8e6e3]"
                            : "hover:text-[#2c2a25]",
                          t.borderHover,
                        ),
                  )}
                >
                  <span>بعدی</span>
                  <Icon.ChevronLeft />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>

      <CopyToast visible={copied} />

      {/* ══════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════ */}

      {/* ── View ── */}
      <Overlay open={modalMode === "view"} onClose={closeModal} wide>
        <div
          className={cn(
            "flex items-center justify-between border-b px-5 py-4",
            t.divider,
          )}
        >
          <h3
            className={cn(
              "text-base font-bold",
              isDark ? "text-[#e8e6e3]" : "text-[#2c2a25]",
            )}
          >
            جزئیات
          </h3>
          <button
            type="button"
            onClick={closeModal}
            aria-label="بستن پنجره جزئیات"
            className={cn(
              "rounded-lg p-1 transition-colors duration-200",
              t.textMuted,
              t.hoverBg,
              isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
              focus.ring,
            )}
          >
            <Icon.X />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            {viewableCols.map((col) => {
              const raw = selectedRow
                ? getNestedValue(selectedRow, col.key)
                : null;
              const display =
                col.render && selectedRow
                  ? col.render(raw as T[keyof T], selectedRow)
                  : formatCellValue(raw);
              return (
                <div
                  key={col.key}
                  className={cn(
                    "rounded-xl p-3 border",
                    t.inputBg,
                    t.borderSubtle,
                  )}
                >
                  <dt
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider mb-1",
                      t.textMuted,
                    )}
                  >
                    {col.label}
                  </dt>
                  <dd className={cn("break-words text-sm", t.textPrimary)}>
                    {display}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div
          className={cn(
            "border-t px-5 py-3 flex justify-start gap-2",
            t.divider,
          )}
        >
          {canUpdate && selectedRow && (
            <button
              type="button"
              onClick={() => {
                closeModal();
                setTimeout(() => openEdit(selectedRow), 150);
              }}
              className={ghostButton}
            >
              <Icon.Edit />
              <span>ویرایش</span>
            </button>
          )}
          <button type="button" onClick={closeModal} className={primaryButton}>
            بستن
          </button>
        </div>
      </Overlay>

      {/* ── Create / Edit ── */}
      <Overlay
        open={modalMode === "create" || modalMode === "edit"}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSubmit} noValidate>
          <div
            className={cn(
              "flex items-center justify-between border-b px-5 py-4",
              t.divider,
            )}
          >
            <h3
              className={cn(
                "text-base font-bold",
                isDark ? "text-[#e8e6e3]" : "text-[#2c2a25]",
              )}
            >
              {modalMode === "create" ? "ایجاد رکورد جدید" : "ویرایش رکورد"}
            </h3>
            <button
              type="button"
              onClick={closeModal}
              aria-label="بستن فرم"
              className={cn(
                "rounded-lg p-1 transition-colors duration-200",
                t.textMuted,
                t.hoverBg,
                isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
                focus.ring,
              )}
            >
              <Icon.X />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto overflow-x-visible px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {editableCols.map((col) => {
                const fv = formData[col.key];
                const error = formErrors[col.key];
                const inputType = col.inputType || "text";
                const isFull = inputType === "textarea";
                const isDate = col.dateFilter || inputType === "date";
                const dateValue = isDate ? parsePersianDate(fv) : null;
                const dateDisplay = isDate ? formatDateForPicker(fv) : "";

                return (
                  <div key={col.key} className={isFull ? "sm:col-span-2" : ""}>
                    <label
                      htmlFor={`field-${col.key}`}
                      className={cn("mb-1.5 block", fieldLabel)}
                    >
                      {col.label}
                      {col.required && (
                        <span className={cn("mr-1", t.textAccent)}>*</span>
                      )}
                    </label>

                    {isDate ? (
                      <DatePicker
                        value={dateValue ?? undefined}
                        onChange={(date) => {
                          if (date && !Array.isArray(date))
                            updateField(col.key, dateObjectToIsoString(date));
                          else updateField(col.key, "");
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        fixMainPosition
                        arrow={false}
                        portalTarget={portalTarget ?? undefined}
                        zIndex={9999}
                        render={(value, openCalendar) => (
                          <button
                            type="button"
                            onClick={openCalendar}
                            aria-label={`انتخاب ${col.label}`}
                            className={cn(
                              "flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-sm text-right transition-all duration-200",
                              t.inputBg,
                              error ? fieldError : t.borderInput,
                              focus.ring,
                              t.borderHover,
                              dateDisplay ? t.textPrimary : t.textDisabled,
                            )}
                          >
                            <Icon.Calendar />
                            <span className="flex-1 text-right">
                              {dateDisplay ||
                                col.placeholder ||
                                `${col.label} را انتخاب کنید`}
                            </span>
                          </button>
                        )}
                      />
                    ) : col.options && inputType !== "checkbox" ? (
                      <div className="relative z-20">
                        <CustomSelect
                          id={`field-${col.key}`}
                          options={col.options.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                          }))}
                          value={String(fv ?? "")}
                          onChange={(val) =>
                            updateField(
                              col.key,
                              Array.isArray(val) ? (val[0] ?? "") : val,
                            )
                          }
                          placeholder={col.placeholder || `انتخاب ${col.label}`}
                          searchable={col.options.length > 6}
                          searchPlaceholder={`جستجو در ${col.label}...`}
                          clearable
                          fullWidth
                          error={error}
                          size="md"
                        />
                      </div>
                    ) : inputType === "textarea" ? (
                      <textarea
                        id={`field-${col.key}`}
                        rows={3}
                        value={String(fv ?? "")}
                        onChange={(e) => updateField(col.key, e.target.value)}
                        placeholder={
                          col.placeholder || `${col.label} را وارد کنید`
                        }
                        aria-invalid={!!error}
                        aria-describedby={
                          error ? `error-${col.key}` : undefined
                        }
                        className={cn(
                          fieldBase,
                          "px-3 py-2.5 text-base resize-none",
                          error && fieldError,
                        )}
                      />
                    ) : inputType === "checkbox" ? (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`field-${col.key}`}
                          checked={Boolean(fv)}
                          onChange={(e) =>
                            updateField(col.key, e.target.checked)
                          }
                          className={checkboxBase}
                        />
                        <span className={cn("text-sm", checkboxLabel)}>
                          {col.placeholder || col.label}
                        </span>
                      </label>
                    ) : (
                      <input
                        id={`field-${col.key}`}
                        type={inputType}
                        value={
                          inputType === "number"
                            ? ((fv as string) ?? "")
                            : String(fv ?? "")
                        }
                        onChange={(e) =>
                          updateField(
                            col.key,
                            inputType === "number"
                              ? e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                              : e.target.value,
                          )
                        }
                        placeholder={
                          col.placeholder || `${col.label} را وارد کنید`
                        }
                        aria-invalid={!!error}
                        aria-describedby={
                          error ? `error-${col.key}` : undefined
                        }
                        aria-required={col.required}
                        className={cn(
                          fieldBase,
                          "h-10 px-3 text-sm",
                          error && fieldError,
                        )}
                      />
                    )}
                    {error && (
                      <p
                        id={`error-${col.key}`}
                        role="alert"
                        className={cn("mt-1", fieldErrorText)}
                      >
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className={cn(
              "flex justify-start gap-2 border-t px-5 py-3",
              t.divider,
            )}
          >
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className={cn(
                primaryButton,
                submitting && "pointer-events-none opacity-60",
              )}
            >
              {submitting
                ? "در حال ذخیره…"
                : modalMode === "create"
                  ? "ایجاد"
                  : "ذخیره تغییرات"}
            </button>
            <button type="button" onClick={closeModal} className={ghostButton}>
              انصراف
            </button>
          </div>
        </form>
      </Overlay>

      {/* ── Delete ── */}
      <Overlay open={modalMode === "delete"} onClose={closeModal}>
        <div className="px-5 py-6 text-center">
          <div
            className={cn(
              "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full",
              isDark
                ? "bg-[#c44040]/10 text-[#e87c7c]"
                : "bg-[#fce8e8] text-[#c44040]",
            )}
          >
            <Icon.AlertTriangle />
          </div>
          <h3
            className={cn(
              "text-base font-bold mb-2",
              isDark ? "text-[#e8e6e3]" : "text-[#2c2a25]",
            )}
          >
            تأیید حذف
          </h3>
          <p className={cn("text-sm mb-6", t.textMuted)}>
            آیا از حذف این رکورد اطمینان دارید؟ این عملیات قابل بازگشت نیست.
          </p>
          {selectedRow && (
            <div
              className={cn(
                "mx-auto mb-6 max-w-xs rounded-xl p-3 text-right border",
                t.inputBg,
                t.borderSubtle,
              )}
            >
              {visibleCols.slice(0, 3).map((col) => {
                const raw = getNestedValue(selectedRow, col.key);
                return (
                  <div key={col.key} className="mb-1 last:mb-0">
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider ml-2",
                        t.textMuted,
                      )}
                    >
                      {col.label}:
                    </span>
                    <span className={cn("text-xs", t.textSecondary)}>
                      {truncate(formatCellValue(raw), 40)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              aria-busy={submitting}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-xs font-semibold transition-all duration-200 touch-manipulation active:scale-[0.95]",
                focus.ring,
                isDark
                  ? "border-[#c44040]/20 bg-[#c44040]/10 text-[#e87c7c] hover:bg-[#c44040]/18 hover:text-[#f09090]"
                  : "border-[#c44040]/15 bg-[#fce8e8] text-[#c44040] hover:bg-[#f8d4d4]",
                submitting && "pointer-events-none opacity-60",
              )}
            >
              <Icon.Trash />
              {submitting ? "در حال حذف…" : "حذف"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className={cn(
                "h-9 mt-1 text-xs px-5 transition-colors duration-200",
                t.textMuted,
                isDark ? "hover:text-[#e8e6e3]" : "hover:text-[#2c2a25]",
              )}
            >
              انصراف
            </button>
          </div>
        </div>
      </Overlay>
    </>
  );
}
