import type { BlockSchema } from "@/types/blocks/builder.types";

export const mapLinksSchema: BlockSchema = {
    type: "mapLinks",
    label: "لینک نقشه",
    description: "نمایش لینک‌های نقشه و مسیریابی مانند گوگل مپ، نشان، بلد، ویز و اپل مپ",
    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "googleMapsUrl", label: "لینک گوگل مپ", type: "url" },
        { key: "neshanUrl", label: "لینک نشان", type: "url" },
        { key: "baladUrl", label: "لینک بلد", type: "url" },
         { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showGoogleMaps", label: "نمایش گوگل مپ", type: "boolean" },
        { key: "showNeshan", label: "نمایش نشان", type: "boolean" },
        { key: "showBalad", label: "نمایش بلد", type: "boolean" },
         { key: "openInNewTab", label: "باز شدن در تب جدید", type: "boolean" },
    ],
    elements: {
        container: {
            label: "کانتینر",
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
        mapButton: {
            label: "دکمه نقشه",
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
        icon: {
            label: "آیکون",
            allowedStyleKeys: [
                "color",
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        label: {
            label: "برچسب",
            allowedStyleKeys: ["color", "fontSize"],
        },
    },
};