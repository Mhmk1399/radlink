"use client";

import React from "react";
import styled, { css } from "styled-components";

import type {
  ResponsiveValue,
  EditableStyleMap,
  BlockElement,
  PageBlock,
  EditorMode,
  BannerBlockProps,
  EditableStyleKey,
  BannerData,
  BannerElementId,
} from "../../../types/blocks/banner.types";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";

/* ------------------------------------------------------------------ */
/*  Fallback data & elements                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_BANNER_DATA: BannerData = {
  title: "عنوان بنر شما",
  description:
    "اینجا توضیح کوتاهی درباره خدمات، پیشنهاد یا معرفی برند خود بنویسید.",
  buttonText: "مشاهده بیشتر",
  buttonUrl: "",
  imageUrl: "",
  imageLink: "",
  showButton: true,
  showOverlay: true,
};

const DEFAULT_ELEMENTS: Record<BannerElementId, BlockElement> = {
  container: {
    label: "قاب اصلی",
    allowedStyleKeys: [
      "backgroundColor",
      "height",
      "borderRadius",
      "borderColor",
      "borderWidth",
      "animation",
    ],
    style: {
      backgroundColor: { mobile: "#0f172a" },
      borderRadius: { mobile: 20 },
      borderColor: { mobile: "transparent" },
      borderWidth: { mobile: 0 },
      animation: "none",
    },
  },
  overlay: {
    label: "پوشش تصویر",
    allowedStyleKeys: ["backgroundColor"],
    style: {
      backgroundColor: { mobile: "rgba(15, 23, 42, 0.50)" },
    },
  },
  title: {
    label: "عنوان",
    allowedStyleKeys: ["color", "fontSize", "animation"],
    style: {
      color: { mobile: "#ffffff" },
      fontSize: { mobile: 26, tablet: 34, desktop: 42 },
      animation: "slideUp",
    },
  },
  description: {
    label: "توضیحات",
    allowedStyleKeys: ["color", "fontSize"],
    style: {
      color: { mobile: "rgba(255, 255, 255, 0.80)" },
      fontSize: { mobile: 14, tablet: 16, desktop: 17 },
    },
  },
  button: {
    label: "دکمه",
    allowedStyleKeys: [
      "color",
      "backgroundColor",
      "fontSize",
      "borderRadius",
      "borderColor",
      "borderWidth",
      "animation",
    ],
    style: {
      color: { mobile: "#0f172a" },
      backgroundColor: { mobile: "#ffffff" },
      fontSize: { mobile: 14, tablet: 15, desktop: 15 },
      borderRadius: { mobile: 12 },
      borderColor: { mobile: "transparent" },
      borderWidth: { mobile: 0 },
      animation: "none",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Shared keyframes                                                   */
/* ------------------------------------------------------------------ */

const sharedAnimationStyles = css`
  ${sharedBlockKeyframes("banner-block")}
  ${sharedBlockKeyframes("banner-button")}
`;

/* ------------------------------------------------------------------ */
/*  Styled components                                                  */
/* ------------------------------------------------------------------ */

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.06);
  transition:
    box-shadow 0.3s ease,
    background-color 0.3s ease;
  ${(props) => props.$styleCss}

  &[data-has-image="true"] {
    background-color: #0f172a;
  }

  &[data-has-image="true"]::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(
        circle at 18% 8%,
        rgba(255, 255, 255, 0.22),
        transparent 28%
      ),
      radial-gradient(
        circle at 86% 96%,
        rgba(255, 255, 255, 0.12),
        transparent 34%
      ),
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.08),
        rgba(2, 6, 23, 0.16)
      );
    mix-blend-mode: soft-light;
    opacity: 0.56;
    transition: opacity 0.28s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    &[data-has-image="true"]:hover::before {
      opacity: 0.7;
    }
  }
`;

const StyledOverlay = styled.div<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  position: absolute;
  inset: 0;
  ${(props) => props.$styleCss}

  /* subtle bottom gradient for text readability */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.25) 0%,
      transparent 50%
    );
    pointer-events: none;
    border-radius: inherit;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  width: 100%;
`;

const ContentInner = styled.div`
  width: 100%;
  padding: 2rem 1.75rem;

  @media (min-width: 768px) {
    padding: 3rem 2.75rem;
  }

  @media (min-width: 1024px) {
    padding: 3.5rem 3.5rem;
  }
`;

const ContentStack = styled.div`
  display: flex;
  max-width: 36rem;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;

  @media (min-width: 768px) {
    gap: 1.25rem;
  }
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  margin: 0;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  word-break: break-word;
  ${(props) => props.$styleCss}
`;

const StyledDescription = styled.p<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  margin: 0;
  line-height: 1.8;
  font-weight: 400;
  word-break: break-word;
  max-width: 32rem;
  ${(props) => props.$styleCss}
`;

const StyledButton = styled.a<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.625rem 1.5rem;
  text-decoration: none;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.005em;
  word-break: break-word;
  cursor: pointer;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease,
    opacity 0.2s ease;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  ${(props) => props.$styleCss}
`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mergeResponsiveValue<T>(
  fallback?: ResponsiveValue<T>,
  incoming?: ResponsiveValue<T>
): ResponsiveValue<T> | undefined {
  if (!fallback && !incoming) return undefined;

  return {
    mobile: incoming?.mobile ?? fallback?.mobile,
    tablet: incoming?.tablet ?? fallback?.tablet,
    desktop: incoming?.desktop ?? fallback?.desktop,
  };
}

function mergeStyleMap(
  fallback: EditableStyleMap,
  incoming?: EditableStyleMap
): EditableStyleMap {
  return {
    color: mergeResponsiveValue(fallback.color, incoming?.color),
    backgroundColor: mergeResponsiveValue(
      fallback.backgroundColor,
      incoming?.backgroundColor
    ),
    fontSize: mergeResponsiveValue(fallback.fontSize, incoming?.fontSize),
    height: mergeResponsiveValue(fallback.height, incoming?.height),
    borderRadius: mergeResponsiveValue(
      fallback.borderRadius,
      incoming?.borderRadius
    ),
    borderColor: mergeResponsiveValue(
      fallback.borderColor,
      incoming?.borderColor
    ),
    borderWidth: mergeResponsiveValue(
      fallback.borderWidth,
      incoming?.borderWidth
    ),
    animation: incoming?.animation ?? fallback.animation,
  };
}

function getElementWithFallback(
  block: PageBlock,
  elementId: BannerElementId
): BlockElement {
  const fallback = DEFAULT_ELEMENTS[elementId];
  const incoming = block.elements?.[elementId];

  if (!incoming) return fallback;

  return {
    label: typeof incoming.label === "string" ? incoming.label : fallback.label,
    allowedStyleKeys:
      Array.isArray(incoming.allowedStyleKeys) &&
      incoming.allowedStyleKeys.length > 0
        ? (incoming.allowedStyleKeys as EditableStyleKey[])
        : fallback.allowedStyleKeys,
    style: mergeStyleMap(fallback.style, incoming.style),
  };
}

function getBannerData(block: PageBlock): BannerData {
  const raw = (block.data ?? {}) as Partial<BannerData>;

  return {
    title:
      typeof raw.title === "string" ? raw.title : DEFAULT_BANNER_DATA.title,
    description:
      typeof raw.description === "string"
        ? raw.description
        : DEFAULT_BANNER_DATA.description,
    buttonText:
      typeof raw.buttonText === "string"
        ? raw.buttonText
        : DEFAULT_BANNER_DATA.buttonText,
    buttonUrl:
      typeof raw.buttonUrl === "string"
        ? raw.buttonUrl
        : DEFAULT_BANNER_DATA.buttonUrl,
    imageUrl:
      typeof raw.imageUrl === "string"
        ? raw.imageUrl
        : DEFAULT_BANNER_DATA.imageUrl,
    imageLink:
      typeof raw.imageLink === "string"
        ? raw.imageLink.trim()
        : DEFAULT_BANNER_DATA.imageLink,
    showButton:
      typeof raw.showButton === "boolean"
        ? raw.showButton
        : DEFAULT_BANNER_DATA.showButton,
    showOverlay:
      typeof raw.showOverlay === "boolean"
        ? raw.showOverlay
        : DEFAULT_BANNER_DATA.showOverlay,
  };
}

/* ------------------------------------------------------------------ */
/*  BannerBlock                                                        */
/* ------------------------------------------------------------------ */

export function BannerBlock({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BannerBlockProps) {
  const data = getBannerData(block);
  const [imageAspectRatio, setImageAspectRatio] = React.useState<
    string | undefined
  >(data.imageUrl ? "16 / 9" : undefined);
  const settings = (block.settings ?? {}) as Record<string, unknown>;
  const direction = settings.direction === "ltr" ? "ltr" : "rtl";

  const containerElement = getElementWithFallback(block, "container");
  const overlayElement = getElementWithFallback(block, "overlay");
  const titleElement = getElementWithFallback(block, "title");
  const descriptionElement = getElementWithFallback(block, "description");
  const buttonElement = getElementWithFallback(block, "button");

  const backgroundStyle = data.imageUrl
    ? {
        backgroundImage: `url(${data.imageUrl})`,
        aspectRatio: imageAspectRatio,
      }
    : undefined;

  const isEditor = mode === "editor";
  const hasLinkedImage = Boolean(data.imageUrl && data.imageLink);

  React.useEffect(() => {
    if (!data.imageUrl) {
      setImageAspectRatio(undefined);
      return;
    }

    setImageAspectRatio("16 / 9");
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled && image.naturalWidth && image.naturalHeight) {
        setImageAspectRatio(`${image.naturalWidth} / ${image.naturalHeight}`);
      }
    };
    image.onerror = () => {
      if (!cancelled) setImageAspectRatio("16 / 9");
    };
    image.src = data.imageUrl;

    return () => {
      cancelled = true;
    };
  }, [data.imageUrl]);

  function openImageLink() {
    if (isEditor || !hasLinkedImage) return;
    if (/^https?:\/\//i.test(data.imageLink)) {
      window.open(data.imageLink, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = data.imageLink;
  }

  return (
    <EditablePart
      instanceId={block.instanceId}
      elementId="container"
      mode={mode}
      selectedElementId={selectedElementId}
      onSelectElement={onSelectElement}
      className={isEditor ? "block p-[2px]" : undefined}
    >
      <StyledContainer
        dir={direction}
        data-has-image={data.imageUrl ? "true" : "false"}
        className={
          data.imageUrl
            ? `relative w-full ${
                hasLinkedImage && !isEditor ? "cursor-pointer" : ""
              }`
            : "relative min-h-[100px] w-full "
        }
        style={backgroundStyle}
        role={hasLinkedImage && !isEditor ? "link" : undefined}
        tabIndex={hasLinkedImage && !isEditor ? 0 : undefined}
        onClick={(event) => {
          if (!hasLinkedImage || isEditor) return;
          const target = event.target as HTMLElement;
          if (
            target.closest(
              "a, button, input, textarea, select, [contenteditable='true']"
            )
          )
            return;
          openImageLink();
        }}
        onKeyDown={(event) => {
          if (
            hasLinkedImage &&
            !isEditor &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            openImageLink();
          }
        }}
        $styleCss={responsiveStyleToCss(
          containerElement.style,
          "banner-block",
          {
            mobileOnly: mode === "editor",
            effect: "surface",
          }
        )}
      >
        {/* ---------- overlay ---------- */}
        {data.showOverlay && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="overlay"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            className={isEditor ? "absolute inset-0 z-[1]" : undefined}
          >
            <StyledOverlay
              className={
                isEditor
                  ? "h-full w-full"
                  : "pointer-events-none absolute inset-0 z-[1] h-full w-full"
              }
              $styleCss={responsiveStyleToCss(
                overlayElement.style,
                "banner-block"
              )}
            />
          </EditablePart>
        )}

        {/* ---------- content ---------- */}
        <ContentWrapper
          className={
            data.imageUrl
              ? "absolute inset-0"
              : "min-h-[280px] sm:min-h-[340px] md:min-h-[400px]"
          }
        >
          <ContentInner>
            <ContentStack>
              {/* title */}
              <EditablePart
                instanceId={block.instanceId}
                elementId="title"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
                className={isEditor ? "inline-block max-w-full" : undefined}
              >
                <StyledTitle
                  $styleCss={responsiveStyleToCss(
                    titleElement.style,
                    "banner-block",
                    {
                      mobileOnly: mode === "editor",
                    }
                  )}
                >
                  <InlineEditableText
                    value={data.title}
                    dataKey="title"
                    instanceId={block.instanceId}
                    mode={mode}
                    onUpdateContent={onUpdateContent}
                  >
                    {(text) => text}
                  </InlineEditableText>
                </StyledTitle>
              </EditablePart>

              {/* description */}
              <EditablePart
                instanceId={block.instanceId}
                elementId="description"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
                className={isEditor ? "inline-block max-w-full" : undefined}
              >
                <StyledDescription
                  $styleCss={responsiveStyleToCss(
                    descriptionElement.style,
                    "banner-block",
                    {
                      mobileOnly: mode === "editor",
                    }
                  )}
                >
                  <InlineEditableText
                    value={data.description}
                    dataKey="description"
                    instanceId={block.instanceId}
                    mode={mode}
                    multiline
                    onUpdateContent={onUpdateContent}
                  >
                    {(text) => text}
                  </InlineEditableText>
                </StyledDescription>
              </EditablePart>

              {/* button */}
              {data.showButton && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="button"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledButton
                    href={data.buttonUrl || undefined}
                    onClick={(event) => {
                      if (mode === "editor") {
                        event.preventDefault();
                      }
                    }}
                    $styleCss={responsiveStyleToCss(
                      buttonElement.style,
                      "banner-button",
                      { mobileOnly: mode === "editor", effect: "button" }
                    )}
                  >
                    <InlineEditableText
                      value={data.buttonText}
                      dataKey="buttonText"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => text}
                    </InlineEditableText>
                  </StyledButton>
                </EditablePart>
              )}
            </ContentStack>
          </ContentInner>
        </ContentWrapper>
      </StyledContainer>
    </EditablePart>
  );
}

export default BannerBlock;
