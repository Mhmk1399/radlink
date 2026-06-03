# DynamicTable — Complete Documentation

## Overview

A fully-featured, RTL-first data table system built for Next.js + TypeScript.  
Supports SWR-powered fetching, client/server pagination, full CRUD, filters, export, and 10+ UX features.

---

## File Structure

hooks/
useTableData.ts # SWR data fetching + CRUD wrappers
useDebounce.ts # Search debounce
usePullToRefresh.ts # Mobile pull-to-refresh gesture
useCopyToClipboard.ts # Cell copy with toast feedback

components/
ds/DynamicTable.tsx # Main table component

text

---

## 1. `useTableData` Hook

**Location:** `hooks/useTableData.ts`

The core data hook. Wraps SWR and exposes typed CRUD operations that automatically revalidate after each mutation.

### Signature

```ts
function useTableData<T>(options: UseTableDataOptions<T>): UseTableDataReturn<T>
Options
Option	Type	Default	Description
endpoint	string	required	API URL — e.g. /api/users
fetcher	(url) => Promise<T[]>	built-in fetch	Custom fetcher override
transformResponse	(raw) => T[]	auto-detect	Map raw API response to array
headers	Record<string, string>	{}	HTTP headers (e.g. Authorization)
swrConfig	SWRConfiguration	—	SWR options override
enabled	boolean	true	Set false to skip fetching
serverSide	boolean	false	Enable server-side pagination mode
serverPaginationParams	ServerPaginationParams	—	Page/size/sort/search sent as query params
transformPaginatedResponse	(raw) => ServerPaginatedResponse<T>	—	Required when serverSide: true
Return Values
Value	Type	Description
data	T[]	Fetched data array
isLoading	boolean	True on first load
isValidating	boolean	True on background revalidation
error	Error | undefined	Fetch error if any
mutate	KeyedMutator<T[]>	Manually trigger revalidation
create	(item) => Promise<T | void>	POST + optimistic update + mutate
update	(item, primaryKey?) => Promise<T | void>	PUT + optimistic update + mutate
remove	(item, primaryKey?) => Promise<void>	DELETE + optimistic update + mutate
serverTotal	number	Total records (server-side mode)
serverTotalPages	number	Total pages (server-side mode)
How CRUD works
Each CRUD method:

Sends the HTTP request
Applies an optimistic update to the local cache immediately
Calls mutate({ revalidate: true }) to sync with server
TypeScript

// Built-in fetcher auto-detects response shape:
// { data: [...] }  →  extracts .data
// { results: [...] }  →  extracts .results
// [...]  →  uses as-is
Server-Side Pagination
When serverSide: true, the hook builds the URL with query params:

text

GET /api/users?page=2&pageSize=25&search=ali&sortKey=name&sortDir=asc&filter_role=admin
TypeScript

const { data, serverTotal, serverTotalPages } = useTableData({
  endpoint: "/api/users",
  serverSide: true,
  serverPaginationParams: { page: 1, pageSize: 25, search: "ali" },
  transformPaginatedResponse: (raw: any) => ({
    data: raw.data,
    total: raw.meta.total,
    page: raw.meta.page,
    pageSize: raw.meta.pageSize,
    totalPages: raw.meta.totalPages,
  }),
});
2. useDebounce Hook
Location: hooks/useDebounce.ts

Delays updating a value until the user stops typing.

TypeScript

function useDebounce<T>(value: T, delay?: number): T
// Default delay: 300ms
Used internally by DynamicTable for the search input.
Controlled via searchDebounceMs prop.

3. usePullToRefresh Hook
Location: hooks/usePullToRefresh.ts

Detects downward touch gesture on mobile and triggers a refresh callback.

TypeScript

function usePullToRefresh(options: {
  onRefresh: () => Promise<void> | void;
  threshold?: number;   // pixels to pull before triggering (default: 80)
  enabled?: boolean;
}): {
  containerRef: RefObject<HTMLDivElement>;
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
}
Only activates when container.scrollTop === 0
Applies resistance — pull feels natural, not 1:1
Used automatically inside DynamicTable when pullToRefresh={true}
4. useCopyToClipboard Hook
Location: hooks/useCopyToClipboard.ts

Copies text to clipboard with a timed reset and per-cell tracking.

TypeScript

function useCopyToClipboard(resetDelay?: number): {
  copied: boolean;           // true for resetDelay ms after copy
  copiedCell: string | null; // ID of the last copied cell
  copy: (text: string, cellId?: string) => Promise<boolean>;
}
Falls back to execCommand("copy") for non-HTTPS contexts
cellId format used in table: "${rowKey}-${colKey}"
5. DynamicTable Component
Location: components/ds/DynamicTable.tsx

Props
Data & Fetching
Prop	Type	Default	Description
endpoint	string	required	API URL for SWR fetching
data	T[]	—	Static data — skips SWR entirely
enabled	boolean	true	Disable fetching (use with data prop)
fetcher	(url) => Promise<T[]>	—	Custom fetch function
transformResponse	(raw) => T[]	—	Map API response to array
headers	Record<string, string>	—	HTTP headers
swrConfig	SWRConfiguration	—	SWR options
serverSide	boolean	false	Server-side mode
transformPaginatedResponse	(raw) => ServerPaginatedResponse<T>	—	Required for server-side
onError	(error: Error) => void	—	Called on fetch error
Display
Prop	Type	Default	Description
columns	ColumnDef<T>[]	required	Column definitions
title	string	—	Table heading
subtitle	string	—	Table subheading
primaryKey	keyof T	"id"	Unique row identifier
emptyMessage	string	"داده‌ای یافت نشد"	Empty state text
UX Features
Prop	Type	Default	Description
pageSize	number	10	Initial rows per page
pageSizes	number[]	[10,25,50,100]	Page size selector options
searchable	boolean	true	Show search input
searchDebounceMs	number	300	Search debounce delay
stickyHeader	boolean	true	Freeze header on scroll
showRowNumbers	boolean	false	Show row index column
doubleClickToEdit	boolean	true	Double-click row to open edit modal
enableCellCopy	boolean	true	Click cell to copy value
pullToRefresh	boolean	true	Mobile pull-to-refresh
exportable	boolean	true	Show export menu (Excel/CSV/PNG)
exportFileName	string	"export"	Download file name
rowActions	(row: T) => ReactNode	—	Extra action buttons per row
CRUD
Prop	Type	Description
canCreate	boolean	Show add button (default: true)
canUpdate	boolean	Show edit button (default: true)
canDelete	boolean	Show delete button (default: true)
onCreate	(item, builtInCreate) => Promise<void>	Custom create handler
onUpdate	(item, builtInUpdate) => Promise<void>	Custom update handler
onDelete	(item, builtInRemove) => Promise<void>	Custom delete handler
Pattern: Each handler receives the item AND the built-in SWR function.
Call builtInCreate(item) to get automatic POST + cache update.
Or ignore it and manage state yourself.

ColumnDef<T> — Column Configuration
TypeScript

interface ColumnDef<T> {
  key: keyof T & string;         // Data field key
  label: string;                 // Header label

  // Visibility
  visible?: boolean;             // Hide column entirely (default: true)
  hideOnMobile?: boolean;        // Hide on mobile card view
  isPrimary?: boolean;           // Marks as primary key (excluded from edit form)

  // Editing
  editable?: boolean;            // Include in create/edit form (default: true)
  viewable?: boolean;            // Include in view modal (default: true)
  required?: boolean;            // Form validation
  inputType?: string;            // "text" | "email" | "number" | "tel" | "textarea" | "checkbox" | "date"
  placeholder?: string;
  options?: { label: string; value: string }[];  // Renders as CustomSelect dropdown

  // Sorting & Filtering
  sortable?: boolean;            // Clickable header sort (default: true)
  filterable?: boolean;          // Dropdown filter in filter bar
  dateFilter?: boolean;          // Jalali date range filter

  // Rendering
  render?: (value: T[keyof T], row: T) => ReactNode;  // Custom cell renderer
  copyable?: boolean;            // Allow click-to-copy (default: true)
}
Data Flow Diagram
text

User Action
    │
    ▼
DynamicTable
    │
    ├── Static Mode (data prop)
    │       └── data flows directly → client filter/sort/paginate
    │
    └── SWR Mode (endpoint prop)
            │
            ├── useTableData(endpoint)
            │       └── SWR fetches & caches
            │
            ├── Client-Side (serverSide=false)
            │       └── all data fetched once → filter/sort/paginate in browser
            │
            └── Server-Side (serverSide=true)
                    └── page/search/sort/filters → query params → API
                        API returns { data, total, totalPages, ... }
Usage Examples
Minimal (static data, no API)
React

<DynamicTable<User>
  endpoint=""
  data={users}
  enabled={false}
  columns={columns}
  primaryKey="id"
  onCreate={async (item) => setUsers(prev => [...prev, { id: Date.now(), ...item }])}
  onUpdate={async (item) => setUsers(prev => prev.map(u => u.id === item.id ? item : u))}
  onDelete={async (item) => setUsers(prev => prev.filter(u => u.id !== item.id))}
/>
Standard (API, client-side pagination)
React

<DynamicTable<User>
  endpoint="/api/users"
  columns={columns}
  primaryKey="id"
  stickyHeader
  showRowNumbers
  enableCellCopy
  doubleClickToEdit
  pullToRefresh
  pageSizes={[10, 25, 50]}
  searchDebounceMs={400}
  transformResponse={(raw: any) => raw.data}
  headers={{ Authorization: `Bearer ${token}` }}
  onCreate={async (item, create) => await create(item)}
  onUpdate={async (item, update) => await update(item)}
  onDelete={async (item, remove) => await remove(item)}
  onError={(err) => toast.error(err.message)}
/>
Advanced (server-side pagination)
React

<DynamicTable<Product>
  endpoint="/api/products"
  columns={columns}
  primaryKey="id"
  serverSide={true}
  transformPaginatedResponse={(raw: any) => ({
    data: raw.items,
    total: raw.total,
    page: raw.page,
    pageSize: raw.perPage,
    totalPages: raw.lastPage,
  })}
  pageSizes={[25, 50, 100]}
  swrConfig={{ refreshInterval: 30000 }}
/>
Key Behaviors
Optimistic Updates
When create/update/remove is called via the built-in methods:

The local SWR cache updates immediately (UI feels instant)
Then revalidate: true syncs with server in the background
If server fails → SWR reverts to previous state
Search Debounce
Search input is not debounced in state — it updates immediately for UI
The debounced value is used for actual filtering / server requests
A spinner appears in the search box during the debounce delay
Server-Side vs Client-Side
Feature	Client-Side	Server-Side
When to use	< 1000 rows	> 1000 rows
Search	Browser filter	API query param
Sort	Browser sort	API query param
Filters	Browser filter	API query param
SWR Key	endpoint	endpoint?page=1&search=...
Each unique combination of page/search/sort creates a new SWR key → separate cache entry → instant back-navigation.

Column dateFilter
Renders a Jalali (Persian) date range picker in the filter bar.
Internally parses Persian digit strings like "۱۴۰۳/۰۶/۱۵" and compares Unix timestamps.
Also controls whether the create/edit form shows a Jalali date picker for that field.

Feature Flags Quick Reference
React

// All features on:
<DynamicTable
  stickyHeader        // ← freeze header
  showRowNumbers      // ← row index
  enableCellCopy      // ← click to copy
  doubleClickToEdit   // ← dbl-click → edit modal
  pullToRefresh       // ← mobile gesture
  searchable          // ← search box
  exportable          // ← Excel/CSV/PNG
  canCreate           // ← add button
  canUpdate           // ← edit button
  canDelete           // ← delete button
  serverSide={false}  // ← client pagination
  pageSizes={[10,25,50,100]}
  searchDebounceMs={300}
/>
Dependencies
Package	Purpose
swr	Data fetching & caching
react-multi-date-picker	Jalali date picker
react-date-object	Persian calendar & locale
No other UI library dependencies — all icons are inline SVG.
```
