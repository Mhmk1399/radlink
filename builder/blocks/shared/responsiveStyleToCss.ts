// src/builder/blocks/shared/responsiveStyleToCss.ts

import type {
    AnimationType,
    ContentAlignValue,
    EditableStyleMap,
    ShadowStyleValue,
    TextAlignValue,
} from "@/types/blocks/builder.types";

export type BlockInteractionEffect =
    | "surface"
    | "card"
    | "button"
    | "media"
    | "tap"
    | "none";

function animationToCss(animation?: AnimationType, prefix = "block"): string {
    let value: string | null = null;

    switch (animation) {
        case "fade":
            value = `${prefix}-fade 0.6s ease both`;
            break;
        case "slideUp":
            value = `${prefix}-slide-up 0.6s ease both`;
            break;
        case "slideLeft":
            value = `${prefix}-slide-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "slideRight":
            value = `${prefix}-slide-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "scale":
            value = `${prefix}-scale 0.45s ease both`;
            break;
        case "pulse":
            value = `${prefix}-pulse 1.8s ease-in-out infinite`;
            break;
        case "bounceIn":
            value = `${prefix}-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both`;
            break;
        case "rotateIn":
            value = `${prefix}-rotate-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "blurIn":
            value = `${prefix}-blur-in 0.65s ease both`;
            break;
        case "slideDown":
            value = `${prefix}-slide-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "zoomOut":
            value = `${prefix}-zoom-out 0.6s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "flipUp":
            value = `${prefix}-flip-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "flipSide":
            value = `${prefix}-flip-side 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "swingIn":
            value = `${prefix}-swing-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) both`;
            break;
        case "elasticIn":
            value = `${prefix}-elastic-in 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) both`;
            break;
        case "riseSoft":
            value = `${prefix}-rise-soft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both`;
            break;
        case "dropSoft":
            value = `${prefix}-drop-soft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both`;
            break;
        case "focusIn":
            value = `${prefix}-focus-in 0.75s ease both`;
            break;
        case "glowIn":
            value = `${prefix}-glow-in 0.9s ease both`;
            break;
        case "none":
        default:
            return "animation: none;";
    }

    return `animation: ${value} !important;`;
}

export function sharedBlockKeyframes(prefix = "block"): string {
    return `
    @keyframes ${prefix}-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes ${prefix}-slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ${prefix}-slide-left {
      from { opacity: 0; transform: translateX(-24px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes ${prefix}-slide-right {
      from { opacity: 0; transform: translateX(24px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes ${prefix}-scale {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes ${prefix}-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }

    @keyframes ${prefix}-bounce-in {
      0% { opacity: 0; transform: scale(0.72) translateY(14px); }
      65% { opacity: 1; transform: scale(1.05) translateY(-2px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes ${prefix}-rotate-in {
      from { opacity: 0; transform: rotate(-7deg) scale(0.9); }
      to { opacity: 1; transform: rotate(0) scale(1); }
    }

    @keyframes ${prefix}-blur-in {
      from { opacity: 0; filter: blur(10px); transform: translateY(6px); }
      to { opacity: 1; filter: blur(0); transform: translateY(0); }
    }

    @keyframes ${prefix}-slide-down {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ${prefix}-zoom-out {
      from { opacity: 0; transform: scale(1.14); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes ${prefix}-flip-up {
      from { opacity: 0; transform: perspective(700px) rotateX(24deg) translateY(10px); }
      to { opacity: 1; transform: perspective(700px) rotateX(0) translateY(0); }
    }

    @keyframes ${prefix}-flip-side {
      from { opacity: 0; transform: perspective(700px) rotateY(-28deg) translateX(-8px); }
      to { opacity: 1; transform: perspective(700px) rotateY(0) translateX(0); }
    }

    @keyframes ${prefix}-swing-in {
      0% { opacity: 0; transform: rotate(-6deg) translateY(10px); transform-origin: top center; }
      65% { opacity: 1; transform: rotate(1.5deg) translateY(0); transform-origin: top center; }
      100% { opacity: 1; transform: rotate(0) translateY(0); transform-origin: top center; }
    }

    @keyframes ${prefix}-elastic-in {
      0% { opacity: 0; transform: scale(0.72); }
      60% { opacity: 1; transform: scale(1.08); }
      82% { transform: scale(0.97); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes ${prefix}-rise-soft {
      from { opacity: 0; transform: translateY(28px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ${prefix}-drop-soft {
      from { opacity: 0; transform: translateY(-28px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ${prefix}-focus-in {
      from { opacity: 0; filter: blur(8px); letter-spacing: 0.08em; }
      to { opacity: 1; filter: blur(0); letter-spacing: normal; }
    }

    @keyframes ${prefix}-glow-in {
      0% { opacity: 0; filter: brightness(1.7); box-shadow: 0 0 28px rgba(255,255,255,0.55); }
      55% { opacity: 1; filter: brightness(1.12); box-shadow: 0 0 14px rgba(255,255,255,0.25); }
      100% { opacity: 1; filter: brightness(1); box-shadow: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  `;
}

function toPx(value: unknown): string | null {
    const numericValue =
        typeof value === "number" ? value : Number.parseFloat(String(value));

    if (!Number.isFinite(numericValue)) return null;

    return `${numericValue}px`;
}

function addCss(
    buffer: string[],
    property: string,
    value: string | number | undefined | null,
) {
    if (value === undefined || value === null || value === "") return;
    buffer.push(`${property}: ${value};`);
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function addResponsivePxCss(
    buffer: string[],
    property: string,
    value:
        | {
              mobile?: number;
              tablet?: number;
              desktop?: number;
          }
        | undefined,
    mobileOnly?: boolean,
) {
    addCss(buffer, property, toPx(value?.mobile));

    if (mobileOnly) return;

    if (value?.tablet !== undefined) {
        const tabletValue = toPx(value.tablet);
        if (tabletValue) {
            buffer.push(
                `@media (min-width: 768px) { ${property}: ${tabletValue}; }`,
            );
        }
    }
    if (value?.desktop !== undefined) {
        const desktopValue = toPx(value.desktop);
        if (desktopValue) {
            buffer.push(
                `@media (min-width: 1024px) { ${property}: ${desktopValue}; }`,
            );
        }
    }
}

function normalizeTextAlign(
    value: TextAlignValue | undefined,
): TextAlignValue | null {
    if (value === "left" || value === "center" || value === "right") {
        return value;
    }
    return null;
}

function normalizeContentAlign(
    value: ContentAlignValue | undefined,
): ContentAlignValue | null {
    if (value === "left" || value === "center" || value === "right") {
        return value;
    }
    return null;
}

function textAlignToCss(value: TextAlignValue | undefined) {
    const align = normalizeTextAlign(value);
    if (!align) return null;

    if (align === "center") {
        return `
          text-align: center !important;
          align-self: center !important;
          justify-self: center !important;
          justify-content: center !important;
          --radlink-text-align: center;
          --radlink-item-align: center;
        `;
    }

    const ltrFlex = align === "left" ? "flex-start" : "flex-end";
    const rtlFlex = align === "left" ? "flex-end" : "flex-start";
    const ltrJustifySelf = align === "left" ? "start" : "end";
    const rtlJustifySelf = align === "left" ? "end" : "start";

    return `
      text-align: ${align} !important;
      align-self: ${ltrFlex} !important;
      justify-self: ${ltrJustifySelf} !important;
      justify-content: ${ltrFlex} !important;
      --radlink-text-align: ${align};
      --radlink-item-align: ${ltrFlex};

      [dir="rtl"] & {
        align-self: ${rtlFlex} !important;
        justify-self: ${rtlJustifySelf} !important;
        justify-content: ${rtlFlex} !important;
        --radlink-item-align: ${rtlFlex};
      }
    `;
}

function addResponsiveTextAlignCss(
    buffer: string[],
    value:
        | {
              mobile?: TextAlignValue;
              tablet?: TextAlignValue;
              desktop?: TextAlignValue;
          }
        | undefined,
    mobileOnly?: boolean,
) {
    const mobileCss = textAlignToCss(value?.mobile);
    if (mobileCss) buffer.push(mobileCss);

    if (mobileOnly) return;

    const tabletCss = textAlignToCss(value?.tablet);
    if (tabletCss) {
        buffer.push(`@media (min-width: 768px) { ${tabletCss} }`);
    }

    const desktopCss = textAlignToCss(value?.desktop);
    if (desktopCss) {
        buffer.push(`@media (min-width: 1024px) { ${desktopCss} }`);
    }
}

function contentAlignToCss(value: ContentAlignValue | undefined) {
    const align = normalizeContentAlign(value);
    if (!align) return null;

    if (align === "center") {
        return `
          text-align: center !important;
          align-items: center !important;
          justify-items: center !important;
          --radlink-content-align: center;
          --radlink-content-text-align: center;
        `;
    }

    const ltrFlex = align === "left" ? "flex-start" : "flex-end";
    const rtlFlex = align === "left" ? "flex-end" : "flex-start";
    const ltrJustifyItems = align === "left" ? "start" : "end";
    const rtlJustifyItems = align === "left" ? "end" : "start";

    return `
      text-align: ${align} !important;
      align-items: ${ltrFlex} !important;
      justify-items: ${ltrJustifyItems} !important;
      --radlink-content-align: ${ltrFlex};
      --radlink-content-text-align: ${align};

      [dir="rtl"] & {
        align-items: ${rtlFlex} !important;
        justify-items: ${rtlJustifyItems} !important;
        --radlink-content-align: ${rtlFlex};
      }
    `;
}

function addResponsiveContentAlignCss(
    buffer: string[],
    value:
        | {
              mobile?: ContentAlignValue;
              tablet?: ContentAlignValue;
              desktop?: ContentAlignValue;
          }
        | undefined,
    mobileOnly?: boolean,
) {
    const mobileCss = contentAlignToCss(value?.mobile);
    if (mobileCss) buffer.push(mobileCss);

    if (mobileOnly) return;

    const tabletCss = contentAlignToCss(value?.tablet);
    if (tabletCss) {
        buffer.push(`@media (min-width: 768px) { ${tabletCss} }`);
    }

    const desktopCss = contentAlignToCss(value?.desktop);
    if (desktopCss) {
        buffer.push(`@media (min-width: 1024px) { ${desktopCss} }`);
    }
}

function parseShadowValue(value: ShadowStyleValue | undefined) {
    if (!value) return null;
    const intensity = clamp(Number(value.intensity ?? 0), 0, 100);
    if (intensity <= 0) return null;
    const color =
        typeof value.color === "string" && value.color.trim()
            ? value.color.trim()
            : "rgba(15,23,42,0.22)";
    return { color, intensity };
}

function shadowToCss(value: ShadowStyleValue | undefined, mode: "box" | "text") {
    const shadow = parseShadowValue(value);
    if (!shadow) return null;

    const ratio = shadow.intensity / 100;
    if (mode === "text") {
        const y = Math.round(1 + ratio * 2);
        const blur = Math.round(2 + ratio * 10);
        return `0 ${y}px ${blur}px ${shadow.color}`;
    }

    const y = Math.round(4 + ratio * 18);
    const blur = Math.round(10 + ratio * 42);
    const spread = Math.round(-4 - ratio * 12);
    return `0 ${y}px ${blur}px ${spread}px ${shadow.color}`;
}

function interactionEffectToCss(effect: BlockInteractionEffect | undefined) {
    if (!effect || effect === "none") return "";

    const shared = `
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      will-change: transform, filter;

      @media (prefers-reduced-motion: reduce) {
        transition-duration: 0.01ms !important;
        &:hover,
        &:active {
          transform: none !important;
          filter: none !important;
        }
      }
    `;

    if (effect === "button") {
        return `
          ${shared}
          transition:
            transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.18s ease,
            box-shadow 0.22s ease,
            opacity 0.18s ease,
            background-color 0.18s ease,
            border-color 0.18s ease;

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              transform: translateY(-2px) scale(1.01);
              filter: saturate(1.08) brightness(1.035);
            }
          }

          &:active {
            transform: translateY(1px) scale(0.985);
            filter: saturate(1.02) brightness(0.985);
          }
        `;
    }

    if (effect === "card") {
        return `
          ${shared}
          transition:
            transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.2s ease,
            box-shadow 0.24s ease,
            background-color 0.2s ease,
            border-color 0.2s ease;

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              transform: translateY(-3px);
              filter: saturate(1.04) brightness(1.015);
            }
          }

          &:active {
            transform: scale(0.992);
            filter: brightness(0.99);
          }
        `;
    }

    if (effect === "media") {
        return `
          ${shared}
          position: relative;
          overflow: hidden;
          isolation: isolate;
          transition:
            transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.24s ease,
            box-shadow 0.24s ease;

          &::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            border-radius: inherit;
            background:
              linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.16),
                rgba(15, 23, 42, 0.08)
              ),
              radial-gradient(
                circle at 18% 0%,
                rgba(255, 255, 255, 0.2),
                transparent 38%
              );
            mix-blend-mode: soft-light;
            opacity: 0.48;
            transition: opacity 0.24s ease;
          }

          &[data-media-kind="video"]::after {
            opacity: 0.12;
          }

          & > img,
          & img,
          & > video,
          & video {
            border-radius: inherit;
            transform-origin: center;
            transition:
              transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
              filter 0.26s ease;
            will-change: transform, filter;
          }

          & > :not(img):not(video):not(iframe) {
            position: relative;
            z-index: 2;
          }

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              transform: scale(1.012);
              filter: saturate(1.06) contrast(1.015);
            }

            &:hover::after {
              opacity: 0.62;
            }

            &[data-media-kind="video"]:hover::after {
              opacity: 0.16;
            }

            &:hover > img,
            &:hover img,
            &:hover > video,
            &:hover video {
              transform: scale(1.035);
              filter: saturate(1.08) contrast(1.025);
            }
          }

          &:active {
            transform: scale(0.992);
            filter: brightness(0.985);
          }

          &:active > img,
          &:active img,
          &:active > video,
          &:active video {
            transform: scale(1.012);
          }

          @media (prefers-reduced-motion: reduce) {
            & > img,
            & img,
            & > video,
            & video {
              transition-duration: 0.01ms !important;
              transform: none !important;
            }
          }
        `;
    }

    if (effect === "tap") {
        return `
          ${shared}
          transition:
            transform 0.16s ease,
            filter 0.16s ease,
            opacity 0.16s ease;

          &:active {
            transform: scale(0.97);
            filter: brightness(0.98);
          }
        `;
    }

    return `
      ${shared}
      transition:
        transform 0.22s ease,
        filter 0.2s ease,
        box-shadow 0.24s ease,
        background-color 0.2s ease,
        border-color 0.2s ease;

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          transform: translateY(-1px);
          filter: saturate(1.02);
        }
      }
    `;
}

export function responsiveStyleToCss(
    style: EditableStyleMap | undefined,
    animationPrefix = "block",
    options?: {
        mobileOnly?: boolean;
        shadowMode?: "box" | "text";
        effect?: BlockInteractionEffect;
    },
): string {
    if (!style) return "";

    const css: string[] = [];

    const color = style.color?.mobile;
    const backgroundColor = style.backgroundColor?.mobile;
    const fontSize = toPx(style.fontSize?.mobile);
    const height = toPx(style.height?.mobile);
    const textAlign = style.textAlign;
    const contentAlign = style.contentAlign;
    const paddingTop = style.paddingTop;
    const paddingBottom = style.paddingBottom;
    const borderRadius = toPx(style.borderRadius?.mobile);
    const borderColor = style.borderColor?.mobile;
    const borderWidth = toPx(style.borderWidth?.mobile);
    const inferredShadowMode =
        options?.shadowMode ??
        ((style.color || style.fontSize) &&
        !style.backgroundColor &&
        !style.borderColor &&
        !style.borderWidth &&
        !style.borderRadius
            ? "text"
            : "box");
    const shadow = shadowToCss(style.shadow?.mobile, inferredShadowMode);

    addCss(css, "color", color);
    addCss(css, "background-color", backgroundColor);
    addCss(css, "font-size", fontSize);
    addCss(css, "height", height);
    addResponsiveTextAlignCss(css, textAlign, options?.mobileOnly);
    addResponsiveContentAlignCss(css, contentAlign, options?.mobileOnly);
    addResponsivePxCss(css, "padding-top", paddingTop, options?.mobileOnly);
    addResponsivePxCss(
        css,
        "padding-bottom",
        paddingBottom,
        options?.mobileOnly,
    );
    addCss(css, "border-radius", borderRadius);

    if (borderColor || borderWidth) {
        css.push("border-style: solid;");
    }

    addCss(css, "border-color", borderColor);
    addCss(css, "border-width", borderWidth);
    addCss(
        css,
        inferredShadowMode === "text" ? "text-shadow" : "box-shadow",
        shadow ? `${shadow} !important` : shadow,
    );

    if (style.height?.tablet !== undefined) {
        css.push(
            `@media (min-width: 768px) { height: ${toPx(style.height.tablet)}; }`,
        );
    }
    if (style.height?.desktop !== undefined) {
        css.push(
            `@media (min-width: 1024px) { height: ${toPx(style.height.desktop)}; }`,
        );
    }

    css.push(interactionEffectToCss(options?.effect));
    css.push(animationToCss(style.animation, animationPrefix));

    return css.join("\n");
}
