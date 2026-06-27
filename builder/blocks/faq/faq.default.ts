import type { PageBlock } from "@/types/blocks/builder.types";

export function createDefaultFAQBlock(order: number): PageBlock {
    const instanceId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `faq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        type: "faq",
        instanceId,
        order,
        version: 1,
        isActive: true,
        settings: { direction: "rtl" },

        data: {
            title: "سوالات پرتکرار",
            description: "پاسخ چند سوال مهم و رایج را اینجا ببینید.",
            showDescription: true,
            allowMultipleOpen: false,
            items: [
                {
                    id: "faq-1",
                    question: "چطور می‌توانم سفارش ثبت کنم؟",
                    answer:
                        "برای ثبت سفارش کافی است از طریق دکمه‌های ارتباطی یا فرم تماس با ما در ارتباط باشید.",
                    isOpenByDefault: true,
                },
                {
                    id: "faq-2",
                    question: "زمان پاسخ‌گویی چقدر است؟",
                    answer:
                        "معمولاً در کوتاه‌ترین زمان ممکن پاسخ‌گوی پیام‌ها و درخواست‌های شما هستیم.",
                    isOpenByDefault: false,
                },
                {
                    id: "faq-3",
                    question: "آیا امکان مشاوره قبل از سفارش وجود دارد؟",
                    answer:
                        "بله، قبل از ثبت سفارش می‌توانید برای دریافت راهنمایی و مشاوره با ما تماس بگیرید.",
                    isOpenByDefault: false,
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
                    borderRadius: { mobile: 24 },
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
                    fontSize: { mobile: 24, tablet: 28, desktop: 34 },
                    animation: "none",
                },
            },
            description: {
                label: "توضیحات",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#427AA1" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
            item: {
                label: "آیتم سوال",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                    "animation",
                ],
                style: {
                    backgroundColor: { mobile: "#EBF2FA" },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                    animation: "none",
                },
            },
            question: {
                label: "متن سوال",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#064789" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 17 },
                },
            },
            answer: {
                label: "متن پاسخ",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#427AA1" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                },
            },
            icon: {
                label: "آیکون",
                allowedStyleKeys: ["color", "backgroundColor", "borderRadius"],
                style: {
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    borderRadius: { mobile: 999 },
                },
            },
        },
    };
}