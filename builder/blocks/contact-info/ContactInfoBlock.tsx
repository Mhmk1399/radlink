"use client";

import React from "react";
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

const PREFIX = "cinfo";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type ContactInfoData = {
  title: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  showDescription: boolean;
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showButtons: boolean;
};

type ContactInfoBlockProps = BlockComponentProps & {
  block: PageBlock & { data: ContactInfoData };
};

type IconTone = "phone" | "whatsapp" | "email" | "address";

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const ContactRoot = styled.section`
  ${sharedBlockKeyframes(PREFIX)}
  position: relative;
`;

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}
  ${(props) => props.$styleCss}
  position: relative;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(15, 23, 42, 0.06);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        circle at top right,
        rgba(59, 130, 246, 0.05),
        transparent 28%
      ),
      radial-gradient(
        circle at bottom left,
        rgba(99, 102, 241, 0.04),
        transparent 30%
      );
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
  ${(props) => props.$styleCss}
  text-align: center;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: -0.02em;
`;
 

const StyledDescription = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-desc`)}
  ${(props) => props.$styleCss}
  text-align: center;
  line-height: 1.9;
`;

const ItemsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledItem = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-item`)}
  ${(props) => props.$styleCss}
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease,
    background-color 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 20px rgba(15, 23, 42, 0.06),
      0 2px 8px rgba(15, 23, 42, 0.04);
  }
`;

const ContactRow = styled.div<{ $interactive: boolean }>`
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  text-decoration: none;
  transition: opacity 0.2s ease;
  cursor: ${(props) => (props.$interactive ? "pointer" : "default")};

  &:hover {
    opacity: 0.92;
  }
`;

const IconShell = styled.span<{ $tone: IconTone }>`
  display: inline-flex;
  height: 44px;
  width: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);

  ${(props) => {
    switch (props.$tone) {
      case "phone":
        return `
          background: rgba(59, 130, 246, 0.12);
          color: #2563EB;
        `;
      case "whatsapp":
        return `
          background: rgba(34, 197, 94, 0.12);
          color: #16A34A;
        `;
      case "email":
        return `
          background: rgba(99, 102, 241, 0.12);
          color: #4F46E5;
        `;
      case "address":
      default:
        return `
          background: rgba(100, 116, 139, 0.12);
          color: #475569;
        `;
    }
  }}
`;

const ItemText = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

const ItemLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
`;

const ItemValue = styled.span`
  font-weight: 700;
  line-height: 1.7;
  color: inherit;
  word-break: break-word;
`;

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const ButtonBase = styled.a<{ $styleCss: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0.85rem 1.35rem;
  text-decoration: none;
  font-weight: 700;
  line-height: 1.2;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.25s ease;

  ${(props) => props.$styleCss}
`;

const StyledButtonPrimary = styled(ButtonBase)`
  ${sharedBlockKeyframes(`${PREFIX}-btnpri`)}
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 10px 20px rgba(15, 23, 42, 0.08);

  &:hover {
    transform: translateY(-1px);
    opacity: 0.98;
    box-shadow:
      0 6px 14px rgba(15, 23, 42, 0.12),
      0 2px 6px rgba(15, 23, 42, 0.08);
  }
`;

const StyledButtonSecondary = styled(ButtonBase)`
  ${sharedBlockKeyframes(`${PREFIX}-btnsec`)}
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

  &:hover {
    transform: translateY(-1px);
    opacity: 0.96;
    box-shadow:
      0 6px 14px rgba(15, 23, 42, 0.08),
      0 2px 6px rgba(15, 23, 42, 0.04);
  }
`;

const ButtonIconWrap = styled.span<{ $variant: "primary" | "secondary" }>`
  display: inline-flex;
  height: 28px;
  width: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  ${(props) =>
    props.$variant === "primary"
      ? `
        background: rgba(255, 255, 255, 0.14);
      `
      : `
        background: rgba(15, 23, 42, 0.06);
      `}
`;

/* ================================================================== */
/*  Icons (inline SVG — no library)                                    */
/* ================================================================== */

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

function AddressIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ================================================================== */
/*  Contact item wrapper                                               */
/* ================================================================== */

function ContactItemRow({
  icon,
  label,
  href,
  isEditor,
  children,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  href: string | undefined;
  isEditor: boolean;
  children: React.ReactNode;
  tone: IconTone;
}) {
  const Tag = !isEditor && href ? "a" : "div";

  return (
    <ContactRow
      as={Tag}
      $interactive={!isEditor && Boolean(href)}
      {...(!isEditor && href
        ? {
            href,
            target: href.startsWith("http") ? "_blank" : undefined,
            rel: href.startsWith("http") ? "noopener noreferrer" : undefined,
          }
        : {})}
      onClick={
        isEditor ? (e: React.MouseEvent) => e.preventDefault() : undefined
      }
    >
      <IconShell $tone={tone}>{icon}</IconShell>

      <ItemText>
        <ItemLabel>{label}</ItemLabel>
        <ItemValue>{children}</ItemValue>
      </ItemText>
    </ContactRow>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export function ContactInfoBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: ContactInfoBlockProps) {
  const data = block.data as ContactInfoData;
  const isEditor = mode === "editor";
  const mobileOnly = isEditor;

  const containerCss = responsiveStyleToCss(
    block.elements.container.style,
    `${PREFIX}-container`,
    { mobileOnly, effect: "surface" },
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

  const itemCss = responsiveStyleToCss(
    block.elements.item.style,
    `${PREFIX}-item`,
    { mobileOnly, effect: "card" },
  );

  const btnPriCss = responsiveStyleToCss(
    block.elements.buttonPrimary.style,
    `${PREFIX}-btnpri`,
    { mobileOnly, effect: "button" },
  );

  const btnSecCss = responsiveStyleToCss(
    block.elements.buttonSecondary.style,
    `${PREFIX}-btnsec`,
    { mobileOnly, effect: "button" },
  );

  const phone = String(block.data.phone ?? "").trim();
  const whatsapp = String(block.data.whatsapp ?? "").trim();
  const email = String(block.data.email ?? "").trim();
  const address = String(block.data.address ?? "").trim();

  const phoneHref = phone ? `tel:${phone}` : undefined;
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp}` : undefined;
  const emailHref = email ? `mailto:${email}` : undefined;

  const hasAnyItem =
    (Boolean(block.data.showPhone) && phone) ||
    (Boolean(block.data.showWhatsapp) && whatsapp) ||
    (Boolean(block.data.showEmail) && email) ||
    (Boolean(block.data.showAddress) && address);

  return (
    <ContactRoot dir="rtl">
      <EditablePart
        instanceId={block.instanceId}
        elementId="container"
        mode={mode}
        selectedElementId={selectedElementId}
        onSelectElement={onSelectElement}
      >
        <StyledContainer
          dir="rtl"
          className="px-5 py-6 sm:px-7 sm:py-8"
          $styleCss={containerCss}
        >
          <ContentLayer className="flex flex-col gap-6">
            {/* Title */}
            <HeaderStack>
              <EditablePart
                instanceId={block.instanceId}
                elementId="title"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledTitle $styleCss={titleCss}>
                  <InlineEditableText
                    value={String(block.data.title ?? "")}
                    dataKey="title"
                    instanceId={block.instanceId}
                    mode={mode}
                    onUpdateContent={onUpdateContent}
                  >
                    {(text) => <h3 className="m-0">{text}</h3>}
                  </InlineEditableText>
                </StyledTitle>
              </EditablePart>

             </HeaderStack>

            {/* Description */}
            {Boolean(block.data.showDescription) && (
              <EditablePart
                instanceId={block.instanceId}
                elementId="description"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledDescription
                  className="mx-auto max-w-[640px]"
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

            {/* Contact Items */}
            {hasAnyItem && (
              <EditablePart
                instanceId={block.instanceId}
                elementId="item"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <ItemsStack>
                  {Boolean(block.data.showPhone) && phone && (
                    <StyledItem $styleCss={itemCss}>
                      <ContactItemRow
                        icon={<PhoneIcon />}
                        label="تلفن"
                        href={phoneHref}
                        isEditor={isEditor}
                        tone="phone"
                      >
                        <InlineEditableText
                          value={String(block.data.phone ?? "")}
                          dataKey="phone"
                          instanceId={block.instanceId}
                          mode={mode}
                          onUpdateContent={onUpdateContent}
                        >
                          {(text) => <span dir="ltr">{text}</span>}
                        </InlineEditableText>
                      </ContactItemRow>
                    </StyledItem>
                  )}

                  {Boolean(block.data.showWhatsapp) && whatsapp && (
                    <StyledItem $styleCss={itemCss}>
                      <ContactItemRow
                        icon={<WhatsappIcon />}
                        label="واتساپ"
                        href={whatsappHref}
                        isEditor={isEditor}
                        tone="whatsapp"
                      >
                        <span dir="ltr">{whatsapp}</span>
                      </ContactItemRow>
                    </StyledItem>
                  )}

                  {Boolean(block.data.showEmail) && email && (
                    <StyledItem $styleCss={itemCss}>
                      <ContactItemRow
                        icon={<EmailIcon />}
                        label="ایمیل"
                        href={emailHref}
                        isEditor={isEditor}
                        tone="email"
                      >
                        <InlineEditableText
                          value={String(block.data.email ?? "")}
                          dataKey="email"
                          instanceId={block.instanceId}
                          mode={mode}
                          onUpdateContent={onUpdateContent}
                        >
                          {(text) => <span dir="ltr">{text}</span>}
                        </InlineEditableText>
                      </ContactItemRow>
                    </StyledItem>
                  )}

                  {Boolean(block.data.showAddress) && address && (
                    <StyledItem $styleCss={itemCss}>
                      <ContactItemRow
                        icon={<AddressIcon />}
                        label="آدرس"
                        href={undefined}
                        isEditor={isEditor}
                        tone="address"
                      >
                        <InlineEditableText
                          value={String(block.data.address ?? "")}
                          dataKey="address"
                          instanceId={block.instanceId}
                          mode={mode}
                          multiline
                          onUpdateContent={onUpdateContent}
                        >
                          {(text) => <span>{text}</span>}
                        </InlineEditableText>
                      </ContactItemRow>
                    </StyledItem>
                  )}
                </ItemsStack>
              </EditablePart>
            )}

            {/* Buttons */}
            {Boolean(block.data.showButtons) && (
              <ButtonsRow>
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="buttonPrimary"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledButtonPrimary
                    $styleCss={btnPriCss}
                    href={!isEditor && phone ? `tel:${phone}` : undefined}
                    onClick={(e) => {
                      if (isEditor) e.preventDefault();
                    }}
                    className="min-w-[140px] justify-center no-underline"
                  >
                    <ButtonIconWrap $variant="primary">
                      <PhoneIcon />
                    </ButtonIconWrap>

                    <InlineEditableText
                      value={String(block.data.primaryButtonText ?? "")}
                      dataKey="primaryButtonText"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <span>{text}</span>}
                    </InlineEditableText>
                  </StyledButtonPrimary>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="buttonSecondary"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledButtonSecondary
                    $styleCss={btnSecCss}
                    href={
                      !isEditor && whatsapp
                        ? `https://wa.me/${whatsapp}`
                        : undefined
                    }
                    target={!isEditor && whatsapp ? "_blank" : undefined}
                    rel={
                      !isEditor && whatsapp ? "noopener noreferrer" : undefined
                    }
                    onClick={(e) => {
                      if (isEditor) e.preventDefault();
                    }}
                    className="min-w-[160px] justify-center no-underline"
                  >
                    <ButtonIconWrap $variant="secondary">
                      <WhatsappIcon />
                    </ButtonIconWrap>

                    <InlineEditableText
                      value={String(block.data.secondaryButtonText ?? "")}
                      dataKey="secondaryButtonText"
                      instanceId={block.instanceId}
                      mode={mode}
                      onUpdateContent={onUpdateContent}
                    >
                      {(text) => <span>{text}</span>}
                    </InlineEditableText>
                  </StyledButtonSecondary>
                </EditablePart>
              </ButtonsRow>
            )}
          </ContentLayer>
        </StyledContainer>
      </EditablePart>
    </ContactRoot>
  );
}
