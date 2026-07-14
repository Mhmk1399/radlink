import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultContactInfoBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `contactInfo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        type: "contactInfo",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },

        data: {
            title: "راه‌های ارتباطی",
            description:
                "برای دریافت مشاوره، سفارش یا هماهنگی می‌توانید از راه‌های زیر با ما در ارتباط باشید.",
            phoneLabel: "تلفن",
            phone: "09120000000",
            whatsappLabel: "واتساپ",
            whatsapp: "989120000000",
            emailLabel: "ایمیل",
            email: "info@example.com",
            address: "تهران، ایران",
            primaryButtonText: "تماس تلفنی",
            secondaryButtonText: "ارسال پیام",
            addressLabel: "آدرس",
            contactItems: [],
            showDescription: true,
            showPhone: true,
            showWhatsapp: true,
            showEmail: true,
            showAddress: true,
            showButtons: true,
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
                    backgroundColor: { mobile: "#FFFFFF" },
                    borderRadius: { mobile: 24 },
                    borderColor: { mobile: "#E2E8F0" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#0F172A" },
                    fontSize: { mobile: 22, tablet: 24, desktop: 28 },
                    animation: "none",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#64748B" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
            item: {
                label: "آیتم تماس",
                allowedStyleKeys: [
                    "color",
                    "backgroundColor",
                    "fontSize",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    color: { mobile: "#0F172A" },
                    backgroundColor: { mobile: "#F8FAFC" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 15 },
                    borderRadius: { mobile: 18 },
                    borderColor: { mobile: "#E2E8F0" },
                    borderWidth: { mobile: 1 },
                },
            },
            buttonPrimary: {
                label: "دکمه اول",
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
                    color: { mobile: "#FFFFFF" },
                    backgroundColor: { mobile: "#0F172A" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 15 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                    animation: "none",
                },
            },
            buttonSecondary: {
                label: "دکمه دوم",
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
                    fontSize: { mobile: 14, tablet: 15, desktop: 15 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#CBD5E1" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
        },
    };
}
