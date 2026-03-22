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

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      planName,
    } = await request.json()

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      )
    }

    // Verify HMAC signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    )

    if (!isValid) {
      console.error(`Invalid Razorpay signature for user ${session.user.id}`)
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    // Activate the subscription in the DB
    await RazorpayService.activateSubscription(
      session.user.id,
      razorpay_subscription_id,
      razorpay_payment_id,
      planName ?? 'premium'
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
