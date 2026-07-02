"use client";

import styled, { keyframes } from "styled-components";

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
/*  Keyframes                                                          */
/* ================================================================== */

const floatA = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(12px, -16px) scale(1.06); }
`;

const floatB = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(-10px, 14px) scale(1.04); }
`;

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const CTARoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
`;

/* Container */
const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(props) => props.$styleCss}

  position: relative;
  overflow: hidden;

  /* Layered shadow for depth */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.10);

  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
`;

/* Decorative floating orbs */
const OrbA = styled.span`
  position: absolute;
  inset: auto;
  top: -48px;
  right: -48px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
  animation: ${floatA} 9s ease-in-out infinite;
`;

const OrbB = styled.span`
  position: absolute;
  bottom: -56px;
  left: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%);
  pointer-events: none;
  animation: ${floatB} 11s ease-in-out infinite;
`;

/* Subtle grid texture overlay */
const TextureOverlay = styled.span`
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.035) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
`;

/* Content layer */
const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

/* Title */
const StyledTitle = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-title`)}
  ${(props) => props.$styleCss}

  letter-spacing: -0.025em;
  font-weight: 800;
  line-height: 1.25;
`;

/* Description */
const StyledDescription = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(props) => props.$styleCss}

  line-height: 1.9;
  font-weight: 400;
`;

/* Buttons row */
const ButtonsRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  width: 100%;
  max-width: 400px;
  padding-top: 8px;

  @media (min-width: 480px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    max-width: none;
    width: auto;
  }
`;

/* Shared button base */
const ButtonBase = styled.a<{ $styleCss: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 160px;
  min-height: 50px;
  padding: 0.9rem 1.75rem;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease,
    opacity 0.2s ease;

  ${(props) => props.$styleCss}
`;

const StyledPrimaryButton = styled(ButtonBase)`
  ${sharedBlockKeyframes(`${PREFIX}-pribtn`)}

  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 14px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.15),
      0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0) scale(0.99);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
`;

const StyledSecondaryButton = styled(ButtonBase)`
  ${sharedBlockKeyframes(`${PREFIX}-secbtn`)}

  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover {
    transform: translateY(-2px) scale(1.01);
    background-color: rgba(255, 255, 255, 0.12) !important;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0) scale(0.99);
  }
`;

/* Arrow icon for primary button */
function ArrowIcon() {
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
      style={{ flexShrink: 0 }}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* External link icon for secondary button */
function ExternalIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

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

  const hasPrimary = Boolean(block.data.showPrimaryButton);
  const hasSecondary = Boolean(block.data.showSecondaryButton);
  const hasAnyButton = hasPrimary || hasSecondary;

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
          className="px-7 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20"
          $styleCss={containerCss}
        >
          {/* Decorative background elements */}
          <OrbA aria-hidden="true" />
          <OrbB aria-hidden="true" />
          <TextureOverlay aria-hidden="true" />

          <ContentLayer>
            {/* ── Title ── */}
            <EditablePart
              instanceId={block.instanceId}
              elementId="title"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledTitle
                className="mx-auto max-w-[600px]"
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
                  className="mx-auto max-w-[520px]"
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
            {hasAnyButton && (
              <ButtonsRow>
                {/* Primary */}
                {hasPrimary && (
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
                      <ArrowIcon />
                    </StyledPrimaryButton>
                  </EditablePart>
                )}

                {/* Secondary */}
                {hasSecondary && (
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
                      <ExternalIcon />
                    </StyledSecondaryButton>
                  </EditablePart>
                )}
              </ButtonsRow>
            )}
          </ContentLayer>
        </StyledContainer>
      </EditablePart>
    </CTARoot>
  );
}