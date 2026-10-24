import type { PageBlock } from "@/types/blocks/builder.types";
import { gallerySchema } from "./gallery.schema";

export function createDefaultGalleryBlock(order: number): PageBlock {
  return {
    type: "gallery",
    instanceId: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID() : `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    order, version: 1, isActive: true, settings: { direction: "rtl" },
    data: {
      title: "گالری تصاویر", description: "لحظه‌ها، نمونه‌کارها و تصاویر خود را اینجا به نمایش بگذارید.",
      showTitle: true, showDescription: false, showCaptions: true,
      imageFit: "cover", spacing: "16",
      images: Array.from({ length: 4 }, (_, index) => ({
        id: `gallery-image-${index + 1}`, imageUrl: "", altText: "", caption: "", enabled: true,
      })),
    },
    elements: {
      container: { ...gallerySchema.elements.container, style: { backgroundColor: { mobile: "transparent" }, borderRadius: { mobile: 20 }, paddingTop: { mobile: 16 }, paddingBottom: { mobile: 16 } } },
      title: { ...gallerySchema.elements.title, style: { color: { mobile: "#064789" }, fontSize: { mobile: 22 } } },
      description: { ...gallerySchema.elements.description, style: { color: { mobile: "#475569" }, fontSize: { mobile: 14 } } },
      grid: { ...gallerySchema.elements.grid, style: { gridColumns: { mobile: 2, tablet: 3, desktop: 4 } } },
      image: { ...gallerySchema.elements.image, style: { height: { mobile: 180, tablet: 220, desktop: 260 }, backgroundColor: { mobile: "#EBF2FA" }, borderRadius: { mobile: 16 } } },
      caption: { ...gallerySchema.elements.caption, style: { color: { mobile: "#475569" }, fontSize: { mobile: 13 } } },
    },
  };
}
