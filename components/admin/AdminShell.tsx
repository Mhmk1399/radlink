// ─────────────────────────────────────────────────────────────────
// components/dashboard/DashboardShell.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
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
} from "react-icons/fa6";

/* ══════════════════════════════════════════════
   SOFT PALETTE — eye-friendly, warm-tinted
   ══════════════════════════════════════════════

   Dark  → warm charcoal (#18181d base), muted gold
   Light → warm ivory (#f7f5f0 base), rich bronze
   ══════════════════════════════════════════════ */

const shell = {
  dark: {
    // ── Page & layout surfaces ─────────────────
    page: "bg-[#111116]",
    sidebar: "bg-[#16161b]",
    header: "bg-[#16161b]/95",
    card: "bg-[#1c1c23]",
    input: "bg-[#1e1e26]",
    dropdown: "bg-[#1c1c23]/98 backdrop-blur-2xl",
    hover: "hover:bg-[#ffffff07]",
    active: "bg-[#c8a84b]/[0.08]",
    tooltip: "bg-[#2a2a34]",

    // ── Text hierarchy ─────────────────────────
    textPrimary: "text-[#e6e3de]",
    textSecondary: "text-[#9c9890]",
    textMuted: "text-[#6e6a62]",
    textDisabled: "text-[#47443e]",
    textAccent: "text-[#d2b660]", // muted gold — not glaring
    textAccentSub: "text-[#c8a84b]/70",

    // ── Structural lines ───────────────────────
    border: "border-[#26262f]",
    borderAccent: "border-[#c8a84b]/18",
    divider: "border-[#22222a]/70",

    // ── Shadows ───────────────────────────────
    cardShadow: "shadow-[0_2px_10px_-3px_rgba(0,0,0,0.35)]",
    dropShadow:
      "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_2px_8px_-2px_rgba(0,0,0,0.3)]",

    // ── Accent fills ──────────────────────────
    accentBadge: "bg-[#c8a84b]/[0.07] ring-1 ring-[#c8a84b]/15 text-[#d2b660]",
    accentDot: "bg-[#d2b660]",
    avatarBg:
      "bg-gradient-to-br from-[#c8a84b]/18 to-[#a07830]/12 text-[#d2b660]",
    logoBg: "bg-[#c8a84b]/[0.07] border-[#c8a84b]/15",
    activePill: "bg-[#d2b660]", // the top active indicator dot

    // ── Scrollbar ─────────────────────────────
    scrollbar:
      "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.08)_transparent]",

    // ── Notification dot ──────────────────────
    unreadDot: "bg-[#c8a84b]",

    // ── Status colours (muted, not neon) ──────
    info: "text-[#7aabce]",
    success: "text-[#6ec99a]",
    warning: "text-[#d2b660]",
    error: "text-[#e08080]",
  },

  light: {
    // ── Page & layout surfaces ─────────────────
    page: "bg-[#f4f1eb]",
    sidebar: "bg-[#faf8f3]",
    header: "bg-[#faf8f3]/95",
    card: "bg-white",
    input: "bg-[#f4f1eb]",
    dropdown: "bg-white/98 backdrop-blur-2xl",
    hover: "hover:bg-[#00000005]",
    active: "bg-[#8a7030]/[0.05]",
    tooltip: "bg-[#2c2a25]",

    // ── Text hierarchy ─────────────────────────
    textPrimary: "text-[#2a2720]",
    textSecondary: "text-[#6a655c]",
    textMuted: "text-[#9a948a]",
    textDisabled: "text-[#c2bcb4]",
    textAccent: "text-[#7a6428]", // rich bronze
    textAccentSub: "text-[#8a7030]/60",

    // ── Structural lines ───────────────────────
    border: "border-[#e6e2da]",
    borderAccent: "border-[#8a7030]/15",
    divider: "border-[#ece8e0]/80",

    // ── Shadows ───────────────────────────────
    cardShadow: "shadow-[0_1px_6px_-1px_rgba(0,0,0,0.06)]",
    dropShadow:
      "shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1),0_2px_6px_-2px_rgba(0,0,0,0.06)]",

    // ── Accent fills ──────────────────────────
    accentBadge: "bg-[#8a7030]/[0.06] ring-1 ring-[#8a7030]/12 text-[#7a6428]",
    accentDot: "bg-[#8a7030]",
    avatarBg:
      "bg-gradient-to-br from-[#c8a84b]/12 to-[#a07830]/8 text-[#7a6428]",
    logoBg: "bg-[#c8a84b]/[0.06] border-[#c8a84b]/12",
    activePill: "bg-[#8a7030]",

    // ── Scrollbar ─────────────────────────────
    scrollbar:
      "[scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.08)_transparent]",

    // ── Notification dot ──────────────────────
    unreadDot: "bg-[#8a7030]",

    // ── Status colours ────────────────────────
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
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
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
   NOTIFICATION DROPDOWN
   ══════════════════════════════════════════════ */

interface NotifItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
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

function NotificationDropdown({
  navigate,
}: {
  navigate: (s: AdminSection) => void;
}) {
  const { open, setOpen, ref } = useDropdown();
  const { s, isDark } = useShell();
  const [notifs, setNotifs] = useState(FAKE_NOTIFS);
  const unread = notifs.filter((n) => !n.read).length;

  const typeIcon: Record<string, ReactNode> = {
    info: <FaBell className={cn("h-3.5 w-3.5", s.info)} />,
    success: <FaCircleCheck className={cn("h-3.5 w-3.5", s.success)} />,
    warning: <FaClock className={cn("h-3.5 w-3.5", s.warning)} />,
    error: <FaXmark className={cn("h-3.5 w-3.5", s.error)} />,
  };

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger ── */}
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

      {/* ── Panel ── */}
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
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 border-b",
              s.divider,
            )}
          >
            <h3 className={cn("text-sm font-bold", s.textPrimary)}>اعلانات</h3>
            {unread > 0 && (
              <button
                onClick={() =>
                  setNotifs((p) => p.map((n) => ({ ...n, read: true })))
                }
                className={cn(
                  "text-[11px] font-medium transition-colors hover:underline",
                  s.textAccentSub,
                )}
              >
                خواندن همه
              </button>
            )}
          </div>

          {/* List */}
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
                  onClick={() =>
                    setNotifs((p) =>
                      p.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                    )
                  }
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0",
                    s.divider,
                    s.hover,
                    !n.read && (isDark ? "bg-[#ffffff02]" : "bg-[#00000015]"),
                  )}
                >
                  {/* Icon box */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                      isDark ? "bg-[#ffffff04]" : "bg-[#00000004]",
                    )}
                  >
                    {typeIcon[n.type]}
                  </div>

                  {/* Content */}
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

                  {/* Dismiss */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifs((p) => p.filter((x) => x.id !== n.id));
                    }}
                    className={cn(
                      "shrink-0 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity",
                      s.textDisabled,
                      "hover:text-red-400",
                    )}
                  >
                    <FaXmark className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
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
}: {
  navigate: (s: AdminSection) => void;
  authUser: AuthUser | null;
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
              {
                label: "تنظیمات",
                icon: FaGear,
                section: "settings" as AdminSection,
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
   GLOBAL SEARCH
   ══════════════════════════════════════════════ */

function GlobalSearch({ navigate }: { navigate: (s: AdminSection) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { s, isDark } = useShell();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "z")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [open]);

  const results = query.trim()
    ? SECTION_META.filter((s) => s.label.includes(query))
    : [];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "hidden sm:flex h-9 items-center gap-2 rounded-xl border px-3 transition-all duration-200",
          s.border,
          s.hover,
          focus.ring,
        )}
      >
        <FaMagnifyingGlass className={cn("h-3.5 w-3.5", s.textDisabled)} />
        <span className={cn("text-xs", s.textDisabled)}>جستجو...</span>
        <kbd
          className={cn(
            "hidden lg:inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-mono",
            s.border,
            s.textDisabled,
          )}
        >
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4">
      {/* Scrim */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          isDark ? "bg-[#0a0a0e]/65" : "bg-[#2a2720]/25",
        )}
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl border",
          s.border,
          s.dropdown,
          s.dropShadow,
          "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
        )}
        dir="rtl"
      >
        <div className={cn("flex items-center gap-3 px-4 border-b", s.divider)}>
          <FaMagnifyingGlass
            className={cn("h-4 w-4 shrink-0", s.textDisabled)}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در بخش‌ها..."
            className={cn(
              "flex-1 h-12 bg-transparent text-sm outline-none",
              s.textPrimary,
            )}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && results.length > 0) {
                navigate(results[0].key);
                setOpen(false);
              }
            }}
          />
          <kbd
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[10px] font-mono",
              s.border,
              s.textDisabled,
            )}
          >
            ESC
          </kbd>
        </div>
        <div className={cn("max-h-[300px] overflow-y-auto py-2", s.scrollbar)}>
          {query.trim() === "" ? (
            <p className={cn("px-4 py-6 text-center text-sm", s.textMuted)}>
              عبارتی تایپ کنید...
            </p>
          ) : results.length === 0 ? (
            <p className={cn("px-4 py-6 text-center text-sm", s.textMuted)}>
              نتیجه‌ای نیست
            </p>
          ) : (
            results.map((item) => {
              const IconComp = getIcon(item.icon);
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    navigate(item.key);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                    s.textMuted,
                    s.hover,
                    isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
                  )}
                >
                  <IconComp className="h-4 w-4" />
                  <span className="flex-1 text-right">{item.label}</span>
                  <span className={cn("text-[10px]", s.textDisabled)}>
                    {item.group}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
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
      {/* More sheet */}
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

      {/* Bar */}
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

        {/* More button */}
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
}: {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentSection: AdminSection;
  navigate: (s: AdminSection) => void;
  userRole: UserRole;
  authUser: AuthUser | null;
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
      {/* Mobile scrim */}
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
                        {/* Active side pill (collapsed) */}
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

                      {/* Tooltip (collapsed) */}
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
            <button
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
}: {
  onMenuClick: () => void;
  currentSection: AdminSection;
  navigate: (s: AdminSection) => void;
  authUser: AuthUser | null;
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
      {/* Left: menu + breadcrumb */}
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

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <GlobalSearch navigate={navigate} />

        {/* Mobile search trigger */}
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

        {/* Theme toggle */}
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
        <UserDropdown navigate={navigate} authUser={authUser} />
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

  useEffect(() => {
    setAuthUser(getAuthUser());
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

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        currentSection={section}
        navigate={navigate}
        userRole={userRole}
        authUser={authUser}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen((p) => !p)}
          currentSection={section}
          navigate={navigate}
          authUser={authUser}
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
