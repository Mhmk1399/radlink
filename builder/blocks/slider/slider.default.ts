import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultSliderBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `slider-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        type: "slider",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },

        data: {
            autoplay: true,
            interval: 5000,
            showDots: true,
            showArrows: true,
            showButton: true,
            slides: [
                {
                    id: "slide-1",
                    title: "عنوان اسلاید اول",
                    description:
                        "اینجا توضیح کوتاهی برای معرفی خدمات، کمپین یا پیشنهاد خود بنویسید.",
                    buttonText: "مشاهده بیشتر",
                    buttonUrl: "",
                    imageUrl: "",
                    overlayEnabled: true,
                },
                {
                    id: "slide-2",
                    title: "عنوان اسلاید دوم",
                    description:
                        "متن اسلاید دوم را اینجا وارد کنید و تصویر پس‌زمینه دلخواه خود را قرار دهید.",
                    buttonText: "شروع کنید",
                    buttonUrl: "",
                    imageUrl: "",
                    overlayEnabled: true,
                },
            ],
        },

        elements: {
            container: {
                label: "کادر اسلایدر",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    backgroundColor: { mobile: "#064789" },
                    borderRadius: { mobile: 28 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            overlay: {
                label: "پوشش",
                allowedStyleKeys: ["backgroundColor"],
                style: {
                    backgroundColor: { mobile: "rgba(6,71,137,0.45)" },
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#ffffff" },
                    fontSize: { mobile: 28, tablet: 36, desktop: 46 },
                    animation: "slideUp",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 15, tablet: 17, desktop: 18 },
                },
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
                style: {
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#EBF2FA" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            arrow: {
                label: "فلش ناوبری",
                allowedStyleKeys: [
                    "color",
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "rgba(6,71,137,0.35)" },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "rgba(235,242,250,0.2)" },
                    borderWidth: { mobile: 1 },
                },
            },
            dot: {
                label: "نقطه",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    backgroundColor: { mobile: "rgba(235,242,250,0.55)" },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                },
            },
        },
    };
}