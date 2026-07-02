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

            showTitle: true,
            showDescription: true,
            showGoogleMaps: true,
            showNeshan: true,
            showBalad: true,
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
                    "gridColumns",
                    "animation",
                ],
                style: {
                    backgroundColor: { mobile: "#FFFFFF" },
                    borderRadius: { mobile: 28 },
                    borderColor: { mobile: "#E2E8F0" },
                    borderWidth: { mobile: 1 },
                    gridColumns: { mobile: 1 },
                    animation: "none",
                },
            },

            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#0F172A" },
                    fontSize: { mobile: 22, tablet: 26, desktop: 30 },
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
                    color: { mobile: "#0F172A" },
                    backgroundColor: { mobile: "#F8FAFC" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                    borderRadius: { mobile: 20 },
                    borderColor: { mobile: "#E2E8F0" },
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
                    color: { mobile: "#475569" },
                    backgroundColor: { mobile: "#F1F5F9" },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                },
            },

            label: {
                label: "متن دکمه",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#0F172A" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
        },
    };
}