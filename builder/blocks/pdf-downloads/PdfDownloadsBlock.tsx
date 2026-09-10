"use client";

import styled, { keyframes } from "styled-components";
import {
  FaArrowDown,
  FaFilePdf,
  FaRegFileLines,
  FaUpRightFromSquare,
} from "react-icons/fa6";

import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type {
  BlockComponentProps,
  ResponsiveValue,
} from "@/types/blocks/builder.types";

const PREFIX = "pdf-downloads-block";

type PdfDocumentItem = {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  badgeText: string;
  downloadText: string;
  enabled: boolean;
};

type LayoutMode = "grid" | "horizontal";

function getResponsiveFallback<T>(value: ResponsiveValue<T> | undefined) {
  return value?.desktop ?? value?.tablet ?? value?.mobile;
}

function clampColumns(value: unknown) {
  return Math.min(4, Math.max(1, Number(value) || 3));
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(PREFIX)}
  ${({ $styleCss }) => $styleCss}

  position: relative;
  isolation: isolate;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 18px 48px rgba(15, 23, 42, 0.06);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background:
      linear-gradient(135deg, rgba(220, 38, 38, 0.045), transparent 34%),
      linear-gradient(315deg, rgba(15, 23, 42, 0.035), transparent 42%);
  }
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  font-weight: 900;
  line-height: 1.35;
`;

const StyledDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  max-width: 620px;
  line-height: 1.9;
`;

const StyledList = styled.div<{
  $styleCss: string;
  $layoutMode: LayoutMode;
  $desktopColumns: number;
}>`
  ${({ $styleCss }) => $styleCss}
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  overflow: visible;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(220, 38, 38, 0.22) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(220, 38, 38, 0.22);
    border-radius: 999px;
  }

  @media (min-width: 1024px) {
    display: ${({ $layoutMode }) =>
      $layoutMode === "horizontal" ? "flex" : "grid"};
    grid-template-columns: ${({ $layoutMode, $desktopColumns }) =>
      $layoutMode === "horizontal"
        ? "none"
        : `repeat(${$desktopColumns}, minmax(0, 1fr))`};
    overflow-x: ${({ $layoutMode }) =>
      $layoutMode === "horizontal" ? "auto" : "visible"};
    cursor: ${({ $layoutMode }) =>
      $layoutMode === "horizontal" ? "grab" : "default"};
    scroll-snap-type: ${({ $layoutMode }) =>
      $layoutMode === "horizontal" ? "x mandatory" : "none"};
  }
`;

const StyledCard = styled.article<{ $styleCss: string; $index: number }>`
  ${({ $styleCss }) => $styleCss}
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  scroll-snap-align: start;
  animation: ${fadeInUp} 0.42s ease both;
  animation-delay: ${({ $index }) => $index * 0.045}s;
  transition:
    transform 0.22s ease,
    box-shadow 0.24s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 18px 35px rgba(15, 23, 42, 0.1),
      0 2px 7px rgba(15, 23, 42, 0.06);
  }
`;

const StyledIcon = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-flex;
  height: 58px;
  width: 58px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
`;

const StyledFileTitle = styled.h3<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  font-weight: 850;
  line-height: 1.5;
`;

const StyledFileDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  min-height: 42px;
  line-height: 1.8;
`;

const StyledMeta = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  font-weight: 700;
`;

const StyledBadge = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  font-weight: 800;
`;

const StyledDownloadButton = styled.a<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-flex;
  min-height: 42px;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  text-decoration: none;
  font-weight: 850;
  line-height: 1.4;
  transition:
    transform 0.18s ease,
    box-shadow 0.24s ease,
    opacity 0.18s ease,
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 22px rgba(220, 38, 38, 0.18);
  }

  &:active {
    transform: translateY(0);
  }

  &[aria-disabled="true"] {
    pointer-events: none;
    opacity: 0.62;
  }
`;

const EmptyState = styled.div`
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  text-align: center;
  color: #94a3b8;
`;

function normalizeDocuments(value: unknown, isEditor: boolean): PdfDocumentItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const record =
        item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const fileUrl = normalizeText(record.fileUrl).trim();

      return {
        id: normalizeText(record.id) || `pdf-${index + 1}`,
        title: normalizeText(record.title) || `فایل PDF ${index + 1}`,
        description: normalizeText(record.description),
        fileUrl,
        fileSize: normalizeText(record.fileSize) || "PDF",
        badgeText: normalizeText(record.badgeText),
        downloadText: normalizeText(record.downloadText) || "دانلود فایل",
        enabled: record.enabled !== false,
      };
    })
    .filter((item) => item.enabled && (isEditor || item.fileUrl));
}

export default function PdfDownloadsBlock({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = block.data as Record<string, unknown>;
  const elements = block.elements ?? {};
  const isEditor = mode === "editor";

  const containerStyle = responsiveStyleToCss(
    elements.container?.style ?? {},
    PREFIX,
    { mobileOnly: isEditor, effect: "surface" },
  );
  const titleStyle = responsiveStyleToCss(elements.title?.style ?? {}, PREFIX, {
    mobileOnly: isEditor,
  });
  const descriptionStyle = responsiveStyleToCss(
    elements.description?.style ?? {},
    PREFIX,
    { mobileOnly: isEditor },
  );
  const listStyle = responsiveStyleToCss(elements.list?.style ?? {}, PREFIX, {
    mobileOnly: isEditor,
  });
  const cardStyle = responsiveStyleToCss(elements.card?.style ?? {}, PREFIX, {
    mobileOnly: isEditor,
    effect: "card",
  });
  const iconStyle = responsiveStyleToCss(elements.icon?.style ?? {}, PREFIX, {
    mobileOnly: isEditor,
    effect: "media",
  });
  const fileTitleStyle = responsiveStyleToCss(
    elements.fileTitle?.style ?? {},
    PREFIX,
    { mobileOnly: isEditor },
  );
  const fileDescriptionStyle = responsiveStyleToCss(
    elements.fileDescription?.style ?? {},
    PREFIX,
    { mobileOnly: isEditor },
  );
  const metaStyle = responsiveStyleToCss(elements.meta?.style ?? {}, PREFIX, {
    mobileOnly: isEditor,
  });
  const badgeStyle = responsiveStyleToCss(elements.badge?.style ?? {}, PREFIX, {
    mobileOnly: isEditor,
    effect: "tap",
  });
  const buttonStyle = responsiveStyleToCss(elements.button?.style ?? {}, PREFIX, {
    mobileOnly: isEditor,
    effect: "button",
  });

  const listElementStyle = elements.list?.style ?? {};
  const styledLayoutMode = getResponsiveFallback(listElementStyle.layoutMode);
  const styledDesktopColumns = getResponsiveFallback(
    listElementStyle.gridColumns,
  );
  const layoutMode: LayoutMode =
    styledLayoutMode === "horizontal" || data.layoutMode === "horizontal"
      ? "horizontal"
      : "grid";
  const desktopColumns = clampColumns(styledDesktopColumns ?? data.desktopColumns);
  const sectionTitle = normalizeText(data.title);
  const sectionDescription = normalizeText(data.description);
  const showTitle = data.showTitle !== false;
  const showDescription = data.showDescription !== false;
  const openInNewTab = data.openInNewTab !== false;
  const documents = normalizeDocuments(data.documents, isEditor);

  const handleInlineContentUpdate = (
    instanceId: string,
    key: string,
    value: unknown,
  ) => {
    if (instanceId !== block.instanceId) {
      onUpdateContent?.(instanceId, key, value);
      return;
    }

    const [rootKey, itemToken, ...fieldParts] = key.split(".");
    const fieldKey = fieldParts.join(".");
    if (rootKey !== "documents" || !itemToken || !fieldKey) {
      onUpdateContent?.(instanceId, key, value);
      return;
    }

    const currentDocuments = Array.isArray(data.documents)
      ? (data.documents as Array<Record<string, unknown>>)
      : [];
    const nextDocuments = currentDocuments.map((item, index) => {
      const itemId = normalizeText(item.id) || `pdf-${index + 1}`;
      return itemId === itemToken ? { ...item, [fieldKey]: value } : item;
    });

    onUpdateContent?.(block.instanceId, "documents", nextDocuments);
  };

  if (!isEditor && documents.length === 0) return null;

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
        className="w-full p-4 sm:p-5 md:p-7"
        dir="rtl"
      >
        <ContentLayer>
          {(showTitle || showDescription) && (
            <div className="mb-5 flex flex-col gap-2 sm:mb-6">
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
                      value={sectionTitle}
                      dataKey="title"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={handleInlineContentUpdate}
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
                  <StyledDescription $styleCss={descriptionStyle}>
                    <InlineEditableText
                      value={sectionDescription}
                      dataKey="description"
                      instanceId={block.instanceId}
                      mode={mode}
                      multiline
                      onUpdateContent={handleInlineContentUpdate}
                    >
                      {(text) => <>{text}</>}
                    </InlineEditableText>
                  </StyledDescription>
                </EditablePart>
              )}
            </div>
          )}

          {documents.length === 0 && isEditor ? (
            <EmptyState>
              <FaRegFileLines size={34} />
              <p className="m-0 text-sm font-semibold">
                فایل‌های PDF را از تب محتوا اضافه کنید.
              </p>
            </EmptyState>
          ) : (
            <EditablePart
              instanceId={block.instanceId}
              elementId="list"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledList
                $styleCss={listStyle}
                $layoutMode={layoutMode}
                $desktopColumns={desktopColumns}
              >
                {documents.map((document, index) => {
                  const hasFile = Boolean(document.fileUrl);
                  const href = hasFile && !isEditor ? document.fileUrl : undefined;

                  return (
                    <EditablePart
                      key={document.id}
                      instanceId={block.instanceId}
                      elementId="card"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <StyledCard
                        $styleCss={cardStyle}
                        $index={index}
                        className={
                          layoutMode === "horizontal"
                            ? "lg:min-w-[270px] lg:max-w-[320px]"
                            : ""
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <EditablePart
                            instanceId={block.instanceId}
                            elementId="icon"
                            mode={mode}
                            selectedElementId={selectedElementId}
                            onSelectElement={onSelectElement}
                          >
                            <StyledIcon $styleCss={iconStyle}>
                              <FaFilePdf aria-hidden="true" />
                            </StyledIcon>
                          </EditablePart>

                          {document.badgeText ? (
                            <EditablePart
                              instanceId={block.instanceId}
                              elementId="badge"
                              mode={mode}
                              selectedElementId={selectedElementId}
                              onSelectElement={onSelectElement}
                            >
                              <StyledBadge $styleCss={badgeStyle}>
                                <InlineEditableText
                                  value={document.badgeText}
                                  dataKey={`documents.${document.id}.badgeText`}
                                  instanceId={block.instanceId}
                                  mode={mode}
                                  onUpdateContent={handleInlineContentUpdate}
                                >
                                  {(text) => <>{text}</>}
                                </InlineEditableText>
                              </StyledBadge>
                            </EditablePart>
                          ) : null}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <EditablePart
                            instanceId={block.instanceId}
                            elementId="fileTitle"
                            mode={mode}
                            selectedElementId={selectedElementId}
                            onSelectElement={onSelectElement}
                          >
                            <StyledFileTitle $styleCss={fileTitleStyle}>
                              <InlineEditableText
                                value={document.title}
                                dataKey={`documents.${document.id}.title`}
                                instanceId={block.instanceId}
                                mode={mode}
                                onUpdateContent={handleInlineContentUpdate}
                              >
                                {(text) => <>{text}</>}
                              </InlineEditableText>
                            </StyledFileTitle>
                          </EditablePart>

                          <EditablePart
                            instanceId={block.instanceId}
                            elementId="fileDescription"
                            mode={mode}
                            selectedElementId={selectedElementId}
                            onSelectElement={onSelectElement}
                          >
                            <StyledFileDescription
                              $styleCss={fileDescriptionStyle}
                            >
                              <InlineEditableText
                                value={document.description}
                                dataKey={`documents.${document.id}.description`}
                                instanceId={block.instanceId}
                                mode={mode}
                                multiline
                                onUpdateContent={handleInlineContentUpdate}
                              >
                                {(text) => <>{text}</>}
                              </InlineEditableText>
                            </StyledFileDescription>
                          </EditablePart>

                          <EditablePart
                            instanceId={block.instanceId}
                            elementId="meta"
                            mode={mode}
                            selectedElementId={selectedElementId}
                            onSelectElement={onSelectElement}
                          >
                            <StyledMeta $styleCss={metaStyle}>
                              <FaRegFileLines aria-hidden="true" />
                              <InlineEditableText
                                value={document.fileSize}
                                dataKey={`documents.${document.id}.fileSize`}
                                instanceId={block.instanceId}
                                mode={mode}
                                onUpdateContent={handleInlineContentUpdate}
                              >
                                {(text) => <>{text}</>}
                              </InlineEditableText>
                            </StyledMeta>
                          </EditablePart>
                        </div>

                        <EditablePart
                          instanceId={block.instanceId}
                          elementId="button"
                          mode={mode}
                          selectedElementId={selectedElementId}
                          onSelectElement={onSelectElement}
                        >
                          <StyledDownloadButton
                            $styleCss={buttonStyle}
                            href={href}
                            target={
                              href && openInNewTab ? "_blank" : undefined
                            }
                            rel={
                              href && openInNewTab
                                ? "noopener noreferrer"
                                : undefined
                            }
                            download={href ? true : undefined}
                            aria-disabled={!href}
                            onClick={(event) => {
                              if (isEditor || !href) event.preventDefault();
                            }}
                          >
                            {href && openInNewTab ? (
                              <FaUpRightFromSquare aria-hidden="true" />
                            ) : (
                              <FaArrowDown aria-hidden="true" />
                            )}
                            <InlineEditableText
                              value={
                                hasFile
                                  ? document.downloadText
                                  : "ابتدا PDF را آپلود کنید"
                              }
                              dataKey={`documents.${document.id}.downloadText`}
                              instanceId={block.instanceId}
                              mode={mode}
                              onUpdateContent={handleInlineContentUpdate}
                            >
                              {(text) => <span>{text}</span>}
                            </InlineEditableText>
                          </StyledDownloadButton>
                        </EditablePart>
                      </StyledCard>
                    </EditablePart>
                  );
                })}
              </StyledList>
            </EditablePart>
          )}
        </ContentLayer>
      </StyledContainer>
    </EditablePart>
  );
}
