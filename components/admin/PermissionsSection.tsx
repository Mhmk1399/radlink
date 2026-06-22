"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaChevronDown,
   FaPen,
  FaPlus,
  FaShieldHalved,
  FaUsers,
  FaKey,
  FaXmark,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useAccess } from "@/hook/auth/useAccess";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import type { ColumnDef } from "@/types/table";

type UserSummary = {
  _id: string;
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
};

type AccessSummary = {
  _id: string;
  id: string;
  staticComponents?: {
    componentName?: string;
    actions?: string[];
  }[];
  dynamicAccess?: {
    templates?: unknown[];
    blocks?: unknown[];
    pages?: unknown[];
  };
};

type PermissionRow = {
  _id: string;
  id: string;
  name: string;
  description?: string;
  accesses: AccessSummary[];
  assignedToUsers: UserSummary[];
  grantedBy?: UserSummary | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type PermissionFormState = {
  id?: string;
  name: string;
  description: string;
  accessIds: string[];
  assignedUserIds: string[];
  isActive: boolean;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getId(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  return String(value._id ?? value.id ?? "");
}

function normalizeUser(value: unknown): UserSummary | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  if (!id) return null;
  return {
    _id: id,
    id,
    firstName: typeof value.firstName === "string" ? value.firstName : "",
    lastName: typeof value.lastName === "string" ? value.lastName : "",
    phoneNumber: typeof value.phoneNumber === "string" ? value.phoneNumber : "",
    role: typeof value.role === "string" ? value.role : "",
  };
}

function normalizeAccess(value: unknown): AccessSummary | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  if (!id) return null;
  return {
    _id: id,
    id,
    staticComponents: Array.isArray(value.staticComponents)
      ? value.staticComponents.filter(isRecord).map((item) => ({
          componentName:
            typeof item.componentName === "string" ? item.componentName : "",
          actions: Array.isArray(item.actions) ? item.actions.map(String) : [],
        }))
      : [],
    dynamicAccess: isRecord(value.dynamicAccess)
      ? {
          templates: Array.isArray(value.dynamicAccess.templates)
            ? value.dynamicAccess.templates
            : [],
          blocks: Array.isArray(value.dynamicAccess.blocks)
            ? value.dynamicAccess.blocks
            : [],
          pages: Array.isArray(value.dynamicAccess.pages)
            ? value.dynamicAccess.pages
            : [],
        }
      : { templates: [], blocks: [], pages: [] },
  };
}

function userLabel(user?: UserSummary | null) {
  if (!user) return "-";
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.phoneNumber || user.id;
}

function accessLabel(access?: AccessSummary | null) {
  if (!access) return "-";
  const firstStatic = access.staticComponents?.[0];
  if (firstStatic?.componentName) {
    const actions = firstStatic.actions?.length
      ? ` (${firstStatic.actions.join(", ")})`
      : "";
    return `${firstStatic.componentName}${actions}`;
  }
  const templates = access.dynamicAccess?.templates?.length ?? 0;
  const blocks = access.dynamicAccess?.blocks?.length ?? 0;
  const pages = access.dynamicAccess?.pages?.length ?? 0;
  const parts = [
    templates ? `${templates} template` : "",
    blocks ? `${blocks} block` : "",
    pages ? `${pages} page` : "",
  ].filter(Boolean);
  return parts.length ? parts.join("، ") : access.id.slice(-8);
}

function formatFaDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("fa-IR");
  } catch {
    return String(value);
  }
}

function emptyForm(): PermissionFormState {
  return {
    name: "",
    description: "",
    accessIds: [],
    assignedUserIds: [],
    isActive: true,
  };
}

function toggleArrayValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

/* ── Themed InlineChips ── */
function InlineChips({ items }: { items: string[] }) {
  const t = useThemeTokens();
  if (items.length === 0)
    return <span className={cn("text-xs", t.textDisabled)}>-</span>;
  return (
    <span className="inline-flex max-w-[26rem] flex-wrap gap-1 align-middle">
      {items.slice(0, 3).map((item) => (
        <span
          key={item}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            t.inputBg,
            t.textMuted,
          )}
        >
          {item}
        </span>
      ))}
      {items.length > 3 && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            t.inputBg,
            t.textDisabled,
          )}
        >
          +{items.length - 3}
        </span>
      )}
    </span>
  );
}

/* ── Themed Checkbox ── */
function ThemeCheckbox({
  checked,
  onChange,
  label,
  sublabel,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  sublabel?: string;
}) {
  const { isDark } = useTheme();
  const t = useThemeTokens();
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right transition-all duration-200",
        checked
          ? isDark
            ? "bg-[#c8a84b]/[0.06]"
            : "bg-[#8a7030]/[0.04]"
          : "bg-transparent",
        t.hoverBg,
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
          checked
            ? isDark
              ? "border-[#c8a84b]/40 bg-[#c8a84b] text-[#111116]"
              : "border-[#8a7030]/40 bg-[#8a7030] text-white"
            : cn(t.borderInput, t.inputBg),
        )}
      >
        {checked && <FaCheck className="h-2.5 w-2.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm", t.textPrimary)}>
          {label}
        </span>
        {sublabel && (
          <span className={cn("block truncate text-[11px]", t.textDisabled)}>
            {sublabel}
          </span>
        )}
      </span>
    </button>
  );
}

/* ── Themed Collapsible Checklist ── */
function CollapsibleChecklist({
  title,
  icon,
  emptyText,
  options,
  values,
  onToggle,
  loading,
  defaultOpen,
}: {
  title: string;
  icon: React.ReactNode;
  emptyText: string;
  options: { value: string; label: string; sublabel?: string }[];
  values: string[];
  onToggle: (value: string) => void;
  loading?: boolean;
  defaultOpen?: boolean;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border transition-colors duration-200",
        t.borderSubtle,
        open
          ? isDark
            ? "bg-white/[0.02]"
            : "bg-black/[0.015]"
          : "bg-transparent",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 px-3.5 py-3 text-right transition-colors duration-200",
          t.hoverBg,
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            isDark
              ? "bg-[#c8a84b]/10 text-[#c8a84b]"
              : "bg-[#8a7030]/8 text-[#8a7030]",
          )}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-bold", t.textPrimary)}>
            {title}
          </span>
        </span>
        {values.length > 0 && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              isDark
                ? "bg-[#c8a84b]/15 text-[#c8a84b]"
                : "bg-[#8a7030]/10 text-[#8a7030]",
            )}
          >
            {values.length}
          </span>
        )}
        <FaChevronDown
          className={cn(
            "h-3 w-3 shrink-0 transition-transform duration-200",
            t.textDisabled,
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className={cn("border-t px-3 pb-3 pt-2", t.divider)}>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div
                className={cn(
                  "h-5 w-5 animate-spin rounded-full border-2 border-t-transparent",
                  isDark ? "border-[#c8a84b]" : "border-[#8a7030]",
                )}
              />
            </div>
          ) : options.length === 0 ? (
            <div
              className={cn(
                "rounded-lg border border-dashed p-4 text-center",
                t.borderSubtle,
              )}
            >
              <span className={cn("text-xs", t.textDisabled)}>{emptyText}</span>
            </div>
          ) : (
            <div
              className={cn("max-h-44 overflow-y-auto rounded-lg", t.scrollbar)}
            >
              <div className="grid gap-0.5 sm:grid-cols-2">
                {options.map((option) => (
                  <ThemeCheckbox
                    key={option.value}
                    checked={values.includes(option.value)}
                    onChange={() => onToggle(option.value)}
                    label={option.label}
                    sublabel={option.sublabel}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function PermissionsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const [refreshToken, setRefreshToken] = useState(0);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [accesses, setAccesses] = useState<AccessSummary[]>([]);
  const [form, setForm] = useState<PermissionFormState>(() => emptyForm());
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const canDeleteTemplates = can("admin.permissions", "delete");
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const canCreate = can("admin.permissions", "create");
  const canUpdate = can("admin.permissions", "update");

  const transformResponse = useMemo(
    () =>
      (json: unknown): PermissionRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.permissions)
            ? json.permissions
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((permission) => {
          const id = getId(permission);
          const assignedToUsers = Array.isArray(permission.assignedToUsers)
            ? permission.assignedToUsers
                .map(normalizeUser)
                .filter((user): user is UserSummary => !!user)
            : [];
          const accesses = Array.isArray(permission.accesses)
            ? permission.accesses
                .map(normalizeAccess)
                .filter((access): access is AccessSummary => !!access)
            : [];

          return {
            ...permission,
            _id: id,
            id,
            name: String(permission.name ?? ""),
            description:
              typeof permission.description === "string"
                ? permission.description
                : "",
            accesses,
            assignedToUsers,
            grantedBy: normalizeUser(permission.grantedBy),
            isActive: permission.isActive !== false,
            createdAt:
              typeof permission.createdAt === "string"
                ? permission.createdAt
                : undefined,
            updatedAt:
              typeof permission.updatedAt === "string"
                ? permission.updatedAt
                : undefined,
          };
        });
      },
    [],
  );

  const columns: ColumnDef<PermissionRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام دسترسی",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className={cn("text-sm font-semibold", t.textPrimary)}>
            {String(value ?? "-")}
          </span>
        ),
      },
      {
        key: "accesses",
        label: "دسترسی‌ها",
        editable: false,
        render: (_value, row) => (
          <InlineChips items={row.accesses.map(accessLabel)} />
        ),
      },
      {
        key: "assignedToUsers",
        label: "کاربران",
        editable: false,
        hideOnMobile: true,
        render: (_value, row) => (
          <InlineChips items={row.assignedToUsers.map(userLabel)} />
        ),
      },
      {
        key: "grantedBy",
        label: "سازنده",
        editable: false,
        hideOnMobile: true,
        render: (_value, row) => (
          <span className={cn("text-sm", t.textMuted)}>
            {userLabel(row.grantedBy)}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "وضعیت",
        editable: false,
        render: (value) => {
          const active = !!value;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                active
                  ? "bg-emerald-500/[0.08] text-emerald-400 ring-1 ring-emerald-500/15"
                  : isDark
                    ? "bg-[#6e6a62]/10 text-[#9c9890] ring-1 ring-[#6e6a62]/15"
                    : "bg-black/[0.04] text-[#6B5D3E] ring-1 ring-black/[0.06]",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  active
                    ? "bg-emerald-400"
                    : isDark
                      ? "bg-[#9c9890]"
                      : "bg-[#A09070]",
                )}
              />
              {active ? "فعال" : "غیرفعال"}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        label: "تاریخ",
        editable: false,
        sortable: true,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {formatFaDate(String(value ?? ""))}
          </span>
        ),
      },
    ],
    [t, isDark],
  );

  // Lock body scroll
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const [usersResponse, accessesResponse] = await Promise.all([
          fetch("/api/users?limit=100", { headers }),
          fetch("/api/accesses?limit=100", { headers }),
        ]);

        const [usersJson, accessesJson] = await Promise.all([
          usersResponse.json().catch(() => null),
          accessesResponse.json().catch(() => null),
        ]);

        if (!usersResponse.ok) {
          throw new Error(usersJson?.message ?? "خطا در دریافت کاربران");
        }
        if (!accessesResponse.ok) {
          throw new Error(accessesJson?.message ?? "خطا در دریافت accessها");
        }

        if (cancelled) return;

        const rawUsers: unknown[] = Array.isArray(usersJson?.users)
          ? usersJson.users
          : [];
        const rawAccesses: unknown[] = Array.isArray(accessesJson?.accesses)
          ? accessesJson.accesses
          : [];

        setUsers(
          rawUsers
            .map(normalizeUser)
            .filter((user): user is UserSummary => !!user),
        );
        setAccesses(
          rawAccesses
            .map(normalizeAccess)
            .filter((access): access is AccessSummary => !!access),
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "خطا در دریافت گزینه‌های فرم",
        );
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  function openCreate() {
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(row: PermissionRow) {
    setForm({
      id: row._id,
      name: row.name,
      description: row.description ?? "",
      accessIds: row.accesses.map((access) => access.id),
      assignedUserIds: row.assignedToUsers.map((user) => user.id),
      isActive: row.isActive,
    });
    setModalOpen(true);
  }

  async function savePermission() {
    if (!form.name.trim()) {
      toast.error("نام دسترسی الزامی است");
      return;
    }

    if (form.accessIds.length === 0) {
      toast.error("حداقل یک access انتخاب کنید");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        form.id ? `/api/permissions/${form.id}` : "/api/permissions",
        {
          method: form.id ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(headers ?? {}),
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            accesses: form.accessIds,
            assignedToUsers: form.assignedUserIds,
            isActive: form.isActive,
          }),
        },
      );
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در ذخیره دسترسی");
      }

      toast.success(form.id ? "دسترسی ویرایش شد" : "دسترسی ساخته شد");
      setModalOpen(false);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در ذخیره دسترسی",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ── Shared classes ── */
  const primaryBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    isDark
      ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
      : "bg-[#8a7030] text-white hover:bg-[#7a6428]",
  );
  const outlineBtn = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    t.borderSubtle,
    t.inputBg,
    t.textMuted,
    isDark ? "hover:text-[#e6e3de]" : "hover:text-[#2a2720]",
  );
  const fieldLabel = cn(
    "mb-1.5 block text-xs font-semibold uppercase tracking-wider",
    t.textDisabled,
  );
  const fieldInput = cn(
    "w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-all duration-200",
    t.inputBg,
    t.borderInput,
    t.textPrimary,
    t.borderInputFocus,
    isDark ? "placeholder:text-[#47443e]" : "placeholder:text-[#b0aa9e]",
  );
  const closeBtn = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
    t.hoverBg,
    t.textMuted,
  );

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      {/* ── Page header ── */}
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-6",
          t.borderSubtle,
          t.modalBg,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                isDark
                  ? "border-violet-500/15 bg-violet-500/[0.08] text-violet-400"
                  : "border-violet-500/20 bg-violet-500/[0.06] text-violet-600",
              )}
            >
              <FaShieldHalved className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت دسترسی‌ها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                ساخت، ویرایش و حذف permissionها
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canCreate && (
              <button
                type="button"
                onClick={openCreate}
                className={cn(primaryBtn, "h-11 flex-1 sm:flex-none")}
              >
                <FaPlus className="h-3.5 w-3.5" />
                <span>ساخت دسترسی</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("dashboard")}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200",
                t.borderAccent,
                t.textAccent,
                t.hoverBg,
              )}
            >
              <FaArrowRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">بازگشت به داشبورد</span>
              <span className="sm:hidden">بازگشت</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <DynamicTable<PermissionRow>
        endpoint={`/api/permissions?refresh=${refreshToken}`}
        updateMethod="PATCH"
        doubleClickToEdit
        columns={columns}
        title="لیست دسترسی‌ها"
        subtitle="نمایش permissionها، کاربران و سازنده هر دسترسی"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[20, 50, 100]}
        searchable
        exportable
        exportFileName="permissions"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete={canDeleteTemplates}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("پرمیشن غیرفعال شد");
        }}
        transformResponse={transformResponse}
        rowActions={(row) => (
          <>
            {canUpdate && (
              <button
                type="button"
                onClick={() => openEdit(row)}
                title="ویرایش"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                  isDark
                    ? "text-blue-400/70 hover:bg-blue-500/10 hover:text-blue-400"
                    : "text-blue-600/70 hover:bg-blue-500/8 hover:text-blue-600",
                )}
              >
                <FaPen className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">ویرایش</span>
              </button>
            )}
          </>
        )}
        emptyMessage="دسترسی‌ای یافت نشد."
      />

      {/* ══════════════════════════════════════════════
          MODAL — Full screen mobile, centered desktop
          ══════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            isDark
              ? "bg-[#0a0a0e]/80 backdrop-blur-md"
              : "bg-[#2a2720]/40 backdrop-blur-md",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <section
            className={cn(
              "flex flex-col overflow-hidden",
              "h-full w-full",
              "lg:h-auto lg:max-h-[90vh] lg:w-full lg:max-w-3xl lg:rounded-2xl lg:border",
              t.modalBg,
              t.borderSubtle,
              t.dropdownShadow,
            )}
          >
            {/* Header */}
            <header
              className={cn(
                "flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 sm:py-4",
                t.divider,
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    isDark
                      ? "bg-violet-500/10 text-violet-400"
                      : "bg-violet-500/8 text-violet-600",
                  )}
                >
                  <FaShieldHalved className="h-4 w-4" />
                </div>
                <div>
                  <h2 className={cn("text-base font-bold", t.textPrimary)}>
                    {form.id ? "ویرایش دسترسی" : "ساخت دسترسی"}
                  </h2>
                  <p className={cn("text-xs", t.textDisabled)}>
                    {form.accessIds.length > 0
                      ? `${form.accessIds.length} access انتخاب شده`
                      : "اطلاعات دسترسی را وارد کنید"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={closeBtn}
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </header>

            {/* Scrollable body */}
            <div
              className={cn(
                "flex-1 space-y-4 overflow-y-auto p-4 sm:p-5",
                t.scrollbarWide,
              )}
            >
              {/* Name + Active toggle row */}
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <label className={fieldLabel}>نام دسترسی</label>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className={fieldInput}
                    placeholder="مثلاً: مدیریت قالب‌ها"
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
                    className={cn(
                      "flex h-[46px] items-center gap-2.5 rounded-xl border px-4 transition-all duration-200",
                      form.isActive
                        ? isDark
                          ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400"
                          : "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-600"
                        : cn(t.borderSubtle, t.inputBg, t.textMuted),
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200",
                        form.isActive
                          ? "border-emerald-500/40 bg-emerald-500 text-white"
                          : cn(t.borderInput, t.inputBg),
                      )}
                    >
                      {form.isActive && <FaCheck className="h-2.5 w-2.5" />}
                    </span>
                    <span className="text-sm font-medium">
                      {form.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={fieldLabel}>توضیحات</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={2}
                  className={cn(fieldInput, "resize-none")}
                  placeholder="توضیح کوتاه..."
                />
              </div>

              {/* Accesses checklist */}
              <CollapsibleChecklist
                title="Accessها"
                icon={<FaKey className="h-3 w-3" />}
                emptyText="accessای برای انتخاب وجود ندارد."
                loading={optionsLoading}
                defaultOpen={true}
                options={accesses.map((access) => ({
                  value: access.id,
                  label: accessLabel(access),
                  sublabel: access.id.slice(-10),
                }))}
                values={form.accessIds}
                onToggle={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    accessIds: toggleArrayValue(prev.accessIds, value),
                  }))
                }
              />

              {/* Users checklist */}
              <CollapsibleChecklist
                title="کاربران دریافت‌کننده"
                icon={<FaUsers className="h-3 w-3" />}
                emptyText="کاربری برای انتخاب وجود ندارد."
                loading={optionsLoading}
                options={users.map((user) => ({
                  value: user.id,
                  label: userLabel(user),
                  sublabel: [user.role, user.phoneNumber]
                    .filter(Boolean)
                    .join(" · "),
                }))}
                values={form.assignedUserIds}
                onToggle={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    assignedUserIds: toggleArrayValue(
                      prev.assignedUserIds,
                      value,
                    ),
                  }))
                }
              />
            </div>

            {/* Footer */}
            <footer
              className={cn(
                "flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between",
                t.divider,
                t.modalBg,
              )}
            >
              <span className={cn("text-xs", t.textDisabled)}>
                {form.accessIds.length > 0 || form.assignedUserIds.length > 0
                  ? `${form.accessIds.length} access · ${form.assignedUserIds.length} کاربر`
                  : "هیچ موردی انتخاب نشده"}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={cn(outlineBtn, "flex-1 sm:flex-none")}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={savePermission}
                  disabled={saving}
                  className={cn(primaryBtn, "flex-1 sm:flex-none")}
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : null}
                  {saving ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
