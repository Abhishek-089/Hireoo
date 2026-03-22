import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { RazorpayService } from "@/lib/razorpay"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planName } = await request.json()

    if (!planName || !['premium', 'pro'].includes(planName)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'premium' or 'pro'" },
        { status: 400 }
      )
    }

    const subscription = await RazorpayService.createSubscription(
      session.user.id,
      planName as 'premium' | 'pro'
    )

    return NextResponse.json({
      subscriptionId: subscription.id,
      // short_url can be used as a fallback hosted payment page
      shortUrl: subscription.short_url ?? null,
    })
  } catch (error) {
    console.error("Razorpay checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}
