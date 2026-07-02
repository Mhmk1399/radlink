import type { BlockSchema } from "@/types/blocks/builder.types";

export const sliderSchema: BlockSchema = {
    type: "slider",
    label: "اسلایدر",
    description:
        "بلاک اسلایدر تصویری با عنوان، توضیح، دکمه، ناوبری، نقطه‌ها و قابلیت کشیدن",

    contentFields: [
        { key: "autoplay", label: "پخش خودکار", type: "boolean" },
        { key: "showDots", label: "نمایش نقطه‌ها", type: "boolean" },
        { key: "showArrows", label: "نمایش فلش‌ها", type: "boolean" },
        { key: "showButton", label: "نمایش دکمه", type: "boolean" },
        {
            key: "slides",
            label: "اسلایدها",
            type: "repeater",
            itemLabel: "اسلاید",
            addLabel: "افزودن اسلاید جدید",
            maxItems: 10,
            fields: [
                { key: "title", label: "عنوان", type: "text" },
                { key: "description", label: "توضیحات", type: "textarea" },
                { key: "buttonText", label: "متن دکمه", type: "text" },
                { key: "imageUrl", label: "تصویر پس‌زمینه", type: "image" },
                { key: "buttonUrl", label: "لینک دکمه", type: "url" },
                {
                    key: "overlayEnabled",
                    label: "پوشش تیره",
                    type: "boolean",
                },
            ],
        },
    ],

    elements: {
        container: {
            label: "کادر اسلایدر",
            allowedStyleKeys: [
                "backgroundColor",
                "height",           // ← added
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        overlay: {
            label: "پوشش",
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
        arrow: {
            label: "فلش ناوبری",
            allowedStyleKeys: [
                "color",
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        dot: {
            label: "نقطه",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
    },
};