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
    /** Filter UI. Existing filterable columns default to an exact select. */
    filterType?: "select" | "text";
    /** Use the searchable CustomSelect for select filters. */
    filterSearchable?: boolean;
    /** Resolve one or more raw values when the displayed field is relational. */
    filterValues?: (row: T) => unknown[];
    dateFilter?: boolean;
    /** Allow copying this cell's value */
    copyable?: boolean;
    /** Default value pre-filled when opening the create form */
    defaultValue?: unknown;
    /** Override the field label in create/edit forms without changing table header. */
    formLabel?: string | ((mode: "create" | "edit", formData: Partial<T>) => string);
    /** Override the field placeholder in create/edit forms. */
    formPlaceholder?: string | ((mode: "create" | "edit", formData: Partial<T>) => string | null | undefined);
    /** Optional helper text displayed below the form field. */
    formHelpText?: string | ((mode: "create" | "edit", formData: Partial<T>) => string | null | undefined);
    /** Column-level form validation. Return a Persian error message to block submit. */
    validate?: (
        value: unknown,
        formData: Partial<T>,
        mode: "create" | "edit",
    ) => string | null | undefined;
    /** Hide this field in create/edit forms based on the current form values. */
    hiddenInForm?: (
        formData: Partial<T>,
        mode: "create" | "edit",
    ) => boolean;
    /** Render a custom create/edit control while keeping DynamicTable form state. */
    renderFormField?: (props: {
        value: unknown;
        originalValue?: unknown;
        onChange: (value: unknown) => void;
        error?: string;
        formData: Partial<T>;
        mode: "create" | "edit";
    }) => ReactNode;
}

export interface DynamicTableProps<T extends object> {
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
        original: T,
    ) => Promise<void> | void;
    onDelete?: (
        item: T,
        builtInRemove: (item: T) => Promise<void>,
    ) => Promise<void> | void;
    onFormDiscard?: (
        item: Partial<T>,
        original: T | null,
        mode: "create" | "edit",
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
    updateMethod?: "PUT" | "PATCH";
    swrConfig?: SWRConfiguration<T[]>;
    /** Keep cached table data fresh across sidebar remounts for this duration. */
    cacheTtlMs?: number;
    /** Change this value to explicitly revalidate custom table actions. */
    refreshKey?: string | number;
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
