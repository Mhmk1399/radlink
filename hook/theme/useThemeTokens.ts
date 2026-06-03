"use client";

import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { themeTokens, type ThemeTokens } from "@/lib/design/theme-tokens";

export function useThemeTokens(): ThemeTokens {
    const { theme } = useTheme();
    return useMemo(() => themeTokens[theme], [theme]);
}