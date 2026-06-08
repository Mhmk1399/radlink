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

/* ================================================================== */
/*  Styled                                                             */
/* ================================================================== */

const ContactRoot = styled.div`
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

const StyledItem = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-item`)}
  ${(props) => props.$styleCss}
`;

const StyledButtonPrimary = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-btnpri`)}
  ${(props) => props.$styleCss}
`;

const StyledButtonSecondary = styled.a<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-btnsec`)}
  ${(props) => props.$styleCss}
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
}: {
  icon: React.ReactNode;
  label: string;
  href: string | undefined;
  isEditor: boolean;
  children: React.ReactNode;
}) {
  const Tag = !isEditor && href ? "a" : "div";

  return (
    <Tag
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
      className="flex w-full items-center gap-3 px-4 py-3.5 no-underline transition-opacity hover:opacity-80"
      style={{ cursor: isEditor ? "default" : href ? "pointer" : "default" }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] font-medium opacity-60">{label}</span>
        <span className="truncate font-semibold">{children}</span>
      </div>
    </Tag>
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

  const itemCss = responsiveStyleToCss(
    block.elements.item.style,
    `${PREFIX}-item`,
    { mobileOnly },
  );

  const btnPriCss = responsiveStyleToCss(
    block.elements.buttonPrimary.style,
    `${PREFIX}-btnpri`,
    { mobileOnly },
  );

  const btnSecCss = responsiveStyleToCss(
    block.elements.buttonSecondary.style,
    `${PREFIX}-btnsec`,
    { mobileOnly },
  );

  /* ── Helpers ── */
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
          className="flex flex-col gap-5 overflow-hidden px-5 py-7 sm:px-7"
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
              className="text-center font-bold leading-[1.5]"
              $styleCss={titleCss}
            >
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
                className="mx-auto max-w-[600px] text-center leading-[1.9]"
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

          {/* ── Contact Items ── */}
          {hasAnyItem && (
            <EditablePart
              instanceId={block.instanceId}
              elementId="item"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <div className="flex flex-col gap-2.5">
                {/* Phone */}
                {Boolean(block.data.showPhone) && phone && (
                  <StyledItem $styleCss={itemCss} className="overflow-hidden">
                    <ContactItemRow
                      icon={<PhoneIcon />}
                      label="تلفن"
                      href={phoneHref}
                      isEditor={isEditor}
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

                {/* WhatsApp */}
                {Boolean(block.data.showWhatsapp) && whatsapp && (
                  <StyledItem $styleCss={itemCss} className="overflow-hidden">
                    <ContactItemRow
                      icon={<WhatsappIcon />}
                      label="واتساپ"
                      href={whatsappHref}
                      isEditor={isEditor}
                    >
                      <span dir="ltr">{whatsapp}</span>
                    </ContactItemRow>
                  </StyledItem>
                )}

                {/* Email */}
                {Boolean(block.data.showEmail) && email && (
                  <StyledItem $styleCss={itemCss} className="overflow-hidden">
                    <ContactItemRow
                      icon={<EmailIcon />}
                      label="ایمیل"
                      href={emailHref}
                      isEditor={isEditor}
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

                {/* Address */}
                {Boolean(block.data.showAddress) && address && (
                  <StyledItem $styleCss={itemCss} className="overflow-hidden">
                    <ContactItemRow
                      icon={<AddressIcon />}
                      label="آدرس"
                      href={undefined}
                      isEditor={isEditor}
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
              </div>
            </EditablePart>
          )}

          {/* ── Buttons ── */}
          {Boolean(block.data.showButtons) && (
            <div className="flex flex-col items-stretch gap-2.5 pt-1 sm:flex-row sm:justify-center">
              {/* Primary */}
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
                  className="flex min-w-[120px] items-center justify-center gap-2 px-6 py-3 text-center font-semibold no-underline transition-opacity hover:opacity-90"
                >
                  <PhoneIcon />
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

              {/* Secondary */}
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
                  className="flex min-w-[160px] items-center justify-center gap-2 px-6 py-3 text-center font-semibold no-underline transition-opacity hover:opacity-90"
                >
                  <WhatsappIcon />
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
            </div>
          )}
        </StyledContainer>
      </EditablePart>
    </ContactRoot>
  );
}
