import type { PageBlock } from "@/types/blocks/builder.types";

const blockType = "pdfDownloads";

function generateInstanceId(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${blockType}-${Date.now()}`;
}

export function createDefaultPdfDownloadsBlock(order: number = 0): PageBlock {
  return {
    instanceId: generateInstanceId(),
    type: blockType,
    version: 1,
    order,
    isActive: true,
    settings: { direction: "rtl" },
    data: {
      title: "فایل‌های قابل دانلود",
      description:
        "کاتالوگ‌ها، منوها، فرم‌ها یا هر فایل PDF مورد نیاز کاربران را اینجا قرار دهید.",
      showTitle: true,
      showDescription: true,
      openInNewTab: true,
      documents: [
        {
          id: "pdf-1",
          title: "کاتالوگ خدمات",
          description: "نسخه PDF معرفی خدمات، تعرفه‌ها و اطلاعات تکمیلی.",
          fileUrl: "",
          fileSize: "PDF",
          badgeText: "جدید",
          downloadText: "دانلود کاتالوگ",
          enabled: true,
        },
        {
          id: "pdf-2",
          title: "راهنمای استفاده",
          description: "فایل راهنمای کوتاه برای مشتریان و بازدیدکنندگان.",
          fileUrl: "",
          fileSize: "PDF",
          badgeText: "راهنما",
          downloadText: "دانلود راهنما",
          enabled: true,
        },
      ],
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
          backgroundColor: { mobile: "#FFFFFF" },
          borderRadius: { mobile: 28 },
          borderColor: { mobile: "#E2E8F0" },
          borderWidth: { mobile: 1 },
          animation: "none",
        },
      },
      title: {
        label: "عنوان بخش",
        allowedStyleKeys: ["color", "fontSize", "animation"],
        style: {
          color: { mobile: "#0F172A" },
          fontSize: { mobile: 22, tablet: 26, desktop: 30 },
          animation: "none",
        },
      },
      description: {
        label: "توضیحات بخش",
        allowedStyleKeys: ["color", "fontSize"],
        style: {
          color: { mobile: "#64748B" },
          fontSize: { mobile: 14, tablet: 15, desktop: 16 },
        },
      },
      list: {
        label: "چینش فایل‌ها",
        allowedStyleKeys: [
          "layoutMode",
          "gridColumns",
          "backgroundColor",
          "borderRadius",
          "borderColor",
          "borderWidth",
        ],
        style: {
          layoutMode: { mobile: "grid" },
          gridColumns: { mobile: 2, desktop: 3 },
          backgroundColor: { mobile: "transparent" },
          borderRadius: { mobile: 0 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
        },
      },
      card: {
        label: "کارت PDF",
        allowedStyleKeys: [
          "backgroundColor",
          "borderRadius",
          "borderColor",
          "borderWidth",
          "animation",
        ],
        style: {
          backgroundColor: { mobile: "#F8FAFC" },
          borderRadius: { mobile: 22 },
          borderColor: { mobile: "#E2E8F0" },
          borderWidth: { mobile: 1 },
          animation: "none",
        },
      },
      icon: {
        label: "آیکون فایل",
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
          color: { mobile: "#DC2626" },
          backgroundColor: { mobile: "#FEE2E2" },
          fontSize: { mobile: 24 },
          borderRadius: { mobile: 18 },
          borderColor: { mobile: "#FECACA" },
          borderWidth: { mobile: 1 },
          animation: "none",
        },
      },
      fileTitle: {
        label: "عنوان فایل",
        allowedStyleKeys: ["color", "fontSize", "animation"],
        style: {
          color: { mobile: "#0F172A" },
          fontSize: { mobile: 16, tablet: 17, desktop: 18 },
          animation: "none",
        },
      },
      fileDescription: {
        label: "توضیحات فایل",
        allowedStyleKeys: ["color", "fontSize"],
        style: {
          color: { mobile: "#64748B" },
          fontSize: { mobile: 12, tablet: 13, desktop: 14 },
        },
      },
      meta: {
        label: "اطلاعات فایل",
        allowedStyleKeys: ["color", "backgroundColor", "fontSize", "borderRadius"],
        style: {
          color: { mobile: "#64748B" },
          backgroundColor: { mobile: "#FFFFFF" },
          fontSize: { mobile: 11 },
          borderRadius: { mobile: 999 },
        },
      },
      badge: {
        label: "نشان PDF",
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
          color: { mobile: "#991B1B" },
          backgroundColor: { mobile: "#FEE2E2" },
          fontSize: { mobile: 11 },
          borderRadius: { mobile: 999 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },
      button: {
        label: "دکمه دانلود",
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
          color: { mobile: "#FFFFFF" },
          backgroundColor: { mobile: "#DC2626" },
          fontSize: { mobile: 14, tablet: 15, desktop: 16 },
          borderRadius: { mobile: 14 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
          animation: "none",
        },
      },
    },
  };
}
