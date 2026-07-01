import type {
  CreateUserPayload,
  ToggleUserStatusPayload,
  UpdateUserPayload,
  User,
  UserFilters,
  UserRole,
  UserStats,
  UserStatus,
} from "@/types/index";

type UserListResponse = {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type MessageResponse = {
  message?: string;
  deleted?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getAuthHeaders(hasBody = false): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function toQuery(filters?: UserFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("limit", String(filters.pageSize));
  if (filters.sortKey) params.set("sortKey", filters.sortKey);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);
  if (typeof filters.isPhoneVerified === "boolean") {
    params.set("isPhoneVerified", String(filters.isPhoneVerified));
  }
  if (typeof filters.isDeleted === "boolean") {
    params.set("isDeleted", String(filters.isDeleted));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const json: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      isRecord(json) && typeof json.message === "string"
        ? json.message
        : "Request failed";
    throw new Error(message);
  }

  return json as T;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function isUserRole(value: unknown): value is UserRole {
  return ["user", "agent", "admin", "superAdmin"].includes(String(value));
}

function isUserStatus(value: unknown): value is UserStatus {
  return ["active", "inactive"].includes(String(value));
}

function normalizeLimits(value: unknown): User["limits"] {
  const limits = isRecord(value) ? value : {};

  return {
    files: Number(limits.files ?? 0),
    blocks: Number(limits.blocks ?? 0),
    pages: Number(limits.pages ?? 0),
  };
}

function normalizePermissions(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function normalizeUser(value: unknown): User {
  const record = isRecord(value) ? value : {};
  const id = String(record.id ?? record._id ?? "");

  return {
    ...record,
    id,
    createdAt: asString(record.createdAt),
    updatedAt: asString(record.updatedAt),
    firstName: asString(record.firstName, undefined),
    lastName: asString(record.lastName, undefined),
    fullName: asString(record.fullName, undefined),
    phoneNumber: asString(record.phoneNumber),
    email: asString(record.email, undefined),
    avatarUrl: asString(record.avatarUrl, undefined),
    nationalCode: asString(record.nationalCode, undefined),
    fatherName: asString(record.fatherName, undefined),
    role: isUserRole(record.role) ? record.role : "user",
    status: isUserStatus(record.status) ? record.status : "active",
    permissions: normalizePermissions(record.permissions),
    limits: normalizeLimits(record.limits),
    agentId: asString(record.agentId ?? record.agentid, undefined),
    lastLoginAt: asString(record.lastLoginAt, undefined),
    lastOtpRequestAt: asString(record.lastOtpRequestAt, undefined),
    phoneVerifiedAt: asString(record.phoneVerifiedAt, undefined),
    isPhoneVerified: record.isPhoneVerified === true,
    isDeleted: record.isDeleted === true,
    createdBy: asString(record.createdBy, undefined),
    updatedBy: asString(record.updatedBy, undefined),
  };
}

function extractUser(json: unknown): User {
  if (isRecord(json) && "user" in json) return normalizeUser(json.user);
  return normalizeUser(json);
}

function computeStats(users: User[]): UserStats {
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    inactive: users.filter((user) => user.status === "inactive").length,
    agents: users.filter((user) => user.role === "agent").length,
    admins: users.filter((user) =>
      ["admin", "superAdmin"].includes(user.role),
    ).length,
  };
}

export const userService = {
  async getAll(filters?: UserFilters): Promise<UserListResponse> {
    const json = await fetchJson<unknown>(`/api/users${toQuery(filters)}`, {
      headers: getAuthHeaders(),
    });

    const records =
      isRecord(json) && Array.isArray(json.users)
        ? json.users
        : isRecord(json) && Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

    const page = isRecord(json) ? Number(json.page ?? 1) : 1;
    const pageSize = isRecord(json)
      ? Number(json.pageSize ?? json.limit ?? records.length)
      : records.length;
    const total = isRecord(json) ? Number(json.total ?? records.length) : records.length;

    return {
      data: records.map(normalizeUser),
      total,
      page,
      pageSize,
      totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 1,
    };
  },

  async getStats(): Promise<UserStats> {
    try {
      return await fetchJson<UserStats>("/api/users/stats", {
        headers: getAuthHeaders(),
      });
    } catch {
      const users = await this.getAll({ pageSize: 100 });
      return computeStats(users.data);
    }
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const json = await fetchJson<unknown>("/api/users", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    return extractUser(json);
  },

  async update(payload: UpdateUserPayload): Promise<User> {
    const { id, ...updates } = payload;
    const json = await fetchJson<unknown>(`/api/users/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify(updates),
    });

    return extractUser(json);
  },

  async delete(id: string): Promise<MessageResponse> {
    return fetchJson<MessageResponse>(`/api/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  },

  async toggleStatus(payload: ToggleUserStatusPayload): Promise<User> {
    const json = await fetchJson<unknown>(`/api/users/${payload.id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status: payload.status }),
    });

    return extractUser(json);
  },

  async resetPassword(id: string): Promise<MessageResponse> {
    return fetchJson<MessageResponse>(`/api/users/${id}/reset-password`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  },

  async verifyPhone(id: string): Promise<MessageResponse> {
    return fetchJson<MessageResponse>(`/api/users/${id}/verify-phone`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  },

  async deleteBulk(ids: string[]): Promise<MessageResponse> {
    return fetchJson<MessageResponse>("/api/users/bulk", {
      method: "DELETE",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ ids }),
    });
  },
};
