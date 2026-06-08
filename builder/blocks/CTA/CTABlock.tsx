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

const PREFIX = "cta";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type CTAData = {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  showDescription: boolean;
  showPrimaryButton: boolean;
  showSecondaryButton: boolean;
};

type CTABlockProps = BlockComponentProps & {
  block: PageBlock & { data: CTAData };
};

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const CTARoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
`;

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(props) => props.$styleCss}
`;

const StyledTitle = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(props) => props.$styleCss}
`;

const StyledDescription = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(props) => props.$styleCss}
`;

const StyledPrimaryButton = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-pribtn`)}
  ${(props) => props.$styleCss}
`;

const StyledSecondaryButton = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-secbtn`)}
  ${(props) => props.$styleCss}
`;

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function CTABlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: CTABlockProps) {
  const data = block.data as CTAData;
  const isEditor = mode === "editor";
  const mobileOnly = isEditor;

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

  const priBtnCss = responsiveStyleToCss(
    block.elements.primaryButton.style,
    `${PREFIX}-pribtn`,
    { mobileOnly },
  );

  const secBtnCss = responsiveStyleToCss(
    block.elements.secondaryButton.style,
    `${PREFIX}-secbtn`,
    { mobileOnly },
  );

  /* ── Link helpers ── */
  const primaryUrl = String(block.data.primaryButtonUrl ?? "").trim();
  const secondaryUrl = String(block.data.secondaryButtonUrl ?? "").trim();

  const primaryHref = !isEditor && primaryUrl ? primaryUrl : undefined;
  const secondaryHref = !isEditor && secondaryUrl ? secondaryUrl : undefined;

  return (
    <CTARoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          dir="rtl"
          className="flex flex-col items-center gap-6 overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-14"
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
              className="mx-auto max-w-[640px] font-extrabold leading-[1.3]"
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
                className="mx-auto max-w-[520px] leading-[1.9]"
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

          {/* ── Buttons ── */}
          {(Boolean(block.data.showPrimaryButton) ||
            Boolean(block.data.showSecondaryButton)) && (
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              {/* Primary */}
              {Boolean(block.data.showPrimaryButton) && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="primaryButton"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledPrimaryButton
                    $styleCss={priBtnCss}
                    href={primaryHref}
                    target={primaryHref ? "_blank" : undefined}
                    rel={primaryHref ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      if (isEditor) e.preventDefault();
                    }}
                    className="inline-flex min-w-[160px] items-center justify-center px-7 py-3.5 text-center font-bold no-underline transition-opacity hover:opacity-90"
                  >
                    <InlineEditableText
                      value={String(block.data.primaryButtonText ?? "")}
                      dataKey="primaryButtonText"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <span>{text}</span>}
                    </InlineEditableText>
                  </StyledPrimaryButton>
                </EditablePart>
              )}

              {/* Secondary */}
              {Boolean(block.data.showSecondaryButton) && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="secondaryButton"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledSecondaryButton
                    $styleCss={secBtnCss}
                    href={secondaryHref}
                    target={secondaryHref ? "_blank" : undefined}
                    rel={secondaryHref ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      if (isEditor) e.preventDefault();
                    }}
                    className="inline-flex min-w-[160px] items-center justify-center px-7 py-3.5 text-center font-bold no-underline transition-opacity hover:opacity-90"
                  >
                    <InlineEditableText
                      value={String(block.data.secondaryButtonText ?? "")}
                      dataKey="secondaryButtonText"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <span>{text}</span>}
                    </InlineEditableText>
                  </StyledSecondaryButton>
                </EditablePart>
              )}
            </div>
          )}
        </StyledContainer>
      </EditablePart>
    </CTARoot>
  );
}
