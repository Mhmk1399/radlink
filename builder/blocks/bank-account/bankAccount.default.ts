import type { PageBlock } from "@/types/blocks/builder.types";

function generateInstanceId(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `bank-account-${Date.now()}`;
}

export function createDefaultBankAccountBlock(
  order: number = 0,
): PageBlock {
  return {
    instanceId: generateInstanceId(),

    type: "bankAccount",

    version: 1,

    order,

    isActive: true,

    settings: {
      direction: "rtl",
    },

    data: {
      holderName: "",
      bankName: "",

      cardNumber: "",
      shebaNumber: "",
      accountNumber: "",

      showHolderName: true,
      showBankName: true,
    },

    elements: {
      container: {
        label: "کادر اصلی",
        allowedStyleKeys: [
          "backgroundColor",
          "borderRadius",
          "borderColor",
          "borderWidth",
          "animation",
        ],
        style: {
          backgroundColor: {
            mobile: "#ffffff",
          },
          borderRadius: {
            mobile: 24,
          },
          borderColor: {
            mobile: "#e5e7eb",
          },
          borderWidth: {
            mobile: 1,
          },
          animation: "none",
        },
      },

      ownerName: {
        label: "صاحب حساب",
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
          color: {
            mobile: "#111827",
          },
          backgroundColor: {
            mobile: "transparent",
          },
          fontSize: {
            mobile: 15,
          },
          borderRadius: {
            mobile: 0,
          },
          borderColor: {
            mobile: "transparent",
          },
          borderWidth: {
            mobile: 0,
          },
          animation: "none",
        },
      },

      holderName: {
        label: "نام صاحب حساب",
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
          color: { mobile: "#111827" },
          backgroundColor: { mobile: "transparent" },
          fontSize: { mobile: 15 },
          borderRadius: { mobile: 0 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },

      bankName: {
        label: "نام بانک",
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
          color: { mobile: "#111827" },
          backgroundColor: { mobile: "transparent" },
          fontSize: { mobile: 15 },
          borderRadius: { mobile: 0 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },

      item: {
        label: "ردیف اطلاعات",
        allowedStyleKeys: [
          "color",
          "backgroundColor",
          "borderRadius",
          "borderColor",
          "borderWidth",
          "animation",
        ],
        style: {
          color: {
            mobile: "#111827",
          },
          backgroundColor: {
            mobile: "#f9fafb",
          },
          borderRadius: {
            mobile: 18,
          },
          borderColor: {
            mobile: "#e5e7eb",
          },
          borderWidth: {
            mobile: 1,
          },
          animation: "none",
        },
      },

      cardNumber: {
        label: "شماره کارت",
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
          color: { mobile: "#111827" },
          backgroundColor: { mobile: "transparent" },
          fontSize: { mobile: 16 },
          borderRadius: { mobile: 0 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },

      shebaNumber: {
        label: "شماره شبا",
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
          color: { mobile: "#111827" },
          backgroundColor: { mobile: "transparent" },
          fontSize: { mobile: 16 },
          borderRadius: { mobile: 0 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },

      accountNumber: {
        label: "شماره حساب",
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
          color: { mobile: "#111827" },
          backgroundColor: { mobile: "transparent" },
          fontSize: { mobile: 16 },
          borderRadius: { mobile: 0 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },

      icon: {
        label: "آیکون",
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
          color: {
            mobile: "#111827",
          },
          backgroundColor: {
            mobile: "#ffffff",
          },
          fontSize: {
            mobile: 18,
          },
          borderRadius: {
            mobile: 12,
          },
          borderColor: {
            mobile: "#e5e7eb",
          },
          borderWidth: {
            mobile: 1,
          },
          animation: "none",
        },
      },

      label: {
        label: "عنوان فیلد",
        allowedStyleKeys: [
          "color",
          "backgroundColor",
          "fontSize",
          "borderRadius",
          "animation",
        ],
        style: {
          color: {
            mobile: "#6b7280",
          },
          backgroundColor: {
            mobile: "transparent",
          },
          fontSize: {
            mobile: 11,
          },
          borderRadius: {
            mobile: 0,
          },
          animation: "none",
        },
      },

      value: {
        label: "مقدار",
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
          color: {
            mobile: "#111827",
          },
          backgroundColor: {
            mobile: "transparent",
          },
          fontSize: {
            mobile: 16,
          },
          borderRadius: {
            mobile: 0,
          },
          borderColor: {
            mobile: "transparent",
          },
          borderWidth: {
            mobile: 0,
          },
          animation: "none",
        },
      },

      copyButton: {
        label: "دکمه کپی",
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
          color: {
            mobile: "#374151",
          },
          backgroundColor: {
            mobile: "#ffffff",
          },
          fontSize: {
            mobile: 14,
          },
          borderRadius: {
            mobile: 12,
          },
          borderColor: {
            mobile: "#e5e7eb",
          },
          borderWidth: {
            mobile: 1,
          },
          animation: "none",
        },
      },
    },
  };
}