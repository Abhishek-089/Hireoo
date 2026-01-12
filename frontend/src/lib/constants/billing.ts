
export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'free',
        displayName: 'Free',
        price: 0,
        currency: 'usd',
        stripePriceId: null,
        features: {
            monthlyJobMatches: 10,
            monthlyEmails: 5,
            aiEmailGeneration: false,
            prioritySupport: false,
            advancedAnalytics: false,
        },
    },
    PRO_MONTHLY: {
        name: 'pro_monthly',
        displayName: 'Pro Monthly',
        price: 29,
        currency: 'usd',
        interval: 'month',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
        features: {
            monthlyJobMatches: -1, // unlimited
            monthlyEmails: 100,
            aiEmailGeneration: true,
            prioritySupport: true,
            advancedAnalytics: true,
        },
    },
    PRO_YEARLY: {
        name: 'pro_yearly',
        displayName: 'Pro Yearly',
        price: 290,
        currency: 'usd',
        interval: 'year',
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '',
        features: {
            monthlyJobMatches: -1, // unlimited
            monthlyEmails: 100,
            aiEmailGeneration: true,
            prioritySupport: true,
            advancedAnalytics: true,
        },
    },
} as const

export type PlanName = keyof typeof SUBSCRIPTION_PLANS
export type PlanConfig = typeof SUBSCRIPTION_PLANS[PlanName]
