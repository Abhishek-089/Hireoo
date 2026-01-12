import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { StripeService } from "@/lib/stripe"
import { SUBSCRIPTION_PLANS } from "@/lib/constants/billing"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { planName } = await request.json()

    if (!planName || !['pro_monthly', 'pro_yearly'].includes(planName)) {
      return NextResponse.json(
        { error: "Invalid plan name. Must be 'pro_monthly' or 'pro_yearly'" },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planName.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]

    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: "Plan not configured properly" },
        { status: 500 }
      )
    }

    // Create checkout session
    const checkoutSession = await StripeService.createCheckoutSession(
      session.user.id,
      plan.stripePriceId,
      `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
      `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`
    )

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })

  } catch (error) {
    console.error("Checkout session creation error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}


