// ─────────────────────────────────────────────────────────────────
// components/dashboard/DashboardShell.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccess } from "@/hook/auth/useAccess";
import { animation, focus } from "@/lib/design/tokens";
import {
  useHashRoute,
  filterSectionsByRole,
  groupSections,
  type AdminSection,
  SECTION_META,
} from "@/hook/admin/useHashRoute";
import type { UserRole } from "@/types";

import {
  FaHouse,
  FaUsers,
  FaUserTie,
  FaFile,
  FaImage,
  FaPuzzlePiece,
  FaPalette,
  FaLayerGroup,
  FaTicket,
  FaBell,
  FaBoxOpen,
  FaQrcode,
  FaShieldHalved,
  FaKey,
  FaGear,
  FaBars,
  FaXmark,
  FaSun,
  FaMoon,
  FaChevronLeft,
  FaArrowRightFromBracket,
  FaMagnifyingGlass,
  FaUser,
  FaCircleCheck,
  FaClock,
  FaAngleLeft,
  FaAngleRight,
  FaEllipsis,
  FaTriangleExclamation,
} from "react-icons/fa6";

/* ══════════════════════════════════════════════
   SOFT PALETTE — eye-friendly, warm-tinted
   ══════════════════════════════════════════════ */

const shell = {
  dark: {
    page: "bg-[#111116]",
    sidebar: "bg-[#16161b]",
    header: "bg-[#16161b]/95",
    card: "bg-[#1c1c23]",
    input: "bg-[#1e1e26]",
    dropdown: "bg-[#1c1c23]/98 backdrop-blur-2xl",
    hover: "hover:bg-[#ffffff07]",
    active: "bg-[#c8a84b]/[0.08]",
    tooltip: "bg-[#2a2a34]",
    textPrimary: "text-[#e6e3de]",
    textSecondary: "text-[#9c9890]",
    textMuted: "text-[#9c9890]",
    textDisabled: "text-[#47443e]",
    textAccent: "text-[#d2b660]",
    textAccentSub: "text-[#c8a84b]/70",
    border: "border-[#26262f]",
    borderAccent: "border-[#c8a84b]/18",
    divider: "border-[#22222a]/70",
    cardShadow: "shadow-[0_2px_10px_-3px_rgba(0,0,0,0.35)]",
    dropShadow:
      "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_2px_8px_-2px_rgba(0,0,0,0.3)]",
    accentBadge: "bg-[#c8a84b]/[0.07] ring-1 ring-[#c8a84b]/15 text-[#d2b660]",
    accentDot: "bg-[#d2b660]",
    avatarBg:
      "bg-gradient-to-br from-[#c8a84b]/18 to-[#a07830]/12 text-[#d2b660]",
    logoBg: "bg-[#c8a84b]/[0.07] border-[#c8a84b]/15",
    activePill: "bg-[#d2b660]",
    scrollbar:
      "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]",
    unreadDot: "bg-[#c8a84b]",
    info: "text-[#7aabce]",
    success: "text-[#6ec99a]",
    warning: "text-[#d2b660]",
    error: "text-[#e08080]",
  },

  light: {
    page: "bg-[#f4f1eb]",
    sidebar: "bg-[#faf8f3]",
    header: "bg-[#faf8f3]/95",
    card: "bg-white",
    input: "bg-[#f4f1eb]",
    dropdown: "bg-white/98 backdrop-blur-2xl",
    hover: "hover:bg-[#00000005]",
    active: "bg-[#8a7030]/[0.05]",
    tooltip: "bg-[#2c2a25]",
    textPrimary: "text-[#2a2720]",
    textSecondary: "text-[#6a655c]",
    textMuted: "text-[#6a655c]",
    textDisabled: "text-[#c2bcb4]",
    textAccent: "text-[#7a6428]",
    textAccentSub: "text-[#8a7030]/60",
    border: "border-[#e6e2da]",
    borderAccent: "border-[#8a7030]/15",
    divider: "border-[#ece8e0]/80",
    cardShadow: "shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06)]",
    dropShadow:
      "shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1),0_2px_6px_-2px_rgba(0,0,0,0.06)]",
    accentBadge: "bg-[#8a7030]/[0.06] ring-1 ring-[#8a7030]/12 text-[#7a6428]",
    accentDot: "bg-[#8a7030]",
    avatarBg:
      "bg-gradient-to-br from-[#c8a84b]/12 to-[#a07830]/8 text-[#7a6428]",
    logoBg: "bg-[#c8a84b]/[0.06] border-[#c8a84b]/12",
    activePill: "bg-[#8a7030]",
    scrollbar:
      "[scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.08)_transparent]",
    unreadDot: "bg-[#8a7030]",
    info: "text-[#3a7a9c]",
    success: "text-[#2d7a50]",
    warning: "text-[#7a6428]",
    error: "text-[#b84040]",
  },
} as const;

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

const SIDEBAR_KEY = "sidebar-collapsed";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FaHouse,
  FaUsers,
  FaUserTie,
  FaFile,
  FaImage,
  FaPuzzlePiece,
  FaPalette,
  FaLayerGroup,
  FaTicket,
  FaBell,
  FaBoxOpen,
  FaQrcode,
  FaShieldHalved,
  FaKey,
  FaGear,
  FaUser,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? FaHouse;
}

/* ── Auth ── */

interface AuthUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
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
    role: typeof record.role === "string" ? record.role : undefined,
  };
}

const ROLE_LABELS: Record<string, string> = {
  user: "کاربر",
  agent: "نماینده",
  admin: "مدیر",
  superAdmin: "مدیر ارشد",
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder("utf-8").decode(bytes));
  } catch {
    return null;
  }
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const cookie of document.cookie.split(";")) {
    const [key, ...v] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(v.join("="));
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
    role: (payload.role as string) ?? "user",
  };
  return { ...tokenUser, ...(readProfileOverride(id) ?? {}) };
}

function getDisplayName(user: AuthUser | null): string {
  if (!user) return "مدیر";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.phoneNumber || user.email || "مدیر";
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2) || "م"
  );
}

/* ── Logout handler ── */

function performLogout() {
  if (typeof window === "undefined") return;

  // Remove all known token keys from localStorage
  const tokenKeys = ["auth_token", "token", "accessToken", "jwt"];
  tokenKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });

  // Remove from sessionStorage
  tokenKeys.forEach((key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  });

  // Remove from cookies — set past expiry
  tokenKeys.forEach((key) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  // Clear profile override
  try {
    localStorage.removeItem(PROFILE_OVERRIDE_KEY);
  } catch {}

  // Redirect to auth
  window.location.href = "/auth";
}

/* ── Dropdown hook ── */

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

/* ── useShell — resolves palette from theme ── */

function useShell() {
  const { isDark } = useTheme();
  return { s: isDark ? shell.dark : shell.light, isDark };
}

/* ══════════════════════════════════════════════
   LOGOUT CONFIRMATION MODAL
   ══════════════════════════════════════════════ */

function LogoutModal({
  open,
  onConfirm,
  onCancel,
  isLoggingOut,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoggingOut: boolean;
}) {
  const { s, isDark } = useShell();

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoggingOut) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel, isLoggingOut]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center p-4",
        "animate-[fade-in_.15s_ease_both]",
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby="logout-modal-title"
    >
      {/* Scrim */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          isDark ? "bg-[#0a0a0e]/70" : "bg-[#2a2720]/30",
        )}
        onClick={() => !isLoggingOut && onCancel()}
      />

      {/* Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border",
          s.card,
          s.border,
          s.dropShadow,
          "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
        )}
      >
        {/* ── Header ── */}
        <div className={cn("flex items-start justify-between px-5 pt-5 pb-4")}>
          <div className="flex items-center gap-3">
            {/* Warning icon container */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isDark
                  ? "bg-red-500/10 ring-1 ring-red-500/20"
                  : "bg-red-50 ring-1 ring-red-200/60",
              )}
            >
              <FaArrowRightFromBracket
                className={cn(
                  "h-4 w-4",
                  isDark ? "text-[#e08080]" : "text-[#b84040]",
                )}
              />
            </div>
            <div>
              <h2
                id="logout-modal-title"
                className={cn("text-sm font-bold leading-tight", s.textPrimary)}
              >
                خروج از حساب
              </h2>
              <p className={cn("text-[11px] mt-0.5", s.textDisabled)}>
                تأیید خروج از پنل مدیریت
              </p>
            </div>
          </div>

          {/* Close × */}
          <button
            onClick={() => !isLoggingOut && onCancel()}
            disabled={isLoggingOut}
            aria-label="بستن"
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
              s.hover,
              s.textDisabled,
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            <FaXmark className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Divider ── */}
        <div
          className={cn("h-px mx-5", isDark ? "bg-[#26262f]" : "bg-[#e6e2da]")}
        />

        {/* ── Body ── */}
        <div className="px-5 py-4">
          {/* Warning banner */}
          <div
            className={cn(
              "flex items-start gap-2.5 rounded-xl px-3.5 py-3 mb-4",
              isDark
                ? "bg-red-500/[0.06] ring-1 ring-red-500/12"
                : "bg-red-50/80 ring-1 ring-red-200/50",
            )}
          >
            <FaTriangleExclamation
              className={cn(
                "h-3.5 w-3.5 mt-0.5 shrink-0",
                isDark ? "text-[#e08080]/70" : "text-[#b84040]/70",
              )}
            />
            <p
              className={cn(
                "text-[12px] leading-relaxed",
                isDark ? "text-[#e08080]/80" : "text-[#b84040]/80",
              )}
            >
              با خروج، توکن احراز هویت شما حذف شده و برای ادامه باید دوباره وارد
              شوید.
            </p>
          </div>

          <p className={cn("text-sm leading-relaxed text-center", s.textMuted)}>
            آیا مطمئن هستید که می‌خواهید از پنل مدیریت خارج شوید؟
          </p>
        </div>

        {/* ── Footer / Actions ── */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-5 pb-5",
            "flex-row-reverse", // Confirm on the left (RTL: primary action)
          )}
        >
          {/* Confirm — destructive */}
          <button
            onClick={onConfirm}
            disabled={isLoggingOut}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5",
              "text-sm font-semibold transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              isDark
                ? "bg-red-500/15 hover:bg-red-500/25 text-[#e08080] ring-1 ring-red-500/20 hover:ring-red-500/30"
                : "bg-red-500/8 hover:bg-red-500/15 text-[#b84040] ring-1 ring-red-300/40 hover:ring-red-400/50",
              isLoggingOut && "animate-pulse",
            )}
          >
            {isLoggingOut ? (
              <>
                {/* Spinner */}
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                در حال خروج…
              </>
            ) : (
              <>
                <FaArrowRightFromBracket className="h-3.5 w-3.5" />
                بله، خارج شو
              </>
            )}
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={isLoggingOut}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5",
              "text-sm font-semibold transition-all duration-200",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              s.border,
              "border",
              s.textMuted,
              s.hover,
              isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
            )}
          >
            <FaXmark className="h-3.5 w-3.5" />
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   useLogout hook
   ══════════════════════════════════════════════ */

function useLogout() {
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const requestLogout = useCallback(() => {
    setShowModal(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    // Small delay so the user sees the loading state
    await new Promise((resolve) => setTimeout(resolve, 600));
    performLogout();
  }, []);

  const cancelLogout = useCallback(() => {
    if (isLoggingOut) return;
    setShowModal(false);
  }, [isLoggingOut]);

  return {
    showModal,
    isLoggingOut,
    requestLogout,
    confirmLogout,
    cancelLogout,
  };
}

/* ══════════════════════════════════════════════
   NOTIFICATION DROPDOWN
   ══════════════════════════════════════════════ */

interface NotifItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  closeable?: boolean;
}

const FAKE_NOTIFS: NotifItem[] = [
  {
    id: "1",
    title: "کاربر جدید",
    message: "سارا جانسون ثبت‌نام کرد",
    time: "۲ دقیقه پیش",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "تیکت جدید",
    message: "مشکل ورود به سیستم",
    time: "۱۰ دقیقه پیش",
    read: false,
    type: "warning",
  },
  {
    id: "3",
    title: "پرداخت موفق",
    message: "فاکتور #۱۲۳۴ پرداخت شد",
    time: "۱ ساعت پیش",
    read: false,
    type: "success",
  },
  {
    id: "4",
    title: "خطای سیستم",
    message: "خطا در ارسال ایمیل",
    time: "۳ ساعت پیش",
    read: true,
    type: "error",
  },
];
void FAKE_NOTIFS;

type NotificationRecord = {
  _id?: string;
  id?: string;
  User?: unknown;
  message?: string;
  closeable?: boolean;
  isGlobal?: boolean;
  createdAt?: string;
};

type NotificationsResponse = {
  notifications?: NotificationRecord[];
  total?: number;
};

const NOTIFICATION_READ_KEY = "admin-notification-read-ids";
const NOTIFICATION_DISMISSED_KEY = "admin-notification-dismissed-ids";

function readStoredIdSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeStoredIdSet(key: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(Array.from(ids)));
}

function getNotificationType(message: string): NotifItem["type"] {
  if (/خطا|ناموفق|لغو|رد شد/i.test(message)) return "error";
  if (/موفق|تایید|پرداخت شد|انجام شد/i.test(message)) return "success";
  if (/هشدار|تیکت|نیاز|بررسی|مهم/i.test(message)) return "warning";
  return "info";
}

function getNotificationTitle(
  notification: NotificationRecord,
  message: string,
) {
  if (notification.isGlobal) return "اعلان عمومی";
  if (/تیکت/i.test(message)) return "اعلان تیکت";
  return "اعلان اختصاصی";
}

function formatRelativeFaDate(value?: string) {
  if (!value) return "تازه";
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  if (Number.isNaN(diffMs)) return "تازه";
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("fa-IR", { numeric: "auto" });
  if (abs < 60_000) return "همین حالا";
  if (abs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), "minute");
  if (abs < 86_400_000)
    return rtf.format(Math.round(diffMs / 3_600_000), "hour");
  if (abs < 2_592_000_000)
    return rtf.format(Math.round(diffMs / 86_400_000), "day");
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeZone: "Asia/Tehran",
  }).format(date);
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const token =
    typeof window !== "undefined"
      ? (window.localStorage.getItem("auth_token") ?? "")
      : "";
  const response = await fetch("/api/notifications?limit=10", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.message ?? "دریافت اعلان‌ها با خطا مواجه شد.");
  }
  return json ?? {};
}

function NotificationDropdown({
  navigate,
}: {
  navigate: (s: AdminSection) => void;
}) {
  const { open, setOpen, ref } = useDropdown();
  const { s, isDark } = useShell();
  const [readIds, setReadIds] = useState<Set<string>>(() =>
    readStoredIdSet(NOTIFICATION_READ_KEY),
  );
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() =>
    readStoredIdSet(NOTIFICATION_DISMISSED_KEY),
  );
  const { data } = useSWR<NotificationsResponse>(
    "/api/notifications?limit=10",
    fetchNotifications,
    {
      dedupingInterval: 30_000,
      refreshInterval: 60_000,
      revalidateOnFocus: true,
    },
  );

  const notifs = useMemo<NotifItem[]>(() => {
    return (data?.notifications ?? [])
      .map((notification): NotifItem | null => {
        const id = String(notification._id ?? notification.id ?? "");
        const message = String(notification.message ?? "").trim();
        if (!id || !message || dismissedIds.has(id)) return null;
        return {
          id,
          title: getNotificationTitle(notification, message),
          message,
          time: formatRelativeFaDate(notification.createdAt),
          read: readIds.has(id),
          type: getNotificationType(message),
          closeable: Boolean(notification.closeable),
        } satisfies NotifItem;
      })
      .filter((item): item is NotifItem => item !== null);
  }, [data?.notifications, dismissedIds, readIds]);

  const unread = notifs.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setReadIds((current) => {
      const next = new Set(current);
      next.add(id);
      writeStoredIdSet(NOTIFICATION_READ_KEY, next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      notifs.forEach((n) => next.add(n.id));
      writeStoredIdSet(NOTIFICATION_READ_KEY, next);
      return next;
    });
  }, [notifs]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((current) => {
      const next = new Set(current);
      next.add(id);
      writeStoredIdSet(NOTIFICATION_DISMISSED_KEY, next);
      return next;
    });
  }, []);

  const typeIcon: Record<string, ReactNode> = {
    info: <FaBell className={cn("h-3.5 w-3.5", s.info)} />,
    success: <FaCircleCheck className={cn("h-3.5 w-3.5", s.success)} />,
    warning: <FaClock className={cn("h-3.5 w-3.5", s.warning)} />,
    error: <FaXmark className={cn("h-3.5 w-3.5", s.error)} />,
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="اعلانات"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
          s.border,
          s.hover,
          focus.ring,
        )}
      >
        <FaBell className={cn("h-4 w-4", s.textMuted)} />
        {unread > 0 && (
          <span
            className={cn(
              "absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full",
              "bg-red-500/80 px-1 text-[9px] font-bold text-white",
              "ring-2",
              isDark ? "ring-[#16161b]" : "ring-[#faf8f3]",
            )}
          >
            {unread > 9 ? "۹+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[320px] sm:w-[380px] overflow-hidden rounded-2xl border",
            s.border,
            s.dropdown,
            s.dropShadow,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 border-b",
              s.divider,
            )}
          >
            <h3 className={cn("text-sm font-bold", s.textPrimary)}>اعلانات</h3>
            {unread > 0 && (
              <button
                onClick={markAllAsRead}
                className={cn(
                  "text-[11px] font-medium transition-colors hover:underline",
                  s.textAccentSub,
                )}
              >
                خواندن همه
              </button>
            )}
          </div>

          <div className={cn("max-h-[300px] overflow-y-auto", s.scrollbar)}>
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <FaBell
                  className={cn("mx-auto h-6 w-6 mb-2", s.textDisabled)}
                />
                <p className={cn("text-xs", s.textMuted)}>اعلانی نیست</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0",
                    s.divider,
                    s.hover,
                    !n.read && (isDark ? "bg-[#ffffff02]" : "bg-[#00000015]"),
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                      isDark ? "bg-[#ffffff04]" : "bg-[#00000004]",
                    )}
                  >
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          !n.read ? s.textPrimary : s.textMuted,
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            s.unreadDot,
                          )}
                        />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-[11px] truncate mt-0.5",
                        s.textDisabled,
                      )}
                    >
                      {n.message}
                    </p>
                    <p className={cn("text-[10px] mt-1", s.textDisabled)}>
                      {n.time}
                    </p>
                  </div>
                  {n.closeable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(n.id);
                      }}
                      aria-label="بستن اعلان"
                      className={cn(
                        "shrink-0 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        s.textDisabled,
                        "hover:text-red-400",
                      )}
                    >
                      <FaXmark className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className={cn("px-4 py-2.5 border-t", s.divider)}>
            <button
              onClick={() => {
                navigate("notifications");
                setOpen(false);
              }}
              className={cn(
                "block w-full text-center text-[11px] font-medium transition-colors hover:underline",
                s.textAccentSub,
              )}
            >
              مشاهده همه
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   USER DROPDOWN
   ══════════════════════════════════════════════ */

function UserDropdown({
  navigate,
  authUser,
  onLogoutRequest,
}: {
  navigate: (s: AdminSection) => void;
  authUser: AuthUser | null;
  onLogoutRequest: () => void;
}) {
  const { open, setOpen, ref } = useDropdown();
  const { s, isDark } = useShell();

  const displayName = getDisplayName(authUser);
  const initials = getInitials(displayName);
  const rolePersian = ROLE_LABELS[authUser?.role ?? "user"] ?? "کاربر";

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-all duration-200",
          s.border,
          s.hover,
          focus.ring,
        )}
      >
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs",
            s.avatarBg,
          )}
        >
          {initials}
        </div>
        <div className="hidden sm:block text-right min-w-0">
          <p
            className={cn(
              "text-xs font-medium leading-none truncate max-w-[100px]",
              s.textPrimary,
            )}
          >
            {displayName}
          </p>
          <p className={cn("text-[10px] leading-none mt-0.5", s.textDisabled)}>
            {rolePersian}
          </p>
        </div>
        <FaAngleLeft
          className={cn(
            "h-3 w-3 hidden sm:block transition-transform duration-200",
            s.textDisabled,
            open && "-rotate-90",
          )}
        />
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[240px] overflow-hidden rounded-2xl border",
            s.border,
            s.dropdown,
            s.dropShadow,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          {/* User header */}
          <div className={cn("px-4 py-3.5 border-b", s.divider)}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm",
                  s.avatarBg,
                )}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-bold truncate", s.textPrimary)}>
                  {displayName}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[9px] font-bold mt-1",
                    s.accentBadge,
                  )}
                >
                  <FaShieldHalved className="h-2 w-2" />
                  {rolePersian}
                </span>
                {authUser?.phoneNumber && (
                  <p
                    className={cn(
                      "text-[10px] mt-1 tabular-nums",
                      s.textDisabled,
                    )}
                  >
                    {authUser.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5">
            {[
              {
                label: "پروفایل من",
                icon: FaUser,
                section: "profile" as AdminSection,
              },
            ].map((item) => (
              <button
                key={item.section}
                onClick={() => {
                  navigate(item.section);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                  s.textMuted,
                  s.hover,
                  isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className={cn("border-t py-1.5", s.divider)}>
            <button
              onClick={() => {
                setOpen(false);
                onLogoutRequest();
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                isDark
                  ? "text-[#e08080]/70 hover:text-[#e08080] hover:bg-red-500/8"
                  : "text-[#b84040]/70 hover:text-[#b84040] hover:bg-red-500/5",
              )}
            >
              <FaArrowRightFromBracket className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DYNAMIC ISLAND (Mobile Bottom Bar)
   ══════════════════════════════════════════════ */

interface IslandConfig {
  items: AdminSection[];
  moreItems: AdminSection[];
}

const ISLAND_BY_ROLE: Record<UserRole, IslandConfig> = {
  user: {
    items: ["dashboard", "pages", "tickets", "notifications"],
    moreItems: ["files", "profile", "settings"],
  },
  agent: {
    items: ["dashboard", "pages", "files", "tickets"],
    moreItems: ["qrcodes", "notifications", "profile", "settings"],
  },
  admin: {
    items: ["dashboard", "users", "pages", "tickets"],
    moreItems: [
      "agents",
      "templates",
      "blocks",
      "categories",
      "files",
      "qrcodes",
      "products",
      "notifications",
      "permissions",
      "accesses",
      "settings",
    ],
  },
  superAdmin: {
    items: ["dashboard", "users", "pages", "tickets"],
    moreItems: [
      "agents",
      "permissions",
      "accesses",
      "templates",
      "blocks",
      "categories",
      "files",
      "qrcodes",
      "products",
      "notifications",
      "settings",
    ],
  },
};

function DynamicIsland({
  currentSection,
  navigate,
  userRole,
}: {
  currentSection: AdminSection;
  navigate: (s: AdminSection) => void;
  userRole: UserRole;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { s, isDark } = useShell();
  const {
    can,
    isLoading: accessLoading,
    isError: accessError,
    isSuperAdmin,
    user,
  } = useAccess();

  const effectiveRole = (user?.role as UserRole | undefined) ?? userRole;
  const roleSections = filterSectionsByRole(effectiveRole as any);
  const config = ISLAND_BY_ROLE[effectiveRole];

  const canShow = (key: AdminSection) =>
    key === "dashboard" ||
    isSuperAdmin ||
    roleSections.some((section) => section.key === key) ||
    (!accessLoading && !accessError && can(`admin.${key}`, "view"));

  const mainItems = config.items.filter(canShow);
  const accessGranted = SECTION_META.map((i) => i.key).filter(
    (k) => !config.items.includes(k) && !config.moreItems.includes(k),
  );
  const extraItems = [...config.moreItems, ...accessGranted].filter(canShow);

  const getMeta = (key: AdminSection) =>
    SECTION_META.find((s) => s.key === key);

  useEffect(() => {
    if (!moreOpen) return;
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [currentSection]);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden pb-safe">
      {moreOpen && (
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 backdrop-blur-sm",
              isDark ? "bg-[#0a0a0e]/50" : "bg-[#2a2720]/20",
            )}
            onClick={() => setMoreOpen(false)}
          />
          <div
            ref={moreRef}
            className={cn(
              "absolute bottom-full left-3 right-3 mb-2 z-50 overflow-hidden rounded-2xl border",
              s.border,
              s.dropdown,
              s.dropShadow,
              "animate-[fade-up_.25s_cubic-bezier(.22,1,.36,1)_both]",
            )}
          >
            <div className={cn("px-4 py-2.5 border-b", s.divider)}>
              <p className={cn("text-xs font-bold", s.textPrimary)}>
                بخش‌های بیشتر
              </p>
            </div>
            <div
              className={cn(
                "grid grid-cols-4 gap-1 p-3 max-h-[50vh] overflow-y-auto",
                s.scrollbar,
              )}
            >
              {extraItems.map((key) => {
                const meta = getMeta(key);
                if (!meta) return null;
                const IconComp = getIcon(meta.icon);
                const active = currentSection === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      navigate(key);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl py-3 px-1 transition-all",
                      active
                        ? cn(s.active, s.textAccent)
                        : cn(s.textMuted, s.hover),
                    )}
                  >
                    <IconComp className="h-4 w-4" />
                    <span className="text-[10px] font-medium leading-tight text-center">
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div
        className={cn(
          "mx-3 mb-3 flex items-center justify-around rounded-2xl border px-2 py-1.5",
          s.sidebar,
          s.border,
          isDark
            ? "shadow-[0_-6px_24px_-8px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            : "shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.08)] backdrop-blur-xl",
        )}
      >
        {mainItems.map((key) => {
          const meta = getMeta(key);
          if (!meta) return null;
          const IconComp = getIcon(meta.icon);
          const active = currentSection === key;
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                active ? s.textAccent : cn(s.textDisabled, "active:scale-95"),
              )}
            >
              {active && (
                <div
                  className={cn(
                    "absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full",
                    s.activePill,
                  )}
                />
              )}
              <IconComp
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110",
                )}
              />
              <span
                className={cn("text-[9px] font-medium", active && "font-bold")}
              >
                {meta.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95",
            moreOpen ? s.textAccent : s.textDisabled,
          )}
        >
          {moreOpen && (
            <div
              className={cn(
                "absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full",
                s.activePill,
              )}
            />
          )}
          <FaEllipsis className="h-5 w-5" />
          <span className="text-[9px] font-medium">بیشتر</span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SIDEBAR
   ══════════════════════════════════════════════ */

function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
  currentSection,
  navigate,
  userRole,
  authUser,
  onLogoutRequest,
}: {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentSection: AdminSection;
  navigate: (s: AdminSection) => void;
  userRole: UserRole;
  authUser: AuthUser | null;
  onLogoutRequest: () => void;
}) {
  const { s, isDark } = useShell();
  const {
    can,
    isLoading: accessLoading,
    isError: accessError,
    isSuperAdmin,
    user,
  } = useAccess();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveRole = (user?.role as UserRole | undefined) ?? userRole;
  const roleSections = filterSectionsByRole(effectiveRole as any);
  const sections = SECTION_META.filter((item) => {
    if (item.key === "dashboard") return true;
    return (
      isSuperAdmin ||
      roleSections.some((section) => section.key === item.key) ||
      (!accessLoading && !accessError && can(`admin.${item.key}`, "view"))
    );
  });
  const groups = groupSections(sections);

  const displayName = getDisplayName(authUser);
  const initials = getInitials(displayName);
  const rolePersian = ROLE_LABELS[authUser?.role ?? "user"] ?? "کاربر";

  return (
    <>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm",
            isDark ? "bg-[#0a0a0e]/60" : "bg-[#2a2720]/25",
          )}
          onClick={onClose}
        />
      )}

      <aside
        dir="rtl"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col w-[260px]",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
          mounted && collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          s.sidebar,
          "border-l",
          s.border,
        )}
      >
        {/* ── Logo ── */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b",
            s.divider,
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border",
                  s.logoBg,
                )}
              >
                <span className={cn("text-xs font-black", s.textAccent)}>
                  L
                </span>
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-bold leading-none",
                    s.textPrimary,
                  )}
                >
                  لندیکس
                </p>
                <p className={cn("text-[9px] mt-0.5", s.textDisabled)}>
                  پنل مدیریت
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border",
                s.logoBg,
              )}
            >
              <span className={cn("text-xs font-black", s.textAccent)}>L</span>
            </div>
          )}
          <button
            onClick={onClose}
            className={cn(
              "lg:hidden rounded-lg p-1.5 transition-colors",
              s.hover,
              s.textMuted,
            )}
            aria-label="بستن"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4",
            collapsed ? "px-2" : "px-3",
            s.scrollbar,
          )}
        >
          {groups.map((group) => (
            <div key={group.title}>
              {!collapsed ? (
                <p
                  className={cn(
                    "mb-1.5 px-3 text-[9px] font-bold uppercase tracking-widest",
                    s.textDisabled,
                  )}
                >
                  {group.title}
                </p>
              ) : (
                <div
                  className={cn(
                    "mx-auto mb-1.5 h-px w-6",
                    isDark ? "bg-[#ffffff06]" : "bg-[#00000006]",
                  )}
                />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = currentSection === item.key;
                  const IconComp = getIcon(item.icon);
                  return (
                    <div key={item.key} className="relative group/nav">
                      <button
                        onClick={() => {
                          navigate(item.key);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={cn(
                          "relative flex items-center rounded-xl text-sm font-medium w-full transition-all duration-200",
                          focus.ring,
                          collapsed
                            ? "justify-center h-10 w-10 mx-auto"
                            : "gap-3 px-3 py-2",
                          active
                            ? cn(
                                s.active,
                                s.textAccent,
                                "border",
                                s.borderAccent,
                              )
                            : cn(
                                "border border-transparent",
                                s.textMuted,
                                s.hover,
                                isDark
                                  ? "hover:text-[#e6e3de]"
                                  : "hover:text-[#2a2720]",
                              ),
                        )}
                      >
                        {active && collapsed && (
                          <div
                            className={cn(
                              "absolute -right-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-l-full",
                              s.activePill,
                            )}
                          />
                        )}
                        <IconComp
                          className={cn(
                            "shrink-0 transition-colors",
                            collapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                            active ? s.textAccent : s.textDisabled,
                            "group-hover/nav:text-current",
                          )}
                        />
                        {!collapsed && (
                          <span className="flex-1 text-right truncate">
                            {item.label}
                          </span>
                        )}
                      </button>

                      {collapsed && (
                        <div
                          className={cn(
                            "pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-[60]",
                            "rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg",
                            "opacity-0 scale-95 group-hover/nav:opacity-100 group-hover/nav:scale-100",
                            "transition-all duration-150",
                            s.tooltip,
                          )}
                        >
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Collapse toggle ── */}
        <div className={cn("hidden lg:block shrink-0 border-t", s.divider)}>
          <div className={cn("py-2", collapsed ? "px-2" : "px-3")}>
            <button
              onClick={onToggleCollapse}
              title={collapsed ? "باز کردن منو" : "جمع کردن منو"}
              className={cn(
                "group/collapse flex items-center rounded-xl text-xs font-medium w-full transition-all duration-200",
                s.textDisabled,
                s.hover,
                isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
                collapsed
                  ? "justify-center h-10 w-10 mx-auto"
                  : "gap-2.5 px-3 py-2",
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md transition-all duration-200",
                  isDark
                    ? "bg-[#ffffff04] group-hover/collapse:bg-[#c8a84b]/8 group-hover/collapse:text-[#d2b660]"
                    : "bg-[#00000003] group-hover/collapse:bg-[#8a7030]/6 group-hover/collapse:text-[#7a6428]",
                )}
              >
                {collapsed ? (
                  <FaAngleLeft className="h-3 w-3" />
                ) : (
                  <FaAngleRight className="h-3 w-3" />
                )}
              </div>
              {!collapsed && <span>جمع کردن منو</span>}
            </button>
          </div>
        </div>

        {/* ── User (expanded) ── */}
        {!collapsed && (
          <div className={cn("shrink-0 border-t px-3 py-3", s.divider)}>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 mb-2",
                isDark ? "bg-[#ffffff02]" : "bg-[#00000003]",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-[11px]",
                  s.avatarBg,
                )}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-semibold truncate leading-none",
                    s.textPrimary,
                  )}
                >
                  {displayName}
                </p>
                <p
                  className={cn(
                    "text-[10px] mt-0.5 leading-none",
                    s.textDisabled,
                  )}
                >
                  {rolePersian}
                </p>
              </div>
            </div>
            {/* Logout button — triggers modal */}
            <button
              onClick={onLogoutRequest}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                s.textMuted,
                s.hover,
                isDark ? "hover:text-[#e08080]" : "hover:text-[#b84040]",
              )}
            >
              <FaArrowRightFromBracket className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        )}

        {/* ── Logout (collapsed) ── */}
        {collapsed && (
          <div
            className={cn(
              "hidden lg:flex shrink-0 border-t justify-center py-2 px-2",
              s.divider,
            )}
          >
            <div className="relative group/logout">
              <button
                title="خروج"
                onClick={onLogoutRequest}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                  s.textDisabled,
                  s.hover,
                  isDark ? "hover:text-[#e08080]" : "hover:text-[#b84040]",
                )}
              >
                <FaArrowRightFromBracket className="h-4 w-4" />
              </button>
              <div
                className={cn(
                  "pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-[60]",
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg",
                  "opacity-0 scale-95 group-hover/logout:opacity-100 group-hover/logout:scale-100",
                  "transition-all duration-150",
                  s.tooltip,
                )}
              >
                خروج
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ══════════════════════════════════════════════
   HEADER
   ══════════════════════════════════════════════ */

function Header({
  onMenuClick,
  currentSection,
  navigate,
  authUser,
  onLogoutRequest,
}: {
  onMenuClick: () => void;
  currentSection: AdminSection;
  navigate: (s: AdminSection) => void;
  authUser: AuthUser | null;
  onLogoutRequest: () => void;
}) {
  const { s, isDark } = useShell();
  const { toggleTheme } = useTheme();
  const meta = SECTION_META.find((m) => m.key === currentSection);

  return (
    <header
      dir="rtl"
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 px-4 sm:px-6",
        s.header,
        "border-b",
        s.divider,
        "backdrop-blur-xl",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className={cn(
            "lg:hidden rounded-lg p-2 transition-colors",
            s.hover,
            s.textMuted,
          )}
          aria-label="منو"
        >
          <FaBars className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          {currentSection !== "dashboard" && (
            <>
              <button
                onClick={() => navigate("dashboard")}
                className={cn(
                  "text-xs shrink-0 transition-colors hover:underline",
                  s.textDisabled,
                  isDark ? "hover:text-[#9c9890]" : "hover:text-[#6a655c]",
                )}
              >
                داشبورد
              </button>
              <FaChevronLeft
                className={cn("h-2.5 w-2.5 shrink-0", s.textDisabled)}
              />
            </>
          )}
          <span className={cn("text-sm font-semibold truncate", s.textPrimary)}>
            {meta?.label ?? "داشبورد"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
            )
          }
          className={cn(
            "sm:hidden flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
            s.border,
            s.hover,
            focus.ring,
          )}
          aria-label="جستجو"
        >
          <FaMagnifyingGlass className={cn("h-3.5 w-3.5", s.textMuted)} />
        </button>

        <button
          onClick={toggleTheme}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
            s.border,
            s.hover,
            focus.ring,
          )}
          aria-label="تغییر تم"
        >
          {isDark ? (
            <FaSun className={cn("h-4 w-4", s.warning)} />
          ) : (
            <FaMoon className={cn("h-4 w-4", s.textAccent)} />
          )}
        </button>

        <NotificationDropdown navigate={navigate} />
        <UserDropdown
          navigate={navigate}
          authUser={authUser}
          onLogoutRequest={onLogoutRequest}
        />
      </div>
    </header>
  );
}

/* ══════════════════════════════════════════════
   SHELL
   ══════════════════════════════════════════════ */

interface AdminShellProps {
  children: (props: {
    section: AdminSection;
    navigate: (s: AdminSection) => void;
  }) => ReactNode;
  userRole?: UserRole;
}

export default function AdminShell({
  children,
  userRole = "user",
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const { s } = useShell();
  const { section, navigate } = useHashRoute();

  /* ── Logout modal state ── */
  const {
    showModal,
    isLoggingOut,
    requestLogout,
    confirmLogout,
    cancelLogout,
  } = useLogout();

  useEffect(() => {
    setAuthUser(getAuthUser());
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

  useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_KEY) === "true") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((p) => {
      const n = !p;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(n));
      } catch {}
      return n;
    });
  }, []);

  return (
    <div className={cn("flex min-h-screen", s.page)} dir="rtl">
      <style>{animation.keyframes}</style>

      {/* ── Global logout confirmation modal ── */}
      <LogoutModal
        open={showModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        isLoggingOut={isLoggingOut}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        currentSection={section}
        navigate={navigate}
        userRole={userRole}
        authUser={authUser}
        onLogoutRequest={requestLogout}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen((p) => !p)}
          currentSection={section}
          navigate={navigate}
          authUser={authUser}
          onLogoutRequest={requestLogout}
        />
        <main
          className={cn("flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8", s.scrollbar)}
        >
          {children({ section, navigate })}
        </main>
      </div>

      <DynamicIsland
        currentSection={section}
        navigate={navigate}
        userRole={userRole}
      />
    </div>
  );
}
