'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, CreditCard, Zap, Crown, ExternalLink } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/constants/billing'

interface SubscriptionData {
  subscription: {
    id: string
    planName: string
    status: string
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
  }
  usage: {
    canUse: boolean
    limits: {
      monthlyJobMatches: number
      monthlyEmails: number
      currentJobMatches: number
      currentEmails: number
    }
  }
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/billing/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planName: string) => {
    setCheckoutLoading(planName)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName })
      })

      if (response.ok) {
        const { checkoutUrl } = await response.json()
        window.location.href = checkoutUrl
      } else {
        console.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      })

      if (response.ok) {
        const { portalUrl } = await response.json()
        window.location.href = portalUrl
      } else {
        console.error('Failed to create portal session')
      }
    } catch (error) {
      console.error('Error creating portal:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = subscriptionData?.subscription.planName || 'free'
  const isPaidPlan = ['pro_monthly', 'pro_yearly'].includes(currentPlan)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">
                {SUBSCRIPTION_PLANS[currentPlan.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS]?.displayName || 'Free'}
              </h3>
              <Badge variant={subscriptionData?.subscription.status === 'active' ? 'default' : 'secondary'}>
                {subscriptionData?.subscription.status}
              </Badge>
            </div>
            {isPaidPlan && (
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {portalLoading ? 'Loading...' : 'Manage Subscription'}
              </Button>
            )}
          </div>

          {/* Usage Limits for Free Plan */}
          {currentPlan === 'free' && subscriptionData?.usage && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Job Matches</span>
                  <span>{subscriptionData.usage.limits.currentJobMatches}/{subscriptionData.usage.limits.monthlyJobMatches}</span>
                </div>
                <Progress
                  value={(subscriptionData.usage.limits.currentJobMatches / subscriptionData.usage.limits.monthlyJobMatches) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Emails</span>
                  <span>{subscriptionData.usage.limits.currentEmails}/{subscriptionData.usage.limits.monthlyEmails}</span>
                </div>
                <Progress
                  value={(subscriptionData.usage.limits.currentEmails / subscriptionData.usage.limits.monthlyEmails) * 100}
                  className="h-2"
                />
              </div>
              {!subscriptionData.usage.canUse && (
                <p className="text-sm text-red-600">
                  You've reached your monthly limits. Upgrade to Pro for unlimited access!
                </p>
              )}
            </div>
          )}

          {/* Subscription Period */}
          {subscriptionData?.subscription.currentPeriodEnd && (
            <p className="text-sm text-gray-600 mt-4">
              {subscriptionData.subscription.cancelAtPeriodEnd
                ? `Expires on ${new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString()}`
                : `Renews on ${new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString()}`
              }
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className={currentPlan === 'free' ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Free
            </CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">$0<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">10 job matches per month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">5 emails per month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic job matching</span>
              </li>
            </ul>
            {currentPlan === 'free' && (
              <Badge variant="secondary">Current Plan</Badge>
            )}
          </CardContent>
        </Card>

        {/* Pro Monthly */}
        <Card className={currentPlan === 'pro_monthly' ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Pro Monthly
            </CardTitle>
            <CardDescription>Full access to all features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">$29<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Unlimited job matches</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">100 emails per month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">AI email generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            {currentPlan === 'pro_monthly' ? (
              <Badge variant="secondary">Current Plan</Badge>
            ) : (
              <Button
                onClick={() => handleUpgrade('pro_monthly')}
                disabled={checkoutLoading === 'pro_monthly'}
                className="w-full"
              >
                {checkoutLoading === 'pro_monthly' ? 'Loading...' : 'Upgrade to Pro'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Yearly */}
        <Card className={currentPlan === 'pro_yearly' ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Pro Yearly
              <Badge variant="outline" className="ml-auto">Save 17%</Badge>
            </CardTitle>
            <CardDescription>Best value for serious job seekers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">$290<span className="text-lg font-normal">/year</span></div>
            <div className="text-sm text-gray-600 mb-4">~$24/month</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">All Pro Monthly features</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">17% savings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Priority feature requests</span>
              </li>
            </ul>
            {currentPlan === 'pro_yearly' ? (
              <Badge variant="secondary">Current Plan</Badge>
            ) : (
              <Button
                onClick={() => handleUpgrade('pro_yearly')}
                disabled={checkoutLoading === 'pro_yearly'}
                className="w-full"
              >
                {checkoutLoading === 'pro_yearly' ? 'Loading...' : 'Upgrade to Pro Yearly'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What happens to my data if I cancel?</h4>
            <p className="text-sm text-gray-600">Your data remains safe. You can reactivate your subscription anytime to regain full access.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
            <p className="text-sm text-gray-600">We offer a 30-day money-back guarantee for all new subscriptions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


