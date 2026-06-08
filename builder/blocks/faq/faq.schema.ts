import type { BlockSchema } from "@/types/blocks/builder.types";

export const faqSchema: BlockSchema = {
    type: "faq",
    label: "سوالات پرتکرار",
    description:
        "بلاک سوالات متداول با عنوان، توضیح و آیتم‌های سوال/پاسخ آکاردئونی",

    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "allowMultipleOpen", label: "باز بودن همزمان چند سوال", type: "boolean" },
        {
            key: "items",
            label: "سوالات",
            type: "repeater",
            itemLabel: "سوال",
            addLabel: "افزودن سوال جدید",
            maxItems: 20,
            fields: [
                { key: "question", label: "سوال", type: "text" },
                { key: "answer", label: "پاسخ", type: "textarea" },
                { key: "isOpenByDefault", label: "باز به‌صورت پیش‌فرض", type: "boolean" },
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
            label: "عنوان",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        description: {
            label: "توضیحات",
            allowedStyleKeys: ["color", "fontSize"],
        },
        item: {
            label: "آیتم سوال",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        question: {
            label: "متن سوال",
            allowedStyleKeys: ["color", "fontSize"],
        },
        answer: {
            label: "متن پاسخ",
            allowedStyleKeys: ["color", "fontSize"],
        },
        icon: {
            label: "آیکون",
            allowedStyleKeys: ["color", "backgroundColor", "borderRadius"],
        },
    },
};