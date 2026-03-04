import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { extractEmails } from "@/lib/utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const matches = await prisma.scrapedPostMatch.findMany({
    where: {
      user_id: userId,
      applied: false,
      shown_to_user: true,
      scrapedPost: { text: { contains: "@" } },
    },
    include: {
      scrapedPost: {
        include: { job: true },
      },
    },
    orderBy: { shown_at: "desc" },
  })

  const posts = matches
    .map((match: any) => {
      const text = match.text_content || match.scrapedPost.text
      const emails = extractEmails(text)
      if (emails.length === 0) return null

      const job = match.scrapedPost.job
      return {
        id: match.scrapedPost.id,
        text,
        postUrl: match.scrapedPost.post_url,
        emails,
        createdAt: match.scrapedPost.created_at.toISOString(),
        matchScore: match.match_score ?? null,
        matchQuality: match.match_quality ?? null,
        applied: false,
        isEnriched: !!job,
        jobData: job
          ? {
              title: job.title,
              company: job.company,
              location: job.location,
              skills: job.skills,
              salary: job.salary_range,
              postedDate: job.posted_date?.toISOString(),
              description: job.description,
            }
          : null,
      }
    })
    .filter(Boolean)

  return NextResponse.json({ posts })
}
