import type { Metadata } from "next"
import { Hero } from "@/components/hero"
import { FeatureGrid } from "@/components/feature-grid"
import { PricingTable } from "@/components/pricing-table"

export const metadata: Metadata = {
  title: "Auto Apply Job Website – One Click Apply to Jobs | Hireoo",
  description: "India's #1 auto apply job website. Hireoo automates job applications in one click — AI finds fresh jobs every hour, matches them to your profile, and applies via Gmail. Discover hidden jobs others miss.",
  alternates: { canonical: "https://www.hireoo.in" },
  openGraph: {
    title: "Auto Apply Job Website – One Click Apply to Jobs | Hireoo",
    description: "India's #1 auto apply job website. Automate job applications in one click — AI matches fresh jobs and applies on your behalf via Gmail.",
    url: "https://www.hireoo.in",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Hireoo – Auto Apply Job Website" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Apply Job Website – One Click Apply to Jobs | Hireoo",
    description: "India's #1 auto apply job website. Automate job applications in one click.",
    images: ["/og-image.png"],
  },
}

export default function Home() {
  const siteUrl = "https://www.hireoo.in";

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Hireoo",
    "url": siteUrl,
    "logo": `${siteUrl}/icon.png`,
    "sameAs": [
      "https://twitter.com/hireoo",
      "https://linkedin.com/company/hireoo"
    ],
    "description": "India's #1 auto apply job website — automate job applications with one-click apply via Gmail."
  };

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hireoo",
    "url": siteUrl,
    "operatingSystem": "Web, Chrome",
    "applicationCategory": "BusinessApplication",
    "description": "Auto apply job website that automates job applications. One click apply to matched jobs via Gmail. Find hidden jobs and apply in bulk.",
    "featureList": [
      "Auto apply to jobs with one click",
      "Automate job applications via Gmail",
      "AI-powered job matching",
      "Bulk apply to multiple jobs at once",
      "Access hidden jobs through direct recruiter outreach",
      "Track application replies and email opens"
    ],
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "INR",
        "description": "10 matched jobs per day, one-click apply via Gmail"
      },
      {
        "@type": "Offer",
        "name": "Premium Plan",
        "price": "149",
        "priceCurrency": "INR",
        "description": "25 matched jobs per day, bulk auto-apply, advanced AI matching"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "249",
        "priceCurrency": "INR",
        "description": "50 matched jobs per day, unlimited bulk apply, advanced analytics"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Hireoo",
    "url": siteUrl,
    "description": "Auto apply job website — automate job applications with one-click apply",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/signup`,
      "query-input": "required name=job_search_query"
    }
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is an auto apply job website?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An auto apply job website like Hireoo automates the process of finding and applying to jobs. Hireoo discovers fresh job openings every hour, matches them to your profile using AI, and applies on your behalf by sending a personalised email to the recruiter via your Gmail — all in one click."
        }
      },
      {
        "@type": "Question",
        "name": "How does Hireoo automate job applications?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hireoo automates job applications by connecting to your Gmail via OAuth. When you click Apply on a matched job, Hireoo writes a personalised email, attaches your resume, and sends it directly to the recruiter from your own Gmail address — all in under 3 seconds."
        }
      },
      {
        "@type": "Question",
        "name": "Can I apply to jobs in one click?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Hireoo enables one-click job applications. Select any matched job and hit Apply — a personalised email is sent to the recruiter instantly via your Gmail. You can also bulk apply to 10 jobs at once in under a minute."
        }
      },
      {
        "@type": "Question",
        "name": "What are hidden jobs and how does Hireoo help find them?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hidden jobs are positions that are filled through direct recruiter outreach rather than public job boards — estimated to account for up to 70% of all hires. Hireoo surfaces these hidden job opportunities by enabling direct cold email outreach to recruiters, helping you access roles that most job seekers never see."
        }
      },
      {
        "@type": "Question",
        "name": "Is Hireoo free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Hireoo is free to start. The free plan gives you 10 matched jobs per day with one-click apply via Gmail. Premium plans start at ₹149/month for 25 matched jobs with bulk auto-apply and advanced features."
        }
      },
      {
        "@type": "Question",
        "name": "Does Hireoo send emails from my own Gmail?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Hireoo uses Gmail OAuth so every application email is sent from your own Gmail address. Recruiter replies land directly in your inbox. Your Gmail credentials are never stored on Hireoo's servers."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Hero />
      <FeatureGrid />
      <PricingTable />
    </div>
  )
}
