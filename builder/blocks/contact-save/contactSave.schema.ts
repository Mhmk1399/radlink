import type { BlockSchema } from "@/types/blocks/builder.types";

export const contactSaveSchema: BlockSchema = {
  type: "contactSave",
  label: "ذخیره مخاطب",
  description:
    "دکمه ساخت فایل مخاطب برای ذخیره نام، نام خانوادگی، شماره همراه، ایمیل، آدرس و لینک در آیفون و اندروید.",
  elements: {
    container: {
      label: "قاب بلاک",
      allowedStyleKeys: [],
    },
    button: {
      label: "دکمه ذخیره مخاطب",
      allowedStyleKeys: [],
    },
    icon: {
      label: "آیکون مخاطب",
      allowedStyleKeys: [],
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
      key: "email",
      label: "ایمیل",
      type: "text",
    },
    {
      key: "address",
      label: "آدرس",
      type: "text",
    },
    {
      key: "url",
      label: "لینک وب‌سایت",
      type: "text",
    },
    {
      key: "organization",
      label: "نام سازمان یا مجموعه",
      type: "text",
    },

  ],
};
