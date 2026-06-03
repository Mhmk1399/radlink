// ─────────────────────────────────────────────────────────────────
// app/admin/page.tsx  — نسخه نهایی
// ─────────────────────────────────────────────────────────────────
"use client";

import React, { Suspense, lazy } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { SECTION_META, type AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

// ── Lazy Sections ──
const DashboardSection = lazy(
  () => import("@/components/admin/DashboardSection"),
);
const UsersSection = lazy(() => import("@/components/admin/UsersSection"));

function SectionSkeleton() {
  const t = useThemeTokens();
  return (
    <div className="space-y-4 animate-pulse" dir="rtl">
      <div className={cn("h-8 w-48 rounded-xl", t.inputBg)} />
      <div className={cn("h-4 w-32 rounded", t.inputBg)} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-32 rounded-2xl border",
              `${t.cardBg} border ${t.borderSubtle}`,
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ComingSoon({
  section,
  navigate,
}: {
  section: AdminSection;
  navigate: (s: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const label = SECTION_META.find((s) => s.key === section)?.label ?? section;

  return (
    <div className="flex flex-col items-center justify-center py-20" dir="rtl">
      <div
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl border mb-6",
          `${t.cardBg} border ${t.borderSubtle}`,
        )}
      >
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className={cn("text-xl font-bold mb-2", t.textPrimary)}>
        بخش «{label}» در حال ساخت
      </h2>
      <p className={cn("text-sm mb-6", t.textMuted)}>به زودی اضافه می‌شود</p>
      <button
        onClick={() => navigate("dashboard")}
        className={cn(
          "text-sm font-medium px-4 py-2 rounded-xl border transition-colors",
          `border ${t.borderAccent}`,
          t.textAccent,
          t.hoverBg,
        )}
      >
        بازگشت به داشبورد
      </button>
    </div>
  );
}

function SectionRouter({
  section,
  navigate,
}: {
  section: AdminSection;
  navigate: (s: AdminSection) => void;
}) {
  switch (section) {
    case "dashboard":
      return <DashboardSection navigate={navigate} />;
    case "users":
      return <UsersSection navigate={navigate} />;
    default:
      return <ComingSoon section={section} navigate={navigate} />;
  }
}

export default function AdminPage() {
  return (
    <AdminShell userRole="superAdmin">
      {({ section, navigate }) => (
        <Suspense fallback={<SectionSkeleton />}>
          <SectionRouter section={section} navigate={navigate} />
        </Suspense>
      )}
    </AdminShell>
  );
}
