import type { BlockSchema } from "@/types/blocks/builder.types";

const contactItemTypeOptions = [
  { value: "phone", label: "تلفن" },
  { value: "whatsapp", label: "واتساپ" },
  { value: "email", label: "ایمیل" },
  { value: "address", label: "آدرس" },
  { value: "link", label: "لینک" },
] as const;

export const contactInfoSchema: BlockSchema = {
  type: "contactInfo",
  label: "اطلاعات تماس",
  description:
    "بلاک نمایش راه‌های ارتباطی شامل تلفن، واتساپ، ایمیل، آدرس و دکمه‌های اقدام.",

  contentFields: [
    { key: "title", label: "عنوان", type: "text" },
    { key: "description", label: "توضیحات", type: "textarea" },
    { key: "phoneLabel", label: "لیبل تلفن", type: "text" },
    { key: "phone", label: "شماره تلفن", type: "text" },
    { key: "whatsappLabel", label: "لیبل واتساپ", type: "text" },
    { key: "whatsapp", label: "شماره واتساپ", type: "text" },
    { key: "emailLabel", label: "لیبل ایمیل", type: "text" },
    { key: "email", label: "ایمیل", type: "text" },
    { key: "addressLabel", label: "لیبل آدرس", type: "text" },
    { key: "address", label: "آدرس", type: "textarea" },
    {
      key: "contactItems",
      label: "راه‌های تماس اضافه",
      type: "repeater",
      itemLabel: "راه تماس",
      addLabel: "افزودن راه تماس",
      fields: [
        {
          key: "type",
          label: "نوع راه تماس",
          type: "select",
          defaultValue: "phone",
          options: contactItemTypeOptions,
        },
        { key: "label", label: "لیبل", type: "text" },
        { key: "value", label: "مقدار", type: "text" },
        { key: "enabled", label: "نمایش", type: "boolean", defaultValue: true },
        { key: "backgroundColor", label: "رنگ آیتم", type: "color" },
        { key: "textColor", label: "رنگ متن", type: "color" },
      ],
    },
    { key: "primaryButtonText", label: "متن دکمه اول", type: "text" },
    { key: "secondaryButtonText", label: "متن دکمه دوم", type: "text" },
    { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
    { key: "showPhone", label: "نمایش تلفن", type: "boolean" },
    { key: "showWhatsapp", label: "نمایش واتساپ", type: "boolean" },
    { key: "showEmail", label: "نمایش ایمیل", type: "boolean" },
    { key: "showAddress", label: "نمایش آدرس", type: "boolean" },
    { key: "showButtons", label: "نمایش دکمه‌ها", type: "boolean" },
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
    item: {
      label: "آیتم تماس",
      allowedStyleKeys: [
        "color",
        "backgroundColor",
        "fontSize",
        "borderRadius",
        "borderColor",
        "borderWidth",
      ],
    },
    buttonPrimary: {
      label: "دکمه اول",
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
    buttonSecondary: {
      label: "دکمه دوم",
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
  },
};
