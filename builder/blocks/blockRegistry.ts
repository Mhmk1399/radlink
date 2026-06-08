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
import { storyHighlightsSchema, } from "./story/story.schema";
import { createDefaultStoryHighlightsBlock } from "./story/story.default";
import StoryHighlightsBlock from "./story/StoryBlock";
import ProductCardsBlock from "./product-cards/ProductCardsBlock";
import { productCardsSchema } from "./product-cards/productCards.schema";
import { createDefaultProductCardsBlock } from "./product-cards/productCards.default";
import BookingFormBlock from "./booking-form/BookingFormBlock";
import { bookingFormSchema } from "./booking-form/bookingForm.schema";
import { createDefaultBookingFormBlock } from "./booking-form/bookingForm.default";



export type BlockCategory =
    | "hero"
    | "content"
    | "media"
    | "link"
    | "contact"
    | "conversion"
    | "utility";

export const blockRegistry = {
    banner: {
        type: "banner",
        label: "بنر",
        description: "برای معرفی اصلی صفحه، کمپین، برند یا پیام مهم.",
        icon: "🖼️",
        category: "hero",
        component: BannerBlock,
        schema: bannerSchema,
        createDefaultBlock: createDefaultBannerBlock,
    },

    slider: {
        type: "slider",
        label: "اسلایدر",
        description: "اسلاید تصویری با متن، دکمه، پس‌زمینه و ناوبری.",
        icon: "🎞️",
        category: "hero",
        component: SliderBlock,
        schema: sliderSchema,
        createDefaultBlock: createDefaultSliderBlock,
    },

    simpleLink: {
        type: "simpleLink",
        label: "لینک ساده",
        description: "یک لینک کوتاه و سریع برای هدایت کاربر.",
        icon: "🔗",
        category: "link",
        component: SimpleLinkBlock,
        schema: simpleLinkSchema,
        createDefaultBlock: createDefaultSimpleLinkBlock,
    },

    superLink: {
        type: "superLink",
        label: "سوپر لینک",
        description: "لینک پیشرفته با آیکون، توضیح، فلش و انیمیشن.",
        icon: "⚡",
        category: "link",
        component: SuperLinkBlock,
        schema: superLinkSchema,
        createDefaultBlock: createDefaultSuperLinkBlock,
    },

    video: {
        type: "video",
        label: "ویدئو",
        description: "نمایش ویدئوی معرفی، محصول، آموزش یا کمپین.",
        icon: "🎬",
        category: "media",
        component: VideoBlock,
        schema: videoSchema,
        createDefaultBlock: createDefaultVideoBlock,
    },

    richText: {
        type: "richText",
        label: "متن",
        description: "برای نوشتن متن، توضیحات، معرفی یا درباره ما.",
        icon: "📝",
        category: "content",
        component: RichTextBlock,
        schema: richTextSchema,
        createDefaultBlock: createDefaultRichTextBlock,
    },

    testimonial: {
        type: "testimonial",
        label: "نظر مشتری",
        description: "نمایش نظر، تجربه، امتیاز و مشخصات مشتری.",
        icon: "⭐",
        category: "content",
        component: TestimonialBlock,
        schema: testimonialSchema,
        createDefaultBlock: createDefaultTestimonialBlock,
    },

    faq: {
        type: "faq",
        label: "سوالات پرتکرار",
        description: "نمایش سوال و جواب‌ها به شکل آکاردئونی.",
        icon: "❓",
        category: "content",
        component: FAQBlock,
        schema: faqSchema,
        createDefaultBlock: createDefaultFAQBlock,
    },

    contactInfo: {
        type: "contactInfo",
        label: "اطلاعات تماس",
        description: "شماره تماس، واتساپ، ایمیل، آدرس و راه‌های ارتباطی.",
        icon: "☎️",
        category: "contact",
        component: ContactInfoBlock,
        schema: contactInfoSchema,
        createDefaultBlock: createDefaultContactInfoBlock,
    },

    mapLinks: {
        type: "mapLinks",
        label: "لینک نقشه",
        description: "لینک مسیریابی در گوگل مپ، نشان، بلد، ویز و اپل مپ.",
        icon: "📍",
        category: "contact",
        component: MapLinksBlock,
        schema: mapLinksSchema,
        createDefaultBlock: createDefaultMapLinksBlock,
    },

    cta: {
        type: "cta",
        label: "دعوت به اقدام",
        description: "تشویق کاربر برای خرید، تماس، رزرو یا ثبت درخواست.",
        icon: "🚀",
        category: "conversion",
        component: CTABlock,
        schema: ctaSchema,
        createDefaultBlock: createDefaultCtaBlock,
    },

    countdown: {
        type: "countdown",
        label: "شمارش معکوس",
        description: "برای کمپین، تخفیف، رویداد یا مهلت ثبت‌نام.",
        icon: "⏳",
        category: "conversion",
        component: CountdownBlock,
        schema: countdownSchema,
        createDefaultBlock: createDefaultCountdownBlock,
    },

    separator: {
        type: "separator",
        label: "جداکننده",
        description: "خط یا جداکننده برای فاصله‌گذاری بین بخش‌ها.",
        icon: "➖",
        category: "utility",
        component: SeparatorBlock,
        schema: separatorSchema,
        createDefaultBlock: createDefaultSeparatorBlock,
    },
    messengerLinks: {
        type: "messengerLinks",
        label: "پیام‌رسان‌ها",
        description:
            "لینک شبکه‌ها و پیام‌رسان‌ها مثل تلگرام، واتساپ، اینستاگرام، ایتا، سروش، روبیکا و موارد دیگر.",
        icon: "💬",
        category: "contact",
        component: MessengerLinksBlock,
        schema: messengerLinksSchema,
        createDefaultBlock: createDefaultMessengerLinksBlock,
    },
    storyHighlights: {
        type: "storyHighlights",
        label: "استوری‌ها",
        description:
            "استوری‌های دایره‌ای شبیه اینستاگرام با نمایش تمام‌صفحه و اسلاید خودکار.",
        icon: "🟣",
        category: "media",
        component: StoryHighlightsBlock,
        schema: storyHighlightsSchema,
        createDefaultBlock: createDefaultStoryHighlightsBlock,
    },
    productCards: {
        type: "productCards",
        label: "کارت محصولات",
        description:
            "نمایش چند محصول در یک ردیف اسکرولی با عکس، توضیح، قیمت و دکمه.",
        icon: "🛍️",
        category: "conversion",
        component: ProductCardsBlock,
        schema: productCardsSchema,
        createDefaultBlock: createDefaultProductCardsBlock,
    },
    bookingForm: {
        type: "bookingForm",
        label: "فرم رزرو",
        description: "فرم رزرو با نام، شماره تماس، ایمیل، تقویم فارسی و انتخاب ساعت.",
        icon: "📅",
        category: "conversion",
        component: BookingFormBlock,
        schema: bookingFormSchema,
        createDefaultBlock: createDefaultBookingFormBlock,
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