import type { PageBlock } from "@/types/blocks/builder.types";

const blockType = "productCards";

export function createDefaultProductCardsBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${blockType}-${Date.now()}`;

    return {
        instanceId,
        type: blockType,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },
        data: {
            title: "محصولات پیشنهادی",
            description:
                "چند محصول منتخب را ببینید و برای مشاهده جزئیات روی هر مورد کلیک کنید.",
            showTitle: true,
            showDescription: true,
            showButtons: true,
            openInNewTab: true,
            products: [
                {
                    id: "product-1",
                    name: "محصول اول",
                    description: "توضیح کوتاه درباره ویژگی‌های محصول اول.",
                    imageUrl: "",
                    altText: "محصول اول",
                    price: "۲۵۰٬۰۰۰ تومان",
                    oldPrice: "۳۲۰٬۰۰۰ تومان",
                    badgeText: "پرفروش",
                    buttonText: "مشاهده محصول",
                    productUrl: "",
                    accentColor: "#111827",
                    showBadge: true,
                    showOldPrice: true,
                },
                {
                    id: "product-2",
                    name: "محصول دوم",
                    description: "توضیح کوتاه درباره ویژگی‌های محصول دوم.",
                    imageUrl: "",
                    altText: "محصول دوم",
                    price: "۴۹۰٬۰۰۰ تومان",
                    oldPrice: "",
                    badgeText: "جدید",
                    buttonText: "خرید محصول",
                    productUrl: "",
                    accentColor: "#2563eb",
                    showBadge: true,
                    showOldPrice: false,
                },
                {
                    id: "product-3",
                    name: "محصول سوم",
                    description: "توضیح کوتاه درباره ویژگی‌های محصول سوم.",
                    imageUrl: "",
                    altText: "محصول سوم",
                    price: "۹۹۰٬۰۰۰ تومان",
                    oldPrice: "۱٬۲۵۰٬۰۰۰ تومان",
                    badgeText: "تخفیف",
                    buttonText: "جزئیات بیشتر",
                    productUrl: "",
                    accentColor: "#dc2626",
                    showBadge: true,
                    showOldPrice: true,
                },
            ],
        },
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
                style: {
                    backgroundColor: { mobile: "#ffffff" },
                    borderRadius: { mobile: 24 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 1 },
                },
            },
            title: {
                label: "عنوان بخش",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 22, tablet: 26, desktop: 30 },
                },
            },
            description: {
                label: "توضیحات بخش",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#6b7280" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
            scrollArea: {
                label: "ناحیه اسکرول",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    backgroundColor: { mobile: "transparent" },
                    borderRadius: { mobile: 0 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                },
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
                style: {
                    backgroundColor: { mobile: "#ffffff" },
                    borderRadius: { mobile: 22 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 1 },
                },
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
                style: {
                    backgroundColor: { mobile: "#f3f4f6" },
                    borderRadius: { mobile: 18 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                },
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
                style: {
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "#111827" },
                    fontSize: { mobile: 11, tablet: 12, desktop: 12 },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                },
            },
            productName: {
                label: "نام محصول",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 16, tablet: 17, desktop: 18 },
                },
            },
            productDescription: {
                label: "توضیحات محصول",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#6b7280" },
                    fontSize: { mobile: 13, tablet: 14, desktop: 15 },
                },
            },
            price: {
                label: "قیمت",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 16, tablet: 18, desktop: 20 },
                },
            },
            oldPrice: {
                label: "قیمت قبلی",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#9ca3af" },
                    fontSize: { mobile: 12, tablet: 13, desktop: 14 },
                },
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
                style: {
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "#111827" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#111827" },
                    borderWidth: { mobile: 1 },
                },
            },
        },
    };
}