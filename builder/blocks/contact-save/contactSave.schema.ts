import type { BlockSchema } from "@/types/blocks/builder.types";

export const contactSaveSchema: BlockSchema = {
  type: "contactSave",
  label: "ذخیره مخاطب",
  description:
    "دکمه ساخت فایل مخاطب برای ذخیره نام، نام خانوادگی و شماره همراه در آیفون و اندروید.",
  elements: {
    container: {
      label: "قاب بلاک",
      allowedStyleKeys: [
        "backgroundColor",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },
    button: {
      label: "دکمه ذخیره مخاطب",
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
    icon: {
      label: "آیکون مخاطب",
      allowedStyleKeys: ["color", "backgroundColor", "borderRadius"],
    },
  },
  contentFields: [
    {
      key: "firstName",
      label: "نام",
      type: "text",
    },
    {
      key: "lastName",
      label: "نام خانوادگی",
      type: "text",
    },
    {
      key: "phoneNumber",
      label: "شماره همراه",
      type: "text",
    },
    {
      key: "organization",
      label: "نام سازمان یا مجموعه",
      type: "text",
    },
    {
      key: "buttonText",
      label: "متن دکمه",
      type: "text",
    },
    {
      key: "showIcon",
      label: "نمایش آیکون",
      type: "boolean",
    },
  ],
};
