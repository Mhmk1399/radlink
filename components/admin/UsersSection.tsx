// ─────────────────────────────────────────────────────────────────
// components/sections/UsersSection.tsx
// ─────────────────────────────────────────────────────────────────
"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { gradients } from "@/lib/design/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaFileLines,
  FaPenToSquare,
  FaPowerOff,
  FaRotateRight,
  FaUsers,
} from "react-icons/fa6";
import type { ColumnDef } from "@/types/table";
import DynamicTable from "../global/DynamicTable";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
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
  collectionName?: string;
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
  limitsOverrideEnabled?: boolean;
  limitsSource?: "user" | "agent";
  ownLimits?: {
    files: number;
    blocks: number;
    pages: number;
  };
  inheritedLimits?: {
    files: number;
    blocks: number;
    pages: number;
  } | null;
  lastLoginAt?: string;
  lastOtpRequestAt?: string;
  phoneVerifiedAt?: string;
  isPhoneVerified: boolean;
  isDeleted: boolean;
  agentid?: string; // matches model field name (lowercase)
  agentLabel?: string;
  createdBy?: string;
  createdById?: string;
  updatedBy?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
  pagesQuickView?: string;
  "limits.files"?: number;
  "limits.blocks"?: number;
  "limits.pages"?: number;
  password?: string;
};

type SelectOption = {
  value: string;
  label: string;
  userId?: string;
};

function hasAgentScopedRole(role?: string) {
  return role === "agent" || role === "agentManager";
}

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
    agentManager: {
      label: "مدیر نماینده",
      className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
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

const DEFAULT_USER_AVATAR = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="48" fill="#1f2937"/>
  <circle cx="48" cy="36" r="16" fill="#94a3b8"/>
  <path d="M22 80c4.5-14.5 14.4-22 26-22s21.5 7.5 26 22" fill="#94a3b8"/>
</svg>
`)}`;

function getAvatarImage(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : DEFAULT_USER_AVATAR;
}

function UserAvatar({
  src,
  label,
  onPreview,
}: {
  src?: string;
  label: string;
  onPreview: (src: string, title: string) => void;
}) {
  const image = getAvatarImage(src);
  const hasCustomAvatar = typeof src === "string" && src.trim().length > 0;
  const title = hasCustomAvatar
    ? `تصویر پروفایل ${label}`
    : `تصویر پیش‌فرض ${label}`;

  return (
    <button
      type="button"
      aria-label={`نمایش ${title}`}
      title={`نمایش ${title}`}
      onClick={(event) => {
        event.stopPropagation();
        onPreview(image, title);
      }}
      className="inline-flex h-11 w-11 shrink-0 cursor-pointer rounded-full border border-white/10 bg-slate-800 bg-cover bg-center shadow-[0_0_0_3px_rgba(255,255,255,0.03)] transition hover:scale-105 hover:border-[#D4AF37]/45 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:ring-offset-2 focus:ring-offset-slate-950"
      style={{ backgroundImage: `url("${image.replace(/"/g, "%22")}")` }}
    />
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
    collectionName:
      typeof item.collectionName === "string"
        ? item.collectionName.trim()
        : undefined,
    limits: {
      files: Math.max(0, Number(item["limits.files"]) || 0),
      blocks: Math.max(0, Number(item["limits.blocks"]) || 0),
      pages: Math.max(0, Number(item["limits.pages"]) || 0),
    },
    limitsOverrideEnabled: Boolean(item.limitsOverrideEnabled),
  };

  delete payload.fullName;
  delete payload.createdBy;
  delete payload.createdById;
  delete payload.updatedBy;
  delete payload.updatedById;
  delete payload.ownLimits;
  delete payload.inheritedLimits;
  delete payload.limitsSource;
  delete payload.pagesQuickView;
  delete payload["limits.files"];
  delete payload["limits.blocks"];
  delete payload["limits.pages"];
  delete payload.permissions;

  if (typeof item.password === "string" && item.password.trim()) {
    payload.password = item.password;
  } else {
    delete payload.password;
  }

  payload.agentid =
    typeof item.agentid === "string" && item.agentid.trim()
      ? item.agentid.trim()
      : "";
  payload.limitsOverrideEnabled = payload.agentid
    ? Boolean(item.limitsOverrideEnabled)
    : true;

  return payload;
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

type UserPageSummary = {
  id: string;
  title: string;
  url: string;
  relation: "created" | "assigned" | "both";
  isPublished?: boolean;
};

function getPageRelationLabel(relation: UserPageSummary["relation"]) {
  if (relation === "both") return "سازنده و صاحب سایت";
  if (relation === "assigned") return "صاحب سایت";
  return "سازنده صفحه";
}

function normalizePageSummary(
  value: unknown,
  relation: UserPageSummary["relation"],
): UserPageSummary | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const id = String(record._id ?? record.id ?? "");
  if (!id) return null;

  return {
    id,
    title: String(record.title ?? record.url ?? "صفحه بدون عنوان"),
    url: typeof record.url === "string" ? record.url : "",
    relation,
    isPublished:
      typeof record.isPublished === "boolean" ? record.isPublished : undefined,
  };
}

async function fetchUserPagesByRelation(
  userId: string,
  relation: "created" | "assigned",
  headers?: Record<string, string>,
) {
  const queryKey = relation === "created" ? "ownerId" : "assignedUserId";
  const pages: UserPageSummary[] = [];
  let page = 1;
  let total = 0;

  do {
    const response = await fetch(
      `/api/pages?${queryKey}=${encodeURIComponent(userId)}&page=${page}&limit=100`,
      { headers },
    );
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        typeof json?.message === "string"
          ? json.message
          : "دریافت صفحات کاربر با خطا مواجه شد.",
      );
    }

    const batch = Array.isArray(json?.pages) ? json.pages : [];
    pages.push(
      ...batch
        .map((item: unknown) => normalizePageSummary(item, relation))
        .filter((item: UserPageSummary | null): item is UserPageSummary =>
          Boolean(item),
        ),
    );

    total = typeof json?.total === "number" ? json.total : pages.length;
    page += 1;
  } while (pages.length < total && page <= 50);

  return pages;
}

function UserPagesLazyPanel({
  userId,
  headers,
  compact = false,
}: {
  userId?: string;
  headers?: Record<string, string>;
  compact?: boolean;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<UserPageSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function loadPages(event?: MouseEvent) {
    event?.stopPropagation();
    if (!userId || isLoading) return;

    setOpen(true);
    setIsLoading(true);
    setError(null);

    try {
      const [createdPages, assignedPages] = await Promise.all([
        fetchUserPagesByRelation(userId, "created", headers),
        fetchUserPagesByRelation(userId, "assigned", headers),
      ]);
      const merged = new Map<string, UserPageSummary>();

      [...createdPages, ...assignedPages].forEach((page) => {
        const previous = merged.get(page.id);
        merged.set(page.id, {
          ...(previous ?? page),
          relation: previous ? "both" : page.relation,
        });
      });

      setPages(Array.from(merged.values()));
      setLoaded(true);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "دریافت صفحات کاربر با خطا مواجه شد.";
      setError(message);
      toast.warning(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!userId) {
    return <span className={cn("text-xs", t.textDisabled)}>کاربر نامشخص</span>;
  }

  const buttonClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60",
    compact ? "h-9 px-3" : "h-10 w-full px-4 sm:w-auto",
    isDark
      ? "border-sky-400/20 bg-sky-500/[0.08] text-sky-300 hover:bg-sky-500/15"
      : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
  );

  return (
    <div
      className={cn("space-y-2", compact ? "min-w-[8rem]" : "sm:col-span-2")}
    >
      <button
        type="button"
        onClick={
          open && loaded
            ? (event) => {
                event.stopPropagation();
                setOpen((value) => !value);
              }
            : loadPages
        }
        disabled={isLoading}
        className={buttonClass}
      >
        {isLoading ? (
          <FaRotateRight className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FaFileLines className="h-3.5 w-3.5" />
        )}
        <span>{compact ? "صفحات" : "دیدن صفحات کاربر"}</span>
      </button>

      {open && compact && loaded ? (
        <span className={cn("block text-[11px]", t.textDisabled)}>
          {pages.length.toLocaleString("fa-IR")} صفحه
        </span>
      ) : null}

      {open && !compact ? (
        <div className={cn("rounded-xl border p-3", t.inputBg, t.borderSubtle)}>
          {isLoading ? (
            <p className={cn("text-xs", t.textMuted)}>در حال دریافت صفحات...</p>
          ) : error ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-amber-400">{error}</p>
              <button
                type="button"
                onClick={loadPages}
                className={cn(
                  "shrink-0 rounded-lg px-2 py-1 text-xs",
                  t.hoverBg,
                )}
              >
                تلاش دوباره
              </button>
            </div>
          ) : pages.length === 0 ? (
            <p className={cn("text-xs", t.textMuted)}>
              صفحه‌ای برای این کاربر ثبت نشده است.
            </p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto pe-1">
              {pages.map((page) => {
                const viewHref = page.url
                  ? `/${page.url.replace(/^\/+/, "")}`
                  : "";

                return (
                  <div
                    key={page.id}
                    className={cn(
                      "flex flex-col gap-2 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
                      t.borderSubtle,
                    )}
                  >
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate text-sm font-bold",
                          t.textPrimary,
                        )}
                      >
                        {page.title}
                      </p>
                      <p className={cn("mt-0.5 text-[11px]", t.textDisabled)}>
                        {getPageRelationLabel(page.relation)}
                        {page.isPublished === false ? " · پیش‌نویس" : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <a
                        href={`/builder/${page.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs transition",
                          t.hoverBg,
                          t.textAccent,
                        )}
                      >
                        <FaPenToSquare className="h-3 w-3" />
                        ویرایش
                      </a>
                      {viewHref ? (
                        <a
                          href={viewHref}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs transition",
                            t.hoverBg,
                            t.textMuted,
                          )}
                        >
                          <FaArrowUpRightFromSquare className="h-3 w-3" />
                          دیدن
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

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
  const canCreateUsers = can("admin.users", "create");
  const canViewAgents = can("admin.agents", "view");
  const canDeleteUsers = !isNormalUser && can("admin.users", "delete");
  const hasFullUserCreateAccess = canCreateUsers;
  const hasFullUserEditAccess = canUpdateUsers;
  const roleOptions = useMemo(
    () => [
      { label: "کاربر", value: "user" },
      { label: "نماینده", value: "agent" },
      { label: "مدیر نماینده", value: "agentManager" },
      { label: "مدیر", value: "admin" },
      ...(authUser?.role === "superAdmin"
        ? [{ label: "R A D", value: "superAdmin" }]
        : []),
    ],
    [authUser?.role],
  );

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
  const [creatorOptions, setCreatorOptions] = useState<SelectOption[]>([]);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const openPreviewImage = useCallback((src: string, title: string) => {
    setPreviewImage({ src, title });
  }, []);
  const closePreviewImage = useCallback(() => setPreviewImage(null), []);

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
        nextStatus === "active" ? "کاربر فعال شد." : "کاربر غیرفعال شد.",
      );
      setRefreshToken((current) => current + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تغییر وضعیت کاربر انجام نشد.",
      );
    } finally {
      setTogglingStatusId(null);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadAgentOptions() {
      if (
        !token ||
        (!hasFullUserCreateAccess && !hasFullUserEditAccess && !canViewAgents)
      ) {
        if (!ignore) setAgentOptions([]);
        return;
      }

      try {
        const canReadFullAgentList =
          canViewAgents || authUser?.role === "superAdmin";
        const response = await fetch(
          canReadFullAgentList
            ? "/api/agents?limit=100"
            : "/api/agents?limit=100&mode=user-form-options",
          { headers },
        );
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
              userId: getObjectId(record.user),
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
  }, [
    authUser?.role,
    canViewAgents,
    hasFullUserEditAccess,
    hasFullUserCreateAccess,
    headers,
    token,
  ]);

  const requesterAgentId = useMemo(() => {
    if (!hasAgentScopedRole(authUser?.role)) return "";
    const authUserId = authUser?.id;
    const matchedOption = authUserId
      ? agentOptions.find((option) => option.userId === authUserId)
      : undefined;
    if (matchedOption?.value) return matchedOption.value;

    const authUserRecord =
      authUser && typeof authUser === "object"
        ? (authUser as Record<string, unknown>)
        : null;
    return getObjectId(authUserRecord?.agentid);
  }, [agentOptions, authUser]);

  useEffect(() => {
    let ignore = false;

    async function loadCreatorOptions() {
      if (!token || authUser?.role === "user") {
        if (!ignore) setCreatorOptions([]);
        return;
      }

      try {
        const allUsers: Record<string, unknown>[] = [];
        let usersPage = 1;
        let total = 0;

        do {
          const response = await fetch(
            `/api/users?includeDeleted=true&page=${usersPage}&limit=100`,
            { headers },
          );
          const json = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              typeof json?.message === "string"
                ? json.message
                : "دریافت لیست سازنده‌ها با خطا مواجه شد.",
            );
          }

          const users = Array.isArray(json?.users)
            ? (json.users as Record<string, unknown>[])
            : [];
          allUsers.push(...users);
          total =
            typeof json?.total === "number" ? json.total : allUsers.length;
          usersPage += 1;
        } while (allUsers.length < total && usersPage <= 50);

        const unique = new Map<string, SelectOption>();

        if (authUser?.id) {
          unique.set(authUser.id, {
            value: authUser.id,
            label: getPersonLabel(
              authUser,
              authUser.phoneNumber ?? authUser.id,
            ),
          });
        }

        allUsers.forEach((user) => {
          const value = getObjectId(user);
          if (!value) return;
          unique.set(value, {
            value,
            label: getPersonLabel(user, value),
          });
        });

        if (!ignore) setCreatorOptions(Array.from(unique.values()));
      } catch (error) {
        if (!ignore) {
          setCreatorOptions([]);
          toast.error(
            error instanceof Error
              ? error.message
              : "دریافت لیست سازنده‌ها با خطا مواجه شد.",
          );
        }
      }
    }

    void loadCreatorOptions();

    return () => {
      ignore = true;
    };
  }, [authUser, authUser?.role, headers, token]);

  /* ── Transform API response → UserRow[] ── */
  const transformResponse = useMemo(
    () =>
      (json: unknown): UserRow[] => {
        // Support both { users: [...] } and plain [...]
        const jsonRecord =
          typeof json === "object" && json !== null
            ? (json as Record<string, unknown>)
            : null;
        const raw =
          jsonRecord && Array.isArray(jsonRecord.users)
            ? jsonRecord.users
            : Array.isArray(json)
              ? json
              : [];

        return raw.map((item: unknown) => {
          const u =
            item && typeof item === "object"
              ? (item as Record<string, unknown>)
              : {};
          const limits =
            u.limits && typeof u.limits === "object"
              ? (u.limits as Record<string, unknown>)
              : {};
          const ownLimits =
            u.ownLimits && typeof u.ownLimits === "object"
              ? (u.ownLimits as Record<string, unknown>)
              : limits;
          const inheritedLimits =
            u.inheritedLimits && typeof u.inheritedLimits === "object"
              ? (u.inheritedLimits as Record<string, unknown>)
              : null;
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
              ? u.permissions.map((p: unknown) => {
                  if (!p || typeof p !== "object") return String(p);
                  const permission = p as Record<string, unknown>;
                  return String(
                    permission.name ?? permission._id ?? permission.id ?? p,
                  );
                })
              : [],
            // Ensure limits always exists
            limits: {
              files: Number(limits.files ?? 0),
              blocks: Number(limits.blocks ?? 0),
              pages: Number(limits.pages ?? 0),
            },
            ownLimits: {
              files: Number(ownLimits.files ?? 0),
              blocks: Number(ownLimits.blocks ?? 0),
              pages: Number(ownLimits.pages ?? 0),
            },
            inheritedLimits: inheritedLimits
              ? {
                  files: Number(inheritedLimits.files ?? 0),
                  blocks: Number(inheritedLimits.blocks ?? 0),
                  pages: Number(inheritedLimits.pages ?? 0),
                }
              : null,
            limitsOverrideEnabled: Boolean(u.limitsOverrideEnabled),
            limitsSource:
              u.limitsSource === "agent" || u.limitsSource === "user"
                ? u.limitsSource
                : agentId
                  ? "agent"
                  : "user",
            "limits.files": Number(limits.files ?? 0),
            "limits.blocks": Number(limits.blocks ?? 0),
            "limits.pages": Number(limits.pages ?? 0),
            // Normalise createdBy / updatedBy
            createdBy: formatUserRef(u.createdBy),
            createdById: getObjectId(u.createdBy),
            updatedBy: formatUserRef(u.updatedBy),
            updatedById: getObjectId(u.updatedBy),
          } as UserRow;
        });
      },
    [],
  );

  /* ── Column definitions ────────────────── */
  const columns: ColumnDef<UserRow>[] = useMemo(
    () => [
      {
        key: "avatarUrl",
        label: "آواتار",
        editable: false,
        sortable: false,
        copyable: false,
        render: (value, row) => {
          const displayName =
            [row.firstName, row.lastName].filter(Boolean).join(" ") ||
            row.phoneNumber ||
            "کاربر";

          return (
            <UserAvatar
              src={String(value ?? "")}
              label={displayName}
              onPreview={openPreviewImage}
            />
          );
        },
      },
      {
        key: "fullName",
        label: "نام و نام خانوادگی",
        editable: false,
        viewable: false,
        sortable: false,
        copyable: true,
        render: (_value, row) => {
          const fullName =
            [row.firstName, row.lastName].filter(Boolean).join(" ") ||
            row.fullName ||
            "—";
          return <span className="font-semibold">{fullName}</span>;
        },
      },
      {
        key: "firstName",
        visible: false,
        filterable: true,
        filterType: "text",
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
        visible: false,

        label: "نام خانوادگی",
        filterable: true,
        filterType: "text",
        sortable: true,
        required: true,
        placeholder: "نام خانوادگی",
        copyable: true,
        render: (value) => (
          <span className="font-semibold">{String(value ?? "—")}</span>
        ),
      },
      {
        key: "createdBy",
        label: "سازنده کاربر",
        hideOnMobile: true,
        editable: false,
        copyable: true,
        render: (value) => (
          <span className="text-sm text-slate-400">{String(value ?? "—")}</span>
        ),
      },

      {
        key: "phoneNumber",
        label: "شماره موبایل",
        filterable: true,
        filterType: "text",
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
        key: "pagesQuickView",
        label: "صفحات کاربر",
        editable: true,
        sortable: false,
        copyable: false,
        hiddenInForm: (_formData, mode) => mode === "create",
        render: (_value, row) => (
          <UserPagesLazyPanel userId={row._id || row.id} headers={headers} />
        ),
        renderFormField: ({ formData, selectedRow }) => (
          <UserPagesLazyPanel
            userId={String(
              selectedRow?._id ??
                selectedRow?.id ??
                formData._id ??
                formData.id ??
                "",
            )}
            headers={headers}
          />
        ),
      },
      {
        key: "limits",
        label: "محدودیت‌ها",
        editable: false,
        render: (value, row) => {
          const l = value as UserRow["limits"];
          if (!l) return "—";
          const showLimit = (value: number) =>
            value > 0 ? String(value) : "نامحدود";
          const source =
            row.limitsSource === "agent" ? "از نماینده" : "اختصاصی کاربر";
          return (
            <span className="flex flex-col gap-1 text-xs text-slate-500">
              <span>
                فایل: {showLimit(l.files)} · بلوک: {showLimit(l.blocks)} · صفحه:{" "}
                {showLimit(l.pages)}
              </span>
              <span className="text-[10px] text-slate-400">{source}</span>
            </span>
          );
        },
        hideOnMobile: true,
        copyable: false,
      },
      {
        key: "agentid",
        label: "نماینده این کاربر",
        sortable: true,
        options: agentOptions,
        defaultValue: requesterAgentId,
        copyable: true,
        hideOnMobile: true,
        placeholder: "انتخاب نماینده یا بدون نماینده",
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
        render: (value, row) => (
          <span className="text-sm text-slate-400">
            {row.agentLabel ||
              agentOptions.find((option) => option.value === value)?.label ||
              String(value || "—")}
          </span>
        ),
      },
      {
        key: "limitsOverrideEnabled",
        label: "محدودیت اختصاصی",
        inputType: "checkbox",
        visible: false,
        defaultValue: false,
        formHelpText: (_, formData) =>
          formData.agentid
            ? "اگر روشن باشد، محدودیت‌های همین کاربر جدا از نماینده ذخیره می‌شود."
            : "کاربر بدون نماینده همیشه از محدودیت اختصاصی خودش استفاده می‌کند.",
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
      },
      {
        key: "limits.files",
        label: "محدودیت فایل",
        inputType: "number",
        visible: false,
        placeholder: "0",
        formHelpText: (_, formData) =>
          formData.agentid && !formData.limitsOverrideEnabled
            ? "این مقدار فعلا از نماینده خوانده می‌شود. برای تغییر فقط همین کاربر، محدودیت اختصاصی را روشن کنید."
            : "عدد ۰ یعنی نامحدود.",
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
      },
      {
        key: "limits.blocks",
        label: "محدودیت بلاک",
        inputType: "number",
        visible: false,
        placeholder: "0",
        formHelpText: (_, formData) =>
          formData.agentid && !formData.limitsOverrideEnabled
            ? "این مقدار فعلا از نماینده خوانده می‌شود. برای تغییر فقط همین کاربر، محدودیت اختصاصی را روشن کنید."
            : "عدد ۰ یعنی نامحدود.",
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
      },
      {
        key: "limits.pages",
        label: "محدودیت صفحه",
        inputType: "number",
        visible: false,
        placeholder: "0",
        formHelpText: (_, formData) =>
          formData.agentid && !formData.limitsOverrideEnabled
            ? "این مقدار فعلا از نماینده خوانده می‌شود. برای تغییر فقط همین کاربر، محدودیت اختصاصی را روشن کنید."
            : "عدد ۰ یعنی نامحدود.",
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
      },
      {
        key: "collectionName",
        label: "اسم مجموعه",
        sortable: true,
        placeholder: "اسم مجموعه",
        copyable: true,
        hideOnMobile: true,
        render: (value) => (
          <span className="text-sm text-slate-400">{String(value ?? "—")}</span>
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
        key: "password",
        label: "رمز عبور",
        inputType: "password",
        visible: false,
        placeholder: "مثلا Aa123456!",
        formLabel: (mode) =>
          mode === "create" ? "رمز عبور اولیه" : "رمز عبور جدید",
        formHelpText: (mode) =>
          mode === "create"
            ? "اختیاری است؛ اگر پر شود کاربر می‌تواند با این رمز وارد شود."
            : "برای تغییر رمز پر کنید؛ اگر خالی بماند رمز فعلی تغییر نمی‌کند.",
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
        copyable: false,
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
        options: roleOptions,
        render: (value) => <RoleBadge role={value as UserRole} />,
        copyable: false,
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
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
        hiddenInForm: (_, mode) =>
          mode === "create" ? !hasFullUserCreateAccess : !hasFullUserEditAccess,
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

        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "lastOtpRequestAt",
        label: "آخرین درخواست OTP",
        sortable: true,

        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
      {
        key: "phoneVerifiedAt",
        label: "تاریخ تأیید موبایل",
        sortable: true,

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
        key: "createdById",
        label: "  سازنده کاربر",
        visible: false,
        viewable: false,
        editable: false,
        filterable: creatorOptions.length > 0,
        filterSearchable: true,
        options: creatorOptions,
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

        editable: false,
        hideOnMobile: true,
        copyable: true,
        render: (value) => <span>{formatFaDate(value as string)}</span>,
      },
    ],
    [
      agentOptions,
      creatorOptions,
      hasFullUserEditAccess,
      hasFullUserCreateAccess,
      headers,
      openPreviewImage,
      requesterAgentId,
      roleOptions,
    ],
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
        endpoint="/api/users?includeDeleted=true"
        refreshKey={refreshToken}
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
      <ImagePreviewModal
        open={Boolean(previewImage)}
        src={previewImage?.src ?? ""}
        alt={previewImage?.title}
        title={previewImage?.title}
        onClose={closePreviewImage}
      />
    </div>
  );
}
