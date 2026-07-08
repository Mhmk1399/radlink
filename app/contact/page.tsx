import SmartLandingFooter from "@/components/global/footer";
import Navbar from "@/components/global/navbar";
import { ContactInfoSection } from "@/components/static/Contact/ContactInfo";
import { ContactFormSection } from "@/components/static/Contact/ContactForm";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "تماس با ما | رادلینک",
  description: "راه‌های ارتباطی با تیم رادلینک و فرم ارسال پیام.",
};

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#060e1b] via-[#081223] to-[#091828] font-sans text-white antialiased selection:bg-sky-500/30 selection:text-white">
      <Navbar />
      <ContactInfoSection />
      <ContactFormSection />
      <SmartLandingFooter />
    </main>
  );
};

export default ContactPage;
