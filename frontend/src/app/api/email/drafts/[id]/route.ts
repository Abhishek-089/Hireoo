import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { EmailGeneratorService } from "@/lib/email-generator"

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const draftId = params.id

    // Get the email draft
    const draft = await EmailGeneratorService.getEmailDraft(draftId)

    if (!draft) {
      return NextResponse.json(
        { error: "Email draft not found" },
        { status: 404 }
      )
    }

    // Verify the draft belongs to the user
    if (draft.user.id !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      draft,
    })

  } catch (error) {
    console.error("Get email draft API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


