import { Types } from "mongoose";
import Permission from "@/models/permission";
import Access from "@/models/access";
import { accessCache, ResolvedAccess } from "@/lib/auth/accessCache";

// Merges actions from multiple access docs into a single flat ResolvedAccess.
// One aggregation pipeline replaces 3 sequential DB queries.
export async function resolveUserAccess(
    userId: string | Types.ObjectId,
    permissionIds: Types.ObjectId[]
): Promise<ResolvedAccess> {
    const cacheKey = String(userId);
    const cached = accessCache.get(cacheKey);
    if (cached) return cached;

    if (!permissionIds.length) {
        const empty = emptyAccess();
        accessCache.set(cacheKey, empty);
        return empty;
    }

    // Single pipeline: match active permissions → lookup access docs → unwind
    const rows = await Permission.aggregate([
        { $match: { _id: { $in: permissionIds }, isActive: true } },
        { $unwind: "$accesses" },
        {
            $lookup: {
                from: "accesses",
                localField: "accesses",
                foreignField: "_id",
                as: "access",
            },
        },
        { $unwind: "$access" },
        { $replaceRoot: { newRoot: "$access" } },
    ]);

    const resolved = emptyAccess();

    for (const doc of rows) {
        // Static components
        for (const sc of doc.staticComponents ?? []) {
            if (!resolved.components[sc.componentName]) {
                resolved.components[sc.componentName] = new Set();
            }
            sc.actions.forEach((a: string) => resolved.components[sc.componentName].add(a));
        }

        // Dynamic — templates
        for (const t of doc.dynamicAccess?.templates ?? []) {
            const id = String(t.templateId);
            if (!resolved.templates[id]) resolved.templates[id] = new Set();
            t.actions.forEach((a: string) => resolved.templates[id].add(a));
        }

        // Dynamic — blocks
        for (const b of doc.dynamicAccess?.blocks ?? []) {
            const id = String(b.blockId);
            if (!resolved.blocks[id]) resolved.blocks[id] = new Set();
            b.actions.forEach((a: string) => resolved.blocks[id].add(a));
        }

        // Dynamic — pages
        for (const p of doc.dynamicAccess?.pages ?? []) {
            const id = String(p.pageId);
            if (!resolved.pages[id]) resolved.pages[id] = new Set();
            p.actions.forEach((a: string) => resolved.pages[id].add(a));
        }
    }

    accessCache.set(cacheKey, resolved);
    return resolved;
}

function emptyAccess(): ResolvedAccess {
    return { components: {}, templates: {}, blocks: {}, pages: {} };
}
