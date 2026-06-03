import { ReactNode } from "react";
import { DateObject } from "react-multi-date-picker";
import type { SWRConfiguration } from "swr";

export interface ColumnDef<T> {
    key: keyof T & string;
    label: string;
    render?: (value: T[keyof T], row: T) => ReactNode;
    visible?: boolean;
    editable?: boolean;
    viewable?: boolean;
    inputType?: string;
    sortable?: boolean;
    placeholder?: string;
    isPrimary?: boolean;
    hideOnMobile?: boolean;
    required?: boolean;
    options?: { label: string; value: string }[];
    filterable?: boolean;
    dateFilter?: boolean;
    /** Allow copying this cell's value */
    copyable?: boolean;
}

export interface DynamicTableProps<T extends Record<string, unknown>> {
    endpoint: string;
    columns: ColumnDef<T>[];
    title?: string;
    subtitle?: string;

    onCreate?: (
        item: Partial<T>,
        builtInCreate: (item: Partial<T>) => Promise<T | void>,
    ) => Promise<void> | void;
    onUpdate?: (
        item: T,
        builtInUpdate: (item: T) => Promise<T | void>,
    ) => Promise<void> | void;
    onDelete?: (
        item: T,
        builtInRemove: (item: T) => Promise<void>,
    ) => Promise<void> | void;

    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;

    primaryKey?: keyof T & string;
    pageSize?: number;
    /** Available page sizes for the selector */
    pageSizes?: number[];
    searchable?: boolean;
    /** Debounce delay for search input in ms */
    searchDebounceMs?: number;
    emptyMessage?: string;
    rowActions?: (row: T) => ReactNode;
    exportable?: boolean;
    exportFileName?: string;

    /** Enable sticky table header */
    stickyHeader?: boolean;
    /** Show row numbers */
    showRowNumbers?: boolean;
    /** Enable double-click to edit */
    doubleClickToEdit?: boolean;
    /** Enable cell copy on click */
    enableCellCopy?: boolean;
    /** Enable pull-to-refresh on mobile */
    pullToRefresh?: boolean;

    /** Server-side pagination mode */
    serverSide?: boolean;
    transformPaginatedResponse?: (raw: unknown) => ServerPaginatedResponse<T>;

    fetcher?: (url: string) => Promise<T[]>;
    transformResponse?: (raw: unknown) => T[];
    headers?: Record<string, string>;
    swrConfig?: SWRConfiguration<T[]>;
    enabled?: boolean;
    onError?: (error: Error) => void;
    data?: T[];
}

export type SortDir = "asc" | "desc" | null;
export type ModalMode = "view" | "create" | "edit" | "delete" | null;

export interface DateRange {
    from: DateObject | null;
    to: DateObject | null;
}

export interface ServerPaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}