import type { BlockSchema } from "@/types/blocks/builder.types";

export const storyHighlightsSchema: BlockSchema = {
    type: "storyHighlights",
    label: "استوری‌ها",
    description:
        "استوری‌های دایره‌ای شبیه اینستاگرام با نمایش تمام‌صفحه و اسلاید خودکار.",
    contentFields: [
        { key: "title", label: "عنوان بخش", type: "text" },
        { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
        { key: "showCaptions", label: "نمایش کپشن‌ها", type: "boolean" },
        {
            key: "stories",
            label: "استوری‌ها",
            type: "repeater",
            itemLabel: "استوری",
            maxItems: 20,
            fields: [
                { key: "title", label: "عنوان", type: "text" },
                { key: "caption", label: "کپشن", type: "textarea" },
                { key: "imageUrl", label: "تصویر اصلی", type: "image" },
                { key: "thumbnailUrl", label: "تصویر بندانگشتی", type: "image" },
                { key: "altText", label: "متن جایگزین تصویر", type: "text" },
            ],
        },
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
            label: "عنوان بخش",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        thumbnail: {
            label: "تصویر بندانگشتی",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        thumbnailLabel: {
            label: "عنوان تصویر بندانگشتی",
            allowedStyleKeys: ["color", "fontSize"],
        },
        viewer: {
            label: "نمایشگر استوری",
            allowedStyleKeys: [
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        progress: {
            label: "نوار پیشرفت",
            allowedStyleKeys: ["backgroundColor", "borderRadius"],
        },
        storyImage: {
            label: "تصویر استوری",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        caption: {
            label: "کپشن",
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
        navButton: {
            label: "دکمه ناوبری",
            allowedStyleKeys: [
                "color",
                "backgroundColor",
                "fontSize",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        closeButton: {
            label: "دکمه بستن",
            allowedStyleKeys: [
                "color",
                "backgroundColor",
                "fontSize",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
    },
};
