// ─────────────────────────────────────────────────────────────────
// hooks/useHashRoute.ts
// ─────────────────────────────────────────────────────────────────
"use client";

import { useState, useEffect, useCallback } from "react";

export type AdminSection =
    | "dashboard"
    | "users"
    | "agents"
    | "permissions"
    | "pages"
    | "templates"
    | "blocks"
    | "categories"
    | "files"
    | "qrcodes"
    | "products"
    | "tickets"
    | "notifications"
    | "settings"
    | "profile";

export function useHashRoute(defaultSection: AdminSection = "dashboard") {
    const [section, setSection] = useState<AdminSection>(defaultSection);

    // Read hash on mount and on hash change
    useEffect(() => {
        function readHash() {
            const hash = window.location.hash.replace("#", "").trim();
            if (hash && isValidSection(hash)) {
                setSection(hash as AdminSection);
            } else {
                setSection(defaultSection);
            }
        }

        readHash();
        window.addEventListener("hashchange", readHash);
        return () => window.removeEventListener("hashchange", readHash);
    }, [defaultSection]);

    // Navigate to a section
    const navigate = useCallback((to: AdminSection) => {
        if (to === "dashboard") {
            // Remove hash entirely for dashboard
            history.pushState(null, "", window.location.pathname);
            setSection("dashboard");
        } else {
            window.location.hash = to;
            // hashchange event will update state
        }
    }, []);

    return { section, navigate };
}

function isValidSection(s: string): s is AdminSection {
    const valid: AdminSection[] = [
        "dashboard", "users", "agents", "permissions",
        "pages", "templates", "blocks", "categories",
        "files", "qrcodes", "products",
        "tickets", "notifications",
        "settings", "profile",
    ];
    return valid.includes(s as AdminSection);
}

// Section metadata
export interface SectionMeta {
    key: AdminSection;
    label: string;
    icon: string; // we'll map to components later
    group: string;
    /** Minimum role required to see this section */
    minRole: UserRoleLevel;
}

type UserRoleLevel = "user" | "agent" | "admin" | "superAdmin";

export const SECTION_META: SectionMeta[] = [
    // Main
    { key: "dashboard", label: "داشبورد", icon: "FaHouse", group: "اصلی", minRole: "user" },

    // User Management
    { key: "users", label: "کاربران", icon: "FaUsers", group: "مدیریت کاربران", minRole: "admin" },
    { key: "agents", label: "نمایندگان", icon: "FaUserTie", group: "مدیریت کاربران", minRole: "admin" },
    { key: "permissions", label: "دسترسی‌ها", icon: "FaShieldHalved", group: "مدیریت کاربران", minRole: "superAdmin" },

    // Content
    { key: "pages", label: "صفحات", icon: "FaFile", group: "مدیریت محتوا", minRole: "agent" },
    { key: "templates", label: "تمپلیت‌ها", icon: "FaPalette", group: "مدیریت محتوا", minRole: "admin" },
    { key: "blocks", label: "بلاک‌ها", icon: "FaPuzzlePiece", group: "مدیریت محتوا", minRole: "admin" },
    { key: "categories", label: "دسته‌بندی‌ها", icon: "FaLayerGroup", group: "مدیریت محتوا", minRole: "admin" },

    // Tools
    { key: "files", label: "فایل‌ها", icon: "FaImage", group: "ابزارها", minRole: "agent" },
    { key: "qrcodes", label: "QR کدها", icon: "FaQrcode", group: "ابزارها", minRole: "agent" },
    { key: "products", label: "محصولات", icon: "FaBoxOpen", group: "ابزارها", minRole: "admin" },

    // Support
    { key: "tickets", label: "تیکت‌ها", icon: "FaTicket", group: "پشتیبانی", minRole: "user" },
    { key: "notifications", label: "اعلانات", icon: "FaBell", group: "پشتیبانی", minRole: "user" },

    // System
    { key: "settings", label: "تنظیمات", icon: "FaGear", group: "سیستم", minRole: "admin" },
    { key: "profile", label: "پروفایل", icon: "FaUser", group: "سیستم", minRole: "user" },
];

// Role hierarchy
const ROLE_LEVELS: Record<UserRoleLevel, number> = {
    user: 0,
    agent: 1,
    admin: 2,
    superAdmin: 3,
};

export function filterSectionsByRole(
    role: UserRoleLevel,
): SectionMeta[] {
    const level = ROLE_LEVELS[role];
    return SECTION_META.filter(
        (s) => ROLE_LEVELS[s.minRole] <= level,
    );
}

export function groupSections(
    sections: SectionMeta[],
): { title: string; items: SectionMeta[] }[] {
    const groups: { title: string; items: SectionMeta[] }[] = [];
    const seen = new Set<string>();

    sections.forEach((s) => {
        if (!seen.has(s.group)) {
            seen.add(s.group);
            groups.push({
                title: s.group,
                items: sections.filter((x) => x.group === s.group),
            });
        }
    });

    return groups;
}