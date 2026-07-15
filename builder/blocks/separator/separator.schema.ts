import type { BlockSchema } from "@/types/blocks/builder.types";

export const separatorSchema: BlockSchema = {
    type: "separator",
    label: "جداکننده",
    description:
        "بلاک جداکننده تزئینی برای فاصله‌گذاری و تفکیک بخش‌های صفحه",

    contentFields: [
        {
            key: "variant",
            label: "نوع جداکننده",
            type: "select",
            options: [
                { value: "solid", label: "خط ساده" },
                { value: "dashed", label: "خط چین" },
                { value: "dotted", label: "نقطه‌چین" },
                { value: "double", label: "دو خطی" },
                { value: "fade", label: "محو شونده" },
                { value: "zigzag", label: "زیگزاگ" },
                { value: "wave", label: "موج" },
                { value: "diamond", label: "لوزی ◆" },
                { value: "star", label: "ستاره ✦" },
                { value: "dot-ornament", label: "سه‌نقطه ●" },
                { value: "arrow", label: "فلش ▼" },
                { value: "heart", label: "قلب ♥" },
                { value: "leaf", label: "برگ ❧" },
                { value: "sparkle", label: "درخشش ✧" },
            ],
        },
        { key: "thickness", label: "ضخامت (px)", type: "text" },
        { key: "width", label: "عرض (%)", type: "text" },
        { key: "spacingY", label: "فاصله عمودی (px)", type: "text" },
        { key: "showOrnament", label: "نمایش تزئین وسط", type: "boolean" },
    ],

    elements: {
        container: {
            label: "کادر بیرونی",
            allowedStyleKeys: ["backgroundColor", "animation"],
        },
        line: {
            label: "خط",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "animation",
            ],
        },
        ornament: {
            label: "تزئین",
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
