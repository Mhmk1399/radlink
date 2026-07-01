"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ReactNode } from "react";
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaCheck,
  FaCubes,
  FaFile,
  FaHashtag,
  FaLandmark,
  FaPen,
  FaPhone,
  FaPlus,
  FaPowerOff,
  FaUserTie,
  FaXmark,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useAccess } from "@/hook/auth/useAccess";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import type { ColumnDef } from "@/types/table";
import CustomSelect from "../ui/customSelect";
import {
  getIdentityInputProps,
  sanitizeIdentityField,
  validateIdentityField,
} from "@/lib/validation/identityFields";

type AgentType = "personal" | "company";

type AgentUser = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
  status?: string;
};

type AgentLimits = {
  files: number;
  blocks: number;
  pages: number;
};

type AgentRow = {
  _id: string;
  id: string;
  userId: string;
  userLabel: string;
  userPhone: string;
  userEmail?: string;
  type: AgentType;
  typeLabel: string;
  postalCode?: string;
  fixedNumber?: string;
  pricePerLanding: number;
  companyName?: string;
  ceoName?: string;
  economicNumber?: string;
  registrationNumber?: string;
  limits: AgentLimits;
  limitsSummary: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type UserOption = {
  value: string;
  label: string;
};

type AgentFormState = {
  id?: string;
  userId: string;
  type: AgentType;
  postalCode: string;
  fixedNumber: string;
  pricePerLanding: string;
  companyName: string;
  ceoName: string;
  economicNumber: string;
  registrationNumber: string;
  limits: {
    files: string;
    blocks: string;
    pages: string;
  };
};

const emptyLimits = { files: 0, blocks: 0, pages: 0 };

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function formatFaDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("fa-IR");
  } catch {
    return String(value);
  }
}
function toNumber(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : fallback;
}
function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}
function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}
function userLabel(user: AgentUser | null, fallback = "-") {
  if (!user) return fallback;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.phoneNumber || fallback;
}
function normalizeUser(value: unknown): AgentUser | null {
  if (!isRecord(value)) return null;
  return {
    _id: typeof value._id === "string" ? value._id : undefined,
    id: typeof value.id === "string" ? value.id : undefined,
    firstName: toText(value.firstName),
    lastName: toText(value.lastName),
    phoneNumber: toText(value.phoneNumber),
    email: toText(value.email),
    role: toText(value.role),
    status: toText(value.status),
  };
}
function emptyForm(): AgentFormState {
  return {
    userId: "",
    type: "personal",
    postalCode: "",
    fixedNumber: "",
    pricePerLanding: "0",
    companyName: "",
    ceoName: "",
    economicNumber: "",
    registrationNumber: "",
    limits: { files: "0", blocks: "0", pages: "0" },
  };
}
function formFromRow(row: AgentRow): AgentFormState {
  return {
    id: row._id,
    userId: row.userId,
    type: row.type,
    postalCode: row.postalCode ?? "",
    fixedNumber: row.fixedNumber ?? "",
    pricePerLanding: String(row.pricePerLanding ?? 0),
    companyName: row.companyName ?? "",
    ceoName: row.ceoName ?? "",
    economicNumber: row.economicNumber ?? "",
    registrationNumber: row.registrationNumber ?? "",
    limits: {
      files: String(row.limits.files ?? 0),
      blocks: String(row.limits.blocks ?? 0),
      pages: String(row.limits.pages ?? 0),
    },
  };
}
function toPayload(form: AgentFormState) {
  return {
    userId: form.userId || undefined,
    type: form.type,
    postalCode: emptyToUndefined(form.postalCode),
    fixedNumber: emptyToUndefined(form.fixedNumber),
    pricePerLanding: toNumber(form.pricePerLanding),
    companyName:
      form.type === "company" ? emptyToUndefined(form.companyName) : undefined,
    ceoName:
      form.type === "company" ? emptyToUndefined(form.ceoName) : undefined,
    economicNumber:
      form.type === "company"
        ? emptyToUndefined(form.economicNumber)
        : undefined,
    registrationNumber:
      form.type === "company"
        ? emptyToUndefined(form.registrationNumber)
        : undefined,
    limits: {
      files: toNumber(form.limits.files),
      blocks: toNumber(form.limits.blocks),
      pages: toNumber(form.limits.pages),
    },
  };
}

/* ══════════════════════════════════════════════
   THEMED SUB-COMPONENTS
   ══════════════════════════════════════════════ */

function TypeBadge({ type }: { type: AgentType }) {
  const isCompany = type === "company";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        isCompany
          ? "bg-violet-500/[0.08] text-violet-400 ring-violet-500/15"
          : "bg-sky-500/[0.08] text-sky-400 ring-sky-500/15",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isCompany ? "bg-violet-400" : "bg-sky-400",
        )}
      />
      {isCompany ? "حقوقی" : "حقیقی"}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        active
          ? "bg-emerald-500/[0.08] text-emerald-400 ring-emerald-500/15"
          : "bg-[#6e6a62]/10 text-[#9c9890] ring-[#6e6a62]/15",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-400" : "bg-[#9c9890]",
        )}
      />
      {active ? "فعال" : "غیرفعال"}
    </span>
  );
}

/* Themed form field wrapper */
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const t = useThemeTokens();
  return (
    <label className="block space-y-1.5">
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider",
          t.textDisabled,
        )}
      >
        {icon && <span className="h-3 w-3">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  );
}

/* Themed type toggle button */
function TypeToggle({
  value,
  onChange,
}: {
  value: AgentType;
  onChange: (v: AgentType) => void;
}) {
  const { isDark } = useTheme();
  const t = useThemeTokens();

  return (
    <div
      className={cn("flex rounded-xl border p-1", t.borderSubtle, t.inputBg)}
    >
      {(
        [
          { v: "personal", label: "حقیقی" },
          { v: "company", label: "حقوقی" },
        ] as const
      ).map(({ v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
            value === v
              ? v === "company"
                ? "bg-violet-500/15 text-violet-400"
                : isDark
                  ? "bg-[#c8a84b]/10 text-[#c8a84b]"
                  : "bg-[#8a7030]/8 text-[#8a7030]"
              : t.textMuted,
          )}
        >
          {v === "personal" ? (
            <FaUserTie className="h-3.5 w-3.5" />
          ) : (
            <FaBuilding className="h-3.5 w-3.5" />
          )}
          {label}
        </button>
      ))}
    </div>
  );
}

/* Limit input card */
function LimitCard({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  const { isDark } = useTheme();
  const t = useThemeTokens();
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 transition-colors duration-200",
        t.borderSubtle,
        t.inputBg,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            isDark
              ? "bg-[#c8a84b]/10 text-[#c8a84b]"
              : "bg-[#8a7030]/8 text-[#8a7030]",
          )}
        >
          {icon}
        </span>
        <span className={cn("text-xs font-semibold", t.textMuted)}>
          {label}
        </span>
      </div>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-lg border px-2.5 py-2 text-center text-sm font-mono font-bold outline-none transition-all duration-200",
          t.inputBg,
          t.borderInput,
          t.textPrimary,
          t.borderInputFocus,
        )}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function AgentsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const canCreate = can("admin.agents", "create");
  const canUpdate = can("admin.agents", "update");
  const canDelete = can("admin.agents", "delete");
  const [tableKey, setTableKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AgentFormState>(() => emptyForm());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  const transformResponse = useMemo(
    () =>
      (json: unknown): AgentRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.agents)
            ? json.agents
            : Array.isArray(json)
              ? json
              : [];
        return raw.filter(isRecord).map((agent) => {
          const id = String(agent._id ?? agent.id ?? "");
          const user = normalizeUser(agent.user);
          const userId = user
            ? String(user._id ?? user.id ?? "")
            : String(agent.user ?? "");
          const limits = isRecord(agent.limits) ? agent.limits : emptyLimits;
          const normalizedLimits = {
            files: toNumber(limits.files),
            blocks: toNumber(limits.blocks),
            pages: toNumber(limits.pages),
          };
          const type: AgentType =
            agent.type === "company" ? "company" : "personal";
          return {
            ...agent,
            _id: id,
            id,
            userId,
            userLabel: userLabel(user, userId.slice(-8) || "-"),
            userPhone: user?.phoneNumber ?? "-",
            userEmail: user?.email,
            type,
            typeLabel: type === "company" ? "حقوقی" : "حقیقی",
            postalCode: toText(agent.postalCode),
            fixedNumber: toText(agent.fixedNumber),
            pricePerLanding: toNumber(agent.pricePerLanding),
            companyName: toText(agent.companyName),
            ceoName: toText(agent.ceoName),
            economicNumber: toText(agent.economicNumber),
            registrationNumber: toText(agent.registrationNumber),
            limits: normalizedLimits,
            limitsSummary: `فایل: ${normalizedLimits.files}، بلاک: ${normalizedLimits.blocks}، صفحه: ${normalizedLimits.pages}`,
            isActive: agent.isActive !== false,
            createdAt: toText(agent.createdAt),
            updatedAt: toText(agent.updatedAt),
          };
        });
      },
    [],
  );

  const columns: ColumnDef<AgentRow>[] = useMemo(
    () => [
      {
        key: "userLabel",
        label: "کاربر",
        editable: false,
        sortable: true,
        render: (value, row) => (
          <span className="block">
            <span className={cn("block font-semibold text-sm", t.textPrimary)}>
              {String(value ?? "-")}
            </span>
            <span className={cn("block text-xs", t.textDisabled)}>
              {row.userPhone}
            </span>
          </span>
        ),
      },
      {
        key: "type",
        label: "نوع",
        editable: false,
        filterable: true,
        options: [
          { label: "حقیقی", value: "personal" },
          { label: "حقوقی", value: "company" },
        ],
        render: (value) => <TypeBadge type={value as AgentType} />,
      },
      {
        key: "pricePerLanding",
        label: "قیمت لندینگ",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className={cn("font-mono text-sm", t.textMuted)}>
            {Number(value ?? 0).toLocaleString("fa-IR")}
          </span>
        ),
      },
      {
        key: "companyName",
        label: "نام شرکت",
        editable: false,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-sm", t.textMuted)}>
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "limitsSummary",
        label: "محدودیت‌ها",
        editable: false,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {String(value ?? "-")}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "وضعیت",
        editable: false,
        filterable: true,
        options: [
          { label: "فعال", value: "true" },
          { label: "غیرفعال", value: "false" },
        ],
        render: (value) => <StatusBadge active={Boolean(value)} />,
      },
      {
        key: "createdAt",
        label: "تاریخ",
        editable: false,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-xs", t.textDisabled)}>
            {formatFaDate(String(value ?? ""))}
          </span>
        ),
      },
    ],
    [t],
  );

  // Body scroll lock
  useEffect(() => {
    if (formOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [formOpen]);

  useEffect(() => {
    if (!formOpen || !canCreate || form.id) return;
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoadingUsers(true);
        const response = await fetch(
          "/api/users?mode=agent-options&limit=100",
          { headers },
        );
        const json = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(json?.message ?? "خطا در دریافت کاربران");
        const users: unknown[] =
          isRecord(json) && Array.isArray(json.users)
            ? json.users
            : Array.isArray(json)
              ? json
              : [];
        if (!cancelled) {
          setUserOptions(
            users.filter(isRecord).map((user) => {
              const id = String(user._id ?? user.id ?? "");
              const normalized = normalizeUser(user);
              return {
                value: id,
                label: `${userLabel(normalized, id.slice(-8))} - ${normalized?.phoneNumber ?? ""}`,
              };
            }),
          );
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "خطا در دریافت کاربران",
          );
          setUserOptions([]);
        }
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [canCreate, form.id, formOpen, headers]);

  function openCreate() {
    setForm(emptyForm());
    setFormErrors({});
    setFormOpen(true);
  }
  function openEdit(row: AgentRow) {
    setForm(formFromRow(row));
    setFormErrors({});
    setFormOpen(true);
  }
  function closeForm() {
    if (isSaving) return;
    setFormOpen(false);
    setForm(emptyForm());
    setFormErrors({});
  }
  function updateField<K extends keyof AgentFormState>(
    key: K,
    value: AgentFormState[K],
  ) {
    const nextValue = sanitizeIdentityField(String(key), value) as AgentFormState[K];
    setForm((current) => ({ ...current, [key]: nextValue }));
    setFormErrors((current) => {
      const next = { ...current };
      const error = validateIdentityField(String(key), nextValue);
      if (error) next[String(key)] = error;
      else delete next[String(key)];
      return next;
    });
  }
  function updateLimit(key: keyof AgentFormState["limits"], value: string) {
    setForm((current) => ({
      ...current,
      limits: { ...current.limits, [key]: value },
    }));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.id && !form.userId) {
      toast.error("انتخاب کاربر الزامی است");
      return;
    }
    const fixedNumberError = validateIdentityField(
      "fixedNumber",
      form.fixedNumber,
    );
    if (fixedNumberError) {
      setFormErrors((current) => ({
        ...current,
        fixedNumber: fixedNumberError,
      }));
      return;
    }
    if (form.type === "company") {
      const required = [
        form.companyName,
        form.ceoName,
        form.economicNumber,
        form.registrationNumber,
      ];
      if (required.some((value) => !value.trim())) {
        toast.error("برای نماینده حقوقی اطلاعات شرکت الزامی است");
        return;
      }
    }
    try {
      setIsSaving(true);
      const response = await fetch(
        form.id ? `/api/agents/${form.id}` : "/api/agents",
        {
          method: form.id ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(headers ?? {}),
          },
          body: JSON.stringify(toPayload(form)),
        },
      );
      const json = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(json?.message ?? "خطا در ذخیره نماینده");
      toast.success(form.id ? "نماینده ویرایش شد" : "نماینده ایجاد شد");
      setFormOpen(false);
      setForm(emptyForm());
      setTableKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در ذخیره نماینده",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleAgent(row: AgentRow) {
    try {
      setActiveActionId(row._id);
      const response = await fetch(`/api/agents/${row._id}/toggle`, {
        method: "PATCH",
        headers,
      });
      const json = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(json?.message ?? "خطا در تغییر وضعیت نماینده");
      toast.success(json?.message ?? "وضعیت نماینده تغییر کرد");
      setTableKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت نماینده",
      );
    } finally {
      setActiveActionId(null);
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
  const fieldInput = cn(
    "w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-all duration-200",
    t.inputBg,
    t.borderInput,
    t.textPrimary,
    t.borderInputFocus,
    isDark ? "placeholder:text-[#47443e]" : "placeholder:text-[#b0aa9e]",
  );
  const themedSelect = cn(fieldInput, "cursor-pointer");

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
                  ? "border-blue-500/15 bg-blue-500/[0.08] text-blue-400"
                  : "border-blue-500/20 bg-blue-500/[0.06] text-blue-600",
              )}
            >
              <FaUserTie className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت نمایندگان
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                ساخت، ویرایش و کنترل وضعیت نمایندگان سیستم
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
                <span>ساخت نماینده</span>
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
      <DynamicTable<AgentRow>
        key={tableKey}
        endpoint="/api/agents"
        updateMethod="PATCH"
        columns={columns}
        title="لیست نمایندگان"
        subtitle="مدیریت اطلاعات و محدودیت‌های نمایندگان"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[10, 20, 50]}
        searchable
        exportable
        exportFileName="agents"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete={canDelete}
        transformResponse={transformResponse}
        serverSide
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("نماینده حذف شد");
          setTableKey((key) => key + 1);
        }}
        rowActions={(row) => {
          const isLoading = activeActionId === row._id;
          return (
            <div className="flex items-center justify-end gap-1">
              {canUpdate && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(row);
                    }}
                    title="ویرایش نماینده"
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                      isDark
                        ? "text-blue-400/70 hover:bg-blue-500/10 hover:text-blue-400"
                        : "text-blue-600/70 hover:bg-blue-500/8 hover:text-blue-600",
                    )}
                  >
                    <FaPen className="h-3.5 w-3.5" />
                    <span className="sr-only">ویرایش</span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void toggleAgent(row);
                    }}
                    disabled={isLoading}
                    title={row.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                      row.isActive
                        ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                        : "text-emerald-400/70 hover:bg-emerald-500/10 hover:text-emerald-400",
                    )}
                  >
                    <FaPowerOff
                      className={cn(
                        "h-3.5 w-3.5",
                        isLoading && "animate-pulse",
                      )}
                    />
                    <span className="sr-only">
                      {row.isActive ? "غیرفعال" : "فعال"}
                    </span>
                  </button>
                </>
              )}
            </div>
          );
        }}
        emptyMessage="نماینده‌ای یافت نشد"
      />

      {/* ══════════════════════════════════════════════
          MODAL — Full screen mobile, centered desktop
          ══════════════════════════════════════════════ */}
      {formOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            isDark
              ? "bg-[#0a0a0e]/80 backdrop-blur-md"
              : "bg-[#2a2720]/40 backdrop-blur-md",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSaving) closeForm();
          }}
        >
          <div
            className={cn(
              "flex flex-col overflow-hidden",
              "h-full w-full",
              "lg:h-auto lg:max-h-[92vh] lg:w-full lg:max-w-3xl lg:rounded-2xl lg:border",
              t.modalBg,
              t.borderSubtle,
              t.dropdownShadow,
            )}
          >
            {/* Header */}
            <div
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
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-500/8 text-blue-600",
                  )}
                >
                  <FaUserTie className="h-4 w-4" />
                </div>
                <div>
                  <h2 className={cn("text-base font-bold", t.textPrimary)}>
                    {form.id ? "ویرایش نماینده" : "ساخت نماینده"}
                  </h2>
                  <p className={cn("text-xs", t.textDisabled)}>
                    اطلاعات و محدودیت‌های دسترسی را تنظیم کنید
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
                  t.hoverBg,
                  t.textMuted,
                )}
              >
                <FaXmark className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable form body */}
            <form
              onSubmit={submitForm}
              className={cn("flex flex-1 flex-col overflow-hidden")}
            >
              <div
                className={cn(
                  "flex-1 space-y-5 overflow-y-auto p-4 sm:p-5",
                  t.scrollbarWide,
                )}
              >
                {/* User select (create only) */}
                {!form.id && (
                  <Field label="کاربر" icon={<FaUserTie />}>
                    <CustomSelect
                      id="userId"
                      name="userId"
                      value={form.userId}
                      options={userOptions}
                      onChange={(value) => {
                        updateField(
                          "userId",
                          typeof value === "string" ? value : "",
                        );
                      }}
                      placeholder={
                        loadingUsers
                          ? "در حال دریافت کاربران..."
                          : "انتخاب کاربر"
                      }
                      searchPlaceholder="جستجوی نام، شماره موبایل یا ایمیل..."
                      loading={loadingUsers}
                      disabled={loadingUsers}
                      searchable
                      clearable
                      fullWidth
                      size="md"
                      position="auto"
                      emptyMessage="کاربری برای انتخاب وجود ندارد"
                      noResultsMessage="کاربری با این مشخصات پیدا نشد"
                    />
                  </Field>
                )}

                {/* Agent type toggle */}
                <div>
                  <span
                    className={cn(
                      "mb-1.5 block text-xs font-semibold uppercase tracking-wider",
                      t.textDisabled,
                    )}
                  >
                    نوع نماینده
                  </span>
                  <TypeToggle
                    value={form.type}
                    onChange={(v) => updateField("type", v)}
                  />
                </div>

                {/* Base fields grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="قیمت هر لندینگ" icon={<FaHashtag />}>
                    <input
                      type="number"
                      min={0}
                      value={form.pricePerLanding}
                      onChange={(event) =>
                        updateField("pricePerLanding", event.target.value)
                      }
                      className={fieldInput}
                    />
                  </Field>
                  <Field label="کد پستی" icon={<FaLandmark />}>
                    <input
                      value={form.postalCode}
                      onChange={(event) =>
                        updateField("postalCode", event.target.value)
                      }
                      className={fieldInput}
                    />
                  </Field>
                  <Field label="تلفن ثابت" icon={<FaPhone />}>
                    <input
                      value={form.fixedNumber}
                      onChange={(event) =>
                        updateField("fixedNumber", event.target.value)
                      }
                      {...getIdentityInputProps("fixedNumber")}
                      aria-invalid={Boolean(formErrors.fixedNumber)}
                      className={fieldInput}
                    />
                    {formErrors.fixedNumber && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {formErrors.fixedNumber}
                      </p>
                    )}
                  </Field>
                </div>

                {/* Company fields */}
                {form.type === "company" && (
                  <div
                    className={cn(
                      "space-y-3 rounded-xl border p-4",
                      isDark
                        ? "border-violet-500/15 bg-violet-500/[0.04]"
                        : "border-violet-500/12 bg-violet-500/[0.03]",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FaBuilding
                        className={cn(
                          "h-3.5 w-3.5",
                          isDark ? "text-violet-400" : "text-violet-600",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          isDark ? "text-violet-400" : "text-violet-600",
                        )}
                      >
                        اطلاعات شرکت
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="نام شرکت" icon={<FaBuilding />}>
                        <input
                          value={form.companyName}
                          onChange={(event) =>
                            updateField("companyName", event.target.value)
                          }
                          className={fieldInput}
                        />
                      </Field>
                      <Field label="نام مدیرعامل" icon={<FaUserTie />}>
                        <input
                          value={form.ceoName}
                          onChange={(event) =>
                            updateField("ceoName", event.target.value)
                          }
                          className={fieldInput}
                        />
                      </Field>
                      <Field label="کد اقتصادی" icon={<FaHashtag />}>
                        <input
                          value={form.economicNumber}
                          onChange={(event) =>
                            updateField("economicNumber", event.target.value)
                          }
                          className={fieldInput}
                        />
                      </Field>
                      <Field label="شماره ثبت" icon={<FaHashtag />}>
                        <input
                          value={form.registrationNumber}
                          onChange={(event) =>
                            updateField(
                              "registrationNumber",
                              event.target.value,
                            )
                          }
                          className={fieldInput}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Limits section */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        t.textDisabled,
                      )}
                    >
                      محدودیت‌های دسترسی
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <LimitCard
                      label="فایل"
                      icon={<FaFile className="h-3.5 w-3.5" />}
                      value={form.limits.files}
                      onChange={(v) => updateLimit("files", v)}
                    />
                    <LimitCard
                      label="بلاک"
                      icon={<FaCubes className="h-3.5 w-3.5" />}
                      value={form.limits.blocks}
                      onChange={(v) => updateLimit("blocks", v)}
                    />
                    <LimitCard
                      label="صفحه"
                      icon={<FaBriefcase className="h-3.5 w-3.5" />}
                      value={form.limits.pages}
                      onChange={(v) => updateLimit("pages", v)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer — sticky */}
              <div
                className={cn(
                  "flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-end",
                  t.divider,
                  t.modalBg,
                )}
              >
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className={cn(outlineBtn, "w-full sm:w-auto")}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={cn(primaryBtn, "w-full sm:w-auto")}
                >
                  {isSaving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <FaCheck className="h-3.5 w-3.5" />
                  )}
                  {isSaving ? "در حال ذخیره..." : "ذخیره نماینده"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
