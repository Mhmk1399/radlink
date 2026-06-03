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

/* ══════════════════════════════════════════════
   DATEPICKER CUSTOM STYLES
   ══════════════════════════════════════════════ */

const datePickerStyles = `
.rmdp-container { direction: rtl !important; }
.rmdp-wrapper, .rmdp-shadow {
  background: rgba(11, 9, 5, 0.97) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 50px -28px rgba(0,0,0,0.95), 0 0 40px -10px rgba(212,175,55,0.12) !important;
  padding: 12px !important;
  font-family: inherit !important;
}
.rmdp-header { padding: 6px 4px 12px !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; margin-bottom: 8px !important; }
.rmdp-header-values { color: #F5D76E !important; font-weight: 700 !important; font-size: 14px !important; }
.rmdp-header-values span { padding: 4px 10px !important; border-radius: 8px !important; transition: background 0.2s !important; }
.rmdp-header-values span:hover { background: rgba(212,175,55,0.1) !important; }
.rmdp-arrow-container { display: flex !important; align-items: center !important; justify-content: center !important; width: 32px !important; height: 32px !important; border-radius: 10px !important; background: rgba(255,255,255,0.04) !important; border: 1px solid rgba(255,255,255,0.08) !important; transition: all 0.2s !important; }
.rmdp-arrow-container:hover { background: rgba(212,175,55,0.12) !important; border-color: rgba(212,175,55,0.25) !important; }
.rmdp-arrow-container .rmdp-arrow { border-color: #94a3b8 !important; width: 8px !important; height: 8px !important; margin: 0 !important; padding: 0 !important; }
.rmdp-arrow-container:hover .rmdp-arrow { border-color: #F5D76E !important; }
.rmdp-week-day { color: rgba(148,163,184,0.6) !important; font-size: 11px !important; font-weight: 600 !important; }
.rmdp-day { width: 38px !important; height: 38px !important; }
.rmdp-day span { font-size: 13px !important; font-weight: 500 !important; color: #cbd5e1 !important; border-radius: 10px !important; transition: all 0.15s !important; width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; inset: 2px !important; }
.rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover { background: rgba(212,175,55,0.12) !important; color: #F5D76E !important; border: 1px solid rgba(212,175,55,0.2) !important; }
.rmdp-today span { background: rgba(212,175,55,0.08) !important; color: #F5D76E !important; border: 1px solid rgba(212,175,55,0.2) !important; font-weight: 700 !important; }
.rmdp-selected span, .rmdp-day.rmdp-selected span { background: linear-gradient(135deg,#B8860B,#D4AF37,#F5D76E) !important; color: #050505 !important; font-weight: 700 !important; box-shadow: 0 4px 16px -4px rgba(212,175,55,0.5) !important; border: none !important; }
.rmdp-range { background: rgba(212,175,55,0.08) !important; box-shadow: none !important; }
.rmdp-range span { color: #F5D76E !important; }
.rmdp-range.start span, .rmdp-range.end span { background: linear-gradient(135deg,#B8860B,#D4AF37) !important; color: #050505 !important; font-weight: 700 !important; }
.rmdp-disabled span, .rmdp-day.rmdp-disabled span { color: rgba(148,163,184,0.2) !important; }
.rmdp-deactive span { color: rgba(148,163,184,0.25) !important; }
.rmdp-month-picker, .rmdp-year-picker { background: rgba(11,9,5,0.97) !important; border-radius: 12px !important; }
.rmdp-month-picker .rmdp-day span, .rmdp-year-picker .rmdp-day span { font-size: 12px !important; border-radius: 8px !important; }
.rmdp-month-picker .rmdp-day.rmdp-selected span, .rmdp-year-picker .rmdp-day.rmdp-selected span { background: linear-gradient(135deg,#B8860B,#D4AF37) !important; color: #050505 !important; }
.rmdp-range-label { display: none !important; }
.rmdp-action-button { border-radius: 10px !important; font-size: 12px !important; font-weight: 600 !important; padding: 6px 16px !important; }
.rmdp-ep-arrow, .rmdp-ep-arrow::after { display: none !important; }
.rmdp-border-top { border-top: 1px solid rgba(255,255,255,0.06) !important; }
.rmdp-panel-body li { background: rgba(212,175,55,0.08) !important; border: 1px solid rgba(212,175,55,0.15) !important; border-radius: 8px !important; color: #F5D76E !important; font-size: 12px !important; }
.rmdp-input { background: transparent !important; border: none !important; color: inherit !important; font: inherit !important; padding: 0 !important; width: 100% !important; outline: none !important; }
`;

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
  const pd = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => pd[parseInt(d)]);
}

function parsePersianDate(val: unknown): DateObject | null {
  if (!val) return null;
  const str = String(val);
  const latin = str.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
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
        const val = getNestedValue(row, col.key);
        const str = formatCellValue(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(","),
  );
  const csv = BOM + [headers, ...csvRows].join("\n");
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    `${fileName}.csv`,
  );
}

function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDef<T>[],
  fileName: string,
) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>td,th{font-family:Tahoma;font-size:11pt;text-align:right;direction:rtl;padding:6px 10px;border:1px solid #ddd}th{background:#1a1a1a;color:#F5D76E;font-weight:bold}tr:nth-child(even){background:#f9f9f9}</style></head><body dir="rtl"><table><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr>${rows.map((row) => `<tr>${columns.map((col) => `<td>${formatCellValue(getNestedValue(row, col.key))}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
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
    ),
    th = hh + rows.length * rh + 20;
  const canvas = document.createElement("canvas");
  const s = 2;
  canvas.width = tw * s;
  canvas.height = th * s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(s, s);
  ctx.fillStyle = "#0B0905";
  ctx.fillRect(0, 0, tw, th);
  ctx.fillStyle = "#1A1304";
  ctx.fillRect(0, 0, tw, hh);
  ctx.strokeStyle = "rgba(212,175,55,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hh);
  ctx.lineTo(tw, hh);
  ctx.stroke();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#F5D76E";
  ctx.font = `bold ${fs}px Tahoma,sans-serif`;
  let xo = tw - 10;
  columns.forEach((col, ci) => {
    ctx.fillText(col.label, xo - 8, hh / 2);
    xo -= cw[ci];
  });
  rows.forEach((row, ri) => {
    const y = hh + ri * rh;
    if (ri % 2 === 1) {
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fillRect(0, y, tw, rh);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.moveTo(0, y + rh);
    ctx.lineTo(tw, y + rh);
    ctx.stroke();
    ctx.fillStyle = "#CBD5E1";
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
  ctx.strokeStyle = "rgba(212,175,55,0.15)";
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

/* ── Overlay ── */
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
  const firstFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Focus trap
      if (e.key === "Tab") {
        const modal = overlayRef.current?.querySelector(
          '[role="document"], .modal-content',
        ) as HTMLElement;
        if (!modal) return;
        const focusables = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Auto-focus first focusable
    setTimeout(() => {
      const modal = overlayRef.current;
      if (modal) {
        const first = modal.querySelector<HTMLElement>(
          "button, input, select, textarea",
        );
        if (first) {
          firstFocusableRef.current = first;
          first.focus();
        }
      }
    }, 100);

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
        backgrounds.surface.overlay,
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
          "modal-content relative w-full overflow-hidden",
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

/* ── Action Btn ── */
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
          : "text-slate-400 hover:bg-white/6 hover:text-[#F5D76E]",
      )}
    >
      {children}
    </button>
  );
}

/* ── Pagination Btn ── */
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium",
        animation.base,
        interactive.touch,
        focus.ring,
        disabled && "pointer-events-none opacity-30",
        active
          ? "bg-[#D4AF37]/15 text-[#F5D76E] border border-[#D4AF37]/25"
          : "text-slate-400 hover:bg-white/6 hover:text-white border border-transparent",
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
          role="listbox"
          aria-label={`گزینه‌های ${label}`}
          className={cn(
            "absolute top-full right-0 z-50 mt-1 min-w-40 overflow-hidden",
            layout.radius.md,
            borders.light,
            "bg-[#0B0905]/98 backdrop-blur-2xl",
            shadows.card,
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
              "flex w-full items-center gap-2 px-3 py-2 text-xs text-right",
              animation.colors,
              !value
                ? "text-[#F5D76E] bg-[#D4AF37]/10"
                : "text-slate-400 hover:bg-white/4 hover:text-white",
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
                "flex w-full items-center gap-2 px-3 py-2 text-xs text-right",
                animation.colors,
                value === opt
                  ? "text-[#F5D76E] bg-[#D4AF37]/10"
                  : "text-slate-400 hover:bg-white/4 hover:text-white",
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
            aria-label={`فیلتر تاریخ ${label}`}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium",
              "bg-white/[0.035] backdrop-blur-sm",
              hasRange
                ? "border-[#D4AF37]/25 text-[#F5D76E]"
                : borders.subtle + " text-slate-400",
              animation.base,
              focus.ring,
              "hover:border-[#D4AF37]/18 hover:text-white",
              "max-w-70",
            )}
          >
            <Icon.Calendar />
            <span className="whitespace-nowrap">{label}</span>
            {hasRange && (
              <span className="mr-1 rounded-full bg-[#D4AF37]/15 px-1.5 py-0.5 text-[10px] text-[#F5D76E] whitespace-nowrap truncate max-w-35">
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
          className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-150"
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
  onExportExcel: (s: boolean) => void;
  onExportPNG: (s: boolean) => void;
  onExportCSV: (s: boolean) => void;
  selectedCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
        className={cn(components.ghostButton, "h-9 text-xs px-3 gap-1.5")}
      >
        <Icon.Download />
        <span>خروجی</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="فرمت‌های خروجی"
          className={cn(
            "absolute top-full left-0 z-50 mt-1 min-w-55 overflow-hidden",
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
              role="menuitem"
              onClick={item.action}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-xs text-right",
                animation.colors,
                "text-slate-400 hover:bg-white/4 hover:text-white",
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

/* ── Page Size Selector ── */
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
          borders.subtle,
          "text-slate-400 hover:text-white",
          animation.base,
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
            "absolute bottom-full right-0 z-50 mb-1 min-w-25 overflow-hidden",
            layout.radius.md,
            borders.light,
            "bg-[#0B0905]/98 backdrop-blur-2xl",
            shadows.card,
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
                "flex w-full items-center justify-between px-3 py-2 text-xs",
                animation.colors,
                value === size
                  ? "text-[#F5D76E] bg-[#D4AF37]/10"
                  : "text-slate-400 hover:bg-white/4 hover:text-white",
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

/* ── Error Banner ── */
function ErrorBanner({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-3 mb-3",
        "border-red-500/20 bg-red-500/6",
      )}
    >
      <div className="text-red-400">
        <Icon.AlertCircle />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-300">خطا در دریافت داده</p>
        <p className="text-xs text-red-400/70 truncate mt-0.5">
          {error.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        aria-label="تلاش مجدد برای دریافت داده"
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium",
          "border-red-500/25 text-red-400 hover:bg-red-500/10 hover:text-red-300",
          animation.base,
          focus.ring,
        )}
      >
        <Icon.Refresh />
        تلاش مجدد
      </button>
    </div>
  );
}

/* ── Copy Toast ── */
function CopyToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-200 inline-flex items-center gap-2 rounded-xl px-4 py-2.5",
        "bg-[#0B0905]/95 backdrop-blur-xl border",
        borders.light,
        shadows.card,
        "animate-[fade-up_.3s_cubic-bezier(.22,1,.36,1)_both]",
      )}
    >
      <div className="text-green-400">
        <Icon.CopyDone />
      </div>
      <span className="text-xs font-medium text-white">کپی شد!</span>
    </div>
  );
}

/* ── Pull to Refresh Indicator ── */
function PullIndicator({
  distance,
  isRefreshing,
  threshold,
}: {
  distance: number;
  isRefreshing: boolean;
  threshold: number;
}) {
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
          "bg-[#D4AF37]/10 border border-[#D4AF37]/20",
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
  canCreate = true,
  canUpdate = true,
  canDelete = true,
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
  swrConfig,
  enabled = true,
  onError,
  data: staticData,
}: DynamicTableProps<T>) {
  /* ── Local state ── */
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

  // Debounced search
  const debouncedSearch = useDebounce(search, searchDebounceMs);

  // Copy to clipboard
  const { copied, copiedCell, copy } = useCopyToClipboard();

  /* ── Server-side pagination params ── */
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

  /* ── SWR Data Hook ── */
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
  });

  const data = staticData ?? fetchedData;
  const loading = !staticData && isLoading;

  /* ── Pull to Refresh ── */
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

  // Report errors
  useEffect(() => {
    if (fetchError && onError) onError(fetchError);
  }, [fetchError, onError]);

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

  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    filterableCols.forEach((col) => {
      const s = new Set<string>();
      data.forEach((row) => {
        const v = getNestedValue(row, col.key);
        if (v != null) s.add(String(v));
      });
      opts[col.key] = Array.from(s).sort();
    });
    return opts;
  }, [data, filterableCols]);

  const activeFiltersCount = useMemo(() => {
    return (
      Object.values(filters).filter(Boolean).length +
      Object.values(dateRanges).filter((r) => r.from || r.to).length
    );
  }, [filters, dateRanges]);

  /* ── Client-side filter + sort + paginate ── */
  const filtered = useMemo(() => {
    if (serverSide) return data; // Server already filtered
    let items = [...data];

    // Text filters
    Object.entries(filters).forEach(([key, val]) => {
      if (val)
        items = items.filter((row) => {
          const cv = getNestedValue(row, key);
          return cv != null && String(cv) === val;
        });
    });

    // Date range filters
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

    // Search (debounced)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter((row) =>
        columns.some((col) => {
          const v = getNestedValue(row, col.key);
          return v != null && String(v).toLowerCase().includes(q);
        }),
      );
    }

    // Sort
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
    if (serverSide) return data; // Already paginated by server
    const start = (currentPage - 1) * currentPageSize;
    return filtered.slice(start, start + currentPageSize);
  }, [filtered, currentPage, currentPageSize, serverSide, data]);

  // Reset page on search/filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, dateRanges]);

  // Reset page on page size change
  const handlePageSizeChange = useCallback((newSize: number) => {
    setCurrentPageSize(newSize);
    setPage(1);
  }, []);

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

  /* ── Cell Copy ── */
  const handleCellCopy = useCallback(
    (value: unknown, rowKey: string, colKey: string) => {
      const text = formatCellValue(value);
      if (text && text !== "—") copy(text, `${rowKey}-${colKey}`);
    },
    [copy],
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

  /* ── Double click to edit ── */
  const handleRowDoubleClick = useCallback(
    (row: T) => {
      if (doubleClickToEdit && canUpdate) openEdit(row);
    },
    [doubleClickToEdit, canUpdate, openEdit],
  );

  /* ── Export handlers ── */
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

  /* ── Pagination ── */
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

  // Total column count for colSpan
  const totalColCount =
    (showRowNumbers ? 1 : 0) +
    1 /* checkbox */ +
    visibleCols.length +
    (hasActions ? 1 : 0);

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
      >
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
            {!staticData && (
              <button
                type="button"
                onClick={() => mutate()}
                disabled={isValidating}
                title="بارگذاری مجدد"
                aria-label="بارگذاری مجدد داده‌ها"
                className={cn(
                  components.ghostButton,
                  "h-9 w-9 px-0! justify-center",
                  isValidating && "animate-spin",
                )}
              >
                <Icon.Refresh />
              </button>
            )}
            {searchable && (
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
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
                    "h-9 w-full rounded-xl border pr-9 pl-4 text-xs text-white placeholder-slate-500 outline-none",
                    "bg-white/[0.035] backdrop-blur-sm",
                    borders.subtle,
                    animation.base,
                    focus.ring,
                    "hover:border-[#D4AF37]/18",
                    "sm:w-48",
                  )}
                />
                {search && debouncedSearch !== search && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="h-3 w-3 rounded-full border-2 border-[#D4AF37]/40 border-t-[#F5D76E] animate-spin" />
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
                className={cn(components.ctaSmall, "h-9 text-xs")}
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
            className="mb-3 flex items-center gap-2 text-xs text-slate-500"
            role="status"
            aria-live="polite"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>در حال بروزرسانی…</span>
          </div>
        )}

        {/* ── Filters ── */}
        {hasFilters && (
          <div
            className="mb-3 flex flex-wrap items-center gap-2"
            role="toolbar"
            aria-label="فیلترها"
          >
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Icon.Filter />
              فیلترها:
            </span>
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

        {/* ── Selected ── */}
        {selectedRows.size > 0 && (
          <div
            className={cn(
              "mb-3 flex items-center justify-between rounded-xl px-4 py-2.5",
              "bg-[#D4AF37]/8 border border-[#D4AF37]/15",
            )}
            role="status"
            aria-live="polite"
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
          ref={pullRef as any}
          className={cn(
            "overflow-hidden",
            layout.radius.lg,
            borders.light,
            backgrounds.surface.glass,
            shadows.card,
          )}
        >
          {/* Pull to refresh indicator */}
          <div className="block md:hidden">
            <PullIndicator
              distance={pullDistance}
              isRefreshing={isRefreshing}
              threshold={80}
            />
          </div>

          {(loading || isValidating) && (
            <div className="relative h-0.5 w-full overflow-hidden bg-[#D4AF37]/10">
              <div className="absolute inset-y-0 right-0 w-1/3 animate-[shimmer_1.5s_linear_infinite] bg-linear-to-l from-transparent via-[#D4AF37]/40 to-transparent" />
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
                  stickyHeader
                    ? "sticky top-0 z-10 bg-[#0B0905]/95 backdrop-blur-xl"
                    : ""
                }
              >
                <tr className="border-b border-white/6" role="row">
                  {/* Checkbox column */}
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

                  {/* Row number column */}
                  {showRowNumbers && (
                    <th
                      className="w-12 px-3 py-3 text-xs font-semibold text-slate-500"
                      role="columnheader"
                      aria-label="شماره ردیف"
                    >
                      #
                    </th>
                  )}

                  {/* Data columns */}
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
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
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
                      className="border-b border-white/4"
                      role="row"
                      aria-busy="true"
                    >
                      <td className="px-3 py-3">
                        <div className="h-5 w-5 rounded bg-white/4 animate-pulse" />
                      </td>
                      {showRowNumbers && (
                        <td className="px-3 py-3">
                          <div className="h-4 w-6 rounded bg-white/4 animate-pulse" />
                        </td>
                      )}
                      {visibleCols.map((col) => (
                        <td key={col.key} className="px-4 py-3">
                          <div
                            className="h-4 rounded bg-white/4 animate-pulse"
                            style={{ width: `${60 + Math.random() * 40}%` }}
                          />
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 rounded bg-white/4 animate-pulse" />
                        </td>
                      )}
                    </tr>
                  ))
                ) : paginatedRows.length === 0 ? (
                  <tr role="row">
                    <td colSpan={totalColCount} className="py-16 text-center">
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
                          "group border-b border-white/4 last:border-b-0",
                          animation.colors,
                          isSelected ? "bg-[#D4AF37]/4" : "hover:bg-white/2.5",
                          doubleClickToEdit && canUpdate && "cursor-pointer",
                        )}
                      >
                        {/* Checkbox */}
                        <td className="w-10 px-3 py-3" role="cell">
                          <button
                            type="button"
                            onClick={() => toggleRowSelection(row)}
                            aria-label={`${isSelected ? "لغو انتخاب" : "انتخاب"} ردیف ${toPersianDigits(globalRowIndex)}`}
                            aria-pressed={isSelected}
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

                        {/* Row number */}
                        {showRowNumbers && (
                          <td
                            className="w-12 px-3 py-3 text-xs text-slate-500 font-mono"
                            role="cell"
                            aria-label={`ردیف ${toPersianDigits(globalRowIndex)}`}
                          >
                            {toPersianDigits(globalRowIndex)}
                          </td>
                        )}

                        {/* Data cells */}
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
                                "px-4 py-3 text-sm text-slate-300 relative group/cell",
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
                                {/* Copy indicator */}
                                {canCopy && (
                                  <span
                                    className={cn(
                                      "shrink-0 transition-all duration-200",
                                      isCopied
                                        ? "text-green-400 opacity-100"
                                        : "text-slate-600 opacity-0 group-hover/cell:opacity-50",
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

                        {/* Actions */}
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
          <div className="block md:hidden divide-y divide-white/4">
            {loading && data.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`msk-${i}`} className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="h-5 w-5 rounded bg-white/4 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 rounded bg-white/4 animate-pulse" />
                      <div className="h-4 w-32 rounded bg-white/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            ) : paginatedRows.length === 0 ? (
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
                const globalIdx = (currentPage - 1) * currentPageSize + ri + 1;

                return (
                  <div
                    key={rowKey}
                    role="article"
                    aria-label={`ردیف ${toPersianDigits(globalIdx)}`}
                    onDoubleClick={() => handleRowDoubleClick(row)}
                    className={cn(
                      "group p-4",
                      animation.colors,
                      isSelected ? "bg-[#D4AF37]/4" : "active:bg-white/3",
                    )}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {showRowNumbers && (
                          <span className="text-[10px] text-slate-500 font-mono w-5">
                            {toPersianDigits(globalIdx)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleRowSelection(row)}
                          aria-label={`${isSelected ? "لغو انتخاب" : "انتخاب"} ردیف`}
                          aria-pressed={isSelected}
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
                      <div
                        className="mt-3 flex items-center gap-1 border-t border-white/4 pt-3 mr-8"
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
              className="flex flex-col items-center gap-3 border-t border-white/6 px-4 py-3 sm:flex-row sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500" aria-live="polite">
                  نمایش{" "}
                  <span className="font-medium text-slate-300">
                    {toPersianDigits((currentPage - 1) * currentPageSize + 1)}
                  </span>{" "}
                  تا{" "}
                  <span className="font-medium text-slate-300">
                    {toPersianDigits(
                      Math.min(currentPage * currentPageSize, totalItems),
                    )}
                  </span>{" "}
                  از{" "}
                  <span className="font-medium text-slate-300">
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

              {/* Desktop pagination */}
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

              {/* Mobile pagination — simple prev/next */}
              <div className="flex sm:hidden items-center gap-3 w-full justify-between">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="صفحه قبلی"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-xl border px-4 text-xs font-medium",
                    borders.subtle,
                    animation.base,
                    focus.ring,
                    currentPage === 1
                      ? "opacity-30 pointer-events-none text-slate-500"
                      : "text-slate-300 hover:text-white hover:border-[#D4AF37]/20",
                  )}
                >
                  <Icon.ChevronRight />
                  <span>قبلی</span>
                </button>

                <span
                  className="text-xs font-medium text-slate-400"
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
                    "inline-flex h-9 items-center gap-1.5 rounded-xl border px-4 text-xs font-medium",
                    borders.subtle,
                    animation.base,
                    focus.ring,
                    currentPage === totalPages
                      ? "opacity-30 pointer-events-none text-slate-500"
                      : "text-slate-300 hover:text-white hover:border-[#D4AF37]/20",
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

      {/* ── Copy Toast ── */}
      <CopyToast visible={copied} />

      {/* ══════════════════════════════════════════════
          MODALS
          ══════════════════════════════════════════════ */}

      {/* ── View ── */}
      <Overlay open={modalMode === "view"} onClose={closeModal} wide>
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
          <h3 className={cn(typography.h4, gradients.textPrimary)}>جزئیات</h3>
          <button
            type="button"
            onClick={closeModal}
            aria-label="بستن پنجره جزئیات"
            className={cn(
              "rounded-lg p-1 text-slate-500",
              animation.colors,
              "hover:bg-white/6 hover:text-white",
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
                    "rounded-xl p-3",
                    "bg-white/2.5",
                    borders.subtle,
                  )}
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    {col.label}
                  </dt>
                  <dd className="text-sm text-slate-200 wrap-break-word">
                    {display}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div className="border-t border-white/6 px-5 py-3 flex justify-start gap-2">
          {canUpdate && selectedRow && (
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

      {/* ── Create / Edit ── */}
      <Overlay
        open={modalMode === "create" || modalMode === "edit"}
        onClose={closeModal}
        wide
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <h3 className={cn(typography.h4, gradients.textPrimary)}>
              {modalMode === "create" ? "ایجاد رکورد جدید" : "ویرایش رکورد"}
            </h3>
            <button
              type="button"
              onClick={closeModal}
              aria-label="بستن فرم"
              className={cn(
                "rounded-lg p-1 text-slate-500",
                animation.colors,
                "hover:bg-white/6 hover:text-white",
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

                return (
                  <div key={col.key} className={isFull ? "sm:col-span-2" : ""}>
                    <label
                      htmlFor={`field-${col.key}`}
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {col.label}
                      {col.required && (
                        <span className="mr-1 text-[#D4AF37]">*</span>
                      )}
                    </label>

                    {isDate ? (
                      <DatePicker
                        value={fv ? String(fv) : ""}
                        onChange={(date) => {
                          if (date && !Array.isArray(date))
                            updateField(col.key, date.format("YYYY/MM/DD"));
                          else updateField(col.key, "");
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
                            aria-label={`انتخاب ${col.label}`}
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
                    ) : col.options ? (
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
                          checked={Boolean(fv)}
                          onChange={(e) =>
                            updateField(col.key, e.target.checked)
                          }
                          className={cn(
                            "h-4 w-4 rounded border-white/20 bg-white/4 text-[#D4AF37]",
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
                      <p
                        id={`error-${col.key}`}
                        role="alert"
                        className="mt-1 text-[11px] text-red-400"
                      >
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-start gap-2 border-t border-white/6 px-5 py-3">
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
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

      {/* ── Delete ── */}
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
                "bg-white/2.5",
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
              aria-busy={submitting}
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
