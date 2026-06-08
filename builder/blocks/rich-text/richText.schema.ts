import type { BlockSchema } from "@/types/blocks/builder.types";

export const richTextSchema: BlockSchema = {
    type: "richText",
    label: "متن",
    description:
        "بلاک متن ساده برای توضیحات، معرفی، درباره ما و محتوای متنی طولانی",

    contentFields: [
        {
            key: "title",
            label: "عنوان",
            type: "text",
        },
        {
            key: "content",
            label: "متن",
            type: "textarea",
        },
        {
            key: "showTitle",
            label: "نمایش عنوان",
            type: "boolean",
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
            label: "عنوان",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },

        content: {
            label: "متن",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
    },
};