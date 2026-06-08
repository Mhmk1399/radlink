# Page Builder Architecture Documentation

## 1. Project Overview

This document describes the structure, rules, and implementation decisions for the custom landing page builder we designed. The goal of the system is to let users create landing pages by adding editable blocks, changing each block’s content and visual style, reordering blocks, previewing the final page inside a phone mockup, and saving the full page structure to MongoDB.

The builder is built with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- styled-components
- MongoDB / Mongoose
- dnd-kit for drag and drop
- Custom dynamic editor UI
- Custom block registry
- Reusable editable block architecture

The main principle is simple: user-facing blocks are independent, editable, and stored as complete snapshots inside a Page document.

---

## 2. Core Builder Concept

Each page is made from an ordered list of blocks.

Each block contains:

```ts
{
  instanceId: string;
  blockId?: string;
  type: string;
  version: number;
  order: number;
  isActive: boolean;
  data: Record<string, unknown>;
  settings: Record<string, unknown>;
  elements: Record<string, BlockElement>;
}
```

### Meaning of each part

| Field | Purpose |
|---|---|
| `instanceId` | Unique frontend ID used for selection, drag/drop, inline editing, and rendering. |
| `blockId` | Optional MongoDB reference to a master Block document. Not required because many blocks are created from the frontend registry. |
| `type` | Block type, such as `banner`, `video`, `superLink`, `bookingForm`. |
| `version` | Block schema/component version. Currently defaults to `1`. |
| `order` | Render order inside the page. |
| `isActive` | Allows hiding/disabling a block without deleting it. |
| `data` | Content such as text, images, links, prices, items, story arrays, form settings, etc. |
| `settings` | Non-visual behavior configuration, such as RTL direction, autoplay, loop, controls. |
| `elements` | Editable visual parts of the block, such as container, title, button, image, icon, etc. |

---

## 3. Editable Style System

The style system is intentionally limited and consistent so the dynamic editor can understand every block.

Allowed editable style keys:

```ts
export type EditableStyleKey =
  | "color"
  | "backgroundColor"
  | "fontSize"
  | "borderRadius"
  | "borderColor"
  | "borderWidth"
  | "animation";
```

Responsive values are kept in this shape:

```ts
export type ResponsiveValue<T> = {
  mobile?: T;
  tablet?: T;
  desktop?: T;
};
```

Editable style map:

```ts
export type EditableStyleMap = {
  color?: ResponsiveValue<string>;
  backgroundColor?: ResponsiveValue<string>;
  fontSize?: ResponsiveValue<number>;
  borderRadius?: ResponsiveValue<number>;
  borderColor?: ResponsiveValue<string>;
  borderWidth?: ResponsiveValue<number>;
  animation?: AnimationType;
};
```

Each editable element must include:

```ts
export type BlockElement = {
  label: string;
  style: EditableStyleMap;
  allowedStyleKeys: EditableStyleKey[];
};
```

Important rule:

Do not use inconsistent style names such as:

```txt
textColor
titleColor
buttonTextColor
colorText
bgColor
radius
styleKeys
```

Always use:

```txt
allowedStyleKeys
```

---

## 4. Shared Block APIs

Every user-facing block must use the same shared helper APIs.

### EditablePart

Correct usage:

```tsx
<EditablePart
  instanceId={block.instanceId}
  elementId="title"
  mode={mode}
  selectedElementId={selectedElementId}
  onSelectElement={onSelectElement}
>
  ...
</EditablePart>
```

Never use these fake or outdated props:

```txt
onSelect
editable
onCommit
tag
style
```

### InlineEditableText

Correct usage:

```tsx
<InlineEditableText
  value={value}
  dataKey="title"
  instanceId={block.instanceId}
  mode={mode}
  onUpdateContent={onUpdateContent}
>
  {(text) => text}
</InlineEditableText>
```

For multiline text:

```tsx
<InlineEditableText
  value={value}
  dataKey="description"
  instanceId={block.instanceId}
  mode={mode}
  multiline
  onUpdateContent={onUpdateContent}
>
  {(text) => text}
</InlineEditableText>
```

For array/repeater items, path-like keys are used:

```ts
products.${product.id}.name
stories.${story.id}.caption
slides.${slide.id}.title
items.${item.id}.answer
```

The parent update function must understand these path-like keys.

---

## 5. styled-components Rules

Each editable visual element must have its own styled component.

Correct:

```tsx
<StyledContainer $styleCss={containerStyle}>...</StyledContainer>
<StyledTitle $styleCss={titleStyle}>...</StyledTitle>
<StyledButton $styleCss={buttonStyle}>...</StyledButton>
```

Wrong:

```tsx
<StyledRoot $css={allElementStylesTogether}>...</StyledRoot>
```

### sharedBlockKeyframes

`sharedBlockKeyframes` is a function and must be called.

Wrong:

```tsx
${sharedBlockKeyframes}
```

Correct:

```tsx
${sharedBlockKeyframes("super-link-block")}
```

### responsiveStyleToCss

Every block should call:

```tsx
responsiveStyleToCss(style, "block-prefix", {
  mobileOnly: mode === "editor",
})
```

This keeps editor mode mobile-first, while preview/public can still use tablet and desktop styles.

---

## 6. User Blocks vs Builder Design System

The builder/editor UI has its own design system. It is used for:

- Dynamic Island
- editor forms
- buttons
- toolbar
- drag handles
- modals
- phone preview modal

User-facing blocks must not import:

```ts
"@/lib/ds/accents"
"@/lib/ds/tokens"
```

User blocks must be styled only through their own `elements[elementId].style` values.

---

## 7. Block File Structure

Every block follows this structure:

```txt
src/builder/blocks/[block-folder]/[BlockName]Block.tsx
src/builder/blocks/[block-folder]/[blockName].default.ts
src/builder/blocks/[block-folder]/[blockName].schema.ts
```

Then the block is registered in:

```txt
src/builder/blocks/blockRegistry.ts
```

### Component file

Responsible for rendering the block.

Must:

- support `editor`, `preview`, and `public` modes
- use `EditablePart`
- use `InlineEditableText` for editable text
- use styled-components for editable visual styles
- use Tailwind only for neutral layout
- prevent links/buttons from navigating in editor mode

### Default file

Creates the default block instance.

Must return a complete `PageBlock`:

```ts
{
  instanceId,
  type,
  order,
  version: 1,
  isActive: true,
  settings: { direction: "rtl" },
  data,
  elements
}
```

Every element must include:

```ts
label
allowedStyleKeys
style
```

### Schema file

Defines what the editor can edit.

Must export:

```ts
import type { BlockSchema } from "@/types/blocks/builder.types";

export const blockSchema: BlockSchema = {
  type: "...",
  label: "...",
  description: "...",
  contentFields: [...],
  elements: {...},
};
```

---

## 8. Current Block Registry

The registry is the source of available block types for the editor.

Each item includes:

```ts
type
label
description
icon
category
component
schema
createDefaultBlock
```

Recommended categories:

```ts
export type BlockCategory =
  | "hero"
  | "content"
  | "media"
  | "link"
  | "contact"
  | "conversion"
  | "utility";
```

Current/created blocks include:

| Type | Label | Purpose |
|---|---|---|
| `banner` | بنر | Main hero/banner section. |
| `simpleLink` | لینک ساده | Simple clickable link card. |
| `superLink` | سوپر لینک | Advanced link card with icon, animation, and description. |
| `video` | ویدئو | Video block with title, description, poster, and controls. |
| `testimonial` | نظر مشتری | Customer review/testimonial. Initially single-card, later can become slider/repeater. |
| `contactInfo` | اطلاعات تماس | Contact details block. |
| `mapLinks` | لینک نقشه | Google Maps, Neshan, Balad, Waze, Apple Maps links. |
| `messengerLinks` | پیام‌رسان‌ها | Telegram, WhatsApp, Instagram, Eitaa, Soroush, Rubika, Bale, Gap, iGap, Shad, etc. |
| `cta` | دعوت به اقدام | Call-to-action section. |
| `countdown` | شمارش معکوس | Campaign/event countdown. |
| `faq` | سوالات پرتکرار | FAQ accordion with repeater-style items. |
| `richText` | متن | Simple multiline text block. |
| `slider` | اسلایدر | Hero/image slider with background images and navigation. |
| `separator` | جداکننده | Visual divider with multiple variants. |
| `storyHighlights` | استوری‌ها | Instagram-like story highlights with fullscreen viewer. |
| `productCards` | کارت محصولات | Horizontal scrollable product card row. |
| `bookingForm` | فرم رزرو | Reservation form with Persian calendar and time slots. |

---

## 9. Main Editor Component

Main editor file:

```txt
src/builder/editor/SimplePageBuilder.tsx
```

Main responsibilities:

- hold `blocks` state
- add blocks from `blockRegistry`
- select block/element
- update block content
- update element styles
- duplicate block
- remove block
- clear all blocks with custom modal
- reorder blocks with dnd-kit
- autosave to localStorage
- save to server via API
- open block catalog modal
- open phone preview modal
- render `DynamicIslandPanel`

Important state examples:

```ts
const [blocks, setBlocks] = useState<PageBlock[]>(...);
const [selectedBlockId, setSelectedBlockId] = useState<string | null>(...);
const [selectedElementId, setSelectedElementId] = useState<string | null>(...);
const [isPhonePreviewOpen, setIsPhonePreviewOpen] = useState(false);
const [catalogOpen, setCatalogOpen] = useState(false);
```

---

## 10. Drag and Drop

Drag and drop uses `dnd-kit`.

Important files:

```txt
src/builder/editor/DraggableBlockItem.tsx
src/builder/editor/SimplePageBuilder.tsx
```

Rules:

- use `instanceId` as the sortable ID
- do not use `blockId` for drag/drop
- drag handle must not trigger element selection
- after drag end, blocks are reordered and `order` is normalized

Hydration issue:

`dnd-kit` may generate different `aria-describedby` values on server and client. The builder should be client-only or mounted after hydration to avoid mismatch.

Recommended for builder pages:

```tsx
const SimplePageBuilder = dynamic(
  () => import("@/builder/editor/SimplePageBuilder"),
  { ssr: false }
);
```

---

## 11. Dynamic Island Editor

The Dynamic Island panel edits the currently selected block and element.

It uses:

- selected block
- selected element ID
- selected block schema
- content fields from schema
- allowed style keys from selected element

It updates:

- `block.data`
- `block.elements[elementId].style`

It should not duplicate block state internally.

---

## 12. Block Catalog Modal

The block catalog modal displays all registered blocks using metadata from `blockRegistry`.

Each catalog card should show:

- icon
- label
- description
- category if needed

When clicked:

```ts
const config = blockRegistry[type];
const newBlock = config.createDefaultBlock(order);
setBlocks([...blocks, newBlock]);
```

---

## 13. Phone Preview Modal

A premium mobile preview modal was added/planned.

File:

```txt
src/builder/editor/PhonePreviewModal.tsx
```

Props:

```ts
type PhonePreviewModalProps = {
  open: boolean;
  blocks: PageBlock[];
  onClose: () => void;
};
```

Behavior:

- opens with a `پیش‌نمایش موبایل` button
- renders a realistic phone mockup
- blocks are rendered inside phone screen
- blocks use `mode="preview"`
- no drag/drop inside preview
- no selection inside preview
- close on Escape
- close on backdrop click
- lock body scroll while open

Rendering logic:

```tsx
const config = blockRegistry[block.type as keyof typeof blockRegistry];
const BlockComponent = config.component;

<BlockComponent
  key={block.instanceId}
  block={block}
  mode="preview"
/>
```

---

## 14. Header / Top Toolbar Improvements

The editor header should be responsive and must account for the Dynamic Island occupying top screen space on mobile.

Rules:

- do not use random inner `mt-12` hacks
- add safe top spacing to the header container
- mobile should have two compact rows
- tablet should wrap cleanly
- desktop should be one clean toolbar
- keep logic unchanged

Recommended mobile-safe padding:

```txt
pt-[calc(env(safe-area-inset-top)+48px)] md:pt-3
```

Toolbar actions:

- Add block
- Phone preview
- Clear all blocks
- Save indicator
- Page builder title / block count

---

## 15. Custom Clear-All Confirm Modal

The browser `confirm()` was replaced with a custom modal.

Old:

```ts
if (!confirm("همه بلاک‌ها حذف شوند؟")) return;
```

New flow:

```ts
const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

const requestClearAllBlocks = useCallback(() => {
  setClearConfirmOpen(true);
}, []);

const confirmClearAllBlocks = useCallback(() => {
  setBlocks([]);
  setSelectedBlockId(null);
  setSelectedElementId(null);
  localStorage.removeItem(STORAGE_KEY);
  setClearConfirmOpen(false);
}, []);
```

Modal behavior:

- RTL
- backdrop blur
- close on Escape
- close on backdrop click
- lock body scroll
- show block count
- confirm destructive action

---

## 16. RepeaterField / Array Data

For blocks with arrays, the schema uses `repeater` fields.

Examples:

- FAQ items
- Slider slides
- Story highlights
- Product cards

Schema pattern:

```ts
{
  key: "products",
  label: "محصولات",
  type: "repeater",
  itemLabel: "محصول",
  maxItems: 20,
  fields: [
    { key: "name", label: "نام", type: "text" },
    { key: "description", label: "توضیحات", type: "textarea" },
    { key: "imageUrl", label: "تصویر", type: "image" }
  ]
}
```

Inline editing uses path-like keys:

```ts
products.${product.id}.name
stories.${story.id}.caption
slides.${slide.id}.title
```

Parent update function must support this path pattern.

---

## 17. MongoDB Model Architecture

There are two main concepts:

### Block collection

A master block library.

Purpose:

- reusable block defaults
- template blocks
- library/admin-managed blocks

### Page.blocks

The real edited page content.

Purpose:

- full snapshot of user page
- stores content and styles exactly as user edited them
- does not depend on master block after creation

Important:

`Page.blocks` must store `elements`, because all editable styles live there.

---

## 18. Updated Page Model

The updated Page model stores full block snapshots.

Main embedded block shape:

```ts
export interface PageBlock {
  instanceId: string;
  blockId?: Types.ObjectId;
  type: string;
  version: number;
  order: number;
  isActive: boolean;
  data: Record<string, unknown>;
  settings: Record<string, unknown>;
  elements: Record<string, PageBlockElement>;
  styleOverride?: Record<string, unknown>;
}
```

`blockId` is optional because many blocks come from frontend `blockRegistry`, not MongoDB.

`elements` is required because it stores user-edited styles.

---

## 19. Updated Block Model

The Block model should also move toward the new element-based style system.

Recommended fields:

```ts
name
type
description
icon
category
version
data
settings
elements
isActive
stats
```

Old `style` field is not enough anymore, because styles are per-element now.

Recommended replacement:

```ts
elements: Record<string, BlockElement>
```

---

## 20. Saving Page Data

The correct save flow:

```txt
SimplePageBuilder blocks state
        ↓
PATCH /api/pages/[pageId]
        ↓
Page.findOneAndUpdate(...)
        ↓
MongoDB Page.blocks
```

Request body:

```ts
{
  blocks
}
```

Or full page update:

```ts
{
  title: "Landing page",
  description: "...",
  url: "landing-page",
  blocks,
  seo: {
    title: "SEO title",
    description: "SEO description",
    keywords: ["landing", "page"]
  },
  settings: {
    direction: "rtl"
  }
}
```

---

## 21. API: Create Page

Existing route:

```txt
POST /api/pages
```

Purpose:

- create a new page
- optionally use a template
- if template is used, snapshot its blocks

For the new system, template snapshots should include:

```ts
{
  instanceId,
  blockId,
  type,
  version,
  order,
  isActive,
  data,
  settings,
  elements,
  styleOverride
}
```

---

## 22. API: Update Page

Recommended route:

```txt
PATCH /api/pages/[pageId]
```

Responsibilities:

- authenticate user
- verify user owns the page
- normalize blocks
- update page document

Important normalize behavior:

- ensure `instanceId`
- ensure `type`
- set `order` by array index
- default `version` to `1`
- default `isActive` to `true`
- preserve `data`, `settings`, `elements`, and `styleOverride`

---

## 23. API: Get Page

Recommended route:

```txt
GET /api/pages/[pageId]
```

Responsibilities:

- authenticate user
- verify ownership
- return page with full `blocks`

List endpoint should continue excluding blocks for performance:

```ts
.select("-blocks")
```

Single page endpoint must include blocks.

---

## 24. Frontend Save Strategy

The editor currently autosaves to localStorage.

Long-term flow should be:

```txt
GET page from DB
↓
setBlocks(page.blocks)
↓
user edits
↓
debounced PATCH to DB
↓
localStorage as temporary backup only
```

When `initialBlocks` from DB exist, localStorage should not overwrite them.

---

## 25. Recommended SimplePageBuilder Props

```ts
type SimplePageBuilderProps = {
  pageId: string;
  initialBlocks?: PageBlock[];
};
```

Initial state:

```ts
const [blocks, setBlocks] = useState<PageBlock[]>(
  initialBlocks && initialBlocks.length > 0
    ? initialBlocks
    : initialState.blocks
);
```

Save request:

```ts
await fetch(`/api/pages/${pageId}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ blocks }),
});
```

---

## 26. Booking Form Block

A booking/reservation block was planned.

Type:

```txt
bookingForm
```

Fields:

- full name
- phone number
- email
- Persian calendar date
- time slot
- optional note

Important:

- use the provided Persian calendar component
- do not create a calendar from scratch
- submit to `endpointUrl` if provided
- otherwise demo-save / console.log payload
- validate required fields
- show Persian success/error messages

---

## 27. Story Highlights Block

Type:

```txt
storyHighlights
```

Instagram-like behavior:

- circular thumbnails in horizontal scroll
- click opens fullscreen viewer
- image + caption
- progress bar
- auto-advance after 10 seconds
- next/previous buttons
- close after final story

Uses `RepeaterField` for `stories`.

---

## 28. Product Cards Block

Type:

```txt
productCards
```

Behavior:

- horizontal scrollable row
- works on mobile and desktop
- cards do not wrap
- each product has image, name, description, price, old price, badge, button, URL, accent color
- uses `RepeaterField` for `products`

---

## 29. Known Issues and Fixes

### Hydration mismatch with dnd-kit

Problem:

`aria-describedby="DndDescribedBy-0"` differs between server and client.

Fix:

Render builder client-only with dynamic import and `ssr: false`.

### sharedBlockKeyframes TypeScript error

Problem:

```tsx
${sharedBlockKeyframes}
```

Fix:

```tsx
${sharedBlockKeyframes("block-prefix")}
```

### Missing `label` and `allowedStyleKeys` in default elements

Problem:

```ts
elements: {
  container: {
    style: {...}
  }
}
```

Fix:

```ts
elements: {
  container: {
    label: "کادر اصلی",
    allowedStyleKeys: [...],
    style: {...}
  }
}
```

### Wrong schema key `styleKeys`

Problem:

```ts
styleKeys: ["color", "fontSize"]
```

Fix:

```ts
allowedStyleKeys: ["color", "fontSize"]
```

### Wrong block type mismatch

Problem:

Default file used:

```ts
type: "map"
```

Registry expected:

```ts
mapLinks
```

Fix:

Use exact same type everywhere:

```txt
default type
schema type
registry key
registry item type
```

---

## 30. Development Rules for Future Blocks

When creating future blocks:

1. Do not rebuild architecture.
2. Create only the block component, default, and schema files.
3. Update only blockRegistry.
4. Use real shared APIs.
5. Do not use fake props.
6. Do not import builder design system into user blocks.
7. Use styled-components only for editable visual styles.
8. Use Tailwind only for neutral layout.
9. Every visual element must have its own styled component.
10. Default elements must include `label`, `allowedStyleKeys`, and `style`.
11. Schema elements must use `allowedStyleKeys` only.
12. Use `RepeaterField` for array/repeating content.
13. Use path-like keys for inline editing array items.
14. Use Persian default content and RTL direction.
15. Must compile with `npx tsc --noEmit`.

---

## 31. Recommended Next Steps

1. Finalize `Page` model.
2. Finalize `Block` model with `elements`.
3. Add `PATCH /api/pages/[pageId]`.
4. Add `GET /api/pages/[pageId]`.
5. Pass `pageId` and `initialBlocks` into `SimplePageBuilder`.
6. Change autosave from localStorage-only to DB debounce save.
7. Add public page renderer.
8. Add publish/unpublish flow.
9. Add slug validation.
10. Add page SEO editor.
11. Add media manager integration.
12. Add booking submission endpoint.
13. Add path-like update support for repeaters.
14. Add version migration strategy for old blocks.

---

## 32. Final Architecture Summary

The builder is now moving from a simple local block playground to a real page-building platform.

The architecture is:

```txt
blockRegistry
  ↓ creates default blocks
SimplePageBuilder
  ↓ edits blocks
DynamicIslandPanel
  ↓ updates content/styles
PhonePreviewModal
  ↓ previews blocks
PATCH /api/pages/[pageId]
  ↓ saves full snapshot
MongoDB Page.blocks
  ↓ public renderer displays final page
```

The most important rule is:

Store the full edited block snapshot inside `Page.blocks`.

That means saving:

```txt
instanceId
type
version
order
isActive
data
settings
elements
```

Without `elements`, the saved page loses all visual customization.

This is the foundation for a scalable, editable, publishable landing page builder.
