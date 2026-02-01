import { Card, CardContent } from "@/components/ui/card"
import {
  Chrome,
  Mail,
  Brain,
  Target,
  Clock,
  Shield,
  Zap,
  Users
} from "lucide-react"

const features = [
  {
    icon: Chrome,
    title: "Chrome Extension",
    description: "One-click installation. Automatically captures professional hiring posts as you browse.",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: Brain,
    title: "AI Job Matching",
    description: "Our AI analyzes your resume and skills to find the perfect job matches from captured data.",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    icon: Mail,
    title: "Smart Cold Emails",
    description: "Generate personalized, compelling cold emails using OpenAI GPT and send via your Gmail.",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: Target,
    title: "Precision Targeting",
    description: "Filter jobs by location, salary, company size, and industry for laser-focused outreach.",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    icon: Clock,
    title: "Automated Workflows",
    description: "Set up automated sequences: capture → match → email → follow-up. Work smarter, not harder.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays secure. We use OAuth for Gmail access and encrypt all sensitive information.",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process hundreds of jobs and send emails in minutes, not hours. Scale your job search.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share job leads, track responses, and collaborate with your network on opportunities.",
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  }
]

export function FeatureGrid() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to land your dream job
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            From opportunity discovery to personalized cold emails, we automate the entire job search process
            so you can focus on what matters most - preparing for interviews.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor} mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 mb-8">
            Ready to supercharge your job search?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/features"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View All Features
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
