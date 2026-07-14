"use client";

import { useEffect } from "react";

type LandingIconHeadSyncProps = {
  iconHref: string;
  shortcutHref: string;
  appleIconHref: string;
  manifestHref: string;
};

function upsertLink(rel: string, href: string, attrs: Record<string, string>) {
  if (!href) return;

  const selector = `link[data-radlink-landing-icon="${rel}"]`;
  let link = document.head.querySelector(selector) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.dataset.radlinkLandingIcon = rel;
    document.head.appendChild(link);
  }

  link.rel = rel;
  link.href = href;

  for (const [key, value] of Object.entries(attrs)) {
    link.setAttribute(key, value);
  }
}

export default function LandingIconHeadSync({
  iconHref,
  shortcutHref,
  appleIconHref,
  manifestHref,
}: LandingIconHeadSyncProps) {
  useEffect(() => {
    document.head
      .querySelectorAll(
        [
          'link[rel="icon"]',
          'link[rel="shortcut icon"]',
          'link[rel="apple-touch-icon"]',
          'link[rel="manifest"]',
        ].join(","),
      )
      .forEach((node) => {
        if (!(node instanceof HTMLLinkElement)) return;
        if (node.dataset.radlinkLandingIcon) return;
        node.remove();
      });

    upsertLink("icon", iconHref, { sizes: "any" });
    upsertLink("shortcut icon", shortcutHref, {});
    upsertLink("apple-touch-icon", appleIconHref, { sizes: "180x180" });
    upsertLink("manifest", manifestHref, {});
  }, [appleIconHref, iconHref, manifestHref, shortcutHref]);

  return null;
}
