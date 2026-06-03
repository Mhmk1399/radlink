// ─────────────────────────────────────────────────────────────────
// app/admin/layout.tsx  — نسخه سازگار با App Router
// ─────────────────────────────────────────────────────────────────
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>;
}
