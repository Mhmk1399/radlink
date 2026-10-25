import {
  isRadFirstName,
  normalizeUserAccountBadge,
  type UserAccountBadge as UserAccountBadgeValue,
} from "@/lib/users/accountBadge";

type BadgeSize = "sm" | "md";

function getContrastColor(hex: string) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 158 ? "#172033" : "#ffffff";
}

function VerifiedMark({
  color,
  checkColor = "#ffffff",
  size,
}: {
  color: string;
  checkColor?: string;
  size: BadgeSize;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={size === "md" ? "h-5 w-5" : "h-4 w-4"}
      aria-hidden="true"
    >
      <path
        fill={color}
        d="M10.4 2.6a2.25 2.25 0 0 1 3.2 0l1.05 1.08 1.5-.08a2.25 2.25 0 0 1 2.31 2.31l-.08 1.5 1.08 1.05a2.25 2.25 0 0 1 0 3.2l-1.08 1.05.08 1.5a2.25 2.25 0 0 1-2.31 2.31l-1.5-.08-1.05 1.08a2.25 2.25 0 0 1-3.2 0l-1.05-1.08-1.5.08a2.25 2.25 0 0 1-2.31-2.31l.08-1.5-1.08-1.05a2.25 2.25 0 0 1 0-3.2l1.08-1.05-.08-1.5A2.25 2.25 0 0 1 7.85 3.6l1.5.08 1.05-1.08Z"
      />
      <path
        fill="none"
        stroke={checkColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="m8.1 12.1 2.55 2.55 5.25-5.3"
      />
    </svg>
  );
}

export default function UserAccountBadge({
  firstName,
  badge,
  size = "sm",
  className = "",
}: {
  firstName?: string | null;
  badge?: Partial<UserAccountBadgeValue> | null;
  size?: BadgeSize;
  className?: string;
}) {
  if (isRadFirstName(firstName)) {
    return (
      <span
        className={`inline-flex shrink-0 align-[-0.15em] drop-shadow-[0_3px_8px_rgba(202,138,4,0.24)] ${className}`}
        role="img"
        aria-label="نشان تایید رادلینک"
        title="نشان تایید رادلینک"
      >
        <VerifiedMark color="#f8c537" size={size} />
      </span>
    );
  }

  const normalized = normalizeUserAccountBadge(badge);
  if (!normalized.enabled) return null;

  const foreground = getContrastColor(normalized.color);

  if (!normalized.label) {
    return (
      <span
        className={`inline-flex shrink-0 rounded-full p-0.5 align-[-0.15em] ${className}`}
        role="img"
        style={{ filter: `drop-shadow(0 3px 8px ${normalized.color}55)` }}
        aria-label="نشان تایید حساب"
        title="نشان تایید حساب"
      >
        <VerifiedMark
          color={normalized.color}
          checkColor={foreground}
          size="md"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex max-w-36 shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-bold leading-5 shadow-sm ${
        size === "md" ? "text-xs" : "text-[10px]"
      } ${className}`}
      role="img"
      style={{
        backgroundColor: normalized.color,
        color: foreground,
        borderColor: `${foreground}33`,
        boxShadow: `0 5px 14px ${normalized.color}33`,
      }}
      aria-label={`نشان حساب ${normalized.label}`}
      title={normalized.label}
    >
      <VerifiedMark
        color={foreground}
        checkColor={normalized.color}
        size={size}
      />
      <span className="truncate">{normalized.label}</span>
    </span>
  );
}
