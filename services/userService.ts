// ─────────────────────────────────────────────────────────────────
// services/userService.ts
// ─────────────────────────────────────────────────────────────────

import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ToggleUserStatusPayload,
  UserFilters,
  PaginatedUsersResponse,
  UserStats,
} from "@/types/index";

const BASE_URL = "/api/users";

class UserServiceError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string = "") {
    super(message);
    this.name = "UserServiceError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new UserServiceError(
      `خطا: ${res.status} ${res.statusText}`,
      res.status,
      body,
    );
  }

  return res.json();
}

function buildQuery(filters?: UserFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();

  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.sortKey) params.set("sortKey", filters.sortKey);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const userService = {
  // ── GET all users ──
  async getAll(filters?: UserFilters): Promise<PaginatedUsersResponse> {
    return request<PaginatedUsersResponse>(
      `${BASE_URL}${buildQuery(filters)}`,
    );
  },

  // ── GET single user ──
  async getById(id: string): Promise<User> {
    return request<User>(`${BASE_URL}/${id}`);
  },

  // ── GET stats ──
  async getStats(): Promise<UserStats> {
    return request<UserStats>(`${BASE_URL}/stats`);
  },

  // ── POST create ──
  async create(payload: CreateUserPayload): Promise<User> {
    return request<User>(BASE_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ── PUT update ──
  async update(payload: UpdateUserPayload): Promise<User> {
    const { id, ...data } = payload;
    return request<User>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // ── PATCH toggle status ──
  async toggleStatus(payload: ToggleUserStatusPayload): Promise<User> {
    return request<User>(`${BASE_URL}/${payload.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: payload.status }),
    });
  },

  // ── PATCH toggle active/block ──
  async toggleBlock(id: string, blocked: boolean): Promise<User> {
    return request<User>(`${BASE_URL}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: blocked ? "blocked" : "active",
      }),
    });
  },

  // ── PATCH reset password ──
  async resetPassword(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(
      `${BASE_URL}/${id}/reset-password`,
      { method: "PATCH" },
    );
  },

  // ── PATCH verify phone ──
  async verifyPhone(id: string): Promise<User> {
    return request<User>(`${BASE_URL}/${id}/verify-phone`, {
      method: "PATCH",
    });
  },

  // ── DELETE (soft delete) ──
  async delete(id: string): Promise<void> {
    await request<void>(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },

  // ── DELETE bulk ──
  async deleteBulk(ids: string[]): Promise<{ deleted: number }> {
    return request<{ deleted: number }>(`${BASE_URL}/bulk-delete`, {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },
};