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
        { key: "showButtons", label: "نمایش دکمه داخل کارت‌ها", type: "boolean" },
        { key: "openInNewTab", label: "باز شدن لینک کارت‌ها در تب جدید", type: "boolean" },
        { key: "showBottomButtons", label: "نمایش دکمه‌های زیر کارت‌ها", type: "boolean" },
        { key: "showBottomPrimaryButton", label: "نمایش دکمه اول زیر کارت‌ها", type: "boolean" },
        { key: "bottomPrimaryButtonText", label: "متن دکمه اول زیر کارت‌ها", type: "text" },
        { key: "bottomPrimaryButtonUrl", label: "لینک دکمه اول زیر کارت‌ها", type: "url" },
        { key: "showBottomSecondaryButton", label: "نمایش دکمه دوم زیر کارت‌ها", type: "boolean" },
        { key: "bottomSecondaryButtonText", label: "متن دکمه دوم زیر کارت‌ها", type: "text" },
        { key: "bottomSecondaryButtonUrl", label: "لینک دکمه دوم زیر کارت‌ها", type: "url" },
        { key: "bottomButtonsOpenInNewTab", label: "باز شدن دکمه‌های زیر کارت‌ها در تب جدید", type: "boolean" },
        {
            key: "products",
            label: "محصولات",
            type: "repeater",
            itemLabel: "محصول",
            addLabel: "افزودن محصول جدید",
            maxItems: 20,
            fields: [
                {
                    key: "name",
                    label: "نام محصول",
                    type: "text",
                    defaultValue: "محصول جدید",
                },
                {
                    key: "description",
                    label: "توضیحات",
                    type: "textarea",
                    defaultValue:
                        "توضیح کوتاهی درباره ویژگی‌های این محصول  .",
                },
                { key: "imageUrl", label: "تصویر", type: "image" },
                {
                    key: "altText",
                    label: "متن جایگزین تصویر",
                    type: "text",
                    defaultValue: "تصویر محصول جدید",
                },
                {
                    key: "price",
                    label: "قیمت",
                    type: "text",
                    valueFormat: "persianPrice",
                    defaultValue: "۲۵۰٬۰۰۰ تومان",
                },
                {
                    key: "oldPrice",
                    label: "قیمت قبلی",
                    type: "text",
                    valueFormat: "persianPrice",
                    defaultValue: "۳۲۰٬۰۰۰ تومان",
                },
                {
                    key: "badgeText",
                    label: "متن نشان",
                    type: "text",
                    defaultValue: "جدید",
                },
                {
                    key: "buttonText",
                    label: "متن دکمه",
                    type: "text",
                    defaultValue: "مشاهده محصول",
                },
                { key: "productUrl", label: "لینک محصول", type: "url" },
                {
                    key: "accentColor",
                    label: "رنگ اکسنت",
                    type: "text",
                    defaultValue: "#0F172A",
                },
                {
                    key: "showBadge",
                    label: "نمایش نشان",
                    type: "boolean",
                    defaultValue: true,
                },
                {
                    key: "showOldPrice",
                    label: "نمایش قیمت قبلی",
                    type: "boolean",
                    defaultValue: true,
                },
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
            label: "دکمه داخل کارت",
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
        bottomButtonPrimary: {
            label: "دکمه اول زیر کارت‌ها",
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
        bottomButtonSecondary: {
            label: "دکمه دوم زیر کارت‌ها",
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
