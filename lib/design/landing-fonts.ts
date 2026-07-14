export const LANDING_FONT_IDS = [
  "vazir",
  "yekan",
  "dana",
  "estedad",
  "sahel",
  "pelak",
  "doran",
  "aria",
  "ray",
  "daamon",
] as const;

export type LandingFontId = (typeof LANDING_FONT_IDS)[number];

export type LandingFontOption = {
  id: LandingFontId;
  label: string;
  description: string;
  previewText: string;
};

export const DEFAULT_LANDING_FONT_ID: LandingFontId = "vazir";

export const LANDING_FONT_OPTIONS: LandingFontOption[] = [
  {
    id: "vazir",
    label: "وزیر",
    description: "خوانا و رسمی برای بیشتر لندینگ‌ها",
    previewText: "نمونه متن لندینگ با فونت وزیر",
  },
  {
    id: "yekan",
    label: "یکان‌بخ",
    description: "مدرن، تمیز و مناسب برندهای دیجیتال",
    previewText: "نمونه متن لندینگ با فونت یکان‌بخ",
  },
  {
    id: "dana",
    label: "دانا",
    description: "حرفه‌ای و متعادل برای صفحات فروش",
    previewText: "نمونه متن لندینگ با فونت دانا",
  },
  {
    id: "estedad",
    label: "استعداد",
    description: "نرم و امروزی برای کسب‌وکارهای خدماتی",
    previewText: "نمونه متن لندینگ با فونت استعداد",
  },
  {
    id: "sahel",
    label: "ساحل",
    description: "سبک و آرام برای متن‌های طولانی‌تر",
    previewText: "نمونه متن لندینگ با فونت ساحل",
  },
  {
    id: "pelak",
    label: "پلاک",
    description: "پرقدرت و مناسب تیترهای کوتاه",
    previewText: "نمونه متن لندینگ با فونت پلاک",
  },
  {
    id: "doran",
    label: "دوران",
    description: "لوکس و متفاوت برای برندهای خاص",
    previewText: "نمونه متن لندینگ با فونت دوران",
  },
  {
    id: "aria",
    label: "آریا",
    description: "مینیمال و تمیز برای ظاهرهای رسمی",
    previewText: "نمونه متن لندینگ با فونت آریا",
  },
  {
    id: "ray",
    label: "ری",
    description: "جسور و مناسب خروجی‌های پرانرژی",
    previewText: "نمونه متن لندینگ با فونت ری",
  },
  {
    id: "daamon",
    label: "دامون",
    description: "خاص، نرم و مناسب برندهای خلاق",
    previewText: "نمونه متن لندینگ با فونت دامون",
  },
];

const landingFontIdSet = new Set<string>(LANDING_FONT_IDS);

export function isLandingFontId(value: unknown): value is LandingFontId {
  return typeof value === "string" && landingFontIdSet.has(value);
}

export function normalizeLandingFontId(value: unknown): LandingFontId {
  if (isLandingFontId(value)) return value;
  return DEFAULT_LANDING_FONT_ID;
}

export function getLandingFontOption(value: unknown) {
  const id = normalizeLandingFontId(value);
  return (
    LANDING_FONT_OPTIONS.find((option) => option.id === id) ??
    LANDING_FONT_OPTIONS[0]
  );
}
