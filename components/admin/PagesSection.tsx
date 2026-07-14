"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { deleteFile, uploadFile } from "@/lib/fileUtils";
import {
  normalizePageFooterSettings,
  type PageFooterSettings,
} from "@/lib/design/page-footer";
import { RgbaColorInput } from "@/builder/editor/form/RgbaColorInput";
import Image from "next/image";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
import { isPageExpired } from "@/lib/pages/pageExpiration";
import PageExpiryAlertsPanel, {
  PageExpiryBadge,
} from "@/components/admin/PageExpiryAlertsPanel";
import type { PageExpiryAlertsData } from "@/lib/pages/pageExpiryAlertsCache";
import {
  CUSTOM_HOME_SCREEN_ICON_SETTING_KEY,
  isCustomHomeScreenIconEnabled,
} from "@/lib/design/landing-icons";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function getTableModalTheme(isDark: boolean) {
  if (isDark) {
    return {
      modalBg: "bg-[#1a1a20]",
      inputBg: "bg-[#1e1e26]",
      hoverBg: "hover:bg-[#ffffff08]",
      textPrimary: "text-[#e8e6e3]",
      textSecondary: "text-[#9e9a93]",
      textMuted: "text-[#706c65]",
      textDisabled: "text-[#4a4740]",
      textOnAccent: "text-[#1a1a1f]",
      borderSubtle: "border-[#2a2a32]",
      borderInput: "border-[#2e2e38]",
      borderFocus: "focus:border-[#c9a84c]/40",
      divider: "border-[#2a2a32]/60",
      badgeBg: "bg-white/10",
      badgeText: "text-[#9e9a93]",
      successBg: "bg-[#2a6e4e]/[0.12]",
      successText: "text-[#6ec99a]",
      errorBg: "bg-[#8c3a3a]/[0.12]",
      errorText: "text-[#e87c7c]",
      checkboxAccent: "accent-[#c9a84c]",
      primaryButton:
        "bg-gradient-to-r from-[#a0833a] via-[#c9a84c] to-[#dfc06a] text-[#1a1a1f] hover:brightness-110",
    };
  }

  return {
    modalBg: "bg-[#ffffff]",
    inputBg: "bg-[#f3f4f6]",
    hoverBg: "hover:bg-black/[0.04]",
    textPrimary: "text-[#18181b]",
    textSecondary: "text-[#52525b]",
    textMuted: "text-[#71717a]",
    textDisabled: "text-[#a1a1aa]",
    textOnAccent: "text-white",
    borderSubtle: "border-[#e4e4e7]",
    borderInput: "border-[#d4d4d8]",
    borderFocus: "focus:border-[#71717a]",
    divider: "border-[#e4e4e7]/80",
    badgeBg: "bg-black/[0.05]",
    badgeText: "text-[#52525b]",
    successBg: "bg-[#f0f0f2]",
    successText: "text-[#3f3f46]",
    errorBg: "bg-[#e8e8eb]",
    errorText: "text-[#27272a]",
    checkboxAccent: "accent-[#18181b]",
    primaryButton:
      "bg-gradient-to-r from-[#18181b] via-[#3f3f46] to-[#52525b] text-white hover:brightness-110",
  };
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
  viewCount?: number;
  visitorCount?: number;
};

type BrandingImageKind = "logo" | "favicon" | "trustBadge";

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

const PAGE_EXPIRY_BROWSER_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type BrowserExpiryCache = {
  savedAt: number;
  data: PageExpiryAlertsData;
};

function PageImageUploadField({
  value,
  originalValue,
  label,
  onChange,
}: {
  value: unknown;
  originalValue?: unknown;
  label: string;
  onChange: (value: unknown) => void;
}) {
  const t = useThemeTokens();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUrl = typeof value === "string" ? value : "";
  const originalImageUrl =
    typeof originalValue === "string" ? originalValue : "";

  async function handleFile(file?: File) {
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
      setIsUploading(true);
      const previousUrl = imageUrl;
      const uploaded = await uploadFile(file);
      onChange(uploaded.url);
      if (previousUrl && previousUrl !== originalImageUrl) {
        deleteFile({ url: previousUrl }).catch(() => {
          console.warn("Temporary page image cleanup failed.");
        });
      }
      toast.success("تصویر با موفقیت آپلود شد.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "آپلود تصویر انجام نشد.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (!imageUrl || isDeleting) return;
    try {
      setIsDeleting(true);
      if (imageUrl !== originalImageUrl) {
        await deleteFile({ url: imageUrl });
      }
      onChange("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "حذف تصویر انجام نشد.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <label
        className={cn(
          "relative flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition",
          t.inputBg,
          t.borderInput,
          isUploading ? "pointer-events-none opacity-70" : t.hoverBg,
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 280px"
            className="object-contain p-4"
          />
        ) : (
          <span className={cn("text-xs font-bold", t.textMuted)}>
            انتخاب و آپلود تصویر
          </span>
        )}
        {isUploading && (
          <span className="relative z-10 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading || isDeleting}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <span className={cn("text-[11px]", t.textDisabled)}>
          {imageUrl
            ? "برای جایگزینی، تصویر جدیدی انتخاب کنید."
            : "PNG، JPG یا WebP تا ۵ مگابایت"}
        </span>
        {imageUrl && (
          <button
            type="button"
            disabled={isUploading || isDeleting}
            onClick={() => void handleRemove()}
            className="shrink-0 text-xs font-bold text-red-500 transition hover:text-red-600 disabled:opacity-50"
          >
            حذف تصویر
          </button>
        )}
      </div>
    </div>
  );
}

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

function parseExpiryAlertsData(value: unknown): PageExpiryAlertsData | null {
  if (!isRecord(value) || !Array.isArray(value.alerts)) return null;
  if (!isRecord(value.counts) || typeof value.generatedAt !== "string") {
    return null;
  }

  const counts = value.counts;
  if (
    !["expired", "critical", "warning", "total"].every(
      (key) => typeof counts[key] === "number",
    )
  ) {
    return null;
  }

  return value as unknown as PageExpiryAlertsData;
}

/* columns builder — receives theme tokens so badges use theme colors */
function buildColumns(
  ownerOptions: SelectOption[],
  t: ReturnType<typeof useThemeTokens>,
  isDark: boolean,
  canEditOwner: boolean,
  canAssignUser: boolean,
  canEditExpiration: boolean,
  onPreviewImage: (src: string, title: string) => void,
): ColumnDef<AdminPageRow>[] {
  return [
    {
      key: "title",
      label: "عنوان صفحه",
      sortable: true,
      filterable: true,
      filterType: "text",
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
      key: "viewCount",
      label: "بازدید",
      editable: false,
      sortable: true,
      render: (value) => (
        <span className={cn("font-mono text-sm font-bold", t.textPrimary)}>
          {Number(value ?? 0).toLocaleString("fa-IR")}
        </span>
      ),
    },
    {
      key: "visitorCount",
      label: "بازدیدکننده",
      editable: false,
      sortable: true,
      hideOnMobile: true,
      render: (value) => (
        <span className={cn("font-mono text-sm", t.textMuted)}>
          {Number(value ?? 0).toLocaleString("fa-IR")}
        </span>
      ),
    },
    {
      key: "logo",
      label: "لوگو",
      copyable: false,
      renderFormField: ({ value, originalValue, onChange }) => (
        <PageImageUploadField
          value={value}
          originalValue={originalValue}
          label="لوگوی صفحه"
          onChange={onChange}
        />
      ),
      render: (value, row) =>
        typeof value === "string" && value ? (
          <button
            type="button"
            title="پیش‌نمایش لوگو"
            onClick={(event) => {
              event.stopPropagation();
              onPreviewImage(value, `لوگوی ${row.title || "صفحه"}`);
            }}
            className="relative inline-flex h-11 w-20 items-center justify-center overflow-hidden rounded-lg border border-black/10"
          >
            <Image
              src={value}
              alt="لوگوی صفحه"
              fill
              unoptimized
              sizes="80px"
              className="h-full w-full object-contain p-1"
            />
          </button>
        ) : (
          <span className="relative inline-flex h-11 w-20 items-center justify-center overflow-hidden rounded-lg border border-black/10">
            <span className={cn("text-[10px]", t.textDisabled)}>بدون لوگو</span>
          </span>
        ),
    },
    {
      key: "favicon",
      label: "فاوآیکون",
      copyable: false,
      hideOnMobile: true,
      renderFormField: ({ value, originalValue, onChange }) => (
        <PageImageUploadField
          value={value}
          originalValue={originalValue}
          label="فاوآیکون صفحه"
          onChange={onChange}
        />
      ),
      render: (value, row) =>
        typeof value === "string" && value ? (
          <button
            type="button"
            title="پیش‌نمایش فاوآیکون"
            onClick={(event) => {
              event.stopPropagation();
              onPreviewImage(value, `فاوآیکون ${row.title || "صفحه"}`);
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-black/10"
          >
            <Image
              src={value}
              alt="فاوآیکون صفحه"
              fill
              unoptimized
              sizes="40px"
              className="h-full w-full object-contain p-1.5"
            />
          </button>
        ) : (
          <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-black/10">
            <FaGlobe className="h-4 w-4 text-slate-300" />
          </span>
        ),
    },
    {
      key: "logoShape",
      label: "شکل لوگو",
      options: [
        { label: "مربعی", value: "square" },
        { label: "دایره‌ای", value: "circle" },
      ],
      defaultValue: "square",
    
      hideOnMobile: true,
      render: (value) => (
        <span className={cn("text-xs font-semibold", t.textMuted)}>
          {value === "circle" ? "دایره‌ای" : "مربعی"}
        </span>
      ),
    },

    {
      key: "ownerId",
      editable: false,
      options: ownerOptions,
      placeholder: "سازنده صفحه را انتخاب کنید",
      label: "سازنده",
      filterable: canEditOwner,
      filterSearchable: true,
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
      key: "assignedUserId",
      visible: canAssignUser,
      editable: canAssignUser,
      options: ownerOptions,
      placeholder: "کاربری که صفحه به او داده می‌شود",
      label: "صاحب سایت",
      filterable: canAssignUser,
      filterSearchable: true,
      hideOnMobile: true,
      render: (_: unknown, row: AdminPageRow) => {
        const assignedUserName = getUserLabel(
          row.assignedUser as UserOptionSource,
        );

        return (
          <span className={cn("text-sm", t.textMuted)}>
            {assignedUserName || String(row.assignedUserId ?? "—")}
          </span>
        );
      },
    },

    {
      key: "expiresAt",
      label: "تاریخ انقضا",
      editable: canEditExpiration,
      inputType: "date",
      sortable: true,
      hideOnMobile: true,
      placeholder: "بدون تاریخ انقضا",
      render: (value) => <PageExpiryBadge expiresAt={value} />,
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
      dateFilter: true,
      hideOnMobile: true,
      render: (value) => (
        <span className={cn("text-xs", t.textDisabled)}>
          {formatFaDate(String(value ?? ""))}
        </span>
      ),
    },
    {
      key: "seo.canonical",
      editable: false,
      label: "دامنه",
      sortable: true,

      render: (value) => (
        <span
          className={cn("block max-w-[18rem] truncate text-sm", t.textMuted)}
        >
          {String(value ?? "—")}
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
  const brandingModalTheme = useMemo(
    () => getTableModalTheme(isDark),
    [isDark],
  );
  const brandingColorInputClassName = useMemo(
    () =>
      cn(
        "min-w-0 flex-1 rounded-xl border px-3 py-2.5 font-mono text-xs outline-none transition",
        brandingModalTheme.inputBg,
        brandingModalTheme.borderInput,
        brandingModalTheme.borderFocus,
        brandingModalTheme.textPrimary,
      ),
    [brandingModalTheme],
  );
  const { user, can, canOnResource, isLoading: isAccessLoading } = useAccess();
  const canManageOwners =
    user?.role === "agent" ||
    user?.role === "admin" ||
    user?.role === "superAdmin";
  const canViewExpiryAlerts =
    user?.role === "admin" || user?.role === "superAdmin";
  const canEditRadlinkBranding = user?.role === "superAdmin";
  const canEditHomeScreenIcon = user?.role === "superAdmin";
  const expiryAlertsUserId = user?.id ?? "";

  const shouldLoadUsers = !isAccessLoading && user !== null && canManageOwners;

  const canEditOwner = !isAccessLoading && user !== null && canManageOwners;
  const canAssignPages = !isAccessLoading && user !== null && canManageOwners;
  const canEditExpiration =
    !isAccessLoading && user !== null && canManageOwners;
  const canCreatePages = can("admin.pages", "create");
  const canUpdatePages = can("admin.pages", "update");
  const canDeletePages = can("admin.pages", "delete");
  const [ownerOptions, setOwnerOptions] = useState<SelectOption[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);
  const [togglingPageId, setTogglingPageId] = useState<string | null>(null);
  const [brandingPage, setBrandingPage] = useState<AdminPageRow | null>(null);
  const [brandingLogo, setBrandingLogo] = useState("");
  const [brandingFavicon, setBrandingFavicon] = useState("");
  const [brandingTrustBadge, setBrandingTrustBadge] = useState("");
  const [brandingFooterDescription, setBrandingFooterDescription] =
    useState("");
  const [brandingFooterBg, setBrandingFooterBg] = useState("");
  const [brandingFooterText, setBrandingFooterText] = useState("");
  const [brandingFooterAccent, setBrandingFooterAccent] = useState("");
  const [brandingFooterBorder, setBrandingFooterBorder] = useState("");
  const [brandingShowRadlink, setBrandingShowRadlink] = useState(true);
  const [brandingCustomHomeScreenIcon, setBrandingCustomHomeScreenIcon] =
    useState(true);
  const [uploadingBranding, setUploadingBranding] =
    useState<BrandingImageKind | null>(null);
  const [deletingBranding, setDeletingBranding] =
    useState<BrandingImageKind | null>(null);
  const [savingBranding, setSavingBranding] = useState(false);
  const [expiryAlerts, setExpiryAlerts] = useState<PageExpiryAlertsData | null>(
    null,
  );
  const [expiryAlertsLoading, setExpiryAlertsLoading] = useState(false);
  const [expiryAlertsRefreshing, setExpiryAlertsRefreshing] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const openPreviewImage = useCallback((src: string, title: string) => {
    setPreviewImage({ src, title });
  }, []);
  const closePreviewImage = useCallback(() => setPreviewImage(null), []);

  const transformResponse = useMemo(
    () => (json: unknown) => {
      const pages: unknown[] =
        isRecord(json) && Array.isArray(json.pages)
          ? json.pages
          : Array.isArray(json)
            ? json
            : [];

      return pages.filter(isRecord).map((page) => {
        const pageId = String(page._id ?? page.id ?? "");
        const owner = isRecord(page.owner) ? page.owner : undefined;
        const assignedUser = isRecord(page.assignedUser)
          ? page.assignedUser
          : undefined;
        const stats = isRecord(page.stats) ? page.stats : {};
        const ownerId =
          getObjectId(owner) ||
          getObjectId(page.ownerId) ||
          getObjectId(page.owner);
        const assignedUserId =
          getObjectId(assignedUser) ||
          getObjectId(page.assignedUserId) ||
          getObjectId(page.assignedUser);

        return {
          ...page,
          _id: pageId,
          id: pageId,
          isPublished:
            page.isPublished !== false && !isPageExpired(page.expiresAt),
          ownerId,
          owner: owner ?? page.owner,
          assignedUserId,
          assignedUser: assignedUser ?? page.assignedUser,
          viewCount: Number(stats.views ?? 0),
          visitorCount: Number(stats.visitors ?? 0),
        } as unknown as AdminPageRow;
      });
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

  const loadExpiryAlerts = useCallback(
    async (forceRefresh = false) => {
      if (!canViewExpiryAlerts || !expiryAlertsUserId) return;

      const browserCacheKey = `radlink:page-expiry-alerts:${expiryAlertsUserId}`;
      let hasBrowserFallback = false;

      if (!forceRefresh) {
        try {
          const raw = localStorage.getItem(browserCacheKey);
          const cached = raw ? (JSON.parse(raw) as BrowserExpiryCache) : null;
          const cachedData = parseExpiryAlertsData(cached?.data);

          if (
            cachedData &&
            typeof cached?.savedAt === "number" &&
            Date.now() - cached.savedAt <= PAGE_EXPIRY_BROWSER_CACHE_MAX_AGE_MS
          ) {
            hasBrowserFallback = true;
            setExpiryAlerts(cachedData);
          }
        } catch {
          localStorage.removeItem(browserCacheKey);
        }
      }

      setExpiryAlertsLoading(!hasBrowserFallback);
      setExpiryAlertsRefreshing(true);

      try {
        const response = await fetch(
          `/api/pages?mode=expiry-alerts${forceRefresh ? "&force=1" : ""}`,
          {
            headers,
            cache: forceRefresh ? "no-store" : "default",
          },
        );
        const json = await response.json().catch(() => null);
        const data = parseExpiryAlertsData(json);

        if (!response.ok || !data) {
          throw new Error(
            typeof json?.message === "string"
              ? json.message
              : "دریافت وضعیت انقضای صفحات انجام نشد.",
          );
        }

        setExpiryAlerts(data);
        localStorage.setItem(
          browserCacheKey,
          JSON.stringify({
            savedAt: Date.now(),
            data,
          } satisfies BrowserExpiryCache),
        );
      } catch (error) {
        if (!hasBrowserFallback || forceRefresh) {
          toast.error(
            error instanceof Error
              ? error.message
              : "دریافت وضعیت انقضای صفحات انجام نشد.",
          );
        }
      } finally {
        setExpiryAlertsLoading(false);
        setExpiryAlertsRefreshing(false);
      }
    },
    [canViewExpiryAlerts, expiryAlertsUserId, headers],
  );

  useEffect(() => {
    if (!canViewExpiryAlerts) return;

    const timer = window.setTimeout(() => {
      void loadExpiryAlerts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canViewExpiryAlerts, loadExpiryAlerts, refreshToken]);

  useEffect(() => {
    // Do not request /api/users until the current user is loaded.
    // Normal users must never fetch the users list.
    if (!shouldLoadUsers) return;

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
    () =>
      buildColumns(
        ownerOptions,
        t,
        isDark,
        canEditOwner,
        canAssignPages,
        canEditExpiration,
        openPreviewImage,
      ),
    [
      ownerOptions,
      t,
      isDark,
      canEditOwner,
      canAssignPages,
      canEditExpiration,
      openPreviewImage,
    ],
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

  function getBrandingFooter(page: AdminPageRow | null = brandingPage) {
    return normalizePageFooterSettings(page?.footer);
  }

  function getCurrentBrandingImage(kind: BrandingImageKind) {
    if (kind === "logo") return brandingLogo;
    if (kind === "favicon") return brandingFavicon;
    return brandingTrustBadge;
  }

  function getOriginalBrandingImage(kind: BrandingImageKind) {
    if (kind === "logo") {
      return typeof brandingPage?.logo === "string" ? brandingPage.logo : "";
    }
    if (kind === "favicon") {
      return typeof brandingPage?.favicon === "string"
        ? brandingPage.favicon
        : "";
    }

    const footer = getBrandingFooter();
    return footer.trustBadgeImage;
  }

  function setBrandingImage(kind: BrandingImageKind, url: string) {
    if (kind === "logo") setBrandingLogo(url);
    else if (kind === "favicon") setBrandingFavicon(url);
    else setBrandingTrustBadge(url);
  }

  function openBrandingModal(row: AdminPageRow) {
    const footer = getBrandingFooter(row);

    setBrandingPage(row);
    setBrandingLogo(typeof row.logo === "string" ? row.logo : "");
    setBrandingFavicon(typeof row.favicon === "string" ? row.favicon : "");
    setBrandingTrustBadge(footer.trustBadgeImage);
    setBrandingFooterDescription(footer.description);
    setBrandingFooterBg(footer.backgroundColor);
    setBrandingFooterText(footer.textColor);
    setBrandingFooterAccent(footer.accentColor);
    setBrandingFooterBorder(footer.borderColor);
    setBrandingShowRadlink(footer.showRadlinkBranding);
    setBrandingCustomHomeScreenIcon(
      isCustomHomeScreenIconEnabled(row.settings),
    );
  }

  async function uploadBrandingImage(kind: BrandingImageKind, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویر قابل آپلود است.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم تصویر باید کمتر از ۵ مگابایت باشد.");
      return;
    }

    const currentUrl = getCurrentBrandingImage(kind);
    const originalUrl = getOriginalBrandingImage(kind);

    try {
      setUploadingBranding(kind);
      const uploaded = await uploadFile(file);
      setBrandingImage(kind, uploaded.url);
      if (currentUrl && currentUrl !== originalUrl) {
        deleteFile({ url: currentUrl }).catch(() => {
          console.warn("Temporary branding image cleanup failed.");
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "آپلود تصویر انجام نشد.",
      );
    } finally {
      setUploadingBranding(null);
    }
  }

  async function removeBrandingImage(kind: BrandingImageKind) {
    const currentUrl = getCurrentBrandingImage(kind);
    const originalUrl = getOriginalBrandingImage(kind);
    if (!currentUrl || deletingBranding) return;

    try {
      setDeletingBranding(kind);
      if (currentUrl !== originalUrl) {
        await deleteFile({ url: currentUrl });
      }
      setBrandingImage(kind, "");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "حذف تصویر انجام نشد.",
      );
    } finally {
      setDeletingBranding(null);
    }
  }

  function closeBrandingModal() {
    const originalLogo =
      typeof brandingPage?.logo === "string" ? brandingPage.logo : "";
    const originalFavicon =
      typeof brandingPage?.favicon === "string" ? brandingPage.favicon : "";
    const pendingUrls = [
      brandingLogo && brandingLogo !== originalLogo ? brandingLogo : "",
      brandingFavicon && brandingFavicon !== originalFavicon
        ? brandingFavicon
        : "",
      brandingTrustBadge &&
      brandingTrustBadge !== getBrandingFooter().trustBadgeImage
        ? brandingTrustBadge
        : "",
    ].filter(Boolean);

    setBrandingPage(null);
    for (const url of new Set(pendingUrls)) {
      deleteFile({ url }).catch(() => {
        console.warn("Discarded branding image cleanup failed.");
      });
    }
  }

  async function saveBranding() {
    const pageId = String(brandingPage?._id ?? brandingPage?.id ?? "");
    if (!pageId || savingBranding || uploadingBranding || deletingBranding)
      return;

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
          ...(canEditHomeScreenIcon
            ? {
                [CUSTOM_HOME_SCREEN_ICON_SETTING_KEY]:
                  brandingCustomHomeScreenIcon,
              }
            : {}),
          footer: {
            logo: "",
            trustBadgeImage: brandingTrustBadge,
            description: brandingFooterDescription,
            backgroundColor: brandingFooterBg,
            textColor: brandingFooterText,
            accentColor: brandingFooterAccent,
            borderColor: brandingFooterBorder,
            ...(canEditRadlinkBranding
              ? { showRadlinkBranding: brandingShowRadlink }
              : {}),
          } satisfies Partial<PageFooterSettings>,
        }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "ذخیره تصاویر صفحه انجام نشد.");
      }

      toast.success("برندینگ و فوتر صفحه ذخیره شدند.");
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

  async function cleanupDiscardedPageImages(
    item: Partial<AdminPageRow>,
    original: AdminPageRow | null,
  ) {
    const originalLogo =
      typeof original?.logo === "string" ? original.logo : "";
    const originalFavicon =
      typeof original?.favicon === "string" ? original.favicon : "";
    const pendingUrls = [
      typeof item.logo === "string" && item.logo !== originalLogo
        ? item.logo
        : "",
      typeof item.favicon === "string" && item.favicon !== originalFavicon
        ? item.favicon
        : "",
    ].filter(Boolean);

    const results = await Promise.allSettled(
      [...new Set(pendingUrls)].map((url) => deleteFile({ url })),
    );
    if (results.some((result) => result.status === "rejected")) {
      toast.error("حذف برخی تصاویر لغوشده انجام نشد.");
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

      {canViewExpiryAlerts && (
        <PageExpiryAlertsPanel
          data={expiryAlerts}
          loading={expiryAlertsLoading}
          refreshing={expiryAlertsRefreshing}
          onRefresh={() => void loadExpiryAlerts(true)}
        />
      )}

      {/* ── Table ── */}
      <DynamicTable<AdminPageRow>
        endpoint="/api/pages"
        refreshKey={refreshToken}
        updateMethod="PATCH"
        onFormDiscard={cleanupDiscardedPageImages}
        onCreate={async (item, builtInCreate) => {
          await builtInCreate(item);
          await loadExpiryAlerts(true);
        }}
        onUpdate={async (item, builtInUpdate) => {
          if (!canManageOwners) {
            const updatePayload = Object.fromEntries(
              Object.entries(item).filter(
                ([key]) =>
                  key !== "ownerId" &&
                  key !== "owner" &&
                  key !== "assignedUserId" &&
                  key !== "assignedUser" &&
                  key !== "expiresAt",
              ),
            );
            await builtInUpdate(updatePayload as AdminPageRow);
          } else {
            await builtInUpdate(item);
          }
          toast.success("تغییر اعمال شد");
          await loadExpiryAlerts(true);
        }}
        onDelete={async (item, builtInRemove) => {
          await builtInRemove(item);
          await loadExpiryAlerts(true);
        }}
        columns={columns}
        title="لیست صفحات"
        subtitle="مشاهده، جستجو و مرور تمامی صفحات"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
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
        serverSide
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
                  title="مدیریت برندینگ و فوتر"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    isDark
                      ? "text-sky-400/70 hover:bg-sky-500/10 hover:text-sky-400"
                      : "text-sky-600/70 hover:bg-sky-500/8 hover:text-sky-600",
                  )}
                >
                  <FaImage className="h-4 w-4" />
                  <span className="sr-only">مدیریت برندینگ و فوتر</span>
                </button>
              )}

              {canUpdateThisPage && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    if (pageId) {
                      window.open(
                        `/builder/${pageId}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }
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
          aria-label="مدیریت برندینگ و فوتر صفحه"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !savingBranding &&
              !uploadingBranding &&
              !deletingBranding
            ) {
              closeBrandingModal();
            }
          }}
        >
          <div
            className={cn(
              "flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:rounded-2xl",
              brandingModalTheme.modalBg,
              brandingModalTheme.borderSubtle,
            )}
          >
            <div
              className={cn("border-b px-5 py-4", brandingModalTheme.divider)}
            >
              <h2
                className={cn(
                  "text-base font-black",
                  brandingModalTheme.textPrimary,
                )}
              >
                برندینگ و فوتر صفحه
              </h2>
              <p className={cn("mt-1 text-xs", brandingModalTheme.textMuted)}>
                {String(brandingPage.title || "صفحه")}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2">
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
                    {
                      kind: "trustBadge" as const,
                      label: "تصویر نماد",
                      value: brandingTrustBadge,
                    },
                  ] as const
                ).map((item) => (
                  <div key={item.kind}>
                    <label
                      className={cn(
                        "mb-2 block text-xs font-bold",
                        brandingModalTheme.textSecondary,
                      )}
                    >
                      {item.label}
                    </label>
                    <label
                      className={cn(
                        "relative flex min-h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition",
                        brandingModalTheme.inputBg,
                        brandingModalTheme.borderInput,
                        uploadingBranding || deletingBranding
                          ? "pointer-events-none opacity-70"
                          : brandingModalTheme.hoverBg,
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
                        <span
                          className={cn(
                            "text-xs font-medium",
                            brandingModalTheme.textMuted,
                          )}
                        >
                          انتخاب تصویر
                        </span>
                      )}
                      {(uploadingBranding === item.kind ||
                        deletingBranding === item.kind) && (
                        <span
                          className={cn(
                            "relative z-10 h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent",
                            brandingModalTheme.textSecondary,
                          )}
                        />
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
                        onClick={() => void removeBrandingImage(item.kind)}
                        disabled={
                          Boolean(uploadingBranding) ||
                          Boolean(deletingBranding)
                        }
                        className={cn(
                          "mt-2 text-xs font-bold disabled:opacity-50",
                          brandingModalTheme.errorText,
                        )}
                      >
                        {deletingBranding === item.kind
                          ? "در حال حذف..."
                          : "حذف تصویر"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-xs leading-6",
                    brandingModalTheme.inputBg,
                    brandingModalTheme.borderInput,
                    brandingModalTheme.textMuted,
                  )}
                >
                  لوگوی فوتر به صورت خودکار از لوگوی اصلی صفحه استفاده می‌کند.
                </div>

                <label className="block">
                  <span
                    className={cn(
                      "mb-2 block text-xs font-bold",
                      brandingModalTheme.textSecondary,
                    )}
                  >
                    متن زیر لوگوی فوتر
                  </span>
                  <textarea
                    value={brandingFooterDescription}
                    onChange={(event) =>
                      setBrandingFooterDescription(event.target.value)
                    }
                    rows={3}
                    className={cn(
                      "w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition",
                      brandingModalTheme.inputBg,
                      brandingModalTheme.borderInput,
                      brandingModalTheme.borderFocus,
                      brandingModalTheme.textPrimary,
                    )}
                    placeholder="مثلا: همراه شما برای تجربه‌ای بهتر"
                  />
                </label>

                <div>
                  <h3
                    className={cn(
                      "text-sm font-black",
                      brandingModalTheme.textPrimary,
                    )}
                  >
                    رنگ‌های فوتر
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-6",
                      brandingModalTheme.textMuted,
                    )}
                  >
                    این رنگ‌ها مستقل از رنگ لوگوی صفحه ذخیره می‌شوند و در خروجی
                    لندینگ نمایش داده می‌شوند.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "پس‌زمینه فوتر",
                      element: "بدنه فوتر",
                      helper: "رنگ سطح اصلی فوتر و فضای پشت لوگو و نماد.",
                      value: brandingFooterBg,
                      onChange: setBrandingFooterBg,
                    },
                    {
                      label: "متن‌های فوتر",
                      element: "توضیحات و کپی‌رایت",
                      helper: "رنگ متن زیر لوگو و نوشته پایین فوتر.",
                      value: brandingFooterText,
                      onChange: setBrandingFooterText,
                    },
                    {
                      label: "رنگ تاکید",
                      element: "عنوان و جزئیات برجسته",
                      helper: "رنگ نام صفحه، حرف جایگزین لوگو و تاکیدهای کوچک.",
                      value: brandingFooterAccent,
                      onChange: setBrandingFooterAccent,
                    },
                    {
                      label: "خط و حاشیه",
                      element: "کادرها و جداکننده",
                      helper: "رنگ دور فوتر، خط جداکننده و کادر نماد اعتماد.",
                      value: brandingFooterBorder,
                      onChange: setBrandingFooterBorder,
                    },
                  ].map((field) => (
                    <div
                      key={field.label}
                      className={cn(
                        "rounded-xl border p-3",
                        brandingModalTheme.inputBg,
                        brandingModalTheme.borderInput,
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={cn(
                              "text-xs font-black",
                              brandingModalTheme.textPrimary,
                            )}
                          >
                            {field.label}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-[11px] leading-5",
                              brandingModalTheme.textMuted,
                            )}
                          >
                            {field.helper}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                            brandingModalTheme.badgeBg,
                            brandingModalTheme.badgeText,
                          )}
                        >
                          {field.element}
                        </span>
                      </div>
                      <RgbaColorInput
                        value={field.value}
                        onChange={field.onChange}
                        label={field.label}
                        swatchClassName="h-10 w-12 rounded-xl"
                        className="min-w-0"
                        inputClassName={brandingColorInputClassName}
                      />
                    </div>
                  ))}
                </div>

                {canEditHomeScreenIcon ? (
                  <label
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3",
                      brandingModalTheme.inputBg,
                      brandingModalTheme.borderInput,
                    )}
                  >
                    <span>
                      <span
                        className={cn(
                          "flex items-center gap-2 text-sm font-bold",
                          brandingModalTheme.textPrimary,
                        )}
                      >
                        استفاده از فاوآیکون صفحه برای آیکون موبایل
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px]",
                            brandingCustomHomeScreenIcon
                              ? `${brandingModalTheme.successBg} ${brandingModalTheme.successText}`
                              : `${brandingModalTheme.errorBg} ${brandingModalTheme.errorText}`,
                          )}
                        >
                          {brandingCustomHomeScreenIcon ? "فعال" : "رادلینک"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-1 block text-xs leading-6",
                          brandingModalTheme.textMuted,
                        )}
                      >
                        اگر خاموش باشد، تب مرورگر و Add to Home Screen از آیکون
                        رادلینک استفاده می‌کنند؛ حتی اگر فاوآیکون صفحه آپلود شده
                        باشد.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={brandingCustomHomeScreenIcon}
                      onChange={(event) =>
                        setBrandingCustomHomeScreenIcon(event.target.checked)
                      }
                      className={cn(
                        "h-5 w-5 rounded border-neutral-300 focus:ring-0",
                        brandingModalTheme.checkboxAccent,
                      )}
                    />
                  </label>
                ) : null}

                {canEditRadlinkBranding ? (
                  <label
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3",
                      brandingModalTheme.inputBg,
                      brandingModalTheme.borderInput,
                    )}
                  >
                    <span>
                      <span
                        className={cn(
                          "flex items-center gap-2 text-sm font-bold",
                          brandingModalTheme.textPrimary,
                        )}
                      >
                        نمایش متن ساخته شده با رادلینک
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px]",
                            brandingShowRadlink
                              ? `${brandingModalTheme.successBg} ${brandingModalTheme.successText}`
                              : `${brandingModalTheme.errorBg} ${brandingModalTheme.errorText}`,
                          )}
                        >
                          {brandingShowRadlink ? "فعال" : "خاموش"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-1 block text-xs",
                          brandingModalTheme.textMuted,
                        )}
                      >
                        فقط سوپر ادمین می‌تواند این متن را برای هر صفحه خاموش یا
                        روشن کند. حالت پیش‌فرض فعال است.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={brandingShowRadlink}
                      onChange={(event) =>
                        setBrandingShowRadlink(event.target.checked)
                      }
                      className={cn(
                        "h-5 w-5 rounded border-neutral-300 focus:ring-0",
                        brandingModalTheme.checkboxAccent,
                      )}
                    />
                  </label>
                ) : null}
              </div>
            </div>

            <div
              className={cn(
                "flex gap-3 border-t p-4",
                brandingModalTheme.divider,
              )}
            >
              <button
                type="button"
                onClick={closeBrandingModal}
                disabled={
                  savingBranding ||
                  Boolean(uploadingBranding) ||
                  Boolean(deletingBranding)
                }
                className={cn(
                  "flex-1 rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50",
                  brandingModalTheme.borderInput,
                  brandingModalTheme.textSecondary,
                  brandingModalTheme.hoverBg,
                )}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => void saveBranding()}
                disabled={
                  savingBranding ||
                  Boolean(uploadingBranding) ||
                  Boolean(deletingBranding)
                }
                className={cn(
                  "flex-1 rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-50",
                  brandingModalTheme.primaryButton,
                )}
              >
                {savingBranding ? "در حال ذخیره..." : "ذخیره برندینگ و فوتر"}
              </button>
            </div>
          </div>
        </div>
      )}
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
