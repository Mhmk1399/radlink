// ─────────────────────────────────────────────────────────────────
// hooks/useTableData.ts
// ─────────────────────────────────────────────────────────────────
"use client";

import useSWR, { type SWRConfiguration, type KeyedMutator } from "swr";
import { useCallback, useRef } from "react";
import { ServerPaginatedResponse } from "@/types/table";

/* ══════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════ */

export interface ServerPaginationParams {
    page: number;
    pageSize: number;
    search?: string;
    sortKey?: string;
    sortDir?: "asc" | "desc";
    filters?: Record<string, string>;
}



export interface UseTableDataOptions<T> {
    endpoint: string;
    fetcher?: (url: string) => Promise<T[]>;
    transformResponse?: (raw: unknown) => T[];
    swrConfig?: SWRConfiguration<T[]>;
    headers?: Record<string, string>;
    updateMethod?: "PUT" | "PATCH";
    enabled?: boolean;

    /** Enable server-side pagination */
    serverSide?: boolean;
    serverPaginationParams?: ServerPaginationParams;
    /** Transform raw API response for server-side mode */
    transformPaginatedResponse?: (
        raw: unknown,
    ) => ServerPaginatedResponse<T>;
}

export interface UseTableDataReturn<T> {
    data: T[];
    isLoading: boolean;
    isValidating: boolean;
    error: Error | undefined;
    mutate: KeyedMutator<T[]>;
    create: (item: Partial<T>) => Promise<T | void>;
    update: (item: T, primaryKey?: string) => Promise<T | void>;
    remove: (item: T, primaryKey?: string) => Promise<void>;

    /** Server-side pagination info */
    serverTotal: number;
    serverTotalPages: number;
}

/* ══════════════════════════════════════════════
   DEFAULT FETCHER
   ══════════════════════════════════════════════ */

function createDefaultFetcher<T>(
    headers: Record<string, string>,
    transformResponse?: (raw: unknown) => T[],
) {
    return async (url: string): Promise<T[]> => {
        const res = await fetch(url, {
            headers: { "Content-Type": "application/json", ...headers },
        });

        if (!res.ok) {
            const errorBody = await res.text().catch(() => "");
            const error = new Error(
                `خطا در دریافت داده: ${res.status} ${res.statusText}`,
            );
            (error as any).status = res.status;
            (error as any).body = errorBody;
            throw error;
        }

        const json = await res.json();

        if (transformResponse) return transformResponse(json);
        if (Array.isArray(json)) return json as T[];
        if (json && typeof json === "object") {
            if (Array.isArray(json.data)) return json.data as T[];
            if (Array.isArray(json.results)) return json.results as T[];
            if (Array.isArray(json.items)) return json.items as T[];
        }

        return [json] as T[];
    };
}

function unwrapMutationResponse<T>(json: unknown): T | null {
    if (!json || typeof json !== "object" || Array.isArray(json)) {
        return (json ?? null) as T | null;
    }

    const record = json as Record<string, unknown>;
    const knownKeys = [
        "data",
        "item",
        "record",
        "user",
        "agent",
        "page",
        "template",
        "category",
        "block",
        "product",
        "ticket",
        "notification",
        "file",
        "qr",
        "permission",
        "access",
    ];

    for (const key of knownKeys) {
        const value = record[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return value as T;
        }
    }

    return json as T;
}

/* ══════════════════════════════════════════════
   BUILD URL WITH QUERY PARAMS
   ══════════════════════════════════════════════ */

function buildServerUrl(
    endpoint: string,
    params?: ServerPaginationParams,
): string {
    if (!params) return endpoint;

    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("page", String(params.page));
    url.searchParams.set("pageSize", String(params.pageSize));

    if (params.search) url.searchParams.set("search", params.search);
    if (params.sortKey) url.searchParams.set("sortKey", params.sortKey);
    if (params.sortDir) url.searchParams.set("sortDir", params.sortDir);

    if (params.filters) {
        Object.entries(params.filters).forEach(([key, val]) => {
            if (val) url.searchParams.set(`filter_${key}`, val);
        });
    }

    return url.pathname + url.search;
}

function appendPathId(endpoint: string, id: unknown) {
    if (!id) return endpoint;

    const url = new URL(endpoint, window.location.origin);
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/${encodeURIComponent(String(id))}`;

    return url.pathname + url.search;
}

/* ══════════════════════════════════════════════
   HOOK
   ══════════════════════════════════════════════ */

export function useTableData<T extends Record<string, unknown>>(
    options: UseTableDataOptions<T>,
): UseTableDataReturn<T> {
    const {
        endpoint,
        fetcher: customFetcher,
        transformResponse,
        swrConfig,
        headers = {},
        enabled = true,
        updateMethod = "PUT",
        serverSide = false,
        serverPaginationParams,
        transformPaginatedResponse,
    } = options;

    const headersRef = useRef(headers);
    headersRef.current = headers;

    // Store server pagination info
    const serverInfoRef = useRef<{
        total: number;
        totalPages: number;
    }>({ total: 0, totalPages: 0 });

    const finalFetcher = useCallback(
        async (url: string): Promise<T[]> => {
            if (customFetcher) return customFetcher(url);

            if (serverSide && transformPaginatedResponse) {
                const res = await fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        ...headersRef.current,
                    },
                });

                if (!res.ok) {
                    const error = new Error(
                        `خطا در دریافت داده: ${res.status}`,
                    );
                    (error as any).status = res.status;
                    throw error;
                }

                const json = await res.json();
                const paginated = transformPaginatedResponse(json);

                serverInfoRef.current = {
                    total: paginated.total,
                    totalPages: paginated.totalPages,
                };

                return paginated.data;
            }

            return createDefaultFetcher<T>(
                headersRef.current,
                transformResponse,
            )(url);
        },
        [customFetcher, transformResponse, serverSide, transformPaginatedResponse],
    );

    const swrKey =
        enabled && endpoint
            ? serverSide
                ? buildServerUrl(endpoint, serverPaginationParams)
                : endpoint
            : null;

    const {
        data: rawData,
        error,
        isLoading,

        isValidating,
        mutate,
    } = useSWR<T[]>(swrKey, finalFetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
        keepPreviousData: true,
        ...swrConfig,
    });

    const data: T[] = rawData ?? [];

    /* ── CRUD wrappers ── */

    const create = useCallback(
        async (item: Partial<T>): Promise<T | void> => {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headersRef.current,
                },
                body: JSON.stringify(item),
            });

            if (!res.ok) {
                const err = new Error(`خطا در ایجاد: ${res.status}`);
                (err as any).status = res.status;
                throw err;
            }

            const created = unwrapMutationResponse<T>(
                await res.json().catch(() => null),
            );

            await mutate(
                (current) => {
                    if (!current) return created ? [created] : [];
                    return created ? [...current, created] : current;
                },
                { revalidate: true },
            );

            return created as T;
        },
        [endpoint, mutate],
    );

    const update = useCallback(
        async (item: T, primaryKey: string = "id"): Promise<T | void> => {
            const id = item[primaryKey];
            const url = appendPathId(endpoint, id);

            const res = await fetch(url, {
                method: updateMethod,
                headers: {
                    "Content-Type": "application/json",
                    ...headersRef.current,
                },
                body: JSON.stringify(item),
            });

            if (!res.ok) {
                const err = new Error(`خطا در ویرایش: ${res.status}`);
                (err as any).status = res.status;
                throw err;
            }

            const updated = unwrapMutationResponse<T>(
                await res.json().catch(() => null),
            );

            await mutate(
                (current) => {
                    if (!current) return current;
                    return current.map((row) =>
                        row[primaryKey] === id
                            ? { ...row, ...item, ...updated }
                            : row,
                    );
                },
                { revalidate: true },
            );

            return (updated ?? item) as T;
        },
        [endpoint, mutate],
    );

    const remove = useCallback(
        async (item: T, primaryKey: string = "id"): Promise<void> => {
            const id = item[primaryKey];
            const url = appendPathId(endpoint, id);

            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...headersRef.current,
                },
            });

            if (!res.ok) {
                const err = new Error(`خطا در حذف: ${res.status}`);
                (err as any).status = res.status;
                throw err;
            }

            await mutate(
                (current) => {
                    if (!current) return current;
                    return current.filter((row) => row[primaryKey] !== id);
                },
                { revalidate: true },
            );
        },
        [endpoint, mutate],
    );

    return {
        data,
        isLoading,
        isValidating,
        error,
        mutate,
        create,
        update,
        remove,
        serverTotal: serverInfoRef.current.total,
        serverTotalPages: serverInfoRef.current.totalPages,
    };
}
