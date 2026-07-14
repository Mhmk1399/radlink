import type { PageBlock } from "@/types/blocks/builder.types";

const blockType = "messengerLinks";

export function createDefaultMessengerLinksBlock(order: number): PageBlock {
  const instanceId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${blockType}-${Date.now()}`;

  return {
    instanceId,
    type: blockType,
    order,
    version: 1,
    isActive: true,
    settings: { direction: "rtl" },
    data: {
      title: "راه‌های ارتباط در پیام‌رسان‌ها",
      description:
        "برای ارتباط سریع‌تر، یکی از پیام‌رسان‌های زیر را انتخاب کنید.",

      telegramLabel: "تلگرام",
      telegramUrl: "",
      whatsappLabel: "واتساپ",
      whatsappUrl: "",
      instagramLabel: "اینستاگرام",
      instagramUrl: "",
      eitaaLabel: "ایتا",
      eitaaUrl: "",
      soroushLabel: "سروش",
      soroushUrl: "",
      rubikaLabel: "روبیکا",
      rubikaUrl: "",
      baleLabel: "بله",
      baleUrl: "",
      gapUrl: "",
      igapLabel: "آی‌گپ",
      igapUrl: "",
      shadUrl: "",
      signalLabel: "سیگنال",
      signalUrl: "",
      messengerLabel: "مسنجر",
      messengerUrl: "",
      discordLabel: "دیسکورد",
      discordUrl: "",
      xLabel: "ایکس",
      xUrl: "",
      youtubeLabel: "یوتیوب",
      youtubeUrl: "",
      linkedinLabel: "لینکدین",
      linkedinUrl: "",
      messengerItems: [],

      showTitle: true,
      showDescription: true,
      showLabels: true,

      showTelegram: true,
      showWhatsapp: true,
      showInstagram: true,
      showEitaa: true,
      showSoroush: true,
      showRubika: true,
      showBale: true,
      showGap: true,
      showIgap: true,
      showShad: true,
      showSignal: true,
      showMessenger: true,
      showDiscord: true,
      showX: true,
      showYoutube: true,
      showLinkedin: true,

      openInNewTab: true,
    },
    elements: {
      container: {
        label: "کادر اصلی",
        allowedStyleKeys: [
          "backgroundColor",
          "borderRadius",
          "borderColor",
          "borderWidth",
          "gridColumns",
          "animation",
        ],
        style: {
          backgroundColor: { mobile: "#ffffff" },
          borderRadius: { mobile: 28 },
          borderColor: { mobile: "#e2e8f0" },
          borderWidth: { mobile: 1 },
          gridColumns: { mobile: 2 },
        },
      },
      title: {
        label: "عنوان",
        allowedStyleKeys: ["color", "fontSize", "animation"],
        style: {
          color: { mobile: "#1e293b" },
          fontSize: { mobile: 22, tablet: 26, desktop: 30 },
        },
      },
      description: {
        label: "توضیحات",
        allowedStyleKeys: ["color", "fontSize"],
        style: {
          color: { mobile: "#64748b" },
          fontSize: { mobile: 14, tablet: 15, desktop: 16 },
        },
      },
      messengerButton: {
        label: "دکمه پیام‌رسان",
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
          color: { mobile: "#334155" },
          backgroundColor: { mobile: "#f8fafc" },
          fontSize: { mobile: 14, tablet: 15, desktop: 16 },
          borderRadius: { mobile: 20 },
          borderColor: { mobile: "#e2e8f0" },
          borderWidth: { mobile: 1 },
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
          color: { mobile: "#475569" },
          backgroundColor: { mobile: "#f1f5f9" },
          fontSize: { mobile: 22, tablet: 24, desktop: 26 },
          borderRadius: { mobile: 14 },
          borderColor: { mobile: "transparent" },
          borderWidth: { mobile: 0 },
        },
      },
      label: {
        label: "عنوان پیام‌رسان",
        allowedStyleKeys: ["color", "fontSize"],
        style: {
          color: { mobile: "#334155" },
          fontSize: { mobile: 13, tablet: 14, desktop: 15 },
        },
      },
    },
  };
}
