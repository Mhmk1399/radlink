"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlinePlus,
  HiOutlineQrCode,
  HiOutlineShare,
  HiOutlineUserPlus,
  HiOutlineXMark,
} from "react-icons/hi2";
import {
  buildVCardFileName,
  buildVCardHref,
  getContactSaveData,
} from "@/builder/blocks/contact-save/ContactSaveBlock";
import type { PageBlock } from "@/types/blocks/builder.types";

type FloatingActionsMode = "editor" | "preview" | "public";

function normalizeTargetUrl(value?: string) {
  const url = value?.trim();
  if (url) {
    if (/^https?:\/\//i.test(url)) return url;
    if (typeof window !== "undefined") {
      return new URL(`/${url.replace(/^\/+/, "")}`, window.location.origin).href;
    }
  }
  return "";
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export default function LandingFloatingActions({
  contactBlock,
  pageUrl,
  qrImageUrl,
  mode = "public",
  enabled = true,
  onEditContact,
}: {
  contactBlock?: PageBlock | null;
  pageUrl?: string;
  qrImageUrl?: string;
  mode?: FloatingActionsMode;
  enabled?: boolean;
  onEditContact?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [generatedQr, setGeneratedQr] = useState("");
  const [feedback, setFeedback] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const targetUrl = useMemo(() => normalizeTargetUrl(pageUrl), [pageUrl]);
  const contactData = contactBlock
    ? getContactSaveData(contactBlock)
    : null;
  const canSaveContact = Boolean(
    contactData?.phoneNumber.trim() && contactBlock && !contactBlock.hidden,
  );

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (!qrOpen || qrImageUrl || generatedQr || !targetUrl) return;
    let cancelled = false;
    void import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(targetUrl, {
          width: 420,
          margin: 2,
          errorCorrectionLevel: "M",
        }),
      )
      .then((image) => {
        if (!cancelled) setGeneratedQr(image);
      })
      .catch(() => {
        if (!cancelled) setFeedback("ساخت QR کد انجام نشد.");
      });
    return () => {
      cancelled = true;
    };
  }, [generatedQr, qrImageUrl, qrOpen, targetUrl]);

  const sharePage = useCallback(async () => {
    if (!targetUrl) {
      setFeedback("لینک صفحه بعد از ذخیره در دسترس قرار می‌گیرد.");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: targetUrl });
        setFeedback("صفحه به‌اشتراک گذاشته شد.");
      } else {
        await copyText(targetUrl);
        setFeedback("لینک صفحه کپی شد.");
      }
      setOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await copyText(targetUrl);
        setFeedback("لینک صفحه کپی شد.");
        setOpen(false);
      } catch {
        setFeedback("اشتراک‌گذاری لینک انجام نشد.");
      }
    }
  }, [targetUrl]);

  if (!enabled) return null;

  const actionClass =
    "group flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-2 text-right text-slate-700 transition hover:bg-slate-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-45";
  const iconClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-700";

  return (
    <>
      <div
        ref={rootRef}
        data-floating-mode={mode}
        className="flex flex-col items-end gap-2.5"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 9000,
        }}
        dir="rtl"
      >
        {feedback && (
          <div
            role="status"
            className="mb-1 max-w-60 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-xl"
          >
            {feedback}
          </div>
        )}

        <div
          className={[
            "w-48 origin-bottom-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.22)] backdrop-blur-xl transition duration-200 sm:w-52",
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-95 opacity-0",
          ].join(" ")}
          aria-hidden={!open}
        >
          {canSaveContact && contactData && (
            <a
              href={
                mode === "editor" ? undefined : buildVCardHref(contactData)
              }
              download={
                mode === "editor"
                  ? undefined
                  : buildVCardFileName(contactData)
              }
              onClick={(event) => {
                if (mode === "editor") {
                  event.preventDefault();
                  onEditContact?.();
                  setOpen(false);
                }
              }}
              className={actionClass}
              title="ذخیره در مخاطبین دستگاه"
            >
              <span className={iconClass}>
                <HiOutlineUserPlus className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-extrabold">
                  ذخیره مخاطب
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                  افزودن به دفترچه تلفن
                </span>
              </span>
            </a>
          )}

          <button
            type="button"
            disabled={!targetUrl}
            onClick={() => {
              setQrOpen(true);
              setOpen(false);
            }}
            className={actionClass}
            title="نمایش QR کد صفحه"
          >
            <span className={iconClass}>
              <HiOutlineQrCode className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-extrabold">QR صفحه</span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                نمایش کد برای اسکن
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => void sharePage()}
            className={actionClass}
            title="اشتراک‌گذاری لینک صفحه"
          >
            <span className={iconClass}>
              <HiOutlineShare className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-extrabold">
                اشتراک صفحه
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                ارسال یا کپی لینک
              </span>
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setFeedback("");
            setOpen((current) => !current);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-white shadow-[0_12px_36px_rgba(15,23,42,0.3)] transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
          aria-label={open ? "بستن ابزارهای صفحه" : "باز کردن ابزارهای صفحه"}
          aria-expanded={open}
        >
          {open ? (
            <HiOutlineXMark className="h-6 w-6" />
          ) : (
            <HiOutlinePlus className="h-6 w-6" />
          )}
        </button>
      </div>

      {qrOpen && (
        <div
          className="fixed inset-0 z-[9500] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="QR کد صفحه"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setQrOpen(false);
          }}
        >
          <section
            className="relative w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl sm:p-6"
            dir="rtl"
          >
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
              aria-label="بستن QR کد"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-black text-slate-950">QR کد صفحه</h2>
            <p className="mt-1 text-xs text-slate-500">
              برای باز کردن این صفحه اسکن کنید.
            </p>
            <div className="mx-auto mt-5 flex aspect-square w-full max-w-64 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
              {qrImageUrl || generatedQr ? (
                <img
                  src={qrImageUrl || generatedQr}
                  alt="QR کد صفحه"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              )}
            </div>
            <p
              className="mt-4 truncate rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500"
              dir="ltr"
              title={targetUrl}
            >
              {targetUrl}
            </p>
          </section>
        </div>
      )}
    </>
  );
}
