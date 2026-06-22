import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
import { AuthRequest } from "@/lib/auth/types";
import Block from "@/models/blocks";
import type { BlockElement, ContentField, PageBlock } from "@/types/blocks/builder.types";

function cloneJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeElements(
    defaultBlock: PageBlock,
    schemaElements: Record<string, { label: string; allowedStyleKeys: string[] }>
) {
    const merged: Record<string, BlockElement> = {};
    const elementKeys = new Set([
        ...Object.keys(defaultBlock.elements ?? {}),
        ...Object.keys(schemaElements ?? {}),
    ]);

    elementKeys.forEach((key) => {
        const defaultElement = defaultBlock.elements?.[key];
        const schemaElement = schemaElements?.[key];

        merged[key] = {
            label: schemaElement?.label ?? defaultElement?.label ?? key,
            allowedStyleKeys:
                (schemaElement?.allowedStyleKeys as BlockElement["allowedStyleKeys"] | undefined) ??
                defaultElement?.allowedStyleKeys ??
                [],
            style: defaultElement?.style ?? {},
        };
    });

    return merged;
}

function buildDefaultBlock(config: {
    type: string;
    createDefaultBlock: (order: number) => PageBlock;
    schema: {
        elements?: Record<string, { label: string; allowedStyleKeys: string[] }>;
        contentFields?: readonly ContentField[];
    };
}) {
    const defaultBlock = cloneJson(config.createDefaultBlock(0));
    const elements = normalizeElements(defaultBlock, config.schema.elements ?? {});

    return {
        ...defaultBlock,
        instanceId: `${config.type}-master`,
        blockId: config.type,
        type: config.type,
        order: 0,
        elements,
    };
}

// Sync blocks from blockRegistry to database
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (_req: AuthRequest) => {
    const { blockRegistry } = await import("@/builder/blocks/blockRegistry");
    
    const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[]
    };

    for (const [type, config] of Object.entries(blockRegistry)) {
        try {
            const existing = await Block.findOne({ type });
            const defaultBlock = buildDefaultBlock(config);
            
            const blockData = {
                name: config.schema.label ?? config.label,
                type: config.type,
                description: config.schema.description ?? config.description,
                icon: type,
                category: config.category,
                data: defaultBlock.data ?? {},
                settings: defaultBlock.settings ?? { direction: "rtl" },
                elements: defaultBlock.elements ?? {},
                contentFields: cloneJson(config.schema.contentFields ?? []),
                defaultBlock,
                isActive: true,
                version: defaultBlock.version ?? 1,
            };

            if (existing) {
                await Block.findByIdAndUpdate(existing._id, {
                    ...blockData,
                    stats: existing.stats ?? { usageCount: 0 },
                });
                results.updated++;
            } else {
                await Block.create({
                    ...blockData,
                    stats: { usageCount: 0 },
                });
                results.created++;
            }
        } catch (err) {
            results.errors.push(`Failed to sync ${type}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    return NextResponse.json({ 
        message: `Synced ${results.created} created, ${results.updated} updated`,
        results 
    });
});
