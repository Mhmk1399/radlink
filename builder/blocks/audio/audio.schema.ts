import type { BlockSchema } from "@/types/blocks/builder.types";

export const audioSchema: BlockSchema = {
  type: "audio", label: "صوت و ویس",
  description: "چند فایل صوتی یا پیام صوتی ضبط‌شده با پخش‌کننده موجی.",
  contentFields: [
    { key: "title", label: "عنوان بخش", type: "text" },
    { key: "description", label: "توضیحات بخش", type: "textarea" },
    { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
    { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
    { key: "tracks", label: "فایل‌های صوتی و ویس", type: "repeater", itemLabel: "فایل صوتی", addLabel: "افزودن فایل صوتی", maxItems: 30,
      fields: [
        { key: "title", label: "نام فایل صوتی", type: "text" },
        { key: "audioUrl", label: "بارگذاری یا ضبط صدا", type: "audio" },
        { key: "caption", label: "توضیح", type: "textarea" },
        { key: "enabled", label: "نمایش فایل صوتی", type: "boolean", defaultValue: true },
      ],
    },
  ],
  elements: {
    container: { label: "کادر بخش صوتی", allowedStyleKeys: ["backgroundColor", "borderRadius", "borderColor", "borderWidth", "animation"] },
    title: { label: "عنوان بخش", allowedStyleKeys: ["color", "fontSize", "animation"] },
    description: { label: "توضیحات بخش", allowedStyleKeys: ["color", "fontSize"] },
    item: { label: "کارت صوتی", allowedStyleKeys: ["backgroundColor", "color", "borderRadius", "borderColor", "borderWidth"] },
    button: { label: "دکمه پخش", allowedStyleKeys: ["backgroundColor", "color"] },
    caption: { label: "توضیح فایل صوتی", allowedStyleKeys: ["color", "fontSize"] },
  },
};
