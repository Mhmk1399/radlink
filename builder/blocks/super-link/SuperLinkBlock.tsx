"use client";

import React, { useMemo } from "react";
import styled, { css, keyframes } from "styled-components";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";

import {
  FaLink,
  FaInstagram,
  FaWhatsapp,
  FaTelegramPlane,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaYoutube,
  FaLinkedinIn,
  FaFacebookF,
  FaTwitter,
  FaShoppingCart,
  FaCalendarAlt,
  FaUser,
  FaDownload,
  FaStar,
  FaHeart,
  FaPlay,
  FaFileAlt,
} from "react-icons/fa";

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */

const ICONS: Record<string, React.ComponentType<{ size?: number | string }>> = {
  link: FaLink,
  instagram: FaInstagram,
  whatsapp: FaWhatsapp,
  telegram: FaTelegramPlane,
  phone: FaPhoneAlt,
  email: FaEnvelope,
  website: FaGlobe,
  location: FaMapMarkerAlt,
  youtube: FaYoutube,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  twitter: FaTwitter,
  shop: FaShoppingCart,
  calendar: FaCalendarAlt,
  user: FaUser,
  download: FaDownload,
  star: FaStar,
  heart: FaHeart,
  play: FaPlay,
  file: FaFileAlt,
};

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const PREFIX = "superLink";

/* ------------------------------------------------------------------ */
/*  Icon animation keyframes                                           */
/* ------------------------------------------------------------------ */

const pulseKf = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
`;

const bounceKf = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

const rotateKf = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const wiggleKf = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
`;

const floatKf = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;

type IconAnimation =
  | "none"
  | "pulse"
  | "bounce"
  | "rotate"
  | "wiggle"
  | "float";

const iconAnimationCss = (anim: IconAnimation) => {
  switch (anim) {
    case "pulse":
      return css`
        animation: ${pulseKf} 1.6s ease-in-out infinite;
      `;
    case "bounce":
      return css`
        animation: ${bounceKf} 1.4s ease-in-out infinite;
      `;
    case "rotate":
      return css`
        animation: ${rotateKf} 3s linear infinite;
      `;
    case "wiggle":
      return css`
        animation: ${wiggleKf} 1.2s ease-in-out infinite;
      `;
    case "float":
      return css`
        animation: ${floatKf} 2.4s ease-in-out infinite;
      `;
    default:
      return css``;
  }
};

/* ------------------------------------------------------------------ */
/*  Styled components                                                  */
/* ------------------------------------------------------------------ */

const StyledContainer = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes("super-link-container")}
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
  cursor: pointer;
  border-style: solid;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  }

  ${({ $styleCss }) => $styleCss}
`;

const StyledIcon = styled.span<{
  $styleCss: string;
  $iconAnim: IconAnimation;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  ${({ $iconAnim }) => iconAnimationCss($iconAnim)}
  ${({ $styleCss }) => $styleCss}
`;

const StyledTitle = styled.span<{ $styleCss: string }>`
  display: block;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ $styleCss }) => $styleCss}
`;

const StyledDescription = styled.span<{ $styleCss: string }>`
  display: block;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  ${({ $styleCss }) => $styleCss}
`;

const StyledArrow = styled.span<{ $styleCss: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  transition: transform 0.15s ease;
  ${StyledContainer}:hover & {
    transform: translateX(-3px);
  }
  ${({ $styleCss }) => $styleCss}
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const SuperLinkBlock: React.FC<BlockComponentProps> = ({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}) => {
  const data = block.data as Record<string, unknown>;
  const elements = block.elements ?? {};

  const isEditor = mode === "editor";
  const responsiveOpts = { mobileOnly: isEditor };
  const direction = block.settings.direction === "ltr" ? "ltr" : "rtl";

  /* ---------- styles ---------- */
  const containerStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.container?.style,
        "super-link-block",
        responsiveOpts,
      ),
    [elements.container?.style, isEditor],
  );

  const iconStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.icon?.style,
        "super-link-block",
        responsiveOpts,
      ),
    [elements.icon?.style, isEditor],
  );

  const titleStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.title?.style,
        "super-link-block",
        responsiveOpts,
      ),
    [elements.title?.style, isEditor],
  );

  const descriptionStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.description?.style,
        "super-link-block",
        responsiveOpts,
      ),
    [elements.description?.style, isEditor],
  );

  const arrowStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.arrow?.style,
        "super-link-block",
        responsiveOpts,
      ),
    [elements.arrow?.style, isEditor],
  );

  /* ---------- data ---------- */
  const title = typeof data.title === "string" ? data.title : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const url = typeof data.url === "string" ? data.url : "";
  const iconName = typeof data.iconName === "string" ? data.iconName : "link";
  const iconAnimation: IconAnimation =
    typeof data.iconAnimation === "string" &&
    ["none", "pulse", "bounce", "rotate", "wiggle", "float"].includes(
      data.iconAnimation,
    )
      ? (data.iconAnimation as IconAnimation)
      : "none";
  const showDescription = data.showDescription !== false;
  const showArrow = data.showArrow !== false;
  const openInNewTab = data.openInNewTab !== false;
  const hasUrl = url.length > 0;

  /* ---------- icon ---------- */
  const IconComp = ICONS[iconName] ?? FaLink;

  const handleContainerSelect = (event: React.MouseEvent) => {
    if (!isEditor) return;

    event.preventDefault();
    event.stopPropagation();

    onSelectElement?.(block.instanceId, "container");
  };

  /* ---------- render ---------- */
  return (
    <StyledContainer
      as={isEditor || !hasUrl ? "div" : "a"}
      dir={direction}
      href={!isEditor && hasUrl ? url : undefined}
      target={!isEditor && hasUrl && openInNewTab ? "_blank" : undefined}
      rel={
        !isEditor && hasUrl && openInNewTab ? "noopener noreferrer" : undefined
      }
      onClick={isEditor ? handleContainerSelect : undefined}
      $styleCss={containerStyle}
    >
      <EditablePart
        instanceId={block.instanceId}
        elementId="icon"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledIcon $iconAnim={iconAnimation} $styleCss={iconStyle}>
          <IconComp />
        </StyledIcon>
      </EditablePart>

      <div className="min-w-0 flex-1">
        <EditablePart
          instanceId={block.instanceId}
          elementId="title"
          mode={mode}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        >
          <StyledTitle $styleCss={titleStyle}>
            <InlineEditableText
              value={title}
              dataKey="title"
              instanceId={block.instanceId}
              mode={mode}
              onUpdateContent={onUpdateContent}
            >
              {(text) => text}
            </InlineEditableText>
          </StyledTitle>
        </EditablePart>

        {showDescription && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="description"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledDescription $styleCss={descriptionStyle}>
              <InlineEditableText
                value={description}
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
        )}
      </div>

      {showArrow && (
        <EditablePart
          instanceId={block.instanceId}
          elementId="arrow"
          mode={mode}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        >
          <StyledArrow $styleCss={arrowStyle}>
            ←
          </StyledArrow>
        </EditablePart>
      )}
    </StyledContainer>
  );
};

export default SuperLinkBlock;
