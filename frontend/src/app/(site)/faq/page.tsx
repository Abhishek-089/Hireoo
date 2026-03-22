'use client'

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown, Zap, Shield, Mail, CreditCard,
  Chrome, MessageSquare, ArrowRight,
} from "lucide-react"

const categories = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Zap,
    color: "bg-indigo-50 text-indigo-600",
    faqs: [
      {
        q: "What is Hireoo and how does it work?",
        a: "Hireoo is an AI-powered job search platform that scrapes hiring posts from LinkedIn via a Chrome extension, matches them to your profile using AI, and lets you apply directly with a one-click cold email through your connected Gmail. You set up your profile once, install the extension, and Hireoo does the heavy lifting.",
      },
      {
        q: "How do I get started?",
        a: "1. Sign up and complete onboarding (takes ~3 minutes). 2. Enter your skills, target role, and preferred locations. 3. Upload your resume. 4. Connect your Gmail. 5. Install the Hireoo Chrome extension and start browsing LinkedIn. Hireoo automatically captures hiring posts and shows matched opportunities on your dashboard.",
      },
      {
        q: "Do I need technical skills to use Hireoo?",
        a: "Not at all. The setup takes under 5 minutes. Our AI handles job matching, email drafting, and application tracking automatically. You just review the matches and hit apply.",
      },
      {
        q: "What kind of jobs does Hireoo find?",
        a: "Hireoo captures hiring posts shared directly on LinkedIn — posts where recruiters or hiring managers mention a role and share a contact email. This includes full-time roles, contract work, and internships across all industries. The AI then filters and matches posts based on your skills and preferences.",
      },
    ],
  },
  {
    id: "extension",
    label: "Chrome Extension",
    icon: Chrome,
    color: "bg-sky-50 text-sky-600",
    faqs: [
      {
        q: "How does the Chrome extension work?",
        a: "When you browse your LinkedIn feed, the Hireoo extension automatically detects hiring posts in real time. It extracts the post text, identifies recruiter contact info, and sends it to your Hireoo dashboard where AI matches it against your profile. You never have to manually copy-paste a job post again.",
      },
      {
        q: "Which browsers are supported?",
        a: "The extension works on Google Chrome and all Chromium-based browsers including Microsoft Edge and Brave. The web dashboard works on all modern browsers including Safari and Firefox.",
      },
      {
        q: "Does the extension need to be active all the time?",
        a: "Only when you're browsing LinkedIn. The extension runs passively in the background while you scroll your LinkedIn feed and captures hiring posts automatically. It doesn't use any resources when LinkedIn isn't open.",
      },
      {
        q: "What if a LinkedIn post layout changes?",
        a: "Our extension uses AI-powered content recognition alongside structural selectors, so it adapts to minor LinkedIn layout changes. Our team monitors and pushes updates within 24–48 hours for any major changes.",
      },
    ],
  },
  {
    id: "emails",
    label: "Emails & Applications",
    icon: Mail,
    color: "bg-emerald-50 text-emerald-600",
    faqs: [
      {
        q: "How does the one-click apply work?",
        a: "When you find a matched job, Hireoo AI drafts a personalized cold email based on your profile, resume, and the job post. You review it, make any edits, and send it directly from your connected Gmail with one click. The email appears in your sent mail just like a normal Gmail message.",
      },
      {
        q: "Can I customize the emails Hireoo generates?",
        a: "Yes. You can edit any AI-generated email before sending, or set up your own email template in Settings. Premium and Pro plans include advanced template customization and multiple template slots.",
      },
      {
        q: "How does Hireoo track replies?",
        a: "Hireoo connects to your Gmail and monitors threads from sent applications. When a recruiter replies, it shows up in your My Applications dashboard with the full conversation, status tracking, and a direct link to the Gmail thread.",
      },
      {
        q: "Can I pause sending emails?",
        a: "Yes. You have full control at all times. You can pause automation, review jobs without applying, or stop entirely from your dashboard. Each job match requires a manual apply action — Hireoo never sends emails without your explicit approval.",
      },
    ],
  },
  {
    id: "pricing",
    label: "Plans & Pricing",
    icon: CreditCard,
    color: "bg-amber-50 text-amber-600",
    faqs: [
      {
        q: "What's included in the Free plan?",
        a: "The Free plan gives you 10 matched job posts per day, one-click apply via Gmail, recruiter contact lookup, and basic AI profile matching — completely free, forever. No credit card required.",
      },
      {
        q: "What does Premium (₹149/mo) add?",
        a: "Premium increases your daily matches to 25, unlocks advanced AI matching, custom email templates, bulk auto-apply (10 at once), reply and thread tracking, resume tips, and priority support.",
      },
      {
        q: "What does Pro (₹249/mo) add?",
        a: "Pro gives you 50 matched jobs per day, everything in Premium, unlimited bulk apply, advanced analytics, API access, and dedicated support — ideal for power users running an intensive job search.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes, cancel anytime from your billing settings. You keep full access until the end of your billing period. We also offer a 30-day money-back guarantee on all paid plans — no questions asked.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: Shield,
    color: "bg-violet-50 text-violet-600",
    faqs: [
      {
        q: "Is my Gmail data secure?",
        a: "Yes. We use Google OAuth 2.0 — we never see or store your Gmail password. We only request the minimum permissions needed to send emails and read replies from your applications. All data is encrypted in transit and at rest.",
      },
      {
        q: "Does Hireoo store my resume?",
        a: "Your resume is stored securely and used only to improve AI matching and email personalization. It is never shared with third parties or used for any purpose outside of generating your job matches.",
      },
      {
        q: "Can recruiters tell the email was AI-generated?",
        a: "No. Emails are sent directly from your Gmail address, appear in your sent folder, and are personalized based on the specific job post and your background. They read like a thoughtful, human-written cold email.",
      },
      {
        q: "What data does the Chrome extension collect?",
        a: "The extension only reads LinkedIn post content while you are actively browsing LinkedIn. It does not access any other websites, does not store your browsing history, and does not run in the background on other tabs.",
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: MessageSquare,
    color: "bg-rose-50 text-rose-600",
    faqs: [
      {
        q: "How do I contact support?",
        a: "You can reach our team at support@hireoo.com or use the in-app chat. Premium and Pro users get priority response within a few hours. Free plan users are typically responded to within 24–48 hours.",
      },
      {
        q: "Do you guarantee job offers?",
        a: "We can't guarantee job offers — no tool can. What we do guarantee is that you'll apply to more relevant opportunities, faster, with less manual effort. Our users typically see significantly higher response rates compared to traditional job board applications.",
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200 ${open ? "bg-white shadow-sm" : "bg-white hover:border-gray-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <span className={`text-base font-semibold leading-snug transition-colors ${open ? "text-indigo-700" : "text-gray-900"}`}>
          {q}
        </span>
        <span className={`shrink-0 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200 ${open ? "bg-indigo-100 rotate-180" : "bg-gray-100"}`}>
          <ChevronDown className={`h-3.5 w-3.5 ${open ? "text-indigo-600" : "text-gray-500"}`} />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="h-px bg-gray-100 mb-4" />
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started")

  const current = categories.find(c => c.id === activeCategory)!

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-white pt-20 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 60% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-600 mb-6">
            <MessageSquare className="h-3.5 w-3.5" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            Everything you need to know about Hireoo — from setup to sending your first application.
          </p>
        </div>
      </div>

      {/* Category tabs + content */}
      <div className="mx-auto max-w-5xl px-6 pb-24">

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Active category FAQs */}
        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">

          {/* Left: category info */}
          <div className="hidden lg:block sticky top-24">
            <div className={`inline-flex p-3 rounded-2xl ${current.color.split(" ")[0]} mb-4`}>
              <current.icon className={`h-6 w-6 ${current.color.split(" ")[1]}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{current.label}</h2>
            <p className="text-sm text-gray-400">{current.faqs.length} questions</p>

            <div className="mt-8 space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                    activeCategory === cat.id
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <cat.icon className="h-3.5 w-3.5 shrink-0" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: FAQ list */}
          <div className="space-y-3">
            {current.faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>

      {/* Still need help */}
      <div className="border-t border-gray-100 bg-gray-50/60 py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 mb-5">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h2>
          <p className="text-gray-500 mb-8">
            Can't find what you're looking for? Drop us a message — we typically respond within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:support@hireoo.com"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
