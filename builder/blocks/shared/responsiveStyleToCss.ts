// src/builder/blocks/shared/responsiveStyleToCss.ts

import type {
    AnimationType,
    EditableStyleMap,
} from "@/types/blocks/builder.types";

function animationToCss(animation?: AnimationType, prefix = "block"): string {
    switch (animation) {
        case "fade":
            return `animation: ${prefix}-fade 0.6s ease both;`;
        case "slideUp":
            return `animation: ${prefix}-slide-up 0.6s ease both;`;
        case "slideLeft":
            return `animation: ${prefix}-slide-left 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "slideRight":
            return `animation: ${prefix}-slide-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "scale":
            return `animation: ${prefix}-scale 0.45s ease both;`;
        case "pulse":
            return `animation: ${prefix}-pulse 1.8s ease-in-out infinite;`;
        case "bounceIn":
            return `animation: ${prefix}-bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;`;
        case "rotateIn":
            return `animation: ${prefix}-rotate-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "blurIn":
            return `animation: ${prefix}-blur-in 0.65s ease both;`;
        case "slideDown":
            return `animation: ${prefix}-slide-down 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "zoomOut":
            return `animation: ${prefix}-zoom-out 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "flipUp":
            return `animation: ${prefix}-flip-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "flipSide":
            return `animation: ${prefix}-flip-side 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "swingIn":
            return `animation: ${prefix}-swing-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;`;
        case "elasticIn":
            return `animation: ${prefix}-elastic-in 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) both;`;
        case "riseSoft":
            return `animation: ${prefix}-rise-soft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;`;
        case "dropSoft":
            return `animation: ${prefix}-drop-soft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;`;
        case "focusIn":
            return `animation: ${prefix}-focus-in 0.75s ease both;`;
        case "glowIn":
            return `animation: ${prefix}-glow-in 0.9s ease both;`;
        case "none":
        default:
            return "animation: none;";
    }
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

export function responsiveStyleToCss(
    style: EditableStyleMap | undefined,
    animationPrefix = "block",
    _options?: {
        mobileOnly?: boolean;
    },
): string {
    if (!style) return "";

    const css: string[] = [];

    const color = style.color?.mobile;
    const backgroundColor = style.backgroundColor?.mobile;
    const fontSize = toPx(style.fontSize?.mobile);
    const height = toPx(style.height?.mobile);
    const borderRadius = toPx(style.borderRadius?.mobile);
    const borderColor = style.borderColor?.mobile;
    const borderWidth = toPx(style.borderWidth?.mobile);

    addCss(css, "color", color);
    addCss(css, "background-color", backgroundColor);
    addCss(css, "font-size", fontSize);
    addCss(css, "height", height);
    addCss(css, "border-radius", borderRadius);

    if (borderColor || borderWidth) {
        css.push("border-style: solid;");
    }

    addCss(css, "border-color", borderColor);
    addCss(css, "border-width", borderWidth);

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

    css.push(animationToCss(style.animation, animationPrefix));

    return css.join("\n");
}
