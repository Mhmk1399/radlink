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
  showButton: true,
  showOverlay: true,
};

const DEFAULT_ELEMENTS: Record<BannerElementId, BlockElement> = {
  container: {
    label: "قاب اصلی",
    allowedStyleKeys: [
      "backgroundColor",
      "borderRadius",
      "borderColor",
      "borderWidth",
      "animation",
    ],
    style: {
      backgroundColor: { mobile: "#0f172a" },
      borderRadius: { mobile: 24 },
      borderColor: { mobile: "transparent" },
      borderWidth: { mobile: 0 },
      animation: "none",
    },
  },
  overlay: {
    label: "پوشش تصویر",
    allowedStyleKeys: ["backgroundColor"],
    style: {
      backgroundColor: { mobile: "rgba(15, 23, 42, 0.45)" },
    },
  },
  title: {
    label: "عنوان",
    allowedStyleKeys: ["color", "fontSize", "animation"],
    style: {
      color: { mobile: "#ffffff" },
      fontSize: { mobile: 28, tablet: 36, desktop: 44 },
      animation: "slideUp",
    },
  },
  description: {
    label: "توضیحات",
    allowedStyleKeys: ["color", "fontSize"],
    style: {
      color: { mobile: "rgba(255, 255, 255, 0.92)" },
      fontSize: { mobile: 15, tablet: 17, desktop: 18 },
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
      color: { mobile: "#111827" },
      backgroundColor: { mobile: "#ffffff" },
      fontSize: { mobile: 15, tablet: 16, desktop: 16 },
      borderRadius: { mobile: 12 },
      borderColor: { mobile: "#ffffff" },
      borderWidth: { mobile: 1 },
      animation: "pulse",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Shared keyframes                                                   */
/* ------------------------------------------------------------------ */

const sharedAnimationStyles = css`
  ${sharedBlockKeyframes("banner-block")}
`;

/* ------------------------------------------------------------------ */
/*  Styled components                                                  */
/* ------------------------------------------------------------------ */

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  position: relative;
  width: 100%;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  ${(props) => props.$styleCss}
`;

const StyledOverlay = styled.div<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  position: absolute;
  inset: 0;
  ${(props) => props.$styleCss}
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  margin: 0;
  font-weight: 700;
  line-height: 1.25;
  word-break: break-word;
  ${(props) => props.$styleCss}
`;

const StyledDescription = styled.p<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  margin: 0;
  line-height: 1.9;
  word-break: break-word;
  ${(props) => props.$styleCss}
`;

const StyledButton = styled.a<{ $styleCss: string }>`
  ${sharedAnimationStyles}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  line-height: 1.2;
  word-break: break-word;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  ${(props) => props.$styleCss}
`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mergeResponsiveValue<T>(
  fallback?: ResponsiveValue<T>,
  incoming?: ResponsiveValue<T>,
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
  incoming?: EditableStyleMap,
): EditableStyleMap {
  return {
    color: mergeResponsiveValue(fallback.color, incoming?.color),
    backgroundColor: mergeResponsiveValue(
      fallback.backgroundColor,
      incoming?.backgroundColor,
    ),
    fontSize: mergeResponsiveValue(fallback.fontSize, incoming?.fontSize),
    borderRadius: mergeResponsiveValue(
      fallback.borderRadius,
      incoming?.borderRadius,
    ),
    borderColor: mergeResponsiveValue(
      fallback.borderColor,
      incoming?.borderColor,
    ),
    borderWidth: mergeResponsiveValue(
      fallback.borderWidth,
      incoming?.borderWidth,
    ),
    animation: incoming?.animation ?? fallback.animation,
  };
}

function getElementWithFallback(
  block: PageBlock,
  elementId: BannerElementId,
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

type InlineEditableTextProps = {
  value: string;
  dataKey: keyof BannerData;
  instanceId: string;
  mode: EditorMode;
  onUpdateContent?: (
    instanceId: string,
    key: keyof BannerData,
    value: string,
  ) => void;
  children: (value: string) => React.ReactNode;
};

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
  const settings = (block.settings ?? {}) as Record<string, unknown>;
  const direction = settings.direction === "ltr" ? "ltr" : "rtl";

  const containerElement = getElementWithFallback(block, "container");
  const overlayElement = getElementWithFallback(block, "overlay");
  const titleElement = getElementWithFallback(block, "title");
  const descriptionElement = getElementWithFallback(block, "description");
  const buttonElement = getElementWithFallback(block, "button");

  const backgroundStyle = data.imageUrl
    ? { backgroundImage: `url(${data.imageUrl})` }
    : undefined;

  const isEditor = mode === "editor";

   

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
        className="relative min-h-[320px] w-full md:min-h-[420px]"
        style={backgroundStyle}
        $styleCss={responsiveStyleToCss(
          containerElement.style,
          "banner-block",
          {
            mobileOnly: mode === "editor",
          },
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
                "banner-block",
              )}
            />
          </EditablePart>
        )}

        {/* ---------- content ---------- */}
        <div className="relative z-[2] flex min-h-[320px] items-center md:min-h-[420px]">
          <div className="w-full p-6 text-start md:p-10 lg:p-14">
            <div className="flex max-w-2xl flex-col items-start gap-4 md:gap-5">
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
                    },
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
                    },
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
                      { mobileOnly: mode === "editor" },
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
            </div>
          </div>
        </div>
      </StyledContainer>
    </EditablePart>
  );
}

export default BannerBlock;
