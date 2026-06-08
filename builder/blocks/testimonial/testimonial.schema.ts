import type { BlockSchema } from "@/types/blocks/builder.types";

export const testimonialSchema: BlockSchema = {
    type: "testimonial",
    label: "نظر مشتری",
    description: "بلاک نمایش نظر و تجربه مشتری با آواتار، نام، سمت و امتیاز ستاره‌ای",

    contentFields: [
        { key: "quote", label: "متن نظر", type: "textarea" },
        { key: "name", label: "نام", type: "text" },
        { key: "role", label: "سمت / شرکت", type: "text" },
        { key: "avatarUrl", label: "تصویر پروفایل", type: "image" },
        { key: "showAvatar", label: "نمایش آواتار", type: "boolean" },
        { key: "showRole", label: "نمایش سمت", type: "boolean" },
        { key: "showRating", label: "نمایش امتیاز", type: "boolean" },
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
        quote: {
            label: "متن نظر",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        name: {
            label: "نام",
            allowedStyleKeys: ["color", "fontSize"],
        },
        role: {
            label: "سمت",
            allowedStyleKeys: ["color", "fontSize"],
        },
        avatar: {
            label: "آواتار",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        rating: {
            label: "امتیاز",
            allowedStyleKeys: ["color", "fontSize"],
        },
    },
};