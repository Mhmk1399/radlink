// ─────────────────────────────────────────────────────────────────
// app/dashboard/users/page.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  backgrounds,
  layout,
  typography,
  gradients,
  animation,
  borders,
  components,
  cn,
} from "@/lib/design/design-system";
import DynamicTable, { ColumnDef } from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import SelectDemoPage from "@/components/ui/TestSelect";

/* ══════════════════════════════════════════════
   تایپ کاربر
   ══════════════════════════════════════════════ */

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  phone: string;
  createdAt: string;
  [key: string]: unknown;
}

/* ══════════════════════════════════════════════
   API ساختگی — جایگزین با API واقعی خود شوید
   ══════════════════════════════════════════════ */

const FAKE_USERS: User[] = [
  {
    id: "1",
    name: "سارا جانسون",
    email: "sara@company.com",
    role: "مدیر",
    status: "فعال",
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
    department: "پشتیبانی",
    phone: "۰۹۱۳۲۳۴۵۶۷۸",
    createdAt: "۱۴۰۳/۰۶/۱۵",
  },
];

/* ── شبیه‌سازی تأخیر شبکه ── */
async function fakeDelay(ms = 600) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ── شبیه‌سازی خطای تصادفی ── */
function maybeThrow(chance = 0.15) {
  if (Math.random() < chance) {
    throw new Error("ارتباط با سرور قطع شد");
  }
}

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

/* ══════════════════════════════════════════════
   آیکون‌های آمار
   ══════════════════════════════════════════════ */

const StatIcons = {
  Users: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
    </svg>
  ),
  Active: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Pending: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Inactive: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/* ══════════════════════════════════════════════
   اعداد فارسی
   ══════════════════════════════════════════════ */

function toPersianDigits(n: number | string): string {
  const p = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (d) => p[parseInt(d)]);
}

/* ══════════════════════════════════════════════
   تعریف ستون‌ها
   ══════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────
// app/dashboard/users/page.tsx — فقط تغییرات مربوط به ستون‌ها
// ─────────────────────────────────────────────────────────────────

const userColumns: ColumnDef<User>[] = [
  {
    key: "id",
    label: "شناسه",
    isPrimary: true,
    editable: false,
    sortable: true,
    hideOnMobile: true,
  },
  {
    key: "name",
    label: "نام",
    sortable: true,
    required: true,
    placeholder: "نام و نام‌خانوادگی",
  },
  {
    key: "email",
    label: "ایمیل",
    sortable: true,
    required: true,
    inputType: "email",
    placeholder: "user@example.com",
  },
  {
    key: "role",
    label: "نقش",
    sortable: true,
    required: true,
    filterable: true, // ← فیلتر دراپ‌داون
    options: [
      { label: "مدیر", value: "مدیر" },
      { label: "ویرایشگر", value: "ویرایشگر" },
      { label: "بازدیدکننده", value: "بازدیدکننده" },
    ],
    render: (value) => <RoleBadge role={String(value)} />,
  },
  {
    key: "status",
    label: "وضعیت",
    sortable: true,
    required: true,
    filterable: true, // ← فیلتر دراپ‌داون
    options: [
      { label: "فعال", value: "فعال" },
      { label: "غیرفعال", value: "غیرفعال" },
      { label: "در انتظار", value: "در انتظار" },
    ],
    render: (value) => <StatusBadge status={String(value)} />,
  },
  {
    key: "department",
    label: "بخش",
    sortable: true,
    required: true,
    filterable: true, // ← فیلتر دراپ‌داون
    hideOnMobile: true,
    placeholder: "مثلاً مهندسی",
  },
  {
    key: "phone",
    label: "تلفن",
    inputType: "tel",
    hideOnMobile: true,
    placeholder: "۰۹۱۲۰۰۰۰۰۰۰",
  },
  {
    key: "createdAt",
    label: "تاریخ ایجاد",
    sortable: true,
    dateFilter: true, // ← فیلتر تاریخ شمسی ✨
    hideOnMobile: true,
    placeholder: "۱۴۰۳/۰۱/۰۱",
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
        "transition-all duration-300",
        "hover:border-white/12 hover:-translate-y-0.5",
        "hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)]",
      )}
    >
      {/* glow */}
      <div
        className={cn(
          "pointer-events-none absolute -left-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          color,
        )}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            "bg-white/[0.04]",
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
   صفحه اصلی مدیریت کاربران
   ══════════════════════════════════════════════ */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── آمار محاسبه‌شده ── */
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "فعال").length,
    pending: users.filter((u) => u.status === "در انتظار").length,
    inactive: users.filter((u) => u.status === "غیرفعال").length,
  };

  /* ──────────────────────────────────────────────
     GET: دریافت کاربران
     ────────────────────────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // ── API واقعی ──
      // const res = await fetch('/api/users');
      // if (!res.ok) throw new Error('خطا در دریافت');
      // const data = await res.json();
      // setUsers(data);

      await fakeDelay(800);
      setUsers(FAKE_USERS);
      toast.success("لیست کاربران با موفقیت بارگذاری شد.", {
        title: "بارگذاری موفق",
        duration: 3000,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "خطا در دریافت اطلاعات",
        {
          title: "خطای بارگذاری",
          action: {
            label: "تلاش مجدد",
            onClick: () => fetchUsers(),
          },
          duration: 8000,
        },
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ──────────────────────────────────────────────
     POST: ایجاد کاربر
     ────────────────────────────────────────────── */
  const handleCreate = useCallback(async (item: Partial<User>) => {
    const loadingId = toast.loading("در حال ایجاد کاربر جدید...", {
      title: "ایجاد کاربر",
    });

    try {
      // ── API واقعی ──
      // const res = await fetch('/api/users', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(item),
      // });
      // if (!res.ok) throw new Error('خطا در ایجاد');
      // const newUser = await res.json();

      await fakeDelay(1000);
      maybeThrow(0.1);

      const newUser: User = {
        id: String(Date.now()),
        name: String(item.name ?? ""),
        email: String(item.email ?? ""),
        role: String(item.role ?? "بازدیدکننده"),
        status: String(item.status ?? "در انتظار"),
        department: String(item.department ?? ""),
        phone: String(item.phone ?? ""),
        createdAt: "۱۴۰۳/۰۶/۲۰",
      };

      setUsers((prev) => [newUser, ...prev]);

      toast.update(loadingId, {
        type: "success",
        title: "کاربر ایجاد شد",
        message: `«${newUser.name}» با موفقیت به لیست اضافه شد.`,
        duration: 4000,
      });
    } catch (err) {
      toast.update(loadingId, {
        type: "error",
        title: "خطا در ایجاد",
        message: err instanceof Error ? err.message : "عملیات با خطا مواجه شد.",
        action: {
          label: "تلاش مجدد",
          onClick: () => handleCreate(item),
        },
        duration: 8000,
      });
      throw err; // re-throw so DynamicTable keeps modal open
    }
  }, []);

  /* ──────────────────────────────────────────────
     PATCH: ویرایش کاربر
     ────────────────────────────────────────────── */
  const handleUpdate = useCallback(async (item: User) => {
    const loadingId = toast.loading("در حال ذخیره تغییرات...", {
      title: "ویرایش کاربر",
    });

    try {
      // ── API واقعی ──
      // const res = await fetch(`/api/users/${item.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(item),
      // });
      // if (!res.ok) throw new Error('خطا در ویرایش');

      await fakeDelay(800);
      maybeThrow(0.1);

      setUsers((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, ...item } : u)),
      );

      toast.update(loadingId, {
        type: "success",
        title: "تغییرات ذخیره شد",
        message: `اطلاعات «${item.name}» با موفقیت به‌روزرسانی شد.`,
        duration: 4000,
      });
    } catch (err) {
      toast.update(loadingId, {
        type: "error",
        title: "خطا در ویرایش",
        message:
          err instanceof Error ? err.message : "ذخیره تغییرات با خطا مواجه شد.",
        action: {
          label: "تلاش مجدد",
          onClick: () => handleUpdate(item),
        },
        duration: 8000,
      });
      throw err;
    }
  }, []);

  /* ──────────────────────────────────────────────
     DELETE: حذف کاربر
     ────────────────────────────────────────────── */
  const handleDelete = useCallback(
    async (item: User) => {
      const loadingId = toast.loading(`در حال حذف «${item.name}»...`, {
        title: "حذف کاربر",
      });

      // برای Undo: ذخیره‌سازی state قبلی
      const previousUsers = [...users];

      try {
        // ── حذف خوشبینانه: فوری از UI حذف شود ──
        setUsers((prev) => prev.filter((u) => u.id !== item.id));

        // ── API واقعی ──
        // const res = await fetch(`/api/users/${item.id}`, { method: 'DELETE' });
        // if (!res.ok) throw new Error('خطا در حذف');

        await fakeDelay(700);
        maybeThrow(0.1);

        toast.update(loadingId, {
          type: "success",
          title: "کاربر حذف شد",
          message: `«${item.name}» از سیستم حذف شد.`,
          duration: 6000,
          action: {
            label: "بازگردانی",
            onClick: () => {
              // undo
              setUsers(previousUsers);
              toast.success(`«${item.name}» بازگردانی شد.`, {
                title: "بازگردانی موفق",
                duration: 3000,
              });
            },
          },
        });
      } catch (err) {
        // ── rollback ──
        setUsers(previousUsers);

        toast.update(loadingId, {
          type: "error",
          title: "خطا در حذف",
          message:
            err instanceof Error ? err.message : "حذف کاربر با خطا مواجه شد.",
          action: {
            label: "تلاش مجدد",
            onClick: () => handleDelete(item),
          },
          duration: 8000,
        });
        throw err;
      }
    },
    [users],
  );

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */

  return (
    <>
      {" "}
      <div className={cn("min-h-screen", backgrounds.page)} dir="rtl">
        <style>{animation.keyframes}</style>

        <div className={cn(layout.container, layout.section)}>
          {/* ── سربرگ صفحه ── */}
          <header className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border",
                      borders.medium,
                      "bg-[#D4AF37]/[0.08]",
                      "text-[#F5D76E]",
                    )}
                  >
                    <StatIcons.Users />
                  </div>
                  <div>
                    <h1 className={cn(typography.h2, gradients.textPrimary)}>
                      مدیریت کاربران
                    </h1>
                  </div>
                </div>
                <p className={cn(typography.body, "mr-13")}>
                  اعضای تیم، نقش‌ها و سطوح دسترسی خود را مدیریت کنید.
                </p>
              </div>

              {/* ── دکمه Refresh ── */}
              <button
                type="button"
                onClick={fetchUsers}
                disabled={loading}
                className={cn(
                  components.ghostButton,
                  "h-10 text-xs px-4 gap-2",
                  loading && "pointer-events-none opacity-50",
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={cn("h-4 w-4", loading && "animate-spin")}
                >
                  <path
                    fillRule="evenodd"
                    d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.312.312a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm-1.873-7.263A7 7 0 001.627 7.3a.75.75 0 101.45.388A5.5 5.5 0 0112.2 6.11l.312.311H10.08a.75.75 0 000 1.5h3.634a.75.75 0 00.75-.75V3.537a.75.75 0 00-1.5 0v2.033l-.312-.312a6.995 6.995 0 00-1.213-.097z"
                    clipRule="evenodd"
                  />
                </svg>
                بروزرسانی
              </button>
            </div>
          </header>

          {/* ── کارت‌های آمار ── */}
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

          {/* ── جدول داینامیک با CRUD کامل ── */}
          <DynamicTable<User>
            data={users}
            columns={userColumns}
            title="لیست کاربران"
            subtitle={`${toPersianDigits(users.length)} عضو تیم`}
            primaryKey="id"
            loading={loading}
            searchable
            pageSize={8}
            emptyMessage="کاربری یافت نشد. اولین عضو تیم خود را اضافه کنید!"
            exportable
            exportFileName="کاربران"
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />

          {/* ── راهنمای پایین صفحه ── */}
          <div
            className={cn(
              "mt-6 overflow-hidden rounded-2xl border p-4 sm:p-5",
              borders.subtle,
              backgrounds.surface.glass,
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/[0.08] text-[#F5D76E]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  راهنمای استفاده
                </h4>
                <ul className="space-y-1 text-xs text-slate-400 leading-relaxed">
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#D4AF37]/50" />
                    برای جستجو از فیلد بالای جدول استفاده کنید
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#D4AF37]/50" />
                    با فیلترها می‌توانید بر اساس نقش، وضعیت و بخش فیلتر کنید
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#D4AF37]/50" />
                    ردیف‌ها را انتخاب کنید و خروجی اکسل، CSV یا PNG بگیرید
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#D4AF37]/50" />
                    پس از حذف، با دکمه «بازگردانی» می‌توانید عملیات را برگردانید
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
