"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaGlobe, FaFileAlt } from "react-icons/fa";
import { FaImage, FaPowerOff } from "react-icons/fa6";
import { HiOutlinePencil } from "react-icons/hi2";
import type { ColumnDef } from "@/types/table";
import type { Page } from "@/types/index";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import DynamicTable from "@/components/global/DynamicTable";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "../ui/CustomToast";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/fileUtils";
import Image from "next/image";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatFaDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("fa-IR", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

type AdminPageRow = Page & {
  isPublished?: boolean;
};

type UserOptionSource = {
  _id?: unknown;
  id?: unknown;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
};

type SelectOption = {
  label: string;
  value: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObjectId(value: unknown) {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  const id = value._id ?? value.id;
  return typeof id === "string" ? id : "";
}

function getUserLabel(user?: UserOptionSource | null) {
  if (!user) return "";
  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.phoneNumber || user.email || getObjectId(user);
}

/* columns builder — receives theme tokens so badges use theme colors */
function buildColumns(
  ownerOptions: SelectOption[],
  t: ReturnType<typeof useThemeTokens>,
  isDark: boolean,
  canEditOwner: boolean,
): ColumnDef<AdminPageRow>[] {
  return [
    {
      key: "title",
      label: "عنوان صفحه",
      sortable: true,
      render: (value, row) => (
        <span className="block">
          <span className={cn("block text-sm font-semibold", t.textPrimary)}>
            {String(value ?? "—")}
          </span>

          {row.url && (
            <span
              className={cn(
                "mt-0.5 block font-mono text-[11px]",
                t.textDisabled,
              )}
              dir="ltr"
            >
              {String(row.url)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "description",
      label: "توضیحات",
      hideOnMobile: true,
      render: (value) => (
        <span
          className={cn("block max-w-[18rem] truncate text-sm", t.textMuted)}
        >
          {String(value ?? "—")}
        </span>
      ),
    },
    {
      key: "logo",
      label: "لوگو",
      inputType: "url",
      placeholder: "آدرس لوگوی صفحه",
      copyable: false,
      render: (value) => (
        <span className="relative inline-flex h-11 w-20 items-center justify-center overflow-hidden rounded-lg border border-black/10 ">
          {typeof value === "string" && value ? (
            <Image
              src={value}
              alt="لوگوی صفحه"
              fill
              unoptimized
              sizes="80px"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <span className={cn("text-[10px]", t.textDisabled)}>بدون لوگو</span>
          )}
        </span>
      ),
    },
    {
      key: "favicon",
      label: "فاوآیکون",
      inputType: "url",
      placeholder: "آدرس آیکون مرورگر",
      copyable: false,
      hideOnMobile: true,
      render: (value) => (
        <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-black/10  ">
          {typeof value === "string" && value ? (
            <Image
              src={value}
              alt="فاوآیکون صفحه"
              fill
              unoptimized
              sizes="40px"
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <FaGlobe className="h-4 w-4 text-slate-300" />
          )}
        </span>
      ),
    },

    {
      key: "ownerId",
      editable: canEditOwner,
      required: canEditOwner,
      options: ownerOptions,
      placeholder: "سازنده صفحه را انتخاب کنید",
      label: "سازنده",
      hideOnMobile: true,
      render: (_: unknown, row: AdminPageRow) => {
        const ownerName = getUserLabel(row.owner as UserOptionSource);

        return (
          <span className={cn("text-sm", t.textMuted)}>
            {ownerName || String(row.ownerId ?? "—")}
          </span>
        );
      },
    },

    {
      key: "isPublished",
      label: "وضعیت",
      editable: true,
      inputType: "checkbox",
      placeholder: "صفحه منتشر شود",
      filterable: true,
      options: [
        { label: "منتشر شده", value: "true" },
        { label: "پیش‌نویس", value: "false" },
      ],
      render: (value) => {
        const published = Boolean(value);

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              published
                ? "bg-emerald-500/[0.08] text-emerald-400 ring-emerald-500/15"
                : isDark
                  ? "bg-[#6e6a62]/10 text-[#9c9890] ring-[#6e6a62]/15"
                  : "bg-black/[0.04] text-[#6B5D3E] ring-black/[0.06]",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                published
                  ? "bg-emerald-400"
                  : isDark
                    ? "bg-[#9c9890]"
                    : "bg-[#A09070]",
              )}
            />

            {published ? "منتشر شده" : "پیش‌نویس"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      editable: false,
      label: "تاریخ ایجاد",
      sortable: true,
      hideOnMobile: true,
      render: (value) => (
        <span className={cn("text-xs", t.textDisabled)}>
          {formatFaDate(String(value ?? ""))}
        </span>
      ),
    },
  ];
}

export default function PagesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const router = useRouter();
  const { user, can, canOnResource, isLoading: isAccessLoading } = useAccess();
  const isNormalUser = user?.role === "user";

  const shouldLoadUsers = !isAccessLoading && user !== null && !isNormalUser;

  const canEditOwner = !isAccessLoading && user !== null && !isNormalUser;
  const canCreatePages = can("admin.pages", "create");
  const canUpdatePages = can("admin.pages", "update");
  const canDeletePages = can("admin.pages", "delete");
  const [ownerOptions, setOwnerOptions] = useState<SelectOption[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [togglingPageId, setTogglingPageId] = useState<string | null>(null);
  const [brandingPage, setBrandingPage] = useState<AdminPageRow | null>(null);
  const [brandingLogo, setBrandingLogo] = useState("");
  const [brandingFavicon, setBrandingFavicon] = useState("");
  const [uploadingBranding, setUploadingBranding] = useState<
    "logo" | "favicon" | null
  >(null);
  const [savingBranding, setSavingBranding] = useState(false);

  const transformResponse = useMemo(
    () => (json: unknown) => {
      const pages =
        typeof json === "object" &&
        json !== null &&
        "pages" in json &&
        Array.isArray((json as any).pages)
          ? (json as any).pages
          : Array.isArray(json)
            ? json
            : [];

      return pages.map((page: any) => {
        const pageId = String(page._id ?? page.id ?? "");
        const owner = isRecord(page.owner) ? page.owner : undefined;
        const ownerId =
          getObjectId(owner) ||
          getObjectId(page.ownerId) ||
          getObjectId(page.owner);

        return {
          ...page,
          _id: pageId,
          id: pageId,
          ownerId,
          owner: owner ?? page.owner,
        };
      }) as AdminPageRow[];
    },
    [],
  );

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  useEffect(() => {
    // Do not request /api/users until the current user is loaded.
    // Normal users must never fetch the users list.
    if (!shouldLoadUsers) {
      setOwnerOptions([]);
      return;
    }

    const controller = new AbortController();

    async function loadUserOptions() {
      try {
        const allUsers: UserOptionSource[] = [];
        let usersPage = 1;
        let total = 0;

        do {
          const response = await fetch(
            `/api/users?page=${usersPage}&limit=100`,
            {
              headers,
              signal: controller.signal,
            },
          );

          const json = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              typeof json?.message === "string"
                ? json.message
                : "دریافت لیست کاربران با خطا مواجه شد.",
            );
          }

          const users = Array.isArray(json?.users)
            ? (json.users as UserOptionSource[])
            : [];

          allUsers.push(...users);

          total =
            typeof json?.total === "number" ? json.total : allUsers.length;

          usersPage += 1;
        } while (allUsers.length < total && usersPage <= 50);

        const unique = new Map<string, SelectOption>();

        allUsers.forEach((userOption) => {
          const value = getObjectId(userOption);

          if (!value) return;

          unique.set(value, {
            value,
            label: getUserLabel(userOption) || value,
          });
        });

        setOwnerOptions(Array.from(unique.values()));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to load page owner options", error);
      }
    }

    void loadUserOptions();

    return () => {
      controller.abort();
    };
  }, [shouldLoadUsers, headers]);

  /* rebuild columns whenever theme or options change */
  const columns = useMemo(
    () => buildColumns(ownerOptions, t, isDark, canEditOwner),
    [ownerOptions, t, isDark, canEditOwner],
  );

  async function togglePageStatus(row: AdminPageRow) {
    const pageId = String(row._id || row.id || "");
    if (!pageId || togglingPageId) return;

    const nextPublished = !Boolean(row.isPublished);

    try {
      setTogglingPageId(pageId);
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ isPublished: nextPublished }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof json?.message === "string"
            ? json.message
            : "تغییر وضعیت صفحه با خطا مواجه شد.",
        );
      }

      toast.success(
        nextPublished ? "صفحه منتشر شد." : "صفحه به پیش‌نویس تغییر کرد.",
      );
      setRefreshToken((value) => value + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "تغییر وضعیت صفحه با خطا مواجه شد.",
      );
    } finally {
      setTogglingPageId(null);
    }
  }

  function openBrandingModal(row: AdminPageRow) {
    setBrandingPage(row);
    setBrandingLogo(typeof row.logo === "string" ? row.logo : "");
    setBrandingFavicon(typeof row.favicon === "string" ? row.favicon : "");
  }

  async function uploadBrandingImage(kind: "logo" | "favicon", file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویر قابل آپلود است.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
      return;
    }

    try {
      setUploadingBranding(kind);
      const uploaded = await uploadFile(file);
      if (kind === "logo") setBrandingLogo(uploaded.url);
      else setBrandingFavicon(uploaded.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "آپلود تصویر انجام نشد.",
      );
    } finally {
      setUploadingBranding(null);
    }
  }

  async function saveBranding() {
    const pageId = String(brandingPage?._id ?? brandingPage?.id ?? "");
    if (!pageId || savingBranding || uploadingBranding) return;

    try {
      setSavingBranding(true);
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({
          logo: brandingLogo,
          favicon: brandingFavicon,
        }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "ذخیره تصاویر صفحه انجام نشد.");
      }

      toast.success("لوگو و فاوآیکون صفحه ذخیره شدند.");
      setBrandingPage(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ذخیره تصاویر صفحه انجام نشد.",
      );
    } finally {
      setSavingBranding(false);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      {/* ── Page header card ── */}
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
              <FaFileAlt className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت صفحات سایت
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                تمام صفحات ثبت‌شده در سایت را مشاهده و مدیریت کنید
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

      {/* ── Table ── */}
      <DynamicTable<AdminPageRow>
        endpoint={`/api/pages?refresh=${refreshToken}`}
        updateMethod="PATCH"
        onUpdate={async (item, builtInUpdate) => {
          if (isNormalUser) {
            const { ownerId: _ownerId, owner: _owner, ...updatePayload } = item;
            await builtInUpdate(updatePayload as AdminPageRow);
          } else {
            await builtInUpdate(item);
          }
          toast.success("تغییر اعمال شد");
        }}
        columns={columns}
        title="لیست صفحات"
        subtitle="مشاهده، جستجو و مرور تمامی صفحات"
        primaryKey="_id"
        headers={headers}
        pageSize={10}
        pageSizes={[10, 20, 50]}
        searchable
        searchDebounceMs={300}
        exportable
        exportFileName="pages"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={canCreatePages}
        canUpdate={canUpdatePages}
        canDelete={canDeletePages}
        transformResponse={transformResponse}
        rowActions={(row) => {
          const href = row.url
            ? String(row.url).startsWith("http")
              ? String(row.url)
              : `/${String(row.url).replace(/^\/+/, "")}`
            : "";

          const pageId = String(row._id || row.id || "");
          const canUpdateThisPage =
            canUpdatePages ||
            (pageId ? canOnResource("pages", pageId, "update") : false);
          const canViewThisPage =
            can("admin.pages", "view") ||
            (pageId ? canOnResource("pages", pageId, "view") : false);

          return (
            <div className="flex items-center justify-end gap-1">
              {canUpdateThisPage && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void togglePageStatus(row);
                  }}
                  disabled={togglingPageId === pageId}
                  title={row.isPublished ? "تبدیل به پیش‌نویس" : "انتشار صفحه"}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
                    row.isPublished
                      ? isDark
                        ? "text-amber-300/80 hover:bg-amber-400/10 hover:text-amber-300"
                        : "text-amber-700/80 hover:bg-amber-500/10 hover:text-amber-700"
                      : isDark
                        ? "text-emerald-400/75 hover:bg-emerald-500/10 hover:text-emerald-400"
                        : "text-emerald-600/75 hover:bg-emerald-500/10 hover:text-emerald-600",
                  )}
                >
                  {togglingPageId === pageId ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <FaPowerOff className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {row.isPublished ? "تبدیل به پیش‌نویس" : "انتشار صفحه"}
                  </span>
                </button>
              )}

              {canUpdateThisPage && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openBrandingModal(row);
                  }}
                  title="مدیریت لوگو و فاوآیکون"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    isDark
                      ? "text-sky-400/70 hover:bg-sky-500/10 hover:text-sky-400"
                      : "text-sky-600/70 hover:bg-sky-500/8 hover:text-sky-600",
                  )}
                >
                  <FaImage className="h-4 w-4" />
                  <span className="sr-only">مدیریت لوگو و فاوآیکون</span>
                </button>
              )}

              {canUpdateThisPage && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (pageId) router.push(`/builder/${pageId}`);
                  }}
                  title="ویرایش صفحه"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    isDark
                      ? "text-violet-400/70 hover:bg-violet-500/10 hover:text-violet-400"
                      : "text-violet-600/70 hover:bg-violet-500/8 hover:text-violet-600",
                  )}
                >
                  <HiOutlinePencil className="h-4 w-4" />
                  <span className="sr-only">ویرایش صفحه</span>
                </button>
              )}

              {href && canViewThisPage && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(href, "_blank");
                  }}
                  title="مشاهده صفحه"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    isDark
                      ? "text-blue-400/70 hover:bg-blue-500/10 hover:text-blue-400"
                      : "text-blue-600/70 hover:bg-blue-500/8 hover:text-blue-600",
                  )}
                >
                  <FaGlobe className="h-4 w-4" />
                  <span className="sr-only">مشاهده صفحه</span>
                </button>
              )}
            </div>
          );
        }}
        emptyMessage="صفحه‌ای یافت نشد"
      />

      {brandingPage && (
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="مدیریت لوگو و فاوآیکون صفحه"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingBranding &&
              !uploadingBranding
            ) {
              setBrandingPage(null);
            }
          }}
        >
          <div
            className={cn(
              "w-full max-w-xl overflow-hidden rounded-t-2xl border shadow-2xl sm:rounded-2xl",
              t.modalBg,
              t.borderSubtle,
            )}
          >
            <div className={cn("border-b px-5 py-4", t.divider)}>
              <h2 className={cn("text-base font-black", t.textPrimary)}>
                لوگو و فاوآیکون صفحه
              </h2>
              <p className={cn("mt-1 text-xs", t.textMuted)}>
                {String(brandingPage.title || "صفحه")}
              </p>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {(
                [
                  {
                    kind: "logo" as const,
                    label: "لوگوی صفحه",
                    value: brandingLogo,
                  },
                  {
                    kind: "favicon" as const,
                    label: "آیکون مرورگر",
                    value: brandingFavicon,
                  },
                ] as const
              ).map((item) => (
                <div key={item.kind}>
                  <label
                    className={cn(
                      "mb-2 block text-xs font-bold",
                      t.textSecondary,
                    )}
                  >
                    {item.label}
                  </label>
                  <label
                    className={cn(
                      "relative flex min-h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition",
                      t.inputBg,
                      t.borderInput,
                      uploadingBranding
                        ? "pointer-events-none opacity-70"
                        : t.hoverBg,
                    )}
                  >
                    {item.value ? (
                      <Image
                        src={item.value}
                        alt={item.label}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 280px"
                        className="absolute inset-0 h-full w-full object-contain p-5"
                      />
                    ) : (
                      <span className={cn("text-xs font-medium", t.textMuted)}>
                        انتخاب تصویر
                      </span>
                    )}
                    {uploadingBranding === item.kind && (
                      <span className="relative z-10 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        void uploadBrandingImage(
                          item.kind,
                          event.target.files?.[0],
                        );
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {item.value && (
                    <button
                      type="button"
                      onClick={() =>
                        item.kind === "logo"
                          ? setBrandingLogo("")
                          : setBrandingFavicon("")
                      }
                      disabled={Boolean(uploadingBranding)}
                      className="mt-2 text-xs font-bold text-red-500 disabled:opacity-50"
                    >
                      حذف تصویر
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className={cn("flex gap-3 border-t p-4", t.divider)}>
              <button
                type="button"
                onClick={() => setBrandingPage(null)}
                disabled={savingBranding || Boolean(uploadingBranding)}
                className={cn(
                  "flex-1 rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50",
                  t.borderInput,
                  t.textSecondary,
                  t.hoverBg,
                )}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => void saveBranding()}
                disabled={savingBranding || Boolean(uploadingBranding)}
                className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {savingBranding ? "در حال ذخیره..." : "ذخیره تصاویر"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
