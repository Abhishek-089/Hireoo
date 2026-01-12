import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GmailService } from "@/lib/gmail"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await GmailService.revokeConnection(session.user.id)

    return NextResponse.json({
      success: true,
      message: "Gmail connection revoked successfully"
    })
  } catch (error) {
    console.error("Gmail revoke error:", error)
    return NextResponse.json(
      { error: "Failed to revoke Gmail connection" },
      { status: 500 }
    )
  }
}