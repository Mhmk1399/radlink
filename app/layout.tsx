import type { Metadata } from "next";
import "./globals.css";
import { estedad } from "@/next-persian-fonts/estedad";
import { Toaster } from "@/components/ui/CustomToast";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { StyledComponentsRegistry } from "@/lib/registry";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PwaServiceWorker from "@/components/pwa/PwaServiceWorker";
import {
  RADLINK_APPLE_TOUCH_ICON,
  RADLINK_FAVICON_ICO,
  RADLINK_FAVICON_PNG,
} from "@/lib/design/landing-icons";

export const metadata: Metadata = {
  title: "راد لینک",
  description: "لندینگ ساز راد لینک",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: RADLINK_FAVICON_ICO, sizes: "any" },
      { url: RADLINK_FAVICON_PNG, sizes: "96x96", type: "image/png" },
    ],
    shortcut: RADLINK_FAVICON_ICO,
    apple: [
      {
        url: RADLINK_APPLE_TOUCH_ICON,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "راد لینک",
    statusBarStyle: "default",
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
        <PwaServiceWorker />
        {" "}
        <ToastProvider />
        <Toaster position="top-right" maxToasts={5} />
        {/* <Navbar /> */}
        <ThemeProvider defaultTheme="dark">
          {" "}
          <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        </ThemeProvider>
        {/* <DynamicIsland /> */}
        {/* <SmartLandingFooter /> */}
      </body>
    </html>
  );
}
