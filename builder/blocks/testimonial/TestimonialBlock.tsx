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

const PREFIX = "testi";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type TestimonialData = {
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  showAvatar: boolean;
  showRole: boolean;
  showRating: boolean;
};

type TestimonialBlockProps = BlockComponentProps & {
  block: PageBlock & { data: TestimonialData };
};

/* ================================================================== */
/*  Star rating renderer                                               */
/* ================================================================== */

function StarRating({ count }: { count: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(count)));
  const stars: string[] = [];

  for (let i = 0; i < 5; i++) {
    stars.push(i < clamped ? "★" : "☆");
  }

  return <span>{stars.join("")}</span>;
}

/* ================================================================== */
/*  Styled root                                                        */
/* ================================================================== */

const TestimonialRoot = styled.div`
  ${sharedBlockKeyframes(PREFIX)}
`;

/* ================================================================== */
/*  CSS builder                                                        */
/* ================================================================== */

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("testi-container")}
  ${(props) => props.$styleCss}
`;

const StyledQuote = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("testi-quote")}
  ${(props) => props.$styleCss}
`;

const StyledName = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("testi-name")}
  ${(props) => props.$styleCss}
`;

const StyledRole = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("testi-role")}
  ${(props) => props.$styleCss}
`;

const StyledAvatar = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("testi-avatar")}
  ${(props) => props.$styleCss}
`;

const StyledRating = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes("testi-rating")}
  ${(props) => props.$styleCss}
`;

/* ================================================================== */
/*  Avatar component                                                   */
/* ================================================================== */

function AvatarDisplay({
  url,
  name,
  className,
}: {
  url: string;
  name: string;
  className?: string;
}) {
  const firstLetter = name.trim().charAt(0) || "?";

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={className}
        style={{
          width: 56,
          height: 56,
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        fontWeight: 700,
        color: "#6b7280",
        userSelect: "none",
      }}
    >
      {firstLetter}
    </div>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function TestimonialBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: TestimonialBlockProps) {
  const data = block.data as TestimonialData;

  const mobileOnly = mode === "editor";

  const containerStyle = responsiveStyleToCss(
    block.elements.container.style,
    "testi-container",
    { mobileOnly },
  );

  const quoteStyle = responsiveStyleToCss(
    block.elements.quote.style,
    "testi-quote",
    { mobileOnly },
  );

  const nameStyle = responsiveStyleToCss(
    block.elements.name.style,
    "testi-name",
    { mobileOnly },
  );

  const roleStyle = responsiveStyleToCss(
    block.elements.role.style,
    "testi-role",
    { mobileOnly },
  );

  const avatarStyle = responsiveStyleToCss(
    block.elements.avatar.style,
    "testi-avatar",
    { mobileOnly },
  );

  const ratingStyle = responsiveStyleToCss(
    block.elements.rating.style,
    "testi-rating",
    { mobileOnly },
  );

  return (
    <TestimonialRoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          dir="rtl"
          className="flex flex-col items-center gap-5 overflow-hidden px-7 py-8 text-center"
          $styleCss={containerStyle}
        >
          <EditablePart
            instanceId={block.instanceId}
            elementId="quote"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
            className="max-w-[540px]"
          >
            <StyledQuote className="leading-[1.8]" $styleCss={quoteStyle}>
              <InlineEditableText
                value={String(block.data.quote ?? "")}
                dataKey="quote"
                instanceId={block.instanceId}
                mode={mode}
                multiline
                onUpdateContent={onUpdateContent}
              >
                {(text) => <p className="m-0">{text}</p>}
              </InlineEditableText>
            </StyledQuote>
          </EditablePart>

          {Boolean(block.data.showRating) && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="rating"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledRating
                className="leading-none tracking-[2px]"
                $styleCss={ratingStyle}
              >
                <StarRating count={Number(block.data.rating ?? 5)} />
              </StyledRating>
            </EditablePart>
          )}

          <div className="flex items-center gap-3">
            {Boolean(block.data.showAvatar) && (
              <EditablePart
                instanceId={block.instanceId}
                elementId="avatar"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledAvatar
                  className="shrink-0 overflow-hidden"
                  $styleCss={avatarStyle}
                >
                  <AvatarDisplay
                    url={String(block.data.avatarUrl ?? "")}
                    name={String(block.data.name ?? "؟")}
                  />
                </StyledAvatar>
              </EditablePart>
            )}

            <div className="flex flex-col gap-1 text-right">
              <EditablePart
                instanceId={block.instanceId}
                elementId="name"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledName
                  className="font-bold leading-[1.4]"
                  $styleCss={nameStyle}
                >
                  <InlineEditableText
                    value={String(block.data.name ?? "")}
                    dataKey="name"
                    instanceId={block.instanceId}
                    mode={mode}
                    onUpdateContent={onUpdateContent}
                  >
                    {(text) => <span>{text}</span>}
                  </InlineEditableText>
                </StyledName>
              </EditablePart>

              {Boolean(block.data.showRole) && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="role"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledRole className="leading-[1.4]" $styleCss={roleStyle}>
                    <InlineEditableText
                      value={String(block.data.role ?? "")}
                      dataKey="role"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <span>{text}</span>}
                    </InlineEditableText>
                  </StyledRole>
                </EditablePart>
              )}
            </div>
          </div>
        </StyledContainer>
      </EditablePart>
    </TestimonialRoot>
  );
}
