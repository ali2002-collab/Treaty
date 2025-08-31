import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"
import { BentoGrid } from "@/components/marketing/bento-grid"
import { SocialProof } from "@/components/marketing/social-proof"
import { DemoCTA } from "@/components/marketing/demo-cta"
import { FAQ } from "@/components/marketing/faq"
import { Footer } from "@/components/marketing/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <BentoGrid />
        <SocialProof />
        <DemoCTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
