"use client";

import styled, { keyframes } from "styled-components";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";
import { useRef } from "react";

// ─── Drag scroll hook ──────────────────────────────────────────────────────────

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velX = useRef(0);
  const lastX = useRef(0);
  const animFrame = useRef<number>(0);
  const isDragging = useRef(false);

  const stopMomentum = () => {
    cancelAnimationFrame(animFrame.current);
  };

  const startMomentum = () => {
    stopMomentum();
    const loop = () => {
      if (!ref.current) return;
      velX.current *= 0.92;
      if (Math.abs(velX.current) < 0.5) return;
      ref.current.scrollLeft -= velX.current;
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    stopMomentum();
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    lastX.current = e.pageX;
    velX.current = 0;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  };

  const onMouseLeave = () => {
    if (!ref.current || !isDown.current) return;
    isDown.current = false;
    isDragging.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.userSelect = "";
    startMomentum();
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!ref.current) return;
    isDown.current = false;
    ref.current.style.cursor = "grab";
    ref.current.style.userSelect = "";
    if (isDragging.current) {
      e.preventDefault();
      startMomentum();
    }
    isDragging.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - startX.current;

    if (!isDragging.current && Math.abs(walk) < 4) return;
    isDragging.current = true;

    velX.current = e.pageX - lastX.current;
    lastX.current = e.pageX;
    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  const onClick = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    onClick,
    isDragging,
  };
}

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ProductItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  altText: string;
  price: string;
  oldPrice: string;
  badgeText: string;
  buttonText: string;
  productUrl: string;
  accentColor: string;
  showBadge: boolean;
  showOldPrice: boolean;
}

// ─── Animations ─────────────────────────────────────────────────────────────────

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ──────────────────────────────────────────────────────────

const PREFIX = "product-cards-block";

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(PREFIX)}
  ${({ $styleCss }) => $styleCss}

  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 8px 32px rgba(0, 0, 0, 0.05);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(
        ellipse at 15% 0%,
        rgba(99, 102, 241, 0.04),
        transparent 50%
      ),
      radial-gradient(
        ellipse at 85% 100%,
        rgba(59, 130, 246, 0.03),
        transparent 50%
      );
  }
`;

const ContentLayer = styled.div`
  position: relative;
  z-index: 1;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.3;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const TitleDivider = styled.div`
  width: 44px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #94a3b8, #cbd5e1, #94a3b8);
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
`;

const StyledDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  line-height: 1.8;
  max-width: 560px;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledScrollArea = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:not([data-dragging="true"]) {
    scroll-snap-type: x mandatory;
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;

  &::-webkit-scrollbar {
    height: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 999px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.18);
  }
`;

const StyledCard = styled.div<{ $styleCss: string; $index: number }>`
  ${({ $styleCss }) => $styleCss}
  flex-shrink: 0;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  animation: ${fadeInUp} 0.4s ease both;
  animation-delay: ${({ $index }) => $index * 0.06}s;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.04);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.3s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.04);
  }
`;

const StyledImageWrap = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: inherit;
`;

const PlaceholderIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
`;

const StyledBadge = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-block;
  font-weight: 600;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledProductName = styled.h3<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.01em;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledProductDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  line-height: 1.7;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
`;

const StyledPrice = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-block;
  font-weight: 800;
  letter-spacing: -0.01em;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledOldPrice = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-block;
  text-decoration: line-through;
  font-weight: 400;
  opacity: 0.7;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledButton = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  letter-spacing: -0.005em;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04);
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    font-size 0.2s ease,
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-1px) scale(1.01);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(0) scale(0.99);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
`;

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  animation: ${fadeInUp} 0.4s ease both;
`;

const EmptyStateIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
`;

// ─── Image placeholder icon ────────────────────────────────────────────────────

function ImagePlaceholderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ProductCardsBlock({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = block.data as Record<string, unknown>;
  const elements = block.elements ?? {};

  // ── Responsive CSS ────────────────────────────────────────────────────────

  const containerStyle = responsiveStyleToCss(
    elements.container?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const titleStyle = responsiveStyleToCss(elements.title?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const descriptionStyle = responsiveStyleToCss(
    elements.description?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const scrollAreaStyle = responsiveStyleToCss(
    elements.scrollArea?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const cardStyle = responsiveStyleToCss(elements.card?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const imageStyle = responsiveStyleToCss(elements.image?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const badgeStyle = responsiveStyleToCss(elements.badge?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const productNameStyle = responsiveStyleToCss(
    elements.productName?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const productDescriptionStyle = responsiveStyleToCss(
    elements.productDescription?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const priceStyle = responsiveStyleToCss(elements.price?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const oldPriceStyle = responsiveStyleToCss(
    elements.oldPrice?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const buttonStyle = responsiveStyleToCss(
    elements.button?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );

  // ── Safe data ─────────────────────────────────────────────────────────────

  const sectionTitle = typeof data.title === "string" ? data.title : "";
  const sectionDescription =
    typeof data.description === "string" ? data.description : "";
  const showTitle = data.showTitle !== false;
  const showDescription = data.showDescription !== false;
  const showButtons = data.showButtons !== false;
  const openInNewTab = data.openInNewTab !== false;

  const products: ProductItem[] = Array.isArray(data.products)
    ? (data.products as ProductItem[]).map((p) => ({
        id: typeof p.id === "string" ? p.id : `p-${Math.random()}`,
        name: typeof p.name === "string" ? p.name : "",
        description: typeof p.description === "string" ? p.description : "",
        imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
        altText: typeof p.altText === "string" ? p.altText : "",
        price: typeof p.price === "string" ? p.price : "",
        oldPrice: typeof p.oldPrice === "string" ? p.oldPrice : "",
        badgeText: typeof p.badgeText === "string" ? p.badgeText : "",
        buttonText: typeof p.buttonText === "string" ? p.buttonText : "",
        productUrl: typeof p.productUrl === "string" ? p.productUrl : "",
        accentColor:
          typeof p.accentColor === "string" && p.accentColor
            ? p.accentColor
            : "#111827",
        showBadge: p.showBadge !== false,
        showOldPrice: p.showOldPrice === true,
      }))
    : [];

  const isEditor = mode === "editor";

  return (
    <EditablePart
      instanceId={block.instanceId}
      elementId="container"
      mode={mode}
      selectedElementId={selectedElementId}
      onSelectElement={onSelectElement}
    >
      <StyledContainer
        $styleCss={containerStyle}
        className="w-full p-5 md:p-8"
        dir="rtl"
      >
        <ContentLayer>
          {/* Section header */}
          {(showTitle || showDescription) && (
            <HeaderSection className="mb-6">
              {showTitle && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="title"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledTitle
                    $styleCss={titleStyle}
                    className="mb-2 font-bold"
                  >
                    <InlineEditableText
                      value={sectionTitle}
                      dataKey="title"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <>{text}</>}
                    </InlineEditableText>
                  </StyledTitle>
                  <TitleDivider />
                </EditablePart>
              )}

              {showDescription && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="description"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledDescription
                    $styleCss={descriptionStyle}
                    className="mb-6 mt-2"
                  >
                    <InlineEditableText
                      value={sectionDescription}
                      dataKey="description"
                      instanceId={block.instanceId}
                      mode={mode}
                      multiline
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <>{text}</>}
                    </InlineEditableText>
                  </StyledDescription>
                </EditablePart>
              )}
            </HeaderSection>
          )}

          {/* Empty state */}
          {products.length === 0 && isEditor && (
            <EmptyStateWrapper>
              <EmptyStateIcon>
                <BoxIcon />
              </EmptyStateIcon>
              <p
                className="text-center text-sm text-slate-400 leading-relaxed"
                style={{ margin: 0 }}
              >
                هنوز محصولی اضافه نشده است.
                <br />
                <span className="text-xs text-slate-300">
                  از تنظیمات بلاک، محصولات خود را اضافه کنید.
                </span>
              </p>
            </EmptyStateWrapper>
          )}

          {/* Products scroll row */}
          {products.length > 0 && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="scrollArea"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              {products.length > 0 && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="scrollArea"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  {(() => {
                    const drag = useDragScroll();
                    return (
                      <StyledScrollArea
                        $styleCss={scrollAreaStyle}
                        className="gap-4 pb-2"
                        ref={drag.ref}
                        onMouseDown={drag.onMouseDown}
                        onMouseLeave={drag.onMouseLeave}
                        onMouseUp={drag.onMouseUp}
                        onMouseMove={drag.onMouseMove}
                        onClick={drag.onClick}
                        data-dragging={drag.isDragging ? "true" : undefined}
                        style={{ cursor: "grab" }}
                      >
                        {products.map((product, index) => {
                          const hasUrl = product.productUrl.length > 0;

                          const buttonEl = showButtons && (
                            <EditablePart
                              instanceId={block.instanceId}
                              elementId="button"
                              mode={mode}
                              selectedElementId={selectedElementId}
                              onSelectElement={onSelectElement}
                            >
                              <StyledButton
                                $styleCss={buttonStyle}
                                className="w-full py-2.5 px-4 mt-auto"
                              >
                                <InlineEditableText
                                  value={product.buttonText}
                                  dataKey={`products.${product.id}.buttonText`}
                                  instanceId={block.instanceId}
                                  mode={mode}
                                  onUpdateContent={onUpdateContent}
                                >
                                  {(text) => <>{text}</>}
                                </InlineEditableText>
                              </StyledButton>
                            </EditablePart>
                          );

                          return (
                            <EditablePart
                              key={product.id}
                              instanceId={block.instanceId}
                              elementId="card"
                              mode={mode}
                              selectedElementId={selectedElementId}
                              onSelectElement={onSelectElement}
                            >
                              <StyledCard
                                $styleCss={cardStyle}
                                $index={index}
                                className="w-[260px] my-2 min-w-[260px] sm:w-[290px] sm:min-w-[290px] md:w-[310px] md:min-w-[310px]"
                              >
                                {/* Image */}
                                <EditablePart
                                  instanceId={block.instanceId}
                                  elementId="image"
                                  mode={mode}
                                  selectedElementId={selectedElementId}
                                  onSelectElement={onSelectElement}
                                >
                                  <StyledImageWrap
                                    $styleCss={imageStyle}
                                    className="w-full aspect-4/3"
                                  >
                                    {product.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.altText || product.name}
                                        className="w-full h-full object-cover rounded-[inherit]"
                                        draggable={false}
                                      />
                                    ) : (
                                      <ImagePlaceholder>
                                        <PlaceholderIcon>
                                          <ImagePlaceholderIcon />
                                        </PlaceholderIcon>
                                        <span className="text-[11px] text-slate-400 select-none px-3 text-center">
                                          تصویر محصول
                                        </span>
                                      </ImagePlaceholder>
                                    )}

                                    {/* Badge */}
                                    {product.showBadge && product.badgeText && (
                                      <div className="absolute top-3 right-3">
                                        <EditablePart
                                          instanceId={block.instanceId}
                                          elementId="badge"
                                          mode={mode}
                                          selectedElementId={selectedElementId}
                                          onSelectElement={onSelectElement}
                                        >
                                          <StyledBadge
                                            $styleCss={badgeStyle}
                                            className="px-2.5 py-1 leading-tight"
                                          >
                                            <InlineEditableText
                                              value={product.badgeText}
                                              dataKey={`products.${product.id}.badgeText`}
                                              instanceId={block.instanceId}
                                              mode={mode}
                                              onUpdateContent={onUpdateContent}
                                            >
                                              {(text) => <>{text}</>}
                                            </InlineEditableText>
                                          </StyledBadge>
                                        </EditablePart>
                                      </div>
                                    )}
                                  </StyledImageWrap>
                                </EditablePart>

                                {/* Content */}
                                <div className="flex flex-col gap-2 p-4 flex-1">
                                  {/* Product name */}
                                  <EditablePart
                                    instanceId={block.instanceId}
                                    elementId="productName"
                                    mode={mode}
                                    selectedElementId={selectedElementId}
                                    onSelectElement={onSelectElement}
                                  >
                                    <StyledProductName
                                      $styleCss={productNameStyle}
                                      className="font-bold leading-snug"
                                    >
                                      <InlineEditableText
                                        value={product.name}
                                        dataKey={`products.${product.id}.name`}
                                        instanceId={block.instanceId}
                                        mode={mode}
                                        onUpdateContent={onUpdateContent}
                                      >
                                        {(text) => <>{text}</>}
                                      </InlineEditableText>
                                    </StyledProductName>
                                  </EditablePart>

                                  {/* Product description */}
                                  <EditablePart
                                    instanceId={block.instanceId}
                                    elementId="productDescription"
                                    mode={mode}
                                    selectedElementId={selectedElementId}
                                    onSelectElement={onSelectElement}
                                  >
                                    <StyledProductDescription
                                      $styleCss={productDescriptionStyle}
                                      className="leading-relaxed line-clamp-2"
                                    >
                                      <InlineEditableText
                                        value={product.description}
                                        dataKey={`products.${product.id}.description`}
                                        instanceId={block.instanceId}
                                        mode={mode}
                                        multiline
                                        onUpdateContent={onUpdateContent}
                                      >
                                        {(text) => <>{text}</>}
                                      </InlineEditableText>
                                    </StyledProductDescription>
                                  </EditablePart>

                                  {/* Prices */}
                                  <PriceRow>
                                    <EditablePart
                                      instanceId={block.instanceId}
                                      elementId="price"
                                      mode={mode}
                                      selectedElementId={selectedElementId}
                                      onSelectElement={onSelectElement}
                                    >
                                      <StyledPrice $styleCss={priceStyle}>
                                        <InlineEditableText
                                          value={product.price}
                                          dataKey={`products.${product.id}.price`}
                                          instanceId={block.instanceId}
                                          mode={mode}
                                          onUpdateContent={onUpdateContent}
                                        >
                                          {(text) => <>{text}</>}
                                        </InlineEditableText>
                                      </StyledPrice>
                                    </EditablePart>

                                    {product.showOldPrice &&
                                      product.oldPrice && (
                                        <EditablePart
                                          instanceId={block.instanceId}
                                          elementId="oldPrice"
                                          mode={mode}
                                          selectedElementId={selectedElementId}
                                          onSelectElement={onSelectElement}
                                        >
                                          <StyledOldPrice
                                            $styleCss={oldPriceStyle}
                                          >
                                            <InlineEditableText
                                              value={product.oldPrice}
                                              dataKey={`products.${product.id}.oldPrice`}
                                              instanceId={block.instanceId}
                                              mode={mode}
                                              onUpdateContent={onUpdateContent}
                                            >
                                              {(text) => <>{text}</>}
                                            </InlineEditableText>
                                          </StyledOldPrice>
                                        </EditablePart>
                                      )}
                                  </PriceRow>

                                  {/* Button */}
                                  {showButtons && (
                                    <>
                                      {isEditor || !hasUrl ? (
                                        <div className="mt-auto pt-2">
                                          {buttonEl}
                                        </div>
                                      ) : (
                                        <a
                                          href={product.productUrl}
                                          target={
                                            openInNewTab ? "_blank" : undefined
                                          }
                                          rel={
                                            openInNewTab
                                              ? "noopener noreferrer"
                                              : undefined
                                          }
                                          className="no-underline mt-auto pt-2 block"
                                        >
                                          {buttonEl}
                                        </a>
                                      )}
                                    </>
                                  )}
                                </div>
                              </StyledCard>
                            </EditablePart>
                          );
                        })}
                      </StyledScrollArea>
                    );
                  })()}
                </EditablePart>
              )}
            </EditablePart>
          )}
        </ContentLayer>
      </StyledContainer>
    </EditablePart>
  );
}
