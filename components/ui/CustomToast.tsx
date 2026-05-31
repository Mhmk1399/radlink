"use client";

import { useState, useEffect, useCallback } from "react";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  typography,
  layout,
  animation,
  focus,
  components,
  accentTokens,
  type AccentColor,
} from "@/lib/design/design-system";

/* ══════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════ */

type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "custom";
type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  icon?: React.ReactNode;
  action?: ToastAction;
  accentColor?: AccentColor;
  progress?: boolean;
  createdAt: number;
}

interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  icon?: React.ReactNode;
  action?: ToastAction;
  accentColor?: AccentColor;
  progress?: boolean;
  position?: ToastPosition;
}

/* ══════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════ */

const toastKeyframes = `
@keyframes t-enter-r{0%{opacity:0;transform:translateX(24px) scale(.95)}100%{opacity:1;transform:translateX(0) scale(1)}}
@keyframes t-enter-l{0%{opacity:0;transform:translateX(-24px) scale(.95)}100%{opacity:1;transform:translateX(0) scale(1)}}
@keyframes t-enter-t{0%{opacity:0;transform:translateY(-24px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes t-enter-b{0%{opacity:0;transform:translateY(24px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes t-exit{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.9) translateY(-8px)}}
@keyframes t-progress{0%{transform:scaleX(1)}100%{transform:scaleX(0)}}
@keyframes t-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes t-shake{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-4px)}30%,60%{transform:translateX(4px)}}
@keyframes t-icon-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
@keyframes t-glow{0%,100%{opacity:.3}50%{opacity:.6}}
@keyframes t-check{0%{stroke-dashoffset:24}100%{stroke-dashoffset:0}}
@keyframes t-x{0%{stroke-dashoffset:16}100%{stroke-dashoffset:0}}
.t-enter-r{animation:t-enter-r .4s cubic-bezier(.22,1,.36,1) both}
.t-enter-l{animation:t-enter-l .4s cubic-bezier(.22,1,.36,1) both}
.t-enter-t{animation:t-enter-t .4s cubic-bezier(.22,1,.36,1) both}
.t-enter-b{animation:t-enter-b .4s cubic-bezier(.22,1,.36,1) both}
.t-exit{animation:t-exit .25s ease-in both}
.t-spin{animation:t-spin .9s linear infinite}
.t-shake{animation:t-shake .45s ease-in-out}
.t-icon-pop{animation:t-icon-pop .4s cubic-bezier(.22,1,.36,1) both .1s}
.t-glow{animation:t-glow 2.5s ease-in-out infinite}
.t-check{stroke-dasharray:24;animation:t-check .35s ease-out both .15s}
.t-x{stroke-dasharray:16;animation:t-x .3s ease-out both .15s}
`;

/* ══════════════════════════════════════════════
   TYPE VISUALS
   ══════════════════════════════════════════════ */

interface TypeVisuals {
  color: AccentColor;
  defaultTitle: string;
  defaultDuration: number;
  bg: string;
  border: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  glow: string;
  progress: string;
  title: string;
  msg: string;
  closeHover: string;
  icon: React.ReactNode;
}

const TV: Record<ToastType, TypeVisuals> = {
  success: {
    color: "emerald",
    defaultTitle: "عملیات موفق",
    defaultDuration: 4000,
    bg: "bg-linear-to-br from-[#022c22]/97 via-[#064e3b]/95 to-[#065f46]/90",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/20",
    iconBorder: "border-emerald-400/35",
    iconText: "text-emerald-300",
    glow: "bg-emerald-400/25",
    progress: "from-emerald-400 via-emerald-300 to-emerald-400",
    title: "text-emerald-50",
    msg: "text-emerald-100/75",
    closeHover: "hover:bg-emerald-400/15 hover:text-emerald-200",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5.5 w-5.5 t-icon-pop"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          className="fill-emerald-400/10 stroke-emerald-400/30"
          strokeWidth="1.5"
        />
        <path
          d="M7.5 12.5l3 3 6-6"
          className="stroke-emerald-300 t-check"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  error: {
    color: "red",
    defaultTitle: "خطا",
    defaultDuration: 6000,
    bg: "bg-linear-to-br from-[#2a0a0a]/97 via-[#450a0a]/95 to-[#7f1d1d]/85",
    border: "border-red-500/30",
    iconBg: "bg-red-500/20",
    iconBorder: "border-red-400/35",
    iconText: "text-red-300",
    glow: "bg-red-500/25",
    progress: "from-red-400 via-red-300 to-red-400",
    title: "text-red-50",
    msg: "text-red-100/75",
    closeHover: "hover:bg-red-400/15 hover:text-red-200",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5.5 w-5.5 t-icon-pop"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          className="fill-red-400/10 stroke-red-400/30"
          strokeWidth="1.5"
        />
        <path
          d="M15 9l-6 6M9 9l6 6"
          className="stroke-red-300 t-x"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    ),
  },
  warning: {
    color: "amber",
    defaultTitle: "توجه",
    defaultDuration: 5000,
    bg: "bg-linear-to-br from-[#1a1207]/97 via-[#451a03]/95 to-[#78350f]/85",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/20",
    iconBorder: "border-amber-400/35",
    iconText: "text-amber-300",
    glow: "bg-amber-400/20",
    progress: "from-amber-400 via-amber-300 to-amber-400",
    title: "text-amber-50",
    msg: "text-amber-100/75",
    closeHover: "hover:bg-amber-400/15 hover:text-amber-200",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5.5 w-5.5 t-icon-pop"
      >
        <path
          d="M12 3L2.5 20h19L12 3Z"
          className="fill-amber-400/10 stroke-amber-400/30"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12 10v3.5"
          className="stroke-amber-300"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.5" r="1.1" className="fill-amber-300" />
      </svg>
    ),
  },
  info: {
    color: "sky",
    defaultTitle: "اطلاعات",
    defaultDuration: 4000,
    bg: "bg-linear-to-br from-[#07151f]/97 via-[#0c4a6e]/95 to-[#075985]/85",
    border: "border-sky-500/30",
    iconBg: "bg-sky-500/20",
    iconBorder: "border-sky-400/35",
    iconText: "text-sky-300",
    glow: "bg-sky-400/20",
    progress: "from-sky-400 via-sky-300 to-sky-400",
    title: "text-sky-50",
    msg: "text-sky-100/75",
    closeHover: "hover:bg-sky-400/15 hover:text-sky-200",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5.5 w-5.5 t-icon-pop"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          className="fill-sky-400/10 stroke-sky-400/30"
          strokeWidth="1.5"
        />
        <path
          d="M12 8h.01M12 11.5v4.5"
          className="stroke-sky-300"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  loading: {
    color: "cyan",
    defaultTitle: "لطفاً صبر کنید",
    defaultDuration: 0,
    bg: "bg-linear-to-br from-[#071a1a]/97 via-[#164e63]/95 to-[#155e75]/85",
    border: "border-cyan-500/30",
    iconBg: "bg-cyan-500/20",
    iconBorder: "border-cyan-400/35",
    iconText: "text-cyan-300",
    glow: "bg-cyan-400/15",
    progress: "from-cyan-400 via-cyan-300 to-cyan-400",
    title: "text-cyan-50",
    msg: "text-cyan-100/75",
    closeHover: "hover:bg-cyan-400/15 hover:text-cyan-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5.5 w-5.5">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="opacity-15"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="t-spin origin-center"
        />
      </svg>
    ),
  },
  custom: {
    color: "violet",
    defaultTitle: "",
    defaultDuration: 4000,
    bg: "bg-linear-to-br from-[#0f071a]/97 via-[#2e1065]/95 to-[#4c1d95]/85",
    border: "border-violet-500/30",
    iconBg: "bg-violet-500/20",
    iconBorder: "border-violet-400/35",
    iconText: "text-violet-300",
    glow: "bg-violet-400/20",
    progress: "from-violet-400 via-violet-300 to-violet-400",
    title: "text-violet-50",
    msg: "text-violet-100/75",
    closeHover: "hover:bg-violet-400/15 hover:text-violet-200",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5.5 w-5.5 t-icon-pop"
      >
        <path
          d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.2 5.6 21.2 8 14l-6-4.8h7.6Z"
          className="fill-violet-400/15 stroke-violet-400/40"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

/* ══════════════════════════════════════════════
   STORE
   ══════════════════════════════════════════════ */

type Fn = () => void;
let toasts: Toast[] = [];
let subs: Fn[] = [];
let gPos: ToastPosition = "top-right";
let counter = 0;

const emit = () => subs.forEach((f) => f());
const sub = (f: Fn) => {
  subs.push(f);
  return () => {
    subs = subs.filter((x) => x !== f);
  };
};
const snap = () => toasts;

function add(o: ToastOptions): string {
  const id = `t${++counter}`;
  if (o.position) gPos = o.position;
  const v = TV[o.type || "info"];
  toasts = [
    ...toasts,
    {
      id,
      type: o.type || "info",
      title: o.title ?? v.defaultTitle,
      message: o.message,
      duration: o.duration ?? v.defaultDuration,
      dismissible: o.dismissible ?? true,
      icon: o.icon,
      action: o.action,
      accentColor: o.accentColor ?? v.color,
      progress: o.progress ?? o.type !== "loading",
      createdAt: Date.now(),
    },
  ];
  emit();
  return id;
}

function del(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}
function delAll() {
  toasts = [];
  emit();
}
function upd(id: string, u: Partial<ToastOptions>) {
  toasts = toasts.map((t) => {
    if (t.id !== id) return t;
    const v = TV[u.type || t.type];
    return {
      ...t,
      ...u,
      accentColor: u.accentColor ?? (u.type ? v.color : t.accentColor),
      icon: u.icon ?? (u.type ? undefined : t.icon),
      title: u.title ?? (u.type ? v.defaultTitle : t.title),
      duration: u.duration ?? (u.type ? v.defaultDuration : t.duration),
      progress: u.progress ?? (u.type ? u.type !== "loading" : t.progress),
      createdAt: Date.now(),
    } as Toast;
  });
  emit();
}

/* ══════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════ */

export function toast(m: string | ToastOptions) {
  return typeof m === "string" ? add({ message: m, type: "info" }) : add(m);
}
toast.success = (m: string, o?: Partial<ToastOptions>) =>
  add({ ...o, message: m, type: "success" });
toast.error = (m: string, o?: Partial<ToastOptions>) =>
  add({ ...o, message: m, type: "error" });
toast.warning = (m: string, o?: Partial<ToastOptions>) =>
  add({ ...o, message: m, type: "warning" });
toast.info = (m: string, o?: Partial<ToastOptions>) =>
  add({ ...o, message: m, type: "info" });
toast.loading = (m: string, o?: Partial<ToastOptions>) =>
  add({ ...o, message: m, type: "loading" });
toast.custom = (m: string, o?: Partial<ToastOptions>) =>
  add({ ...o, message: m, type: "custom" });
toast.dismiss = del;
toast.dismissAll = delAll;
toast.update = upd;
toast.promise = async <T,>(
  p: Promise<T>,
  msgs: {
    loading: string;
    success: string | ((d: T) => string);
    error: string | ((e: unknown) => string);
  },
  o?: Partial<ToastOptions>,
): Promise<T> => {
  const id = toast.loading(msgs.loading, o);
  try {
    const d = await p;
    toast.update(id, {
      type: "success",
      message:
        typeof msgs.success === "function" ? msgs.success(d) : msgs.success,
    });
    return d;
  } catch (e) {
    toast.update(id, {
      type: "error",
      message: typeof msgs.error === "function" ? msgs.error(e) : msgs.error,
    });
    throw e;
  }
};

/* ══════════════════════════════════════════════
   TOAST ITEM
   ══════════════════════════════════════════════ */

function ToastItem({
  toast: t,
  onDismiss,
  enterAnim,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
  enterAnim: string;
}) {
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);
  const v = TV[t.type];
  const icon = t.icon ?? v.icon;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(t.id), 280);
  }, [t.id, onDismiss]);

  useEffect(() => {
    if (!t.duration || t.duration <= 0 || paused) return;
    const tm = setTimeout(dismiss, t.duration);
    return () => clearTimeout(tm);
  }, [t.duration, dismiss, paused, t.createdAt]);

  // Swipe to dismiss on mobile
  const [touchX, setTouchX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const diff = e.touches[0].clientX - touchX;
    if (Math.abs(diff) > 8) setDragX(diff);
  };
  const onTouchEnd = () => {
    if (Math.abs(dragX) > 80) dismiss();
    else setDragX(0);
    setTouchX(null);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={
        dragX
          ? {
              transform: `translateX(${dragX}px)`,
              opacity: Math.max(0, 1 - Math.abs(dragX) / 200),
              transition: "none",
            }
          : undefined
      }
      className={cn(
        "group relative w-full overflow-hidden",
        "rounded-2xl",
        "border",
        v.border,
        v.bg,
        "backdrop-blur-2xl",
        "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_4px_16px_-4px_rgba(0,0,0,0.4)]",
        exiting ? "t-exit" : enterAnim,
        t.type === "error" && !exiting && "t-shake",
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[2px] bg-linear-to-r",
          v.progress,
          "opacity-80",
        )}
      />

      {/* Glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-3xl",
          v.glow,
          "t-glow",
        )}
      />

      {/* Content */}
      <div className="relative flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border",
            v.iconBorder,
            v.iconBg,
            v.iconText,
          )}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1 pt-px">
          {t.title && (
            <p className={cn("text-[13px] font-bold leading-tight", v.title)}>
              {t.title}
            </p>
          )}
          <p
            className={cn(
              "text-[13px] leading-relaxed",
              v.msg,
              t.title && "mt-1",
            )}
          >
            {t.message}
          </p>

          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action?.onClick();
                dismiss();
              }}
              className={cn(
                "mt-2.5 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold",
                v.iconBorder,
                v.iconBg,
                v.iconText,
                "transition-all duration-150",
                "hover:brightness-125 active:scale-95",
                focus.ring,
              )}
            >
              {t.action.label}
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3 -scale-x-100"
              >
                <path
                  fillRule="evenodd"
                  d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Close — همیشه نمایش داده می‌شود */}
        {t.dismissible && (
          <button
            type="button"
            onClick={dismiss}
            aria-label="بستن اعلان"
            className={cn(
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
              "text-white/40",
              "transition-all duration-150",
              v.closeHover,
              "active:scale-90",
              focus.ring,
            )}
          >
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress */}
      {t.progress && t.duration && t.duration > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/[0.05] overflow-hidden rounded-b-2xl">
          <div
            className={cn(
              "h-full origin-right bg-linear-to-r rounded-full",
              v.progress,
              "opacity-60",
            )}
            style={{
              animation: paused
                ? "none"
                : `t-progress ${t.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   <Toaster />
   ══════════════════════════════════════════════ */

const posMap: Record<ToastPosition, { box: string; anim: string }> = {
  "top-right": {
    box: "top-3 right-3 items-end sm:top-5 sm:right-5",
    anim: "t-enter-r",
  },
  "top-left": {
    box: "top-3 left-3 items-start sm:top-5 sm:left-5",
    anim: "t-enter-l",
  },
  "top-center": {
    box: "top-3 left-3 right-3 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-5 items-center",
    anim: "t-enter-t",
  },
  "bottom-right": {
    box: "bottom-3 right-3 items-end sm:bottom-5 sm:right-5",
    anim: "t-enter-r",
  },
  "bottom-left": {
    box: "bottom-3 left-3 items-start sm:bottom-5 sm:left-5",
    anim: "t-enter-l",
  },
  "bottom-center": {
    box: "bottom-3 left-3 right-3 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-5 items-center",
    anim: "t-enter-b",
  },
};

export function Toaster({
  position = "top-right",
  maxToasts = 5,
}: {
  position?: ToastPosition;
  maxToasts?: number;
}) {
  const [, rerender] = useState(0);
  useEffect(() => sub(() => rerender((n) => n + 1)), []);

  const all = snap();
  const pos = posMap[gPos || position];
  const visible = all.slice(-maxToasts);

  if (!visible.length) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: toastKeyframes }} />
      <div
        dir="rtl"
        role="region"
        aria-label="اعلان‌ها"
        className={cn(
          "fixed z-[9999] flex flex-col gap-2.5 pointer-events-none",
          "w-[calc(100%-24px)] sm:w-full sm:max-w-[400px]",
          pos.box,
        )}
      >
        {visible.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full">
            <ToastItem toast={t} onDismiss={del} enterAnim={pos.anim} />
          </div>
        ))}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════
   DEMO
   ══════════════════════════════════════════════ */

const demos: {
  label: string;
  sub: string;
  color: AccentColor;
  type: ToastType;
  fn: () => void;
}[] = [
  {
    label: "موفقیت‌آمیز",
    sub: "عملیات انجام شد",
    color: "emerald",
    type: "success",
    fn: () => toast.success("تغییرات با موفقیت ذخیره شد!"),
  },
  {
    label: "خطا",
    sub: "مشکلی پیش آمد",
    color: "red",
    type: "error",
    fn: () =>
      toast.error("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.", {
        title: "خطای اتصال",
      }),
  },
  {
    label: "هشدار",
    sub: "توجه کنید",
    color: "amber",
    type: "warning",
    fn: () => toast.warning("حجم فایل بیش از ۵ مگابایت است."),
  },
  {
    label: "اطلاعات",
    sub: "پیام جدید",
    color: "sky",
    type: "info",
    fn: () =>
      toast.info("نسخه جدید با امکانات بیشتر منتشر شد.", {
        title: "به‌روزرسانی",
      }),
  },
  {
    label: "بارگذاری",
    sub: "صبر کنید...",
    color: "cyan",
    type: "loading",
    fn: () => {
      const id = toast.loading("در حال ذخیره...");
      setTimeout(
        () => toast.update(id, { type: "success", message: "ذخیره شد!" }),
        3000,
      );
    },
  },
  {
    label: "Promise",
    sub: "۷۰٪ موفقیت",
    color: "blue",
    type: "loading",
    fn: () => {
      toast.promise(
        new Promise<string>((res, rej) =>
          setTimeout(
            () =>
              Math.random() > 0.3 ? res("دریافت شد") : rej(new Error("قطعی")),
            2500,
          ),
        ),
        {
          loading: "در حال دریافت...",
          success: (d) => `${d} ✓`,
          error: (e) => `${(e as Error).message}`,
        },
      );
    },
  },
  {
    label: "سفارشی",
    sub: "پیام ویژه",
    color: "violet",
    type: "custom",
    fn: () =>
      toast.custom("این یک اعلان شخصی‌سازی شده است.", { title: "پیام ویژه" }),
  },
  {
    label: "با اکشن",
    sub: "قابل بازگشت",
    color: "emerald",
    type: "success",
    fn: () =>
      toast.success("آیتم حذف شد.", {
        title: "حذف شد",
        action: {
          label: "بازگردانی",
          onClick: () => toast.info("بازگردانی شد."),
        },
        duration: 8000,
      }),
  },
];

export function ToastDemo() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />
      <section
        dir="rtl"
        className={cn("relative overflow-hidden", layout.section)}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              "absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
              backgrounds.glow.hero,
            )}
          />
          <div className={cn("absolute inset-0", backgrounds.grid.lines)} />
        </div>

        <div className={cn("relative", layout.container)}>
          <div className={components.sectionHeader}>
            <h2 className={typography.h2}>
              تست <span className={gradients.textPrimary}>اعلان‌ها</span>
            </h2>
            <p className={cn("mt-3", typography.body)}>
              روی هر کارت بزن تا اعلان مربوطه نمایش داده بشه. در موبایل می‌تونی
              با کشیدن به چپ/راست ببندی.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {demos.map((d) => {
              const t = accentTokens[d.color];
              const v = TV[d.type];
              return (
                <button
                  key={d.label}
                  onClick={d.fn}
                  className={cn(
                    "group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl border p-4 sm:p-5 text-center",
                    "border-white/8",
                    backgrounds.surface.card,
                    "transition-all duration-300",
                    "hover:border-white/15 hover:-translate-y-1",
                    "hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]",
                    "active:scale-[0.97]",
                    focus.ring,
                  )}
                >
                  {/* Hover glow */}
                  <div
                    className={cn(
                      "pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                      v.glow,
                    )}
                  />

                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl border",
                      v.iconBorder,
                      v.iconBg,
                      v.iconText,
                      "transition-transform duration-300 group-hover:scale-110",
                    )}
                  >
                    {v.icon}
                  </div>

                  <div>
                    <span className={cn("block text-xs font-bold", t.text)}>
                      {d.label}
                    </span>
                    <span
                      className={cn(
                        "block mt-0.5",
                        typography.labelSmall,
                        "text-slate-500",
                      )}
                    >
                      {d.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => toast.dismissAll()}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium text-slate-400",
                borders.subtle,
                backgrounds.surface.glass,
                animation.base,
                "hover:text-white hover:bg-white/[0.06]",
                animation.activePress,
                focus.ring,
              )}
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
              </svg>
              بستن همه
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
