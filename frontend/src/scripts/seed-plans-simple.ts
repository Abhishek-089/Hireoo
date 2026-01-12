#!/usr/bin/env tsx

/**
 * Simple seed subscription plans without Stripe dependency
 * Run this script to initialize the available subscription plans
 *
 * Usage:
 * npm run seed-plans-simple
 * or
 * npx tsx src/scripts/seed-plans-simple.ts
 */

import { prisma } from '../lib/prisma'

async function seedSubscriptionPlans() {
  console.log('Seeding subscription plans...')

  try {
    // Seed each plan
    const plans = [
      {
        name: 'free',
        display_name: 'Free',
        description: 'Get started with basic job matching and email features',
        stripe_price_id: 'price_free',
        price: 0,
        currency: 'usd',
        interval: null,
        features: {
          monthlyJobMatches: 10,
          monthlyEmails: 5,
          aiEmailGeneration: false,
          advancedAnalytics: false,
          prioritySupport: false,
        },
        is_active: true,
      },
      {
        name: 'pro_monthly',
        display_name: 'Pro Monthly',
        description: 'Unlock unlimited job matches, AI email generation, and priority support',
        stripe_price_id: 'price_pro_monthly_placeholder',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: {
          monthlyJobMatches: -1, // unlimited
          monthlyEmails: 100,
          aiEmailGeneration: true,
          advancedAnalytics: true,
          prioritySupport: true,
        },
        is_active: true,
      },
      {
        name: 'pro_yearly',
        display_name: 'Pro Yearly',
        description: 'Save 17% with annual billing - all Pro features included',
        stripe_price_id: 'price_pro_yearly_placeholder',
        price: 290,
        currency: 'usd',
        interval: 'year',
        features: {
          monthlyJobMatches: -1, // unlimited
          monthlyEmails: 100,
          aiEmailGeneration: true,
          advancedAnalytics: true,
          prioritySupport: true,
        },
        is_active: true,
      },
    ]

    for (const planData of plans) {
      // Upsert plan
      await prisma.subscriptionPlan.upsert({
        where: { name: planData.name },
        update: planData,
        create: planData,
      })

      console.log(`✓ Seeded plan: ${planData.display_name}`)
    }

    console.log('All subscription plans seeded successfully!')

  } catch (error) {
    console.error('Error seeding subscription plans:', error)
    process.exit(1)
  }
}

// Run the seeding
seedSubscriptionPlans()
  .then(() => {
    console.log('Seeding completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
