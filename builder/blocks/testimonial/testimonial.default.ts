import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultTestimonialBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `testimonial-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        type: "testimonial",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },

        data: {
            quote:
                "تجربه همکاری با این مجموعه بسیار حرفه‌ای، سریع و قابل اعتماد بود.",
            name: "نام مشتری",
            role: "مشتری / مدیر مجموعه",
            avatarUrl: "",
            rating: 5,
            showAvatar: true,
            showRole: true,
            showRating: true,
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
                    borderRadius: { mobile: 20 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            quote: {
                label: "متن نظر",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#1f2937" },
                    fontSize: { mobile: 16 },
                    animation: "none",
                },
            },
            name: {
                label: "نام",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 16 },
                },
            },
            role: {
                label: "سمت",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#6b7280" },
                    fontSize: { mobile: 13 },
                },
            },
            avatar: {
                label: "آواتار",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    backgroundColor: { mobile: "#f3f4f6" },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 2 },
                },
            },
            rating: {
                label: "امتیاز",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#f59e0b" },
                    fontSize: { mobile: 18 },
                },
            },
        },
    };
}