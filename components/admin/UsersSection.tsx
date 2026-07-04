// ─────────────────────────────────────────────────────────────────
// components/sections/UsersSection.tsx
// ─────────────────────────────────────────────────────────────────
"use client";
import { useEffect, useMemo, useState } from "react";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { gradients } from "@/lib/design/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { FaUsers, FaArrowRight, FaPowerOff } from "react-icons/fa6";
import type { ColumnDef } from "@/types/table";
import DynamicTable from "../global/DynamicTable";
import { superAdminBadgeClass } from "@/lib/userRole";
import type { UserRole, UserStatus } from "@/types/index";
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
  };
  lastLoginAt?: string;
  lastOtpRequestAt?: string;
  phoneVerifiedAt?: string;
  isPhoneVerified: boolean;
  isDeleted: boolean;
  agentid?: string; // matches model field name (lowercase)
  agentLabel?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  "limits.files"?: number;
  "limits.blocks"?: number;
  "limits.pages"?: number;
};

type SelectOption = {
  value: string;
  label: string;
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
      label: "R A D",
      className: superAdminBadgeClass,
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
  };

  const entry = map[status] ?? map.inactive;

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

function getObjectId(value: unknown) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  const id = record._id ?? record.id;
  return typeof id === "string" ? id : "";
}

function getPersonLabel(value: unknown, fallback = "") {
  if (!value || typeof value !== "object") return fallback;
  const record = value as Record<string, unknown>;
  const fullName = [record.firstName, record.lastName]
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    (typeof record.phoneNumber === "string" ? record.phoneNumber : "") ||
    (typeof record.email === "string" ? record.email : "") ||
    getObjectId(record) ||
    fallback
  );
}

function getAgentOptionLabel(agent: Record<string, unknown>, fallback: string) {
  const userLabel = getPersonLabel(agent.user, fallback);
  const type = agent.type === "company" ? "حقوقی" : "حقیقی";
  const companyName =
    typeof agent.companyName === "string" && agent.companyName.trim()
      ? ` - ${agent.companyName.trim()}`
      : "";

  return `${userLabel} (${type})${companyName}`;
}

function buildUserPayload(item: Partial<UserRow> & Record<string, unknown>) {
  const payload: Partial<UserRow> & Record<string, unknown> = {
    ...item,
    firstName:
      typeof item.firstName === "string" ? item.firstName.trim() : undefined,
    lastName:
      typeof item.lastName === "string" ? item.lastName.trim() : undefined,
    limits: {
      files: Math.max(0, Number(item["limits.files"]) || 0),
      blocks: Math.max(0, Number(item["limits.blocks"]) || 0),
      pages: Math.max(0, Number(item["limits.pages"]) || 0),
    },
  };

  delete payload.fullName;
  delete payload["limits.files"];
  delete payload["limits.blocks"];
  delete payload["limits.pages"];
  delete payload.permissions;

  payload.agentid =
    typeof item.agentid === "string" && item.agentid.trim()
      ? item.agentid.trim()
      : "";

  return payload;
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
  const { can, user: authUser } = useAccess();
  const canUpdateUsers = can("admin.users", "update");
  const isNormalUser = authUser?.role === "user";
  const canCreateUsers = !isNormalUser && can("admin.users", "create");
  const canDeleteUsers = !isNormalUser && can("admin.users", "delete");

  /* ── Auth header ─────────────────────────── */
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );
  const [agentOptions, setAgentOptions] = useState<SelectOption[]>([]);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  async function toggleUserStatus(row: UserRow) {
    if (!row._id || togglingStatusId) return;

    try {
      setTogglingStatusId(row._id);
      const nextStatus: UserStatus =
        row.status === "active" ? "inactive" : "active";
      const response = await fetch(`/api/users/${row._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof json?.message === "string"
            ? json.message
            : "تغییر وضعیت کاربر انجام نشد.",
        );
      }

      toast.success(
        nextStatus === "active"
          ? "کاربر فعال شد."
          : "کاربر غیرفعال شد.",
      );
      setRefreshToken((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تغییر وضعیت کاربر انجام نشد.",
      );
    } finally {
      setTogglingStatusId(null);
    }
  }

  useEffect(() => {
    if (
      !token ||
      (authUser?.role !== "admin" && authUser?.role !== "superAdmin")
    ) {
      setAgentOptions([]);
      return;
    }

    let ignore = false;

    async function loadAgentOptions() {
      try {
        const response = await fetch("/api/agents?limit=100", { headers });
        const json = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            typeof json?.message === "string"
              ? json.message
              : "دریافت لیست نمایندگان با خطا مواجه شد.",
          );
        }

        const agents = Array.isArray(json?.agents) ? json.agents : [];
        const options = agents
          .map((agent: unknown) => {
            if (!agent || typeof agent !== "object") return null;
            const record = agent as Record<string, unknown>;
            const value = getObjectId(record);
            if (!value) return null;
            return {
              value,
              label: getAgentOptionLabel(record, value.slice(-8)),
            };
          })
          .filter((option: SelectOption | null): option is SelectOption =>
            Boolean(option?.value),
          );

        if (!ignore) setAgentOptions(options);
      } catch (error) {
        if (!ignore) {
          setAgentOptions([]);
          toast.error(
            error instanceof Error
              ? error.message
              : "دریافت لیست نمایندگان با خطا مواجه شد.",
          );
        }
      }
    }

    void loadAgentOptions();

    return () => {
      ignore = true;
    };
  }, [authUser?.role, headers, token]);

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
          const agentId = getObjectId(u.agentid);
          const agentLabel =
            u.agentid && typeof u.agentid === "object"
              ? getAgentOptionLabel(
                  u.agentid as Record<string, unknown>,
                  agentId,
                )
              : "";

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
            agentid: agentId || undefined,
            agentLabel,
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
            },
            "limits.files": u.limits?.files ?? 0,
            "limits.blocks": u.limits?.blocks ?? 0,
            "limits.pages": u.limits?.pages ?? 0,
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
        key: "firstName",
        label: "نام",
        sortable: true,
        required: true,
        placeholder: "نام",
        copyable: true,
        render: (value) => (
          <span className="font-semibold">{String(value ?? "—")}</span>
        ),
      },
      {
        key: "lastName",
        label: "نام خانوادگی",
        sortable: true,
        required: true,
        placeholder: "نام خانوادگی",
        copyable: true,
        render: (value) => (
          <span className="font-semibold">{String(value ?? "—")}</span>
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
          <span className="text-sm text-slate-400">{String(value ?? "—")}</span>
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
          { label: "R A D", value: "superAdmin" },
        ],
        render: (value) => <RoleBadge role={value as UserRole} />,
        copyable: false,
        hiddenInForm: () =>
          authUser?.role === "agent" || authUser?.role === "user",
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
        ],
        render: (value) => <StatusBadge status={value as UserStatus} />,
        copyable: false,
        hiddenInForm: () => authUser?.role === "user",
      },
      {
        key: "agentid",
        label: "نماینده این کاربر",
        sortable: true,
        options: agentOptions,
        copyable: true,
        hideOnMobile: true,
        placeholder: "انتخاب نماینده یا بدون نماینده",
        hiddenInForm: () =>
          authUser?.role === "agent" || authUser?.role === "user",
        render: (value, row) => (
          <span className="text-sm text-slate-400">
            {row.agentLabel ||
              agentOptions.find((option) => option.value === value)?.label ||
              String(value || "—")}
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
        key: "limits.files",
        label: "محدودیت فایل",
        inputType: "number",
        visible: false,
        placeholder: "0",
        hiddenInForm: () =>
          authUser?.role === "agent" || authUser?.role === "user",
      },
      {
        key: "limits.blocks",
        label: "محدودیت بلاک",
        inputType: "number",
        visible: false,
        placeholder: "0",
        hiddenInForm: () =>
          authUser?.role === "agent" || authUser?.role === "user",
      },
      {
        key: "limits.pages",
        label: "محدودیت صفحه",
        inputType: "number",
        visible: false,
        placeholder: "0",
        hiddenInForm: () =>
          authUser?.role === "agent" || authUser?.role === "user",
      },
      {
        key: "limits",
        label: "محدودیت‌ها",
        editable: false,
        render: (value) => {
          const l = value as UserRow["limits"];
          if (!l) return "—";
          const showLimit = (value: number) =>
            value > 0 ? String(value) : "نامحدود";
          return (
            <span className="text-xs text-slate-500">
              فایل: {showLimit(l.files)} · بلوک: {showLimit(l.blocks)} · صفحه:{" "}
              {showLimit(l.pages)}
            </span>
          );
        },
        hideOnMobile: true,
        copyable: false,
      },
      {
        key: "isPhoneVerified",
        label: "تأیید موبایل",
        editable: false,
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
        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "lastOtpRequestAt",
        label: "آخرین درخواست OTP",
        sortable: true,
        dateFilter: true,
        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "phoneVerifiedAt",
        label: "تاریخ تأیید موبایل",
        sortable: true,
        dateFilter: true,
        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "isDeleted",
        label: "حذف شده",
        inputType: "checkbox",
        defaultValue: false,
        hiddenInForm: (_, mode) => mode === "create",
        placeholder: "کاربر به‌صورت حذف‌شده علامت‌گذاری شود",
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
        editable: false,
        copyable: true,
        render: (value) => (
          <span className="text-sm text-slate-400">{String(value ?? "—")}</span>
        ),
      },
      {
        key: "updatedBy",
        editable: false,
        label: "به‌روزرسانی توسط",
        hideOnMobile: true,
        copyable: true,
        render: (value) => (
          <span className="text-sm text-slate-400">{String(value ?? "—")}</span>
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
    [agentOptions, authUser?.role],
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
        endpoint={`/api/users?includeDeleted=true&refresh=${refreshToken}`}
        updateMethod="PATCH"
        onUpdate={async (item, builtInUpdate) => {
          try {
            await builtInUpdate(buildUserPayload(item) as UserRow);
            toast.success("اطلاعات کاربر ویرایش شد");
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "ویرایش کاربر با خطا مواجه شد.",
            );
            throw error;
          }
        }}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("کاربر حذف شد");
        }}
        onCreate={async (item, builtInCreate) => {
          try {
            await builtInCreate(
              buildUserPayload(
                item as Partial<UserRow> & Record<string, unknown>,
              ),
            );
            toast.success("کاربر جدید ایجاد شد");
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "ایجاد کاربر با خطا مواجه شد.",
            );
            throw error;
          }
        }}
        columns={columns}
        title="لیست کاربران"
        subtitle="مشاهده، جستجو و مرور تمامی کاربران"
        primaryKey="_id"
        canCreate={canCreateUsers}
        canUpdate={canUpdateUsers}
        canDelete={canDeleteUsers}
        headers={headers}
        pageSize={20}
        pageSizes={[5, 8, 10, 20]}
        searchable
        searchDebounceMs={300}
        exportable
        exportFileName="users"
        stickyHeader
        showRowNumbers
        enableCellCopy
        transformResponse={transformResponse}
        serverSide
        emptyMessage="کاربری یافت نشد"
        rowActions={(row) =>
          canUpdateUsers && !isNormalUser ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void toggleUserStatus(row);
              }}
              disabled={togglingStatusId === row._id}
              title={
                row.status === "active"
                  ? "غیرفعال کردن کاربر"
                  : "فعال کردن کاربر"
              }
              aria-label={
                row.status === "active"
                  ? "غیرفعال کردن کاربر"
                  : "فعال کردن کاربر"
              }
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50",
                row.status === "active"
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-emerald-500 hover:bg-emerald-500/10",
              )}
            >
              {togglingStatusId === row._id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <FaPowerOff className="h-4 w-4" />
              )}
            </button>
          ) : null
        }
      />
    </div>
  );
}
