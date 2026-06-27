import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultRichTextBlock(
    order: number,
): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `rich-text-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`;

    return {
        type: "richText",
        instanceId,
        order,
        version: 1,
        isActive: true,

        settings: {
            direction: "rtl",
        },

        data: {
            title: "عنوان متن",
            content:
                "اینجا متن اصلی خود را بنویسید. این بخش برای توضیحات، معرفی، درباره ما یا هر محتوای متنی دیگر مناسب است.",
            showTitle: true,
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
                    backgroundColor: {
                        mobile: "#EBF2FA",
                    },
                    borderRadius: {
                        mobile: 20,
                    },
                    borderColor: {
                        mobile: "#427AA1",
                    },
                    borderWidth: {
                        mobile: 1,
                    },
                    animation: "none",
                },
            },

            title: {
                label: "عنوان",
                allowedStyleKeys: [
                    "color",
                    "fontSize",
                    "animation",
                ],
                style: {
                    color: {
                        mobile: "#064789",
                    },
                    fontSize: {
                        mobile: 22,
                        tablet: 26,
                        desktop: 30,
                    },
                    animation: "none",
                },
            },

            content: {
                label: "متن",
                allowedStyleKeys: [
                    "color",
                    "fontSize",
                    "animation",
                ],
                style: {
                    color: {
                        mobile: "#427AA1",
                    },
                    fontSize: {
                        mobile: 15,
                        tablet: 16,
                        desktop: 17,
                    },
                    animation: "none",
                },
            },
        },
    };
}