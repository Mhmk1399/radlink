export function normalizeCollectionName(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getCollectionNameValidationError(value: unknown): string | null {
  const name = normalizeCollectionName(value);
  if (!name) return "نام مجموعه / شرکت الزامی است.";
  if (name.length > 120) return "نام مجموعه / شرکت باید حداکثر ۱۲۰ کاراکتر باشد.";
  return null;
}
