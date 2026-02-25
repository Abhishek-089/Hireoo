import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { StripeService } from "@/lib/stripe"

/**
 * Subscription middleware for protecting premium features
 * This can be used in API routes or middleware.ts
 */
export class SubscriptionMiddleware {
  /**
   * Check if user has access to a feature based on their subscription
   */
  static async checkFeatureAccess(
    userId: string,
    feature: 'job_matching' | 'email_generation' | 'advanced_analytics' | 'priority_support'
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    try {
      const subscription = await StripeService.getSubscription(userId)

      // Free plan limitations
      if (subscription.plan_name === 'free') {
        // Check usage limits for free plan
        const usageLimits = await StripeService.checkUsageLimits(userId)

        switch (feature) {
          case 'job_matching':
            return {
              hasAccess: usageLimits.canUse,
              reason: usageLimits.canUse
                ? undefined
                : `Monthly job match limit reached (${usageLimits.limits.currentJobMatches}/${usageLimits.limits.monthlyJobMatches})`
            }

          case 'email_generation':
            return {
              hasAccess: false,
              reason: 'AI email generation is only available on Pro plans'
            }

          case 'advanced_analytics':
            return {
              hasAccess: false,
              reason: 'Advanced analytics is only available on Pro plans'
            }

          case 'priority_support':
            return {
              hasAccess: false,
              reason: 'Priority support is only available on Pro plans'
            }

          default:
            return { hasAccess: true }
        }
      }

      // Paid plans have full access
      if (subscription.status === 'active' &&
        ['pro_monthly', 'pro_yearly'].includes(subscription.plan_name)) {
        return { hasAccess: true }
      }

      // Subscription is not active
      return {
        hasAccess: false,
        reason: `Your subscription is ${subscription.status}. Please update your payment method.`
      }

    } catch (error) {
      console.error('Error checking feature access:', error)
      // On error, allow access to prevent blocking users unnecessarily
      return { hasAccess: true }
    }
  }

  /**
   * Middleware function for API routes
   * Use this in API routes that require subscription
   */
  static async withSubscriptionCheck(
    request: NextRequest,
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
    requiredFeature?: 'job_matching' | 'email_generation' | 'advanced_analytics' | 'priority_support'
  ): Promise<NextResponse> {
    try {
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      // If no specific feature required, just check for active subscription
      if (!requiredFeature) {
        const hasActiveSubscription = await StripeService.hasActiveSubscription(session.user.id)
        if (!hasActiveSubscription) {
          return NextResponse.json(
            {
              error: "Subscription required",
              message: "This feature requires an active Pro subscription",
              upgradeUrl: "/dashboard/billing"
            },
            { status: 403 }
          )
        }
        return handler(request)
      }

      // Check specific feature access
      const accessCheck = await this.checkFeatureAccess(session.user.id, requiredFeature)

      if (!accessCheck.hasAccess) {
        return NextResponse.json(
          {
            error: "Feature not available",
            message: accessCheck.reason || "This feature is not available on your current plan",
            upgradeUrl: "/dashboard/billing"
          },
          { status: 403 }
        )
      }

      return handler(request)

    } catch (error) {
      console.error('Subscription middleware error:', error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }

  /**
   * Higher-order function for wrapping API handlers
   */
  static requireSubscription(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
    requiredFeature?: 'job_matching' | 'email_generation' | 'advanced_analytics' | 'priority_support'
  ) {
    return async (request: NextRequest, context?: any): Promise<NextResponse> => {
      return this.withSubscriptionCheck(request, handler, requiredFeature)
    }
  }

  /**
   * Get user's plan information for UI display
   */
  static async getUserPlanInfo(userId: string): Promise<{
    planName: string
    displayName: string
    status: string
    limits: {
      monthlyJobMatches: number
      monthlyEmails: number
      aiEmailGeneration: boolean
      advancedAnalytics: boolean
      prioritySupport: boolean
    }
    usage?: {
      currentJobMatches: number
      currentEmails: number
    }
    upgradeRequired: boolean
  }> {
    try {
      const subscription = await StripeService.getSubscription(userId)
      const usageLimits = await StripeService.checkUsageLimits(userId)

      let planInfo: any

      switch (subscription.plan_name) {
        case 'free':
          planInfo = {
            planName: 'free',
            displayName: 'Free',
            status: subscription.status,
            limits: {
              monthlyJobMatches: 10,
              monthlyEmails: 5,
              aiEmailGeneration: false,
              advancedAnalytics: false,
              prioritySupport: false,
              dailyJobLimit: 10, // Free tier: 10 matched jobs/day
            },
            usage: {
              currentJobMatches: usageLimits.limits.currentJobMatches,
              currentEmails: usageLimits.limits.currentEmails,
            },
            upgradeRequired: !usageLimits.canUse,
          }
          break

        case 'pro_monthly':
          planInfo = {
            planName: 'pro_monthly',
            displayName: 'Pro Monthly',
            status: subscription.status,
            limits: {
              monthlyJobMatches: -1, // unlimited
              monthlyEmails: 100,
              aiEmailGeneration: true,
              advancedAnalytics: true,
              prioritySupport: true,
              dailyJobLimit: 25, // Premium Basic: 25 matched jobs/day
            },
            upgradeRequired: false,
          }
          break

        case 'pro_yearly':
          planInfo = {
            planName: 'pro_yearly',
            displayName: 'Pro Yearly',
            status: subscription.status,
            limits: {
              monthlyJobMatches: -1, // unlimited
              monthlyEmails: 100,
              aiEmailGeneration: true,
              advancedAnalytics: true,
              prioritySupport: true,
              dailyJobLimit: 50, // Premium Pro: 50 matched jobs/day
            },
            upgradeRequired: false,
          }
          break

        default:
          planInfo = {
            planName: 'free',
            displayName: 'Free',
            status: 'active',
            limits: {
              monthlyJobMatches: 10,
              monthlyEmails: 5,
              aiEmailGeneration: false,
              advancedAnalytics: false,
              prioritySupport: false,
              dailyJobLimit: 10, // Free tier: 10 matched jobs/day
            },
            upgradeRequired: false,
          }
      }

      return planInfo

    } catch (error) {
      console.error('Error getting user plan info:', error)
      // Return free plan info on error
      return {
        planName: 'free',
        displayName: 'Free',
        status: 'active',
        limits: {
          monthlyJobMatches: 10,
          monthlyEmails: 5,
          aiEmailGeneration: false,
          advancedAnalytics: false,
          prioritySupport: false,
        },
        upgradeRequired: false,
      }
    }
  }
}


