import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { DemoPreview } from "@/components/home/demo-preview";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { SocialProof } from "@/components/home/social-proof";
import { Pricing } from "@/components/home/pricing";
import { FAQSection } from "@/components/home/faq-section";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <DemoPreview />
        <Features />
        <SocialProof />
        <HowItWorks />
        <Pricing />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
