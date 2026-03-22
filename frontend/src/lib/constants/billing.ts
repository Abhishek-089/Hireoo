
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    currency: 'inr',
    razorpayPlanId: null as string | null,
    features: {
      dailyJobMatches: 10,
      monthlyJobMatches: 10,
      monthlyEmails: 5,
      aiEmailGeneration: false,
      prioritySupport: false,
      advancedAnalytics: false,
      bulkApply: false,
    },
  },
  PREMIUM: {
    name: 'premium',
    displayName: 'Premium',
    price: 149,
    currency: 'inr',
    interval: 'month',
    razorpayPlanId: process.env.RAZORPAY_PLAN_ID_PREMIUM || '',
    features: {
      dailyJobMatches: 25,
      monthlyJobMatches: -1,
      monthlyEmails: 100,
      aiEmailGeneration: true,
      prioritySupport: true,
      advancedAnalytics: false,
      bulkApply: true,
    },
  },
  PRO: {
    name: 'pro',
    displayName: 'Pro',
    price: 249,
    currency: 'inr',
    interval: 'month',
    razorpayPlanId: process.env.RAZORPAY_PLAN_ID_PRO || '',
    features: {
      dailyJobMatches: 50,
      monthlyJobMatches: -1,
      monthlyEmails: -1,
      aiEmailGeneration: true,
      prioritySupport: true,
      advancedAnalytics: true,
      bulkApply: true,
    },
  },
} as const

export type PlanName = keyof typeof SUBSCRIPTION_PLANS
export type PlanConfig = typeof SUBSCRIPTION_PLANS[PlanName]
