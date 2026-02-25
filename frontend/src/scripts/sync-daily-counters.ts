import { prisma } from '../lib/prisma'

/**
 * Utility script to sync daily_matched_jobs_count with actual ScrapedPostMatch count
 * Run this to fix any discrepancies between the counter and actual matches
 */

async function syncDailyCounters() {
    console.log('Starting daily counter sync...\n')

    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                daily_matched_jobs_count: true,
                daily_limit_reset_at: true,
            }
        })

        let totalFixed = 0
        let totalChecked = 0

        for (const user of users) {
            totalChecked++

            // Count actual matched posts for this user created today
            const resetAt = user.daily_limit_reset_at || new Date()
            const startOfPeriod = new Date(resetAt)
            startOfPeriod.setHours(0, 0, 0, 0)

            // If reset time is in the future, we're in the current period
            // Count matches since the last reset (or start of today if no reset set)
            const now = new Date()
            const countSince = user.daily_limit_reset_at && user.daily_limit_reset_at > now
                ? new Date(user.daily_limit_reset_at.getTime() - 24 * 60 * 60 * 1000) // 24 hours before reset
                : startOfPeriod

            const actualCount = await prisma.scrapedPostMatch.count({
                where: {
                    user_id: user.id,
                    matched_at: {
                        gte: countSince
                    }
                }
            })

            const storedCount = user.daily_matched_jobs_count || 0

            if (actualCount !== storedCount) {
                console.log(`\n❌ Mismatch found for user: ${user.email}`)
                console.log(`   Stored count: ${storedCount}`)
                console.log(`   Actual count: ${actualCount}`)
                console.log(`   Difference: ${storedCount - actualCount}`)
                console.log(`   Fixing...`)

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        daily_matched_jobs_count: actualCount
                    }
                })

                console.log(`   ✅ Fixed! Updated to ${actualCount}`)
                totalFixed++
            } else if (storedCount > 0) {
                console.log(`✅ User ${user.email}: Count is correct (${storedCount})`)
            }
        }

        console.log(`\n\n=== Summary ===`)
        console.log(`Total users checked: ${totalChecked}`)
        console.log(`Users with mismatched counts: ${totalFixed}`)
        console.log(`Sync complete!`)

    } catch (error) {
        console.error('Error syncing daily counters:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run the sync
syncDailyCounters()
    .then(() => {
        console.log('\n✅ All done!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Error:', error)
        process.exit(1)
    })
