// ─────────────────────────────────────────────────────────────────
// components/sections/UsersSection.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { gradients } from "@/lib/design/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserSlash,
  FaArrowRight,
  FaPowerOff,
} from "react-icons/fa6";
import { ColumnDef } from "@/types/table";
import DynamicTable from "../global/DynamicTable";
import { toast } from "../ui/CustomToast";

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

function todayFaDate() {
  return new Date().toLocaleDateString("fa-IR");
}

/* ══════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════ */

type UserRole = "user" | "agent" | "admin" | "superAdmin";
type UserStatus = "active" | "inactive" | "blocked" | "pending";

interface UserRow {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  createdAt: string;
  isPhoneVerified: boolean;
  lastLoginAt?: string;
  notes?: string;
  [key: string]: unknown;
}

/* ══════════════════════════════════════════════
   FAKE DATA
   ══════════════════════════════════════════════ */

const INITIAL_USERS: UserRow[] = [
  {
    id: "1",
    name: "سارا جانسون",
    phoneNumber: "09121234567",
    email: "sara@company.com",
    role: "admin",
    status: "active",
    department: "فنی",
    createdAt: "۱۴۰۳/۰۶/۱۲",
    isPhoneVerified: true,
    lastLoginAt: "۱۴۰۳/۰۷/۱۰",
    notes: "مدیر ارشد سیستم",
  },
  {
    id: "2",
    name: "محمد احمدی",
    phoneNumber: "09123334455",
    email: "m.ahmadi@company.com",
    role: "agent",
    status: "active",
    department: "فروش",
    createdAt: "۱۴۰۳/۰۵/۲۱",
    isPhoneVerified: true,
    lastLoginAt: "۱۴۰۳/۰۷/۱۱",
    notes: "نماینده فعال تهران",
  },
  {
    id: "3",
    name: "فاطمه رضایی",
    phoneNumber: "09125556677",
    email: "fatemeh@company.com",
    role: "user",
    status: "pending",
    department: "مشتریان",
    createdAt: "۱۴۰۳/۰۷/۰۱",
    isPhoneVerified: false,
    lastLoginAt: "—",
    notes: "در انتظار تأیید",
  },
  {
    id: "4",
    name: "علی حسینی",
    phoneNumber: "09124445566",
    email: "ali@company.com",
    role: "superAdmin",
    status: "active",
    department: "مدیریت",
    createdAt: "۱۴۰۳/۰۴/۱۸",
    isPhoneVerified: true,
    lastLoginAt: "۱۴۰۳/۰۷/۱۱",
    notes: "سوپر ادمین سیستم",
  },
  {
    id: "5",
    name: "نگار شریفی",
    phoneNumber: "09127778899",
    email: "negar@company.com",
    role: "user",
    status: "inactive",
    department: "پشتیبانی",
    createdAt: "۱۴۰۳/۰۳/۲۸",
    isPhoneVerified: true,
    lastLoginAt: "۱۴۰۳/۰۶/۳۰",
    notes: "کاربر غیرفعال",
  },
  {
    id: "6",
    name: "رضا مرادی",
    phoneNumber: "09120001122",
    email: "reza@company.com",
    role: "agent",
    status: "blocked",
    department: "نمایندگان",
    createdAt: "۱۴۰۳/۰۲/۱۰",
    isPhoneVerified: false,
    lastLoginAt: "۱۴۰۳/۰۶/۰۹",
    notes: "نیاز به بررسی مجدد",
  },
  {
    id: "7",
    name: "زهرا کریمی",
    phoneNumber: "09129998877",
    email: "zahra@company.com",
    role: "user",
    status: "active",
    department: "محتوا",
    createdAt: "۱۴۰۳/۰۶/۲۲",
    isPhoneVerified: true,
    lastLoginAt: "۱۴۰۳/۰۷/۰۹",
    notes: "کاربر بخش محتوا",
  },
  {
    id: "8",
    name: "امیر نادری",
    phoneNumber: "09126667788",
    email: "amir@company.com",
    role: "admin",
    status: "active",
    department: "عملیات",
    createdAt: "۱۴۰۳/۰۵/۰۷",
    isPhoneVerified: true,
    lastLoginAt: "۱۴۰۳/۰۷/۱۱",
    notes: "ادمین عملیاتی",
  },
];

/* ══════════════════════════════════════════════
   UI PARTS
   ══════════════════════════════════════════════ */

function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, { label: string; className: string }> = {
    user: {
      label: "کاربر",
      className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    },
    agent: {
      label: "نماینده",
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    admin: {
      label: "مدیر",
      className: "bg-[#D4AF37]/10 text-[#F5D76E] border-[#D4AF37]/20",
    },
    superAdmin: {
      label: "سوپر ادمین",
      className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        map[role].className,
      )}
    >
      {map[role].label}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const map: Record<
    UserStatus,
    { label: string; className: string; dot: string }
  > = {
    active: {
      label: "فعال",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    inactive: {
      label: "غیرفعال",
      className: "bg-slate-500/15 text-slate-400 border-slate-500/20",
      dot: "bg-slate-400",
    },
    blocked: {
      label: "مسدود",
      className: "bg-red-500/15 text-red-400 border-red-500/20",
      dot: "bg-red-400",
    },
    pending: {
      label: "در انتظار",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        map[status].className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", map[status].dot)} />
      {map[status].label}
    </span>
  );
}

function VerifyBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        verified
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-slate-500/10 text-slate-400",
      )}
    >
      {verified ? "تأیید شده" : "تأیید نشده"}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  className: string;
}) {
  const t = useThemeTokens();

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        t.cardBg,
        "border",
        t.borderSubtle,
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            className,
          )}
        >
          {icon}
        </div>
        <div>
          <p className={cn("text-xl font-bold", t.textPrimary)}>
            {toPersianDigits(value)}
          </p>
          <p className={cn("text-[11px]", t.textMuted)}>{label}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════ */

export default function UsersSection({
  navigate,
}: {
  navigate: (s: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();

  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);

  /* ──────────────────────────────────────────
     STATS
     ────────────────────────────────────────── */
  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      pending: users.filter((u) => u.status === "pending").length,
      blocked: users.filter((u) => u.status === "blocked").length,
    }),
    [users],
  );

  /* ──────────────────────────────────────────
     CRUD
     ────────────────────────────────────────── */
  const handleCreate = useCallback(async (item: Partial<UserRow>) => {
    const newUser: UserRow = {
      id: String(Date.now()),
      name: String(item.name ?? ""),
      phoneNumber: String(item.phoneNumber ?? ""),
      email: String(item.email ?? ""),
      role: (item.role as UserRole) ?? "user",
      status: (item.status as UserStatus) ?? "pending",
      department: String(item.department ?? ""),
      createdAt: todayFaDate(),
      isPhoneVerified: Boolean(item.isPhoneVerified ?? false),
      lastLoginAt: "—",
      notes: String(item.notes ?? ""),
    };

    await new Promise((r) => setTimeout(r, 300));
    setUsers((prev) => [newUser, ...prev]);
  }, []);

  const handleUpdate = useCallback(async (item: UserRow) => {
    await new Promise((r) => setTimeout(r, 300));
    setUsers((prev) =>
      prev.map((u) => (u.id === item.id ? { ...u, ...item } : u)),
    );
  }, []);

  const handleDelete = useCallback(async (item: UserRow) => {
    await new Promise((r) => setTimeout(r, 300));
    setUsers((prev) => prev.filter((u) => u.id !== item.id));
  }, []);

  const toggleUserStatus = useCallback(async (user: UserRow) => {
    await new Promise((r) => setTimeout(r, 200));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              status: u.status === "active" ? "inactive" : "active",
            }
          : u,
      ),
    );
  }, []);

  /* ──────────────────────────────────────────
     COLUMNS
     ────────────────────────────────────────── */
  const columns: ColumnDef<UserRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام",
        sortable: true,
        required: true,
        placeholder: "نام کامل",
        copyable: true,
      },
      {
        key: "phoneNumber",
        label: "شماره موبایل",
        sortable: true,
        required: true,
        inputType: "tel",
        placeholder: "09120000000",
        copyable: true,
      },
      {
        key: "email",
        label: "ایمیل",
        sortable: true,
        inputType: "email",
        placeholder: "user@example.com",
        copyable: true,
        hideOnMobile: true,
      },
      {
        key: "role",
        label: "نقش",
        sortable: true,
        required: true,
        filterable: true,
        options: [
          { label: "کاربر", value: "user" },
          { label: "نماینده", value: "agent" },
          { label: "مدیر", value: "admin" },
          { label: "سوپر ادمین", value: "superAdmin" },
        ],
        render: (value) => <RoleBadge role={value as UserRole} />,
        copyable: false,
      },
      {
        key: "status",
        label: "وضعیت",
        sortable: true,
        required: true,
        filterable: true,
        options: [
          { label: "فعال", value: "active" },
          { label: "غیرفعال", value: "inactive" },
          { label: "مسدود", value: "blocked" },
          { label: "در انتظار", value: "pending" },
        ],
        render: (value) => <StatusBadge status={value as UserStatus} />,
        copyable: false,
      },
      {
        key: "department",
        label: "بخش",
        sortable: true,
        filterable: true,
        required: true,
        placeholder: "مثلاً فنی",
        hideOnMobile: true,
        copyable: true,
      },
      {
        key: "isPhoneVerified",
        label: "تأیید موبایل",
        inputType: "checkbox",
        render: (value) => <VerifyBadge verified={Boolean(value)} />,
        copyable: false,
        hideOnMobile: true,
      },
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        sortable: true,
        dateFilter: true,
        editable: false,
        hideOnMobile: true,
        copyable: true,
      },
      {
        key: "notes",
        label: "یادداشت",
        inputType: "textarea",
        placeholder: "یادداشت داخلی",
        hideOnMobile: true,
        copyable: true,
      },
    ],
    [],
  );

  return (
    <div dir="rtl" className="space-y-6">
      {/* ──────────────────────────────────────
         SECTION HEADER
         ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border",
                isDark
                  ? "bg-[#D4AF37]/8 border-[#D4AF37]/15 text-[#F5D76E]"
                  : "bg-[#D4AF37]/6 border-[#D4AF37]/12 text-[#B8860B]",
              )}
            >
              <FaUsers className="h-5 w-5" />
            </div>
            <h1
              className={cn(
                "text-2xl font-extrabold",
                isDark ? gradients.textPrimary : "text-[#1A1304]",
              )}
            >
              مدیریت کاربران
            </h1>
          </div>
          <p className={cn("text-sm", t.textMuted)}>
            مدیریت اعضا، نقش‌ها و سطوح دسترسی
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
            "border",
            t.borderSubtle,
            t.cardBg,
            t.hoverBg,
            t.textSecondary,
          )}
        >
          <FaArrowRight className="h-3.5 w-3.5" />
          بازگشت به داشبورد
        </button>
      </div>

      {/* ──────────────────────────────────────
         STATS
         ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<FaUsers className="h-4 w-4" />}
          label="کل کاربران"
          value={stats.total}
          className={cn(
            "bg-white/4",
            isDark
              ? "border-[#D4AF37]/15 text-[#F5D76E]"
              : "border-[#D4AF37]/12 text-[#B8860B]",
          )}
        />
        <StatCard
          icon={<FaUserCheck className="h-4 w-4" />}
          label="فعال"
          value={stats.active}
          className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={<FaUserClock className="h-4 w-4" />}
          label="در انتظار"
          value={stats.pending}
          className="bg-amber-500/10 border-amber-500/20 text-amber-400"
        />
        <StatCard
          icon={<FaUserSlash className="h-4 w-4" />}
          label="مسدود"
          value={stats.blocked}
          className="bg-red-500/10 border-red-500/20 text-red-400"
        />
      </div>

      {/* ──────────────────────────────────────
         TABLE
         ────────────────────────────────────── */}
      <DynamicTable<UserRow>
        endpoint=""
        data={users}
        enabled={false}
        columns={columns}
        title="لیست کاربران"
        subtitle={`${toPersianDigits(users.length)} کاربر ثبت شده`}
        primaryKey="id"
        pageSize={8}
        pageSizes={[5, 8, 10, 20]}
        searchable
        searchDebounceMs={300}
        exportable
        exportFileName="users"
        stickyHeader
        showRowNumbers
        doubleClickToEdit
        enableCellCopy
        pullToRefresh={false}
        canCreate
        canUpdate
        canDelete
        emptyMessage="کاربری یافت نشد"
        onCreate={async (item) => {
          await handleCreate(item);
        }}
        onUpdate={async (item) => {
          await handleUpdate(item);
          toast.success("تغییر اعمال شد");
        }}
        onDelete={async (item) => {
          await handleDelete(item);
          toast.success("حذف اعمال شد");
        }}
        rowActions={(row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleUserStatus(row);
            }}
            title={row.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
            aria-label={
              row.status === "active"
                ? `غیرفعال کردن ${row.name}`
                : `فعال کردن ${row.name}`
            }
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
              row.status === "active"
                ? "text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-400"
                : "text-slate-500 hover:bg-slate-500/10 hover:text-slate-300",
            )}
          >
            <FaPowerOff className="h-3.5 w-3.5" />
          </button>
        )}
      />
    </div>
  );
}
