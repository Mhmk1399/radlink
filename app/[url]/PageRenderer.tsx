"use client";

import { useEffect } from "react";
import { blockRegistry } from "@/builder/blocks/blockRegistry";

type PageData = {
  title?: string;
  description?: string;
  favicon?: string;
  settings?: {
    favicon?: string;
    appleTouchIcon?: string;
  };
};

export default function PageRenderer({ 
  blocks, 
  pageData 
}: { 
  blocks: any[];
  pageData?: PageData;
}) {
  useEffect(() => {
    if (!pageData) return;

    // Update favicon dynamically
    const faviconUrl = pageData.settings?.favicon || pageData.favicon;
    if (faviconUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = faviconUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = faviconUrl;
        document.head.appendChild(newLink);
      }
    }

    // Update apple-touch-icon
    const appleIcon = pageData.settings?.appleTouchIcon;
    if (appleIcon) {
      let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
      if (appleLink) {
        appleLink.href = appleIcon;
      } else {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = appleIcon;
        document.head.appendChild(appleLink);
      }
    }
  }, [pageData]);

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
