import type { BlockSchema } from "@/types/blocks/builder.types";

export const videoSchema: BlockSchema = {
    type: "video",
    label: "ویدئو",
    description:
        "بلاک نمایش ویدئو با عنوان، توضیح، پخش‌کننده و دکمه لینک",

    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "videoUrl", label: "فایل ویدئو", type: "video" },        // ← تغییر
        { key: "posterUrl", label: "تصویر پوستر", type: "image" },
        { key: "buttonText", label: "متن دکمه", type: "text" },
        { key: "buttonUrl", label: "لینک دکمه", type: "url" },
        { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showButton", label: "نمایش دکمه", type: "boolean" },
        { key: "controls", label: "نمایش کنترل‌ها", type: "boolean" },
        { key: "muted", label: "بی‌صدا", type: "boolean" },
        { key: "loop", label: "تکرار خودکار", type: "boolean" },
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
        video: {
            label: "ویدئو",
            allowedStyleKeys: ["borderRadius", "borderColor", "borderWidth"],
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
};