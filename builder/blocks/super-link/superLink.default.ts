// src/builder/blocks/super-link/superLink.default.ts

import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultSuperLinkBlock(order = 0): PageBlock {
    const blockType = "superLink";

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
            title: "لینک ویژه",
            description: "برای مشاهده اطلاعات بیشتر روی این لینک کلیک کنید.",
            url: "",
            iconName: "link",
            iconAnimation: "none",
            showDescription: true,
            showArrow: true,
            openInNewTab: true,
        },
        elements: {
            container: {
                label: "کانتینر",
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
                    backgroundColor: { mobile: "#ffffff" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 20 },
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
                    "fontSize",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "#111827" },
                    fontSize: { mobile: 20, tablet: 22, desktop: 24 },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "#111827" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#111827" },
                    fontSize: { mobile: 16, tablet: 17, desktop: 18 },
                    animation: "none",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#6b7280" },
                    fontSize: { mobile: 13, tablet: 14, desktop: 15 },
                },
            },
            arrow: {
                label: "فلش",
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
                    color: { mobile: "#6b7280" },
                    backgroundColor: { mobile: "transparent" },
                    fontSize: { mobile: 18, tablet: 20, desktop: 22 },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "transparent" },
                    borderWidth: { mobile: 0 },
                    animation: "none",
                },
            },
        },
    };
}