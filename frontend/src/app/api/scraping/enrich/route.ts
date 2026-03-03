import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { enrichUnenrichedPosts } from "@/lib/ai-enrichment"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const limit = Math.min(body.limit || 50, 100)

    const result = await enrichUnenrichedPosts(limit)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("[Enrich API] Error:", error)
    return NextResponse.json(
      { error: error.message || "Enrichment failed" },
      { status: 500 }
    )
  }
}
