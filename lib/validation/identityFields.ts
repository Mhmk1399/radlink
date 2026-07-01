export const PHONE_NUMBER_LENGTH = 11;
export const NATIONAL_CODE_LENGTH = 10;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type IdentityFieldName = "phoneNumber" | "email" | "nationalCode";

export function toEnglishDigits(value: unknown): string {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
    );
}

export function digitsOnly(value: unknown, maxLength?: number): string {
  const digits = toEnglishDigits(value).replace(/\D/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
}

export function normalizePhoneNumber(value: unknown): string {
  return digitsOnly(value, PHONE_NUMBER_LENGTH);
}

export function normalizeNationalCode(value: unknown): string {
  return digitsOnly(value, NATIONAL_CODE_LENGTH);
}

export function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidPhoneNumber(value: unknown): boolean {
  return new RegExp(`^\\d{${PHONE_NUMBER_LENGTH}}$`).test(String(value ?? ""));
}

export function isValidNationalCode(value: unknown): boolean {
  return new RegExp(`^\\d{${NATIONAL_CODE_LENGTH}}$`).test(
    String(value ?? ""),
  );
}

export function isValidEmail(value: unknown): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

export function getIdentityFieldName(
  fieldName: string,
): IdentityFieldName | null {
  const normalized = fieldName.replace(/[_-]/g, "").toLowerCase();

  if (
    normalized === "phonenumber" ||
    normalized === "phone" ||
    normalized === "mobile" ||
    normalized === "fixednumber"
  )
    return "phoneNumber";
  if (normalized === "nationalcode") return "nationalCode";
  if (normalized === "email") return "email";
  return null;
}

export function sanitizeIdentityField(
  fieldName: string,
  value: unknown,
): unknown {
  const identityField = getIdentityFieldName(fieldName);

  if (identityField === "phoneNumber") return normalizePhoneNumber(value);
  if (identityField === "nationalCode") return normalizeNationalCode(value);
  if (identityField === "email") return String(value ?? "").slice(0, 254);
  return value;
}

export function validateIdentityField(
  fieldName: string,
  value: unknown,
): string | null {
  const identityField = getIdentityFieldName(fieldName);
  const text = String(value ?? "").trim();

  if (!identityField || !text) return null;
  if (identityField === "phoneNumber" && !isValidPhoneNumber(text))
    return "شماره تماس باید دقیقاً ۱۱ رقم باشد.";
  if (identityField === "nationalCode" && !isValidNationalCode(text))
    return "کد ملی باید دقیقاً ۱۰ رقم باشد.";
  if (identityField === "email" && !isValidEmail(text))
    return "فرمت ایمیل معتبر نیست.";
  return null;
}

export function getIdentityInputProps(fieldName: string): {
  inputMode?: "email" | "numeric";
  maxLength?: number;
  dir?: "ltr";
} {
  const identityField = getIdentityFieldName(fieldName);

  if (identityField === "phoneNumber")
    return { inputMode: "numeric", maxLength: PHONE_NUMBER_LENGTH, dir: "ltr" };
  if (identityField === "nationalCode")
    return {
      inputMode: "numeric",
      maxLength: NATIONAL_CODE_LENGTH,
      dir: "ltr",
    };
  if (identityField === "email")
    return { inputMode: "email", maxLength: 254, dir: "ltr" };
  return {};
}
