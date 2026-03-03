"use client"

import Link from "next/link"
import {
  UserRoundPen,
  ScanSearch,
  Send,
  MailOpen,
  Briefcase,
  Target,
  Zap,
  BarChart3,
  ShieldCheck,
  Clock,
  ArrowRight,
  Mail,
  TrendingUp,
} from "lucide-react"

const STEPS = [
  {
    number: "01",
    icon: UserRoundPen,
    title: "Create your profile",
    subtitle: "Upload resume & set preferences",
    description: "Tell us your role, skills, experience, and preferred locations. Two minutes, done once.",
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "We match jobs for you",
    subtitle: "AI-ranked, noise-free results",
    description: "Every day we find fresh openings and rank them against your profile. Only roles you'd actually want.",
  },
  {
    number: "03",
    icon: Send,
    title: "Apply in one click",
    subtitle: "Personalised emails, sent instantly",
    description: "Select any job and hit Apply. We email the recruiter using your Gmail and resume — instantly.",
  },
  {
    number: "04",
    icon: MailOpen,
    title: "Track every reply",
    subtitle: "Full pipeline in one dashboard",
    description: "See who opened, who replied, and who's worth following up with — from one clean dashboard.",
  },
]

// No longer needed — replaced by inline bento grid

export function FeatureGrid() {
  return (
    <div className="bg-white">

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="py-16 sm:py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              From sign-up to interviews
              <span className="text-gray-300"> in 4 steps</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              Most users are sending their first application within 10 minutes.
            </p>
          </div>

          {/* Desktop connector line */}
          <div className="hidden lg:block relative mb-8">
            <div className="absolute top-[26px] left-[calc(12.5%+26px)] right-[calc(12.5%+26px)] h-px bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100" />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={i} className="group flex flex-col items-center text-center">
                {/* Node */}
                <div className="relative z-10 mb-5">
                  <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm group-hover:border-indigo-200 group-hover:shadow-indigo-50 group-hover:shadow-md transition-all duration-300">
                    <s.icon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </div>
                </div>
                {/* Card */}
                <div className="w-full bg-white rounded-2xl border border-gray-100 p-5 group-hover:border-indigo-100 group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-300">
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-indigo-400 font-medium mb-2">{s.subtitle}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-200"
            >
              Try it free — takes 2 minutes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES — compact homepage teaser ─────────── */}
      <section className="py-14 border-t border-gray-100 bg-gray-50/40">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-3">
                <span className="w-1 h-1 rounded-full bg-indigo-500" />
                Features
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                Everything handled.
                <span className="text-gray-300"> Nothing to manage.</span>
              </h2>
            </div>
            <Link
              href="/features"
              className="group flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              See all features
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* 2-column split: one big card + compact list */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Left — featured card with mini mockup */}
            <div className="lg:col-span-2 group relative rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-xl hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none translate-x-10 -translate-y-10 group-hover:translate-x-6 transition-transform duration-700" />
              <div className="relative p-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                  <Briefcase className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Discovery</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 mb-1 leading-tight">Fresh jobs matched to you daily.</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">New openings ranked against your profile before you even open the app.</p>
                {/* Mini list */}
                <div className="space-y-2">
                  {[
                    { role: "Senior Frontend Dev", co: "Razorpay", match: "98%" },
                    { role: "Full Stack Engineer", co: "Groww", match: "95%" },
                    { role: "Backend Engineer", co: "CRED", match: "91%" },
                  ].map((j, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                      <div>
                        <div className="text-[11px] font-semibold text-gray-900">{j.role}</div>
                        <div className="text-[10px] text-gray-400">{j.co}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{j.match}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — 2×2 compact grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Target,
                  tag: "Matching",
                  title: "Precision matching",
                  desc: "Every listing scored against your skills, experience, and preferences. Zero noise.",
                },
                {
                  icon: Zap,
                  tag: "Apply",
                  title: "One-click apply",
                  desc: "Personalised email sent from your Gmail to the recruiter — instantly.",
                },
                {
                  icon: Clock,
                  tag: "Automation",
                  title: "Bulk apply in seconds",
                  desc: "Pick 10 jobs and apply to all before your coffee gets cold.",
                },
                {
                  icon: BarChart3,
                  tag: "Tracking",
                  title: "See who replied",
                  desc: "Track opens, replies, and follow-ups in one clean dashboard.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-gray-100 bg-white p-5 hover:border-indigo-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                    <f.icon className="h-4 w-4 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mb-1">{f.tag}</div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─────────── CTA BAND — light, not dark ─────────── */}
      <section className="py-16 sm:py-20 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50/60 to-indigo-50/30 relative overflow-hidden">
        {/* Animated blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-100/50 rounded-full blur-3xl animate-float-slow pointer-events-none" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #818cf8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-500 text-xs font-semibold mb-5 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 relative">
              <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-60" />
            </span>
            Free to start — no card needed
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Stop applying manually.
            <br />
            <span className="text-indigo-500">Start landing interviews.</span>
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Join thousands of professionals who let Hireoo handle the grind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all duration-200"
            >
              Get started for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center gap-2 px-7 py-3.5 border border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 text-sm font-medium rounded-full transition-all"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
