import type { BlockSchema } from "@/types/blocks/builder.types";

export const simpleLinkSchema: BlockSchema = {
    type: "simpleLink",
    label: "لینک ساده",
    description: "یک کارت لینک قابل کلیک برای هدایت کاربر به صفحه یا آدرس دلخواه",
    elements: {
        container: {
            label: "قاب لینک",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        title: {
            label: "عنوان لینک",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        description: {
            label: "توضیحات لینک",
            allowedStyleKeys: ["color", "fontSize"],
        },
        icon: {
            label: "آیکون",
            allowedStyleKeys: ["color", "backgroundColor", "borderRadius"],
        },
    },
    contentFields: [
        {
            key: "title",
            label: "عنوان لینک",
            type: "text",
        },
        {
            key: "description",
            label: "توضیحات",
            type: "textarea",
        },
        {
            key: "url",
            label: "آدرس لینک",
            type: "url",
        },
        {
            key: "showDescription",
            label: "نمایش توضیحات",
            type: "boolean",
        },
    ],
};