import { prisma } from './prisma'

/**
 * Daily Job Scraping Limit Service
 * Manages daily limits for job scraping based on subscription tiers
 */

export interface DailyLimitInfo {
    current: number
    limit: number
    resetAt: string
    canScrape: boolean
    hoursUntilReset: number
    percentageUsed: number
}

export interface SubscriptionTier {
    name: string
    dailyJobLimit: number
}

export class DailyLimitService {
    /**
     * Get daily job limit based on subscription plan
     */
    static async getDailyJobLimit(userId: string): Promise<number> {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: { user_id: userId },
                select: { plan_name: true, status: true }
            })

            // If no subscription or inactive, default to free tier
            if (!subscription || subscription.status !== 'active') {
                return 10 // Free tier: 10 jobs/day
            }

            // Map subscription plans to daily limits
            switch (subscription.plan_name) {
                case 'premium_basic': // ₹149/month
                    return 25
                case 'premium_pro': // ₹249/month
                    return 50
                case 'pro_monthly': // Legacy mapping
                    return 25
                case 'pro_yearly': // Legacy mapping
                    return 50
                default:
                    return 10 // Free tier
            }
        } catch (error) {
            console.error('Error getting daily job limit:', error)
            return 10 // Default to free tier on error
        }
    }

    /**
     * Calculate next reset time (midnight in user's timezone)
     * For now, we'll use IST (India Standard Time) as default
     * IST is UTC+5:30
     */
    static calculateResetTime(timezone: string = 'Asia/Kolkata'): Date {
        const now = new Date()

        // IST offset: +5 hours 30 minutes = 330 minutes = 19800000 milliseconds
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

        // Get current time in IST
        const nowIST = new Date(now.getTime() + IST_OFFSET_MS)

        // Get today's date in IST
        const year = nowIST.getUTCFullYear()
        const month = nowIST.getUTCMonth()
        const day = nowIST.getUTCDate()

        // Create tomorrow midnight in IST (as UTC)
        const tomorrowMidnightIST = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0))

        // Convert back to UTC by subtracting the IST offset
        const tomorrowMidnightUTC = new Date(tomorrowMidnightIST.getTime() - IST_OFFSET_MS)

        return tomorrowMidnightUTC
    }

    /**
     * Reset daily limit if needed (past reset time)
     */
    static async resetDailyLimitIfNeeded(userId: string): Promise<boolean> {
        try {
            const user = await (prisma as any).user.findUnique({
                where: { id: userId },
                select: {
                    daily_matched_jobs_count: true,
                    daily_limit_reset_at: true
                }
            })

            if (!user) {
                return false
            }

            const now = new Date()
            const resetAt = user.daily_limit_reset_at

            // If no reset time set, or reset time has passed, reset the counter
            if (!resetAt || now >= resetAt) {
                const nextResetTime = this.calculateResetTime()

                await (prisma as any).user.update({
                    where: { id: userId },
                    data: {
                        daily_matched_jobs_count: 0,
                        daily_limit_reset_at: nextResetTime
                    }
                })

                console.log(`Reset daily limit for user ${userId}. Next reset: ${nextResetTime}`)
                return true
            }

            return false
        } catch (error) {
            console.error('Error resetting daily limit:', error)
            return false
        }
    }

    /**
     * Check if user can scrape more jobs
     */
    static async checkDailyLimit(userId: string): Promise<{ canScrape: boolean; reason?: string }> {
        try {
            // First, reset if needed
            await this.resetDailyLimitIfNeeded(userId)

            const [user, dailyLimit] = await Promise.all([
                (prisma as any).user.findUnique({
                    where: { id: userId },
                    select: {
                        daily_matched_jobs_count: true,
                        daily_limit_reset_at: true
                    }
                }),
                this.getDailyJobLimit(userId)
            ])

            if (!user) {
                return { canScrape: false, reason: 'User not found' }
            }

            const currentCount = (user as any).daily_matched_jobs_count || 0

            if (currentCount >= dailyLimit) {
                return {
                    canScrape: false,
                    reason: `Daily limit reached (${currentCount}/${dailyLimit}). Reset at ${(user as any).daily_limit_reset_at?.toISOString()}`
                }
            }

            return { canScrape: true }
        } catch (error) {
            console.error('Error checking daily limit:', error)
            // On error, allow scraping to prevent blocking users
            return { canScrape: true }
        }
    }

    /**
     * Increment daily matched job count
     */
    static async incrementDailyCount(userId: string): Promise<void> {
        try {
            // First, reset if needed
            await this.resetDailyLimitIfNeeded(userId)

            await (prisma as any).user.update({
                where: { id: userId },
                data: {
                    daily_matched_jobs_count: {
                        increment: 1
                    },
                    last_matched_job_at: new Date()
                }
            })

            console.log(`Incremented daily count for user ${userId}`)
        } catch (error) {
            console.error('Error incrementing daily count:', error)
            throw error
        }
    }

    /**
     * Get detailed daily limit information
     */
    static async getDailyLimitInfo(userId: string): Promise<DailyLimitInfo> {
        try {
            // First, reset if needed
            await this.resetDailyLimitIfNeeded(userId)

            const [user, dailyLimit] = await Promise.all([
                (prisma as any).user.findUnique({
                    where: { id: userId },
                    select: {
                        daily_matched_jobs_count: true,
                        daily_limit_reset_at: true
                    }
                }),
                this.getDailyJobLimit(userId)
            ])

            if (!user) {
                throw new Error('User not found')
            }

            const current = (user as any).daily_matched_jobs_count || 0
            const resetAt = (user as any).daily_limit_reset_at || this.calculateResetTime()
            const now = new Date()
            const hoursUntilReset = Math.max(0, (resetAt.getTime() - now.getTime()) / (1000 * 60 * 60))
            const percentageUsed = (current / dailyLimit) * 100

            return {
                current,
                limit: dailyLimit,
                resetAt: resetAt.toISOString(),
                canScrape: current < dailyLimit,
                hoursUntilReset: Math.round(hoursUntilReset * 10) / 10, // Round to 1 decimal
                percentageUsed: Math.round(percentageUsed)
            }
        } catch (error) {
            console.error('Error getting daily limit info:', error)
            throw error
        }
    }

    /**
     * Get subscription tier information
     */
    static async getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: { user_id: userId },
                select: { plan_name: true, status: true }
            })

            if (!subscription || subscription.status !== 'active') {
                return { name: 'Free', dailyJobLimit: 10 }
            }

            switch (subscription.plan_name) {
                case 'premium_basic':
                    return { name: 'Premium Basic (₹149/month)', dailyJobLimit: 25 }
                case 'premium_pro':
                    return { name: 'Premium Pro (₹249/month)', dailyJobLimit: 50 }
                case 'pro_monthly':
                    return { name: 'Premium Basic', dailyJobLimit: 25 }
                case 'pro_yearly':
                    return { name: 'Premium Pro', dailyJobLimit: 50 }
                default:
                    return { name: 'Free', dailyJobLimit: 10 }
            }
        } catch (error) {
            console.error('Error getting subscription tier:', error)
            return { name: 'Free', dailyJobLimit: 10 }
        }
    }
}
