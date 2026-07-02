import type { AnimationType } from "@/types/blocks/builder.types";

export const ANIMATION_OPTIONS: ReadonlyArray<{
  label: string;
  value: AnimationType;
  desc: string;
  icon: string;
}> = [
  { label: "بدون", value: "none", desc: "بدون انیمیشن", icon: "○" },
  { label: "محو", value: "fade", desc: "ظاهر شدن تدریجی", icon: "◐" },
  { label: "اسلاید بالا", value: "slideUp", desc: "حرکت از پایین", icon: "↑" },
  { label: "ورود از چپ", value: "slideLeft", desc: "حرکت از سمت چپ", icon: "→" },
  { label: "ورود از راست", value: "slideRight", desc: "حرکت از سمت راست", icon: "←" },
  { label: "بزرگ‌نمایی", value: "scale", desc: "ورود با تغییر اندازه", icon: "⊕" },
  { label: "تپش", value: "pulse", desc: "پالس ملایم", icon: "◉" },
  { label: "جهش", value: "bounceIn", desc: "ورود فنری و نرم", icon: "↥" },
  { label: "چرخش", value: "rotateIn", desc: "ورود با چرخش کوتاه", icon: "↻" },
  { label: "رفع تاری", value: "blurIn", desc: "ورود از حالت محو", icon: "✦" },
  { label: "اسلاید پایین", value: "slideDown", desc: "حرکت نرم از بالا", icon: "↓" },
  { label: "زوم معکوس", value: "zoomOut", desc: "ورود از نمای نزدیک", icon: "⊖" },
  { label: "فلیپ عمودی", value: "flipUp", desc: "چرخش سه‌بعدی عمودی", icon: "↟" },
  { label: "فلیپ افقی", value: "flipSide", desc: "چرخش سه‌بعدی افقی", icon: "↔" },
  { label: "تاب نرم", value: "swingIn", desc: "ورود با حرکت پاندولی", icon: "⌁" },
  { label: "الاستیک", value: "elasticIn", desc: "ورود کشسان کنترل‌شده", icon: "◇" },
  { label: "خیز نرم", value: "riseSoft", desc: "ورود آرام و لوکس", icon: "⇡" },
  { label: "فرود نرم", value: "dropSoft", desc: "فرود آرام از بالا", icon: "⇣" },
  { label: "فوکوس", value: "focusIn", desc: "شفاف‌شدن تدریجی", icon: "◎" },
  { label: "درخشش", value: "glowIn", desc: "ورود با نور ملایم", icon: "✧" },
];

const PREVIEW_FRAMES: Record<AnimationType, Keyframe[]> = {
  none: [{ opacity: 1 }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  slideUp: [
    { opacity: 0, transform: "translateY(12px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  slideLeft: [
    { opacity: 0, transform: "translateX(-18px)" },
    { opacity: 1, transform: "translateX(0)" },
  ],
  slideRight: [
    { opacity: 0, transform: "translateX(18px)" },
    { opacity: 1, transform: "translateX(0)" },
  ],
  scale: [
    { opacity: 0, transform: "scale(.75)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  pulse: [
    { transform: "scale(1)" },
    { transform: "scale(1.18)", offset: 0.5 },
    { transform: "scale(1)" },
  ],
  bounceIn: [
    { opacity: 0, transform: "scale(.6) translateY(10px)" },
    { opacity: 1, transform: "scale(1.15) translateY(-2px)", offset: 0.7 },
    { opacity: 1, transform: "scale(1) translateY(0)" },
  ],
  rotateIn: [
    { opacity: 0, transform: "rotate(-18deg) scale(.75)" },
    { opacity: 1, transform: "rotate(0) scale(1)" },
  ],
  blurIn: [
    { opacity: 0, filter: "blur(6px)" },
    { opacity: 1, filter: "blur(0)" },
  ],
  slideDown: [
    { opacity: 0, transform: "translateY(-16px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  zoomOut: [
    { opacity: 0, transform: "scale(1.3)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  flipUp: [
    { opacity: 0, transform: "perspective(300px) rotateX(55deg)" },
    { opacity: 1, transform: "perspective(300px) rotateX(0)" },
  ],
  flipSide: [
    { opacity: 0, transform: "perspective(300px) rotateY(-55deg)" },
    { opacity: 1, transform: "perspective(300px) rotateY(0)" },
  ],
  swingIn: [
    { opacity: 0, transform: "rotate(-18deg)" },
    { opacity: 1, transform: "rotate(5deg)", offset: 0.7 },
    { opacity: 1, transform: "rotate(0)" },
  ],
  elasticIn: [
    { opacity: 0, transform: "scale(.55)" },
    { opacity: 1, transform: "scale(1.22)", offset: 0.6 },
    { transform: "scale(.92)", offset: 0.82 },
    { opacity: 1, transform: "scale(1)" },
  ],
  riseSoft: [
    { opacity: 0, transform: "translateY(22px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  dropSoft: [
    { opacity: 0, transform: "translateY(-22px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  focusIn: [
    { opacity: 0, filter: "blur(7px)" },
    { opacity: 1, filter: "blur(0)" },
  ],
  glowIn: [
    { opacity: 0, filter: "brightness(1.8)", boxShadow: "0 0 18px currentColor" },
    { opacity: 1, filter: "brightness(1)", boxShadow: "0 0 0 transparent" },
  ],
};

export function previewAnimation(
  element: HTMLElement,
  animation: AnimationType,
) {
  element.getAnimations().forEach((running) => running.cancel());
  element.animate(PREVIEW_FRAMES[animation], {
    duration: animation === "none" ? 120 : 520,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  });
}
