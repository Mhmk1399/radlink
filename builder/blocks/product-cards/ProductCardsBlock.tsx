"use client";

 import styled from "styled-components";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";

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

// ─── Styled Components ──────────────────────────────────────────────────────────

const PREFIX = "product-cards-block";

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(PREFIX)}
  ${({ $styleCss }) => $styleCss}
  transition: background-color 0.2s ease, border-color 0.2s ease;
`;

const StyledTitle = styled.h2<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledScrollArea = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 999px;
  }
`;

const StyledCard = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  flex-shrink: 0;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
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

const StyledBadge = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-block;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledProductName = styled.h3<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledProductDescription = styled.p<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  margin: 0;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledPrice = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-block;
  font-weight: 700;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledOldPrice = styled.span<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: inline-block;
  text-decoration: line-through;
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
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    font-size 0.2s ease,
    transform 0.15s ease;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
  }
`;

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
        {/* Section title */}
        {showTitle && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="title"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledTitle $styleCss={titleStyle} className="mb-2 font-bold">
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
          </EditablePart>
        )}

        {/* Section description */}
        {showDescription && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="description"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledDescription $styleCss={descriptionStyle} className="mb-6">
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
        <br />

        {/* Empty state */}
        {products.length === 0 && isEditor && (
          <p className="text-center text-sm text-gray-400 py-8">
            هنوز محصولی اضافه نشده است.
          </p>
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
            <StyledScrollArea
              $styleCss={scrollAreaStyle}
              className="gap-4 pb-2"
            >
              {products.map((product) => {
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
                      className="w-[260px] min-w-[260px] sm:w-[290px] sm:min-w-[290px] md:w-[310px] md:min-w-[310px]"
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
                          className="w-full aspect-[4/3]"
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.altText || product.name}
                              className="w-full h-full object-cover rounded-[inherit]"
                              draggable={false}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-[inherit]">
                              <span className="text-xs text-gray-400 select-none px-3 text-center">
                                تصویر محصول را وارد کنید
                              </span>
                            </div>
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
                        <div className="flex items-center gap-2 flex-wrap mt-1">
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

                          {product.showOldPrice && product.oldPrice && (
                            <EditablePart
                              instanceId={block.instanceId}
                              elementId="oldPrice"
                              mode={mode}
                              selectedElementId={selectedElementId}
                              onSelectElement={onSelectElement}
                            >
                              <StyledOldPrice $styleCss={oldPriceStyle}>
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
                        </div>

                        {/* Button */}
                        {showButtons && (
                          <>
                            {isEditor || !hasUrl ? (
                              <div className="mt-auto pt-2">{buttonEl}</div>
                            ) : (
                              <a
                                href={product.productUrl}
                                target={openInNewTab ? "_blank" : undefined}
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
      </StyledContainer>
    </EditablePart>
  );
}
