import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/jobs/:id
 * Returns full details for a single job.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        description: true,
        requirements: true,
        skills: true,
        salary_range: true,
        job_type: true,
        experience_level: true,
        source_url: true,
        application_url: true,
        posted_date: true,
        scraped_at: true,
        status: true,
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Job detail error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
