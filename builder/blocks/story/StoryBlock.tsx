"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface StoryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl: string;
  altText: string;
}

// ─── Styled Components ──────────────────────────────────────────────────────────

const PREFIX = "story-highlights-block";

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

const StyledThumbnail = styled.button<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  padding: 0;
  transition:
    border-color 0.2s ease,
    transform 0.15s ease;

  &:hover {
    transform: scale(1.06);
  }
  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const StyledThumbnailLabel = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: block;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledViewer = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.25s ease;
`;

const StyledProgress = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  transition: background-color 0.2s ease;
`;

const StyledStoryImage = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  overflow: hidden;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
`;

const StyledCaption = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  transition: color 0.2s ease, background-color 0.2s ease, font-size 0.2s ease,
    border-color 0.2s ease;
`;

const StyledNavButton = styled.button<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

const StyledCloseButton = styled.button<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
`;

// ─── Progress Bar Fill (internal, not editable) ─────────────────────────────────

const ProgressFill = styled.div<{ $duration: number; $running: boolean }>`
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: inherit;
  width: ${({ $running }) => ($running ? "100%" : "0%")};
  transition: ${({ $running, $duration }) =>
    $running ? `width ${$duration}s linear` : "width 0s linear"};
`;

// ─── Component ──────────────────────────────────────────────────────────────────

export default function StoryHighlightsBlock({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = block.data as Record<string, unknown>;
  const elements = block.elements ?? {};

  // ── Responsive CSS ────────────────────────────────────────────────────────

  const containerStyle = responsiveStyleToCss(
    elements.container?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const titleStyle = responsiveStyleToCss(elements.title?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const thumbnailStyle = responsiveStyleToCss(
    elements.thumbnail?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const thumbnailLabelStyle = responsiveStyleToCss(
    elements.thumbnailLabel?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const viewerElementStyle = elements.viewer?.style ?? {};
  const viewerStyle = responsiveStyleToCss(
    {
      borderRadius: viewerElementStyle.borderRadius,
      borderColor: viewerElementStyle.borderColor,
      borderWidth: viewerElementStyle.borderWidth,
      animation: viewerElementStyle.animation,
    },
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const progressStyle = responsiveStyleToCss(
    elements.progress?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const storyImageStyle = responsiveStyleToCss(
    elements.storyImage?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const captionStyle = responsiveStyleToCss(
    elements.caption?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const navButtonStyle = responsiveStyleToCss(
    elements.navButton?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const closeButtonStyle = responsiveStyleToCss(
    elements.closeButton?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );

  // ── Safe data extraction ──────────────────────────────────────────────────

  const sectionTitle = typeof data.title === "string" ? data.title : "";
  const showTitle = data.showTitle !== false;
  const showCaptions = data.showCaptions !== false;
  const autoCloseSeconds =
    typeof data.autoCloseSeconds === "number" && data.autoCloseSeconds > 0
      ? data.autoCloseSeconds
      : 10;

  const stories: StoryItem[] = Array.isArray(data.stories)
    ? (data.stories as StoryItem[]).map((s) => ({
        id: typeof s.id === "string" ? s.id : `s-${Math.random()}`,
        title: typeof s.title === "string" ? s.title : "",
        caption: typeof s.caption === "string" ? s.caption : "",
        imageUrl: typeof s.imageUrl === "string" ? s.imageUrl : "",
        thumbnailUrl: typeof s.thumbnailUrl === "string" ? s.thumbnailUrl : "",
        altText: typeof s.altText === "string" ? s.altText : "",
      }))
    : [];

  const isEditor = mode === "editor";

  // ── Viewer state ──────────────────────────────────────────────────────────

  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressRunning, setProgressRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const closeViewer = useCallback(() => {
    clearTimer();
    setViewerOpen(false);
    setProgressRunning(false);
  }, [clearTimer]);

  const goNext = useCallback(() => {
    clearTimer();
    setProgressRunning(false);
    setActiveIndex((prev) => {
      if (prev >= stories.length - 1) {
        closeViewer();
        return prev;
      }
      return prev + 1;
    });
  }, [clearTimer, closeViewer, stories.length]);

  const goPrev = useCallback(() => {
    clearTimer();
    setProgressRunning(false);
    setActiveIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  }, [clearTimer]);

  const openViewer = useCallback(
    (index: number) => {
      if (stories.length === 0) return;
      setActiveIndex(index);
      setViewerOpen(true);
    },
    [stories.length],
  );

  // Start progress + timer when viewer is open and index changes
  useEffect(() => {
    if (!viewerOpen) return;

    // Small delay to trigger CSS transition from 0 → 100%
    const raf = requestAnimationFrame(() => {
      setProgressRunning(true);
    });

    timerRef.current = setTimeout(() => {
      goNext();
    }, autoCloseSeconds * 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimer();
    };
  }, [viewerOpen, activeIndex, autoCloseSeconds, goNext, clearTimer]);

  // Escape key to close
  useEffect(() => {
    if (!viewerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") goPrev(); // RTL: right = previous
      if (e.key === "ArrowLeft") goNext(); // RTL: left = next
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewerOpen, closeViewer, goNext, goPrev]);

  const activeStory = stories[activeIndex] as StoryItem | undefined;

  const getThumbnailSrc = (story: StoryItem) =>
    story.thumbnailUrl || story.imageUrl || "";

  return (
    <>
      {/* ── Thumbnail Row ──────────────────────────────────────────────────── */}
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          $styleCss={containerStyle}
          className="w-full p-4 md:p-6"
          dir="rtl"
        >
          {/* Section title */}
          {showTitle && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="title"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledTitle $styleCss={titleStyle} className="mb-4 font-bold">
                <InlineEditableText
                  value={sectionTitle}
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

          {/* Stories row */}
          {stories.length === 0 && isEditor && (
            <p className="text-center text-sm text-gray-400 py-6">
              هنوز استوری‌ای اضافه نشده است.
            </p>
          )}

          {stories.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {stories.map((story, idx) => {
                const thumbSrc = getThumbnailSrc(story);
                return (
                  <div
                    key={story.id}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                    style={{ width: 76 }}
                  >
                    <EditablePart
                      instanceId={block.instanceId}
                      elementId="thumbnail"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <StyledThumbnail
                        $styleCss={thumbnailStyle}
                        className="w-16 h-16"
                        aria-label={`مشاهده استوری ${story.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewer(idx);
                        }}
                      >
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={story.altText || story.title}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-[10px] text-gray-400 select-none">
                              📷
                            </span>
                          </div>
                        )}
                      </StyledThumbnail>
                    </EditablePart>

                    <EditablePart
                      instanceId={block.instanceId}
                      elementId="thumbnailLabel"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <StyledThumbnailLabel
                        $styleCss={thumbnailLabelStyle}
                        className="max-w-[72px]"
                      >
                        <InlineEditableText
                          value={story.title}
                          dataKey={`stories.${story.id}.title`}
                          instanceId={block.instanceId}
                          mode={mode}
                          onUpdateContent={onUpdateContent}
                        >
                          {(text) => <>{text}</>}
                        </InlineEditableText>
                      </StyledThumbnailLabel>
                    </EditablePart>
                  </div>
                );
              })}
            </div>
          )}
        </StyledContainer>
      </EditablePart>

      {/* ── Fullscreen Viewer ──────────────────────────────────────────────── */}
      {viewerOpen && activeStory && (
        <EditablePart
          instanceId={block.instanceId}
          elementId="viewer"
          mode={mode}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        >
          <StyledViewer
            $styleCss={viewerStyle}
            className="bg-black/90 backdrop-blur-sm"
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3 z-20">
              {stories.map((s, idx) => (
                <EditablePart
                  key={s.id}
                  instanceId={block.instanceId}
                  elementId="progress"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledProgress
                    $styleCss={progressStyle}
                    className="flex-1 h-[3px] overflow-hidden"
                    style={{ opacity: 0.45 }}
                  >
                    <ProgressFill
                      $duration={idx === activeIndex ? autoCloseSeconds : 0}
                      $running={idx === activeIndex ? progressRunning : false}
                      style={{
                        width:
                          idx < activeIndex
                            ? "100%"
                            : idx === activeIndex
                              ? undefined
                              : "0%",
                      }}
                    />
                  </StyledProgress>
                </EditablePart>
              ))}
            </div>

            {/* Close button */}
            <div className="absolute top-4 left-4 z-30">
              <EditablePart
                instanceId={block.instanceId}
                elementId="closeButton"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledCloseButton
                  $styleCss={closeButtonStyle}
                  className="w-9 h-9"
                  aria-label="بستن استوری"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeViewer();
                  }}
                >
                  ✕
                </StyledCloseButton>
              </EditablePart>
            </div>

            {/* Story content area */}
            <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center flex-1 px-4">
              {/* Image */}
              <EditablePart
                instanceId={block.instanceId}
                elementId="storyImage"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledStoryImage
                  $styleCss={storyImageStyle}
                  className="w-full aspect-[9/16] relative"
                >
                  {activeStory.imageUrl ? (
                    <img
                      src={activeStory.imageUrl}
                      alt={activeStory.altText || activeStory.title}
                      className="w-full h-full object-cover rounded-[inherit]"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-[inherit]">
                      <span className="text-sm text-gray-400 select-none px-4 text-center">
                        تصویر استوری را وارد کنید
                      </span>
                    </div>
                  )}

                  {/* Caption overlay at bottom */}
                  {showCaptions && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <EditablePart
                        instanceId={block.instanceId}
                        elementId="caption"
                        mode={mode}
                        selectedElementId={selectedElementId}
                        onSelectElement={onSelectElement}
                      >
                        <StyledCaption
                          $styleCss={captionStyle}
                          className="px-4 py-3"
                        >
                          <InlineEditableText
                            value={activeStory.caption}
                            dataKey={`stories.${activeStory.id}.caption`}
                            instanceId={block.instanceId}
                            mode={mode}
                            multiline
                            onUpdateContent={onUpdateContent}
                          >
                            {(text) => <>{text}</>}
                          </InlineEditableText>
                        </StyledCaption>
                      </EditablePart>
                    </div>
                  )}
                </StyledStoryImage>
              </EditablePart>
            </div>

            {/* Navigation: tap zones + buttons */}
            {/* Right side = previous (RTL) */}
            <div
              className="absolute top-0 right-0 w-1/3 h-full z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            />
            {/* Left side = next (RTL) */}
            <div
              className="absolute top-0 left-0 w-1/3 h-full z-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            />

            {/* Nav buttons */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-6 z-20 pointer-events-none">
              {/* Next (left in RTL) */}
              <EditablePart
                instanceId={block.instanceId}
                elementId="navButton"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledNavButton
                  $styleCss={navButtonStyle}
                  className="w-10 h-10 pointer-events-auto"
                  aria-label="استوری بعدی"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                >
                  ‹
                </StyledNavButton>
              </EditablePart>

              {/* Previous (right in RTL) */}
              <EditablePart
                instanceId={block.instanceId}
                elementId="navButton"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledNavButton
                  $styleCss={navButtonStyle}
                  className="w-10 h-10 pointer-events-auto"
                  aria-label="استوری قبلی"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                >
                  ›
                </StyledNavButton>
              </EditablePart>
            </div>
          </StyledViewer>
        </EditablePart>
      )}
    </>
  );
}
