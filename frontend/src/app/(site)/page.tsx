import { Hero } from "@/components/hero"
import { FeatureGrid } from "@/components/feature-grid"
import { PricingTable } from "@/components/pricing-table"
import { Testimonials } from "@/components/testimonials"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeatureGrid />
      <Testimonials />
      <PricingTable />
    </div>
  )
}
