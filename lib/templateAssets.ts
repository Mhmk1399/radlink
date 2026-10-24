import { extractKeyFromUrl } from "@/lib/fileUtils";

// Keep copied template images available when the source page later removes them.
export function collectTemplateAssetUrls(value: unknown): string[] {
  const urls = new Set<string>();
  const visit = (node: unknown) => {
    if (typeof node === "string") {
      if (extractKeyFromUrl(node)) urls.add(node);
    } else if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (node && typeof node === "object") {
      Object.values(node).forEach(visit);
    }
  };
  visit(value);
  return [...urls];
}
