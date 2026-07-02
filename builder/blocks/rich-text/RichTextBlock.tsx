"use client";

import styled from "styled-components";

import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";

import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";

import type {
  PageBlock,
  BlockComponentProps,
} from "@/types/blocks/builder.types";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const PREFIX = "rich-text";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type RichTextData = {
  title: string;
  content: string;
  showTitle: boolean;
};

type RichTextBlockProps = BlockComponentProps & {
  block: PageBlock & {
    data: RichTextData;
  };
};

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const RichTextRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
  position: relative;
`;

const StyledContainer = styled.div<{
  $styleCss: string;
}>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(props) => props.$styleCss}

  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px rgba(15, 23, 42, 0.05);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(
        circle at top right,
        rgba(148, 163, 184, 0.05),
        transparent 24%
      ),
      radial-gradient(
        circle at bottom left,
        rgba(226, 232, 240, 0.45),
        transparent 30%
      );
  }
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
`;

const ContentInner = styled.div`
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
`;

const HeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledTitle = styled.div<{
  $styleCss: string;
}>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(props) => props.$styleCss}

  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
`;

 

const StyledContent = styled.div<{
  $styleCss: string;
}>`
  ${sharedBlockKeyframes(`${PREFIX}-content`)}
  ${(props) => props.$styleCss}

  white-space: pre-wrap;
  line-height: 2;
  font-weight: 400;
  letter-spacing: -0.003em;
  word-break: break-word;

  p {
    margin: 0;
  }
`;

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function RichTextBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: RichTextBlockProps) {
  const mobileOnly = mode === "editor";

  const showTitle = Boolean(block.data.showTitle);
  const contentValue = String(block.data.content ?? "");

  const titleCss = responsiveStyleToCss(
    block.elements.title.style,
    `${PREFIX}-title`,
    { mobileOnly },
  );

  const contentCss = responsiveStyleToCss(
    block.elements.content.style,
    `${PREFIX}-content`,
    { mobileOnly },
  );

  const containerCss = responsiveStyleToCss(
    block.elements.container.style,
    `${PREFIX}-container`,
    { mobileOnly },
  );

  return (
    <RichTextRoot dir="rtl">
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
          $styleCss={containerCss}
        >
          <ContentLayer>
            <ContentInner className="flex flex-col gap-5">
              {showTitle && (
                <HeaderStack>
                  <EditablePart
                    instanceId={block.instanceId}
                    elementId="title"
                    mode={mode}
                    selectedElementId={selectedElementId}
                    onSelectElement={onSelectElement}
                  >
                    <StyledTitle
                      className="font-extrabold leading-[1.4]"
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
              )}

              <EditablePart
                instanceId={block.instanceId}
                elementId="content"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledContent $styleCss={contentCss}>
                  <InlineEditableText
                    value={contentValue || "متن خود را وارد کنید"}
                    dataKey="content"
                    instanceId={block.instanceId}
                    mode={mode}
                    multiline
                    onUpdateContent={onUpdateContent}
                  >
                    {(text) => <div>{text}</div>}
                  </InlineEditableText>
                </StyledContent>
              </EditablePart>
            </ContentInner>
          </ContentLayer>
        </StyledContainer>
      </EditablePart>
    </RichTextRoot>
  );
}
