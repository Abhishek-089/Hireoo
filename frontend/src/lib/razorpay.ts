import Razorpay from 'razorpay'
import crypto from 'crypto'
import { prisma } from './prisma'
import { SUBSCRIPTION_PLANS } from './constants/billing'

/** Lazy init so `next build` / route collection does not require Razorpay env on Vercel. */
let razorpayClient: InstanceType<typeof Razorpay> | null = null

function getRazorpay(): InstanceType<typeof Razorpay> {
  const key_id = process.env.RAZORPAY_KEY_ID?.trim()
  const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay is not configured: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET'
    )
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id, key_secret })
  }
  return razorpayClient
}

/** Convert a Unix timestamp (seconds) to a JS Date */
function fromUnix(ts: number): Date {
  return new Date(ts * 1000)
}

export class RazorpayService {
  /**
   * Create a Razorpay subscription for the given user and plan.
   * total_count = 120 billing cycles (~10 years) — effectively perpetual.
   * Razorpay auto-debits the user on the same date every month after
   * the first payment and mandate authorisation.
   */
  static async createSubscription(userId: string, planName: 'premium' | 'pro') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    if (!user) throw new Error('User not found')

    // Read plan IDs at runtime (not from cached module scope) so .env changes apply after restart
    const razorpayPlanId =
      planName === 'premium'
        ? process.env.RAZORPAY_PLAN_ID_PREMIUM?.trim()
        : process.env.RAZORPAY_PLAN_ID_PRO?.trim()

    if (!razorpayPlanId) {
      throw new Error(`Razorpay plan ID not configured for plan: ${planName}`)
    }

    const subscription = await getRazorpay().subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,  // Razorpay sends charge-reminder emails to the customer
      quantity: 1,
      total_count: 120,    // 120 months ≈ perpetual — renews on the same date every month
      notes: {
        userId,
        planName,
        userEmail: user.email ?? '',
      },
    })

    // Mark subscription as incomplete until first payment clears
    await prisma.subscription.upsert({
      where: { user_id: userId },
      update: {
        razorpay_subscription_id: subscription.id,
        plan_name: planName,
        status: 'incomplete',
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        razorpay_subscription_id: subscription.id,
        plan_name: planName,
        status: 'incomplete',
      },
    })

    return subscription
  }

  /**
   * Verify the HMAC signature returned by Razorpay after a successful payment.
   */
  static verifyPaymentSignature(
    razorpayPaymentId: string,
    razorpaySubscriptionId: string,
    razorpaySignature: string
  ): boolean {
    const body = `${razorpayPaymentId}|${razorpaySubscriptionId}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')
    return expectedSignature === razorpaySignature
  }

  /**
   * Activate a subscription in the DB after successful first-payment verification.
   * Uses Razorpay's charge_at timestamp (next billing date) for period_end so the
   * renewal date always matches the exact date the user first paid.
   */
  static async activateSubscription(
    userId: string,
    razorpaySubscriptionId: string,
    razorpayPaymentId: string,
    planName: string
  ) {
    const now = new Date()

    // Fetch the subscription from Razorpay to get the exact next charge date
    let periodEnd: Date
    try {
      const rzpSub = await getRazorpay().subscriptions.fetch(razorpaySubscriptionId)
      // charge_at is the Unix timestamp of the next scheduled debit
      periodEnd = rzpSub.charge_at
        ? fromUnix(rzpSub.charge_at as unknown as number)
        : (() => { const d = new Date(now); d.setMonth(d.getMonth() + 1); return d })()
    } catch {
      // Fallback: same calendar date next month
      periodEnd = new Date(now)
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    await prisma.subscription.upsert({
      where: { user_id: userId },
      update: {
        razorpay_subscription_id: razorpaySubscriptionId,
        razorpay_payment_id: razorpayPaymentId,
        plan_name: planName,
        status: 'active',
        current_period_start: now,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        razorpay_subscription_id: razorpaySubscriptionId,
        razorpay_payment_id: razorpayPaymentId,
        plan_name: planName,
        status: 'active',
        current_period_start: now,
        current_period_end: periodEnd,
      },
    })
  }

  /**
   * Get subscription status for a user (reads from DB).
   */
  static async getSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: userId },
    })

    if (!subscription) {
      return prisma.subscription.create({
        data: { user_id: userId, plan_name: 'free', status: 'active' },
      })
    }

    return subscription
  }

  /**
   * Cancel a Razorpay subscription at period end (user keeps access until billing date).
   */
  static async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: userId },
    })

    if (!subscription?.razorpay_subscription_id) {
      throw new Error('No active Razorpay subscription found')
    }

    // cancel_at_cycle_end = true → access continues until next billing date
    await getRazorpay().subscriptions.cancel(subscription.razorpay_subscription_id, true)

    await prisma.subscription.update({
      where: { user_id: userId },
      data: { cancel_at_period_end: true, updated_at: new Date() },
    })
  }

  /**
   * Check if a user has an active paid subscription.
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: userId },
    })
    return (
      subscription?.status === 'active' &&
      ['premium', 'pro'].includes(subscription.plan_name)
    )
  }

  /**
   * Check usage limits (plan-gated).
   */
  static async checkUsageLimits(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: userId },
    })

    if (
      subscription?.status === 'active' &&
      ['premium', 'pro'].includes(subscription.plan_name)
    ) {
      return {
        canUse: true,
        limits: {
          monthlyJobMatches: -1,
          monthlyEmails: -1,
          currentJobMatches: 0,
          currentEmails: 0,
        },
      }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [jobMatchesThisMonth, emailsThisMonth] = await Promise.all([
      prisma.jobMatch.count({
        where: { user_id: userId, matched_at: { gte: startOfMonth } },
      }),
      prisma.emailLog.count({
        where: { user_id: userId, direction: 'sent', sent_at: { gte: startOfMonth } },
      }),
    ])

    const freeLimits = SUBSCRIPTION_PLANS.FREE.features

    return {
      canUse:
        jobMatchesThisMonth < freeLimits.monthlyJobMatches &&
        emailsThisMonth < freeLimits.monthlyEmails,
      limits: {
        monthlyJobMatches: freeLimits.monthlyJobMatches,
        monthlyEmails: freeLimits.monthlyEmails,
        currentJobMatches: jobMatchesThisMonth,
        currentEmails: emailsThisMonth,
      },
    }
  }

  // ─────────────────────────── WEBHOOK HANDLERS ───────────────────────────

  /** Verify HMAC signature on incoming webhook requests */
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex')
    return expected === signature
  }

  /**
   * subscription.activated
   * Fired when the customer's first payment clears and the mandate is set up.
   * After this, Razorpay auto-debits every month on the same date.
   */
  static async handleSubscriptionActivated(payload: any) {
    const sub = payload.subscription?.entity
    if (!sub) return

    const userId = sub.notes?.userId
    if (!userId) return

    const planName = sub.notes?.planName ?? 'premium'

    // Use Razorpay's actual current_start / charge_at for accurate billing dates
    const periodStart = sub.current_start ? fromUnix(sub.current_start) : new Date()
    const periodEnd = sub.charge_at
      ? fromUnix(sub.charge_at)
      : (() => { const d = new Date(periodStart); d.setMonth(d.getMonth() + 1); return d })()

    await prisma.subscription.upsert({
      where: { razorpay_subscription_id: sub.id },
      update: {
        status: 'active',
        plan_name: planName,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        razorpay_subscription_id: sub.id,
        plan_name: planName,
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
      },
    })

    console.log(`Autopay activated for user ${userId} — next charge: ${periodEnd.toISOString()}`)
  }

  /**
   * subscription.charged
   * Fired every time Razorpay successfully auto-debits the customer.
   * Updates the billing window so the UI always shows the correct next charge date.
   */
  static async handleSubscriptionCharged(payload: any) {
    const sub = payload.subscription?.entity
    const payment = payload.payment?.entity
    if (!sub) return

    // Razorpay gives us the exact current billing period and next charge timestamp
    const periodStart = sub.current_start ? fromUnix(sub.current_start) : new Date()
    const periodEnd = sub.charge_at
      ? fromUnix(sub.charge_at)
      : (() => { const d = new Date(periodStart); d.setMonth(d.getMonth() + 1); return d })()

    await prisma.subscription.updateMany({
      where: { razorpay_subscription_id: sub.id },
      data: {
        status: 'active',
        razorpay_payment_id: payment?.id ?? undefined,
        current_period_start: periodStart,
        current_period_end: periodEnd,  // next autopay date
        cancel_at_period_end: false,
        updated_at: new Date(),
      },
    })

    console.log(`Autopay charged for sub ${sub.id} — next charge: ${periodEnd.toISOString()}`)
  }

  /**
   * subscription.pending
   * Fired when a scheduled charge is about to be attempted.
   * No status change needed — just log for visibility.
   */
  static async handleSubscriptionPending(payload: any) {
    const sub = payload.subscription?.entity
    if (!sub) return
    console.log(`Autopay charge pending for sub ${sub.id}`)
  }

  /**
   * subscription.halted
   * Fired when all retry attempts for an autopay charge have failed.
   * Marks the plan as past_due — user loses access until payment is retried.
   */
  static async handleSubscriptionHalted(payload: any) {
    const sub = payload.subscription?.entity
    if (!sub) return

    await prisma.subscription.updateMany({
      where: { razorpay_subscription_id: sub.id },
      data: { status: 'past_due', updated_at: new Date() },
    })

    console.warn(`Autopay halted for sub ${sub.id} — all retries failed`)
  }

  /**
   * subscription.resumed
   * Fired when a halted subscription is successfully resumed (manual retry paid).
   */
  static async handleSubscriptionResumed(payload: any) {
    const sub = payload.subscription?.entity
    if (!sub) return

    const periodStart = sub.current_start ? fromUnix(sub.current_start) : new Date()
    const periodEnd = sub.charge_at
      ? fromUnix(sub.charge_at)
      : (() => { const d = new Date(periodStart); d.setMonth(d.getMonth() + 1); return d })()

    await prisma.subscription.updateMany({
      where: { razorpay_subscription_id: sub.id },
      data: {
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        updated_at: new Date(),
      },
    })

    console.log(`Autopay resumed for sub ${sub.id} — next charge: ${periodEnd.toISOString()}`)
  }

  /**
   * subscription.cancelled / subscription.completed
   * Fired when the subscription ends (cancelled or all 120 cycles completed).
   * Downgrades the user to the free plan.
   */
  static async handleSubscriptionCancelled(payload: any) {
    const sub = payload.subscription?.entity
    if (!sub) return

    await prisma.subscription.updateMany({
      where: { razorpay_subscription_id: sub.id },
      data: {
        status: 'canceled',
        plan_name: 'free',
        cancel_at_period_end: false,
        updated_at: new Date(),
      },
    })

    console.log(`Subscription ${sub.id} cancelled — user downgraded to free`)
  }

  /**
   * payment.failed
   * Fired on individual payment attempt failure (Razorpay may retry automatically).
   */
  static async handlePaymentFailed(payload: any) {
    const sub = payload.subscription?.entity
    if (!sub) return
    // Razorpay will retry — only mark past_due if subscription.halted fires
    console.warn(`Payment failed for sub ${sub.id} — Razorpay will retry`)
  }
}
