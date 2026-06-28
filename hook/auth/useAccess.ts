"use client";

import useSWR from "swr";

type AccessMap = {
    components: Record<string, string[]>;
    templates: Record<string, string[]>;
    blocks: Record<string, string[]>;
    pages: Record<string, string[]>;
};

type MeResponse = {
    user: {
        id: string;
        role: string;
        status: string;
        firstName?: string;
        lastName?: string;
        phoneNumber: string;
        permissions?: unknown[];
        limits?: {
            files: number;
            blocks: number;
            pages: number;
        };
    };
    access: AccessMap;
};

const fetcher = (url: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") ?? localStorage.getItem("token") ?? ""}`,
        },
    }).then((r) => {
        if (!r.ok) throw new Error("برای دریافت دسترسی‌ها ابتدا وارد حساب کاربری شوید.");
        return r.json();
    });

export function useAccess() {
    const { data, error, isLoading } = useSWR<MeResponse>("/api/auth/me", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5 * 60 * 1000, // matches server TTL
    });

    const isSuperAdmin = data?.user.role === "superAdmin";

    // Check access on a static dashboard component
    // e.g. can("dashboard.reports", "view")
    function can(component: string, action: string): boolean {
        if (isSuperAdmin) return true;
        return data?.access.components[component]?.includes(action) ?? false;
    }

    // Check access on a dynamic resource (template/block/page)
    // e.g. canOnResource("templates", "abc123", "update")
    function canOnResource(
        resource: "templates" | "blocks" | "pages",
        id: string,
        action: string
    ): boolean {
        if (isSuperAdmin) return true;
        return data?.access[resource][id]?.includes(action) ?? false;
    }

    return {
        user: data?.user ?? null,
        access: data?.access ?? null,
        isSuperAdmin,
        can,
        canOnResource,
        isLoading,
        isError: !!error,
    };
}
