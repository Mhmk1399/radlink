import { NextResponse } from "next/server";
import { compose } from "@/lib/auth/compose";
import { withDB, withAuth, withStatus, withRole } from "@/lib/auth/middlewares";
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

const LEGACY_BLOCK_TYPES: Record<string, string[]> = {
    bankAccount: ["bank-account", "bank_account"],
    pdfDownloads: ["pdf-downloads", "pdf_downloads"],
};

function getBlockTypeCandidates(type: string) {
    return [type, ...(LEGACY_BLOCK_TYPES[type] ?? [])];
}

// Sync blocks from blockRegistry to database
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async () => {
    const { blockRegistry } = await import("@/builder/blocks/blockRegistry");
    const registryEntries = Object.entries(blockRegistry);
    
    const results = {
        registryTotal: registryEntries.length,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[]
    };

    for (const [type, config] of registryEntries) {
        try {
            const existing = await Block.findOne({
                type: { $in: getBlockTypeCandidates(type) },
            });
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
                }, { runValidators: true });
                results.updated++;
            } else {
                await Block.create({
                    ...blockData,
                    stats: { usageCount: 0 },
                });
                results.created++;
            }
        } catch (err) {
            results.errors.push(`همگام‌سازی ${type} با خطا مواجه شد: ${err instanceof Error ? err.message : "خطای ناشناخته"}`);
        }
    }

    const failed = results.errors.length;
    const status = failed > 0 ? 207 : 200;

    return NextResponse.json({ 
        message: failed > 0
            ? `${results.created} بلاک ساخته شد، ${results.updated} بلاک به‌روزرسانی شد و ${failed} بلاک با خطا مواجه شد.`
            : `${results.created} بلاک ساخته شد و ${results.updated} بلاک به‌روزرسانی شد.`,
        results 
    }, { status });
});
