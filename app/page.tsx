import {
  LandingHeader,
  HeroSection,
  HomeSection,
  FeaturesSection,
  AboutSection,
  PricingSection,
  ContactSection,
  LandingFooter,
} from "@/components/landing";

export default function Page() {
  return (
    <div className="min-h-screen">
      <LandingHeader />

      {/* Unified Background for Entire Page */}
      <main className="relative bg-background dark:bg-slate-950">
        {/* Unified Background Effects */}
        <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.02]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 dark:from-slate-950/80 to-transparent" />
        </div>

        {/* All Content with Unified Background */}
        <div className="relative z-10">
          <HeroSection />
          <HomeSection />
          <FeaturesSection />
          <AboutSection />
          <PricingSection />
          <ContactSection />
        </div>

        <LandingFooter />
      </main>
    </div>
  );
}
