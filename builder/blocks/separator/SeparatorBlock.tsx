"use client";

import styled, { css } from "styled-components";

import { EditablePart } from "@/builder/blocks/shared/EditablePart";
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

const PREFIX = "sep";

type SeparatorVariant =
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "fade"
  | "zigzag"
  | "wave"
  | "diamond"
  | "star"
  | "dot-ornament"
  | "arrow"
  | "heart"
  | "leaf"
  | "sparkle";

const ORNAMENT_SYMBOLS: Record<string, string> = {
  diamond: "◆",
  star: "✦",
  "dot-ornament": "● ● ●",
  arrow: "▼",
  heart: "♥",
  leaf: "❧",
  sparkle: "✧ ✦ ✧",
};

const LINE_VARIANTS: SeparatorVariant[] = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "fade",
  "zigzag",
  "wave",
];

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type SeparatorData = {
  variant: string;
  thickness: number | string;
  width: number | string;
  spacingY: number | string;
  showOrnament: boolean;
};

type SeparatorBlockProps = BlockComponentProps & {
  block: PageBlock & { data: SeparatorData };
};

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function clamp(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function normalizeVariant(v: unknown): SeparatorVariant {
  const raw = typeof v === "string" ? v.trim() : "";
  const all: SeparatorVariant[] = [
    "solid",
    "dashed",
    "dotted",
    "double",
    "fade",
    "zigzag",
    "wave",
    "diamond",
    "star",
    "dot-ornament",
    "arrow",
    "heart",
    "leaf",
    "sparkle",
  ];
  return (
    all.includes(raw as SeparatorVariant) ? raw : "solid"
  ) as SeparatorVariant;
}

function isOrnamentVariant(v: SeparatorVariant): boolean {
  return !LINE_VARIANTS.includes(v);
}

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const SepRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
`;

const StyledContainer = styled.div<{ $css: string; $py: number }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(p) => p.$css}
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: ${(p) => p.$py}px;
  padding-bottom: ${(p) => p.$py}px;
`;

const StyledLine = styled.div<{
  $css: string;
  $variant: "solid" | "dashed" | "dotted";
  $thickness: number;
}>`
  ${sharedBlockKeyframes(`${PREFIX}-line`)}
  ${(p) => p.$css}
  width: 100%;
  flex: 1 1 auto;

  ${(p) =>
    p.$variant === "solid" &&
    css`
      height: ${p.$thickness}px;
      min-height: ${p.$thickness}px;
      border: none;
    `}

  ${(p) =>
    p.$variant === "dashed" &&
    css`
      height: 0;
      background: transparent;
      border: none;
      border-top: ${p.$thickness}px dashed;
      border-color: inherit;
    `}

  ${(p) =>
    p.$variant === "dotted" &&
    css`
      height: 0;
      background: transparent;
      border: none;
      border-top: ${p.$thickness}px dotted;
      border-color: inherit;
    `}
`;

const StyledFadeLine = styled.div<{ $css: string; $thickness: number }>`
  ${sharedBlockKeyframes(`${PREFIX}-line`)}
  ${(p) => p.$css}
  width: 100%;
  height: ${(p) => p.$thickness}px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    currentColor 30%,
    currentColor 70%,
    transparent 100%
  );
  border: none;
  opacity: 0.4;
`;

const StyledZigzag = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-line`)}
  ${(p) => p.$css}
  width: 100%;
  height: 12px;
  background: none;
  border: none;
  background-image:
    linear-gradient(135deg, currentColor 25%, transparent 25%),
    linear-gradient(225deg, currentColor 25%, transparent 25%);
  background-size: 16px 12px;
  background-repeat: repeat-x;
  opacity: 0.25;
`;

const StyledWave = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-line`)}
  ${(p) => p.$css}
  width: 100%;
  overflow: hidden;
  height: 14px;
  border: none;
  background: none;

  &::after {
    content: "";
    display: block;
    width: 200%;
    height: 100%;
    background: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 4px,
      currentColor 4px,
      currentColor 5px
    );
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 14'%3E%3Cpath d='M0 7 Q5 0 10 7 Q15 14 20 7 Q25 0 30 7 Q35 14 40 7' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
    mask-size: 40px 14px;
    mask-repeat: repeat-x;
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 14'%3E%3Cpath d='M0 7 Q5 0 10 7 Q15 14 20 7 Q25 0 30 7 Q35 14 40 7' fill='none' stroke='black' stroke-width='2'/%3E%3C/svg%3E");
    -webkit-mask-size: 40px 14px;
    -webkit-mask-repeat: repeat-x;
    background: currentColor;
    opacity: 0.3;
  }
`;

const StyledOrnament = styled.div<{ $css: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-ornament`)}
  ${(p) => p.$css}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  line-height: 1;
  flex-shrink: 0;
  letter-spacing: 0.15em;
  user-select: none;
`;

/* ================================================================== */
/*  Sub-renderers                                                      */
/* ================================================================== */

function SolidLine({
  css: lineCss,
  thickness,
}: {
  css: string;
  thickness: number;
}) {
  return <StyledLine $css={lineCss} $variant="solid" $thickness={thickness} />;
}

function renderLineVariant(
  variant: SeparatorVariant,
  lineCss: string,
  thickness: number,
) {
  switch (variant) {
    case "solid":
      return <SolidLine css={lineCss} thickness={thickness} />;

    case "dashed":
      return (
        <StyledLine $css={lineCss} $variant="dashed" $thickness={thickness} />
      );

    case "dotted":
      return (
        <StyledLine $css={lineCss} $variant="dotted" $thickness={thickness} />
      );

    case "double":
      return (
        <div className="flex w-full flex-col gap-[6px]">
          <SolidLine css={lineCss} thickness={thickness} />
          <SolidLine css={lineCss} thickness={thickness} />
        </div>
      );

    case "fade":
      return <StyledFadeLine $css={lineCss} $thickness={thickness} />;

    case "zigzag":
      return <StyledZigzag $css={lineCss} />;

    case "wave":
      return <StyledWave $css={lineCss} />;

    default:
      return <SolidLine css={lineCss} thickness={thickness} />;
  }
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function SeparatorBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
}: SeparatorBlockProps) {
  const mobileOnly = mode === "editor";

  const variant = normalizeVariant(block.data.variant);
  const thickness = clamp(block.data.thickness, 1, 1, 12);
  const widthPct = clamp(block.data.width, 100, 10, 100);
  const spacingY = clamp(block.data.spacingY, 24, 0, 120);
  const showOrnament = Boolean(block.data.showOrnament);

  const isOrnament = isOrnamentVariant(variant);
  const ornamentSymbol = ORNAMENT_SYMBOLS[variant] ?? "✦";

  const containerCss = responsiveStyleToCss(
    block.elements.container.style,
    `${PREFIX}-container`,
    { mobileOnly, effect: "surface" },
  );

  const lineCss = responsiveStyleToCss(
    block.elements.line.style,
    `${PREFIX}-line`,
    { mobileOnly },
  );

  const ornamentCss = responsiveStyleToCss(
    block.elements.ornament.style,
    `${PREFIX}-ornament`,
    { mobileOnly, effect: "tap" },
  );

  return (
    <SepRoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer $css={containerCss} $py={spacingY} className="px-2">
          <div
            className="mx-auto w-full"
            style={{ width: `${widthPct}%`, maxWidth: "100%" }}
          >
            {/* ── Line-only variants ── */}
            {!isOrnament && !showOrnament && (
              <EditablePart
                instanceId={block.instanceId}
                elementId="line"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                {renderLineVariant(variant, lineCss, thickness)}
              </EditablePart>
            )}

            {/* ── Line variants with ornament enabled ── */}
            {!isOrnament && showOrnament && (
              <div className="flex items-center gap-3">
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="line"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                  className="min-w-0 flex-1"
                >
                  {renderLineVariant(variant, lineCss, thickness)}
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="ornament"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledOrnament
                    $css={ornamentCss}
                    className="shadow-sm"
                    aria-hidden="true"
                  >
                    ✦
                  </StyledOrnament>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="line"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                  className="min-w-0 flex-1"
                >
                  {renderLineVariant(variant, lineCss, thickness)}
                </EditablePart>
              </div>
            )}

            {/* ── Ornament variants (always with ornament) ── */}
            {isOrnament && (
              <div className="flex items-center gap-3">
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="line"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                  className="min-w-0 flex-1"
                >
                  <SolidLine css={lineCss} thickness={thickness} />
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="ornament"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledOrnament
                    $css={ornamentCss}
                    className="shadow-sm"
                    aria-hidden="true"
                  >
                    {ornamentSymbol}
                  </StyledOrnament>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="line"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                  className="min-w-0 flex-1"
                >
                  <SolidLine css={lineCss} thickness={thickness} />
                </EditablePart>
              </div>
            )}
          </div>
        </StyledContainer>
      </EditablePart>
    </SepRoot>
  );
}
