import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { RazorpayService } from "@/lib/razorpay"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [subscription, usageLimits] = await Promise.all([
      RazorpayService.getSubscription(session.user.id),
      RazorpayService.checkUsageLimits(session.user.id),
    ])

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planName: subscription.plan_name,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        razorpaySubscriptionId: subscription.razorpay_subscription_id,
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
