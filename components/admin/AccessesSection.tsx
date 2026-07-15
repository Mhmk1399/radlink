"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCopy,
  FaKey,
  FaPen,
  FaPowerOff,
  FaPlus,
  FaXmark,
  FaChevronDown,
  FaShield,
  FaLayerGroup,
  FaCubes,
  FaFile,
  FaCircleInfo,
} from "react-icons/fa6";
import DynamicTable from "@/components/global/DynamicTable";
import { toast } from "@/components/ui/CustomToast";
import { useAccess } from "@/hook/auth/useAccess";
import type { AdminSection } from "@/hook/admin/useHashRoute";
import { useThemeTokens } from "@/hook/theme/useThemeTokens";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ACCESS_ACTIONS,
  STATIC_COMPONENT_CATALOG,
  getAccessActionsForComponent,
  getAccessActionsForResource,
  type AccessActionValue,
} from "@/lib/auth/accessCatalog";
import type { ColumnDef } from "@/types/table";

type StaticAccessRule = {
  componentName: string;
  actions: AccessActionValue[];
};

type ResourceRule = {
  id: string;
  label: string;
  actions: AccessActionValue[];
};

type ResourceKind = "templates" | "blocks" | "pages";

type AccessRow = {
  _id: string;
  id: string;
  name: string;
  staticComponents: StaticAccessRule[];
  dynamicAccess: Record<ResourceKind, ResourceRule[]>;
  staticCount: number;
  templateCount: number;
  blockCount: number;
  pageCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type ResourceOption = {
  value: string;
  label: string;
};

type AccessFormState = {
  id?: string;
  name: string;
  staticComponents: StaticAccessRule[];
  dynamicAccess: Record<ResourceKind, ResourceRule[]>;
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

type AccessActionOption = (typeof ACCESS_ACTIONS)[number];

function normalizeActions(
  value: unknown,
  availableActions: readonly AccessActionOption[] = ACCESS_ACTIONS,
): AccessActionValue[] {
  if (!Array.isArray(value)) return [];
  const valid = new Set(availableActions.map((action) => action.value));
  return [...new Set(value.map(String))].filter(
    (action): action is AccessActionValue =>
      valid.has(action as AccessActionValue),
  );
}

function resourceObjectLabel(value: unknown, fallback: string) {
  if (!isRecord(value)) return fallback;
  return String(
    value.name ?? value.title ?? value.type ?? value.url ?? fallback,
  );
}

function normalizeStaticRule(value: unknown): StaticAccessRule | null {
  if (!isRecord(value)) return null;
  const componentName = String(value.componentName ?? "").trim();
  const actions = normalizeActions(
    value.actions,
    getAccessActionsForComponent(componentName),
  );
  if (!componentName || actions.length === 0) return null;
  return { componentName, actions };
}

function normalizeResourceRule(
  value: unknown,
  idKey: "templateId" | "blockId" | "pageId",
): ResourceRule | null {
  if (!isRecord(value)) return null;
  const rawResource = value[idKey];
  const id = getId(rawResource);
  const resource =
    idKey === "blockId"
      ? "blocks"
      : idKey === "templateId"
        ? "templates"
        : "pages";
  const actions = normalizeActions(
    value.actions,
    getAccessActionsForResource(resource),
  );
  if (!id || actions.length === 0) return null;
  return {
    id,
    label: resourceObjectLabel(rawResource, id.slice(-8)),
    actions,
  };
}

function normalizeAccessRow(value: unknown): AccessRow | null {
  if (!isRecord(value)) return null;
  const id = getId(value);
  if (!id) return null;

  const dynamic = isRecord(value.dynamicAccess) ? value.dynamicAccess : {};
  const templates = Array.isArray(dynamic.templates)
    ? dynamic.templates
        .map((item) => normalizeResourceRule(item, "templateId"))
        .filter((item): item is ResourceRule => !!item)
    : [];
  const blocks = Array.isArray(dynamic.blocks)
    ? dynamic.blocks
        .map((item) => normalizeResourceRule(item, "blockId"))
        .filter((item): item is ResourceRule => !!item)
    : [];
  const pages = Array.isArray(dynamic.pages)
    ? dynamic.pages
        .map((item) => normalizeResourceRule(item, "pageId"))
        .filter((item): item is ResourceRule => !!item)
    : [];
  const staticComponents = Array.isArray(value.staticComponents)
    ? value.staticComponents
        .map(normalizeStaticRule)
        .filter((item): item is StaticAccessRule => !!item)
    : [];

  return {
    ...value,
    _id: id,
    id,
    name: typeof value.name === "string" ? value.name : "",
    staticComponents,
    dynamicAccess: { templates, blocks, pages },
    staticCount: staticComponents.length,
    templateCount: templates.length,
    blockCount: blocks.length,
    pageCount: pages.length,
    isActive: value.isActive !== false,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : undefined,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
}

function emptyForm(): AccessFormState {
  return {
    name: "",
    staticComponents: [],
    dynamicAccess: {
      templates: [],
      blocks: [],
      pages: [],
    },
  };
}

function formFromRow(row: AccessRow, includeId = false): AccessFormState {
  return {
    ...(includeId ? { id: row._id } : {}),
    name: includeId ? row.name : `${row.name || "Access"} (کپی)`,
    staticComponents: row.staticComponents.map((item) => ({
      componentName: item.componentName,
      actions: [...item.actions],
    })),
    dynamicAccess: {
      templates: row.dynamicAccess.templates.map((item) => ({
        id: item.id,
        label: item.label,
        actions: [...item.actions],
      })),
      blocks: row.dynamicAccess.blocks.map((item) => ({
        id: item.id,
        label: item.label,
        actions: [...item.actions],
      })),
      pages: row.dynamicAccess.pages.map((item) => ({
        id: item.id,
        label: item.label,
        actions: [...item.actions],
      })),
    },
  };
}

function formatFaDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("fa-IR");
  } catch {
    return String(value);
  }
}

function actionLabel(action: string) {
  return ACCESS_ACTIONS.find((item) => item.value === action)?.label ?? action;
}

function staticLabel(componentName: string) {
  return (
    STATIC_COMPONENT_CATALOG.find((item) => item.key === componentName)
      ?.label ?? componentName
  );
}

function toPayload(form: AccessFormState) {
  return {
    name: form.name.trim(),
    staticComponents: form.staticComponents.map((item) => ({
      componentName: item.componentName,
      actions: item.actions,
    })),
    dynamicAccess: {
      templates: form.dynamicAccess.templates.map((item) => ({
        templateId: item.id,
        actions: item.actions,
      })),
      blocks: form.dynamicAccess.blocks.map((item) => ({
        blockId: item.id,
        actions: item.actions,
      })),
      pages: form.dynamicAccess.pages.map((item) => ({
        pageId: item.id,
        actions: item.actions,
      })),
    },
  };
}

function hasRules(form: AccessFormState) {
  return (
    form.staticComponents.length > 0 ||
    form.dynamicAccess.templates.length > 0 ||
    form.dynamicAccess.blocks.length > 0 ||
    form.dynamicAccess.pages.length > 0
  );
}

function normalizeOptions(value: unknown, labelKey: string): ResourceOption[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => {
      const id = getId(item);
      return {
        value: id,
        label: String(item[labelKey] ?? item.name ?? item.title ?? id),
      };
    })
    .filter((item) => item.value);
}

function toggleAction(actions: AccessActionValue[], action: AccessActionValue) {
  return actions.includes(action)
    ? actions.filter((item) => item !== action)
    : [...actions, action];
}

/* ══════════════════════════════════════════════
   THEMED SUB-COMPONENTS
   ══════════════════════════════════════════════ */

function InlineChips({ items }: { items: string[] }) {
  const t = useThemeTokens();
  if (items.length === 0)
    return <span className={cn("text-xs", t.textDisabled)}>-</span>;

  return (
    <span className="inline-flex max-w-[28rem] flex-wrap gap-1 align-middle">
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

function CollapsibleSection({
  title,
  icon,
  description,
  badge,
  defaultOpen = false,
  loading = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description?: string;
  badge?: number;
  defaultOpen?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(defaultOpen);

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
          "flex w-full items-center gap-3 px-4 py-3.5 text-right transition-colors duration-200",
          t.hoverBg,
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
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
          {description && (
            <span className={cn("mt-0.5 block text-xs", t.textDisabled)}>
              {description}
            </span>
          )}
        </span>
        {badge !== undefined && badge > 0 && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              isDark
                ? "bg-[#c8a84b]/15 text-[#c8a84b]"
                : "bg-[#8a7030]/10 text-[#8a7030]",
            )}
          >
            {badge}
          </span>
        )}
        <FaChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            t.textDisabled,
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className={cn("border-t px-4 pb-4 pt-3", t.divider)}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "h-6 w-6 animate-spin rounded-full border-2 border-t-transparent",
                    isDark ? "border-[#c8a84b]" : "border-[#8a7030]",
                  )}
                />
                <span className={cn("text-xs", t.textDisabled)}>
                  در حال بارگذاری...
                </span>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </section>
  );
}

function ActionRuleRow({
  label,
  helper,
  actions,
  availableActions = ACCESS_ACTIONS,
  onChange,
}: {
  label: string;
  helper?: string;
  actions: AccessActionValue[];
  availableActions?: readonly AccessActionOption[];
  onChange: (actions: AccessActionValue[]) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const hasActions = actions.length > 0;
  const allSelected = availableActions.every((action) =>
    actions.includes(action.value),
  );

  function handleSelectAll() {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(availableActions.map((action) => action.value));
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-all duration-200",
        hasActions
          ? isDark
            ? "border-[#c8a84b]/20 bg-[#c8a84b]/[0.04]"
            : "border-[#8a7030]/15 bg-[#8a7030]/[0.03]"
          : cn(t.borderSubtle, t.inputBg),
      )}
    >
      {/* Label row */}
      <div className="mb-2.5 min-w-0">
        <span
          className={cn("block truncate text-sm font-semibold", t.textPrimary)}
        >
          {label}
        </span>
        {helper && (
          <span
            className={cn(
              "mt-0.5 block truncate text-[11px] font-mono",
              t.textDisabled,
            )}
          >
            {helper}
          </span>
        )}
      </div>

      {/* Actions row with Select All */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Select All button */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all duration-200",
            allSelected
              ? isDark
                ? "border-[#c8a84b]/40 bg-[#c8a84b]/20 text-[#c8a84b]"
                : "border-[#8a7030]/40 bg-[#8a7030]/15 text-[#8a7030]"
              : isDark
                ? "border-[#c8a84b]/20 text-[#c8a84b]/60 hover:border-[#c8a84b]/40 hover:bg-[#c8a84b]/10 hover:text-[#c8a84b]"
                : "border-[#8a7030]/20 text-[#8a7030]/60 hover:border-[#8a7030]/30 hover:bg-[#8a7030]/8 hover:text-[#8a7030]",
          )}
        >
          {allSelected ? "حذف همه" : "همه"}
        </button>

        {/* Divider */}
        <span
          className={cn(
            "h-4 w-px shrink-0 rounded-full",
            t.borderSubtle,
            isDark ? "bg-white/10" : "bg-black/10",
          )}
        />

        {/* Individual action buttons */}
        {availableActions.map((action) => {
          const checked = actions.includes(action.value);
          return (
            <button
              key={action.value}
              type="button"
              onClick={() => onChange(toggleAction(actions, action.value))}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200",
                checked
                  ? isDark
                    ? "border-[#c8a84b]/30 bg-[#c8a84b] text-[#111116]"
                    : "border-[#8a7030]/30 bg-[#8a7030] text-white"
                  : cn(
                      t.borderSubtle,
                      t.textMuted,
                      isDark
                        ? "hover:border-[#c8a84b]/20 hover:bg-[#c8a84b]/10 hover:text-[#c8a84b]"
                        : "hover:border-[#8a7030]/15 hover:bg-[#8a7030]/8 hover:text-[#8a7030]",
                    ),
              )}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function SectionBulkActions({
  optionIds,
  ruleStates,
  onSelectAll,
  onClearAll,
  onToggleAction,
  availableActions = ACCESS_ACTIONS,
  getAvailableActions,
}: {
  optionIds: string[];
  ruleStates: { id: string; actions: AccessActionValue[] }[];
  onSelectAll: () => void;
  onClearAll: () => void;
  onToggleAction: (action: AccessActionValue) => void;
  availableActions?: readonly AccessActionOption[];
  getAvailableActions?: (id: string) => readonly AccessActionOption[];
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();

  const actionsMap = new Map(ruleStates.map((item) => [item.id, item.actions]));

  const allSelected =
    optionIds.length > 0 &&
    optionIds.every((id) =>
      (getAvailableActions?.(id) ?? availableActions).every((action) =>
        (actionsMap.get(id) ?? []).includes(action.value),
      ),
    );

  function actionSelectedForAll(action: AccessActionValue) {
    const eligibleIds = optionIds.filter((id) =>
      (getAvailableActions?.(id) ?? availableActions).some(
        (item) => item.value === action,
      ),
    );
    return (
      eligibleIds.length > 0 &&
      eligibleIds.every((id) => (actionsMap.get(id) ?? []).includes(action))
    );
  }

  if (optionIds.length === 0) return null;

  return (
    <div
      className={cn(
        "mb-3 rounded-xl border p-3",
        t.borderSubtle,
        isDark ? "bg-white/[0.02]" : "bg-black/[0.015]",
      )}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className={cn("text-xs font-semibold", t.textMuted)}>
          عملیات گروهی این بخش
        </span>
        <span className={cn("text-[11px]", t.textDisabled)}>
          انتخاب سریع برای همه آیتم‌ها
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={onSelectAll}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all duration-200",
            allSelected
              ? isDark
                ? "border-[#c8a84b]/30 bg-[#c8a84b] text-[#111116]"
                : "border-[#8a7030]/30 bg-[#8a7030] text-white"
              : isDark
                ? "border-[#c8a84b]/20 text-[#c8a84b]/70 hover:border-[#c8a84b]/30 hover:bg-[#c8a84b]/10 hover:text-[#c8a84b]"
                : "border-[#8a7030]/20 text-[#8a7030]/70 hover:border-[#8a7030]/30 hover:bg-[#8a7030]/8 hover:text-[#8a7030]",
          )}
        >
          انتخاب همه
        </button>

        <button
          type="button"
          onClick={onClearAll}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all duration-200",
            "border-red-500/20 text-red-400/80 hover:bg-red-500/10 hover:text-red-400",
          )}
        >
          حذف همه
        </button>

        <span
          className={cn(
            "mx-1 h-8 w-px self-center rounded-full",
            isDark ? "bg-white/10" : "bg-black/10",
          )}
        />

        {availableActions.map((action) => {
          const checked = actionSelectedForAll(action.value);

          return (
            <button
              key={action.value}
              type="button"
              onClick={() => onToggleAction(action.value)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200",
                checked
                  ? isDark
                    ? "border-[#c8a84b]/30 bg-[#c8a84b] text-[#111116]"
                    : "border-[#8a7030]/30 bg-[#8a7030] text-white"
                  : cn(
                      t.borderSubtle,
                      t.textMuted,
                      isDark
                        ? "hover:border-[#c8a84b]/20 hover:bg-[#c8a84b]/10 hover:text-[#c8a84b]"
                        : "hover:border-[#8a7030]/15 hover:bg-[#8a7030]/8 hover:text-[#8a7030]",
                    ),
              )}
            >
              همه {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function ResourceRulePanel({
  title,
  icon,
  options,
  rules,
  emptyText,
  loading,
  onChange,
  onSelectAll,
  onClearAll,
  onToggleActionForAll,
  availableActions = ACCESS_ACTIONS,
}: {
  title: string;
  icon: React.ReactNode;
  options: ResourceOption[];
  rules: ResourceRule[];
  emptyText: string;
  loading?: boolean;
  onChange: (option: ResourceOption, actions: AccessActionValue[]) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  onToggleActionForAll?: (action: AccessActionValue) => void;
  availableActions?: readonly AccessActionOption[];
}) {
  const t = useThemeTokens();
  const activeCount = rules.length;

  return (
    <CollapsibleSection
      title={title}
      icon={icon}
      description={`${options.length} مورد موجود`}
      badge={activeCount}
      loading={loading}
    >
      {options.length === 0 ? (
        <div
          className={cn(
            "rounded-xl border border-dashed p-6 text-center",
            t.borderSubtle,
          )}
        >
          <span className={cn("text-sm", t.textDisabled)}>{emptyText}</span>
        </div>
      ) : (
        <>
          {(onSelectAll || onClearAll || onToggleActionForAll) && (
            <SectionBulkActions
              optionIds={options.map((option) => option.value)}
              ruleStates={rules.map((item) => ({
                id: item.id,
                actions: item.actions,
              }))}
              onSelectAll={onSelectAll ?? (() => {})}
              onClearAll={onClearAll ?? (() => {})}
              onToggleAction={onToggleActionForAll ?? (() => {})}
              availableActions={availableActions}
            />
          )}

          <div className="grid gap-2.5 sm:grid-cols-2">
            {options.map((option) => (
              <ActionRuleRow
                key={option.value}
                label={option.label}
                helper={option.value.slice(-10)}
                actions={
                  rules.find((item) => item.id === option.value)?.actions ?? []
                }
                availableActions={availableActions}
                onChange={(acts) => onChange(option, acts)}
              />
            ))}
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */

export default function AccessesSection({
  navigate,
}: {
  navigate: (section: AdminSection) => void;
}) {
  const t = useThemeTokens();
  const { isDark } = useTheme();
  const { can } = useAccess();
  const [refreshToken, setRefreshToken] = useState(0);
  const [form, setForm] = useState<AccessFormState>(() => emptyForm());
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [options, setOptions] = useState<
    Record<ResourceKind, ResourceOption[]>
  >({
    templates: [],
    blocks: [],
    pages: [],
  });

  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ?? "")
      : "";
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const canCreate = can("admin.accesses", "create");
  const canUpdate = can("admin.accesses", "update");
  const canDelete = can("admin.accesses", "delete");
  function selectAllStaticComponents() {
    setForm((prev) => ({
      ...prev,
      staticComponents: STATIC_COMPONENT_CATALOG.map((component) => ({
        componentName: component.key,
        actions: getAccessActionsForComponent(component.key).map(
          (action) => action.value,
        ),
      })),
    }));
  }

  function clearAllStaticComponents() {
    setForm((prev) => ({
      ...prev,
      staticComponents: [],
    }));
  }

  function toggleStaticActionForAll(action: AccessActionValue) {
    setForm((prev) => {
      const componentKeys = STATIC_COMPONENT_CATALOG.map(
        (component) => component.key,
      );

      const allHaveAction =
        componentKeys.some((key) =>
          getAccessActionsForComponent(key).some(
            (item) => item.value === action,
          ),
        ) &&
        componentKeys
          .filter((key) =>
            getAccessActionsForComponent(key).some(
              (item) => item.value === action,
            ),
          )
          .every((key) => {
          const currentActions =
            prev.staticComponents.find((item) => item.componentName === key)
              ?.actions ?? [];
          return currentActions.includes(action);
          });

      const nextComponents: StaticAccessRule[] = [];

      for (const key of componentKeys) {
        const actionIsAvailable = getAccessActionsForComponent(key).some(
          (item) => item.value === action,
        );
        const currentActions =
          prev.staticComponents.find((item) => item.componentName === key)
            ?.actions ?? [];

        const nextActions = !actionIsAvailable
          ? currentActions.filter((item) => item !== action)
          : allHaveAction
          ? currentActions.filter((item) => item !== action)
          : currentActions.includes(action)
            ? currentActions
            : [...currentActions, action];

        if (nextActions.length > 0) {
          nextComponents.push({ componentName: key, actions: nextActions });
        }
      }

      return {
        ...prev,
        staticComponents: nextComponents,
      };
    });
  }

  function selectAllResources(resource: ResourceKind) {
    const allActions = getAccessActionsForResource(resource).map(
      (action) => action.value,
    );

    setForm((prev) => ({
      ...prev,
      dynamicAccess: {
        ...prev.dynamicAccess,
        [resource]: options[resource].map((option) => ({
          id: option.value,
          label: option.label,
          actions: allActions,
        })),
      },
    }));
  }

  function clearAllResources(resource: ResourceKind) {
    setForm((prev) => ({
      ...prev,
      dynamicAccess: {
        ...prev.dynamicAccess,
        [resource]: [],
      },
    }));
  }

  function toggleResourceActionForAll(
    resource: ResourceKind,
    action: AccessActionValue,
  ) {
    if (
      !getAccessActionsForResource(resource).some(
        (item) => item.value === action,
      )
    ) {
      return;
    }

    setForm((prev) => {
      const resourceOptions = options[resource];
      const currentRules = prev.dynamicAccess[resource];

      const allHaveAction =
        resourceOptions.length > 0 &&
        resourceOptions.every((option) => {
          const currentActions =
            currentRules.find((item) => item.id === option.value)?.actions ??
            [];
          return currentActions.includes(action);
        });

      return {
        ...prev,
        dynamicAccess: {
          ...prev.dynamicAccess,
          [resource]: resourceOptions
            .map((option) => {
              const currentActions =
                currentRules.find((item) => item.id === option.value)
                  ?.actions ?? [];

              const nextActions = allHaveAction
                ? currentActions.filter((item) => item !== action)
                : currentActions.includes(action)
                  ? currentActions
                  : [...currentActions, action];

              return nextActions.length > 0
                ? {
                    id: option.value,
                    label: option.label,
                    actions: nextActions,
                  }
                : null;
            })
            .filter((item): item is ResourceRule => !!item),
        },
      };
    });
  }
  const transformResponse = useMemo(
    () =>
      (json: unknown): AccessRow[] => {
        const raw: unknown[] =
          isRecord(json) && Array.isArray(json.accesses)
            ? json.accesses
            : Array.isArray(json)
              ? json
              : [];

        return raw
          .map(normalizeAccessRow)
          .filter((row): row is AccessRow => !!row);
      },
    [],
  );

  const columns: ColumnDef<AccessRow>[] = useMemo(
    () => [
      {
        key: "name",
        label: "نام Access",
        editable: false,
        sortable: true,
        copyable: true,
        render: (value) => (
          <span className={cn("text-sm font-bold", t.textPrimary)}>
            {String(value || "بدون نام")}
          </span>
        ),
      },
      {
        key: "id",
        label: "شناسه",
        editable: false,
        copyable: true,
        render: (value) => (
          <span className={cn("font-mono text-xs", t.textDisabled)}>
            {String(value ?? "").slice(-10)}
          </span>
        ),
      },
      {
        key: "staticComponents",
        label: "کامپوننت‌های ثابت",
        editable: false,
        render: (_value, row) => (
          <InlineChips
            items={row.staticComponents.map(
              (item) =>
                `${staticLabel(item.componentName)}: ${item.actions
                  .map(actionLabel)
                  .join("، ")}`,
            )}
          />
        ),
      },
      {
        key: "templateCount",
        label: "قالب",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className={cn("text-sm font-medium", t.textMuted)}>
            {String(value ?? 0)}
          </span>
        ),
      },
      {
        key: "blockCount",
        label: "بلاک",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className={cn("text-sm font-medium", t.textMuted)}>
            {String(value ?? 0)}
          </span>
        ),
      },
      {
        key: "pageCount",
        label: "صفحه",
        editable: false,
        sortable: true,
        render: (value) => (
          <span className={cn("text-sm font-medium", t.textMuted)}>
            {String(value ?? 0)}
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
        label: "تاریخ ساخت",
        editable: false,
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
        const [templatesRes, blocksRes, pagesRes] = await Promise.all([
          fetch("/api/templates?limit=100", { headers }),
          fetch("/api/blocks?limit=100", { headers }),
          fetch("/api/pages?limit=100", { headers }),
        ]);

        const [templatesJson, blocksJson, pagesJson] = await Promise.all([
          templatesRes.json().catch(() => null),
          blocksRes.json().catch(() => null),
          pagesRes.json().catch(() => null),
        ]);

        if (!templatesRes.ok) {
          throw new Error(templatesJson?.message ?? "خطا در دریافت قالب‌ها");
        }
        if (!blocksRes.ok) {
          throw new Error(blocksJson?.message ?? "خطا در دریافت بلاک‌ها");
        }
        if (!pagesRes.ok) {
          throw new Error(pagesJson?.message ?? "خطا در دریافت صفحات");
        }

        if (cancelled) return;

        setOptions({
          templates: normalizeOptions(templatesJson?.templates, "name"),
          blocks: normalizeOptions(blocksJson?.blocks, "name"),
          pages: normalizeOptions(pagesJson?.pages, "title"),
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "خطا در دریافت گزینه‌ها",
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

  function openEdit(row: AccessRow) {
    setForm(formFromRow(row, true));
    setModalOpen(true);
  }

  function refreshTable() {
    setRefreshToken((value) => value + 1);
  }

  function updateStaticActions(
    componentName: string,
    actions: AccessActionValue[],
  ) {
    const normalizedActions = normalizeActions(
      actions,
      getAccessActionsForComponent(componentName),
    );
    setForm((prev) => ({
      ...prev,
      staticComponents:
        normalizedActions.length === 0
          ? prev.staticComponents.filter(
              (item) => item.componentName !== componentName,
            )
          : [
              ...prev.staticComponents.filter(
                (item) => item.componentName !== componentName,
              ),
              { componentName, actions: normalizedActions },
            ],
    }));
  }

  function updateResourceActions(
    resource: ResourceKind,
    option: ResourceOption,
    actions: AccessActionValue[],
  ) {
    const normalizedActions = normalizeActions(
      actions,
      getAccessActionsForResource(resource),
    );
    setForm((prev) => ({
      ...prev,
      dynamicAccess: {
        ...prev.dynamicAccess,
        [resource]:
          normalizedActions.length === 0
            ? prev.dynamicAccess[resource].filter(
                (item) => item.id !== option.value,
              )
            : [
                ...prev.dynamicAccess[resource].filter(
                  (item) => item.id !== option.value,
                ),
                {
                  id: option.value,
                  label: option.label,
                  actions: normalizedActions,
                },
              ],
      },
    }));
  }

  async function saveAccess() {
    if (!form.name.trim()) {
      toast.error("نام Access الزامی است");
      return;
    }
    if (!hasRules(form)) {
      toast.error("حداقل یک قانون دسترسی انتخاب کنید");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        form.id ? `/api/accesses/${form.id}` : "/api/accesses",
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
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در ذخیره Access");
      }

      toast.success(form.id ? "Access ویرایش شد" : "Access ساخته شد");
      setModalOpen(false);
      refreshTable();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در ذخیره Access",
      );
    } finally {
      setSaving(false);
    }
  }

  async function duplicateAccess(row: AccessRow) {
    try {
      setDuplicatingId(row._id);
      const response = await fetch("/api/accesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify(toPayload(formFromRow(row))),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در کپی کردن Access");
      }

      toast.success("Access جدید از روی این ردیف ساخته شد");
      refreshTable();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در کپی کردن Access",
      );
    } finally {
      setDuplicatingId(null);
    }
  }

  async function toggleAccessStatus(row: AccessRow) {
    const nextStatus = !row.isActive;

    try {
      setTogglingId(row._id);
      const response = await fetch(`/api/accesses/${row._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headers ?? {}),
        },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.message ?? "خطا در تغییر وضعیت Access");
      }

      toast.success(nextStatus ? "Access فعال شد" : "Access غیرفعال شد");
      refreshTable();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در تغییر وضعیت Access",
      );
    } finally {
      setTogglingId(null);
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
  const closeBtn = cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
    t.hoverBg,
    t.textMuted,
  );

  const totalRules =
    form.staticComponents.length +
    form.dynamicAccess.templates.length +
    form.dynamicAccess.blocks.length +
    form.dynamicAccess.pages.length;

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
                  ? "border-[#c8a84b]/15 bg-[#c8a84b]/[0.08] text-[#c8a84b]"
                  : "border-[#8a7030]/15 bg-[#8a7030]/[0.06] text-[#8a7030]",
              )}
            >
              <FaKey className="h-5 w-5" />
            </div>
            <div>
              <h1
                className={cn(
                  "text-lg font-extrabold sm:text-xl",
                  t.textPrimary,
                )}
              >
                مدیریت Accessها
              </h1>
              <p className={cn("mt-0.5 text-xs sm:text-sm", t.textMuted)}>
                تعریف اکشن‌های مجاز برای کامپوننت‌ها و ریسورس‌ها
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
                <span>ساخت Access</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("permissions")}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-200",
                t.borderAccent,
                t.textAccent,
                t.hoverBg,
              )}
            >
              <FaArrowRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">رفتن به Permissionها</span>
              <span className="sm:hidden">Permissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <DynamicTable<AccessRow>
        endpoint="/api/accesses"
        refreshKey={refreshToken}
        columns={columns}
        title="لیست Accessها"
        subtitle="هر Access ترکیبی از قوانین static و dynamic است"
        primaryKey="_id"
        headers={headers}
        pageSize={20}
        pageSizes={[20, 50, 100]}
        searchable
        exportable
        exportFileName="accesses"
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
          toast.success("Access حذف شد");
        }}
        rowActions={(row) => (
          <>
            {canCreate && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void duplicateAccess(row);
                }}
                disabled={duplicatingId === row._id}
                title="کپی و ساخت Access جدید"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                  isDark
                    ? "text-[#c8a84b]/70 hover:bg-[#c8a84b]/10 hover:text-[#c8a84b]"
                    : "text-[#8a7030]/70 hover:bg-[#8a7030]/8 hover:text-[#8a7030]",
                )}
              >
                <FaCopy
                  className={cn(
                    "h-3.5 w-3.5",
                    duplicatingId === row._id && "animate-pulse",
                  )}
                  aria-hidden="true"
                />
                <span className="sr-only">کپی</span>
              </button>
            )}
            {canUpdate && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void toggleAccessStatus(row);
                }}
                disabled={togglingId === row._id}
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
                    togglingId === row._id && "animate-pulse",
                  )}
                  aria-hidden="true"
                />
                <span className="sr-only">
                  {row.isActive ? "غیرفعال" : "فعال"}
                </span>
              </button>
            )}
            {canUpdate && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openEdit(row);
                }}
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
        emptyMessage="Accessای یافت نشد."
      />

      {/* ══════════════════════════════════════════════
          MODAL — Full screen mobile, centered desktop
          ══════════════════════════════════════════════ */}
      {modalOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[999] flex items-center justify-center",
            isDark
              ? "bg-[#0a0a0e]/5 backdrop-blur-xs"
              : "bg-[#2a2720]/40 backdrop-blur-md",
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <section
            className={cn(
              "flex flex-col overflow-hidden",
              // Mobile: full screen | Desktop: centered card
              "h-full w-full",
              "lg:h-auto lg:max-h-[90vh] lg:w-full lg:max-w-5xl lg:rounded-2xl lg:border",
              t.modalBg,
              t.borderAccentHover,
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
                      ? "bg-[#c8a84b]/10 text-[#c8a84b]"
                      : "bg-[#8a7030]/8 text-[#8a7030]",
                  )}
                >
                  <FaKey className="h-4 w-4" />
                </div>
                <div>
                  <h2 className={cn("text-base font-bold", t.textPrimary)}>
                    {form.id ? "ویرایش Access" : "ساخت Access"}
                  </h2>
                  <p className={cn("text-xs", t.textDisabled)}>
                    {totalRules > 0
                      ? `${totalRules} قانون انتخاب شده`
                      : "قوانین دسترسی را انتخاب کنید"}
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
                "flex-1 space-y-3 overflow-y-auto p-4 sm:p-5",
                t.scrollbarWide,
              )}
            >
              <label className="block">
                <span
                  className={cn(
                    "mb-1.5 block text-xs font-semibold",
                    t.textMuted,
                  )}
                >
                  نام Access
                </span>
                <input
                  type="text"
                  value={form.name}
                  maxLength={120}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="مثلاً مدیریت صفحات"
                  className={cn(
                    "h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition",
                    t.inputBg,
                    t.borderInput,
                    t.textPrimary,
                  )}
                />
              </label>

              {/* Help banner */}
              {/* <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3",
                  isDark
                    ? "border-[#c8a84b]/15 bg-[#c8a84b]/[0.04]"
                    : "border-[#8a7030]/12 bg-[#8a7030]/[0.03]",
                )}
              >
                <FaCircleInfo
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    isDark ? "text-[#c8a84b]" : "text-[#8a7030]",
                  )}
                />
                <p className={cn("text-xs leading-6", t.textMuted)}>
                  <strong className={t.textPrimary}>راهنما:</strong> اکشن{" "}
                  <code
                    className={cn(
                      "rounded px-1 py-0.5 text-[11px] font-mono",
                      t.inputBg,
                    )}
                  >
                    view
                  </code>{" "}
                  برای دیده شدن بخش،{" "}
                  <code
                    className={cn(
                      "rounded px-1 py-0.5 text-[11px] font-mono",
                      t.inputBg,
                    )}
                  >
                    create
                  </code>
                  ،{" "}
                  <code
                    className={cn(
                      "rounded px-1 py-0.5 text-[11px] font-mono",
                      t.inputBg,
                    )}
                  >
                    update
                  </code>
                  ،{" "}
                  <code
                    className={cn(
                      "rounded px-1 py-0.5 text-[11px] font-mono",
                      t.inputBg,
                    )}
                  >
                    delete
                  </code>{" "}
                  و{" "}
                  <code
                    className={cn(
                      "rounded px-1 py-0.5 text-[11px] font-mono",
                      t.inputBg,
                    )}
                  >
                    publish
                  </code>{" "}
                  را با hook{" "}
                  <code
                    className={cn(
                      "rounded px-1 py-0.5 text-[11px] font-mono",
                      t.inputBg,
                    )}
                  >
                    useAccess
                  </code>{" "}
                  چک کنید.
                </p>
              </div> */}

              {/* Static components */}
              <CollapsibleSection
                title="کامپوننت‌های ثابت"
                icon={<FaShield className="h-3.5 w-3.5" />}
                description="آیتم‌های UI مثل سایدبار یا بخش‌های ادمین"
                badge={form.staticComponents.length}
                defaultOpen={true}
              >
                <SectionBulkActions
                  optionIds={STATIC_COMPONENT_CATALOG.map(
                    (component) => component.key,
                  )}
                  ruleStates={form.staticComponents.map((item) => ({
                    id: item.componentName,
                    actions: item.actions,
                  }))}
                  onSelectAll={selectAllStaticComponents}
                  onClearAll={clearAllStaticComponents}
                  onToggleAction={toggleStaticActionForAll}
                  getAvailableActions={getAccessActionsForComponent}
                />

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {STATIC_COMPONENT_CATALOG.map((component) => (
                    <ActionRuleRow
                      key={component.key}
                      label={component.label}
                      helper={component.key}
                      actions={
                        form.staticComponents.find(
                          (item) => item.componentName === component.key,
                        )?.actions ?? []
                      }
                      availableActions={getAccessActionsForComponent(
                        component.key,
                      )}
                      onChange={(actions) =>
                        updateStaticActions(component.key, actions)
                      }
                    />
                  ))}
                </div>
              </CollapsibleSection>

              {/* Templates */}
              <ResourceRulePanel
                title="قالب‌ها"
                icon={<FaLayerGroup className="h-3.5 w-3.5" />}
                options={options.templates}
                rules={form.dynamicAccess.templates}
                emptyText="قالبی برای انتخاب وجود ندارد."
                loading={optionsLoading}
                onChange={(option, actions) =>
                  updateResourceActions("templates", option, actions)
                }
                onSelectAll={() => selectAllResources("templates")}
                onClearAll={() => clearAllResources("templates")}
                onToggleActionForAll={(action) =>
                  toggleResourceActionForAll("templates", action)
                }
                availableActions={getAccessActionsForResource("templates")}
              />

              <ResourceRulePanel
                title="بلاک‌ها"
                icon={<FaCubes className="h-3.5 w-3.5" />}
                options={options.blocks}
                rules={form.dynamicAccess.blocks}
                emptyText="بلاکی برای انتخاب وجود ندارد."
                loading={optionsLoading}
                onChange={(option, actions) =>
                  updateResourceActions("blocks", option, actions)
                }
                onSelectAll={() => selectAllResources("blocks")}
                onClearAll={() => clearAllResources("blocks")}
                onToggleActionForAll={(action) =>
                  toggleResourceActionForAll("blocks", action)
                }
                availableActions={getAccessActionsForResource("blocks")}
              />

              <ResourceRulePanel
                title="صفحات"
                icon={<FaFile className="h-3.5 w-3.5" />}
                options={options.pages}
                rules={form.dynamicAccess.pages}
                emptyText="صفحه‌ای برای انتخاب وجود ندارد."
                loading={optionsLoading}
                onChange={(option, actions) =>
                  updateResourceActions("pages", option, actions)
                }
                onSelectAll={() => selectAllResources("pages")}
                onClearAll={() => clearAllResources("pages")}
                onToggleActionForAll={(action) =>
                  toggleResourceActionForAll("pages", action)
                }
                availableActions={getAccessActionsForResource("pages")}
              />
            </div>

            {/* Footer — sticky at bottom */}
            <footer
              className={cn(
                "flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between",
                t.divider,
                t.modalBg,
              )}
            >
              <span className={cn("text-xs", t.textDisabled)}>
                {totalRules > 0
                  ? `${totalRules} قانون دسترسی انتخاب شده`
                  : "هیچ قانونی انتخاب نشده"}
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
                  onClick={saveAccess}
                  disabled={saving}
                  className={cn(primaryBtn, "flex-1 sm:flex-none")}
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : null}
                  {saving ? "در حال ذخیره..." : "ذخیره Access"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
