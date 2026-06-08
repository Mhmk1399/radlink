import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultSeparatorBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `separator-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;

    return {
        type: "separator",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: {
            direction: "rtl",
        },

        data: {
            variant: "solid",
            thickness: 1,
            width: 100,
            spacingY: 24,
            showOrnament: true,
        },

        elements: {
            container: {
                label: "کادر جداکننده",
                allowedStyleKeys: ["backgroundColor", "animation"],
                style: {
                    backgroundColor: {
                        mobile: "transparent",
                    },
                    animation: "none",
                },
            },

            line: {
                label: "خط",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    backgroundColor: {
                        mobile: "#d1d5db",
                    },
                    borderRadius: {
                        mobile: 999,
                    },
                    borderColor: {
                        mobile: "#d1d5db",
                    },
                    borderWidth: {
                        mobile: 1,
                    },
                    animation: "none",
                },
            },

            ornament: {
                label: "تزئین وسط",
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
                    color: {
                        mobile: "#9ca3af",
                    },
                    backgroundColor: {
                        mobile: "#ffffff",
                    },
                    fontSize: {
                        mobile: 18,
                        tablet: 20,
                        desktop: 22,
                    },
                    borderRadius: {
                        mobile: 999,
                    },
                    borderColor: {
                        mobile: "#e5e7eb",
                    },
                    borderWidth: {
                        mobile: 1,
                    },
                    animation: "none",
                },
            },
        },
    };
}