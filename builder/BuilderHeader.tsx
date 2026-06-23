// builder/components/BuilderHeader.tsx
"use client";

import {
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineArrowUturnRight,
  HiOutlineArrowUturnLeft,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import { HiOutlineEye } from "react-icons/hi2";
import { SaveIndicator, BlockCountBadge } from "./BuilderOverlays";

interface BuilderHeaderProps {
  blocksCount: number;
  justSaved: boolean;
  pageId: string | null;
  isServerSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges: boolean;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onOpenMeta: () => void;
  onOpenCatalog: () => void;
  onClearAll: () => void;
  onStartTour: () => void;
}

export function BuilderHeader({
  blocksCount,
  justSaved,
  pageId,
  isServerSaving,
  canUndo,
  canRedo,
  hasUnsavedChanges,
  onBack,
  onUndo,
  onRedo,
  onPreview,
  onOpenMeta,
  onOpenCatalog,
  onClearAll,
  onStartTour,
}: BuilderHeaderProps) {
  return (
    <header
      data-tour="tour-header"
      className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/90 backdrop-blur-2xl "
    >
      {" "}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-[13px] font-black text-white shadow-lg shadow-neutral-900/20">
              ص
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[15px] font-extrabold text-neutral-900">
                صفحه‌ساز
              </h1>
            </div>
            <div data-tour="tour-save-indicator">
              <SaveIndicator saved={justSaved} />
            </div>{" "}
            <BlockCountBadge count={blocksCount} />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div
              data-tour="tour-history-actions"
              className="hidden items-center gap-1 md:flex"
            >
              {" "}
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                title="برگشت (Ctrl+Z)"
              >
                <HiOutlineArrowUturnRight size={15} />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                title="بعدی (Ctrl+Y)"
              >
                <HiOutlineArrowUturnLeft size={15} />
              </button>
            </div>

            {/* Back to admin */}
            <button
              type="button"
              onClick={onBack}
              disabled={isServerSaving}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-800 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
              title={
                hasUnsavedChanges
                  ? "بازگشت به پنل، تغییرات ذخیره نشده است"
                  : "بازگشت به پنل مدیریت"
              }
            >
              <HiOutlineArrowRight size={16} />

              <span className="hidden text-[12px] font-semibold sm:inline">
                بازگشت به ادمین
              </span>

              {hasUnsavedChanges && (
                <span
                  className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500"
                  title="تغییرات ذخیره‌نشده"
                />
              )}
            </button>

            {/* Preview */}
            <button
              type="button"
              data-tour="tour-preview-btn"
              onClick={onPreview}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 hover:shadow-sm active:scale-95 sm:w-auto sm:gap-2 sm:px-4"
            >
              <HiOutlineEye size={16} />
              <span className="hidden text-[12px] font-semibold sm:inline">
                پیش‌نمایش
              </span>
            </button>

            {/* Save / Create */}
            <button
              type="button"
              data-tour="tour-save-page-btn"
              onClick={onOpenMeta}
              disabled={isServerSaving}
              className="flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-[12px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isServerSaving ? (
                <HiOutlineArrowPath size={14} className="animate-spin" />
              ) : pageId ? (
                <HiOutlineCheck size={14} />
              ) : (
                <HiOutlinePlus size={14} />
              )}
              <span className="hidden sm:inline">
                {isServerSaving ? "ذخیره..." : pageId ? "ذخیره" : "ساخت صفحه"}
              </span>
            </button>

            {/* Add block (mobile) */}
            <button
              type="button"
              data-tour="tour-mobile-add-btn"
              onClick={onOpenCatalog}
              className="flex h-10 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-[12px] font-bold text-white shadow-lg shadow-neutral-900/15 transition-all hover:bg-neutral-800 hover:shadow-xl active:scale-95 lg:hidden"
            >
              <HiOutlinePlus size={14} />
              <span className="hidden sm:inline">بلاک جدید</span>
            </button>
            <button
              type="button"
              onClick={onStartTour}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-neutral-700 hover:shadow-sm active:scale-95"
              title="راهنمای صفحه‌ساز"
            >
              <HiOutlineQuestionMarkCircle size={18} />
            </button>

            {/* Clear */}
            {blocksCount > 0 && (
              <button
                type="button"
                data-tour="tour-clear-btn"
                onClick={onClearAll}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 transition-all hover:bg-red-100 active:scale-95"
                title="پاک کردن همه"
              >
                <HiOutlineTrash size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
