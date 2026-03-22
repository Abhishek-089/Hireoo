import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { HeroJobPreview } from "@/components/hero/HeroJobPreview"

const JOB_FEED = [
  { role: "Senior Frontend Developer", company: "Razorpay", location: "Bangalore", tag: "Remote ok", email: "hr@razorpay.com", time: "2m ago" },
  { role: "Full Stack Engineer", company: "Groww", location: "Mumbai", tag: "Full-time", email: "talent@groww.in", time: "7m ago" },
  { role: "Backend Engineer (Node.js)", company: "CRED", location: "Bangalore", tag: "Hybrid", email: "careers@cred.club", time: "11m ago" },
  { role: "React Native Developer", company: "Zepto", location: "Delhi", tag: "On-site", email: "hiring@zepto.team", time: "16m ago" },
]

// Each tag carries its own colour palette (bg / border / text / dot)
const ORBIT_TAGS = [
  // ── Right side (3 o'clock) ──
  { label: "React.js",    r: 620, dur: 32, angle: 10,  cw: true,  bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
  { label: "Next.js",     r: 590, dur: 40, angle: 350, cw: true,  bg: "#f8fafc", border: "#cbd5e1", text: "#334155", dot: "#64748b" },
  { label: "Figma",       r: 640, dur: 36, angle: 30,  cw: true,  bg: "#fdf4ff", border: "#e9d5ff", text: "#7e22ce", dot: "#a855f7" },
  { label: "Python",      r: 605, dur: 38, angle: 355, cw: false, bg: "#fefce8", border: "#fde68a", text: "#92400e", dot: "#f59e0b" },
  // ── Top-right ──
  { label: "Node.js",     r: 610, dur: 44, angle: 55,  cw: false, bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e" },
  { label: "Docker",      r: 595, dur: 41, angle: 80,  cw: true,  bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1", dot: "#0ea5e9" },
  // ── Top-left ──
  { label: "UI / UX",    r: 615, dur: 33, angle: 105, cw: true,  bg: "#fff1f2", border: "#fecdd3", text: "#be123c", dot: "#f43f5e" },
  { label: "Kubernetes",  r: 600, dur: 35, angle: 130, cw: false, bg: "#eff6ff", border: "#93c5fd", text: "#1e3a8a", dot: "#2563eb" },
  // ── Left side (9 o'clock) ──
  { label: "TypeScript",  r: 625, dur: 34, angle: 168, cw: true,  bg: "#eef2ff", border: "#c7d2fe", text: "#3730a3", dot: "#6366f1" },
  { label: "SQL",         r: 595, dur: 42, angle: 182, cw: true,  bg: "#f0fdfa", border: "#99f6e4", text: "#0f766e", dot: "#14b8a6" },
  { label: "CSS",         r: 610, dur: 30, angle: 195, cw: false, bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", dot: "#f97316" },
  { label: "AWS",         r: 600, dur: 37, angle: 210, cw: false, bg: "#fffbeb", border: "#fde68a", text: "#b45309", dot: "#f59e0b" },
  // ── Bottom-left ──
  { label: "DevOps",      r: 618, dur: 43, angle: 232, cw: true,  bg: "#f0fdfa", border: "#5eead4", text: "#134e4a", dot: "#0d9488" },
  { label: "Redux",       r: 598, dur: 39, angle: 252, cw: false, bg: "#faf5ff", border: "#e9d5ff", text: "#6b21a8", dot: "#8b5cf6" },
  // ── Bottom-right ──
  { label: "Linux",       r: 608, dur: 36, angle: 278, cw: true,  bg: "#f7fee7", border: "#bef264", text: "#365314", dot: "#65a30d" },
  { label: "Git",         r: 592, dur: 31, angle: 315, cw: false, bg: "#fff1f2", border: "#fecdd3", text: "#9f1239", dot: "#e11d48" },
]

export function Hero() {
  return (
    <div className="relative bg-white">
      {/* ── BACKGROUND LAYERS — each clipped individually ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-indigo-100/60 via-purple-50/30 to-transparent blur-3xl" />
        <div className="absolute top-16 left-[5%] w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-8 right-[5%] w-56 h-56 bg-purple-100/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-60 overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle, #a5b4fc 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 80%)",
        }}
      />

      {/* Radial highlight */}
      <div
        className="absolute inset-0 opacity-40 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── ORBITING SKILL TAGS (desktop only) ──
          3-element orbit pattern per tag:
            1. Arm div     → only rotates (orbit-cw / orbit-ccw)
            2. Offset div  → only translateX(radius), NO animation, so never overridden
            3. Counter div → counter-rotates so chip text stays upright
          Pivot at top:50% spans the full hero content (headline → dashboard).
      */}
      {ORBIT_TAGS.map((t) => {
        const delay = `${(-(t.angle / 360) * t.dur).toFixed(2)}s`
        const fwd   = t.cw ? "orbit-cw"  : "orbit-ccw"
        const back  = t.cw ? "orbit-ccw" : "orbit-cw"
        return (
          <div
            key={t.label}
            className="hidden xl:block absolute pointer-events-none"
            style={{ top: "42%", left: "50%", width: 0, height: 0 }}
          >
            {/* 1 — Rotating arm */}
            <div style={{ animation: `${fwd} ${t.dur}s linear infinite`, animationDelay: delay }}>
              {/* 2 — Translate to orbit radius (no animation = cannot be overridden) */}
              <div style={{ transform: `translateX(${t.r}px)` }}>
                {/* 3 — Counter-rotate so chip stays upright */}
                <div style={{ animation: `${back} ${t.dur}s linear infinite`, animationDelay: delay }}>
                  {/* Coloured pill chip — centred on orbit point */}
                  <div
                    className="select-none"
                    style={{
                      display: "inline-block",
                      width: "max-content",
                      transform: "translate(-50%, -50%)",
                      padding: "7px 18px",
                      borderRadius: "999px",
                      background: t.bg,
                      border: `1.5px solid ${t.border}`,
                      boxShadow: `0 4px 20px 0 ${t.dot}30, 0 1px 4px rgba(0,0,0,0.07)`,
                      whiteSpace: "nowrap",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span
                      className="font-semibold leading-none tracking-wide"
                      style={{ fontSize: 12, color: t.text }}
                    >
                      {t.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-0">
        {/* Pill badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-600 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 relative">
              <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-60" />
            </span>
            New top jobs added every hour
          </span>
        </div>

        {/* Headline */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-gray-900 leading-[1.05]">
            The{" "}
            <span className="relative inline-block">
              <span className="text-indigo-500">fastest way</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                <path d="M2 6C60 2 140 1 298 6" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </span>
            {" "}to land{" "}
            <br className="hidden sm:block" />
            your next job.
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            We surface fresh job openings every hour, match them to your profile,
            and apply on your behalf — one click, zero effort.
          </p>
        </div>

        {/* CTA row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="group flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/15"
          >
            Start for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/how-it-works"
            className="flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-50 transition-all"
          >
            See how it works
          </Link>
        </div>

        {/* Trust row */}
        <div className="mt-5 flex items-center justify-center gap-5 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            No credit card
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            Free to start
          </span>
          <span className="w-px h-3 bg-gray-200" />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            Cancel anytime
          </span>
        </div>

        <HeroJobPreview jobs={JOB_FEED} />
      </div>

      {/* Stats strip */}
      <div className="relative mt-10 border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "100+", label: "Fresh jobs daily", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { value: "94%", label: "Email open rate", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
              { value: "3x", label: "More interviews", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
              { value: "< 1 min", label: "Apply to 10 jobs", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d={stat.icon} />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 leading-none">{stat.value}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
