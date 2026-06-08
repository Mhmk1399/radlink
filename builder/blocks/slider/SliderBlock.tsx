"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

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
/*  Styled                                                             */
/* ================================================================== */

const SliderRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
`;

const StyledContainer = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(p) => p.$css}
  position: relative;
  overflow: hidden;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    min-height: 480px;
  }
  @media (min-width: 1024px) {
    min-height: 540px;
  }
`;

const StyledOverlay = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-overlay`)}
  ${(p) => p.$css}
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const StyledTitle = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(p) => p.$css}
`;

const StyledDescription = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(p) => p.$css}
`;

const StyledButton = styled.a<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-btn`)}
  ${(p) => p.$css}
`;

const StyledArrow = styled.button<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-arrow`)}
  ${(p) => p.$css}
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.85;
  }
`;

const StyledDot = styled.button<{ $css: string; $active: boolean }>`
  ${sharedBlockKeyframes(`${PREFIX}-dot`)}
  ${(p) => p.$css}
  width: ${(p) => (p.$active ? "24px" : "10px")};
  height: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  opacity: ${(p) => (p.$active ? 1 : 0.55)};
  &:hover {
    opacity: 1;
  }
`;

/* ================================================================== */
/*  Arrow SVGs                                                         */
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

  const goPrev = useCallback(() => {
    goTo(safeIndex - 1);
  }, [goTo, safeIndex]);

  const goNext = useCallback(() => {
    goTo(safeIndex + 1);
  }, [goTo, safeIndex]);

  /* ── Swipe / drag ── */
  const dragState = useRef<{
    startX: number;
    startY: number;
    dragging: boolean;
    isEditing: boolean;
  } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const isEditing = Boolean(target.closest('[contenteditable="true"]'));

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: true,
      isEditing,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current?.dragging) return;

    const dx = Math.abs(e.clientX - dragState.current.startX);
    const dy = Math.abs(e.clientY - dragState.current.startY);

    /* If vertical scroll is dominant, cancel drag */
    if (dy > dx && dy > 10) {
      dragState.current = null;
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const state = dragState.current;
      dragState.current = null;

      if (!state?.dragging) return;
      if (state.isEditing) return;

      const dx = e.clientX - state.startX;

      if (Math.abs(dx) < SWIPE_THRESHOLD) return;

      /* RTL: drag right = prev, drag left = next */
      if (dx > 0) {
        goPrev();
      } else {
        goNext();
      }
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
    { mobileOnly },
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
    { mobileOnly },
  );

  const arrowCss = responsiveStyleToCss(
    block.elements.arrow.style,
    `${PREFIX}-arrow`,
    { mobileOnly },
  );

  const dotCss = responsiveStyleToCss(
    block.elements.dot.style,
    `${PREFIX}-dot`,
    { mobileOnly },
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
          <StyledContainer $css={containerCss}>
            <div className="px-6 py-20 text-center text-sm font-medium text-white/60">
              هنوز اسلایدی اضافه نشده. از بخش محتوا اسلاید اضافه کنید.
            </div>
          </StyledContainer>
        </EditablePart>
      </SliderRoot>
    );
  }

  /* ── Active slide data ── */
  const slide = activeSlide!;
  const hasImage = Boolean(slide.imageUrl);
  const buttonUrl = String(slide.buttonUrl ?? "").trim();
  const buttonHref = !isEditor && buttonUrl ? buttonUrl : undefined;

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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            backgroundImage: hasImage
              ? `url(${slide.imageUrl})`
              : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            touchAction: "pan-y",
            userSelect: "none",
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
          <div
            className="relative z-10 flex w-full flex-col items-center gap-5 px-6 py-12 text-center sm:px-10 sm:py-16"
            key={slide.id}
          >
            {/* Title */}
            <EditablePart
              instanceId={block.instanceId}
              elementId="title"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledTitle
                className="mx-auto max-w-[720px] font-extrabold leading-[1.25]"
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
                className="mx-auto max-w-[560px] leading-[1.9]"
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
                  className="mt-2 inline-flex min-w-[160px] items-center justify-center px-7 py-3.5 text-center font-bold no-underline transition-opacity hover:opacity-90"
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
          </div>

          {/* ── Arrows ── */}
          {Boolean(data.showArrows) && slides.length > 1 && (
            <>
              {/* Next (left side in RTL) */}
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

              {/* Prev (right side in RTL) */}
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
            <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
              <EditablePart
                instanceId={block.instanceId}
                elementId="dot"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <div className="flex items-center gap-2">
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
                </div>
              </EditablePart>
            </div>
          )}
        </StyledContainer>
      </EditablePart>
    </SliderRoot>
  );
}
