import type { Metadata } from "next";
import "./globals.css";
import { estedad } from "@/next-persian-fonts/estedad";
import { Toaster } from "@/components/ui/CustomToast";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { StyledComponentsRegistry } from "@/lib/registry";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "راد لینک",
  description: "لندینگ ساز راد لینک",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  other: {
    enamad: "2184341",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      className={`${estedad.className}   h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {" "}
        <ToastProvider />
        <Toaster position="top-right" maxToasts={5} />
        {/* <Navbar /> */}
        <ThemeProvider defaultTheme="dark" >
          {" "}
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </ThemeProvider>
        {/* <DynamicIsland /> */}
        {/* <SmartLandingFooter /> */}
      </body>
    </html>
  );
}
