import SmartLandingFooter from "@/components/global/footer";
import Navbar from "@/components/global/navbar";
import TermsContent from "@/components/static/Terms/TermsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوانین و شرایط استفاده | رادلینک",
  description:
    "قوانین و شرایط استفاده از رادلینک، پنل مدیریت، لندینگ‌ها، NFC، QR و ابزارهای ارتباطی.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#060e1b] via-[#081223] to-[#091828] font-sans text-white antialiased selection:bg-sky-500/30 selection:text-white">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <TermsContent />
      </div>
      <SmartLandingFooter />
    </main>
  );
}
