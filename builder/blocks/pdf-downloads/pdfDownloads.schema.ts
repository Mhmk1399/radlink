import type { BlockSchema } from "@/types/blocks/builder.types";

export const pdfDownloadsSchema: BlockSchema = {
  type: "pdfDownloads",
  label: "دانلود PDF",
  description:
    "نمایش چند فایل PDF با کارت دانلود، عنوان، توضیح و چینش قابل تنظیم.",
  contentFields: [
    { key: "title", label: "عنوان بخش", type: "text" },
    { key: "description", label: "توضیحات بخش", type: "textarea" },
    { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
    { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
    {
      key: "openInNewTab",
      label: "باز شدن فایل در تب جدید",
      type: "boolean",
    },
    {
      key: "documents",
      label: "فایل‌های PDF",
      type: "repeater",
      itemLabel: "PDF",
      addLabel: "افزودن فایل PDF",
      fields: [
        {
          key: "title",
          label: "عنوان فایل",
          type: "text",
          defaultValue: "کاتالوگ جدید",
        },
        {
          key: "description",
          label: "توضیحات فایل",
          type: "textarea",
          defaultValue: "توضیح کوتاهی درباره محتوای این فایل PDF بنویسید.",
        },
        { key: "fileUrl", label: "آپلود یا لینک فایل PDF", type: "file" },
        {
          key: "fileSize",
          label: "حجم فایل",
          type: "text",
          defaultValue: "PDF",
        },
        {
          key: "badgeText",
          label: "متن نشان",
          type: "text",
          defaultValue: "PDF",
        },
        {
          key: "downloadText",
          label: "متن دکمه دانلود",
          type: "text",
          defaultValue: "دانلود فایل",
        },
        {
          key: "enabled",
          label: "نمایش این فایل",
          type: "boolean",
          defaultValue: true,
        },
      ],
    },
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
      label: "عنوان بخش",
      allowedStyleKeys: ["color", "fontSize", "animation"],
    },
    description: {
      label: "توضیحات بخش",
      allowedStyleKeys: ["color", "fontSize"],
    },
    list: {
      label: "چینش فایل‌ها",
      allowedStyleKeys: [
        "layoutMode",
        "gridColumns",
        "backgroundColor",
        "borderRadius",
        "borderColor",
        "borderWidth",
      ],
    },
    card: {
      label: "کارت PDF",
      allowedStyleKeys: [
        "backgroundColor",
        "borderRadius",
        "borderColor",
        "borderWidth",
        "animation",
      ],
    },
    icon: {
      label: "آیکون فایل",
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
    fileTitle: {
      label: "عنوان فایل",
      allowedStyleKeys: ["color", "fontSize", "animation"],
    },
    fileDescription: {
      label: "توضیحات فایل",
      allowedStyleKeys: ["color", "fontSize"],
    },
    meta: {
      label: "اطلاعات فایل",
      allowedStyleKeys: ["color", "backgroundColor", "fontSize", "borderRadius"],
    },
    badge: {
      label: "نشان PDF",
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
    button: {
      label: "دکمه دانلود",
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
