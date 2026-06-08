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
`;

const StyledContainer = styled.div<{
  $styleCss: string;
}>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(props) => props.$styleCss}
`;

const StyledTitle = styled.div<{
  $styleCss: string;
}>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(props) => props.$styleCss}
`;

const StyledContent = styled.div<{
  $styleCss: string;
}>`
  ${sharedBlockKeyframes(`${PREFIX}-content`)}
  ${(props) => props.$styleCss}

  white-space: pre-wrap;
  line-height: 1.95;
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
          {showTitle && (
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
        </StyledContainer>
      </EditablePart>
    </RichTextRoot>
  );
}
