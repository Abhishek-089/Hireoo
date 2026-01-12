import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { EmailGeneratorService } from "@/lib/email-generator"

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
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'draft', 'sent', 'edited', 'rejected', or null for all

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      )
    }

    // Get user's email drafts
    const drafts = await EmailGeneratorService.getUserEmailDrafts(session.user.id, limit)

    // Filter by status if specified
    let filteredDrafts = drafts
    if (status && ['draft', 'sent', 'edited', 'rejected'].includes(status)) {
      filteredDrafts = drafts.filter(draft => draft.status === status)
    }

    return NextResponse.json({
      drafts: filteredDrafts,
      total: drafts.length,
      filtered: filteredDrafts.length,
      status: status || 'all',
    })

  } catch (error) {
    console.error("Get email drafts API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Update draft status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { draftId, status, used } = await request.json()

    if (!draftId) {
      return NextResponse.json(
        { error: "draftId is required" },
        { status: 400 }
      )
    }

    // Validate status
    if (status && !['draft', 'sent', 'edited', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: draft, sent, edited, or rejected" },
        { status: 400 }
      )
    }

    // Verify the draft belongs to the user
    const draft = await EmailGeneratorService.getEmailDraft(draftId)
    if (!draft || draft.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Draft not found or doesn't belong to user" },
        { status: 404 }
      )
    }

    // Update draft status
    await EmailGeneratorService.updateDraftStatus(
      draftId,
      status || draft.status,
      used !== undefined ? used : draft.used
    )

    return NextResponse.json({
      success: true,
      message: "Draft updated successfully",
    })

  } catch (error) {
    console.error("Update email draft API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


