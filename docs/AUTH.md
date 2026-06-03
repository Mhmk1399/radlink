# Auth System Reference

## Architecture

Phone-based OTP auth. No passwords. JWT issued after OTP verification.
All protected routes use `compose(...middlewares)(handler)`.

---

## Env Variables

```
MONGODB_URI=mongodb://localhost:27017/radlink
JWT_SECRET=your_strong_secret
```

---

## File Structure

```
lib/
  db.ts                          ← MongoDB singleton (hot-reload safe)
  auth/
    jwt.ts                       ← signToken / verifyToken
    types.ts                     ← AuthRequest interface (req.ctx)
    middlewares.ts               ← all middleware functions
    compose.ts                   ← compose() runner
    accessCache.ts               ← in-memory TTL cache (5 min)
    resolveUserAccess.ts         ← single aggregation → flat ResolvedAccess

app/api/auth/
  send-otp/route.ts              ← POST: generate & send OTP
  verify-otp/route.ts            ← POST: verify OTP, return JWT
  me/route.ts                    ← GET: current user + full access map

app/api/agents/
  route.ts                       ← POST: create agent | GET: list agents
  [id]/route.ts                  ← GET: single | PATCH: update
  [id]/toggle/route.ts           ← PATCH: activate / deactivate

app/api/permissions/
  route.ts                       ← POST: create | GET: list
  [id]/route.ts                  ← GET | PATCH | DELETE (soft deactivate)

app/api/accesses/
  route.ts                       ← POST: create | GET: list
  [id]/route.ts                  ← GET | PATCH | DELETE (hard, removes from permissions)

app/api/blocks/
  route.ts                       ← POST: create | GET: list (filterable by type, isActive)
  [id]/route.ts                  ← GET | PATCH | DELETE (soft via isActive)

app/api/templates/
  route.ts                       ← POST: create | GET: list (filterable by category, isActive)
  [id]/route.ts                  ← GET | PATCH | DELETE (soft via isActive)

app/api/pages/
  route.ts                       ← POST: create | GET: list (owner sees own, admin sees all)
  [id]/route.ts                  ← GET | PATCH | DELETE
  [id]/blocks/route.ts           ← PATCH: add | remove | reorder | update blocks on a live page

app/api/categories/
  route.ts                       ← POST: create | GET: list
  [id]/route.ts                  ← GET | PATCH | DELETE

app/api/files/
  route.ts                       ← POST: register | GET: list
  [id]/route.ts                  ← GET | DELETE

app/api/notifications/
  route.ts                       ← POST: send | GET: list
  [id]/route.ts                  ← GET | DELETE

app/api/products/
  route.ts                       ← POST: create | GET: list
  [id]/route.ts                  ← GET | PATCH | DELETE

app/api/qr/
  route.ts                       ← POST: create | GET: list
  [id]/route.ts                  ← GET | PATCH | DELETE

app/api/tickets/
  route.ts                       ← POST: create | GET: list
  [id]/route.ts                  ← GET | PATCH | DELETE
  [id]/assign/route.ts           ← PATCH: assign to user

app/api/users/
  route.ts                       ← GET: list (admin only)
  [id]/route.ts                  ← GET | PATCH | DELETE (soft)
  [id]/status/route.ts           ← PATCH: change status
  [id]/role/route.ts             ← PATCH: change role (superAdmin only)

hooks/auth/
  useAccess.ts                   ← client hook: can() / canOnResource()
```

---

## Middleware Chain — `lib/auth/middlewares.ts`

Each middleware receives `(req: AuthRequest, next)` — calls `next()` to continue or returns `NextResponse` to short-circuit.

| Middleware | Options | What it does |
|---|---|---|
| `withDB()` | — | Ensures MongoDB connection |
| `withAuth(opts?)` | `allowUnverifiedPhone?: boolean` | Verifies JWT, attaches `req.ctx.user` |
| `withRole(...roles)` | `"user" \| "agent" \| "admin" \| "superAdmin"` | Rejects if role not in list |
| `withStatus(...statuses)` | `"active" \| "inactive" \| "blocked" \| "pending"` | Rejects if status not in list |
| `withAgent(opts?)` | `requireActive?: boolean` (default `true`) | Loads Agent, attaches `req.ctx.agent` |
| `withPermission(opts)` | see below | Cache-first access check |

### withPermission options

```ts
// Static dashboard component
withPermission({ component: "dashboard.reports", action: "view" })

// Dynamic resource
withPermission({ resource: "templates", resourceId: "abc123", action: "update" })
// resource: "templates" | "blocks" | "pages"
// action:   "view" | "create" | "update" | "delete" | "publish"
```

`superAdmin` bypasses all permission checks.

---

## Composer — `lib/auth/compose.ts`

```ts
compose(...middlewares)(handler)
```

Chains middlewares left-to-right. Passes Next.js route context (`params`) through to the handler.

---

## Access Resolution — Performance

The `User → Permission → Access` chain is collapsed into a **single MongoDB aggregation** and cached in memory.

```
withPermission() called
  → cache hit?  → O(1) Set.has()  (no DB)
  → cache miss? → 1 aggregation pipeline → populate cache → O(1)
```

**Cache:** in-memory TTL Map, 5 min, global singleton. Busted explicitly on every permission/access write.

**`ResolvedAccess` shape (server):**
```ts
{
  components: Record<string, Set<string>>   // component → actions
  templates:  Record<string, Set<string>>   // id → actions
  blocks:     Record<string, Set<string>>
  pages:      Record<string, Set<string>>
}
```

---

## req.ctx shape

```ts
req.ctx = {
    user?: IUser,    // set by withAuth
    agent?: IAgent,  // set by withAgent
}
```

---

## API Routes

### Auth
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/send-otp` | public | creates user on first call, rate-limited 60s |
| POST | `/api/auth/verify-otp` | public | validates OTP, returns JWT + user |
| GET | `/api/auth/me` | active user | returns user + serialized access map |

### Agents
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/agents` | admin+ | creates agent, promotes user role → `"agent"` |
| GET | `/api/agents` | admin+ | paginated, filterable by `type` and `isActive` |
| GET | `/api/agents/[id]` | admin+ or own agent | |
| PATCH | `/api/agents/[id]` | admin+ or own agent | admin: all fields / agent: profile fields only |
| PATCH | `/api/agents/[id]/toggle` | admin+ | flips `isActive`, no delete |

### Permissions
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/permissions` | admin+ | create permission bundle |
| GET | `/api/permissions` | admin+ | paginated list |
| GET | `/api/permissions/[id]` | admin+ | |
| PATCH | `/api/permissions/[id]` | admin+ | busts cache for assigned users |
| DELETE | `/api/permissions/[id]` | superAdmin | soft deactivate, busts cache |

### Accesses
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/accesses` | admin+ | create access record |
| GET | `/api/accesses` | admin+ | paginated list |
| GET | `/api/accesses/[id]` | admin+ | |
| PATCH | `/api/accesses/[id]` | admin+ | busts cache for affected users |
| DELETE | `/api/accesses/[id]` | superAdmin | hard delete, removes from all permissions, busts cache |

### Blocks
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/blocks` | admin+ | create master block |
| GET | `/api/blocks` | active user | filterable by `type`, `isActive` |
| GET | `/api/blocks/[id]` | active user | |
| PATCH | `/api/blocks/[id]` | admin+ | update any field |
| DELETE | `/api/blocks/[id]` | admin+ | soft — flips `isActive: false` |

### Templates
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/templates` | admin+ | create template with full style tokens |
| GET | `/api/templates` | active user | filterable by `category`, `isActive`, populates blocks |
| GET | `/api/templates/[id]` | active user | full populate of blocks with style |
| PATCH | `/api/templates/[id]` | admin+ | update any field |
| DELETE | `/api/templates/[id]` | admin+ | soft — flips `isActive: false` |

### Pages
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/pages` | active user | creates page, snapshots template blocks if `templateId` given |
| GET | `/api/pages` | active user | owner sees own, admin sees all. blocks excluded from list |
| GET | `/api/pages/[id]` | owner or admin | full page with blocks |
| PATCH | `/api/pages/[id]` | owner or admin | meta/style only — does NOT touch blocks |
| DELETE | `/api/pages/[id]` | owner or admin | hard delete |
| PATCH | `/api/pages/[id]/blocks` | owner or admin | `action: add\|remove\|reorder\|update` |

### Categories
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/categories` | admin+ | create category |
| GET | `/api/categories` | active user | paginated, populates templates |
| GET | `/api/categories/[id]` | active user | |
| PATCH | `/api/categories/[id]` | admin+ | |
| DELETE | `/api/categories/[id]` | admin+ | hard delete |

### Files
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/files` | active user | register uploaded file record |
| GET | `/api/files` | active user | owner sees own, admin sees all |
| GET | `/api/files/[id]` | owner or admin | |
| DELETE | `/api/files/[id]` | owner or admin | hard delete |

### Notifications
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/notifications` | admin+ | targeted (`userId`) or global (`isGlobal: true`) |
| GET | `/api/notifications` | active user | user sees own + global, admin sees all |
| GET | `/api/notifications/[id]` | owner or admin | |
| DELETE | `/api/notifications/[id]` | admin+ | hard delete |

### Products
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/products` | admin+ | create product |
| GET | `/api/products` | active user | paginated list |
| GET | `/api/products/[id]` | active user | |
| PATCH | `/api/products/[id]` | admin+ | |
| DELETE | `/api/products/[id]` | admin+ | hard delete |

### QR Codes
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/qr` | active user | creates QR for own page, auto-generates shortcode |
| GET | `/api/qr` | active user | owner sees own, admin sees all. filterable by `isActive` |
| GET | `/api/qr/[id]` | owner or admin | |
| PATCH | `/api/qr/[id]` | owner or admin | update `targetUrl`, `imageurl`, `isActive` |
| DELETE | `/api/qr/[id]` | owner or admin | hard delete |

### Tickets
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/tickets` | active user | creates ticket, requester = current user |
| GET | `/api/tickets` | active user | owner sees own, admin sees all. filterable by `status`, `priority` |
| GET | `/api/tickets/[id]` | requester or admin | full populate with attachments |
| PATCH | `/api/tickets/[id]` | requester (own fields) or admin (all fields) | admin can set `status`, `assignee`, `category` |
| DELETE | `/api/tickets/[id]` | admin+ | hard delete |
| PATCH | `/api/tickets/[id]/assign` | admin+ | sets assignee + status → `in_progress` |

### Users
| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/api/users` | admin+ | paginated, filterable by `role`, `status`, `search` (phone/name) |
| GET | `/api/users/[id]` | self or admin | |
| PATCH | `/api/users/[id]` | self (profile fields) or admin (+ limits, permissions) | |
| DELETE | `/api/users/[id]` | admin+ | soft delete (`isDeleted: true`). admin cannot delete superAdmin |
| PATCH | `/api/users/[id]/status` | admin+ | set `active\|inactive\|blocked\|pending` |
| PATCH | `/api/users/[id]/role` | superAdmin only | set role, prevents privilege escalation |

---

## Frontend — `hooks/auth/useAccess.ts`

Fetches `/api/auth/me` once on mount. SWR dedupes for 5 min (matches server TTL). No per-component API calls.

```ts
const { user, can, canOnResource, isLoading } = useAccess();

// Static component gate
can("dashboard.reports", "view")

// Dynamic resource gate
canOnResource("templates", templateId, "update")
canOnResource("pages", pageId, "publish")
```

`superAdmin` always returns `true` from both helpers.

---

## Usage Examples

### Public route
```ts
export const GET = compose(withDB())(async (req) => {
    return NextResponse.json({ ok: true });
});
```

### Any active logged-in user
```ts
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active")
)(async (req) => {
    return NextResponse.json({ user: req.ctx.user });
});
```

### Admin only
```ts
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("admin", "superAdmin")
)(async (req) => { ... });
```

### Agent route
```ts
export const GET = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withRole("agent"),
    withAgent()
)(async (req) => {
    return NextResponse.json({ agent: req.ctx.agent });
});
```

### Permission-gated route
```ts
export const POST = compose(
    withDB(),
    withAuth(),
    withStatus("active"),
    withPermission({ component: "landing.builder", action: "create" })
)(async (req) => { ... });
```

---

## OTP Notes

- 6 digits, expires in 2 minutes
- Rate limited: 1 request per 60s per phone
- Store: in-memory `Map` — replace with Redis in production
