import type { Metadata } from "next"
import { PricingTable } from "@/components/pricing-table"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pricing - Hireoo",
  description: "Choose the perfect plan for your job search automation needs. Start free and scale as you grow.",
  alternates: {
    canonical: "/pricing",
  },
}

const comparisonFeatures = [
  {
    feature: "Job applications per month",
    starter: "50",
    professional: "Unlimited",
    enterprise: "Unlimited"
  },
  {
    feature: "Chrome extension",
    starter: true,
    professional: true,
    enterprise: true
  },
  {
    feature: "AI job matching",
    starter: "Basic",
    professional: "Advanced",
    enterprise: "Advanced"
  },
  {
    feature: "Email sequences",
    starter: false,
    professional: true,
    enterprise: true
  },
  {
    feature: "Analytics & reporting",
    starter: "Basic",
    professional: "Advanced",
    enterprise: "Advanced"
  },
  {
    feature: "Team collaboration",
    starter: false,
    professional: false,
    enterprise: true
  },
  {
    feature: "API access",
    starter: false,
    professional: false,
    enterprise: true
  },
  {
    feature: "Dedicated support",
    starter: false,
    professional: true,
    enterprise: true
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Start free and upgrade as you grow. No hidden fees, no long-term contracts.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <PricingTable />

      {/* Feature Comparison */}
      <div className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Compare All Features
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Everything you need to know about our plans.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold text-blue-600">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-gray-900 font-medium">{item.feature}</td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {typeof item.starter === 'boolean' ? (
                        item.starter ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        item.starter
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-blue-600 font-medium">
                      {typeof item.professional === 'boolean' ? (
                        item.professional ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        item.professional
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {typeof item.enterprise === 'boolean' ? (
                        item.enterprise ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : (
                        item.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. No long-term contracts.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens to my data?</h3>
              <p className="text-gray-600">Your data is encrypted and secure. You can export it anytime before canceling.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee for all paid plans.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Still have questions?</p>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
