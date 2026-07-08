"use client";

import { useState } from "react";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  shadows,
  typography,
  layout,
  animation,
  components,
} from "@/lib/design/design-system";
import { toast } from "@/components/ui/CustomToast";

/* ──────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────── */

interface FormState {
  name: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  phoneNumber: "",
  subject: "",
  message: "",
};

/* ──────────────────────────────────────────────
   FIELD
   ────────────────────────────────────────────── */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={typography.label}>
        {label}
        {required && <span className="text-rose-400"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass = cn(
  "w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-[#e6e3de] outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-slate-500",
  borders.subtle,
  "focus:border-[#d2b660]/40 focus:ring-1 focus:ring-[#d2b660]/20",
);

/* ──────────────────────────────────────────────
   CONTACT FORM SECTION
   ────────────────────────────────────────────── */

export function ContactFormSection() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("لطفاً نام خود را وارد کنید.");
      return;
    }
    if (!form.email.trim() && !form.phoneNumber.trim()) {
      toast.error("ایمیل یا شماره تماس را وارد کنید.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("لطفاً متن پیام را وارد کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "ارسال پیام با خطا مواجه شد.");
        return;
      }

      toast.success("پیام شما با موفقیت ارسال شد.");
      setSent(true);
      setForm(initialState);
    } catch {
      toast.error("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <section
        id="contact-form"
        dir="rtl"
        className={cn(
          "relative overflow-hidden",
          layout.section,
          "[content-visibility:auto] [contain-intrinsic-size:auto_900px]",
        )}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              "absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2",
              gradients.divider,
            )}
          />
          <div
            className={cn(
              "absolute left-0 bottom-0 hidden h-56 w-56 rounded-full blur-2xl lg:block",
              backgrounds.glow.blueOrb,
            )}
          />
        </div>

        <div className={cn("relative", layout.containerNarrow)}>
          <form
            onSubmit={handleSubmit}
            className={cn(
              animation.classes.fadeUp,
              "grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8 lg:p-10",
              layout.radius.xl,
              borders.subtle,
              backgrounds.surface.card,
              shadows.card,
            )}
          >
            <div className="sm:col-span-2">
              <h2 className={typography.h3}>فرم ارسال پیام</h2>
              <p className={cn("mt-2", typography.bodySmall)}>
                در کمتر از یک روز کاری پاسخ می‌دهیم.
              </p>
            </div>

            <Field label="نام و نام‌خانوادگی" required>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="مثلاً علی رضایی"
                className={inputClass}
                disabled={submitting}
              />
            </Field>

            <Field label="شماره تماس">
              <input
                type="tel"
                dir="ltr"
                value={form.phoneNumber}
                onChange={update("phoneNumber")}
                placeholder="09xxxxxxxxx"
                className={inputClass}
                disabled={submitting}
              />
            </Field>

            <Field label="ایمیل">
              <input
                type="email"
                dir="ltr"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
                className={inputClass}
                disabled={submitting}
              />
            </Field>

            <Field label="موضوع">
              <input
                type="text"
                value={form.subject}
                onChange={update("subject")}
                placeholder="موضوع پیام"
                className={inputClass}
                disabled={submitting}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="متن پیام" required>
                <textarea
                  value={form.message}
                  onChange={update("message")}
                  placeholder="پیام خود را بنویسید..."
                  rows={5}
                  className={cn(inputClass, "resize-none")}
                  disabled={submitting}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  components.ctaPrimary,
                  "w-full disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                <span className="relative z-10">
                  {submitting ? "در حال ارسال..." : sent ? "ارسال پیام دیگر" : "ارسال پیام"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default ContactFormSection;
