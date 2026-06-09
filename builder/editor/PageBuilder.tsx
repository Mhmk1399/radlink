// SimplePageBuilder.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

import { HiOutlinePlus } from "react-icons/hi2";
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
  ClearAllConfirmModal,
  PageMetaModal,
} from "../BuilderModals";
import { BuilderTour } from "../BuilderTour";

/* ================================================================== */
/*  Props                                                              */
/* ================================================================== */

type SimplePageBuilderProps = {
  pageId?: string;
  initialBlocks?: PageBlock[];
  initialTitle?: string;
  initialDescription?: string;
  initialUrl?: string;
};

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function SimplePageBuilder({
  pageId: initialPageId,
  initialBlocks: externalBlocks,
  initialTitle,
  initialDescription,
  initialUrl,
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

  /* ── Page state ── */
  const [pageId, setPageId] = useState<string | null>(initialPageId || null);
  const [pageTitle, setPageTitle] = useState(initialTitle || "صفحه جدید");
  const [pageUrl, setPageUrl] = useState(initialUrl || "new-page");
  const [pageDescription, setPageDescription] = useState(
    initialDescription || "",
  );

  /* ── UI state ── */
  const [isServerSaving, setIsServerSaving] = useState(false);
  const [serverSaveError, setServerSaveError] = useState<string | null>(null);
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

  /* ── Toast & Onboarding ── */
  const toast = useToast();

  /* ── Derived ── */
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order - b.order),
    [blocks],
  );
  const blockIds = useMemo(
    () => sortedBlocks.map((b) => b.instanceId),
    [sortedBlocks],
  );
  const selectedBlock = useMemo(
    () => blocks.find((b) => b.instanceId === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );
  const activeBlock = useMemo(
    () => blocks.find((b) => b.instanceId === activeBlockId) ?? null,
    [activeBlockId, blocks],
  );

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

  /* ── Scroll detection ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        history.undo();
        toast.show("برگشت به حالت قبل", "info");
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        history.redo();
        toast.show("اعمال مجدد", "info");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (selectedBlockId) {
          duplicateBlockById(selectedBlockId);
          toast.show("بلاک کپی شد", "success");
        }
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedBlockId) {
          removeBlockById(selectedBlockId);
          toast.show("بلاک حذف شد", "success");
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
  }, [history, selectedBlockId, toast]);

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
      const config = blockRegistry[type as keyof typeof blockRegistry];
      if (!config) return;
      const next = config.createDefaultBlock(sortedBlocks.length);
      setBlocks(normalizeOrder([...blocks, next]));
      setSelectedBlockId(next.instanceId);
      setSelectedElementId("container");
      toast.show(`بلاک "${config.label}" اضافه شد`, "success");
    },
    [sortedBlocks.length, blocks, setBlocks, toast],
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
      const idx = sortedBlocks.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      const dup = {
        ...cloneBlock(sortedBlocks[idx]),
        order: sortedBlocks[idx].order + 1,
      };
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((b) => b.instanceId === id);
      if (i === -1) return;
      const n = [...sorted];
      n.splice(i + 1, 0, dup);
      setBlocks(normalizeOrder(n));
      setSelectedBlockId(dup.instanceId);
      setSelectedElementId("container");
    },
    [sortedBlocks, blocks, setBlocks],
  );

  const duplicateSelectedBlock = useCallback(() => {
    if (selectedBlockId) {
      duplicateBlockById(selectedBlockId);
      toast.show("بلاک کپی شد", "success");
    }
  }, [selectedBlockId, duplicateBlockById, toast]);

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((b) => b.instanceId === id);
      if (idx === -1) return;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return;
      setBlocks(normalizeOrder(arrayMove(sorted, idx, targetIdx)));
    },
    [blocks, setBlocks],
  );
  const reorderBlocks = useCallback(
    (activeId: string, overId: string) => {
      const sorted = [...blocks].sort((a, b) => a.order - b.order);
      const oldIndex = sorted.findIndex((b) => b.instanceId === activeId);
      const newIndex = sorted.findIndex((b) => b.instanceId === overId);
      if (oldIndex === -1 || newIndex === -1) return;
      setBlocks(normalizeOrder(arrayMove(sorted, oldIndex, newIndex)));
      toast.show("ترتیب بلاک‌ها تغییر کرد", "info");
    },
    [blocks, setBlocks, toast],
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
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== selectedBlockId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [selectedBlockId, blocks, setBlocks],
  );

  const handleInlineUpdateContent = useCallback(
    (instanceId: string, key: string, value: string) => {
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== instanceId
            ? b
            : { ...b, data: { ...b.data, [key]: value } },
        ),
      );
    },
    [blocks, setBlocks],
  );

  const updateSelectedElementStyle = useCallback(
    (
      elementId: string,
      styleKey: EditableStyleKey,
      value: string | number | AnimationType,
    ) => {
      if (!selectedBlockId) return;
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
    [selectedBlockId, blocks, setBlocks],
  );

  const toggleBlockVisibility = useCallback(
    (id: string) => {
      setBlocks(
        blocks.map((b) =>
          b.instanceId !== id ? b : { ...b, hidden: !b.hidden },
        ),
      );
      const block = blocks.find((b) => b.instanceId === id);
      const isNowHidden = !block?.hidden;
      toast.show(isNowHidden ? "بلاک مخفی شد 👁️‍🗨️" : "بلاک نمایان شد 👁️", "info");
    },
    [blocks, setBlocks, toast],
  );

  /* ── Clear all ── */
  const requestClearAllBlocks = useCallback(
    () => setClearConfirmOpen(true),
    [],
  );

  const confirmClearAllBlocks = useCallback(() => {
    setBlocks([]);
    setSelectedBlockId(null);
    setSelectedElementId(null);
    localStorage.removeItem(STORAGE_KEY);
    setClearConfirmOpen(false);
    toast.show("همه بلاک‌ها حذف شدند", "success");
  }, [setBlocks, toast]);

  /* ════════════════════════════════════════════ */
  /*  Server Save                                 */
  /* ════════════════════════════════════════════ */

  const createPageOnServer = useCallback(async () => {
    try {
      setIsServerSaving(true);
      setServerSaveError(null);
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
          blocks,
          seo: {
            title: pageTitle,
            description: pageDescription,
            keywords: [],
          },
          settings: { direction: "rtl" },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ساخت صفحه");
      setPageId(json.page?.id ?? json.page?._id ?? null);
      toast.show("صفحه با موفقیت ساخته شد! 🎉", "success");
      return json.page;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطا در ساخت صفحه";
      setServerSaveError(msg);
      toast.show(msg, "error");
      return null;
    } finally {
      setIsServerSaving(false);
    }
  }, [pageTitle, pageUrl, pageDescription, blocks, toast]);

  const updatePageOnServer = useCallback(async () => {
    if (!pageId) return createPageOnServer();
    try {
      setIsServerSaving(true);
      setServerSaveError(null);
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
          blocks,
          seo: {
            title: pageTitle,
            description: pageDescription,
            keywords: [],
          },
          settings: { direction: "rtl" },
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "خطا در ذخیره صفحه");
      toast.show("تغییرات ذخیره شد ✅", "success");
      return json.page;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "خطا در ذخیره صفحه";
      setServerSaveError(msg);
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
    blocks,
    createPageOnServer,
    toast,
  ]);

  const handleMetaSave = useCallback(async () => {
    const savedPage = await updatePageOnServer();
    if (savedPage) {
      setJustSaved(true);
      setPageMetaOpen(false);
    }
  }, [updatePageOnServer]);

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
      blockTypes.forEach((type, index) => {
        const config = blockRegistry[type as keyof typeof blockRegistry];
        if (config) {
          newBlocks.push(config.createDefaultBlock(index));
        }
      });

      if (newBlocks.length === 0) return;

      setBlocks(normalizeOrder(newBlocks));
      setSelectedBlockId(newBlocks[0].instanceId);
      setSelectedElementId("container");
      toast.show(`قالب با ${newBlocks.length} بلاک اعمال شد! 🎉`, "success");
    },
    [setBlocks, toast],
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
        const blockType = data.blockType as string;
        const config = blockRegistry[blockType as keyof typeof blockRegistry];
        if (!config) return;

        // ── Drop روی gap بین بلاک‌ها ──
        if (overId.startsWith("gap-before-")) {
          const targetId = overId.replace("gap-before-", "");
          const targetIndex = sortedBlocks.findIndex(
            (b) => b.instanceId === targetId,
          );
          if (targetIndex !== -1) {
            const newBlock = config.createDefaultBlock(targetIndex);
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
            const newBlock = config.createDefaultBlock(targetIndex + 1);
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
          const newBlock = config.createDefaultBlock(existingBlockIndex + 1);
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
      setBlocks(normalizeOrder(arrayMove(sorted, oi, ni)));
      toast.show("ترتیب بلاک‌ها تغییر کرد", "info");
    },
    [blocks, sortedBlocks, setBlocks, toast, addBlock],
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
          pageId={pageId}
          isServerSaving={isServerSaving}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={() => {
            history.undo();
            toast.show("برگشت", "info");
          }}
          onRedo={() => {
            history.redo();
            toast.show("بعدی", "info");
          }}
          onPreview={() => setIsPhonePreviewOpen(true)}
          onOpenMeta={() => setPageMetaOpen(true)}
          onOpenCatalog={() => setCatalogOpen(true)}
          onClearAll={requestClearAllBlocks}
          onStartTour={() => setForceTourRun(true)}
        />

        {/* ═══════════ Body ═══════════ */}
        <div className="flex items-start">
          {/* Sidebar */}
          <BlocksSidebar
            blocks={sortedBlocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
            onDeleteBlock={(id) => removeBlockById(id)}
            onDuplicateBlock={(id) => {
              duplicateBlockById(id);
              toast.show("بلاک کپی شد", "success");
            }}
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
              onApplyTemplate={applyTemplate}
              sortedBlocks={sortedBlocks}
              blockIds={blockIds}
              selectedBlockId={selectedBlockId}
              selectedElementId={selectedElementId}
              activePaletteType={activePaletteType}
              isOverCanvas={isOverCanvas}
              onSelectElement={handleSelectElement}
              onUpdateContent={handleInlineUpdateContent}
              onMoveBlock={moveBlock}
              onDuplicateBlock={(id) => {
                duplicateBlockById(id);
                toast.show("بلاک کپی شد", "success");
              }}
              onDeleteBlock={(id) => {
                removeBlockById(id);
                toast.show("بلاک حذف شد", "success");
              }}
              onOpenCatalog={() => setCatalogOpen(true)}
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
      />

      <PageMetaModal
        open={pageMetaOpen}
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        pageId={pageId}
        onTitleChange={setPageTitle}
        onDescriptionChange={setPageDescription}
        onUrlChange={setPageUrl}
        onClose={() => setPageMetaOpen(false)}
        onSave={handleMetaSave}
        isSaving={isServerSaving}
        saveError={serverSaveError}
      />

      <PhonePreviewModal
        open={isPhonePreviewOpen}
        blocks={blocks}
        onClose={() => setIsPhonePreviewOpen(false)}
      />

      <DynamicIslandPanel
        block={selectedBlock}
        schema={selectedSchema}
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
