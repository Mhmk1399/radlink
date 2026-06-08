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
`;

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(p) => p.$styleCss}
`;

const StyledTitle = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(p) => p.$styleCss}
`;

const StyledDescription = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(p) => p.$styleCss}
`;

const StyledItem = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-item`)}
  ${(p) => p.$styleCss}
`;

const StyledQuestion = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-question`)}
  ${(p) => p.$styleCss}
`;

const StyledAnswer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-answer`)}
  ${(p) => p.$styleCss}
`;

const StyledIcon = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-icon`)}
  ${(p) => p.$styleCss}
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
    { mobileOnly },
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
    { mobileOnly },
  );

  const questionCss = responsiveStyleToCss(
    block.elements.question.style,
    `${PREFIX}-question`,
    { mobileOnly },
  );

  const answerCss = responsiveStyleToCss(
    block.elements.answer.style,
    `${PREFIX}-answer`,
    { mobileOnly },
  );

  const iconCss = responsiveStyleToCss(
    block.elements.icon.style,
    `${PREFIX}-icon`,
    { mobileOnly },
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
          {/* ── Title ── */}
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
            <div className="py-8 text-center text-sm font-medium text-neutral-400">
              هنوز سوالی اضافه نشده است.
            </div>
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
                    >
                      {/* Question row */}
                      <div
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
                            className="flex h-8 w-8 shrink-0 items-center justify-center shadow-sm"
                            $styleCss={iconCss}
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
                            className="font-bold leading-[1.6]"
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
                      </div>

                      {/* Answer (collapsible) */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                          transition:
                            "grid-template-rows 0.3s ease",
                        }}
                      >
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
                                paddingRight: 52, /* align with question text after icon */
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
                      </div>
                    </StyledItem>
                  </EditablePart>
                );
              })}
            </div>
          )}
        </StyledContainer>
      </EditablePart>
    </FAQRoot>
  );
}