"use client";

import styled, { css } from "styled-components";

import type {
  PageBlock,
  ResponsiveValue,
  AnimationType,
  BlockComponentProps,
} from "@/types/blocks/builder.types";

import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";

type SimpleLinkData = {
  title: string;
  description: string;
  url: string;
  showDescription: boolean;
};

const DEFAULT_DATA: SimpleLinkData = {
  title: "لینک مهم",
  description: "توضیح کوتاه درباره این لینک",
  url: "",
  showDescription: true,
};

const keyframes = css`
  ${sharedBlockKeyframes("simple-link")}
`;

const StyledContainer = styled.a<{ $styleCss: string }>`
  ${keyframes}
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  ${(props) => props.$styleCss}
`;

const StyledIcon = styled.div<{ $styleCss: string }>`
  ${keyframes}
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  ${(props) => props.$styleCss}
`;

const StyledTitle = styled.div<{ $styleCss: string }>`
  ${keyframes}
  font-weight: 700;
  line-height: 1.5;
  word-break: break-word;
  ${(props) => props.$styleCss}
`;

const StyledDescription = styled.div<{ $styleCss: string }>`
  line-height: 1.7;
  word-break: break-word;
  ${(props) => props.$styleCss}
`;

function buildResponsiveCss<T extends string | number>(
  cssProperty: string,
  value: ResponsiveValue<T> | undefined,
  format: (value: T) => string,
): string {
  if (!value) return "";

  let out = "";

  if (value.mobile !== undefined) {
    out += `${cssProperty}: ${format(value.mobile)};\n`;
  }

  if (value.tablet !== undefined) {
    out += `@media (min-width: 768px) { ${cssProperty}: ${format(
      value.tablet,
    )}; }\n`;
  }

  if (value.desktop !== undefined) {
    out += `@media (min-width: 1024px) { ${cssProperty}: ${format(
      value.desktop,
    )}; }\n`;
  }

  return out;
}

function animationToCss(animation?: AnimationType): string {
  switch (animation) {
    case "fade":
      return "animation: simple-link-fade 0.5s ease both;";
    case "slideUp":
      return "animation: simple-link-slide-up 0.5s ease both;";
    case "slideLeft":
      return "animation: simple-link-slide-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "slideRight":
      return "animation: simple-link-slide-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "scale":
      return "animation: simple-link-scale 0.4s ease both;";
    case "pulse":
      return "animation: simple-link-pulse 1.8s ease-in-out infinite;";
    case "bounceIn":
      return "animation: simple-link-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;";
    case "rotateIn":
      return "animation: simple-link-rotate-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "blurIn":
      return "animation: simple-link-blur-in 0.65s ease both;";
    case "slideDown":
      return "animation: simple-link-slide-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "zoomOut":
      return "animation: simple-link-zoom-out 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "flipUp":
      return "animation: simple-link-flip-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "flipSide":
      return "animation: simple-link-flip-side 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "swingIn":
      return "animation: simple-link-swing-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;";
    case "elasticIn":
      return "animation: simple-link-elastic-in 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) both;";
    case "riseSoft":
      return "animation: simple-link-rise-soft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;";
    case "dropSoft":
      return "animation: simple-link-drop-soft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;";
    case "focusIn":
      return "animation: simple-link-focus-in 0.75s ease both;";
    case "glowIn":
      return "animation: simple-link-glow-in 0.9s ease both;";
    case "none":
    default:
      return "animation: none;";
  }
}

function getData(block: PageBlock): SimpleLinkData {
  const raw = block.data as Partial<SimpleLinkData>;

  return {
    title: typeof raw.title === "string" ? raw.title : DEFAULT_DATA.title,
    description:
      typeof raw.description === "string"
        ? raw.description
        : DEFAULT_DATA.description,
    url: typeof raw.url === "string" ? raw.url : DEFAULT_DATA.url,
    showDescription:
      typeof raw.showDescription === "boolean"
        ? raw.showDescription
        : DEFAULT_DATA.showDescription,
  };
}

export function SimpleLinkBlock({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = getData(block);
  const direction = block.settings.direction === "ltr" ? "ltr" : "rtl";
  const isEditor = mode === "editor";

  const container = block.elements.container;
  const icon = block.elements.icon;
  const title = block.elements.title;
  const description = block.elements.description;

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
        href={isEditor ? undefined : data.url || undefined}
        target={isEditor ? undefined : "_blank"}
        rel={isEditor ? undefined : "noopener noreferrer"}
        onClick={
          isEditor
            ? (event) => {
                event.preventDefault();
              }
            : undefined
        }
        className="p-4"
        $styleCss={responsiveStyleToCss(container.style, "simple-link", {
          mobileOnly: mode === "editor",
        })}
      >
        <EditablePart
          instanceId={block.instanceId}
          elementId="icon"
          mode={mode}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        >
          <StyledIcon
            $styleCss={responsiveStyleToCss(icon.style, "simple-link", {
              mobileOnly: mode === "editor",
            })}
          >
            🔗
          </StyledIcon>
        </EditablePart>

        <div className="min-w-0 flex-1">
          <EditablePart
            instanceId={block.instanceId}
            elementId="title"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            className={isEditor ? "inline-block max-w-full" : undefined}
          >
            <StyledTitle
              $styleCss={responsiveStyleToCss(title.style, "simple-link", {
                mobileOnly: mode === "editor",
              })}
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

          {data.showDescription && (
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
                  description.style,
                  "simple-link",
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
                  onUpdateContent={onUpdateContent}
                >
                  {(text) => text}
                </InlineEditableText>
              </StyledDescription>
            </EditablePart>
          )}
        </div>
      </StyledContainer>
    </EditablePart>
  );
}

export default SimpleLinkBlock;
