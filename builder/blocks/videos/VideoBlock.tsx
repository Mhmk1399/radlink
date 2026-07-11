"use client";

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

const PREFIX = "vid";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type VideoData = {
  title: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  buttonText: string;
  buttonUrl: string;
  showTitle: boolean;
  showDescription: boolean;
  showButton: boolean;
  controls: boolean;
  muted: boolean;
  loop: boolean;
};

type VideoBlockProps = BlockComponentProps & {
  block: PageBlock & { data: VideoData };
};

/* ================================================================== */
/*  Styled root                                                        */
/* ================================================================== */

const VideoRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
`;

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("vid-container")}
  ${(props) => props.$styleCss}
`;

const StyledTitle = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("vid-title")}
  ${(props) => props.$styleCss}
`;

const StyledDescription = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("vid-description")}
  ${(props) => props.$styleCss}
`;

const StyledVideo = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("vid-video")}
  ${(props) => props.$styleCss}
`;

const StyledButton = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes("vid-button")}
  ${(props) => props.$styleCss}
`;

/* ================================================================== */
/*  Placeholder                                                        */
/* ================================================================== */

function VideoPlaceholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-neutral-100 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          className="text-neutral-400"
        >
          <path d="M8 6.5V17.5L17 12L8 6.5Z" fill="currentColor" />
        </svg>
      </div>

      <div className="space-y-1 px-4">
        <p className="text-sm font-semibold text-neutral-600">
          هنوز ویدئویی انتخاب نشده است
        </p>
        <p className="text-xs leading-6 text-neutral-400">
          لینک ویدئو را از بخش محتوا وارد کن
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function VideoBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: VideoBlockProps) {
  const data = block.data as VideoData;

  const mobileOnly = mode === "editor";

  const containerStyle = responsiveStyleToCss(
    block.elements.container.style,
    "vid-container",
    { mobileOnly, effect: "surface" },
  );

  const titleStyle = responsiveStyleToCss(
    block.elements.title.style,
    "vid-title",
    { mobileOnly },
  );

  const descriptionStyle = responsiveStyleToCss(
    block.elements.description.style,
    "vid-description",
    { mobileOnly },
  );

  const videoStyle = responsiveStyleToCss(
    block.elements.video.style,
    "vid-video",
    { mobileOnly, effect: "media" },
  );

  const buttonStyle = responsiveStyleToCss(
    block.elements.button.style,
    "vid-button",
    { mobileOnly, effect: "button" },
  );

  const hasVideo = Boolean(String(block.data.videoUrl ?? "").trim());
  const buttonHref =
    mode === "editor"
      ? undefined
      : String(block.data.buttonUrl ?? "").trim() || undefined;

  return (
    <VideoRoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          dir="rtl"
          className="flex flex-col gap-5 overflow-hidden px-5 py-6 sm:px-7 sm:py-7"
          $styleCss={containerStyle}
        >
          {Boolean(block.data.showTitle) && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="title"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledTitle
                className="text-center font-bold leading-[1.5]"
                $styleCss={titleStyle}
              >
                <InlineEditableText
                  value={String(block.data.title ?? "")}
                  dataKey="title"
                  instanceId={block.instanceId}
                  mode={mode}
                  onUpdateContent={onUpdateContent}
                >
                  {(text) => <h3 className="m-0">{text}</h3>}
                </InlineEditableText>
              </StyledTitle>
            </EditablePart>
          )}

          {Boolean(block.data.showDescription) && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="description"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledDescription
                className="mx-auto max-w-[720px] text-center leading-[1.9]"
                $styleCss={descriptionStyle}
              >
                <InlineEditableText
                  value={String(block.data.description ?? "")}
                  dataKey="description"
                  instanceId={block.instanceId}
                  mode={mode}
                  multiline
                  onUpdateContent={onUpdateContent}
                >
                  {(text) => <p className="m-0">{text}</p>}
                </InlineEditableText>
              </StyledDescription>
            </EditablePart>
          )}

          <EditablePart
            instanceId={block.instanceId}
            elementId="video"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledVideo
              className="overflow-hidden"
              data-media-kind={hasVideo ? "video" : "empty"}
              $styleCss={videoStyle}
            >
              {hasVideo ? (
                <video
                  src={String(block.data.videoUrl ?? "")}
                  poster={
                    String(block.data.posterUrl ?? "").trim() || undefined
                  }
                  controls={Boolean(block.data.controls)}
                  muted={Boolean(block.data.muted)}
                  loop={Boolean(block.data.loop)}
                  playsInline
                  preload="metadata"
                  className="block aspect-video w-full bg-black object-cover"
                >
                  مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
                </video>
              ) : (
                <VideoPlaceholder />
              )}
            </StyledVideo>
          </EditablePart>

          {Boolean(block.data.showButton) && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="button"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <div className="flex justify-center pt-1">
                <StyledButton
                  $styleCss={buttonStyle}
                  href={buttonHref}
                  onClick={(event) => {
                    if (mode === "editor") {
                      event.preventDefault();
                    }
                  }}
                  className="inline-flex min-w-[148px] items-center justify-center px-6 py-3 text-center font-semibold no-underline transition-opacity hover:opacity-90"
                >
                  <InlineEditableText
                    value={String(block.data.buttonText ?? "")}
                    dataKey="buttonText"
                    instanceId={block.instanceId}
                    mode={mode}
                    onUpdateContent={onUpdateContent}
                  >
                    {(text) => <span>{text}</span>}
                  </InlineEditableText>
                </StyledButton>
              </div>
            </EditablePart>
          )}
        </StyledContainer>
      </EditablePart>
    </VideoRoot>
  );
}
