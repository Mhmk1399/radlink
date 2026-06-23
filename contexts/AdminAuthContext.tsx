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

function readAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem("auth_token");
  return token && token.trim() ? token : null;
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
    const authToken = readAuthToken();

    if (!authToken) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;

        if (!hasShownMissingTokenToast) {
          hasShownMissingTokenToast = true;
          toast.warning("برای ورود به پنل مدیریت ابتدا وارد حساب کاربری شوید.", {
            title: "نیاز به ورود",
          });
        }

        router.replace("/auth");
      }

      setToken(null);
      setIsChecking(false);
      return;
    }

    setToken(authToken);
    setIsChecking(false);
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
