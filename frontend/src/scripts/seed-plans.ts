#!/usr/bin/env tsx

/**
 * Seed subscription plans in database
 * Run this script to initialize the available subscription plans
 *
 * Usage:
 * npm run seed-plans
 * or
 * npx tsx src/scripts/seed-plans.ts
 */

import { prisma } from '../lib/prisma'
import { SUBSCRIPTION_PLANS } from '../lib/stripe'

async function seedSubscriptionPlans() {
  console.log('Seeding subscription plans...')

  try {
    // Seed each plan
    for (const [planKey, planConfig] of Object.entries(SUBSCRIPTION_PLANS)) {
      const planData = {
        name: planConfig.name,
        display_name: planConfig.displayName,
        description: getPlanDescription(planConfig.name),
        stripe_price_id: planConfig.stripePriceId || `price_${planConfig.name}`,
        price: planConfig.price,
        currency: planConfig.currency,
        interval: planConfig.interval || null,
        features: planConfig.features,
        is_active: true,
      }

      // Upsert plan
      await prisma.subscriptionPlan.upsert({
        where: { name: planConfig.name },
        update: planData,
        create: planData,
      })

      console.log(`✓ Seeded plan: ${planConfig.displayName}`)
    }

    console.log('All subscription plans seeded successfully!')

  } catch (error) {
    console.error('Error seeding subscription plans:', error)
    process.exit(1)
  }
}

function getPlanDescription(planName: string): string {
  const descriptions = {
    free: 'Get started with basic job matching and email features',
    pro_monthly: 'Unlock unlimited job matches, AI email generation, and priority support',
    pro_yearly: 'Save 17% with annual billing - all Pro features included',
  }

  return descriptions[planName as keyof typeof descriptions] || ''
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


