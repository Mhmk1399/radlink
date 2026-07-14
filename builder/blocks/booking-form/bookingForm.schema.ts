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
        { key: "availableTimes", label: "ساعت‌های قابل رزرو", type: "textarea" },
        { key: "disabledDates", label: "تاریخ‌های غیرفعال", type: "textarea" },
        { key: "minDate", label: "حداقل تاریخ مجاز", type: "text" },
        { key: "maxDate", label: "حداکثر تاریخ مجاز", type: "text" },
        { key: "endpointUrl", label: "آدرس API خارجی اختیاری", type: "url" },
        {
            key: "customFields",
            label: "فیلدهای اضافه رزرو",
            type: "repeater",
            itemLabel: "فیلد",
            addLabel: "افزودن فیلد",
            fields: [
                { key: "label", label: "عنوان نمایشی", type: "text" },
                { key: "value", label: "مقدار پیش‌فرض", type: "text" },
                { key: "required", label: "اجباری", type: "boolean", defaultValue: false },
                { key: "enabled", label: "نمایش", type: "boolean", defaultValue: true },
            ],
        },

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
