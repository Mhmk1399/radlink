"use client";

import useSWR from "swr";

export type DashboardStats = {
  users: {
    total: number;
    active: number;
    newLast30Days: number;
    changePercent: number;
  };
  agents: {
    total: number;
    active: number;
  };
  blocks: {
    total: number;
    active: number;
  };
  pages: {
    total: number;
    published: number;
    totalViews: number;
    totalVisitors: number;
  };
  templates: {
    total: number;
    active: number;
  };
  tickets: {
    total: number;
    open: number;
  };
  qrcodes: {
    total: number;
    active: number;
  };
  products: {
    total: number;
  };
  files: {
    total: number;
  };
  notifications: {
    total: number;
  };
};

export type DashboardRecentUser = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: string;
};

export type DashboardRecentTicket = {
  _id?: string;
  id?: string;
  title?: string;
  status?: "open" | "in_progress" | "closed";
  priority?: "low" | "medium" | "high";
  requester?: {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardStatsResponse = {
  stats: DashboardStats;
  recentUsers: DashboardRecentUser[];
  recentTickets: DashboardRecentTicket[];
  generatedAt: string;
};

async function fetchDashboardStats([url, token]: readonly [string, string]) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof json?.message === "string"
        ? json.message
        : "خطا در دریافت آمار داشبورد",
    );
  }

  return json as DashboardStatsResponse;
}

export function useDashboardStats() {
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem("auth_token") ??
        localStorage.getItem("token") ??
        "")
      : "";
  const key = token ? (["/api/admin/dashboard", token] as const) : null;

  return useSWR<DashboardStatsResponse>(key, fetchDashboardStats, {
    dedupingInterval: 60_000,
    keepPreviousData: true,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });
}
