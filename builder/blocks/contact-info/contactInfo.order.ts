const contactTypes = ["phone", "landline", "whatsapp", "email", "address", "link"];

export function getContactDisplayOrder(value: unknown, type: string) {
  const fallback = (contactTypes.indexOf(type) + 1) * 10;
  if (typeof value !== "number" && typeof value !== "string") return fallback;
  const normalized = String(value).trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const order = Number(normalized);
  return normalized && Number.isFinite(order) && order >= 1 ? order : fallback;
}

export function sortContactItems<T extends {
  id?: string;
  type: string;
  displayOrder?: unknown;
  sourcePriority: number;
  itemOrder: number;
}>(items: T[], savedOrder?: unknown): T[] {
  const ids = Array.isArray(savedOrder) ? savedOrder.filter((id): id is string => typeof id === "string") : [];
  const rank = (id?: string) => {
    const index = id ? ids.indexOf(id) : -1;
    return index < 0 ? ids.length : index;
  };
  return [...items].sort((a, b) =>
    rank(a.id) - rank(b.id)
    || getContactDisplayOrder(a.displayOrder, a.type) - getContactDisplayOrder(b.displayOrder, b.type)
    || contactTypes.indexOf(a.type) - contactTypes.indexOf(b.type)
    || a.sourcePriority - b.sourcePriority
    || a.itemOrder - b.itemOrder,
  );
}
