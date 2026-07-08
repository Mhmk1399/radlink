"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { StyleSheetManager } from "styled-components";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { PageLogoPreview } from "@/builder/BuilderCanvas";
import LandingFloatingActions from "@/components/landing/LandingFloatingActions";
import type { PageBlock } from "@/types/blocks/builder.types";
import type { LogoHeaderSettings } from "@/lib/design/logo-header";

type PhonePreviewModalProps = {
  open: boolean;
  blocks: PageBlock[];
  background?: {
    color?: string;
    image?: string;
  };
  logo?: string;
  logoShape?: "square" | "circle";
  logoHeader?: Partial<LogoHeaderSettings>;
  pageUrl?: string;
  showFloatingActions?: boolean;
  onClose: () => void;
};

const PREVIEW_ROOT_ID = "phone-preview-root";

function clonePreviewStyles(targetDocument: Document) {
  targetDocument.head
    .querySelectorAll("[data-phone-preview-cloned]")
    .forEach((node) => node.remove());

  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    const clone = node.cloneNode(true) as HTMLElement;
    clone.setAttribute("data-phone-preview-cloned", "true");
    targetDocument.head.appendChild(clone);
  });

  const scrollbarOverride = targetDocument.createElement("style");
  scrollbarOverride.setAttribute("data-phone-preview-cloned", "true");
  scrollbarOverride.textContent = `
    html,
    body,
    #${PREVIEW_ROOT_ID},
    #${PREVIEW_ROOT_ID} * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }

    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    #${PREVIEW_ROOT_ID}::-webkit-scrollbar,
    #${PREVIEW_ROOT_ID} *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      background: transparent !important;
    }
  `;
  targetDocument.head.appendChild(scrollbarOverride);
}

function buildIframeDocument() {
  return `<!doctype html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="${window.location.origin}/" />
    <style>
      html,
      body {
        width: 100%;
        min-height: 100%;
        margin: 0;
        background: transparent;
        color-scheme: light;
        direction: rtl;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        text-rendering: geometricPrecision;
      }
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      html,
      body {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
      #${PREVIEW_ROOT_ID} {
        width: 100%;
        min-height: 100%;
        padding-top: 62px;
        padding-bottom: 48px;
        background: transparent;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      #${PREVIEW_ROOT_ID}::-webkit-scrollbar,
      #${PREVIEW_ROOT_ID} *::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    </style>
  </head>
  <body>
    <div id="${PREVIEW_ROOT_ID}"></div>
  </body>
</html>`;
}

function EmptyPreview() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
        <span className="text-2xl">📄</span>
      </div>
      <p className="text-sm font-medium text-slate-500">
        هنوز بلاکی اضافه نشده است
      </p>
      <p className="text-xs text-slate-400">
        بلاک‌ها را در ویرایشگر اضافه کنید تا اینجا نمایش داده شوند.
      </p>
    </div>
  );
}

function PhonePreviewLoader() {
  return (
    <div className="absolute inset-1 z-50 flex items-center justify-center rounded-[46px] bg-white">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="relative flex h-11 w-11 items-center justify-center">
          <span className="absolute h-full w-full rounded-full border-2 border-slate-200" />
          <span className="absolute h-full w-full animate-spin rounded-full border-2 border-transparent border-t-slate-900" />
        </span>
        <span className="text-[12px] font-bold text-slate-500">
          در حال آماده‌سازی پیش‌نمایش
        </span>
      </div>
    </div>
  );
}

function PhonePreviewContent({
  blocks,
  background,
  logo,
  logoShape,
  logoHeader,
  pageUrl,
  showFloatingActions,
}: {
  blocks: PageBlock[];
  background?: {
    color?: string;
    image?: string;
  };
  logo?: string;
  logoShape?: "square" | "circle";
  logoHeader?: Partial<LogoHeaderSettings>;
  pageUrl?: string;
  showFloatingActions?: boolean;
}) {
  const color =
    typeof background?.color === "string" ? background.color : "#ffffff";
  const image =
    typeof background?.image === "string" ? background.image : "";
  const contactBlock =
    blocks.find(
      (block) =>
        block.type === "contactSave" &&
        block.isActive !== false &&
        !block.hidden,
    ) ?? null;
  const contentBlocks = blocks.filter(
    (block) => block.type !== "contactSave",
  );

  return (
    <div className="relative isolate min-h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor: color,
          backgroundImage: image
            ? `url(${JSON.stringify(image)})`
            : undefined,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <PageLogoPreview
        logo={logo}
        logoShape={logoShape}
        logoHeader={logoHeader}
        showPlaceholder={Boolean(logoHeader?.enabled)}
      />
      {contentBlocks.length === 0 ? (
        <EmptyPreview />
      ) : (
      <div className="space-y-6">
        {contentBlocks.map((block) => {
          const config =
            blockRegistry[block.type as keyof typeof blockRegistry];

          if (!config) {
            return (
              <div
                key={block.instanceId}
                className="mx-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600"
              >
                بلاک «{block.type}» ثبت نشده است
              </div>
            );
          }

          const BlockComponent = config.component as React.ComponentType<{
            block: PageBlock;
            mode: "preview";
          }>;

          return (
            <div key={block.instanceId}>
              <BlockComponent block={block} mode="preview" />
            </div>
          );
        })}
      </div>
      )}
      <LandingFloatingActions
        contactBlock={contactBlock}
        pageUrl={pageUrl}
        mode="preview"
        enabled={showFloatingActions}
      />
    </div>
  );
}

function LiveClock() {
  const fmt = () =>
    new Date().toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const [time, setTime] = useState(fmt);

  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);

  return <>{time}</>;
}

export default function PhonePreviewModal({
  open,
  blocks,
  background,
  logo,
  logoShape,
  logoHeader,
  pageUrl,
  showFloatingActions = false,
  onClose,
}: PhonePreviewModalProps) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );

  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [iframeDocument, setIframeDocument] = useState<Document | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const prepareIframe = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    setPreviewReady(false);
    doc.open();
    doc.write(buildIframeDocument());
    doc.close();
    clonePreviewStyles(doc);
    setIframeDocument(doc);
  }, []);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimating(true)),
      );
    } else {
      setAnimating(false);
      setPreviewReady(false);
      const t = setTimeout(() => {
        setIframeDocument(null);
        setVisible(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!visible) return;
    const af = requestAnimationFrame(prepareIframe);
    return () => cancelAnimationFrame(af);
  }, [prepareIframe, visible]);

  useEffect(() => {
    if (!iframeDocument?.getElementById(PREVIEW_ROOT_ID)) {
      setPreviewReady(false);
      return;
    }

    setPreviewReady(false);
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setPreviewReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [iframeDocument, sortedBlocks]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const stableOnClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!visible) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableOnClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [stableOnClose, visible]);

  useEffect(() => {
    if (!visible) return;
    const previewWindow = iframeDocument?.defaultView;
    if (!previewWindow) return;

    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableOnClose();
    };

    previewWindow.addEventListener("keydown", fn);
    return () => previewWindow.removeEventListener("keydown", fn);
  }, [iframeDocument, stableOnClose, visible]);

  if (!visible) return null;

  const previewRoot = iframeDocument?.getElementById(PREVIEW_ROOT_ID) ?? null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="پیش نمایش موبایل"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: animating ? "rgba(0,0,0,0.92)" : "rgba(0,0,0,0)",
          backdropFilter: animating ? "blur(40px) saturate(180%)" : "blur(0px)",
          WebkitBackdropFilter: animating
            ? "blur(40px) saturate(180%)"
            : "blur(0px)",
          transition:
            "background-color 350ms ease, backdrop-filter 350ms ease, -webkit-backdrop-filter 350ms ease",
        }}
      />

      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: animating ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      >
        <div className="absolute -left-1/4 -top-1/4 h-175 w-175 rounded-full bg-violet-700/20 blur-[180px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-175 w-175 rounded-full bg-blue-600/10 blur-[180px]" />
      </div>

      {/* Scroll + center container */}
      <div
        className="scrollbar-none relative z-10 flex min-h-screen flex-col items-center justify-center gap-5 overflow-y-auto p-5"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ── Phone ── */}
        <div
          className="relative shrink-0"
          style={{
            width: "min(350px, calc(100vw - 24px))",
            height: "min(844px, calc(100dvh - 108px))",
            opacity: animating ? 1 : 0,
            transform: animating
              ? "translateY(0) scale(1)"
              : "translateY(56px) scale(0.86)",
            transition:
              "opacity 480ms cubic-bezier(0.34,1.56,0.64,1), transform 480ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {/* Halo glow */}
          <div
            className="pointer-events-none absolute rounded-[68px]"
            style={{
              inset: "-36px",
              zIndex: -1,
              background:
                "radial-gradient(ellipse at 50% 22%, rgba(139,92,246,0.25) 0%, transparent 65%)",
              filter: "blur(24px)",
            }}
          />

          {/* Titanium frame */}
          <div
            className="absolute inset-0 rounded-[52px]"
            style={{
              background:
                "linear-gradient(155deg, #D2D2D7 0%, #A0A0A5 10%, #4C4C50 32%, #1C1C1E 50%, #4C4C50 68%, #A0A0A5 88%, #D2D2D7 100%)",
              padding: "2px",
              boxShadow:
                "0 0 0 0.5px rgba(255,255,255,0.08), " +
                "0 52px 120px -16px rgba(0,0,0,0.95), " +
                "0 0 80px -10px rgba(139,92,246,0.14)",
            }}
          >
            {/* Dark bezel */}
            <div
              className="relative h-full w-full overflow-hidden rounded-[50px]"
              style={{ background: "#050505" }}
            >
              {/* Screen surface */}
              <div className="absolute inset-1 overflow-hidden rounded-[46px] bg-white">
                {/* Status bar — always LTR like a real phone */}
                <div
                  dir="ltr"
                  className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-13.5 items-end justify-between px-6 pb-2"
                >
                  <span
                    className="text-[13.5px] font-semibold text-black"
                    style={{ letterSpacing: "-0.3px" }}
                  >
                    <LiveClock />
                  </span>

                  <div className="flex items-center gap-1.25">
                    {/* Cellular */}
                    <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                      <rect
                        x="0"
                        y="8"
                        width="3"
                        height="4"
                        rx="0.5"
                        fill="black"
                      />
                      <rect
                        x="4.5"
                        y="5.5"
                        width="3"
                        height="6.5"
                        rx="0.5"
                        fill="black"
                      />
                      <rect
                        x="9"
                        y="3"
                        width="3"
                        height="9"
                        rx="0.5"
                        fill="black"
                      />
                      <rect
                        x="13.5"
                        y="0"
                        width="3"
                        height="12"
                        rx="0.5"
                        fill="black"
                      />
                    </svg>

                    {/* WiFi */}
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                      <circle cx="8" cy="11.2" r="1.3" fill="black" />
                      <path
                        d="M4.3 7.9a5.2 5.2 0 017.4 0"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M1.1 4.8a9.9 9.9 0 0113.8 0"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Battery */}
                    <div className="flex items-center gap-[1.5px]">
                      <div
                        style={{
                          position: "relative",
                          width: "24px",
                          height: "12px",
                          borderRadius: "3px",
                          border: "1.5px solid black",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "1.5px",
                            left: "1.5px",
                            bottom: "1.5px",
                            right: "28%",
                            borderRadius: "1px",
                            background: "black",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: "2px",
                          height: "5.5px",
                          borderRadius: "0 1.5px 1.5px 0",
                          background: "rgba(0,0,0,0.38)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Island */}
                <div className="pointer-events-none absolute left-1/2 top-2.5 z-40 -translate-x-1/2">
                  <div
                    style={{
                      position: "relative",
                      width: "126px",
                      height: "37px",
                      borderRadius: "20px",
                      background: "#000",
                      boxShadow: "0 0 0 1.5px rgba(255,255,255,0.05)",
                    }}
                  >
                    {/* Front camera */}
                    <div
                      style={{
                        position: "absolute",
                        right: "22px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: "#1A1A1A",
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "2.5px",
                          borderRadius: "50%",
                          background: "rgba(99,102,241,0.22)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Content iframe */}
                <iframe
                  ref={iframeRef}
                  title="پیش نمایش واقعی موبایل"
                  className="h-full w-full border-0"
                  style={{ scrollbarWidth: "none" }}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />

                {iframeDocument && previewRoot
                  ? createPortal(
                      <StyleSheetManager target={iframeDocument.head}>
                        <PhonePreviewContent
                          blocks={sortedBlocks}
                          background={background}
                          logo={logo}
                          logoShape={logoShape}
                          logoHeader={logoHeader}
                          pageUrl={pageUrl}
                          showFloatingActions={showFloatingActions}
                        />
                      </StyleSheetManager>,
                      previewRoot,
                    )
                  : null}

                {!previewReady ? <PhonePreviewLoader /> : null}

                {/* Screen glass sheen */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[46px]"
                  style={{
                    background:
                      "linear-gradient(148deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.01) 38%, transparent 55%)",
                  }}
                />

                {/* Home indicator */}
                <div className="pointer-events-none absolute bottom-2 left-1/2 z-30 -translate-x-1/2">
                  <div
                    className="rounded-full bg-black/70"
                    style={{ width: "134px", height: "5px" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Physical buttons ── */}
          {/* Mute / Ring */}
          <div
            className="pointer-events-none absolute rounded-l-xs"
            style={{
              left: "-3px",
              top: "112px",
              width: "3px",
              height: "28px",
              background: "linear-gradient(to right, #505053, #8E8E92)",
            }}
          />
          {/* Volume + */}
          <div
            className="pointer-events-none absolute rounded-l-xs"
            style={{
              left: "-3px",
              top: "154px",
              width: "3px",
              height: "60px",
              background: "linear-gradient(to right, #505053, #8E8E92)",
            }}
          />
          {/* Volume − */}
          <div
            className="pointer-events-none absolute rounded-l-xs"
            style={{
              left: "-3px",
              top: "226px",
              width: "3px",
              height: "60px",
              background: "linear-gradient(to right, #505053, #8E8E92)",
            }}
          />
          {/* Power */}
          <div
            className="pointer-events-none absolute rounded-r-xs"
            style={{
              right: "-3px",
              top: "180px",
              width: "3px",
              height: "76px",
              background: "linear-gradient(to left, #505053, #8E8E92)",
            }}
          />

          {/* Frame top highlight */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 rounded-t-[52px]"
            style={{
              height: "48%",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* ── Close button ── */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.07] px-5 py-2.5 text-[13px] text-white/50 backdrop-blur-sm hover:border-white/20 hover:bg-white/12 hover:text-white/80"
          style={{
            opacity: animating ? 1 : 0,
            transform: animating ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 500ms 220ms ease, transform 500ms 220ms cubic-bezier(0.34,1.56,0.64,1), background-color 200ms, border-color 200ms, color 200ms",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M1 1l9 9M10 1L1 10"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <span>بستن</span>
          <kbd className="rounded border border-white/12 bg-white/8 px-1.5 py-0.5 text-[10px] font-mono leading-none">
            Esc
          </kbd>
        </button>
      </div>
    </div>
  );
}
