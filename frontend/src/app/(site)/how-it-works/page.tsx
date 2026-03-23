import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight, UserRoundPen, ScanSearch, Send, MailOpen,
  CheckCircle2, Briefcase, Mail, Zap, TrendingUp,
} from "lucide-react"

export const metadata: Metadata = {
  title: "How to Apply Job in One Click – Automate Job Applications | Hireoo",
  description: "Learn how Hireoo lets you apply to jobs in one click. Create your profile, AI matches fresh jobs daily, you one-click apply via Gmail, and track every reply. Go from signup to first application in under 10 minutes.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How to Apply Job in One Click – Automate Job Applications | Hireoo",
    description: "Create profile → AI matches jobs → one-click apply via Gmail → track replies. Automate your job applications in under 10 minutes.",
    url: "https://www.hireoo.in/how-it-works",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How Hireoo Works" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Apply Job in One Click | Hireoo",
    description: "Create profile → AI matches jobs → one-click apply via Gmail → track replies.",
    images: ["/og-image.png"],
  },
}

const steps = [
  {
    number: "01",
    icon: UserRoundPen,
    title: "Create your profile",
    subtitle: "Takes 2 minutes. Only done once.",
    description: "Tell us your target role, skills, experience level, and preferred locations. Upload your resume. That's it — we remember everything from here.",
    bullets: ["Upload resume (PDF or Word)", "Set target roles & locations", "Preferred work mode & salary"],
    visual: (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 space-y-3">
        <div className="text-xs font-semibold text-gray-700 mb-2">Your Profile</div>
        {[
          { label: "Role", value: "Frontend Developer" },
          { label: "Experience", value: "2–4 years" },
          { label: "Location", value: "Bangalore / Remote" },
          { label: "Resume", value: "resume_v3.pdf ✓" },
        ].map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-[11px] font-medium text-gray-400">{r.label}</span>
            <span className="text-[11px] font-semibold text-gray-800">{r.value}</span>
          </div>
        ))}
        <div className="pt-1">
          <div className="w-full py-2 rounded-xl bg-gray-900 text-white text-[11px] font-semibold text-center">Profile saved ✓</div>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "We find & match jobs",
    subtitle: "Updated every hour. Zero effort from you.",
    description: "We surface fresh job openings daily and score each one against your profile. You open the app and your matches are already there — ranked, filtered, ready.",
    bullets: ["Ranked by fit, not recency", "Filtered by your preferences", "New matches every morning"],
    visual: (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-700">Today&apos;s Matches</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold">42 new</span>
        </div>
        <div className="space-y-2">
          {[
            { role: "Senior Frontend Dev", co: "Razorpay", pct: "98%" },
            { role: "Full Stack Engineer", co: "Groww", pct: "95%" },
            { role: "Backend Engineer", co: "CRED", pct: "91%" },
          ].map((j, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-900">{j.role}</div>
                  <div className="text-[10px] text-gray-400">{j.co}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{j.pct}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Send,
    title: "Apply in one click",
    subtitle: "Personalised, professional, instant.",
    description: "Hit Apply on any job. We write a personalised email, attach your resume, and send it from your own Gmail address — all in under 3 seconds.",
    bullets: ["Personalised email per recruiter", "Sends from your own Gmail", "Resume auto-attached"],
    visual: (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-1">Email preview</div>
        <div className="space-y-1 text-[11px]">
          <div className="flex gap-2"><span className="text-gray-400 w-8">To</span><span className="text-gray-800 font-medium">hr@razorpay.com</span></div>
          <div className="flex gap-2"><span className="text-gray-400 w-8">Sub</span><span className="text-gray-800 font-medium">Interested in Senior Frontend Dev role</span></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-[11px] text-gray-500 leading-relaxed">
          Hi Priya, I came across the Senior Frontend Dev role at Razorpay and I&apos;m really excited about it...
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Mail className="h-3 w-3" />
            via your Gmail
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[11px] font-semibold">
            <Zap className="h-3 w-3" />
            Apply now
          </button>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    icon: MailOpen,
    title: "Track your replies",
    subtitle: "See exactly who's interested.",
    description: "Every application is tracked in your dashboard. Know who opened your email, who replied, and who needs a follow-up — all in one clean view.",
    bullets: ["Email open & reply tracking", "Pipeline by status", "Follow-up reminders"],
    visual: (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
        <div className="text-xs font-semibold text-gray-700 mb-3">Application Pipeline</div>
        <div className="space-y-2 mb-4">
          {[
            { co: "Razorpay", status: "Replied", dot: "bg-emerald-400", label: "text-emerald-600 bg-emerald-50" },
            { co: "Groww", status: "Opened", dot: "bg-amber-400", label: "text-amber-600 bg-amber-50" },
            { co: "CRED", status: "Sent", dot: "bg-gray-300", label: "text-gray-500 bg-gray-100" },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${a.dot}`} />
                <span className="text-[11px] font-semibold text-gray-800">{a.co}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.label}`}>{a.status}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          <span className="text-[11px] text-gray-500 font-medium">8 of 24 applications got replies this week</span>
        </div>
      </div>
    ),
  },
]

const faqs = [
  { q: "How long does setup take?", a: "Under 5 minutes. Create your account, upload your resume, set your preferences, and you're ready." },
  { q: "Does it send emails from my own Gmail?", a: "Yes — via Gmail OAuth. Every email goes from your address so replies land in your inbox." },
  { q: "Can I review emails before they're sent?", a: "Yes. Preview every email before applying, and edit the template anytime from settings." },
  { q: "Is it free to use?", a: "Hireoo is free with 10 matches per day. Upgrade for more matches, bulk apply, and tracking." },
]

export default function HowItWorksPage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-50/70 via-purple-50/20 to-transparent blur-3xl" />
          <div className="absolute top-20 left-16 w-40 h-40 bg-indigo-100/30 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-16 right-16 w-32 h-32 bg-purple-100/20 rounded-full blur-2xl animate-float" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            4 simple steps
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05] max-w-2xl mx-auto">
            From sign-up to
            <br />
            <span className="text-indigo-500">job offer.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
            Most users send their first application within 10 minutes of signing up.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="group flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/15">
              Try it free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/features" className="flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-all">
              See all features
            </Link>
          </div>
        </div>
      </div>

      {/* ── VISUAL TIMELINE ── */}
      <section className="py-6 sm:py-10 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="relative">
            {/* Vertical line — desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-100 via-indigo-200 to-indigo-100 -translate-x-1/2" />

            <div className="space-y-8">
              {steps.map((step, i) => {
                const isEven = i % 2 === 0
                return (
                  <div key={i} className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

                    {/* Center node — desktop */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shadow-lg">
                        <step.icon className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center shadow">
                        {i + 1}
                      </div>
                    </div>

                    {/* Content side */}
                    <div className={`${isEven ? "lg:text-right lg:pr-16" : "lg:order-2 lg:pl-16"}`}>
                      {/* Mobile node */}
                      <div className="lg:hidden flex items-center gap-3 mb-4">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shadow-sm">
                            <step.icon className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4.5 h-4.5 w-5 h-5 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center">
                            {i + 1}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Step {step.number}</div>
                      </div>

                      <div className={`${isEven ? "lg:flex lg:flex-col lg:items-end" : ""}`}>
                        <div className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-1">Step {step.number}</div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-1">{step.title}</h2>
                        <p className="text-sm font-semibold text-indigo-400 mb-3">{step.subtitle}</p>
                        <p className="text-gray-500 leading-relaxed mb-5 max-w-sm">{step.description}</p>
                        <ul className={`space-y-2 ${isEven ? "lg:items-end" : ""}`}>
                          {step.bullets.map((b, j) => (
                            <li key={j} className={`flex items-center gap-2 text-sm text-gray-600 ${isEven ? "lg:flex-row-reverse" : ""}`}>
                              <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Visual side */}
                    <div className={`${isEven ? "lg:order-2 lg:pl-16" : "lg:pr-16"}`}>
                      <div className="group hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 rounded-2xl">
                        {step.visual}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-semibold mb-4 shadow-sm">
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              Common questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Quick answers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle, #818cf8 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Ready to try it yourself?
            <br /><span className="text-indigo-500">Takes less than 5 minutes.</span>
          </h2>
          <p className="text-gray-500 mb-8">Free to start. No credit card required.</p>
          <Link href="/signup" className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all">
            Get started for free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
