"use client";

import { useCallback, useState } from "react";
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

const PREFIX = "faq";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  isOpenByDefault: boolean;
};

type FAQData = {
  title: string;
  description: string;
  showDescription: boolean;
  allowMultipleOpen: boolean;
  items: FAQItem[];
};

type FAQBlockProps = BlockComponentProps & {
  block: PageBlock & { data: FAQData };
};

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const FAQRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
  position: relative;
`;

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
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.04), transparent 28%),
      radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.03), transparent 32%);
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

const StyledTitle = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(p) => p.$styleCss}
  text-align: center;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
`;

 

const StyledDescription = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(p) => p.$styleCss}
  text-align: center;
  line-height: 1.1;
`;

const StyledItem = styled.div<{ $styleCss: string; $open: boolean }>`
  ${sharedBlockKeyframes(`${PREFIX}-item`)}
  ${(p) => p.$styleCss}
  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.03),
    0 4px 14px rgba(15, 23, 42, 0.04);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 8px 22px rgba(15, 23, 42, 0.06),
      0 2px 8px rgba(15, 23, 42, 0.04);
  }

  ${(p) =>
    p.$open
      ? `
    box-shadow:
      0 10px 24px rgba(15, 23, 42, 0.07),
      0 2px 8px rgba(15, 23, 42, 0.04);
  `
      : ""}
`;

const QuestionRow = styled.div`
  width: 100%;
  transition: background-color 0.2s ease;
`;

const StyledQuestion = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-question`)}
  ${(p) => p.$styleCss}
  font-weight: 700;
`;

const StyledAnswer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-answer`)}
  ${(p) => p.$styleCss}
  line-height: 1.9;
`;

const StyledIcon = styled.div<{ $styleCss: string; $open: boolean }>`
  ${sharedBlockKeyframes(`${PREFIX}-icon`)}
  ${(p) => p.$styleCss}
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease,
    box-shadow 0.25s ease;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.4),
    0 1px 2px rgba(15, 23, 42, 0.05);

  ${(p) =>
    p.$open
      ? `
    transform: scale(1.03);
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.5),
      0 4px 10px rgba(15, 23, 42, 0.08);
  `
      : ""}
`;

const AnswerWrap = styled.div<{ $open: boolean }>`
  display: grid;
  grid-template-rows: ${(p) => (p.$open ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s ease;
`;

const EmptyState = styled.div`
  padding: 44px 20px;
  text-align: center;
  color: #94a3b8;
`;

const EmptyIcon = styled.div`
  width: 52px;
  height: 52px;
  margin: 0 auto 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
`;

/* ================================================================== */
/*  Chevron SVG                                                        */
/* ================================================================== */

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.25s ease",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FAQPlaceholderIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function FAQBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: FAQBlockProps) {
  const data = block.data as FAQData;
  const isEditor = mode === "editor";
  const mobileOnly = isEditor;

  const items: FAQItem[] = Array.isArray(data.items) ? data.items : [];
  const allowMultiple = Boolean(data.allowMultipleOpen);

  /* ── Open state ── */
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of items) {
      if (item.isOpenByDefault) initial.add(item.id);
    }
    return initial;
  });

  const toggleItem = useCallback(
    (itemId: string) => {
      /* In editor mode, don't auto-collapse while editing */
      if (isEditor) {
        setOpenIds((prev) => {
          const next = new Set(prev);
          if (next.has(itemId)) {
            next.delete(itemId);
          } else {
            next.add(itemId);
          }
          return next;
        });
        return;
      }

      /* Preview/public accordion logic */
      setOpenIds((prev) => {
        if (allowMultiple) {
          const next = new Set(prev);
          if (next.has(itemId)) {
            next.delete(itemId);
          } else {
            next.add(itemId);
          }
          return next;
        }

        /* Single open */
        if (prev.has(itemId)) {
          return new Set<string>();
        }
        return new Set<string>([itemId]);
      });
    },
    [isEditor, allowMultiple],
  );

  /* ── Styles ── */
  const containerCss = responsiveStyleToCss(
    block.elements.container.style,
    `${PREFIX}-container`,
    { mobileOnly, effect: "surface" },
  );

  const titleCss = responsiveStyleToCss(
    block.elements.title.style,
    `${PREFIX}-title`,
    { mobileOnly },
  );

  const descCss = responsiveStyleToCss(
    block.elements.description.style,
    `${PREFIX}-desc`,
    { mobileOnly },
  );

  const itemCss = responsiveStyleToCss(
    block.elements.item.style,
    `${PREFIX}-item`,
    { mobileOnly, effect: "card" },
  );

  const questionCss = responsiveStyleToCss(
    block.elements.question.style,
    `${PREFIX}-question`,
    { mobileOnly, effect: "tap" },
  );

  const answerCss = responsiveStyleToCss(
    block.elements.answer.style,
    `${PREFIX}-answer`,
    { mobileOnly },
  );

  const iconCss = responsiveStyleToCss(
    block.elements.icon.style,
    `${PREFIX}-icon`,
    { mobileOnly, effect: "tap" },
  );

  return (
    <FAQRoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          dir="rtl"
          className="flex flex-col gap-6 overflow-hidden px-5 py-8 sm:px-7 sm:py-10"
          $styleCss={containerCss}
        >
          <ContentLayer>
            <div className="flex flex-col gap-6">
              {/* ── Title ── */}
              <HeaderStack>
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="title"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledTitle
                    className="text-center font-extrabold leading-[1.3]"
                    $styleCss={titleCss}
                  >
                    <InlineEditableText
                      value={String(block.data.title ?? "")}
                      dataKey="title"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <h2 className="m-0">{text}</h2>}
                    </InlineEditableText>
                  </StyledTitle>
                </EditablePart>

               </HeaderStack>

              {/* ── Description ── */}
              {Boolean(block.data.showDescription) && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="description"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledDescription
                    className="mx-auto max-w-[580px] text-center leading-[1.9]"
                    $styleCss={descCss}
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

              {/* ── Items ── */}
              {items.length === 0 ? (
                <EmptyState>
                  <EmptyIcon>
                    <FAQPlaceholderIcon />
                  </EmptyIcon>
                  <div className="text-sm font-medium">
                    هنوز سوالی اضافه نشده است.
                  </div>
                </EmptyState>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => {
                    const isOpen = openIds.has(item.id);

                    return (
                      <EditablePart
                        key={item.id}
                        instanceId={block.instanceId}
                        elementId="item"
                        mode={mode}
                        selectedElementId={selectedElementId}
                        onSelectElement={onSelectElement}
                      >
                        <StyledItem
                          className="overflow-hidden"
                          $styleCss={itemCss}
                          $open={isOpen}
                        >
                          {/* Question row */}
                          <QuestionRow
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 sm:px-5"
                            onClick={(e) => {
                              /* Don't toggle if user clicked inside inline edit */
                              const target = e.target as HTMLElement;
                              if (
                                target.closest(
                                  '[contenteditable="true"]',
                                )
                              ) {
                                return;
                              }
                              toggleItem(item.id);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" ||
                                e.key === " "
                              ) {
                                e.preventDefault();
                                toggleItem(item.id);
                              }
                            }}
                            aria-expanded={isOpen}
                          >
                            {/* Icon */}
                            <EditablePart
                              instanceId={block.instanceId}
                              elementId="icon"
                              mode={mode}
                              selectedElementId={selectedElementId}
                              onSelectElement={onSelectElement}
                            >
                              <StyledIcon
                                className="flex h-7 w-7 md:h-9 md:w-9 shrink-0 items-center justify-center shadow-sm"
                                $styleCss={iconCss}
                                $open={isOpen}
                              >
                                <ChevronIcon isOpen={isOpen} />
                              </StyledIcon>
                            </EditablePart>

                            {/* Question text */}
                            <EditablePart
                              instanceId={block.instanceId}
                              elementId="question"
                              mode={mode}
                              selectedElementId={selectedElementId}
                              onSelectElement={onSelectElement}
                              className="min-w-0 flex-1"
                            >
                              <StyledQuestion
                                className="font-bold leading-[1.1]"
                                $styleCss={questionCss}
                              >
                                <InlineEditableText
                                  value={String(item.question ?? "")}
                                  dataKey={`items.${item.id}.question`}
                                  instanceId={block.instanceId}
                                  mode={mode}
                                  onUpdateContent={onUpdateContent}
                                >
                                  {(text) => <span>{text}</span>}
                                </InlineEditableText>
                              </StyledQuestion>
                            </EditablePart>
                          </QuestionRow>

                          {/* Answer (collapsible) */}
                          <AnswerWrap $open={isOpen}>
                            <div className="overflow-hidden">
                              <EditablePart
                                instanceId={block.instanceId}
                                elementId="answer"
                                mode={mode}
                                selectedElementId={selectedElementId}
                                onSelectElement={onSelectElement}
                              >
                                <StyledAnswer
                                  className="px-4 pb-4 pt-0 leading-[1.9] sm:px-5 sm:pb-5"
                                  style={{
                                    paddingRight: 52,
                                  }}
                                  $styleCss={answerCss}
                                >
                                  <InlineEditableText
                                    value={String(item.answer ?? "")}
                                    dataKey={`items.${item.id}.answer`}
                                    instanceId={block.instanceId}
                                    mode={mode}
                                    multiline
                                    onUpdateContent={onUpdateContent}
                                  >
                                    {(text) => (
                                      <p className="m-0">{text}</p>
                                    )}
                                  </InlineEditableText>
                                </StyledAnswer>
                              </EditablePart>
                            </div>
                          </AnswerWrap>
                        </StyledItem>
                      </EditablePart>
                    );
                  })}
                </div>
              )}
            </div>
          </ContentLayer>
        </StyledContainer>
      </EditablePart>
    </FAQRoot>
  );
}
