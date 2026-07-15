"use client";

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import jalaali from "jalaali-js";
import { EditablePart } from "@/builder/blocks/shared/EditablePart";
import { InlineEditableText } from "@/builder/blocks/shared/InlineEditableText";
import {
  responsiveStyleToCss,
  sharedBlockKeyframes,
} from "@/builder/blocks/shared/responsiveStyleToCss";
import type { BlockComponentProps } from "@/types/blocks/builder.types";
import { PersianDateTimePicker } from "@/builder/editor/form/PersianDateTimePicker";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  selectedDate: string;
  selectedTime: string;
  note: string;
};

type FieldErrors = Record<string, string | undefined>;

type BookingCustomField = {
  id: string;
  key: string;
  label: string;
  value: string;
  required: boolean;
  enabled: boolean;
};

type FeedbackState = {
  type: "success" | "error";
  text: string;
} | null;

const PREFIX = "booking-form-block";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function padTwo(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function normalizeDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .split("")
    .map((char) => {
      const faIndex = persianDigits.indexOf(char);
      if (faIndex >= 0) return `${faIndex}`;

      const arIndex = arabicDigits.indexOf(char);
      if (arIndex >= 0) return `${arIndex}`;

      return char;
    })
    .join("");
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateKeys(date: Date): string[] {
  const gregorianDash = `${date.getFullYear()}-${padTwo(
    date.getMonth() + 1,
  )}-${padTwo(date.getDate())}`;
  const gregorianSlash = `${date.getFullYear()}/${padTwo(
    date.getMonth() + 1,
  )}/${padTwo(date.getDate())}`;

  const j = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  const jalaliDash = `${j.jy}-${padTwo(j.jm)}-${padTwo(j.jd)}`;
  const jalaliSlash = `${j.jy}/${padTwo(j.jm)}/${padTwo(j.jd)}`;

  return [gregorianDash, gregorianSlash, jalaliDash, jalaliSlash];
}

function parseConstraintDate(rawValue: string): Date | null {
  const value = normalizeDigits(rawValue.trim());

  if (!value) return null;

  const match = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      return null;
    }

    if (year < 1700) {
      try {
        const g = jalaali.toGregorian(year, month, day);
        return new Date(g.gy, g.gm - 1, g.gd);
      } catch {
        return null;
      }
    }

    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return startOfDay(parsed);
}

function parseTimeParts(
  time: string,
): { hours: number; minutes: number } | null {
  const normalized = normalizeDigits(time.trim());
  const match = normalized.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
}

function combineDateWithSelectedTime(
  dateValue: string,
  selectedTime: string,
): string {
  if (!dateValue) return "";

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  const nextDate = new Date(parsedDate);

  const timeParts = parseTimeParts(selectedTime);
  if (timeParts) {
    nextDate.setHours(timeParts.hours, timeParts.minutes, 0, 0);
  }

  return nextDate.toISOString();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function normalizeCustomFields(value: unknown): BookingCustomField[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item, index) => {
      const key = getText(item.key).trim();
      const label = getText(item.label).trim();
      const id =
        getText(item.id).trim() ||
        key ||
        label ||
        `custom-field-${index + 1}`;

      return {
        id,
        key,
        label,
        value: getText(item.value),
        required: item.required === true,
        enabled: item.enabled !== false,
      };
    })
    .filter((item) => item.enabled && (item.key || item.label));
}

function getCurrentPageSlug(): string {
  if (typeof window === "undefined") return "";

  try {
    return decodeURIComponent(
      window.location.pathname.split("/").filter(Boolean)[0] ?? "",
    );
  } catch {
    return window.location.pathname.split("/").filter(Boolean)[0] ?? "";
  }
}

// ─── Styled Components ──────────────────────────────────────────────────────────

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

const StyledForm = styled.form<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  transition: background-color 0.2s ease, border-color 0.2s ease;
`;

const StyledFieldLabel = styled.label<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  display: block;
  transition:
    color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledInput = styled.input<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  width: 100%;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    font-size 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
  }
`;

const StyledCalendarWrap = styled.div<{ $styleCss: string }>`
  ${({ $styleCss }) => $styleCss}
  position: relative;
  z-index: 30;
  overflow: visible;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease,
    font-size 0.2s ease;
`;

const StyledTimeSlot = styled.button<{ $styleCss: string; $isActive: boolean }>`
  ${({ $styleCss }) => $styleCss}
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
  box-shadow: ${({ $isActive }) =>
    $isActive ? "inset 0 0 0 2px rgba(17, 24, 39, 0.85)" : "none"};
  transform: ${({ $isActive }) => ($isActive ? "translateY(-1px)" : "none")};

  &:hover {
    transform: translateY(-1px);
  }
`;

const StyledSubmitButton = styled.button<{
  $styleCss: string;
  $isLoading: boolean;
}>`
  ${({ $styleCss }) => $styleCss}
  cursor: ${({ $isLoading }) => ($isLoading ? "not-allowed" : "pointer")};
  opacity: ${({ $isLoading }) => ($isLoading ? 0.7 : 1)};
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    font-size 0.2s ease,
    transform 0.15s ease;

  &:hover {
    transform: ${({ $isLoading }) =>
      $isLoading ? "none" : "translateY(-1px)"};
  }
`;

const StyledMessage = styled.div<{ $styleCss: string; $isError: boolean }>`
  ${({ $styleCss }) => $styleCss}
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease,
    font-size 0.2s ease;

  ${({ $isError }) =>
    $isError
      ? `
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #b91c1c;
      `
      : ""}
`;

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BookingFormBlock({
  block,
  mode,
  selectedElementId,
  onSelectElement,
  onUpdateContent,
}: BlockComponentProps) {
  const data = block.data as Record<string, unknown>;
  const elements = block.elements ?? {};
  const isEditor = mode === "editor";

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
  const formStyle = responsiveStyleToCss(elements.form?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
    effect: "none",
  });
  const fieldLabelStyle = responsiveStyleToCss(
    elements.fieldLabel?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );
  const inputStyle = responsiveStyleToCss(elements.input?.style ?? {}, PREFIX, {
    mobileOnly: mode === "editor",
  });
  const calendarStyle = responsiveStyleToCss(
    elements.calendar?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor", effect: "none" },
  );
  const timeSlotStyle = responsiveStyleToCss(
    elements.timeSlot?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor", effect: "button" },
  );
  const submitButtonStyle = responsiveStyleToCss(
    elements.submitButton?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor", effect: "button" },
  );
  const messageStyle = responsiveStyleToCss(
    elements.message?.style ?? {},
    PREFIX,
    { mobileOnly: mode === "editor" },
  );

  const title = typeof data.title === "string" ? data.title : "";
  const description =
    typeof data.description === "string" ? data.description : "";
  const submitButtonText =
    typeof data.submitButtonText === "string"
      ? data.submitButtonText
      : "ثبت رزرو";
  const successMessage =
    typeof data.successMessage === "string"
      ? data.successMessage
      : "درخواست رزرو شما با موفقیت ثبت شد.";
  const errorMessage =
    typeof data.errorMessage === "string"
      ? data.errorMessage
      : "ثبت رزرو انجام نشد. لطفاً دوباره تلاش کنید.";
  const endpointUrl =
    typeof data.endpointUrl === "string" ? data.endpointUrl : "";

  const showDescription = data.showDescription !== false;
  const showEmail = data.showEmail !== false;
  const showNote = data.showNote !== false;
  const requireEmail = data.requireEmail === true;
  const requireNote = data.requireNote === true;

  const availableTimesRaw =
    typeof data.availableTimes === "string" ? data.availableTimes : "";
  const disabledDatesRaw =
    typeof data.disabledDates === "string" ? data.disabledDates : "";
  const minDateRaw = typeof data.minDate === "string" ? data.minDate : "";
  const maxDateRaw = typeof data.maxDate === "string" ? data.maxDate : "";
  const customFields = useMemo(
    () => normalizeCustomFields(data.customFields),
    [data.customFields],
  );

  const [formValues, setFormValues] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    selectedDate: "",
    selectedTime: "",
    note: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  const normalizedCustomFieldValues = useMemo(() => {
    const next: Record<string, string> = {};

    customFields.forEach((field) => {
      next[field.id] = customFieldValues[field.id] ?? field.value;
    });

    return next;
  }, [customFields, customFieldValues]);

  const availableTimes = useMemo(() => {
    return availableTimesRaw
      .split(/[,|\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [availableTimesRaw]);

  const disabledDateKeys = useMemo(() => {
    const keys = new Set<string>();

    disabledDatesRaw
      .split(/[,|\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const parsed = parseConstraintDate(item);
        if (parsed) {
          getDateKeys(parsed).forEach((key) => keys.add(key));
        } else {
          keys.add(normalizeDigits(item));
        }
      });

    return keys;
  }, [disabledDatesRaw]);

  const minDateValue = useMemo(
    () => parseConstraintDate(minDateRaw),
    [minDateRaw],
  );
  const maxDateValue = useMemo(
    () => parseConstraintDate(maxDateRaw),
    [maxDateRaw],
  );

  const selectedTime =
    formValues.selectedTime && availableTimes.includes(formValues.selectedTime)
      ? formValues.selectedTime
      : "";

  const calendarValue = useMemo(
    () =>
      combineDateWithSelectedTime(formValues.selectedDate, selectedTime),
    [formValues.selectedDate, selectedTime],
  );

  const handleCalendarChange = (value: string) => {
    updateField("selectedDate", value);
  };


  const getDateAvailabilityError = (selectedIso: string): string | null => {
    if (!selectedIso) return "لطفاً تاریخ رزرو را انتخاب کنید.";

    const parsed = new Date(selectedIso);
    if (Number.isNaN(parsed.getTime())) {
      return "تاریخ انتخاب‌شده معتبر نیست.";
    }

    const day = startOfDay(parsed);
    const keys = getDateKeys(day);

    if (keys.some((key) => disabledDateKeys.has(key))) {
      return "این تاریخ برای رزرو در دسترس نیست.";
    }

    if (minDateValue && day < startOfDay(minDateValue)) {
      return "تاریخ انتخابی از حداقل تاریخ مجاز زودتر است.";
    }

    if (maxDateValue && day > startOfDay(maxDateValue)) {
      return "تاریخ انتخابی از حداکثر تاریخ مجاز دیرتر است.";
    }

    return null;
  };

  const updateField = (field: keyof FormState, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setFeedback(null);
  };

  const updateCustomField = (fieldId: string, value: string) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [`custom:${fieldId}`]: undefined,
    }));

    setFeedback(null);
  };

  const validateForm = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = "لطفاً نام و نام خانوادگی را وارد کنید.";
    }

    if (!formValues.phone.trim()) {
      nextErrors.phone = "لطفاً شماره تماس را وارد کنید.";
    }

    if (showEmail && requireEmail && !formValues.email.trim()) {
      nextErrors.email = "لطفاً ایمیل را وارد کنید.";
    }

    if (
      showEmail &&
      formValues.email.trim() &&
      !isValidEmail(formValues.email)
    ) {
      nextErrors.email = "ایمیل واردشده معتبر نیست.";
    }

    const dateError = getDateAvailabilityError(formValues.selectedDate);
    if (dateError) {
      nextErrors.selectedDate = dateError;
    }

    if (!selectedTime.trim()) {
      nextErrors.selectedTime =
        availableTimes.length > 0
          ? "لطفاً ساعت رزرو را انتخاب کنید."
          : "ساعتی برای رزرو تعریف نشده است.";
    }

    if (showNote && requireNote && !formValues.note.trim()) {
      nextErrors.note = "لطفاً توضیحات را وارد کنید.";
    }

    customFields.forEach((field) => {
      const value = normalizedCustomFieldValues[field.id] ?? "";
      if (field.required && !value.trim()) {
        nextErrors[`custom:${field.id}`] = `لطفاً ${field.label || field.key} را وارد کنید.`;
      }
    });

    return nextErrors;
  };
 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    const hasErrors = Object.values(nextErrors).some(Boolean);

    if (hasErrors) {
      setFieldErrors(nextErrors);
      setFeedback({
        type: "error",
        text: "لطفاً فیلدهای ضروری را بررسی و تکمیل کنید.",
      });
      return;
    }

    const customFieldsPayload = customFields.map((field) => ({
      key: field.key || field.id,
      label: field.label || field.key,
      value: (normalizedCustomFieldValues[field.id] ?? field.value).trim(),
    }));

    const payload = {
      fullName: formValues.fullName.trim(),
      phone: formValues.phone.trim(),
      email: formValues.email.trim(),
      selectedDate: formValues.selectedDate,
      selectedTime,
      note: formValues.note.trim(),
      customFields: customFieldsPayload,
      pageUrl: getCurrentPageSlug(),
      sourceUrl:
        typeof window !== "undefined" ? window.location.href : undefined,
      blockInstanceId: block.instanceId,
      blockType: "bookingForm",
      submittedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (mode !== "public") {
        setFeedback({
          type: "success",
          text: successMessage,
        });
        setFieldErrors({});
        return;
      }

      const targetEndpoint = endpointUrl.trim() || "/api/bookings";
      const response = await fetch(targetEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setFeedback({
        type: "success",
        text: successMessage,
      });
      setFieldErrors({});
    } catch {
      setFeedback({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleShouldRender = isEditor || title.trim().length > 0;
  const descriptionShouldRender =
    showDescription && (isEditor || description.trim().length > 0);

  const fullNameId = `${block.instanceId}-booking-fullName`;
  const phoneId = `${block.instanceId}-booking-phone`;
  const emailId = `${block.instanceId}-booking-email`;
  const noteId = `${block.instanceId}-booking-note`;

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
        {titleShouldRender && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="title"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledTitle $styleCss={titleStyle} className="mb-2 font-bold">
              <InlineEditableText
                value={title}
                dataKey="title"
                instanceId={block.instanceId}
                mode={mode}
                onUpdateContent={onUpdateContent}
              >
                {(text) => text || " "}
              </InlineEditableText>
            </StyledTitle>
          </EditablePart>
        )}

        {descriptionShouldRender && (
          <EditablePart
            instanceId={block.instanceId}
            elementId="description"
            mode={mode}
            selectedElementId={selectedElementId}
            onSelectElement={onSelectElement}
          >
            <StyledDescription $styleCss={descriptionStyle} className="mb-6">
              <InlineEditableText
                value={description}
                dataKey="description"
                instanceId={block.instanceId}
                mode={mode}
                multiline
                onUpdateContent={onUpdateContent}
              >
                {(text) => text || " "}
              </InlineEditableText>
            </StyledDescription>
          </EditablePart>
        )}

        <EditablePart
          instanceId={block.instanceId}
          elementId="form"
          mode={mode}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
          className="cursor-default"
        >
          <StyledForm
            $styleCss={formStyle}
            className="p-4 md:p-6 space-y-5 mt-6"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="fieldLabel"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledFieldLabel
                    $styleCss={fieldLabelStyle}
                    htmlFor={fullNameId}
                    className="mb-2"
                  >
                    نام و نام خانوادگی <span className="text-red-500">*</span>
                  </StyledFieldLabel>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="input"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledInput
                    $styleCss={inputStyle}
                    id={fullNameId}
                    type="text"
                    value={formValues.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="مثلاً: علی رضایی"
                    className="px-3.5 py-3"
                  />
                </EditablePart>

                {fieldErrors.fullName && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="fieldLabel"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledFieldLabel
                    $styleCss={fieldLabelStyle}
                    htmlFor={phoneId}
                    className="mb-2"
                  >
                    شماره تماس <span className="text-red-500">*</span>
                  </StyledFieldLabel>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="input"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledInput
                    $styleCss={inputStyle}
                    id={phoneId}
                    type="tel"
                    value={formValues.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="مثلاً: 09123456789"
                    className="px-3.5 py-3"
                  />
                </EditablePart>

                {fieldErrors.phone && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {showEmail && (
              <div>
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="fieldLabel"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledFieldLabel
                    $styleCss={fieldLabelStyle}
                    htmlFor={emailId}
                    className="mb-2"
                  >
                    ایمیل{" "}
                    {requireEmail && <span className="text-red-500">*</span>}
                  </StyledFieldLabel>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="input"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledInput
                    $styleCss={inputStyle}
                    id={emailId}
                    type="email"
                    value={formValues.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="مثلاً: name@example.com"
                    className="px-3.5 py-3"
                  />
                </EditablePart>

                {fieldErrors.email && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            )}

            <div>
              <EditablePart
                instanceId={block.instanceId}
                elementId="fieldLabel"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledFieldLabel $styleCss={fieldLabelStyle} className="mb-2">
                  تاریخ رزرو <span className="text-red-500">*</span>
                </StyledFieldLabel>
              </EditablePart>

              <EditablePart
                instanceId={block.instanceId}
                elementId="calendar"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledCalendarWrap
                  $styleCss={calendarStyle}
                  className="p-3 w-full md:max-w-[360px]"
                >
                  <PersianDateTimePicker
                    value={calendarValue}
                    onChange={handleCalendarChange}
                  />
                </StyledCalendarWrap>
              </EditablePart>

              {(minDateRaw.trim() ||
                maxDateRaw.trim() ||
                disabledDatesRaw.trim()) && (
                <p className="mt-2 text-xs text-gray-500">
                  محدودیت تاریخ‌ها از تنظیمات محتوا اعمال می‌شود.
                </p>
              )}

              {fieldErrors.selectedDate && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {fieldErrors.selectedDate}
                </p>
              )}
            </div>

            <div>
              <EditablePart
                instanceId={block.instanceId}
                elementId="fieldLabel"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledFieldLabel $styleCss={fieldLabelStyle} className="mb-2">
                  ساعت رزرو <span className="text-red-500">*</span>
                </StyledFieldLabel>
              </EditablePart>

              {availableTimes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTimes.map((slot) => (
                    <EditablePart
                      key={slot}
                      instanceId={block.instanceId}
                      elementId="timeSlot"
                      mode={mode}
                      selectedElementId={selectedElementId}
                      onSelectElement={onSelectElement}
                    >
                      <StyledTimeSlot
                        $styleCss={timeSlotStyle}
                        $isActive={selectedTime === slot}
                        type="button"
                        aria-pressed={selectedTime === slot}
                        className="px-4 py-2"
                        onClick={() => updateField("selectedTime", slot)}
                      >
                        {slot}
                      </StyledTimeSlot>
                    </EditablePart>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  ساعتی برای رزرو تعریف نشده است.
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                ساعت رزرو را از گزینه‌های بالا انتخاب کنید.
              </p>

              {fieldErrors.selectedTime && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {fieldErrors.selectedTime}
                </p>
              )}
            </div>

            {customFields.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {customFields.map((field) => {
                  const customInputId = `${block.instanceId}-booking-custom-${field.id}`;
                  const errorKey = `custom:${field.id}`;

                  return (
                    <div key={field.id}>
                      <EditablePart
                        instanceId={block.instanceId}
                        elementId="fieldLabel"
                        mode={mode}
                        selectedElementId={selectedElementId}
                        onSelectElement={onSelectElement}
                      >
                        <StyledFieldLabel
                          $styleCss={fieldLabelStyle}
                          htmlFor={customInputId}
                          className="mb-2"
                        >
                          {field.label || field.key}{" "}
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </StyledFieldLabel>
                      </EditablePart>

                      <EditablePart
                        instanceId={block.instanceId}
                        elementId="input"
                        mode={mode}
                        selectedElementId={selectedElementId}
                        onSelectElement={onSelectElement}
                      >
                        <StyledInput
                          $styleCss={inputStyle}
                          id={customInputId}
                          type="text"
                          value={
                            normalizedCustomFieldValues[field.id] ?? field.value
                          }
                          onChange={(e) =>
                            updateCustomField(field.id, e.target.value)
                          }
                          placeholder={field.label || field.key}
                          className="px-3.5 py-3"
                        />
                      </EditablePart>

                      {fieldErrors[errorKey] && (
                        <p className="mt-2 text-sm text-red-600" role="alert">
                          {fieldErrors[errorKey]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {showNote && (
              <div>
                <EditablePart
                  instanceId={block.instanceId}
                  elementId="fieldLabel"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledFieldLabel
                    $styleCss={fieldLabelStyle}
                    htmlFor={noteId}
                    className="mb-2"
                  >
                    توضیحات{" "}
                    {requireNote && <span className="text-red-500">*</span>}
                  </StyledFieldLabel>
                </EditablePart>

                <EditablePart
                  instanceId={block.instanceId}
                  elementId="input"
                  mode={mode}
                  selectedElementId={selectedElementId}
                  onSelectElement={onSelectElement}
                >
                  <StyledInput
                    as="textarea"
                    $styleCss={inputStyle}
                    id={noteId}
                    value={formValues.note}
                    onChange={(e) => updateField("note", e.target.value)}
                    placeholder="اگر توضیح خاصی دارید اینجا بنویسید."
                    className="px-3.5 py-3 min-h-[120px] resize-y"
                  />
                </EditablePart>

                {fieldErrors.note && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {fieldErrors.note}
                  </p>
                )}
              </div>
            )}

            <EditablePart
              instanceId={block.instanceId}
              elementId="submitButton"
              mode={mode}
              selectedElementId={selectedElementId}
              onSelectElement={onSelectElement}
            >
              <StyledSubmitButton
                $styleCss={submitButtonStyle}
                $isLoading={isSubmitting}
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full py-3.5 px-4"
              >
                {isSubmitting ? (
                  "در حال ارسال..."
                ) : (
                  <InlineEditableText
                    value={submitButtonText}
                    dataKey="submitButtonText"
                    instanceId={block.instanceId}
                    mode={mode}
                    onUpdateContent={onUpdateContent}
                  >
                    {(text) => text || "ثبت رزرو"}
                  </InlineEditableText>
                )}
              </StyledSubmitButton>
            </EditablePart>

            {feedback && (
              <EditablePart
                instanceId={block.instanceId}
                elementId="message"
                mode={mode}
                selectedElementId={selectedElementId}
                onSelectElement={onSelectElement}
              >
                <StyledMessage
                  $styleCss={messageStyle}
                  $isError={feedback.type === "error"}
                  className="px-4 py-3"
                  role={feedback.type === "error" ? "alert" : "status"}
                >
                  {feedback.text}
                </StyledMessage>
              </EditablePart>
            )}
          </StyledForm>
        </EditablePart>
      </StyledContainer>
    </EditablePart>
  );
}
