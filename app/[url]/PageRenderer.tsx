"use client";

import { useEffect, type ComponentType } from "react";
import { blockRegistry } from "@/builder/blocks/blockRegistry";
import { shouldRenderContactSaveBlock } from "@/builder/blocks/contact-save/ContactSaveBlock";
import { getBlockSpacingStyle } from "@/lib/design/block-spacing";
import type { PageBlock } from "@/types/blocks/builder.types";

const pendingPageViews = new Set<string>();

export default function PageRenderer({
  blocks,
  pageId,
}: {
  blocks: PageBlock[];
  pageId: string;
}) {
  useEffect(() => {
    if (!pageId) return;

    const storageKey = `radlink_page_viewed:${pageId}`;
    let isNewVisitor = true;

    try {
      isNewVisitor = !localStorage.getItem(storageKey);
    } catch {
      // Browsers with blocked storage are treated as a new visitor.
    }

    if (pendingPageViews.has(pageId)) return;
    pendingPageViews.add(pageId);

    void fetch(`/api/pages/${encodeURIComponent(pageId)}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isNewVisitor }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) return;
        try {
          localStorage.setItem(storageKey, "1");
        } catch {
          // The counter still succeeds when persistent browser storage is blocked.
        }
      })
      .catch(() => {
        // A later page load can retry when the network is available.
      })
      .finally(() => {
        pendingPageViews.delete(pageId);
      });
  }, [pageId]);

  return (
    <div>
      {blocks
        .filter((block) => shouldRenderContactSaveBlock(block))
        .map((b) => {
          const cfg = blockRegistry[b.type as keyof typeof blockRegistry];

          if (!cfg || !cfg.component) {
            return (
              <div
                key={b.instanceId}
                className="rounded-lg border p-3"
              >
                <div className="text-sm font-bold">{b.type}</div>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(b, null, 2)}
                </pre>
              </div>
            );
          }

          const BlockComponent = cfg.component as ComponentType<{
            block: PageBlock;
            mode: "public";
          }>;

          return (
            <div key={b.instanceId} style={getBlockSpacingStyle(b)}>
              <BlockComponent block={b} mode="public" />
            </div>
          );
        })}
    </div>
  );
}
