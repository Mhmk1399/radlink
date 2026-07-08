import SmartLandingFooter from "@/components/global/footer";
import Navbar from "@/components/global/navbar";
import { AboutHeroSection } from "@/components/static/About/AboutHero";
import { AboutStorySection } from "@/components/static/About/AboutStory";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "درباره ما | رادلینک",
  description: "با تیم و ماموریت رادلینک آشنا شوید.",
};

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#060e1b] via-[#081223] to-[#091828] font-sans text-white antialiased selection:bg-sky-500/30 selection:text-white">
      <Navbar />
      <AboutHeroSection />
      <AboutStorySection />
      <SmartLandingFooter />
    </main>
  );
};

export default AboutPage;
