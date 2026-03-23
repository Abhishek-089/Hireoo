import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap, Target, Heart, Users, TrendingUp, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "About Hireoo – Building India's Best Auto Apply Job Website",
  description: "Learn about Hireoo — the team building India's #1 auto apply job website. We automate job applications so job seekers can focus on interviews, not tedious applications.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Hireoo – Building India's Best Auto Apply Job Website",
    description: "The team building India's #1 auto apply job website — automating job applications so you can focus on interviews.",
    url: "https://www.hireoo.in/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About Hireoo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Hireoo – Auto Apply Job Website",
    description: "The team building India's #1 auto apply job website.",
    images: ["/og-image.png"],
  },
}

const values = [
  {
    icon: Zap,
    title: "Speed over friction",
    description: "Every minute spent copy-pasting your resume is a minute not spent preparing for interviews. We remove that friction entirely.",
  },
  {
    icon: Target,
    title: "Quality over quantity",
    description: "We don't flood you with irrelevant listings. Our matching engine surfaces jobs where you genuinely have a shot.",
  },
  {
    icon: Heart,
    title: "Built for job seekers",
    description: "We've been on the other side of the job hunt. Every feature we ship is something we'd have wanted ourselves.",
  },
  {
    icon: Users,
    title: "Transparency first",
    description: "No black-box algorithms. You can see your match scores, why a job was surfaced, and exactly what we sent on your behalf.",
  },
]

const stats = [
  { value: "1000+", label: "Job posts in database" },
  { value: "< 60s", label: "From post to your inbox" },
  { value: "AI-first", label: "Cover letters, not templates" },
  { value: "🇮🇳", label: "Built in India" },
]

export default function AboutPage() {
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
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Our story
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
              Job hunting is broken.
              <br />
              <span className="text-indigo-500">We&apos;re fixing it.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Hireoo was born out of frustration with the job search process — hundreds of tabs open,
              copy-pasting the same details over and over, and never knowing if anyone even read your application.
              We built the platform we wish had existed.
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="border-y border-gray-100 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MISSION ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-5">
              Our mission
            </span>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
              Your time should go toward interviews, not applications.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5">
              The average job seeker spends 11 hours a week just searching and applying — most of it
              on repetitive tasks a computer could handle in seconds. Hireoo automates the busywork:
              finding fresh LinkedIn posts with contact emails, scoring them against your profile, and
              sending personalised cover letters on your behalf.
            </p>
            <p className="text-gray-500 leading-relaxed">
              You get a clean daily feed of jobs that actually match you, with one-click apply and
              full visibility into every email sent. When a recruiter replies, you see it right there
              in your dashboard.
            </p>
          </div>

          {/* Visual card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/60 to-purple-100/40 rounded-3xl blur-2xl" />
            <div className="relative bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-4">
              {[
                { step: "01", title: "Scrape", desc: "Chrome extension captures LinkedIn job posts with recruiter emails in real time." },
                { step: "02", title: "Match", desc: "AI scores each post against your skills, titles, and location preferences." },
                { step: "03", title: "Apply", desc: "A personalised cover letter is generated and sent from your Gmail — automatically." },
                { step: "04", title: "Track", desc: "Replies, open rates, and application history all in one dashboard." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── VALUES ── */}
      <div className="bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-5">
              What we believe
            </span>
            <h2 className="text-4xl font-bold text-gray-900">Our values</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <value.icon className="h-5 w-5 text-indigo-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STORY ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-xs font-semibold mb-5">
            How we started
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Built out of real frustration</h2>
          <div className="space-y-5 text-gray-500 leading-relaxed text-left">
            <p>
              Hireoo started when our founder was applying to dozens of jobs a week and noticed that
              the most effective applications — the ones that actually got replies — all had one thing
              in common: a direct email to the recruiter with a tailored message.
            </p>
            <p>
              The problem? Finding those emails took forever. LinkedIn posts bury contact details,
              job boards don&apos;t surface them, and manually copy-pasting to compose emails is soul-crushing work.
            </p>
            <p>
              So we automated it. A Chrome extension that quietly captures LinkedIn posts as you scroll,
              extracts recruiter emails, scores jobs against your profile, and sends applications
              while you sleep. What used to take 3 hours a day now takes 3 minutes.
            </p>
            <p>
              We&apos;re a small team building in India, shipping fast, and deeply invested in helping
              people land jobs they actually want.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 text-center">
          <TrendingUp className="h-10 w-10 text-indigo-200 mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to automate your job search?
          </h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto leading-relaxed">
            Join job seekers who are spending less time applying and more time interviewing.
            Free to get started — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-600 px-6 py-3 text-sm font-semibold hover:bg-indigo-50 transition-colors"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/50 text-white px-6 py-3 text-sm font-semibold hover:bg-indigo-500/30 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Talk to us
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
