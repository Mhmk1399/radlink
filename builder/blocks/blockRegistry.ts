// src/builder/blocks/blockRegistry.ts

import { BannerBlock } from "./banner/BannerBlock";
import { createDefaultBannerBlock } from "./banner/banner.default";
import { bannerSchema } from "./banner/banner.schema";

import { SimpleLinkBlock } from "./simple-link/SimpleLinkBlock";
import { createDefaultSimpleLinkBlock } from "./simple-link/simpleLink.default";
import { simpleLinkSchema } from "./simple-link/simpleLink.schema";

import { testimonialSchema } from "./testimonial/testimonial.schema";
import { createDefaultTestimonialBlock } from "./testimonial/testimonial.default";
import { TestimonialBlock } from "./testimonial/TestimonialBlock";

import { videoSchema } from "./videos/video.schema";
import { createDefaultVideoBlock } from "./videos/video.default";
import { VideoBlock } from "./videos/VideoBlock";

import { contactInfoSchema } from "./contact-info/contactInfo.schema";
import { createDefaultContactInfoBlock } from "./contact-info/contactInfo.default";
import { ContactInfoBlock } from "./contact-info/ContactInfoBlock";
import { contactSaveSchema } from "./contact-save/contactSave.schema";
import { createDefaultContactSaveBlock } from "./contact-save/contactSave.default";
import { ContactSaveBlock } from "./contact-save/ContactSaveBlock";

import { ctaSchema } from "./CTA/cta.schema";
import { createDefaultCtaBlock } from "./CTA/cta.default";
import { CTABlock } from "./CTA/CTABlock";

import { countdownSchema } from "./countdown/countdown.schema";
import { createDefaultCountdownBlock } from "./countdown/countdown.default";
import { CountdownBlock } from "./countdown/CountdownBlock";

import { faqSchema } from "./faq/faq.schema";
import { FAQBlock } from "./faq/FAQBlock";
import { createDefaultFAQBlock } from "./faq/faq.default";

import { richTextSchema } from "./rich-text/richText.schema";
import { RichTextBlock } from "./rich-text/RichTextBlock";
import { createDefaultRichTextBlock } from "./rich-text/richText.default";

import { SliderBlock } from "./slider/SliderBlock";
import { createDefaultSliderBlock } from "./slider/slider.default";
import { sliderSchema } from "./slider/slider.schema";

import { separatorSchema } from "./separator/separator.schema";
import { createDefaultSeparatorBlock } from "./separator/separator.default";
import { SeparatorBlock } from "./separator/SeparatorBlock";

import MapLinksBlock from "./map/MapLinksBlock";
import { mapLinksSchema } from "./map/mapLinks.schema";
import { createDefaultMapLinksBlock } from "./map/mapLinks.default";

import SuperLinkBlock from "./super-link/SuperLinkBlock";
import { createDefaultSuperLinkBlock } from "./super-link/superLink.default";
import { superLinkSchema } from "./super-link/superLink.schema";
import MessengerLinksBlock from "./messenger/MessengerLinksBlock";
import { messengerLinksSchema } from "./messenger/messengerLinks.schema";
import { createDefaultMessengerLinksBlock } from "./messenger/messengerLinks.default";
import { storyHighlightsSchema } from "./story/story.schema";
import { createDefaultStoryHighlightsBlock } from "./story/story.default";
import StoryHighlightsBlock from "./story/StoryBlock";
import ProductCardsBlock from "./product-cards/ProductCardsBlock";
import { productCardsSchema } from "./product-cards/productCards.schema";
import { createDefaultProductCardsBlock } from "./product-cards/productCards.default";
import BookingFormBlock from "./booking-form/BookingFormBlock";
import { bookingFormSchema } from "./booking-form/bookingForm.schema";
import { createDefaultBookingFormBlock } from "./booking-form/bookingForm.default";

import React from "react";
import type {
  BlockSchema,
  EditableStyleKey,
  PageBlock,
} from "@/types/blocks/builder.types";
import {
  HiOutlinePhoto,
  HiOutlineRectangleGroup,
  HiOutlineLink,
  HiOutlineBolt,
  HiOutlineFilm,
  HiOutlineDocumentText,
  HiOutlineStar,
  HiOutlineQuestionMarkCircle,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineRocketLaunch,
  HiOutlineClock,
  HiOutlineMinus,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePlayCircle,
  HiOutlineShoppingBag,
  HiOutlineCalendarDays,
  HiOutlineUserPlus,
} from "react-icons/hi2";

const SHADOW_STYLE_KEY: EditableStyleKey = "shadow";
const TEXT_ALIGN_STYLE_KEY: EditableStyleKey = "textAlign";
const CONTENT_ALIGN_STYLE_KEY: EditableStyleKey = "contentAlign";
const CONTAINER_SPACING_STYLE_KEYS: EditableStyleKey[] = [
  "marginTop",
  "marginBottom",
  "paddingTop",
  "paddingBottom",
];

const TEXT_ALIGN_ELEMENT_HINTS = [
  "title",
  "heading",
  "description",
  "subtitle",
  "caption",
  "content",
  "text",
  "label",
  "name",
  "role",
  "quote",
  "message",
  "question",
  "answer",
  "price",
  "number",
  "value",
  "button",
  "submit",
  "link",
  "expired",
];

function isNonTextVisualElement(elementId?: string) {
  const id = elementId?.toLowerCase() ?? "";
  return (
    !id ||
    id === "container" ||
    id.includes("overlay") ||
    id.includes("image") ||
    id.includes("video") ||
    id.includes("avatar") ||
    id.includes("thumbnail") ||
    id.includes("icon") ||
    id.includes("progress") ||
    id.includes("separator") ||
    id.includes("ornament") ||
    id.includes("line") ||
    id.includes("dot") ||
    id.includes("arrow")
  );
}

function isTextLikeElement(
  keys: ReadonlyArray<EditableStyleKey>,
  elementId?: string,
) {
  if (isNonTextVisualElement(elementId)) return false;
  const id = elementId?.toLowerCase() ?? "";
  const hasTextStyle = keys.includes("color") || keys.includes("fontSize");
  return hasTextStyle || TEXT_ALIGN_ELEMENT_HINTS.some((hint) => id.includes(hint));
}

function withBuilderStyleKeys(
  keys: ReadonlyArray<EditableStyleKey> | undefined,
  elementId?: string,
): EditableStyleKey[] {
  const next = Array.isArray(keys) ? [...keys] : [];
  if (!next.includes(SHADOW_STYLE_KEY)) next.push(SHADOW_STYLE_KEY);
  if (elementId === "container") {
    CONTAINER_SPACING_STYLE_KEYS.forEach((key) => {
      if (!next.includes(key)) next.push(key);
    });
    if (!next.includes(CONTENT_ALIGN_STYLE_KEY)) {
      next.push(CONTENT_ALIGN_STYLE_KEY);
    }
  }
  if (
    isTextLikeElement(next, elementId) &&
    !next.includes(TEXT_ALIGN_STYLE_KEY)
  ) {
    next.push(TEXT_ALIGN_STYLE_KEY);
  }
  return next;
}

function withBuilderStyleSchema<T extends BlockSchema>(schema: T): T {
  const elements = Object.fromEntries(
    Object.entries(schema.elements).map(([elementId, element]) => [
      elementId,
      {
        ...element,
        allowedStyleKeys: withBuilderStyleKeys(
          element.allowedStyleKeys,
          elementId,
        ),
      },
    ]),
  ) as T["elements"];

  return { ...schema, elements };
}

function withBuilderStyleDefaultBlock<T extends (order: number) => PageBlock>(
  createBlock: T,
): T {
  return ((order: number) => {
    const block = createBlock(order);
    const elements = Object.fromEntries(
      Object.entries(block.elements ?? {}).map(([elementId, element]) => [
        elementId,
        {
          ...element,
          allowedStyleKeys: withBuilderStyleKeys(
            element.allowedStyleKeys,
            elementId,
          ),
        },
      ]),
    ) as PageBlock["elements"];

    return { ...block, elements };
  }) as T;
}

export type BlockCategory =
  "hero" | "content" | "media" | "link" | "contact" | "conversion" | "utility";

export const blockRegistry = {
  banner: {
    type: "banner",
    label: "بنر",
    description: "برای معرفی اصلی صفحه، کمپین، برند یا پیام مهم.",
    icon: React.createElement(HiOutlinePhoto, { size: 18 }),
    category: "hero",
    component: BannerBlock,
    schema: withBuilderStyleSchema(bannerSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultBannerBlock),
  },

  slider: {
    type: "slider",
    label: "اسلایدر",
    description: "اسلاید تصویری با متن، دکمه، پس‌زمینه و ناوبری.",
    icon: React.createElement(HiOutlineRectangleGroup, { size: 18 }),
    category: "hero",
    component: SliderBlock,
    schema: withBuilderStyleSchema(sliderSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultSliderBlock),
  },

  simpleLink: {
    type: "simpleLink",
    label: "لینک ساده",
    description: "یک لینک کوتاه و سریع برای هدایت کاربر.",
    icon: React.createElement(HiOutlineLink, { size: 18 }),
    category: "link",
    component: SimpleLinkBlock,
    schema: withBuilderStyleSchema(simpleLinkSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultSimpleLinkBlock),
  },

  superLink: {
    type: "superLink",
    label: "سوپر لینک",
    description: "لینک پیشرفته با آیکون، توضیح، فلش و انیمیشن.",
    icon: React.createElement(HiOutlineBolt, { size: 18 }),
    category: "link",
    component: SuperLinkBlock,
    schema: withBuilderStyleSchema(superLinkSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultSuperLinkBlock),
  },

  video: {
    type: "video",
    label: "ویدئو",
    description: "نمایش ویدئوی معرفی، محصول، آموزش یا کمپین.",
    icon: React.createElement(HiOutlineFilm, { size: 18 }),
    category: "media",
    component: VideoBlock,
    schema: withBuilderStyleSchema(videoSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultVideoBlock),
  },

  richText: {
    type: "richText",
    label: "متن",
    description: "برای نوشتن متن، توضیحات، معرفی یا درباره ما.",
    icon: React.createElement(HiOutlineDocumentText, { size: 18 }),
    category: "content",
    component: RichTextBlock,
    schema: withBuilderStyleSchema(richTextSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultRichTextBlock),
  },

  testimonial: {
    type: "testimonial",
    label: "نظر مشتری",
    description: "نمایش نظر، تجربه، امتیاز و مشخصات مشتری.",
    icon: React.createElement(HiOutlineStar, { size: 18 }),
    category: "content",
    component: TestimonialBlock,
    schema: withBuilderStyleSchema(testimonialSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultTestimonialBlock),
  },

  faq: {
    type: "faq",
    label: "سوالات پرتکرار",
    description: "نمایش سوال و جواب‌ها به شکل آکاردئونی.",
    icon: React.createElement(HiOutlineQuestionMarkCircle, { size: 18 }),
    category: "content",
    component: FAQBlock,
    schema: withBuilderStyleSchema(faqSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultFAQBlock),
  },

  contactInfo: {
    type: "contactInfo",
    label: "اطلاعات تماس",
    description: "شماره تماس، واتساپ، ایمیل، آدرس و راه‌های ارتباطی.",
    icon: React.createElement(HiOutlinePhone, { size: 18 }),
    category: "contact",
    component: ContactInfoBlock,
    schema: withBuilderStyleSchema(contactInfoSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultContactInfoBlock),
  },

  contactSave: {
    type: "contactSave",
    label: "ذخیره مخاطب",
    description:
      "دکمه ذخیره نام، نام خانوادگی و شماره همراه به‌عنوان مخاطب در آیفون و اندروید.",
    icon: React.createElement(HiOutlineUserPlus, { size: 18 }),
    category: "contact",
    component: ContactSaveBlock,
    schema: withBuilderStyleSchema(contactSaveSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultContactSaveBlock),
  },

  mapLinks: {
    type: "mapLinks",
    label: "لینک نقشه",
    description: "لینک مسیریابی در گوگل مپ، نشان، بلد، ویز و اپل مپ.",
    icon: React.createElement(HiOutlineMapPin, { size: 18 }),
    category: "contact",
    component: MapLinksBlock,
    schema: withBuilderStyleSchema(mapLinksSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultMapLinksBlock),
  },

  cta: {
    type: "cta",
    label: "دعوت به اقدام",
    description: "تشویق کاربر برای خرید، تماس، رزرو یا ثبت درخواست.",
    icon: React.createElement(HiOutlineRocketLaunch, { size: 18 }),
    category: "conversion",
    component: CTABlock,
    schema: withBuilderStyleSchema(ctaSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultCtaBlock),
  },

  countdown: {
    type: "countdown",
    label: "شمارش معکوس",
    description: "برای کمپین، تخفیف، رویداد یا مهلت ثبت‌نام.",
    icon: React.createElement(HiOutlineClock, { size: 18 }),
    category: "conversion",
    component: CountdownBlock,
    schema: withBuilderStyleSchema(countdownSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultCountdownBlock),
  },

  separator: {
    type: "separator",
    label: "جداکننده",
    description: "خط یا جداکننده برای فاصله‌گذاری بین بخش‌ها.",
    icon: React.createElement(HiOutlineMinus, { size: 18 }),
    category: "utility",
    component: SeparatorBlock,
    schema: withBuilderStyleSchema(separatorSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultSeparatorBlock),
  },

  messengerLinks: {
    type: "messengerLinks",
    label: "پیام‌رسان‌ها",
    description:
      "لینک شبکه‌ها و پیام‌رسان‌ها مثل تلگرام، واتساپ، اینستاگرام، ایتا، سروش، روبیکا و موارد دیگر.",
    icon: React.createElement(HiOutlineChatBubbleLeftRight, { size: 18 }),
    category: "contact",
    component: MessengerLinksBlock,
    schema: withBuilderStyleSchema(messengerLinksSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(
      createDefaultMessengerLinksBlock,
    ),
  },

  storyHighlights: {
    type: "storyHighlights",
    label: "استوری‌ها",
    description:
      "استوری‌های دایره‌ای شبیه اینستاگرام با نمایش تمام‌صفحه و اسلاید خودکار.",
    icon: React.createElement(HiOutlinePlayCircle, { size: 18 }),
    category: "media",
    component: StoryHighlightsBlock,
    schema: withBuilderStyleSchema(storyHighlightsSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(
      createDefaultStoryHighlightsBlock,
    ),
  },

  productCards: {
    type: "productCards",
    label: "کارت محصولات",
    description:
      "نمایش چند محصول در یک ردیف اسکرولی با عکس، توضیح، قیمت و دکمه.",
    icon: React.createElement(HiOutlineShoppingBag, { size: 18 }),
    category: "conversion",
    component: ProductCardsBlock,
    schema: withBuilderStyleSchema(productCardsSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultProductCardsBlock),
  },

  bookingForm: {
    type: "bookingForm",
    label: "فرم رزرو",
    description:
      "فرم رزرو با نام، شماره تماس، ایمیل، تقویم فارسی و انتخاب ساعت.",
    icon: React.createElement(HiOutlineCalendarDays, { size: 18 }),
    category: "conversion",
    component: BookingFormBlock,
    schema: withBuilderStyleSchema(bookingFormSchema),
    createDefaultBlock: withBuilderStyleDefaultBlock(createDefaultBookingFormBlock),
  },
} as const;

export type BlockType = keyof typeof blockRegistry;

export function getBlockConfig(type: BlockType) {
  return blockRegistry[type];
}

export function getAvailableBlocks() {
  return Object.values(blockRegistry);
}

export function getBlocksByCategory(category: BlockCategory) {
  return getAvailableBlocks().filter((block) => block.category === category);
}

export function isBlockType(type: string): type is BlockType {
  return type in blockRegistry;
}
