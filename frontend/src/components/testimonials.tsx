const testimonials = [
  {
    name: "Rahul Mehta",
    role: "Frontend Developer",
    company: "Razorpay",
    initials: "RM",
    bg: "bg-blue-500",
    content:
      "I used to spend 2 hours a day just searching and applying. With Hireoo I spend 5 minutes reviewing matches and click apply. Got 8 interview calls in my first week.",
  },
  {
    name: "Priya Nair",
    role: "Product Manager",
    company: "Zepto",
    initials: "PN",
    bg: "bg-violet-500",
    content:
      "The quality of matches is genuinely impressive. It's not blasting your resume everywhere — it finds roles that actually fit. Landed my current job in 3 weeks.",
  },
  {
    name: "Arjun Sharma",
    role: "Backend Engineer",
    company: "CRED",
    initials: "AS",
    bg: "bg-emerald-500",
    content:
      "The emails it sends on my behalf are better written than what I'd draft myself. Professional, concise, and they actually get replies. Highly recommend.",
  },
  {
    name: "Sneha Kapoor",
    role: "UX Designer",
    company: "Groww",
    initials: "SK",
    bg: "bg-rose-500",
    content:
      "I'd been job hunting for 2 months with little success. Hireoo surfaced opportunities I'd never have found manually. Got hired in under a month.",
  },
  {
    name: "Vikram Tiwari",
    role: "DevOps Engineer",
    company: "PhonePe",
    initials: "VT",
    bg: "bg-amber-500",
    content:
      "Set up in 5 minutes. By the next morning I had 20 matched jobs waiting. Applied to 15 of them with one click. This is genuinely how job searching should work.",
  },
  {
    name: "Ananya Bose",
    role: "Data Scientist",
    company: "Meesho",
    initials: "AB",
    bg: "bg-indigo-500",
    content:
      "The auto-apply to batches is a game changer. I pick my top 10 matches every morning and apply to all of them before my coffee is done.",
  },
]

export function Testimonials() {
  return (
    <section className="bg-white py-24 sm:py-28 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            People landing jobs{" "}
            <span className="text-gray-400">without the grind.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 bg-white"
            >
              {/* Quote marks */}
              <svg className="h-5 w-5 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                {t.content}
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div className={`w-9 h-9 rounded-full ${t.bg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <div className="text-gray-900 text-sm font-semibold">{t.name}</div>
                  <div className="text-gray-400 text-xs">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {[
            { value: "12,000+", label: "Active users" },
            { value: "850K+", label: "Applications sent" },
            { value: "3.4×", label: "More callbacks" },
            { value: "< 48h", label: "Avg. first reply" },
          ].map((stat) => (
            <div key={stat.label} className="px-8 py-8 text-center bg-white hover:bg-gray-50/60 transition-colors">
              <div className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
