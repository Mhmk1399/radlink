// ─────────────────────────────────────────────────────────────────
// components/sections/DashboardSection.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, { useState, useEffect } from "react";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import { gradients } from "@/lib/design/tokens";
import type { AdminSection } from "@/hook/admin/useHashRoute";

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
} from "react-icons/fa6";

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

function toPersianDigits(n: number | string): string {
  const p = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => p[parseInt(d)]);
}

// Count-up animation
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const inc = target / (duration / 16);
    const t = setInterval(() => {
      start += inc;
      if (start >= target) {
        setCount(target);
        clearInterval(t);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return count;
}

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
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const pos = (change ?? 0) >= 0;
  const anim = useCountUp(loading ? 0 : value);

  if (loading)
    return (
      <div
        className={cn(
          "rounded-2xl border p-5",
          `${t.cardBg} border ${t.borderSubtle}`,
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn("h-11 w-11 rounded-xl animate-pulse", t.inputBg)}
          />
          <div
            className={cn("h-6 w-16 rounded-full animate-pulse", t.inputBg)}
          />
        </div>
        <div
          className={cn("h-8 w-24 rounded-lg animate-pulse mb-2", t.inputBg)}
        />
        <div className={cn("h-4 w-16 rounded animate-pulse", t.inputBg)} />
      </div>
    );

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        `${t.cardBg} ${t.cardBgHover}`,
        `border ${t.borderSubtle}`,
        t.cardShadow,
        "hover:-translate-y-0.5",
        onClick && "cursor-pointer",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl opacity-0 transition-opacity group-hover:opacity-100",
          isDark ? "bg-[#D4AF37]/10" : "bg-[#D4AF37]/5",
        )}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-all group-hover:scale-110 group-hover:bg-[#D4AF37]/12",
              isDark
                ? "bg-[#D4AF37]/8 border-[#D4AF37]/15 text-[#F5D76E]"
                : "bg-[#D4AF37]/6 border-[#D4AF37]/12 text-[#B8860B]",
            )}
          >
            {icon}
          </div>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold",
                pos
                  ? isDark
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-emerald-500/8 text-emerald-600"
                  : isDark
                    ? "bg-red-500/10 text-red-400"
                    : "bg-red-500/8 text-red-600",
              )}
            >
              {pos ? (
                <FaArrowTrendUp className="h-3 w-3" />
              ) : (
                <FaArrowTrendDown className="h-3 w-3" />
              )}
              {toPersianDigits(Math.abs(change))}٪
            </div>
          )}
        </div>
        <p
          className={cn(
            "text-2xl font-extrabold tabular-nums mb-1",
            t.textPrimary,
          )}
        >
          {toPersianDigits(anim.toLocaleString())}
        </p>
        <p className={cn("text-xs font-medium", t.textMuted)}>{label}</p>
        {changeLabel && (
          <p className={cn("text-[10px] mt-1", t.textDisabled)}>
            {changeLabel}
          </p>
        )}
      </div>
      {onClick && (
        <FaChevronLeft
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 opacity-0 transition-all group-hover:opacity-60 group-hover:-translate-x-1",
            t.textMuted,
          )}
        />
      )}
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
        `${t.cardBg} ${t.cardBgHover}`,
        `border ${t.borderSubtle}`,
        t.borderAccentHover,
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110",
          color ??
            (isDark
              ? "bg-[#D4AF37]/8 text-[#F5D76E]"
              : "bg-[#D4AF37]/6 text-[#B8860B]"),
        )}
      >
        {icon}
      </div>
      <span
        className={cn("text-[11px] font-medium leading-tight", t.textSecondary)}
      >
        {label}
      </span>
    </button>
  );
}

function RecentItem({
  icon,
  title,
  subtitle,
  time,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
  status?: "success" | "pending" | "default";
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const colors = {
    success: isDark ? "text-emerald-400" : "text-emerald-600",
    pending: isDark ? "text-amber-400" : "text-amber-600",
    default: t.textMuted,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
        t.hoverBg,
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isDark ? "bg-white/4" : "bg-black/3",
          colors[status ?? "default"],
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", t.textPrimary)}>
          {title}
        </p>
        <p className={cn("text-[11px] truncate", t.textDisabled)}>{subtitle}</p>
      </div>
      <span className={cn("text-[10px] shrink-0", t.textDisabled)}>{time}</span>
    </div>
  );
}

function SectionCard({
  title,
  linkText,
  onLink,
  children,
  loading,
}: {
  title: string;
  linkText?: string;
  onLink?: () => void;
  children: React.ReactNode;
  loading?: boolean;
}) {
  const t = useThemeTokens();
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        `${t.cardBg} border ${t.borderSubtle}`,
        t.cardShadow,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-5 py-3.5 border-b",
          `border ${t.divider}`,
        )}
      >
        <h3 className={cn("text-sm font-bold", t.textPrimary)}>{title}</h3>
        {linkText && onLink && (
          <button
            onClick={onLink}
            className={cn(
              "text-[11px] font-medium",
              t.textAccentMuted,
              "hover:underline",
            )}
          >
            {linkText}
          </button>
        )}
      </div>
      <div className="p-4">{loading ? <SkeletonList /> : children}</div>
    </div>
  );
}

function SkeletonList() {
  const t = useThemeTokens();
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className={cn("h-9 w-9 rounded-lg animate-pulse", t.inputBg)} />
          <div className="flex-1 space-y-1.5">
            <div className={cn("h-4 w-32 rounded animate-pulse", t.inputBg)} />
            <div className={cn("h-3 w-24 rounded animate-pulse", t.inputBg)} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════ */

export default function DashboardSection({
  navigate,
}: {
  navigate: (s: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1
          className={cn(
            "text-2xl font-extrabold mb-1",
            isDark ? gradients.textPrimary : "text-[#1A1304]",
          )}
        >
          سلام، مدیر عزیز 👋
        </h1>
        <p className={cn("text-sm", t.textMuted)}>خلاصه عملکرد سیستم</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatCard
          icon={<FaUsers className="h-5 w-5" />}
          label="کل کاربران"
          value={1284}
          change={12}
          changeLabel="ماه قبل"
          loading={loading}
          onClick={() => navigate("users")}
        />
        <StatCard
          icon={<FaFile className="h-5 w-5" />}
          label="صفحات فعال"
          value={356}
          change={8}
          changeLabel="ماه قبل"
          loading={loading}
          onClick={() => navigate("pages")}
        />
        <StatCard
          icon={<FaEye className="h-5 w-5" />}
          label="بازدید امروز"
          value={4521}
          change={-3}
          changeLabel="دیروز"
          loading={loading}
        />
        <StatCard
          icon={<FaTicket className="h-5 w-5" />}
          label="تیکت باز"
          value={23}
          change={-15}
          changeLabel="هفته قبل"
          loading={loading}
          onClick={() => navigate("tickets")}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <FaUserTie className="h-4 w-4" />,
            label: "نمایندگان",
            value: 42,
            section: "agents" as AdminSection,
          },
          {
            icon: <FaPalette className="h-4 w-4" />,
            label: "تمپلیت‌ها",
            value: 18,
            section: "templates" as AdminSection,
          },
          {
            icon: <FaBoxOpen className="h-4 w-4" />,
            label: "محصولات",
            value: 67,
            section: "products" as AdminSection,
          },
          {
            icon: <FaQrcode className="h-4 w-4" />,
            label: "QR کدها",
            value: 134,
            section: "qrcodes" as AdminSection,
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.section)}
            className={cn(
              "group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
              `${t.cardBg} border ${t.borderSubtle}`,
              t.cardBgHover,
              t.borderAccentHover,
              "hover:-translate-y-0.5",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                isDark
                  ? "bg-white/4 text-slate-400"
                  : "bg-black/3 text-[#6B5D3E]",
              )}
            >
              {item.icon}
            </div>
            <div className="text-right">
              {loading ? (
                <div
                  className={cn("h-5 w-8 rounded animate-pulse", t.inputBg)}
                />
              ) : (
                <p
                  className={cn(
                    "text-lg font-bold tabular-nums leading-none",
                    t.textPrimary,
                  )}
                >
                  {toPersianDigits(item.value)}
                </p>
              )}
              <p className={cn("text-[10px] mt-0.5", t.textDisabled)}>
                {item.label}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="دسترسی سریع">
          <div className="grid grid-cols-3 gap-2">
            <QuickAction
              icon={<FaUserPlus className="h-4 w-4" />}
              label="کاربر جدید"
              onClick={() => navigate("users")}
              color={
                isDark
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-blue-500/8 text-blue-600"
              }
            />
            <QuickAction
              icon={<FaFile className="h-4 w-4" />}
              label="صفحه جدید"
              onClick={() => navigate("pages")}
              color={
                isDark
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-emerald-500/8 text-emerald-600"
              }
            />
            <QuickAction
              icon={<FaTicket className="h-4 w-4" />}
              label="تیکت‌ها"
              onClick={() => navigate("tickets")}
              color={
                isDark
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-amber-500/8 text-amber-600"
              }
            />
            <QuickAction
              icon={<FaImage className="h-4 w-4" />}
              label="فایل‌ها"
              onClick={() => navigate("files")}
              color={
                isDark
                  ? "bg-purple-500/10 text-purple-400"
                  : "bg-purple-500/8 text-purple-600"
              }
            />
            <QuickAction
              icon={<FaQrcode className="h-4 w-4" />}
              label="QR کد"
              onClick={() => navigate("qrcodes")}
              color={
                isDark
                  ? "bg-pink-500/10 text-pink-400"
                  : "bg-pink-500/8 text-pink-600"
              }
            />
            <QuickAction
              icon={<FaBell className="h-4 w-4" />}
              label="اعلان"
              onClick={() => navigate("notifications")}
              color={
                isDark
                  ? "bg-red-500/10 text-red-400"
                  : "bg-red-500/8 text-red-600"
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="کاربران جدید"
          linkText="مشاهده همه"
          onLink={() => navigate("users")}
          loading={loading}
        >
          <div className="space-y-0.5">
            <RecentItem
              icon={<FaUsers className="h-3.5 w-3.5" />}
              title="سارا جانسون"
              subtitle="sara@co.com"
              time="۲ دقیقه"
              status="success"
            />
            <RecentItem
              icon={<FaUsers className="h-3.5 w-3.5" />}
              title="محمد احمدی"
              subtitle="mohammad@co.com"
              time="۱ ساعت"
              status="success"
            />
            <RecentItem
              icon={<FaUsers className="h-3.5 w-3.5" />}
              title="فاطمه رضایی"
              subtitle="fatemeh@co.com"
              time="۳ ساعت"
              status="pending"
            />
            <RecentItem
              icon={<FaUsers className="h-3.5 w-3.5" />}
              title="علی حسینی"
              subtitle="ali@co.com"
              time="دیروز"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="تیکت‌ها"
          linkText="مشاهده همه"
          onLink={() => navigate("tickets")}
          loading={loading}
        >
          <div className="space-y-0.5">
            <RecentItem
              icon={<FaCircleCheck className="h-3.5 w-3.5" />}
              title="مشکل ورود"
              subtitle="سارا جانسون"
              time="۱۰ دقیقه"
              status="success"
            />
            <RecentItem
              icon={<FaClock className="h-3.5 w-3.5" />}
              title="ارتقا حساب"
              subtitle="محمد احمدی"
              time="۲ ساعت"
              status="pending"
            />
            <RecentItem
              icon={<FaClock className="h-3.5 w-3.5" />}
              title="خطا آپلود"
              subtitle="فاطمه رضایی"
              time="۵ ساعت"
              status="pending"
            />
            <RecentItem
              icon={<FaTicket className="h-3.5 w-3.5" />}
              title="قیمت‌گذاری"
              subtitle="علی حسینی"
              time="دیروز"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
