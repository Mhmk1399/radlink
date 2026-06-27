"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { FaBell, FaXmark } from "react-icons/fa6";

export type PublicPageNotification = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  closeable: boolean;
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
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-neutral-950/25 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`notification-title-${activeNotification.id}`}
      aria-describedby={`notification-description-${activeNotification.id}`}
      dir="rtl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeActiveNotification();
      }}
    >
      <section className="relative w-full max-w-md rounded-2xl border border-white/70 bg-white/95 p-6 text-right shadow-2xl shadow-neutral-950/20 sm:p-8">
        {activeNotification.closeable && (
          <button
            type="button"
            onClick={closeActiveNotification}
            className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#427AA1]/35"
            aria-label="بستن اعلان"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        )}

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EBF2FA] text-[#064789]">
          <FaBell className="h-5 w-5" />
        </div>

        {activeNotification.subtitle && (
          <p className="mb-2 text-xs font-bold text-[#427AA1] sm:text-sm">
            {activeNotification.subtitle}
          </p>
        )}

        <h2
          id={`notification-title-${activeNotification.id}`}
          className="text-xl font-black leading-8 text-neutral-950 sm:text-2xl"
        >
          {activeNotification.title}
        </h2>

        <p
          id={`notification-description-${activeNotification.id}`}
          className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8"
        >
          {activeNotification.description}
        </p>

        {activeNotification.closeable && (
          <button
            type="button"
            onClick={closeActiveNotification}
            className="mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#064789] px-5 text-sm font-bold text-white transition hover:bg-[#427AA1] focus:outline-none focus:ring-4 focus:ring-[#427AA1]/25"
          >
            متوجه شدم
          </button>
        )}
      </section>
    </div>
  );
}
