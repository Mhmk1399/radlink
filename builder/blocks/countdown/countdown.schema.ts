import type { BlockSchema } from "@/types/blocks/builder.types";

export const countdownSchema: BlockSchema = {
    type: "countdown",
    label: "شمارش معکوس",
    description:
        "بلاک شمارش معکوس برای کمپین‌ها، پیشنهادات ویژه، رویدادها یا ددلاین‌ها",

    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "targetDate", label: "تاریخ پایان", type: "datetime" },   // ← تغییر
        { key: "expiredText", label: "متن پایان زمان", type: "text" },
        { key: "buttonText", label: "متن دکمه", type: "text" },
        { key: "buttonUrl", label: "لینک دکمه", type: "url" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showButton", label: "نمایش دکمه", type: "boolean" },
        { key: "showLabels", label: "نمایش برچسب‌ها", type: "boolean" },
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
        timerBox: {
            label: "جعبه تایمر",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        timerNumber: {
            label: "عدد تایمر",
            allowedStyleKeys: ["color", "fontSize"],
        },
        timerLabel: {
            label: "برچسب تایمر",
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
        expiredText: {
            label: "متن پایان",
            allowedStyleKeys: ["color", "fontSize"],
        },
    },
};