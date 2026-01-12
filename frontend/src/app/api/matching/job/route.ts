import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { matchJobToUsers, getJobMatchingStats } from "@/lib/matching-utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      )
    }

    // Trigger job matching
    const result = await matchJobToUsers(jobId)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Job matching API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId query parameter is required" },
        { status: 400 }
      )
    }

    // Get matching statistics for the job
    const stats = await getJobMatchingStats(jobId)

    if (!stats) {
      return NextResponse.json(
        { error: "No matching data found for this job" },
        { status: 404 }
      )
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error("Get job matching stats API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


