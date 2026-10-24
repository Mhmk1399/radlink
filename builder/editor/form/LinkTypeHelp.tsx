"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";

const LINK_EXAMPLES = [
  { label: "وب‌سایت", value: "https://example.com" },
  { label: "تماس تلفنی", value: "tel:09123456789" },
  { label: "ایمیل", value: "mailto:name@example.com" },
  { label: "واتساپ", value: "https://wa.me/989123456789" },
  { label: "تلگرام", value: "https://t.me/username" },
] as const;

export function LinkTypeHelp({ onSelect }: { onSelect: (value: string) => void }) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative shrink-0"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label="راهنمای انواع لینک"
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 items-center group justify-center rounded-xl border border-blue-200 bg-white   transition hover:border-sky-200 hover:bg-sky-500  focus:outline-none focus:ring-2 focus:ring-sky-100"
      >
        <HiOutlineQuestionMarkCircle className="text-blue-500 group-hover:text-sky-50" size={19} />
      </button>

      {open && <div
        id={panelId}
        role="dialog"
        aria-label="فرمت‌های قابل استفاده برای لینک"
        className={[
          "absolute left-0 top-full z-[80] mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-3 text-right shadow-xl transition",
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0",
        ].join(" ")}
      >
        <p className="mb-2 text-xs font-bold text-neutral-800">
          فرمت‌های قابل استفاده
        </p>
        <div className="space-y-1.5">
          {LINK_EXAMPLES.map((example) => (
            <button
              type="button"
              key={example.label}
              onClick={() => {
                onSelect(example.value);
                setOpen(false);
                rootRef.current?.parentElement?.querySelector("input")?.focus();
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg bg-neutral-50 px-2.5 py-2 text-right transition hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <span className="shrink-0 text-[11px] font-medium text-neutral-500">
                {example.label}
              </span>
              <code
                dir="ltr"
                className="min-w-0 truncate text-[10px] text-sky-700"
                title={example.value}
              >
                {example.value}
              </code>
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-5 text-neutral-400">
          روی یک نمونه بزنید تا در کادر لینک قرار بگیرد؛ سپس آن را ویرایش کنید.
          برای شماره‌های بین‌المللی از کد کشور، مانند ‎+98، استفاده کنید.
        </p>
      </div>}
    </div>
  );
}
