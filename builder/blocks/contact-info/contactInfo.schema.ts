import type { BlockSchema } from "@/types/blocks/builder.types";

export const contactInfoSchema: BlockSchema = {
    type: "contactInfo",
    label: "اطلاعات تماس",
    description:
        "بلاک نمایش راه‌های ارتباطی شامل تلفن، واتساپ، ایمیل، آدرس و دکمه‌های اقدام",

    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "phone", label: "شماره تلفن", type: "text" },
        { key: "whatsapp", label: "شماره واتساپ", type: "text" },
        { key: "email", label: "ایمیل", type: "text" },
        { key: "address", label: "آدرس", type: "textarea" },
        { key: "primaryButtonText", label: "متن دکمه اول", type: "text" },
        { key: "secondaryButtonText", label: "متن دکمه دوم", type: "text" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showPhone", label: "نمایش تلفن", type: "boolean" },
        { key: "showWhatsapp", label: "نمایش واتساپ", type: "boolean" },
        { key: "showEmail", label: "نمایش ایمیل", type: "boolean" },
        { key: "showAddress", label: "نمایش آدرس", type: "boolean" },
        { key: "showButtons", label: "نمایش دکمه‌ها", type: "boolean" },
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
        item: {
            label: "آیتم تماس",
            allowedStyleKeys: [
                "color",
                "backgroundColor",
                "fontSize",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        buttonPrimary: {
            label: "دکمه اول",
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
        buttonSecondary: {
            label: "دکمه دوم",
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
    },
};