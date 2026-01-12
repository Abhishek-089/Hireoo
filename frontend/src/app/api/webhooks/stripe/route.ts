import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/server"
import { StripeService } from "@/lib/stripe"
import { stripe } from "@/lib/stripe"

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = headers().get('stripe-signature')

    if (!sig) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      )
    }

    let event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    console.log(`Received Stripe webhook: ${event.type}`)

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// Handle successful checkout completion
async function handleCheckoutCompleted(session: any) {
  try {
    const userId = session.metadata?.userId
    if (!userId) {
      console.error('No userId in checkout session metadata')
      return
    }

    console.log(`Checkout completed for user: ${userId}`)

    // The subscription will be created via the customer.subscription.created event
    // This handler mainly confirms the checkout was successful

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

// Handle subscription creation/updates
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer
    const subscriptionId = subscription.id
    const status = subscription.status
    const currentPeriodStart = subscription.current_period_start
    const currentPeriodEnd = subscription.current_period_end
    const cancelAtPeriodEnd = subscription.cancel_at_period_end

    // Get price ID from the subscription
    const priceId = subscription.items.data[0]?.price?.id

    console.log(`Subscription updated: ${subscriptionId}, status: ${status}`)

    // Update subscription in database
    await StripeService.updateSubscriptionFromWebhook(
      subscriptionId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      priceId,
      cancelAtPeriodEnd
    )

  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const subscriptionId = subscription.id

    console.log(`Subscription deleted: ${subscriptionId}`)

    // Update subscription to cancelled status
    await StripeService.updateSubscriptionFromWebhook(
      subscriptionId,
      'canceled',
      subscription.current_period_start,
      subscription.current_period_end,
      subscription.items.data[0]?.price?.id,
      false
    )

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: any) {
  try {
    const subscriptionId = invoice.subscription
    const customerId = invoice.customer

    console.log(`Payment succeeded for subscription: ${subscriptionId}`)

    // Payment success is already handled by subscription update events
    // This is mainly for additional logging/analytics

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice: any) {
  try {
    const subscriptionId = invoice.subscription
    const customerId = invoice.customer

    console.log(`Payment failed for subscription: ${subscriptionId}`)

    // Update subscription status to past_due
    // This will be handled by the subscription update webhook

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}


