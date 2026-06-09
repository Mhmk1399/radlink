معماری کلی سیستم
text

┌─────────────────────────────────────────────────────────┐
│ PageBuilder.tsx │
│ (🧠 مغز اصلی - Orchestrator) │
│ │
│ ┌─────────────┐ ┌──────────────┐ ┌────────────────┐ │
│ │ State │ │ Handlers │ │ DnD Logic │ │
│ │ Management │ │ & CRUD │ │ & Sensors │ │
│ └──────┬───────┘ └──────┬───────┘ └───────┬────────┘ │
│ │ │ │ │
│ ▼ ▼ ▼ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Props Distribution │ │
│ └─────┬──────┬──────┬──────┬──────┬──────┬──────┬────┘ │
└────────┼──────┼──────┼──────┼──────┼──────┼──────┼───────┘
│ │ │ │ │ │ │
▼ ▼ ▼ ▼ ▼ ▼ ▼
Header Sidebar Canvas Modals Overlays Panel Preview
📁 ساختار فایل‌ها
text

builder/
│
├── builder.helpers.ts ← توابع کمکی و ثابت‌ها
│
├── hooks/
│ └── useBuilderHooks.ts ← هوک‌های سفارشی
│
├── components/
│ ├── BuilderHeader.tsx ← نوار بالای صفحه
│ ├── BuilderSidebar.tsx ← سایدبار سمت راست
│ ├── BuilderCanvas.tsx ← بوم اصلی صفحه‌ساز
│ ├── BuilderModals.tsx ← مدال‌های پاپ‌آپ
│ └── BuilderOverlays.tsx ← اورلی‌ها و اعلان‌ها
│
├── PageBuilder.tsx ← کامپوننت اصلی (مغز)
└── PhoneLivePreview.tsx ← پیش‌نمایش موبایل (خارجی)
🔵 فایل ۱: builder.helpers.ts
🎯 وظیفه
این فایل هیچ کامپوننتی ندارد. فقط شامل توابع خالص (Pure Functions)، ثابت‌ها و تایپ‌هایی است که در سراسر پروژه استفاده می‌شوند.

📋 محتویات
text

builder.helpers.ts
│
├── Types
│ └── Breakpoint = "mobile" | "tablet" | "desktop"
│
├── Constants
│ ├── STORAGE_KEY = "page-builder-blocks"
│ └── MAX_SUGGESTED_BLOCKS = 12
│
├── Style Helpers
│ ├── normalizeStyleValue() ← مقدار استایل رو نرمال میکنه
│ └── updateResponsiveValue() ← مقدار ریسپانسیو آپدیت میکنه
│
├── Block Helpers
│ ├── normalizeOrder() ← ترتیب بلاک‌ها رو اصلاح میکنه
│ ├── cloneBlock() ← یه بلاک رو کپی میکنه
│ └── createInitialBuilderState()← وضعیت اولیه رو میسازه
│
├── Storage
│ ├── saveToStorage() ← ذخیره در localStorage
│ └── loadFromStorage() ← خواندن از localStorage
│
└── Utility
└── slugify() ← تبدیل متن به slug آدرس
🔍 جزئیات هر تابع
تابع ورودی خروجی کاربرد
normalizeStyleValue (styleKey, value) string | number | AnimationType وقتی کاربر عدد وارد میکنه، مطمئن میشه مقدار معتبره. مثلاً fontSize: "16px" → 16
updateResponsiveValue (current, breakpoint, value) ResponsiveValue<T> مقدار یه بریکپوینت خاص رو آپدیت میکنه بدون تغییر بقیه
normalizeOrder (blocks[]) PageBlock[] بعد از هر تغییر ترتیب، order هر بلاک رو از ۰ شماره‌گذاری مجدد میکنه
cloneBlock (block) PageBlock یه کپی عمیق با instanceId جدید میسازه
createInitialBuilderState () {blocks, selectedBlockId, selectedElementId} وضعیت اولیه با یک بلاک بنر
saveToStorage (blocks[]) void JSON سریالایز شده بلاک‌ها رو در localStorage ذخیره میکنه
loadFromStorage () PageBlock[] | null بلاک‌ها رو از localStorage میخونه، اگه خراب بود null
slugify (string) string متن فارسی/انگلیسی رو به فرمت URL-safe تبدیل میکنه
🔵 فایل ۲: hooks/useBuilderHooks.ts
🎯 وظیفه
سه هوک سفارشی که لاجیک‌های مستقل و قابل تست رو کپسوله کردن.

📋 هوک‌ها
text

useBuilderHooks.ts
│
├── useToast() ← سیستم اعلان‌ها
├── useHistory<T>() ← Undo/Redo
└── useOnboarding() ← راهنمای اولین بازدید
🍞 useToast()
text

┌──────────────┐
│ useToast │
├──────────────┤
│ │
│ State: │
│ • toasts[] │◄── آرایه‌ای از اعلان‌های فعال
│ │
│ Methods: │
│ • show() │◄── نمایش اعلان جدید (پس از 3.5 ثانیه خودکار حذف)
│ • dismiss() │◄── حذف دستی یک اعلان
│ │
│ Returns: │
│ { toasts, │
│ show, │
│ dismiss } │
└──────────────┘
نوع اعلان‌ها:

Type رنگ آیکون کاربرد
success سبز ✓ عملیات موفق
error قرمز ✕ خطا
info آبی ? اطلاع‌رسانی
جریان کار:

text

show("بلاک اضافه شد", "success")
│
▼
تولید ID یکتا با Date.now() + Math.random()
│
▼
اضافه به آرایه toasts
│
▼
setTimeout 3500ms
│
▼
حذف خودکار از آرایه
⏪ useHistory<T>(initial, maxSize?)
text

┌─────────────────────────────────────────┐
│ useHistory │
├─────────────────────────────────────────┤
│ │
│ ┌──────┐ ┌─────────┐ ┌──────────┐ │
│ │ past │◄──│ present │──►│ future │ │
│ │ T[] │ │ T │ │ T[] │ │
│ └──────┘ └─────────┘ └──────────┘ │
│ │
│ push(new) → past ← present │
│ present = new │
│ future = [] │
│ │
│ undo() → future ← present │
│ present = past.pop() │
│ │
│ redo() → past ← present │
│ present = future.shift() │
│ │
│ skipRecordRef: وقتی undo/redo میکنیم │
│ push بعدی رو record نمیکنه │
│ │
│ Returns: { │
│ state, ← مقدار فعلی │
│ set, ← تغییر + ثبت تاریخچه │
│ undo, ← برگشت │
│ redo, ← بعدی │
│ canUndo, ← آیا میشه undo کرد؟ │
│ canRedo, ← آیا میشه redo کرد؟ │
│ historySize ← اندازه تاریخچه │
│ } │
└─────────────────────────────────────────┘
مثال عملی:

text

State: [بلاک۱]
│
▼ push([بلاک۱, بلاک۲])
past: [[بلاک۱]]
present: [بلاک۱, بلاک۲]
future: []
│
▼ push([بلاک۱, بلاک۲, بلاک۳])
past: [[بلاک۱], [بلاک۱, بلاک۲]]
present: [بلاک۱, بلاک۲, بلاک۳]
future: []
│
▼ undo()
past: [[بلاک۱]]
present: [بلاک۱, بلاک۲]
future: [[بلاک۱, بلاک۲, بلاک۳]]
🎓 useOnboarding()
text

┌──────────────────┐
│ useOnboarding │
├──────────────────┤
│ │
│ step: number │ -1 = غیرفعال
│ │ 0 = مرحله اول
│ │ 1 = مرحله دوم
│ │ 2 = مرحله سوم
│ │
│ next() │ رفتن به مرحله بعد
│ skip() │ رد کردن کامل
│ isActive │ آیا نمایش داده بشه؟
│ │
│ localStorage: │
│ "builder-onboarding-done"
└──────────────────┘
جریان:

text

اولین بازدید
│
▼
localStorage خالیه → step = 0
│
▼
مرحله ۱: "خوش اومدی!"
│ next()
▼
مرحله ۲: "بلاک‌ها"
│ next()
▼
مرحله ۳: "ویرایش"
│ next()
▼
localStorage = "true" → step = -1 (پایان)
🔵 فایل ۳: components/BuilderOverlays.tsx
🎯 وظیفه
کامپوننت‌هایی که روی محتوای اصلی رندر میشن (پورتال به document.body یا floating UI)

📋 کامپوننت‌ها
text

BuilderOverlays.tsx
│
├── ToastContainer ← ظرف اعلان‌ها
├── ShortcutsHint ← نوار میانبرهای کیبورد
├── OnboardingOverlay ← راهنمای قدم‌به‌قدم
├── UnifiedDragOverlay ← نمایش بلاک هنگام درگ (ری‌اوردر)
├── PaletteDragOverlay ← نمایش بلاک هنگام درگ (از پالت)
├── BlockCountBadge ← نشانگر تعداد بلاک‌ها
└── SaveIndicator ← وضعیت ذخیره‌سازی
🔍 Props هر کامپوننت
ToastContainer
TypeScript

{
toasts: ToastItem[] ← آرایه اعلان‌ها از useToast
onDismiss: (id) => void ← حذف اعلان با کلیک ✕
}
رندر: پورتال به document.body، پایین‌وسط صفحه، با انیمیشن slide-up

ShortcutsHint
TypeScript

{
visible: boolean ← نمایش/مخفی (با کلید ?)
}
نمایش: فقط دسکتاپ (md:flex)، پایین‌وسط صفحه

میانبرهای ثبت‌شده:

text

Ctrl+Z → برگشت
Ctrl+Y → بعدی
Ctrl+D → کپی بلاک
Del → حذف
Ctrl+S → ذخیره
OnboardingOverlay
TypeScript

{
step: number ← شماره مرحله (0-2)
onNext: () => void ← رفتن به مرحله بعد
onSkip: () => void ← رد کردن
}
رندر: پورتال، overlay تمام‌صفحه با backdrop blur

UnifiedDragOverlay
TypeScript

{
block: PageBlock ← بلاکی که داره درگ میشه
}
نمایش: کارت سبز با آیکون و نام بلاک + متن «رها کن برای جابه‌جایی»

PaletteDragOverlay
TypeScript

{
blockType: string ← نوع بلاک از پالت
}
نمایش: مشابه بالا ولی با متن «بنداز توی صفحه! 🎯» و آیکون پالس‌دار

BlockCountBadge
TypeScript

{
count: number ← تعداد بلاک‌های فعلی
}
نمایش: نوار پیشرفت + عدد مثل 4/12

SaveIndicator
TypeScript

{
saved: boolean ← آیا ذخیره شده؟
}
نمایش:

text

saved=true → 🟢 "ذخیره شد"
saved=false → 🟡 "ذخیره..." + اسپینر
🔵 فایل ۴: components/BuilderModals.tsx
🎯 وظیفه
سه مدال تمام‌صفحه که با پورتال رندر میشن.

📋 کامپوننت‌ها
text

BuilderModals.tsx
│
├── ClearAllConfirmModal ← تأیید حذف همه بلاک‌ها
├── BlockCatalogModal ← کاتالوگ انتخاب بلاک جدید
└── PageMetaModal ← فرم اطلاعات صفحه (عنوان، آدرس، توضیح)
🔍 Props هر کامپوننت
ClearAllConfirmModal
TypeScript

{
open: boolean ← باز/بسته
blocksCount: number ← تعداد بلاک‌ها (نمایشی)
onCancel: () => void ← بستن مدال
onConfirm: () => void ← تأیید حذف
}
رفتار:

text

open=true
│
▼
┌─────────────────────────┐
│ 🗑️ حذف همه بلاک‌ها؟ │
│ │
│ همه 5 بلاک حذف │
│ می‌شوند. │
│ │
│ [انصراف] [حذف همه] │
└─────────────────────────┘
│ │
▼ ▼
onCancel() onConfirm()
ویژگی‌ها:

Escape → بسته میشه
کلیک روی backdrop → بسته میشه
document.body.overflow = "hidden" هنگام باز بودن
BlockCatalogModal
TypeScript

{
open: boolean ← باز/بسته
onClose: () => void ← بستن
onAdd: (type: string) => void ← افزودن بلاک با تایپ مشخص
}
جریان:

text

open=true
│
▼
┌──────────────────────────────┐
│ افزودن بلاک │
│ 12 بلاک موجود │
│ │
│ [🔍 جستجوی بلاک...] │
│ │
│ ┌─────────────────────────┐ │
│ │ 🖼️ بنر │ │ ← کلیک → onAdd("banner")
│ │ 📝 متن │ │ ← کلیک → onAdd("text")
│ │ 🎨 گالری │ │ ← کلیک → onAdd("gallery")
│ │ ... │ │
│ └─────────────────────────┘ │
└──────────────────────────────┘
ویژگی‌ها:

جستجوی real-time بر اساس label, description, type
اتوفوکوس روی فیلد جستجو
حالت empty state وقتی نتیجه‌ای نیست
PageMetaModal
TypeScript

{
open: boolean
title: string ← عنوان صفحه
description: string ← توضیح صفحه
url: string ← slug آدرس
pageId: string | null ← اگه وجود داره = ویرایش، null = ساخت جدید
onTitleChange: (v) => void
onDescriptionChange: (v) => void
onUrlChange: (v) => void
onClose: () => void
onSave: () => void ← ذخیره در سرور
isSaving: boolean ← در حال ذخیره
saveError: string | null ← خطای سرور
}
جریان ذخیره:

text

کاربر فیلدها رو پر میکنه
│
▼
کلیک "ساخت صفحه" / "ذخیره تغییرات"
│
▼
onSave() → PageBuilder.handleMetaSave()
│
▼
pageId وجود داره؟
│
├── بله → PATCH /api/pages/:id
└── خیر → POST /api/pages
│
▼
موفق → toast + بسته شدن مدال
خطا → نمایش saveError
🔵 فایل ۵: components/BuilderSidebar.tsx
🎯 وظیفه
سایدبار سمت راست با دو تب: پالت بلاک‌ها و لایه‌های صفحه.

📋 ساختار
text

BuilderSidebar.tsx
│
├── SidebarPaletteDraggableItem ← آیتم قابل درگ از پالت (private)
├── SidebarSortableItem ← آیتم قابل مرتب‌سازی (private)
└── BlocksSidebar ← کامپوننت اصلی (export)
🔍 Props اصلی: BlocksSidebar
TypeScript

{
blocks: PageBlock[] ← بلاک‌های مرتب‌شده
selectedBlockId: string | null ← بلاک انتخاب‌شده
onSelectBlock: (id) => void ← انتخاب بلاک
onDeleteBlock: (id) => void ← حذف بلاک
onDuplicateBlock: (id) => void ← کپی بلاک
onAddBlock: () => void ← باز کردن کاتالوگ
collapsed: boolean ← حالت جمع‌شده
onToggleCollapse: () => void ← تغییر حالت
}
📐 حالت‌های نمایش
text

┌─────────── حالت باز (w-300px) ─────────────┐
│ │
│ [□ بلاک‌ها] [◄ بستن] │
│ │
│ ┌──────────────────────────────────────┐ │
│ │ [+ بلاک‌ها 12] [▦ صفحه 3] │ │ ← تب‌ها
│ └──────────────────────────────────────┘ │
│ │
│ ═══ تب پالت ═══ │
│ [🔍 جستجو...] │
│ [✨ بکش و بنداز] │
│ ┌────────────────────┐ │
│ │ 🖼️ بنر ⠿ │ ← draggable │
│ │ 📝 متن ⠿ │ │
│ │ 🎨 گالری ⠿ │ │
│ └────────────────────┘ │
│ │
│ ═══ تب لایه‌ها ═══ │
│ [💡 ترتیب عوض کن] │
│ ┌────────────────────┐ │
│ │ ⠿ 🖼️ بنر [📋][🗑️] │ ← sortable │
│ │ ⠿ 📝 متن [📋][🗑️] │ │
│ └────────────────────┘ │
│ [+ افزودن بلاک جدید] │
└──────────────────────────────────────────────┘

┌── حالت جمع (w-56px) ──┐
│ │
│ [►] │ ← باز کردن
│ │
│ [🖼️] │ ← آیکون بلاک‌ها
│ [📝] │
│ [🎨] │
│ │
│ [+] │ ← افزودن
└─────────────────────────┘
🔗 ارتباط DnD
text

SidebarPaletteDraggableItem
│
│ useDraggable({
│ id: "palette-banner",
│ data: { fromPalette: true, blockType: "banner" }
│ })
│
▼ درگ شروع میشه
│
▼ PageBuilder.handleDragStart()
│ → activePaletteType = "banner"
│
▼ درگ روی کنواس
│
▼ PageBuilder.handleDragEnd()
→ addBlock("banner")

SidebarSortableItem
│
│ useSortable({
│ id: block.instanceId
│ })
│
▼ درگ با دستگیره (activator)
│
▼ PageBuilder.handleDragEnd()
→ arrayMove() + normalizeOrder()
📌 Sticky Behavior
CSS

sticky top-[73px] ← زیر هدر ثابت میمونه
h-[calc(100dvh-73px)] ← ارتفاع = کل صفحه منهای هدر
overflow-y-auto ← اسکرول داخلی مستقل
🔵 فایل ۶: components/BuilderCanvas.tsx
🎯 وظیفه
بوم اصلی صفحه‌ساز: نمایش بلاک‌ها، دراپ‌زون، اکشن‌های سریع و breadcrumb

📋 کامپوننت‌ها
text

BuilderCanvas.tsx
│
├── BlockQuickActions ← دکمه‌های عملیات روی هاور بلاک
├── SelectionBreadcrumb ← مسیر انتخاب: صفحه / بنر / عنوان
├── CanvasDropZone ← ناحیه دراپ برای بلاک‌های پالت
└── CanvasContent ← محتوای اصلی کنواس (export)
🔍 Props هر کامپوننت
BlockQuickActions
TypeScript

{
block: PageBlock ← بلاک مربوطه
totalBlocks: number ← تعداد کل (برای غیرفعال‌سازی ↑↓)
onMoveUp: () => void
onMoveDown: () => void
onDuplicate: () => void
onDelete: () => void
}
نمایش:

text

          opacity-0 (عادی)
               │
               ▼  group-hover/block
          opacity-100
    ┌────────────────────────┐
    │  [↑] [↓]  │  [📋] [🗑️]  │   ← بالای بلاک، وسط
    └────────────────────────┘

SelectionBreadcrumb
TypeScript

{
blockLabel: string | null ← نام بلاک انتخاب‌شده
elementLabel: string | null ← نام المان انتخاب‌شده
onClickBlock: () => void ← کلیک روی نام بلاک
onClickPage: () => void ← کلیک روی "صفحه"
}
نمایش:

text

اگه بلاکی انتخاب نشده → null (نمایش نمیده)

اگه بلاک انتخاب شده:
صفحه / بنر

اگه المان هم انتخاب شده:
صفحه / بنر / عنوان
CanvasDropZone
TypeScript

{
children: ReactNode
isOverCanvas: boolean ← آیا درگ از پالت روی کنواسه؟
hasBlocks: boolean ← آیا بلاکی وجود داره؟
}
رفتار:

text

عادی:
┌─────────────────────────────┐
│ border-neutral-200 │
│ [بلاک‌ها...] │
└─────────────────────────────┘

هنگام درگ روی کنواس:
┌─────────────────────────────┐
│ border-emerald-400 ✨ │
│ ring-4 ring-emerald-50 │
│ [بلاک‌ها...] │
│ │
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐ │
│ │ + اینجا رها کن 🎯 │ │ ← انیمیشن bounce
│ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘ │
└─────────────────────────────┘
CanvasContent (اصلی)
TypeScript

{
sortedBlocks: PageBlock[] ← بلاک‌های مرتب
blockIds: string[] ← آی‌دی‌ها برای SortableContext
selectedBlockId: string | null
selectedElementId: string | null
activePaletteType: string | null ← نوع بلاک در حال درگ
isOverCanvas: boolean
onSelectElement: (instanceId, elementId) => void
onUpdateContent: (instanceId, key, value) => void ← ویرایش inline
onMoveBlock: (id, direction) => void
onDuplicateBlock: (id) => void
onDeleteBlock: (id) => void
onOpenCatalog: () => void
}
حالت خالی:

text

┌─────────────────────────────────────┐
│ │
│ ┌──────┐ │
│ │ ▦ │ + (bounce) │
│ └──────┘ │
│ │
│ صفحه‌ت رو بساز │
│ از سایدبار بکش و بنداز │
│ │
│ [+ اولین بلاک رو اضافه کن] │
│ │
│ ─── یا از سایدبار بکش ─── │
└─────────────────────────────────────┘
حالت با بلاک:

text

┌─────────────────────────────────────┐
│ SortableContext │
│ │
│ ┌──── group/block ────────────────┐│
│ │ [↑][↓] | [📋][🗑️] ← QuickActions││
│ │ ││
│ │ DraggableBlockItem (خارجی) ││
│ │ ← بلاک واقعی رندر میشه ││
│ └──────────────────────────────────┘│
│ │
│ ┌──── group/block ────────────────┐│
│ │ ...بلاک بعدی ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
🔵 فایل ۷: components/BuilderHeader.tsx
🎯 وظیفه
نوار بالای صفحه شامل لوگو، دکمه‌های عملیات و وضعیت ذخیره

🔍 Props
TypeScript

interface BuilderHeaderProps {
blocksCount: number ← تعداد بلاک‌ها
justSaved: boolean ← وضعیت ذخیره
pageId: string | null ← آیا صفحه قبلاً ذخیره شده؟
isServerSaving: boolean ← در حال ذخیره سرور
canUndo: boolean
canRedo: boolean
onUndo: () => void
onRedo: () => void
onPreview: () => void ← باز کردن پیش‌نمایش
onOpenMeta: () => void ← باز کردن فرم اطلاعات
onOpenCatalog: () => void ← باز کردن کاتالوگ (موبایل)
onClearAll: () => void ← حذف همه
}
📐 Layout
text

┌──────────────────────────────────────────────────────────┐
│ sticky top-0 z-40 backdrop-blur │
│ │
│ [ص] صفحه‌ساز 🟢ذخیره شد ▓▓▓░ 4/12 [↩][↪] [👁] [✅ ذخیره] [+] [🗑] │
│ │
│ ◄──── سمت راست ────► ◄──── سمت چپ ────► │
└──────────────────────────────────────────────────────────┘
ریسپانسیو:

المان موبایل دسکتاپ
لوگو فقط آیکون آیکون + متن
Undo/Redo مخفی نمایش
پیش‌نمایش فقط آیکون آیکون + متن
ذخیره فقط آیکون آیکون + متن
بلاک جدید نمایش مخفی (lg:hidden)
حذف همه نمایش اگه بلاک > 0 همینطور
🔴 فایل اصلی: PageBuilder.tsx
🎯 وظیفه
مغز مرکزی که تمام state، logic و handlers رو مدیریت میکنه و به فرزندان پاس میده.

📋 State Management
text

PageBuilder State
│
├── 📦 Data State
│ ├── blocks (via useHistory) ← آرایه بلاک‌ها + undo/redo
│ ├── selectedBlockId ← بلاک انتخاب‌شده
│ ├── selectedElementId ← المان انتخاب‌شده
│ ├── pageId ← آی‌دی صفحه در سرور
│ ├── pageTitle ← عنوان
│ ├── pageUrl ← slug
│ └── pageDescription ← توضیح
│
├── 🎨 UI State
│ ├── breakpoint ← mobile | tablet | desktop
│ ├── sidebarCollapsed ← سایدبار جمع/باز
│ ├── isScrolled ← آیا اسکرول شده؟
│ ├── showShortcuts ← نمایش میانبرها
│ ├── justSaved ← وضعیت ذخیره
│ └── storageHydrated ← آیا از storage خونده شده؟
│
├── 🔲 Modal State
│ ├── catalogOpen ← مدال کاتالوگ
│ ├── pageMetaOpen ← مدال اطلاعات
│ ├── clearConfirmOpen ← مدال تأیید حذف
│ └── isPhonePreviewOpen ← مدال پیش‌نمایش
│
├── 🖱️ DnD State
│ ├── activeBlockId ← بلاک در حال درگ (ری‌اوردر)
│ ├── activePaletteType ← نوع بلاک در حال درگ (پالت)
│ └── isOverCanvas ← آیا درگ روی کنواسه؟
│
└── 🌐 Server State
├── isServerSaving
└── serverSaveError
📋 Derived (محاسبه‌شده)
text

Derived Values (useMemo)
│
├── sortedBlocks ← blocks مرتب‌شده بر اساس order
├── blockIds ← آی‌دی‌ها برای SortableContext
├── selectedBlock ← بلاک انتخاب‌شده
├── activeBlock ← بلاک در حال درگ
├── selectedConfig ← تنظیمات بلاک از blockRegistry
├── selectedSchema ← اسکیمای المان‌های بلاک
├── selectedBlockLabel ← نام بلاک برای breadcrumb
└── selectedElementLabel ← نام المان برای breadcrumb
📋 Handlers (توابع)
text

Block CRUD
├── addBlock(type) ← ساخت بلاک جدید
├── removeBlockById(id) ← حذف بلاک
├── removeSelectedBlock() ← حذف بلاک انتخاب‌شده
├── duplicateBlockById(id) ← کپی بلاک
├── duplicateSelectedBlock() ← کپی بلاک انتخاب‌شده
├── moveBlock(id, "up"|"down") ← جابه‌جایی
├── requestClearAllBlocks() ← باز کردن مدال تأیید
└── confirmClearAllBlocks() ← حذف واقعی همه

Selection
├── handleSelectElement(instanceId, elementId) ← انتخاب المان
└── handleSelectBlock(id) ← انتخاب بلاک + اسکرول

Content & Style
├── updateSelectedContent(key, value) ← تغییر محتوا
├── handleInlineUpdateContent(id, key, value) ← ویرایش inline
└── updateSelectedElementStyle(elId, key, val) ← تغییر استایل

Server
├── createPageOnServer() ← POST /api/pages
├── updatePageOnServer() ← PATCH /api/pages/:id
└── handleMetaSave() ← ذخیره + بستن مدال

DnD
├── handleDragStart(e) ← تشخیص نوع درگ
├── handleDragOver(e) ← تشخیص هاور روی کنواس
├── handleDragEnd(e) ← اجرای عملیات
└── handleDragCancel() ← ریست
🔄 جریان DnD کامل
text

═══════════════════════════════════════════
سناریو ۱: درگ از پالت به کنواس
═══════════════════════════════════════════

SidebarPaletteDraggableItem
│ useDraggable({ id: "palette-banner", data: { fromPalette: true, blockType: "banner" } })
│
├── onDragStart
│ │ data.fromPalette === true
│ │ activePaletteType = "banner"
│ │ activeBlockId = null
│ │
│ ▼ DragOverlay نمایش PaletteDragOverlay
│
├── onDragOver
│ │ over.id === "canvas-drop-zone"?
│ │ isOverCanvas = true
│ │
│ ▼ CanvasDropZone نمایش هایلایت سبز
│
└── onDragEnd
│ data.fromPalette === true
│ overId === "canvas-drop-zone"?
│
├── بله → addBlock("banner")
│ ← بلاک به انتها اضافه
│
└── overId === block.instanceId?
├── بله → splice بعد از اون بلاک
└── خیر → addBlock (fallback)

═══════════════════════════════════════════
سناریو ۲: ری‌اوردر بلاک‌ها
═══════════════════════════════════════════

SidebarSortableItem (دستگیره)
│ useSortable({ id: block.instanceId })
│
├── onDragStart
│ │ data.fromPalette === undefined
│ │ activeBlockId = block.instanceId
│ │ activePaletteType = null
│ │
│ ▼ DragOverlay نمایش UnifiedDragOverlay
│
└── onDragEnd
│ active.id !== over.id
│ arrayMove(sorted, oldIndex, newIndex)
│ normalizeOrder()
│
▼ ترتیب بلاک‌ها تغییر کرد
🔄 جریان ذخیره‌سازی
text

═══════════════════════════════════════════
ذخیره محلی (localStorage)
═══════════════════════════════════════════

blocks تغییر کرد
│
▼ useEffect
│
├── storageHydrated === false? → return (منتظر هایدریشن)
│
├── justSaved = false (نمایش "ذخیره...")
│
├── clearTimeout(saveTimer)
│
└── setTimeout(800ms)
│
▼
saveToStorage(blocks) → localStorage.setItem(...)
justSaved = true → نمایش "ذخیره شد ✅"

═══════════════════════════════════════════
ذخیره سرور
═══════════════════════════════════════════

کاربر کلیک "ذخیره" / Ctrl+S
│
▼ setPageMetaOpen(true)
│
▼ کاربر فرم رو پر میکنه
│
▼ کلیک "ساخت صفحه" / "ذخیره تغییرات"
│
▼ handleMetaSave()
│
▼ updatePageOnServer()
│
├── pageId موجوده؟
│ ├── بله → PATCH /api/pages/:id
│ └── خیر → createPageOnServer() → POST /api/pages
│
├── موفق
│ ├── setPageId(newId)
│ ├── toast.show("ذخیره شد ✅")
│ ├── setJustSaved(true)
│ └── setPageMetaOpen(false)
│
└── خطا
├── setServerSaveError(msg)
└── toast.show(msg, "error")
🔄 جریان Keyboard Shortcuts
text

keydown event
│
▼ isInput? (input/textarea/contentEditable)
├── بله → return (جلوگیری از تداخل)
│
├── Ctrl+Z → history.undo() + toast
├── Ctrl+Y / Ctrl+Shift+Z → history.redo() + toast
├── Ctrl+D → duplicateBlockById(selectedBlockId) + toast
├── Delete/Backspace → removeBlockById(selectedBlockId) + toast
├── Ctrl+S → setPageMetaOpen(true)
└── ? → toggleShowShortcuts
🏗️ ساختار JSX (Render Tree)
text

DndContext
└── div[dir=rtl]
│
├── BuilderHeader ──────────────────── نوار بالا
│
└── div.flex
│
├── BlocksSidebar ─────────────── سایدبار (sticky)
│
└── main ──────────────────────── ناحیه اصلی
│
├── SelectionBreadcrumb ───── مسیر انتخاب
│
├── QuickTips (conditional) ── نکات اولیه
│
├── CanvasContent ─────────── بوم بلاک‌ها
│ └── CanvasDropZone
│ └── SortableContext
│ └── [BlockQuickActions + DraggableBlockItem] × n
│
└── BottomAddButton ───────── دکمه افزودن پایین

    ── Portals ──
    ├── DragOverlay
    ├── BlockCatalogModal
    ├── PageMetaModal
    ├── PhonePreviewModal
    ├── DynamicIslandPanel
    ├── ClearAllConfirmModal
    ├── ShortcutsHint
    ├── ToastContainer
    └── OnboardingOverlay

🔗 نمودار وابستگی Props
text

                    PageBuilder
                          │
          ┌───────────────┼───────────────────┐
          │               │                   │
          ▼               ▼                   ▼
    BuilderHeader    BlocksSidebar       CanvasContent
    │                │                   │
    │ blocksCount    │ blocks            │ sortedBlocks
    │ justSaved      │ selectedBlockId   │ blockIds
    │ pageId         │ onSelectBlock     │ selectedBlockId
    │ canUndo/Redo   │ onDeleteBlock     │ onSelectElement
    │ onUndo/Redo    │ onDuplicateBlock  │ onUpdateContent
    │ onPreview      │ onAddBlock        │ onMoveBlock
    │ onOpenMeta     │ collapsed         │ onDuplicateBlock
    │ onOpenCatalog  │ onToggleCollapse  │ onDeleteBlock
    │ onClearAll     │                   │ onOpenCatalog
    │                │                   │
    ▼                ▼                   ▼

SaveIndicator SidebarSortableItem BlockQuickActions
BlockCountBadge SidebarPaletteDraggable CanvasDropZone
DraggableBlockItem

                    ┌─────────────┐
                    │   Modals    │
                    ├─────────────┤
                    │ Catalog     │ ← open, onClose, onAdd
                    │ PageMeta    │ ← title, url, desc, onSave...
                    │ ClearAll    │ ← open, count, onConfirm
                    │ PhonePreview│ ← open, blocks, onClose
                    └─────────────┘

                    ┌─────────────┐
                    │  Overlays   │
                    ├─────────────┤
                    │ Toast       │ ← toasts[], onDismiss
                    │ Shortcuts   │ ← visible
                    │ Onboarding  │ ← step, onNext, onSkip
                    │ DragOverlay │ ← block | blockType
                    └─────────────┘

                    ┌──────────────────┐
                    │ DynamicIslandPanel│
                    ├──────────────────┤
                    │ block            │
                    │ schema           │
                    │ selectedElementId│
                    │ breakpoint       │
                    │ isScrolled       │
                    │ onUpdateContent  │
                    │ onUpdateStyle    │
                    │ onClose          │
                    │ onDeleteBlock    │
                    │ onDuplicateBlock │
                    └──────────────────┘

📝 نکات مهم
✅ چرا سایدبار sticky میمونه؟
CSS

position: sticky;
top: 73px; /_ ارتفاع هدر _/
height: calc(100dvh - 73px); /_ کل viewport منهای هدر _/
overflow-y: auto; /_ اسکرول داخلی مستقل _/
سایدبار همیشه کنار صفحه ثابته و محتوای داخلش مستقل اسکرول میشه.

✅ چرا normalizeOrder بعد هر تغییر؟
بعد از هر arrayMove, splice, filter ممکنه order بلاک‌ها نامنظم بشه. این تابع همیشه order رو از 0 شماره‌گذاری مجدد میکنه.

✅ چرا skipRecordRef در useHistory؟
وقتی undo() میزنیم، state عوض میشه و useEffect معمولاً اون رو هم record میکنه. با skipRecordRef جلوی ثبت دوباره رو میگیریم.

✅ چرا storageHydrated؟
جلوگیری از race condition: تا وقتی از localStorage نخوندیم، نباید بنویسیم. وگرنه state اولیه روی داده‌های قبلی overwrite میشه.
