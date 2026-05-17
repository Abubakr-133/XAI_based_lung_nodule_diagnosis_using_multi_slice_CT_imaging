import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { OverviewSection } from "@/components/landing/overview-section"
import { TechStackSection } from "@/components/landing/tech-stack-section"
import { WorkflowSection } from "@/components/landing/workflow-section"
import { ResearchSection } from "@/components/landing/research-section"
import { MetricsSection } from "@/components/landing/metrics-section"
import { ExplainabilitySection } from "@/components/landing/explainability-section"
import { FAQSection } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <OverviewSection />
      <TechStackSection />
      <WorkflowSection />
      <ResearchSection />
      <MetricsSection />
      <ExplainabilitySection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}
