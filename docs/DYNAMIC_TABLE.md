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


### PROPS --------------------------------------------------------------------------------


key
TypeScript

key: keyof T & string;
کلیدی از آبجکت داده که این ستون باید نمایش بدهد.

مثال:
TypeScript

{ key: "name", label: "نام" }
اگر ردیف شما این شکلی باشد:

TypeScript

{ id: 1, name: "Ali" }
مقدار ستون name برابر "Ali" خواهد بود.

label
TypeScript

label: string;
عنوانی که در هدر جدول برای این ستون نمایش داده می‌شود.

مثال:
TypeScript

{ key: "email", label: "ایمیل" }
render
TypeScript

render?: (value: T[keyof T], row: T) => ReactNode;
اگر بخواهی مقدار ستون را به شکل سفارشی نمایش بدهی از این استفاده می‌کنی.

کاربرد:
badge
رنگی کردن مقدار
آیکن کنار متن
فرمت دلخواه
مثال:
TypeScript

{
  key: "status",
  label: "وضعیت",
  render: (value) => <StatusBadge status={String(value)} />
}
اگر render ندهی، جدول خودش مقدار را به صورت متن ساده نمایش می‌دهد.

visible
TypeScript

visible?: boolean;
مشخص می‌کند این ستون اصلاً داخل جدول نمایش داده بشود یا نه.

رفتار:
اگر false باشد: ستون کامل مخفی می‌شود
اگر تعریف نشود: نمایش داده می‌شود
مثال:
TypeScript

{ key: "internalCode", label: "کد داخلی", visible: false }
editable
TypeScript

editable?: boolean;
مشخص می‌کند این ستون داخل فرم ایجاد/ویرایش بیاید یا نه.

رفتار:
اگر false باشد: در فرم create/edit نمایش داده نمی‌شود
اگر تعریف نشود: قابل ویرایش در نظر گرفته می‌شود
اگر isPrimary باشد، به طور خودکار از فرم حذف می‌شود
مثال:
TypeScript

{ key: "createdAt", label: "تاریخ ایجاد", editable: false }
viewable
TypeScript

viewable?: boolean;
مشخص می‌کند این ستون داخل مودال مشاهده جزئیات نمایش داده شود یا نه.

رفتار:
اگر false باشد: در مودال view نشان داده نمی‌شود
اگر تعریف نشود: نمایش داده می‌شود
inputType
TypeScript

inputType?: string;
نوع ورودی برای فرم ایجاد/ویرایش.

مقادیر رایج:
"text"
"email"
"number"
"tel"
"textarea"
"checkbox"
"date"
مثال:
TypeScript

{ key: "email", label: "ایمیل", inputType: "email" }
نکته:
اگر inputType === "date" یا dateFilter === true باشد، برای فرم از Jalali DatePicker استفاده می‌شود.

sortable
TypeScript

sortable?: boolean;
مشخص می‌کند کاربر بتواند روی هدر ستون کلیک کند و sort انجام شود یا نه.

رفتار:
اگر false باشد: ستون sortable نیست
اگر تعریف نشود: sortable است
placeholder
TypeScript

placeholder?: string;
متن placeholder برای ورودی فرم create/edit.

مثال:
TypeScript

{ key: "phone", label: "تلفن", placeholder: "۰۹۱۲۰۰۰۰۰۰۰" }
isPrimary
TypeScript

isPrimary?: boolean;
مشخص می‌کند این ستون کلید اصلی رکورد است.

کاربرد:
معمولاً id
از فرم create/edit حذف می‌شود
برای تشخیص ردیف اصلی استفاده می‌شود
مثال:
TypeScript

{ key: "id", label: "شناسه", isPrimary: true }
در عمل بهتر است علاوه بر این، primaryKey را هم در خود جدول مشخص کنی.

hideOnMobile
TypeScript

hideOnMobile?: boolean;
اگر true باشد، این ستون در نمای موبایل نمایش داده نمی‌شود.

کاربرد:
برای ستون‌هایی که در موبایل مهم نیستند:

id
تاریخ
کد داخلی
توضیحات بلند
required
TypeScript

required?: boolean;
مشخص می‌کند این فیلد در فرم create/edit اجباری باشد.

رفتار:
اگر کاربر خالی بگذارد، خطای اعتبارسنجی نمایش داده می‌شود.

مثال:
TypeScript

{ key: "name", label: "نام", required: true }
options
TypeScript

options?: { label: string; value: string }[];
اگر این پراپ را بدهی، ورودی فرم به جای input تبدیل به CustomSelect می‌شود.

کاربرد:
برای فیلدهایی مثل:

نقش
وضعیت
دسته‌بندی
نوع کاربر
مثال:
TypeScript

{
  key: "role",
  label: "نقش",
  options: [
    { label: "مدیر", value: "admin" },
    { label: "کاربر", value: "user" },
  ]
}
filterable
TypeScript

filterable?: boolean;
اگر true باشد، برای این ستون یک فیلتر dropdown در بالای جدول ساخته می‌شود.

رفتار:
مقادیر فیلتر از روی داده‌های موجود ساخته می‌شود.

مثال:
TypeScript

{ key: "status", label: "وضعیت", filterable: true }
dateFilter
TypeScript

dateFilter?: boolean;
اگر true باشد، برای این ستون فیلتر بازه تاریخ شمسی نمایش داده می‌شود.

کاربرد:
برای ستون‌هایی مثل:

createdAt
updatedAt
startDate
نکته:
این فیلتر انتظار دارد مقدار ستون قابل تفسیر به تاریخ فارسی باشد، مثل:

TypeScript

"۱۴۰۳/۰۶/۱۵"
copyable
TypeScript

copyable?: boolean;
مشخص می‌کند این سلول با کلیک قابل کپی باشد یا نه.

رفتار:
اگر false باشد: این ستون copy نمی‌شود
اگر تعریف نشود: اگر enableCellCopy فعال باشد، قابل کپی است
مثال:
TypeScript

{ key: "email", label: "ایمیل", copyable: true }
DynamicTableProps<T>
این اینترفیس مربوط به کل جدول است.

endpoint
TypeScript

endpoint: string;
آدرس API برای fetch داده‌ها با SWR.

مثال:
TypeScript

endpoint="/api/users"
نکته مهم:
اگر از data استفاده کنی، این مقدار عملاً استفاده نمی‌شود.
در آن حالت معمولاً می‌توانی این را خالی بگذاری:

TypeScript

endpoint=""
columns
TypeScript

columns: ColumnDef<T>[];
لیست ستون‌های جدول.

مثال:
TypeScript

columns={userColumns}
title
TypeScript

title?: string;
عنوان بالای جدول.

subtitle
TypeScript

subtitle?: string;
زیرعنوان بالای جدول.

CRUD Handlers
اگر این‌ها را ندهی، جدول از CRUD داخلی خودش استفاده می‌کند و به endpoint درخواست می‌زند.
اگر data استاتیک می‌دهی، بهتر است این‌ها را خودت پیاده‌سازی کنی.

onCreate
TypeScript

onCreate?: (
  item: Partial<T>,
  builtInCreate: (item: Partial<T>) => Promise<T | void>,
) => Promise<void> | void;
برای ساخت رکورد جدید.

پارامترها:
item: داده فرم
builtInCreate: تابع داخلی جدول برای POST + mutate
دو حالت استفاده:
1. استفاده از تابع داخلی:
TypeScript

onCreate={async (item, builtInCreate) => {
  await builtInCreate(item);
}}
2. مدیریت دستی:
TypeScript

onCreate={async (item) => {
  setUsers(prev => [...prev, newUser]);
}}
onUpdate
TypeScript

onUpdate?: (
  item: T,
  builtInUpdate: (item: T) => Promise<T | void>,
) => Promise<void> | void;
برای ویرایش رکورد.

پارامترها:
item: رکورد کامل بعد از ویرایش
builtInUpdate: تابع داخلی PUT + mutate
onDelete
TypeScript

onDelete?: (
  item: T,
  builtInRemove: (item: T) => Promise<void>,
) => Promise<void> | void;
برای حذف رکورد.

پارامترها:
item: رکورد انتخاب‌شده
builtInRemove: تابع داخلی DELETE + mutate
Permissions
canCreate
TypeScript

canCreate?: boolean;
آیا دکمه «افزودن» نمایش داده شود؟

پیش‌فرض:
TypeScript

true
canUpdate
TypeScript

canUpdate?: boolean;
آیا دکمه ویرایش نمایش داده شود؟

پیش‌فرض:
TypeScript

true
canDelete
TypeScript

canDelete?: boolean;
آیا دکمه حذف نمایش داده شود؟

پیش‌فرض:
TypeScript

true
Row Identity
primaryKey
TypeScript

primaryKey?: keyof T & string;
نام کلیدی که یکتا بودن هر ردیف را مشخص می‌کند.

پیش‌فرض:
TypeScript

"id"
مثال:
TypeScript

primaryKey="userId"
Pagination
pageSize
TypeScript

pageSize?: number;
تعداد اولیه ردیف در هر صفحه.

پیش‌فرض:
TypeScript

10
pageSizes
TypeScript

pageSizes?: number[];
گزینه‌های selector تعداد ردیف در هر صفحه.

پیش‌فرض:
TypeScript

[10, 25, 50, 100]
مثال:
TypeScript

pageSizes={[5, 10, 20]}
Search
searchable
TypeScript

searchable?: boolean;
آیا باکس جستجو نمایش داده شود؟

پیش‌فرض:
TypeScript

true
searchDebounceMs
TypeScript

searchDebounceMs?: number;
تاخیر debounce جستجو بر حسب میلی‌ثانیه.

پیش‌فرض:
TypeScript

300
مثال:
TypeScript

searchDebounceMs={500}
Table UI
emptyMessage
TypeScript

emptyMessage?: string;
متنی که وقتی داده‌ای وجود ندارد نمایش داده می‌شود.

پیش‌فرض:
TypeScript

"داده‌ای یافت نشد"
rowActions
TypeScript

rowActions?: (row: T) => ReactNode;
برای اضافه کردن اکشن‌های سفارشی به هر ردیف.

کاربرد:
دکمه پاور
قفل / آنلاک
ارسال ایمیل
reset password
approve / reject
مشاهده پروفایل
مثال:
React

rowActions={(row) => (
  <button onClick={() => toggleUser(row)}>Power</button>
)}
نکته:
اگر داخل این دکمه‌ها کلیک داری و doubleClickToEdit روشن است، بهتر است:

React

e.stopPropagation()
بزنی.

exportable
TypeScript

exportable?: boolean;
آیا منوی خروجی گرفتن نمایش داده شود؟

فرمت‌ها:
Excel
CSV
PNG
پیش‌فرض:
TypeScript

true
exportFileName
TypeScript

exportFileName?: string;
نام فایل خروجی.

پیش‌فرض:
TypeScript

"export"
Extra UX Features
stickyHeader
TypeScript

stickyHeader?: boolean;
اگر true باشد، هدر جدول هنگام اسکرول بالا ثابت می‌ماند.

پیش‌فرض:
TypeScript

true
showRowNumbers
TypeScript

showRowNumbers?: boolean;
اگر true باشد، ستون شماره ردیف نمایش داده می‌شود.

پیش‌فرض:
TypeScript

false
doubleClickToEdit
TypeScript

doubleClickToEdit?: boolean;
اگر true باشد، دابل‌کلیک روی ردیف مودال ویرایش را باز می‌کند.

پیش‌فرض:
TypeScript

true
enableCellCopy
TypeScript

enableCellCopy?: boolean;
اگر true باشد، کلیک روی سلول مقدار آن را کپی می‌کند.

پیش‌فرض:
TypeScript

true
نکته:
فقط برای ستون‌هایی کار می‌کند که:

TypeScript

copyable !== false
pullToRefresh
TypeScript

pullToRefresh?: boolean;
اگر true باشد، در موبایل با کشیدن به پایین، جدول refresh می‌شود.

پیش‌فرض:
TypeScript

true
نکته:
فقط وقتی fetching فعال باشد کاربرد دارد.
اگر data استاتیک بدهی، این قابلیت عملاً کاری نمی‌کند مگر خودت mutate/state را هندل کنی.

Server-Side Mode
serverSide
TypeScript

serverSide?: boolean;
اگر true باشد، صفحه‌بندی/جستجو/مرتب‌سازی سمت سرور انجام می‌شود.

پیش‌فرض:
TypeScript

false
تفاوت:
false: همه داده‌ها یکجا لود می‌شوند و فیلترها سمت کلاینت انجام می‌شود
true: با هر تغییر page/search/sort درخواست جدید به API زده می‌شود
transformPaginatedResponse
TypeScript

transformPaginatedResponse?: (raw: unknown) => ServerPaginatedResponse<T>;
وقتی serverSide=true است، این تابع پاسخ API را به ساختار قابل فهم برای جدول تبدیل می‌کند.

جدول انتظار دارد چیزی شبیه این دریافت کند:
TypeScript

{
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
مثال:
TypeScript

transformPaginatedResponse={(raw: any) => ({
  data: raw.items,
  total: raw.total,
  page: raw.page,
  pageSize: raw.perPage,
  totalPages: raw.lastPage,
})}
Fetching Customization
fetcher
TypeScript

fetcher?: (url: string) => Promise<T[]>;
اگر بخواهی fetch را خودت کنترل کنی، این را می‌دهی.

کاربرد:
axios
custom auth
special parsing
interceptors
transformResponse
TypeScript

transformResponse?: (raw: unknown) => T[];
اگر API شما مستقیم آرایه برنمی‌گرداند، با این تابع تبدیلش می‌کنی.

مثال:
TypeScript

transformResponse={(raw: any) => raw.data.users}
headers
TypeScript

headers?: Record<string, string>;
هدرهای HTTP برای درخواست‌ها.

مثال:
TypeScript

headers={{
  Authorization: `Bearer ${token}`,
}}
swrConfig
TypeScript

swrConfig?: SWRConfiguration<T[]>;
تنظیمات SWR.

کاربرد:
revalidateOnFocus
refreshInterval
dedupingInterval
...
مثال:
TypeScript

swrConfig={{
  revalidateOnFocus: false,
  dedupingInterval: 10000,
}}
enabled
TypeScript

enabled?: boolean;
اگر false باشد، fetching غیرفعال می‌شود.

پیش‌فرض:
TypeScript

true
کاربرد:
تا آماده شدن token
تا آماده شدن پارامترها
وقتی data استاتیک می‌دهی
مثال:
TypeScript

enabled={false}
onError
TypeScript

onError?: (error: Error) => void;
اگر fetch خطا بدهد، این callback اجرا می‌شود.

کاربرد:
toast
logger
retry action
redirect
مثال:
TypeScript

onError={(error) => {
  console.error(error);
}}
data
TypeScript

data?: T[];
اگر بخواهی جدول از داده استاتیک یا local state بخواند، این را می‌دهی.

رفتار:
اگر data موجود باشد، جدول به جای fetchedData از آن استفاده می‌کند
معمولاً در این حالت:
TypeScript

enabled={false}
endpoint=""
می‌گذاری

کاربرد:
mock data
local state
وقتی API نداری
داده‌ای که از قبل جای دیگری fetch شده
پراپس‌هایی که بیشتر با هم استفاده می‌شوند
حالت ۱: جدول با API
React

<DynamicTable
  endpoint="/api/users"
  columns={columns}
/>
حالت ۲: جدول با data استاتیک
React

<DynamicTable
  endpoint=""
  data={users}
  enabled={false}
  columns={columns}
  onCreate={...}
  onUpdate={...}
  onDelete={...}
/>
حالت ۳: سرور-ساید
React

<DynamicTable
  endpoint="/api/users"
  serverSide
  transformPaginatedResponse={(raw) => ...}
  columns={columns}
/>
خلاصه خیلی کوتاه
ستون‌ها (ColumnDef)
key → از کدام فیلد بخواند
label → عنوان ستون
render → نمایش سفارشی
editable/viewable/visible → در فرم/مودال/جدول نمایش داده شود یا نه
inputType/options/placeholder/required → رفتار فیلد فرم
sortable/filterable/dateFilter → امکانات مرتب‌سازی و فیلتر
hideOnMobile/copyable → رفتار موبایل و کپی
خود جدول (DynamicTableProps)
endpoint → API
data → داده استاتیک
onCreate/onUpdate/onDelete → عملیات CRUD
canCreate/canUpdate/canDelete → فعال/غیرفعال کردن CRUD
pageSize/pageSizes/searchable/searchDebounceMs → صفحه‌بندی و جستجو
stickyHeader/showRowNumbers/doubleClickToEdit/enableCellCopy/pullToRefresh → UX
serverSide/transformPaginatedResponse → حالت سرور-ساید
headers/fetcher/transformResponse/swrConfig/enabled → کنترل fetching
rowActions → اکشن‌های سفارشی هر ردیف

/**
 * Defines a single table column.
 *
 * Use this interface to control how each field is displayed, edited,
 * filtered, sorted, and rendered inside the table.
 */
export interface ColumnDef<T> {
  /**
   * The key of the field in the row object.
   *
   * This tells the table which property from each row should be used
   * for this column.
   *
   * @example
   * key: "name"
   */
  key: keyof T & string;

  /**
   * The column header label shown in the table.
   *
   * @example
   * label: "User Name"
   */
  label: string;

  /**
   * Optional custom renderer for the cell.
   *
   * If provided, this function receives the raw field value and the full row,
   * and should return any ReactNode.
   *
   * Useful for:
   * - badges
   * - icons
   * - formatted values
   * - custom layouts
   *
   * @example
   * render: (value) => <StatusBadge status={String(value)} />
   */
  render?: (value: T[keyof T], row: T) => ReactNode;

  /**
   * Controls whether this column is visible in the table.
   *
   * If false, the column is completely hidden.
   *
   * @default true
   */
  visible?: boolean;

  /**
   * Controls whether this field should appear in create/edit forms.
   *
   * If false, this field is excluded from the form.
   *
   * @default true
   */
  editable?: boolean;

  /**
   * Controls whether this field should appear in the "view details" modal.
   *
   * If false, the field is hidden from the details modal.
   *
   * @default true
   */
  viewable?: boolean;

  /**
   * Input type used in the create/edit form.
   *
   * Common values:
   * - "text"
   * - "email"
   * - "number"
   * - "tel"
   * - "textarea"
   * - "checkbox"
   * - "date"
   *
   * If set to "date", a Jalali date picker will be used.
   */
  inputType?: string;

  /**
   * Controls whether the column can be sorted by clicking its header.
   *
   * @default true
   */
  sortable?: boolean;

  /**
   * Placeholder text shown in create/edit form inputs.
   */
  placeholder?: string;

  /**
   * Marks this field as the primary field of the record.
   *
   * Usually used for ID fields.
   * Primary fields are excluded from the create/edit form.
   */
  isPrimary?: boolean;

  /**
   * If true, hides this column in the mobile card layout.
   *
   * Useful for less important fields like:
   * - IDs
   * - internal codes
   * - timestamps
   */
  hideOnMobile?: boolean;

  /**
   * Marks this field as required in the create/edit form.
   *
   * If the field is empty, validation will fail.
   */
  required?: boolean;

  /**
   * Optional list of selectable values for the field.
   *
   * If provided, the form input will be rendered as a select dropdown
   * instead of a plain input.
   *
   * @example
   * options: [
   *   { label: "Admin", value: "admin" },
   *   { label: "User", value: "user" }
   * ]
   */
  options?: { label: string; value: string }[];

  /**
   * Enables a dropdown filter for this column in the table toolbar.
   *
   * Filter options are automatically derived from the existing data.
   */
  filterable?: boolean;

  /**
   * Enables a Jalali date range filter for this column.
   *
   * Also causes create/edit forms to use a Jalali date picker
   * when appropriate.
   */
  dateFilter?: boolean;

  /**
   * Controls whether values in this column can be copied by clicking the cell.
   *
   * This only works when `enableCellCopy` is enabled on the table.
   *
   * @default true
   */
  copyable?: boolean;
}

/**
 * Props for the DynamicTable component.
 *
 * This table supports:
 * - static data or SWR-based fetching
 * - create / update / delete
 * - client-side or server-side pagination
 * - filtering, sorting, searching
 * - export
 * - mobile support
 * - copy-to-clipboard
 * - pull-to-refresh
 */
export interface DynamicTableProps<T extends Record<string, unknown>> {
  /**
   * API endpoint used for SWR fetching and built-in CRUD requests.
   *
   * If you use `data` instead of fetching, this can be an empty string
   * and is effectively ignored.
   *
   * @example
   * endpoint: "/api/users"
   */
  endpoint: string;

  /**
   * Column definitions for the table.
   */
  columns: ColumnDef<T>[];

  /**
   * Optional title shown above the table.
   */
  title?: string;

  /**
   * Optional subtitle shown under the title.
   */
  subtitle?: string;

  /**
   * Optional custom create handler.
   *
   * Receives:
   * - `item`: the form values
   * - `builtInCreate`: the table's internal create function
   *
   * You can:
   * - call `builtInCreate(item)` to use built-in POST + mutate
   * - ignore it and manage local state manually
   */
  onCreate?: (
    item: Partial<T>,
    builtInCreate: (item: Partial<T>) => Promise<T | void>,
  ) => Promise<void> | void;

  /**
   * Optional custom update handler.
   *
   * Receives:
   * - `item`: the updated row
   * - `builtInUpdate`: the table's internal update function
   *
   * You can:
   * - call `builtInUpdate(item)` to use built-in PUT + mutate
   * - ignore it and manage local state manually
   */
  onUpdate?: (
    item: T,
    builtInUpdate: (item: T) => Promise<T | void>,
  ) => Promise<void> | void;

  /**
   * Optional custom delete handler.
   *
   * Receives:
   * - `item`: the row being deleted
   * - `builtInRemove`: the table's internal delete function
   *
   * You can:
   * - call `builtInRemove(item)` to use built-in DELETE + mutate
   * - ignore it and manage local state manually
   */
  onDelete?: (
    item: T,
    builtInRemove: (item: T) => Promise<void>,
  ) => Promise<void> | void;

  /**
   * Controls whether the "create" button is shown.
   *
   * @default true
   */
  canCreate?: boolean;

  /**
   * Controls whether edit actions are shown.
   *
   * @default true
   */
  canUpdate?: boolean;

  /**
   * Controls whether delete actions are shown.
   *
   * @default true
   */
  canDelete?: boolean;

  /**
   * The field used as the unique row identifier.
   *
   * @default "id"
   *
   * @example
   * primaryKey: "userId"
   */
  primaryKey?: keyof T & string;

  /**
   * Initial number of rows shown per page.
   *
   * @default 10
   */
  pageSize?: number;

  /**
   * Available options for the page-size selector.
   *
   * @default [10, 25, 50, 100]
   */
  pageSizes?: number[];

  /**
   * Controls whether the search input is shown.
   *
   * @default true
   */
  searchable?: boolean;

  /**
   * Debounce delay for the search input in milliseconds.
   *
   * @default 300
   */
  searchDebounceMs?: number;

  /**
   * Message shown when there are no rows to display.
   *
   * @default "داده‌ای یافت نشد"
   */
  emptyMessage?: string;

  /**
   * Optional custom action renderer for each row.
   *
   * Useful for adding extra buttons like:
   * - power toggle
   * - lock / unlock
   * - send email
   * - reset password
   * - approve / reject
   *
   * @example
   * rowActions={(row) => (
   *   <button onClick={() => toggleUser(row)}>Power</button>
   * )}
   */
  rowActions?: (row: T) => ReactNode;

  /**
   * Controls whether the export menu is shown.
   *
   * Supports:
   * - Excel
   * - CSV
   * - PNG
   *
   * @default true
   */
  exportable?: boolean;

  /**
   * Base file name used for exported files.
   *
   * @default "export"
   */
  exportFileName?: string;

  /**
   * Enables sticky header behavior while scrolling.
   *
   * @default true
   */
  stickyHeader?: boolean;

  /**
   * Shows a row-number column.
   *
   * @default false
   */
  showRowNumbers?: boolean;

  /**
   * Enables double-click on a row to open the edit modal.
   *
   * @default true
   */
  doubleClickToEdit?: boolean;

  /**
   * Enables click-to-copy behavior for table cells.
   *
   * This works together with each column's `copyable` flag.
   *
   * @default true
   */
  enableCellCopy?: boolean;

  /**
   * Enables pull-to-refresh on mobile devices.
   *
   * Only useful when the table is actually fetching data.
   *
   * @default true
   */
  pullToRefresh?: boolean;

  /**
   * Enables server-side pagination / search / sorting mode.
   *
   * When enabled, the table sends page/search/sort/filter params
   * to the API instead of processing everything client-side.
   *
   * @default false
   */
  serverSide?: boolean;

  /**
   * Transforms raw paginated API response into the table's expected format.
   *
   * Required when `serverSide` is true if your API response shape
   * does not already match the expected structure.
   *
   * Expected shape:
   * {
   *   data: T[];
   *   total: number;
   *   page: number;
   *   pageSize: number;
   *   totalPages: number;
   * }
   */
  transformPaginatedResponse?: (raw: unknown) => ServerPaginatedResponse<T>;

  /**
   * Optional custom fetcher function.
   *
   * Use this if you want to replace the default `fetch` behavior,
   * for example with axios or a custom API client.
   */
  fetcher?: (url: string) => Promise<T[]>;

  /**
   * Optional transformer for normal (non-paginated) API responses.
   *
   * Useful when the API does not return a plain array.
   *
   * @example
   * transformResponse={(raw: any) => raw.data.users}
   */
  transformResponse?: (raw: unknown) => T[];

  /**
   * Optional HTTP headers passed to fetch requests.
   *
   * Commonly used for authentication.
   *
   * @example
   * headers={{ Authorization: `Bearer ${token}` }}
   */
  headers?: Record<string, string>;

  /**
   * Optional SWR configuration.
   *
   * Useful for controlling:
   * - revalidateOnFocus
   * - refreshInterval
   * - dedupingInterval
   * - retry behavior
   */
  swrConfig?: SWRConfiguration<T[]>;

  /**
   * Enables or disables fetching.
   *
   * Set to false when:
   * - using static `data`
   * - waiting for required params/token
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Optional callback fired when fetching fails.
   *
   * Useful for:
   * - toast notifications
   * - logging
   * - retry flows
   */
  onError?: (error: Error) => void;

  /**
   * Optional static data source for the table.
   *
   * If provided, the table uses this data instead of fetched data.
   *
   * Common use cases:
   * - local state
   * - mock data
   * - preloaded data
   * - no API available yet
   *
   * When using this, you usually also set:
   * - `enabled={false}`
   * - `endpoint=""`
   */
  data?: T[];
}
```
