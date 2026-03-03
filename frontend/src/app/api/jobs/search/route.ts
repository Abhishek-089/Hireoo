import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/jobs/search?q=keyword&limit=20&offset=0&location=...&job_type=...
 *
 * Database-first job search. Returns results from the Job table
 * populated by the centralized scraper. Fast and does NOT trigger live scraping.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")
    const location = searchParams.get("location")?.trim()
    const jobType = searchParams.get("job_type")?.trim()
    const experienceLevel = searchParams.get("experience_level")?.trim()

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const where: any = {
      status: "active",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { skills: { hasSome: [query] } },
      ],
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }
    if (jobType) {
      where.job_type = { contains: jobType, mode: "insensitive" }
    }
    if (experienceLevel) {
      where.experience_level = { contains: experienceLevel, mode: "insensitive" }
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: [
          { posted_date: "desc" },
          { scraped_at: "desc" },
        ],
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          description: true,
          skills: true,
          salary_range: true,
          job_type: true,
          experience_level: true,
          source_url: true,
          application_url: true,
          posted_date: true,
          scraped_at: true,
        },
      }),
    ])

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        ...job,
        description: job.description
          ? job.description.substring(0, 500) + (job.description.length > 500 ? "..." : "")
          : null,
      })),
      total,
      limit,
      offset,
      query,
    })
  } catch (error) {
    console.error("Job search error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
