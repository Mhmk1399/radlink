// ─────────────────────────────────────────────────────────────────
// hooks/useTableData.ts
// ─────────────────────────────────────────────────────────────────
"use client";

import useSWR, { type SWRConfiguration, type KeyedMutator } from "swr";
import { useCallback, useEffect, useRef, useState } from "react";
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
    dateRanges?: Record<string, { from?: string; to?: string }>;
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

async function createMutationError(
    response: Response,
    fallback: string,
): Promise<Error> {
    const payload = await response.json().catch(() => null);
    const record =
        payload && typeof payload === "object" && !Array.isArray(payload)
            ? (payload as Record<string, unknown>)
            : {};
    const error = new Error(
        typeof record.message === "string" && record.message.trim()
            ? record.message
            : `${fallback}: ${response.status}`,
    ) as Error & {
        status?: number;
        code?: string;
        field?: string;
    };

    error.status = response.status;
    if (typeof record.code === "string") error.code = record.code;
    if (typeof record.field === "string") error.field = record.field;
    return error;
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
    url.searchParams.set("limit", String(params.pageSize));

    if (params.search) url.searchParams.set("search", params.search);
    if (params.sortKey) url.searchParams.set("sortKey", params.sortKey);
    if (params.sortDir) url.searchParams.set("sortDir", params.sortDir);

    if (params.filters) {
        Object.entries(params.filters).forEach(([key, val]) => {
            if (val) {
                url.searchParams.set(`filter_${key}`, val);
                // Keep compatibility with APIs that already expose direct filters.
                url.searchParams.set(key, val);
            }
        });
    }

    if (params.dateRanges) {
        Object.entries(params.dateRanges).forEach(([key, range]) => {
            if (range.from) url.searchParams.set(`dateFrom_${key}`, range.from);
            if (range.to) url.searchParams.set(`dateTo_${key}`, range.to);
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
    useEffect(() => {
        headersRef.current = headers;
    }, [headers]);

    const [serverInfo, setServerInfo] = useState<{
        total: number;
        totalPages: number;
    }>({ total: 0, totalPages: 0 });

    const finalFetcher = useCallback(
        async (url: string): Promise<T[]> => {
            if (customFetcher) return customFetcher(url);

            if (serverSide) {
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
                const transformedData = transformResponse
                    ? transformResponse(json)
                    : Array.isArray(json)
                        ? (json as T[])
                        : [];
                const rawPage =
                    json && typeof json === "object" && !Array.isArray(json)
                        ? (json as Record<string, unknown>)
                        : {};
                const pageSize =
                    typeof rawPage.limit === "number"
                        ? rawPage.limit
                        : typeof rawPage.pageSize === "number"
                            ? rawPage.pageSize
                            : (serverPaginationParams?.pageSize ?? transformedData.length);
                const total =
                    typeof rawPage.total === "number"
                        ? rawPage.total
                        : transformedData.length;
                const paginated = transformPaginatedResponse
                    ? transformPaginatedResponse(json)
                    : {
                        data: transformedData,
                        total,
                        page:
                            typeof rawPage.page === "number"
                                ? rawPage.page
                                : (serverPaginationParams?.page ?? 1),
                        pageSize,
                        totalPages: Math.max(
                            1,
                            Math.ceil(total / Math.max(1, pageSize)),
                        ),
                    };

                setServerInfo({
                    total: paginated.total,
                    totalPages: paginated.totalPages,
                });

                return paginated.data;
            }

            return createDefaultFetcher<T>(
                headersRef.current,
                transformResponse,
            )(url);
        },
        [
            customFetcher,
            transformResponse,
            serverSide,
            transformPaginatedResponse,
            serverPaginationParams,
        ],
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
                throw await createMutationError(res, "خطا در ایجاد");
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
                throw await createMutationError(res, "خطا در ویرایش");
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
                throw await createMutationError(res, "خطا در حذف");
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
        serverTotal: serverInfo.total,
        serverTotalPages: serverInfo.totalPages,
    };
}
