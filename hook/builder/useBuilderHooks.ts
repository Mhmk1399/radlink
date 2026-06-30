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
    const limit = Math.max(1, maxSize);

    const [history, setHistory] = useState<{
        past: T[];
        present: T;
        future: T[];
    }>({
        past: [],
        present: initial,
        future: [],
    });

    const push = useCallback(
        (newState: T) => {
            setHistory((previousHistory) => {
                if (Object.is(previousHistory.present, newState)) {
                    return previousHistory;
                }

                const retainedPast =
                    limit > 1
                        ? previousHistory.past.slice(-(limit - 1))
                        : [];

                return {
                    past: [...retainedPast, previousHistory.present],
                    present: newState,
                    future: [],
                };
            });
        },
        [limit],
    );

    const undo = useCallback(() => {
        setHistory((previousHistory) => {
            if (previousHistory.past.length === 0) {
                return previousHistory;
            }

            const previousState =
                previousHistory.past[previousHistory.past.length - 1];

            return {
                past: previousHistory.past.slice(0, -1),
                present: previousState,
                future: [
                    previousHistory.present,
                    ...previousHistory.future,
                ],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory((previousHistory) => {
            if (previousHistory.future.length === 0) {
                return previousHistory;
            }

            const nextState = previousHistory.future[0];

            const retainedPast =
                limit > 1
                    ? previousHistory.past.slice(-(limit - 1))
                    : [];

            return {
                past: [...retainedPast, previousHistory.present],
                present: nextState,
                future: previousHistory.future.slice(1),
            };
        });
    }, [limit]);

    return {
        state: history.present,
        set: push,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        historySize: history.past.length,
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



export function useUndoableAction(timeout = 5000) {
    const [pending, setPending] = useState<{
        message: string;
        undoFn: () => void;
    } | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const execute = useCallback(
        (message: string, action: () => void, undoFn: () => void) => {
            if (timerRef.current) clearTimeout(timerRef.current);

            action();
            setPending({ message, undoFn });

            timerRef.current = setTimeout(() => {
                setPending(null);
            }, timeout);
        },
        [timeout],
    );

    const undo = useCallback(() => {
        if (!pending) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        pending.undoFn();
        setPending(null);
    }, [pending]);

    const dismiss = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setPending(null);
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { pending, execute, undo, dismiss };
}


