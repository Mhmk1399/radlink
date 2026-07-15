import type { BlockSchema } from "@/types/blocks/builder.types";

export const productCardsSchema: BlockSchema = {
    type: "productCards",
    label: "کارت محصولات",
    description:
        "نمایش چند محصول در یک ردیف اسکرولی با عکس، توضیح، قیمت و دکمه.",
    contentFields: [
        { key: "title", label: "عنوان بخش", type: "text" },
        { key: "description", label: "توضیحات بخش", type: "textarea" },
        { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showButtons", label: "نمایش دکمه‌ها", type: "boolean" },
        { key: "openInNewTab", label: "باز شدن در تب جدید", type: "boolean" },
        {
            key: "products",
            label: "محصولات",
            type: "repeater",
            itemLabel: "محصول",
            maxItems: 20,
            fields: [
                { key: "name", label: "نام محصول", type: "text" },
                { key: "description", label: "توضیحات", type: "textarea" },
                { key: "imageUrl", label: "تصویر", type: "image" },
                { key: "altText", label: "متن جایگزین تصویر", type: "text" },
                {
                    key: "price",
                    label: "قیمت",
                    type: "text",
                    valueFormat: "persianPrice",
                },
                {
                    key: "oldPrice",
                    label: "قیمت قبلی",
                    type: "text",
                    valueFormat: "persianPrice",
                },
                { key: "badgeText", label: "متن نشان", type: "text" },
                { key: "buttonText", label: "متن دکمه", type: "text" },
                { key: "productUrl", label: "لینک محصول", type: "url" },
                { key: "accentColor", label: "رنگ اکسنت", type: "text" },
                { key: "showBadge", label: "نمایش نشان", type: "boolean" },
                { key: "showOldPrice", label: "نمایش قیمت قبلی", type: "boolean" },
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
        description: {
            label: "توضیحات بخش",
            allowedStyleKeys: ["color", "fontSize"],
        },
        scrollArea: {
            label: "ناحیه اسکرول",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        card: {
            label: "کارت محصول",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        image: {
            label: "تصویر محصول",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
                "animation",
            ],
        },
        badge: {
            label: "نشان محصول",
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
        productName: {
            label: "نام محصول",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        productDescription: {
            label: "توضیحات محصول",
            allowedStyleKeys: ["color", "fontSize"],
        },
        price: {
            label: "قیمت",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        oldPrice: {
            label: "قیمت قبلی",
            allowedStyleKeys: ["color", "fontSize"],
        },
        button: {
            label: "دکمه محصول",
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
