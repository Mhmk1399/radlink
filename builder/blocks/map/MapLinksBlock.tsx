"use client";

import React, { useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";

/* ================================================================== */
/*  Map service icon asset paths                                       */
/* ================================================================== */

const GoogleMapIcon = "/assets/svg/Google.svg";
const NeshanIcon = "/assets/svg/Neshan.svg";
const BaladIcon = "/assets/svg/Balad.svg";
const WazeIcon = "/assets/svg/Waze.svg";

/* ================================================================== */
/*  Brand colors per service                                           */
/* ================================================================== */

const BRAND_COLORS: Record<string, string> = {
  googleMapsUrl: "#4285F4",
  neshanUrl: "#00C853",
  baladUrl: "#FF6D00",
  wazeUrl: "#33CCFF",
};

/* ================================================================== */
/*  Service definition                                                 */
/* ================================================================== */

interface MapService {
  key: string;
  showKey: string;
  labelKey: string;
  fallbackLabel: string;
  Icon: string;
}

interface RenderMapService {
  id: string;
  label: string;
  Icon: string;
  url: string;
  brandColor: string;
  labelKey?: string;
  repeaterKey?: "mapItems";
  repeaterItemId?: string;
  repeaterIndex?: number;
  buttonStyle?: React.CSSProperties;
}

const services: MapService[] = [
  {
    key: "googleMapsUrl",
    showKey: "showGoogleMaps",
    labelKey: "googleMapsLabel",
    fallbackLabel: "گوگل مپ",
    Icon: GoogleMapIcon,
  },
  {
    key: "neshanUrl",
    showKey: "showNeshan",
    labelKey: "neshanLabel",
    fallbackLabel: "نشان",
    Icon: NeshanIcon,
  },
  {
    key: "baladUrl",
    showKey: "showBalad",
    labelKey: "baladLabel",
    fallbackLabel: "بلد",
    Icon: BaladIcon,
  },
  {
    key: "wazeUrl",
    showKey: "showWaze",
    labelKey: "wazeLabel",
    fallbackLabel: "ویز",
    Icon: WazeIcon,
  },
];

const SERVICE_BY_PROVIDER: Record<string, MapService> = {
  googleMaps: services[0],
  neshan: services[1],
  balad: services[2],
  waze: services[3],
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getExtraMapServices(
  items: unknown,
  { includeEmpty }: { includeEmpty: boolean },
): RenderMapService[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item, index): RenderMapService[] => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    if (record.enabled === false) return [];

    const provider = getString(record.provider) || "googleMaps";
    const service = SERVICE_BY_PROVIDER[provider];
    if (!service) return [];

    const url = getString(record.url);
    if (!includeEmpty && !url) return [];

    const brandColor =
      getString(record.brandColor) || BRAND_COLORS[service.key] || "#64748b";
    const backgroundColor = getString(record.backgroundColor);
    const textColor = getString(record.textColor);

    return [
      {
        id: `custom-${getString(record.id) || index}-${provider}`,
        label: getString(record.label) || service.fallbackLabel,
        Icon: service.Icon,
        url,
        brandColor,
        repeaterKey: "mapItems",
        repeaterItemId: getString(record.id) || undefined,
        repeaterIndex: index,
        buttonStyle: {
          ...(backgroundColor ? { backgroundColor } : {}),
          ...(textColor ? { color: textColor } : {}),
        },
      },
    ];
  });
}

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const PREFIX = "mapLinks";

/* ================================================================== */
/*  Animations                                                         */
/* ================================================================== */

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ================================================================== */
/*  Styled components                                                  */
/* ================================================================== */

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(p) => p.$styleCss}

  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 10px 30px rgba(15, 23, 42, 0.06);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.04), transparent 26%),
      radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.03), transparent 30%);
  }
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
`;

const HeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  margin: 0;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  text-align: center;
  ${({ $styleCss }) => $styleCss}
`;

 

const StyledDescription = styled.p<{ $styleCss: string }>`
  margin: 0;
  line-height: 1.8;
  text-align: center;
  max-width: 480px;
  ${({ $styleCss }) => $styleCss}
`;

const GridWrapper = styled.div<{ $columns: number }>`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(${(p) => p.$columns}, 1fr);

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StyledMapButton = styled.div<{
  $styleCss: string;
  $disabled: boolean;
  $brandColor: string;
  $index: number;
}>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  text-decoration: none;
  user-select: none;
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.4s ease both;
  animation-delay: ${({ $index }) => $index * 0.06}s;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 4px 14px rgba(15, 23, 42, 0.04);
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    background: ${({ $brandColor }) =>
      `linear-gradient(135deg, ${$brandColor}08, ${$brandColor}12)`};
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  &:hover {
    ${({ $disabled, $brandColor }) =>
      !$disabled
        ? `
      transform: translateY(-3px) scale(1.01);
      box-shadow:
        0 8px 22px ${$brandColor}18,
        0 2px 8px ${$brandColor}10;
      border-color: ${$brandColor}30;

      &::before { opacity: 1; }
    `
        : ""}
  }

  &:active {
    ${({ $disabled }) =>
      !$disabled
        ? `
      transform: translateY(-1px) scale(1.0);
    `
        : ""}
  }

  ${({ $styleCss }) => $styleCss}
`;

const IconCircle = styled.span<{ $brandColor: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 14px;
  background: ${({ $brandColor }) => `${$brandColor}12`};
  transition:
    background-color 0.25s ease,
    transform 0.25s ease;

  ${StyledMapButton}:hover & {
    background: ${({ $brandColor }) => `${$brandColor}1A`};
    transform: scale(1.06);
  }
`;

const StyledIcon = styled.span<{ $styleCss: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  ${({ $styleCss }) => $styleCss}
`;

const StyledLabel = styled.span<{ $styleCss: string }>`
  flex: 1;
  min-width: 0;
  font-weight: 600;
  line-height: 1.4;
  ${({ $styleCss }) => $styleCss}
`;

const EmptyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  animation: ${fadeInUp} 0.4s ease both;
`;

const EmptyStateIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
`;

/* ================================================================== */
/*  Placeholder icons                                                  */
/* ================================================================== */

function MapPinIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

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
        { ...responsiveOpts, effect: "surface" },
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
        { ...responsiveOpts, effect: "button" },
      ),
    [elements.mapButton?.style, isEditor],
  );

  const iconStyle = useMemo(
    () =>
      responsiveStyleToCss(
        elements.icon?.style,
        "map-links-block",
        { ...responsiveOpts, effect: "tap" },
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

  /* ---------- grid columns ---------- */
  const gridColumnsRaw = elements.container?.style?.gridColumns;
  const gridColumns =
    typeof gridColumnsRaw?.mobile === "number" && gridColumnsRaw.mobile >= 1
      ? gridColumnsRaw.mobile
      : 1;

  /* ---------- data ---------- */
  const title = typeof data.title === "string" ? data.title : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const showTitle = data.showTitle !== false;
  const showDescription = data.showDescription !== false;
  const openInNewTab = data.openInNewTab !== false;
  const includeEmptyServices = isEditor || mode === "preview";

  /* ---------- visible services ---------- */
  const visibleServices = useMemo(() => {
    const baseServices: RenderMapService[] = services
      .filter((service) => {
        const shouldShow = data[service.showKey] !== false;
        const url = getString(data[service.key]);

        if (includeEmptyServices) {
          return shouldShow;
        }
        return shouldShow && url.length > 0;
      })
      .map((service) => ({
        id: service.key,
        label: getString(data[service.labelKey]) || service.fallbackLabel,
        labelKey: service.labelKey,
        Icon: service.Icon,
        url: getString(data[service.key]),
        brandColor: BRAND_COLORS[service.key] || "#64748b",
      }));

    return [
      ...baseServices,
      ...getExtraMapServices(data.mapItems, {
        includeEmpty: includeEmptyServices,
      }),
    ];
  }, [data, includeEmptyServices]);

  const hasAnyVisible = visibleServices.length > 0;

  const updateRepeaterLabel = (service: RenderMapService, label: unknown) => {
    if (!service.repeaterKey) return;
    const currentItems = Array.isArray(data[service.repeaterKey])
      ? (data[service.repeaterKey] as Array<Record<string, unknown>>)
      : [];
    const nextItems = currentItems.map((item, index) => {
      const itemId = getString(item.id);
      const isTarget = service.repeaterItemId
        ? itemId === service.repeaterItemId
        : index === service.repeaterIndex;
      return isTarget ? { ...item, label: String(label ?? "") } : item;
    });
    onUpdateContent?.(block.instanceId, service.repeaterKey, nextItems);
  };

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
        className="p-5 sm:p-7"
        dir={block.settings?.direction ?? "rtl"}
      >
        <ContentLayer className="flex flex-col gap-5">
          {/* Header */}
          {(showTitle || showDescription) && (
            <HeaderStack>
              {showTitle && (
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
                      {(text) => <>{text}</>}
                    </InlineEditableText>
                  </StyledTitle>
                 </EditablePart>
              )}

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
                    className="mx-auto mt-1"
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
            </HeaderStack>
          )}

          {/* Service buttons grid */}
          {hasAnyVisible ? (
            <GridWrapper $columns={gridColumns} className="mt-1">
              {visibleServices.map((service, index) => {
                const url = service.url;
                const hasUrl = url.length > 0;
                const isDisabled = !hasUrl;
                const IconSrc = service.Icon;
                const brandColor = service.brandColor;

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
                    $brandColor={brandColor}
                    $index={index}
                    style={service.buttonStyle}
                  >
                    <EditablePart
                      instanceId={block.instanceId}
                      elementId="icon"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <IconCircle $brandColor={brandColor}>
                        <StyledIcon $styleCss={iconStyle}>
                          <img
                            src={IconSrc}
                            alt={`${service.label} icon`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                            draggable={false}
                          />
                        </StyledIcon>
                      </IconCircle>
                    </EditablePart>

                    <EditablePart
                      instanceId={block.instanceId}
                      elementId="label"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <StyledLabel $styleCss={labelStyle}>
                        {service.labelKey ? (
                          <InlineEditableText
                            value={service.label}
                            dataKey={service.labelKey}
                            instanceId={block.instanceId}
                            mode={mode}
                            onUpdateContent={onUpdateContent}
                          >
                            {(text) => <>{text}</>}
                          </InlineEditableText>
                        ) : service.repeaterKey ? (
                          <InlineEditableText
                            value={service.label}
                            dataKey="label"
                            instanceId={block.instanceId}
                            mode={mode}
                            onUpdateContent={(_, __, value) =>
                              updateRepeaterLabel(service, value)
                            }
                          >
                            {(text) => <>{text}</>}
                          </InlineEditableText>
                        ) : (
                          service.label
                        )}
                      </StyledLabel>
                    </EditablePart>

                    {isEditor && isDisabled && (
                      <EmptyBadge>
                        <LinkIcon />
                        بدون لینک
                      </EmptyBadge>
                    )}
                  </StyledMapButton>
                );

                if (isEditor) {
                  return (
                    <EditablePart
                      key={service.id}
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

                if (!hasUrl) return null;

                return (
                  <a
                    key={service.id}
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
            </GridWrapper>
          ) : (
            isEditor && (
              <EmptyStateWrapper>
                <EmptyStateIcon>
                  <MapPinIcon />
                </EmptyStateIcon>
                <p
                  className="text-sm text-slate-400 text-center leading-relaxed"
                  style={{ margin: 0 }}
                >
                  لینک نقشه‌ای وارد نشده است.
                  <br />
                  <span className="text-xs text-slate-300">
                    از تنظیمات بلاک، لینک‌ها را اضافه کنید.
                  </span>
                </p>
              </EmptyStateWrapper>
            )
          )}
        </ContentLayer>
      </StyledContainer>
    </EditablePart>
  );
};

export default MapLinksBlock;
