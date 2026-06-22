// ─────────────────────────────────────────────────────────────────
// components/sections/UsersSection.tsx
// ─────────────────────────────────────────────────────────────────
"use client";

import  { useMemo } from "react";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { gradients } from "@/lib/design/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FaUsers,
  FaArrowRight,
  FaPowerOff,
} from "react-icons/fa6";
import type { ColumnDef } from "@/types/table";
import DynamicTable from "../global/DynamicTable";
import type {   UserRole, UserStatus } from "@/types/index";
import { toast } from "@/components/ui/CustomToast";

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

function formatFaDate(value?: string | Date) {
  if (!value) return "—";
  try {
    return new Date(String(value)).toLocaleDateString("fa-IR");
  } catch {
    return String(value);
  }
}

function formatUserRef(value: unknown) {
  if (!value) return undefined;
  if (typeof value !== "object") return String(value);

  const record = value as Record<string, unknown>;
  const fullName = [record.firstName, record.lastName]
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    (typeof record.phoneNumber === "string" ? record.phoneNumber : "") ||
    String(record._id ?? record.id ?? "")
  );
}

/* ══════════════════════════════════════════════
   TYPES  (aligned with Mongoose IUser)
   ══════════════════════════════════════════════ */

type UserRow = {
  _id: string;
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  nationalCode?: string;
  fatherName?: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[]; // populated or raw ObjectId strings
  limits: {
    files: number;
    blocks: number;
    pages: number;
    landingPages: number;
  };
  lastLoginAt?: string;
  lastOtpRequestAt?: string;
  phoneVerifiedAt?: string;
  isPhoneVerified: boolean;
  isDeleted: boolean;
  agentid?: string; // matches model field name (lowercase)
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
};

/* ══════════════════════════════════════════════
   BADGE COMPONENTS
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

  const entry = map[role] ?? map.user;

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        entry.className,
      )}
    >
      {entry.label}
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

  const entry = map[status] ?? map.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        entry.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", entry.dot)} />
      {entry.label}
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

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function UsersSection({
  navigate,
}: {
  navigate: (s: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const canUpdateUsers = can("admin.users", "update");

  /* ── Auth header ─────────────────────────── */
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  /* ── Transform API response → UserRow[] ── */
  const transformResponse = useMemo(
    () =>
      (json: unknown): UserRow[] => {
        // Support both { users: [...] } and plain [...]
        const raw =
          typeof json === "object" &&
          json !== null &&
          "users" in json &&
          Array.isArray((json as any).users)
            ? (json as any).users
            : Array.isArray(json)
              ? json
              : [];

        return raw.map((u: any) => {
          const userId = String(u._id ?? u.id ?? "");

          return {
            ...u,
            _id: userId,
            id: userId,
            // Build virtual fullName if not present
            fullName:
              u.fullName ||
              [u.firstName, u.lastName].filter(Boolean).join(" ") ||
              "",
            // Normalise agentid (model uses lowercase)
            agentid: u.agentid
              ? typeof u.agentid === "object"
                ? String(u.agentid._id ?? u.agentid.id ?? u.agentid)
                : String(u.agentid)
              : undefined,
            // Normalise permissions (populated docs or raw ObjectId strings)
            permissions: Array.isArray(u.permissions)
              ? u.permissions.map((p: any) =>
                  typeof p === "object"
                    ? String(p.name ?? p._id ?? p.id ?? p)
                    : String(p),
                )
              : [],
            // Ensure limits always exists
            limits: {
              files: u.limits?.files ?? 0,
              blocks: u.limits?.blocks ?? 0,
              pages: u.limits?.pages ?? 0,
              landingPages: u.limits?.landingPages ?? 0,
            },
            // Normalise createdBy / updatedBy
            createdBy: formatUserRef(u.createdBy),
            updatedBy: formatUserRef(u.updatedBy),
          } as UserRow;
        });
      },
    [],
  );

  /* ── Column definitions ────────────────── */
  const columns: ColumnDef<UserRow>[] = useMemo(
    () => [
      {
        key: "fullName",
        label: "نام و نام خانوادگی",
        sortable: true,
        placeholder: "نام کامل",
        copyable: true,
        render: (value, row) => (
          <span className="font-semibold">
            {String(
              value ||
                `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() ||
                "—",
            )}
          </span>
        ),
      },
      {
        key: "phoneNumber",
        label: "شماره موبایل",
        sortable: true,
        required: true,
        inputType: "tel",
        placeholder: "09120000000",
        copyable: true,
        render: (value) => (
          <span className="font-mono text-sm tracking-wide">
            {String(value ?? "—")}
          </span>
        ),
      },
      {
        key: "email",
        label: "ایمیل",
        sortable: true,
        inputType: "email",
        placeholder: "user@example.com",
        copyable: true,
        hideOnMobile: true,
        render: (value) => (
          <span className="text-sm text-slate-400">
            {String(value ?? "—")}
          </span>
        ),
      },
      {
        key: "nationalCode",
        label: "کد ملی",
        sortable: true,
        placeholder: "کد ملی",
        copyable: true,
        hideOnMobile: true,
      },
      {
        key: "fatherName",
        label: "نام پدر",
        sortable: true,
        placeholder: "نام پدر",
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
        key: "agentid",
        label: "نماینده",
        sortable: true,
        placeholder: "شناسه نماینده",
        copyable: true,
        hideOnMobile: true,
        render: (value) => (
          <span className="text-sm text-slate-400">
            {String(value ?? "—")}
          </span>
        ),
      },
      {
        key: "permissions",
        label: "دسترسی‌ها",
        editable: false,
        render: (value) => {
          const perms = value as string[];
          if (!perms?.length) return "—";
          return (
            <span className="text-sm text-slate-400">
              {perms.length > 3
                ? `${perms.slice(0, 3).join("، ")} و ${perms.length - 3} مورد دیگر`
                : perms.join("، ")}
            </span>
          );
        },
        hideOnMobile: true,
        copyable: false,
      },
      {
        key: "limits",
        label: "محدودیت‌ها",
        render: (value) => {
          const l = value as UserRow["limits"];
          if (!l) return "—";
          return (
            <span className="text-xs text-slate-500">
              فایل: {l.files} · بلوک: {l.blocks} · صفحه: {l.pages} · لندینگ:{" "}
              {l.landingPages}
            </span>
          );
        },
        hideOnMobile: true,
        copyable: false,
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
        key: "lastLoginAt",
        label: "آخرین ورود",
        sortable: true,
        dateFilter: true,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "lastOtpRequestAt" as any,
        label: "آخرین درخواست OTP",
        sortable: true,
        dateFilter: true,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "phoneVerifiedAt",
        label: "تاریخ تأیید موبایل",
        sortable: true,
        dateFilter: true,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "isDeleted",
        label: "حذف شده",
        render: (value) => (
          <span
            className={cn(
              "text-[11px] font-medium",
              value ? "text-red-400" : "text-slate-500",
            )}
          >
            {value ? "بله" : "خیر"}
          </span>
        ),
        hideOnMobile: true,
      },
      {
        key: "createdBy",
        label: "ایجاد شده توسط",
        hideOnMobile: true,
        copyable: true,
        render: (value) => (
          <span className="text-sm text-slate-400">
            {String(value ?? "—")}
          </span>
        ),
      },
      {
        key: "updatedBy",
        label: "به‌روزرسانی توسط",
        hideOnMobile: true,
        copyable: true,
        render: (value) => (
          <span className="text-sm text-slate-400">
            {String(value ?? "—")}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        sortable: true,
        dateFilter: true,
        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "updatedAt",
        label: "آخرین بروزرسانی",
        sortable: true,
        dateFilter: true,
        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
    ],
    [],
  );

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */
  return (
    <div dir="rtl" className="space-y-6">
      {/* ── Header ─────────────────────────── */}
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
            `border ${t.borderAccent}`,
            t.textAccent,
            t.hoverBg,
          )}
        >
          <FaArrowRight className="h-3.5 w-3.5" />
          بازگشت به داشبورد
        </button>
      </div>

      {/* ── Table ──────────────────────────── */}
      <DynamicTable<UserRow>
        endpoint="/api/users"
        updateMethod="PATCH"
        onUpdate={async (item, builtInUpdate) => {
          await builtInUpdate(item);
          toast.success("اطلاعات کاربر ویرایش شد");
        }}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("کاربر حذف شد");
        }}
        onCreate={async (item, builtInCreate) => {
          await builtInCreate(item);
          toast.success("کاربر جدید ایجاد شد");
        }}
        columns={columns}
        title="لیست کاربران"
        subtitle="مشاهده، جستجو و مرور تمامی کاربران"
        primaryKey="_id"
        headers={headers}
        pageSize={8}
        pageSizes={[5, 8, 10, 20]}
        searchable
        searchDebounceMs={300}
        exportable
        exportFileName="users"
        stickyHeader
        showRowNumbers
        enableCellCopy
        transformResponse={transformResponse}
        rowActions={(row) => {
          const isActive = row.status === "active";
          if (!canUpdateUsers) return null;

          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Wire to: PATCH /api/users/:id  { status: "active" | "inactive" }
                  toast.success(
                    isActive ? "کاربر غیرفعال شد" : "کاربر فعال شد",
                  );
                }}
                title={isActive ? "غیرفعال کردن" : "فعال کردن"}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg transition",
                  isActive
                    ? "text-emerald-500 hover:bg-emerald-500/10"
                    : "text-slate-400 hover:bg-slate-500/10",
                )}
              >
                <FaPowerOff className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        }}
        emptyMessage="کاربری یافت نشد"
      />
    </div>
  );
}
