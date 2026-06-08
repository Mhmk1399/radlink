import type { BlockSchema } from "@/types/blocks/builder.types";

export const ctaSchema: BlockSchema = {
    type: "cta",
    label: "فراخوان اقدام",
    description:
        "بلاک CTA با عنوان، توضیح، دکمه اصلی و دکمه ثانویه برای هدایت کاربر به اقدام موردنظر",

    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "primaryButtonText", label: "متن دکمه اصلی", type: "text" },
        { key: "primaryButtonUrl", label: "لینک دکمه اصلی", type: "url" },
        { key: "secondaryButtonText", label: "متن دکمه ثانویه", type: "text" },
        { key: "secondaryButtonUrl", label: "لینک دکمه ثانویه", type: "url" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showPrimaryButton", label: "نمایش دکمه اصلی", type: "boolean" },
        { key: "showSecondaryButton", label: "نمایش دکمه ثانویه", type: "boolean" },
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
        primaryButton: {
            label: "دکمه اصلی",
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
        secondaryButton: {
            label: "دکمه ثانویه",
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