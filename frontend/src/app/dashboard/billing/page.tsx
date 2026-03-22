'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  CreditCard, Zap, Crown, CheckCircle, ExternalLink,
  Loader2, AlertCircle, RefreshCw, Star, Shield, Clock, Gem,
  RefreshCcw, BanknoteIcon, BadgeCheck,
} from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/constants/billing'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface SubscriptionData {
  subscription: {
    id: string
    planName: string
    status: string
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    cancelAtPeriodEnd: boolean
    razorpaySubscriptionId: string | null
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

interface DailyLimitData {
  current: number
  limit: number
  percentageUsed: number
  canScrape: boolean
  hoursUntilReset: number
  tier: string
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number }) {
  const unlimited = max === -1
  const pct = unlimited ? 0 : Math.min(Math.round((current / max) * 100), 100)
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-indigo-500'
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
        <span className="font-medium text-gray-700">{label}</span>
        <span>{current} / {unlimited ? '∞' : max}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        {unlimited ? (
          <div className="h-full w-full rounded-full bg-emerald-400 opacity-40" />
        ) : (
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  )
}

const PLANS = [
  {
    key: 'free' as const,
    name: 'Free',
    tagline: 'Get started — no card needed.',
    price: '₹0',
    period: 'forever',
    sub: null,
    icon: Zap,
    iconColor: 'text-gray-500',
    accent: 'border-gray-200',
    highlight: false,
    badge: null,
    badgeStyle: '',
    features: [
      '10 matched jobs per day',
      'One-click apply via Gmail',
      'Recruiter contact lookup',
      'Basic profile matching',
      'Community support',
    ],
  },
  {
    key: 'premium' as const,
    name: 'Premium',
    tagline: 'For active job seekers.',
    price: '₹149',
    period: '/mo',
    sub: null,
    icon: Crown,
    iconColor: 'text-white',
    accent: 'border-indigo-500',
    highlight: true,
    badge: 'Most popular',
    badgeStyle: 'bg-white text-indigo-600',
    features: [
      '25 matched jobs per day',
      'Advanced AI matching',
      'Custom email templates',
      'Bulk auto-apply (10 at once)',
      'Reply & thread tracking',
      'Priority support',
      'Resume tips',
    ],
  },
  {
    key: 'pro' as const,
    name: 'Pro',
    tagline: 'For power users going all-in.',
    price: '₹249',
    period: '/mo',
    sub: null,
    icon: Gem,
    iconColor: 'text-gray-700',
    accent: 'border-gray-200',
    highlight: false,
    badge: null,
    badgeStyle: '',
    features: [
      '50 matched jobs per day',
      'Everything in Premium',
      'Unlimited bulk apply',
      'Advanced analytics',
      'API access',
      'Dedicated support',
    ],
  },
]

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data remains safe. Reactivate anytime to regain full access.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 30-day money-back guarantee for all new subscriptions.",
  },
  {
    q: "What's the difference between Premium and Pro?",
    a: "Premium is great for active job seekers with 25 matches/day and bulk apply. Pro gives you 50 matches/day, unlimited bulk apply, advanced analytics, and dedicated support.",
  },
]

export default function BillingPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [dailyLimit, setDailyLimit] = useState<DailyLimitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [subRes, limitRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/scraping/daily-limit'),
      ])
      if (subRes.ok) setData(await subRes.json())
      if (limitRes.ok) {
        const limitJson = await limitRes.json()
        setDailyLimit(limitJson.data)
      }
    } catch { /* silently fail */ } finally {
      setLoading(false)
    }
  }

  const loadRazorpayScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Razorpay'))
      document.body.appendChild(script)
    })
  }, [])

  const handleUpgrade = async (planKey: string) => {
    setCheckoutLoading(planKey)
    try {
      // Step 1: Create Razorpay subscription on the server
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: planKey }),
      })

      if (!res.ok) {
        console.error('Failed to create subscription')
        setCheckoutLoading(null)
        return
      }

      const { subscriptionId } = await res.json()

      // Step 2: Load Razorpay checkout script
      await loadRazorpayScript()

      // Step 3: Open Razorpay modal
      const planLabel = planKey === 'premium' ? 'Premium — ₹149/mo' : 'Pro — ₹249/mo'

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionId,
        name: 'Hireoo',
        description: planLabel,
        image: '/logo.png',
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_subscription_id: string
          razorpay_signature: string
        }) => {
          // Step 4: Verify payment on the server
          const verifyRes = await fetch('/api/billing/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              planName: planKey,
            }),
          })

          if (verifyRes.ok) {
            await fetchData()
          }
          setCheckoutLoading(null)
        },
        prefill: {
          email: session?.user?.email ?? '',
          name: session?.user?.name ?? '',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => setCheckoutLoading(null),
        },
      })

      rzp.open()
    } catch (err) {
      console.error('Razorpay checkout error:', err)
      setCheckoutLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel? You will keep access until the end of the current billing period.')) return
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' })
      if (res.ok) await fetchData()
    } catch { /* silently fail */ }
  }

  const currentPlan = data?.subscription.planName || 'free'
  const isPaid = ['premium', 'pro'].includes(currentPlan)
  const isAutopayActive =
    isPaid &&
    data?.subscription.status === 'active' &&
    !!data?.subscription.razorpaySubscriptionId &&
    !data?.subscription.cancelAtPeriodEnd

  const nextChargeDate = data?.subscription.currentPeriodEnd
    ? new Date(data.subscription.currentPeriodEnd)
    : null
  const nextChargeDateLabel = nextChargeDate
    ? nextChargeDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const nextChargeAmount = PLANS.find(p => p.key === currentPlan)?.price ?? null

  const planDisplayName = PLANS.find(p => p.key === currentPlan)?.name ?? currentPlan
  const portalLoading = false

  if (loading) {
    return (
      <div className="space-y-6 animate-page-enter">
        <div className="space-y-2">
          <div className="skeleton h-8 w-56 rounded-xl" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="skeleton h-36 w-full rounded-2xl" />
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map(i => <div key={i} className="skeleton h-96 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-page-enter max-w-5xl">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your plan and usage</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Current Plan</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-gray-900">{planDisplayName}</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                data?.subscription.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : data?.subscription.status === 'past_due'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {data?.subscription.status ?? 'active'}
              </span>
              {isAutopayActive && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <RefreshCcw className="h-3 w-3" />
                  Autopay ON
                </span>
              )}
            </div>

            {nextChargeDateLabel && isPaid && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                <Clock className="h-3.5 w-3.5" />
                {data?.subscription.cancelAtPeriodEnd
                  ? `Access until ${nextChargeDateLabel}`
                  : `Next autopay on ${nextChargeDateLabel}`}
              </p>
            )}

            {data?.subscription.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Autopay cancelled — you keep access until the end of this billing period.
              </div>
            )}

            {data?.subscription.status === 'past_due' && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Autopay failed — please update your payment method to restore access.
              </div>
            )}
          </div>

          {isPaid && !data?.subscription.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              Cancel Autopay
            </button>
          )}
        </div>

        {/* Autopay info strip */}
        {isAutopayActive && nextChargeDateLabel && nextChargeAmount && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <BanknoteIcon className="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-700">
                  ₹{nextChargeAmount} will be auto-debited on {nextChargeDateLabel}
                </p>
                <p className="text-[11px] text-indigo-400 mt-0.5">
                  Renews every month on the same date · Cancel anytime before the charge date
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Mandate active</span>
            </div>
          </div>
        )}

        {/* Daily job matches usage */}
        {dailyLimit && (
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Job Matches Today</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Resets in {dailyLimit.hoursUntilReset}h · {dailyLimit.tier} plan
                </p>
              </div>
              <span className={`text-sm font-bold tabular-nums ${
                dailyLimit.percentageUsed >= 90 ? 'text-red-600' :
                dailyLimit.percentageUsed >= 70 ? 'text-amber-600' : 'text-indigo-600'
              }`}>
                {dailyLimit.current} / {dailyLimit.limit}
              </span>
            </div>
            <UsageBar
              label=""
              current={dailyLimit.current}
              max={dailyLimit.limit}
            />
            {!dailyLimit.canScrape && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Daily limit reached. Resets in {dailyLimit.hoursUntilReset}h — or upgrade for more matches.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.key
            const canUpgrade = !isActive && plan.key !== 'free'
            // downgrade: active is pro and this is premium, or active is premium/pro and this is free
            const isDowngrade = !isActive && plan.key === 'free' && isPaid

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border-2 flex flex-col overflow-hidden transition-all ${
                  plan.highlight
                    ? 'border-indigo-500 shadow-xl shadow-indigo-100'
                    : isActive
                    ? 'border-indigo-300 ring-1 ring-indigo-200'
                    : 'border-gray-200'
                }`}
              >
                {/* Highlighted card gets indigo header */}
                <div className={`px-6 pt-6 pb-5 ${plan.highlight ? 'bg-indigo-600' : 'bg-white'}`}>
                  {plan.badge && (
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 ${plan.badgeStyle}`}>
                      {plan.badge}
                    </span>
                  )}

                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {plan.name}
                  </p>

                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm mb-1.5 ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <p className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.tagline}
                  </p>
                </div>

                {/* Features */}
                <div className="px-6 py-5 flex-1 bg-white">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 bg-white">
                  {isActive ? (
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold">
                      <Shield className="h-4 w-4" />
                      Current Plan
                    </div>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={!!checkoutLoading}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                        plan.highlight
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {checkoutLoading === plan.key ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                      ) : (
                        <>
                          <Star className="h-4 w-4" />
                          Start {plan.name} →
                        </>
                      )}
                    </button>
                  ) : isDowngrade ? (
                    <button
                      onClick={handleCancelSubscription}
                      className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      Cancel to Free
                    </button>
                  ) : (
                    <div className="py-2.5 text-center text-sm text-gray-400">Free forever</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {FAQ.map((item, i) => (
            <button
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full text-left px-6 py-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-gray-900">{item.q}</p>
                <span className={`text-gray-400 text-lg leading-none shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </div>
              {openFaq === i && (
                <p className="text-sm text-gray-500 mt-2 pr-6">{item.a}</p>
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
