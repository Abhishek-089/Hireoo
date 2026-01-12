import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Chrome, Mail, Brain, Target, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How It Works - Hireoo",
  description: "Learn how Hireoo's AI-powered job search automation works. From LinkedIn scraping to personalized cold emails in 4 simple steps.",
}

const steps = [
  {
    step: 1,
    title: "Install & Connect",
    description: "Install our Chrome extension and connect your Gmail account via OAuth. Takes less than 2 minutes.",
    icon: Chrome,
    details: [
      "One-click Chrome extension installation",
      "Secure Gmail OAuth connection",
      "Upload your resume and set preferences",
      "Configure job search criteria"
    ]
  },
  {
    step: 2,
    title: "AI Scraping & Analysis",
    description: "Browse LinkedIn as usual. Our AI automatically extracts and analyzes job postings in real-time.",
    icon: Brain,
    details: [
      "Real-time LinkedIn post scraping",
      "AI-powered job description analysis",
      "Company information extraction",
      "Requirements and skills parsing"
    ]
  },
  {
    step: 3,
    title: "Smart Matching",
    description: "Our AI matches jobs with your profile, skills, and career goals for perfect alignment.",
    icon: Target,
    details: [
      "Resume and skills analysis",
      "Job requirement matching",
      "Salary and location filtering",
      "Career level assessment"
    ]
  },
  {
    step: 4,
    title: "Automated Outreach",
    description: "Generate and send personalized cold emails. Track responses and follow up automatically.",
    icon: Mail,
    details: [
      "AI-generated personalized emails",
      "Gmail integration for sending",
      "Response tracking and analytics",
      "Automated follow-up sequences"
    ]
  }
]

const benefits = [
  "Save 10+ hours per week on job searching",
  "Apply to 50x more relevant positions",
  "Get 3x more interview responses",
  "Maintain professional email branding",
  "Track all outreach in one dashboard",
  "Scale your job search effortlessly"
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              How Hireoo{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Works
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Four simple steps to transform your job search from manual and time-consuming to automated and effective.
            </p>
            <div className="mt-10">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <div key={step.step} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
                {/* Icon and Step Number */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <step.icon className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{step.step}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-lg text-gray-600 mb-8">{step.description}</p>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Hireoo?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join thousands of professionals who have transformed their job search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{benefit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Automate Your Job Search?
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Join thousands of professionals who have landed their dream jobs with Hireoo.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
