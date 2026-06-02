import {
  HowItWorksSection,
  TargetAudienceSection,
} from "@/components/static/Landing/AudienceAndSteps";
import { BlocksSection } from "@/components/static/Landing/BlocksSection";
import {
  BenefitsSection,
  CustomizationSection,
} from "@/components/static/Landing/CustomizationAndBenefits";
import {
  DashboardSection,
  QrCodeSection,
} from "@/components/static/Landing/DashboardAndQr";
import {
  CtaSection,
  FaqSection,
  MvpSection,
} from "@/components/static/Landing/MvpCtaFaq";
import SmartLandingPage from "@/components/static/Landing/SmartLandingPage";
import {
  FeaturesSection,
  SolutionSection,
} from "@/components/static/Landing/Solution";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "رادلینک",
  description: "پلتفرم ساخت لندینگ",
};
const page = () => {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#060e1b] via-[#081223] to-[#091828] font-sans text-white antialiased selection:bg-sky-500/30 selection:text-white">
      <SmartLandingPage />
      <SolutionSection />
      <FeaturesSection />
      <BlocksSection />
      <TargetAudienceSection />
      <HowItWorksSection />
      <DashboardSection />
      <QrCodeSection />
      <CustomizationSection />
      <BenefitsSection />
      <MvpSection />
      <CtaSection />
      <FaqSection />
    </main>
  );
};

export default page;
