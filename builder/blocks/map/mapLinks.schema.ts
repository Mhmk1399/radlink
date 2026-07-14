import type { BlockSchema } from "@/types/blocks/builder.types";

const mapProviderOptions = [
    { value: "googleMaps", label: "گوگل مپ" },
    { value: "neshan", label: "نشان" },
    { value: "balad", label: "بلد" },
    { value: "waze", label: "ویز" },
] as const;

export const mapLinksSchema: BlockSchema = {
    type: "mapLinks",
    label: "لینک نقشه",
    description:
        "نمایش لینک‌های نقشه و مسیریابی مانند گوگل مپ، نشان، بلد و غیره",
    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "googleMapsLabel", label: "لیبل گوگل مپ", type: "text" },
        { key: "googleMapsUrl", label: "لینک گوگل مپ", type: "url" },
        { key: "neshanLabel", label: "لیبل نشان", type: "text" },
        { key: "neshanUrl", label: "لینک نشان", type: "url" },
        { key: "baladLabel", label: "لیبل بلد", type: "text" },
        { key: "baladUrl", label: "لینک بلد", type: "url" },
        { key: "wazeLabel", label: "لیبل ویز", type: "text" },
        { key: "wazeUrl", label: "لینک ویز", type: "url" },
        {
            key: "mapItems",
            label: "لینک‌های نقشه اضافه",
            type: "repeater",
            itemLabel: "نقشه",
            addLabel: "افزودن نقشه",
            fields: [
                {
                    key: "provider",
                    label: "نوع نقشه",
                    type: "select",
                    defaultValue: "googleMaps",
                    options: mapProviderOptions,
                },
                { key: "label", label: "عنوان دکمه", type: "text" },
                { key: "url", label: "لینک نقشه", type: "url" },
                { key: "enabled", label: "نمایش", type: "boolean", defaultValue: true },
                { key: "brandColor", label: "رنگ برند", type: "color" },
                { key: "backgroundColor", label: "رنگ دکمه", type: "color" },
                { key: "textColor", label: "رنگ متن", type: "color" },
            ],
        },
        { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showGoogleMaps", label: "نمایش گوگل مپ", type: "boolean" },
        { key: "showNeshan", label: "نمایش نشان", type: "boolean" },
        { key: "showBalad", label: "نمایش بلد", type: "boolean" },
        { key: "showWaze", label: "نمایش ویز", type: "boolean" },
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
                "gridColumns",
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
