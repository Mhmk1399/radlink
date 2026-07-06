// ─────────────────────────────────────────────────────────────────
// app/admin/page.tsx  — نسخه نهایی
// ─────────────────────────────────────────────────────────────────
"use client";

import { Suspense, lazy } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { SECTION_META, type AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";

// ── Lazy Sections ──
const DashboardSection = lazy(
  () => import("@/components/admin/DashboardSection"),
);
const UsersSection = lazy(() => import("@/components/admin/UsersSection"));
const AgentsSection = lazy(() => import("@/components/admin/AgentsSection"));
const PermissionsSection = lazy(
  () => import("@/components/admin/PermissionsSection"),
);
const AccessesSection = lazy(() => import("@/components/admin/AccessesSection"));
const PagesSection = lazy(() => import("@/components/admin/PagesSection"));
const CategoriesSection = lazy(
  () => import("@/components/admin/CategoriesSection"),
);
const TemplatesSection = lazy(
  () => import("@/components/admin/TemplatesSection"),
);
const BlocksSection = lazy(() => import("@/components/admin/BlocksSection"));
const FilesSection = lazy(() => import("@/components/admin/FilesSection"));
const QRCodesSection = lazy(() => import("@/components/admin/QRCodesSection"));
const ProductsSection = lazy(
  () => import("@/components/admin/ProductsSection"),
);
const TicketsSection = lazy(() => import("@/components/admin/TicketsSection"));
const NotificationsSection = lazy(
  () => import("@/components/admin/NotificationsSection"),
);
const ProfileSection = lazy(() => import("@/components/admin/ProfileSection"));

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
        className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border ${t.cardBg} ${t.borderSubtle}`}
      >
        <span className="text-3xl">🚧</span>
      </div>
      <h2 className={`mb-2 text-xl font-bold ${t.textPrimary}`}>
        بخش «{label}» در حال ساخت
      </h2>
      <p className={`mb-6 text-sm ${t.textMuted}`}>به زودی اضافه می‌شود</p>
      <button
        onClick={() => navigate("dashboard")}
        className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${t.borderAccent} ${t.textAccent} ${t.hoverBg}`}
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
    case "agents":
      return <AgentsSection navigate={navigate} />;
    case "permissions":
      return <PermissionsSection navigate={navigate} />;
    case "accesses":
      return <AccessesSection navigate={navigate} />;
    case "pages":
      return <PagesSection navigate={navigate} />;
    case "categories":
      return <CategoriesSection navigate={navigate} />;
    case "templates":
      return <TemplatesSection navigate={navigate} />;
    case "blocks":
      return <BlocksSection navigate={navigate} />;
    case "files":
      return <FilesSection navigate={navigate} />;
    case "qrcodes":
      return <QRCodesSection navigate={navigate} />;
    case "products":
      return <ProductsSection navigate={navigate} />;
    case "tickets":
      return <TicketsSection navigate={navigate} />;
    case "notifications":
      return <NotificationsSection navigate={navigate} />;
    case "profile":
      return <ProfileSection navigate={navigate} />;
    default:
      return <ComingSoon section={section} navigate={navigate} />;
  }
}

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminShell>
        {({ section, navigate }) => (
          <Suspense fallback={null}>
            <SectionRouter section={section} navigate={navigate} />
          </Suspense>
        )}
      </AdminShell>
    </AdminAuthProvider>
  );
}
