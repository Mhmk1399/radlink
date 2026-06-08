import type { BlockSchema } from "@/types/blocks/builder.types";

export const bookingFormSchema: BlockSchema = {
    type: "bookingForm",
    label: "فرم رزرو",
    description: "فرم رزرو با نام، شماره تماس، ایمیل، تقویم فارسی و انتخاب ساعت.",
    contentFields: [
        { key: "title", label: "عنوان", type: "text" },
        { key: "description", label: "توضیحات", type: "textarea" },
        { key: "submitButtonText", label: "متن دکمه ثبت", type: "text" },
        { key: "successMessage", label: "پیام موفقیت", type: "text" },
        { key: "errorMessage", label: "پیام خطا", type: "text" },

        { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
        { key: "showEmail", label: "نمایش ایمیل", type: "boolean" },
        { key: "showNote", label: "نمایش توضیحات تکمیلی", type: "boolean" },
        { key: "requireEmail", label: "الزامی بودن ایمیل", type: "boolean" },
        { key: "requireNote", label: "الزامی بودن توضیحات", type: "boolean" },

    ],
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
        },
        title: {
            label: "عنوان",
            allowedStyleKeys: ["color", "fontSize", "animation"],
        },
        description: {
            label: "توضیحات",
            allowedStyleKeys: ["color", "fontSize"],
        },
        form: {
            label: "فرم",
            allowedStyleKeys: [
                "backgroundColor",
                "borderRadius",
                "borderColor",
                "borderWidth",
            ],
        },
        fieldLabel: {
            label: "برچسب فیلد",
            allowedStyleKeys: ["color", "fontSize"],
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
        },
    },
};