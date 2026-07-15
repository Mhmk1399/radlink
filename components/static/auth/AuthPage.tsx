"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/components/ui/CustomToast";
import {
  cn,
  backgrounds,
  gradients,
  borders,
  typography,
  layout,
  animation,
  focus,
  components,
  accentTokens,
} from "@/lib/design/design-system";
import {
  isValidEmail,
  isValidNationalCode,
  isValidPhoneNumber,
  normalizeNationalCode,
  normalizePhoneNumber,
} from "@/lib/validation/identityFields";

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
@keyframes auth-pop-in{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
.auth-fade-in{animation:auth-fade-in .5s cubic-bezier(.22,1,.36,1) both}
.auth-slide-left{animation:auth-slide-left .4s cubic-bezier(.22,1,.36,1) both}
.auth-slide-right{animation:auth-slide-right .4s cubic-bezier(.22,1,.36,1) both}
.auth-shake{animation:auth-shake .4s ease-in-out}
.auth-pulse-dot{animation:auth-pulse-dot 1.4s ease-in-out infinite}
.auth-check-draw{animation:auth-check-draw .4s ease-out both;stroke-dasharray:20;stroke-dashoffset:0}
.auth-pop-in{animation:auth-pop-in .32s cubic-bezier(.34,1.56,.64,1) both}
@media (prefers-reduced-motion: reduce){
  .auth-fade-in,.auth-slide-left,.auth-slide-right,.auth-shake,.auth-pop-in{animation:none!important}
}
`;

/* ══════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════ */

type AuthStep = "phone" | "otp" | "register" | "setPassword" | "success";

// Matches backend IUser shape returned from verify-otp & /me
interface BackendUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  agentid?: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  nationalCode?: string;
  fatherName?: string;
  role: "user" | "agent" | "admin" | "superAdmin";
  status: "active" | "inactive";
  permissions: string[];
  limits: {
    files: number;
    blocks: number;
    pages: number;
  };
  lastLoginAt?: string;
  lastOtpRequestAt?: string;
  phoneVerifiedAt?: string;
  isPhoneVerified: boolean;
  isDeleted: boolean;
  hasPassword?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const OTP_LENGTH = 6; // Backend generates 6-digit OTP
const OTP_EXPIRY = 120; // seconds — matches backend 2 * 60_000 ms
const ADMIN_CREATED_PASSWORD_HINT =
  "اگر حساب شما توسط ادمین ساخته شده و هنوز رمز عبور ندارید، از تب «ورود با پیامک» وارد شوید؛ بعد از تایید پیامک، همین‌جا برای حساب خود رمز عبور می‌سازید.";
const PASSWORD_LOGIN_GENERIC_ERROR = "شماره موبایل یا رمز عبور اشتباه است.";
const PASSWORD_LOGIN_FALLBACK_ERROR = `${PASSWORD_LOGIN_GENERIC_ERROR} ${ADMIN_CREATED_PASSWORD_HINT}`;
const RESEND_COOLDOWN = 60; // seconds — matches backend 60_000 ms
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

/* ══════════════════════════════════════════════
   API HELPERS
   ══════════════════════════════════════════════ */

async function apiSendOtp(phoneNumber: string): Promise<void> {
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface backend message directly so Persian/English messages show correctly
    throw { status: res.status, message: data.message ?? "خطا در ارسال کد" };
  }
}

async function apiVerifyOtp(
  phoneNumber: string,
  otp: string,
): Promise<{ token: string; user: BackendUser }> {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, otp }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, message: data.message ?? "خطا در تأیید کد" };
  }

  return data;
}

async function apiLoginWithPassword(
  phoneNumber: string,
  password: string,
): Promise<{ token: string; user: BackendUser }> {
  const res = await fetch("/api/auth/login-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw { status: res.status, message: data.message ?? "خطا در ورود" };
  }

  return data;
}

async function apiUpdateProfile(
  token: string,
  data: {
    firstName: string;
    lastName: string;
    email?: string;
    nationalCode?: string;
    fatherName?: string;
    password?: string;
    passwordConfirm?: string;
  }
): Promise<BackendUser> {
  const res = await fetch("/api/auth/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!res.ok) {
    throw { status: res.status, message: response.message ?? "خطا در ثبت اطلاعات" };
  }

  return response.user ?? response;
}

async function apiSetPassword(
  token: string,
  data: {
    newPassword: string;
    newPasswordConfirm: string;
  },
): Promise<{ hasPassword: boolean }> {
  const res = await fetch("/api/auth/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!res.ok) {
    throw {
      status: res.status,
      message: response.message ?? "ذخیره رمز عبور با خطا مواجه شد.",
    };
  }

  return { hasPassword: response.hasPassword === true };
}

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
  return isValidPhoneNumber(normalizePhoneNumber(phone));
}

function validatePasswordStrength(password: string, phoneNumber?: string) {
  if (password.length < PASSWORD_MIN_LENGTH)
    return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  if (password.length > PASSWORD_MAX_LENGTH)
    return "رمز عبور نباید بیشتر از ۷۲ کاراکتر باشد.";
  if (/\s/.test(password)) return "رمز عبور نباید فاصله داشته باشد.";
  if (!/[a-z]/.test(password))
    return "رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد.";
  if (!/[A-Z]/.test(password))
    return "رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد.";
  if (!/\d/.test(password)) return "رمز عبور باید حداقل یک عدد داشته باشد.";
  if (!/[^A-Za-z0-9]/.test(password))
    return "رمز عبور باید حداقل یک نشانه مثل ! یا @ داشته باشد.";
  if (phoneNumber && password.includes(phoneNumber))
    return "رمز عبور نباید شامل شماره موبایل باشد.";
  return "";
}

/** Normalize Persian/Arabic digits typed on a mobile keyboard to Latin digits */
function normalizeDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Keep only digits, tolerating Persian/Arabic numerals */
function onlyDigits(str: string): string {
  return normalizeDigits(str).replace(/\D/g, "");
}

function toFarsiDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function secondsToTimer(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return toFarsiDigits(`${m}:${sec.toString().padStart(2, "0")}`);
}

/** Map backend error status codes to Persian messages */
function resolveErrorMessage(
  err: { status?: number; message?: string },
  context: "send" | "verify",
): string {
  if (err.status === 429) return "لطفاً ۶۰ ثانیه صبر کنید و دوباره تلاش کنید.";
  if (err.status === 403)
    return "حساب شما مسدود شده است. با پشتیبانی تماس بگیرید.";
  if (err.status === 401) {
    return context === "verify"
      ? "کد وارد شده اشتباه یا منقضی شده است."
      : "خطا در احراز هویت.";
  }
  if (err.status === 400) return "اطلاعات وارد شده نامعتبر است.";
  return err.message ?? "خطای سرور. لطفاً دوباره تلاش کنید.";
}

/* ══════════════════════════════════════════════
   SHARED UI
   ══════════════════════════════════════════════ */

function LogoMark() {
  return (
    <div className="flex min-h-14 items-center justify-center">
      <Image
        src="/assets/images/radlinklogo.png"
        width={160}
        height={48}
        alt="رادلینک"
        priority
        className="h-10 w-auto object-contain sm:h-11"
      />
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
        "flex h-20 w-20 items-center justify-center rounded-full auth-pop-in",
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
   REUSABLE TEXT FIELD
   Handles: label, autofocus, numeric keyboard, error state
   ══════════════════════════════════════════════ */

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
  /** numeric = digits-only + numeric mobile keyboard */
  numeric?: boolean;
  maxLength?: number;
  dir?: "ltr" | "rtl";
  type?: "text" | "tel" | "email" | "password";
  autoComplete?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  hint?: string;
  errorMessage?: string;
}

function Field({
  id,
  label,
  required,
  value,
  onChange,
  onEnter,
  placeholder,
  disabled,
  autoFocus,
  error,
  numeric,
  maxLength,
  dir,
  type = "text",
  autoComplete,
  inputRef,
  hint,
  errorMessage,
}: FieldProps) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      // slight delay so step-enter animation doesn't fight the focus scroll
      const id = setTimeout(() => ref.current?.focus(), 60);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-slate-300"
      >
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          name={id}
          type={
            numeric ? "text" : isPassword && showPassword ? "text" : type
          }
          dir={dir ?? (numeric || type === "email" ? "ltr" : undefined)}
          {...(numeric
            ? {
                inputMode: "numeric" as const,
                pattern: "[0-9]*",
                autoComplete: "one-time-code",
              }
            : {})}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) =>
            onChange(numeric ? onlyDigits(e.target.value) : e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) onEnter();
          }}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border px-4 py-3.5 text-base font-medium text-white placeholder:text-slate-500 outline-none",
            numeric && "tracking-wide",
            isPassword && "pl-11",
            animation.smooth,
            error
              ? "border-red-400/40 bg-red-400/4"
              : cn(borders.light, backgrounds.surface.glass),
            "focus:border-yellow-400/50 focus:bg-yellow-400/4 focus:ring-2 focus:ring-yellow-400/20",
            disabled && "opacity-60 cursor-not-allowed",
          )}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((s) => !s)}
            disabled={disabled}
            aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300",
              animation.colors,
              disabled && "pointer-events-none opacity-60",
            )}
          >
            {showPassword ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" />
                <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                <path fillRule="evenodd" d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" clipRule="evenodd" />
                <path
                  fillRule="evenodd"
                  d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14.5 10a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {errorMessage ? (
        <p className="mt-1.5 text-[11px] font-medium text-red-400">
          {errorMessage}
        </p>
      ) : hint && !error ? (
        <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════════
   OTP INPUT — 6 digits, numeric keyboard, autofocus
   ══════════════════════════════════════════════ */

function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  error,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) {
      const id = setTimeout(() => inputsRef.current[0]?.focus(), 120);
      return () => clearTimeout(id);
    }
  }, [autoFocus]);

  const handleChange = (index: number, raw: string) => {
    if (disabled) return;
    const sanitized = onlyDigits(raw);

    // Support typing/pasting multiple digits into one box
    if (sanitized.length > 1) {
      const arr = value.split("");
      let cursor = index;
      for (const ch of sanitized) {
        if (cursor >= length) break;
        arr[cursor] = ch;
        cursor++;
      }
      const newVal = arr.join("").slice(0, length);
      onChange(newVal);
      inputsRef.current[Math.min(cursor, length - 1)]?.focus();
      return;
    }

    if (!sanitized && raw !== "") return;

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
    // RTL layout: ArrowLeft moves to the next (visually left) box
    if (e.key === "ArrowLeft" && index < length - 1)
      inputsRef.current[index + 1]?.focus();
    if (e.key === "ArrowRight" && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = onlyDigits(e.clipboardData.getData("text")).slice(0, length);
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
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          onPaste={handlePaste}
          aria-label={`رقم ${i + 1} کد تأیید`}
          className={cn(
            "h-14 w-10 rounded-xl border text-center text-xl font-bold text-white caret-yellow-400 outline-none sm:h-16 sm:w-12",
            animation.smooth,
            disabled ? "opacity-50 cursor-not-allowed" : "",
            error
              ? "border-red-400/40 bg-red-400/6 text-red-300"
              : value[i]
                ? cn(accentTokens.amber.border, "bg-yellow-400/6")
                : cn(borders.light, backgrounds.surface.glass),
            !disabled &&
              !error &&
              "focus:border-yellow-400/50 focus:bg-yellow-400/8 focus:ring-2 focus:ring-yellow-400/20 focus:scale-105",
          )}
        />
      ))}
    </div>
  );
}

/* Small inline error line used across steps */
function ErrorLine({ msg, center }: { msg: string; center?: boolean }) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-red-400 auth-slide-right",
        center && "justify-center",
      )}
    >
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
        <path
          fillRule="evenodd"
          d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      {msg}
    </p>
  );
}

/* ══════════════════════════════════════════════
   AUTH COMPONENT
   ══════════════════════════════════════════════ */

export default function AuthPage() {
  const router = useRouter();

  // ── State ──
  const [step, setStep] = useState<AuthStep>("phone");
  const [authMode, setAuthMode] = useState<"sms" | "password">("sms");
  const [phone, setPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<
    Record<string, string>
  >({});
  const [timer, setTimer] = useState(OTP_EXPIRY);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [, setCurrentUser] = useState<BackendUser | null>(null);
  const [authToken, setAuthToken] = useState("");
  const [animKey, setAnimKey] = useState(0);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);

  const phoneComplete = phone.length === 11;
  const phoneValid = isValidIranPhone(phone);
  const loginPasswordReady = loginPassword.length > 0;
  const registerPasswordReady =
    !validatePasswordStrength(registerPassword, normalizePhoneNumber(phone)) &&
    registerPassword === registerPasswordConfirm;

  // ── Timer ──
  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  // ── Resend cooldown ──
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const changeStep = (newStep: AuthStep) => {
    setAnimKey((k) => k + 1);
    setStep(newStep);
    setError("");
  };

  /* ────────────────────────────────────────────
     STEP 1: Send OTP → POST /api/auth/send-otp
  ──────────────────────────────────────────── */
  const handleSendOtp = useCallback(async () => {
    const cleanPhone = normalizePhoneNumber(phone);

    if (!isValidIranPhone(cleanPhone)) {
      setError("شماره موبایل معتبر نیست");
      toast.error("لطفاً یک شماره موبایل معتبر وارد کنید.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiSendOtp(cleanPhone);

      toast.info(`کد تأیید به ${formatPhone(cleanPhone)} ارسال شد.`, {
        title: "کد ارسال شد",
      });

      setTimer(OTP_EXPIRY);
      setResendCooldown(RESEND_COOLDOWN);
      changeStep("otp");
    } catch (err: unknown) {
      const msg = resolveErrorMessage(
        err as { status?: number; message?: string },
        "send",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [phone]);

  /* ────────────────────────────────────────────
     STEP 2: Verify OTP → POST /api/auth/verify-otp
  ──────────────────────────────────────────── */
  const handlePasswordLogin = useCallback(async () => {
    const cleanPhone = normalizePhoneNumber(phone);

    if (!isValidIranPhone(cleanPhone)) {
      setError("شماره موبایل معتبر نیست");
      toast.error("لطفاً یک شماره موبایل معتبر وارد کنید.");
      return;
    }

    if (!loginPassword) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { token, user } = await apiLoginWithPassword(
        cleanPhone,
        loginPassword,
      );

      localStorage.setItem("auth_token", token);
      setAuthToken(token);
      setCurrentUser(user);
      setIsExistingUser(true);

      const displayName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ");
      toast.success(
        displayName ? `خوش آمدی ${displayName}!` : "ورود با موفقیت انجام شد.",
        { title: "ورود موفق" },
      );
      changeStep("success");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      const apiMessage = apiError.message?.trim();
      const msg =
        apiMessage && apiMessage !== PASSWORD_LOGIN_GENERIC_ERROR
          ? apiMessage
          : PASSWORD_LOGIN_FALLBACK_ERROR;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [loginPassword, phone]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) return;

    setLoading(true);
    setOtpError(false);
    setError("");

    try {
      const cleanPhone = normalizePhoneNumber(phone);
      const { token, user } = await apiVerifyOtp(cleanPhone, otp);

      setAuthToken(token);
      setCurrentUser(user);

      const hasProfile = Boolean(user.firstName);
      setIsExistingUser(hasProfile);

      if (hasProfile && !user.hasPassword) {
        setRegisterPassword("");
        setRegisterPasswordConfirm("");
        setRegisterErrors({});
        toast.info("برای تکمیل ورود، یک رمز عبور برای حساب خود بسازید.", {
          title: "تنظیم رمز عبور",
        });
        changeStep("setPassword");
      } else if (hasProfile) {
        localStorage.setItem("auth_token", token);
        const displayName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ");
        toast.success(`خوش آمدی ${displayName}!`, { title: "ورود موفق" });
        changeStep("success");
      } else {
        toast.info("لطفاً اطلاعات خود را تکمیل کنید.", { title: "ثبت‌نام" });
        changeStep("register");
      }
    } catch (err: unknown) {
      setOtpError(true);
      const msg = resolveErrorMessage(
        err as { status?: number; message?: string },
        "verify",
      );
      setError(msg);
      toast.error(msg);
      setOtp("");
    } finally {
      setLoading(false);
    }
  }, [otp, phone]);

  /* ────────────────────────────────────────────
     STEP 3: Register → PATCH /api/auth/me
  ──────────────────────────────────────────── */
  useEffect(() => {
    if (otp.length !== OTP_LENGTH || step !== "otp") return;
    const id = window.setTimeout(() => {
      void handleVerifyOtp();
    }, 0);
    return () => window.clearTimeout(id);
  }, [handleVerifyOtp, otp, step]);

  const handleRegister = useCallback(async () => {
    if (firstName.trim().length < 2) {
      setError("نام الزامی است (حداقل ۲ کاراکتر)");
      toast.warning("لطفاً نام خود را وارد کنید.");
      return;
    }

    const nextErrors: Record<string, string> = {};
    if (email.trim() && !isValidEmail(email))
      nextErrors.email = "فرمت ایمیل معتبر نیست.";
    if (nationalCode && !isValidNationalCode(nationalCode))
      nextErrors.nationalCode = "کد ملی باید دقیقاً ۱۰ رقم باشد.";
    const passwordError = validatePasswordStrength(
      registerPassword,
      normalizePhoneNumber(phone),
    );
    if (passwordError) nextErrors.password = passwordError;
    if (registerPassword !== registerPasswordConfirm)
      nextErrors.passwordConfirm = "تکرار رمز عبور با رمز عبور یکسان نیست.";
    if (Object.keys(nextErrors).length) {
      setRegisterErrors(nextErrors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updatedUser = await apiUpdateProfile(authToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        nationalCode: nationalCode.trim() || undefined,
        fatherName: fatherName.trim() || undefined,
        password: registerPassword,
        passwordConfirm: registerPasswordConfirm,
      });

      setCurrentUser(updatedUser);
      localStorage.setItem("auth_token", authToken);

      const displayName = [firstName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(" ");
      toast.success(`حساب شما ساخته شد. خوش آمدی ${displayName}!`, {
        title: "ثبت‌نام موفق",
      });

      changeStep("success");
    } catch (err: unknown) {
      const msg = resolveErrorMessage(
        err as { status?: number; message?: string },
        "send",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [
    firstName,
    lastName,
    email,
    nationalCode,
    fatherName,
    registerPassword,
    registerPasswordConfirm,
    phone,
    authToken,
  ]);

  const handleSetPassword = useCallback(async () => {
    const passwordError = validatePasswordStrength(
      registerPassword,
      normalizePhoneNumber(phone),
    );
    const nextErrors: Record<string, string> = {};
    if (passwordError) nextErrors.password = passwordError;
    if (registerPassword !== registerPasswordConfirm) {
      nextErrors.passwordConfirm = "تکرار رمز عبور با رمز عبور یکسان نیست.";
    }
    if (Object.keys(nextErrors).length) {
      setRegisterErrors(nextErrors);
      return;
    }

    if (!authToken) {
      const msg = "نشست ورود معتبر نیست. لطفاً دوباره با پیامک وارد شوید.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiSetPassword(authToken, {
        newPassword: registerPassword,
        newPasswordConfirm: registerPasswordConfirm,
      });

      setCurrentUser((current) =>
        current ? { ...current, hasPassword: true } : current,
      );
      localStorage.setItem("auth_token", authToken);
      toast.success("رمز عبور حساب شما ذخیره شد.", {
        title: "ورود تکمیل شد",
      });
      changeStep("success");
    } catch (err: unknown) {
      const msg = resolveErrorMessage(
        err as { status?: number; message?: string },
        "send",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [authToken, phone, registerPassword, registerPasswordConfirm]);

  /* ────────────────────────────────────────────
     Resend OTP
  ──────────────────────────────────────────── */
  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0) return;

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, "");
      await apiSendOtp(cleanPhone);

      setTimer(OTP_EXPIRY);
      setResendCooldown(RESEND_COOLDOWN);
      setOtp("");
      setOtpError(false);
      setError("");

      toast.success("کد جدید ارسال شد.", { title: "ارسال مجدد" });
    } catch (err: unknown) {
      const msg = resolveErrorMessage(
        err as { status?: number; message?: string },
        "send",
      );
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [resendCooldown, phone]);

  // ── Back to phone step ──
  const handleBack = () => {
    if (step === "register" || step === "setPassword") {
      localStorage.removeItem("auth_token");
      setAuthToken("");
      setCurrentUser(null);
      setIsExistingUser(false);
      setRegisterPassword("");
      setRegisterPasswordConfirm("");
      setRegisterErrors({});
    }
    setOtp("");
    setOtpError(false);
    setError("");
    changeStep("phone");
  };

  // ── After success, redirect to dashboard ──
  useEffect(() => {
    if (step === "success") {
      const id = setTimeout(() => router.push("/admin"), 3000);
      return () => clearTimeout(id);
    }
  }, [step, router]);

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
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
              "absolute left-1/2 top-1/2 h-200 w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]",
              backgrounds.glow.hero,
            )}
          />
          <div
            className={cn(
              "absolute right-0 top-1/4 h-80 w-80 rounded-full blur-3xl",
              backgrounds.glow.hero,
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
            className={cn("absolute inset-x-0 top-0 h-px", gradients.primary)}
          />

          {/* Step progress indicator */}
          <div className="relative flex items-center justify-center gap-2 pt-5">
            {(
              ["phone", "otp", step === "setPassword" ? "setPassword" : "register"] as AuthStep[]
            ).map((s, i) => {
              const order: AuthStep[] = [
                "phone",
                "otp",
                step === "setPassword" ? "setPassword" : "register",
                "success",
              ];
              const currentIdx = order.indexOf(step);
              const done = currentIdx > i;
              const active = currentIdx === i;
              return (
                <span
                  key={s}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    active
                      ? "w-6 bg-yellow-400"
                      : done
                        ? "w-1.5 bg-emerald-400"
                        : "w-1.5 bg-white/15",
                  )}
                />
              );
            })}
          </div>

          {/* Content */}
          <div className="relative p-7 pt-5 sm:p-9 sm:pt-6" key={animKey}>
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
                      شماره موبایل را وارد کنید و با پیامک یا رمز عبور وارد شوید
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                    {(["sms", "password"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setAuthMode(mode);
                          setError("");
                        }}
                        className={cn(
                          "h-10 rounded-lg text-sm font-bold transition-all duration-200",
                          authMode === mode
                            ? "bg-yellow-400 text-slate-950"
                            : "text-slate-400 hover:bg-white/8 hover:text-white",
                        )}
                      >
                        {mode === "sms" ? "ورود با پیامک" : "ورود با رمز"}
                      </button>
                    ))}
                  </div>

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
                        name="phoneNumber"
                        type="text"
                        dir="ltr"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="username"
                        autoFocus
                        placeholder="09123456789"
                        maxLength={11}
                        value={phone}
                        onChange={(e) => {
                          setPhone(onlyDigits(e.target.value).slice(0, 11));
                          setError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" || !phoneComplete) return;
                          if (authMode === "password") handlePasswordLogin();
                          else handleSendOtp();
                        }}
                        disabled={loading}
                        className={cn(
                          "w-full rounded-xl border px-4 py-3.5 pr-12 text-left text-base font-medium tracking-wide text-white placeholder:text-slate-500 outline-none",
                          animation.smooth,
                          error
                            ? "border-red-400/40 bg-red-400/4"
                            : phoneValid
                              ? cn(accentTokens.emerald.border, "bg-emerald-400/4")
                              : cn(borders.light, backgrounds.surface.glass),
                          "focus:border-yellow-400/50 focus:bg-yellow-400/4 focus:ring-2 focus:ring-yellow-400/20",
                          loading && "opacity-60 cursor-not-allowed",
                        )}
                      />
                      {/* Phone / valid icon */}
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {phoneValid ? (
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-5 w-5 text-emerald-400 auth-pop-in"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
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
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="mt-2">
                        <ErrorLine msg={error} />
                      </div>
                    )}
                  </div>

                  {authMode === "password" && (
                    <Field
                      id="loginPassword"
                      label="رمز عبور"
                      type="password"
                      autoComplete="current-password"
                      placeholder="رمز عبور حساب"
                      value={loginPassword}
                      onChange={(value) => {
                        setLoginPassword(value);
                        setError("");
                      }}
                      onEnter={handlePasswordLogin}
                      disabled={loading}
                      hint={ADMIN_CREATED_PASSWORD_HINT}
                    />
                  )}

                  <button
                    type="button"
                    onClick={
                      authMode === "password"
                        ? handlePasswordLogin
                        : handleSendOtp
                    }
                    disabled={
                      loading ||
                      !phoneComplete ||
                      (authMode === "password" && !loginPasswordReady)
                    }
                    className={cn(
                      components.ctaPrimary,
                      "w-full justify-center py-3.5",
                      (loading ||
                        !phoneComplete ||
                        (authMode === "password" && !loginPasswordReady)) &&
                        "pointer-events-none opacity-60",
                    )}
                  >
                    {loading ? (
                      <LoadingDots />
                    ) : authMode === "password" ? (
                      "ورود با رمز عبور"
                    ) : (
                      "دریافت کد تأیید"
                    )}
                  </button>
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
                      "absolute right-5 top-2 flex h-9 w-9 items-center justify-center",
                      layout.radius.md,
                      borders.subtle,
                      backgrounds.surface.glass,
                      "text-slate-400",
                      animation.base,
                      "hover:text-white hover:bg-white/8",
                      focus.ring,
                    )}
                    aria-label="بازگشت و ویرایش شماره"
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
                      کد ۶ رقمی ارسال شده به{" "}
                      <span dir="ltr" className="font-mono text-yellow-300">
                        {formatPhone(phone)}
                      </span>{" "}
                      را وارد کنید
                    </p>
                    {/* quick edit link */}
                    <button
                      type="button"
                      onClick={handleBack}
                      className={cn(
                        "mt-1 text-[11px] font-medium",
                        accentTokens.amber.text,
                        "hover:underline",
                      )}
                    >
                      ویرایش شماره موبایل
                    </button>
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
                    autoFocus
                  />

                  {error && <ErrorLine msg={error} center />}

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
                          : cn(
                              accentTokens.amber.text,
                              "hover:text-yellow-200",
                            ),
                      )}
                    >
                      {resendCooldown > 0
                        ? `ارسال مجدد (${secondsToTimer(resendCooldown)})`
                        : "ارسال مجدد کد"}
                    </button>
                  </div>

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

            {/* ═══ SET PASSWORD STEP ═══ */}
            {step === "setPassword" && (
              <div className="auth-slide-left">
                <div className="flex flex-col items-center gap-4 text-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={cn(
                      "absolute right-5 top-2 flex h-9 w-9 items-center justify-center",
                      layout.radius.md,
                      borders.subtle,
                      backgrounds.surface.glass,
                      "text-slate-400",
                      animation.base,
                      "hover:text-white hover:bg-white/8",
                      focus.ring,
                    )}
                    aria-label="بازگشت و ویرایش شماره"
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
                    <h1 className={cn(typography.h3, "text-xl")}>
                      ساخت رمز عبور
                    </h1>
                    <p
                      className={cn(
                        "mt-2",
                        typography.bodySmall,
                        "text-slate-400",
                      )}
                    >
                      شماره شما تایید شد. برای ورودهای بعدی، همین حالا یک رمز
                      عبور امن بسازید.
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
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
                      className="h-4 w-4 shrink-0 text-emerald-400"
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
                      {formatPhone(phone)}
                    </span>
                    <span className="mr-auto text-[10px] text-emerald-400">
                      تایید شده
                    </span>
                  </div>

                  <Field
                    id="setPassword"
                    label="رمز عبور"
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="حداقل ۸ کاراکتر"
                    value={registerPassword}
                    onChange={(value) => {
                      setRegisterPassword(value);
                      setRegisterErrors((current) => {
                        const next = { ...current };
                        const message = validatePasswordStrength(
                          value,
                          normalizePhoneNumber(phone),
                        );
                        if (message) next.password = message;
                        else delete next.password;
                        if (
                          registerPasswordConfirm &&
                          value !== registerPasswordConfirm
                        ) {
                          next.passwordConfirm =
                            "تکرار رمز عبور با رمز عبور یکسان نیست.";
                        } else {
                          delete next.passwordConfirm;
                        }
                        return next;
                      });
                      setError("");
                    }}
                    onEnter={handleSetPassword}
                    disabled={loading}
                    hint="حرف بزرگ، حرف کوچک، عدد و نشانه مثل ! یا @ لازم است."
                    error={Boolean(registerErrors.password)}
                    errorMessage={registerErrors.password}
                  />

                  <Field
                    id="setPasswordConfirm"
                    label="تکرار رمز عبور"
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="رمز عبور را دوباره وارد کنید"
                    value={registerPasswordConfirm}
                    onChange={(value) => {
                      setRegisterPasswordConfirm(value);
                      setRegisterErrors((current) => {
                        const next = { ...current };
                        if (registerPassword && value !== registerPassword) {
                          next.passwordConfirm =
                            "تکرار رمز عبور با رمز عبور یکسان نیست.";
                        } else {
                          delete next.passwordConfirm;
                        }
                        return next;
                      });
                      setError("");
                    }}
                    onEnter={handleSetPassword}
                    disabled={loading}
                    error={Boolean(registerErrors.passwordConfirm)}
                    errorMessage={registerErrors.passwordConfirm}
                  />

                  {error && <ErrorLine msg={error} />}

                  <button
                    type="button"
                    onClick={handleSetPassword}
                    disabled={loading || !registerPasswordReady}
                    className={cn(
                      components.ctaPrimary,
                      "w-full justify-center py-3.5",
                      (loading || !registerPasswordReady) &&
                        "opacity-60 pointer-events-none",
                    )}
                  >
                    {loading ? <LoadingDots /> : "ذخیره رمز و ورود"}
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
                      نام و رمز عبور الزامی است؛ بعداً با همین رمز و شماره موبایل می‌توانید بدون پیامک وارد شوید
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {/* Verified phone badge */}
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
                      className="h-4 w-4 shrink-0 text-emerald-400"
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
                      {formatPhone(phone)}
                    </span>
                    <span className="mr-auto text-[10px] text-emerald-400">
                      تأیید شده
                    </span>
                  </div>

                  <Field
                    id="firstName"
                    label="نام"
                    required
                    placeholder="مثلاً: علی"
                    value={firstName}
                    onChange={(v) => {
                      setFirstName(v);
                      setError("");
                    }}
                    onEnter={handleRegister}
                    disabled={loading}
                    autoFocus
                    error={Boolean(error && firstName.trim().length < 2)}
                    inputRef={firstNameRef}
                  />

                  <Field
                    id="lastName"
                    label="نام خانوادگی"
                    placeholder="مثلاً: رضایی"
                    value={lastName}
                    onChange={(v) => {
                      setLastName(v);
                      setError("");
                    }}
                    onEnter={handleRegister}
                    disabled={loading}
                  />

                  <Field
                    id="email"
                    label="ایمیل"
                    type="email"
                    dir="ltr"
                    maxLength={254}
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(v) => {
                      setEmail(v);
                      setRegisterErrors((current) => {
                        const next = { ...current };
                        const message =
                          v.trim() && !isValidEmail(v)
                            ? "فرمت ایمیل معتبر نیست."
                            : "";
                        if (message) next.email = message;
                        else delete next.email;
                        return next;
                      });
                      setError("");
                    }}
                    onEnter={handleRegister}
                    disabled={loading}
                    error={Boolean(registerErrors.email)}
                    errorMessage={registerErrors.email}
                  />

                  <Field
                    id="nationalCode"
                    label="کد ملی"
                    numeric
                    maxLength={10}
                    placeholder="0123456789"
                    value={nationalCode}
                    onChange={(v) => {
                      const normalized = normalizeNationalCode(v);
                      setNationalCode(normalized);
                      setRegisterErrors((current) => {
                        const next = { ...current };
                        if (
                          normalized &&
                          !isValidNationalCode(normalized)
                        )
                          next.nationalCode =
                            "کد ملی باید دقیقاً ۱۰ رقم باشد.";
                        else delete next.nationalCode;
                        return next;
                      });
                      setError("");
                    }}
                    onEnter={handleRegister}
                    disabled={loading}
                    hint="۱۰ رقم بدون خط تیره"
                    error={Boolean(registerErrors.nationalCode)}
                    errorMessage={registerErrors.nationalCode}
                  />

                  <Field
                    id="fatherName"
                    label="نام پدر"
                    placeholder="مثلاً: محمد"
                    value={fatherName}
                    onChange={(v) => {
                      setFatherName(v);
                      setError("");
                    }}
                    onEnter={handleRegister}
                    disabled={loading}
                  />

                  <Field
                    id="registerPassword"
                    label="رمز عبور"
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="حداقل ۸ کاراکتر"
                    value={registerPassword}
                    onChange={(value) => {
                      setRegisterPassword(value);
                      setRegisterErrors((current) => {
                        const next = { ...current };
                        const message = validatePasswordStrength(
                          value,
                          normalizePhoneNumber(phone),
                        );
                        if (message) next.password = message;
                        else delete next.password;
                        if (
                          registerPasswordConfirm &&
                          value !== registerPasswordConfirm
                        )
                          next.passwordConfirm =
                            "تکرار رمز عبور با رمز عبور یکسان نیست.";
                        else delete next.passwordConfirm;
                        return next;
                      });
                      setError("");
                    }}
                    onEnter={handleRegister}
                    disabled={loading}
                    hint="حرف بزرگ، حرف کوچک، عدد و نشانه مثل ! یا @ لازم است."
                    error={Boolean(registerErrors.password)}
                    errorMessage={registerErrors.password}
                  />

                  <Field
                    id="registerPasswordConfirm"
                    label="تکرار رمز عبور"
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="رمز عبور را دوباره وارد کنید"
                    value={registerPasswordConfirm}
                    onChange={(value) => {
                      setRegisterPasswordConfirm(value);
                      setRegisterErrors((current) => {
                        const next = { ...current };
                        if (registerPassword && value !== registerPassword)
                          next.passwordConfirm =
                            "تکرار رمز عبور با رمز عبور یکسان نیست.";
                        else delete next.passwordConfirm;
                        return next;
                      });
                      setError("");
                    }}
                    onEnter={handleRegister}
                    disabled={loading}
                    error={Boolean(registerErrors.passwordConfirm)}
                    errorMessage={registerErrors.passwordConfirm}
                  />

                  {error && <ErrorLine msg={error} />}

                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={
                      loading ||
                      firstName.trim().length < 2 ||
                      !registerPasswordReady
                    }
                    className={cn(
                      components.ctaPrimary,
                      "w-full justify-center py-3.5",
                      (loading ||
                        firstName.trim().length < 2 ||
                        !registerPasswordReady) &&
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
                      "bg-white/6",
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
                  href="/admin"
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
                  "border-t border-white/6",
                )}
              >
                <p className={cn(typography.labelSmall, "text-slate-500")}>
                  با ورود یا ثبت‌نام،{" "}
                  <Link
                    href="#terms"
                    className={cn(accentTokens.amber.text, "hover:underline")}
                  >
                    قوانین
                  </Link>{" "}
                  و{" "}
                  <Link
                    href="#privacy"
                    className={cn(accentTokens.amber.text, "hover:underline")}
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
