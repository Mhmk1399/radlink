import localFont from "next/font/local";
import {
  DEFAULT_LANDING_FONT_ID,
  normalizeLandingFontId,
  type LandingFontId,
} from "./landing-fonts";

const vazir = localFont({
  src: "../../next-persian-fonts/vazir/Vazir-Medium.woff2",
  variable: "--font-vazir",
  display: "swap",
  preload: false,
});

const yekan = localFont({
  src: [
    {
      path: "../../next-persian-fonts/yekan/YekanBakh-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/yekan/YekanBakh-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-yekan",
  display: "swap",
  preload: false,
});

const dana = localFont({
  src: [
    {
      path: "../../next-persian-fonts/Dana/Dana-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/Dana/Dana-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dana",
  display: "swap",
  preload: false,
});

const estedad = localFont({
  src: [
    {
      path: "../../next-persian-fonts/estedad/Estedad-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/estedad/Estedad-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-estedad",
  display: "swap",
  preload: false,
});

const sahel = localFont({
  src: "../../next-persian-fonts/sahel/Sahel-VF.woff2",
  variable: "--font-sahel",
  display: "swap",
  preload: false,
});

const pelak = localFont({
  src: [
    {
      path: "../../next-persian-fonts/pelak/Pelak-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/pelak/Pelak-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pelak",
  display: "swap",
  preload: false,
});

const doran = localFont({
  src: [
    {
      path: "../../next-persian-fonts/doran/Doran-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/doran/Doran-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-doran",
  display: "swap",
  preload: false,
});

const aria = localFont({
  src: [
    {
      path: "../../next-persian-fonts/Aria Family/Aria-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/Aria Family/Aria-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aria",
  display: "swap",
  preload: false,
});

const ray = localFont({
  src: [
    {
      path: "../../next-persian-fonts/ray/Ray-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/ray/Ray-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ray",
  display: "swap",
  preload: false,
});

const daamon = localFont({
  src: [
    {
      path: "../../next-persian-fonts/daamon/DAMOON-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../next-persian-fonts/daamon/DAMOON-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-daamon",
  display: "swap",
  preload: false,
});

const landingNextFonts = {
  vazir,
  yekan,
  dana,
  estedad,
  sahel,
  pelak,
  doran,
  aria,
  ray,
  daamon,
} satisfies Record<
  LandingFontId,
  {
    className: string;
    variable: string;
    style: { fontFamily: string };
  }
>;

export function getLandingFont(value: unknown) {
  const id = normalizeLandingFontId(value);
  return landingNextFonts[id] ?? landingNextFonts[DEFAULT_LANDING_FONT_ID];
}

export function getLandingFontClassName(value: unknown) {
  const font = getLandingFont(value);
  return `${font.variable} ${font.className}`;
}

export function getLandingFontStyle(value: unknown) {
  return getLandingFont(value).style;
}
