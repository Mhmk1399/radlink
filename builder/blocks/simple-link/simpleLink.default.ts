import type { PageBlock } from "@/types/blocks/builder.types";

function generateInstanceId(): string {
    if (
        typeof globalThis !== "undefined" &&
        globalThis.crypto &&
        typeof globalThis.crypto.randomUUID === "function"
    ) {
        return globalThis.crypto.randomUUID();
    }

    return `simple-link-${Date.now()}`;
}

export function createDefaultSimpleLinkBlock(order = 0): PageBlock {
    return {
        instanceId: generateInstanceId(),
        blockId: "simpleLink",
        type: "simpleLink",
        version: 1,
        order,
        isActive: true,
        data: {
            title: "لینک مهم",
            description: "توضیح کوتاه درباره این لینک",
            url: "",
            showDescription: true,
        },
        settings: {
            direction: "rtl",
        },
        elements: {
            container: {
                label: "قاب لینک",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    backgroundColor: { mobile: "#ffffff" },
                    borderRadius: { mobile: 18 },
                    borderColor: { mobile: "rgba(15, 23, 42, 0.12)" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            title: {
                label: "عنوان لینک",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#0f172a" },
                    fontSize: { mobile: 16, tablet: 17, desktop: 18 },
                    animation: "none",
                },
            },
            description: {
                label: "توضیحات لینک",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "rgba(15, 23, 42, 0.65)" },
                    fontSize: { mobile: 13, tablet: 14, desktop: 14 },
                },
            },
            icon: {
                label: "آیکون",
                allowedStyleKeys: ["color", "backgroundColor", "borderRadius"],
                style: {
                    color: { mobile: "#ffffff" },
                    backgroundColor: { mobile: "#2563eb" },
                    borderRadius: { mobile: 12 },
                },
            },
        },
    };
}