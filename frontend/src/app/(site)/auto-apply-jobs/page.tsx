import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Zap, Search, Send, BarChart3, Clock, Eye } from "lucide-react"

export const metadata: Metadata = {
  title: "Auto Apply Job Website – Automate Job Applications in India | Hireoo",
  description: "Hireoo is India's #1 auto apply job website. Automate job applications with one-click apply — AI finds fresh jobs every hour, matches them to your profile, and applies on your behalf via Gmail. Find hidden jobs others miss.",
  keywords: [
    "auto apply job website",
    "automate job applications",
    "one click apply jobs",
    "apply job in one click",
    "hidden jobs",
    "automatic job application India",
    "bulk apply jobs",
    "job automation website",
    "auto apply jobs India",
    "automated job search",
  ],
  alternates: { canonical: "/auto-apply-jobs" },
  openGraph: {
    title: "Auto Apply Job Website – Automate Job Applications | Hireoo",
    description: "India's #1 auto apply job website. One-click apply, AI job matching, and access to hidden jobs via direct recruiter outreach.",
    url: "https://www.hireoo.in/auto-apply-jobs",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Hireoo – Auto Apply Job Website India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Apply Job Website – Automate Job Applications | Hireoo",
    description: "India's #1 auto apply job website. One-click apply and AI job matching.",
    images: ["/og-image.png"],
  },
}

const benefits = [
  {
    icon: Search,
    title: "AI finds jobs for you",
    description: "New job openings are discovered and ranked against your profile every hour — no manual searching required.",
  },
  {
    icon: Zap,
    title: "One-click apply to any job",
    description: "Hit Apply on any matched job. A personalised email is sent from your own Gmail to the recruiter in under 3 seconds.",
  },
  {
    icon: Send,
    title: "Bulk apply to 10 jobs at once",
    description: "Select multiple roles and apply to all of them before your coffee gets cold. What used to take hours now takes seconds.",
  },
  {
    icon: Eye,
    title: "Access hidden jobs",
    description: "Up to 70% of jobs are never posted publicly. Hireoo's direct recruiter outreach gives you access to this hidden job market.",
  },
  {
    icon: BarChart3,
    title: "Track every application",
    description: "See who opened your email, who replied, and who needs a follow-up — all from one clean dashboard.",
  },
  {
    icon: Clock,
    title: "Apply to 10 jobs in under a minute",
    description: "Most users send their first application within 10 minutes of signing up. The average time to apply to 10 jobs is under 60 seconds.",
  },
]

const faqs = [
  {
    q: "What makes Hireoo an auto apply job website?",
    a: "Hireoo automates every step of job applications: AI discovers fresh openings hourly, matches them to your profile, and when you click Apply, it writes a personalised email and sends it to the recruiter from your Gmail — instantly. You can also auto-apply to 10 jobs at once with one click.",
  },
  {
    q: "How do I automate job applications with Hireoo?",
    a: "Sign up, upload your resume, set your preferences (role, location, experience), and connect your Gmail. Hireoo will start surfacing matched jobs immediately. Click Apply on any job — or select multiple jobs and click Apply All to automate job applications in bulk.",
  },
  {
    q: "Is it really one-click to apply to jobs?",
    a: "Yes. One click on Apply sends a personalised, professional email to the recruiter from your own Gmail address with your resume attached. No forms to fill, no copy-pasting. Truly one click.",
  },
  {
    q: "What are hidden jobs and can Hireoo help me find them?",
    a: "Hidden jobs are roles that are filled through direct recruiter outreach rather than job board postings — research suggests 70-80% of positions are never advertised. Hireoo helps you access this hidden job market by enabling direct, personalised cold email outreach to recruiters at companies you want to work for.",
  },
  {
    q: "Does Hireoo work for jobs in India?",
    a: "Yes. Hireoo is built for the Indian job market. We surface jobs at Indian startups, MNCs, and tech companies across Bangalore, Mumbai, Delhi, Hyderabad, and remote roles across India.",
  },
  {
    q: "Is auto-applying spam? Will recruiters ignore my applications?",
    a: "No. Unlike mass-spamming platforms, Hireoo only applies to jobs that are a strong match for your profile, and each application is a personalised email (not a generic form submission). Recruiters actually read these emails — our platform achieves a 94% email open rate.",
  },
]

export default function AutoApplyJobsPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.hireoo.in" },
      { "@type": "ListItem", "position": 2, "name": "Auto Apply Jobs", "item": "https://www.hireoo.in/auto-apply-jobs" },
    ],
  }

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 pt-28 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            India&apos;s #1 Auto Apply Job Website
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Auto Apply to Jobs.
            <br />
            <span className="text-indigo-500">One Click. Zero Effort.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Hireoo is India&apos;s fastest auto apply job website. AI matches fresh jobs to your profile every hour, and you apply with a single click via your own Gmail — or let us bulk-apply to 10 at once.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/15"
            >
              Start auto-applying for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-all"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-5 flex items-center justify-center gap-5 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />Free to start</span>
            <span className="w-px h-3 bg-gray-200" />
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />No credit card</span>
            <span className="w-px h-3 bg-gray-200" />
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />Apply in 10 minutes</span>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "< 1 min", label: "Apply to 10 jobs" },
              { value: "100+", label: "Fresh jobs daily" },
              { value: "94%", label: "Email open rate" },
              { value: "3×", label: "More interviews" },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-4 px-3 rounded-xl bg-white border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── WHAT IS AUTO APPLY ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              What is an auto apply job website?
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              An auto apply job website automates the most tedious part of job hunting — the actual applying. Instead of spending hours writing cover letters and filling out forms, you let AI handle it. Hireoo finds jobs that match your profile and applies on your behalf, sending personalised emails directly to recruiters from your own Gmail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, i) => (
              <div key={i} className="group relative rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 transition-all duration-300">
                  <benefit.icon className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO AUTOMATE JOB APPLICATIONS ── */}
      <section className="py-16 sm:py-20 bg-gray-50/60 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              How to automate job applications with Hireoo
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From signup to your first automated job application in under 10 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: "01",
                title: "Create your profile",
                desc: "Upload your resume and tell us your target role, skills, experience, and preferred locations. Takes 2 minutes.",
              },
              {
                step: "02",
                title: "AI matches jobs",
                desc: "Hireoo discovers fresh job openings every hour and ranks them by match score against your profile. Your daily matches are ready when you wake up.",
              },
              {
                step: "03",
                title: "One-click apply",
                desc: "Click Apply on any job. A personalised email is written and sent to the recruiter from your own Gmail with your resume attached — instantly.",
              },
              {
                step: "04",
                title: "Track your replies",
                desc: "See who opened your email, who replied, and who's worth following up — all from one dashboard.",
              },
            ].map((s, i) => (
              <div key={i} className="relative rounded-2xl border border-gray-100 bg-white p-6">
                <div className="text-4xl font-black text-indigo-50 mb-3">{s.step}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIDDEN JOBS SECTION ── */}
      <section className="py-16 sm:py-20 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-4">
                The hidden job market
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                Most jobs are never posted publicly.
                <br />
                <span className="text-indigo-500">Hireoo helps you find them.</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Research shows that <strong className="text-gray-700">70–80% of jobs are filled without ever being posted</strong> on job boards like LinkedIn or Naukri. These hidden jobs are filled through direct recruiter outreach — the exact method Hireoo uses.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                When you apply via Hireoo, you&apos;re sending a personalised email directly to the hiring manager or recruiter — often before the role is even listed publicly. This gives you a massive advantage over other applicants who only search public job boards.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all"
              >
                Access hidden jobs now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: "Jobs on public boards (LinkedIn, Naukri, etc.)", pct: 25, color: "bg-gray-300" },
                { label: "Hidden jobs filled via direct outreach", pct: 75, color: "bg-indigo-500" },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl border border-gray-100 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50 mt-4">
                <p className="text-sm text-indigo-700 font-medium">
                  Hireoo users get direct recruiter contact — reaching roles that most job seekers never even see.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-20 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              Frequently asked questions
            </h2>
            <p className="text-gray-500">Everything about auto apply jobs, one-click apply, and hidden jobs.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
            Stop applying manually.
            <br />
            <span className="text-indigo-500">Start landing interviews.</span>
          </h2>
          <p className="text-gray-500 mb-8">
            Join thousands of professionals letting Hireoo automate job applications on their behalf.
            Free to start — no credit card required.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all"
          >
            Start auto-applying for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
