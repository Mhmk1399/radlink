"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { FaXmark } from "react-icons/fa6";
import { NotificationIcon } from "@/components/notifications/NotificationIcon";

export type PublicPageNotification = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: "info" | "danger";
  iconKey?: string;
  closeable: boolean;
  creatorName?: string;
};

const DISMISSED_STORAGE_KEY = "radlink-dismissed-page-notifications";
const subscribeToHydration = () => () => {};

function readDismissedIds() {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(DISMISSED_STORAGE_KEY) ?? "[]",
    );
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}

function rememberDismissedId(id: string) {
  const dismissed = readDismissedIds();
  dismissed.add(id);
  window.sessionStorage.setItem(
    DISMISSED_STORAGE_KEY,
    JSON.stringify(Array.from(dismissed)),
  );
}

const THEME = {
  danger: {
    accentBar: "bg-gradient-to-l from-red-500 to-rose-600",
    iconWrap: "bg-red-50 text-red-600 ring-1 ring-inset ring-red-100",
    iconGlow: "bg-red-500/15",
    subtitle: "text-red-600",
    closeFocus: "focus-visible:ring-red-300",
    primaryBtn:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-200 shadow-red-600/25",
    border: "border-red-100",
  },
  info: {
    accentBar: "bg-gradient-to-l from-blue-500 to-indigo-600",
    iconWrap: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100",
    iconGlow: "bg-blue-500/15",
    subtitle: "text-blue-700",
    closeFocus: "focus-visible:ring-blue-300",
    primaryBtn:
      "bg-blue-700 hover:bg-blue-600 active:bg-blue-800 focus-visible:ring-blue-200 shadow-blue-700/25",
    border: "border-blue-100",
  },
} as const;

export default function PageNotificationModal({
  notifications,
}: {
  notifications: PublicPageNotification[];
}) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const storageReady = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const storedDismissedIds = useMemo(
    () => (storageReady ? readDismissedIds() : new Set<string>()),
    [storageReady],
  );

  const visibleNotifications = useMemo(
    () =>
      storageReady
        ? notifications.filter(
            (notification) =>
              !storedDismissedIds.has(notification.id) &&
              !dismissedIds.has(notification.id),
          )
        : [],
    [dismissedIds, notifications, storageReady, storedDismissedIds],
  );
  const activeNotification = visibleNotifications[0];
  const isDanger = activeNotification?.type === "danger";
  const theme = isDanger ? THEME.danger : THEME.info;

  const closeActiveNotification = useCallback(() => {
    if (!activeNotification?.closeable) return;

    rememberDismissedId(activeNotification.id);
    setDismissedIds((current) => {
      const next = new Set(current);
      next.add(activeNotification.id);
      return next;
    });
  }, [activeNotification]);

  useEffect(() => {
    if (!activeNotification) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeNotification.closeable) {
        closeActiveNotification();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [activeNotification, closeActiveNotification]);

  if (!activeNotification) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center overflow-y-auto bg-neutral-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`notification-title-${activeNotification.id}`}
      aria-describedby={`notification-description-${activeNotification.id}`}
      dir="rtl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeActiveNotification();
      }}
    >
      <section
        className={`animate-notification-in relative my-auto w-full max-w-md overflow-hidden rounded-t-3xl border bg-white text-right shadow-2xl shadow-neutral-950/25 sm:rounded-3xl ${theme.border}`}
      >
        {/* Top accent bar — instant info/danger read */}
        <span
          aria-hidden="true"
          className={`block h-1.5 w-full ${theme.accentBar}`}
        />

        <div className="p-5 sm:p-7 md:p-8">
          {activeNotification.closeable && (
            <button
              type="button"
              onClick={closeActiveNotification}
              className={`absolute left-3 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 sm:left-5 sm:top-7 ${theme.closeFocus}`}
              aria-label="بستن اعلان"
            >
              <FaXmark className="h-4 w-4" />
            </button>
          )}

          {/* Icon with soft glow */}
          <div className="relative mb-5 inline-flex">
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-2xl blur-md ${theme.iconGlow}`}
            />
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${theme.iconWrap}`}
            >
              <NotificationIcon
                iconKey={activeNotification.iconKey}
                type={activeNotification.type}
                className="h-5 w-5 sm:h-6 sm:w-6"
              />
            </div>
          </div>

          {activeNotification.subtitle && (
            <p
              className={`mb-1.5 text-xs font-bold tracking-wide sm:text-sm ${theme.subtitle}`}
            >
              {activeNotification.subtitle}
            </p>
          )}

          <h2
            id={`notification-title-${activeNotification.id}`}
            className="text-lg font-black leading-7 text-neutral-950 sm:text-2xl sm:leading-9"
          >
            {activeNotification.title}
          </h2>

          <p
            id={`notification-description-${activeNotification.id}`}
            className="mt-3 max-h-[40vh] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-neutral-600 sm:mt-4 sm:max-h-[50vh] sm:text-base sm:leading-8"
          >
            {activeNotification.description}
          </p>

          {activeNotification.creatorName && (
            <p className="mt-4 rounded-2xl bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-500 ring-1 ring-neutral-100">
              ایجاد شده توسط {activeNotification.creatorName}
            </p>
          )}

          {activeNotification.closeable && (
            <button
              type="button"
              onClick={closeActiveNotification}
              className={`mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-bold text-white shadow-lg transition focus:outline-none focus-visible:ring-4 sm:mt-7 sm:text-base ${theme.primaryBtn}`}
            >
              متوجه شدم
            </button>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes notification-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-notification-in {
          animation: notification-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-notification-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
