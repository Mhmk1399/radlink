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
  useId,
  type ReactNode,
} from "react";
import Link from "next/link";
import useSWR from "swr";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccess } from "@/hook/auth/useAccess";
import { animation, focus } from "@/lib/design/tokens";
import { normalizeLiaraUrl } from "@/lib/fileUtils";
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
  FaPlus,
} from "react-icons/fa6";
import Image from "next/image";

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
    textDisabled: "text-[#7a766e]",
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
    textDisabled: "text-[#9a948b]",
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

function UserAvatar({
  user,
  initials,
  className,
}: {
  user: AuthUser | null;
  initials: string;
  className: string;
}) {
  const avatarUrl = normalizeLiaraUrl(user?.avatarUrl ?? "");

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      aria-hidden="true"
    >
      <span className="relative z-0">{initials}</span>
      {avatarUrl && (
        <span
          className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${avatarUrl}")` }}
        />
      )}
    </div>
  );
}

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
  const confirmRef = useRef<HTMLButtonElement>(null);

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

  // Move focus to the primary action when the dialog opens
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => confirmRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center p-4",
        "motion-safe:animate-[fade-in_.15s_ease_both]",
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-desc"
    >
      {/* Scrim */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          isDark ? "bg-[#0a0a0e]/70" : "bg-[#2a2720]/30",
        )}
        onClick={() => !isLoggingOut && onCancel()}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border",
          s.card,
          s.border,
          s.dropShadow,
          "motion-safe:animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
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
              aria-hidden="true"
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
              <p className={cn("text-[11px] mt-0.5", s.textMuted)}>
                تأیید خروج از پنل مدیریت
              </p>
            </div>
          </div>

          {/* Close × */}
          <button
            ref={undefined}
            onClick={() => !isLoggingOut && onCancel()}
            disabled={isLoggingOut}
            aria-label="بستن"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              s.hover,
              s.textMuted,
              focus.ring,
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
                isDark ? "text-[#e08080]/80" : "text-[#b84040]/80",
              )}
              aria-hidden="true"
            />
            <p
              className={cn(
                "text-[12px] leading-relaxed",
                isDark ? "text-[#e08080]/90" : "text-[#b84040]/90",
              )}
            >
              با خروج، توکن احراز هویت شما حذف شده و برای ادامه باید دوباره وارد
              شوید.
            </p>
          </div>

          <p
            id="logout-modal-desc"
            className={cn(
              "text-sm leading-relaxed text-center",
              s.textSecondary,
            )}
          >
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
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isLoggingOut}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3",
              "text-sm font-semibold transition-all duration-200",
              focus.ring,
              "disabled:opacity-60 disabled:cursor-not-allowed",
              isDark
                ? "bg-red-500/15 hover:bg-red-500/25 text-[#e08080] ring-1 ring-red-500/20 hover:ring-red-500/30"
                : "bg-red-500/8 hover:bg-red-500/15 text-[#b84040] ring-1 ring-red-300/40 hover:ring-red-400/50",
              isLoggingOut && "motion-safe:animate-pulse",
            )}
          >
            {isLoggingOut ? (
              <>
                {/* Spinner */}
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
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
                <FaArrowRightFromBracket
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                بله، خارج شو
              </>
            )}
          </button>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={isLoggingOut}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3",
              "text-sm font-semibold transition-all duration-200",
              focus.ring,
              "disabled:opacity-60 disabled:cursor-not-allowed",
              s.border,
              "border",
              s.textSecondary,
              s.hover,
              isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
            )}
          >
            <FaXmark className="h-3.5 w-3.5" aria-hidden="true" />
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
  page?: unknown;
  title?: string;
  subtitle?: string;
  description?: string;
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
  const panelId = useId();
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
        const message = String(notification.description ?? "").trim();
        if (!id || !message || dismissedIds.has(id)) return null;
        return {
          id,
          title:
            String(notification.title ?? "").trim() ||
            getNotificationTitle(notification, message),
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
    info: <FaBell className={cn("h-3.5 w-3.5", s.info)} aria-hidden="true" />,
    success: (
      <FaCircleCheck
        className={cn("h-3.5 w-3.5", s.success)}
        aria-hidden="true"
      />
    ),
    warning: (
      <FaClock className={cn("h-3.5 w-3.5", s.warning)} aria-hidden="true" />
    ),
    error: (
      <FaXmark className={cn("h-3.5 w-3.5", s.error)} aria-hidden="true" />
    ),
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={unread > 0 ? `اعلانات، ${unread} خوانده‌نشده` : "اعلانات"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200",
          s.border,
          s.hover,
          focus.ring,
          open && s.active,
        )}
      >
        <FaBell className={cn("h-4 w-4", s.textMuted)} aria-hidden="true" />
        {unread > 0 && (
          <span
            className={cn(
              "absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full",
              "bg-red-500 px-1 text-[9px] font-bold text-white tabular-nums",
              "ring-2",
              isDark ? "ring-[#16161b]" : "ring-[#faf8f3]",
            )}
            aria-hidden="true"
          >
            {unread > 9 ? "۹+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="اعلانات"
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[380px] sm:w-[380px] overflow-hidden rounded-2xl border",
            s.border,
            s.dropdown,
            s.dropShadow,
            "motion-safe:animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
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
                  "rounded-md px-2 py-1 text-[11px] font-medium transition-colors hover:underline",
                  focus.ring,
                  s.textAccentSub,
                )}
              >
                خواندن همه
              </button>
            )}
          </div>

          <div
            className={cn(
              "max-h-[min(60vh,360px)] overflow-y-auto",
              s.scrollbar,
            )}
            role="list"
          >
            {notifs.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div
                  className={cn(
                    "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl",
                    isDark ? "bg-[#ffffff05]" : "bg-[#00000004]",
                  )}
                  aria-hidden="true"
                >
                  <FaBell className={cn("h-5 w-5", s.textDisabled)} />
                </div>
                <p className={cn("text-sm font-medium", s.textSecondary)}>
                  اعلانی نیست
                </p>
                <p className={cn("text-xs mt-1", s.textDisabled)}>
                  هر اعلان جدید اینجا نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  role="listitem"
                  tabIndex={0}
                  onClick={() => markAsRead(n.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      markAsRead(n.id);
                    }
                  }}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0",
                    focus.ring,
                    s.divider,
                    s.hover,
                    !n.read &&
                      (isDark ? "bg-[#ffffff03]" : "bg-[#8a7030]/[0.03]"),
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                      isDark ? "bg-[#ffffff05]" : "bg-[#00000004]",
                    )}
                  >
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          !n.read ? s.textPrimary : s.textSecondary,
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
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p
                      className={cn("text-[12px] truncate mt-0.5", s.textMuted)}
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
                        "shrink-0 rounded-lg p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity",
                        focus.ring,
                        s.textDisabled,
                        "hover:text-red-400",
                      )}
                    >
                      <FaXmark className="h-3 w-3" aria-hidden="true" />
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
                "block w-full rounded-lg py-1.5 text-center text-[11px] font-medium transition-colors hover:underline",
                focus.ring,
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
  const panelId = useId();

  const displayName = getDisplayName(authUser);
  const initials = getInitials(displayName);
  const rolePersian = ROLE_LABELS[authUser?.role ?? "user"] ?? "کاربر";

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`حساب کاربری ${displayName}`}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-2 py-1.5 h-10 transition-all duration-200",
          s.border,
          s.hover,
          focus.ring,
          open && s.active,
        )}
      >
        <UserAvatar
          user={authUser}
          initials={initials}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs",
            s.avatarBg,
          )}
        />
        <div className="hidden sm:block text-right min-w-0">
          <p
            className={cn(
              "text-xs font-medium leading-none truncate max-w-[120px]",
              s.textPrimary,
            )}
          >
            {displayName}
          </p>
          <p className={cn("text-[10px] leading-none mt-0.5", s.textMuted)}>
            {rolePersian}
          </p>
        </div>
        <FaAngleLeft
          className={cn(
            "h-3 w-3 hidden sm:block transition-transform duration-200",
            s.textMuted,
            open && "-rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          id={panelId}
          role="menu"
          aria-label={`منوی حساب ${displayName}`}
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[240px] overflow-hidden rounded-2xl border",
            s.border,
            s.dropdown,
            s.dropShadow,
            "motion-safe:animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          {/* User header */}
          <div className={cn("px-4 py-3.5 border-b", s.divider)}>
            <div className="flex items-center gap-3">
              <UserAvatar
                user={authUser}
                initials={initials}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm",
                  s.avatarBg,
                )}
              />
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
                  <FaShieldHalved className="h-2 w-2" aria-hidden="true" />
                  {rolePersian}
                </span>
                {authUser?.phoneNumber && (
                  <p
                    className={cn("text-[10px] mt-1 tabular-nums", s.textMuted)}
                    dir="ltr"
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
                role="menuitem"
                onClick={() => {
                  navigate(item.section);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                  focus.ring,
                  s.textSecondary,
                  s.hover,
                  isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
                )}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className={cn("border-t py-1.5", s.divider)}>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogoutRequest();
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                focus.ring,
                isDark
                  ? "text-[#e08080]/80 hover:text-[#e08080] hover:bg-red-500/8"
                  : "text-[#b84040]/80 hover:text-[#b84040] hover:bg-red-500/5",
              )}
            >
              <FaArrowRightFromBracket
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
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

  // Close the "more" sheet on Escape
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [currentSection]);

  return (
    <nav
      aria-label="ناوبری اصلی"
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden pb-safe"
    >
      {moreOpen && (
        <>
          <div
            className={cn(
              "fixed inset-0 z-40 backdrop-blur-sm",
              isDark ? "bg-[#0a0a0e]/50" : "bg-[#2a2720]/20",
            )}
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={moreRef}
            role="menu"
            aria-label="بخش‌های بیشتر"
            className={cn(
              "absolute bottom-full left-3 right-3 mb-2 z-50 overflow-hidden rounded-2xl border",
              s.border,
              s.dropdown,
              s.dropShadow,
              "motion-safe:animate-[fade-up_.25s_cubic-bezier(.22,1,.36,1)_both]",
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
                    role="menuitem"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      navigate(key);
                      setMoreOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl py-3 px-1 transition-all min-h-[64px] justify-center",
                      focus.ring,
                      active
                        ? cn(s.active, s.textAccent)
                        : cn(s.textSecondary, s.hover),
                    )}
                  >
                    <IconComp className="h-5 w-5" aria-hidden="true" />
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
              aria-current={active ? "page" : undefined}
              aria-label={meta.label}
              onClick={() => navigate(key)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-h-[52px] justify-center transition-all duration-200",
                focus.ring,
                active ? s.textAccent : cn(s.textSecondary, "active:scale-95"),
              )}
            >
              {active && (
                <div
                  className={cn(
                    "absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full",
                    s.activePill,
                  )}
                  aria-hidden="true"
                />
              )}
              <IconComp
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110",
                )}
                aria-hidden="true"
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
          aria-label="بخش‌های بیشتر"
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          className={cn(
            "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-h-[52px] justify-center transition-all duration-200 active:scale-95",
            focus.ring,
            moreOpen ? s.textAccent : s.textSecondary,
          )}
        >
          {moreOpen && (
            <div
              className={cn(
                "absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full",
                s.activePill,
              )}
              aria-hidden="true"
            />
          )}
          <FaEllipsis className="h-5 w-5" aria-hidden="true" />
          <span className="text-[9px] font-medium">بیشتر</span>
        </button>
      </div>
    </nav>
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

  // Close the mobile drawer on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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

  const isCollapsed = mounted && collapsed;

  return (
    <>
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden transition-opacity duration-300 backdrop-blur-sm",
            isDark ? "bg-[#0a0a0e]/60" : "bg-[#2a2720]/25",
          )}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        dir="rtl"
        aria-label="ناوبری پنل"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col w-[260px]",
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
          isCollapsed ? "lg:w-[76px]" : "lg:w-[260px]",
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
            <button
              onClick={() => {
                navigate("dashboard");
                if (typeof window !== "undefined" && window.innerWidth < 1024)
                  onClose();
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg -mx-1 px-1 py-1 transition-colors",
                focus.ring,
                s.hover,
              )}
              aria-label="رادلینک — رفتن به داشبورد"
            >
              <Image
                src="/assets/images/logo.png"
                width={100}
                height={100}
                alt="logo"
              />
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-bold leading-none",
                    s.textPrimary,
                  )}
                >
                  رادلینک
                </p>
                <p className={cn("text-[9px] mt-0.5", s.textMuted)}>
                  پنل مدیریت
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate("dashboard")}
              aria-label="رادلینک — رفتن به داشبورد"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                focus.ring,
                s.logoBg,
              )}
            >
              <span className={cn("text-xs font-black", s.textAccent)}>R</span>
            </button>
          )}
          <button
            onClick={onClose}
            className={cn(
              "lg:hidden rounded-lg p-2 transition-colors",
              focus.ring,
              s.hover,
              s.textMuted,
            )}
            aria-label="بستن منو"
          >
            <FaXmark className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav
          aria-label="بخش‌ها"
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-5",
            collapsed ? "px-2" : "px-3",
            s.scrollbar,
          )}
        >
          {groups.map((group) => (
            <div key={group.title} role="group" aria-label={group.title}>
              {!collapsed ? (
                <p
                  className={cn(
                    "mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest",
                    s.textDisabled,
                  )}
                >
                  {group.title}
                </p>
              ) : (
                <div
                  className={cn(
                    "mx-auto mb-2 h-px w-6",
                    isDark ? "bg-[#ffffff0a]" : "bg-[#0000000a]",
                  )}
                  aria-hidden="true"
                />
              )}

              <div className="space-y-1">
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
                        aria-current={active ? "page" : undefined}
                        aria-label={collapsed ? item.label : undefined}
                        className={cn(
                          "relative flex items-center rounded-xl text-sm font-medium w-full transition-all duration-200",
                          focus.ring,
                          collapsed
                            ? "justify-center h-11 w-11 mx-auto"
                            : "gap-3 px-3 py-2.5",
                          active
                            ? cn(
                                s.active,
                                s.textAccent,
                                "border",
                                s.borderAccent,
                              )
                            : cn(
                                "border border-transparent",
                                s.textSecondary,
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
                            aria-hidden="true"
                          />
                        )}
                        <IconComp
                          className={cn(
                            "shrink-0 transition-colors",
                            collapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                            active ? s.textAccent : s.textMuted,
                            "group-hover/nav:text-current",
                          )}
                          aria-hidden="true"
                        />
                        {!collapsed && (
                          <span className="flex-1 text-right truncate">
                            {item.label}
                          </span>
                        )}
                      </button>

                      {collapsed && (
                        <div
                          role="tooltip"
                          className={cn(
                            "pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-[60]",
                            "rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg",
                            "opacity-0 scale-95 group-hover/nav:opacity-100 group-hover/nav:scale-100 group-focus-within/nav:opacity-100 group-focus-within/nav:scale-100",
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
              aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
              aria-pressed={collapsed}
              className={cn(
                "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-[60]",
                "h-7 w-7 items-center justify-center rounded-full border transition-all duration-200",
                focus.ring,
                s.sidebar,
                s.border,
                s.textMuted,
                s.hover,
                isDark
                  ? "hover:text-[#d2b660] hover:border-[#c8a84b]/30 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]"
                  : "hover:text-[#7a6428] hover:border-[#8a7030]/30 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]",
                // positioned on the left edge (in RTL that's the border side)
                "left-0 -translate-x-1/2",
              )}
            >
              {collapsed ? (
                <FaAngleLeft className="h-3 w-3" aria-hidden="true" />
              ) : (
                <FaAngleRight className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* ── User (expanded) ── */}
        {!collapsed && (
          <div className={cn("shrink-0 border-t px-3 py-3", s.divider)}>
            <button
              onClick={onLogoutRequest}
              aria-label={`خروج از حساب ${displayName}`}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-200",
                focus.ring,
                s.hover,
                isDark ? "hover:text-[#e08080]" : "hover:text-[#b84040]",
              )}
            >
              <UserAvatar
                user={authUser}
                initials={initials}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-[11px]",
                  s.avatarBg,
                )}
              />
              <div className="flex-1 min-w-0 text-right">
                <p
                  className={cn(
                    "text-xs font-semibold truncate leading-none",
                    s.textPrimary,
                  )}
                >
                  {displayName}
                </p>
                <p className={cn("text-[10px] mt-1 leading-none", s.textMuted)}>
                  {rolePersian}
                </p>
              </div>
              <FaArrowRightFromBracket
                className={cn("h-3.5 w-3.5 shrink-0", s.textMuted)}
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* ── User + Logout (collapsed) ── */}
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
                aria-label={`خروج از حساب ${displayName}`}
                onClick={onLogoutRequest}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                  focus.ring,
                  s.textMuted,
                  s.hover,
                  isDark ? "hover:text-[#e08080]" : "hover:text-[#b84040]",
                )}
              >
                <UserAvatar
                  user={authUser}
                  initials={initials}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-[11px]",
                    s.avatarBg,
                  )}
                />
              </button>
              <div
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 z-[60]",
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg",
                  "opacity-0 scale-95 group-hover/logout:opacity-100 group-hover/logout:scale-100 group-focus-within/logout:opacity-100 group-focus-within/logout:scale-100",
                  "transition-all duration-150",
                  s.tooltip,
                )}
              >
                {displayName} — خروج
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
  const { can, isLoading: isAccessLoading } = useAccess();
  const meta = SECTION_META.find((m) => m.key === currentSection);
  const canCreatePageFromAdmin =
    !isAccessLoading && can("builder.page", "create");

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
            "lg:hidden flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
            focus.ring,
            s.hover,
            s.textMuted,
          )}
          aria-label="باز کردن منو"
        >
          <FaBars className="h-4 w-4" aria-hidden="true" />
        </button>
        <nav aria-label="مسیر" className="flex items-center gap-2 min-w-0">
          {currentSection !== "dashboard" && (
            <>
              <button
                onClick={() => navigate("dashboard")}
                className={cn(
                  "rounded-md px-1 py-0.5 text-xs shrink-0 transition-colors hover:underline",
                  focus.ring,
                  s.textMuted,
                  isDark ? "hover:text-[#c8c4bc]" : "hover:text-[#4a463e]",
                )}
              >
                داشبورد
              </button>
              <FaChevronLeft
                className={cn("h-2.5 w-2.5 shrink-0", s.textDisabled)}
                aria-hidden="true"
              />
            </>
          )}
          <h1
            aria-current="page"
            className={cn("text-sm font-semibold truncate", s.textPrimary)}
          >
            {meta?.label ?? "داشبورد"}
          </h1>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
            )
          }
          className={cn(
            "sm:hidden flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200",
            s.border,
            s.hover,
            focus.ring,
          )}
          aria-label="جستجو"
        >
          <FaMagnifyingGlass
            className={cn("h-3.5 w-3.5", s.textMuted)}
            aria-hidden="true"
          />
        </button>

        <button
          onClick={toggleTheme}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200",
            s.border,
            s.hover,
            focus.ring,
          )}
          aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تیره"}
        >
          {isDark ? (
            <FaSun className={cn("h-4 w-4", s.warning)} aria-hidden="true" />
          ) : (
            <FaMoon
              className={cn("h-4 w-4", s.textAccent)}
              aria-hidden="true"
            />
          )}
        </button>

        {canCreatePageFromAdmin && (
          <Link
            href="/builder"
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all duration-200",
              s.border,
              s.hover,
              s.textAccent,
              focus.ring,
            )}
            aria-label="ساخت صفحه از ادمین"
            title="ساخت صفحه از ادمین"
          >
            <FaPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">ساخت صفحه</span>
          </Link>
        )}

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

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    let ignore = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await response.json().catch(() => null);
        if (!response.ok || ignore) return;

        const nextUser = authUserFromUnknown(
          json && typeof json === "object" && "user" in json ? json.user : null,
        );
        if (!nextUser) return;

        setAuthUser((current) => ({
          ...(current ?? {}),
          ...nextUser,
          role: nextUser.role ?? current?.role ?? "user",
        }));

        try {
          localStorage.setItem(PROFILE_OVERRIDE_KEY, JSON.stringify(nextUser));
        } catch {}

        window.dispatchEvent(
          new CustomEvent("admin-profile-updated", { detail: nextUser }),
        );
      } catch {
        // Keep the JWT/local fallback when profile hydration fails.
      }
    }

    void loadCurrentUser();
    return () => {
      ignore = true;
    };
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

      {/* ── Skip to content (keyboard a11y) ── */}
      <a
        href="#admin-main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[300]",
          "focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold",
          s.card,
          s.border,
          "focus:border",
          s.textPrimary,
          s.dropShadow,
        )}
      >
        رفتن به محتوای اصلی
      </a>

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
          id="admin-main-content"
          tabIndex={-1}
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 focus:outline-none",
            s.scrollbar,
          )}
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
