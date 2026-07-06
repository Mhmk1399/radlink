export type PageExpiryAlertOwner = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type PageExpiryAlert = {
  id: string;
  title: string;
  url: string;
  expiresAt: string;
  owner: PageExpiryAlertOwner | null;
};

export type PageExpiryAlertsData = {
  alerts: PageExpiryAlert[];
  counts: {
    expired: number;
    critical: number;
    warning: number;
    total: number;
  };
  generatedAt: string;
};

type CacheEntry = {
  value: PageExpiryAlertsData | null;
  expiresAt: number;
  pending: Promise<PageExpiryAlertsData> | null;
};

const SERVER_CACHE_TTL_MS = 60 * 1000;

const globalCache = globalThis as typeof globalThis & {
  __radlinkPageExpiryAlertsCache?: CacheEntry;
};

function cacheEntry() {
  globalCache.__radlinkPageExpiryAlertsCache ??= {
    value: null,
    expiresAt: 0,
    pending: null,
  };
  return globalCache.__radlinkPageExpiryAlertsCache;
}

export async function getCachedPageExpiryAlerts(
  loader: () => Promise<PageExpiryAlertsData>,
  forceRefresh = false,
) {
  const entry = cacheEntry();

  if (!forceRefresh && entry.value && Date.now() < entry.expiresAt) {
    return { data: entry.value, cacheStatus: "hit" as const };
  }

  if (!forceRefresh && entry.pending) {
    return {
      data: await entry.pending,
      cacheStatus: "hit" as const,
    };
  }

  const pending = loader();
  entry.pending = pending;

  try {
    const value = await pending;
    entry.value = value;
    entry.expiresAt = Date.now() + SERVER_CACHE_TTL_MS;
    return { data: value, cacheStatus: "miss" as const };
  } finally {
    if (entry.pending === pending) entry.pending = null;
  }
}

export function invalidatePageExpiryAlertsCache() {
  const entry = cacheEntry();
  entry.value = null;
  entry.expiresAt = 0;
}
