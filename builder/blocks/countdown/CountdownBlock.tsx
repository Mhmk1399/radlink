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

const StyledTimerBox = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-tbox`)}
  ${(p) => p.$styleCss}
`;

const StyledTimerNumber = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-tnum`)}
  ${(p) => p.$styleCss}
`;

const StyledTimerLabel = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-tlab`)}
  ${(p) => p.$styleCss}
`;

const StyledButton = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-btn`)}
  ${(p) => p.$styleCss}
`;

const StyledExpired = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-exp`)}
  ${(p) => p.$styleCss}
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
  const data = block.data as CountdownData;
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

          {/* ── Timer / Expired / Invalid ── */}
          {isInvalid ? (
            /* Invalid date */
            <div className="py-4 text-center text-sm font-medium opacity-60">
              تاریخ معتبر وارد کنید
            </div>
          ) : !mounted ? (
            /* SSR placeholder — static zeros, no mismatch */
            <EditablePart
              instanceId={block.instanceId}
              elementId="timerBox"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {segments.map((seg) => (
                  <StyledTimerBox
                    key={seg.key}
                    $styleCss={timerBoxCss}
                    className="flex min-w-[64px] flex-col items-center gap-1.5 px-4 py-4 sm:min-w-[80px] sm:px-5 sm:py-5"
                  >
                    <StyledTimerNumber
                      $styleCss={timerNumCss}
                      className="font-extrabold tabular-nums leading-none"
                    >
                      --
                    </StyledTimerNumber>
                    {showLabels && (
                      <StyledTimerLabel
                        $styleCss={timerLabCss}
                        className="font-medium leading-none"
                      >
                        {seg.label}
                      </StyledTimerLabel>
                    )}
                  </StyledTimerBox>
                ))}
              </div>
            </EditablePart>
          ) : isExpired ? (
            /* Expired */
            <EditablePart
              instanceId={block.instanceId}
              elementId="expiredText"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledExpired
                className="py-4 font-bold leading-[1.6]"
                $styleCss={expCss}
              >
                <InlineEditableText
                  value={String(block.data.expiredText ?? "")}
                  dataKey="expiredText"
                  instanceId={block.instanceId}
                  mode={mode}
                  onUpdateContent={onUpdateContent}
                >
                  {(text) => <p className="m-0">{text}</p>}
                </InlineEditableText>
              </StyledExpired>
            </EditablePart>
          ) : (
            /* Active timer */
            <EditablePart
              instanceId={block.instanceId}
              elementId="timerBox"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                {segments.map((seg, idx) => (
                  <div
                    key={seg.key}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <StyledTimerBox
                      $styleCss={timerBoxCss}
                      className="flex min-w-[64px] flex-col items-center gap-1.5 px-4 py-4 sm:min-w-[80px] sm:px-5 sm:py-5"
                    >
                      <StyledTimerNumber
                        $styleCss={timerNumCss}
                        className="font-extrabold tabular-nums leading-none"
                      >
                        {seg.key === "days"
                          ? displayTime[seg.key]
                          : padTwo(displayTime[seg.key])}
                      </StyledTimerNumber>
                      {showLabels && (
                        <StyledTimerLabel
                          $styleCss={timerLabCss}
                          className="font-medium leading-none"
                        >
                          {seg.label}
                        </StyledTimerLabel>
                      )}
                    </StyledTimerBox>

                    {/* Separator */}
                    {idx < segments.length - 1 && (
                      <span
                        className="select-none text-lg font-bold opacity-30 sm:text-xl"
                        aria-hidden="true"
                      >
                        :
                      </span>
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
        </StyledContainer>
      </EditablePart>
    </CountdownRoot>
  );
}
