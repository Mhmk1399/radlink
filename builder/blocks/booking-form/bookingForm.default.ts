import type { PageBlock } from "@/types/blocks/builder.types";

const blockType = "bookingForm";

export function createDefaultBookingFormBlock(order: number): PageBlock {
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
            title: "رزرو وقت",
            description:
                "برای رزرو، اطلاعات خود را وارد کنید و تاریخ و ساعت موردنظر را انتخاب کنید.",
            submitButtonText: "ثبت رزرو",
            successMessage: "درخواست رزرو شما با موفقیت ثبت شد.",
            errorMessage: "ثبت رزرو انجام نشد. لطفاً دوباره تلاش کنید.",
            endpointUrl: "",
            showDescription: true,
            showEmail: true,
            showNote: true,
            requireEmail: false,
            requireNote: false,
            availableTimes: "09:00,10:00,11:00,12:00,16:00,17:00,18:00",
            disabledDates: "",
            minDate: "",
            maxDate: "",
            customFields: [],
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
                },
            },
            title: {
                label: "عنوان",
                allowedStyleKeys: ["color", "fontSize", "animation"],
                style: {
                    color: { mobile: "#064789" },
                    fontSize: { mobile: 24, tablet: 28, desktop: 34 },
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
            form: {
                label: "فرم",
                allowedStyleKeys: [
                    "backgroundColor",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    backgroundColor: { mobile: "#EBF2FA" },
                    borderRadius: { mobile: 20 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                },
            },
            fieldLabel: {
                label: "برچسب فیلد",
                allowedStyleKeys: ["color", "fontSize"],
                style: {
                    color: { mobile: "#064789" },
                    fontSize: { mobile: 13, tablet: 14, desktop: 14 },
                },
            },
            input: {
                label: "ورودی",
                allowedStyleKeys: [
                    "color",
                    "backgroundColor",
                    "fontSize",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                },
            },
            calendar: {
                label: "تقویم",
                allowedStyleKeys: [
                    "color",
                    "backgroundColor",
                    "fontSize",
                    "borderRadius",
                    "borderColor",
                    "borderWidth",
                ],
                style: {
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 14, tablet: 15, desktop: 16 },
                    borderRadius: { mobile: 18 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                },
            },
            timeSlot: {
                label: "ساعت رزرو",
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
                    color: { mobile: "#064789" },
                    backgroundColor: { mobile: "#EBF2FA" },
                    fontSize: { mobile: 13, tablet: 14, desktop: 15 },
                    borderRadius: { mobile: 999 },
                    borderColor: { mobile: "#427AA1" },
                    borderWidth: { mobile: 1 },
                },
            },
            submitButton: {
                label: "دکمه ثبت",
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
                    backgroundColor: { mobile: "#064789" },
                    fontSize: { mobile: 15, tablet: 16, desktop: 16 },
                    borderRadius: { mobile: 16 },
                    borderColor: { mobile: "#064789" },
                    borderWidth: { mobile: 1 },
                },
            },
            message: {
                label: "پیام",
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
                    backgroundColor: { mobile: "#427AA1" },
                    fontSize: { mobile: 13, tablet: 14, desktop: 14 },
                    borderRadius: { mobile: 14 },
                    borderColor: { mobile: "#064789" },
                    borderWidth: { mobile: 1 },
                },
            },
        },
    };
}
