import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Simple email detector (same idea as in the extension)
function extractEmails(text: string): string[] {
  const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  const matches = text.match(regex)
  return matches ? Array.from(new Set(matches)) : []
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // Fetch recent scraped posts for this user
    const posts = await prisma.scrapedPost.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: "desc" },
      take: limit,
    })

    // Derive emails from text and filter to posts that have at least one email
    const postsWithEmails = posts
      .map((post: any) => {
        const emails = extractEmails(post.text || "")
        return {
          id: post.id,
          text: post.text,
          postUrl: post.post_url,
          linkedinId: post.linkedin_id,
          timestamp: post.timestamp,
          createdAt: post.created_at,
          emails,
        }
      })
      .filter((post: any) => post.emails.length > 0)

    return NextResponse.json({
      posts: postsWithEmails,
    })
  } catch (error) {
    console.error("Get scraped posts with emails API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}










