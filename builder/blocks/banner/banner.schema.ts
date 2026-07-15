import { BannerSchema } from "@/types/blocks/default.types";

export const bannerSchema: BannerSchema = {
    type: "banner",
    label: "بنر",
    description: "بنر تصویری یا رنگی برای معرفی، کمپین یا دعوت به اقدام",
    elements: {
        container: {
            label: "قاب اصلی",
            allowedStyleKeys: [
                "backgroundColor",
                "height",
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        overlay: {
            label: "پوشش تصویر",
            allowedStyleKeys: ["backgroundColor"],
        },
        title: {
            label: "عنوان",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        description: {
            label: "توضیحات",
            allowedStyleKeys: ["color", "fontSize"],
        },
        button: {
            label: "دکمه",
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
    contentFields: [
        {
            key: "title",
            label: "عنوان",
            type: "text",
        },
        {
            key: "description",
            label: "توضیحات",
            type: "textarea",
        },
        {
            key: "buttonText",
            label: "متن دکمه",
            type: "text",
        },
        {
            key: "buttonUrl",
            label: "لینک دکمه",
            type: "url",
        },
        {
            key: "imageUrl",
            label: "تصویر پس‌زمینه",
            type: "image",
        },
        {
            key: "imageLink",
            label: "لینک تصویر",
            type: "url",
        },
        {
            key: "showButton",
            label: "نمایش دکمه",
            type: "boolean",
        },
        {
            key: "showOverlay",
            label: "نمایش پوشش تصویر",
            type: "boolean",
        },
    ],
} as const;