import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag } from "lucide-react"
import { getPostBySlug, getAllPostSlugs, getAllPostsMeta, formatDate } from "@/lib/blog"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const siteUrl = "https://www.hireoo.in"

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: post.coverImage || "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.coverImage || "/og-image.png"],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const siteUrl = "https://www.hireoo.in"
  const allPosts = getAllPostsMeta()
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const prevPost = allPosts[currentIndex + 1] || null
  const nextPost = allPosts[currentIndex - 1] || null

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "author": { "@type": "Organization", "name": post.author },
    "publisher": {
      "@type": "Organization",
      "name": "Hireoo",
      "url": siteUrl,
      "logo": { "@type": "ImageObject", "url": `${siteUrl}/icon.png` },
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "url": `${siteUrl}/blog/${post.slug}`,
    "image": post.coverImage ? `${siteUrl}${post.coverImage}` : `${siteUrl}/og-image.png`,
    "keywords": post.tags.join(", "),
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug}` },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${siteUrl}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `${siteUrl}/blog/${post.slug}` },
    ],
  }

  return (
    <div className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-indigo-50/60 via-purple-50/20 to-transparent blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 pt-28 pb-12">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All posts
          </Link>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
              <Tag className="h-2.5 w-2.5" />
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.date)}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="font-medium text-gray-600">{post.author}</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {post.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100 text-[11px] text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ARTICLE CONTENT ── */}
      <article className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* ── AUTHOR CARD ── */}
      <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-12">
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/60">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
            H
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{post.author}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Building India&apos;s #1 auto apply job website — helping thousands of candidates land jobs faster.
            </div>
          </div>
        </div>
      </div>

      {/* ── PREV / NEXT ── */}
      {(prevPost || nextPost) && (
        <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-10">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`} className="group flex flex-col gap-2 p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Previous
                </span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {prevPost.title}
                </span>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="group flex flex-col gap-2 p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all sm:text-right sm:items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 flex items-center gap-1">
                  Next <ArrowRight className="h-3 w-3" />
                </span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <section className="py-14 border-t border-indigo-100 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Ready to automate your job search?
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Join thousands of candidates using Hireoo to apply to jobs in one click — free to start.
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
