"use client";

import { useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { FaArrowUpRightFromSquare, FaXmark } from "react-icons/fa6";

type ImagePreviewModalProps = {
  open: boolean;
  src: string;
  alt?: string;
  title?: string;
  onClose: () => void;
};

export default function ImagePreviewModal({
  open,
  src,
  alt = "پیش‌نمایش تصویر",
  title,
  onClose,
}: ImagePreviewModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  if (!open || !src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title || alt}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-[min(88dvh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/5 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white">
          <p className="min-w-0 truncate text-sm font-bold">{title || alt}</p>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              title="باز کردن تصویر اصلی"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <FaArrowUpRightFromSquare className="h-4 w-4" />
              <span className="sr-only">باز کردن تصویر اصلی</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              title="بستن"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <FaXmark className="h-5 w-5" />
              <span className="sr-only">بستن</span>
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            sizes="100vw"
            className="object-contain p-3 sm:p-6"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
