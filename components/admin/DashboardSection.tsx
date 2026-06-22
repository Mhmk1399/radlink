// ─────────────────────────────────────────────────────────────────
// components/sections/DashboardSection.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import {
  useDashboardStats,
  type DashboardRecentTicket,
  type DashboardRecentUser,
  type DashboardStats,
} from "@/hook/admin/useDashboardStats";

import {
  FaUsers,
  FaFile,
  FaTicket,
  FaImage,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaEye,
  FaUserPlus,
  FaCircleCheck,
  FaClock,
  FaQrcode,
  FaBell,
  FaChevronLeft,
  FaUserTie,
  FaBoxOpen,
  FaPalette,
  FaArrowRight,
  FaCircle,
  FaShieldHalved,
} from "react-icons/fa6";

/* ══════════════════════════════════════════════
   SOFT PALETTE — mirrors DashboardShell
   ══════════════════════════════════════════════ */

const dash = {
  dark: {
    // ── Surfaces ──────────────────────────────
    page: "bg-[#111116]",
    card: "bg-[#1c1c23]",
    cardHover: "hover:bg-[#21212a]",
    input: "bg-[#1e1e26]",
    hover: "hover:bg-[#ffffff07]",
    active: "bg-[#c8a84b]/[0.07]",

    // ── Text ──────────────────────────────────
    textPrimary: "text-[#e6e3de]",
    textSecondary: "text-[#9c9890]",
    textMuted: "text-[#6e6a62]",
    textDisabled: "text-[#47443e]",
    textAccent: "text-[#d2b660]",

    // ── Borders ───────────────────────────────
    border: "border-[#26262f]",
    borderAccent: "border-[#c8a84b]/18",
    divider: "border-[#22222a]/70",

    // ── Shadows ───────────────────────────────
    shadow: "shadow-[0_2px_10px_-3px_rgba(0,0,0,0.35)]",

    // ── Accent fills ──────────────────────────
    accentIcon: "bg-[#c8a84b]/[0.07] border-[#c8a84b]/14 text-[#d2b660]",
    accentGlow: "bg-[#c8a84b]/[0.06]",
    headerGrad: "from-[#c8a84b]/[0.04] via-transparent to-transparent",
    avatarBg:
      "from-[#c8a84b]/18 via-[#a07830]/12 to-[#c8a84b]/8 text-[#d2b660] ring-[#c8a84b]/18",

    // ── Status — muted, not neon ──────────────
    successBg: "bg-emerald-500/[0.07]",
    successText: "text-emerald-400",
    successBadge:
      "bg-emerald-500/[0.08] text-emerald-400 ring-1 ring-emerald-500/18",
    successDot: "bg-emerald-400",
    pendingBg: "bg-amber-500/[0.07]",
    pendingText: "text-amber-400",
    pendingBadge: "bg-amber-500/[0.08] text-amber-400 ring-1 ring-amber-500/18",
    pendingDot: "bg-amber-400",
    defaultBg: "bg-white/[0.025]",
    defaultText: "text-[#6e6a62]",
    defaultBadge: "bg-white/[0.05] text-[#9c9890] ring-1 ring-white/8",
    defaultDot: "bg-[#4a4740]",
    dotRing: "ring-[#1c1c23]",

    // ── Change badges ─────────────────────────
    posBadge:
      "bg-emerald-500/[0.08] text-emerald-400 ring-1 ring-emerald-500/18",
    negBadge: "bg-red-500/[0.08] text-red-400 ring-1 ring-red-500/18",

    // ── Error banner ─────────────────────────
    errorBg: "bg-red-500/[0.06] border-red-500/15 text-red-400",

    // ── System status ─────────────────────────
    onlineBg:
      "bg-emerald-500/[0.07] text-emerald-400 ring-1 ring-emerald-500/14",
    onlineDot: "bg-emerald-500",
    onlinePing: "bg-emerald-400",

    // ── Role colours ──────────────────────────
    roleUser: "bg-[#3a3a44]/60 text-[#9c9890] ring-1 ring-[#3a3a44]",
    roleAgent: "bg-blue-500/[0.08] text-blue-400 ring-1 ring-blue-500/18",
    roleAdmin: "bg-amber-500/[0.08] text-amber-400 ring-1 ring-amber-500/18",
    roleSuperAdmin:
      "bg-[#c8a84b]/[0.07] text-[#d2b660] ring-1 ring-[#c8a84b]/20",

    // ── Quick action colours ───────────────────
    qaBlue: "bg-blue-500/[0.08] text-blue-400",
    qaGreen: "bg-emerald-500/[0.08] text-emerald-400",
    qaAmber: "bg-amber-500/[0.08] text-amber-400",
    qaPurple: "bg-purple-500/[0.08] text-purple-400",
    qaPink: "bg-pink-500/[0.08] text-pink-400",
    qaRed: "bg-red-500/[0.08] text-red-400",

    // ── Section link ──────────────────────────
    sectionLink:
      "text-[#d2b660]/60 hover:text-[#d2b660] hover:bg-[#c8a84b]/[0.06]",
    sectionIcon: "bg-[#c8a84b]/[0.06] text-[#d2b660]",

    // ── Mini stat icon ────────────────────────
    miniIcon:
      "bg-white/[0.03] text-[#6e6a62] group-hover:bg-[#c8a84b]/[0.08] group-hover:text-[#d2b660]",

    // ── Empty state ───────────────────────────
    emptyBg: "bg-white/[0.025]",
    emptyIcon: "text-[#3a3a3e]",
  },

  light: {
    // ── Surfaces ──────────────────────────────
    page: "bg-[#f4f1eb]",
    card: "bg-white",
    cardHover: "hover:bg-[#fdfcf8]",
    input: "bg-[#f4f1eb]",
    hover: "hover:bg-[#00000004]",
    active: "bg-[#8a7030]/[0.04]",

    // ── Text ──────────────────────────────────
    textPrimary: "text-[#2a2720]",
    textSecondary: "text-[#6a655c]",
    textMuted: "text-[#9a948a]",
    textDisabled: "text-[#c2bcb4]",
    textAccent: "text-[#7a6428]",

    // ── Borders ───────────────────────────────
    border: "border-[#e6e2da]",
    borderAccent: "border-[#8a7030]/14",
    divider: "border-[#ece8e0]/80",

    // ── Shadows ───────────────────────────────
    shadow: "shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06)]",

    // ── Accent fills ──────────────────────────
    accentIcon: "bg-[#c8a84b]/[0.06] border-[#c8a84b]/10 text-[#8a7030]",
    accentGlow: "bg-[#c8a84b]/[0.04]",
    headerGrad: "from-[#c8a84b]/[0.03] via-transparent to-transparent",
    avatarBg:
      "from-[#c8a84b]/12 via-[#a07830]/8 to-[#c8a84b]/6 text-[#7a6428] ring-[#c8a84b]/12",

    // ── Status ────────────────────────────────
    successBg: "bg-emerald-50",
    successText: "text-emerald-700",
    successBadge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    successDot: "bg-emerald-500",
    pendingBg: "bg-amber-50",
    pendingText: "text-amber-700",
    pendingBadge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    pendingDot: "bg-amber-500",
    defaultBg: "bg-[#00000004]",
    defaultText: "text-[#9a948a]",
    defaultBadge: "bg-[#00000005] text-[#6a655c] ring-1 ring-[#00000008]",
    defaultDot: "bg-[#c2bcb4]",
    dotRing: "ring-white",

    // ── Change badges ─────────────────────────
    posBadge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    negBadge: "bg-red-50 text-red-600 ring-1 ring-red-200",

    // ── Error banner ─────────────────────────
    errorBg: "bg-red-50 border-red-200 text-red-600",

    // ── System status ─────────────────────────
    onlineBg: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    onlineDot: "bg-emerald-600",
    onlinePing: "bg-emerald-400",

    // ── Role colours ──────────────────────────
    roleUser: "bg-[#f0ede6] text-[#6a655c] ring-1 ring-[#e2ddd6]",
    roleAgent: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    roleAdmin: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    roleSuperAdmin:
      "bg-[#c8a84b]/[0.07] text-[#7a6428] ring-1 ring-[#c8a84b]/15",

    // ── Quick action colours ───────────────────
    qaBlue: "bg-blue-50 text-blue-600",
    qaGreen: "bg-emerald-50 text-emerald-600",
    qaAmber: "bg-amber-50 text-amber-600",
    qaPurple: "bg-purple-50 text-purple-600",
    qaPink: "bg-pink-50 text-pink-600",
    qaRed: "bg-red-50 text-red-600",

    // ── Section link ──────────────────────────
    sectionLink:
      "text-[#8a7030]/60 hover:text-[#7a6428] hover:bg-[#c8a84b]/[0.05]",
    sectionIcon: "bg-[#c8a84b]/[0.05] text-[#8a7030]",

    // ── Mini stat icon ────────────────────────
    miniIcon:
      "bg-[#00000003] text-[#9a948a] group-hover:bg-[#c8a84b]/[0.06] group-hover:text-[#8a7030]",

    // ── Empty state ───────────────────────────
    emptyBg: "bg-[#00000003]",
    emptyIcon: "text-[#d4cfca]",
  },
} as const;

/* ── useDash — resolves palette ── */
function useDash() {
  const { isDark } = useTheme();
  return { d: isDark ? dash.dark : dash.light, isDark };
}

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

function toPersianDigits(n: number | string): string {
  const p = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => p[parseInt(d)]);
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return toPersianDigits((n / 1_000_000).toFixed(1)) + "M";
  if (n >= 1_000) return toPersianDigits((n / 1_000).toFixed(1)) + "K";
  return toPersianDigits(n.toLocaleString());
}

const ROLE_LABELS: Record<string, string> = {
  user: "کاربر",
  agent: "نماینده",
  admin: "مدیر",
  superAdmin: "مدیر ارشد",
};

function getRolePersian(role?: string): string {
  return ROLE_LABELS[role ?? ""] ?? "کاربر";
}

/* resolves role → badge classes from the palette */
function getRoleBadge(
  role: string | undefined,
  d: typeof dash.dark | typeof dash.light,
): string {
  const map: Record<string, string> = {
    user: d.roleUser,
    agent: d.roleAgent,
    admin: d.roleAdmin,
    superAdmin: d.roleSuperAdmin,
  };
  return map[role ?? "user"] ?? d.roleUser;
}

interface AuthUser {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder("utf-8").decode(bytes));
  } catch {
    return null;
  }
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const c of document.cookie.split(";")) {
    const [k, ...v] = c.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const keys = ["auth_token", "token", "accessToken", "jwt"];
  let token: string | null = null;
  for (const key of keys) {
    const val =
      localStorage.getItem(key) ??
      getCookieValue(key) ??
      (() => {
        try {
          return sessionStorage.getItem(key);
        } catch {
          return null;
        }
      })();
    if (val && val.split(".").length === 3) {
      token = val;
      break;
    }
  }
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    firstName: (payload.firstName as string) ?? "",
    lastName: (payload.lastName as string) ?? "",
    phoneNumber: (payload.phoneNumber as string) ?? "",
    email: (payload.email as string) ?? "",
    role: (payload.role as string) ?? "user",
  };
}

function getDisplayName(user: AuthUser | null): string {
  if (!user) return "مدیر";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.phoneNumber || user.email || "مدیر";
}

const EMPTY_STATS: DashboardStats = {
  users: { total: 0, active: 0, newLast30Days: 0, changePercent: 0 },
  agents: { total: 0, active: 0 },
  blocks: { total: 0, active: 0 },
  pages: { total: 0, published: 0, totalViews: 0, totalVisitors: 0 },
  templates: { total: 0, active: 0 },
  tickets: { total: 0, open: 0 },
  qrcodes: { total: 0, active: 0 },
  products: { total: 0 },
  files: { total: 0 },
  notifications: { total: 0 },
};

function displayUserName(user?: DashboardRecentUser) {
  if (!user) return "-";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.phoneNumber || user.email || "-";
}

function displayRequester(ticket?: DashboardRecentTicket) {
  const r = ticket?.requester;
  if (!r) return "-";
  const name = [r.firstName, r.lastName].filter(Boolean).join(" ").trim();
  return name || r.phoneNumber || r.email || "-";
}

function formatRelativeTime(value?: string) {
  if (!value) return "-";
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "-";
  const diff = Date.now() - time;
  const minute = 60 * 1000,
    hour = 60 * minute,
    day = 24 * hour;
  if (diff < minute) return "همین حالا";
  if (diff < hour)
    return `${toPersianDigits(Math.floor(diff / minute))} دقیقه پیش`;
  if (diff < day) return `${toPersianDigits(Math.floor(diff / hour))} ساعت پیش`;
  if (diff < 7 * day)
    return `${toPersianDigits(Math.floor(diff / day))} روز پیش`;
  return new Date(value).toLocaleDateString("fa-IR");
}

function ticketStatusInfo(status?: DashboardRecentTicket["status"]): {
  type: "success" | "pending" | "default";
  label: string;
} {
  if (status === "closed") return { type: "success", label: "بسته شده" };
  if (status === "open") return { type: "pending", label: "باز" };
  if (status === "in_progress")
    return { type: "pending", label: "در حال بررسی" };
  return { type: "default", label: "نامشخص" };
}

function userStatusLabel(status?: string) {
  if (status === "active") return "فعال";
  if (status === "inactive") return "غیرفعال";
  return "نامشخص";
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "صبح بخیر";
  if (h < 17) return "ظهر بخیر";
  if (h < 21) return "عصر بخیر";
  return "شب بخیر";
}

function getCurrentDate(): string {
  return new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) {
      setCount(0);
      return;
    }
    let cur = 0;
    const inc = target / (duration / 16);
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) {
        setCount(target);
        clearInterval(t);
      } else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return count;
}

/* ══════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════ */

/* ── Stat Card ── */
function StatCard({
  icon,
  label,
  value,
  change,
  changeLabel,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  change?: number;
  changeLabel?: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  const { d } = useDash();
  const pos = (change ?? 0) >= 0;
  const anim = useCountUp(loading ? 0 : value);

  if (loading)
    return (
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-5 min-h-[130px] sm:min-h-[152px]",
          d.card,
          d.border,
        )}
      >
        <div className="flex items-start justify-between mb-3 sm:mb-5">
          <div
            className={cn(
              "h-10 w-10 sm:h-12 sm:w-12 rounded-xl animate-pulse",
              d.input,
            )}
          />
          <div
            className={cn(
              "h-5 w-14 sm:h-6 sm:w-16 rounded-full animate-pulse",
              d.input,
            )}
          />
        </div>
        <div
          className={cn(
            "h-7 w-20 sm:h-8 sm:w-28 rounded-lg animate-pulse mb-1.5 sm:mb-2",
            d.input,
          )}
        />
        <div
          className={cn(
            "h-3 w-16 sm:h-4 sm:w-20 rounded animate-pulse",
            d.input,
          )}
        />
      </div>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border p-4 sm:p-5 text-right transition-all duration-300",
        d.card,
        d.border,
        d.shadow,
        onClick &&
          cn(
            d.cardHover,
            "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.99]",
          ),
        !onClick && "cursor-default",
      )}
    >
      {/* Subtle corner glow on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full blur-3xl opacity-0 transition-opacity duration-500",
          onClick && "group-hover:opacity-100",
          d.accentGlow,
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border transition-transform duration-300",
              onClick && "group-hover:scale-110",
              d.accentIcon,
            )}
          >
            <span className="text-base sm:text-lg">{icon}</span>
          </div>

          {/* Change badge */}
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold tracking-tight",
                pos ? d.posBadge : d.negBadge,
              )}
            >
              {pos ? (
                <FaArrowTrendUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              ) : (
                <FaArrowTrendDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              )}
              {toPersianDigits(Math.abs(change))}٪
            </div>
          )}
        </div>

        {/* Value */}
        <p
          className={cn(
            "text-2xl sm:text-3xl font-black tabular-nums mb-1 sm:mb-1.5 tracking-tight",
            d.textPrimary,
          )}
        >
          {formatNumber(anim)}
        </p>

        {/* Label */}
        <p
          className={cn(
            "text-[11px] sm:text-[13px] font-semibold",
            d.textMuted,
          )}
        >
          {label}
        </p>

        {/* Sub-label */}
        {changeLabel && (
          <p
            className={cn(
              "text-[10px] sm:text-[11px] mt-1 sm:mt-1.5 leading-relaxed hidden sm:block",
              d.textDisabled,
            )}
          >
            {changeLabel}
          </p>
        )}
      </div>

      {/* Nav arrow */}
      {onClick && (
        <FaChevronLeft
          className={cn(
            "absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5",
            "opacity-0 transition-all duration-300 group-hover:opacity-30 group-hover:-translate-x-1",
            d.textMuted,
          )}
        />
      )}
    </button>
  );
}

/* ── Mini Stat ── */
function MiniStat({
  icon,
  label,
  value,
  onClick,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onClick: () => void;
  loading?: boolean;
}) {
  const { d } = useDash();
  const anim = useCountUp(loading ? 0 : value);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 sm:gap-3 rounded-xl border p-2.5 sm:p-3.5 transition-all duration-200 text-right w-full",
        d.card,
        d.border,
        d.shadow,
        d.cardHover,
        "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110",
          d.miniIcon,
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <div
            className={cn(
              "h-4 sm:h-5 w-8 sm:w-10 rounded animate-pulse mb-0.5",
              d.input,
            )}
          />
        ) : (
          <p
            className={cn(
              "text-base sm:text-lg font-extrabold tabular-nums leading-none mb-0.5",
              d.textPrimary,
            )}
          >
            {toPersianDigits(anim.toLocaleString())}
          </p>
        )}
        <p
          className={cn(
            "text-[10px] sm:text-[11px] font-medium truncate",
            d.textDisabled,
          )}
        >
          {label}
        </p>
      </div>
      <FaChevronLeft
        className={cn(
          "h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 opacity-0 transition-all duration-200",
          "group-hover:opacity-25 group-hover:-translate-x-0.5",
          d.textMuted,
        )}
      />
    </button>
  );
}

/* ── Quick Action ── */
function QuickAction({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) {
  const { d } = useDash();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-1.5 sm:gap-2.5 rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 text-center transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.97]",
        d.card,
        d.cardHover,
        d.border,
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200 group-hover:scale-110",
          color,
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-[10px] sm:text-[11px] font-semibold leading-tight",
          d.textSecondary,
        )}
      >
        {label}
      </span>
    </button>
  );
}

/* ── Recent Item ── */
function RecentItem({
  icon,
  title,
  subtitle,
  time,
  status,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
  status?: "success" | "pending" | "default";
  badge?: string;
}) {
  const { d } = useDash();

  /* Status → palette slot */
  const s = {
    success: {
      bg: d.successBg,
      text: d.successText,
      badge: d.successBadge,
      dot: d.successDot,
    },
    pending: {
      bg: d.pendingBg,
      text: d.pendingText,
      badge: d.pendingBadge,
      dot: d.pendingDot,
    },
    default: {
      bg: d.defaultBg,
      text: d.defaultText,
      badge: d.defaultBadge,
      dot: d.defaultDot,
    },
  }[status ?? "default"];

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2.5 sm:py-3 transition-colors duration-150",
        d.hover,
      )}
    >
      {/* Icon box */}
      <div
        className={cn(
          "relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl",
          s.bg,
          s.text,
        )}
      >
        {icon}
        <FaCircle
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ring-2",
            s.dot,
            d.dotRing,
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p
            className={cn(
              "text-[13px] sm:text-sm font-semibold truncate leading-snug",
              d.textPrimary,
            )}
          >
            {title}
          </p>
          {badge && (
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 sm:px-2 py-px sm:py-0.5 text-[9px] sm:text-[10px] font-bold",
                s.badge,
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-[10px] sm:text-[11px] truncate mt-0.5",
            d.textDisabled,
          )}
        >
          {subtitle}
        </p>
      </div>

      {/* Time */}
      <span
        className={cn(
          "text-[9px] sm:text-[10px] shrink-0 tabular-nums font-medium whitespace-nowrap",
          d.textDisabled,
        )}
      >
        {time}
      </span>
    </div>
  );
}

/* ── Section Card ── */
function SectionCard({
  title,
  icon,
  linkText,
  onLink,
  children,
  loading,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  icon?: React.ReactNode;
  linkText?: string;
  onLink?: () => void;
  children: React.ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
}) {
  const { d } = useDash();
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-shadow duration-300 hover:shadow-md",
        d.card,
        d.border,
        d.shadow,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b",
          d.divider,
        )}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <div
              className={cn(
                "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-md sm:rounded-lg",
                d.sectionIcon,
              )}
            >
              {icon}
            </div>
          )}
          <h3 className={cn("text-[13px] sm:text-sm font-bold", d.textPrimary)}>
            {title}
          </h3>
        </div>
        {linkText && onLink && (
          <button
            type="button"
            onClick={onLink}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold transition-all duration-200",
              d.sectionLink,
            )}
          >
            <span>{linkText}</span>
            <FaArrowRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 rotate-180" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4">
        {loading ? (
          <SkeletonList />
        ) : isEmpty ? (
          <EmptyState message={emptyMessage ?? "داده‌ای یافت نشد"} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState({ message }: { message: string }) {
  const { d } = useDash();
  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-8 gap-2.5 sm:gap-3">
      <div
        className={cn(
          "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl",
          d.emptyBg,
        )}
      >
        <FaBoxOpen className={cn("h-5 w-5 sm:h-6 sm:w-6", d.emptyIcon)} />
      </div>
      <p className={cn("text-xs sm:text-sm font-medium", d.textDisabled)}>
        {message}
      </p>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonList() {
  const { d } = useDash();
  return (
    <div className="space-y-1">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2.5 sm:py-3"
        >
          <div
            className={cn(
              "h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl animate-pulse",
              d.input,
            )}
          />
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <div
              className={cn(
                "h-3.5 sm:h-4 w-28 sm:w-36 rounded animate-pulse",
                d.input,
              )}
            />
            <div
              className={cn(
                "h-2.5 sm:h-3 w-20 sm:w-24 rounded animate-pulse",
                d.input,
              )}
            />
          </div>
          <div
            className={cn(
              "h-2.5 sm:h-3 w-12 sm:w-14 rounded animate-pulse",
              d.input,
            )}
          />
        </div>
      ))}
    </div>
  );
}

/* ── User Avatar ── */
function UserAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const { d } = useDash();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 sm:h-14 sm:w-14 text-sm sm:text-base",
  };
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl sm:rounded-2xl font-black shrink-0 bg-gradient-to-br ring-1",
        sizes[size],
        d.avatarBg,
      )}
    >
      {initials || "م"}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function DashboardSection({
  navigate,
}: {
  navigate: (s: AdminSection) => void;
}) {
  const { d, isDark } = useDash();
  const { data, error, isLoading } = useDashboardStats();

  const stats = data?.stats ?? EMPTY_STATS;
  const recentUsers = data?.recentUsers ?? [];
  const recentTickets = data?.recentTickets ?? [];
  const loading = isLoading && !data;

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  const displayName = useMemo(() => getDisplayName(authUser), [authUser]);
  const greeting = useMemo(() => getGreeting(), []);
  const currentDate = useMemo(() => getCurrentDate(), []);

  /* Quick actions — colours come from palette */
  const quickActions = useMemo(
    () => [
      {
        icon: <FaUserPlus className="h-4 w-4" />,
        label: "کاربر جدید",
        section: "users" as AdminSection,
        color: d.qaBlue,
      },
      {
        icon: <FaFile className="h-4 w-4" />,
        label: "صفحه جدید",
        section: "pages" as AdminSection,
        color: d.qaGreen,
      },
      {
        icon: <FaTicket className="h-4 w-4" />,
        label: "تیکت‌ها",
        section: "tickets" as AdminSection,
        color: d.qaAmber,
      },
      {
        icon: <FaImage className="h-4 w-4" />,
        label: "فایل‌ها",
        section: "files" as AdminSection,
        color: d.qaPurple,
      },
      {
        icon: <FaQrcode className="h-4 w-4" />,
        label: "QR کد",
        section: "qrcodes" as AdminSection,
        color: d.qaPink,
      },
      {
        icon: <FaBell className="h-4 w-4" />,
        label: "اعلان‌ها",
        section: "notifications" as AdminSection,
        color: d.qaRed,
      },
    ],
    [d],
  );

  const miniStats = useMemo(
    () => [
      {
        icon: <FaUserTie className="h-4 w-4" />,
        label: "نمایندگان",
        value: stats.agents.total,
        section: "agents" as AdminSection,
      },
      {
        icon: <FaBoxOpen className="h-4 w-4" />,
        label: "بلاک‌ها",
        value: stats.blocks.active,
        section: "blocks" as AdminSection,
      },
      {
        icon: <FaPalette className="h-4 w-4" />,
        label: "قالب‌ها",
        value: stats.templates.active,
        section: "templates" as AdminSection,
      },
      {
        icon: <FaBoxOpen className="h-4 w-4" />,
        label: "محصولات",
        value: stats.products.total,
        section: "products" as AdminSection,
      },
      {
        icon: <FaQrcode className="h-4 w-4" />,
        label: "QR کدها",
        value: stats.qrcodes.active,
        section: "qrcodes" as AdminSection,
      },
      {
        icon: <FaImage className="h-4 w-4" />,
        label: "فایل‌ها",
        value: stats.files.total,
        section: "files" as AdminSection,
      },
    ],
    [stats],
  );

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8" dir="rtl">
      {/* ═══ Hero Header ═══ */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl sm:rounded-2xl border p-4 sm:p-6 lg:p-8",
          d.card,
          d.border,
          d.shadow,
        )}
      >
        {/* Subtle gradient wash */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-bl",
            d.headerGrad,
          )}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              {/* Date */}
              <p
                className={cn(
                  "text-[11px] sm:text-xs font-medium mb-0.5",
                  d.textDisabled,
                )}
              >
                {currentDate}
              </p>

              {/* Greeting */}
              <h1
                className={cn(
                  "text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight",
                  d.textPrimary,
                )}
              >
                {greeting}
                {displayName !== "مدیر" ? `، ${displayName}` : ""}{" "}
                <span className="inline-block animate-[wave_2.5s_ease-in-out_infinite] text-base sm:text-2xl">
                  👋
                </span>
              </h1>

              {/* Role + phone */}
              <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
                {authUser?.role && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-bold",
                      getRoleBadge(authUser.role, d),
                    )}
                  >
                    <FaShieldHalved className="h-2.5 w-2.5" />
                    {getRolePersian(authUser.role)}
                  </span>
                )}
                {authUser?.phoneNumber && (
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] font-medium tabular-nums",
                      d.textDisabled,
                    )}
                  >
                    {toPersianDigits(authUser.phoneNumber)}
                  </span>
                )}
                <p
                  className={cn(
                    "text-[11px] sm:text-xs hidden lg:block",
                    d.textDisabled,
                  )}
                >
                  • خلاصه وضعیت سیستم
                </p>
              </div>
            </div>
          </div>

          {/* System online pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold",
                d.onlineBg,
              )}
            >
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70",
                    d.onlinePing,
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                    d.onlineDot,
                  )}
                />
              </span>
              سیستم فعال
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className={cn(
              "mt-3 sm:mt-4 flex items-center gap-2 rounded-lg sm:rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3",
              d.errorBg,
            )}
          >
            <FaClock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <p className="text-[11px] sm:text-xs font-medium">
              {error instanceof Error
                ? error.message
                : "خطا در دریافت آمار داشبورد"}
            </p>
          </div>
        )}
      </div>

      {/* ═══ Main Stats ═══ */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={<FaUsers className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="کل کاربران"
          value={stats.users.total}
          change={stats.users.changePercent}
          changeLabel={`${toPersianDigits(stats.users.newLast30Days)} کاربر جدید در ۳۰ روز اخیر`}
          loading={loading}
          onClick={() => navigate("users")}
        />
        <StatCard
          icon={<FaFile className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="صفحات منتشر شده"
          value={stats.pages.published}
          change={
            stats.pages.total
              ? Math.round((stats.pages.published / stats.pages.total) * 100)
              : 0
          }
          changeLabel={`از مجموع ${toPersianDigits(stats.pages.total)} صفحه`}
          loading={loading}
          onClick={() => navigate("pages")}
        />
        <StatCard
          icon={<FaEye className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="کل بازدید صفحات"
          value={stats.pages.totalViews}
          changeLabel={`${toPersianDigits(stats.pages.totalVisitors.toLocaleString())} بازدیدکننده یکتا`}
          loading={loading}
        />
        <StatCard
          icon={<FaTicket className="h-4 w-4 sm:h-5 sm:w-5" />}
          label="تیکت‌های باز"
          value={stats.tickets.open}
          change={
            stats.tickets.total
              ? -Math.round((stats.tickets.open / stats.tickets.total) * 100)
              : 0
          }
          changeLabel={`از مجموع ${toPersianDigits(stats.tickets.total)} تیکت`}
          loading={loading}
          onClick={() => navigate("tickets")}
        />
      </div>

      {/* ═══ Mini Stats ═══ */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {miniStats.map((item) => (
          <MiniStat
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            onClick={() => navigate(item.section)}
            loading={loading}
          />
        ))}
      </div>

      {/* ═══ Bottom Grid ═══ */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <SectionCard
          title="دسترسی سریع"
          icon={
            <FaArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 rotate-180" />
          }
        >
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
            {quickActions.map((action) => (
              <QuickAction
                key={action.label}
                icon={action.icon}
                label={action.label}
                onClick={() => navigate(action.section)}
                color={action.color}
              />
            ))}
          </div>
        </SectionCard>

        {/* Recent Users */}
        <SectionCard
          title="کاربران جدید"
          icon={<FaUsers className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
          linkText="مشاهده همه"
          onLink={() => navigate("users")}
          loading={loading}
          isEmpty={recentUsers.length === 0}
          emptyMessage="کاربر جدیدی یافت نشد"
        >
          <div className="space-y-0.5">
            {recentUsers.map((user) => (
              <RecentItem
                key={String(user._id ?? user.id ?? user.phoneNumber)}
                icon={<FaUsers className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                title={displayUserName(user)}
                subtitle={user.email || user.phoneNumber || "-"}
                time={formatRelativeTime(user.createdAt)}
                status={user.status === "active" ? "success" : "pending"}
                badge={userStatusLabel(user.status)}
              />
            ))}
          </div>
        </SectionCard>

        {/* Recent Tickets */}
        <SectionCard
          title="آخرین تیکت‌ها"
          icon={<FaTicket className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
          linkText="مشاهده همه"
          onLink={() => navigate("tickets")}
          loading={loading}
          isEmpty={recentTickets.length === 0}
          emptyMessage="تیکتی یافت نشد"
        >
          <div className="space-y-0.5">
            {recentTickets.map((ticket) => {
              const si = ticketStatusInfo(ticket.status);
              return (
                <RecentItem
                  key={String(ticket._id ?? ticket.id ?? ticket.title)}
                  icon={
                    ticket.status === "closed" ? (
                      <FaCircleCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ) : (
                      <FaClock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    )
                  }
                  title={ticket.title || "-"}
                  subtitle={displayRequester(ticket)}
                  time={formatRelativeTime(
                    ticket.updatedAt ?? ticket.createdAt,
                  )}
                  status={si.type}
                  badge={si.label}
                />
              );
            })}
          </div>
        </SectionCard>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10%       { transform: rotate(14deg); }
          20%       { transform: rotate(-8deg); }
          30%       { transform: rotate(14deg); }
          40%       { transform: rotate(-4deg); }
          50%       { transform: rotate(10deg); }
          60%, 100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
