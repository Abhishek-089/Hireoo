import { JobMatchingService } from './job-matching'
import { jobMatchingQueue, QUEUE_NAMES } from './queue'
import { prisma } from './prisma'

/**
 * Main function to match a job to all eligible users
 * This is the primary entry point for job matching
 */
export async function matchJobToUsers(jobId: string): Promise<{
  success: boolean
  message: string
  matchCount?: number
  jobQueued?: boolean
}> {
  try {
    console.log(`Starting job matching process for job: ${jobId}`)

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, status: true },
    })

    if (!job) {
      return {
        success: false,
        message: `Job not found: ${jobId}`,
      }
    }

    if (job.status === 'expired') {
      return {
        success: false,
        message: `Job is expired: ${jobId}`,
      }
    }

    // Check if job has an embedding (required for matching)
    const jobWithEmbedding = await prisma.job.findUnique({
      where: { id: jobId },
      select: { embedding: true },
    })

    if (!jobWithEmbedding?.embedding || jobWithEmbedding.embedding.length === 0) {
      return {
        success: false,
        message: `Job has no embedding data: ${jobId}`,
      }
    }

    // Queue the job for matching
    await jobMatchingQueue.add(
      'match-job-to-users',
      { jobId },
      {
        priority: 5, // High priority for job matching
        delay: 1000, // Small delay to allow batching
        removeOnComplete: 10,
        removeOnFail: 20,
      }
    )

    console.log(`Queued job matching for job: ${jobId}`)

    return {
      success: true,
      message: `Job matching queued for job: ${jobId}`,
      jobQueued: true,
    }
  } catch (error) {
    console.error(`Error queuing job matching for ${jobId}:`, error)
    return {
      success: false,
      message: `Failed to queue job matching: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Match multiple jobs to users (batch processing)
 */
export async function matchMultipleJobsToUsers(jobIds: string[]): Promise<{
  success: boolean
  message: string
  queuedJobs?: number
  failedJobs?: string[]
}> {
  const results = []
  const failedJobs = []

  for (const jobId of jobIds) {
    try {
      const result = await matchJobToUsers(jobId)
      results.push(result)
      if (!result.success) {
        failedJobs.push(jobId)
      }
    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error)
      failedJobs.push(jobId)
    }
  }

  const successCount = results.filter(r => r.success).length

  return {
    success: failedJobs.length === 0,
    message: `Processed ${jobIds.length} jobs: ${successCount} queued, ${failedJobs.length} failed`,
    queuedJobs: successCount,
    failedJobs,
  }
}

/**
 * Get matching statistics for a job
 */
export async function getJobMatchingStats(jobId: string): Promise<{
  totalMatches: number
  goodMatches: number
  mediumMatches: number
  badMatches: number
  appliedCount: number
  topMatches: any[]
} | null> {
  try {
    const matches = await prisma.jobMatch.findMany({
      where: { job_id: jobId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { final_score: 'desc' },
    })

    if (matches.length === 0) {
      return null
    }

    const goodMatches = matches.filter(m => m.match_quality === 'good').length
    const mediumMatches = matches.filter(m => m.match_quality === 'medium').length
    const badMatches = matches.filter(m => m.match_quality === 'bad').length
    const appliedCount = matches.filter(m => m.applied).length

    // Get top 5 matches
    const topMatches = matches.slice(0, 5).map(match => ({
      userId: match.user_id,
      userName: match.user.name,
      userEmail: match.user.email,
      finalScore: match.final_score,
      matchQuality: match.match_quality,
      applied: match.applied,
      matchedAt: match.matched_at,
    }))

    return {
      totalMatches: matches.length,
      goodMatches,
      mediumMatches,
      badMatches,
      appliedCount,
      topMatches,
    }
  } catch (error) {
    console.error(`Error getting matching stats for job ${jobId}:`, error)
    return null
  }
}

/**
 * Trigger matching for all new jobs that don't have matches yet
 */
export async function triggerMatchingForUnmatchedJobs(): Promise<{
  success: boolean
  message: string
  jobsQueued?: number
}> {
  try {
    // Find jobs that have embeddings but no matches
    const unmatchedJobs = await prisma.job.findMany({
      where: {
        embedding: { not: [] }, // Has embedding
        status: 'active',
        user_matches: {
          none: {}, // No matches yet
        },
      },
      select: { id: true, title: true },
      take: 50, // Limit to prevent overwhelming the queue
    })

    if (unmatchedJobs.length === 0) {
      return {
        success: true,
        message: 'No unmatched jobs found',
      }
    }

    console.log(`Found ${unmatchedJobs.length} unmatched jobs`)

    // Queue matching for these jobs
    const jobIds = unmatchedJobs.map(job => job.id)
    const result = await matchMultipleJobsToUsers(jobIds)

    return {
      success: result.success,
      message: result.message,
      jobsQueued: result.queuedJobs,
    }
  } catch (error) {
    console.error('Error triggering matching for unmatched jobs:', error)
    return {
      success: false,
      message: `Failed to trigger matching: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Clean up old matches (optional maintenance function)
 */
export async function cleanupOldMatches(daysOld: number = 90): Promise<{
  success: boolean
  message: string
  matchesRemoved?: number
}> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.jobMatch.deleteMany({
      where: {
        matched_at: {
          lt: cutoffDate,
        },
        applied: false, // Only remove unapplied matches
      },
    })

    return {
      success: true,
      message: `Removed ${result.count} old unapplied matches`,
      matchesRemoved: result.count,
    }
  } catch (error) {
    console.error('Error cleaning up old matches:', error)
    return {
      success: false,
      message: `Failed to cleanup matches: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}


