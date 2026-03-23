import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Clock, Tag } from "lucide-react"
import { getAllPostsMeta, formatDate } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog – Job Search Tips, Automation & Career Advice | Hireoo",
  description: "Expert advice on automating job applications, one-click apply strategies, finding hidden jobs, and landing interviews faster. Updated regularly by the Hireoo team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog – Job Search Tips & Automation | Hireoo",
    description: "Expert advice on automating job applications and landing interviews faster.",
    url: "https://www.hireoo.in/blog",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Hireoo Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog – Job Search Tips & Automation | Hireoo",
    description: "Expert advice on automating job applications and landing interviews faster.",
    images: ["/og-image.png"],
  },
}

export default function BlogPage() {
  const posts = getAllPostsMeta()

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-50/80 via-purple-50/30 to-transparent blur-3xl" />
          <div className="absolute top-20 left-10 w-48 h-48 bg-indigo-100/40 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-36 h-36 bg-purple-100/30 rounded-full blur-2xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.2]"
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
            Job Search Insights
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
            The Hireoo Blog
          </h1>
          <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Tips, strategies, and insights on automating your job search, finding hidden jobs, and landing interviews faster.
          </p>
        </div>
      </div>

      {/* ── POSTS ── */}
      <section className="py-12 pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No posts yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden"
                >
                  {/* Category bar */}
                  <div className="px-6 pt-6 pb-0">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
                      <Tag className="h-2.5 w-2.5" />
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6 pt-4">
                    <h2 className="text-base font-bold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-3">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3">
                      {post.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span>{formatDate(post.date)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 group-hover:gap-2 transition-all">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Ready to stop applying manually?
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Join thousands of job seekers automating their applications with Hireoo.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 hover:shadow-lg transition-all"
          >
            Start for free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

    </div>
  )
}
