"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import type { PageBlock } from "@/types/blocks/builder.types";

/* ================================================================ */
/*  Types                                                            */
/* ================================================================ */

type PhonePreviewModalProps = {
  open: boolean;
  blocks: PageBlock[];
  onClose: () => void;
};

/* ================================================================ */
/*  Component                                                        */
/* ================================================================ */

export default function PhonePreviewModal({
  open,
  blocks,
  onClose,
}: PhonePreviewModalProps) {
  /* ── sorted blocks ─────────────────────────────────────────────── */
  const sortedBlocks = React.useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );

  /* ── animation state ───────────────────────────────────────────── */
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /* ── body scroll lock ──────────────────────────────────────────── */
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  /* ── keyboard ──────────────────────────────────────────────────── */
  const stableOnClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableOnClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, stableOnClose]);

  /* ── backdrop click ────────────────────────────────────────────── */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phoneRef.current && !phoneRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!visible) return null;

  /* ── render ────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[9999]"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="پیش‌نمایش موبایل"
      onClick={handleBackdropClick}
    >
      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          backgroundColor: animating
            ? "rgba(2, 6, 23, 0.85)"
            : "rgba(2, 6, 23, 0)",
          backdropFilter: animating ? "blur(24px)" : "blur(0px)",
          WebkitBackdropFilter: animating ? "blur(24px)" : "blur(0px)",
        }}
      />

      {/* ── Ambient light blobs ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500"
        style={{ opacity: animating ? 1 : 0 }}
      >
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-4 overflow-y-auto p-3 sm:gap-5 sm:p-5">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div
          className="flex w-full max-w-[440px] items-start justify-between gap-3 transition-all duration-500"
          style={{
            opacity: animating ? 1 : 0,
            transform: animating ? "translateY(0)" : "translateY(-20px)",
          }}
        ></div>

        {/* ── Phone Device ─────────────────────────────────────────── */}
        <div
          ref={phoneRef}
          className="transition-all duration-500 ease-out"
          style={{
            opacity: animating ? 1 : 0,
            transform: animating
              ? "translateY(0) scale(1)"
              : "translateY(40px) scale(0.92)",
          }}
        >
          {/* Outer glow ring */}
          <div className="relative">
            {/* Glow behind phone */}
            <div className="pointer-events-none absolute -inset-8 rounded-[64px] bg-gradient-to-b from-violet-500/10 via-transparent to-cyan-500/10 blur-2xl" />

            {/* Phone body */}
            <div
              className="relative overflow-hidden rounded-[52px] bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-[6px] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_40px_100px_-20px_rgba(0,0,0,0.7),0_0_40px_rgba(139,92,246,0.12)]"
              style={{
                width: "min(372px, calc(100vw - 44px))",
                height: "min(806px, calc(100dvh - 82px))",
              }}
            >
              {/* Side buttons (volume + power) */}
              <div className="pointer-events-none">
                {/* Silent switch */}
                <div className="absolute -left-[2px] top-[100px] h-6 w-[3px] rounded-l-sm bg-zinc-700" />
                {/* Volume up */}
                <div className="absolute -left-[2px] top-[140px] h-10 w-[3px] rounded-l-sm bg-zinc-700" />
                {/* Volume down */}
                <div className="absolute -left-[2px] top-[185px] h-10 w-[3px] rounded-l-sm bg-zinc-700" />
                {/* Power */}
                <div className="absolute -right-[2px] top-[160px] h-14 w-[3px] rounded-r-sm bg-zinc-700" />
              </div>

              {/* Inner bezel */}
              <div className="relative h-full w-full overflow-hidden rounded-[46px] ring-1 ring-white/[0.06]">
                {/* Screen */}
                <div className="relative h-full w-full bg-white">
                  {/* ── Status bar ─────────────────────────────────── */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-end justify-between px-7 pb-1 pt-3">
                    {/* Time */}
                    <span className="text-[14px] font-bold text-black">
                      ۹:۴۱
                    </span>

                    {/* Status icons */}
                    <div className="flex items-center gap-1">
                      {/* Signal */}
                      <svg
                        width="17"
                        height="12"
                        viewBox="0 0 17 12"
                        fill="none"
                        className="text-black"
                      >
                        <rect
                          x="0"
                          y="8"
                          width="3"
                          height="4"
                          rx="0.5"
                          fill="currentColor"
                        />
                        <rect
                          x="4.5"
                          y="5.5"
                          width="3"
                          height="6.5"
                          rx="0.5"
                          fill="currentColor"
                        />
                        <rect
                          x="9"
                          y="3"
                          width="3"
                          height="9"
                          rx="0.5"
                          fill="currentColor"
                        />
                        <rect
                          x="13.5"
                          y="0"
                          width="3"
                          height="12"
                          rx="0.5"
                          fill="currentColor"
                        />
                      </svg>

                      {/* WiFi */}
                      <svg
                        width="16"
                        height="12"
                        viewBox="0 0 16 12"
                        fill="none"
                        className="text-black"
                      >
                        <path
                          d="M8 10.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM4.1 8.2a5.5 5.5 0 017.8 0M1.5 5.5a9 9 0 0113 0"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* Battery */}
                      <div className="flex items-center gap-[2px]">
                        <div className="h-[11px] w-[22px] rounded-[3px] border-[1.5px] border-black p-[1.5px]">
                          <div className="h-full w-[75%] rounded-[1px] bg-black" />
                        </div>
                        <div className="h-[5px] w-[1.5px] rounded-r-[1px] bg-black opacity-50" />
                      </div>
                    </div>
                  </div>

                  {/* ── Dynamic Island ─────────────────────────────── */}
                  <div className="pointer-events-none absolute left-1/2 top-2 z-40 -translate-x-1/2">
                    <div className="flex h-[32px] w-[120px] items-center justify-center rounded-full bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                      {/* Camera dot */}
                      <div className="absolute right-[26px] h-[10px] w-[10px] rounded-full bg-zinc-900 ring-1 ring-zinc-700/50">
                        <div className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/30" />
                      </div>
                    </div>
                  </div>

                  {/* ── Scrollable content ─────────────────────────── */}
                  <div
                    className="h-full w-full overflow-y-auto overflow-x-hidden"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    <style>{`
                      .phone-scroll-content::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>

                    <div className="phone-scroll-content min-h-full pb-10 pt-[58px]">
                      {sortedBlocks.length === 0 ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
                            <span className="text-2xl">📄</span>
                          </div>
                          <p className="text-sm font-medium text-slate-500">
                            هنوز بلاکی اضافه نشده است
                          </p>
                          <p className="text-xs text-slate-400">
                            بلاک‌ها را در ویرایشگر اضافه کنید تا اینجا نمایش
                            داده شوند.
                          </p>
                        </div>
                      ) : (
                        sortedBlocks.map((block) => {
                          const config =
                            blockRegistry[
                              block.type as keyof typeof blockRegistry
                            ];

                          if (!config) {
                            return (
                              <div
                                key={block.instanceId}
                                className="mx-3 mb-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600"
                              >
                                بلاک «{block.type}» ثبت نشده است
                              </div>
                            );
                          }

                          const BlockComponent =
                            config.component as React.ComponentType<{
                              block: PageBlock;
                              mode: "preview";
                            }>;

                          return (
                            <BlockComponent
                              key={block.instanceId}
                              block={block}
                              mode="preview"
                            />
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* ── Home indicator ─────────────────────────────── */}
                  <div className="pointer-events-none absolute bottom-[6px] left-1/2 z-30 -translate-x-1/2">
                    <div className="h-[5px] w-[130px] rounded-full bg-black/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-[52px] bg-gradient-to-b from-white/[0.04] to-transparent" />
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center gap-2 transition-all duration-500"
          style={{
            opacity: animating ? 1 : 0,
            transform: animating ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-center text-[11px] text-slate-500">
            Esc یا کلیک بیرون گوشی → بستن
          </p>
        </div>
      </div>
    </div>
  );
}
