"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";

import type {
  BlockComponentProps,
  PageBlock,
} from "@/types/blocks/builder.types";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const PREFIX = "slider";
const SWIPE_THRESHOLD = 50;

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type SlideItem = {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  overlayEnabled: boolean;
  contentBackdropEnabled?: boolean;
};

type SliderData = {
  autoplay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  showButton: boolean;
  slides: SlideItem[];
};

type SliderBlockProps = BlockComponentProps & {
  block: PageBlock & { data: SliderData };
};

/* ================================================================== */
/*  Helpers — same pattern as BannerBlock                             */
/* ================================================================== */

/**
 * Load an image and return its natural aspect ratio string e.g. "1920 / 1080".
 * Returns null on error or if cancelled.
 */
function loadImageAspectRatio(
  src: string,
  onSuccess: (ratio: string) => void,
  onError: () => void,
): () => void {
  let cancelled = false;
  const img = new Image();

  img.onload = () => {
    if (!cancelled && img.naturalWidth && img.naturalHeight) {
      onSuccess(`${img.naturalWidth} / ${img.naturalHeight}`);
    }
  };

  img.onerror = () => {
    if (!cancelled) onError();
  };

  img.src = src;

  return () => {
    cancelled = true;
  };
}

/* ================================================================== */
/*  Animations                                                         */
/* ================================================================== */

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const SliderRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
  position: relative;
`;

const StyledContainer = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(p) => p.$css}

  position: relative;
  overflow: hidden;
  isolation: isolate;

  /* When no user-defined height and no image → comfortable minimum */
  &[data-no-image="true"] {
    min-height: 280px;

    @media (min-width: 640px) {
      min-height: 340px;
    }

    @media (min-width: 1024px) {
      min-height: 400px;
    }
  }

  &[data-has-image="true"] {
    background-color: #0f172a;
  }

  display: flex;
  align-items: center;
  justify-content: center;

  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 12px 32px rgba(15, 23, 42, 0.14);

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  /* Subtle top-right light orb */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(
        ellipse at top right,
        rgba(255, 255, 255, 0.07),
        transparent 30%
      ),
      radial-gradient(
        ellipse at bottom left,
        rgba(255, 255, 255, 0.04),
        transparent 32%
      );
    z-index: 1;
    opacity: 0.92;
    transition: opacity 0.28s ease;
  }

  /* Always-on bottom gradient for legibility */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background: linear-gradient(
      to top,
      rgba(2, 6, 23, 0.55) 0%,
      rgba(2, 6, 23, 0.18) 45%,
      rgba(2, 6, 23, 0.05) 100%
    );
    z-index: 2;
  }

  &[data-has-image="true"]::before {
    background:
      radial-gradient(
        circle at 16% 8%,
        rgba(255, 255, 255, 0.22),
        transparent 26%
      ),
      radial-gradient(
        circle at 88% 88%,
        rgba(255, 255, 255, 0.13),
        transparent 34%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(2, 6, 23, 0.12));
    mix-blend-mode: soft-light;
  }

  @media (hover: hover) and (pointer: fine) {
    &[data-has-image="true"]:hover::before {
      opacity: 1;
    }
  }
`;

const StyledOverlay = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-overlay`)}
  ${(p) => p.$css}
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
`;

const SlideLayer = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
`;

const ContentCard = styled.div<{ $backdropEnabled: boolean }>`
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  padding: ${(p) => (p.$backdropEnabled ? "26px 20px" : "16px 0")};
  border-radius: ${(p) => (p.$backdropEnabled ? "24px" : "0")};
  background: ${(p) =>
    p.$backdropEnabled
      ? "linear-gradient(180deg, rgba(15, 23, 42, 0.32), rgba(15, 23, 42, 0.2))"
      : "transparent"};
  border: ${(p) =>
    p.$backdropEnabled
      ? "1px solid rgba(255, 255, 255, 0.11)"
      : "1px solid transparent"};
  backdrop-filter: ${(p) => (p.$backdropEnabled ? "blur(12px)" : "none")};
  -webkit-backdrop-filter: ${(p) =>
    p.$backdropEnabled ? "blur(12px)" : "none"};
  box-shadow: ${(p) =>
    p.$backdropEnabled
      ? "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 14px 32px rgba(2, 6, 23, 0.2)"
      : "none"};
  text-shadow: ${(p) =>
    p.$backdropEnabled ? "none" : "0 2px 14px rgba(2, 6, 23, 0.36)"};
  animation: ${fadeUp} 0.32s ease both;
  transition:
    background 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    backdrop-filter 0.24s ease,
    padding 0.24s ease;

  @media (min-width: 640px) {
    padding: ${(p) => (p.$backdropEnabled ? "34px 30px" : "20px 0")};
  }

  @media (min-width: 1024px) {
    padding: ${(p) => (p.$backdropEnabled ? "42px 38px" : "24px 0")};
  }
`;

const ContentStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const StyledTitle = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(p) => p.$css}
  letter-spacing: -0.025em;
  font-weight: 800;
  line-height: 1.22;
`;

const StyledDescription = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(p) => p.$css}
  line-height: 1.9;
`;

const StyledButton = styled.a<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-btn`)}
  ${(p) => p.$css}
  font-weight: 700;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 8px 20px rgba(15, 23, 42, 0.14);
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 6px 16px rgba(15, 23, 42, 0.18),
      0 2px 6px rgba(15, 23, 42, 0.12);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StyledArrow = styled.button<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-arrow`)}
  ${(p) => p.$css}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 8px 18px rgba(2, 6, 23, 0.14);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.25s ease,
    background-color 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  @media (min-width: 640px) {
    width: 46px;
    height: 46px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &:hover {
    transform: scale(1.06);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 12px 24px rgba(2, 6, 23, 0.2);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const DotsShell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 8px 20px rgba(2, 6, 23, 0.14);

  @media (min-width: 640px) {
    gap: 8px;
    padding: 8px 12px;
  }
`;

const StyledDot = styled.button<{ $css: string; $active: boolean }>`
  ${sharedBlockKeyframes(`${PREFIX}-dot`)}
  ${(p) => p.$css}
  width: ${(p) => (p.$active ? "18px" : "7px")};
  height: 7px;
  cursor: pointer;
  opacity: ${(p) => (p.$active ? 1 : 0.5)};
  box-shadow: ${(p) =>
    p.$active ? "0 2px 8px rgba(255,255,255,0.22)" : "none"};
  transition: all 0.28s ease;

  @media (min-width: 640px) {
    width: ${(p) => (p.$active ? "26px" : "10px")};
    height: 10px;
  }

  &:hover {
    opacity: 1;
  }
`;

const EmptyState = styled.div`
  position: relative;
  z-index: 10;
  padding: 44px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
`;

const EmptyStateIcon = styled.div`
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
`;

/* ================================================================== */
/*  Arrow / Placeholder icons                                          */
/* ================================================================== */

function ArrowRight() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SlidesPlaceholderIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function SliderBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: SliderBlockProps) {
  const data = block.data as SliderData;
  const isEditor = mode === "editor";
  const mobileOnly = isEditor;

  const slides: SlideItem[] = Array.isArray(data.slides) ? data.slides : [];

  /* ── Active slide ── */
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex =
    slides.length === 0 ? 0 : Math.min(activeIndex, slides.length - 1);
  const activeSlide: SlideItem | undefined = slides[safeIndex];

  /* ── Image aspect ratio — same pattern as BannerBlock ── */
  const [aspectRatio, setAspectRatio] = useState<string | undefined>(
    activeSlide?.imageUrl ? "16 / 9" : undefined,
  );

  useEffect(() => {
    const imageUrl = activeSlide?.imageUrl;

    if (!imageUrl) {
      setAspectRatio(undefined);
      return;
    }

    // Optimistically set 16/9 while loading
    setAspectRatio("16 / 9");

    const cancel = loadImageAspectRatio(
      imageUrl,
      (ratio) => setAspectRatio(ratio),
      () => setAspectRatio("16 / 9"),
    );

    return cancel;
  }, [activeSlide?.imageUrl]);

  /* ── Autoplay ── */
  useEffect(() => {
    if (isEditor) return;
    if (!data.autoplay) return;
    if (slides.length <= 1) return;

    const ms =
      typeof data.interval === "number" && data.interval >= 1000
        ? data.interval
        : 5000;

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, ms);

    return () => clearInterval(id);
  }, [isEditor, data.autoplay, data.interval, slides.length]);

  /* ── Navigation ── */
  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setActiveIndex(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);
  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);

  /* ── Swipe / drag ── */
  const dragState = useRef<{
    startX: number;
    startY: number;
    dragging: boolean;
    isEditing: boolean;
  } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: true,
      isEditing: Boolean(target.closest('[contenteditable="true"]')),
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current?.dragging) return;
    const dx = Math.abs(e.clientX - dragState.current.startX);
    const dy = Math.abs(e.clientY - dragState.current.startY);
    if (dy > dx && dy > 10) dragState.current = null;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const state = dragState.current;
      dragState.current = null;
      if (!state?.dragging || state.isEditing) return;
      const dx = e.clientX - state.startX;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      dx > 0 ? goPrev() : goNext();
    },
    [goPrev, goNext],
  );

  const handlePointerCancel = useCallback(() => {
    dragState.current = null;
  }, []);

  /* ── Styles ── */
  const containerCss = responsiveStyleToCss(
    block.elements.container.style,
    `${PREFIX}-container`,
    { mobileOnly, effect: "surface" },
  );

  const overlayCss = responsiveStyleToCss(
    block.elements.overlay.style,
    `${PREFIX}-overlay`,
    { mobileOnly },
  );

  const titleCss = responsiveStyleToCss(
    block.elements.title.style,
    `${PREFIX}-title`,
    { mobileOnly },
  );

  const descCss = responsiveStyleToCss(
    block.elements.description.style,
    `${PREFIX}-desc`,
    { mobileOnly },
  );

  const btnCss = responsiveStyleToCss(
    block.elements.button.style,
    `${PREFIX}-btn`,
    { mobileOnly, effect: "button" },
  );

  const arrowCss = responsiveStyleToCss(
    block.elements.arrow.style,
    `${PREFIX}-arrow`,
    { mobileOnly, effect: "tap" },
  );

  const dotCss = responsiveStyleToCss(
    block.elements.dot.style,
    `${PREFIX}-dot`,
    { mobileOnly, effect: "tap" },
  );

  /* ── Has the user set a custom height? ── */
  const containerHeightStyle = block.elements.container.style?.height;
  const hasCustomHeight = Boolean(
    containerHeightStyle?.mobile ||
    containerHeightStyle?.tablet ||
    containerHeightStyle?.desktop,
  );

  /* ── No slides ── */
  if (slides.length === 0) {
    return (
      <SliderRoot dir="rtl">
        <EditablePart
          instanceId={block.instanceId}
          elementId="container"
          mode={mode}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        >
          <StyledContainer $css={containerCss} data-no-image="true">
            <EmptyState>
              <EmptyStateIcon>
                <SlidesPlaceholderIcon />
              </EmptyStateIcon>
              <div className="text-sm font-medium">
                هنوز اسلایدی اضافه نشده.
              </div>
              <div className="mt-1 text-xs opacity-70">
                از بخش محتوا اسلاید جدید اضافه کنید.
              </div>
            </EmptyState>
          </StyledContainer>
        </EditablePart>
      </SliderRoot>
    );
  }

  /* ── Active slide data ── */
  const slide = activeSlide!;
  const hasImage = Boolean(slide.imageUrl);
  const contentBackdropEnabled = slide.contentBackdropEnabled !== false;
  const buttonUrl = String(slide.buttonUrl ?? "").trim();
  const buttonHref = !isEditor && buttonUrl ? buttonUrl : undefined;

  /*
   * Sizing strategy — mirrors BannerBlock exactly:
   *
   * 1. If user set a custom height via the style editor → honour it (containerCss already includes it).
   * 2. Else if slide has an image → use the image's natural aspect ratio.
   * 3. Else → fall back to comfortable min-height via data-no-image attribute.
   */
  const containerSizeStyle: React.CSSProperties = hasCustomHeight
    ? {} // height already in containerCss from responsiveStyleToCss
    : hasImage && aspectRatio
      ? { aspectRatio }
      : {};

  return (
    <SliderRoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          $css={containerCss}
          data-no-image={!hasImage && !hasCustomHeight ? "true" : undefined}
          data-has-image={hasImage ? "true" : "false"}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            backgroundImage: hasImage ? `url(${slide.imageUrl})` : undefined,
            backgroundSize: hasImage ? "cover" : undefined,
            backgroundPosition: hasImage ? "center" : undefined,
            touchAction: "pan-y",
            userSelect: "none",
            ...containerSizeStyle,
          }}
        >
          {/* ── Overlay ── */}
          {slide.overlayEnabled && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="overlay"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledOverlay $css={overlayCss} />
            </EditablePart>
          )}

          {/* ── Content ── */}
          <SlideLayer
            key={slide.id}
            className="w-full px-5 py-10 sm:px-10 sm:py-14"
          >
            <ContentCard $backdropEnabled={contentBackdropEnabled}>
              <ContentStack>
                {/* Title */}
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="title"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledTitle
                    className="mx-auto max-w-[720px]"
                    $css={titleCss}
                  >
                    <InlineEditableText
                      value={String(slide.title ?? "")}
                      dataKey={`slides.${slide.id}.title`}
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <h2 className="m-0">{text}</h2>}
                    </InlineEditableText>
                  </StyledTitle>
                </EditablePart>

                {/* Description */}
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="description"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledDescription
                    className="mx-auto max-w-[560px]"
                    $css={descCss}
                  >
                    <InlineEditableText
                      value={String(slide.description ?? "")}
                      dataKey={`slides.${slide.id}.description`}
                      instanceId={block.instanceId}
                      mode={mode}
                      multiline
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <p className="m-0">{text}</p>}
                    </InlineEditableText>
                  </StyledDescription>
                </EditablePart>

                {/* Button */}
                {Boolean(data.showButton) && (
                  <EditablePart
                    instanceId={block.instanceId}
                    elementId="button"
                    mode={mode}
                    selectedElementId={selectedElementId}
                    onSelectElement={onSelectElement}
                  >
                    <StyledButton
                      $css={btnCss}
                      href={buttonHref}
                      target={buttonHref ? "_blank" : undefined}
                      rel={buttonHref ? "noopener noreferrer" : undefined}
                      onClick={(e) => {
                        if (isEditor) e.preventDefault();
                      }}
                      className="mt-2 inline-flex min-w-[132px] items-center justify-center px-4 py-2.5 text-center text-sm no-underline sm:min-w-[160px] sm:px-7 sm:py-3.5 sm:text-base"
                    >
                      <InlineEditableText
                        value={String(slide.buttonText ?? "")}
                        dataKey={`slides.${slide.id}.buttonText`}
                        instanceId={block.instanceId}
                        mode={mode}
                        onUpdateContent={onUpdateContent}
                      >
                        {(text) => <span>{text}</span>}
                      </InlineEditableText>
                    </StyledButton>
                  </EditablePart>
                )}
              </ContentStack>
            </ContentCard>
          </SlideLayer>

          {/* ── Arrows ── */}
          {Boolean(data.showArrows) && slides.length > 1 && (
            <>
              <div className="absolute left-3 top-1/2 z-20 -translate-y-1/2 sm:left-5">
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="arrow"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledArrow
                    $css={arrowCss}
                    type="button"
                    aria-label="اسلاید بعدی"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                  >
                    <ArrowLeft />
                  </StyledArrow>
                </EditablePart>
              </div>

              <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2 sm:right-5">
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="arrow"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledArrow
                    $css={arrowCss}
                    type="button"
                    aria-label="اسلاید قبلی"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                  >
                    <ArrowRight />
                  </StyledArrow>
                </EditablePart>
              </div>
            </>
          )}

          {/* ── Dots ── */}
          {Boolean(data.showDots) && slides.length > 1 && (
            <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center">
              <EditablePart
                instanceId={block.instanceId}
                elementId="dot"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <DotsShell>
                  {slides.map((s, idx) => (
                    <StyledDot
                      key={s.id}
                      $css={dotCss}
                      $active={idx === safeIndex}
                      type="button"
                      aria-label={`رفتن به اسلاید ${idx + 1}`}
                      aria-current={idx === safeIndex ? "true" : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        goTo(idx);
                      }}
                    />
                  ))}
                </DotsShell>
              </EditablePart>
            </div>
          )}
        </StyledContainer>
      </EditablePart>
    </SliderRoot>
  );
}
