"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineChevronDown,
  HiOutlineExclamationTriangle,
  HiOutlineFunnel,
  HiOutlinePencilSquare,
  HiOutlinePhone,
} from "react-icons/hi2";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import type {
  PageExpiryAlert,
  PageExpiryAlertsData,
} from "@/lib/pages/pageExpiryAlertsCache";
import {
  getPageExpiryStatus,
  type PageExpirySeverity,
} from "@/lib/pages/pageExpiryStatus";

const EXPIRY_PANEL_STORAGE_KEY = "radlink:page-expiry-alerts:expanded";
const DEFAULT_VISIBLE_ALERTS = 8;
const MAX_VISIBLE_ALERTS = 12;

/** Urgency order: the most actionable items surface first. */
const SEVERITY_ORDER: Record<PageExpirySeverity, number> = {
  critical: 0,
  warning: 1,
  expired: 2,
  safe: 3,
  none: 4,
};

type SeverityFilter = "all" | "critical" | "warning" | "expired";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function toFa(value: number) {
  return value.toLocaleString("fa-IR");
}

function formatFaDate(value: string) {
  return new Date(value).toLocaleString("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityLabel(
  severity: PageExpirySeverity,
  daysRemaining: number | null,
) {
  if (severity === "none") return "بدون انقضا";
  if (severity === "expired") return "منقضی شده";
  if (daysRemaining === 0) return "امروز منقضی می‌شود";
  if (daysRemaining === 1) return "۱ روز مانده";
  return `${toFa(daysRemaining ?? 0)} روز مانده`;
}

function severityClasses(severity: PageExpirySeverity, isDark: boolean) {
  if (severity === "expired") {
    return isDark
      ? "bg-white/[0.05] text-neutral-400 ring-white/10"
      : "bg-neutral-100 text-neutral-600 ring-neutral-200";
  }
  if (severity === "critical") {
    return isDark
      ? "bg-red-500/10 text-red-300 ring-red-500/20"
      : "bg-red-50 text-red-700 ring-red-200";
  }
  if (severity === "warning") {
    return isDark
      ? "bg-orange-500/10 text-orange-300 ring-orange-500/20"
      : "bg-orange-50 text-orange-700 ring-orange-200";
  }
  if (severity === "safe") {
    return isDark
      ? "bg-blue-500/10 text-blue-300 ring-blue-500/20"
      : "bg-blue-50 text-blue-700 ring-blue-200";
  }
  return isDark
    ? "bg-white/[0.04] text-neutral-400 ring-white/10"
    : "bg-black/[0.03] text-neutral-500 ring-black/5";
}

/** Small pulsing dot that matches the severity — instant scannability. */
function severityDotClass(severity: PageExpirySeverity) {
  if (severity === "critical") return "bg-red-500 animate-pulse";
  if (severity === "warning") return "bg-orange-500";
  if (severity === "expired") return "bg-neutral-400";
  if (severity === "safe") return "bg-blue-500";
  return "bg-neutral-400";
}

export function PageExpiryBadge({
  expiresAt,
  showDate = true,
  compact = false,
}: {
  expiresAt: unknown;
  showDate?: boolean;
  compact?: boolean;
}) {
  const { isDark } = useTheme();
  const status = getPageExpiryStatus(expiresAt);
  const date =
    status.expiresAt && !Number.isNaN(status.expiresAt.getTime())
      ? status.expiresAt.toISOString()
      : null;

  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-col rounded-md font-semibold ring-1",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        severityClasses(status.severity, isDark),
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            severityDotClass(status.severity),
          )}
          aria-hidden="true"
        />
        {severityLabel(status.severity, status.daysRemaining)}
      </span>
      {showDate && date && (
        <span className="mt-0.5 whitespace-nowrap text-[10px] font-medium opacity-75">
          {formatFaDate(date)}
        </span>
      )}
    </span>
  );
}

function ownerName(alert: PageExpiryAlert) {
  const fullName = [alert.owner?.firstName, alert.owner?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || "مالک نامشخص";
}

function pageHref(url: string) {
  return /^https?:\/\//i.test(url) ? url : `/${url.replace(/^\/+/, "")}`;
}

function alertCardClasses(severity: PageExpirySeverity, isDark: boolean) {
  if (severity === "critical") {
    return isDark
      ? "border-red-500/20 bg-red-500/[0.035] hover:border-red-500/35"
      : "border-red-200 bg-red-50/40 hover:border-red-300";
  }
  if (severity === "warning") {
    return isDark
      ? "border-orange-500/20 bg-orange-500/[0.035] hover:border-orange-500/35"
      : "border-orange-200 bg-orange-50/40 hover:border-orange-300";
  }
  return isDark
    ? "border-white/10 bg-white/[0.02] hover:border-white/20"
    : "border-neutral-200 bg-white hover:border-neutral-300";
}

/** Vertical accent strip on the card's leading (right, RTL) edge. */
function accentStripClass(severity: PageExpirySeverity) {
  if (severity === "critical") return "bg-red-500/70";
  if (severity === "warning") return "bg-orange-500/60";
  if (severity === "expired") return "bg-neutral-400/40";
  return "bg-transparent";
}

/* ── Filter pill (interactive count chips) ── */

function FilterPill({
  label,
  count,
  active,
  tone,
  isDark,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  tone: "red" | "orange" | "neutral" | "all";
  isDark: boolean;
  onClick: () => void;
}) {
  const toneClasses =
    tone === "red"
      ? "bg-red-500/10 text-red-500"
      : tone === "orange"
        ? "bg-orange-500/10 text-orange-500"
        : tone === "neutral"
          ? isDark
            ? "bg-white/[0.06] text-neutral-400"
            : "bg-neutral-100 text-neutral-600"
          : isDark
            ? "bg-white/[0.06] text-neutral-300"
            : "bg-neutral-100 text-neutral-700";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md px-2 py-1 text-[10px] font-bold transition-all duration-150",
        toneClasses,
        active
          ? cn(
              "ring-1",
              tone === "red" && "ring-red-500/50",
              tone === "orange" && "ring-orange-500/50",
              (tone === "neutral" || tone === "all") &&
                (isDark ? "ring-white/30" : "ring-neutral-400"),
            )
          : "opacity-80 hover:opacity-100",
      )}
    >
      {toFa(count)} {label}
    </button>
  );
}

export default function PageExpiryAlertsPanel({
  data,
  loading,
  refreshing,
  onRefresh,
}: {
  data: PageExpiryAlertsData | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  /* Sort by urgency once: critical first, then fewest days remaining. */
  const sortedAlerts = useMemo(() => {
    const alerts = data?.alerts ?? [];
    return alerts
      .map((alert) => ({ alert, status: getPageExpiryStatus(alert.expiresAt) }))
      .sort((a, b) => {
        const bySeverity =
          SEVERITY_ORDER[a.status.severity] - SEVERITY_ORDER[b.status.severity];
        if (bySeverity !== 0) return bySeverity;
        return (
          (a.status.daysRemaining ?? Number.MAX_SAFE_INTEGER) -
          (b.status.daysRemaining ?? Number.MAX_SAFE_INTEGER)
        );
      });
  }, [data]);

  const filteredAlerts = useMemo(
    () =>
      severityFilter === "all"
        ? sortedAlerts
        : sortedAlerts.filter(
            (item) => item.status.severity === severityFilter,
          ),
    [sortedAlerts, severityFilter],
  );

  const visibleLimit = showAllAlerts
    ? MAX_VISIBLE_ALERTS
    : DEFAULT_VISIBLE_ALERTS;
  const visibleAlerts = filteredAlerts.slice(0, visibleLimit);
  const availableAlertCount = Math.min(
    filteredAlerts.length,
    MAX_VISIBLE_ALERTS,
  );
  const canShowMore = availableAlertCount > DEFAULT_VISIBLE_ALERTS;
  const hiddenInTable = Math.max(
    0,
    (severityFilter === "all"
      ? (data?.counts.total ?? 0)
      : filteredAlerts.length) - MAX_VISIBLE_ALERTS,
  );

  useEffect(() => {
    const syncExpandedState = () => {
      try {
        const saved = localStorage.getItem(EXPIRY_PANEL_STORAGE_KEY);
        setExpanded(saved === null ? true : saved === "true");
      } catch {
        setExpanded(true);
      } finally {
        setStorageHydrated(true);
      }
    };

    syncExpandedState();
    window.addEventListener("storage", syncExpandedState);
    return () => window.removeEventListener("storage", syncExpandedState);
  }, []);

  function toggleExpanded() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    try {
      localStorage.setItem(EXPIRY_PANEL_STORAGE_KEY, String(nextExpanded));
    } catch {
      // The in-memory state still works when storage is unavailable.
    }
  }

  function selectFilter(next: SeverityFilter) {
    /* Toggling the active pill returns to "all"; changing filter
       collapses "show more" so the list starts small again. */
    setSeverityFilter((current) => (current === next ? "all" : next));
    setShowAllAlerts(false);
    if (!expanded) toggleExpanded();
  }

  return (
    <section className="space-y-3" aria-labelledby="page-expiry-alerts-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600",
            )}
          >
            <HiOutlineExclamationTriangle size={17} />
          </span>
          <div className="min-w-0">
            <h2
              id="page-expiry-alerts-title"
              className={cn("text-[13px] font-bold", t.textPrimary)}
            >
              صفحات نیازمند توجه
            </h2>
            <p className={cn("mt-0.5 text-[11px]", t.textMuted)}>
              منقضی‌شده و نزدیک به انقضا — مرتب‌شده بر اساس فوریت
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <FilterPill
            label="بحرانی"
            count={data?.counts.critical ?? 0}
            active={severityFilter === "critical"}
            tone="red"
            isDark={isDark}
            onClick={() => selectFilter("critical")}
          />
          <FilterPill
            label="نزدیک"
            count={data?.counts.warning ?? 0}
            active={severityFilter === "warning"}
            tone="orange"
            isDark={isDark}
            onClick={() => selectFilter("warning")}
          />
          <FilterPill
            label="منقضی"
            count={data?.counts.expired ?? 0}
            active={severityFilter === "expired"}
            tone="neutral"
            isDark={isDark}
            onClick={() => selectFilter("expired")}
          />
          {severityFilter !== "all" && (
            <button
              type="button"
              onClick={() => selectFilter(severityFilter)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition",
                t.hoverBg,
                t.textMuted,
              )}
            >
              <HiOutlineFunnel size={11} />
              نمایش همه
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="به‌روزرسانی وضعیت انقضا"
            aria-label="به‌روزرسانی وضعیت انقضا"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md transition disabled:cursor-wait disabled:opacity-60",
              t.hoverBg,
              t.textMuted,
            )}
          >
            <HiOutlineArrowPath
              size={14}
              className={refreshing ? "animate-spin" : undefined}
            />
          </button>
          <button
            type="button"
            onClick={toggleExpanded}
            title={expanded ? "بستن بخش هشدارها" : "باز کردن بخش هشدارها"}
            aria-label={expanded ? "بستن بخش هشدارها" : "باز کردن بخش هشدارها"}
            aria-expanded={expanded}
            aria-controls="page-expiry-alerts-content"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md transition",
              t.hoverBg,
              t.textMuted,
            )}
          >
            <HiOutlineChevronDown
              size={15}
              className={cn(
                "transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {storageHydrated && expanded && (
        <div id="page-expiry-alerts-content">
          {loading && !data ? (
            <div
              className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
              role="status"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-28 animate-pulse rounded-lg",
                    isDark ? "bg-white/[0.04]" : "bg-black/[0.04]",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
              <span className="sr-only">در حال دریافت وضعیت انقضای صفحات</span>
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-4",
                t.borderSubtle,
                t.modalBg,
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                <HiOutlineCheckCircle size={17} />
              </span>
              <div>
                <p className={cn("text-sm font-medium", t.textMuted)}>
                  {severityFilter === "all"
                    ? "در حال حاضر صفحه‌ای در بازه خطر انقضا نیست."
                    : "موردی در این دسته وجود ندارد."}
                </p>
                {severityFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => selectFilter(severityFilter)}
                    className={cn(
                      "mt-1 text-[11px] font-bold underline-offset-2 hover:underline",
                      t.textMuted,
                    )}
                  >
                    نمایش همه دسته‌ها
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-2 sm:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300",
                  refreshing && "pointer-events-none opacity-60",
                )}
                aria-busy={refreshing}
              >
                {visibleAlerts.map(({ alert, status }) => {
                  const phoneNumber = alert.owner?.phoneNumber?.trim() ?? "";

                  return (
                    <article
                      key={alert.id}
                      className={cn(
                        "relative min-w-0 overflow-hidden rounded-lg border p-3 pr-4 transition-all duration-150",
                        "hover:shadow-sm",
                        alertCardClasses(status.severity, isDark),
                      )}
                    >
                      {/* severity accent strip — leading edge in RTL */}
                      <span
                        className={cn(
                          "absolute inset-y-0 right-0 w-1",
                          accentStripClass(status.severity),
                        )}
                        aria-hidden="true"
                      />

                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className={cn(
                              "truncate text-[12px] font-bold",
                              t.textPrimary,
                            )}
                            title={alert.title}
                          >
                            {alert.title}
                          </h3>
                          <p
                            className={cn(
                              "mt-0.5 truncate font-mono text-[9px]",
                              t.textDisabled,
                            )}
                            dir="ltr"
                          >
                            /{alert.url.replace(/^\/+/, "")}
                          </p>
                        </div>
                        <PageExpiryBadge
                          expiresAt={alert.expiresAt}
                          showDate={false}
                          compact
                        />
                      </div>

                      <div className="mt-2 min-w-0">
                        <p
                          className={cn(
                            "truncate text-[11px] font-semibold",
                            t.textMuted,
                          )}
                        >
                          {ownerName(alert)}
                        </p>
                        {phoneNumber ? (
                          <a
                            href={`tel:${phoneNumber}`}
                            dir="ltr"
                            className={cn(
                              "mt-0.5 block truncate text-[10px] transition hover:text-emerald-500",
                              t.textDisabled,
                            )}
                          >
                            {phoneNumber}
                          </a>
                        ) : (
                          <p
                            className={cn(
                              "mt-0.5 truncate text-[10px]",
                              t.textDisabled,
                            )}
                          >
                            شماره ثبت نشده
                          </p>
                        )}
                      </div>

                      <div
                        className={cn(
                          "mt-2 flex items-center justify-between border-t pt-2",
                          t.divider,
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex min-w-0 items-center gap-1 truncate text-[9px]",
                            t.textDisabled,
                          )}
                          title="زمان انقضا"
                        >
                          <HiOutlineCalendarDays
                            size={12}
                            className="shrink-0"
                          />
                          {formatFaDate(alert.expiresAt)}
                        </span>

                        <div className="flex shrink-0 items-center gap-0.5">
                          {phoneNumber && (
                            <a
                              href={`tel:${phoneNumber}`}
                              title={`تماس با ${ownerName(alert)}`}
                              aria-label={`تماس با ${ownerName(alert)}`}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-emerald-500 transition hover:bg-emerald-500/10 active:scale-95"
                            >
                              <HiOutlinePhone size={14} />
                            </a>
                          )}
                          <a
                            href={pageHref(alert.url)}
                            target="_blank"
                            rel="noreferrer"
                            title="مشاهده صفحه"
                            aria-label={`مشاهده صفحه ${alert.title}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-500/10 active:scale-95"
                          >
                            <HiOutlineArrowTopRightOnSquare size={14} />
                          </a>
                          <a
                            href={`/builder/${alert.id}`}
                            title="ویرایش در صفحه‌ساز"
                            aria-label={`ویرایش صفحه ${alert.title}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-violet-500 transition hover:bg-violet-500/10 active:scale-95"
                          >
                            <HiOutlinePencilSquare size={14} />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {(canShowMore || hiddenInTable > 0) && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  {canShowMore && (
                    <button
                      type="button"
                      onClick={() => setShowAllAlerts((current) => !current)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[10px] font-bold transition",
                        t.inputBg,
                        t.textMuted,
                        t.hoverBg,
                      )}
                    >
                      {showAllAlerts
                        ? "نمایش کمتر"
                        : `نمایش ${toFa(
                            Math.min(
                              availableAlertCount - DEFAULT_VISIBLE_ALERTS,
                              MAX_VISIBLE_ALERTS - DEFAULT_VISIBLE_ALERTS,
                            ),
                          )} مورد دیگر`}
                    </button>
                  )}
                  {hiddenInTable > 0 && (
                    <span className={cn("text-[10px]", t.textDisabled)}>
                      {toFa(hiddenInTable)} صفحه دیگر در جدول
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
