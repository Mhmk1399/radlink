"use client";

import styled, { keyframes } from "styled-components";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import { normalizePersianPriceText } from "@/lib/format/persianPrice";
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

  const setDraggingAttribute = (dragging: boolean) => {
    if (!ref.current) return;

    if (dragging) {
      ref.current.dataset.dragging = "true";
      return;
    }

    delete ref.current.dataset.dragging;
  };

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
    setDraggingAttribute(false);
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  };

  const onMouseLeave = () => {
    if (!ref.current || !isDown.current) return;
    isDown.current = false;
    isDragging.current = false;
    setDraggingAttribute(false);
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
    setDraggingAttribute(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = x - startX.current;

    if (!isDragging.current && Math.abs(walk) < 4) return;
    isDragging.current = true;
    setDraggingAttribute(true);

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
  isolation: isolate;
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
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 12%, rgba(255, 255, 255, 0.85), transparent 24%),
    radial-gradient(circle at 88% 82%, rgba(148, 163, 184, 0.16), transparent 30%),
    linear-gradient(135deg, #f8fafc, #eef2f7);
  border-radius: inherit;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle,
      rgba(148, 163, 184, 0.22) 1px,
      transparent 1.5px
    );
    background-size: 14px 14px;
    opacity: 0.35;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
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
    { mobileOnly: mode === "editor", effect: "surface" },
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
    effect: "card",
  });
  const imageStyle = responsiveStyleToCss(elements.image?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
    effect: "media",
  });
  const badgeStyle = responsiveStyleToCss(elements.badge?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
    effect: "tap",
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
    { mobileOnly: mode === "editor", effect: "button" },
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
    ? (data.products as ProductItem[]).map((p, index) => ({
        id: typeof p.id === "string" ? p.id : `product-${index + 1}`,
        name: typeof p.name === "string" ? p.name : "",
        description: typeof p.description === "string" ? p.description : "",
        imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
        altText: typeof p.altText === "string" ? p.altText : "",
        price: typeof p.price === "string" ? normalizePersianPriceText(p.price) : "",
        oldPrice:
          typeof p.oldPrice === "string"
            ? normalizePersianPriceText(p.oldPrice)
            : "",
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
  const {
    ref: scrollRef,
    onMouseDown: handleScrollMouseDown,
    onMouseLeave: handleScrollMouseLeave,
    onMouseUp: handleScrollMouseUp,
    onMouseMove: handleScrollMouseMove,
    onClick: handleScrollClick,
  } = useDragScroll();
  const handleInlineContentUpdate = (
    instanceId: string,
    key: string,
    value: unknown,
  ) => {
    if (instanceId !== block.instanceId) {
      onUpdateContent?.(instanceId, key, value);
      return;
    }

    const [rootKey, itemToken, ...fieldParts] = key.split(".");
    const fieldKey = fieldParts.join(".");
    if (rootKey !== "products" || !itemToken || !fieldKey) {
      onUpdateContent?.(instanceId, key, value);
      return;
    }

    const currentProducts = Array.isArray(data.products)
      ? (data.products as Array<Record<string, unknown>>)
      : [];
    let didUpdate = false;
    const nextProducts = currentProducts.map((item, index) => {
      const sourceId = typeof item.id === "string" ? item.id : "";
      const fallbackId = products[index]?.id ?? `product-${index + 1}`;
      const isTarget =
        sourceId === itemToken ||
        fallbackId === itemToken ||
        String(index) === itemToken;

      if (!isTarget) return item;

      didUpdate = true;
      const nextValue =
        fieldKey === "price" || fieldKey === "oldPrice"
          ? normalizePersianPriceText(value)
          : value;

      return { ...item, [fieldKey]: nextValue };
    });

    if (!didUpdate) return;

    onUpdateContent?.(block.instanceId, "products", nextProducts);
  };

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
        className="w-full p-4 sm:p-5 md:p-8"
        dir="rtl"
      >
        <ContentLayer>
          {/* Section header */}
          {(showTitle || showDescription) && (
            <HeaderSection className="mb-4 sm:mb-6">
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
                      onUpdateContent={handleInlineContentUpdate}
                    >
                      {(text) => <>{text}</>}
                    </InlineEditableText>
                  </StyledTitle>
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
                    className="mb-4 mt-1.5 sm:mb-6 sm:mt-2"
                  >
                    <InlineEditableText
                      value={sectionDescription}
                      dataKey="description"
                      instanceId={block.instanceId}
                      mode={mode}
                      multiline
                      onUpdateContent={handleInlineContentUpdate}
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
                  <StyledScrollArea
                    $styleCss={scrollAreaStyle}
                    className="gap-3 pb-1.5 sm:gap-4 sm:pb-2"
                    ref={scrollRef}
                    onMouseDown={handleScrollMouseDown}
                    onMouseLeave={handleScrollMouseLeave}
                    onMouseUp={handleScrollMouseUp}
                    onMouseMove={handleScrollMouseMove}
                    onClick={handleScrollClick}
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
                                className="mt-auto w-full px-3 py-2 sm:px-4 sm:py-2.5"
                              >
                                <InlineEditableText
                                  value={product.buttonText}
                                  dataKey={`products.${product.id}.buttonText`}
                                  instanceId={block.instanceId}
                                  mode={mode}
                                  onUpdateContent={handleInlineContentUpdate}
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
                                className="my-1.5 w-[224px] min-w-[224px] sm:my-2 sm:w-[290px] sm:min-w-[290px] md:w-[310px] md:min-w-[310px]"
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
                                    className="aspect-[5/3] w-full sm:aspect-4/3"
                                  >
                                    {product.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.altText || product.name}
                                        className="w-full h-full object-cover rounded-[inherit]"
                                        draggable={false}
                                        loading="lazy"
                                        decoding="async"
                                      />
                                    ) : (
                                      <ImagePlaceholder>
                                        <PlaceholderIcon>
                                          <ImagePlaceholderIcon />
                                        </PlaceholderIcon>
                                        <span className="select-none px-2 text-center text-[10px] text-slate-400 sm:px-3 sm:text-[11px]">
                                          تصویر محصول
                                        </span>
                                      </ImagePlaceholder>
                                    )}

                                    {/* Badge */}
                                    {product.showBadge && product.badgeText && (
                                      <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                                        <EditablePart
                                          instanceId={block.instanceId}
                                          elementId="badge"
                                          mode={mode}
                                          selectedElementId={selectedElementId}
                                          onSelectElement={onSelectElement}
                                        >
                                          <StyledBadge
                                            $styleCss={badgeStyle}
                                            className="px-2 py-0.5 leading-tight sm:px-2.5 sm:py-1"
                                          >
                                            <InlineEditableText
                                              value={product.badgeText}
                                              dataKey={`products.${product.id}.badgeText`}
                                              instanceId={block.instanceId}
                                              mode={mode}
                                              onUpdateContent={handleInlineContentUpdate}
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
                                <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
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
                                        onUpdateContent={handleInlineContentUpdate}
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
                                        onUpdateContent={handleInlineContentUpdate}
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
                                          onUpdateContent={handleInlineContentUpdate}
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
                                              onUpdateContent={handleInlineContentUpdate}
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
                </EditablePart>
              )}
            </EditablePart>
          )}
        </ContentLayer>
      </StyledContainer>
    </EditablePart>
  );
}
