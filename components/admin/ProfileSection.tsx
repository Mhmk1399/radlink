"use client";

import { useMemo, useState, type FormEvent } from "react";
import useSWR from "swr";
import {
  FaArrowRight,
  FaCircleCheck,
  FaCloudArrowUp,
  FaClock,
  FaEnvelope,
  FaFile,
  FaIdCard,
  FaLock,
  FaPhone,
  FaShieldHalved,
  FaTrashCan,
  FaTriangleExclamation,
  FaUser,
  FaCubes,
  FaFileLines,
  FaLandmark,
} from "react-icons/fa6";
import { toast } from "@/components/ui/CustomToast";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import type { UserRole, UserStatus } from "@/types";

type UserLimits = {
  files?: number;
  blocks?: number;
  pages?: number;
  landingPages?: number;
};

type ProfileUser = {
  _id?: string;
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  nationalCode?: string;
  fatherName?: string;
  role: UserRole;
  status: UserStatus;
  limits?: UserLimits;
  isPhoneVerified?: boolean;
  lastLoginAt?: string;
  phoneVerifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  nationalCode: string;
  fatherName: string;
};

const PROFILE_OVERRIDE_KEY = "admin-profile-user-override";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toNumber(value: unknown) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function normalizeProfileUser(value: unknown): ProfileUser {
  const record = isRecord(value) ? value : {};
  const limits = isRecord(record.limits) ? record.limits : {};
  const role = String(record.role || "user") as UserRole;
  const status = String(record.status || "active") as UserStatus;

  return {
    _id: toText(record._id),
    id: toText(record.id) || toText(record._id),
    firstName: toText(record.firstName),
    lastName: toText(record.lastName),
    phoneNumber: toText(record.phoneNumber),
    email: toText(record.email),
    avatarUrl: toText(record.avatarUrl),
    nationalCode: toText(record.nationalCode),
    fatherName: toText(record.fatherName),
    role,
    status,
    limits: {
      files: toNumber(limits.files),
      blocks: toNumber(limits.blocks),
      pages: toNumber(limits.pages),
      landingPages: toNumber(limits.landingPages),
    },
    isPhoneVerified: record.isPhoneVerified === true,
    lastLoginAt: toText(record.lastLoginAt),
    phoneVerifiedAt: toText(record.phoneVerifiedAt),
    createdAt: toText(record.createdAt),
    updatedAt: toText(record.updatedAt),
  };
}

function formFromUser(user: ProfileUser): ProfileFormState {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    avatarUrl: user.avatarUrl ?? "",
    nationalCode: user.nationalCode ?? "",
    fatherName: user.fatherName ?? "",
  };
}

function getAuthHeaders(hasBody = false): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ??
        localStorage.getItem("token") ??
        localStorage.getItem("accessToken") ??
        localStorage.getItem("jwt"))
      : null;

  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchProfile(): Promise<ProfileUser> {
  const response = await fetch("/api/auth/me", {
    headers: getAuthHeaders(),
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      isRecord(json) && typeof json.message === "string"
        ? json.message
        : "دریافت پروفایل با خطا مواجه شد.",
    );
  }

  return normalizeProfileUser(isRecord(json) ? json.user : null);
}

async function updateProfile(payload: ProfileFormState): Promise<ProfileUser> {
  const response = await fetch("/api/auth/me", {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      isRecord(json) && typeof json.message === "string"
        ? json.message
        : "ذخیره پروفایل با خطا مواجه شد.",
    );
  }

  return normalizeProfileUser(isRecord(json) ? json.user : null);
}

function publishProfileUpdate(user: ProfileUser) {
  const payload = {
    id: user.id,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phoneNumber: user.phoneNumber ?? "",
    email: user.email ?? "",
    role: user.role,
  };

  try {
    localStorage.setItem(PROFILE_OVERRIDE_KEY, JSON.stringify(payload));
  } catch {}

  window.dispatchEvent(
    new CustomEvent("admin-profile-updated", { detail: payload }),
  );
}

async function uploadAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("فقط فایل تصویر قابل آپلود است.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: getAuthHeaders(false),
    body: formData,
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      isRecord(json) && typeof json.message === "string"
        ? json.message
        : "آپلود تصویر با خطا مواجه شد.",
    );
  }

  const url =
    isRecord(json) && typeof json.url === "string"
      ? json.url
      : isRecord(json) &&
          isRecord(json.data) &&
          typeof json.data.url === "string"
        ? json.data.url
        : "";

  if (!url) throw new Error("آدرس تصویر از سرور دریافت نشد.");

  return url;
}

const roleLabels: Record<UserRole, string> = {
  user: "کاربر",
  agent: "نماینده",
  admin: "مدیر",
  superAdmin: "مدیر ارشد",
};

const statusLabels: Record<UserStatus, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  blocked: "مسدود",
  pending: "در انتظار",
};

function formatFaDate(value?: string) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Tehran",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function initials(user: ProfileUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return (name || user.phoneNumber || "U").slice(0, 2).toUpperCase();
}

/* ══════════════════════════════════════════════
   THEMED SUB-COMPONENTS
   ══════════════════════════════════════════════ */

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  return (
    <label className="block">
      <span
        className={cn(
          "mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider",
          t.textDisabled,
        )}
      >
        {label}
        {required && (
          <span
            className={cn(
              "text-[10px]",
              isDark ? "text-[#c8a84b]" : "text-[#8a7030]",
            )}
          >
            *
          </span>
        )}
      </span>
      <span
        className={cn(
          "flex h-12 items-center gap-2.5 rounded-xl border px-3.5 transition-all duration-200",
          t.inputBg,
          t.borderInput,
          "focus-within:ring-1",
          isDark
            ? "focus-within:border-[#c8a84b]/40 focus-within:ring-[#c8a84b]/20"
            : "focus-within:border-[#8a7030]/40 focus-within:ring-[#8a7030]/20",
        )}
      >
        <span className={cn("shrink-0", t.textDisabled)}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-sm outline-none",
            t.textPrimary,
            isDark
              ? "placeholder:text-[#47443e]"
              : "placeholder:text-[#b0aa9e]",
          )}
        />
      </span>
    </label>
  );
}

function ReadOnlyItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const t = useThemeTokens();
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5",
        t.borderSubtle,
        t.inputBg,
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm",
          t.inputBg,
          t.textAccent,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px]", t.textDisabled)}>{label}</p>
        <p className={cn("truncate text-sm font-semibold", t.textPrimary)}>
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function LimitCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center",
        t.borderSubtle,
        t.inputBg,
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          isDark
            ? "bg-[#c8a84b]/10 text-[#c8a84b]"
            : "bg-[#8a7030]/8 text-[#8a7030]",
        )}
      >
        {icon}
      </span>
      <span className={cn("text-lg font-black tabular-nums", t.textPrimary)}>
        {value.toLocaleString("fa-IR")}
      </span>
      <span className={cn("text-[11px]", t.textDisabled)}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const active = status === "active";
  const blocked = status === "blocked";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        active
          ? "bg-emerald-500/[0.08] text-emerald-400 ring-emerald-500/15"
          : blocked
            ? "bg-red-500/[0.08] text-red-400 ring-red-500/15"
            : "bg-amber-500/[0.08] text-amber-400 ring-amber-500/15",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-400" : blocked ? "bg-red-400" : "bg-amber-400",
        )}
      />
      {statusLabels[status] ?? status}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const { isDark } = useTheme();
  const isSuperAdmin = role === "superAdmin";
  const isAdmin = role === "admin";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        isSuperAdmin || isAdmin
          ? isDark
            ? "bg-[#c8a84b]/[0.08] text-[#c8a84b] ring-[#c8a84b]/15"
            : "bg-[#8a7030]/[0.06] text-[#8a7030] ring-[#8a7030]/12"
          : isDark
            ? "bg-blue-500/[0.08] text-blue-400 ring-blue-500/15"
            : "bg-blue-500/[0.06] text-blue-600 ring-blue-500/12",
      )}
    >
      <FaShieldHalved className="h-3 w-3" />
      {roleLabels[role] ?? role}
    </span>
  );
}

function AvatarUploadField({
  value,
  displayName,
  fallback,
  uploading,
  onFile,
  onRemove,
}: {
  value: string;
  displayName: string;
  fallback: string;
  uploading: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const inputId = "profile-avatar-upload";

  return (
    <div className="sm:col-span-2">
      <span
        className={cn(
          "mb-1.5 block text-xs font-semibold uppercase tracking-wider",
          t.textDisabled,
        )}
      >
        تصویر پروفایل
      </span>
      <div
        className={cn(
          "rounded-xl border p-4",
          t.borderSubtle,
          isDark ? "bg-white/[0.02]" : "bg-black/[0.015]",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-xl font-black",
              t.borderAccent,
              isDark
                ? "bg-[#c8a84b]/[0.08] text-[#d2b660]"
                : "bg-[#8a7030]/[0.06] text-[#7a6428]",
            )}
          >
            {value ? (
              <span
                aria-label={displayName}
                role="img"
                className="block h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${value})` }}
              />
            ) : (
              fallback
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className={cn("text-sm font-bold", t.textPrimary)}>
              آپلود آواتار
            </p>
            <p className={cn("mt-1 text-xs leading-5", t.textMuted)}>
              JPG، PNG، GIF یا WEBP — حداکثر ۵ مگابایت
            </p>
            {value && (
              <p
                className={cn(
                  "mt-1.5 max-w-full truncate font-mono text-[11px]",
                  t.textDisabled,
                )}
                dir="ltr"
              >
                {value}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <input
                id={inputId}
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) onFile(file);
                }}
              />
              <label
                htmlFor={inputId}
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3.5 text-sm font-bold transition-all duration-200",
                  uploading && "pointer-events-none opacity-60",
                  isDark
                    ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
                    : "bg-[#8a7030] text-white hover:bg-[#7a6428]",
                )}
              >
                <FaCloudArrowUp
                  className={cn("h-3.5 w-3.5", uploading && "animate-pulse")}
                />
                {uploading ? "آپلود..." : "انتخاب تصویر"}
              </label>

              {value && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={onRemove}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                    t.borderSubtle,
                    t.textMuted,
                    t.hoverBg,
                  )}
                >
                  <FaTrashCan className="h-3 w-3" />
                  حذف
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PROFILE EDITOR
   ══════════════════════════════════════════════ */

function ProfileEditor({
  user,
  onSaved,
}: {
  user: ProfileUser;
  onSaved: (user: ProfileUser) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [form, setForm] = useState<ProfileFormState>(() => formFromUser(user));
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const displayName =
    [form.firstName, form.lastName].filter(Boolean).join(" ").trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.phoneNumber;

  const limits = user.limits ?? {};
  const limitItems = [
    {
      label: "فایل‌ها",
      value: limits.files ?? 0,
      icon: <FaFile className="h-3.5 w-3.5" />,
    },
    {
      label: "بلاک‌ها",
      value: limits.blocks ?? 0,
      icon: <FaCubes className="h-3.5 w-3.5" />,
    },
    {
      label: "صفحات",
      value: limits.pages ?? 0,
      icon: <FaFileLines className="h-3.5 w-3.5" />,
    },
    {
      label: "لندینگ‌ها",
      value: limits.landingPages ?? 0,
      icon: <FaLandmark className="h-3.5 w-3.5" />,
    },
  ];

  function updateField(key: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleAvatarFile(file: File) {
    try {
      setUploadingAvatar(true);
      const url = await uploadAvatar(file);
      updateField("avatarUrl", url);
      toast.success("تصویر آپلود شد. برای ثبت نهایی، تغییرات را ذخیره کنید.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "آپلود تصویر با خطا مواجه شد.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.firstName.trim().length < 2) {
      toast.error("نام باید حداقل ۲ کاراکتر باشد.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        avatarUrl: form.avatarUrl.trim(),
        nationalCode: form.nationalCode.trim(),
        fatherName: form.fatherName.trim(),
      });
      publishProfileUpdate(updated);
      onSaved(updated);
      toast.success("پروفایل با موفقیت ذخیره شد.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "ذخیره پروفایل با خطا مواجه شد.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* ── Left: Editable form ── */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border",
          t.borderSubtle,
          t.cardBg,
        )}
      >
        {/* Form header */}
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5 sm:py-4",
            t.divider,
          )}
        >
          <div>
            <h2 className={cn("text-base font-extrabold", t.textPrimary)}>
              ویرایش اطلاعات
            </h2>
            <p className={cn("mt-0.5 text-xs", t.textDisabled)}>
              تغییرات پس از ذخیره اعمال خواهند شد
            </p>
          </div>
          {/* Desktop save button */}
          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            className={cn(
              "hidden h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex",
              isDark
                ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
                : "bg-[#8a7030] text-white hover:bg-[#7a6428]",
            )}
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FaCircleCheck className="h-3.5 w-3.5" />
            )}
            {saving ? "ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>

        {/* Form fields */}
        <div className="flex-1 space-y-0 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AvatarUploadField
              value={form.avatarUrl}
              displayName={displayName}
              fallback={initials({
                ...user,
                firstName: form.firstName,
                lastName: form.lastName,
              })}
              uploading={uploadingAvatar}
              onFile={(file) => void handleAvatarFile(file)}
              onRemove={() => updateField("avatarUrl", "")}
            />
            <Field
              icon={<FaUser className="h-3.5 w-3.5" />}
              label="نام"
              value={form.firstName}
              onChange={(value) => updateField("firstName", value)}
              placeholder="نام"
              required
            />
            <Field
              icon={<FaUser className="h-3.5 w-3.5" />}
              label="نام خانوادگی"
              value={form.lastName}
              onChange={(value) => updateField("lastName", value)}
              placeholder="نام خانوادگی"
            />
            <Field
              icon={<FaEnvelope className="h-3.5 w-3.5" />}
              label="ایمیل"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
              placeholder="example@email.com"
            />
            <Field
              icon={<FaIdCard className="h-3.5 w-3.5" />}
              label="کد ملی"
              value={form.nationalCode}
              onChange={(value) => updateField("nationalCode", value)}
              placeholder="کد ملی"
            />
            <Field
              icon={<FaIdCard className="h-3.5 w-3.5" />}
              label="نام پدر"
              value={form.fatherName}
              onChange={(value) => updateField("fatherName", value)}
              placeholder="نام پدر"
            />
          </div>
        </div>

        {/* Mobile sticky save bar */}
        <div
          className={cn(
            "sticky bottom-0 flex shrink-0 border-t p-4 sm:hidden",
            t.divider,
            t.cardBg,
          )}
        >
          <button
            type="submit"
            disabled={saving || uploadingAvatar}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              isDark
                ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
                : "bg-[#8a7030] text-white hover:bg-[#7a6428]",
            )}
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FaCircleCheck className="h-4 w-4" />
            )}
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </form>

      {/* ── Right: Sidebar info ── */}
      <aside className="space-y-4">
        {/* Profile card */}
        <div
          className={cn(
            "overflow-hidden rounded-2xl border",
            t.borderSubtle,
            t.cardBg,
          )}
        >
          {/* Profile header with avatar */}
          <div
            className={cn("flex items-center gap-4 border-b p-4", t.divider)}
          >
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-lg font-black",
                t.borderAccent,
                isDark
                  ? "bg-[#c8a84b]/[0.08] text-[#d2b660]"
                  : "bg-[#8a7030]/[0.06] text-[#7a6428]",
              )}
            >
              {form.avatarUrl ? (
                <span
                  aria-label={displayName}
                  role="img"
                  className="block h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${form.avatarUrl})` }}
                />
              ) : (
                initials({
                  ...user,
                  firstName: form.firstName,
                  lastName: form.lastName,
                })
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-base font-extrabold",
                  t.textPrimary,
                )}
              >
                {displayName}
              </p>
              <p className={cn("mt-0.5 text-xs", t.textDisabled)}>
                {user.phoneNumber}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 p-4">
            <ReadOnlyItem
              icon={<FaPhone className="h-3.5 w-3.5" />}
              label="شماره موبایل"
              value={user.phoneNumber}
            />
            <ReadOnlyItem
              icon={<FaLock className="h-3.5 w-3.5" />}
              label="تایید شماره"
              value={user.isPhoneVerified ? "✓ تایید شده" : "✗ تایید نشده"}
            />
          </div>
        </div>

        {/* Limits */}
        <div className={cn("rounded-2xl border p-4", t.borderSubtle, t.cardBg)}>
          <h3
            className={cn(
              "mb-3 text-xs font-bold uppercase tracking-wider",
              t.textDisabled,
            )}
          >
            محدودیت‌های حساب
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {limitItems.map((item) => (
              <LimitCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className={cn("rounded-2xl border p-4", t.borderSubtle, t.cardBg)}>
          <h3
            className={cn(
              "mb-3 text-xs font-bold uppercase tracking-wider",
              t.textDisabled,
            )}
          >
            زمان‌های مهم
          </h3>
          <div className="space-y-2">
            <ReadOnlyItem
              icon={<FaClock className="h-3.5 w-3.5" />}
              label="آخرین ورود"
              value={formatFaDate(user.lastLoginAt)}
            />
            <ReadOnlyItem
              icon={<FaCircleCheck className="h-3.5 w-3.5" />}
              label="تایید موبایل"
              value={formatFaDate(user.phoneVerifiedAt)}
            />
            <ReadOnlyItem
              icon={<FaFile className="h-3.5 w-3.5" />}
              label="تاریخ عضویت"
              value={formatFaDate(user.createdAt)}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function ProfileSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<ProfileUser>("admin-profile:/api/auth/me", fetchProfile, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });

  const profileKey = useMemo(
    () => (user ? `${user.id}-${user.updatedAt ?? ""}` : "profile"),
    [user],
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
                  ? "border-[#c8a84b]/15 bg-[#c8a84b]/[0.08] text-[#d2b660]"
                  : "border-[#8a7030]/15 bg-[#8a7030]/[0.06] text-[#7a6428]",
              )}
            >
              <FaUser className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                پروفایل من
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                مشاهده و ویرایش اطلاعات حساب کاربری
              </p>
            </div>
          </div>

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

      {/* ── Content states ── */}
      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Form skeleton */}
          <div
            className={cn("rounded-2xl border p-5", t.borderSubtle, t.cardBg)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={cn(
                      "h-5 w-32 animate-pulse rounded-lg",
                      t.inputBg,
                    )}
                  />
                  <div
                    className={cn(
                      "mt-2 h-3 w-48 animate-pulse rounded-lg",
                      t.inputBg,
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "h-10 w-28 animate-pulse rounded-xl",
                    t.inputBg,
                  )}
                />
              </div>
              <div className={cn("h-24 animate-pulse rounded-xl", t.inputBg)} />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div
                      className={cn(
                        "mb-1.5 h-3 w-16 animate-pulse rounded",
                        t.inputBg,
                      )}
                    />
                    <div
                      className={cn("h-12 animate-pulse rounded-xl", t.inputBg)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="space-y-4">
            <div className={cn("h-52 animate-pulse rounded-2xl", t.inputBg)} />
            <div className={cn("h-36 animate-pulse rounded-2xl", t.inputBg)} />
            <div className={cn("h-40 animate-pulse rounded-2xl", t.inputBg)} />
          </div>
        </div>
      ) : error ? (
        <div className={cn("rounded-2xl border p-6", t.borderSubtle, t.cardBg)}>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                "bg-red-500/[0.08]",
              )}
            >
              <FaTriangleExclamation className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className={cn("text-sm font-bold", t.textPrimary)}>
                خطا در دریافت پروفایل
              </p>
              <p className={cn("mt-1.5 text-xs leading-5", t.textMuted)}>
                {error instanceof Error
                  ? error.message
                  : "دریافت پروفایل با خطا مواجه شد."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void mutate()}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl border px-5 text-sm font-bold transition-all duration-200",
                t.borderAccent,
                t.textAccent,
                t.hoverBg,
              )}
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      ) : user ? (
        <ProfileEditor
          key={profileKey}
          user={user}
          onSaved={(updatedUser) =>
            void mutate(updatedUser, { revalidate: true })
          }
        />
      ) : null}
    </div>
  );
}
