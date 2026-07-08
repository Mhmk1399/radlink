import type {
  LogoHeaderSettings,
  LogoHeaderVariant,
} from "@/lib/design/logo-header";
import { normalizeLogoHeaderSettings } from "@/lib/design/logo-header";

function patternForVariant(
  variant: LogoHeaderVariant,
  primary: string,
  secondary: string,
  accent: string,
  opacity: number,
) {
  const soft = `rgba(255,255,255,${Math.min(0.8, opacity + 0.16)})`;
  const faint = `rgba(255,255,255,${Math.max(0.08, opacity - 0.12)})`;

  switch (variant) {
    case "wave-deep":
      return (
        <>
          <path d="M0 124 C170 42 310 218 480 122 C620 42 766 72 960 142 V240 H0 Z" fill={secondary} opacity={opacity} />
          <path d="M0 154 C190 82 330 204 520 136 C690 76 812 112 960 78 V240 H0 Z" fill={accent} opacity={opacity} />
        </>
      );
    case "wave-split":
      return (
        <>
          <path d="M0 78 C144 128 248 28 388 84 C548 148 690 44 960 82 V0 H0 Z" fill={secondary} opacity={opacity} />
          <path d="M0 154 C170 108 274 196 458 150 C640 104 744 192 960 126 V240 H0 Z" fill={accent} opacity={opacity} />
        </>
      );
    case "curve-arc":
      return <circle cx="480" cy="248" r="360" fill={secondary} opacity={opacity} />;
    case "curve-layer":
      return (
        <>
          <circle cx="480" cy="270" r="390" fill={secondary} opacity={opacity} />
          <circle cx="480" cy="292" r="300" fill={accent} opacity={opacity} />
        </>
      );
    case "blob-center":
      return <path d="M322 64 C410 -14 566 8 648 86 C730 164 694 272 538 284 C390 296 244 250 232 158 C226 116 260 84 322 64 Z" fill={secondary} opacity={opacity} />;
    case "blob-side":
      return (
        <>
          <path d="M-40 42 C128 -22 214 86 180 202 C150 304 -32 288 -78 184 C-112 108 -104 66 -40 42 Z" fill={secondary} opacity={opacity} />
          <path d="M844 20 C1000 4 1038 126 978 214 C920 300 768 244 786 128 C792 78 816 36 844 20 Z" fill={accent} opacity={opacity} />
        </>
      );
    case "ribbon":
      return <path d="M0 58 H960 L868 150 L960 240 H0 L92 150 Z" fill={secondary} opacity={opacity} />;
    case "ribbon-fold":
      return (
        <>
          <path d="M0 54 H960 L840 132 H120 Z" fill={secondary} opacity={opacity} />
          <path d="M120 132 H840 L960 216 H0 Z" fill={accent} opacity={opacity} />
        </>
      );
    case "diagonal":
      return <path d="M0 0 H960 V72 L0 218 Z" fill={secondary} opacity={opacity} />;
    case "diagonal-stripes":
      return (
        <>
          {Array.from({ length: 8 }).map((_, index) => (
            <path
              key={index}
              d={`M${index * 160 - 260} 240 L${index * 160 + 20} 0 H${index * 160 + 90} L${index * 160 - 190} 240 Z`}
              fill={index % 2 === 0 ? secondary : accent}
              opacity={opacity}
            />
          ))}
        </>
      );
    case "dots":
      return (
        <>
          {Array.from({ length: 44 }).map((_, index) => (
            <circle
              key={index}
              cx={50 + (index % 11) * 86}
              cy={34 + Math.floor(index / 11) * 54}
              r={index % 3 === 0 ? 6 : 3.5}
              fill={index % 2 === 0 ? secondary : soft}
              opacity={opacity}
            />
          ))}
        </>
      );
    case "grid":
      return (
        <>
          {Array.from({ length: 13 }).map((_, index) => (
            <path key={`v-${index}`} d={`M${index * 80} 0 V240`} stroke={faint} strokeWidth="2" />
          ))}
          {Array.from({ length: 5 }).map((_, index) => (
            <path key={`h-${index}`} d={`M0 ${index * 60} H960`} stroke={faint} strokeWidth="2" />
          ))}
        </>
      );
    case "arches":
      return (
        <>
          {Array.from({ length: 7 }).map((_, index) => (
            <path
              key={index}
              d={`M${72 + index * 136} 220 V120 A48 48 0 0 1 ${168 + index * 136} 120 V220`}
              fill="none"
              stroke={index % 2 === 0 ? secondary : soft}
              strokeWidth="18"
              opacity={opacity}
            />
          ))}
        </>
      );
    case "sunburst":
      return (
        <>
          {Array.from({ length: 18 }).map((_, index) => (
            <path key={index} d={`M480 120 L${480 + Math.cos((index * Math.PI) / 9) * 600} ${120 + Math.sin((index * Math.PI) / 9) * 600}`} stroke={index % 2 ? secondary : accent} strokeWidth="34" opacity={opacity * 0.7} />
          ))}
        </>
      );
    case "mountains":
      return (
        <>
          <path d="M0 210 L150 88 L284 184 L410 64 L580 210 Z" fill={secondary} opacity={opacity} />
          <path d="M340 220 L520 94 L660 174 L780 72 L960 220 Z" fill={accent} opacity={opacity} />
        </>
      );
    case "steps":
      return (
        <>
          <path d="M0 196 H160 V160 H320 V124 H480 V88 H640 V52 H960 V240 H0 Z" fill={secondary} opacity={opacity} />
          <path d="M0 226 H220 V190 H438 V154 H656 V118 H960 V240 H0 Z" fill={accent} opacity={opacity * 0.8} />
        </>
      );
    case "rings":
      return (
        <>
          {[70, 120, 170, 220, 270].map((radius, index) => (
            <circle key={radius} cx="480" cy="120" r={radius} fill="none" stroke={index % 2 ? secondary : soft} strokeWidth="18" opacity={opacity} />
          ))}
        </>
      );
    case "confetti":
      return (
        <>
          {Array.from({ length: 38 }).map((_, index) => (
            <rect
              key={index}
              x={28 + (index * 73) % 900}
              y={18 + (index * 41) % 200}
              width={index % 2 ? 28 : 14}
              height={8}
              rx={4}
              transform={`rotate(${(index * 31) % 180} ${28 + (index * 73) % 900} ${18 + (index * 41) % 200})`}
              fill={index % 3 === 0 ? secondary : index % 3 === 1 ? accent : soft}
              opacity={opacity}
            />
          ))}
        </>
      );
    case "minimal-line":
      return (
        <>
          <path d="M90 120 H870" stroke={soft} strokeWidth="3" />
          <path d="M350 160 H610" stroke={secondary} strokeWidth="10" strokeLinecap="round" opacity={opacity} />
        </>
      );
    case "liquid":
      return (
        <>
          <path d="M126 38 C246 -22 330 48 292 132 C252 218 90 216 62 128 C42 68 74 50 126 38 Z" fill={accent} opacity={opacity} />
          <path d="M656 36 C806 -18 918 62 880 154 C842 246 664 252 608 164 C556 82 596 58 656 36 Z" fill={secondary} opacity={opacity} />
          <path d="M286 196 C406 126 520 128 654 202 V240 H252 Z" fill={soft} opacity={opacity} />
        </>
      );
    case "mesh-gradient":
      return (
        <>
          <circle cx="170" cy="42" r="180" fill={accent} opacity={opacity} />
          <circle cx="830" cy="60" r="220" fill={secondary} opacity={opacity} />
          <circle cx="470" cy="250" r="250" fill={soft} opacity={opacity * 0.7} />
        </>
      );
    case "topography":
      return (
        <>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <path
              key={index}
              d={`M${70 + index * 28} ${118 - index * 11} C${210 + index * 16} ${24 + index * 20} ${360 + index * 44} ${236 - index * 18} ${524 + index * 35} ${118 - index * 7} C${650 + index * 24} ${34 + index * 18} ${776 + index * 35} ${202 - index * 9} ${930} ${92 + index * 12}`}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="7"
              opacity={opacity}
            />
          ))}
        </>
      );
    case "checker":
      return (
        <>
          {Array.from({ length: 60 }).map((_, index) => (
            <rect
              key={index}
              x={(index % 15) * 64}
              y={Math.floor(index / 15) * 60}
              width="64"
              height="60"
              fill={(index + Math.floor(index / 15)) % 2 ? secondary : accent}
              opacity={opacity * 0.45}
            />
          ))}
        </>
      );
    case "bubbles":
      return (
        <>
          {Array.from({ length: 24 }).map((_, index) => (
            <circle
              key={index}
              cx={42 + ((index * 97) % 880)}
              cy={28 + ((index * 53) % 190)}
              r={18 + ((index * 11) % 34)}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="7"
              opacity={opacity}
            />
          ))}
        </>
      );
    case "scales":
      return (
        <>
          {Array.from({ length: 44 }).map((_, index) => (
            <path
              key={index}
              d={`M${(index % 11) * 90 - 14} ${Math.floor(index / 11) * 58 + 58} A45 45 0 0 1 ${(index % 11) * 90 + 76} ${Math.floor(index / 11) * 58 + 58}`}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="10"
              opacity={opacity}
            />
          ))}
        </>
      );
    case "petals":
      return (
        <>
          {Array.from({ length: 18 }).map((_, index) => (
            <ellipse
              key={index}
              cx={80 + ((index * 103) % 820)}
              cy={40 + ((index * 71) % 170)}
              rx="42"
              ry="14"
              transform={`rotate(${(index * 37) % 180} ${80 + ((index * 103) % 820)} ${40 + ((index * 71) % 170)})`}
              fill={index % 2 ? secondary : accent}
              opacity={opacity}
            />
          ))}
        </>
      );
    case "zigzag":
      return (
        <>
          {Array.from({ length: 6 }).map((_, index) => (
            <path
              key={index}
              d={`M0 ${42 + index * 34} L80 ${12 + index * 34} L160 ${42 + index * 34} L240 ${12 + index * 34} L320 ${42 + index * 34} L400 ${12 + index * 34} L480 ${42 + index * 34} L560 ${12 + index * 34} L640 ${42 + index * 34} L720 ${12 + index * 34} L800 ${42 + index * 34} L880 ${12 + index * 34} L960 ${42 + index * 34}`}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="9"
              opacity={opacity}
            />
          ))}
        </>
      );
    case "wave-repeat":
      return (
        <>
          {Array.from({ length: 5 }).map((_, index) => (
            <path
              key={index}
              d={`M0 ${50 + index * 40} C90 ${10 + index * 40} 150 ${90 + index * 40} 240 ${50 + index * 40} S390 ${90 + index * 40} 480 ${50 + index * 40} S630 ${10 + index * 40} 720 ${50 + index * 40} S870 ${90 + index * 40} 960 ${50 + index * 40}`}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="11"
              opacity={opacity}
            />
          ))}
        </>
      );
    case "corner-swoop":
      return (
        <>
          <path d="M0 0 H420 C210 26 82 110 0 240 Z" fill={accent} opacity={opacity} />
          <path d="M960 0 H560 C758 40 870 124 960 240 Z" fill={secondary} opacity={opacity} />
        </>
      );
    case "split-circles":
      return (
        <>
          <circle cx="0" cy="120" r="190" fill={secondary} opacity={opacity} />
          <circle cx="960" cy="120" r="190" fill={accent} opacity={opacity} />
          <circle cx="480" cy="120" r="90" fill={soft} opacity={opacity * 0.8} />
        </>
      );
    case "plus-grid":
      return (
        <>
          {Array.from({ length: 42 }).map((_, index) => {
            const x = 42 + (index % 14) * 68;
            const y = 30 + Math.floor(index / 14) * 72;
            return (
              <path
                key={index}
                d={`M${x - 12} ${y} H${x + 12} M${x} ${y - 12} V${y + 12}`}
                stroke={index % 2 ? secondary : soft}
                strokeWidth="7"
                strokeLinecap="round"
                opacity={opacity}
              />
            );
          })}
        </>
      );
    case "diamonds":
      return (
        <>
          {Array.from({ length: 40 }).map((_, index) => {
            const x = 40 + (index % 10) * 98;
            const y = 34 + Math.floor(index / 10) * 58;
            return (
              <path
                key={index}
                d={`M${x} ${y - 20} L${x + 28} ${y} L${x} ${y + 20} L${x - 28} ${y} Z`}
                fill={index % 2 ? secondary : accent}
                opacity={opacity}
              />
            );
          })}
        </>
      );
    case "honeycomb":
      return (
        <>
          {Array.from({ length: 36 }).map((_, index) => {
            const x = 38 + (index % 12) * 82 + (Math.floor(index / 12) % 2) * 40;
            const y = 34 + Math.floor(index / 12) * 70;
            return (
              <path
                key={index}
                d={`M${x} ${y - 24} L${x + 24} ${y - 12} L${x + 24} ${y + 12} L${x} ${y + 24} L${x - 24} ${y + 12} L${x - 24} ${y - 12} Z`}
                fill="none"
                stroke={index % 2 ? secondary : soft}
                strokeWidth="6"
                opacity={opacity}
              />
            );
          })}
        </>
      );
    case "barcode":
      return (
        <>
          {Array.from({ length: 34 }).map((_, index) => (
            <rect
              key={index}
              x={index * 31}
              y={index % 2 ? 26 : 0}
              width={8 + ((index * 5) % 24)}
              height={index % 3 ? 240 : 184}
              rx="5"
              fill={index % 2 ? secondary : soft}
              opacity={opacity}
            />
          ))}
        </>
      );
    case "orbit":
      return (
        <>
          {[0, 1, 2, 3].map((index) => (
            <ellipse
              key={index}
              cx="480"
              cy="120"
              rx={170 + index * 82}
              ry={40 + index * 18}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="9"
              opacity={opacity}
              transform={`rotate(${index * 24} 480 120)`}
            />
          ))}
        </>
      );
    case "wave-soft":
    default:
      return <path d="M0 136 C152 94 274 164 420 128 C592 86 730 62 960 116 V240 H0 Z" fill={secondary} opacity={opacity} />;
  }
}

export function LogoHeaderFrame({
  settings,
  logo,
  logoShape = "square",
  title,
  showPlaceholder = false,
}: {
  settings?: Partial<LogoHeaderSettings> | null;
  logo?: string;
  logoShape?: "square" | "circle";
  title?: string;
  showPlaceholder?: boolean;
}) {
  const normalized = normalizeLogoHeaderSettings(settings);
  const hasLogo = Boolean(logo?.trim());
  const framedLogoSize = Math.min(
    normalized.logoSize,
    Math.max(48, normalized.height - 32),
  );

  if (!normalized.enabled || normalized.variant === "none") {
    if (!hasLogo && !showPlaceholder) return null;

    return (
      <div className="flex w-full justify-center px-4 pb-5 pt-6">
        <LogoSlot
          logo={logo}
          logoShape={logoShape}
          logoSize={normalized.logoSize}
          title={title}
          showPlaceholder={showPlaceholder}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center px-2 pb-6 pt-3">
      <div
        className="relative w-full overflow-hidden shadow-sm"
        style={{
          maxWidth: normalized.maxWidth,
          height: normalized.height,
          borderRadius: normalized.cornerRadius,
          background: `linear-gradient(135deg, ${normalized.primaryColor}, ${normalized.secondaryColor})`,
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 960 240"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {patternForVariant(
            normalized.variant,
            normalized.primaryColor,
            normalized.secondaryColor,
            normalized.accentColor,
            normalized.patternOpacity,
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <LogoSlot
            logo={logo}
            logoShape={logoShape}
            logoSize={framedLogoSize}
            title={title}
            showPlaceholder={showPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}

function LogoSlot({
  logo,
  logoShape,
  logoSize,
  title,
  showPlaceholder,
}: {
  logo?: string;
  logoShape: "square" | "circle";
  logoSize: number;
  title?: string;
  showPlaceholder: boolean;
}) {
  const hasLogo = Boolean(logo?.trim());
  if (!hasLogo && !showPlaceholder) return null;

  return (
    <div
      className={[
        "relative overflow-hidden border border-white/70 bg-white/95 shadow-[0_16px_45px_rgba(15,23,42,0.18)] ring-4 ring-white/35",
        logoShape === "circle" ? "rounded-full" : "rounded-2xl",
      ].join(" ")}
      style={{ width: logoSize, height: logoSize }}
    >
      {hasLogo ? (
        <img
          src={logo}
          alt={title ? `لوگوی ${title}` : "لوگوی صفحه"}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-center text-[11px] font-bold leading-5 text-neutral-400">
          جای لوگو
        </div>
      )}
    </div>
  );
}
