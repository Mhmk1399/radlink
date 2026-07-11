"use client";

import React from "react";
import styled, { keyframes } from "styled-components";
import {
  SiTelegram,
  SiWhatsapp,
  SiInstagram,
  SiSignal,
  SiDiscord,
  SiMessenger,
  SiYoutube,
} from "react-icons/si";
import { FiLinkedin } from "react-icons/fi";
import { HiOutlineLink } from "react-icons/hi2";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";
import {
  buildPresetMessengerUrl,
  getMessengerPresetForDataKey,
} from "@/lib/messengerLinks";

/* ═══════════════════════════════════════════════════════════════════════════
   X (Twitter) inline SVG
   ═══════════════════════════════════════════════════════════════════════════ */

const XIcon: React.FC = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block" }}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Iranian Messenger Image Icons
   ═══════════════════════════════════════════════════════════════════════════ */

const IranianImageIcon: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => (
  <img
    src={src}
    alt={alt}
    width="24"
    height="24"
    style={{
      width: "1em",
      height: "1em",
      objectFit: "contain",
      display: "block",
    }}
    draggable={false}
  />
);

const EitaaIcon: React.FC = () => (
  <IranianImageIcon src="/assets/svg/Eitaa.svg" alt="ایتا" />
);
const SoroushIcon: React.FC = () => (
  <IranianImageIcon src="/assets/svg/Soroush.svg" alt="سروش" />
);
const RubikaIcon: React.FC = () => (
  <IranianImageIcon src="/assets/svg/Rubika.svg" alt="روبیکا" />
);
const BaleIcon: React.FC = () => (
  <IranianImageIcon src="/assets/svg/Bale.svg" alt="بله" />
);
const IgapIcon: React.FC = () => (
  <IranianImageIcon src="/assets/svg/I-GAP.svg" alt="آی‌گپ" />
);

/* ═══════════════════════════════════════════════════════════════════════════
   Brand Colors
   ═══════════════════════════════════════════════════════════════════════════ */

const BRAND_COLORS: Record<string, string> = {
  telegramUrl: "#26A5E4",
  whatsappUrl: "#25D366",
  instagramUrl: "#E4405F",
  signalUrl: "#3A76F0",
  discordUrl: "#5865F2",
  messengerUrl: "#0084FF",
  xUrl: "#14171A",
  youtubeUrl: "#FF0000",
  linkedinUrl: "#0A66C2",
  eitaaUrl: "#E8873A",
  soroushUrl: "#0099CC",
  rubikaUrl: "#6B43A8",
  baleUrl: "#43B749",
  igapUrl: "#FF6B00",
};

/* ═══════════════════════════════════════════════════════════════════════════
   Service Definitions
   ═══════════════════════════════════════════════════════════════════════════ */

interface ServiceDef {
  urlKey: string;
  showKey: string;
  label: string;
  Icon: React.FC;
}

function resolveServiceUrl(key: string, value: unknown) {
  const rawValue = typeof value === "string" ? value.trim() : "";
  const preset = getMessengerPresetForDataKey(key);
  return preset ? buildPresetMessengerUrl(rawValue, preset) : rawValue;
}

const services: ServiceDef[] = [
  {
    urlKey: "telegramUrl",
    showKey: "showTelegram",
    label: "تلگرام",
    Icon: SiTelegram,
  },
  {
    urlKey: "whatsappUrl",
    showKey: "showWhatsapp",
    label: "واتساپ",
    Icon: SiWhatsapp,
  },
  {
    urlKey: "instagramUrl",
    showKey: "showInstagram",
    label: "اینستاگرام",
    Icon: SiInstagram,
  },
  {
    urlKey: "eitaaUrl",
    showKey: "showEitaa",
    label: "ایتا",
    Icon: EitaaIcon,
  },
  {
    urlKey: "soroushUrl",
    showKey: "showSoroush",
    label: "سروش",
    Icon: SoroushIcon,
  },
  {
    urlKey: "rubikaUrl",
    showKey: "showRubika",
    label: "روبیکا",
    Icon: RubikaIcon,
  },
  {
    urlKey: "baleUrl",
    showKey: "showBale",
    label: "بله",
    Icon: BaleIcon,
  },
  {
    urlKey: "igapUrl",
    showKey: "showIgap",
    label: "آی‌گپ",
    Icon: IgapIcon,
  },
  {
    urlKey: "signalUrl",
    showKey: "showSignal",
    label: "سیگنال",
    Icon: SiSignal,
  },
  {
    urlKey: "messengerUrl",
    showKey: "showMessenger",
    label: "مسنجر",
    Icon: SiMessenger,
  },
  {
    urlKey: "discordUrl",
    showKey: "showDiscord",
    label: "دیسکورد",
    Icon: SiDiscord,
  },
  {
    urlKey: "xUrl",
    showKey: "showX",
    label: "ایکس",
    Icon: XIcon,
  },
  {
    urlKey: "youtubeUrl",
    showKey: "showYoutube",
    label: "یوتیوب",
    Icon: SiYoutube,
  },
  {
    urlKey: "linkedinUrl",
    showKey: "showLinkedin",
    label: "لینکدین",
    Icon: FiLinkedin,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Animations
   ═══════════════════════════════════════════════════════════════════════════ */

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   Styled Components
   ═══════════════════════════════════════════════════════════════════════════ */

const PREFIX = "messenger-links-block";

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(PREFIX)}
  ${({ $styleCss }) => $styleCss}
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 24px rgba(0, 0, 0, 0.03);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        ellipse at 20% 0%,
        rgba(99, 102, 241, 0.04) 0%,
        transparent 60%
      ),
      radial-gradient(
        ellipse at 80% 100%,
        rgba(59, 130, 246, 0.04) 0%,
        transparent 60%
      );
    pointer-events: none;
    border-radius: inherit;
  }
`;

const HeaderSection = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.4;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

 

const StyledDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  line-height: 1.7;
  max-width: 480px;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const GridWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const GridItem = styled.div<{ $index: number }>`
  min-width: 0;
  animation: ${fadeInUp} 0.4s ease both;
  animation-delay: ${({ $index }) => $index * 0.04}s;
`;

const GridLink = styled.a<{ $index: number }>`
  min-width: 0;
  animation: ${fadeInUp} 0.4s ease both;
  animation-delay: ${({ $index }) => $index * 0.04}s;
`;

const StyledMessengerButton = styled.div<{
  $styleCss: string;
  $isEmpty: boolean;
  $brandColor: string;
}>`
  ${({ $styleCss }) => $styleCss}
  min-width: 0;
  height: 100%;
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease;
  opacity: ${({ $isEmpty }) => ($isEmpty ? 0.5 : 1)};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    background: ${({ $brandColor }) =>
      `linear-gradient(135deg, ${$brandColor}08, ${$brandColor}15)`};
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  &:hover {
    transform: ${({ $isEmpty }) =>
      $isEmpty ? "none" : "translateY(-3px) scale(1.02)"};
    box-shadow: ${({ $isEmpty, $brandColor }) =>
      $isEmpty
        ? "none"
        : `0 8px 24px ${$brandColor}20, 0 2px 8px ${$brandColor}10`};
    border-color: ${({ $isEmpty, $brandColor }) =>
      $isEmpty ? "inherit" : `${$brandColor}40`};

    &::before {
      opacity: ${({ $isEmpty }) => ($isEmpty ? 0 : 1)};
    }
  }

  &:active {
    transform: ${({ $isEmpty }) =>
      $isEmpty ? "none" : "translateY(-1px) scale(1.0)"};
  }
`;

const StyledIcon = styled.span<{
  $styleCss: string;
  $brandColor?: string;
}>`
  ${({ $styleCss }) => $styleCss}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition:
    color 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
  color: ${({ $brandColor }) => $brandColor || "inherit"};
`;

const IconCircle = styled.div<{ $brandColor: string }>`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $brandColor }) => `${$brandColor}12`};
  transition:
    background-color 0.25s ease,
    transform 0.25s ease;
  flex-shrink: 0;

  ${StyledMessengerButton}:hover & {
    background: ${({ $brandColor }) => `${$brandColor}1A`};
    transform: scale(1.08);
  }
`;

const StyledLabel = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 500;
  line-height: 1.3;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const EmptyBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 99px;
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

const EmptyStateIconCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 24px;
`;

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function MessengerLinksBlock({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = block.data as Record<string, unknown>;
  const elements = block.elements ?? {};

  const containerStyle = responsiveStyleToCss(
    elements.container?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor", effect: "surface" },
  );
  const titleStyle = responsiveStyleToCss(elements.title?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const descriptionStyle = responsiveStyleToCss(
    elements.description?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const messengerButtonStyle = responsiveStyleToCss(
    elements.messengerButton?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor", effect: "button" },
  );
  const iconStyle = responsiveStyleToCss(elements.icon?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
    effect: "tap",
  });
  const labelStyle = responsiveStyleToCss(elements.label?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });

  const title = typeof data.title === "string" ? data.title : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const showTitle = data.showTitle !== false;
  const showDescription = data.showDescription !== false;
  const showLabels = data.showLabels !== false;
  const openInNewTab = data.openInNewTab !== false;
  const legacyColumns =
    data.cardWidth === "full" ? 1 : data.cardWidth === "quarter" ? 4 : 2;
  const configuredColumns = Number(
    elements.container?.style?.gridColumns?.mobile ?? legacyColumns,
  );
  const gridColumns = Math.min(
    4,
    Math.max(
      1,
      Number.isFinite(configuredColumns) ? Math.round(configuredColumns) : 2,
    ),
  );
  const gridColumnsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[gridColumns];
  const cardLayoutClass =
    gridColumns === 4
      ? "min-h-[88px] flex-col gap-2 px-2 py-3.5"
      : "min-h-[68px] flex-row gap-3.5 px-4 py-3";

  const isEditor = mode === "editor";
  const isBuilderPreview = mode === "preview";

  // Filter visible services
  const visibleServices = services.filter((s) => {
    const shouldShow = data[s.showKey] !== false;
    if (!shouldShow) return false;
    if (isEditor || isBuilderPreview) return true;
    const url = resolveServiceUrl(s.urlKey, data[s.urlKey]);
    return url.length > 0;
  });

  // Public pages must not render enabled services that have no destination.
  if (mode === "public" && visibleServices.length === 0) {
    return null;
  }

  const linkProps = (url: string) => {
    if (isEditor || !url) return {};
    return {
      href: url,
      target: openInNewTab ? ("_blank" as const) : undefined,
      rel: openInNewTab ? "noopener noreferrer" : undefined,
    };
  };

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
        className="w-full p-5 sm:p-7"
        dir="rtl"
      >
        {/* ── Header ──────────────────────────────────────── */}
        <HeaderSection>
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
                className="text-center mt-2"
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
        </HeaderSection>

        {/* ── Empty state in editor ───────────────────────── */}
        {visibleServices.length === 0 && isEditor && (
          <EmptyStateWrapper>
            <EmptyStateIconCircle>
              <HiOutlineLink />
            </EmptyStateIconCircle>
            <p
              className="text-sm text-slate-400 text-center leading-relaxed"
              style={{ margin: 0 }}
            >
              هنوز لینکی برای پیام‌رسان‌ها وارد نشده است.
              <br />
              <span className="text-xs text-slate-300">
                از تنظیمات بلاک، لینک‌ها را اضافه کنید.
              </span>
            </p>
          </EmptyStateWrapper>
        )}

        {/* ── Grid of messenger buttons ───────────────────── */}
        {visibleServices.length > 0 && (
          <GridWrapper
            className={`grid ${gridColumnsClass} gap-2.5 sm:gap-3 ${
              showTitle || showDescription ? "mt-6" : "mt-0"
            }`}
          >
            {visibleServices.map((service, index) => {
              const url = resolveServiceUrl(
                service.urlKey,
                data[service.urlKey],
              );
              const isEmpty = url.length === 0;
              const ServiceIcon = service.Icon;
              const brandColor = BRAND_COLORS[service.urlKey] || "#64748b";

              const buttonContent = (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="messengerButton"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledMessengerButton
                    $styleCss={messengerButtonStyle}
                    $isEmpty={isEmpty}
                    $brandColor={brandColor}
                    className={`flex cursor-pointer items-center justify-center overflow-hidden ${cardLayoutClass}`}
                  >
                    <EditablePart
                      instanceId={block.instanceId}
                      elementId="icon"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <IconCircle $brandColor={brandColor}>
                        <StyledIcon
                          $styleCss={iconStyle}
                          $brandColor={brandColor}
                          className="flex items-center justify-center"
                        >
                          <ServiceIcon />
                        </StyledIcon>
                      </IconCircle>
                    </EditablePart>

                    {showLabels && (
                      <EditablePart
                        instanceId={block.instanceId}
                        elementId="label"
                        mode={mode}
                        selectedElementId={selectedElementId}
                        onSelectElement={onSelectElement}
                      >
                        <StyledLabel
                          $styleCss={labelStyle}
                          className="block max-w-full text-center leading-tight"
                        >
                          {service.label}
                        </StyledLabel>
                      </EditablePart>
                    )}

                    {isEmpty && isEditor && (
                      <EmptyBadge
                        className={gridColumns === 4 ? "hidden" : ""}
                      >
                        <HiOutlineLink style={{ fontSize: 10 }} />
                        بدون لینک
                      </EmptyBadge>
                    )}
                  </StyledMessengerButton>
                </EditablePart>
              );

              if (isEditor || isEmpty) {
                return (
                  <GridItem
                    key={service.urlKey}
                    $index={index}
                    className="min-w-0"
                  >
                    {buttonContent}
                  </GridItem>
                );
              }

              return (
                <GridLink
                  key={service.urlKey}
                  $index={index}
                  {...linkProps(url)}
                  className="min-w-0 no-underline"
                >
                  {buttonContent}
                </GridLink>
              );
            })}
          </GridWrapper>
        )}
      </StyledContainer>
    </EditablePart>
  );
}
