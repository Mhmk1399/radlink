"use client";

import { useCallback } from "react";
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

type AccessError = Error & {
    status?: number;
    body?: string;
};

const fetcher = async (url: string): Promise<MeResponse> => {
    const token =
        localStorage.getItem("auth_token") ??
        localStorage.getItem("token") ??
        "";

    // اصلاً request بیهوده به سرور نفرست
    if (!token) {
        const error = new Error(
            "برای دریافت دسترسی‌ها ابتدا وارد حساب کاربری شوید.",
        ) as AccessError;

        error.status = 401;
        throw error;
    }

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");

        const error = new Error(
            response.status === 401
                ? "برای دریافت دسترسی‌ها ابتدا وارد حساب کاربری شوید."
                : `خطا در دریافت اطلاعات دسترسی (${response.status})`,
        ) as AccessError;

        error.status = response.status;
        error.body = body;

        throw error;
    }

    return response.json();
};

export function useAccess() {
    const { data, error, isLoading } = useSWR<MeResponse, AccessError>(
        "/api/auth/me",
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,

            // اگر DB یا API مشکل داشت request ده ثانیه‌ای دوباره retry نشود
            shouldRetryOnError: false,

            dedupingInterval: 5 * 60 * 1000,
        },
    );

    const isSuperAdmin = data?.user.role === "superAdmin";

    const can = useCallback(
        (component: string, action: string): boolean => {
            if (isSuperAdmin) return true;

            return data?.access.components[component]?.includes(action) ?? false;
        },
        [data?.access.components, isSuperAdmin],
    );

    const canOnResource = useCallback(
        (
            resource: "templates" | "blocks" | "pages",
            id: string,
            action: string,
        ): boolean => {
            if (isSuperAdmin) return true;

            return data?.access[resource][id]?.includes(action) ?? false;
        },
        [data?.access, isSuperAdmin],
    );

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