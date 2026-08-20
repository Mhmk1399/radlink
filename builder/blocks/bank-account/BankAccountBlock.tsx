"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";

import {
  FaBuildingColumns,
  FaCheck,
  FaCopy,
  FaCreditCard,
  FaHashtag,
  FaUser,
} from "react-icons/fa6";

import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";

import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";

import type { BlockComponentProps } from "@/types/blocks/builder.types";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const PREFIX = "bank-account";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type BankAccountData = {
  holderName: string;
  bankName: string;

  cardNumber: string;
  shebaNumber: string;
  accountNumber: string;

  showHolderName: boolean;
  showBankName: boolean;
};

type CopyField = "card" | "sheba" | "account" | null;

/* ================================================================== */
/*  Styled Components                                                  */
/* ================================================================== */

const StyledContainer = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-container`)}

  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;

  ${({ $styleCss }) => $styleCss}
`;

const StyledOwner = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-owner`)}
  display: flex;
  flex-direction: column;
  gap: 3px;

  ${({ $styleCss }) => $styleCss}
`;

const StyledOwnerRow = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-holder`)}
  ${sharedBlockKeyframes(`${PREFIX}-bank`)}

  ${({ $styleCss }) => $styleCss}
`;

const StyledItem = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-item`)}
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 12px;

  ${({ $styleCss }) => $styleCss}
`;

const StyledIcon = styled.div<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-icon`)}
  width: 42px;
  height: 42px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $styleCss }) => $styleCss}
`;

const StyledLabel = styled.span<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-label`)}
  display: block;
  line-height: 1.4;

  ${({ $styleCss }) => $styleCss}
`;

const StyledValue = styled.span<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-value`)}
  ${sharedBlockKeyframes(`${PREFIX}-card`)}
  ${sharedBlockKeyframes(`${PREFIX}-sheba`)}
  ${sharedBlockKeyframes(`${PREFIX}-account`)}
  display: block;
  direction: ltr;
  text-align: left;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  word-break: break-word;

  ${({ $styleCss }) => $styleCss}
`;

const StyledCopyButton = styled.button<{ $styleCss: string }>`
  ${sharedBlockKeyframes(`${PREFIX}-copy`)}
  flex-shrink: 0;
  width: 38px;
  height: 38px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    opacity 0.15s ease;

  &:hover {
    opacity: 0.82;
  }

  &:active {
    transform: scale(0.94);
  }

  ${({ $styleCss }) => $styleCss}
`;

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function normalizeNumericValue(value: string): string {
  return normalizeDigits(value).replace(/\D/g, "");
}

function normalizeCardNumber(value: string): string {
  return normalizeNumericValue(value).slice(0, 16);
}

function normalizeAccountNumber(value: string): string {
  return normalizeNumericValue(value);
}

function normalizeSheba(value: string): string {
  const normalized = normalizeDigits(value)
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  const withoutIR = normalized.replace(/^IR/, "").replace(/\D/g, "");

  return `IR${withoutIR.slice(0, 24)}`;
}

function groupByFour(value: string): string {
  return value.match(/.{1,4}/g)?.join(" ") ?? value;
}

function formatCardNumber(value: string): string {
  return groupByFour(normalizeCardNumber(value));
}

function formatAccountNumber(value: string): string {
  return groupByFour(normalizeAccountNumber(value));
}

function formatSheba(value: string): string {
  const normalized = normalizeSheba(value);

  return normalized.match(/.{1,4}/g)?.join(" ") ?? normalized;
}

function isCardComplete(value: string): boolean {
  return normalizeCardNumber(value).length === 16;
}

function isShebaComplete(value: string): boolean {
  return /^IR\d{24}$/.test(normalizeSheba(value));
}

async function copyToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");

  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  document.execCommand("copy");

  document.body.removeChild(textarea);
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export function BankAccountBlock({
  block,
  mode = "public",
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = block.data as Partial<BankAccountData>;
  const elements = block.elements ?? {};

  const isEditor = mode === "editor";

  const [copiedField, setCopiedField] = useState<CopyField>(null);

  /* ---------------------------------------------------------------- */
  /* Data                                                              */
  /* ---------------------------------------------------------------- */

  const holderName = typeof data.holderName === "string" ? data.holderName : "";

  const bankName = typeof data.bankName === "string" ? data.bankName : "";

  const rawCard = typeof data.cardNumber === "string" ? data.cardNumber : "";

  const rawSheba = typeof data.shebaNumber === "string" ? data.shebaNumber : "";

  const rawAccount =
    typeof data.accountNumber === "string" ? data.accountNumber : "";

  const showHolderName = data.showHolderName !== false;
  const showBankName = data.showBankName !== false;

  const cardNumber = normalizeCardNumber(rawCard);
  const shebaNumber = rawSheba.trim() ? normalizeSheba(rawSheba) : "";
  const accountNumber = normalizeAccountNumber(rawAccount);

  const hasCard = cardNumber.length > 0;
  const hasSheba = shebaNumber.length > 2;
  const hasAccount = accountNumber.length > 0;

  const hasAnyBankValue = hasCard || hasSheba || hasAccount;

  /* ---------------------------------------------------------------- */
  /* Styles                                                            */
  /* ---------------------------------------------------------------- */

  const containerCss = useMemo(
    () =>
      responsiveStyleToCss(elements.container?.style, `${PREFIX}-container`),
    [elements.container?.style],
  );

  const ownerCss = useMemo(
    () => responsiveStyleToCss(elements.ownerName?.style, `${PREFIX}-owner`),
    [elements.ownerName?.style],
  );

  const holderNameCss = useMemo(
    () => responsiveStyleToCss(elements.holderName?.style, `${PREFIX}-holder`),
    [elements.holderName?.style],
  );

  const bankNameCss = useMemo(
    () => responsiveStyleToCss(elements.bankName?.style, `${PREFIX}-bank`),
    [elements.bankName?.style],
  );

  const itemCss = useMemo(
    () => responsiveStyleToCss(elements.item?.style, `${PREFIX}-item`),
    [elements.item?.style],
  );

  const cardNumberCss = useMemo(
    () => responsiveStyleToCss(elements.cardNumber?.style, `${PREFIX}-card`),
    [elements.cardNumber?.style],
  );

  const shebaNumberCss = useMemo(
    () => responsiveStyleToCss(elements.shebaNumber?.style, `${PREFIX}-sheba`),
    [elements.shebaNumber?.style],
  );

  const accountNumberCss = useMemo(
    () =>
      responsiveStyleToCss(elements.accountNumber?.style, `${PREFIX}-account`),
    [elements.accountNumber?.style],
  );

  const iconCss = useMemo(
    () => responsiveStyleToCss(elements.icon?.style, `${PREFIX}-icon`),
    [elements.icon?.style],
  );

  const labelCss = useMemo(
    () => responsiveStyleToCss(elements.label?.style, `${PREFIX}-label`),
    [elements.label?.style],
  );

  const valueCss = useMemo(
    () => responsiveStyleToCss(elements.value?.style, `${PREFIX}-value`),
    [elements.value?.style],
  );

  const copyButtonCss = useMemo(
    () => responsiveStyleToCss(elements.copyButton?.style, `${PREFIX}-copy`),
    [elements.copyButton?.style],
  );

  /* ---------------------------------------------------------------- */
  /* Copy                                                              */
  /* ---------------------------------------------------------------- */

  const handleCopy = async (field: Exclude<CopyField, null>, value: string) => {
    if (!value) return;

    try {
      await copyToClipboard(value);

      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 1400);
    } catch {
      // Copy failure should not crash the block.
    }
  };

  /* ---------------------------------------------------------------- */
  /* Empty block                                                       */
  /* ---------------------------------------------------------------- */

  if (!hasAnyBankValue && !holderName && !bankName) {
    if (!isEditor) return null;

    return (
      <StyledContainer $styleCss={containerCss} dir="rtl">
        <div className="py-6 text-center text-xs text-neutral-400">
          اطلاعات بانکی را از فرم ویرایش وارد کنید
        </div>
      </StyledContainer>
    );
  }

  return (
    <EditablePart
      instanceId={block.instanceId}
      elementId="container"
      mode={mode}
      selectedElementId={selectedElementId}
      onSelectElement={onSelectElement}
    >
      <StyledContainer
        $styleCss={containerCss}
        dir={block.settings?.direction ?? "rtl"}
      >
        {/* Holder / Bank */}
        {((showHolderName && holderName) || (showBankName && bankName)) && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="ownerName"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledOwner $styleCss={ownerCss}>
              {showHolderName && holderName && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="holderName"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledOwnerRow $styleCss={holderNameCss}>
                    <div className="flex items-center gap-2">
                      <FaUser size={13} />

                      <InlineEditableText
                        value={holderName}
                        dataKey="holderName"
                        instanceId={block.instanceId}
                        mode={mode}
                        onUpdateContent={onUpdateContent}
                      >
                        {(text) => <span>{text}</span>}
                      </InlineEditableText>
                    </div>
                  </StyledOwnerRow>
                </EditablePart>
              )}

              {showBankName && bankName && (
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="bankName"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledOwnerRow $styleCss={bankNameCss}>
                    <div className="flex items-center gap-2">
                      <FaBuildingColumns size={13} />

                      <InlineEditableText
                        value={bankName}
                        dataKey="bankName"
                        instanceId={block.instanceId}
                        mode={mode}
                        onUpdateContent={onUpdateContent}
                      >
                        {(text) => <span>{text}</span>}
                      </InlineEditableText>
                    </div>
                  </StyledOwnerRow>
                </EditablePart>
              )}
            </StyledOwner>
          </EditablePart>
        )}

        {/* Card */}
        {hasCard && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="item"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledItem $styleCss={itemCss}>
              <EditablePart
                instanceId={block.instanceId}
                elementId="icon"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledIcon $styleCss={iconCss}>
                  <FaCreditCard />
                </StyledIcon>
              </EditablePart>

              <div className="min-w-0 flex-1">
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="label"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledLabel $styleCss={labelCss}>شماره کارت</StyledLabel>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="cardNumber"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledValue $styleCss={`${valueCss}${cardNumberCss}`}>
                    {formatCardNumber(cardNumber)}
                  </StyledValue>
                </EditablePart>

                {isEditor && !isCardComplete(cardNumber) && (
                  <span className="mt-1 block text-[10px] text-red-500">
                    شماره کارت باید دقیقاً ۱۶ رقم باشد
                  </span>
                )}
              </div>

              <EditablePart
                instanceId={block.instanceId}
                elementId="copyButton"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledCopyButton
                  type="button"
                  $styleCss={copyButtonCss}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    void handleCopy("card", cardNumber);
                  }}
                  aria-label="کپی شماره کارت"
                  title="کپی شماره کارت"
                >
                  {copiedField === "card" ? <FaCheck /> : <FaCopy />}
                </StyledCopyButton>
              </EditablePart>
            </StyledItem>
          </EditablePart>
        )}

        {/* Sheba */}
        {hasSheba && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="item"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledItem $styleCss={itemCss}>
              <EditablePart
                instanceId={block.instanceId}
                elementId="icon"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledIcon $styleCss={iconCss}>
                  <FaBuildingColumns />
                </StyledIcon>
              </EditablePart>

              <div className="min-w-0 flex-1">
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="label"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledLabel $styleCss={labelCss}>شماره شبا</StyledLabel>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="shebaNumber"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledValue $styleCss={`${valueCss}${shebaNumberCss}`}>
                    {formatSheba(shebaNumber)}
                  </StyledValue>
                </EditablePart>

                {isEditor && !isShebaComplete(shebaNumber) && (
                  <span className="mt-1 block text-[10px] text-red-500">
                    شماره شبا باید IR به همراه ۲۴ رقم باشد
                  </span>
                )}
              </div>

              <EditablePart
                instanceId={block.instanceId}
                elementId="copyButton"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledCopyButton
                  type="button"
                  $styleCss={copyButtonCss}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    void handleCopy("sheba", shebaNumber);
                  }}
                  aria-label="کپی شماره شبا"
                  title="کپی شماره شبا"
                >
                  {copiedField === "sheba" ? <FaCheck /> : <FaCopy />}
                </StyledCopyButton>
              </EditablePart>
            </StyledItem>
          </EditablePart>
        )}

        {/* Account */}
        {hasAccount && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="item"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledItem $styleCss={itemCss}>
              <EditablePart
                instanceId={block.instanceId}
                elementId="icon"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledIcon $styleCss={iconCss}>
                  <FaHashtag />
                </StyledIcon>
              </EditablePart>

              <div className="min-w-0 flex-1">
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="label"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledLabel $styleCss={labelCss}>شماره حساب</StyledLabel>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="accountNumber"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledValue $styleCss={`${valueCss}${accountNumberCss}`}>
                    {formatAccountNumber(accountNumber)}
                  </StyledValue>
                </EditablePart>
              </div>

              <EditablePart
                instanceId={block.instanceId}
                elementId="copyButton"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledCopyButton
                  type="button"
                  $styleCss={copyButtonCss}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    void handleCopy("account", accountNumber);
                  }}
                  aria-label="کپی شماره حساب"
                  title="کپی شماره حساب"
                >
                  {copiedField === "account" ? <FaCheck /> : <FaCopy />}
                </StyledCopyButton>
              </EditablePart>
            </StyledItem>
          </EditablePart>
        )}
      </StyledContainer>
    </EditablePart>
  );
}

export default BankAccountBlock;
