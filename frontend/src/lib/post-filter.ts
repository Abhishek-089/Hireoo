import { prisma } from './prisma'
import { extractEmails } from './utils'

export interface PostQualificationResult {
    qualifies: boolean
    reason?: string
    matchScore?: number
    matchQuality?: 'good' | 'medium' | 'bad' | 'pending'
}

/**
 * Check if a post qualifies for a user based on:
 * 1. Must have email address
 * 2. Must match user preferences (skills, titles, locations, types)
 * 3. Must meet minimum match score threshold
 */
export async function checkPostQualifies(
    postText: string,
    userId: string
): Promise<PostQualificationResult> {
    try {
        console.log(`[PostFilter] Checking qualification for user ${userId}`)
        console.log(`[PostFilter] Post text length: ${postText.length} chars`)

        // 1. Check for email (was REQUIRED, now optional but gives bonus)
        const emails = extractEmails(postText)

        if (emails.length === 0) {
            console.log(`[PostFilter] ⚠️ No email found in post for user ${userId}, continuing without email bonus`)
        } else {
            console.log(`[PostFilter] ✅ Found ${emails.length} email(s): ${emails.join(', ')}`)
        }

        // 2. Get user preferences
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                skills: true,
                preferred_job_titles: true,
                preferred_locations: true,
                remote_work_preferred: true,
                job_types: true,
            }
        })

        if (!user) {
            console.log(`[PostFilter] ❌ User ${userId} not found`)
            return {
                qualifies: false,
                reason: 'User not found'
            }
        }

        // Check if user has any preferences set
        const hasPreferences = (user.skills?.length ?? 0) > 0 ||
            (user.preferred_job_titles?.length ?? 0) > 0 ||
            (user.preferred_locations?.length ?? 0) > 0 ||
            (user.job_types?.length ?? 0) > 0

        if (!hasPreferences) {
            console.log(`[PostFilter] ⚠️ User ${userId} has no preferences set - using email-only qualification`)
            // Still qualify if has email - user can set preferences later
            return {
                qualifies: true,
                matchScore: 5,  // Just email bonus
                matchQuality: 'pending'
            }
        }

        console.log(`[PostFilter] User preferences:`, {
            skills: user.skills?.length ?? 0,
            jobTitles: user.preferred_job_titles?.length ?? 0,
            locations: user.preferred_locations?.length ?? 0,
            jobTypes: user.job_types?.length ?? 0,
            remotePreferred: user.remote_work_preferred
        })

        // 3. Calculate match score (same logic as ScrapedPostMatchingService)
        const postTextLower = postText.toLowerCase()
        let matchScore = 0

        // Skills (40% weight)
        if (user.skills && user.skills.length > 0) {
            const matchingSkills = user.skills.filter(skill =>
                postTextLower.includes(skill.toLowerCase())
            )
            const skillScore = (matchingSkills.length / user.skills.length) * 40
            matchScore += skillScore

            if (matchingSkills.length > 0) {
                console.log(`[PostFilter] ✅ Matched ${matchingSkills.length}/${user.skills.length} skills: ${matchingSkills.join(', ')}`)
            } else {
                console.log(`[PostFilter] ⚠️ No skills matched (0/${user.skills.length})`)
            }
        }

        // Job titles (30% weight)
        if (user.preferred_job_titles && user.preferred_job_titles.length > 0) {
            const matchingTitles = user.preferred_job_titles.filter(title =>
                postTextLower.includes(title.toLowerCase())
            )
            if (matchingTitles.length > 0) {
                matchScore += 30
                console.log(`[PostFilter] ✅ Matched job titles: ${matchingTitles.join(', ')}`)
            } else {
                console.log(`[PostFilter] ⚠️ No job titles matched`)
            }
        }

        // Locations (15% weight)
        if (user.preferred_locations && user.preferred_locations.length > 0) {
            const matchingLocations = user.preferred_locations.filter(location =>
                postTextLower.includes(location.toLowerCase())
            )
            if (matchingLocations.length > 0) {
                matchScore += 15
                console.log(`[PostFilter] ✅ Matched locations: ${matchingLocations.join(', ')}`)
            } else if (user.remote_work_preferred && postTextLower.includes('remote')) {
                matchScore += 15
                console.log(`[PostFilter] ✅ Matched remote work preference`)
            } else {
                console.log(`[PostFilter] ⚠️ No locations matched`)
            }
        }

        // Job types (10% weight)
        if (user.job_types && user.job_types.length > 0) {
            const matchingTypes = user.job_types.filter(type =>
                postTextLower.includes(type.toLowerCase())
            )
            if (matchingTypes.length > 0) {
                matchScore += 10
                console.log(`[PostFilter] ✅ Matched job types: ${matchingTypes.join(', ')}`)
            } else {
                console.log(`[PostFilter] ⚠️ No job types matched`)
            }
        }

        // Email bonus (5 points)
        matchScore += 5

        // Determine quality
        let matchQuality: 'good' | 'medium' | 'bad'
        if (matchScore >= 50) {
            matchQuality = 'good'
        } else if (matchScore >= 25) {
            matchQuality = 'medium'
        } else {
            matchQuality = 'bad'
        }

        console.log(`[PostFilter] 📊 Final match score: ${matchScore.toFixed(1)} (${matchQuality})`)

        // Minimum threshold: 5 (just email bonus) - lowered from 20 to be more lenient
        if (matchScore < 5) {
            console.log(`[PostFilter] ❌ Match score too low: ${matchScore.toFixed(1)} < 5`)
            return {
                qualifies: false,
                reason: `Match score too low: ${matchScore.toFixed(1)} (minimum: 5)`,
                matchScore,
                matchQuality
            }
        }

        console.log(`[PostFilter] ✅ Post qualifies for user ${userId}`)
        return {
            qualifies: true,
            matchScore,
            matchQuality
        }
    } catch (error) {
        console.error('[PostFilter] ❌ Error checking post qualification:', error)
        return {
            qualifies: false,
            reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
}
