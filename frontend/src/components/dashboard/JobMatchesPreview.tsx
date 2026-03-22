import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { extractEmails } from "@/lib/utils"
import Link from "next/link"
import { ArrowUpRight, Briefcase, MapPin, Star, Zap } from "lucide-react"

async function getPreviewMatches(userId: string) {
  try {
    const rows = await prisma.scrapedPostMatch.findMany({
      where: {
        user_id: userId,
        shown_to_user: true,
        applied: false,
        scrapedPost: { text: { contains: "@" } },
      },
      include: {
        scrapedPost: { include: { job: true } },
      },
      orderBy: { shown_at: "desc" },
      take: 5,
    })

    return rows
      .map((match: any) => ({
        id: match.scrapedPost.id,
        text: match.text_content || match.scrapedPost.text || "",
        postUrl: match.scrapedPost.post_url,
        matchScore: match.match_score ?? null,
        matchQuality: match.match_quality ?? null,
        emails: extractEmails(match.text_content || match.scrapedPost.text || ""),
        job: match.scrapedPost.job
          ? {
              title: match.scrapedPost.job.title,
              company: match.scrapedPost.job.company,
              location: match.scrapedPost.job.location,
            }
          : null,
      }))
      .filter((p: any) => p.emails.length > 0)
      .slice(0, 5)
  } catch {
    return []
  }
}

function matchScoreColor(score: number | null) {
  if (!score) return { bar: "bg-gray-300", text: "text-gray-500", badge: "bg-gray-100 text-gray-600" }
  if (score >= 80) return { bar: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700" }
  if (score >= 60) return { bar: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-50 text-amber-700" }
  return { bar: "bg-rose-400", text: "text-rose-700", badge: "bg-rose-50 text-rose-700" }
}

export async function JobMatchesPreview() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return null

  const matches = await getPreviewMatches(userId)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Matched Jobs</h2>
          {matches.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
              {matches.length} new
            </span>
          )}
        </div>
        <Link
          href="/dashboard/job-matches"
          className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
            <Briefcase className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No matches yet</p>
          <p className="text-xs text-gray-400 mt-1">
            AI-matched jobs will appear here once your profile is set up.
          </p>
          <Link
            href="/dashboard/job-matches"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Find Matches
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-50">
            {matches.map((match) => {
              const colors = matchScoreColor(match.matchScore)
              const title = match.job?.title || "Job Opportunity"
              const company = match.job?.company || null
              const location = match.job?.location || null

              return (
                <li key={match.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  {/* Icon */}
                  <div className="shrink-0 p-2 rounded-xl bg-indigo-50">
                    <Briefcase className="h-4 w-4 text-indigo-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {company && (
                        <span className="text-xs text-gray-500 truncate">{company}</span>
                      )}
                      {location && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match score */}
                  {match.matchScore !== null && (
                    <div className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${colors.badge}`}>
                      <Star className="h-3 w-3" />
                      {match.matchScore}%
                    </div>
                  )}

                  {/* Arrow */}
                  <Link
                    href="/dashboard/job-matches"
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* View More button */}
          <div className="px-5 py-3.5 border-t border-gray-50">
            <Link
              href="/dashboard/job-matches"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
            >
              View More Matches
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
