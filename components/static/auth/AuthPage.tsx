"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/CustomToast";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  shadows,
  typography,
  layout,
  animation,
  focus,
  components,
  accentTokens,
} from "@/lib/design/design-system";

/* ══════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════ */

const authKeyframes = `
@keyframes auth-fade-in{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
@keyframes auth-slide-left{0%{opacity:0;transform:translateX(24px)}100%{opacity:1;transform:translateX(0)}}
@keyframes auth-slide-right{0%{opacity:0;transform:translateX(-24px)}100%{opacity:1;transform:translateX(0)}}
@keyframes auth-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
@keyframes auth-pulse-dot{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes auth-check-draw{0%{stroke-dashoffset:20}100%{stroke-dashoffset:0}}
.auth-fade-in{animation:auth-fade-in .5s cubic-bezier(.22,1,.36,1) both}
.auth-slide-left{animation:auth-slide-left .4s cubic-bezier(.22,1,.36,1) both}
.auth-slide-right{animation:auth-slide-right .4s cubic-bezier(.22,1,.36,1) both}
.auth-shake{animation:auth-shake .4s ease-in-out}
.auth-pulse-dot{animation:auth-pulse-dot 1.4s ease-in-out infinite}
.auth-check-draw{animation:auth-check-draw .4s ease-out both;stroke-dasharray:20;stroke-dashoffset:0}
`;

/* ══════════════════════════════════════════════
   TYPES & FAKE DATA
   ══════════════════════════════════════════════ */

type AuthStep = "phone" | "otp" | "register" | "success";

interface FakeUser {
  phone: string;
  name: string;
  registered: boolean;
}

const FAKE_USERS: FakeUser[] = [
  { phone: "09121234567", name: "علی رضایی", registered: true },
  { phone: "09351112233", name: "سارا احمدی", registered: true },
  { phone: "09199998877", name: "مهدی کریمی", registered: true },
];

const FAKE_OTP = "12345";
const OTP_LENGTH = 5;
const OTP_EXPIRY = 120; // seconds
const RESEND_COOLDOWN = 60; // seconds

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

function isValidIranPhone(phone: string): boolean {
  return /^09[0-9]{9}$/.test(phone.replace(/\D/g, ""));
}

function toFarsiDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function secondsToTimer(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return toFarsiDigits(`${m}:${sec.toString().padStart(2, "0")}`);
}

/* ══════════════════════════════════════════════
   SHARED UI
   ══════════════════════════════════════════════ */

function LogoMark() {
  return (
    <div
      className={cn(
        "relative flex h-14 w-14 items-center justify-center overflow-hidden",
        layout.radius.lg,
        borders.strong,
        gradients.logo,
        shadows.logo,
      )}
    >
      <span
        className={cn(
          "absolute inset-[1px] rounded-[15px]",
          gradients.innerHighlight,
        )}
      />
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="relative z-10 h-6 w-6"
        fill="none"
      >
        <rect
          x="4"
          y="5"
          width="16"
          height="3"
          rx="1.5"
          className="fill-white"
        />
        <rect
          x="4"
          y="10.5"
          width="11"
          height="3"
          rx="1.5"
          className="fill-sky-100"
        />
        <rect
          x="4"
          y="16"
          width="7"
          height="3"
          rx="1.5"
          className="fill-cyan-200"
        />
      </svg>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white auth-pulse-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}

function SuccessCheck() {
  return (
    <div
      className={cn(
        "flex h-20 w-20 items-center justify-center rounded-full",
        "border-2",
        accentTokens.emerald.border,
        accentTokens.emerald.bg,
        "shadow-[0_0_40px_-10px_rgba(52,211,153,0.5)]",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-10 w-10 text-emerald-300 auth-check-draw"
      >
        <path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════
   OTP INPUT
   ══════════════════════════════════════════════ */

function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  error,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (disabled) return;
    const sanitized = char.replace(/\D/g, "");
    if (!sanitized && char !== "") return;

    const arr = value.split("");
    arr[index] = sanitized;
    const newVal = arr.join("").slice(0, length);
    onChange(newVal);

    if (sanitized && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const arr = value.split("");
      arr[index - 1] = "";
      onChange(arr.join(""));
    }
    if (e.key === "ArrowLeft" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    if (e.key === "ArrowRight" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div
      dir="ltr"
      className={cn(
        "flex items-center justify-center gap-2 sm:gap-3",
        error && "auth-shake",
      )}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`رقم ${i + 1} کد تأیید`}
          className={cn(
            "h-14 w-11 rounded-xl border text-center text-xl font-bold text-white caret-sky-400 outline-none sm:h-16 sm:w-13",
            animation.smooth,
            disabled ? "opacity-50 cursor-not-allowed" : "",
            error
              ? "border-red-400/40 bg-red-400/[0.06] text-red-300"
              : value[i]
                ? cn(accentTokens.sky.border, "bg-sky-400/[0.06]")
                : cn(borders.light, backgrounds.surface.glass),
            !disabled &&
              !error &&
              "focus:border-sky-400/50 focus:bg-sky-400/[0.08] focus:ring-2 focus:ring-sky-400/20",
          )}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   AUTH COMPONENT
   ══════════════════════════════════════════════ */

export default function AuthPage() {
  // ── State ──
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(OTP_EXPIRY);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  // ── Timer ──
  useEffect(() => {
    if (step !== "otp") return;
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  // ── Resend cooldown ──
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // ── Auto-submit OTP ──
  useEffect(() => {
    if (otp.length === OTP_LENGTH && step === "otp") {
      handleVerifyOtp();
    }
  }, [otp]);

  // ── Focus phone input on mount ──
  useEffect(() => {
    if (step === "phone") phoneInputRef.current?.focus();
  }, [step]);

  const changeStep = (newStep: AuthStep) => {
    setAnimKey((k) => k + 1);
    setStep(newStep);
    setError("");
  };

  // ── STEP 1: Send OTP ──
  const handleSendOtp = useCallback(async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!isValidIranPhone(cleanPhone)) {
      setError("شماره موبایل معتبر نیست");
      toast.error("لطفاً یک شماره موبایل معتبر وارد کنید.");
      return;
    }

    setLoading(true);
    setError("");

    // Fake API delay
    await new Promise((r) => setTimeout(r, 1500));

    const existingUser = FAKE_USERS.find((u) => u.phone === cleanPhone);
    setIsExistingUser(!!existingUser);

    toast.info(`کد تأیید به ${formatPhone(cleanPhone)} ارسال شد.`, {
      title: "کد ارسال شد",
    });

    setLoading(false);
    setTimer(OTP_EXPIRY);
    setResendCooldown(RESEND_COOLDOWN);
    changeStep("otp");
  }, [phone]);

  // ── STEP 2: Verify OTP ──
  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) return;

    setLoading(true);
    setOtpError(false);
    setError("");

    await new Promise((r) => setTimeout(r, 1200));

    if (otp !== FAKE_OTP) {
      setOtpError(true);
      setError("کد وارد شده اشتباه است");
      toast.error("کد تأیید اشتباه است. لطفاً دوباره تلاش کنید.");
      setLoading(false);
      setOtp("");
      return;
    }

    setLoading(false);

    if (isExistingUser) {
      const user = FAKE_USERS.find((u) => u.phone === phone.replace(/\D/g, ""));
      toast.success(`خوش آمدی ${user?.name}!`, { title: "ورود موفق" });
      changeStep("success");
    } else {
      toast.info("لطفاً اطلاعات خود را تکمیل کنید.", { title: "ثبت‌نام" });
      changeStep("register");
    }
  }, [otp, isExistingUser, phone]);

  // ── STEP 3: Register ──
  const handleRegister = useCallback(async () => {
    if (name.trim().length < 2) {
      setError("نام و نام خانوادگی الزامی است");
      toast.warning("لطفاً نام خود را وارد کنید.");
      return;
    }

    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 1800));

    toast.success(`حساب شما ساخته شد. خوش آمدی ${name}!`, {
      title: "ثبت‌نام موفق",
    });

    setLoading(false);
    changeStep("success");
  }, [name]);

  // ── Resend OTP ──
  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    setTimer(OTP_EXPIRY);
    setResendCooldown(RESEND_COOLDOWN);
    setOtp("");
    setOtpError(false);
    setError("");
    setLoading(false);

    toast.success("کد جدید ارسال شد.", { title: "ارسال مجدد" });
  }, [resendCooldown]);

  // ── Back ──
  const handleBack = () => {
    setOtp("");
    setOtpError(false);
    setError("");
    changeStep("phone");
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authKeyframes }} />
      <style dangerouslySetInnerHTML={{ __html: animation.keyframes }} />

      <div
        dir="rtl"
        className={cn(
          "flex min-h-screen items-center justify-center px-4 py-10",
          backgrounds.page,
        )}
      >
        {/* BG Effects */}
        <div className="pointer-events-none fixed inset-0">
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]",
              backgrounds.glow.hero,
            )}
          />
          <div
            className={cn(
              "absolute right-0 top-1/4 h-80 w-80 rounded-full blur-3xl",
              backgrounds.glow.skyOrb,
              animation.classes.floatSlow,
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 h-80 w-80 rounded-full blur-3xl",
              backgrounds.glow.blueOrb,
              animation.classes.floatMedium,
            )}
          />
          <div className={cn("absolute inset-0", backgrounds.grid.lines)} />
        </div>

        {/* Card */}
        <div
          className={cn(
            "relative w-full max-w-md overflow-hidden",
            layout.radius.xl,
            borders.light,
            "bg-linear-to-b from-[#0c1a30]/98 via-[#0f2340]/95 to-[#071427]/98",
            "backdrop-blur-xl",
            "shadow-[0_40px_100px_-40px_rgba(2,8,23,0.9),0_20px_50px_-20px_rgba(59,130,246,0.2)]",
          )}
        >
          {/* Top accent line */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 h-px",
              gradients.dividerSky,
            )}
          />

          {/* Content */}
          <div className="relative p-7 sm:p-9" key={animKey}>
            {/* ═══ PHONE STEP ═══ */}
            {step === "phone" && (
              <div className="auth-fade-in">
                <div className="flex flex-col items-center gap-4 text-center">
                  <LogoMark />
                  <div>
                    <h1 className={cn(typography.h3, "text-xl")}>
                      ورود یا ثبت‌نام
                    </h1>
                    <p
                      className={cn(
                        "mt-2",
                        typography.bodySmall,
                        "text-slate-400",
                      )}
                    >
                      شماره موبایل خود را وارد کنید
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {/* Phone Input */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-xs font-medium text-slate-300"
                    >
                      شماره موبایل
                    </label>
                    <div className="relative">
                      <input
                        ref={phoneInputRef}
                        id="phone"
                        type="tel"
                        dir="ltr"
                        inputMode="numeric"
                        placeholder="0912 345 6789"
                        maxLength={13}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/[^0-9\s]/g, ""));
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        disabled={loading}
                        className={cn(
                          "w-full rounded-xl border px-4 py-3.5 pr-12 text-left text-base font-medium text-white placeholder:text-slate-500 outline-none",
                          animation.smooth,
                          error
                            ? "border-red-400/40 bg-red-400/[0.04]"
                            : cn(borders.light, backgrounds.surface.glass),
                          "focus:border-sky-400/50 focus:bg-sky-400/[0.04] focus:ring-2 focus:ring-sky-400/20",
                          loading && "opacity-60 cursor-not-allowed",
                        )}
                      />
                      {/* Phone icon */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-slate-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400 auth-slide-right">
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !phone.replace(/\D/g, "").length}
                    className={cn(
                      components.ctaPrimary,
                      "w-full justify-center py-3.5",
                      loading && "pointer-events-none opacity-80",
                    )}
                  >
                    {loading ? <LoadingDots /> : "دریافت کد تأیید"}
                  </button>

                  {/* Test hint */}
                  <div
                    className={cn(
                      "mt-2 rounded-xl border p-3",
                      borders.subtle,
                      backgrounds.surface.glassMedium,
                      "text-center",
                    )}
                  >
                    <p className={cn(typography.labelSmall, "text-slate-500")}>
                      برای تست از شماره‌های زیر استفاده کنید:
                    </p>
                    <div className="mt-1.5 flex flex-wrap justify-center gap-2">
                      {FAKE_USERS.map((u) => (
                        <button
                          key={u.phone}
                          type="button"
                          onClick={() => setPhone(u.phone)}
                          className={cn(
                            "rounded-lg border px-2 py-1 text-[10px] font-mono",
                            borders.subtle,
                            "text-slate-400",
                            animation.base,
                            "hover:text-sky-300 hover:border-sky-400/20 hover:bg-sky-400/[0.04]",
                          )}
                        >
                          {u.phone}
                        </button>
                      ))}
                    </div>
                    <p
                      className={cn(
                        "mt-1.5",
                        typography.labelSmall,
                        "text-slate-500",
                      )}
                    >
                      یا هر شماره دیگری (کاربر جدید) — کد:{" "}
                      <span className="font-mono text-sky-300">{FAKE_OTP}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ OTP STEP ═══ */}
            {step === "otp" && (
              <div className="auth-slide-left">
                <div className="flex flex-col items-center gap-4 text-center">
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={handleBack}
                    className={cn(
                      "absolute right-5 top-5 flex h-9 w-9 items-center justify-center",
                      layout.radius.md,
                      borders.subtle,
                      backgrounds.surface.glass,
                      "text-slate-400",
                      animation.base,
                      "hover:text-white hover:bg-white/[0.08]",
                      focus.ring,
                    )}
                    aria-label="بازگشت"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <LogoMark />

                  <div>
                    <h1 className={cn(typography.h3, "text-xl")}>کد تأیید</h1>
                    <p
                      className={cn(
                        "mt-2",
                        typography.bodySmall,
                        "text-slate-400",
                      )}
                    >
                      کد ارسال شده به{" "}
                      <span dir="ltr" className="font-mono text-sky-300">
                        {formatPhone(phone.replace(/\D/g, ""))}
                      </span>{" "}
                      را وارد کنید
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  <OtpInput
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      setOtpError(false);
                      setError("");
                    }}
                    error={otpError}
                    disabled={loading}
                  />

                  {/* Error */}
                  {error && (
                    <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-400 auth-slide-right">
                      <svg
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </p>
                  )}

                  {/* Timer & Resend */}
                  <div className="flex items-center justify-center gap-3 text-xs">
                    {timer > 0 ? (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-3.5 w-3.5 text-slate-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5c0 .215.092.42.254.563l2 1.75a.75.75 0 0 0 .992-1.126l-1.746-1.528V4.75Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{secondsToTimer(timer)}</span>
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        زمان کد به اتمام رسید
                      </span>
                    )}

                    <span className="h-3 w-px bg-white/10" />

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className={cn(
                        "font-medium",
                        animation.colors,
                        resendCooldown > 0
                          ? "text-slate-500 cursor-not-allowed"
                          : cn(accentTokens.sky.text, "hover:text-sky-200"),
                      )}
                    >
                      {resendCooldown > 0
                        ? `ارسال مجدد (${secondsToTimer(resendCooldown)})`
                        : "ارسال مجدد کد"}
                    </button>
                  </div>

                  {/* Verify button */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== OTP_LENGTH}
                    className={cn(
                      components.ctaPrimary,
                      "w-full justify-center py-3.5",
                      (loading || otp.length !== OTP_LENGTH) &&
                        "opacity-60 pointer-events-none",
                    )}
                  >
                    {loading ? <LoadingDots /> : "تأیید کد"}
                  </button>
                </div>
              </div>
            )}

            {/* ═══ REGISTER STEP ═══ */}
            {step === "register" && (
              <div className="auth-slide-left">
                <div className="flex flex-col items-center gap-4 text-center">
                  <LogoMark />
                  <div>
                    <h1 className={cn(typography.h3, "text-xl")}>
                      تکمیل ثبت‌نام
                    </h1>
                    <p
                      className={cn(
                        "mt-2",
                        typography.bodySmall,
                        "text-slate-400",
                      )}
                    >
                      لطفاً اطلاعات زیر را وارد کنید
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {/* Phone display */}
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3",
                      borders.subtle,
                      backgrounds.surface.glassMedium,
                    )}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 text-emerald-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      dir="ltr"
                      className="text-sm font-mono text-slate-300"
                    >
                      {formatPhone(phone.replace(/\D/g, ""))}
                    </span>
                    <span className="mr-auto text-[10px] text-emerald-400">
                      تأیید شده
                    </span>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-xs font-medium text-slate-300"
                    >
                      نام و نام خانوادگی
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="مثلاً: علی رضایی"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      disabled={loading}
                      autoFocus
                      className={cn(
                        "w-full rounded-xl border px-4 py-3.5 text-sm font-medium text-white placeholder:text-slate-500 outline-none",
                        animation.smooth,
                        error
                          ? "border-red-400/40 bg-red-400/[0.04]"
                          : cn(borders.light, backgrounds.surface.glass),
                        "focus:border-sky-400/50 focus:bg-sky-400/[0.04] focus:ring-2 focus:ring-sky-400/20",
                        loading && "opacity-60 cursor-not-allowed",
                      )}
                    />
                    {error && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-400 auth-slide-right">
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={loading || name.trim().length < 2}
                    className={cn(
                      components.ctaPrimary,
                      "w-full justify-center py-3.5",
                      (loading || name.trim().length < 2) &&
                        "opacity-60 pointer-events-none",
                    )}
                  >
                    {loading ? <LoadingDots /> : "ساخت حساب کاربری"}
                  </button>
                </div>
              </div>
            )}

            {/* ═══ SUCCESS STEP ═══ */}
            {step === "success" && (
              <div className="auth-fade-in flex flex-col items-center gap-6 py-6 text-center">
                <SuccessCheck />

                <div>
                  <h1 className={cn(typography.h3, "text-xl")}>
                    {isExistingUser ? "ورود موفق!" : "ثبت‌نام موفق!"}
                  </h1>
                  <p
                    className={cn(
                      "mt-2 max-w-xs",
                      typography.bodySmall,
                      "text-slate-400",
                    )}
                  >
                    {isExistingUser
                      ? "خوش آمدی! در حال انتقال به داشبورد..."
                      : "حساب شما ساخته شد. در حال انتقال به داشبورد..."}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs">
                  <div
                    className={cn(
                      "h-1 overflow-hidden rounded-full",
                      "bg-white/[0.06]",
                    )}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full bg-linear-to-r",
                        accentTokens.emerald.gradient,
                      )}
                      style={{
                        animation: "toast-progress 3s linear forwards",
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className={cn(
                    components.ctaPrimary,
                    "w-full max-w-xs justify-center py-3.5",
                  )}
                >
                  <span className="relative z-10">رفتن به داشبورد</span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="relative z-10 h-4 w-4 -scale-x-100"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            )}

            {/* ── Footer ── */}
            {step !== "success" && (
              <div
                className={cn(
                  "mt-8 pt-5 text-center",
                  "border-t border-white/[0.06]",
                )}
              >
                <p className={cn(typography.labelSmall, "text-slate-500")}>
                  با ورود یا ثبت‌نام،{" "}
                  <Link
                    href="#terms"
                    className={cn(accentTokens.sky.text, "hover:underline")}
                  >
                    قوانین
                  </Link>{" "}
                  و{" "}
                  <Link
                    href="#privacy"
                    className={cn(accentTokens.sky.text, "hover:underline")}
                  >
                    حریم خصوصی
                  </Link>{" "}
                  را می‌پذیرید.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border px-5 py-2.5",
            borders.subtle,
            "bg-[#0c1a30]/80 backdrop-blur-xl",
            "text-xs font-medium text-slate-400",
            animation.base,
            "hover:text-white hover:border-white/12",
            focus.ring,
          )}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
              clipRule="evenodd"
            />
          </svg>
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
    </>
  );
}
