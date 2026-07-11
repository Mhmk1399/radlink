export const PAGE_SLUG_MIN_LENGTH = 4;

export const PAGE_SLUG_RULE_MESSAGE =
  "آدرس صفحه فقط می‌تواند شامل حروف انگلیسی a-z، اعداد 0-9 و خط تیره (-) باشد.";

export const PAGE_SLUG_REQUIRED_MESSAGE =
  "لطفاً آدرس صفحه را وارد کنید.";

export const PAGE_SLUG_MIN_LENGTH_MESSAGE =
  "آدرس صفحه باید حداقل ۴ کاراکتر باشد.";

const PAGE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function normalizePageSlugInput(value: unknown): string {
  return toEnglishDigits(String(value ?? ""))
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizePageSlug(value: unknown): string {
  return normalizePageSlugInput(value)
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hasInvalidPageSlugCharacters(value: unknown): boolean {
  const normalized = normalizePageSlugInput(value);
  if (!normalized) return false;
  return normalized !== sanitizePageSlug(value);
}

export function isValidPageSlug(value: unknown): boolean {
  const normalized = normalizePageSlugInput(value);
  return (
    normalized.length >= PAGE_SLUG_MIN_LENGTH &&
    normalized === sanitizePageSlug(value) &&
    PAGE_SLUG_PATTERN.test(normalized)
  );
}

export function getPageSlugValidationError(value: unknown): string | null {
  const normalized = normalizePageSlugInput(value);

  if (!normalized) return PAGE_SLUG_REQUIRED_MESSAGE;
  if (normalized.length < PAGE_SLUG_MIN_LENGTH)
    return PAGE_SLUG_MIN_LENGTH_MESSAGE;
  if (hasInvalidPageSlugCharacters(value) || !PAGE_SLUG_PATTERN.test(normalized))
    return PAGE_SLUG_RULE_MESSAGE;

  return null;
}
