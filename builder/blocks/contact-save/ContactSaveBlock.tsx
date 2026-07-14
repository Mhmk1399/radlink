"use client";

import styled from "styled-components";
import { HiOutlineUserPlus } from "react-icons/hi2";

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

export type ContactSaveData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  url: string;
  organization: string;
  photoUrl: string;
  buttonText: string;
  showIcon: boolean;
};

const DEFAULT_DATA: ContactSaveData = {
  firstName: "علی",
  lastName: "محمدی",
  phoneNumber: "09120000000",
  email: "",
  address: "",
  url: "",
  organization: "",
  photoUrl: "",
  buttonText: "ذخیره در مخاطبین",
  showIcon: true,
};

const PREFIX = "contact-save";

const Root = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(PREFIX)}
  width: 100%;
  ${(props) => props.$styleCss}
`;

const SaveButton = styled.a<{ $styleCss: string; $disabled: boolean }>`
  ${sharedBlockKeyframes(`${PREFIX}-button`)}
  display: inline-flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.55 : 1)};
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-1px)")};
  }

  ${(props) => props.$styleCss}
`;

const IconBox = styled.span<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-icon`)}
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  ${(props) => props.$styleCss}
`;

const ContactPhoto = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export function getContactSaveData(block: PageBlock): ContactSaveData {
  const raw = block.data as Partial<ContactSaveData>;

  return {
    firstName:
      typeof raw.firstName === "string"
        ? raw.firstName
        : DEFAULT_DATA.firstName,
    lastName:
      typeof raw.lastName === "string" ? raw.lastName : DEFAULT_DATA.lastName,
    phoneNumber:
      typeof raw.phoneNumber === "string"
        ? raw.phoneNumber
        : DEFAULT_DATA.phoneNumber,
    email: typeof raw.email === "string" ? raw.email : DEFAULT_DATA.email,
    address:
      typeof raw.address === "string" ? raw.address : DEFAULT_DATA.address,
    url: typeof raw.url === "string" ? raw.url : DEFAULT_DATA.url,
    organization:
      typeof raw.organization === "string"
        ? raw.organization
        : DEFAULT_DATA.organization,
    photoUrl:
      typeof raw.photoUrl === "string" ? raw.photoUrl : DEFAULT_DATA.photoUrl,
    buttonText:
      typeof raw.buttonText === "string"
        ? raw.buttonText
        : DEFAULT_DATA.buttonText,
    showIcon:
      typeof raw.showIcon === "boolean" ? raw.showIcon : DEFAULT_DATA.showIcon,
  };
}

function escapeVCardValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function normalizePhoneNumber(value: string) {
  const trimmed = value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return `${hasLeadingPlus ? "+" : ""}${digits}`;
}

function normalizeEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) ? trimmed : "";
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function buildVCard(data: ContactSaveData) {
  const firstName = escapeVCardValue(data.firstName.trim());
  const lastName = escapeVCardValue(data.lastName.trim());
  const fullName =
    escapeVCardValue(
      [data.firstName.trim(), data.lastName.trim()].filter(Boolean).join(" "),
    ) || "Contact";
  const organization = escapeVCardValue(data.organization.trim());
  const phoneNumber = normalizePhoneNumber(data.phoneNumber);
  const email = normalizeEmail(data.email);
  const address = data.address.trim();
  const url = normalizeUrl(data.url);
  const photoUrl = normalizeUrl(data.photoUrl);

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N;CHARSET=UTF-8:${lastName};${firstName};;;`,
    `FN;CHARSET=UTF-8:${fullName}`,
  ];

  if (organization) lines.push(`ORG;CHARSET=UTF-8:${organization}`);
  if (phoneNumber) lines.push(`TEL;TYPE=CELL,VOICE:${phoneNumber}`);
  if (email) lines.push(`EMAIL;TYPE=INTERNET,HOME:${email}`);
  if (url) lines.push(`URL:${url}`);
  if (photoUrl) lines.push(`PHOTO;VALUE=URI:${escapeVCardValue(photoUrl)}`);
  if (address)
    lines.push(
      `ADR;TYPE=HOME;CHARSET=UTF-8:;;${escapeVCardValue(address)};;;;`,
    );

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

export function buildVCardHref(data: ContactSaveData) {
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(buildVCard(data))}`;
}

export function buildVCardFileName(data: ContactSaveData) {
  const name =
    [data.firstName, data.lastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join("-") || "contact";

  const safeName = name.replace(/[\\/:*?"<>|]/g, "-");
  return `${safeName}.vcf`;
}

export function ContactSaveBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = getContactSaveData(block);
  const isEditor = mode === "editor";
  const mobileOnly = isEditor;
  const hasPhoneNumber = Boolean(normalizePhoneNumber(data.phoneNumber));
  const photoUrl = normalizeUrl(data.photoUrl);
  const disabled = isEditor || !hasPhoneNumber;
  const direction = block.settings.direction === "ltr" ? "ltr" : "rtl";

  const containerCss = responsiveStyleToCss(
    block.elements.container.style,
    `${PREFIX}-container`,
    { mobileOnly, effect: "surface" },
  );
  const buttonCss = responsiveStyleToCss(
    block.elements.button.style,
    `${PREFIX}-button`,
    { mobileOnly, effect: "button" },
  );
  const iconCss = responsiveStyleToCss(
    block.elements.icon.style,
    `${PREFIX}-icon`,
    { mobileOnly, effect: "tap" },
  );

  return (
    <EditablePart
      instanceId={block.instanceId}
      elementId="container"
      mode={mode}
      selectedElementId={selectedElementId}
      onSelectElement={onSelectElement}
    >
      <Root dir={direction} className="p-2" $styleCss={containerCss}>
        <EditablePart
          instanceId={block.instanceId}
          elementId="button"
          mode={mode}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
        >
          <SaveButton
            dir={direction}
            href={disabled ? undefined : buildVCardHref(data)}
            download={disabled ? undefined : buildVCardFileName(data)}
            target={disabled ? undefined : "_blank"}
            rel={disabled ? undefined : "noopener noreferrer"}
            aria-disabled={disabled}
            title={
              hasPhoneNumber
                ? "ذخیره مخاطب در تلفن همراه"
                : "ابتدا شماره همراه را وارد کنید"
            }
            onClick={(event) => {
              if (disabled) event.preventDefault();
            }}
            $disabled={disabled}
            $styleCss={buttonCss}
          >
            {data.showIcon && (
              <EditablePart
                instanceId={block.instanceId}
                elementId="icon"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <IconBox $styleCss={iconCss}>
                  {photoUrl ? (
                    <ContactPhoto src={photoUrl} alt="" draggable={false} />
                  ) : (
                    <HiOutlineUserPlus className="h-5 w-5" />
                  )}
                </IconBox>
              </EditablePart>
            )}

            <InlineEditableText
              value={data.buttonText}
              dataKey="buttonText"
              instanceId={block.instanceId}
              mode={mode}
              onUpdateContent={onUpdateContent}
            >
              {(text) => <span>{text}</span>}
            </InlineEditableText>
          </SaveButton>
        </EditablePart>
      </Root>
    </EditablePart>
  );
}

export default ContactSaveBlock;
