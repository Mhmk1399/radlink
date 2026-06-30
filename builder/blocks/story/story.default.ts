import type { PageBlock } from "@/types/blocks/builder.types";

const blockType = "storyHighlights";

export function createDefaultStoryHighlightsBlock(order: number): PageBlock {
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
            title: "استوری‌ها",
            showTitle: true,
            autoCloseSeconds: 10,
            showCaptions: true,
            stories: [
                {
                    id: "story-1",
                    title: "استوری اول",
                    caption: "کپشن کوتاه برای استوری اول",
                    imageUrl: "",
                    thumbnailUrl: "",
                    altText: "استوری اول",
                },
                {
                    id: "story-2",
                    title: "استوری دوم",
                    caption: "کپشن کوتاه برای استوری دوم",
                    imageUrl: "",
                    thumbnailUrl: "",
                    altText: "استوری دوم",
                },
                {
                    id: "story-3",
                    title: "استوری سوم",
                    caption: "کپشن کوتاه برای استوری سوم",
                    imageUrl: "",
                    thumbnailUrl: "",
                    altText: "استوری سوم",
                },
            ],
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
                },
            },
            title: {
                label: "عنوان بخش",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#064789" },
                    fontSize: { mobile: 20, tablet: 24, desktop: 28 },
                },
            },
            thumbnail: {
                label: "تصویر بندانگشتی",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    backgroundColor: { mobile: "#EBF2FA" },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 2 },
                },
            },
            thumbnailLabel: {
                label: "عنوان تصویر بندانگشتی",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#064789" },
                    fontSize: { mobile: 12, tablet: 13, desktop: 14 },
                },
            },
            viewer: {
                label: "نمایشگر استوری",
                allowedStyleKeys: [
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    borderRadius: { mobile: 0 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                },
            },
            progress: {
                label: "نوار پیشرفت",
                allowedStyleKeys: ["backgroundColor", "borderRadius"],
                style: {
                    backgroundColor: { mobile: "#EBF2FA" },
                    borderRadius: { mobile: 999 },
                },
            },
            storyImage: {
                label: "تصویر استوری",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    backgroundColor: { mobile: "#064789" },
                    borderRadius: { mobile: 18 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                },
            },
            caption: {
                label: "کپشن",
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
                    backgroundColor: { mobile: "rgba(6,71,137,0.35)" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 17 },
                    borderRadius: { mobile: 18 },
                    borderColor: { mobile: "rgba(235,242,250,0.12)" },
                    borderWidth: { mobile: 1 },
                },
            },
            navButton: {
                label: "دکمه ناوبری",
                allowedStyleKeys: [
                    "color",
                    "backgroundColor",
                    "fontSize",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "rgba(235,242,250,0.16)" },
                    fontSize: { mobile: 24, tablet: 28, desktop: 30 },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "rgba(235,242,250,0.18)" },
                    borderWidth: { mobile: 1 },
                },
            },
            closeButton: {
                label: "دکمه بستن",
                allowedStyleKeys: [
                    "color",
                    "backgroundColor",
                    "fontSize",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "rgba(235,242,250,0.16)" },
                    fontSize: { mobile: 20, tablet: 22, desktop: 24 },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "rgba(235,242,250,0.18)" },
                    borderWidth: { mobile: 1 },
                },
            },
        },
    };
}
