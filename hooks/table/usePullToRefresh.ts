// ─────────────────────────────────────────────────────────────────
// hooks/usePullToRefresh.ts
// ─────────────────────────────────────────────────────────────────
"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void> | void;
    threshold?: number;
    enabled?: boolean;
}

interface UsePullToRefreshReturn {
    containerRef: React.RefObject<HTMLDivElement>;
    pullDistance: number;
    isPulling: boolean;
    isRefreshing: boolean;
}

export function usePullToRefresh({
    onRefresh,
    threshold = 80,
    enabled = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
    const containerRef = useRef<HTMLDivElement>(null!);
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const startYRef = useRef(0);
    const currentYRef = useRef(0);

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            if (!enabled || isRefreshing) return;
            const container = containerRef.current;
            if (!container || container.scrollTop > 0) return;

            startYRef.current = e.touches[0].clientY;
            setIsPulling(true);
        },
        [enabled, isRefreshing],
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isPulling || isRefreshing) return;

            currentYRef.current = e.touches[0].clientY;
            const diff = currentYRef.current - startYRef.current;

            if (diff > 0) {
                // Apply resistance: the further you pull, the harder it gets
                const resistance = Math.min(diff * 0.4, threshold * 1.5);
                setPullDistance(resistance);
            }
        },
        [isPulling, isRefreshing, threshold],
    );

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        if (pullDistance >= threshold) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setIsPulling(false);
        setPullDistance(0);
    }, [isPulling, pullDistance, threshold, onRefresh]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !enabled) return;

        container.addEventListener("touchstart", handleTouchStart, {
            passive: true,
        });
        container.addEventListener("touchmove", handleTouchMove, {
            passive: true,
        });
        container.addEventListener("touchend", handleTouchEnd);

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
        };
    }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        containerRef,
        pullDistance,
        isPulling,
        isRefreshing,
    };
}