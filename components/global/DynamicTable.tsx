// ─────────────────────────────────────────────────────────────────
// components/ds/DynamicTable.tsx
// ─────────────────────────────────────────────────────────────────
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
  backgrounds,
  borders,
  shadows,
  typography,
  layout,
  animation,
  focus,
  interactive,
  components,
  gradients,
} from "@/lib/design/tokens";
import CustomSelect from "../ui/customSelect";

/* ══════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════ */

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  visible?: boolean;
  editable?: boolean;
  viewable?: boolean;
  inputType?: string;
  sortable?: boolean;
  placeholder?: string;
  isPrimary?: boolean;
  hideOnMobile?: boolean;
  required?: boolean;
  options?: { label: string; value: string }[];
  filterable?: boolean;
  /** Enable date range filter for this column (uses Jalali calendar) */
  dateFilter?: boolean;
}

export interface DynamicTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  subtitle?: string;
  onCreate?: (item: Partial<T>) => Promise<void> | void;
  onUpdate?: (item: T) => Promise<void> | void;
  onDelete?: (item: T) => Promise<void> | void;
  loading?: boolean;
  primaryKey?: keyof T & string;
  pageSize?: number;
  searchable?: boolean;
  emptyMessage?: string;
  rowActions?: (row: T) => ReactNode;
  exportable?: boolean;
  exportFileName?: string;
}

type SortDir = "asc" | "desc" | null;
type ModalMode = "view" | "create" | "edit" | "delete" | null;

interface DateRange {
  from: DateObject | null;
  to: DateObject | null;
}

/* ══════════════════════════════════════════════
   DATEPICKER CUSTOM STYLES
   ══════════════════════════════════════════════ */

const datePickerStyles = `
/* ─── Container ─── */
.rmdp-container {
  direction: rtl !important;
}

/* ─── Wrapper / Shadow Box ─── */
.rmdp-wrapper,
.rmdp-shadow {
  background: rgba(11, 9, 5, 0.97) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 50px -28px rgba(0, 0, 0, 0.95),
    0 0 40px -10px rgba(212, 175, 55, 0.12) !important;
  padding: 12px !important;
  font-family: inherit !important;
}

/* ─── Header ─── */
.rmdp-header {
  padding: 6px 4px 12px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  margin-bottom: 8px !important;
}

.rmdp-header-values {
  color: #F5D76E !important;
  font-weight: 700 !important;
  font-size: 14px !important;
  letter-spacing: -0.01em !important;
}

.rmdp-header-values span {
  padding: 4px 10px !important;
  border-radius: 8px !important;
  transition: background 0.2s !important;
}

.rmdp-header-values span:hover {
  background: rgba(212, 175, 55, 0.1) !important;
}

/* ─── Arrow Buttons ─── */
.rmdp-arrow-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.2s !important;
}

.rmdp-arrow-container:hover {
  background: rgba(212, 175, 55, 0.12) !important;
  border-color: rgba(212, 175, 55, 0.25) !important;
}

.rmdp-arrow-container .rmdp-arrow {
  border-color: #94a3b8 !important;
  width: 8px !important;
  height: 8px !important;
  margin: 0 !important;
  padding: 0 !important;
}

.rmdp-arrow-container:hover .rmdp-arrow {
  border-color: #F5D76E !important;
}

/* ─── Weekday Names ─── */
.rmdp-week-day {
  color: rgba(148, 163, 184, 0.6) !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

/* ─── Day Cells ─── */
.rmdp-day {
  width: 38px !important;
  height: 38px !important;
}

.rmdp-day span {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #cbd5e1 !important;
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
  background: rgba(212, 175, 55, 0.12) !important;
  color: #F5D76E !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
}

/* ─── Today ─── */
.rmdp-today span {
  background: rgba(212, 175, 55, 0.08) !important;
  color: #F5D76E !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  font-weight: 700 !important;
}

/* ─── Selected Day ─── */
.rmdp-selected span,
.rmdp-day.rmdp-selected span {
  background: linear-gradient(135deg, #B8860B, #D4AF37, #F5D76E) !important;
  color: #050505 !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 16px -4px rgba(212, 175, 55, 0.5) !important;
  border: none !important;
}

/* ─── Range Between ─── */
.rmdp-range {
  background: rgba(212, 175, 55, 0.08) !important;
  box-shadow: none !important;
}

.rmdp-range span {
  color: #F5D76E !important;
}

.rmdp-range.start span,
.rmdp-range.end span {
  background: linear-gradient(135deg, #B8860B, #D4AF37) !important;
  color: #050505 !important;
  font-weight: 700 !important;
}

/* ─── Disabled ─── */
.rmdp-disabled span,
.rmdp-day.rmdp-disabled span {
  color: rgba(148, 163, 184, 0.2) !important;
}

.rmdp-deactive span {
  color: rgba(148, 163, 184, 0.25) !important;
}

/* ─── Month / Year Picker ─── */
.rmdp-month-picker,
.rmdp-year-picker {
  background: rgba(11, 9, 5, 0.97) !important;
  border-radius: 12px !important;
}

.rmdp-month-picker .rmdp-day span,
.rmdp-year-picker .rmdp-day span {
  font-size: 12px !important;
  border-radius: 8px !important;
}

.rmdp-month-picker .rmdp-day.rmdp-selected span,
.rmdp-year-picker .rmdp-day.rmdp-selected span {
  background: linear-gradient(135deg, #B8860B, #D4AF37) !important;
  color: #050505 !important;
}

/* ─── Range Label Bar ─── */
.rmdp-range-label {
  display: none !important;
}

/* ─── Action Buttons ─── */
.rmdp-action-button {
  border-radius: 10px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  padding: 6px 16px !important;
  transition: all 0.2s !important;
}

/* ─── Pointer / Arrow ─── */
.rmdp-ep-arrow {
  display: none !important;
}

.rmdp-ep-arrow::after {
  display: none !important;
}

/* ─── Border top between months ─── */
.rmdp-border-top {
  border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
}

/* ─── Only Month ─── */
.only-month-picker .rmdp-month-picker,
.only-year-picker .rmdp-year-picker {
  width: 100% !important;
}

/* ─── Panel Body ─── */
.rmdp-panel-body li {
  background: rgba(212, 175, 55, 0.08) !important;
  border: 1px solid rgba(212, 175, 55, 0.15) !important;
  border-radius: 8px !important;
  color: #F5D76E !important;
  font-size: 12px !important;
}

.rmdp-panel-body li .b-deselect {
  color: #ef4444 !important;
  font-size: 16px !important;
}

/* ─── Calendar inside input ─── */
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

/* ══════════════════════════════════════════════
   ICONS (inline SVG – zero dependencies)
   ══════════════════════════════════════════════ */

const Icon = {
  Eye: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Edit: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
    </svg>
  ),
  Trash: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6.5a.75.75 0 01-1.49.12l-.5-6.5a.75.75 0 01.71-.84zm3.62.72a.75.75 0 00-1.49-.12l-.5 6.5a.75.75 0 101.49.12l.5-6.5z"
        clipRule="evenodd"
      />
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
  ChevronUp: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3.5 w-3.5"
    >
      <path
        fillRule="evenodd"
        d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
        clipRule="evenodd"
      />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3.5 w-3.5"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
        clipRule="evenodd"
      />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  ),
  X: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-6 w-6"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
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
      className="h-12 w-12"
    >
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Download: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
  ),
  Image: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0L2.5 11.06zm4-2.56a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Filter: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
        clipRule="evenodd"
      />
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
  Calendar: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
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
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Parse a Persian (Jalali) date string like "۱۴۰۲/۱۰/۲۵" or "1402/10/25"
 * into a DateObject for comparison.
 */
function parsePersianDate(val: unknown): DateObject | null {
  if (!val) return null;
  const str = String(val);
  // Convert Persian digits to Latin
  const latin = str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  // Match pattern YYYY/MM/DD
  const match = latin.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (!match) return null;
  try {
    return new DateObject({
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      calendar: persian,
      locale: persian_fa,
    });
  } catch {
    return null;
  }
}

/* ══════════════════════════════════════════════
   EXPORT UTILITIES (no external libs)
   ══════════════════════════════════════════════ */

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
        const val = getNestedValue(row, col.key);
        const str = formatCellValue(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(","),
  );
  const csv = BOM + [headers, ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${fileName}.csv`);
}

function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDef<T>[],
  fileName: string,
) {
  const tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8">
    <style>td,th{font-family:Tahoma,sans-serif;font-size:11pt;text-align:right;direction:rtl;padding:6px 10px;border:1px solid #ddd}th{background:#1a1a1a;color:#F5D76E;font-weight:bold}tr:nth-child(even){background:#f9f9f9}</style>
    </head><body dir="rtl"><table>
    <tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr>
    ${rows
      .map(
        (row) =>
          `<tr>${columns
            .map((col) => {
              const val = getNestedValue(row, col.key);
              return `<td>${formatCellValue(val)}</td>`;
            })
            .join("")}</tr>`,
      )
      .join("")}
    </table></body></html>`;
  const blob = new Blob([tableHtml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  downloadBlob(blob, `${fileName}.xls`);
}

async function exportToPNG<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDef<T>[],
  fileName: string,
) {
  const cellPadding = 12;
  const headerHeight = 44;
  const rowHeight = 38;
  const fontSize = 13;
  const headerFontSize = 13;

  const colWidths = columns.map((col) => {
    const headerLen = col.label.length;
    const maxDataLen = rows.reduce((max, row) => {
      const val = formatCellValue(getNestedValue(row, col.key));
      return Math.max(max, val.length);
    }, 0);
    return Math.max(headerLen, maxDataLen) * 9 + cellPadding * 2 + 20;
  });

  const totalWidth = Math.max(
    colWidths.reduce((a, b) => a + b, 0),
    600,
  );
  const totalHeight = headerHeight + rows.length * rowHeight + 20;

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = totalWidth * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  ctx.fillStyle = "#0B0905";
  ctx.fillRect(0, 0, totalWidth, totalHeight);
  ctx.fillStyle = "#1A1304";
  ctx.fillRect(0, 0, totalWidth, headerHeight);
  ctx.strokeStyle = "rgba(212,175,55,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(totalWidth, headerHeight);
  ctx.stroke();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#F5D76E";
  ctx.font = `bold ${headerFontSize}px Tahoma, sans-serif`;
  let xOffset = totalWidth - 10;
  columns.forEach((col, ci) => {
    ctx.fillText(col.label, xOffset - 8, headerHeight / 2);
    xOffset -= colWidths[ci];
  });

  rows.forEach((row, ri) => {
    const y = headerHeight + ri * rowHeight;
    if (ri % 2 === 1) {
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(0, y, totalWidth, rowHeight);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.moveTo(0, y + rowHeight);
    ctx.lineTo(totalWidth, y + rowHeight);
    ctx.stroke();
    ctx.fillStyle = "#CBD5E1";
    ctx.font = `${fontSize}px Tahoma, sans-serif`;
    let cellX = totalWidth - 10;
    columns.forEach((col, ci) => {
      const val = formatCellValue(getNestedValue(row, col.key));
      const t = val.length > 30 ? val.slice(0, 30) + "…" : val;
      ctx.fillText(t, cellX - 8, y + rowHeight / 2);
      cellX -= colWidths[ci];
    });
  });

  ctx.strokeStyle = "rgba(212,175,55,0.15)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, totalWidth, totalHeight);

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
        "fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6",
        backgrounds.surface.overlay,
      )}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          wide ? "max-w-2xl" : "max-w-lg",
          layout.radius.lg,
          borders.light,
          "bg-[#0B0905]/95 backdrop-blur-2xl",
          shadows.card,
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
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg",
        animation.base,
        interactive.touch,
        focus.ring,
        animation.activePress,
        variant === "danger"
          ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
          : "text-slate-400 hover:bg-white/[0.06] hover:text-[#F5D76E]",
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
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium",
        animation.base,
        interactive.touch,
        focus.ring,
        disabled && "pointer-events-none opacity-30",
        active
          ? "bg-[#D4AF37]/15 text-[#F5D76E] border border-[#D4AF37]/25"
          : "text-slate-400 hover:bg-white/[0.06] hover:text-white border border-transparent",
      )}
    >
      {children}
    </button>
  );
}

/* ── Filter Dropdown ── */
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium",
          "bg-white/[0.035] backdrop-blur-sm",
          value
            ? "border-[#D4AF37]/25 text-[#F5D76E]"
            : borders.subtle + " text-slate-400",
          animation.base,
          focus.ring,
          "hover:border-[#D4AF37]/18 hover:text-white",
        )}
      >
        <Icon.Filter />
        <span>{label}</span>
        {value && (
          <span className="mr-1 rounded-full bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] text-[#F5D76E]">
            {value}
          </span>
        )}
        <Icon.ChevronDown />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full right-0 z-50 mt-1 min-w-[160px] overflow-hidden",
            layout.radius.md,
            borders.light,
            "bg-[#0B0905]/98 backdrop-blur-2xl",
            shadows.card,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-xs text-right",
              animation.colors,
              !value
                ? "text-[#F5D76E] bg-[#D4AF37]/10"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <span className="flex-1">همه</span>
            {!value && <Icon.Check />}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-xs text-right",
                animation.colors,
                value === opt
                  ? "text-[#F5D76E] bg-[#D4AF37]/10"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <span className="flex-1">{opt}</span>
              {value === opt && <Icon.Check />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Date Range Filter ── */
function DateRangeFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const hasRange = value.from || value.to;

  const formatRange = () => {
    if (!value.from && !value.to) return "";
    const from = value.from?.format("YYYY/MM/DD") ?? "...";
    const to = value.to?.format("YYYY/MM/DD") ?? "...";
    return `${from} – ${to}`;
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
          if (Array.isArray(dates)) {
            onChange({
              from: dates[0] ? new DateObject(dates[0]) : null,
              to: dates[1] ? new DateObject(dates[1]) : null,
            });
          } else {
            onChange({ from: null, to: null });
          }
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
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium",
              "bg-white/[0.035] backdrop-blur-sm",
              hasRange
                ? "border-[#D4AF37]/25 text-[#F5D76E]"
                : borders.subtle + " text-slate-400",
              animation.base,
              focus.ring,
              "hover:border-[#D4AF37]/18 hover:text-white",
              "max-w-[280px]",
            )}
          >
            <Icon.Calendar />
            <span className="whitespace-nowrap">{label}</span>
            {hasRange && (
              <span className="mr-1 rounded-full bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] text-[#F5D76E] whitespace-nowrap truncate max-w-[140px]">
                {formatRange()}
              </span>
            )}
            <Icon.ChevronDown />
          </button>
        )}
      />

      {/* Clear button */}
      {hasRange && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange({ from: null, to: null });
          }}
          className={cn(
            "absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full",
            "bg-red-500/20 text-red-400 hover:bg-red-500/30",
            "transition-all duration-150",
          )}
          title="پاک کردن"
        >
          <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5">
            <path d="M3.404 3.404a.55.55 0 01.778 0L6 5.222l1.818-1.818a.55.55 0 01.778.778L6.778 6l1.818 1.818a.55.55 0 11-.778.778L6 6.778 4.182 8.596a.55.55 0 11-.778-.778L5.222 6 3.404 4.182a.55.55 0 010-.778z" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Export Menu ── */
function ExportMenu({
  onExportExcel,
  onExportPNG,
  onExportCSV,
  selectedCount,
}: {
  onExportExcel: (selected: boolean) => void;
  onExportPNG: (selected: boolean) => void;
  onExportCSV: (selected: boolean) => void;
  selectedCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
        className={cn(components.ghostButton, "h-9 text-xs px-3 gap-1.5")}
      >
        <Icon.Download />
        <span>خروجی</span>
      </button>
      {open && (
        <div
          className={cn(
            "absolute top-full left-0 z-50 mt-1 min-w-[220px] overflow-hidden",
            layout.radius.md,
            borders.light,
            "bg-[#0B0905]/98 backdrop-blur-2xl",
            shadows.card,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={item.action}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-xs text-right",
                animation.colors,
                "text-slate-400 hover:bg-white/[0.04] hover:text-white",
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

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function DynamicTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  subtitle,
  onCreate,
  onUpdate,
  onDelete,
  loading = false,
  primaryKey = "id" as keyof T & string,
  pageSize = 10,
  searchable = true,
  emptyMessage = "داده‌ای یافت نشد",
  rowActions,
  exportable = true,
  exportFileName = "export",
}: DynamicTableProps<T>) {
  /* ── State ── */
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRanges, setDateRanges] = useState<Record<string, DateRange>>({});

  /* ── Derived columns ── */
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

  /* ── Filter options from data ── */
  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    filterableCols.forEach((col) => {
      const uniqueVals = new Set<string>();
      data.forEach((row) => {
        const val = getNestedValue(row, col.key);
        if (val !== null && val !== undefined) uniqueVals.add(String(val));
      });
      opts[col.key] = Array.from(uniqueVals).sort();
    });
    return opts;
  }, [data, filterableCols]);

  const activeFiltersCount = useMemo(() => {
    const textFilters = Object.values(filters).filter(Boolean).length;
    const dateFilters = Object.values(dateRanges).filter(
      (r) => r.from || r.to,
    ).length;
    return textFilters + dateFilters;
  }, [filters, dateRanges]);

  /* ── Search + Filter + Date Range + Sort + Paginate ── */
  const filtered = useMemo(() => {
    let items = [...data];

    // Text filters
    Object.entries(filters).forEach(([key, val]) => {
      if (val) {
        items = items.filter((row) => {
          const cellVal = getNestedValue(row, key);
          return (
            cellVal !== null && cellVal !== undefined && String(cellVal) === val
          );
        });
      }
    });

    // Date range filters
    Object.entries(dateRanges).forEach(([key, range]) => {
      if (!range.from && !range.to) return;
      items = items.filter((row) => {
        const cellVal = getNestedValue(row, key);
        const cellDate = parsePersianDate(cellVal);
        if (!cellDate) return false;

        const cellTimestamp = cellDate.toUnix();

        if (range.from && range.to) {
          return (
            cellTimestamp >= range.from.toUnix() &&
            cellTimestamp <= range.to.toUnix()
          );
        }
        if (range.from) {
          return cellTimestamp >= range.from.toUnix();
        }
        if (range.to) {
          return cellTimestamp <= range.to.toUnix();
        }
        return true;
      });
    });

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((row) =>
        columns.some((col) => {
          const val = getNestedValue(row, col.key);
          return (
            val !== null &&
            val !== undefined &&
            String(val).toLowerCase().includes(q)
          );
        }),
      );
    }

    // Sort
    if (sortKey && sortDir) {
      items.sort((a, b) => {
        const aVal = getNestedValue(a, sortKey);
        const bVal = getNestedValue(b, sortKey);
        const aStr = aVal != null ? String(aVal) : "";
        const bStr = bVal != null ? String(bVal) : "";
        const cmp = aStr.localeCompare(bStr, "fa", {
          numeric: true,
          sensitivity: "base",
        });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return items;
  }, [data, search, sortKey, sortDir, columns, filters, dateRanges]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, filters, dateRanges]);

  /* ── Selection ── */
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
    if (selectedRows.size === paginatedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedRows.map((r) => String(r[primaryKey]))));
    }
  }, [paginatedRows, selectedRows, primaryKey]);

  const isAllSelected =
    paginatedRows.length > 0 && selectedRows.size === paginatedRows.length;
  const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

  const getSelectedData = useCallback((): T[] => {
    return filtered.filter((row) => selectedRows.has(String(row[primaryKey])));
  }, [filtered, selectedRows, primaryKey]);

  /* ── Sort ── */
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

  /* ── Modal handlers ── */
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
        const val = formData[col.key];
        if (val === undefined || val === null || String(val).trim() === "") {
          errors[col.key] = `${col.label} الزامی است`;
        }
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
        if (modalMode === "create" && onCreate) {
          await onCreate(formData as Partial<T>);
        } else if (modalMode === "edit" && onUpdate && selectedRow) {
          const updated = { ...selectedRow, ...formData } as T;
          await onUpdate(updated);
        }
        closeModal();
      } catch {
        // parent handles
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
      validateForm,
      closeModal,
    ],
  );

  const handleDelete = useCallback(async () => {
    if (!onDelete || !selectedRow) return;
    setSubmitting(true);
    try {
      await onDelete(selectedRow);
      closeModal();
    } catch {
      // parent handles
    } finally {
      setSubmitting(false);
    }
  }, [onDelete, selectedRow, closeModal]);

  const updateField = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /* ── Export handlers ── */
  const handleExportExcel = useCallback(
    (selectedOnly: boolean) => {
      const rows = selectedOnly ? getSelectedData() : filtered;
      exportToExcel(rows, visibleCols, exportFileName);
    },
    [filtered, getSelectedData, visibleCols, exportFileName],
  );

  const handleExportPNG = useCallback(
    (selectedOnly: boolean) => {
      const rows = selectedOnly ? getSelectedData() : filtered;
      exportToPNG(rows, visibleCols, exportFileName);
    },
    [filtered, getSelectedData, visibleCols, exportFileName],
  );

  const handleExportCSV = useCallback(
    (selectedOnly: boolean) => {
      const rows = selectedOnly ? getSelectedData() : filtered;
      exportToCSV(rows, visibleCols, exportFileName);
    },
    [filtered, getSelectedData, visibleCols, exportFileName],
  );

  /* ── Clear filters ── */
  const clearAllFilters = useCallback(() => {
    setFilters({});
    setDateRanges({});
    setSearch("");
  }, []);

  /* ── Pagination ── */
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const hasActions = !!(onUpdate || onDelete || rowActions);
  const hasFilters = filterableCols.length > 0 || dateFilterCols.length > 0;

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  return (
    <>
      <style>{animation.keyframes}</style>
      <style>{datePickerStyles}</style>

      <section className="w-full" dir="rtl">
        {/* ── Header Bar ── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2 className={cn(typography.h3, gradients.textPrimary, "mb-1")}>
                {title}
              </h2>
            )}
            {subtitle && <p className={typography.bodySmall}>{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {searchable && (
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Icon.Search />
                </span>
                <input
                  type="text"
                  placeholder="جستجو…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "h-9 w-full rounded-xl border pr-9 pl-4 text-xs text-white placeholder-slate-500 outline-none",
                    "bg-white/[0.035] backdrop-blur-sm",
                    borders.subtle,
                    animation.base,
                    focus.ring,
                    "hover:border-[#D4AF37]/18",
                    "sm:w-48",
                  )}
                />
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

            {onCreate && (
              <button
                type="button"
                onClick={openCreate}
                className={cn(components.ctaSmall, "h-9 text-xs")}
              >
                <Icon.Plus />
                <span>افزودن</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Filters Row ── */}
        {hasFilters && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Icon.Filter />
              فیلترها:
            </span>

            {/* Text filters */}
            {filterableCols.map((col) => (
              <FilterDropdown
                key={col.key}
                label={col.label}
                options={filterOptions[col.key] || []}
                value={filters[col.key] || ""}
                onChange={(v) =>
                  setFilters((prev) => ({ ...prev, [col.key]: v }))
                }
              />
            ))}

            {/* Date range filters */}
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
                className={cn(
                  "inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-medium",
                  "text-red-400/80 hover:text-red-400 hover:bg-red-500/10",
                  animation.base,
                  focus.ring,
                )}
              >
                <Icon.X />
                پاک کردن فیلترها ({toPersianDigits(activeFiltersCount)})
              </button>
            )}
          </div>
        )}

        {/* ── Selected count bar ── */}
        {selectedRows.size > 0 && (
          <div
            className={cn(
              "mb-3 flex items-center justify-between rounded-xl px-4 py-2.5",
              "bg-[#D4AF37]/[0.08] border border-[#D4AF37]/15",
            )}
          >
            <span className="text-xs font-medium text-[#F5D76E]">
              {toPersianDigits(selectedRows.size)} ردیف انتخاب شده
            </span>
            <button
              type="button"
              onClick={() => setSelectedRows(new Set())}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              لغو انتخاب
            </button>
          </div>
        )}

        {/* ── Table Card ── */}
        <div
          className={cn(
            "overflow-hidden",
            layout.radius.lg,
            borders.light,
            backgrounds.surface.glass,
            shadows.card,
          )}
        >
          {loading && (
            <div className="relative h-0.5 w-full overflow-hidden bg-[#D4AF37]/10">
              <div className="absolute inset-y-0 right-0 w-1/3 animate-[shimmer_1.5s_linear_infinite] bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-transparent" />
            </div>
          )}

          {/* ── Desktop Table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="w-10 px-3 py-3">
                    <button
                      type="button"
                      onClick={toggleAllSelection}
                      title="انتخاب همه"
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border",
                        animation.base,
                        isAllSelected
                          ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#F5D76E]"
                          : isSomeSelected
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/25 text-[#D4AF37]"
                            : "border-white/15 text-transparent hover:border-[#D4AF37]/25",
                      )}
                    >
                      {(isAllSelected || isSomeSelected) && (
                        <svg
                          viewBox="0 0 12 12"
                          fill="currentColor"
                          className="h-3 w-3"
                        >
                          {isAllSelected ? (
                            <path d="M10.28 2.22a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 011.06 0z" />
                          ) : (
                            <rect x="2" y="5" width="8" height="2" rx="1" />
                          )}
                        </svg>
                      )}
                    </button>
                  </th>

                  {visibleCols.map((col) => {
                    const isSorted = sortKey === col.key;
                    const canSort = col.sortable !== false;
                    return (
                      <th
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500",
                          canSort && "cursor-pointer select-none",
                          animation.colors,
                          canSort && "hover:text-[#F5D76E]/80",
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
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      عملیات
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleCols.length + (hasActions ? 1 : 0) + 1}
                      className="py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Icon.Empty />
                        <p className="text-sm">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row, ri) => {
                    const rowKey = String(row[primaryKey] ?? ri);
                    const isSelected = selectedRows.has(rowKey);
                    return (
                      <tr
                        key={rowKey}
                        className={cn(
                          "group border-b border-white/[0.04] last:border-b-0",
                          animation.colors,
                          isSelected
                            ? "bg-[#D4AF37]/[0.04]"
                            : "hover:bg-white/[0.025]",
                        )}
                      >
                        <td className="w-10 px-3 py-3">
                          <button
                            type="button"
                            onClick={() => toggleRowSelection(row)}
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded border",
                              animation.base,
                              isSelected
                                ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#F5D76E]"
                                : "border-white/15 text-transparent hover:border-[#D4AF37]/25",
                            )}
                          >
                            {isSelected && (
                              <svg
                                viewBox="0 0 12 12"
                                fill="currentColor"
                                className="h-3 w-3"
                              >
                                <path d="M10.28 2.22a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 011.06 0z" />
                              </svg>
                            )}
                          </button>
                        </td>

                        {visibleCols.map((col) => {
                          const raw = getNestedValue(row, col.key);
                          const display = col.render
                            ? col.render(raw as T[keyof T], row)
                            : formatCellValue(raw);
                          return (
                            <td
                              key={col.key}
                              className="px-4 py-3 text-sm text-slate-300"
                            >
                              {typeof display === "string"
                                ? truncate(display, 60)
                                : display}
                            </td>
                          );
                        })}
                        {hasActions && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-start gap-1">
                              <ActionBtn
                                onClick={() => openView(row)}
                                title="مشاهده جزئیات"
                              >
                                <Icon.Eye />
                              </ActionBtn>
                              {onUpdate && (
                                <ActionBtn
                                  onClick={() => openEdit(row)}
                                  title="ویرایش"
                                >
                                  <Icon.Edit />
                                </ActionBtn>
                              )}
                              {onDelete && (
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
          <div className="block md:hidden divide-y divide-white/[0.04]">
            {paginatedRows.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <Icon.Empty />
                  <p className="text-sm">{emptyMessage}</p>
                </div>
              </div>
            ) : (
              paginatedRows.map((row, ri) => {
                const mobileCols = visibleCols.filter((c) => !c.hideOnMobile);
                const rowKey = String(row[primaryKey] ?? ri);
                const isSelected = selectedRows.has(rowKey);
                return (
                  <div
                    key={rowKey}
                    className={cn(
                      "group p-4",
                      animation.colors,
                      isSelected
                        ? "bg-[#D4AF37]/[0.04]"
                        : "active:bg-white/[0.03]",
                    )}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <button
                        type="button"
                        onClick={() => toggleRowSelection(row)}
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                          animation.base,
                          isSelected
                            ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#F5D76E]"
                            : "border-white/15 text-transparent",
                        )}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 12 12"
                            fill="currentColor"
                            className="h-3 w-3"
                          >
                            <path d="M10.28 2.22a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 01-1.06 0l-2.5-2.5a.75.75 0 011.06-1.06L4.25 7.19l4.97-4.97a.75.75 0 011.06 0z" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        {mobileCols.slice(0, 1).map((col) => {
                          const raw = getNestedValue(row, col.key);
                          const display = col.render
                            ? col.render(raw as T[keyof T], row)
                            : formatCellValue(raw);
                          return (
                            <div key={col.key}>
                              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">
                                {col.label}
                              </p>
                              <p className="text-sm font-semibold text-white">
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
                          <div key={col.key}>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-0.5">
                              {col.label}
                            </p>
                            <p className="text-xs text-slate-300">
                              {typeof display === "string"
                                ? truncate(display, 30)
                                : display}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    {hasActions && (
                      <div className="mt-3 flex items-center gap-1 border-t border-white/[0.04] pt-3 mr-8">
                        <ActionBtn
                          onClick={() => openView(row)}
                          title="مشاهده جزئیات"
                        >
                          <Icon.Eye />
                        </ActionBtn>
                        {onUpdate && (
                          <ActionBtn
                            onClick={() => openEdit(row)}
                            title="ویرایش"
                          >
                            <Icon.Edit />
                          </ActionBtn>
                        )}
                        {onDelete && (
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
            <div className="flex flex-col items-center gap-3 border-t border-white/[0.06] px-4 py-3 sm:flex-row sm:justify-between">
              <p className="text-xs text-slate-500">
                نمایش{" "}
                <span className="font-medium text-slate-300">
                  {toPersianDigits((currentPage - 1) * pageSize + 1)}
                </span>{" "}
                تا{" "}
                <span className="font-medium text-slate-300">
                  {toPersianDigits(
                    Math.min(currentPage * pageSize, filtered.length),
                  )}
                </span>{" "}
                از{" "}
                <span className="font-medium text-slate-300">
                  {toPersianDigits(filtered.length)}
                </span>{" "}
                مورد
              </p>
              <div className="flex items-center gap-1" dir="ltr">
                <PaginationBtn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Icon.ChevronLeft />
                </PaginationBtn>
                {pageNumbers.map((n) => (
                  <PaginationBtn
                    key={n}
                    onClick={() => setPage(n)}
                    active={n === currentPage}
                  >
                    {toPersianDigits(n)}
                  </PaginationBtn>
                ))}
                <PaginationBtn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Icon.ChevronRight />
                </PaginationBtn>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════ */}

      {/* ── View Modal ── */}
      <Overlay open={modalMode === "view"} onClose={closeModal} wide>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h3 className={cn(typography.h4, gradients.textPrimary)}>جزئیات</h3>
          <button
            type="button"
            onClick={closeModal}
            className={cn(
              "rounded-lg p-1 text-slate-500",
              animation.colors,
              "hover:bg-white/[0.06] hover:text-white",
              focus.ring,
            )}
            aria-label="بستن"
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
                    "rounded-xl p-3",
                    "bg-white/[0.025]",
                    borders.subtle,
                  )}
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    {col.label}
                  </dt>
                  <dd className="text-sm text-slate-200 break-words">
                    {display}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div className="border-t border-white/[0.06] px-5 py-3 flex justify-start gap-2">
          {onUpdate && selectedRow && (
            <button
              type="button"
              onClick={() => {
                closeModal();
                setTimeout(() => openEdit(selectedRow), 150);
              }}
              className={cn(components.ghostButton, "h-9 text-xs px-4")}
            >
              <Icon.Edit />
              <span>ویرایش</span>
            </button>
          )}
          <button
            type="button"
            onClick={closeModal}
            className={cn(components.ctaSmall, "h-9 text-xs")}
          >
            بستن
          </button>
        </div>
      </Overlay>

      {/* ── Create / Edit Modal ── */}
      <Overlay
        open={modalMode === "create" || modalMode === "edit"}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h3 className={cn(typography.h4, gradients.textPrimary)}>
              {modalMode === "create" ? "ایجاد رکورد جدید" : "ویرایش رکورد"}
            </h3>
            <button
              type="button"
              onClick={closeModal}
              className={cn(
                "rounded-lg p-1 text-slate-500",
                animation.colors,
                "hover:bg-white/[0.06] hover:text-white",
                focus.ring,
              )}
              aria-label="بستن"
            >
              <Icon.X />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto overflow-x-visible px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {editableCols.map((col) => {
                const fieldValue = formData[col.key];
                const error = formErrors[col.key];
                const inputType = col.inputType || "text";
                const isFullWidth = inputType === "textarea";
                const isDateField = col.dateFilter || inputType === "date";

                return (
                  <div
                    key={col.key}
                    className={isFullWidth ? "sm:col-span-2" : ""}
                  >
                    <label
                      htmlFor={`field-${col.key}`}
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {col.label}
                      {col.required && (
                        <span className="mr-1 text-[#D4AF37]">*</span>
                      )}
                    </label>

                    {/* Date field with Jalali picker */}
                    {isDateField ? (
                      <div className="relative">
                        <DatePicker
                          value={fieldValue ? String(fieldValue) : ""}
                          onChange={(date) => {
                            if (date && !Array.isArray(date)) {
                              updateField(col.key, date.format("YYYY/MM/DD"));
                            } else {
                              updateField(col.key, "");
                            }
                          }}
                          calendar={persian}
                          locale={persian_fa}
                          calendarPosition="bottom-right"
                          fixMainPosition
                          arrow={false}
                          render={(value, openCalendar) => (
                            <button
                              type="button"
                              onClick={openCalendar}
                              className={cn(
                                "flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-sm text-right",
                                "bg-white/[0.035] backdrop-blur-sm",
                                error ? "border-red-500/40" : borders.subtle,
                                animation.base,
                                focus.ring,
                                "hover:border-[#D4AF37]/18",
                                value ? "text-white" : "text-slate-500",
                              )}
                            >
                              <Icon.Calendar />
                              <span className="flex-1 text-right">
                                {value ||
                                  col.placeholder ||
                                  `${col.label} را انتخاب کنید`}
                              </span>
                            </button>
                          )}
                        />
                      </div>
                    ) : col.options ? (
                      <div className="relative z-20">
                        <CustomSelect
                          id={`field-${col.key}`}
                          options={col.options.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                          }))}
                          value={String(fieldValue ?? "")}
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
                        value={String(fieldValue ?? "")}
                        onChange={(e) => updateField(col.key, e.target.value)}
                        placeholder={
                          col.placeholder || `${col.label} را وارد کنید`
                        }
                        className={cn(
                          "w-full rounded-xl border px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none resize-none",
                          "bg-white/[0.035] backdrop-blur-sm",
                          error ? "border-red-500/40" : borders.subtle,
                          animation.base,
                          focus.ring,
                          "hover:border-[#D4AF37]/18",
                        )}
                      />
                    ) : inputType === "checkbox" ? (
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`field-${col.key}`}
                          checked={Boolean(fieldValue)}
                          onChange={(e) =>
                            updateField(col.key, e.target.checked)
                          }
                          className={cn(
                            "h-4 w-4 rounded border-white/20 bg-white/[0.04] text-[#D4AF37]",
                            focus.ring,
                          )}
                        />
                        <span className="text-sm text-slate-300">
                          {col.placeholder || col.label}
                        </span>
                      </label>
                    ) : (
                      <input
                        id={`field-${col.key}`}
                        type={inputType}
                        value={
                          inputType === "number"
                            ? ((fieldValue as string) ?? "")
                            : String(fieldValue ?? "")
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
                        className={cn(
                          "h-10 w-full rounded-xl border px-3 text-sm text-white placeholder-slate-500 outline-none",
                          "bg-white/[0.035] backdrop-blur-sm",
                          error ? "border-red-500/40" : borders.subtle,
                          animation.base,
                          focus.ring,
                          "hover:border-[#D4AF37]/18",
                        )}
                      />
                    )}

                    {error && (
                      <p className="mt-1 text-[11px] text-red-400">{error}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-start gap-2 border-t border-white/[0.06] px-5 py-3">
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                components.ctaSmall,
                "h-9 text-xs",
                submitting && "pointer-events-none opacity-60",
              )}
            >
              {submitting
                ? "در حال ذخیره…"
                : modalMode === "create"
                  ? "ایجاد"
                  : "ذخیره تغییرات"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className={cn(components.ghostButton, "h-9 text-xs px-4")}
            >
              انصراف
            </button>
          </div>
        </form>
      </Overlay>

      {/* ── Delete Confirmation ── */}
      <Overlay open={modalMode === "delete"} onClose={closeModal}>
        <div className="px-5 py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Icon.AlertTriangle />
          </div>
          <h3 className={cn(typography.h4, "mb-2")}>تأیید حذف</h3>
          <p className="text-sm text-slate-400 mb-6">
            آیا از حذف این رکورد اطمینان دارید؟ این عملیات قابل بازگشت نیست.
          </p>
          {selectedRow && (
            <div
              className={cn(
                "mx-auto mb-6 max-w-xs rounded-xl p-3 text-right",
                "bg-white/[0.025]",
                borders.subtle,
              )}
            >
              {visibleCols.slice(0, 3).map((col) => {
                const raw = getNestedValue(selectedRow, col.key);
                return (
                  <div key={col.key} className="mb-1 last:mb-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-2">
                      {col.label}:
                    </span>
                    <span className="text-xs text-slate-300">
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
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-500/25 bg-red-500/15 px-5 text-xs font-semibold text-red-400",
                animation.base,
                interactive.touch,
                focus.ring,
                animation.activePress,
                "hover:bg-red-500/25 hover:text-red-300",
                submitting && "pointer-events-none opacity-60",
              )}
            >
              <Icon.Trash />
              {submitting ? "در حال حذف…" : "حذف"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className={cn(components.ghostButton, "h-9 text-xs px-5")}
            >
              انصراف
            </button>
          </div>
        </div>
      </Overlay>
    </>
  );
}
