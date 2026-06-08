"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineChevronDown, HiOutlineCheck } from "react-icons/hi2";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type SelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  preview?: React.ReactNode;
};

type SelectFieldProps = {
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function SelectField({
  value,
  options,
  onChange,
  placeholder = "انتخاب کنید",
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={[
          "flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 text-right transition",
          "border-neutral-200 bg-neutral-50 text-base",
          isOpen
            ? "border-neutral-400 bg-white ring-2 ring-neutral-100"
            : "hover:border-neutral-300",
        ].join(" ")}
      >
        {/* Selected preview */}
        {selected ? (
          <div className="flex flex-1 items-center gap-2.5">
            {selected.icon && (
              <span className="shrink-0 text-neutral-500">{selected.icon}</span>
            )}
            {selected.preview && (
              <span className="flex shrink-0 items-center">
                {selected.preview}
              </span>
            )}
            <span className="flex-1 text-[13px] font-semibold text-neutral-800">
              {selected.label}
            </span>
          </div>
        ) : (
          <span className="flex-1 text-[13px] text-neutral-400">
            {placeholder}
          </span>
        )}

        <HiOutlineChevronDown
          size={15}
          className={[
            "shrink-0 text-neutral-400 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Dropdown */}
      <div
        className={[
          "absolute inset-x-0 top-full z-[500] mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)] transition-all duration-200",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
        ].join(" ")}
      >
        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition-all",
                  isActive
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800",
                ].join(" ")}
              >
                {/* Preview */}
                {option.preview && (
                  <span className="flex shrink-0 items-center">
                    {option.preview}
                  </span>
                )}

                {/* Icon */}
                {option.icon && !option.preview && (
                  <span className="shrink-0 text-neutral-400">
                    {option.icon}
                  </span>
                )}

                {/* Label */}
                <span
                  className={[
                    "flex-1 text-[13px]",
                    isActive ? "font-bold" : "font-medium",
                  ].join(" ")}
                >
                  {option.label}
                </span>

                {/* Checkmark */}
                {isActive && (
                  <HiOutlineCheck
                    size={16}
                    className="shrink-0 text-neutral-800"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
