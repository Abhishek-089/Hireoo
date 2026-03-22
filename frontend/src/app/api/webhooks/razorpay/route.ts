import { NextRequest, NextResponse } from "next/server"
import { RazorpayService } from "@/lib/razorpay"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const isValid = RazorpayService.verifyWebhookSignature(rawBody, signature)
    if (!isValid) {
      console.error("Invalid Razorpay webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    console.log(`Razorpay webhook: ${event.event}`)

    switch (event.event) {
      // ── First payment + mandate authorised ──
      case 'subscription.activated':
        await RazorpayService.handleSubscriptionActivated(event.payload)
        break

      // ── Monthly autopay succeeded ──
      case 'subscription.charged':
        await RazorpayService.handleSubscriptionCharged(event.payload)
        break

      // ── Charge is about to be attempted ──
      case 'subscription.pending':
        await RazorpayService.handleSubscriptionPending(event.payload)
        break

      // ── All retry attempts exhausted ──
      case 'subscription.halted':
        await RazorpayService.handleSubscriptionHalted(event.payload)
        break

      // ── User resumed after a halted subscription ──
      case 'subscription.resumed':
        await RazorpayService.handleSubscriptionResumed(event.payload)
        break

      // ── User cancelled or all cycles done ──
      case 'subscription.cancelled':
      case 'subscription.completed':
        await RazorpayService.handleSubscriptionCancelled(event.payload)
        break

      // ── Individual payment attempt failed (Razorpay retries automatically) ──
      case 'payment.failed':
        await RazorpayService.handlePaymentFailed(event.payload)
        break

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
