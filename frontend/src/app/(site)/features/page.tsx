import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight, Inbox, Target, Zap, Clock,
  BarChart3, ShieldCheck, CheckCircle2, Mail,
  Briefcase, TrendingUp, Send,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Features – One Click Apply Jobs & Job Automation Tools",
  description: "Explore Hireoo's features: one-click apply to jobs, AI-powered job matching, bulk auto-apply to 10 jobs at once, and full email tracking. The most complete job application automation platform in India.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "Features – One Click Apply Jobs & Job Automation Tools | Hireoo",
    description: "One-click apply to jobs, AI matching, bulk auto-apply, and reply tracking. Automate your entire job search with Hireoo.",
    url: "https://www.hireoo.in/features",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Hireoo Features" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Features – One Click Apply Jobs & Job Automation | Hireoo",
    description: "One-click apply to jobs, AI matching, bulk auto-apply, and reply tracking.",
    images: ["/og-image.png"],
  },
}

export default function FeaturesPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-50/80 via-purple-50/30 to-transparent blur-3xl" />
          <div className="absolute top-20 left-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-10 right-10 w-36 h-36 bg-purple-100/30 rounded-full blur-2xl animate-float" />
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
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Every feature you need
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              The complete toolkit
              <br />
              <span className="text-indigo-500">for landing jobs faster.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              From discovering fresh openings to landing in a recruiter&apos;s inbox —
              Hireoo handles every step automatically.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="group flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/15">
                Start for free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/pricing" className="flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-all">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID ── */}
      <section className="py-6 sm:py-10 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-auto">

            {/* Card 1 — LARGE: Job Discovery (spans 4 cols) */}
            <div className="md:col-span-4 group relative rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none translate-x-16 -translate-y-16 group-hover:translate-x-8 transition-transform duration-700" />
              <div className="relative p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                      <Inbox className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Discovery</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">Fresh jobs, matched to you. Every single day.</h3>
                    <p className="text-gray-500 text-sm mt-2 max-w-sm leading-relaxed">New openings surface hourly, scored against your profile before you even open the app.</p>
                  </div>
                </div>
                {/* Mini dashboard mockup */}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-700">Today&apos;s Matches</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 text-[10px] font-semibold">42 new</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { role: "Senior Frontend Dev", co: "Razorpay", match: "98%" },
                      { role: "Full Stack Engineer", co: "Groww", match: "95%" },
                      { role: "Backend Engineer", co: "CRED", match: "91%" },
                    ].map((j, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-900">{j.role}</div>
                            <div className="text-[10px] text-gray-400">{j.co}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{j.match} match</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 — small: Precision Matching (spans 2 cols) */}
            <div className="md:col-span-2 group relative rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-50/50 rounded-full blur-2xl pointer-events-none" />
              <div className="relative p-7 h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                  <Target className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Matching</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 leading-tight">Precision matching</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed flex-1">Every listing scored against your skills, experience, and preferences. Zero noise.</p>
                {/* Score visual */}
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Skills match", w: "w-[92%]" },
                    { label: "Role match", w: "w-[87%]" },
                    { label: "Location", w: "w-[100%]" },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>{bar.label}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.w} bg-indigo-400 rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3 — small: One-click Apply (2 cols) */}
            <div className="md:col-span-2 group relative rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/40 rounded-full blur-2xl pointer-events-none" />
              <div className="relative p-7 h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                  <Zap className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Apply</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 leading-tight">One click. Done.</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed flex-1">Personalised email sent to the recruiter from your own Gmail with your resume attached.</p>
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                    <Send className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-900">Email sent to hr@razorpay.com</div>
                    <div className="text-[10px] text-gray-400">2 seconds ago · via Gmail</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 — LARGE: Tracker (spans 4 cols) */}
            <div className="md:col-span-4 group relative rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500">
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-50/40 rounded-full blur-3xl pointer-events-none -translate-x-16 translate-y-16" />
              <div className="relative p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                    <BarChart3 className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Tracking</span>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">Track every application. Know who replied.</h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">Full pipeline visibility — opens, replies, and follow-ups in one place.</p>
                  </div>
                </div>
                {/* Pipeline mini UI */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Sent", count: "24", items: ["Razorpay", "Groww", "CRED"], color: "bg-gray-100 text-gray-500" },
                    { label: "Opened", count: "17", items: ["Zepto", "Meesho", "PhonePe"], color: "bg-amber-50 text-amber-600 border-amber-100" },
                    { label: "Replied", count: "8", items: ["Razorpay", "Zepto", "Swiggy"], color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                  ].map((col, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{col.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${col.color}`}>{col.count}</span>
                      </div>
                      <div className="space-y-1.5">
                        {col.items.map((item, j) => (
                          <div key={j} className="text-[11px] text-gray-500 bg-white rounded-lg px-2 py-1.5 border border-gray-100 truncate">{item}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 5 — Bulk Apply (2 cols) */}
            <div className="md:col-span-2 group relative rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 p-7">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                <Clock className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Automation</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1 leading-tight">Apply to 10 jobs in under a minute</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">Select multiple jobs, hit Apply All, done. What took your afternoon now takes seconds.</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-1">
                  {["R","G","C","Z","M"].map((l,i)=>(
                    <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-indigo-600">{l}</div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">10 applied at once</span>
              </div>
            </div>

            {/* Card 6 — Email Templates (2 cols) */}
            <div className="md:col-span-2 group relative rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 p-7">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                <Mail className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Email</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1 leading-tight">Custom email templates</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">Edit your template anytime. Personalisation tokens auto-fill company name and recruiter details.</p>
              <div className="mt-4 text-[11px] text-gray-400 bg-gray-50 rounded-xl p-3 font-mono border border-gray-100 leading-relaxed">
                Hi <span className="text-indigo-400">{"{recruiter_name}"}</span>, I&apos;m excited about the <span className="text-indigo-400">{"{role}"}</span> at <span className="text-indigo-400">{"{company}"}</span>...
              </div>
            </div>

            {/* Card 7 — Privacy (2 cols) */}
            <div className="md:col-span-2 group relative rounded-3xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 p-7">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                <ShieldCheck className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Privacy</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1 leading-tight">Secure by design</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">Gmail OAuth only. Your credentials never touch our servers. Your data stays yours.</p>
              <div className="mt-4 flex flex-col gap-1.5">
                {["Gmail OAuth — no password stored", "End-to-end privacy", "No data sold"].map((b,i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-gray-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 8 — Trending / Stats (wide) */}
            <div className="md:col-span-6 group relative rounded-3xl border border-gray-100 bg-gradient-to-r from-indigo-50/60 via-white to-purple-50/40 overflow-hidden hover:shadow-xl transition-all duration-500 p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">What users are seeing</h3>
                    <p className="text-sm text-gray-500">Real outcomes from people using Hireoo today.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    { v: "100+", l: "Fresh jobs daily" },
                    { v: "94%", l: "Email open rate" },
                    { v: "3×", l: "More interviews" },
                    { v: "< 1 min", l: "Apply to 10 jobs" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="text-2xl font-bold text-gray-900">{s.v}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle, #818cf8 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
            See it all in action.
            <br /><span className="text-indigo-500">Start free in 2 minutes.</span>
          </h2>
          <p className="text-gray-500 mb-8">No credit card required. Cancel anytime.</p>
          <Link href="/signup" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all">
            Get started for free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
