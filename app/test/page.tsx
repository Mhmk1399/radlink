// ─────────────────────────────────────────────────────────────────
// app/dashboard/users/page.tsx — فقط بخش‌های تغییر یافته
// ─────────────────────────────────────────────────────────────────
"use client";

import React from "react";
import {
  backgrounds,
  layout,
  typography,
  gradients,
  animation,
  borders,
  cn,
  focus,
  interactive,
} from "@/lib/design/design-system";
import DynamicTable from "@/components/global/DynamicTable";
import {
  FaUsers,
  FaCircleCheck,
  FaClock,
  FaCircleXmark,
  FaCircleInfo,
  FaPowerOff,
  FaLock,
  FaLockOpen,
  FaEnvelope,
  FaKey,
} from "react-icons/fa6";
import { toast } from "@/components/ui/CustomToast";
import { ColumnDef } from "@/types/table";
/* ══════════════════════════════════════════════
   تایپ کاربر
   ══════════════════════════════════════════════ */

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean; // ← اضافه شد
  department: string;
  phone: string;
  createdAt: string;
  [key: string]: unknown;
}

/* ══════════════════════════════════════════════
   داده‌های پیش‌فرض
   ══════════════════════════════════════════════ */

const DEFAULT_USERS: User[] = [
  {
    id: "1",
    name: "سارا جانسون",
    email: "sara@company.com",
    role: "مدیر",
    status: "فعال",
    isActive: true,
    department: "مهندسی",
    phone: "۰۹۱۲۱۲۳۴۵۶۷",
    createdAt: "۱۴۰۲/۱۰/۲۵",
  },
  {
    id: "2",
    name: "محمد احمدی",
    email: "mohammad@company.com",
    role: "ویرایشگر",
    status: "فعال",
    isActive: true,
    department: "طراحی",
    phone: "۰۹۱۲۲۳۴۵۶۷۸",
    createdAt: "۱۴۰۲/۱۱/۰۱",
  },
  {
    id: "3",
    name: "فاطمه رضایی",
    email: "fatemeh@company.com",
    role: "بازدیدکننده",
    status: "غیرفعال",
    isActive: false,
    department: "بازاریابی",
    phone: "۰۹۱۲۳۴۵۶۷۸۹",
    createdAt: "۱۴۰۲/۱۲/۱۵",
  },
  {
    id: "4",
    name: "علی حسینی",
    email: "ali@company.com",
    role: "مدیر",
    status: "فعال",
    isActive: true,
    department: "مهندسی",
    phone: "۰۹۱۲۴۵۶۷۸۹۰",
    createdAt: "۱۴۰۳/۰۱/۰۵",
  },
  {
    id: "5",
    name: "مریم کریمی",
    email: "maryam@company.com",
    role: "ویرایشگر",
    status: "فعال",
    isActive: true,
    department: "محتوا",
    phone: "۰۹۱۲۵۶۷۸۹۰۱",
    createdAt: "۱۴۰۳/۰۲/۱۸",
  },
  {
    id: "6",
    name: "حسین نوری",
    email: "hossein@company.com",
    role: "بازدیدکننده",
    status: "در انتظار",
    isActive: false,
    department: "فروش",
    phone: "۰۹۱۲۶۷۸۹۰۱۲",
    createdAt: "۱۴۰۳/۰۳/۲۲",
  },
  {
    id: "7",
    name: "زهرا محمدی",
    email: "zahra@company.com",
    role: "مدیر",
    status: "فعال",
    isActive: true,
    department: "منابع انسانی",
    phone: "۰۹۱۲۷۸۹۰۱۲۳",
    createdAt: "۱۴۰۳/۰۴/۰۱",
  },
  {
    id: "8",
    name: "رضا عباسی",
    email: "reza@company.com",
    role: "ویرایشگر",
    status: "فعال",
    isActive: true,
    department: "مهندسی",
    phone: "۰۹۱۲۸۹۰۱۲۳۴",
    createdAt: "۱۴۰۳/۰۴/۱۵",
  },
  {
    id: "9",
    name: "نگار شریفی",
    email: "negar@company.com",
    role: "بازدیدکننده",
    status: "غیرفعال",
    isActive: false,
    department: "مالی",
    phone: "۰۹۱۲۹۰۱۲۳۴۵",
    createdAt: "۱۴۰۳/۰۵/۰۳",
  },
  {
    id: "10",
    name: "امیر طاهری",
    email: "amir@company.com",
    role: "مدیر",
    status: "فعال",
    isActive: true,
    department: "مهندسی",
    phone: "۰۹۱۳۰۱۲۳۴۵۶",
    createdAt: "۱۴۰۳/۰۵/۲۰",
  },
  {
    id: "11",
    name: "نازنین پارسا",
    email: "nazanin@company.com",
    role: "ویرایشگر",
    status: "فعال",
    isActive: true,
    department: "طراحی",
    phone: "۰۹۱۳۱۲۳۴۵۶۷",
    createdAt: "۱۴۰۳/۰۶/۰۱",
  },
  {
    id: "12",
    name: "سعید موسوی",
    email: "saeed@company.com",
    role: "بازدیدکننده",
    status: "در انتظار",
    isActive: false,
    department: "پشتیبانی",
    phone: "۰۹۱۳۲۳۴۵۶۷۸",
    createdAt: "۱۴۰۳/۰۶/۱۵",
  },
];

/* ══════════════════════════════════════════════
   آیکون‌های سفارشی برای اکشن‌ها
   ══════════════════════════════════════════════ */

const CustomIcons = {
  Power: () => <FaPowerOff className="h-4 w-4" />,
  Lock: () => <FaLock className="h-4 w-4" />,
  Unlock: () => <FaLockOpen className="h-4 w-4" />,
  Mail: () => <FaEnvelope className="h-4 w-4" />,
  Key: () => <FaKey className="h-4 w-4" />,
};

/* ══════════════════════════════════════════════
   زیرکامپوننت‌های نشانک
   ══════════════════════════════════════════════ */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    فعال: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    غیرفعال: "bg-slate-500/15 text-slate-400 border-slate-500/20",
    "در انتظار": "bg-[#D4AF37]/15 text-[#F5D76E] border-[#D4AF37]/20",
  };
  const dotColors: Record<string, string> = {
    فعال: "bg-emerald-400",
    "در انتظار": "bg-[#F5D76E]",
    غیرفعال: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${colors[status] ?? colors["غیرفعال"]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotColors[status] ?? dotColors["غیرفعال"]}`}
      />
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    مدیر: "bg-[#D4AF37]/10 text-[#F5D76E] border-[#D4AF37]/20",
    ویرایشگر: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    بازدیدکننده: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${colors[role] ?? colors["بازدیدکننده"]}`}
    >
      {role}
    </span>
  );
}

/* ── آیکون فعال/غیرفعال ── */
function ActiveIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        active
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          active ? "bg-emerald-400" : "bg-red-400",
        )}
      />
      {active ? "آنلاین" : "آفلاین"}
    </span>
  );
}

/* ══════════════════════════════════════════════
   آیکون‌های آمار
   ══════════════════════════════════════════════ */

const StatIcons = {
  Users: () => <FaUsers className="h-5 w-5" />,
  Active: () => <FaCircleCheck className="h-5 w-5" />,
  Pending: () => <FaClock className="h-5 w-5" />,
  Inactive: () => <FaCircleXmark className="h-5 w-5" />,
  Info: () => <FaCircleInfo className="h-4 w-4" />,
};

function toPersianDigits(n: number | string): string {
  const p = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => p[parseInt(d)]);
}

/* ══════════════════════════════════════════════
   ستون‌ها — با isActive اضافه شده
   ══════════════════════════════════════════════ */

const userColumns: ColumnDef<User>[] = [
  {
    key: "id",
    label: "شناسه",
    isPrimary: true,
    editable: false,
    sortable: true,
    hideOnMobile: true,
    copyable: true,
  },
  {
    key: "name",
    label: "نام",
    sortable: true,
    required: true,
    placeholder: "نام و نام‌خانوادگی",
    editable: true,
    copyable: true,
  },
  {
    key: "email",
    label: "ایمیل",
    sortable: true,
    required: true,
    inputType: "email",
    placeholder: "user@example.com",
    copyable: true,
  },
  {
    key: "role",
    label: "نقش",
    sortable: true,
    required: true,
    filterable: true,
    options: [
      { label: "مدیر", value: "مدیر" },
      { label: "ویرایشگر", value: "ویرایشگر" },
      { label: "بازدیدکننده", value: "بازدیدکننده" },
    ],
    render: (value) => <RoleBadge role={String(value)} />,
    copyable: false,
  },
  {
    key: "status",
    label: "وضعیت",
    sortable: true,
    required: true,
    filterable: true,
    options: [
      { label: "فعال", value: "فعال" },
      { label: "غیرفعال", value: "غیرفعال" },
      { label: "در انتظار", value: "در انتظار" },
    ],
    render: (value) => <StatusBadge status={String(value)} />,
    copyable: false,
  },
  {
    key: "isActive",
    label: "وضعیت اتصال",
    sortable: true,
    filterable: true,
    editable: false, // از فرم ویرایش حذف — فقط با دکمه پاور
    hideOnMobile: true,
    render: (value) => <ActiveIndicator active={Boolean(value)} />,
    copyable: false,
  },
  {
    key: "department",
    label: "بخش",
    sortable: true,
    required: true,
    filterable: true,
    hideOnMobile: true,
    placeholder: "مثلاً مهندسی",
    copyable: true,
  },
  {
    key: "phone",
    label: "تلفن",
    inputType: "tel",
    hideOnMobile: true,
    placeholder: "۰۹۱۲۰۰۰۰۰۰۰",
    copyable: true,
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
];

/* ══════════════════════════════════════════════
   کارت آمار
   ══════════════════════════════════════════════ */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4",
        borders.subtle,
        backgrounds.surface.glass,
        "transition-all duration-300 hover:border-white/12 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          color,
        )}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border bg-white/4",
            borders.subtle,
            "text-slate-400 transition-colors duration-300 group-hover:text-[#F5D76E]",
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-white tabular-nums">
            {toPersianDigits(value)}
          </p>
          <p className="text-[11px] font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   هوک مدیریت دیتا
   ══════════════════════════════════════════════ */

function useLocalUsers(initialData: User[]) {
  const [users, setUsers] = React.useState<User[]>(initialData);

  const stats = React.useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === "فعال").length,
      pending: users.filter((u) => u.status === "در انتظار").length,
      inactive: users.filter((u) => u.status === "غیرفعال").length,
    }),
    [users],
  );

  const handleCreate = React.useCallback(async (item: Partial<User>) => {
    await new Promise((r) => setTimeout(r, 500));
    const newUser: User = {
      id: String(Date.now()),
      name: String(item.name ?? ""),
      email: String(item.email ?? ""),
      role: String(item.role ?? "بازدیدکننده"),
      status: String(item.status ?? "در انتظار"),
      isActive: false,
      department: String(item.department ?? ""),
      phone: String(item.phone ?? ""),
      createdAt: new Date().toLocaleDateString("fa-IR"),
    };
    setUsers((prev) => [newUser, ...prev]);
  }, []);

  const handleUpdate = React.useCallback(async (item: User) => {
    await new Promise((r) => setTimeout(r, 500));
    setUsers((prev) =>
      prev.map((u) => (u.id === item.id ? { ...u, ...item } : u)),
    );
  }, []);

  const handleDelete = React.useCallback(async (item: User) => {
    await new Promise((r) => setTimeout(r, 400));
    setUsers((prev) => prev.filter((u) => u.id !== item.id));
  }, []);

  // ── ⭐ Toggle Active/Inactive ──
  const handleToggleActive = React.useCallback(async (user: User) => {
    await new Promise((r) => setTimeout(r, 300));
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
    );
  }, []);

  // ── ⭐ ریست پسورد ──
  const handleResetPassword = React.useCallback(async (user: User) => {
    await new Promise((r) => setTimeout(r, 500));
    console.log(`🔑 Password reset for ${user.name}`);
    toast.info(`رمز عبور «${user.name}» ریست شد!`);
  }, []);

  // ── ⭐ ارسال ایمیل ──
  const handleSendEmail = React.useCallback(async (user: User) => {
    await new Promise((r) => setTimeout(r, 300));
    console.log(`📧 Email sent to ${user.email}`);
    toast.info(`ایمیل به «${user.email}» ارسال شد!`);
  }, []);

  return {
    users,
    stats,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    handleResetPassword,
    handleSendEmail,
  };
}

/* ══════════════════════════════════════════════
   صفحه اصلی
   ══════════════════════════════════════════════ */

export default function UsersPage() {
  const {
    users,
    stats,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleActive,
    handleResetPassword,
    handleSendEmail,
  } = useLocalUsers(DEFAULT_USERS);

  return (
    <div className={cn("min-h-screen", backgrounds.page)} dir="rtl">
      <style>{animation.keyframes}</style>

      <div className={cn(layout.container, layout.section)}>
        {/* ── سربرگ ── */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border",
                borders.medium,
                "bg-[#D4AF37]/8 text-[#F5D76E]",
              )}
            >
              <StatIcons.Users />
            </div>
            <h1 className={cn(typography.h2, gradients.textPrimary)}>
              مدیریت کاربران
            </h1>
          </div>
          <p className={cn(typography.body, "mr-13")}>
            اعضای تیم، نقش‌ها و سطوح دسترسی خود را مدیریت کنید.
          </p>
        </header>

        {/* ── آمار ── */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<StatIcons.Users />}
            label="کل کاربران"
            value={stats.total}
            color="bg-[#D4AF37]/20"
          />
          <StatCard
            icon={<StatIcons.Active />}
            label="فعال"
            value={stats.active}
            color="bg-emerald-500/20"
          />
          <StatCard
            icon={<StatIcons.Pending />}
            label="در انتظار"
            value={stats.pending}
            color="bg-amber-500/20"
          />
          <StatCard
            icon={<StatIcons.Inactive />}
            label="غیرفعال"
            value={stats.inactive}
            color="bg-red-500/20"
          />
        </div>

        {/* ═══════════════════════════════════════════
           ⭐ جدول با rowActions سفارشی
           ═══════════════════════════════════════════ */}
        <DynamicTable<User>
          endpoint=""
          data={users}
          enabled={false}
          columns={userColumns}
          title="لیست کاربران"
          subtitle={`${toPersianDigits(users.length)} عضو تیم`}
          primaryKey="id"
          pageSize={8}
          pageSizes={[5, 8, 15, 25]}
          searchDebounceMs={300}
          searchable
          stickyHeader
          showRowNumbers
          enableCellCopy
          doubleClickToEdit
          pullToRefresh
          canCreate
          canUpdate
          canDelete
          exportable
          exportFileName="کاربران"
          emptyMessage="کاربری یافت نشد!"
          onCreate={async (item) => await handleCreate(item)}
          onUpdate={async (item) => await handleUpdate(item)}
          onDelete={async (item) => await handleDelete(item)}
          // دکمه ها اینجا اضافه میشن
          rowActions={(row) => (
            <>
              {/* ── دکمه پاور (روشن/خاموش) ── */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // جلوگیری از double-click edit
                  handleToggleActive(row);
                }}
                title={row.isActive ? "غیرفعال کردن" : "فعال کردن"}
                aria-label={
                  row.isActive
                    ? `غیرفعال کردن ${row.name}`
                    : `فعال کردن ${row.name}`
                }
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                  "transition-all duration-200",
                  focus.ring,
                  interactive.touch,
                  row.isActive
                    ? "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                    : "text-slate-500 hover:bg-slate-500/10 hover:text-slate-300",
                )}
              >
                <CustomIcons.Power />
              </button>

              {/* ── دکمه ریست پسورد ── */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetPassword(row);
                }}
                title="ریست رمز عبور"
                aria-label={`ریست رمز عبور ${row.name}`}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                  "transition-all duration-200",
                  focus.ring,
                  interactive.touch,
                  "text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-400",
                )}
              >
                <CustomIcons.Key />
              </button>

              {/* ── دکمه ارسال ایمیل ── */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendEmail(row);
                }}
                title="ارسال ایمیل"
                aria-label={`ارسال ایمیل به ${row.name}`}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                  "transition-all duration-200",
                  focus.ring,
                  interactive.touch,
                  "text-blue-400/70 hover:bg-blue-500/10 hover:text-blue-400",
                )}
              >
                <CustomIcons.Mail />
              </button>
            </>
          )}
        />

        {/* ── راهنما ── */}
        <div
          className={cn(
            "mt-6 overflow-hidden rounded-2xl border p-4 sm:p-5",
            borders.subtle,
            backgrounds.surface.glass,
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/8 text-[#F5D76E]">
              <StatIcons.Info />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-2">
                راهنمای عملیات
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
                {[
                  [
                    "⚡ پاور",
                    "کلیک روی آیکون پاور وضعیت آنلاین/آفلاین کاربر را تغییر می‌دهد",
                  ],
                  [
                    "🔑 ریست رمز",
                    "رمز عبور کاربر را ریست می‌کند و ایمیل بازیابی ارسال می‌شود",
                  ],
                  ["📧 ایمیل", "ایمیل اطلاع‌رسانی به کاربر ارسال می‌شود"],
                  [
                    "✏️ ویرایش",
                    "دابل‌کلیک روی ردیف یا دکمه ویرایش برای تغییر اطلاعات",
                  ],
                  ["📋 کپی", "کلیک روی هر سلول مقدار آن را کپی می‌کند"],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    <span>
                      <strong className="text-slate-300">{title}:</strong>{" "}
                      {desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
