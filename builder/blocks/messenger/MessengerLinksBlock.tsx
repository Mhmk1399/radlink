"use client";

import React from "react";
import styled from "styled-components";
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
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";

// ─── X (Twitter) inline SVG ────────────────────────────────────────────────────

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

// ─── Iranian Messenger Image Icons ─────────────────────────────────────────────

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
 

// ─── Brand Colors ───────────────────────────────────────────────────────────────

const BRAND_COLORS: Record<string, string> = {
  telegramUrl: "#26A5E4",
  whatsappUrl: "#25D366",
  instagramUrl: "#E4405F",
  signalUrl: "#3A76F0",
  discordUrl: "#5865F2",
  messengerUrl: "#0084FF",
  xUrl: "#000000",
  youtubeUrl: "#FF0000",
  linkedinUrl: "#0A66C2",
};

// ─── Service definitions ────────────────────────────────────────────────────────

interface ServiceDef {
  urlKey: string;
  showKey: string;
  label: string;
  Icon: React.FC;
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

// ─── Styled Components ──────────────────────────────────────────────────────────

const PREFIX = "messenger-links-block";

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(PREFIX)}
  ${({ $styleCss }) => $styleCss}
  transition: background-color 0.2s ease, border-color 0.2s ease;
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledMessengerButton = styled.div<{
  $styleCss: string;
  $isEmpty: boolean;
}>`
  ${({ $styleCss }) => $styleCss}
  transition: background-color 0.2s ease, border-color 0.2s ease,
    transform 0.15s ease, box-shadow 0.2s ease;
  opacity: ${({ $isEmpty }) => ($isEmpty ? 0.45 : 1)};

  &:hover {
    transform: ${({ $isEmpty }) => ($isEmpty ? "none" : "translateY(-2px)")};
    box-shadow: ${({ $isEmpty }) =>
      $isEmpty ? "none" : "0 4px 12px rgba(0,0,0,0.08)"};
  }
`;

const StyledIcon = styled.span<{ $styleCss: string; $brandColor?: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
  ${({ $brandColor }) => ($brandColor ? `color: ${$brandColor};` : "")}
`;

const StyledLabel = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  transition: color 0.2s ease, font-size 0.2s ease;
`;

// ─── Component ──────────────────────────────────────────────────────────────────

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
    { mobileOnly: mode === "editor" },
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
    { mobileOnly: mode === "editor" },
  );
  const iconStyle = responsiveStyleToCss(elements.icon?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const labelStyle = responsiveStyleToCss(elements.label?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });

  const title = typeof data.title === "string" ? data.title : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const showTitle = data.showTitle !== false;
  const showDescription = data.showDescription !== false;
  const openInNewTab = data.openInNewTab !== false;

  const isEditor = mode === "editor";

  // Filter visible services
  const visibleServices = services.filter((s) => {
    const shouldShow = data[s.showKey] !== false;
    if (!shouldShow) return false;
    if (isEditor) return true;
    const url =
      typeof data[s.urlKey] === "string" ? (data[s.urlKey] as string) : "";
    return url.length > 0;
  });

  // In preview/public, if nothing visible, render nothing
  if (!isEditor && visibleServices.length === 0) {
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
        className="w-full p-5 md:p-8"
        dir="rtl"
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
            <StyledTitle $styleCss={titleStyle} className="text-center mb-2">
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
              className="text-center mb-6"
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

        <br />

        {/* Empty state in editor */}
        {visibleServices.length === 0 && isEditor && (
          <p className="text-center text-sm text-gray-400 py-8">
            هنوز لینکی برای پیام‌رسان‌ها وارد نشده است.
          </p>
        )}

        {/* Grid of messenger buttons */}
        {visibleServices.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {visibleServices.map((service) => {
              const url =
                typeof data[service.urlKey] === "string"
                  ? (data[service.urlKey] as string)
                  : "";
              const isEmpty = url.length === 0;
              const ServiceIcon = service.Icon;
              const brandColor = BRAND_COLORS[service.urlKey];

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
                    className="flex flex-col items-center justify-center gap-2 p-4 cursor-pointer"
                  >
                    <EditablePart
                      instanceId={block.instanceId}
                      elementId="icon"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <StyledIcon
                        $styleCss={iconStyle}
                        $brandColor={brandColor}
                        className="w-10 h-10 flex items-center justify-center"
                      >
                        <ServiceIcon />
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
                      </StyledLabel>
                    </EditablePart>

                    {isEmpty && isEditor && (
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        بدون لینک
                      </span>
                    )}
                  </StyledMessengerButton>
                </EditablePart>
              );

              if (isEditor || isEmpty) {
                return <div key={service.urlKey}>{buttonContent}</div>;
              }

              return (
                <a
                  key={service.urlKey}
                  {...linkProps(url)}
                  className="no-underline"
                >
                  {buttonContent}
                </a>
              );
            })}
          </div>
        )}
      </StyledContainer>
    </EditablePart>
  );
}
