"use client";

 import { blockRegistry } from "@/builder/blocks/blockRegistry";

export default function PageRenderer({ blocks }: { blocks: any[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b) => {
        const cfg = (blockRegistry as any)[b.type];

        if (!cfg || !cfg.component) {
          return (
            <div key={b.instanceId ?? Math.random()} className="rounded-lg border p-3">
              <div className="text-sm font-bold">{b.type}</div>
              <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(b, null, 2)}</pre>
            </div>
          );
        }

        const BlockComponent = cfg.component as any;

        return (
          <div key={b.instanceId}>
            <BlockComponent block={b} mode="public" />
          </div>
        );
      })}
    </div>
  );
}
