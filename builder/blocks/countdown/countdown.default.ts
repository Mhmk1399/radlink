import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultCountdownBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `countdown-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        type: "countdown",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },

        data: {
            title: "زمان باقی‌مانده تا پایان پیشنهاد",
            description: "این پیشنهاد برای مدت محدودی فعال است.",
            targetDate: "2026-12-31T23:59:59",
            expiredText: "زمان این پیشنهاد به پایان رسیده است.",
            buttonText: "استفاده از پیشنهاد",
            buttonUrl: "",
            showDescription: true,
            showButton: true,
            showLabels: true,
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
                    backgroundColor: { mobile: "#064789" },
                    borderRadius: { mobile: 24 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#ffffff" },
                    fontSize: { mobile: 22, tablet: 28, desktop: 34 },
                    animation: "none",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
            timerBox: {
                label: "جعبه تایمر",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    backgroundColor: { mobile: "rgba(235,242,250,0.08)" },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "rgba(235,242,250,0.12)" },
                    borderWidth: { mobile: 1 },
                },
            },
            timerNumber: {
                label: "عدد تایمر",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#ffffff" },
                    fontSize: { mobile: 24, tablet: 30, desktop: 36 },
                },
            },
            timerLabel: {
                label: "برچسب تایمر",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 11, tablet: 12, desktop: 12 },
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
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#EBF2FA" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            expiredText: {
                label: "متن پایان",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#ffffff" },
                    fontSize: { mobile: 16, tablet: 18, desktop: 20 },
                },
            },
        },
    };
}