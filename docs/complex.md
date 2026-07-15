1. SimplePageBuilder.tsx

این مغز صفحه‌ساز فعلیه.

کارهایی که انجام می‌ده:

- لیست بلاک‌های داخل صفحه را نگه می‌دارد
- بلاک جدید اضافه می‌کند
- بلاک انتخاب‌شده را نگه می‌دارد
- المنت انتخاب‌شده داخل بلاک را نگه می‌دارد
- ترتیب بلاک‌ها را با drag/drop تغییر می‌دهد
- محتوای بلاک را آپدیت می‌کند
- استایل المنت‌های داخل بلاک را آپدیت می‌کند
- بلاک را حذف یا کپی می‌کند
- DynamicIslandPanel را باز می‌کند

یعنی این فایل فعلاً جای store را هم بازی می‌کند. به جای Zustand، از useState داخلی استفاده می‌کند.

مثلاً این stateها احتمالاً داخلش هستند:

blocks
selectedBlockId
selectedElementId
breakpoint

پس وقتی کاربر روی عنوان بنر کلیک می‌کند:

SimplePageBuilder می‌فهمد:
کدام block انتخاب شده
کدام element انتخاب شده
بعد DynamicIslandPanel را با اطلاعات همان block باز می‌کند

نقش ساده‌شده:

SimplePageBuilder = کنترل‌پنل اصلی صفحه‌ساز 2. DraggableBlockItem.tsx

این فایل مسئول نمایش هر بلاک داخل صفحه + قابلیت drag/drop است.

هر بلاکی که در صفحه هست، توسط این کامپوننت wrap می‌شود.

کارهایی که انجام می‌دهد:

- یک block را می‌گیرد
- از blockRegistry می‌فهمد کامپوننت مربوط به آن چیست
- مثلا اگر block.type برابر banner باشد، BannerBlock را رندر می‌کند
- اگر simpleLink باشد، SimpleLinkBlock را رندر می‌کند
- بلاک را sortable می‌کند
- drag handle یا دستگیره جابه‌جایی نشان می‌دهد
- موقع drag شدن opacity / z-index / transform را اعمال می‌کند
- selectedBlockId و selectedElementId را به بلاک پاس می‌دهد

یعنی این فایل واسطه بین dnd-kit و خود کامپوننت‌های بلاک است.

نقش ساده‌شده:

DraggableBlockItem = قاب قابل جابه‌جایی دور هر بلاک

مثلاً:

SimplePageBuilder
└── DraggableBlockItem
└── BannerBlock یا SimpleLinkBlock 3. DynamicIslandPanel.tsx

این همون پنل شناور ادیت است.

کارهایی که انجام می‌دهد:

- اگر بلاکی انتخاب شده باشد، باز می‌شود
- نام بلاک را نشان می‌دهد
- نام المنت انتخاب‌شده را نشان می‌دهد
- تب‌های محتوا / ظاهر / عملیات را نشان می‌دهد
- در تب محتوا، DynamicContentForm را نمایش می‌دهد
- در تب ظاهر، DynamicStyleForm را نمایش می‌دهد
- در تب عملیات، دکمه حذف و کپی بلاک را نشان می‌دهد

این فایل خودش نباید بداند بنر چیست یا لینک چیست. فقط این‌ها را می‌گیرد:

block
schema
selectedElementId

بعد از schema می‌فهمد چه فرم‌هایی باید ساخته شود.

نقش ساده‌شده:

DynamicIslandPanel = پنل ادیت شناور برای بلاک انتخاب‌شده

در دسکتاپ باید مثل یک پنل سمت راست باشد.
در موبایل باید مثل bottom sheet پایین صفحه باشد.

4. DynamicContentForm.tsx

این فایل مسئول فرم محتوای بلاک است.

یعنی چیزهایی مثل:

عنوان
توضیحات
لینک دکمه
تصویر پس‌زمینه
نمایش دکمه
نمایش توضیحات

این فرم از روی این ساخته می‌شود:

schema.contentFields

مثلاً برای بنر:

contentFields: [
{ key: "title", label: "عنوان", type: "text" },
{ key: "description", label: "توضیحات", type: "textarea" },
{ key: "buttonUrl", label: "لینک دکمه", type: "url" },
{ key: "showButton", label: "نمایش دکمه", type: "boolean" }
]

پس DynamicContentForm خودش بنر را نمی‌شناسد. فقط می‌گوید:

این fieldها را دارم، پس input مناسبشان را بسازم.

نقش ساده‌شده:

DynamicContentForm = فرم داینامیک برای block.data 5. DynamicStyleForm.tsx

این فایل مسئول فرم ظاهر المنت انتخاب‌شده است.

مثلاً وقتی کاربر روی title کلیک می‌کند، فرم ظاهر فقط چیزهایی را نشان می‌دهد که برای title مجاز است:

رنگ متن
اندازه متن
انیمیشن

ولی وقتی روی button کلیک می‌کند، گزینه‌های بیشتری نشان می‌دهد:

رنگ متن
رنگ پس‌زمینه
اندازه متن
گردی گوشه‌ها
رنگ بوردر
ضخامت حاشیه
انیمیشن

این فرم از اینجا ساخته می‌شود:

schema.elements[selectedElementId].allowedStyleKeys

و مقدار فعلی را از اینجا می‌خواند:

block.elements[selectedElementId].style

نقش ساده‌شده:

DynamicStyleForm = فرم داینامیک برای block.elements[elementId].style

این فرم باید breakpoint هم داشته باشد:

mobile
tablet
desktop

چون styleها responsive هستند.

6. blockRegistry.ts

این فایل دفترچه ثبت بلاک‌ها است.

یعنی سیستم از این فایل می‌فهمد:

چه بلاک‌هایی داریم؟
هر بلاک چه کامپوننتی دارد؟
هر بلاک چه schema ای دارد؟
هر بلاک چطور default ساخته می‌شود؟

مثلاً:

banner: {
type: "banner",
label: "بنر",
component: BannerBlock,
schema: bannerSchema,
createDefaultBlock: createDefaultBannerBlock,
}

یا:

simpleLink: {
type: "simpleLink",
label: "لینک ساده",
component: SimpleLinkBlock,
schema: simpleLinkSchema,
createDefaultBlock: createDefaultSimpleLinkBlock,
}

پس وقتی کاربر روی دکمه «+ بنر» کلیک می‌کند:

SimplePageBuilder از blockRegistry می‌پرسد:
برای banner چطور یک بلاک جدید بسازم؟

وقتی قرار است بلاک نمایش داده شود:

DraggableBlockItem از blockRegistry می‌پرسد:
برای این block.type چه React component ای باید render کنم؟

وقتی فرم باید ساخته شود:

DynamicIslandPanel از blockRegistry schema را می‌گیرد

نقش ساده‌شده:

blockRegistry = مرکز معرفی و اتصال همه بلاک‌ها 7. lib/ds/accents.ts

این فایل سیستم رنگ accent برای UI خود ادیتور است.

خیلی مهم: این فایل برای خود بلاک‌های کاربر نیست. یعنی نباید داخل BannerBlock یا SimpleLinkBlock استفاده شود.

این برای چیزهایی مثل این‌هاست:

- دکمه‌های افزودن بلاک
- Dynamic Island
- drag handle
- selected block border
- active tab
- badgeها
- پنل‌های ادیتور

مثلاً:

accentTokens.amber.bg
accentTokens.amber.border
accentTokens.amber.text

این‌ها raw color نیستند. این‌ها Tailwind class هستند.

درست:

className={`${accentTokens.amber.bg} ${accentTokens.amber.border} ${accentTokens.amber.text}`}

غلط:

style={{
  backgroundColor: accentTokens.amber.bg
}}

نقش ساده‌شده:

accentTokens = رنگ و حال‌وهوای لوکس مشکی/طلایی برای خود Builder UI

نه برای خروجی صفحه کاربر.

SimplePageBuilder
├── blockRegistry را می‌خواند
├── blocks state را نگه می‌دارد
├── add / delete / duplicate / reorder انجام می‌دهد
│
├── DraggableBlockItem
│ ├── dnd-kit را کنترل می‌کند
│ ├── از blockRegistry کامپوننت بلاک را پیدا می‌کند
│ └── BannerBlock / SimpleLinkBlock را render می‌کند
│
└── DynamicIslandPanel
├── schema بلاک انتخاب‌شده را می‌گیرد
├── DynamicContentForm را برای block.data نشان می‌دهد
├── DynamicStyleForm را برای element.style نشان می‌دهد
└── حذف / کپی بلاک را انجام می‌دهد

        SimplePageBuilder:

مدیر کل صفحه‌ساز

DraggableBlockItem:
قاب drag/drop برای هر بلاک

DynamicIslandPanel:
پنل شناور ادیت بلاک انتخاب‌شده

DynamicContentForm:
فرم محتوای بلاک از روی schema

DynamicStyleForm:
فرم ظاهر المنت انتخاب‌شده از روی allowedStyleKeys

blockRegistry:
لیست رسمی بلاک‌ها، schemaها و factoryها

lib/ds/accents.ts:
رنگ‌های آماده برای UI خود ادیتور، نه بلاک‌های کاربر
