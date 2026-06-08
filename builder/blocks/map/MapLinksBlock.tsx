"use client";

import React, { useMemo } from "react";
import styled from "styled-components";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";

/* ------------------------------------------------------------------ */
/*  Map service icon asset paths                                       */
/* ------------------------------------------------------------------ */

const GoogleMapIcon = "/assets/svg/google.svg";
const NeshanIcon = "/assets/svg/neshan.svg";
const BaladIcon = "/assets/svg/balad.svg";

/* ------------------------------------------------------------------ */
/*  Service definition                                                 */
/* ------------------------------------------------------------------ */

interface MapService {
  key: string;
  showKey: string;
  label: string;
  Icon: string;
}

const services: MapService[] = [
  {
    key: "googleMapsUrl",
    showKey: "showGoogleMaps",
    label: "گوگل مپ",
    Icon: GoogleMapIcon,
  },
  { key: "neshanUrl", showKey: "showNeshan", label: "نشان", Icon: NeshanIcon },
  { key: "baladUrl", showKey: "showBalad", label: "بلد", Icon: BaladIcon },
];
/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const PREFIX = "mapLinks";

/* ------------------------------------------------------------------ */
/*  Styled components                                                  */
/* ------------------------------------------------------------------ */

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(p) => p.$styleCss}
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
  ${({ $styleCss }) => $styleCss}
`;

const StyledDescription = styled.p<{ $styleCss: string }>`
  margin: 0;
  line-height: 1.7;
  ${({ $styleCss }) => $styleCss}
`;

const StyledMapButton = styled.div<{ $styleCss: string; $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
  text-decoration: none;
  user-select: none;

  &:hover {
    ${({ $disabled }) =>
      !$disabled &&
      `
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    `}
  }
  ${({ $styleCss }) => $styleCss}
`;

const StyledIcon = styled.span<{ $styleCss: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  ${({ $styleCss }) => $styleCss}
`;

const StyledLabel = styled.span<{ $styleCss: string }>`
  flex: 1;
  min-width: 0;
  ${({ $styleCss }) => $styleCss}
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const MapLinksBlock: React.FC<BlockComponentProps> = ({
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

  /* ---------- styles ---------- */
  const containerStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.container?.style,
        "map-links-block",
        responsiveOpts,
      ),
    [elements.container?.style, isEditor],
  );

  const titleStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.title?.style,
        "map-links-block",
        responsiveOpts,
      ),
    [elements.title?.style, isEditor],
  );

  const descriptionStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.description?.style,
        "map-links-block",
        responsiveOpts,
      ),
    [elements.description?.style, isEditor],
  );

  const mapButtonStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.mapButton?.style,
        "map-links-block",
        responsiveOpts,
      ),
    [elements.mapButton?.style, isEditor],
  );

  const iconStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.icon?.style,
        "map-links-block",
        responsiveOpts,
      ),
    [elements.icon?.style, isEditor],
  );

  const labelStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.label?.style,
        "map-links-block",
        responsiveOpts,
      ),
    [elements.label?.style, isEditor],
  );

  /* ---------- data ---------- */
  const title = typeof data.title === "string" ? data.title : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const showTitle = data.showTitle !== false;
  const showDescription = data.showDescription !== false;
  const openInNewTab = data.openInNewTab !== false;

  /* ---------- visible services ---------- */
  const visibleServices = useMemo(() => {
    return services.filter((s) => {
      const shouldShow = data[s.showKey] !== false;
      const url =
        typeof data[s.key] === "string" ? (data[s.key] as string) : "";

      if (isEditor) {
        return shouldShow;
      }
      // preview/public: only show if enabled AND has URL
      return shouldShow && url.length > 0;
    });
  }, [data, isEditor]);

  const hasAnyVisible = visibleServices.length > 0;

  /* ---------- render ---------- */
  return (
    <EditablePart
      instanceId={block.instanceId}
      elementId="container"
      mode={mode}
      selectedElementId={selectedElementId}
      onSelectElement={onSelectElement}
    >
      <StyledContainer
        $styleCss={containerStyle}
        className="flex flex-col gap-4 p-5"
        dir={block.settings?.direction ?? "rtl"}
      >
        {/* Title */}
        {showTitle && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="title"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledTitle $styleCss={titleStyle} className="text-center">
              <InlineEditableText
                value={title}
                dataKey="title"
                instanceId={block.instanceId}
                mode={mode}
                onUpdateContent={onUpdateContent}
              >
                {(text) => <>{text}</>}
              </InlineEditableText>
            </StyledTitle>
          </EditablePart>
        )}

        {/* Description */}
        {showDescription && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="description"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledDescription
              $styleCss={descriptionStyle}
              className="text-center"
            >
              <InlineEditableText
                value={description}
                dataKey="description"
                instanceId={block.instanceId}
                mode={mode}
                multiline
                onUpdateContent={onUpdateContent}
              >
                {(text) => <>{text}</>}
              </InlineEditableText>
            </StyledDescription>
          </EditablePart>
        )}

        {/* Service buttons grid */}
        {hasAnyVisible ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2">
            {visibleServices.map((service) => {
              const url =
                typeof data[service.key] === "string"
                  ? (data[service.key] as string)
                  : "";
              const hasUrl = url.length > 0;
              const isDisabled = !hasUrl;
              const IconSrc = service.Icon;

              const handleClick = (e: React.MouseEvent) => {
                if (isEditor) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (!hasUrl) {
                  e.preventDefault();
                }
              };

              const buttonContent = (
                <StyledMapButton
                  $styleCss={mapButtonStyle}
                  $disabled={isEditor && isDisabled}
                >
                  <EditablePart
                    instanceId={block.instanceId}
                    elementId="icon"
                    mode={mode}
                    selectedElementId={selectedElementId}
                    onSelectElement={onSelectElement}
                  >
                    <StyledIcon $styleCss={iconStyle}>
                      <img
                        src={IconSrc}
                        alt={`${service.label} icon`}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </StyledIcon>
                  </EditablePart>

                  <EditablePart
                    instanceId={block.instanceId}
                    elementId="label"
                    mode={mode}
                    selectedElementId={selectedElementId}
                    onSelectElement={onSelectElement}
                  >
                    <StyledLabel $styleCss={labelStyle}>
                      {service.label}
                      {isEditor && isDisabled && (
                        <span className="text-xs opacity-50 mr-2">
                          (بدون لینک)
                        </span>
                      )}
                    </StyledLabel>
                  </EditablePart>
                </StyledMapButton>
              );

              if (isEditor) {
                return (
                  <EditablePart
                    key={service.key}
                    instanceId={block.instanceId}
                    elementId="mapButton"
                    mode={mode}
                    selectedElementId={selectedElementId}
                    onSelectElement={onSelectElement}
                  >
                    <div onClick={handleClick}>{buttonContent}</div>
                  </EditablePart>
                );
              }

              // preview/public
              if (!hasUrl) return null;

              return (
                <a
                  key={service.key}
                  href={url}
                  target={openInNewTab ? "_blank" : undefined}
                  rel={openInNewTab ? "noopener noreferrer" : undefined}
                  onClick={handleClick}
                  className="no-underline"
                >
                  {buttonContent}
                </a>
              );
            })}
          </div>
        ) : (
          isEditor && (
            <div className="text-center text-sm text-gray-400 py-6">
              لینک نقشه‌ای وارد نشده است.
            </div>
          )
        )}
      </StyledContainer>
    </EditablePart>
  );
};

export default MapLinksBlock;
