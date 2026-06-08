import type { PageBlock } from "../../../types/blocks/banner.types";

function generateInstanceId(): string {
    if (
        typeof globalThis !== "undefined" &&
        globalThis.crypto &&
        typeof globalThis.crypto.randomUUID === "function"
    ) {
        return globalThis.crypto.randomUUID();
    }

    return `banner-${Date.now()}`;
}

export function createDefaultBannerBlock(order = 0): PageBlock {
    return {
        instanceId: generateInstanceId(),
        blockId: "banner",
        type: "banner",
        version: 1,
        order,
        isActive: true,
        data: {
            title: "عنوان بنر شما",
            description:
                "اینجا توضیح کوتاهی درباره خدمات، پیشنهاد یا معرفی برند خود بنویسید.",
            buttonText: "مشاهده بیشتر",
            buttonUrl: "",
            imageUrl: "",
            showButton: true,
            showOverlay: true,
        },
        settings: {
            direction: "rtl",
        },
        elements: {
            container: {
                label: "قاب اصلی",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    backgroundColor: { mobile: "#0f172a" },
                    borderRadius: { mobile: 24 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                    animation: "none",
                },
            },
            overlay: {
                label: "پوشش تصویر",
                allowedStyleKeys: ["backgroundColor"],
                style: {
                    backgroundColor: { mobile: "rgba(15, 23, 42, 0.45)" },
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#ffffff" },
                    fontSize: { mobile: 28, tablet: 36, desktop: 44 },
                    animation: "slideUp",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "rgba(255, 255, 255, 0.92)" },
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
                    color: { mobile: "#111827" },
                    backgroundColor: { mobile: "#ffffff" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 12 },
                    borderColor: { mobile: "#ffffff" },
                    borderWidth: { mobile: 1 },
                    animation: "pulse",
                },
            },
        },
    };
}