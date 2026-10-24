import type { PageBlock } from "@/types/blocks/builder.types";
import { audioSchema } from "./audio.schema";

export function createDefaultAudioBlock(order: number): PageBlock {
  return {
    type: "audio", instanceId: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `audio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    order, version: 1, isActive: true, settings: { direction: "rtl" },
    data: { title: "بشنوید", description: "صداها و داستان‌های ما", showTitle: true, showDescription: false, tracks: [{ id: "audio-1", title: "پیام صوتی", audioUrl: "", caption: "", enabled: true }] },
    elements: {
      container: { ...audioSchema.elements.container, style: { backgroundColor: { mobile: "transparent" }, paddingTop: { mobile: 16 }, paddingBottom: { mobile: 16 }, borderRadius: { mobile: 20 } } },
      title: { ...audioSchema.elements.title, style: { color: { mobile: "#064789" }, fontSize: { mobile: 22 } } },
      description: { ...audioSchema.elements.description, style: { color: { mobile: "#475569" }, fontSize: { mobile: 14 } } },
      item: { ...audioSchema.elements.item, style: { backgroundColor: { mobile: "#EBF2FA" }, color: { mobile: "#064789" }, borderRadius: { mobile: 20 } } },
      button: { ...audioSchema.elements.button, style: { backgroundColor: { mobile: "#064789" }, color: { mobile: "#ffffff" } } },
      caption: { ...audioSchema.elements.caption, style: { color: { mobile: "#475569" }, fontSize: { mobile: 13 } } },
    },
  };
}
