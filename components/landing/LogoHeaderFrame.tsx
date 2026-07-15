import type {
  LogoHeaderSettings,
  LogoHeaderVariant,
} from "@/lib/design/logo-header";
import { normalizeLogoHeaderSettings } from "@/lib/design/logo-header";

const EDGE_WAVE_VARIANTS = new Set<LogoHeaderVariant>([
  "wave-jagged",
  "wave-steps",
  "wave-organic",
  "wave-slope",
]);

function isEdgeWaveVariant(variant: LogoHeaderVariant) {
  return EDGE_WAVE_VARIANTS.has(variant);
}

function edgeWaveForVariant(
  variant: LogoHeaderVariant,
  secondary: string,
  accent: string,
  opacity: number,
) {
  const fillOpacity = Math.min(1, Math.max(0.38, opacity + 0.32));
  const softOpacity = Math.min(0.44, Math.max(0.12, opacity * 0.55));

  switch (variant) {
    case "wave-steps":
      return (
        <>
          <path
            fill={accent}
            fillOpacity={fillOpacity}
            d="M0,64L0,128L90,128L90,160L180,160L180,160L270,160L270,96L360,96L360,224L450,224L450,256L540,256L540,224L630,224L630,96L720,96L720,192L810,192L810,96L900,96L900,224L990,224L990,160L1080,160L1080,96L1170,96L1170,0L1260,0L1260,128L1350,128L1350,128L1440,128L1440,0L1350,0L1350,0L1260,0L1260,0L1170,0L1170,0L1080,0L1080,0L990,0L990,0L900,0L900,0L810,0L810,0L720,0L720,0L630,0L630,0L540,0L540,0L450,0L450,0L360,0L360,0L270,0L270,0L180,0L180,0L90,0L90,0L0,0L0,0Z"
          />
          <path
            fill={secondary}
            fillOpacity={softOpacity}
            d="M0,112L0,168L120,168L120,196L240,196L240,132L360,132L360,244L480,244L480,270L600,270L600,176L720,176L720,228L840,228L840,136L960,136L960,244L1080,244L1080,176L1200,176L1200,72L1320,72L1320,158L1440,158L1440,0L0,0Z"
          />
        </>
      );
    case "wave-organic":
      return (
        <>
          <path
            fill={accent}
            fillOpacity={fillOpacity}
            d="M0,224L6.2,202.7C12.3,181,25,139,37,154.7C49.2,171,62,245,74,277.3C86.2,309,98,299,111,288C123.1,277,135,267,148,245.3C160,224,172,192,185,176C196.9,160,209,160,222,176C233.8,192,246,224,258,213.3C270.8,203,283,149,295,149.3C307.7,149,320,203,332,186.7C344.6,171,357,85,369,53.3C381.5,21,394,43,406,48C418.5,53,431,43,443,48C455.4,53,468,75,480,101.3C492.3,128,505,160,517,160C529.2,160,542,128,554,122.7C566.2,117,578,139,591,122.7C603.1,107,615,53,628,42.7C640,32,652,64,665,101.3C676.9,139,689,181,702,192C713.8,203,726,181,738,197.3C750.8,213,763,267,775,272C787.7,277,800,235,812,213.3C824.6,192,837,192,849,176C861.5,160,874,128,886,96C898.5,64,911,32,923,58.7C935.4,85,948,171,960,208C972.3,245,985,235,997,208C1009.2,181,1022,139,1034,128C1046.2,117,1058,139,1071,122.7C1083.1,107,1095,53,1108,74.7C1120,96,1132,192,1145,224C1156.9,256,1169,224,1182,186.7C1193.8,149,1206,107,1218,122.7C1230.8,139,1243,213,1255,213.3C1267.7,213,1280,139,1292,133.3C1304.6,128,1317,192,1329,192C1341.5,192,1354,128,1366,90.7C1378.5,53,1391,43,1403,58.7C1415.4,75,1428,117,1434,138.7L1440,160L1440,0L1433.8,0C1427.7,0,1415,0,1403,0C1390.8,0,1378,0,1366,0C1353.8,0,1342,0,1329,0C1316.9,0,1305,0,1292,0C1280,0,1268,0,1255,0C1243.1,0,1231,0,1218,0C1206.2,0,1194,0,1182,0C1169.2,0,1157,0,1145,0C1132.3,0,1120,0,1108,0C1095.4,0,1083,0,1071,0C1058.5,0,1046,0,1034,0C1021.5,0,1009,0,997,0C984.6,0,972,0,960,0C947.7,0,935,0,923,0C910.8,0,898,0,886,0C873.8,0,862,0,849,0C836.9,0,825,0,812,0C800,0,788,0,775,0C763.1,0,751,0,738,0C726.2,0,714,0,702,0C689.2,0,677,0,665,0C652.3,0,640,0,628,0C615.4,0,603,0,591,0C578.5,0,566,0,554,0C541.5,0,529,0,517,0C504.6,0,492,0,480,0C467.7,0,455,0,443,0C430.8,0,418,0,406,0C393.8,0,382,0,369,0C356.9,0,345,0,332,0C320,0,308,0,295,0C283.1,0,271,0,258,0C246.2,0,234,0,222,0C209.2,0,197,0,185,0C172.3,0,160,0,148,0C135.4,0,123,0,111,0C98.5,0,86,0,74,0C61.5,0,49,0,37,0C24.6,0,12,0,6,0L0,0Z"
          />
        </>
      );
    case "wave-slope":
      return (
        <>
          <path
            fill={accent}
            fillOpacity={fillOpacity}
            d="M0,320L40,320C80,320,160,320,240,320C320,320,400,320,480,293.3C560,267,640,213,720,192C800,171,880,181,960,176C1040,171,1120,149,1200,133.3C1280,117,1360,107,1400,101.3L1440,96L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z"
          />
          <path
            fill={secondary}
            fillOpacity={softOpacity}
            d="M0,304L60,304C120,304,240,304,360,288C480,272,600,224,720,202C840,181,960,186,1080,160C1200,134,1320,76,1380,48L1440,20L1440,0L0,0Z"
          />
        </>
      );
    case "wave-jagged":
    default:
      return (
        <>
          <path
            fill={accent}
            fillOpacity={fillOpacity}
            d="M0,96L36.9,0L73.8,192L110.8,224L147.7,256L184.6,96L221.5,192L258.5,160L295.4,256L332.3,288L369.2,224L406.2,96L443.1,288L480,224L516.9,192L553.8,192L590.8,160L627.7,160L664.6,96L701.5,96L738.5,192L775.4,96L812.3,192L849.2,64L886.2,0L923.1,160L960,256L996.9,32L1033.8,96L1070.8,96L1107.7,32L1144.6,288L1181.5,64L1218.5,192L1255.4,192L1292.3,128L1329.2,288L1366.2,288L1403.1,32L1440,224L1440,320L1403.1,320L1366.2,320L1329.2,320L1292.3,320L1255.4,320L1218.5,320L1181.5,320L1144.6,320L1107.7,320L1070.8,320L1033.8,320L996.9,320L960,320L923.1,320L886.2,320L849.2,320L812.3,320L775.4,320L738.5,320L701.5,320L664.6,320L627.7,320L590.8,320L553.8,320L516.9,320L480,320L443.1,320L406.2,320L369.2,320L332.3,320L295.4,320L258.5,320L221.5,320L184.6,320L147.7,320L110.8,320L73.8,320L36.9,320L0,320Z"
          />
        </>
      );
  }
}

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
    case "wave-aurora":
      return (
        <>
          <circle
            cx="670"
            cy="72"
            r="210"
            fill={accent}
            opacity={Math.min(0.34, opacity * 0.7)}
            style={{ filter: "blur(18px)" }}
          />
          <circle
            cx="250"
            cy="40"
            r="170"
            fill={secondary}
            opacity={Math.min(0.24, opacity * 0.56)}
            style={{ filter: "blur(22px)" }}
          />
          <path
            d="M0 168 C132 196 244 232 398 224 C558 216 642 172 746 96 C822 40 890 36 960 54 V240 H0 Z"
            fill={primary}
            opacity={Math.min(0.5, opacity + 0.08)}
          />
          <path
            d="M0 142 C154 188 288 222 444 210 C608 198 704 126 790 62 C858 12 910 8 960 24 V240 H0 Z"
            fill={secondary}
            opacity={Math.min(0.72, opacity + 0.16)}
          />
          <path
            d="M0 204 C166 234 342 246 512 232 C674 218 770 166 864 126 C902 110 932 104 960 108 V240 H0 Z"
            fill={accent}
            opacity={Math.min(0.84, opacity + 0.22)}
          />
          <path
            d="M438 86 H522"
            stroke={soft}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 14"
            opacity={Math.min(0.9, opacity + 0.28)}
          />
          <circle cx="558" cy="106" r="3" fill={accent} opacity={Math.min(0.95, opacity + 0.32)} />
        </>
      );
    case "wave-cut":
      return (
        <>
          <path
            d="M0 0 H960 V58 C902 46 860 48 812 74 C766 100 724 94 684 64 C642 32 606 38 566 68 C528 96 480 94 438 66 C398 38 360 34 318 60 C278 84 236 82 198 58 C160 34 118 44 76 66 C42 84 18 82 0 72 Z"
            fill={secondary}
            opacity={Math.min(0.9, opacity + 0.2)}
          />
          <path
            d="M0 122 C72 94 128 98 190 130 C260 166 338 144 412 118 C500 86 586 106 668 132 C758 160 850 156 960 116 V240 H0 Z"
            fill={accent}
            opacity={Math.min(0.58, opacity + 0.1)}
          />
          <path
            d="M0 184 C86 216 144 202 208 154 C294 90 398 92 506 122 C598 148 660 142 742 102 C826 62 894 62 960 88 V240 H0 Z"
            fill={secondary}
            opacity={Math.min(0.5, opacity + 0.04)}
          />
          <path
            d="M84 224 C120 190 144 190 176 224 C206 256 252 258 284 224 C326 180 362 180 404 224 C442 264 508 260 548 224 C590 186 622 184 664 224 C704 262 766 260 806 224 C850 184 890 182 936 224"
            fill="none"
            stroke={soft}
            strokeWidth="15"
            strokeLinecap="round"
            opacity={Math.min(0.42, opacity * 0.72)}
          />
        </>
      );
    case "glass-aurora":
      return (
        <>
          <circle
            cx="120"
            cy="24"
            r="180"
            fill={accent}
            opacity={Math.min(0.36, opacity * 0.75)}
            style={{ filter: "blur(16px)" }}
          />
          <circle
            cx="820"
            cy="48"
            r="210"
            fill={secondary}
            opacity={Math.min(0.34, opacity * 0.72)}
            style={{ filter: "blur(18px)" }}
          />
          <circle
            cx="470"
            cy="232"
            r="260"
            fill={soft}
            opacity={Math.min(0.42, opacity * 0.82)}
            style={{ filter: "blur(20px)" }}
          />
          <path
            d="M0 172 C132 118 248 204 394 150 C548 94 676 72 960 124 V240 H0 Z"
            fill={secondary}
            opacity={Math.min(0.58, opacity + 0.06)}
          />
          <path
            d="M0 204 C160 148 300 226 454 182 C620 136 752 92 960 146 V240 H0 Z"
            fill={accent}
            opacity={Math.min(0.46, opacity * 0.9)}
          />
          <path
            d="M132 64 H286 M626 72 H760 M382 42 H462"
            stroke={soft}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="5 14"
            opacity={Math.min(0.9, opacity + 0.24)}
          />
        </>
      );
    case "glass-prism":
      return (
        <>
          <path
            d="M0 0 H960 V240 H0 Z"
            fill={primary}
            opacity={Math.min(0.18, opacity * 0.35)}
          />
          {[
            "M44 18 L318 0 L210 240 L0 240 Z",
            "M292 0 L610 0 L482 240 L172 240 Z",
            "M596 0 L960 0 L960 240 L694 240 Z",
          ].map((path, index) => (
            <path
              key={path}
              d={path}
              fill={index % 2 ? accent : secondary}
              opacity={Math.min(0.44, opacity * (0.74 + index * 0.12))}
            />
          ))}
          <path
            d="M96 0 L420 240 M382 0 L692 240 M700 0 L388 240"
            stroke={soft}
            strokeWidth="4"
            strokeLinecap="round"
            opacity={Math.min(0.42, opacity * 0.72)}
          />
          <path
            d="M0 184 C160 142 330 206 492 160 C646 116 760 96 960 134 V240 H0 Z"
            fill={soft}
            opacity={Math.min(0.28, opacity * 0.62)}
          />
        </>
      );
    case "liquid-blob":
      return (
        <>
          <path
            d="M122 20 C252 -38 352 38 306 134 C260 230 78 222 52 124 C34 58 70 34 122 20 Z"
            fill={accent}
            opacity={Math.min(0.58, opacity + 0.04)}
            style={{ filter: "blur(2px)" }}
          />
          <path
            d="M676 12 C834 -42 944 52 886 154 C830 254 642 246 598 144 C562 64 606 34 676 12 Z"
            fill={secondary}
            opacity={Math.min(0.56, opacity + 0.04)}
            style={{ filter: "blur(2px)" }}
          />
          <path
            d="M262 204 C392 122 536 136 700 208 V240 H208 Z"
            fill={soft}
            opacity={Math.min(0.34, opacity * 0.68)}
          />
          <circle cx="168" cy="66" r="22" fill={soft} opacity={Math.min(0.74, opacity + 0.18)} />
          <circle cx="742" cy="62" r="28" fill={soft} opacity={Math.min(0.62, opacity + 0.12)} />
        </>
      );
    case "holo-orbit":
      return (
        <>
          <circle
            cx="480"
            cy="120"
            r="190"
            fill={secondary}
            opacity={Math.min(0.2, opacity * 0.38)}
            style={{ filter: "blur(16px)" }}
          />
          {[0, 1, 2, 3].map((index) => (
            <ellipse
              key={index}
              cx="480"
              cy="120"
              rx={180 + index * 72}
              ry={42 + index * 17}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="8"
              strokeDasharray={index % 2 ? "10 18" : "32 16"}
              opacity={Math.min(0.52, opacity * (0.72 + index * 0.08))}
              transform={`rotate(${index * 24} 480 120)`}
            />
          ))}
          <circle cx="324" cy="74" r="9" fill={accent} opacity={Math.min(0.9, opacity + 0.22)} />
          <circle cx="684" cy="166" r="7" fill={soft} opacity={Math.min(0.86, opacity + 0.18)} />
          <path
            d="M0 198 C180 162 310 216 480 186 C658 154 770 126 960 172 V240 H0 Z"
            fill={accent}
            opacity={Math.min(0.34, opacity * 0.68)}
          />
        </>
      );
    case "chrome-fold":
      return (
        <>
          <path
            d="M0 52 H960 L822 132 H122 Z"
            fill={secondary}
            opacity={Math.min(0.56, opacity + 0.06)}
          />
          <path
            d="M122 132 H822 L960 216 H0 Z"
            fill={accent}
            opacity={Math.min(0.5, opacity)}
          />
          <path
            d="M0 74 H960 L864 104 H96 Z"
            fill={soft}
            opacity={Math.min(0.36, opacity * 0.7)}
          />
          <path
            d="M112 0 L338 240 M640 0 L414 240"
            stroke={faint}
            strokeWidth="22"
            strokeLinecap="round"
            opacity={Math.min(0.42, opacity * 0.85)}
          />
        </>
      );
    case "mist-bubbles":
      return (
        <>
          {Array.from({ length: 18 }).map((_, index) => {
            const x = 42 + ((index * 97) % 880);
            const y = 28 + ((index * 53) % 188);
            const radius = 20 + ((index * 13) % 46);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={radius}
                fill={index % 3 === 0 ? accent : index % 3 === 1 ? secondary : soft}
                opacity={Math.min(0.32, opacity * 0.62)}
                style={{ filter: index % 2 ? "blur(2px)" : undefined }}
              />
            );
          })}
          <path
            d="M0 196 C128 146 244 216 382 178 C538 134 696 132 960 184 V240 H0 Z"
            fill={soft}
            opacity={Math.min(0.3, opacity * 0.62)}
          />
        </>
      );
    case "neon-caustic":
      return (
        <>
          <path
            d="M0 0 H960 V240 H0 Z"
            fill={primary}
            opacity={Math.min(0.16, opacity * 0.32)}
          />
          {Array.from({ length: 8 }).map((_, index) => (
            <path
              key={index}
              d={`M${index * 138 - 84} 240 C${index * 138 + 8} 170 ${index * 138 + 24} 74 ${index * 138 + 138} 0`}
              fill="none"
              stroke={index % 2 ? secondary : accent}
              strokeWidth={index % 2 ? 10 : 7}
              strokeLinecap="round"
              opacity={Math.min(0.44, opacity * 0.78)}
            />
          ))}
          <path
            d="M0 166 C120 116 256 184 392 142 C570 86 716 92 960 136 V240 H0 Z"
            fill={soft}
            opacity={Math.min(0.3, opacity * 0.62)}
          />
        </>
      );
    case "neon-mist":
      return (
        <>
          <circle
            cx="120"
            cy="36"
            r="170"
            fill={secondary}
            opacity={Math.min(0.28, opacity * 0.58)}
            style={{ filter: "blur(18px)" }}
          />
          <circle
            cx="818"
            cy="74"
            r="210"
            fill={accent}
            opacity={Math.min(0.28, opacity * 0.58)}
            style={{ filter: "blur(20px)" }}
          />
          <path
            d="M0 160 C130 104 260 198 408 146 C570 88 702 82 960 134 V240 H0 Z"
            fill={secondary}
            opacity={Math.min(0.5, opacity + 0.04)}
          />
          <path
            d="M0 204 C154 158 302 220 466 184 C646 144 772 126 960 166 V240 H0 Z"
            fill={soft}
            opacity={Math.min(0.3, opacity * 0.64)}
          />
          <path
            d="M104 64 H230 M650 68 H806 M356 44 H448"
            stroke={soft}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="6 18"
            opacity={Math.min(0.86, opacity + 0.2)}
          />
        </>
      );
    case "frosted-orbit":
      return (
        <>
          <circle
            cx="480"
            cy="118"
            r="210"
            fill={secondary}
            opacity={Math.min(0.18, opacity * 0.38)}
            style={{ filter: "blur(18px)" }}
          />
          {[0, 1, 2].map((index) => (
            <ellipse
              key={index}
              cx="480"
              cy="120"
              rx={190 + index * 86}
              ry={44 + index * 20}
              fill="none"
              stroke={index % 2 ? secondary : soft}
              strokeWidth="8"
              strokeDasharray={index === 1 ? "12 18" : "34 18"}
              opacity={Math.min(0.45, opacity * (0.66 + index * 0.1))}
              transform={`rotate(${index * 20} 480 120)`}
            />
          ))}
          <path
            d="M0 198 C180 150 322 214 492 180 C660 146 766 126 960 170 V240 H0 Z"
            fill={accent}
            opacity={Math.min(0.3, opacity * 0.62)}
          />
          <circle cx="334" cy="74" r="7" fill={soft} opacity={Math.min(0.8, opacity + 0.16)} />
          <circle cx="704" cy="162" r="8" fill={secondary} opacity={Math.min(0.72, opacity + 0.12)} />
        </>
      );
    case "laser-veil":
      return (
        <>
          <path
            d="M0 0 H960 V240 H0 Z"
            fill={primary}
            opacity={Math.min(0.12, opacity * 0.26)}
          />
          {Array.from({ length: 7 }).map((_, index) => (
            <path
              key={index}
              d={`M${index * 152 - 110} 240 C${index * 152 - 22} 178 ${index * 152 + 34} 72 ${index * 152 + 150} 0`}
              fill="none"
              stroke={index % 2 ? secondary : accent}
              strokeWidth={index % 2 ? 8 : 5}
              strokeLinecap="round"
              opacity={Math.min(0.38, opacity * 0.68)}
            />
          ))}
          <path
            d="M0 164 C120 118 246 182 390 144 C560 98 710 96 960 138 V240 H0 Z"
            fill={soft}
            opacity={Math.min(0.28, opacity * 0.58)}
          />
        </>
      );
    case "polar-liquid":
      return (
        <>
          <path
            d="M126 18 C262 -30 360 48 306 142 C256 230 78 220 56 128 C40 62 74 34 126 18 Z"
            fill={secondary}
            opacity={Math.min(0.44, opacity * 0.82)}
            style={{ filter: "blur(2px)" }}
          />
          <path
            d="M694 12 C842 -32 942 62 884 158 C828 250 646 246 606 146 C574 68 620 34 694 12 Z"
            fill={accent}
            opacity={Math.min(0.4, opacity * 0.78)}
            style={{ filter: "blur(2px)" }}
          />
          <path
            d="M0 188 C146 132 300 212 458 174 C632 132 766 120 960 166 V240 H0 Z"
            fill={soft}
            opacity={Math.min(0.32, opacity * 0.64)}
          />
          <circle cx="168" cy="66" r="18" fill={soft} opacity={Math.min(0.62, opacity + 0.12)} />
          <circle cx="748" cy="72" r="23" fill={soft} opacity={Math.min(0.52, opacity + 0.08)} />
        </>
      );
    case "blue-vapor":
      return (
        <>
          <path
            d="M0 74 C150 24 250 108 390 62 C550 10 682 30 960 72 V0 H0 Z"
            fill={secondary}
            opacity={Math.min(0.32, opacity * 0.65)}
          />
          <path
            d="M0 164 C126 112 250 180 388 138 C552 88 706 96 960 140 V240 H0 Z"
            fill={accent}
            opacity={Math.min(0.34, opacity * 0.68)}
          />
          <path
            d="M0 210 C170 166 310 230 486 194 C668 158 786 146 960 182 V240 H0 Z"
            fill={soft}
            opacity={Math.min(0.24, opacity * 0.54)}
          />
          {Array.from({ length: 18 }).map((_, index) => (
            <circle
              key={index}
              cx={48 + ((index * 83) % 880)}
              cy={34 + ((index * 47) % 160)}
              r={index % 3 === 0 ? 3 : 1.8}
              fill={index % 2 ? soft : secondary}
              opacity={Math.min(0.42, opacity * 0.75)}
            />
          ))}
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
  const headerTitle = normalized.title.trim();
  const headerDescription = normalized.description.trim();
  const hasHeaderText = Boolean(headerTitle || headerDescription);
  const framedLogoSize = Math.min(
    normalized.logoSize,
    Math.max(44, normalized.height - (hasHeaderText ? 86 : 32)),
  );
  const hasBackgroundImage = Boolean(normalized.backgroundImage.trim());
  const hasEdgeWave = isEdgeWaveVariant(normalized.variant);

  if (!normalized.enabled || (normalized.variant === "none" && !hasBackgroundImage)) {
    if (!hasLogo && !showPlaceholder && !hasHeaderText) return null;

    return (
      <div className="flex w-full justify-center px-4 pb-5 pt-6">
        <div className="flex flex-col items-center text-center">
          <LogoSlot
            logo={logo}
            logoShape={logoShape}
            logoSize={normalized.logoSize}
            title={title}
            showPlaceholder={showPlaceholder}
          />
          <HeaderText
            title={headerTitle}
            description={headerDescription}
            titleColor={normalized.textColor}
            descriptionColor={normalized.descriptionColor}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full justify-center px-2 pb-6 pt-3">
      <div
        className="relative w-full shadow-sm"
        style={{
          maxWidth: normalized.maxWidth,
          height: normalized.height,
          borderRadius: normalized.cornerRadius,
          background: `linear-gradient(135deg, ${normalized.primaryColor}, ${normalized.secondaryColor})`,
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: "inherit" }}
        >
          {hasBackgroundImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${JSON.stringify(normalized.backgroundImage)})`,
              }}
              aria-hidden="true"
            />
          ) : null}
          {normalized.variant !== "none" && !hasEdgeWave ? (
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
          ) : null}
        </div>
        {hasEdgeWave ? (
          <svg
            className="pointer-events-none absolute inset-x-0 -bottom-16 h-40 w-full"
            style={{
              filter: "drop-shadow(0 18px 26px rgba(15, 23, 42, 0.14))",
              zIndex: 1,
            }}
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {edgeWaveForVariant(
              normalized.variant,
              normalized.secondaryColor,
              normalized.accentColor,
              normalized.patternOpacity,
            )}
          </svg>
        ) : null}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{ zIndex: 2 }}
        >
          <LogoSlot
            logo={logo}
            logoShape={logoShape}
            logoSize={framedLogoSize}
            title={title}
            showPlaceholder={showPlaceholder}
          />
          <HeaderText
            title={headerTitle}
            description={headerDescription}
            titleColor={normalized.textColor}
            descriptionColor={normalized.descriptionColor}
          />
        </div>
      </div>
    </div>
  );
}

function HeaderText({
  title,
  description,
  titleColor,
  descriptionColor,
}: {
  title: string;
  description: string;
  titleColor: string;
  descriptionColor: string;
}) {
  if (!title && !description) return null;

  return (
    <div className="mt-3 max-w-[min(28rem,90%)]">
      {title ? (
        <p
          className="line-clamp-1 text-[15px] font-black leading-6 sm:text-base"
          style={{ color: titleColor }}
        >
          {title}
        </p>
      ) : null}
      {description ? (
        <p
          className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-5 sm:text-xs"
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
      ) : null}
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
            لوگو
        </div>
      )}
    </div>
  );
}
