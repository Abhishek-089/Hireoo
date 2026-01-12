import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { StripeService } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Create customer portal session
    const portalSession = await StripeService.createPortalSession(
      session.user.id,
      `${process.env.NEXTAUTH_URL}/dashboard/billing`
    )

    return NextResponse.json({
      portalUrl: portalSession.url,
    })

  } catch (error) {
    console.error("Customer portal creation error:", error)
    return NextResponse.json(
      { error: "Failed to create customer portal session" },
      { status: 500 }
    )
  }
}


