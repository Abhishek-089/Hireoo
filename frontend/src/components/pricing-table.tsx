import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Get started — no card needed.",
    features: [
      "10 matched jobs per day",
      "One-click apply via Gmail",
      "Recruiter contact lookup",
      "Basic profile matching",
      "Community support",
    ],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Premium",
    price: "₹149",
    period: "/mo",
    tagline: "For active job seekers.",
    features: [
      "25 matched jobs per day",
      "Advanced AI matching",
      "Custom email templates",
      "Bulk auto-apply (10 at once)",
      "Reply & thread tracking",
      "Priority support",
      "Resume tips",
    ],
    cta: "Start Premium",
    href: "/signup?plan=premium_basic",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Pro",
    price: "₹249",
    period: "/mo",
    tagline: "For power users going all-in.",
    features: [
      "50 matched jobs per day",
      "Everything in Premium",
      "Unlimited bulk apply",
      "Advanced analytics",
      "API access",
      "Dedicated support",
    ],
    cta: "Start Pro",
    href: "/signup?plan=premium_pro",
    highlight: false,
  },
]

export function PricingTable() {
  return (
    <section className="py-16 sm:py-20 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Simple pricing.
            <span className="text-gray-300"> No surprises.</span>
          </h2>
          <p className="mt-3 text-gray-500">
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-200 ${
                plan.highlight
                  ? "bg-indigo-500 border-indigo-500 shadow-2xl shadow-indigo-200 lg:scale-[1.03] z-10"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-7">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-indigo-500 text-[11px] font-bold border border-indigo-100 shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.highlight ? "text-indigo-200" : "text-gray-400"}`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-4xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-medium ${plan.highlight ? "text-indigo-200" : "text-gray-400"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-1.5 text-sm ${plan.highlight ? "text-indigo-200" : "text-gray-500"}`}>
                  {plan.tagline}
                </p>
              </div>

              <div className={`h-px mb-5 ${plan.highlight ? "bg-indigo-400/50" : "bg-gray-100"}`} />

              <ul className="flex-1 space-y-3 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlight ? "bg-white/20" : "bg-gray-100"}`}>
                      <Check className={`h-3 w-3 ${plan.highlight ? "text-white" : "text-gray-900"}`} />
                    </div>
                    <span className={`text-sm leading-snug ${plan.highlight ? "text-indigo-100" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`group flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
                  plan.highlight
                    ? "bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-lg"
                    : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg"
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>

      
      </div>
    </section>
  )
}
