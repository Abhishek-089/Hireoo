import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateCoverLetter } from "@/lib/services/ai.service"

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scrapedPostId } = await request.json()
    if (!scrapedPostId || typeof scrapedPostId !== "string") {
      return NextResponse.json({ error: "scrapedPostId is required" }, { status: 400 })
    }

    // ── Load everything in parallel ───────────────────────────────────────────
    const [user, resume, scrapedPost] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          skills: true,
          experience_level: true,
          job_types: true,
          resume_uploaded: true,
          email_template_config: true,
        },
      }),
      prisma.resume.findFirst({
        where: { user_id: session.user.id },
        orderBy: { created_at: "desc" },
      }),
      prisma.scrapedPost.findUnique({
        where: { id: scrapedPostId },
        include: { job: true },
      }),
    ])

    // Resume check
    if (!resume && !user?.resume_uploaded) {
      return NextResponse.json({ error: "Resume required", code: "RESUME_REQUIRED" }, { status: 409 })
    }

    if (!scrapedPost) {
      return NextResponse.json({ error: "Scraped post not found" }, { status: 404 })
    }

    // Access check
    const userMatch = await prisma.scrapedPostMatch.findUnique({
      where: { user_id_scraped_post_id: { user_id: session.user.id, scraped_post_id: scrapedPostId } },
    })
    if (!userMatch) {
      return NextResponse.json({ error: "You don't have access to this post" }, { status: 403 })
    }

    // ── Gather context ────────────────────────────────────────────────────────
    const [firstName, ...rest] = (user?.name || "").split(" ").filter(Boolean)
    const userFirstName = firstName || "there"
    const userLastName  = rest.join(" ")

    const templateConfig  = (user?.email_template_config as any) || {}
    const toneId          = templateConfig.templateId || "direct_application"
    const userSkills      = user?.skills ?? []
    const experienceLevel = user?.experience_level ?? undefined
    const jobType         = user?.job_types?.[0] ?? undefined

    // Enriched job data (may be null if not yet enriched)
    const job = (scrapedPost as any).job
    const jobTitle          = job?.title    || ""
    const company           = job?.company  || ""
    const location          = job?.location || undefined
    const jobRequiredSkills = job?.skills   || []
    const jobDescription    = job?.description || ""

    // Detect HR name from post text
    const postText = scrapedPost.text || ""
    let hrName = "Hiring Manager"
    const nameMatch = postText.match(/Hi\s+([A-Z][a-z]+)\b/) || postText.match(/Dear\s+([A-Z][a-z]+)\b/)
    if (nameMatch?.[1]) hrName = nameMatch[1]

    // ── Generate cover letter via AI service ──────────────────────────────────
    const coverLetter = await generateCoverLetter(
      userSkills,
      jobTitle,
      company,
      jobDescription,
      {
        userFirstName,
        userLastName,
        experienceLevel,
        jobType,
        toneId,
        location,
        jobRequiredSkills,
        hrName,
      }
    )

    return NextResponse.json({ success: true, coverLetter, hrName, scrapedPostId })
  } catch (error) {
    console.error("Scraping apply API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
