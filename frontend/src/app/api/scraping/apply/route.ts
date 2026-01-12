import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Very simple cover letter generator for now.
// In the future this can call OpenAI using the user's resume text and post text.
function buildCoverLetter(opts: {
  hrName: string
  userFirstName: string
  userLastName: string
  userSummary?: string | null
  postText: string
}) {
  const { hrName, userFirstName, userLastName, userSummary, postText } = opts

  const safeHrName = hrName || "Hiring Manager"

  return `
Hello ${safeHrName},

I hope you're doing well. I'm writing to express my strong interest in opportunities that align with my background as a Full-Stack Developer.

${userSummary || "Over the last few years I've contributed to multiple production web applications across SaaS, AI-integrated products and e‑commerce systems, working end‑to‑end from frontend experience to backend APIs and data modeling."}

I came across your recent LinkedIn post:

"${postText.slice(0, 600)}${postText.length > 600 ? "..." : ""}"

Based on this, I believe my experience building and shipping real-world products, collaborating closely with teams, and maintaining high-quality, maintainable code would allow me to add value quickly.

I'm currently available for freelance or contract work and can start immediately. I'd be happy to share more project details or walk through my portfolio.

Looking forward to hearing from you.

Sincerely,
${userFirstName} ${userLastName}
`.trim()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scrapedPostId } = await request.json()

    if (!scrapedPostId || typeof scrapedPostId !== "string") {
      return NextResponse.json(
        { error: "scrapedPostId is required" },
        { status: 400 }
      )
    }

    // Load user, resume, and scraped post
    const [user, resume, scrapedPost] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          resume_uploaded: true,
        },
      }),
      prisma.resume.findFirst({
        where: { user_id: session.user.id },
        orderBy: { created_at: "desc" },
      }),
      prisma.scrapedPost.findUnique({
        where: { id: scrapedPostId },
      }),
    ])

    // Require that the user has actually uploaded a resume
    // Prefer the concrete Resume record but also honour the resume_uploaded flag
    if (!resume && !user?.resume_uploaded) {
      return NextResponse.json(
        { error: "Resume required", code: "RESUME_REQUIRED" },
        { status: 409 }
      )
    }

    if (!scrapedPost || scrapedPost.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Scraped post not found" },
        { status: 404 }
      )
    }

    const text = scrapedPost.text || ""

    // Try to detect an HR/email name from the text (very naive)
    let hrName = "Hiring Manager"
    const nameMatch = text.match(/Hi\s+([A-Z][a-z]+)\b/) || text.match(/Dear\s+([A-Z][a-z]+)\b/)
    if (nameMatch?.[1]) {
      hrName = nameMatch[1]
    }

    const [firstName, ...rest] = (user?.name || "").split(" ").filter(Boolean)
    const userFirstName = firstName || "Your"
    const userLastName = rest.join(" ")

    const coverLetter = buildCoverLetter({
      hrName,
      userFirstName,
      userLastName,
      userSummary: null,
      postText: text,
    })

    return NextResponse.json({
      success: true,
      coverLetter,
      hrName,
      scrapedPostId,
    })
  } catch (error) {
    console.error("Scraping apply API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


