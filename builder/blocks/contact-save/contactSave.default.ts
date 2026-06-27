import type { PageBlock } from "@/types/blocks/builder.types";

function generateInstanceId() {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `contact-save-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultContactSaveBlock(order = 0): PageBlock {
  return {
    instanceId: generateInstanceId(),
    blockId: "contactSave",
    type: "contactSave",
    version: 1,
    order,
    isActive: true,
    data: {
      firstName: "علی",
      lastName: "محمدی",
      phoneNumber: "09120000000",
      organization: "",
      buttonText: "ذخیره در مخاطبین",
      showIcon: true,
    },
    settings: {
      direction: "rtl",
    },
    elements: {
      container: {
        label: "قاب بلاک",
        allowedStyleKeys: [
          "backgroundColor",
          "borderRadius",
          "borderColor",
          "borderWidth",
          "animation",
        ],
        style: {
          backgroundColor: { mobile: "transparent" },
          borderRadius: { mobile: 18 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },
      button: {
        label: "دکمه ذخیره مخاطب",
        allowedStyleKeys: [
          "color",
          "backgroundColor",
          "fontSize",
          "borderRadius",
          "borderColor",
          "borderWidth",
          "animation",
        ],
        style: {
          color: { mobile: "#ffffff" },
          backgroundColor: { mobile: "#064789" },
          fontSize: { mobile: 15, tablet: 16, desktop: 16 },
          borderRadius: { mobile: 14 },
          borderColor: { mobile: "#064789" },
          borderWidth: { mobile: 1 },
          animation: "none",
        },
      },
      icon: {
        label: "آیکون مخاطب",
        allowedStyleKeys: [
          "color",
          "backgroundColor",
          "borderRadius",
        ],
        style: {
          color: { mobile: "#ffffff" },
          backgroundColor: { mobile: "rgba(235,242,250,0.16)" },
          borderRadius: { mobile: 10 },
        },
      },
    },
  };
}