"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaFloppyDisk, FaUserCheck } from "react-icons/fa6";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import CustomSelect, { type SelectOption } from "@/components/ui/customSelect";
import { toast } from "@/components/ui/CustomToast";

type SettingsUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
};

type SettingsResponse = {
  targetUserId?: string;
  status?: "ready" | "invalid" | "not_configured";
  message?: string;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function userLabel(user: SettingsUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.phoneNumber || user.email || user.id;
}

function userDescription(user: SettingsUser) {
  return [user.role, user.phoneNumber, user.email].filter(Boolean).join(" · ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeUser(value: unknown): SettingsUser | null {
  if (!isRecord(value)) return null;
  const id = String(value.id ?? value._id ?? "");
  if (!id) return null;

  return {
    id,
    firstName:
      typeof value.firstName === "string" ? value.firstName : undefined,
    lastName: typeof value.lastName === "string" ? value.lastName : undefined,
    phoneNumber:
      typeof value.phoneNumber === "string" ? value.phoneNumber : undefined,
    email: typeof value.email === "string" ? value.email : undefined,
    role: typeof value.role === "string" ? value.role : undefined,
  };
}

export default function SettingsSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = useMemo(() => {
    const token =
      typeof window !== "undefined"
        ? (localStorage.getItem("auth_token") ?? "")
        : "";

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  const options = useMemo<SelectOption[]>(
    () =>
      users.map((user) => ({
        value: user.id,
        label: userLabel(user),
        description: userDescription(user),
      })),
    [users],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      try {
        const [settingsResponse, usersResponse] = await Promise.all([
          fetch("/api/settings/auto-page-assignment", { headers }),
          fetch("/api/settings/auto-page-assignment?mode=options&limit=100", {
            headers,
          }),
        ]);

        const [settingsJson, usersJson] = await Promise.all([
          settingsResponse.json().catch(() => null),
          usersResponse.json().catch(() => null),
        ]);

        if (!settingsResponse.ok) {
          throw new Error(settingsJson?.message ?? "خطا در دریافت تنظیمات");
        }
        if (!usersResponse.ok) {
          throw new Error(usersJson?.message ?? "خطا در دریافت کاربران");
        }
        if (cancelled) return;

        const settings = isRecord(settingsJson)
          ? (settingsJson as SettingsResponse)
          : {};
        const rawUsers =
          isRecord(usersJson) && Array.isArray(usersJson.users)
            ? usersJson.users
            : [];

        setTargetUserId(settings.targetUserId ?? "");
        setStatusMessage(settings.message ?? "");
        setUsers(
          rawUsers
            .map(normalizeUser)
            .filter((user): user is SettingsUser => Boolean(user)),
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "خطا در دریافت تنظیمات",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [headers]);

  async function saveSettings() {
    try {
      setSaving(true);
      const response = await fetch("/api/settings/auto-page-assignment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ targetUserId }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.message ?? "ذخیره تنظیمات انجام نشد.");
      }

      const settings = isRecord(json) ? (json as SettingsResponse) : {};
      setTargetUserId(settings.targetUserId ?? "");
      setStatusMessage(settings.message ?? "");
      toast.success("تنظیمات تخصیص خودکار ذخیره شد.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ذخیره تنظیمات انجام نشد.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={cn("text-xl font-bold", t.textPrimary)}>تنظیمات</h1>
          <p className={cn("mt-1 text-sm", t.textMuted)}>
            تنظیمات عملیاتی و زمان‌بندی پروژه
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
            t.borderSubtle,
            t.textAccent,
            t.hoverBg,
          )}
        >
          <FaArrowRight className="h-3.5 w-3.5" />
          بازگشت به داشبورد
        </button>
      </div>

      <section
        className={cn(
          "rounded-2xl border p-4 sm:p-6",
          t.cardBg,
          t.borderSubtle,
        )}
      >
        <div className="mb-5 flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              isDark
                ? "bg-[#c8a84b]/10 text-[#d6bb66]"
                : "bg-black/[0.05] text-[#27272a]",
            )}
          >
            <FaUserCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className={cn("text-base font-bold", t.textPrimary)}>
              تخصیص خودکار صفحه‌های بدون مالک
            </h2>
            <p className={cn("mt-1 text-sm leading-6", t.textMuted)}>
              صفحه‌هایی که ۲۴ ساعت بدون سازنده و کاربر اختصاصی بمانند، توسط job
              زمان‌بندی‌شده به این کاربر منتقل می‌شوند.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <CustomSelect
            options={options}
            value={targetUserId}
            onChange={(value) =>
              setTargetUserId(Array.isArray(value) ? (value[0] ?? "") : value)
            }
            label="کاربر مقصد"
            placeholder="انتخاب کاربر فعال"
            searchPlaceholder="جستجو بر اساس نام یا شماره..."
            searchable
            clearable
            fullWidth
            loading={loading}
            disabled={loading || saving}
            emptyMessage="کاربر فعالی برای انتخاب وجود ندارد."
            noResultsMessage="کاربری یافت نشد."
          />

          <button
            type="button"
            onClick={saveSettings}
            disabled={loading || saving}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
              isDark
                ? "bg-[#c8a84b] text-[#111116] hover:bg-[#d2b660]"
                : "bg-[#27272a] text-white hover:bg-[#3f3f46]",
            )}
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FaFloppyDisk className="h-3.5 w-3.5" />
            )}
            ذخیره
          </button>
        </div>

        {statusMessage && (
          <p className={cn("mt-3 text-xs leading-6", t.textMuted)}>
            {statusMessage}
          </p>
        )}
      </section>
    </div>
  );
}
