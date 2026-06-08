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
        case "scale":
            return `animation: ${prefix}-scale 0.45s ease both;`;
        case "pulse":
            return `animation: ${prefix}-pulse 1.8s ease-in-out infinite;`;
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

    @keyframes ${prefix}-scale {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes ${prefix}-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
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
    const borderRadius = toPx(style.borderRadius?.mobile);
    const borderColor = style.borderColor?.mobile;
    const borderWidth = toPx(style.borderWidth?.mobile);

    addCss(css, "color", color);
    addCss(css, "background-color", backgroundColor);
    addCss(css, "font-size", fontSize);
    addCss(css, "border-radius", borderRadius);

    if (borderColor || borderWidth) {
        css.push("border-style: solid;");
    }

    addCss(css, "border-color", borderColor);
    addCss(css, "border-width", borderWidth);

    css.push(animationToCss(style.animation, animationPrefix));

    return css.join("\n");
}