import Image from "next/image";
import {
  normalizePageFooterSettings,
  type PageFooterSettings,
} from "@/lib/design/page-footer";
import Link from "next/link";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const RADLINK_BRANDING_WORD = "رادلینک";
const RADLINK_BRANDING_URL = "https://nfcrad.link/";

function RadlinkBrandingText({
  text,
  accentColor,
}: {
  text: string;
  accentColor: string;
}) {
  const wordIndex = text.indexOf(RADLINK_BRANDING_WORD);

  if (wordIndex < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, wordIndex)}
      <Link
        href={RADLINK_BRANDING_URL}
        target="_blank"
        className="font-black underline decoration-2 underline-offset-4 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
        style={{ color: accentColor }}
      >
        {RADLINK_BRANDING_WORD}
      </Link>
      {text.slice(wordIndex + RADLINK_BRANDING_WORD.length)}
    </>
  );
}

export function LandingFooter({
  settings,
  pageLogo,
  pageTitle,
  compact = false,
}: {
  settings?: Partial<PageFooterSettings> | null;
  pageLogo?: string;
  pageTitle?: string;
  compact?: boolean;
}) {
  const footer = normalizePageFooterSettings(settings);
  if (!footer.enabled) return null;

  const logo = pageLogo || "";
  const title = String(pageTitle || "رادلینک").trim();
  const description = footer.description.trim();
  const brandText =
    footer.brandingText || "این سایت ساخته شده توسط رادلینک می‌باشد";

  return (
    <footer
      dir="rtl"
      className={cn(
        "relative isolate mt-8 overflow-hidden rounded-[30px] border text-center shadow-[0_24px_70px_-42px_rgba(15,23,42,0.55)] backdrop-blur-xl",
        compact ? "mx-3 px-4 pb-4 pt-5" : "mx-1 px-5 pb-5 pt-6 sm:px-6",
      )}
      style={{
        backgroundColor: footer.backgroundColor,
        color: footer.textColor,
        borderColor: footer.borderColor,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(255,255,255,0.72), transparent 34%), radial-gradient(circle at 8% 100%, rgba(255,255,255,0.34), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.20), transparent)",
        }}
      />

      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden border bg-white/82 shadow-[0_18px_48px_-26px_rgba(15,23,42,0.42)] ring-4 ring-white/35",
            compact ? "h-14 w-14 rounded-2xl" : "h-[72px] w-[72px] rounded-3xl",
          )}
          style={{ borderColor: footer.borderColor }}
        >
          {logo ? (
            <Image
              src={logo}
              alt={`لوگوی ${title}`}
              fill
              unoptimized
              sizes={compact ? "56px" : "72px"}
              className="object-contain p-2.5"
            />
          ) : (
            <span
              className={cn("font-black", compact ? "text-base" : "text-xl")}
              style={{ color: footer.accentColor }}
            >
              {title.slice(0, 1)}
            </span>
          )}
        </div>

        <p
          className={cn(
            "mt-3 max-w-full truncate font-black",
            compact ? "text-sm" : "text-base",
          )}
          style={{ color: footer.accentColor }}
        >
          {title}
        </p>

        {description ? (
          <p
            className={cn(
              "mt-1 max-w-md text-balance font-semibold opacity-85",
              compact ? "text-[11px] leading-5" : "text-xs leading-6",
            )}
          >
            {description}
          </p>
        ) : null}

        {footer.trustBadgeImage ? (
          <div
            className={cn(
              "relative mt-4 shrink-0 overflow-hidden rounded-2xl border bg-white/78 shadow-sm",
              compact ? "h-14 w-[88px]" : "h-16 w-[104px]",
            )}
            style={{ borderColor: footer.borderColor }}
          >
            <Image
              src={footer.trustBadgeImage}
              alt={footer.trustBadgeAlt || "نماد اعتماد"}
              fill
              unoptimized
              sizes={compact ? "88px" : "104px"}
              className="object-contain p-2"
            />
          </div>
        ) : null}

        <div
          className="mt-4 h-px w-full max-w-xs"
          style={{ backgroundColor: footer.borderColor }}
        />

        {footer.showRadlinkBranding ? (
          <p className="mt-3 text-[11px] font-bold leading-5 opacity-75">
            <RadlinkBrandingText
              text={brandText}
              accentColor={footer.accentColor}
            />
          </p>
        ) : (
          <p className="mt-3 text-[11px] leading-5 opacity-55">
            تمامی حقوق این صفحه محفوظ است.
          </p>
        )}
      </div>
    </footer>
  );
}

export default LandingFooter;
