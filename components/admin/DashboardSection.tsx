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
import { normalizeLiaraUrl } from "@/lib/fileUtils";
import { useAccess } from "@/hook/auth/useAccess";

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
import { getUserRoleLabel, superAdminBadgeClass } from "@/lib/userRole";

/* ══════════════════════════════════════════════
   SOFT PALETTE — mirrors DashboardShell
   ══════════════════════════════════════════════ */
const DASHBOARD_QUOTES = [
  "هر صفحه بهتر، یک قدم نزدیک‌تر به اعتماد مشتری است.",
  "حضور حرفه‌ای در فضای دیجیتال، از تجربه خوب کاربر شروع می‌شود.",
  "هر کلیک می‌تواند آغاز یک ارتباط ارزشمند با مشتری باشد.",
  "برند قوی، با تجربه‌ای ساخته می‌شود که در ذهن کاربر می‌ماند.",
  "رشد دیجیتال از تصمیم‌های کوچک اما هوشمندانه شروع می‌شود.",
  "هر بازدید یک فرصت تازه برای معرفی بهتر کسب‌وکار شماست.",
  "سادگی در تجربه کاربر، قدرت در رشد کسب‌وکار است.",
  "امروز بهتر بسازید تا فردا بیشتر دیده شوید.",
  "ارتباط سریع‌تر با مشتری، مسیر رشد را کوتاه‌تر می‌کند.",
  "یک حضور دیجیتال حرفه‌ای، ویترین همیشه‌باز کسب‌وکار شماست.",
] as const;
const dash = {
  dark: {
    page: "bg-[#090e16]",
    card: "bg-[#111923]",
    cardHover: "hover:bg-[#151f2b]",
    input: "bg-[#182330]",
    hover: "hover:bg-white/[0.035]",
    active: "bg-[#f4bd45]/[0.09]",

    textPrimary: "text-[#f3f5f7]",
    textSecondary: "text-[#b2bac7]",
    textMuted: "text-[#7f8a9b]",
    textDisabled: "text-[#5d6878]",
    textAccent: "text-[#f5c451]",

    border: "border-[#202c3a]",
    borderAccent: "border-[#f2bd45]/25",
    divider: "border-[#1b2734]/90",

    shadow: "shadow-[0_14px_34px_-24px_rgba(0,0,0,0.85)]",

    accentIcon: "bg-[#f3bd45]/[0.10] border-[#f3bd45]/20 text-[#f5c451]",
    accentGlow: "bg-[#f3bd45]/[0.10]",
    headerGrad: "from-[#f3bd45]/[0.06] via-transparent to-transparent",
    avatarBg:
      "from-[#f3bd45]/24 via-[#b98932]/16 to-[#26344a] text-[#f5c451] ring-[#f3bd45]/22",

    hero: "bg-[linear-gradient(110deg,#171b20_0%,#111823_42%,#0f1722_100%)] border-[#2a3542] shadow-[0_18px_48px_-30px_rgba(0,0,0,0.9)]",
    heroGlow:
      "bg-[radial-gradient(circle,rgba(246,198,82,0.30)_0%,rgba(246,198,82,0.10)_35%,transparent_68%)]",
    heroSun:
      "bg-[linear-gradient(180deg,#ffd978_0%,#efb840_100%)] shadow-[0_0_54px_rgba(245,190,66,0.30)]",
    heroMountainBack: "bg-[#111824]",
    heroMountainFront: "bg-[#0c131d]",
    heroLine:
      "bg-gradient-to-r from-transparent via-[#e5aa34]/70 to-transparent",
    heroQuote: "text-[#d7dce4]",

    statPurple:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(137,76,220,0.22),transparent_34%),linear-gradient(135deg,#19162b_0%,#151926_55%,#111821_100%)] border-[#4d3d70]/55",
    statPurpleIcon:
      "bg-purple-500/[0.16] border-purple-400/25 text-purple-300 shadow-[0_0_28px_rgba(168,85,247,0.10)]",
    statGreen:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.19),transparent_35%),linear-gradient(135deg,#102822_0%,#111f24_58%,#111821_100%)] border-emerald-500/25",
    statGreenIcon:
      "bg-emerald-500/[0.15] border-emerald-400/25 text-emerald-300 shadow-[0_0_28px_rgba(16,185,129,0.10)]",
    statAmber:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(245,183,65,0.20),transparent_35%),linear-gradient(135deg,#292316_0%,#1e1d1b_58%,#111821_100%)] border-amber-400/25",
    statAmberIcon:
      "bg-amber-400/[0.14] border-amber-300/25 text-amber-300 shadow-[0_0_28px_rgba(245,183,65,0.10)]",
    statRose:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(244,63,94,0.18),transparent_35%),linear-gradient(135deg,#2a1820_0%,#211922_58%,#111821_100%)] border-rose-400/20",
    statRoseIcon:
      "bg-rose-500/[0.14] border-rose-400/25 text-rose-300 shadow-[0_0_28px_rgba(244,63,94,0.10)]",

    successBg: "bg-emerald-500/[0.08]",
    successText: "text-emerald-400",
    successBadge:
      "bg-emerald-500/[0.10] text-emerald-400 ring-1 ring-emerald-500/20",
    successDot: "bg-emerald-400",
    pendingBg: "bg-amber-500/[0.08]",
    pendingText: "text-amber-400",
    pendingBadge: "bg-amber-500/[0.10] text-amber-400 ring-1 ring-amber-500/20",
    pendingDot: "bg-amber-400",
    defaultBg: "bg-white/[0.03]",
    defaultText: "text-[#8c96a5]",
    defaultBadge: "bg-white/[0.05] text-[#a0a9b6] ring-1 ring-white/10",
    defaultDot: "bg-[#536070]",
    dotRing: "ring-[#111923]",

    posBadge:
      "bg-emerald-500/[0.11] text-emerald-300 ring-1 ring-emerald-500/20",
    negBadge: "bg-rose-500/[0.11] text-rose-300 ring-1 ring-rose-500/20",

    errorBg: "bg-rose-500/[0.08] border-rose-500/20 text-rose-300",

    onlineBg:
      "bg-emerald-500/[0.10] text-emerald-300 ring-1 ring-emerald-500/18",
    onlineDot: "bg-emerald-400",
    onlinePing: "bg-emerald-400",

    roleUser: "bg-slate-400/[0.09] text-slate-300 ring-1 ring-slate-400/15",
    roleAgent: "bg-blue-500/[0.10] text-blue-300 ring-1 ring-blue-500/20",
    roleAdmin: "bg-amber-500/[0.10] text-amber-300 ring-1 ring-amber-500/20",
    roleSuperAdmin:
      "bg-[#f3bd45]/[0.10] text-[#f5c451] ring-1 ring-[#f3bd45]/22",

    qaBlue: "bg-blue-500/[0.14] text-blue-300 ring-1 ring-blue-400/15",
    qaGreen:
      "bg-emerald-500/[0.14] text-emerald-300 ring-1 ring-emerald-400/15",
    qaAmber: "bg-amber-500/[0.14] text-amber-300 ring-1 ring-amber-400/15",
    qaPurple: "bg-violet-500/[0.14] text-violet-300 ring-1 ring-violet-400/15",
    qaPink: "bg-fuchsia-500/[0.14] text-fuchsia-300 ring-1 ring-fuchsia-400/15",
    qaRed: "bg-rose-500/[0.14] text-rose-300 ring-1 ring-rose-400/15",

    sectionLink:
      "text-[#f5c451]/78 hover:text-[#ffd56d] hover:bg-[#f3bd45]/[0.07]",
    sectionIcon: "bg-[#f3bd45]/[0.09] text-[#f5c451] ring-1 ring-[#f3bd45]/12",

    miniIcon:
      "bg-[#182330] text-[#8f9bad] group-hover:bg-[#f3bd45]/[0.10] group-hover:text-[#f5c451] ring-1 ring-white/[0.035]",

    emptyBg: "bg-white/[0.025]",
    emptyIcon: "text-[#506071]",
  },

  light: {
    page: "bg-[#f4f1ea]",
    card: "bg-[#fffdfa]",
    cardHover: "hover:bg-[#fffaf0]",
    input: "bg-[#f3eee4]",
    hover: "hover:bg-[#7a5b1d]/[0.045]",
    active: "bg-[#d39a21]/[0.10]",

    textPrimary: "text-[#1d2430]",
    textSecondary: "text-[#525d6c]",
    textMuted: "text-[#7d8694]",
    textDisabled: "text-[#a6abb3]",
    textAccent: "text-[#9a6508]",

    border: "border-[#e4ddcf]",
    borderAccent: "border-[#c68b1a]/30",
    divider: "border-[#ebe3d6]/95",

    shadow: "shadow-[0_14px_34px_-26px_rgba(63,52,35,0.30)]",

    accentIcon: "bg-[#f8ecd0] border-[#ebcf91] text-[#96620a]",
    accentGlow: "bg-[#d59a22]/[0.09]",
    headerGrad: "from-[#d59a22]/[0.07] via-transparent to-transparent",
    avatarBg:
      "from-[#f2d99f] via-[#fff4d7] to-[#ebe4d8] text-[#8f5f0b] ring-[#ddb65d]/35",

    hero: "bg-[linear-gradient(110deg,#fff8e8_0%,#fffdfa_45%,#f7f4ee_100%)] border-[#e1d7c5] shadow-[0_18px_46px_-34px_rgba(80,61,25,0.32)]",
    heroGlow:
      "bg-[radial-gradient(circle,rgba(225,166,48,0.22)_0%,rgba(225,166,48,0.08)_35%,transparent_68%)]",
    heroSun:
      "bg-[linear-gradient(180deg,#ffd875_0%,#e9ad35_100%)] shadow-[0_0_48px_rgba(216,156,38,0.22)]",
    heroMountainBack: "bg-[#e9dfcc]",
    heroMountainFront: "bg-[#d8ccba]",
    heroLine:
      "bg-gradient-to-r from-transparent via-[#c98d1b]/55 to-transparent",
    heroQuote: "text-[#4f5560]",

    statPurple:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(139,92,246,0.11),transparent_36%),linear-gradient(135deg,#fbf8ff_0%,#fffdfa_60%,#fffdfa_100%)] border-violet-300/45",
    statPurpleIcon: "bg-violet-100 border-violet-200 text-violet-700",
    statGreen:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(16,185,129,0.10),transparent_36%),linear-gradient(135deg,#f3fff9_0%,#fffdfa_60%,#fffdfa_100%)] border-emerald-300/45",
    statGreenIcon: "bg-emerald-100 border-emerald-200 text-emerald-700",
    statAmber:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(217,154,33,0.12),transparent_36%),linear-gradient(135deg,#fff9ec_0%,#fffdfa_60%,#fffdfa_100%)] border-amber-300/50",
    statAmberIcon: "bg-amber-100 border-amber-200 text-amber-700",
    statRose:
      "bg-[radial-gradient(circle_at_88%_12%,rgba(244,63,94,0.09),transparent_36%),linear-gradient(135deg,#fff7f8_0%,#fffdfa_60%,#fffdfa_100%)] border-rose-200/65",
    statRoseIcon: "bg-rose-100 border-rose-200 text-rose-700",

    successBg: "bg-emerald-500/[0.08]",
    successText: "text-emerald-700",
    successBadge:
      "bg-emerald-500/[0.08] text-emerald-700 ring-1 ring-emerald-500/20",
    successDot: "bg-emerald-600",
    pendingBg: "bg-amber-500/[0.08]",
    pendingText: "text-amber-700",
    pendingBadge: "bg-amber-500/[0.08] text-amber-700 ring-1 ring-amber-500/20",
    pendingDot: "bg-amber-500",
    defaultBg: "bg-[#f1ede5]",
    defaultText: "text-[#737c89]",
    defaultBadge: "bg-[#f1ede5] text-[#5d6673] ring-1 ring-[#ddd4c5]",
    defaultDot: "bg-[#a6aeb8]",
    dotRing: "ring-[#fffdfa]",

    posBadge:
      "bg-emerald-500/[0.09] text-emerald-700 ring-1 ring-emerald-500/20",
    negBadge: "bg-rose-500/[0.09] text-rose-600 ring-1 ring-rose-500/20",

    errorBg: "bg-rose-500/[0.07] border-rose-500/20 text-rose-600",

    onlineBg:
      "bg-emerald-500/[0.08] text-emerald-700 ring-1 ring-emerald-500/18",
    onlineDot: "bg-emerald-600",
    onlinePing: "bg-emerald-400",

    roleUser: "bg-[#f1ede5] text-[#596271] ring-1 ring-[#ded6c9]",
    roleAgent: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    roleAdmin: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    roleSuperAdmin: "bg-[#1f2937] text-white ring-1 ring-black/15",

    qaBlue: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    qaGreen: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    qaAmber: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    qaPurple: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
    qaPink: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-100",
    qaRed: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",

    sectionLink:
      "text-[#9a6508] hover:text-[#754a03] hover:bg-[#d59a22]/[0.08]",
    sectionIcon: "bg-[#f8ecd0] text-[#96620a] ring-1 ring-[#ead29a]",

    miniIcon:
      "bg-[#f1ede5] text-[#7c8490] group-hover:bg-[#f7e9c7] group-hover:text-[#93610b] ring-1 ring-[#e6dfd3]",

    emptyBg: "bg-[#f3eee5]",
    emptyIcon: "text-[#a3a8b0]",
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

function getRolePersian(role?: string): string {
  return getUserRoleLabel(role);
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
    superAdmin: superAdminBadgeClass,
  };
  return map[role ?? "user"] ?? d.roleUser;
}

interface AuthUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

const PROFILE_OVERRIDE_KEY = "admin-profile-user-override";

function readProfileOverride(userId?: string): Partial<AuthUser> | null {
  if (!userId || typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return null;
    const record = parsed as Record<string, unknown>;
    if (String(record.id ?? "") !== userId) return null;

    return {
      id: userId,
      firstName: typeof record.firstName === "string" ? record.firstName : "",
      lastName: typeof record.lastName === "string" ? record.lastName : "",
      phoneNumber:
        typeof record.phoneNumber === "string" ? record.phoneNumber : "",
      email: typeof record.email === "string" ? record.email : "",
      avatarUrl: normalizeLiaraUrl(
        typeof record.avatarUrl === "string" ? record.avatarUrl : "",
      ),
      role: typeof record.role === "string" ? record.role : undefined,
    };
  } catch {
    return null;
  }
}

function authUserFromUnknown(value: unknown): Partial<AuthUser> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  return {
    id: String(record.id ?? record._id ?? ""),
    firstName: typeof record.firstName === "string" ? record.firstName : "",
    lastName: typeof record.lastName === "string" ? record.lastName : "",
    phoneNumber:
      typeof record.phoneNumber === "string" ? record.phoneNumber : "",
    email: typeof record.email === "string" ? record.email : "",
    avatarUrl: normalizeLiaraUrl(
      typeof record.avatarUrl === "string" ? record.avatarUrl : "",
    ),
    role: typeof record.role === "string" ? record.role : undefined,
  };
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
  const id = String(payload.userId ?? payload.id ?? payload._id ?? "");
  const tokenUser = {
    id,
    firstName: (payload.firstName as string) ?? "",
    lastName: (payload.lastName as string) ?? "",
    phoneNumber: (payload.phoneNumber as string) ?? "",
    email: (payload.email as string) ?? "",
    avatarUrl: normalizeLiaraUrl((payload.avatarUrl as string) ?? ""),
    role: (payload.role as string) ?? "user",
  };
  return { ...tokenUser, ...(readProfileOverride(id) ?? {}) };
}

function getDisplayName(user: AuthUser | null): string {
  if (!user) return "مدیر";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.phoneNumber || user.email || "مدیر";
}

function isRadFirstName(value?: string) {
  return value?.trim().replace(/\s+/g, " ").toUpperCase() === "R A D";
}

function RadVerifiedBadge() {
  return (
    <span
      className="inline-flex align-[-0.15em]"
      aria-label="نشان تایید رادلینک"
      title="نشان تایید رادلینک"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 sm:h-7 sm:w-7 drop-shadow-[0_3px_8px_rgba(202,138,4,0.24)]"
        aria-hidden="true"
      >
        <path
          fill="#f8c537"
          d="M10.4 2.6a2.25 2.25 0 0 1 3.2 0l1.05 1.08 1.5-.08a2.25 2.25 0 0 1 2.31 2.31l-.08 1.5 1.08 1.05a2.25 2.25 0 0 1 0 3.2l-1.08 1.05.08 1.5a2.25 2.25 0 0 1-2.31 2.31l-1.5-.08-1.05 1.08a2.25 2.25 0 0 1-3.2 0l-1.05-1.08-1.5.08a2.25 2.25 0 0 1-2.31-2.31l.08-1.5-1.08-1.05a2.25 2.25 0 0 1 0-3.2l1.08-1.05-.08-1.5A2.25 2.25 0 0 1 7.85 3.6l1.5.08 1.05-1.08Z"
        />
        <path
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="m8.1 12.1 2.55 2.55 5.25-5.3"
        />
      </svg>
    </span>
  );
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
  tone = "amber",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  change?: number;
  changeLabel?: string;
  loading?: boolean;
  onClick?: () => void;
  tone?: "purple" | "green" | "amber" | "rose";
}) {
  const { d } = useDash();
  const pos = (change ?? 0) >= 0;
  const anim = useCountUp(loading ? 0 : value);

  const toneClass = {
    purple: d.statPurple,
    green: d.statGreen,
    amber: d.statAmber,
    rose: d.statRose,
  }[tone];

  const iconClass = {
    purple: d.statPurpleIcon,
    green: d.statGreenIcon,
    amber: d.statAmberIcon,
    rose: d.statRoseIcon,
  }[tone];

  if (loading)
    return (
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-5 min-h-[148px] xl:min-h-[174px]",
          d.card,
          d.border,
          d.shadow,
        )}
        aria-hidden="true"
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "h-11 w-11 sm:h-12 sm:w-12 rounded-xl motion-safe:animate-pulse",
              d.input,
            )}
          />
          <div
            className={cn(
              "h-6 w-16 rounded-full motion-safe:animate-pulse",
              d.input,
            )}
          />
        </div>
        <div
          className={cn(
            "h-8 w-24 rounded-lg motion-safe:animate-pulse mb-2",
            d.input,
          )}
        />
        <div
          className={cn(
            "h-3.5 w-24 rounded motion-safe:animate-pulse",
            d.input,
          )}
        />
      </div>
    );

  const changeText =
    change !== undefined
      ? `${pos ? "افزایش" : "کاهش"} ${toPersianDigits(Math.abs(change))} درصد`
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={
        onClick
          ? `${label}: ${formatNumber(value)}${changeText ? `، ${changeText}` : ""}. مشاهده جزئیات`
          : `${label}: ${formatNumber(value)}${changeText ? `، ${changeText}` : ""}`
      }
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border p-4 sm:p-5 text-right min-h-[148px] xl:min-h-[174px] transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eeb944]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        toneClass,
        d.shadow,
        onClick &&
          "cursor-pointer motion-safe:hover:-translate-y-1 hover:shadow-[0_22px_44px_-30px_rgba(0,0,0,0.85)] active:translate-y-0 active:scale-[0.99]",
        !onClick && "cursor-default",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/15 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-16 -bottom-20 h-44 w-44 rounded-full bg-white/[0.025] blur-3xl transition-transform duration-500 group-hover:scale-125"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div
            className={cn(
              "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border transition-transform duration-300",
              onClick && "motion-safe:group-hover:scale-110",
              iconClass,
            )}
            aria-hidden="true"
          >
            <span className="text-base sm:text-lg">{icon}</span>
          </div>

          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-extrabold tracking-tight",
                pos ? d.posBadge : d.negBadge,
              )}
            >
              {pos ? (
                <FaArrowTrendUp className="h-3 w-3" aria-hidden="true" />
              ) : (
                <FaArrowTrendDown className="h-3 w-3" aria-hidden="true" />
              )}
              {toPersianDigits(Math.abs(change))}٪
            </div>
          )}
        </div>

        <p
          className={cn(
            "text-2xl sm:text-[30px] font-black tabular-nums mb-1 tracking-tight leading-none",
            d.textPrimary,
          )}
        >
          {formatNumber(anim)}
        </p>

        <p
          className={cn(
            "text-[12px] sm:text-[13px] font-bold",
            d.textSecondary,
          )}
        >
          {label}
        </p>

        {changeLabel && (
          <p
            className={cn(
              "text-[10px] sm:text-[11px] mt-1.5 leading-relaxed",
              d.textMuted,
            )}
          >
            {changeLabel}
          </p>
        )}
      </div>

      {onClick && (
        <FaChevronLeft
          className={cn(
            "absolute left-3.5 bottom-4 h-3 w-3 opacity-0 transition-all duration-300 group-hover:opacity-40 motion-safe:group-hover:-translate-x-1",
            d.textMuted,
          )}
          aria-hidden="true"
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
      aria-label={`${label}: ${toPersianDigits(value.toLocaleString())}. مشاهده`}
      className={cn(
        "group flex min-h-[66px] w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-right transition-all duration-200 sm:min-h-[70px] sm:px-3.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eeb944]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        d.card,
        d.border,
        d.shadow,
        d.cardHover,
        "motion-safe:hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-105",
          d.miniIcon,
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <div
            className={cn(
              "mb-1 h-5 w-10 rounded motion-safe:animate-pulse",
              d.input,
            )}
            aria-hidden="true"
          />
        ) : (
          <p
            className={cn(
              "mb-1 text-[17px] font-black tabular-nums leading-none sm:text-lg",
              d.textPrimary,
            )}
          >
            {toPersianDigits(anim.toLocaleString())}
          </p>
        )}
        <p
          className={cn(
            "truncate text-[10px] font-medium sm:text-[11px]",
            d.textMuted,
          )}
        >
          {label}
        </p>
      </div>
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
      aria-label={label}
      className={cn(
        "group flex min-h-[86px] flex-col items-center justify-center gap-2 rounded-xl border p-2.5 text-center transition-all duration-200 sm:min-h-[100px] sm:rounded-2xl sm:p-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eeb944]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "motion-safe:hover:-translate-y-1 active:translate-y-0 active:scale-[0.97]",
        d.card,
        d.cardHover,
        d.border,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 motion-safe:group-hover:scale-110 sm:h-11 sm:w-11",
          color,
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-[10px] font-bold leading-tight sm:text-[11px]",
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
      role="listitem"
      className={cn(
        "group flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 transition-all duration-150 sm:gap-3 sm:px-3",
        d.divider,
        d.hover,
      )}
    >
      <div
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10",
          s.bg,
          s.text,
        )}
        aria-hidden="true"
      >
        {icon}
        <FaCircle
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2",
            s.dot,
            d.dotRing,
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "truncate text-[12px] font-bold leading-snug sm:text-[13px]",
              d.textPrimary,
            )}
          >
            {title}
          </p>
          {badge && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold sm:text-[10px]",
                s.badge,
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <p
          className={cn(
            "mt-0.5 truncate text-[10px] sm:text-[11px]",
            d.textMuted,
          )}
        >
          {subtitle}
        </p>
      </div>

      <span
        className={cn(
          "shrink-0 whitespace-nowrap text-[9px] font-medium tabular-nums sm:text-[10px]",
          d.textMuted,
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
    <section
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5",
        d.card,
        d.border,
        d.shadow,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b px-4 py-3.5 sm:px-5 sm:py-4",
          d.divider,
        )}
      >
        <div className="flex items-center gap-2.5">
          {icon && (
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg",
                d.sectionIcon,
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <h3
            className={cn("text-[13px] font-black sm:text-sm", d.textPrimary)}
          >
            {title}
          </h3>
        </div>
        {linkText && onLink && (
          <button
            type="button"
            onClick={onLink}
            aria-label={`${linkText} — ${title}`}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all duration-200 sm:text-[11px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eeb944]/45",
              d.sectionLink,
            )}
          >
            <span>{linkText}</span>
            <FaChevronLeft className="h-2.5 w-2.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {loading ? (
          <SkeletonList />
        ) : isEmpty ? (
          <EmptyState message={emptyMessage ?? "داده‌ای یافت نشد"} />
        ) : (
          children
        )}
      </div>
    </section>
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
        aria-hidden="true"
      >
        <FaBoxOpen className={cn("h-5 w-5 sm:h-6 sm:w-6", d.emptyIcon)} />
      </div>
      <p className={cn("text-xs sm:text-sm font-medium", d.textMuted)}>
        {message}
      </p>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonList() {
  const { d } = useDash();
  return (
    <div className="space-y-1" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2.5 sm:py-3"
        >
          <div
            className={cn(
              "h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl motion-safe:animate-pulse",
              d.input,
            )}
          />
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <div
              className={cn(
                "h-3.5 sm:h-4 w-28 sm:w-36 rounded motion-safe:animate-pulse",
                d.input,
              )}
            />
            <div
              className={cn(
                "h-2.5 sm:h-3 w-20 sm:w-24 rounded motion-safe:animate-pulse",
                d.input,
              )}
            />
          </div>
          <div
            className={cn(
              "h-2.5 sm:h-3 w-12 sm:w-14 rounded motion-safe:animate-pulse",
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
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md";
}) {
  const { d } = useDash();
  const normalizedAvatarUrl = normalizeLiaraUrl(avatarUrl ?? "");
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
        "relative flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl font-black shrink-0 bg-gradient-to-br ring-1",
        sizes[size],
        d.avatarBg,
      )}
      aria-hidden="true"
    >
      {normalizedAvatarUrl && (
        <span
          className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${normalizedAvatarUrl}")` }}
        />
      )}
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
  const { d } = useDash();
  const { data, error, isLoading } = useDashboardStats();
  const { can, isSuperAdmin } = useAccess();
  const [dashboardQuote, setDashboardQuote] = useState<string>(
    DASHBOARD_QUOTES[0],
  );
  const stats = data?.stats ?? EMPTY_STATS;
  const recentUsers = data?.recentUsers ?? [];
  const recentTickets = data?.recentTickets ?? [];
  const loading = isLoading && !data;

  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    getAuthUser(),
  );
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * DASHBOARD_QUOTES.length);

    setDashboardQuote(DASHBOARD_QUOTES[randomIndex]);
  }, []);
  useEffect(() => {
    function onProfileUpdated(event: Event) {
      const nextUser = authUserFromUnknown(
        event instanceof CustomEvent ? event.detail : null,
      );
      if (!nextUser) return;

      setAuthUser((current) => ({
        ...(current ?? {}),
        ...nextUser,
        role: nextUser.role ?? current?.role ?? "user",
      }));
    }

    window.addEventListener("admin-profile-updated", onProfileUpdated);
    return () =>
      window.removeEventListener("admin-profile-updated", onProfileUpdated);
  }, []);

  const displayName = useMemo(() => getDisplayName(authUser), [authUser]);
  const showRadVerifiedBadge = isRadFirstName(authUser?.firstName);
  const greeting = useMemo(() => getGreeting(), []);
  const currentDate = useMemo(() => getCurrentDate(), []);

  /* Quick actions — colours come from palette */
  const quickActions = useMemo(
    () =>
      [
        {
          icon: <FaUserPlus className="h-4 w-4" />,
          label: "کاربر جدید",
          section: "users" as AdminSection,
          color: d.qaBlue,
          component: "admin.users",
          action: "create",
        },
        {
          icon: <FaFile className="h-4 w-4" />,
          label: "صفحه جدید",
          section: "pages" as AdminSection,
          color: d.qaGreen,
          component: "admin.pages",
          action: "create",
        },
        {
          icon: <FaTicket className="h-4 w-4" />,
          label: "تیکت‌ها",
          section: "tickets" as AdminSection,
          color: d.qaAmber,
          component: "admin.tickets",
          action: "view",
        },
        {
          icon: <FaImage className="h-4 w-4" />,
          label: "فایل‌ها",
          section: "files" as AdminSection,
          color: d.qaPurple,
          component: "admin.files",
          action: "view",
        },
        {
          icon: <FaQrcode className="h-4 w-4" />,
          label: "QR کد",
          section: "qrcodes" as AdminSection,
          color: d.qaPink,
          component: "admin.qrcodes",
          action: "view",
        },
        {
          icon: <FaBell className="h-4 w-4" />,
          label: "اعلان‌ها",
          section: "notifications" as AdminSection,
          color: d.qaRed,
          component: "admin.notifications",
          action: "view",
        },
      ].filter(
        (item) =>
          can(item.component, "view") &&
          (item.action === "view" || can(item.component, item.action)),
      ),
    [can, d],
  );

  const miniStats = useMemo(
    () =>
      [
        {
          icon: <FaUserTie className="h-4 w-4" />,
          label: "نمایندگان",
          value: stats.agents.total,
          section: "agents" as AdminSection,
          component: "admin.agents",
        },
        {
          icon: <FaBoxOpen className="h-4 w-4" />,
          label: "بلاک‌ها",
          value: stats.blocks.active,
          section: "blocks" as AdminSection,
          component: "admin.blocks",
        },
        {
          icon: <FaPalette className="h-4 w-4" />,
          label: "قالب‌ها",
          value: stats.templates.active,
          section: "templates" as AdminSection,
          component: "admin.templates",
        },
        {
          icon: <FaBoxOpen className="h-4 w-4" />,
          label: "محصولات",
          value: stats.products.total,
          section: "products" as AdminSection,
          component: "admin.products",
        },
        {
          icon: <FaQrcode className="h-4 w-4" />,
          label: "QR کدها",
          value: stats.qrcodes.active,
          section: "qrcodes" as AdminSection,
          component: "admin.qrcodes",
        },
        {
          icon: <FaImage className="h-4 w-4" />,
          label: "فایل‌ها",
          value: stats.files.total,
          section: "files" as AdminSection,
          component: "admin.files",
        },
      ].filter((item) => can(item.component, "view")),
    [can, stats],
  );

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-5" dir="rtl">
      {/* ═══ Hero Header ═══ */}
      <div
        className={cn(
          "relative min-h-[156px] overflow-hidden rounded-2xl border px-4 py-5 sm:px-6 sm:py-6 lg:min-h-[166px] lg:px-7",
          d.hero,
        )}
      >
        {/* Decorative golden landscape — pure UI, no business logic. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[56%] overflow-hidden lg:block"
          aria-hidden="true"
        >
          <div
            className={cn(
              "absolute left-[18%] top-1/2 h-56 w-56 -translate-y-1/2 rounded-full blur-3xl",
              d.heroGlow,
            )}
          />
          <div
            className={cn(
              "absolute left-[29%] top-[26%] h-[74px] w-[74px] rounded-full",
              d.heroSun,
            )}
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 h-[78%] [clip-path:polygon(0_100%,0_72%,14%_55%,27%_70%,40%_39%,53%_67%,67%_30%,79%_56%,90%_35%,100%_58%,100%_100%)]",
              d.heroMountainBack,
            )}
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 h-[60%] opacity-95 [clip-path:polygon(0_100%,0_76%,18%_63%,31%_78%,46%_49%,57%_73%,72%_50%,84%_70%,100%_53%,100%_100%)]",
              d.heroMountainFront,
            )}
          />
          <div
            className={cn(
              "absolute -left-[8%] top-[61%] h-px w-[68%] -rotate-[11deg]",
              d.heroLine,
            )}
          />
          <div
            className={cn(
              "absolute left-[30%] top-[68%] h-px w-[70%] rotate-[8deg]",
              d.heroLine,
            )}
          />
        </div>

        <div className="relative z-10 flex min-h-[116px] items-center justify-between">
          {/* Greeting */}
          <div className="min-w-0 ">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <UserAvatar
                  name={displayName}
                  avatarUrl={authUser?.avatarUrl}
                  size="sm"
                />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[12px] font-semibold sm:text-sm",
                    d.textSecondary,
                  )}
                >
                  خوش آمدید <span aria-hidden="true">👋</span> {greeting} ✨
                </p>
                <h1
                  className={cn(
                    "mt-1 truncate text-xl font-black tracking-tight sm:text-2xl lg:text-[30px]",
                    d.textPrimary,
                  )}
                >
                  {displayName !== "مدیر" ? `${displayName} عزیز` : "مدیر عزیز"}{" "}
                  {showRadVerifiedBadge && <RadVerifiedBadge />}
                </h1>
                <p
                  className={cn(
                    "mt-1.5 hidden text-[11px] sm:block sm:text-xs",
                    d.textMuted,
                  )}
                >
                  امروز یک روز عالی برای ساختن آینده بهتر است.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {authUser?.role && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        getRoleBadge(authUser.role, d),
                      )}
                    >
                      <FaShieldHalved
                        className="h-2.5 w-2.5"
                        aria-hidden="true"
                      />
                      {getRolePersian(authUser.role)}
                    </span>
                  )}
                  {authUser?.phoneNumber && (
                    <span
                      className={cn(
                        "text-[10px] font-medium tabular-nums",
                        d.textMuted,
                      )}
                      dir="ltr"
                    >
                      {toPersianDigits(authUser.phoneNumber)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quote / status */}
          <div className="relative hidden min-w-[460px]   items-center justify-center lg:flex">
            <div className="max-w-[330px] text-right">
              <p
                className={cn(
                  "text-[13px] font-semibold leading-7 text-nowrap",
                  d.heroQuote,
                )}
              >
                {" "}
                « {dashboardQuote} »
              </p>
              <div className={cn("mt-2 h-px w-14", d.heroLine)} />
              <div
                className={cn(
                  "mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[10px] font-bold",
                  d.onlineBg,
                )}
                role="status"
              >
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-70",
                      d.onlinePing,
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex h-1.5 w-1.5 rounded-full",
                      d.onlineDot,
                    )}
                  />
                </span>
                سیستم فعال
              </div>
            </div>
          </div>
          {/* Date block */}

          <div
            className={cn(
              "hidden min-w-[160px] shrink-0 border-l pl-6 text-right md:block",
              d.divider,
            )}
          >
            <p className={cn("text-[11px] font-medium", d.textMuted)}>امروز</p>
            <p className={cn("mt-1 text-[13px] font-bold", d.textSecondary)}>
              {currentDate}
            </p>
            <p className={cn("mt-1 text-[11px] tabular-nums", d.textMuted)}>
              {new Date().toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Tehran",
              })}
            </p>
          </div>
        </div>

        {error && (
          <div
            className={cn(
              "relative z-20 mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3",
              d.errorBg,
            )}
            role="alert"
          >
            <FaClock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-medium sm:text-xs">
              {error instanceof Error
                ? error.message
                : "خطا در دریافت آمار داشبورد"}
            </p>
          </div>
        )}
      </div>

      {/* ═══ Main Stats ═══ */}
      <section
        aria-label="آمار کلیدی"
        className="grid grid-cols-2 gap-2.5 sm:gap-3.5 xl:grid-cols-4"
      >
        {can("admin.users", "view") && (
          <StatCard
            icon={<FaUsers className="h-4 w-4 sm:h-5 sm:w-5" />}
            label="کل کاربران"
            value={stats.users.total}
            tone="purple"
            change={stats.users.changePercent}
            changeLabel={`${toPersianDigits(stats.users.newLast30Days)} کاربر جدید در ۳۰ روز اخیر`}
            loading={loading}
            onClick={() => navigate("users")}
          />
        )}
        {can("admin.pages", "view") && (
          <>
            <StatCard
              icon={<FaFile className="h-4 w-4 sm:h-5 sm:w-5" />}
              label="صفحات منتشر شده"
              value={stats.pages.published}
              tone="green"
              change={
                stats.pages.total
                  ? Math.round(
                      (stats.pages.published / stats.pages.total) * 100,
                    )
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
              tone="amber"
              changeLabel={`${toPersianDigits(stats.pages.totalVisitors.toLocaleString())} بازدیدکننده یکتا`}
              loading={loading}
            />
          </>
        )}
        {can("admin.tickets", "view") && (
          <StatCard
            icon={<FaTicket className="h-4 w-4 sm:h-5 sm:w-5" />}
            label="تیکت‌های باز"
            value={stats.tickets.open}
            tone="rose"
            change={
              stats.tickets.total
                ? -Math.round((stats.tickets.open / stats.tickets.total) * 100)
                : 0
            }
            changeLabel={`از مجموع ${toPersianDigits(stats.tickets.total)} تیکت`}
            loading={loading}
            onClick={() => navigate("tickets")}
          />
        )}
      </section>

      {/* ═══ Mini Stats ═══ */}
      <section
        aria-label="آمار تکمیلی"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6"
      >
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
      </section>

      {/* ═══ Bottom Grid ═══ */}
      <div
        className={cn(
          "grid gap-3 sm:gap-4 lg:gap-4",
          isSuperAdmin ? "lg:grid-cols-3" : "lg:grid-cols-1",
        )}
      >
        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <SectionCard
            title="دسترسی سریع"
            icon={
              <FaArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 rotate-180" />
            }
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
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
        )}

        {/* Recent Users */}
        {isSuperAdmin && (
          <SectionCard
            title="کاربران جدید"
            icon={<FaUsers className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            linkText="مشاهده همه"
            onLink={() => navigate("users")}
            loading={loading}
            isEmpty={recentUsers.length === 0}
            emptyMessage="کاربر جدیدی یافت نشد"
          >
            <div className="space-y-2" role="list">
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
        )}

        {/* Recent Tickets */}
        {isSuperAdmin && (
          <SectionCard
            title="آخرین تیکت‌ها"
            icon={<FaTicket className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            linkText="مشاهده همه"
            onLink={() => navigate("tickets")}
            loading={loading}
            isEmpty={recentTickets.length === 0}
            emptyMessage="تیکتی یافت نشد"
          >
            <div className="space-y-2" role="list">
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
        )}
      </div>

      <footer className="flex flex-col items-center justify-between gap-2 px-1 pt-1 text-center sm:flex-row sm:text-right">
        <div
          className={cn(
            "flex items-center gap-2 text-[10px] font-medium",
            d.textMuted,
          )}
        >
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-black tracking-[0.22em]",
              d.sectionIcon,
            )}
          >
            RAD
          </span>
          <span>راد لینک</span>
          <span className={d.textDisabled}>|</span>
          <span>پنل مدیریت</span>
        </div>
        <p className={cn("text-[10px]", d.textDisabled)}>
          با تکنولوژی، ساده‌تر، حرفه‌ای‌تر، ادامه می‌دهیم ...
        </p>
      </footer>

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
