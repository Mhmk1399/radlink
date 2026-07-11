import type {
  AnimationType,
  EditableStyleKey,
  EditableStyleMap,
  PageBlock,
  ResponsiveValue,
  ShadowStyleValue,
} from "@/types/blocks/builder.types";

type ElementRole =
  | "container"
  | "title"
  | "description"
  | "button"
  | "buttonSecondary"
  | "card"
  | "media"
  | "field"
  | "accent"
  | "separator"
  | "price"
  | "overlay"
  | "item";

type PolishResult = {
  blocks: PageBlock[];
  changedBlockCount: number;
};

const HERO_BLOCK_TYPES = new Set(["banner", "slider", "cta"]);
const COMPACT_BLOCK_TYPES = new Set(["separator", "simpleLink", "superLink"]);
const FEATURE_BLOCK_TYPES = new Set([
  "bookingForm",
  "contactInfo",
  "countdown",
  "faq",
  "mapLinks",
  "messengerLinks",
  "productCards",
  "storyHighlights",
  "testimonial",
  "video",
]);

const CONTAINER_KEYS: EditableStyleKey[] = [
  "marginTop",
  "marginBottom",
  "paddingTop",
  "paddingBottom",
  "borderRadius",
  "shadow",
  "animation",
];

const POLISH_KEYS_BY_ROLE: Partial<Record<ElementRole, EditableStyleKey[]>> = {
  container: CONTAINER_KEYS,
  button: ["fontSize", "borderRadius", "shadow", "animation"],
  buttonSecondary: ["fontSize", "borderRadius", "shadow", "animation"],
  card: ["borderRadius", "shadow", "animation"],
  media: ["borderRadius", "shadow", "animation"],
  field: ["borderRadius", "shadow", "animation"],
  accent: ["shadow", "animation"],
  price: ["fontSize", "shadow", "animation"],
  title: ["fontSize", "shadow", "animation"],
  description: ["fontSize", "animation"],
  item: ["borderRadius", "shadow", "animation"],
};

function responsive<T>(mobile: T, tablet?: T, desktop?: T): ResponsiveValue<T> {
  return {
    mobile,
    tablet: tablet ?? mobile,
    desktop: desktop ?? tablet ?? mobile,
  };
}

function getElementRole(elementId: string): ElementRole {
  const id = elementId.toLowerCase();

  if (id.includes("overlay")) return "overlay";
  if (id === "container" || id.includes("wrapper") || id.includes("area"))
    return "container";
  if (id.includes("oldprice")) return "description";
  if (id.includes("price") || id.includes("timernumber")) return "price";
  if (
    id.includes("secondary") ||
    id.includes("close") ||
    id.includes("navbutton") ||
    id.includes("arrow")
  )
    return "buttonSecondary";
  if (
    id.includes("button") ||
    id.includes("submit") ||
    id.includes("link") ||
    id.includes("action")
  )
    return "button";
  if (
    id.includes("card") ||
    id.includes("item") ||
    id.includes("box") ||
    id.includes("slot") ||
    id.includes("form")
  )
    return "card";
  if (
    id.includes("image") ||
    id.includes("video") ||
    id.includes("avatar") ||
    id.includes("thumbnail")
  )
    return "media";
  if (
    id.includes("input") ||
    id.includes("calendar") ||
    id.includes("field")
  )
    return "field";
  if (
    id.includes("title") ||
    id.includes("heading") ||
    id.includes("question") ||
    id.includes("name")
  )
    return "title";
  if (
    id.includes("description") ||
    id.includes("subtitle") ||
    id.includes("caption") ||
    id.includes("answer") ||
    id.includes("role") ||
    id.includes("label") ||
    id.includes("content") ||
    id.includes("message") ||
    id.includes("expiredtext")
  )
    return "description";
  if (
    id.includes("line") ||
    id.includes("separator") ||
    id.includes("ornament")
  )
    return "separator";
  if (
    id.includes("icon") ||
    id.includes("badge") ||
    id.includes("progress") ||
    id.includes("rating") ||
    id.includes("dot")
  )
    return "accent";

  return "item";
}

function withPolishKeys(
  allowedStyleKeys: EditableStyleKey[] | undefined,
  role: ElementRole,
) {
  const next = Array.isArray(allowedStyleKeys) ? [...allowedStyleKeys] : [];
  const keys = POLISH_KEYS_BY_ROLE[role] ?? [];

  keys.forEach((key) => {
    if (!next.includes(key)) next.push(key);
  });

  return next;
}

function canSet(allowed: EditableStyleKey[], key: EditableStyleKey) {
  return allowed.includes(key);
}

function writeNumber(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  key: EditableStyleKey,
  value: number,
  tablet = value,
  desktop = tablet,
) {
  if (!canSet(allowed, key)) return false;

  if (key === "fontSize") style.fontSize = responsive(value, tablet, desktop);
  else if (key === "height") style.height = responsive(value, tablet, desktop);
  else if (key === "marginTop")
    style.marginTop = responsive(value, tablet, desktop);
  else if (key === "marginBottom")
    style.marginBottom = responsive(value, tablet, desktop);
  else if (key === "paddingTop")
    style.paddingTop = responsive(value, tablet, desktop);
  else if (key === "paddingBottom")
    style.paddingBottom = responsive(value, tablet, desktop);
  else if (key === "borderRadius")
    style.borderRadius = responsive(value, tablet, desktop);
  else if (key === "borderWidth")
    style.borderWidth = responsive(value, tablet, desktop);
  else if (key === "gridColumns")
    style.gridColumns = responsive(value, tablet, desktop);
  else return false;

  return true;
}

function writeShadow(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  value: ShadowStyleValue,
) {
  if (!canSet(allowed, "shadow")) return false;
  style.shadow = responsive(value);
  return true;
}

function writeAnimation(
  style: EditableStyleMap,
  allowed: EditableStyleKey[],
  value: AnimationType,
) {
  if (!canSet(allowed, "animation")) return false;
  style.animation = value;
  return true;
}

function getSpacing(blockType: string, blockIndex: number) {
  const isFirst = blockIndex === 0;
  const rhythm = blockIndex % 3 === 1 ? 3 : blockIndex % 3 === 2 ? -2 : 0;

  if (blockType === "separator") {
    return {
      marginTop: isFirst ? 0 : 10,
      marginBottom: 10,
      paddingTop: 4,
      paddingBottom: 4,
    };
  }

  if (HERO_BLOCK_TYPES.has(blockType)) {
    return {
      marginTop: isFirst ? 0 : 24 + rhythm,
      marginBottom: 28 + rhythm,
      paddingTop: 28,
      paddingBottom: 30,
    };
  }

  if (COMPACT_BLOCK_TYPES.has(blockType)) {
    return {
      marginTop: isFirst ? 0 : 12 + rhythm,
      marginBottom: 14 + rhythm,
      paddingTop: 10,
      paddingBottom: 10,
    };
  }

  if (FEATURE_BLOCK_TYPES.has(blockType)) {
    return {
      marginTop: isFirst ? 0 : 20 + rhythm,
      marginBottom: 24 + rhythm,
      paddingTop: 20,
      paddingBottom: 22,
    };
  }

  return {
    marginTop: isFirst ? 0 : 16 + rhythm,
    marginBottom: 20 + rhythm,
    paddingTop: 16,
    paddingBottom: 18,
  };
}

function polishRole({
  blockType,
  blockIndex,
  role,
  style,
  allowed,
}: {
  blockType: string;
  blockIndex: number;
  role: ElementRole;
  style: EditableStyleMap;
  allowed: EditableStyleKey[];
}) {
  const isHero = HERO_BLOCK_TYPES.has(blockType);
  let changed = false;
  const mark = (value: boolean) => {
    changed = value || changed;
  };

  if (role === "container") {
    const spacing = getSpacing(blockType, blockIndex);
    mark(writeNumber(style, allowed, "marginTop", spacing.marginTop));
    mark(writeNumber(style, allowed, "marginBottom", spacing.marginBottom));
    mark(writeNumber(style, allowed, "paddingTop", spacing.paddingTop));
    mark(writeNumber(style, allowed, "paddingBottom", spacing.paddingBottom));
    mark(writeNumber(style, allowed, "borderRadius", isHero ? 28 : 22));
    mark(
      writeShadow(style, allowed, {
        color: "rgba(15,23,42,0.16)",
        intensity: isHero ? 24 : 18,
      }),
    );
    mark(
      writeAnimation(
        style,
        allowed,
        blockIndex % 2 === 0 ? "slideUp" : "fade",
      ),
    );
    return changed;
  }

  if (role === "title") {
    const size = isHero ? 25 : blockType === "faq" ? 17 : 20;
    mark(writeNumber(style, allowed, "fontSize", size, size + 2, size + 4));
    mark(
      writeShadow(style, allowed, {
        color: "rgba(15,23,42,0.12)",
        intensity: 6,
      }),
    );
    mark(writeAnimation(style, allowed, "slideUp"));
    return changed;
  }

  if (role === "description") {
    mark(writeNumber(style, allowed, "fontSize", isHero ? 15 : 14, 15, 16));
    mark(writeAnimation(style, allowed, "fade"));
    return changed;
  }

  if (role === "button" || role === "buttonSecondary") {
    mark(writeNumber(style, allowed, "fontSize", 14, 15, 15));
    mark(writeNumber(style, allowed, "borderRadius", 14));
    mark(
      writeShadow(style, allowed, {
        color: "rgba(15,23,42,0.20)",
        intensity: role === "button" ? 26 : 16,
      }),
    );
    mark(writeAnimation(style, allowed, "riseSoft"));
    return changed;
  }

  if (role === "card" || role === "item" || role === "field") {
    mark(writeNumber(style, allowed, "borderRadius", role === "field" ? 14 : 18));
    mark(
      writeShadow(style, allowed, {
        color: "rgba(15,23,42,0.14)",
        intensity: role === "field" ? 8 : 16,
      }),
    );
    mark(writeAnimation(style, allowed, role === "field" ? "fade" : "riseSoft"));
    return changed;
  }

  if (role === "media") {
    mark(writeNumber(style, allowed, "borderRadius", 18));
    mark(
      writeShadow(style, allowed, {
        color: "rgba(15,23,42,0.16)",
        intensity: 14,
      }),
    );
    mark(writeAnimation(style, allowed, "scale"));
    return changed;
  }

  if (role === "accent" || role === "price") {
    if (role === "price") mark(writeNumber(style, allowed, "fontSize", 18, 19, 20));
    mark(
      writeShadow(style, allowed, {
        color: "rgba(15,23,42,0.10)",
        intensity: 8,
      }),
    );
    mark(writeAnimation(style, allowed, "scale"));
    return changed;
  }

  return changed;
}

function polishBlock(block: PageBlock, blockIndex: number) {
  let changed = false;
  const nextElements: PageBlock["elements"] = {};

  for (const [elementId, element] of Object.entries(block.elements ?? {})) {
    const role = getElementRole(elementId);
    const allowedStyleKeys = withPolishKeys(element.allowedStyleKeys, role);
    const style: EditableStyleMap = { ...(element.style ?? {}) };
    const elementChanged = polishRole({
      blockType: block.type,
      blockIndex,
      role,
      style,
      allowed: allowedStyleKeys,
    });

    const allowedChanged =
      allowedStyleKeys.length !== element.allowedStyleKeys?.length;

    changed = changed || elementChanged || allowedChanged;
    nextElements[elementId] =
      elementChanged || allowedChanged
        ? {
            ...element,
            allowedStyleKeys,
            style,
          }
        : element;
  }

  return {
    block: changed ? { ...block, elements: nextElements } : block,
    changed,
  };
}

export function autoPolishBlocks(blocks: PageBlock[]): PolishResult {
  const orderIndex = new Map<string, number>();
  [...blocks]
    .sort((a, b) => a.order - b.order)
    .forEach((block, index) => orderIndex.set(block.instanceId, index));

  let changedBlockCount = 0;
  const polished = blocks.map((block) => {
    const { block: nextBlock, changed } = polishBlock(
      block,
      orderIndex.get(block.instanceId) ?? block.order ?? 0,
    );

    if (changed) changedBlockCount += 1;
    return nextBlock;
  });

  return { blocks: polished, changedBlockCount };
}
