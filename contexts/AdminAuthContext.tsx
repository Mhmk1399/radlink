"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/CustomToast";

type AdminAuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isChecking: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

let hasShownMissingTokenToast = false;
let hasShownExpiredTokenToast = false;
const AUTH_STORAGE_KEYS = ["auth_token", "token", "accessToken", "jwt"];

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem("auth_token");
  return token && token.trim() ? token : null;
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;

  AUTH_STORAGE_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    try {
      window.sessionStorage.removeItem(key);
    } catch {}
    window.document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  try {
    window.localStorage.removeItem("radlink_admin_profile_override");
  } catch {}
}

function AdminAuthFallback() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 text-center"
      dir="rtl"
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 shadow-2xl">
        <p className="text-sm font-bold text-white">در حال بررسی ورود...</p>
        <p className="mt-2 text-xs text-slate-300">
          برای ورود به پنل مدیریت باید وارد حساب کاربری شوید.
        </p>
      </div>
    </main>
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const redirectedRef = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function redirectToAuth() {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.replace("/auth");
    }

    async function verifyAdminToken() {
      const authToken = readAuthToken();

      if (!authToken) {
        if (!hasShownMissingTokenToast) {
          hasShownMissingTokenToast = true;
          toast.warning("برای ورود به پنل مدیریت ابتدا وارد حساب کاربری شوید.", {
            title: "نیاز به ورود",
          });
        }

        clearStoredAuth();
        if (!cancelled) {
          setToken(null);
          setIsChecking(false);
          redirectToAuth();
        }
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.status === 401 || response.status === 403) {
          clearStoredAuth();

          if (!hasShownExpiredTokenToast) {
            hasShownExpiredTokenToast = true;
            toast.warning("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.", {
              title: "نیاز به ورود مجدد",
            });
          }

          if (!cancelled) {
            setToken(null);
            setIsChecking(false);
            redirectToAuth();
          }
          return;
        }

        if (!cancelled) {
          setToken(authToken);
          setIsChecking(false);
        }
      } catch {
        if (!cancelled) {
          setToken(authToken);
          setIsChecking(false);
        }
      }
    }

    void verifyAdminToken();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isChecking,
    }),
    [isChecking, token],
  );

  if (isChecking || !value.isAuthenticated) {
    return (
      <AdminAuthContext.Provider value={value}>
        <AdminAuthFallback />
      </AdminAuthContext.Provider>
    );
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  }

  return context;
}
