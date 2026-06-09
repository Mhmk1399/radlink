// builder/hooks/useBuilderHooks.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ================================================================== */
/*  Toast                                                              */
/* ================================================================== */

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

export function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const show = useCallback((message: string, type: ToastType = "info") => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, show, dismiss };
}

/* ================================================================== */
/*  Undo / Redo History                                                */
/* ================================================================== */

export function useHistory<T>(initial: T, maxSize = 30) {
    const [past, setPast] = useState<T[]>([]);
    const [present, setPresent] = useState<T>(initial);
    const [future, setFuture] = useState<T[]>([]);
    const skipRecordRef = useRef(false);

    const push = useCallback(
        (newState: T) => {
            if (skipRecordRef.current) {
                skipRecordRef.current = false;
                setPresent(newState);
                return;
            }
            setPast((prev) => [...prev.slice(-maxSize), present]);
            setPresent(newState);
            setFuture([]);
        },
        [present, maxSize],
    );

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setPast((prev) => prev.slice(0, -1));
        setFuture((prev) => [present, ...prev]);
        skipRecordRef.current = true;
        setPresent(previous);
    }, [past, present]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        setFuture((prev) => prev.slice(1));
        setPast((prev) => [...prev, present]);
        skipRecordRef.current = true;
        setPresent(next);
    }, [future, present]);

    return {
        state: present,
        set: push,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        historySize: past.length,
    };
}

/* ================================================================== */
/*  Onboarding                                                         */
/* ================================================================== */

export function useOnboarding() {
    const [step, setStep] = useState(-1);

    useEffect(() => {
        try {
            const done = localStorage.getItem("builder-onboarding-done");
            if (!done) setStep(0);
        } catch {
            /* SSR */
        }
    }, []);

    const next = useCallback(() => {
        setStep((prev) => {
            const nextStep = prev + 1;
            if (nextStep >= 3) {
                try {
                    localStorage.setItem("builder-onboarding-done", "true");
                } catch {
                    /* */
                }
                return -1;
            }
            return nextStep;
        });
    }, []);

    const skip = useCallback(() => {
        setStep(-1);
        try {
            localStorage.setItem("builder-onboarding-done", "true");
        } catch {
            /* */
        }
    }, []);

    return { step, next, skip, isActive: step >= 0 };
}