"use client";

import { useCallback, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaFile,
  FaFileImage,
  FaFileLines,
  FaFilePdf,
  FaFolderOpen,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
import { useTheme } from "@/contexts/ThemeContext";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import type { ColumnDef } from "@/types/table";
import { deleteFile } from "@/lib/fileUtils";

type UserRef = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
};

type PageRef = {
  _id?: string;
  id?: string;
  title?: string;
  url?: string;
};

type FileRow = {
  _id: string;
  id: string;
  filename: string;
  path: string;
  owner?: UserRef | string;
  ownerId: string;
  ownerLabel: string;
  kind: "upload" | "qr" | "ticket";
  page?: PageRef | string;
  pageLabel: string;
  fileType: string;
  isImage: boolean;
  createdAt?: string;
  [key: string]: unknown;
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
  const id = value._id ?? value.id;
  return typeof id === "string" ? id : "";
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function formatFaDate(value: unknown) {
  if (typeof value !== "string" || !value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOwnerLabel(value: unknown, fallback = "-") {
  if (!isRecord(value)) return fallback;

  const fullName = [value.firstName, value.lastName]
    .filter((part) => typeof part === "string" && part.trim())
    .join(" ")
    .trim();

  return (
    fullName ||
    toText(value.phoneNumber) ||
    toText(value.email) ||
    getId(value) ||
    fallback
  );
}

function getPageLabel(value: unknown) {
  if (!isRecord(value)) return "-";
  const title = toText(value.title);
  const url = toText(value.url);
  return title && url ? `${title} (/${url})` : title || url || "-";
}

function getExtension(filename: string, path: string) {
  const source = filename || path.split("?")[0] || "";
  const extension = source.includes(".")
    ? source.split(".").pop()?.toLowerCase()
    : "";
  return extension || "file";
}

function getFileMeta(filename: string, path: string) {
  const extension = getExtension(filename, path);
  const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

  if (imageExtensions.has(extension)) {
    return { extension, label: "تصویر", isImage: true };
  }
  if (extension === "pdf") {
    return { extension, label: "PDF", isImage: false };
  }
  if (["doc", "docx", "txt"].includes(extension)) {
    return { extension, label: "سند", isImage: false };
  }
  return { extension, label: "فایل", isImage: false };
}

function normalizeFile(value: unknown): FileRow | null {
  if (!isRecord(value)) return null;

  const id = getId(value);
  if (!id) return null;

  const filename = toText(value.filename) || "بدون نام";
  const path = toText(value.path);
  const ownerId = getId(value.owner);
  const meta = getFileMeta(filename, path);

  return {
    ...value,
    _id: id,
    id,
    filename,
    path,
    owner: value.owner as UserRef | string | undefined,
    ownerId,
    ownerLabel: getOwnerLabel(value.owner, ownerId || "-"),
    kind:
      value.kind === "qr"
        ? "qr"
        : value.kind === "ticket"
          ? "ticket"
          : "upload",
    page: value.page as PageRef | string | undefined,
    pageLabel: getPageLabel(value.page),
    fileType: meta.label,
    isImage: meta.isImage,
    createdAt: toText(value.createdAt) || undefined,
  };
}

function FileTypeIcon({
  filename,
  path,
}: {
  filename: string;
  path: string;
}) {
  const extension = getExtension(filename, path);
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return <FaFileImage className="h-4 w-4" />;
  }
  if (extension === "pdf") return <FaFilePdf className="h-4 w-4" />;
  if (["doc", "docx", "txt"].includes(extension)) {
    return <FaFileLines className="h-4 w-4" />;
  }
  return <FaFile className="h-4 w-4" />;
}

export default function FilesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const canDeleteFiles = can("admin.files", "delete");
  const canViewFiles = can("admin.files", "view");
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const closePreviewImage = useCallback(() => setPreviewImage(null), []);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  const columns: ColumnDef<FileRow>[] = useMemo(
    () => [
      {
        key: "filename",
        label: "نام فایل",
        editable: false,
        sortable: true,
        copyable: true,
        render: (value, row) => (
          <span className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
                t.borderSubtle,
                t.inputBg,
                isDark ? "text-sky-400" : "text-sky-600",
              )}
            >
              {row.isImage && row.path ? (
                <button
                  type="button"
                  title="پیش‌نمایش تصویر"
                  aria-label={`پیش‌نمایش ${row.filename}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setPreviewImage({
                      src: row.path,
                      title: row.filename,
                    });
                  }}
                  className="h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${row.path}")` }}
                />
              ) : (
                <FileTypeIcon filename={row.filename} path={row.path} />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block max-w-[18rem] truncate text-sm font-semibold",
                  t.textPrimary,
                )}
              >
                {String(value || "بدون نام")}
              </span>
              <span
                className={cn(
                  "mt-0.5 block font-mono text-[11px] uppercase",
                  t.textDisabled,
                )}
              >
                {getExtension(row.filename, row.path)}
              </span>
            </span>
          </span>
        ),
      },
      {
        key: "fileType",
        label: "نوع فایل",
        editable: false,
        filterable: true,
        render: (value) => (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              isDark
                ? "bg-blue-500/[0.08] text-blue-400 ring-blue-500/15"
                : "bg-blue-500/[0.06] text-blue-600 ring-blue-500/15",
            )}
          >
            {String(value || "فایل")}
          </span>
        ),
      },
      {
        key: "kind",
        label: "منبع فایل",
        editable: false,
        filterable: true,
        options: [
          { label: "آپلود کاربر", value: "upload" },
          { label: "فایل تیکت", value: "ticket" },
          { label: "کد QR", value: "qr" },
        ],
        render: (value) => (
          <span className={cn("text-sm font-semibold", t.textMuted)}>
            {value === "qr"
              ? "کد QR"
              : value === "ticket"
                ? "فایل تیکت"
                : "آپلود کاربر"}
          </span>
        ),
      },
      {
        key: "pageLabel",
        label: "صفحه مرتبط",
        editable: false,
        sortable: true,
        hideOnMobile: true,
        render: (value, row) => (
          <span className={cn("text-sm", t.textMuted)}>
            {row.kind === "qr" ? String(value || "-") : "-"}
          </span>
        ),
      },
      {
        key: "ownerLabel",
        label: "آپلودکننده",
        editable: false,
        sortable: true,
        copyable: true,
        filterable: true,
        filterSearchable: true,
        render: (value) => (
          <span className={cn("text-sm font-medium", t.textMuted)}>
            {String(value || "-")}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: "تاریخ ایجاد",
        editable: false,
        sortable: true,
        dateFilter: true,
        hideOnMobile: true,
        render: (value) => (
          <span className={cn("text-sm", t.textMuted)}>
            {formatFaDate(value)}
          </span>
        ),
      },
      {
        key: "path",
        label: "آدرس فایل",
        editable: false,
        copyable: true,
        hideOnMobile: true,
        render: (value) => (
          <span
            className={cn(
              "block max-w-[20rem] truncate font-mono text-xs",
              t.textDisabled,
            )}
            dir="ltr"
          >
            {String(value || "-")}
          </span>
        ),
      },
    ],
    [isDark, t],
  );

  const transformResponse = useMemo(
    () =>
      (json: unknown): FileRow[] => {
        const raw =
          isRecord(json) && Array.isArray(json.files)
            ? json.files
            : Array.isArray(json)
              ? json
              : [];

        return raw
          .map(normalizeFile)
          .filter((file): file is FileRow => Boolean(file));
      },
    [],
  );

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-6",
          t.borderSubtle,
          t.modalBg,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                isDark
                  ? "border-sky-500/15 bg-sky-500/[0.08] text-sky-400"
                  : "border-sky-500/20 bg-sky-500/[0.06] text-sky-600",
              )}
            >
              <FaFolderOpen className="h-5 w-5" />
            </span>
            <span>
              <span
                className={cn(
                  "block text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت فایل‌ها
              </span>
              <span className={cn("mt-0.5 block text-xs sm:text-sm", t.textMuted)}>
                مشاهده فایل‌ها و کاربری که هر فایل را آپلود کرده است
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("dashboard")}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors",
              t.borderAccent,
              t.textAccent,
              t.hoverBg,
            )}
          >
            <FaArrowRight className="h-3.5 w-3.5" />
            بازگشت به داشبورد
          </button>
        </div>
      </div>

      <DynamicTable<FileRow>
        endpoint={`/api/files?refresh=${refreshToken}`}
        columns={columns}
        title="لیست فایل‌ها"
        subtitle="فایل‌های آپلودشده همراه با مشخصات آپلودکننده"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[10, 20, 50, 100]}
        searchable
        exportable
        exportFileName="files"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete={canDeleteFiles}
        transformResponse={transformResponse}
        serverSide
        onDelete={async (item) => {
          await deleteFile({ fileId: item._id });
          setRefreshToken((value) => value + 1);
          toast.success("فایل حذف شد.");
        }}
        rowActions={(row) =>
          row.path && canViewFiles ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                window.open(row.path, "_blank", "noopener,noreferrer");
              }}
              title="باز کردن فایل"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                isDark
                  ? "text-sky-400/75 hover:bg-sky-500/10 hover:text-sky-400"
                  : "text-sky-600/75 hover:bg-sky-500/10 hover:text-sky-600",
              )}
            >
              <FaArrowUpRightFromSquare className="h-3.5 w-3.5" />
              <span className="sr-only">باز کردن فایل</span>
            </button>
          ) : null
        }
        emptyMessage="فایلی یافت نشد."
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
