import type { BlockSchema } from "@/types/blocks/builder.types";

export const messengerLinksSchema: BlockSchema = {
    type: "messengerLinks",
    label: "پیام‌رسان‌ها",
    description:
        "لینک شبکه‌ها و پیام‌رسان‌ها مثل تلگرام، واتساپ، اینستاگرام، ایتا، سروش، روبیکا و موارد دیگر.",
    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },

        { key: "telegramUrl", label: "لینک تلگرام", type: "url" },
        { key: "whatsappUrl", label: "لینک واتساپ", type: "url" },
        { key: "instagramUrl", label: "لینک اینستاگرام", type: "url" },
        { key: "eitaaUrl", label: "لینک ایتا", type: "url" },
        { key: "soroushUrl", label: "لینک سروش", type: "url" },
        { key: "rubikaUrl", label: "لینک روبیکا", type: "url" },
        { key: "baleUrl", label: "لینک بله", type: "url" },
        { key: "igapUrl", label: "لینک آی‌گپ", type: "url" },
        { key: "signalUrl", label: "لینک سیگنال", type: "url" },
        { key: "messengerUrl", label: "لینک مسنجر", type: "url" },
        { key: "discordUrl", label: "لینک دیسکورد", type: "url" },
        { key: "xUrl", label: "لینک ایکس", type: "url" },
        { key: "youtubeUrl", label: "لینک یوتیوب", type: "url" },
        { key: "linkedinUrl", label: "لینک لینکدین", type: "url" },

        { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },

        { key: "showTelegram", label: "نمایش تلگرام", type: "boolean" },
        { key: "showWhatsapp", label: "نمایش واتساپ", type: "boolean" },
        { key: "showInstagram", label: "نمایش اینستاگرام", type: "boolean" },
        { key: "showEitaa", label: "نمایش ایتا", type: "boolean" },
        { key: "showSoroush", label: "نمایش سروش", type: "boolean" },
        { key: "showRubika", label: "نمایش روبیکا", type: "boolean" },
        { key: "showBale", label: "نمایش بله", type: "boolean" },
        { key: "showIgap", label: "نمایش آی‌گپ", type: "boolean" },
        { key: "showSignal", label: "نمایش سیگنال", type: "boolean" },
        { key: "showMessenger", label: "نمایش مسنجر", type: "boolean" },
        { key: "showDiscord", label: "نمایش دیسکورد", type: "boolean" },
        { key: "showX", label: "نمایش ایکس", type: "boolean" },
        { key: "showYoutube", label: "نمایش یوتیوب", type: "boolean" },
        { key: "showLinkedin", label: "نمایش لینکدین", type: "boolean" },

        { key: "openInNewTab", label: "باز شدن در تب جدید", type: "boolean" },
    ],
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
        },
        title: {
            label: "عنوان",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        description: {
            label: "توضیحات",
            allowedStyleKeys: ["color", "fontSize"],
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
        },
        label: {
            label: "عنوان پیام‌رسان",
            allowedStyleKeys: ["color", "fontSize"],
        },
    },
};