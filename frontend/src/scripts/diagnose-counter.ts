import { prisma } from '../lib/prisma'

async function diagnose() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'pranjal@hireoo.in' },
            select: {
                id: true,
                email: true,
                daily_matched_jobs_count: true,
                daily_limit_reset_at: true,
                last_matched_job_at: true,
            }
        })

        if (!user) {
            console.log('User not found')
            return
        }

        console.log('=== User Info ===')
        console.log('Email:', user.email)
        console.log('Daily Count (stored):', user.daily_matched_jobs_count)
        console.log('Reset At:', user.daily_limit_reset_at)
        console.log('Last Match At:', user.last_matched_job_at)
        console.log()

        // Count all matches
        const totalMatches = await prisma.scrapedPostMatch.count({
            where: { user_id: user.id }
        })
        console.log('Total Matches (all time):', totalMatches)

        // Get all matches with timestamps
        const matches = await prisma.scrapedPostMatch.findMany({
            where: { user_id: user.id },
            select: {
                id: true,
                matched_at: true,
                scraped_post_id: true
            },
            orderBy: { matched_at: 'desc' }
        })

        console.log('\n=== All Matches ===')
        matches.forEach((match, index) => {
            console.log(`${index + 1}. Matched at: ${match.matched_at.toISOString()}`)
        })

        console.log('\n=== Reset Logic ===')
        const now = new Date()
        console.log('Current time:', now.toISOString())

        if (user.daily_limit_reset_at) {
            const resetAt = new Date(user.daily_limit_reset_at)
            console.log('Reset time:', resetAt.toISOString())
            console.log('Is reset time in future?', resetAt > now)
            console.log('Hours until reset:', ((resetAt.getTime() - now.getTime()) / (1000 * 60 * 60)).toFixed(2))
        } else {
            console.log('No reset time set')
        }

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

diagnose()
