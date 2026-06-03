// ─────────────────────────────────────────────────────────────────
// app/demo/select/page.tsx — نمونه استفاده از CustomSelect
// ─────────────────────────────────────────────────────────────────
"use client";

import React, { useState, useCallback } from "react";
import CustomSelect, {
  type SelectOption,
  type CustomSelectRef,
} from "@/components/ui/customSelect";
import { toast, Toaster } from "@/components/ui/CustomToast";
import {
  backgrounds,
  layout,
  typography,
  gradients,
  animation,
  borders,
  cn,
} from "@/lib/design/design-system";

/* ══════════════════════════════════════════════
   DEMO DATA
   ══════════════════════════════════════════════ */

const roleOptions: SelectOption[] = [
  {
    value: "admin",
    label: "مدیر کل",
    description: "دسترسی کامل به تمام بخش‌ها",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    value: "editor",
    label: "ویرایشگر",
    description: "ایجاد و ویرایش محتوا",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
      </svg>
    ),
  },
  {
    value: "viewer",
    label: "بازدیدکننده",
    description: "فقط مشاهده اطلاعات",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path
          fillRule="evenodd"
          d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    value: "moderator",
    label: "ناظر",
    description: "بررسی و تأیید محتوا",
    disabled: true,
  },
];

const cityOptions: SelectOption[] = [
  { value: "tehran", label: "تهران", group: "استان تهران" },
  { value: "karaj", label: "کرج", group: "استان البرز" },
  { value: "isfahan", label: "اصفهان", group: "استان اصفهان" },
  { value: "shiraz", label: "شیراز", group: "استان فارس" },
  { value: "tabriz", label: "تبریز", group: "استان آذربایجان شرقی" },
  { value: "mashhad", label: "مشهد", group: "استان خراسان رضوی" },
  { value: "ahvaz", label: "اهواز", group: "استان خوزستان" },
  { value: "qom", label: "قم", group: "استان قم" },
  { value: "yazd", label: "یزد", group: "استان یزد" },
  { value: "kerman", label: "کرمان", group: "استان کرمان" },
  { value: "rasht", label: "رشت", group: "استان گیلان" },
  { value: "hamadan", label: "همدان", group: "استان همدان" },
];

const tagOptions: SelectOption[] = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "typescript", label: "TypeScript" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "docker", label: "Docker" },
  { value: "postgres", label: "PostgreSQL" },
  { value: "redis", label: "Redis" },
  { value: "graphql", label: "GraphQL" },
];

const statusOptions: SelectOption[] = [
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غیرفعال" },
  { value: "pending", label: "در انتظار" },
];

/* ══════════════════════════════════════════════
   FAKE ASYNC SEARCH
   ══════════════════════════════════════════════ */

const allCountries: SelectOption[] = [
  { value: "ir", label: "ایران" },
  { value: "tr", label: "ترکیه" },
  { value: "ae", label: "امارات" },
  { value: "sa", label: "عربستان سعودی" },
  { value: "de", label: "آلمان" },
  { value: "fr", label: "فرانسه" },
  { value: "gb", label: "بریتانیا" },
  { value: "us", label: "ایالات متحده" },
  { value: "jp", label: "ژاپن" },
  { value: "ca", label: "کانادا" },
  { value: "au", label: "استرالیا" },
  { value: "it", label: "ایتالیا" },
];

async function searchCountries(query: string): Promise<SelectOption[]> {
  await new Promise((r) => setTimeout(r, 500));
  if (!query.trim()) return allCountries;
  const q = query.toLowerCase();
  return allCountries.filter((c) => c.label.includes(q) || c.value.includes(q));
}

/* ══════════════════════════════════════════════
   DEMO CARD WRAPPER
   ══════════════════════════════════════════════ */

function DemoCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border p-5 sm:p-6",
        borders.subtle,
        backgrounds.surface.glass,
        "transition-all duration-300",
        "hover:border-white/12",
      )}
    >
      <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════ */

export default function SelectDemoPage() {
  const [role, setRole] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [creatableTags, setCreatableTags] = useState<string[]>([]);
  const [creatableOptions, setCreatableOptions] =
    useState<SelectOption[]>(tagOptions);

  const selectRef = React.useRef<CustomSelectRef>(null);

  const handleCreateTag = useCallback((query: string) => {
    const newOpt: SelectOption = {
      value: query.toLowerCase().replace(/\s+/g, "-"),
      label: query,
    };
    setCreatableOptions((prev) => [...prev, newOpt]);
    setCreatableTags((prev) => [...prev, newOpt.value]);
    toast.success(`تگ «${query}» ایجاد شد`);
  }, []);

  return (
    <div className={cn("min-h-screen", backgrounds.page)} dir="rtl">
      <style>{animation.keyframes}</style>
      <Toaster position="top-right" />

      <div className={cn(layout.container, layout.section)}>
        {/* Header */}
        <header className="mb-10">
          <h1 className={cn(typography.h2, gradients.textPrimary, "mb-2")}>
            سلکت سفارشی
          </h1>
          <p className={typography.body}>
            دراپ‌داون انتخابی کاملاً داینامیک با پشتیبانی از جستجو، چندانتخابه،
            گروه‌بندی، ایجاد گزینه و سرچ async.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Basic Single Select */}
          <DemoCard
            title="انتخاب ساده"
            description="یک گزینه از لیست انتخاب کنید"
          >
            <CustomSelect
              label="وضعیت"
              options={statusOptions}
              value={status}
              onChange={(v) => {
                setStatus(v as string);
                toast.info(
                  `وضعیت: ${statusOptions.find((o) => o.value === v)?.label}`,
                );
              }}
              placeholder="وضعیت را انتخاب کنید"
              clearable
              required
            />
          </DemoCard>

          {/* 2. With Icons + Descriptions */}
          <DemoCard
            title="با آیکون و توضیحات"
            description="هر گزینه آیکون و توضیح اختصاصی دارد"
          >
            <CustomSelect
              label="نقش کاربری"
              options={roleOptions}
              value={role}
              onChange={(v) => setRole(v as string)}
              placeholder="نقش را انتخاب کنید"
              searchable
              clearable
              helperText="گزینه «ناظر» غیرفعال است"
            />
          </DemoCard>

          {/* 3. Searchable + Grouped */}
          <DemoCard
            title="جستجو + گروه‌بندی"
            description="گزینه‌ها بر اساس استان گروه‌بندی شده‌اند"
          >
            <CustomSelect
              label="شهر"
              options={cityOptions}
              value={city}
              onChange={(v) => setCity(v as string)}
              placeholder="شهر خود را جستجو کنید"
              searchable
              searchPlaceholder="نام شهر…"
              grouped
              clearable
            />
          </DemoCard>

          {/* 4. Multiple Select */}
          <DemoCard
            title="چندانتخابه"
            description="چند گزینه همزمان انتخاب کنید (حداکثر ۵)"
          >
            <CustomSelect
              label="تکنولوژی‌ها"
              options={tagOptions}
              value={tags}
              onChange={(v) => setTags(v as string[])}
              placeholder="تکنولوژی‌ها را انتخاب کنید"
              multiple
              searchable
              clearable
              maxSelections={5}
            />
          </DemoCard>

          {/* 5. Async Search */}
          <DemoCard
            title="جستجوی آنلاین (Async)"
            description="گزینه‌ها از سرور با تأخیر دریافت می‌شوند"
          >
            <CustomSelect
              label="کشور"
              options={allCountries}
              value={country}
              onChange={(v) => setCountry(v as string)}
              placeholder="کشور را جستجو کنید"
              searchable
              clearable
              onSearch={searchCountries}
            />
          </DemoCard>

          {/* 6. Creatable */}
          <DemoCard
            title="قابلیت ایجاد گزینه جدید"
            description="اگر گزینه مورد نظر نبود، ایجاد کنید"
          >
            <CustomSelect
              label="تگ‌ها"
              options={creatableOptions}
              value={creatableTags}
              onChange={(v) => setCreatableTags(v as string[])}
              placeholder="تگ بنویسید یا انتخاب کنید"
              multiple
              searchable
              clearable
              creatable
              onCreateOption={handleCreateTag}
            />
          </DemoCard>

          {/* 7. Sizes */}
          <DemoCard title="اندازه‌ها" description="سه سایز کوچک، متوسط و بزرگ">
            <div className="space-y-3">
              <CustomSelect
                label="کوچک"
                options={statusOptions}
                placeholder="Small"
                size="sm"
              />
              <CustomSelect
                label="متوسط"
                options={statusOptions}
                placeholder="Medium"
                size="md"
              />
              <CustomSelect
                label="بزرگ"
                options={statusOptions}
                placeholder="Large"
                size="lg"
              />
            </div>
          </DemoCard>

          {/* 8. States */}
          <DemoCard
            title="حالت‌ها"
            description="خطا، غیرفعال و در حال بارگذاری"
          >
            <div className="space-y-3">
              <CustomSelect
                label="خطا"
                options={statusOptions}
                placeholder="فیلد با خطا"
                error="این فیلد الزامی است"
                required
              />
              <CustomSelect
                label="غیرفعال"
                options={statusOptions}
                value="active"
                disabled
              />
              <CustomSelect
                label="بارگذاری"
                options={[]}
                placeholder="در حال بارگذاری…"
                loading
              />
            </div>
          </DemoCard>

          {/* 9. Programmatic Control */}
          <DemoCard
            title="کنترل برنامه‌ای"
            description="باز/بسته/پاک کردن با ref"
          >
            <CustomSelect
              ref={selectRef}
              label="کنترل‌شده"
              options={statusOptions}
              placeholder="با دکمه‌ها کنترل کنید"
              clearable
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectRef.current?.open()}
                className={cn(
                  "inline-flex h-8 items-center rounded-lg border px-3 text-[11px] font-medium",
                  borders.subtle,
                  "text-slate-400 hover:text-white hover:bg-white/4",
                  animation.base,
                )}
              >
                باز کردن
              </button>
              <button
                type="button"
                onClick={() => selectRef.current?.close()}
                className={cn(
                  "inline-flex h-8 items-center rounded-lg border px-3 text-[11px] font-medium",
                  borders.subtle,
                  "text-slate-400 hover:text-white hover:bg-white/4",
                  animation.base,
                )}
              >
                بستن
              </button>
              <button
                type="button"
                onClick={() => selectRef.current?.clear()}
                className={cn(
                  "inline-flex h-8 items-center rounded-lg border px-3 text-[11px] font-medium",
                  borders.subtle,
                  "text-red-400/70 hover:text-red-400 hover:bg-red-500/10",
                  animation.base,
                )}
              >
                پاک کردن
              </button>
            </div>
          </DemoCard>
        </div>

        {/* ── Current Values Display ── */}
        <div
          className={cn(
            "mt-8 overflow-hidden rounded-2xl border p-5",
            borders.subtle,
            backgrounds.surface.glass,
          )}
        >
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-[#F5D76E]"
            >
              <path
                fillRule="evenodd"
                d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zM6 13.25V3.5h8v9.75a.75.75 0 01-1.064.681L10 12.091l-2.936 1.84A.75.75 0 016 13.25z"
                clipRule="evenodd"
              />
            </svg>
            مقادیر فعلی
          </h3>
          <div className="grid gap-2 sm:grid-cols-3 text-xs">
            {[
              { label: "وضعیت", value: status || "—" },
              { label: "نقش", value: role || "—" },
              { label: "شهر", value: city || "—" },
              {
                label: "تکنولوژی‌ها",
                value: tags.length > 0 ? tags.join(", ") : "—",
              },
              { label: "کشور", value: country || "—" },
              {
                label: "تگ‌ها",
                value:
                  creatableTags.length > 0 ? creatableTags.join(", ") : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-lg p-2.5",
                  "bg-white/2",
                  borders.subtle,
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {item.label}
                </span>
                <span className="text-slate-300 font-medium break-all">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
