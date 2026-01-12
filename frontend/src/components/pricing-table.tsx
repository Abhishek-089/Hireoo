import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out our platform",
    features: [
      "Up to 50 job applications/month",
      "Chrome extension access",
      "Basic AI matching",
      "Email templates",
      "Community support"
    ],
    limitations: [
      "Limited to 5 companies/day",
      "Basic analytics only"
    ],
    cta: "Get Started Free",
    ctaLink: "/signup",
    popular: false
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "For serious job seekers",
    features: [
      "Unlimited job applications",
      "Advanced AI matching",
      "Custom email sequences",
      "Priority support",
      "Advanced analytics",
      "Resume optimization",
      "Interview tracking"
    ],
    limitations: [],
    cta: "Start Professional",
    ctaLink: "/signup?plan=professional",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    description: "For teams and agencies",
    features: [
      "Everything in Professional",
      "Team collaboration tools",
      "White-label options",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "Advanced reporting"
    ],
    limitations: [],
    cta: "Contact Sales",
    ctaLink: "/contact",
    popular: false
  }
]

export function PricingTable() {
  return (
    <div className="py-24 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose the perfect plan for your job search
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Start free and upgrade as you grow. No hidden fees, no long-term contracts.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-blue-600 shadow-xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5 mr-3" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <li key={limitIndex} className="flex items-start">
                      <span className="text-sm text-gray-400 line-through">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link href={plan.ctaLink}>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-base text-gray-600">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Questions about pricing? <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
