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
            secondaryButtonText: "مشاهده    ",
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
                    backgroundColor: { mobile: "#064789" },
                    borderRadius: { mobile: 28 },
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
                    fontSize: { mobile: 26, tablet: 32, desktop: 38 },
                    animation: "slideUp",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#EBF2FA" },
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
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#EBF2FA" },
                    borderWidth: { mobile: 1 },
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
                    color: { mobile: "#EBF2FA" },
                    backgroundColor: { mobile: "transparent" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
        },
    };
}