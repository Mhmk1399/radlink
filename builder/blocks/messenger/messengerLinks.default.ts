import type { PageBlock } from "@/types/blocks/builder.types";

const blockType = "messengerLinks";

export function createDefaultMessengerLinksBlock(
    order: number
): PageBlock {
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

            telegramUrl: "",
            whatsappUrl: "",
            instagramUrl: "",
            eitaaUrl: "",
            soroushUrl: "",
            rubikaUrl: "",
            baleUrl: "",
            gapUrl: "",
            igapUrl: "",
            shadUrl: "",
            signalUrl: "",
            messengerUrl: "",
            discordUrl: "",
            xUrl: "",
            youtubeUrl: "",
            linkedinUrl: "",

            showTitle: true,
            showDescription: true,

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
                    "animation",
                ],
                style: {
                    backgroundColor: { mobile: "#ffffff" },
                    borderRadius: { mobile: 24 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 1 },
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 22, tablet: 26, desktop: 30 },
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#6b7280" },
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
                    color: { mobile: "#111827" },
                    backgroundColor: { mobile: "#f9fafb" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "#e5e7eb" },
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
                    color: { mobile: "#111827" },
                    backgroundColor: { mobile: "#ffffff" },
                    fontSize: { mobile: 20, tablet: 22, desktop: 24 },
                    borderRadius: { mobile: 12 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 1 },
                },
            },
            label: {
                label: "عنوان پیام‌رسان",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
        },
    };
}