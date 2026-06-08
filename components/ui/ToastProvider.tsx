"use client";

import { useEffect } from "react";
import { toast } from "./CustomToast";

export function ToastProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).toast = toast;
    }
  }, []);

  return null;
}
