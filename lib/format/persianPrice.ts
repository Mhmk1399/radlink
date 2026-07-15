const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toAsciiDigit(char: string): string {
  const code = char.charCodeAt(0);

  if (code >= 48 && code <= 57) return char;
  if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
  if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);

  return "";
}

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

function formatDigitRun(value: string): string {
  const digits = Array.from(value).map(toAsciiDigit).join("");

  if (!digits) return value;

  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return toPersianDigits(grouped);
}

export function normalizePersianPriceText(value: unknown): string {
  const text = String(value ?? "").trim();

  if (!text) return "";

  return text
    .replace(/[0-9۰-۹٠-٩](?:[0-9۰-۹٠-٩\s,٬،._-]*[0-9۰-۹٠-٩])?/g, (match) =>
      formatDigitRun(match),
    )
    .replace(/\s+/g, " ")
    .trim();
}
