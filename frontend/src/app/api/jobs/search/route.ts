import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { hybridJobSearch } from "@/lib/semantic-search"

/**
 * GET /api/jobs/search?q=keyword&limit=20&offset=0&location=...&job_type=...&experience_level=...
 *
 * Hybrid semantic job search:
 *  1. Expands the query using a skill taxonomy (e.g. "frontend developer" → React, Vue, HTML …)
 *  2. Generates an OpenAI embedding for the query and uses pgvector cosine-similarity to
 *     find semantically related jobs (even when exact keywords don't match).
 *  3. Supplements with keyword-expanded SQL search for jobs that have no embeddings yet.
 *  4. Falls back gracefully to expanded keyword search if the vector search is unavailable.
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
    const location = searchParams.get("location")?.trim() || undefined
    const jobType = searchParams.get("job_type")?.trim() || undefined
    const experienceLevel = searchParams.get("experience_level")?.trim() || undefined

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const result = await hybridJobSearch({
      query,
      limit,
      offset,
      location,
      jobType,
      experienceLevel,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Job search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
