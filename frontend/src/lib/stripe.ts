import Stripe from 'stripe'
import { prisma } from './prisma'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

import { SUBSCRIPTION_PLANS, PlanName, PlanConfig } from './constants/billing'

// Stripe service class
export class StripeService {
  /**
   * Create or retrieve Stripe customer
   */
  static async createOrRetrieveCustomer(userId: string, email: string, name?: string) {
    try {
      // Check if user already has a subscription with Stripe customer ID
      const existingSubscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
      })

      if (existingSubscription?.stripe_customer_id) {
        // Retrieve existing customer
        const customer = await stripe.customers.retrieve(existingSubscription.stripe_customer_id)
        return customer
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name: name || email,
        metadata: {
          userId,
        },
      })

      // Update subscription record with customer ID
      await prisma.subscription.upsert({
        where: { user_id: userId },
        update: {
          stripe_customer_id: customer.id,
        },
        create: {
          user_id: userId,
          stripe_customer_id: customer.id,
          plan_name: 'free',
        },
      })

      return customer
    } catch (error) {
      console.error('Error creating/retrieving Stripe customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Create or retrieve customer
      const customer = await this.createOrRetrieveCustomer(userId, user.email!, user.name || undefined)

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
        allow_promotion_codes: true,
      })

      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  /**
   * Create customer portal session
   */
  static async createPortalSession(userId: string, returnUrl: string) {
    try {
      // Get user's subscription
      const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
      })

      if (!subscription?.stripe_customer_id) {
        throw new Error('No subscription found for user')
      }

      // Create portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: returnUrl,
      })

      return session
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw new Error('Failed to create portal session')
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      })

      if (!subscription) {
        // Create free subscription if none exists
        const freeSubscription = await prisma.subscription.create({
          data: {
            user_id: userId,
            plan_name: 'free',
          },
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        })
        return freeSubscription
      }

      return subscription
    } catch (error) {
      console.error('Error getting subscription:', error)
      throw new Error('Failed to get subscription')
    }
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
      })

      return subscription?.status === 'active' && subscription.plan_name !== 'free'
    } catch (error) {
      console.error('Error checking subscription status:', error)
      return false
    }
  }

  /**
   * Check usage limits for free plan
   */
  static async checkUsageLimits(userId: string): Promise<{
    canUse: boolean
    limits: {
      monthlyJobMatches: number
      monthlyEmails: number
      currentJobMatches: number
      currentEmails: number
    }
  }> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
      })

      // If user has active paid subscription, no limits
      if (subscription?.status === 'active' && subscription.plan_name !== 'free') {
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

      // Check free plan limits
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Count job matches this month
      const jobMatchesThisMonth = await prisma.jobMatch.count({
        where: {
          user_id: userId,
          matched_at: {
            gte: startOfMonth,
          },
        },
      })

      // Count emails sent this month
      const emailsThisMonth = await prisma.emailLog.count({
        where: {
          user_id: userId,
          direction: 'sent',
          sent_at: {
            gte: startOfMonth,
          },
        },
      })

      const freeLimits = SUBSCRIPTION_PLANS.FREE.features

      return {
        canUse: jobMatchesThisMonth < freeLimits.monthlyJobMatches &&
          emailsThisMonth < freeLimits.monthlyEmails,
        limits: {
          monthlyJobMatches: freeLimits.monthlyJobMatches,
          monthlyEmails: freeLimits.monthlyEmails,
          currentJobMatches: jobMatchesThisMonth,
          currentEmails: emailsThisMonth,
        },
      }
    } catch (error) {
      console.error('Error checking usage limits:', error)
      return {
        canUse: false,
        limits: {
          monthlyJobMatches: 0,
          monthlyEmails: 0,
          currentJobMatches: 0,
          currentEmails: 0,
        },
      }
    }
  }

  /**
   * Update subscription from Stripe webhook
   */
  static async updateSubscriptionFromWebhook(
    stripeSubscriptionId: string,
    status: string,
    currentPeriodStart: number,
    currentPeriodEnd: number,
    priceId: string,
    cancelAtPeriodEnd: boolean = false
  ) {
    try {
      // Find subscription by Stripe ID
      const subscription = await prisma.subscription.findUnique({
        where: { stripe_subscription_id: stripeSubscriptionId },
      })

      if (!subscription) {
        console.error(`Subscription not found: ${stripeSubscriptionId}`)
        return
      }

      // Determine plan name from price ID
      let planName = 'free'
      if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) {
        planName = 'pro_monthly'
      } else if (priceId === process.env.STRIPE_PRICE_PRO_YEARLY) {
        planName = 'pro_yearly'
      }

      // Update subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status,
          current_period_start: new Date(currentPeriodStart * 1000),
          current_period_end: new Date(currentPeriodEnd * 1000),
          stripe_price_id: priceId,
          plan_name: planName,
          cancel_at_period_end: cancelAtPeriodEnd,
          updated_at: new Date(),
        },
      })

      console.log(`Updated subscription ${subscription.id} to status: ${status}`)
    } catch (error) {
      console.error('Error updating subscription from webhook:', error)
      throw error
    }
  }
}

// Export Stripe instance for direct use
export { stripe }


