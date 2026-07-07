import Page from "@/models/pages";

const PAGE_VIEW_FLUSH_INTERVAL_MS = 5 * 1000;
const PAGE_VIEW_FLUSH_MAX_PENDING = 100;

type PageViewDelta = {
  views: number;
  visitors: number;
};

type PageViewCounterState = {
  pending: Map<string, PageViewDelta>;
  flushTimer: NodeJS.Timeout | null;
  flushing: boolean;
};

const pageViewCounterGlobal = global as typeof globalThis & {
  _pageViewCounterState?: PageViewCounterState;
};

if (!pageViewCounterGlobal._pageViewCounterState) {
  pageViewCounterGlobal._pageViewCounterState = {
    pending: new Map(),
    flushTimer: null,
    flushing: false,
  };
}

const state = pageViewCounterGlobal._pageViewCounterState;

function scheduleFlush() {
  if (state.flushTimer) return;

  state.flushTimer = setTimeout(() => {
    state.flushTimer = null;
    void flushPageViewCounters();
  }, PAGE_VIEW_FLUSH_INTERVAL_MS);

  state.flushTimer.unref?.();
}

export function queuePageViewIncrement(pageId: string, isNewVisitor: boolean) {
  const current = state.pending.get(pageId) ?? { views: 0, visitors: 0 };
  current.views += 1;
  current.visitors += isNewVisitor ? 1 : 0;
  state.pending.set(pageId, current);

  if (state.pending.size >= PAGE_VIEW_FLUSH_MAX_PENDING) {
    void flushPageViewCounters();
  } else {
    scheduleFlush();
  }

  return { ...current };
}

export async function flushPageViewCounters() {
  if (state.flushing || state.pending.size === 0) return;

  state.flushing = true;
  const batch = new Map(state.pending);
  state.pending.clear();

  try {
    await Promise.all(
      [...batch.entries()].map(([pageId, delta]) =>
        Page.updateOne(
          { _id: pageId },
          {
            $inc: {
              "stats.views": delta.views,
              "stats.visitors": delta.visitors,
            },
          },
          { runValidators: true },
        ),
      ),
    );
  } catch (error) {
    for (const [pageId, delta] of batch) {
      const current = state.pending.get(pageId) ?? { views: 0, visitors: 0 };
      current.views += delta.views;
      current.visitors += delta.visitors;
      state.pending.set(pageId, current);
    }

    console.error("Failed to flush page view counters", error);
  } finally {
    state.flushing = false;
    if (state.pending.size > 0) scheduleFlush();
  }
}
