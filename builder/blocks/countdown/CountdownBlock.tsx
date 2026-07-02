"use client";

import { useEffect, useState } from "react";
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

const PREFIX = "cd";

const TIMER_LABELS = {
  days: "روز",
  hours: "ساعت",
  minutes: "دقیقه",
  seconds: "ثانیه",
} as const;

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type CountdownData = {
  title: string;
  description: string;
  targetDate: string;
  expiredText: string;
  buttonText: string;
  buttonUrl: string;
  showDescription: boolean;
  showButton: boolean;
  showLabels: boolean;
};

type CountdownBlockProps = BlockComponentProps & {
  block: PageBlock & { data: CountdownData };
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const CountdownRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
  position: relative;
`;

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(p) => p.$styleCss}
  position: relative;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 12px 32px rgba(15, 23, 42, 0.18);
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
      radial-gradient(circle at top right, rgba(255,255,255,0.07), transparent 28%),
      radial-gradient(circle at bottom left, rgba(255,255,255,0.04), transparent 32%);
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background-image: radial-gradient(
      circle,
      rgba(255,255,255,0.035) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
    opacity: 0.35;
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

const TitleDivider = styled.div`
  width: 46px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.2),
    rgba(255,255,255,0.7),
    rgba(255,255,255,0.2)
  );
`;

const StyledDescription = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(p) => p.$styleCss}
  text-align: center;
  line-height: 1.9;
`;

const StyledTimerBox = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-tbox`)}
  ${(p) => p.$styleCss}
  position: relative;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.08),
    0 10px 24px rgba(2, 6, 23, 0.14);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.08),
      0 14px 28px rgba(2, 6, 23, 0.18);
  }
`;

const StyledTimerNumber = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-tnum`)}
  ${(p) => p.$styleCss}
  font-weight: 800;
  letter-spacing: -0.03em;
`;

const StyledTimerLabel = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-tlab`)}
  ${(p) => p.$styleCss}
  font-weight: 600;
`;

const StyledButton = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-btn`)}
  ${(p) => p.$styleCss}
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 8px 18px rgba(15, 23, 42, 0.12);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease,
    opacity 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.98;
    box-shadow:
      0 6px 14px rgba(15, 23, 42, 0.16),
      0 2px 6px rgba(15, 23, 42, 0.10);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StyledExpired = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-exp`)}
  ${(p) => p.$styleCss}
  text-align: center;
`;

const ExpiredBox = styled.div`
  padding: 18px 22px;
  border-radius: 18px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.08),
    0 10px 24px rgba(2, 6, 23, 0.12);
`;

const StatusBox = styled.div`
  padding: 14px 18px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.74);
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
`;

const Separator = styled.span`
  display: inline-block;
  color: rgba(255,255,255,0.24);
  font-weight: 800;
  user-select: none;
`;

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function parseTargetDate(raw: string): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/* ================================================================== */
/*  useCountdown hook (client-safe, no hydration mismatch)             */
/* ================================================================== */

function useCountdown(targetDateStr: string): {
  timeLeft: TimeLeft | null;
  isExpired: boolean;
  isInvalid: boolean;
  mounted: boolean;
} {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const target = parseTargetDate(targetDateStr);
  const isInvalid = target === null;

  useEffect(() => {
    setMounted(true);

    if (!target) return;

    const tick = () => {
      const tl = calcTimeLeft(target);
      if (tl) {
        setTimeLeft(tl);
        setIsExpired(false);
      } else {
        setTimeLeft(null);
        setIsExpired(true);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDateStr]); // eslint-disable-line react-hooks/exhaustive-deps

  return { timeLeft, isExpired, isInvalid, mounted };
}

/* ================================================================== */
/*  Placeholder digits (SSR-safe)                                      */
/* ================================================================== */

const PLACEHOLDER_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function CountdownBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: CountdownBlockProps) {
  const isEditor = mode === "editor";
  const mobileOnly = isEditor;

  /* ── Countdown logic ── */
  const { timeLeft, isExpired, isInvalid, mounted } = useCountdown(
    String(block.data.targetDate ?? ""),
  );

  const displayTime = timeLeft ?? PLACEHOLDER_TIME;

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

  const timerBoxCss = responsiveStyleToCss(
    block.elements.timerBox.style,
    `${PREFIX}-tbox`,
    { mobileOnly },
  );

  const timerNumCss = responsiveStyleToCss(
    block.elements.timerNumber.style,
    `${PREFIX}-tnum`,
    { mobileOnly },
  );

  const timerLabCss = responsiveStyleToCss(
    block.elements.timerLabel.style,
    `${PREFIX}-tlab`,
    { mobileOnly },
  );

  const btnCss = responsiveStyleToCss(
    block.elements.button.style,
    `${PREFIX}-btn`,
    { mobileOnly },
  );

  const expCss = responsiveStyleToCss(
    block.elements.expiredText.style,
    `${PREFIX}-exp`,
    { mobileOnly },
  );

  /* ── Link helper ── */
  const buttonUrl = String(block.data.buttonUrl ?? "").trim();
  const buttonHref = !isEditor && buttonUrl ? buttonUrl : undefined;

  /* ── Show labels ── */
  const showLabels = Boolean(block.data.showLabels);

  /* ── Timer segments ── */
  const segments: Array<{ key: keyof TimeLeft; label: string }> = [
    { key: "seconds", label: TIMER_LABELS.seconds },
    { key: "minutes", label: TIMER_LABELS.minutes },
    { key: "hours", label: TIMER_LABELS.hours },
    { key: "days", label: TIMER_LABELS.days },
  ];

  return (
    <CountdownRoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          dir="rtl"
          className="flex flex-col items-center gap-6 overflow-hidden px-5 py-10 text-center sm:px-8 sm:py-14"
          $styleCss={containerCss}
        >
          <ContentLayer className="flex flex-col items-center gap-6 w-full">
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

              <TitleDivider />
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

            {/* ── Timer / Expired / Invalid ── */}
            {isInvalid ? (
              <StatusBox>تاریخ معتبر وارد کنید</StatusBox>
            ) : !mounted ? (
              <EditablePart
                instanceId={block.instanceId}
                elementId="timerBox"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <div className="mx-auto flex w-full max-w-[340px] items-center justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-nowrap sm:gap-4">
                  {segments.map((seg) => (
                    <div
                      key={seg.key}
                      className="w-[calc(50%-0.375rem)] sm:w-auto"
                    >
                      <StyledTimerBox
                        $styleCss={timerBoxCss}
                        className="flex min-w-0 w-full flex-col items-center gap-1.5 px-3 py-3 sm:min-w-[80px] sm:w-auto sm:px-5 sm:py-5"
                      >
                        <StyledTimerNumber
                          $styleCss={timerNumCss}
                          className="font-extrabold tabular-nums leading-none whitespace-nowrap"
                        >
                          --
                        </StyledTimerNumber>
                        {showLabels && (
                          <StyledTimerLabel
                            $styleCss={timerLabCss}
                            className="font-medium leading-none text-center"
                          >
                            {seg.label}
                          </StyledTimerLabel>
                        )}
                      </StyledTimerBox>
                    </div>
                  ))}
                </div>
              </EditablePart>
            ) : isExpired ? (
              <EditablePart
                instanceId={block.instanceId}
                elementId="expiredText"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledExpired
                  className="py-1 font-bold leading-[1.6]"
                  $styleCss={expCss}
                >
                  <ExpiredBox>
                    <InlineEditableText
                      value={String(block.data.expiredText ?? "")}
                      dataKey="expiredText"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <p className="m-0">{text}</p>}
                    </InlineEditableText>
                  </ExpiredBox>
                </StyledExpired>
              </EditablePart>
            ) : (
              <EditablePart
                instanceId={block.instanceId}
                elementId="timerBox"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <div className="mx-auto flex w-full max-w-[340px] items-center justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-nowrap sm:gap-4">
                  {segments.map((seg, idx) => (
                    <div
                      key={seg.key}
                      className="flex w-[calc(50%-0.375rem)] items-center justify-center sm:w-auto sm:gap-4"
                    >
                      <StyledTimerBox
                        $styleCss={timerBoxCss}
                        className="flex min-w-0 w-full flex-col items-center gap-1.5 px-3 py-3 sm:min-w-[80px] sm:w-auto sm:px-5 sm:py-5"
                      >
                        <StyledTimerNumber
                          $styleCss={timerNumCss}
                          className="font-extrabold tabular-nums leading-none whitespace-nowrap"
                        >
                          {seg.key === "days"
                            ? displayTime[seg.key]
                            : padTwo(displayTime[seg.key])}
                        </StyledTimerNumber>
                        {showLabels && (
                          <StyledTimerLabel
                            $styleCss={timerLabCss}
                            className="font-medium leading-none text-center"
                          >
                            {seg.label}
                          </StyledTimerLabel>
                        )}
                      </StyledTimerBox>

                      {idx < segments.length - 1 && (
                        <Separator
                          className="hidden sm:inline-block sm:text-xl text-lg"
                          aria-hidden="true"
                        >
                          :
                        </Separator>
                      )}
                    </div>
                  ))}
                </div>
              </EditablePart>
            )}

            {/* ── Button ── */}
            {Boolean(block.data.showButton) && (
              <EditablePart
                instanceId={block.instanceId}
                elementId="button"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledButton
                  $styleCss={btnCss}
                  href={buttonHref}
                  target={buttonHref ? "_blank" : undefined}
                  rel={buttonHref ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (isEditor) e.preventDefault();
                  }}
                  className="inline-flex min-w-[180px] items-center justify-center px-7 py-3.5 text-center font-bold no-underline transition-opacity hover:opacity-90"
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
              </EditablePart>
            )}
          </ContentLayer>
        </StyledContainer>
      </EditablePart>
    </CountdownRoot>
  );
}