import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultVideoBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        type: "video",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },

        data: {
            title: "ویدئوی معرفی",
            description:
                "در این ویدئو می‌توانید با خدمات، نمونه‌کارها یا پیشنهاد ما بیشتر آشنا شوید.",
            videoUrl: "",
            posterUrl: "",
            buttonText: "مشاهده جزئیات",
            buttonUrl: "",
            showTitle: true,
            showDescription: true,
            showButton: true,
            controls: true,
            muted: false,
            loop: false,
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
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 20 },
                    animation: "none",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#6b7280" },
                    fontSize: { mobile: 14 },
                },
            },
            video: {
                label: "ویدئو",
                allowedStyleKeys: ["borderRadius", "borderColor", "borderWidth"],
                style: {
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 0 },
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
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "#111827" },
                    fontSize: { mobile: 14 },
                    borderRadius: { mobile: 12 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                    animation: "none",
                },
            },
        },
    };
}