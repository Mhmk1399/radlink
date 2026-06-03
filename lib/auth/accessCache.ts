// Simple in-memory TTL cache — no external dependency needed
// TTL default: 5 minutes. Invalidate explicitly on permission writes.

type CacheEntry<T> = { value: T; expiresAt: number };

class TtlCache<T> {
    private store = new Map<string, CacheEntry<T>>();
    private ttl: number;

    constructor(ttlMs = 5 * 60 * 1000) {
        this.ttl = ttlMs;
    }

    get(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    set(key: string, value: T) {
        this.store.set(key, { value, expiresAt: Date.now() + this.ttl });
    }

    del(key: string) {
        this.store.delete(key);
    }

    // Call on permission/access write to bust all affected users
    delMany(keys: string[]) {
        keys.forEach((k) => this.store.delete(k));
    }
}

// Resolved access shape — flat and cheap to query
export type ResolvedAccess = {
    // component → Set of actions
    components: Record<string, Set<string>>;
    // resource type → id → Set of actions
    templates: Record<string, Set<string>>;
    blocks: Record<string, Set<string>>;
    pages: Record<string, Set<string>>;
};

// One global cache instance shared across requests (survives hot reload via global)
const g = global as typeof globalThis & { _accessCache?: TtlCache<ResolvedAccess> };
if (!g._accessCache) g._accessCache = new TtlCache<ResolvedAccess>();

export const accessCache = g._accessCache;
