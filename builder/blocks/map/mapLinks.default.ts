import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultMapLinksBlock(order = 0): PageBlock {
    const blockType = "mapLinks";

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
            title: "مسیریابی و موقعیت مکانی",
            description:
                "برای مشاهده آدرس و مسیریابی، یکی از نقشه‌های زیر را انتخاب کنید.",

            googleMapsUrl: "",
            neshanUrl: "",
            baladUrl: "",
            wazeUrl: "",
            appleMapsUrl: "",

            showTitle: true,
            showDescription: true,
            showGoogleMaps: true,
            showNeshan: true,
            showBalad: true,
            showWaze: true,
            showAppleMaps: true,
            openInNewTab: true,
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
                    animation: "none",
                },
            },

            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 22, tablet: 26, desktop: 30 },
                    animation: "none",
                },
            },

            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#6b7280" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },

            mapButton: {
                label: "دکمه نقشه",
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
                    backgroundColor: { mobile: "#f9fafb" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },

            icon: {
                label: "آیکون",
                allowedStyleKeys: [
                    "color",
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    color: { mobile: "#111827" },
                    backgroundColor: { mobile: "#ffffff" },
                    borderRadius: { mobile: 12 },
                    borderColor: { mobile: "#e5e7eb" },
                    borderWidth: { mobile: 1 },
                },
            },

            label: {
                label: "متن دکمه",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
        },
    };
}