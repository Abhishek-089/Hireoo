import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageSquare, ArrowRight, Instagram } from "lucide-react"

import { ContactForm } from "@/components/ContactForm"

export const metadata: Metadata = {
  title: "Contact - Hireoo",
  description: "Get in touch with the Hireoo team. We're here to help you automate your job search and land your dream role.",
  alternates: { canonical: "/contact" },
}

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    title: "Send us an email",
    description: "Best for detailed questions, billing, or partnership enquiries. We reply within 24 hours.",
    value: "hireooai@gmail.com",
    href: "mailto:hireooai@gmail.com",
    cta: "Send email",
  },
  {
    icon: MessageSquare,
    label: "Social",
    title: "Reach us on X / Twitter",
    description: "Quick questions, feedback, or just want to say hi? DM us on X — we're active daily.",
    value: "@HireooAI",
    href: "https://x.com/HireooAI",
    cta: "Open X",
  },
  {
    icon: Instagram,
    label: "Instagram",
    title: "Follow on Instagram",
    description: "Behind-the-scenes builds, product updates, and job search tips on our Instagram.",
    value: "@hireoo.ai",
    href: "https://www.instagram.com/hireoo.ai?igsh=b3dyNmg1OGQ4dHAw",
    cta: "Open Instagram",
  },
]

const faqs = [
  {
    q: "How does Hireoo find job posts?",
    a: "Our Chrome extension captures LinkedIn posts as you scroll. It extracts recruiter contact emails automatically and sends them to your dashboard.",
  },
  {
    q: "Does Hireoo send emails on my behalf?",
    a: "Yes — once you connect your Gmail account, Hireoo generates a personalised cover letter and sends it directly from your inbox. You review every email before it goes out, or use Auto Apply to let it run hands-free.",
  },
  {
    q: "What is the daily job limit?",
    a: "Free accounts get 10 matched job posts per day. Premium Basic (₹149/mo) gives you 25/day, and Premium Pro (₹249/mo) gives you 50/day.",
  },
  {
    q: "Is my Gmail data safe?",
    a: "Absolutely. We use OAuth 2.0 and only request the minimum scopes needed to send emails on your behalf. We never read your existing emails.",
  },
  {
    q: "Can I see what was sent?",
    a: "Yes. Every application — cover letter, recipient email, and send time — is logged in your dashboard. You also see any replies in the same thread.",
  },
]

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-50/80 via-purple-50/30 to-transparent blur-3xl" />
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

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              We&apos;re here to help
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              Get in touch
              <br />
              <span className="text-indigo-500">with our team.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 leading-relaxed">
              Have a question, a bug to report, or just want to share feedback?
              Pick the channel that works best for you — we reply fast.
            </p>
          </div>
        </div>
      </div>

      {/* ── CONTACT CARDS ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {contactMethods.map((method) => (
            <div
              key={method.label}
              className="group bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center mb-5">
                <method.icon className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">
                {method.label}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{method.description}</p>
              <a
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 group-hover:gap-2.5 transition-all"
              >
                {method.value}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* ── TWO COLUMN: FORM + FAQ ── */}
      <div className="bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Form */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-5">
                Send a message
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">We&apos;d love to hear from you</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Fill in the form and we&apos;ll get back to you within one business day.
              </p>

              <ContactForm />
            </div>

            {/* FAQ */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-5">
                Quick answers
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently asked</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Most questions are answered here. Can&apos;t find yours? Use the form.
              </p>

              <div className="space-y-5">
                {faqs.map((faq) => (
                  <div key={faq.q} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



    </div>
  )
}
