import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultCtaBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `cta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        type: "cta",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },

        data: {
            title: "آماده شروع هستید؟",
            description:
                "همین حالا اقدام کنید و اولین قدم را برای دریافت خدمات یا ثبت سفارش بردارید.",
            primaryButtonText: "شروع کنید",
            primaryButtonUrl: "",
            secondaryButtonText: "مشاهده بیشتر",
            secondaryButtonUrl: "",
            showDescription: true,
            showPrimaryButton: true,
            showSecondaryButton: true,
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
                    backgroundColor: { mobile: "#0F172A" },
                    borderRadius: { mobile: 28 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                    animation: "none",
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#FFFFFF" },
                    fontSize: { mobile: 26, tablet: 32, desktop: 38 },
                    animation: "slideUp",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "rgba(255,255,255,0.72)" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 17 },
                },
            },
            primaryButton: {
                label: "دکمه اصلی",
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
                    color: { mobile: "#0F172A" },
                    backgroundColor: { mobile: "#FFFFFF" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                    animation: "none",
                },
            },
            secondaryButton: {
                label: "دکمه ثانویه",
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
                    color: { mobile: "rgba(255,255,255,0.88)" },
                    backgroundColor: { mobile: "rgba(255,255,255,0.08)" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "rgba(255,255,255,0.18)" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
        },
    };
}