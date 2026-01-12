import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { StripeService } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get subscription details
    const subscription = await StripeService.getSubscription(session.user.id)

    // Get usage limits and current usage
    const usageLimits = await StripeService.checkUsageLimits(session.user.id)

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planName: subscription.plan_name,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      usage: usageLimits,
    })

  } catch (error) {
    console.error("Subscription status error:", error)
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    )
  }
}


