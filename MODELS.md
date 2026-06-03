# Radlink — Models Reference

---

## User (`users.ts`)
Core identity model. All other models revolve around it.

| Field | Type | Notes |
|---|---|---|
| phoneNumber | String | required, unique — primary identifier |
| role | `user \| agent \| admin \| superAdmin` | default: `user` |
| status | `active \| inactive \| blocked \| pending` | default: `active` |
| permissions | ObjectId[] | → Permission |
| agentid | ObjectId | → Agent (set when role promoted to `agent`) |
| limits | `{ files, blocks, pages, landingPages }` | usage caps |
| isDeleted | Boolean | soft delete — auto-filtered in all `find` queries |
| isPhoneVerified | Boolean | set true after first OTP verification |
| nationalCode, fatherName | String | optional profile fields |

**Behaviors:**
- Pre-find hook excludes `isDeleted: true` automatically
- Virtual `fullName` = firstName + lastName
- toJSON strips `_id/__v`, exposes `id`
- Created automatically on first `POST /api/auth/send-otp` call

---

## Agent (`agent.ts`)
Extended profile for users with role `agent`. One-to-one with User.

| Field | Type | Notes |
|---|---|---|
| user | ObjectId | → User, unique |
| type | `personal \| company` | |
| pricePerLanding | Number | agent's custom price |
| companyName, ceoName, economicNumber, registrationNumber | String | required only if `type === "company"` |
| limits | `{ files, blocks, pages, landingPages }` | agent-level caps |
| isActive | Boolean | toggled via `/api/agents/[id]/toggle`, never deleted |

**Behaviors:**
- Created by admin via `POST /api/agents` — automatically promotes linked user's role to `"agent"`
- Pre-validate hook clears company fields if `type === "personal"`
- toJSON strips `_id/__v`, exposes `id`

---

## Permission (`permission.ts`)
Named permission bundle assigned to users.

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| description | String | |
| accesses | ObjectId[] | → Access |
| assignedToUsers | ObjectId[] | → User |
| grantedBy | ObjectId | → User (admin who created it) |
| isActive | Boolean | soft-deactivatable by superAdmin |

**Behaviors:**
- Writing (PATCH/DELETE) busts the access cache for all `assignedToUsers`
- Compound index on `assignedToUsers + isActive` for fast lookup

---

## Access (`access.ts`)
Granular access control record. Attached to a Permission.

| Field | Type | Notes |
|---|---|---|
| staticComponents | `[{ componentName, actions[] }]` | frontend hardcoded components e.g. `"dashboard.reports"` |
| dynamicAccess.templates | `[{ templateId, actions[] }]` | → Template |
| dynamicAccess.blocks | `[{ blockId, actions[] }]` | → Block |
| dynamicAccess.pages | `[{ pageId, actions[] }]` | → Page |

**Actions enum:** `view | create | update | delete | publish`

**Access chain:** `User → permissions[] → Permission → accesses[] → Access`

**Resolution:** The full chain is collapsed into a single MongoDB aggregation pipeline and cached in memory (5 min TTL) per user. See `lib/auth/resolveUserAccess.ts`.

---

## Block (`blocks.ts`)
Master block — the reusable content unit. Admin-managed.

| Field | Type | Notes |
|---|---|---|
| name, type | String | required. type maps to a React component e.g. `"hero"`, `"cta"` |
| data | `Record<string, unknown>` | what the block renders — text, images, links |
| settings | `Record<string, unknown>` | component behaviour config e.g. `{ autoplay, columns }` |
| style | `StyleMap` | CSS-in-JS object consumed directly by styled-components |
| icon | String | |
| isActive | Boolean | soft delete via PATCH or DELETE |
| stats.usageCount | Number | |

**Responsibility:** data + behaviour. Not concerned with the global visual theme.

---

## Template (`template.ts`)
Purely a style preset — the visual skin. Admin-managed.

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| style | `TemplateStyle` | full design token set (see below) |
| category | ObjectId | → Category |
| blocks | ObjectId[] | ordered default blocks — snapshotted into page on creation |
| thumbnail | String | preview image URL |
| isActive | Boolean | |

**`TemplateStyle` tokens:** `fontFamily`, `fontSizeBase`, `lineHeight`, `colors { primary, secondary, accent, background, surface, text, textMuted, border }`, `spacing { xs–xl }`, `button StyleMap`, `card StyleMap`, `bgImage`, `extra StyleMap`

**Responsibility:** visual skin only. No content, no behaviour.

**Style merge order at render time:** `template.style` ← `block.style` ← `pageBlock.styleOverride`

---

## Page (`pages.ts`)
The live document. Owned by a user.

| Field | Type | Notes |
|---|---|---|
| title, url | String | url is unique slug |
| owner | ObjectId | → User |
| template | ObjectId | → Template (provides the skin) |
| blocks | `PageBlock[]` | embedded snapshots — copied from master blocks at creation |
| styleOverride | `StyleMap` | page-level overrides on top of template |
| logo, favicon | String | |
| seo | `{ title, description, keywords[] }` | |
| stats | `{ views, visitors }` | |
| extraServices, subscription, settings | Object | flexible config |
| isPublished | Boolean | default `false` |

**`PageBlock` shape:**
```ts
{
  blockId:       ObjectId   // ref back to master Block
  type:          string
  order:         number     // render order
  data:          BlockData  // snapshot, page-owner can edit freely
  settings:      BlockSettings
  styleOverride: StyleMap   // overrides on top of template skin
}
```

**Responsibility:** the live canvas. Owns its block snapshots — edits don't affect master blocks.

---

## Category (`category.ts`)
Groups templates together.

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| description | String | |
| templates | ObjectId[] | → Template |

---

## QR (`qr.ts`)
QR code linked to a page.

| Field | Type | Notes |
|---|---|---|
| page | ObjectId | → Page |
| owner | ObjectId | → User |
| targetUrl | String | required |
| shortcode | String | unique |
| imageurl | String | |
| isActive | Boolean | |

---

## File (`files.ts`)
Uploaded file record.

| Field | Type | Notes |
|---|---|---|
| filename | String | required |
| path | String | required |
| owner | ObjectId | → User |

---

## Ticket (`tickets.ts`)
Support ticket system.

| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | |
| status | `open \| in_progress \| closed` | default: `open` |
| priority | `low \| medium \| high` | default: `medium` |
| requester | ObjectId | → User, required |
| assignee | ObjectId | → User |
| category | ObjectId | → Category |
| attachments | ObjectId[] | → File |

---

## Notification (`notification.ts`)
System notification for a user or global broadcast.

| Field | Type | Notes |
|---|---|---|
| User | ObjectId | → User (nullable for global) |
| message | String | required |
| closeable | Boolean | default: `false` |
| isGlobal | Boolean | default: `false` — if true, shown to all users |

---

## Product (`products.ts`)
Basic product listing.

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| description | String | |
| price | Number | required |
| images | String[] | |

---

## Relationship Overview

```
User ──── permissions[] ──→ Permission ──── accesses[] ──→ Access
 │              │                                │
 │         assignedToUsers                  staticComponents
 │                                          dynamicAccess { templates, blocks, pages }
 │
 ├── agentid ──→ Agent (1:1, created by admin)
 │
 └── owns ──→ Page ──→ template ──→ Template ──→ blocks[] ──→ Block (master)
                │         │               │
                │    style skin      category ──→ Category
                │
                └── blocks[] PageBlock (snapshots, embedded)
                       └── blockId ──→ Block (ref only, data is copied)

Style merge at render: template.style ← block.style ← pageBlock.styleOverride

QR ──→ Page
QR ──→ User (owner)

Ticket ──→ User (requester / assignee)
Ticket ──→ Category
Ticket ──→ File[] (attachments)

Notification ──→ User (or global)
File ──→ User (owner)
```
