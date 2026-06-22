"use client";

import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaArrowRotateRight,
  FaCubes,
  FaPowerOff,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useAccess } from "@/hook/auth/useAccess";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import type { ColumnDef } from "@/types/table";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type BlockRow = {
  _id: string;
  id: string;
  name: string;
  type: string;
  description?: string;
  category?: string;
  icon?: string;
  version: number;
  elementCount: number;
  contentFieldCount: number;
  hasDefaultBlock: boolean;
  isActive: boolean;
  [key: string]: unknown;
};

export default function BlocksSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can, canOnResource } = useAccess();
  const canUpdateBlocks = can("admin.blocks", "update");
  const canDeleteBlocks = can("admin.blocks", "delete");
  const [tableKey, setTableKey] = useState(0);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [togglingBlockId, setTogglingBlockId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  /* ── columns inside component so theme tokens are accessible ── */
  const columns: ColumnDef<BlockRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام بلاک",
        editable: false,
        sortable: true,
        render: (value, row) => (
          <span className="block">
            <span className={cn("block text-sm font-semibold", t.textPrimary)}>
              {String(value ?? "-")}
            </span>
            {row.description && (
              <span
                className={cn(
                  "mt-0.5 block max-w-[18rem] truncate text-xs",
                  t.textDisabled,
                )}
              >
                {row.description}
              </span>
            )}
          </span>
        ),
      },
      {
        key: "type",
        label: "نوع",
        editable: false,
        sortable: true,
        render: (value) => (
          <span
            className={cn(
              "inline-flex items-center rounded-lg border px-2 py-1 font-mono text-[11px]",
              t.borderSubtle,
              t.inputBg,
              t.textMuted,
            )}
          >
            {String(value ?? "-")}
          </span>
        ),
      },
      {
        key: "category",
        label: "دسته",
        editable: false,
        filterable: true,
        render: (value) => (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
              isDark
                ? "bg-violet-500/[0.08] text-violet-400 ring-violet-500/15"
                : "bg-violet-500/[0.06] text-violet-600 ring-violet-500/12",
            )}
          >
            {String(value ?? "-")}
          </span>
        ),
      },
      {
        key: "elementCount",
        label: "المنت‌ها",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className={cn("font-mono text-sm", t.textMuted)}>
            {String(value ?? 0)}
          </span>
        ),
      },
      {
        key: "version",
        label: "نسخه",
        editable: false,
        sortable: true,
        hideOnMobile: true,
        render: (value) => (
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs",
              isDark
                ? "bg-[#c8a84b]/10 text-[#c8a84b]"
                : "bg-[#8a7030]/8 text-[#8a7030]",
            )}
          >
            v{String(value ?? 1)}
          </span>
        ),
      },
      {
        key: "isActive",
        label: "وضعیت",
        editable: false,
        filterable: true,
        render: (value) => {
          const active = !!value;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                active
                  ? "bg-emerald-500/[0.08] text-emerald-400 ring-emerald-500/15"
                  : isDark
                    ? "bg-[#6e6a62]/10 text-[#9c9890] ring-[#6e6a62]/15"
                    : "bg-black/[0.04] text-[#6B5D3E] ring-black/[0.06]",
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
    ],
    [t, isDark],
  );

  const transformResponse = useMemo(
    () =>
      (json: unknown): BlockRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.blocks)
            ? json.blocks
            : Array.isArray(json)
              ? json
              : [];

        return raw.filter(isRecord).map((block) => {
          const id = String(block._id ?? block.id ?? "");
          const elements = isRecord(block.elements) ? block.elements : {};
          const contentFields = Array.isArray(block.contentFields)
            ? block.contentFields
            : [];
          const defaultBlock = isRecord(block.defaultBlock)
            ? block.defaultBlock
            : {};

          return {
            ...block,
            _id: id,
            id,
            name: String(block.name ?? ""),
            type: String(block.type ?? ""),
            description:
              typeof block.description === "string"
                ? block.description
                : undefined,
            category:
              typeof block.category === "string" ? block.category : undefined,
            icon: typeof block.icon === "string" ? block.icon : undefined,
            version: Number(block.version ?? 1),
            elementCount: Object.keys(elements).length,
            contentFieldCount: contentFields.length,
            hasDefaultBlock:
              isRecord(defaultBlock.data) && isRecord(defaultBlock.elements),
            isActive: block.isActive !== false,
          };
        });
      },
    [],
  );

  async function syncBlocks() {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/blocks/sync", {
        method: "POST",
        headers,
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در همگام سازی بلاک‌ها");
      }
      toast.success(json?.message ?? "بلاک‌ها همگام سازی شدند");
      setTableKey((key) => key + 1);
      setRefreshToken((token) => token + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در همگام سازی بلاک‌ها",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function toggleBlockStatus(row: BlockRow) {
    const nextStatus = !row.isActive;

    try {
      setTogglingBlockId(row._id);
      const response = await fetch(`/api/blocks/${row._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در تغییر وضعیت بلاک");
      }
      toast.success(nextStatus ? "بلاک فعال شد" : "بلاک غیرفعال شد");
      setTableKey((key) => key + 1);
      setRefreshToken((token) => token + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت بلاک",
      );
    } finally {
      setTogglingBlockId(null);
    }
  }

  /* ── shared button styles ── */
  const syncBtn = cn(
    "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    isDark
      ? "bg-emerald-500/[0.08] text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15"
      : "bg-emerald-500/[0.06] text-emerald-600 ring-1 ring-emerald-500/15 hover:bg-emerald-500/10",
  );

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
                  ? "border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-400"
                  : "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600",
              )}
            >
              <FaCubes className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت بلاک‌ها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                بلاک‌های صفحه‌ساز از registry به دیتابیس sync می‌شوند
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canUpdateBlocks && (
              <button
                type="button"
                onClick={syncBlocks}
                disabled={isSyncing}
                className={syncBtn}
              >
                <FaArrowRotateRight
                  className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")}
                />
                <span>{isSyncing ? "در حال sync..." : "Sync بلاک‌ها"}</span>
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
      <DynamicTable<BlockRow>
        key={tableKey}
        endpoint={`/api/blocks?refresh=${refreshToken}`}
        columns={columns}
        title="لیست بلاک‌ها"
        subtitle="snapshot ذخیره‌شده هر بلاک در دیتابیس"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[20, 50, 100]}
        searchable
        exportable
        exportFileName="blocks"
        stickyHeader
        showRowNumbers
        enableCellCopy
        canCreate={false}
        canUpdate={false}
        canDelete={canDeleteBlocks}
        onDelete={async (item, builtInDelete) => {
          await builtInDelete(item);
          toast.success("بلاک غیرفعال شد");
          setTableKey((key) => key + 1);
          setRefreshToken((token) => token + 1);
        }}
        rowActions={(row) => {
          const isLoading = togglingBlockId === row._id;
          const canUpdateThisBlock =
            canUpdateBlocks || canOnResource("blocks", row._id, "update");

          if (!canUpdateThisBlock) return null;

          return (
            <button
              type="button"
              onClick={() => toggleBlockStatus(row)}
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
                className={cn("h-3.5 w-3.5", isLoading && "animate-pulse")}
                aria-hidden="true"
              />
              <span className="sr-only">
                {row.isActive ? "غیرفعال کردن" : "فعال کردن"}
              </span>
            </button>
          );
        }}
        transformResponse={transformResponse}
        emptyMessage="بلاکی یافت نشد. ابتدا Sync بلاک‌ها را بزنید."
      />
    </div>
  );
}
