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
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
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
   HELPERS
   ══════════════════════════════════════════════ */

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

const SIDEBAR_KEY = "sidebar-collapsed";

// Icon map
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
  FaGear,
  FaUser,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? FaHouse;
}

/* ══════════════════════════════════════════════
   DROPDOWN HOOK
   ══════════════════════════════════════════════ */

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [open]);

  return { open, setOpen, ref };
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
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [notifs, setNotifs] = useState(FAKE_NOTIFS);

  const unread = notifs.filter((n) => !n.read).length;

  const typeIcons: Record<string, ReactNode> = {
    info: <FaBell className="h-3.5 w-3.5 text-blue-400" />,
    success: <FaCircleCheck className="h-3.5 w-3.5 text-emerald-400" />,
    warning: <FaClock className="h-3.5 w-3.5 text-amber-400" />,
    error: <FaXmark className="h-3.5 w-3.5 text-red-400" />,
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-xl border",
          `border ${t.borderSubtle}`,
          t.hoverBg,
          "transition-all duration-200",
          focus.ring,
        )}
        aria-label="اعلانات"
      >
        <FaBell className={cn("h-4 w-4", t.textMuted)} />
        {unread > 0 && (
          <span className="absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "۹+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[340px] sm:w-[380px] overflow-hidden rounded-2xl border",
            `border ${t.borderSubtle}`,
            t.dropdownBg,
            t.dropdownShadow,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 border-b",
              `border ${t.divider}`,
            )}
          >
            <h3 className={cn("text-sm font-bold", t.textPrimary)}>اعلانات</h3>
            {unread > 0 && (
              <button
                onClick={() =>
                  setNotifs((p) => p.map((n) => ({ ...n, read: true })))
                }
                className={cn(
                  "text-[11px] font-medium",
                  t.textAccentMuted,
                  "hover:underline",
                )}
              >
                خواندن همه
              </button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <FaBell
                  className={cn("mx-auto h-6 w-6 mb-2", t.textDisabled)}
                />
                <p className={cn("text-xs", t.textMuted)}>اعلانی نیست</p>
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
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                    !n.read &&
                      (isDark ? "bg-white/[0.02]" : "bg-black/[0.015]"),
                    t.hoverBg,
                    `border-b border ${t.divider} last:border-0`,
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                      isDark ? "bg-white/[0.04]" : "bg-black/[0.03]",
                    )}
                  >
                    {typeIcons[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          !n.read ? t.textPrimary : t.textMuted,
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F5D76E]" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-[11px] truncate mt-0.5",
                        t.textDisabled,
                      )}
                    >
                      {n.message}
                    </p>
                    <p className={cn("text-[10px] mt-1", t.textDisabled)}>
                      {n.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifs((p) => p.filter((x) => x.id !== n.id));
                    }}
                    className={cn(
                      "shrink-0 rounded-lg p-1 opacity-0 hover:opacity-100 transition-opacity",
                      t.textDisabled,
                      "hover:text-red-400",
                    )}
                  >
                    <FaXmark className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className={cn("px-4 py-2.5 border-t", `border ${t.divider}`)}>
            <button
              onClick={() => {
                navigate("notifications");
                setOpen(false);
              }}
              className={cn(
                "block w-full text-center text-[11px] font-medium",
                t.textAccentMuted,
                "hover:underline",
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

function UserDropdown({ navigate }: { navigate: (s: AdminSection) => void }) {
  const { open, setOpen, ref } = useDropdown();
  const t = useThemeTokens();
  const { isDark } = useTheme();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-2 py-1.5",
          `border ${t.borderSubtle}`,
          t.hoverBg,
          "transition-all duration-200",
          focus.ring,
        )}
      >
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            isDark ? "bg-[#D4AF37]/10" : "bg-[#D4AF37]/8",
          )}
        >
          <span className={cn("text-xs font-bold", t.textAccent)}>م</span>
        </div>
        <div className="hidden sm:block text-right">
          <p className={cn("text-xs font-medium leading-none", t.textPrimary)}>
            مدیر سیستم
          </p>
          <p className={cn("text-[10px] leading-none mt-0.5", t.textDisabled)}>
            superAdmin
          </p>
        </div>
        <FaAngleLeft
          className={cn(
            "h-3 w-3 hidden sm:block transition-transform",
            t.textDisabled,
            open && "-rotate-90",
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[220px] overflow-hidden rounded-2xl border",
            `border ${t.borderSubtle}`,
            t.dropdownBg,
            t.dropdownShadow,
            "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
          )}
        >
          <div className={cn("px-4 py-3 border-b", `border ${t.divider}`)}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isDark ? "bg-[#D4AF37]/10" : "bg-[#D4AF37]/8",
                )}
              >
                <span className={cn("text-sm font-bold", t.textAccent)}>م</span>
              </div>
              <div>
                <p className={cn("text-sm font-bold", t.textPrimary)}>
                  مدیر سیستم
                </p>
                <p className={cn("text-[11px]", t.textDisabled)}>
                  admin@landix.ir
                </p>
              </div>
            </div>
          </div>
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
                  t.textMuted,
                  t.hoverBg,
                  isDark ? "hover:text-white" : "hover:text-[#1A1304]",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
          <div className={cn("border-t py-1.5", `border ${t.divider}`)}>
            <button
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                "text-red-400 hover:bg-red-500/10",
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
  const t = useThemeTokens();
  const { isDark } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
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
          "hidden sm:flex h-9 items-center gap-2 rounded-xl border px-3",
          `border ${t.borderSubtle}`,
          t.hoverBg,
          "transition-all duration-200",
          focus.ring,
        )}
      >
        <FaMagnifyingGlass className={cn("h-3.5 w-3.5", t.textDisabled)} />
        <span className={cn("text-xs", t.textDisabled)}>جستجو...</span>
        <kbd
          className={cn(
            "hidden lg:inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-mono",
            `border ${t.borderSubtle}`,
            t.textDisabled,
          )}
        >
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl border",
          `border ${t.borderSubtle}`,
          t.dropdownBg,
          t.dropdownShadow,
          "animate-[fade-up_.2s_cubic-bezier(.22,1,.36,1)_both]",
        )}
        dir="rtl"
      >
        <div
          className={cn(
            "flex items-center gap-3 px-4 border-b",
            `border ${t.divider}`,
          )}
        >
          <FaMagnifyingGlass
            className={cn("h-4 w-4 shrink-0", t.textDisabled)}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در بخش‌ها..."
            className={cn(
              "flex-1 h-12 bg-transparent text-sm outline-none",
              t.textPrimary,
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
              `border ${t.borderSubtle}`,
              t.textDisabled,
            )}
          >
            ESC
          </kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto py-2">
          {query.trim() === "" ? (
            <p className={cn("px-4 py-6 text-center text-sm", t.textMuted)}>
              عبارتی تایپ کنید...
            </p>
          ) : results.length === 0 ? (
            <p className={cn("px-4 py-6 text-center text-sm", t.textMuted)}>
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
                    t.textMuted,
                    t.hoverBg,
                    isDark ? "hover:text-white" : "hover:text-[#1A1304]",
                  )}
                >
                  <IconComp className="h-4 w-4" />
                  <span className="flex-1 text-right">{item.label}</span>
                  <span className={cn("text-[10px]", t.textDisabled)}>
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
      "settings",
    ],
  },
  superAdmin: {
    items: ["dashboard", "users", "pages", "tickets"],
    moreItems: [
      "agents",
      "permissions",
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
  const t = useThemeTokens();
  const { isDark } = useTheme();

  const config = ISLAND_BY_ROLE[userRole];
  const mainItems = config.items;
  const extraItems = config.moreItems;

  // Close more menu on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  // Close on section change
  useEffect(() => {
    setMoreOpen(false);
  }, [currentSection]);

  const getMeta = (key: AdminSection) =>
    SECTION_META.find((s) => s.key === key);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden pb-safe">
      {/* More Menu (slides up) */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setMoreOpen(false)}
          />
          <div
            ref={moreRef}
            className={cn(
              "absolute bottom-full left-3 right-3 mb-2 z-50 overflow-hidden rounded-2xl border",
              `border ${t.borderSubtle}`,
              t.dropdownBg,
              t.dropdownShadow,
              "animate-[fade-up_.25s_cubic-bezier(.22,1,.36,1)_both]",
            )}
          >
            <div className={cn("px-4 py-2.5 border-b", `border ${t.divider}`)}>
              <p className={cn("text-xs font-bold", t.textPrimary)}>
                بخش‌های بیشتر
              </p>
            </div>
            <div className="grid grid-cols-4 gap-1 p-3">
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
                        ? cn(t.activeBg, t.textAccent)
                        : cn(t.textMuted, t.hoverBg),
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

      {/* Island Bar */}
      <div
        className={cn(
          "mx-3 mb-3 flex items-center justify-around rounded-2xl border px-2 py-1.5",
          t.sidebarBg,
          `border ${t.borderSubtle}`,
          "shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.3)]",
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
                active
                  ? cn(t.textAccent)
                  : cn(t.textDisabled, "active:scale-95"),
              )}
            >
              {active && (
                <div
                  className={cn(
                    "absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full",
                    isDark ? "bg-[#F5D76E]" : "bg-[#B8860B]",
                  )}
                />
              )}
              <IconComp className={cn("h-5 w-5", active && "scale-110")} />
              <span
                className={cn(
                  "text-[9px] font-medium",
                  active ? "font-bold" : "",
                )}
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
            "relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
            moreOpen ? t.textAccent : t.textDisabled,
            "active:scale-95",
          )}
        >
          {moreOpen && (
            <div
              className={cn(
                "absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full",
                isDark ? "bg-[#F5D76E]" : "bg-[#B8860B]",
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
}: {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentSection: AdminSection;
  navigate: (s: AdminSection) => void;
  userRole: UserRole;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();

  const sections = filterSectionsByRole(userRole as any);
  const groups = groupSections(sections);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        dir="rtl"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col",
          "transition-all duration-300 ease-in-out",
          "w-[260px] lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen",
          t.sidebarBg,
          `border-l border ${t.borderSubtle}`,
          t.scrollbar,
        )}
        style={{
          width:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? collapsed
                ? 72
                : 260
              : 260,
        }}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-14 items-center border-b",
            `border ${t.divider}`,
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  isDark
                    ? "bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                    : "bg-[#D4AF37]/8 border border-[#D4AF37]/15",
                )}
              >
                <span className={cn("text-xs font-black", t.textAccent)}>
                  L
                </span>
              </div>
              <div>
                <p
                  className={cn(
                    "text-sm font-bold leading-none",
                    t.textPrimary,
                  )}
                >
                  لندیکس
                </p>
                <p className={cn("text-[9px] mt-0.5", t.textDisabled)}>
                  پنل مدیریت
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                isDark
                  ? "bg-[#D4AF37]/10 border border-[#D4AF37]/20"
                  : "bg-[#D4AF37]/8 border border-[#D4AF37]/15",
              )}
            >
              <span className={cn("text-xs font-black", t.textAccent)}>L</span>
            </div>
          )}
          <button
            onClick={onClose}
            className={cn("lg:hidden rounded-lg p-1.5", t.hoverBg, t.textMuted)}
            aria-label="بستن"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-3 space-y-4",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {groups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p
                  className={cn(
                    "mb-1.5 px-3 text-[9px] font-bold uppercase tracking-widest",
                    t.textDisabled,
                  )}
                >
                  {group.title}
                </p>
              )}
              {collapsed && (
                <div
                  className={cn(
                    "mx-auto mb-1.5 h-px w-6",
                    isDark ? "bg-white/[0.06]" : "bg-black/[0.06]",
                  )}
                />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = currentSection === item.key;
                  const IconComp = getIcon(item.icon);

                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        navigate(item.key);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center rounded-xl text-sm font-medium w-full",
                        "transition-all duration-200",
                        focus.ring,
                        collapsed
                          ? "justify-center h-10 w-10 mx-auto"
                          : "gap-3 px-3 py-2",
                        active
                          ? cn(
                              t.activeBg,
                              t.textAccent,
                              `border ${t.borderAccent}`,
                            )
                          : cn(
                              "border border-transparent",
                              t.textMuted,
                              t.hoverBg,
                              isDark
                                ? "hover:text-white"
                                : "hover:text-[#1A1304]",
                            ),
                      )}
                    >
                      <IconComp
                        className={cn(
                          "shrink-0",
                          collapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                          active ? t.textAccent : t.textDisabled,
                          "transition-colors group-hover:text-current",
                        )}
                      />
                      {!collapsed && (
                        <span className="flex-1 text-right">{item.label}</span>
                      )}
                      {collapsed && (
                        <div
                          className={cn(
                            "pointer-events-none absolute right-full mr-2 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50",
                            t.tooltipBg,
                            "text-white shadow-lg",
                          )}
                        >
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div
          className={cn(
            "hidden lg:flex border-t py-2",
            `border ${t.divider}`,
            collapsed ? "justify-center px-2" : "px-3",
          )}
        >
          <button
            onClick={onToggleCollapse}
            className={cn(
              "flex items-center gap-2 rounded-xl py-2 text-xs font-medium transition-all duration-200",
              t.textDisabled,
              t.hoverBg,
              isDark ? "hover:text-white" : "hover:text-[#1A1304]",
              collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 w-full",
            )}
            title={collapsed ? "باز کردن" : "جمع کردن"}
          >
            {collapsed ? (
              <FaAngleLeft className="h-3.5 w-3.5" />
            ) : (
              <>
                <FaAngleRight className="h-3.5 w-3.5" />
                <span>جمع کردن</span>
              </>
            )}
          </button>
        </div>

        {!collapsed && (
          <div className={cn("border-t px-3 py-2", `border ${t.divider}`)}>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                t.textMuted,
                t.hoverBg,
                "hover:text-red-400",
              )}
            >
              <FaArrowRightFromBracket className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
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
}: {
  onMenuClick: () => void;
  currentSection: AdminSection;
  navigate: (s: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark, toggleTheme } = useTheme();

  const meta = SECTION_META.find((s) => s.key === currentSection);

  return (
    <header
      dir="rtl"
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between gap-4 px-4 sm:px-6",
        t.headerBg,
        `border-b border ${t.divider}`,
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className={cn("lg:hidden rounded-lg p-2", t.hoverBg, t.textMuted)}
          aria-label="منو"
        >
          <FaBars className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {currentSection !== "dashboard" && (
            <button
              onClick={() => navigate("dashboard")}
              className={cn("text-xs", t.textDisabled, "hover:underline")}
            >
              داشبورد
            </button>
          )}
          {currentSection !== "dashboard" && (
            <FaChevronLeft className={cn("h-2.5 w-2.5", t.textDisabled)} />
          )}
          <span className={cn("text-sm font-medium", t.textPrimary)}>
            {meta?.label ?? "داشبورد"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <GlobalSearch navigate={navigate} />
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              ctrlKey: true,
            });
            document.dispatchEvent(event);
          }}
          className={cn(
            "sm:hidden flex h-9 w-9 items-center justify-center rounded-xl border",
            `border ${t.borderSubtle}`,
            t.hoverBg,
            focus.ring,
          )}
          aria-label="جستجو"
        >
          <FaMagnifyingGlass className={cn("h-3.5 w-3.5", t.textMuted)} />
        </button>
        <button
          onClick={toggleTheme}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border",
            `border ${t.borderSubtle}`,
            t.hoverBg,
            "transition-all duration-200",
            focus.ring,
          )}
          aria-label="تغییر تم"
        >
          {isDark ? (
            <FaSun className="h-4 w-4 text-[#F5D76E]" />
          ) : (
            <FaMoon className="h-4 w-4 text-[#8A6A12]" />
          )}
        </button>
        <NotificationDropdown navigate={navigate} />
        <UserDropdown navigate={navigate} />
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
  userRole = "superAdmin",
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const t = useThemeTokens();
  const { section, navigate } = useHashRoute();

  useEffect(() => {
    try {
      const s = localStorage.getItem(SIDEBAR_KEY);
      if (s === "true") setCollapsed(true);
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
    <div className={cn("flex min-h-screen", t.pageBg)} dir="rtl">
      <style>{animation.keyframes}</style>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        currentSection={section}
        navigate={navigate}
        userRole={userRole}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen((p) => !p)}
          currentSection={section}
          navigate={navigate}
        />
        <main
          className={cn("flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8", t.scrollbar)}
        >
          {children({ section, navigate })}
        </main>
      </div>

      {/* Mobile Dynamic Island */}
      <DynamicIsland
        currentSection={section}
        navigate={navigate}
        userRole={userRole}
      />
    </div>
  );
}
