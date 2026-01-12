import type { Metadata } from "next"
import { FeatureGrid } from "@/components/feature-grid"

export const metadata: Metadata = {
  title: "Features - Hireoo",
  description: "Explore all the powerful features of Hireoo's AI-powered job search automation platform. From LinkedIn scraping to personalized cold emails.",
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Modern Job Search
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Everything you need to automate your job search, from LinkedIn scraping to personalized outreach.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <FeatureGrid />

      {/* Additional Feature Details */}
      <div className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It All Works Together
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our integrated platform creates a seamless job search experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect & Scrape</h3>
              <p className="text-gray-600">
                Install our Chrome extension and connect your Gmail. Browse LinkedIn as usual - we handle the scraping automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Matching</h3>
              <p className="text-gray-600">
                Our AI analyzes job postings and matches them with your skills, experience, and preferences for perfect alignment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Outreach</h3>
              <p className="text-gray-600">
                Generate and send personalized cold emails through your Gmail account. Track responses and follow up automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
