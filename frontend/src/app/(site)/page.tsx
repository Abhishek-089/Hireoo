import { Hero } from "@/components/hero"
import { FeatureGrid } from "@/components/feature-grid"
import { PricingTable } from "@/components/pricing-table"
import { Testimonials } from "@/components/testimonials"

export default function Home() {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hireoo",
    "url": siteUrl,
    "logo": `${siteUrl}/icon.png`,
    "sameAs": [
      "https://twitter.com/hireoo",
      "https://linkedin.com/company/hireoo"
    ],
    "description": "AI-powered job search automation platform"
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hireoo",
    "operatingSystem": "Web, Chrome",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      <Hero />
      <FeatureGrid />
      <Testimonials />
      <PricingTable />
    </div>
  )
}
