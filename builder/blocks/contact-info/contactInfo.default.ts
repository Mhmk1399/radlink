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
            phone: "09120000000",
            whatsapp: "989120000000",
            email: "info@example.com",
            address: "تهران، ایران",
            primaryButtonText: "تماس تلفنی",
            secondaryButtonText: "ارسال پیام",
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
                    backgroundColor: { mobile: "#EBF2FA" },
                    borderRadius: { mobile: 20 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#064789" },
                    fontSize: { mobile: 20 },
                    animation: "none",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#427AA1" },
                    fontSize: { mobile: 14 },
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
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 14 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#427AA1" },
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
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "#064789" },
                    fontSize: { mobile: 14 },
                    borderRadius: { mobile: 12 },
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
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 14 },
                    borderRadius: { mobile: 12 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
        },
    };
}