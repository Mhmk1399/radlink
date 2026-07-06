// SimplePageBuilder.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  MeasuringStrategy,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { pointerWithin } from "@dnd-kit/core";

import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { DynamicIslandPanel } from "@/builder/editor/DynamicIslandPanel";
import PhonePreviewModal from "./PhoneLivePreview";

import type {
  AnimationType,
  EditableStyleKey,
  EditableStyleMap,
  PageBlock,
  ResponsiveValue,
} from "@/types/blocks/builder.types";

/* ── Local modules ── */

import { HiOutlineArrowPath, HiOutlinePlus } from "react-icons/hi2";
import {
  Breakpoint,
  cloneBlock,
  createInitialBuilderState,
  loadFromStorage,
  normalizeOrder,
  normalizeStyleValue,
  saveToStorage,
  STORAGE_KEY,
  updateResponsiveValue,
} from "@/helper/builder.helpers";
import {
  useHistory,
  useToast,
  useUndoableAction,
} from "@/hook/builder/useBuilderHooks";
import { BuilderHeader } from "../BuilderHeader";
import { BlocksSidebar } from "../BuilderSidebar";
import { CanvasContent, SelectionBreadcrumb } from "../BuilderCanvas";
import {
  PaletteDragOverlay,
  ShortcutsHint,
  ToastContainer,
  UndoSnackbar,
  UnifiedDragOverlay,
} from "../BuilderOverlays";
import {
  BlockCatalogModal,
  PageSaveResultModal,
  ClearAllConfirmModal,
  PageMetaModal,
} from "../BuilderModals";
import { BuilderTour } from "../BuilderTour";
import { useAccess } from "@/hook/auth/useAccess";
import LandingFloatingActions from "@/components/landing/LandingFloatingActions";
import {
  deleteFile,
  extractKeyFromUrl,
  FILE_UPLOADED_EVENT,
  type FileUploadedEventDetail,
} from "@/lib/fileUtils";

/* ================================================================== */
/*  Props                                                              */
/* ================================================================== */

type SimplePageBuilderProps = {
  pageId?: string;
  templateId?: string;
  saveMode?: "page" | "template";
  sourceTemplateId?: string;
  initialBlocks?: PageBlock[];
  initialTitle?: string;
  initialDescription?: string;
  initialUrl?: string;
  initialCategoryId?: string;
  initialThumbnail?: string;
  initialLogo?: string;
  initialLogoShape?: "square" | "circle";
  initialFavicon?: string;
  initialBackground?: {
    color?: string;
    image?: string;
  };
  suppressSmartSuggestions?: boolean;
};

type CategoryOption = {
  value: string;
  label: string;
};

type MasterBlockDefinition = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  type: string;
  version?: number;
  data?: Record<string, unknown>;
  settings?: PageBlock["settings"];
  elements?: PageBlock["elements"];
  defaultBlock?: Partial<PageBlock>;
  isActive?: boolean;
  builderActions?: BuilderBlockAction[];
};

type BuilderBlockAction = "view" | "create" | "update" | "publish";

type CreatedPageResponse = {
  _id?: unknown;
  id?: unknown;
  url?: unknown;
  qr?: unknown;
};

let categoryOptionsCache: CategoryOption[] | null = null;
let categoryOptionsRequestFailed = false;

const BUILDER_META_SUFFIX = "صفحه‌ساز رادلینک";

function compactMetaText(value: string | undefined, fallback: string) {
  const text = value?.trim() || fallback;
  return text.replace(/\s+/g, " ");
}

function getBuilderActionLabel({
  saveMode,
  pageId,
  templateId,
  sourceTemplateId,
}: {
  saveMode: "page" | "template";
  pageId: string | null;
  templateId: string | null;
  sourceTemplateId?: string;
}) {
  if (saveMode === "template") {
    return templateId ? "ویرایش قالب" : "ساخت قالب";
  }

  if (pageId) return "ویرایش صفحه";
  if (sourceTemplateId) return "ساخت صفحه از قالب";
  return "ساخت صفحه";
}

function upsertMetaTag(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getCreatedDocumentId(value: unknown) {
  if (!isRecord(value)) return "";

  const id = value._id ?? value.id;
  return typeof id === "string" ? id : "";
}

function buildClientPageTargetUrl(pageUrl: unknown) {
  const url = typeof pageUrl === "string" ? pageUrl.trim() : "";
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/${url.replace(/^\/+/, "")}`;
}

class PageSaveRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PageSaveRequestError";
    this.status = status;
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
const ADMIN_PATH = "/admin";

type BuilderSaveSnapshotInput = {
  saveMode: "page" | "template";
  title: string;
  description: string;
  url: string;
  categoryId: string;
  thumbnail: string;
  logo: string;
  logoShape: "square" | "circle";
  favicon: string;
  backgroundColor: string;
  backgroundImage: string;
  blocks: PageBlock[];
};

function serializeBuilderSaveState({
  saveMode,
  title,
  description,
  url,
  categoryId,
  thumbnail,
  logo,
  logoShape,
  favicon,
  backgroundColor,
  backgroundImage,
  blocks,
}: BuilderSaveSnapshotInput) {
  return JSON.stringify({
    saveMode,
    title,
    description,
    url: saveMode === "page" ? url : "",
    categoryId: saveMode === "template" ? categoryId : "",
    thumbnail: saveMode === "template" ? thumbnail : "",
    logo: saveMode === "page" ? logo : "",
    logoShape: saveMode === "page" ? logoShape : "square",
    favicon: saveMode === "page" ? favicon : "",
    background: { color: backgroundColor, image: backgroundImage },
    blocks,
  });
}

function collectStorageUrls(snapshot: string) {
  const urls = new Set<string>();

  function visit(value: unknown) {
    if (typeof value === "string") {
      if (extractKeyFromUrl(value)) urls.add(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
    }
  }

  try {
    visit(JSON.parse(snapshot));
  } catch {
    return urls;
  }

  return urls;
}

type LeaveBuilderConfirmModalProps = {
  open: boolean;
  isSaving: boolean;
  saveError: string | null;
  onCancel: () => void;
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
};

function LeaveBuilderConfirmModal({
  open,
  isSaving,
  saveError,
  onCancel,
  onSaveAndLeave,
  onLeaveWithoutSaving,
}: LeaveBuilderConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-builder-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-xl text-amber-700">
            !
          </div>

          <h2
            id="leave-builder-title"
            className="text-lg font-black text-neutral-900"
          >
            تغییرات ذخیره نشده‌اند
          </h2>

          <p className="mt-2 text-sm leading-7 text-neutral-500">
            بخشی از تغییرات فقط در مرورگر نگهداری شده و هنوز روی سرور ذخیره نشده
            است. قبل از بازگشت به پنل، روش خروج را انتخاب کنید.
          </p>
        </div>

        {saveError && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-6 text-red-700"
          >
            {saveError}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onSaveAndLeave}
            disabled={isSaving}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && (
              <HiOutlineArrowPath size={15} className="animate-spin" />
            )}

            {isSaving ? "در حال ذخیره..." : "ذخیره و بازگشت"}
          </button>

          <button
            type="button"
            onClick={onLeaveWithoutSaving}
            disabled={isSaving}
            className="h-11 flex-1 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            خروج بدون ذخیره
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="mt-3 h-10 w-full rounded-xl text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          انصراف و ادامه ویرایش
        </button>
      </div>
    </div>
  );
}
function createInstanceId(type: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${type}-${Date.now()}`;
}

function createBlockFromMaster(
  masterBlock: MasterBlockDefinition,
  order: number,
): PageBlock {
  const snapshot = isRecord(masterBlock.defaultBlock)
    ? masterBlock.defaultBlock
    : {};
  const type = masterBlock.type;

  return {
    instanceId: createInstanceId(type),
    blockId: String(masterBlock._id ?? masterBlock.id ?? type),
    type,
    version: Number(snapshot.version ?? masterBlock.version ?? 1),
    order,
    isActive:
      typeof snapshot.isActive === "boolean"
        ? snapshot.isActive
        : masterBlock.isActive !== false,
    data: cloneJson(
      (isRecord(snapshot.data) ? snapshot.data : masterBlock.data) ?? {},
    ),
    settings: cloneJson(
      (isRecord(snapshot.settings)
        ? snapshot.settings
        : masterBlock.settings) ?? { direction: "rtl" },
    ),
    elements: cloneJson(
      (isRecord(snapshot.elements)
        ? snapshot.elements
        : masterBlock.elements) ?? {},
    ),
  };
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function SimplePageBuilder({
  pageId: initialPageId,
  templateId: initialTemplateId,
  saveMode = "page",
  sourceTemplateId,
  initialBlocks: externalBlocks,
  initialTitle,
  initialDescription,
  initialUrl,
  initialCategoryId,
  initialThumbnail,
  initialLogo,
  initialLogoShape = "square",
  initialFavicon,
  initialBackground,
  suppressSmartSuggestions = false,
}: SimplePageBuilderProps = {}) {
  const initialState = useMemo(() => createInitialBuilderState(), []);

  /* ── Undo/Redo history ── */
  const history = useHistory<PageBlock[]>(
    externalBlocks && externalBlocks.length > 0
      ? externalBlocks
      : initialState.blocks,
  );
  const blocks = history.state;
  const setBlocks = history.set;

  /* ── Selection state ── */
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    externalBlocks && externalBlocks.length > 0
      ? externalBlocks[0]?.instanceId || null
      : initialState.selectedBlockId,
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    externalBlocks && externalBlocks.length > 0
      ? "container"
      : initialState.selectedElementId,
  );
  const router = useRouter();
  /* ── Page state ── */
  const [pageId, setPageId] = useState<string | null>(initialPageId || null);
  const [templateId, setTemplateId] = useState<string | null>(
    initialTemplateId || null,
  );
  const [pageTitle, setPageTitle] = useState(initialTitle || "صفحه جدید");
  const [pageUrl, setPageUrl] = useState(initialUrl || "new-page");
  const [pageDescription, setPageDescription] = useState(
    initialDescription || "",
  );
  const [templateCategoryId, setTemplateCategoryId] = useState(
    initialCategoryId || "",
  );
  const [templateThumbnail, setTemplateThumbnail] = useState(
    initialThumbnail || "",
  );
  const [pageLogo, setPageLogo] = useState(initialLogo || "");
  const [pageLogoShape, setPageLogoShape] = useState<"square" | "circle">(
    initialLogoShape,
  );
  const [pageFavicon, setPageFavicon] = useState(initialFavicon || "");
  const [pageBackgroundColor, setPageBackgroundColor] = useState(
    initialBackground?.color || "#ffffff",
  );
  const [pageBackgroundImage, setPageBackgroundImage] = useState(
    initialBackground?.image || "",
  );
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveAfterMetaSave, setLeaveAfterMetaSave] = useState(false);

  const [lastServerSavedSnapshot, setLastServerSavedSnapshot] = useState(() =>
    serializeBuilderSaveState({
      saveMode,
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      categoryId: templateCategoryId,
      thumbnail: templateThumbnail,
      logo: pageLogo,
      logoShape: pageLogoShape,
      favicon: pageFavicon,
      backgroundColor: pageBackgroundColor,
      backgroundImage: pageBackgroundImage,
      blocks,
    }),
  );
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [masterBlocks, setMasterBlocks] = useState<
    Record<string, MasterBlockDefinition>
  >({});
  const [isMasterBlocksLoading, setIsMasterBlocksLoading] = useState(true);

  /* ── UI state ── */
  const [isServerSaving, setIsServerSaving] = useState(false);
  const [serverSaveError, setServerSaveError] = useState<string | null>(null);
  const [slugSaveError, setSlugSaveError] = useState<string | null>(null);
  const [pageSaveResult, setPageSaveResult] = useState<{
    status: "success" | "error";
    message: string;
    pageUrl?: string;
  } | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activePaletteType, setActivePaletteType] = useState<string | null>(
    null,
  );
  const [forceTourRun, setForceTourRun] = useState(false);

  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(true);
  const [storageHydrated, setStorageHydrated] = useState(false);
  const [pageMetaOpen, setPageMetaOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingBuilderUploads = useRef(
    new Map<string, FileUploadedEventDetail>(),
  );

  /* ── Toast & Onboarding ── */
  const toast = useToast();
  const {
    user: authUser,
    isSuperAdmin,
    can,
    isLoading: isAccessLoading,
  } = useAccess();

  useEffect(() => {
    const trackBuilderUpload = (event: Event) => {
      const detail = (event as CustomEvent<FileUploadedEventDetail>).detail;
      if (!detail?.fileId || !detail.url) return;
      pendingBuilderUploads.current.set(detail.url, detail);
    };

    window.addEventListener(FILE_UPLOADED_EVENT, trackBuilderUpload);
    return () => {
      window.removeEventListener(FILE_UPLOADED_EVENT, trackBuilderUpload);
    };
  }, []);
  const blockLimit =
    saveMode === "template" || isSuperAdmin || !authUser?.limits?.blocks
      ? 0
      : Math.max(0, Math.floor(authUser.limits.blocks));
  const canAddBlockCount = useCallback(
    (count = 1) => {
      if (blockLimit === 0 || blocks.length + count <= blockLimit) return true;
      toast.show(
        `سقف مجاز بلاک‌های این صفحه ${blockLimit} عدد است.`,
        "error",
      );
      return false;
    },
    [blockLimit, blocks.length, toast],
  );

  /* ── Derived ── */
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );
  const contactSaveBlock = useMemo(
    () =>
      sortedBlocks.find(
        (block) =>
          block.type === "contactSave" &&
          block.isActive !== false &&
          !block.hidden,
      ) ?? null,
    [sortedBlocks],
  );
  const canvasBlocks = useMemo(
    () => sortedBlocks.filter((block) => block.type !== "contactSave"),
    [sortedBlocks],
  );
  const blockIds = useMemo(
    () => canvasBlocks.map((b) => b.instanceId),
    [canvasBlocks],
  );
  const canViewFloatingActions =
    !isAccessLoading &&
    (isSuperAdmin || can("landing.floatingActions", "view"));
  const selectedBlock = useMemo(
    () => blocks.find((b) => b.instanceId === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );
  const activeBlock = useMemo(
    () => blocks.find((b) => b.instanceId === activeBlockId) ?? null,
    [activeBlockId, blocks],
  );
  const allowedBlockTypes = useMemo(
    () => new Set(Object.keys(masterBlocks)),
    [masterBlocks],
  );
  const canUseBlockAction = useCallback(
    (type: string, action: BuilderBlockAction) =>
      masterBlocks[type]?.builderActions?.includes(action) ?? false,
    [masterBlocks],
  );
  const requireBlockAction = useCallback(
    (
      blockOrType: PageBlock | string,
      action: Exclude<BuilderBlockAction, "view">,
    ) => {
      const type =
        typeof blockOrType === "string" ? blockOrType : blockOrType.type;
      if (canUseBlockAction(type, action)) return true;

      const config = blockRegistry[type as keyof typeof blockRegistry];
      const actionLabel = {
        create: "ساخت",
        update: "ویرایش",
        publish: "انتشار",
      }[action];
      toast.show(
        `برای این عملیات روی بلاک «${config?.label ?? type}» به دسترسی «${actionLabel}» نیاز دارید.`,
        "error",
      );
      return false;
    },
    [canUseBlockAction, toast],
  );
  const canUpdateCanvas = useMemo(
    () => blocks.every((block) => canUseBlockAction(block.type, "update")),
    [blocks, canUseBlockAction],
  );
  const requireCanvasUpdateAccess = useCallback(() => {
    const protectedBlock = blocks.find(
      (block) => !canUseBlockAction(block.type, "update"),
    );
    return protectedBlock
      ? requireBlockAction(protectedBlock, "update")
      : true;
  }, [blocks, canUseBlockAction, requireBlockAction]);
  const catalogBlocks = useMemo(
    () =>
      Object.values(masterBlocks)
        .map((masterBlock) => {
          const config =
            blockRegistry[masterBlock.type as keyof typeof blockRegistry];
          if (!config) return null;

          return {
            ...config,
            type: masterBlock.type,
            label: masterBlock.name ?? config.label,
            description: masterBlock.description ?? config.description,
            category: masterBlock.category ?? config.category,
            canCreate: masterBlock.builderActions?.includes("create") ?? false,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [masterBlocks],
  );
  const catalogBlockTypes = useMemo(
    () => catalogBlocks.map((block) => block.type),
    [catalogBlocks],
  );

  const createBlockFromSource = useCallback(
    (type: string, order: number): PageBlock | null => {
      const masterBlock = masterBlocks[type];
      if (masterBlock) return createBlockFromMaster(masterBlock, order);

      return null;
    },
    [masterBlocks],
  );
  const currentServerSnapshot = useMemo(
    () =>
      serializeBuilderSaveState({
        saveMode,
        title: pageTitle,
        description: pageDescription,
        url: pageUrl,
        categoryId: templateCategoryId,
        thumbnail: templateThumbnail,
        logo: pageLogo,
        logoShape: pageLogoShape,
        favicon: pageFavicon,
        backgroundColor: pageBackgroundColor,
        backgroundImage: pageBackgroundImage,
        blocks,
      }),
    [
      saveMode,
      pageTitle,
      pageDescription,
      pageUrl,
      templateCategoryId,
      templateThumbnail,
      pageLogo,
      pageLogoShape,
      pageFavicon,
      pageBackgroundColor,
      pageBackgroundImage,
      blocks,
    ],
  );

  const hasUnsavedServerChanges =
    currentServerSnapshot !== lastServerSavedSnapshot;
  const selectedConfig = selectedBlock
    ? (blockRegistry[selectedBlock.type as keyof typeof blockRegistry] ?? null)
    : null;
  const selectedSchema = selectedConfig?.schema ?? null;

  const selectedBlockLabel = selectedBlock
    ? (blockRegistry[selectedBlock.type as keyof typeof blockRegistry]?.label ??
      selectedBlock.type)
    : null;

  const selectedElementLabel = useMemo(() => {
    if (!selectedElementId || !selectedSchema) return null;
    const elementSchema =
      selectedSchema.elements[
        selectedElementId as keyof typeof selectedSchema.elements
      ];
    return elementSchema?.label ?? selectedElementId;
  }, [selectedElementId, selectedSchema]);

  const builderMetadata = useMemo(() => {
    const actionLabel = getBuilderActionLabel({
      saveMode,
      pageId,
      templateId,
      sourceTemplateId,
    });
    const entityName = compactMetaText(
      pageTitle,
      saveMode === "template" ? "قالب بدون عنوان" : "صفحه بدون عنوان",
    );
    const title = `${actionLabel}: ${entityName} | ${BUILDER_META_SUFFIX}`;
    const description = compactMetaText(
      pageDescription,
      `${actionLabel} «${entityName}» در ${BUILDER_META_SUFFIX}.`,
    );

    return { title, description };
  }, [
    pageDescription,
    pageId,
    pageTitle,
    saveMode,
    sourceTemplateId,
    templateId,
  ]);

  useEffect(() => {
    document.title = builderMetadata.title;
    upsertMetaTag('meta[name="description"]', {
      name: "description",
      content: builderMetadata.description,
    });
    upsertMetaTag('meta[property="og:title"]', {
      property: "og:title",
      content: builderMetadata.title,
    });
    upsertMetaTag('meta[property="og:description"]', {
      property: "og:description",
      content: builderMetadata.description,
    });
  }, [builderMetadata]);

  /* ── Scroll detection ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMasterBlocks() {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch("/api/blocks?mode=builder&limit=100", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.message ?? "خطا در دریافت بلاک‌ها");

        const raw: unknown[] = Array.isArray(json?.blocks)
          ? json.blocks
          : Array.isArray(json)
            ? json
            : [];
        const next: Record<string, MasterBlockDefinition> = {};

        raw.filter(isRecord).forEach((block) => {
          const type = String(block.type ?? "");
          if (!type) return;
          next[type] = {
            ...block,
            type,
            _id: typeof block._id === "string" ? block._id : undefined,
            id: typeof block.id === "string" ? block.id : undefined,
            name: typeof block.name === "string" ? block.name : undefined,
            version: Number(block.version ?? 1),
            data: isRecord(block.data) ? block.data : {},
            settings: isRecord(block.settings)
              ? (block.settings as PageBlock["settings"])
              : { direction: "rtl" },
            elements: isRecord(block.elements)
              ? (block.elements as PageBlock["elements"])
              : {},
            defaultBlock: isRecord(block.defaultBlock)
              ? (block.defaultBlock as Partial<PageBlock>)
              : undefined,
            isActive: block.isActive !== false,
            builderActions: Array.isArray(block.builderActions)
              ? block.builderActions.filter(
                  (action): action is BuilderBlockAction =>
                    ["view", "create", "update", "publish"].includes(
                      String(action),
                    ),
                )
              : [],
          };
        });

        if (!cancelled) setMasterBlocks(next);
      } catch {
        if (!cancelled) setMasterBlocks({});
      } finally {
        if (!cancelled) setIsMasterBlocksLoading(false);
      }
    }

    loadMasterBlocks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (saveMode !== "template") return;

    let cancelled = false;

    if (categoryOptionsCache || categoryOptionsRequestFailed) {
      setCategoryOptions(categoryOptionsCache ?? []);
      return;
    }

    async function loadCategories() {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch("/api/categories?mode=options&limit=100", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          categoryOptionsCache = [];
          categoryOptionsRequestFailed = true;
          throw new Error(
            typeof json?.message === "string"
              ? json.message
              : "خطا در دریافت دسته‌بندی‌ها",
          );
        }

        const raw: unknown[] = Array.isArray(json?.categories)
          ? json.categories
          : Array.isArray(json)
            ? json
            : [];

        if (!cancelled) {
          const options = raw
            .filter(
              (category): category is Record<string, unknown> =>
                typeof category === "object" && category !== null,
            )
            .map((category) => ({
              value: String(category._id ?? category.id ?? ""),
              label: String(category.name ?? "بدون نام"),
            }))
            .filter((option) => option.value);

          categoryOptionsCache = options;
          categoryOptionsRequestFailed = false;
          setCategoryOptions(options);
        }
      } catch (error) {
        if (!cancelled) {
          categoryOptionsCache = [];
          categoryOptionsRequestFailed = true;
          setCategoryOptions([]);
          const msg =
            error instanceof Error
              ? error.message
              : "خطا در دریافت دسته‌بندی‌ها";
          toast.show(msg, "error");
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [saveMode]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (!requireCanvasUpdateAccess()) return;
        history.undo();
        toast.show("برگشت به حالت قبل", "info");
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        if (!requireCanvasUpdateAccess()) return;
        history.redo();
        toast.show("اعمال مجدد", "info");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (selectedBlockId) {
          duplicateBlockById(selectedBlockId);
        }
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBlockId) {
          removeBlockById(selectedBlockId);
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setPageMetaOpen(true);
        return;
      }
      if (e.key === "?") setShowShortcuts((p) => !p);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history, requireCanvasUpdateAccess, selectedBlockId, toast]);
  useEffect(() => {
    if (!hasUnsavedServerChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedServerChanges]);
  /* ── Storage sync ── */
  useEffect(() => {
    if (!storageHydrated) return;
    setJustSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToStorage(blocks);
      setJustSaved(true);
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [blocks, storageHydrated]);

  useEffect(() => {
    if (externalBlocks && externalBlocks.length > 0) {
      setStorageHydrated(true);
      return;
    }
    const stored = loadFromStorage();
    if (stored && stored.length > 0) {
      const normalized = normalizeOrder(stored);
      setBlocks(normalized);
      setSelectedBlockId((prev) => {
        if (prev && normalized.some((b) => b.instanceId === prev)) return prev;
        return normalized[0]?.instanceId ?? null;
      });
      setSelectedElementId(normalized[0] ? "container" : null);
    }
    setStorageHydrated(true);
  }, [externalBlocks]);

  /* ── Sensors ── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /* ════════════════════════════════════════════ */
  /*  Block CRUD                                  */
  /* ════════════════════════════════════════════ */

  const addBlock = useCallback(
    (type: string) => {
      if (!canAddBlockCount()) return;
      const config = blockRegistry[type as keyof typeof blockRegistry];
      if (!allowedBlockTypes.has(type)) {
        toast.show(
          `شما دسترسی استفاده از بلاک "${config?.label ?? type}" را ندارید`,
          "error",
        );
        return;
      }
      if (!requireBlockAction(type, "create")) return;
      const next = createBlockFromSource(type, sortedBlocks.length);
      if (!next) return;
      setBlocks(normalizeOrder([...blocks, next]));
      setSelectedBlockId(next.instanceId);
      setSelectedElementId("container");
      toast.show(`بلاک "${config?.label ?? type}" اضافه شد`, "success");
    },
    [
      allowedBlockTypes,
      blocks,
      canAddBlockCount,
      createBlockFromSource,
      requireBlockAction,
      setBlocks,
      sortedBlocks.length,
      toast,
    ],
  );
  const collisionDetection = useCallback(
    (args: Parameters<typeof closestCenter>[0]) => {
      // اول gap‌ها رو چک کن (اولویت بالاتر)
      const pointerCollisions = pointerWithin(args);
      const gapCollisions = pointerCollisions.filter((c) =>
        String(c.id).startsWith("gap-"),
      );

      if (gapCollisions.length > 0) {
        return gapCollisions;
      }

      // بعد closestCenter برای بقیه
      return closestCenter(args);
    },
    [],
  );

  const undoable = useUndoableAction();

  const removeBlockById = useCallback(
    (id: string) => {
      const idx = sortedBlocks.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;

      const blockToRemove = sortedBlocks[idx];
      if (!requireBlockAction(blockToRemove, "update")) return;
      const config =
        blockRegistry[blockToRemove.type as keyof typeof blockRegistry];
      const label = config?.label ?? blockToRemove.type;

      // snapshot قبل از حذف
      const snapshotBlocks = [...blocks];
      const snapshotSelectedId = selectedBlockId;
      const snapshotElementId = selectedElementId;

      undoable.execute(
        `بلاک "${label}" حذف شد`,
        // action
        () => {
          const remaining = sortedBlocks.filter((b) => b.instanceId !== id);
          const next = remaining[idx] ?? remaining[idx - 1] ?? null;
          setBlocks(normalizeOrder(remaining));
          if (selectedBlockId === id) {
            setSelectedBlockId(next?.instanceId ?? null);
            setSelectedElementId(next ? "container" : null);
          }
        },
        // undo
        () => {
          setBlocks(snapshotBlocks);
          setSelectedBlockId(snapshotSelectedId);
          setSelectedElementId(snapshotElementId);
          toast.show("بلاک برگشت! ↩️", "success");
        },
      );
    },
    [
      sortedBlocks,
      selectedBlockId,
      selectedElementId,
      blocks,
      setBlocks,
      requireBlockAction,
      undoable,
      toast,
    ],
  );

  const removeSelectedBlock = useCallback(() => {
    if (selectedBlockId) {
      removeBlockById(selectedBlockId);
      // دیگه toast.show نمیخواد چون snackbar نشون میده
    }
  }, [selectedBlockId, removeBlockById]);

  const duplicateBlockById = useCallback(
    (id: string) => {
      if (!canAddBlockCount()) return;
      const idx = sortedBlocks.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      const sourceBlock = sortedBlocks[idx];
      const config =
        blockRegistry[sourceBlock.type as keyof typeof blockRegistry];
      if (!allowedBlockTypes.has(sourceBlock.type)) {
        toast.show(
          `شما دسترسی استفاده از بلاک "${config?.label ?? sourceBlock.type}" را ندارید`,
          "error",
        );
        return;
      }
      if (!requireBlockAction(sourceBlock, "create")) return;
      const dup = {
        ...cloneBlock(sourceBlock),
        order: sourceBlock.order + 1,
      };
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((b) => b.instanceId === id);
      if (i === -1) return;
      const n = [...sorted];
      n.splice(i + 1, 0, dup);
      setBlocks(normalizeOrder(n));
      setSelectedBlockId(dup.instanceId);
      setSelectedElementId("container");
      toast.show("بلاک کپی شد", "success");
    },
    [
      allowedBlockTypes,
      blocks,
      canAddBlockCount,
      requireBlockAction,
      setBlocks,
      sortedBlocks,
      toast,
    ],
  );

  const duplicateSelectedBlock = useCallback(() => {
    if (selectedBlockId) {
      duplicateBlockById(selectedBlockId);
    }
  }, [selectedBlockId, duplicateBlockById]);

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      if (!requireBlockAction(sorted[idx], "update")) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return;
      setBlocks(normalizeOrder(arrayMove(sorted, idx, targetIdx)));
    },
    [blocks, requireBlockAction, setBlocks],
  );
  const reorderBlocks = useCallback(
    (activeId: string, overId: string) => {
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const oldIndex = sorted.findIndex((b) => b.instanceId === activeId);
      const newIndex = sorted.findIndex((b) => b.instanceId === overId);
      if (oldIndex === -1 || newIndex === -1) return;
      if (!requireBlockAction(sorted[oldIndex], "update")) return;
      setBlocks(normalizeOrder(arrayMove(sorted, oldIndex, newIndex)));
      toast.show("ترتیب بلاک‌ها تغییر کرد", "info");
    },
    [blocks, requireBlockAction, setBlocks, toast],
  );
  /* ── Selection ── */
  const handleSelectElement = useCallback(
    (instanceId: string, elementId: string) => {
      setSelectedBlockId(instanceId);
      setSelectedElementId(elementId);
    },
    [],
  );

  const handleSelectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
    setSelectedElementId("container");
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-block-id="${id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  /* ── Content & Style ── */
  const updateSelectedContent = useCallback(
    (key: string, value: unknown) => {
      if (!selectedBlockId) return;
      const selected = blocks.find((b) => b.instanceId === selectedBlockId);
      if (!selected || !requireBlockAction(selected, "update")) return;
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== selectedBlockId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [selectedBlockId, blocks, requireBlockAction, setBlocks],
  );

  const handleInlineUpdateContent = useCallback(
    (instanceId: string, key: string, value: string) => {
      const selected = blocks.find((b) => b.instanceId === instanceId);
      if (!selected || !requireBlockAction(selected, "update")) return;
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== instanceId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [blocks, requireBlockAction, setBlocks],
  );

  const updateSelectedElementStyle = useCallback(
    (
      elementId: string,
      styleKey: EditableStyleKey,
      value: string | number | AnimationType,
    ) => {
      if (!selectedBlockId) return;
      const selected = blocks.find((b) => b.instanceId === selectedBlockId);
      if (!selected || !requireBlockAction(selected, "update")) return;
      setBlocks(
        blocks.map((b) => {
          if (b.instanceId !== selectedBlockId) return b;
          const el = b.elements[elementId];
          if (!el) return b;
          const currentStyle = el.style;
          const normalizedValue = normalizeStyleValue(styleKey, value);
          let nextStyle: EditableStyleMap;
          if (styleKey === "animation") {
            nextStyle = {
              ...currentStyle,
              animation: normalizedValue as AnimationType,
            };
          } else {
            const currentResponsiveValue = currentStyle[styleKey] as
              | ResponsiveValue<string | number>
              | undefined;
            nextStyle = {
              ...currentStyle,
              [styleKey]: updateResponsiveValue(
                currentResponsiveValue,
                "mobile",
                normalizedValue as string | number,
              ),
            };
          }
          return {
            ...b,
            elements: {
              ...b.elements,
              [elementId]: { ...el, style: nextStyle },
            },
          };
        }),
      );
    },
    [selectedBlockId, blocks, requireBlockAction, setBlocks],
  );

  const toggleBlockVisibility = useCallback(
    (id: string) => {
      const block = blocks.find((b) => b.instanceId === id);
      if (!block || !requireBlockAction(block, "update")) return;
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== id ? b : { ...b, hidden: !b.hidden },
        ),
      );
      const isNowHidden = !block?.hidden;
      toast.show(isNowHidden ? "بلاک مخفی شد 👁️‍🗨️" : "بلاک نمایان شد 👁️", "info");
    },
    [blocks, requireBlockAction, setBlocks, toast],
  );

  /* ── Clear all ── */
  const requestClearAllBlocks = useCallback(
    () => setClearConfirmOpen(true),
    [],
  );

  const confirmClearAllBlocks = useCallback(() => {
    const deniedBlock = blocks.find(
      (block) => !canUseBlockAction(block.type, "update"),
    );
    if (deniedBlock) {
      requireBlockAction(deniedBlock, "update");
      setClearConfirmOpen(false);
      return;
    }
    setBlocks([]);
    setSelectedBlockId(null);
    setSelectedElementId(null);
    localStorage.removeItem(STORAGE_KEY);
    setClearConfirmOpen(false);
    toast.show("همه بلاک‌ها حذف شدند", "success");
  }, [blocks, canUseBlockAction, requireBlockAction, setBlocks, toast]);

  /* ════════════════════════════════════════════ */
  /*  Server Save                                 */
  /* ════════════════════════════════════════════ */

  const ensureQrForCreatedPage = useCallback(
    async ({
      page,
      qr,
      token,
    }: {
      page: CreatedPageResponse;
      qr: unknown;
      token: string | null;
    }) => {
      if (isRecord(qr)) return qr;

      const pageIdForQr = getCreatedDocumentId(page);
      const targetUrl = buildClientPageTargetUrl(page.url);

      if (!pageIdForQr || !targetUrl) {
        throw new Error("اطلاعات صفحه برای ساخت QR کامل نیست.");
      }

      const qrResponse = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          pageId: pageIdForQr,
          targetUrl,
        }),
      });
      const qrJson = await qrResponse.json().catch(() => null);

      if (!qrResponse.ok || !isRecord(qrJson?.qr)) {
        throw new Error(qrJson?.message ?? "ساخت QR صفحه با خطا مواجه شد.");
      }

      return qrJson.qr;
    },
    [],
  );

  const createPageOnServer = useCallback(async () => {
    try {
      setIsServerSaving(true);
      setServerSaveError(null);
      setSlugSaveError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: pageTitle,
          url: pageUrl,
          description: pageDescription,
          templateId: sourceTemplateId,
          blocks,
          seo: {
            title: pageTitle,
            description: pageDescription,
            keywords: [],
          },
          settings: { direction: "rtl" },
          background: {
            color: pageBackgroundColor,
            image: pageBackgroundImage,
          },
          logo: pageLogo,
          logoShape: pageLogoShape,
          favicon: pageFavicon,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new PageSaveRequestError(
          json?.message ?? "خطا در ساخت صفحه",
          res.status,
        );
      }
      const createdPage = isRecord(json?.page)
        ? (json.page as CreatedPageResponse)
        : null;

      if (!createdPage) {
        throw new Error("اطلاعات صفحه ساخته‌شده از سرور دریافت نشد.");
      }

      await ensureQrForCreatedPage({
        page: createdPage,
        qr: json?.qr,
        token,
      });

      setPageId(getCreatedDocumentId(createdPage) || null);
      setPageSaveResult({
        status: "success",
        message: "صفحه با موفقیت ساخته شد و اکنون قابل مشاهده است.",
        pageUrl: buildClientPageTargetUrl(createdPage.url ?? pageUrl),
      });
      toast.show("صفحه با موفقیت ساخته شد! 🎉", "success");
      return createdPage;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطا در ساخت صفحه";
      if (error instanceof PageSaveRequestError && error.status === 409) {
        setServerSaveError(null);
        setSlugSaveError(msg);
        setPageSaveResult(null);
      } else {
        setServerSaveError(msg);
        setPageSaveResult({ status: "error", message: msg });
      }
      toast.show(msg, "error");
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [
    pageTitle,
    pageUrl,
    pageDescription,
    sourceTemplateId,
    blocks,
    pageBackgroundColor,
    pageBackgroundImage,
    pageLogo,
    pageLogoShape,
    pageFavicon,
    ensureQrForCreatedPage,
    toast,
  ]);

  const updatePageOnServer = useCallback(async () => {
    if (!pageId) return createPageOnServer();
    try {
      setIsServerSaving(true);
      setServerSaveError(null);
      setSlugSaveError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: pageTitle,
          url: pageUrl,
          description: pageDescription,
          templateId: sourceTemplateId,
          blocks,
          seo: {
            title: pageTitle,
            description: pageDescription,
            keywords: [],
          },
          settings: { direction: "rtl" },
          background: {
            color: pageBackgroundColor,
            image: pageBackgroundImage,
          },
          logo: pageLogo,
          logoShape: pageLogoShape,
          favicon: pageFavicon,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new PageSaveRequestError(
          json?.message ?? "خطا در ذخیره صفحه",
          res.status,
        );
      }
      setPageSaveResult({
        status: "success",
        message: "تغییرات صفحه با موفقیت ذخیره شد.",
        pageUrl: buildClientPageTargetUrl(json?.page?.url ?? pageUrl),
      });
      toast.show("تغییرات ذخیره شد ✅", "success");
      return json.page;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطا در ذخیره صفحه";
      if (error instanceof PageSaveRequestError && error.status === 409) {
        setServerSaveError(null);
        setSlugSaveError(msg);
        setPageSaveResult(null);
      } else {
        setServerSaveError(msg);
        setPageSaveResult({ status: "error", message: msg });
      }
      toast.show(msg, "error");
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [
    pageId,
    pageTitle,
    pageUrl,
    pageDescription,
    sourceTemplateId,
    blocks,
    pageBackgroundColor,
    pageBackgroundImage,
    pageLogo,
    pageLogoShape,
    pageFavicon,
    createPageOnServer,
    toast,
  ]);

  const createTemplateOnServer = useCallback(async () => {
    try {
      setIsServerSaving(true);
      setServerSaveError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: pageTitle,
          description: pageDescription,
          thumbnail: templateThumbnail,
          categoryId: templateCategoryId || undefined,
          builderBlocks: blocks,
          background: {
            color: pageBackgroundColor,
            image: pageBackgroundImage,
          },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ساخت قالب");
      setTemplateId(json.template?.id ?? json.template?._id ?? null);
      toast.show("قالب با موفقیت ساخته شد", "success");
      return json.template;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطا در ساخت قالب";
      setServerSaveError(msg);
      toast.show(msg, "error");
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [
    pageTitle,
    pageDescription,
    templateThumbnail,
    templateCategoryId,
    blocks,
    pageBackgroundColor,
    pageBackgroundImage,
    toast,
  ]);

  const updateTemplateOnServer = useCallback(async () => {
    if (!templateId) return createTemplateOnServer();

    try {
      setIsServerSaving(true);
      setServerSaveError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: pageTitle,
          description: pageDescription,
          thumbnail: templateThumbnail,
          categoryId: templateCategoryId || undefined,
          builderBlocks: blocks,
          background: {
            color: pageBackgroundColor,
            image: pageBackgroundImage,
          },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ذخیره قالب");
      toast.show("قالب ذخیره شد", "success");
      return json.template;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "خطا در ذخیره قالب";
      setServerSaveError(msg);
      toast.show(msg, "error");
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [
    templateId,
    createTemplateOnServer,
    pageTitle,
    pageDescription,
    templateThumbnail,
    templateCategoryId,
    blocks,
    pageBackgroundColor,
    pageBackgroundImage,
    toast,
  ]);
  const validateBeforeServerSave = useCallback((): string | null => {
    if (!pageTitle.trim()) {
      return "لطفاً عنوان صفحه را وارد کنید.";
    }

    if (blocks.length === 0) {
      return "برای ذخیره، حداقل یک بلاک به صفحه اضافه کنید.";
    }

    const unpublishedBlock = blocks.find(
      (block) => !canUseBlockAction(block.type, "publish"),
    );
    if (unpublishedBlock) {
      const config =
        blockRegistry[unpublishedBlock.type as keyof typeof blockRegistry];
      return `برای ذخیره‌ی صفحه یا قالب، دسترسی «انتشار» بلاک «${config?.label ?? unpublishedBlock.type}» لازم است.`;
    }

    if (saveMode === "page") {
      const normalizedUrl = pageUrl.trim().replace(/^\/+/, "");

      if (!normalizedUrl) {
        return "لطفاً آدرس صفحه را وارد کنید.";
      }

      if (normalizedUrl.length < 4) {
        return "آدرس صفحه باید حداقل ۴ کاراکتر باشد.";
      }

      if (/\s/.test(normalizedUrl)) {
        return "آدرس صفحه نباید دارای فاصله باشد. به‌جای فاصله از خط تیره استفاده کنید.";
      }

      if (/[?#]/.test(normalizedUrl)) {
        return "آدرس صفحه نباید شامل علامت سؤال یا # باشد.";
      }
    }

    return null;
  }, [blocks, canUseBlockAction, pageTitle, pageUrl, saveMode]);

  const reconcileBuilderFiles = useCallback(
    async (previousSnapshot: string, savedSnapshot: string) => {
      const previousUrls = collectStorageUrls(previousSnapshot);
      const savedUrls = collectStorageUrls(savedSnapshot);

      for (const url of previousUrls) {
        if (savedUrls.has(url)) continue;
        await deleteFile({ url }).catch((error) => {
          console.warn("Removed builder asset cleanup failed:", error);
        });
      }

      for (const [url, upload] of pendingBuilderUploads.current) {
        if (savedUrls.has(url)) {
          pendingBuilderUploads.current.delete(url);
          continue;
        }

        await deleteFile({ fileId: upload.fileId })
          .then(() => {
            pendingBuilderUploads.current.delete(url);
          })
          .catch((error) => {
            console.warn("Unused builder upload cleanup failed:", error);
          });
      }
    },
    [],
  );

  const cleanupUnusedBuilderUploads = useCallback(
    async (draftSnapshot: string) => {
      const draftUrls = collectStorageUrls(draftSnapshot);

      for (const [url, upload] of pendingBuilderUploads.current) {
        if (draftUrls.has(url)) continue;
        await deleteFile({ fileId: upload.fileId })
          .then(() => {
            pendingBuilderUploads.current.delete(url);
          })
          .catch((error) => {
            console.warn("Discarded builder upload cleanup failed:", error);
          });
      }
    },
    [],
  );

  const saveCurrentDocument = useCallback(async (): Promise<boolean> => {
    setServerSaveError(null);
    setSlugSaveError(null);

    const validationError = validateBeforeServerSave();

    if (validationError) {
      if (
        saveMode === "page" &&
        pageUrl.trim().replace(/^\/+/, "").length < 4
      ) {
        setSlugSaveError(validationError);
      } else {
        setServerSaveError(validationError);
      }
      toast.show(validationError, "error");
      return false;
    }

    // Capture exactly what is being sent to the server.
    // If the user changes something while the request is running,
    // the builder will remain dirty after the save finishes.
    const snapshotBeingSaved = currentServerSnapshot;

    const saved = await (saveMode === "template"
      ? updateTemplateOnServer()
      : updatePageOnServer());

    if (!saved) {
      return false;
    }

    await reconcileBuilderFiles(
      lastServerSavedSnapshot,
      snapshotBeingSaved,
    );
    setLastServerSavedSnapshot(snapshotBeingSaved);
    setJustSaved(true);

    return true;
  }, [
    currentServerSnapshot,
    lastServerSavedSnapshot,
    reconcileBuilderFiles,
    saveMode,
    pageUrl,
    toast,
    updatePageOnServer,
    updateTemplateOnServer,
    validateBeforeServerSave,
  ]);
  const handleMetaSave = useCallback(async () => {
    const saved = await saveCurrentDocument();

    if (!saved) return;

    setPageMetaOpen(false);

    if (leaveAfterMetaSave) {
      setLeaveAfterMetaSave(false);
      router.push(ADMIN_PATH);
    }
  }, [leaveAfterMetaSave, router, saveCurrentDocument]);
  const handleBackToAdmin = useCallback(() => {
    if (isServerSaving) return;

    if (!hasUnsavedServerChanges) {
      router.push(ADMIN_PATH);
      return;
    }

    setServerSaveError(null);
    setLeaveConfirmOpen(true);
  }, [hasUnsavedServerChanges, isServerSaving, router]);

  const handleSaveAndLeave = useCallback(async () => {
    const validationError = validateBeforeServerSave();

    if (validationError) {
      setServerSaveError(null);
      if (
        saveMode === "page" &&
        pageUrl.trim().replace(/^\/+/, "").length < 4
      ) {
        setSlugSaveError(validationError);
      } else {
        setServerSaveError(validationError);
      }
      setLeaveAfterMetaSave(true);
      setLeaveConfirmOpen(false);
      setPageMetaOpen(true);
      toast.show(validationError, "error");
      return;
    }

    const saved = await saveCurrentDocument();

    if (!saved) return;

    setLeaveConfirmOpen(false);
    setLeaveAfterMetaSave(false);
    router.push(ADMIN_PATH);
  }, [
    pageUrl,
    router,
    saveCurrentDocument,
    saveMode,
    toast,
    validateBeforeServerSave,
  ]);

  const handleLeaveWithoutSaving = useCallback(async () => {
    await cleanupUnusedBuilderUploads(currentServerSnapshot);
    setLeaveConfirmOpen(false);
    setLeaveAfterMetaSave(false);
    router.push(ADMIN_PATH);
  }, [cleanupUnusedBuilderUploads, currentServerSnapshot, router]);
  /* ════════════════════════════════════════════ */
  /*  DnD Handlers                                */
  /* ════════════════════════════════════════════ */

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const id = String(e.active.id);
    const data = e.active.data.current;
    if (data?.fromPalette) {
      setActivePaletteType(data.blockType as string);
      setActiveBlockId(null);
    } else {
      setActiveBlockId(id);
      setActivePaletteType(null);
    }
  }, []);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    setIsOverCanvas(e.over?.id === "canvas-drop-zone");
  }, []);

  const applyTemplate = useCallback(
    (blockTypes: string[]) => {
      const newBlocks: PageBlock[] = [];
      const allowedTypes = blockTypes.filter((type) =>
        allowedBlockTypes.has(type) && canUseBlockAction(type, "create"),
      );

      const protectedBlock = blocks.find(
        (block) => !canUseBlockAction(block.type, "update"),
      );
      if (protectedBlock) {
        requireBlockAction(protectedBlock, "update");
        return;
      }

      if (allowedTypes.length === 0) {
        toast.show("برای استفاده از بلاک‌های این قالب دسترسی ندارید", "error");
        return;
      }

      if (blockLimit > 0 && allowedTypes.length > blockLimit) {
        toast.show(
          `این قالب ${allowedTypes.length} بلاک دارد، اما سقف مجاز شما ${blockLimit} بلاک در هر صفحه است.`,
          "error",
        );
        return;
      }

      allowedTypes.forEach((type, index) => {
        const block = createBlockFromSource(type, index);
        if (block) newBlocks.push(block);
      });

      if (newBlocks.length === 0) return;

      setBlocks(normalizeOrder(newBlocks));
      setSelectedBlockId(newBlocks[0].instanceId);
      setSelectedElementId("container");
      toast.show(
        blockTypes.length > allowedTypes.length
          ? `قالب با ${newBlocks.length} بلاک مجاز اعمال شد`
          : `قالب با ${newBlocks.length} بلاک اعمال شد! 🎉`,
        "success",
      );
    },
    [
      allowedBlockTypes,
      blocks,
      blockLimit,
      canUseBlockAction,
      createBlockFromSource,
      requireBlockAction,
      setBlocks,
      toast,
    ],
  );

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      const data = active.data.current;

      setActiveBlockId(null);
      setActivePaletteType(null);
      setIsOverCanvas(false);

      if (!over) return;

      const overId = String(over.id);

      // ═══ Case 1: Palette → Canvas ═══
      if (data?.fromPalette) {
        if (!canAddBlockCount()) return;
        const blockType = data.blockType as string;
        const config = blockRegistry[blockType as keyof typeof blockRegistry];
        if (!allowedBlockTypes.has(blockType)) {
          toast.show(
            `شما دسترسی استفاده از بلاک "${config?.label ?? blockType}" را ندارید`,
            "error",
          );
          return;
        }
        if (!requireBlockAction(blockType, "create")) return;
        if (!config) return;

        // ── Drop روی gap بین بلاک‌ها ──
        if (overId.startsWith("gap-before-")) {
          const targetId = overId.replace("gap-before-", "");
          const targetIndex = sortedBlocks.findIndex(
            (b) => b.instanceId === targetId,
          );
          if (targetIndex !== -1) {
            const newBlock = createBlockFromSource(blockType, targetIndex);
            if (!newBlock) return;
            const sorted = [...blocks].sort((a, b) => a.order - b.order);
            const n = [...sorted];
            n.splice(targetIndex, 0, newBlock);
            setBlocks(normalizeOrder(n));
            setSelectedBlockId(newBlock.instanceId);
            setSelectedElementId("container");
            toast.show(`بلاک "${config.label}" اضافه شد`, "success");
            return;
          }
        }

        if (overId.startsWith("gap-after-")) {
          const targetId = overId.replace("gap-after-", "");
          const targetIndex = sortedBlocks.findIndex(
            (b) => b.instanceId === targetId,
          );
          if (targetIndex !== -1) {
            const newBlock = createBlockFromSource(blockType, targetIndex + 1);
            if (!newBlock) return;
            const sorted = [...blocks].sort((a, b) => a.order - b.order);
            const n = [...sorted];
            n.splice(targetIndex + 1, 0, newBlock);
            setBlocks(normalizeOrder(n));
            setSelectedBlockId(newBlock.instanceId);
            setSelectedElementId("container");
            toast.show(`بلاک "${config.label}" اضافه شد`, "success");
            return;
          }
        }

        // ── Drop روی canvas خالی یا خود بلاک ──
        if (overId === "canvas-drop-zone") {
          addBlock(blockType);
          return;
        }

        // ── Drop روی یک بلاک موجود (بعدش اضافه بشه) ──
        const existingBlockIndex = sortedBlocks.findIndex(
          (b) => b.instanceId === overId,
        );
        if (existingBlockIndex !== -1) {
          const newBlock = createBlockFromSource(
            blockType,
            existingBlockIndex + 1,
          );
          if (!newBlock) return;
          const sorted = [...blocks].sort((a, b) => a.order - b.order);
          const n = [...sorted];
          n.splice(existingBlockIndex + 1, 0, newBlock);
          setBlocks(normalizeOrder(n));
          setSelectedBlockId(newBlock.instanceId);
          setSelectedElementId("container");
          toast.show(`بلاک "${config.label}" اضافه شد`, "success");
          return;
        }

        // fallback
        addBlock(blockType);
        return;
      }

      // ═══ Case 2: Reordering بلاک‌های موجود ═══
      const aId = String(active.id);
      if (aId === overId) return;

      // اگر روی gap رها شد، gap رو نادیده بگیر
      if (overId.startsWith("gap-")) return;

      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const oi = sorted.findIndex((b) => b.instanceId === aId);
      const ni = sorted.findIndex((b) => b.instanceId === overId);
      if (oi === -1 || ni === -1) return;
      if (!requireBlockAction(sorted[oi], "update")) return;
      setBlocks(normalizeOrder(arrayMove(sorted, oi, ni)));
      toast.show("ترتیب بلاک‌ها تغییر کرد", "info");
    },
    [
      addBlock,
      allowedBlockTypes,
      blocks,
      canAddBlockCount,
      createBlockFromSource,
      requireBlockAction,
      setBlocks,
      sortedBlocks,
      toast,
    ],
  );

  const handleDragCancel = useCallback(() => {
    setActiveBlockId(null);
    setActivePaletteType(null);
    setIsOverCanvas(false);
  }, []);

  /* ════════════════════════════════════════════ */
  /*  RENDER                                      */
  /* ════════════════════════════════════════════ */

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection} // ← عوض شد
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToWindowEdges]}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <div dir="rtl" className="min-h-screen   bg-[#f5f5f7]">
        {/* ═══════════ Header ═══════════ */}
        <BuilderHeader
          blocksCount={blocks.length}
          justSaved={justSaved}
          mode={saveMode}
          pageId={saveMode === "template" ? templateId : pageId}
          isServerSaving={isServerSaving}
          canUndo={canUpdateCanvas && history.canUndo}
          canRedo={canUpdateCanvas && history.canRedo}
          hasUnsavedChanges={hasUnsavedServerChanges}
          onBack={handleBackToAdmin}
          onUndo={() => {
            if (!requireCanvasUpdateAccess()) return;
            history.undo();
            toast.show("برگشت", "info");
          }}
          onRedo={() => {
            if (!requireCanvasUpdateAccess()) return;
            history.redo();
            toast.show("بعدی", "info");
          }}
          onPreview={() => setIsPhonePreviewOpen(true)}
          onOpenMeta={() => {
            setLeaveAfterMetaSave(false);
            setServerSaveError(null);
            setPageMetaOpen(true);
          }}
          onOpenCatalog={() => setCatalogOpen(true)}
          onClearAll={requestClearAllBlocks}
          onStartTour={() => setForceTourRun(true)}
        />

        {/* ═══════════ Body ═══════════ */}
        <div className="flex items-start">
          {/* Sidebar */}
          <BlocksSidebar
            blocks={sortedBlocks}
            availableBlocks={catalogBlocks}
            isBlocksLoading={isMasterBlocksLoading}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
            onDeleteBlock={(id) => removeBlockById(id)}
            onDuplicateBlock={(id) => duplicateBlockById(id)}
            onMoveBlock={moveBlock}
            onReorder={reorderBlocks}
            onToggleVisibility={toggleBlockVisibility} // ← اضافه
            onAddBlock={() => setCatalogOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
          />

          {/* Canvas */}
          <main className="mx-auto min-w-0 max-w-5xl flex-1 px-4 pb-32 pt-6">
            {/* Breadcrumb */}
            <SelectionBreadcrumb
              blockLabel={selectedBlockLabel}
              elementLabel={
                selectedElementId === "container" ? null : selectedElementLabel
              }
              onClickBlock={() => {
                if (selectedBlockId) handleSelectBlock(selectedBlockId);
              }}
              onClickPage={() => {
                setSelectedBlockId(null);
                setSelectedElementId(null);
              }}
            />

            <br />

            {/* Canvas */}
            <CanvasContent
              background={{
                color: pageBackgroundColor,
                image: pageBackgroundImage,
              }}
              logo={saveMode === "page" ? pageLogo : ""}
              logoShape={pageLogoShape}
              onApplyTemplate={applyTemplate}
              showSmartSuggestions={!suppressSmartSuggestions}
              sortedBlocks={canvasBlocks}
              availableBlockTypes={catalogBlockTypes}
              blockIds={blockIds}
              selectedBlockId={selectedBlockId}
              selectedElementId={selectedElementId}
              activePaletteType={activePaletteType}
              isOverCanvas={isOverCanvas}
              onSelectElement={handleSelectElement}
              onUpdateContent={handleInlineUpdateContent}
              onMoveBlock={moveBlock}
              onDuplicateBlock={(id) => duplicateBlockById(id)}
              onDeleteBlock={(id) => removeBlockById(id)}
              onOpenCatalog={() => setCatalogOpen(true)}
              floatingActions={
                <LandingFloatingActions
                  contactBlock={contactSaveBlock}
                  pageUrl={
                    saveMode === "page"
                      ? buildClientPageTargetUrl(pageUrl)
                      : undefined
                  }
                  mode="editor"
                  enabled={canViewFloatingActions}
                  onEditContact={() => {
                    if (!contactSaveBlock) return;
                    setSelectedBlockId(contactSaveBlock.instanceId);
                    setSelectedElementId("button");
                  }}
                />
              }
            />

            {/* Bottom add button */}
            {sortedBlocks.length > 0 && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  data-tour="tour-bottom-add-btn"
                  onClick={() => setCatalogOpen(true)}
                  className="group flex items-center gap-2.5 rounded-2xl border-2 border-dashed border-neutral-300 bg-white px-8 py-4 text-[13px] font-semibold text-neutral-400 shadow-sm transition-all hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 hover:shadow-md active:scale-[0.98]"
                >
                  <HiOutlinePlus
                    size={16}
                    className="transition-transform group-hover:rotate-90"
                  />
                  افزودن بلاک جدید
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ═══════════ Drag Overlay ═══════════ */}
      <DragOverlay
        dropAnimation={{
          duration: 300,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        }}
        style={{ cursor: "grabbing" }}
      >
        {activeBlock ? (
          <UnifiedDragOverlay block={activeBlock} />
        ) : activePaletteType ? (
          <PaletteDragOverlay blockType={activePaletteType} />
        ) : null}
      </DragOverlay>

      {/* ═══════════ Modals & Panels ═══════════ */}
      <BlockCatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onAdd={addBlock}
        availableBlocks={catalogBlocks}
        isLoading={isMasterBlocksLoading}
      />

      <PageMetaModal
        open={pageMetaOpen}
        mode={saveMode}
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        urlError={slugSaveError}
        pageId={saveMode === "template" ? templateId : pageId}
        categoryId={templateCategoryId}
        categoryOptions={categoryOptions}
        thumbnail={templateThumbnail}
        logo={pageLogo}
        logoShape={pageLogoShape}
        favicon={pageFavicon}
        backgroundColor={pageBackgroundColor}
        backgroundImage={pageBackgroundImage}
        onTitleChange={setPageTitle}
        onDescriptionChange={setPageDescription}
        onUrlChange={(value) => {
          setPageUrl(value);
          setSlugSaveError(null);
        }}
        onCategoryIdChange={setTemplateCategoryId}
        onThumbnailChange={setTemplateThumbnail}
        onLogoChange={setPageLogo}
        onLogoShapeChange={setPageLogoShape}
        onFaviconChange={setPageFavicon}
        onBackgroundColorChange={setPageBackgroundColor}
        onBackgroundImageChange={setPageBackgroundImage}
        onClose={() => {
          setPageMetaOpen(false);
          setLeaveAfterMetaSave(false);
          setServerSaveError(null);
          setSlugSaveError(null);
        }}
        onSave={handleMetaSave}
        isSaving={isServerSaving}
        saveError={serverSaveError}
      />

      <PageSaveResultModal
        result={pageSaveResult}
        onClose={() => setPageSaveResult(null)}
      />

      <PhonePreviewModal
        open={isPhonePreviewOpen}
        blocks={blocks}
        pageUrl={
          saveMode === "page" ? buildClientPageTargetUrl(pageUrl) : undefined
        }
        showFloatingActions={canViewFloatingActions}
        logo={saveMode === "page" ? pageLogo : ""}
        logoShape={pageLogoShape}
        background={{
          color: pageBackgroundColor,
          image: pageBackgroundImage,
        }}
        onClose={() => setIsPhonePreviewOpen(false)}
      />
      <LeaveBuilderConfirmModal
        open={leaveConfirmOpen}
        isSaving={isServerSaving}
        saveError={serverSaveError}
        onCancel={() => {
          if (isServerSaving) return;

          setLeaveConfirmOpen(false);
          setLeaveAfterMetaSave(false);
          setServerSaveError(null);
        }}
        onSaveAndLeave={handleSaveAndLeave}
        onLeaveWithoutSaving={handleLeaveWithoutSaving}
      />
      <DynamicIslandPanel
        block={selectedBlock}
        schema={selectedSchema}
        readOnly={
          Boolean(selectedBlock) &&
          !canUseBlockAction(selectedBlock?.type ?? "", "update")
        }
        selectedElementId={selectedElementId}
        breakpoint={breakpoint}
        isScrolled={isScrolled}
        onBreakpointChange={setBreakpoint}
        onUpdateContent={updateSelectedContent}
        onUpdateStyle={updateSelectedElementStyle}
        onClose={() => {
          setSelectedBlockId(null);
          setSelectedElementId(null);
        }}
        onDeleteBlock={removeSelectedBlock}
        onDuplicateBlock={duplicateSelectedBlock}
      />

      <ClearAllConfirmModal
        open={clearConfirmOpen}
        blocksCount={blocks.length}
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={confirmClearAllBlocks}
      />

      {/* ═══════════ UX Overlays ═══════════ */}
      <ShortcutsHint visible={showShortcuts} />
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
      <BuilderTour
        hasBlocks={sortedBlocks.length > 0}
        hasInspector={Boolean(selectedBlock && selectedSchema)}
        sidebarCollapsed={sidebarCollapsed}
        onExpandSidebar={() => setSidebarCollapsed(false)}
        forceRun={forceTourRun}
        onForceRunHandled={() => setForceTourRun(false)}
      />
      {undoable.pending && (
        <UndoSnackbar
          message={undoable.pending.message}
          onUndo={undoable.undo}
          onDismiss={undoable.dismiss}
        />
      )}
    </DndContext>
  );
}
