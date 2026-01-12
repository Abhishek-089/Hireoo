import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GmailService } from "@/lib/gmail"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Generate OAuth URL with user ID as state for callback
    const authUrl = GmailService.getAuthUrl(session.user.id)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Gmail connect error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Gmail connection" },
      { status: 500 }
    )
  }
}
