import type { Metadata } from "next"
import { PricingTable } from "@/components/pricing-table"
import { Check, X, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pricing – Auto Apply Job Website Plans Starting Free | Hireoo",
  description: "Start automating job applications for free. Hireoo's auto apply job website plans start at ₹0 — get one-click apply, AI job matching, and bulk auto-apply. Upgrade from ₹149/month.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing – Auto Apply Jobs Starting Free | Hireoo",
    description: "Free to start. One-click apply, AI job matching, bulk auto-apply. Upgrade from ₹149/month.",
    url: "https://www.hireoo.in/pricing",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Hireoo Pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing – Auto Apply Jobs Starting Free | Hireoo",
    description: "Free to start. One-click apply, AI job matching. Upgrade from ₹149/month.",
    images: ["/og-image.png"],
  },
}

type CellValue = boolean | string

const comparisonFeatures: { feature: string; free: CellValue; premium: CellValue; pro: CellValue }[] = [
  { feature: "Matched jobs per day",         free: "10",          premium: "25",           pro: "50"          },
  { feature: "One-click apply via Gmail",    free: true,          premium: true,           pro: true          },
  { feature: "Recruiter contact lookup",     free: true,          premium: true,           pro: true          },
  { feature: "Profile matching",             free: "Basic",       premium: "Advanced",     pro: "Advanced"    },
  { feature: "Custom email templates",       free: false,         premium: true,           pro: true          },
  { feature: "Bulk auto-apply",              free: false,         premium: "10 at once",   pro: "Unlimited"   },
  { feature: "Reply & thread tracking",      free: false,         premium: true,           pro: true          },
  { feature: "Resume tips",                  free: false,         premium: true,           pro: true          },
  { feature: "Advanced analytics",           free: false,         premium: false,          pro: true          },
  { feature: "API access",                   free: false,         premium: false,          pro: true          },
  { feature: "Support",                      free: "Community",   premium: "Priority",     pro: "Dedicated"   },
]

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  if (typeof value === "boolean") {
    return value
      ? <Check className="h-5 w-5 text-emerald-500 mx-auto" />
      : <X className="h-4 w-4 text-gray-300 mx-auto" />
  }
  return (
    <span className={`text-sm font-medium ${highlight ? "text-indigo-600" : "text-gray-700"}`}>
      {value}
    </span>
  )
}

const faqs = [
  {
    q: "Is Hireoo really free to start?",
    a: "Yes. The Free plan gives you 10 matched jobs per day with one-click apply via Gmail — no credit card required. Upgrade anytime when you need more.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. No long-term contracts. Cancel your subscription from your account settings at any time — you won't be charged again.",
  },
  {
    q: "What is bulk auto-apply?",
    a: "Bulk auto-apply lets you select multiple matched jobs and apply to all of them at once. Premium supports 10 at once; Pro has no limit.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — we offer a 7-day money-back guarantee on all paid plans. If you're not happy, reach out and we'll sort it.",
  },
  {
    q: "Does Hireoo send emails from my own Gmail?",
    a: "Yes. Every application email is sent from your own Gmail address via OAuth. Recruiter replies land directly in your inbox. We never store your Gmail password.",
  },
  {
    q: "Can I upgrade or downgrade my plan?",
    a: "Yes. You can switch between Free, Premium, and Pro at any time from your account settings. Changes take effect immediately.",
  },
]

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-50/80 via-purple-50/30 to-transparent blur-3xl" />
          <div className="absolute top-20 left-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-36 h-36 bg-purple-100/30 rounded-full blur-2xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 pt-28 pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Free forever plan available
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
            Simple pricing.
            <br />
            <span className="text-indigo-500">No surprises.</span>
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Start free and upgrade when you&apos;re ready. Cancel anytime.
          </p>
        </div>
      </div>

      {/* ── PRICING CARDS ── */}
      <PricingTable />

      {/* ── COMPARISON TABLE ── */}
      <section className="py-16 sm:py-20 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Compare all features
            </h2>
            <p className="text-gray-500">Everything included in each plan, side by side.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500 w-[40%]">Feature</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 w-[20%]">
                    Free
                    <div className="text-xs font-normal text-gray-400 mt-0.5">₹0 / forever</div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-indigo-600 w-[20%] bg-indigo-50/60">
                    Premium
                    <div className="text-xs font-normal text-indigo-400 mt-0.5">₹149 / mo</div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 w-[20%]">
                    Pro
                    <div className="text-xs font-normal text-gray-400 mt-0.5">₹249 / mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, i) => (
                  <tr key={i} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                    <td className="py-3.5 px-6 text-sm font-medium text-gray-700">{item.feature}</td>
                    <td className="py-3.5 px-6 text-center">
                      <Cell value={item.free} />
                    </td>
                    <td className="py-3.5 px-6 text-center bg-indigo-50/30">
                      <Cell value={item.premium} highlight />
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <Cell value={item.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100">
                  <td className="py-5 px-6" />
                  <td className="py-5 px-6 text-center">
                    <Link href="/signup" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-all">
                      Start free
                    </Link>
                  </td>
                  <td className="py-5 px-6 text-center bg-indigo-50/30">
                    <Link href="/signup?plan=premium_basic" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 transition-all">
                      Get Premium
                    </Link>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <Link href="/signup?plan=premium_pro" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-all">
                      Get Pro
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 border-t border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Frequently asked questions
            </h2>
            <p className="text-gray-500">Still unsure? We&apos;ve got answers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-gray-400 mb-4">Still have questions?</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">
              Contact support <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
