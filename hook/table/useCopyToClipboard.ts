// ─────────────────────────────────────────────────────────────────
// hooks/useCopyToClipboard.ts
// ─────────────────────────────────────────────────────────────────
"use client";

import { useState, useCallback, useRef } from "react";

interface UseCopyReturn {
    copied: boolean;
    copiedCell: string | null;
    copy: (text: string, cellId?: string) => Promise<boolean>;
}

export function useCopyToClipboard(
    resetDelay: number = 2000,
): UseCopyReturn {
    const [copied, setCopied] = useState(false);
    const [copiedCell, setCopiedCell] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const copy = useCallback(
        async (text: string, cellId?: string): Promise<boolean> => {
            if (timerRef.current) clearTimeout(timerRef.current);

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    // Fallback for non-secure contexts
                    const textarea = document.createElement("textarea");
                    textarea.value = text;
                    textarea.style.position = "fixed";
                    textarea.style.left = "-9999px";
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textarea);
                }

                setCopied(true);
                setCopiedCell(cellId ?? null);

                timerRef.current = setTimeout(() => {
                    setCopied(false);
                    setCopiedCell(null);
                }, resetDelay);

                return true;
            } catch {
                return false;
            }
        },
        [resetDelay],
    );

    return { copied, copiedCell, copy };
}