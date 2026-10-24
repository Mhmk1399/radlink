import type { BlockSchema } from "@/types/blocks/builder.types";

export const gallerySchema: BlockSchema = {
  type: "gallery",
  label: "گالری تصاویر",
  description: "نمایش تصاویر با چیدمان شبکه‌ای قابل تنظیم و زیرنویس دلخواه.",
  contentFields: [
    { key: "title", label: "عنوان بخش", type: "text" },
    { key: "description", label: "توضیحات بخش", type: "textarea" },
    { key: "showTitle", label: "نمایش عنوان", type: "boolean" },
    { key: "showDescription", label: "نمایش توضیحات", type: "boolean" },
    { key: "showCaptions", label: "نمایش زیرنویس تصاویر", type: "boolean" },
    {
      key: "imageFit", label: "نحوه نمایش تصویر", type: "select",
      options: [
        { value: "cover", label: "پر کردن کادر (برش تصویر)" },
        { value: "contain", label: "نمایش کامل تصویر" },
      ],
    },
    {
      key: "spacing", label: "فاصله تصاویر", type: "select",
      options: [
        { value: "0", label: "بدون فاصله" },
        { value: "8", label: "کم" },
        { value: "16", label: "متوسط" },
        { value: "24", label: "زیاد" },
      ],
    },
    {
      key: "images", label: "تصاویر گالری", type: "repeater",
      itemLabel: "تصویر", addLabel: "افزودن تصویر", maxItems: 50,
      fields: [
        { key: "imageUrl", label: "تصویر", type: "image" },
        { key: "altText", label: "متن جایگزین تصویر", type: "text" },
        { key: "caption", label: "زیرنویس", type: "text" },
        { key: "enabled", label: "نمایش تصویر", type: "boolean", defaultValue: true },
      ],
    },
  ],
  elements: {
    container: { label: "کادر گالری", allowedStyleKeys: ["backgroundColor", "borderRadius", "borderColor", "borderWidth", "animation"] },
    title: { label: "عنوان بخش", allowedStyleKeys: ["color", "fontSize", "animation"] },
    description: { label: "توضیحات بخش", allowedStyleKeys: ["color", "fontSize"] },
    grid: { label: "چیدمان تصاویر", allowedStyleKeys: ["gridColumns"] },
    image: { label: "کادر تصاویر", allowedStyleKeys: ["height", "backgroundColor", "borderRadius", "borderColor", "borderWidth"] },
    caption: { label: "زیرنویس تصاویر", allowedStyleKeys: ["color", "fontSize"] },
  },
};
