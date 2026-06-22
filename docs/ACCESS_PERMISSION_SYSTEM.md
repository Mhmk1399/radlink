# Access and Permission Management System

This document describes the access-control and permission-management work implemented for the Radlink admin area and API layer. It covers the data model, backend enforcement, frontend gating, cache behavior, admin management screens, and the key files involved.

## Goals

- Support reusable access rules that can be attached to permissions.
- Allow permissions to be assigned to one or more users.
- Support static UI/admin components such as `admin.users`, `admin.pages`, and `admin.sidebar`-style entries.
- Support dynamic resource access for database entities such as templates, blocks, and pages.
- Enforce access globally before API actions run.
- Gate frontend actions so users do not see or trigger actions they cannot perform.
- Keep super admins unrestricted.
- Return Persian, user-readable API errors for access failures.
- Cache resolved permissions to avoid repeated database reads on every render or request.

## Conceptual Model

The system is intentionally split into three layers:

1. **Access**
   Defines what can be done.

   Examples:

   - Static component access:
     - `admin.users` with actions `view`
     - `admin.templates` with actions `view`, `create`, `update`
   - Dynamic access:
     - Template `64...abc` with actions `view`, `update`
     - Page `64...def` with actions `view`

2. **Permission**
   Groups one or more access documents and assigns them to users.

   Example:

   - Permission: `Template Viewer`
   - Accesses:
     - `admin.templates:view`
     - selected template IDs with `view`
   - Assigned users:
     - one or more user IDs

3. **User**
   Stores assigned permission IDs in `user.permissions`.

At runtime, the permission IDs are resolved into a flat access map that is cheap to check.

## Schematic Overview

```mermaid
flowchart TD
  User[User Document] -->|permissions[]| Permission[Permission Documents]
  Permission -->|accesses[]| Access[Access Documents]

  Access --> StaticAccess[Static Components\nadmin.users, admin.templates,\nadmin.blocks, admin.dashboard]
  Access --> DynamicAccess[Dynamic Resources\ntemplates, blocks, pages]

  Request[Incoming API Request] --> Compose[compose()]
  Compose --> Auth[withAuth / withStatus / withRole]
  Auth --> Enforce[enforceRequestAccess()]
  Enforce --> Rules[getAccessTargetForRequest()]
  Rules --> Resolve[resolveUserAccess()]
  Resolve --> Cache[accessCache TTL]
  Resolve --> Decision{Allowed?}

  Decision -->|yes| Handler[Route Handler]
  Decision -->|no| Denied[Persian 401/403 JSON\nrequiredAccess metadata]

  Frontend[Admin UI] --> UseAccess[useAccess()]
  UseAccess --> MeAPI[/api/auth/me]
  MeAPI --> Resolve
  UseAccess --> UIControls[Hide/disable buttons,\nsidebar items, table actions]
```

## Actions

The shared action list lives in `lib/auth/accessCatalog.ts`.

Supported actions:

- `view`
- `create`
- `update`
- `delete`
- `publish`

These actions are used consistently by models, API rules, admin forms, `useAccess`, and `DynamicTable`.

## Static Component Catalog

File: `lib/auth/accessCatalog.ts`

This file defines the available static components that can be granted access. Examples include:

- `admin.dashboard`
- `admin.users`
- `admin.agents`
- `admin.permissions`
- `admin.accesses`
- `admin.pages`
- `admin.templates`
- `admin.blocks`
- `admin.categories`
- `admin.files`
- `admin.qrcodes`
- `admin.products`
- `admin.tickets`
- `admin.notifications`
- `admin.settings`
- `builder.page`
- `builder.template`

This catalog is used by the Access admin UI so static components can be selected without requiring a database record.

## Data Models

### `models/access.ts`

Defines a reusable access document.

Important fields:

- `staticComponents`
  - `componentName`
  - `actions`
- `dynamicAccess`
  - `templates`
  - `blocks`
  - `pages`

Purpose:

- Store access rules independently from users.
- Allow one access document to be reused across multiple permissions.
- Support both static UI components and dynamic database resources.

### `models/permission.ts`

Defines a permission document that groups access documents and assigns them to users.

Important fields:

- `name`
- `description`
- `accesses`
- `assignedToUsers`
- `grantedBy`
- `isActive`

Purpose:

- Group multiple access rules into a named permission.
- Track who granted the permission.
- Track which users received it.
- Disable a permission without deleting it.

### `models/users.ts`

The user model stores assigned permissions.

Important field:

- `permissions: ObjectId[]`

Runtime access is not checked directly from permission documents one by one. Instead, permissions are resolved into a flat access map.

## Backend Access Resolution

### `lib/auth/accessCache.ts`

Provides an in-memory TTL cache for resolved access.

Shape:

```ts
{
  components: Record<string, Set<string>>,
  templates: Record<string, Set<string>>,
  blocks: Record<string, Set<string>>,
  pages: Record<string, Set<string>>
}
```

Purpose:

- Avoid resolving permissions repeatedly for the same user.
- Cache is keyed by user ID.
- Default TTL is 5 minutes.
- Access and permission writes invalidate affected users where needed.

### `lib/auth/resolveUserAccess.ts`

Turns a user's permission IDs into a flat access map.

How it works:

- Checks `accessCache` first.
- Uses one Mongo aggregation pipeline:
  - match active permissions
  - unwind permission access IDs
  - lookup access documents
  - replace root with access document
- Merges all access actions into sets.
- Caches the result.

This is the main runtime source of truth for permission checks.

## Request-Level Enforcement

### `lib/auth/accessRules.ts`

Maps API paths and HTTP methods to required access targets.

Examples:

- `GET /api/users` -> `admin.users:view`
- `POST /api/templates` -> `admin.templates:create`
- `PATCH /api/blocks/:id` -> `admin.blocks:update`
- `DELETE /api/agents/:id` -> `admin.agents:delete`

Special cases:

- `GET /api/categories?mode=options` maps to `admin.templates:view`.
  This allows the template builder to read category options without requiring full category-management access.
- `GET /api/users?mode=agent-options` maps to `admin.agents:create`.
  This allows the agent creation form to list eligible users without requiring full user-management access.
- `/api/blocks/sync` maps to `update`.
- `/api/uploads/template-thumbnail` maps to `update`.
- `/api/admin/dashboard` maps to `admin.dashboard:view`.

The file also provides label helpers used for Persian access-denied messages.

### `lib/auth/enforceAccess.ts`

Performs the global request access decision.

Responsibilities:

- Build the required access target from request path and method.
- Allow requests with no mapped target.
- Reject unauthenticated users with Persian `401`.
- Always allow `superAdmin`.
- Resolve user access through `resolveUserAccess`.
- Check static component access.
- Check dynamic resource access when the route has a resource ID.
- Return Persian `403` with structured metadata.

Access-denied response shape:

```json
{
  "code": "ACCESS_DENIED",
  "message": "شما دسترسی ویرایش برای «کاربران» را ندارید.",
  "requiredAccess": {
    "component": "admin.users",
    "componentLabel": "کاربران",
    "action": "update",
    "actionLabel": "ویرایش"
  }
}
```

### `lib/auth/compose.ts`

All composed API routes pass through this central access check.

Flow:

1. Run configured middlewares.
2. Run `enforceRequestAccess`.
3. If denied, return the error response.
4. Otherwise run the actual route handler.

This is what makes access enforcement global for mapped API routes.

### `lib/auth/middlewares.ts`

Contains auth-related middleware:

- `withDB`
- `withAuth`
- `withRole`
- `withStatus`
- `withAgent`
- `withPermission`

Important behavior:

- `withPermission` still exists for explicit route-level checks.
- `superAdmin` bypasses permission checks.
- Auth, role, status, and permission errors were made Persian.
- `withRole` can allow a request if the mapped permission grants access even when the role alone would not.

## API Routes

### `app/api/accesses/route.ts`

Provides access CRUD list/create behavior.

Responsibilities:

- Normalize static component rules.
- Normalize dynamic template/block/page rules.
- Populate dynamic resources for admin display.
- Enforce `admin.accesses` access through `withPermission`.

### `app/api/accesses/[id]/route.ts`

Provides access detail/update/delete behavior.

Responsibilities:

- Populate dynamic access references.
- Update access static and dynamic rules.
- Delete access documents.
- Remove deleted access IDs from permissions.
- Bust access cache for affected users.

### `app/api/permissions/route.ts`

Provides permission list/create behavior.

Responsibilities:

- Create permission documents.
- Attach created permission IDs to assigned users.
- Populate:
  - `accesses`
  - `assignedToUsers`
  - `grantedBy`
- Enforce `admin.permissions` access.

### `app/api/permissions/[id]/route.ts`

Provides permission detail/update/delete/deactivate behavior.

Responsibilities:

- Update permission metadata.
- Sync assigned users.
- Populate users and accesses.
- Invalidate cached access for affected users.

### `app/api/auth/me/route.ts`

Returns the current user plus resolved access data.

Purpose:

- Frontend uses this endpoint through `useAccess`.
- Response includes serialized user data and the resolved access map.
- This keeps frontend permission checks cheap.

### Other API Routes

The global access rules also protect broader admin APIs:

- users
- agents
- pages
- templates
- blocks
- categories
- files
- QR codes
- products
- tickets
- notifications
- dashboard stats

## Frontend Runtime Access

### `hook/auth/useAccess.ts`

Frontend hook for permission checks.

Provides:

- `user`
- `access`
- `isSuperAdmin`
- `can(component, action)`
- `canOnResource(resource, id, action)`
- loading/error state

Important behavior:

- Calls `/api/auth/me`.
- Uses the auth token from local storage.
- `superAdmin` returns `true` for all checks.
- Other users are checked against the resolved access map.

### `components/global/DynamicTable.tsx`

DynamicTable now uses access rules to gate built-in table actions.

Behavior:

- Maps the table endpoint and mutation method to an access target.
- Checks permissions with `useAccess`.
- Hides or disables create/update/delete actions when the user does not have permission.
- Prevents frontend users from seeing actions that the backend would reject.

Backend enforcement still remains authoritative.

## Admin Management Screens

### `components/admin/AccessesSection.tsx`

Admin UI for managing access documents.

Supports:

- Static component access selection.
- Dynamic templates, blocks, and pages access selection.
- Action selection for each access target.
- Create/update/delete.
- Permission-aware action buttons.

### `components/admin/PermissionsSection.tsx`

Admin UI for managing permissions.

Supports:

- Create/update/deactivate permissions.
- Assign permissions to users.
- Select access documents.
- Display:
  - granted accesses
  - assigned users
  - granting user
- Permission-aware action buttons.

### `components/admin/AdminShell.tsx`

Controls sidebar visibility using `useAccess`.

Behavior:

- `superAdmin` can see everything.
- Other users see sections only when they have the required `view` access or satisfy legacy role visibility.
- Static sections are checked by component key, such as `admin.users:view`.

### `hook/admin/useHashRoute.ts`

Defines admin sections and metadata.

Relevant sections:

- `permissions`
- `accesses`
- `agents`
- all other admin feature sections used by access checks

### `app/admin/page.tsx`

Routes admin sections to their components.

Relevant access-related screens:

- `PermissionsSection`
- `AccessesSection`

## Feature Section Gating

Several admin feature sections consume `useAccess` directly:

- `components/admin/UsersSection.tsx`
- `components/admin/AgentsSection.tsx`
- `components/admin/PagesSection.tsx`
- `components/admin/TemplatesSection.tsx`
- `components/admin/BlocksSection.tsx`
- `components/admin/CategoriesSection.tsx`
- `components/admin/DashboardSection.tsx`

Typical usage:

```ts
const { can, canOnResource } = useAccess();

const canCreate = can("admin.templates", "create");
const canUpdate = can("admin.templates", "update");
const canDelete = can("admin.templates", "delete");
```

Dynamic resource usage:

```ts
canOnResource("templates", templateId, "update")
```

This lets the UI support both broad section-level permissions and per-resource permissions.

## Super Admin Behavior

`superAdmin` is intentionally unrestricted.

Enforced in:

- `lib/auth/enforceAccess.ts`
- `lib/auth/middlewares.ts`
- `hook/auth/useAccess.ts`
- admin shell visibility logic

This means a super admin can view, create, update, delete, and publish without requiring explicit permission documents.

## Error Handling

Access and auth errors are Persian and user-readable.

Examples:

- Unauthenticated:
  - `برای انجام این عملیات ابتدا وارد حساب کاربری شوید.`
- Access denied:
  - `شما دسترسی ویرایش برای «کاربران» را ندارید.`
- Invalid token:
  - `نشست شما معتبر نیست. لطفا دوباره وارد شوید.`

The access-denied payload also includes metadata so the frontend can understand the missing action and component.

## Cache Invalidation

Resolved access is cached by user ID.

Cache is invalidated when:

- an access document is updated or deleted
- a permission changes assigned users or access links
- users affected by permission changes need fresh resolved access

This prevents stale permission state from persisting after admin changes.

## Request Flow Example

Example: a non-super-admin user clicks "delete template".

1. Frontend:
   - `TemplatesSection` checks `can("admin.templates", "delete")`.
   - If not allowed, delete UI is hidden.
2. API request:
   - If a request is still made, `compose()` runs middleware first.
3. Global access enforcement:
   - `getAccessTargetForRequest("/api/templates/:id", "DELETE")`
   - target becomes `admin.templates:delete`.
4. Access resolution:
   - `resolveUserAccess(userId, user.permissions)`
   - reads from cache or resolves from MongoDB.
5. Decision:
   - if allowed, route handler runs.
   - if denied, Persian `403` response is returned.

## File Inventory

### Core Access System

- `models/access.ts`
  - Access model for static components and dynamic resources.
- `models/permission.ts`
  - Permission model that groups accesses and assigns users.
- `models/users.ts`
  - Stores permission IDs on users.
- `lib/auth/accessCatalog.ts`
  - Shared action list and static component catalog.
- `lib/auth/accessCache.ts`
  - TTL cache for resolved access.
- `lib/auth/resolveUserAccess.ts`
  - Aggregates active permissions and access documents into a flat map.
- `lib/auth/accessRules.ts`
  - Maps API routes and HTTP methods to required access targets.
- `lib/auth/enforceAccess.ts`
  - Global access enforcement and Persian auth/access responses.
- `lib/auth/compose.ts`
  - Runs global access enforcement before route handlers.
- `lib/auth/middlewares.ts`
  - Auth, role, status, agent, and explicit permission middlewares.

### API Routes

- `app/api/auth/me/route.ts`
  - Returns current user and resolved access map.
- `app/api/accesses/route.ts`
  - Access list/create.
- `app/api/accesses/[id]/route.ts`
  - Access read/update/delete and cache invalidation.
- `app/api/permissions/route.ts`
  - Permission list/create and user assignment.
- `app/api/permissions/[id]/route.ts`
  - Permission read/update/delete/deactivate and cache invalidation.
- Existing feature APIs
  - Protected through `accessRules` and `compose`.

### Frontend Hooks and Shared Components

- `hook/auth/useAccess.ts`
  - Client access-check hook.
- `components/global/DynamicTable.tsx`
  - Permission-aware create/update/delete actions.

### Admin Screens

- `components/admin/AccessesSection.tsx`
  - Access management UI.
- `components/admin/PermissionsSection.tsx`
  - Permission management UI.
- `components/admin/AdminShell.tsx`
  - Sidebar and admin navigation visibility.
- `hook/admin/useHashRoute.ts`
  - Admin section metadata and route keys.
- `app/admin/page.tsx`
  - Admin section router.

### Feature Sections Consuming Access

- `components/admin/UsersSection.tsx`
- `components/admin/AgentsSection.tsx`
- `components/admin/PagesSection.tsx`
- `components/admin/TemplatesSection.tsx`
- `components/admin/BlocksSection.tsx`
- `components/admin/CategoriesSection.tsx`
- `components/admin/DashboardSection.tsx`

## Adding a New Protected Admin Feature

1. Add a static component key in `lib/auth/accessCatalog.ts`.

   Example:

   ```ts
   { key: "admin.reports", label: "Reports" }
   ```

2. Add API path mapping in `lib/auth/accessRules.ts`.

   Example:

   ```ts
   { prefix: "/api/reports", component: "admin.reports" }
   ```

3. Use `compose()` in the API route.

4. Use `useAccess()` in the frontend section.

   Example:

   ```ts
   const canView = can("admin.reports", "view");
   const canCreate = can("admin.reports", "create");
   ```

5. Add the section to `useHashRoute.ts` and `AdminShell.tsx` navigation if needed.

## Notes and Constraints

- Frontend checks improve UX, but backend checks are authoritative.
- `superAdmin` bypass is deliberate and should remain centralized.
- Static component access is best for screens, sidebar items, and features without database records.
- Dynamic resource access is best for specific templates, blocks, or pages.
- Cache invalidation is important whenever permission or access relationships change.
- Keep route mappings explicit in `accessRules.ts`; this makes security behavior auditable.
