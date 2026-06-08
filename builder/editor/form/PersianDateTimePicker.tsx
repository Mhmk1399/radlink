"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import jalaali from "jalaali-js";

import {
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineCalendarDays,
  HiOutlineClock,
} from "react-icons/hi2";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type PersianDateTimePickerProps = {
  value: string;
  onChange: (isoString: string) => void;
};

type JalaaliDate = {
  jy: number;
  jm: number;
  jd: number;
};

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function toJalaali(date: Date): JalaaliDate {
  return jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

function toGregorian(jy: number, jm: number, jd: number): Date {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

function getMonthDays(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}

function getFirstDayOfWeek(jy: number, jm: number): number {
  const g = jalaali.toGregorian(jy, jm, 1);
  const d = new Date(g.gy, g.gm - 1, g.gd);
  // Saturday = 0 in our week
  return (d.getDay() + 1) % 7;
}

function parseISOSafe(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toPersianDigits(str: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function PersianDateTimePicker({
  value,
  onChange,
}: PersianDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  /* Parse current value */
  const currentDate = useMemo(() => parseISOSafe(value), [value]);

  const now = useMemo(() => new Date(), []);

  const initialJalaali = useMemo(() => {
    return toJalaali(currentDate ?? now);
  }, [currentDate, now]);

  const [viewYear, setViewYear] = useState(initialJalaali.jy);
  const [viewMonth, setViewMonth] = useState(initialJalaali.jm);

  const [selectedJy, setSelectedJy] = useState(initialJalaali.jy);
  const [selectedJm, setSelectedJm] = useState(initialJalaali.jm);
  const [selectedJd, setSelectedJd] = useState(initialJalaali.jd);

  const [hour, setHour] = useState(currentDate ? currentDate.getHours() : 23);
  const [minute, setMinute] = useState(
    currentDate ? currentDate.getMinutes() : 59,
  );

  /* Sync when value changes externally */
  useEffect(() => {
    const d = parseISOSafe(value);
    if (!d) return;
    const j = toJalaali(d);
    setSelectedJy(j.jy);
    setSelectedJm(j.jm);
    setSelectedJd(j.jd);
    setViewYear(j.jy);
    setViewMonth(j.jm);
    setHour(d.getHours());
    setMinute(d.getMinutes());
  }, [value]);

  /* Calendar grid */
  const monthDays = getMonthDays(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const calendarCells = useMemo(() => {
    const cells: Array<number | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= monthDays; d++) cells.push(d);
    return cells;
  }, [firstDay, monthDays]);

  /* Navigation */
  const goNextMonth = useCallback(() => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const goPrevMonth = useCallback(() => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  /* Select day */
  const handleDayClick = useCallback(
    (day: number) => {
      setSelectedJy(viewYear);
      setSelectedJm(viewMonth);
      setSelectedJd(day);

      const greg = toGregorian(viewYear, viewMonth, day);
      greg.setHours(hour, minute, 0, 0);
      onChange(greg.toISOString());
    },
    [viewYear, viewMonth, hour, minute, onChange],
  );

  /* Time change */
  const handleTimeChange = useCallback(
    (newHour: number, newMinute: number) => {
      setHour(newHour);
      setMinute(newMinute);

      const greg = toGregorian(selectedJy, selectedJm, selectedJd);
      greg.setHours(newHour, newMinute, 0, 0);
      onChange(greg.toISOString());
    },
    [selectedJy, selectedJm, selectedJd, onChange],
  );

  /* Is selected */
  const isSelected = (day: number) =>
    day === selectedJd && viewMonth === selectedJm && viewYear === selectedJy;

  /* Is today */
  const todayJ = toJalaali(now);
  const isToday = (day: number) =>
    day === todayJ.jd && viewMonth === todayJ.jm && viewYear === todayJ.jy;

  /* Display text */
  const displayText = currentDate
    ? (() => {
        const j = toJalaali(currentDate);
        return toPersianDigits(
          `${j.jy}/${padTwo(j.jm)}/${padTwo(j.jd)} — ${padTwo(currentDate.getHours())}:${padTwo(currentDate.getMinutes())}`,
        );
      })()
    : "تاریخ و ساعت را انتخاب کنید";

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={[
          "flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 text-right text-base transition",
          currentDate
            ? "border-neutral-200 bg-white text-neutral-800"
            : "border-neutral-200 bg-neutral-50 text-neutral-400",
          "hover:border-neutral-300 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100",
        ].join(" ")}
      >
        <HiOutlineCalendarDays
          size={18}
          className="shrink-0 text-neutral-400"
        />
        <span className="flex-1 font-medium">{displayText}</span>
        <HiOutlineChevronLeft
          size={14}
          className={[
            "shrink-0 text-neutral-400 transition-transform",
            isOpen ? "rotate-90" : "",
          ].join(" ")}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute inset-x-0 top-full z-[500] mt-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]">
          {/* Month nav */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100"
            >
              <HiOutlineChevronRight size={16} />
            </button>

            <span className="text-[13px] font-bold text-neutral-800">
              {MONTH_NAMES[viewMonth - 1]} {toPersianDigits(`${viewYear}`)}
            </span>

            <button
              type="button"
              onClick={goNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100"
            >
              <HiOutlineChevronLeft size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-1 text-center text-[10px] font-bold text-neutral-400"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={[
                    "flex aspect-square items-center justify-center rounded-xl text-[12px] font-semibold transition-all",
                    selected
                      ? "bg-neutral-900 text-white shadow-sm"
                      : today
                        ? "bg-neutral-100 font-bold text-neutral-800"
                        : "text-neutral-600 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {toPersianDigits(`${day}`)}
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <div className="my-3 h-px bg-neutral-100" />

          {/* Time picker */}
          <div className="flex items-center justify-center gap-3">
            <HiOutlineClock size={16} className="text-neutral-400" />

            <div className="flex items-center gap-1.5" dir="ltr">
              {/* Hour */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={padTwo(hour)}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n) && n >= 0 && n <= 23) {
                    handleTimeChange(n, minute);
                  }
                }}
                className="w-11 rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 text-center text-base font-bold text-neutral-800 outline-none transition focus:border-neutral-400 focus:bg-white"
              />

              <span className="text-lg font-bold text-neutral-300">:</span>

              {/* Minute */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={padTwo(minute)}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isFinite(n) && n >= 0 && n <= 59) {
                    handleTimeChange(hour, n);
                  }
                }}
                className="w-11 rounded-lg border border-neutral-200 bg-neutral-50 py-1.5 text-center text-base font-bold text-neutral-800 outline-none transition focus:border-neutral-400 focus:bg-white"
              />
            </div>

            <span className="text-[11px] font-medium text-neutral-400">
              ساعت
            </span>
          </div>

          {/* Confirm */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full rounded-xl bg-neutral-900 py-2.5 text-center text-[13px] font-bold text-white transition hover:bg-neutral-800"
          >
            تأیید
          </button>
        </div>
      )}
    </div>
  );
}
