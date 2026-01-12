import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

// Redis connection configuration - lazy initialization
let redisConnection: IORedis | null = null

function getRedisConnection(): IORedis {
  if (!redisConnection) {
    if (process.env.REDIS_URL) {
      redisConnection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => Math.min(times * 50, 5000),
        lazyConnect: true,
        tls: {
          rejectUnauthorized: false
        }
      })
    } else {
      redisConnection = new IORedis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        retryStrategy: (times) => Math.min(times * 50, 5000),
        lazyConnect: true, // Don't connect immediately
      })
    }
  }
  return redisConnection
}

// Queue names
export const QUEUE_NAMES = {
  AI_EXTRACTION: 'ai_extraction',
  JOB_MATCHING: 'job_matching',
  EMAIL_GENERATION: 'email_generation',
  GMAIL_SYNC: 'gmail_sync',
} as const

// Queues - created lazily only when needed
let _aiExtractionQueue: Queue | null = null
let _jobMatchingQueue: Queue | null = null
let _emailGenerationQueue: Queue | null = null
let _gmailSyncQueue: Queue | null = null

function getQueue(name: string): Queue {
  const queues: Record<string, () => Queue> = {
    [QUEUE_NAMES.AI_EXTRACTION]: () => {
      if (!_aiExtractionQueue) {
        _aiExtractionQueue = new Queue(QUEUE_NAMES.AI_EXTRACTION, {
          connection: getRedisConnection(),
          defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 100,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
        })
      }
      return _aiExtractionQueue
    },
    [QUEUE_NAMES.JOB_MATCHING]: () => {
      if (!_jobMatchingQueue) {
        _jobMatchingQueue = new Queue(QUEUE_NAMES.JOB_MATCHING, {
          connection: getRedisConnection(),
          defaultJobOptions: {
            removeOnComplete: 20,
            removeOnFail: 50,
            attempts: 2,
            backoff: { type: 'exponential', delay: 5000 },
          },
        })
      }
      return _jobMatchingQueue
    },
    [QUEUE_NAMES.EMAIL_GENERATION]: () => {
      if (!_emailGenerationQueue) {
        _emailGenerationQueue = new Queue(QUEUE_NAMES.EMAIL_GENERATION, {
          connection: getRedisConnection(),
          defaultJobOptions: {
            removeOnComplete: 30,
            removeOnFail: 20,
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
          },
        })
      }
      return _emailGenerationQueue
    },
    [QUEUE_NAMES.GMAIL_SYNC]: () => {
      if (!_gmailSyncQueue) {
        _gmailSyncQueue = new Queue(QUEUE_NAMES.GMAIL_SYNC, {
          connection: getRedisConnection(),
          defaultJobOptions: {
            removeOnComplete: 10,
            removeOnFail: 20,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          },
        })
      }
      return _gmailSyncQueue
    },
  }
  return queues[name]()
}

// Export queues as getters (lazy initialization)
export const aiExtractionQueue = new Proxy({} as Queue, {
  get: (_, prop) => getQueue(QUEUE_NAMES.AI_EXTRACTION)[prop as keyof Queue],
})

export const jobMatchingQueue = new Proxy({} as Queue, {
  get: (_, prop) => getQueue(QUEUE_NAMES.JOB_MATCHING)[prop as keyof Queue],
})

export const emailGenerationQueue = new Proxy({} as Queue, {
  get: (_, prop) => getQueue(QUEUE_NAMES.EMAIL_GENERATION)[prop as keyof Queue],
})

export const gmailSyncQueue = new Proxy({} as Queue, {
  get: (_, prop) => getQueue(QUEUE_NAMES.GMAIL_SYNC)[prop as keyof Queue],
})

// Workers - only created when initializeWorkers() is called
let aiExtractionWorker: Worker | null = null
let jobMatchingWorker: Worker | null = null
let emailGenerationWorker: Worker | null = null
let gmailSyncWorker: Worker | null = null

// Initialize workers (call this only in process-queue script)
export function initializeWorkers() {
  if (aiExtractionWorker) return // Already initialized

  const conn = getRedisConnection()

  // AI Extraction Worker
  aiExtractionWorker = new Worker(
    QUEUE_NAMES.AI_EXTRACTION,
    async (job) => {
      console.log(`Processing AI extraction job ${job.id} for scraped post ${job.data.scrapedPostId}`)
      const { scrapedPostId, rawHtml, text } = job.data
      try {
        console.log(`AI extraction completed for post ${scrapedPostId}`)
        return {
          success: true,
          scrapedPostId,
          extractedData: {
            jobTitle: null,
            company: null,
            location: null,
            salary: null,
            requirements: [],
            description: text,
          },
        }
      } catch (error) {
        console.error(`AI extraction failed for post ${scrapedPostId}:`, error)
        throw error
      }
    },
    { connection: conn, concurrency: 2 }
  )

  // Job Matching Worker
  jobMatchingWorker = new Worker(
    QUEUE_NAMES.JOB_MATCHING,
    async (job) => {
      const { JobMatchingService } = await import('./job-matching')
      const { jobId } = job.data
      console.log(`Processing job matching job ${job.id} for job ${jobId}`)
      try {
        const matchResults = await JobMatchingService.matchJobToUsers(jobId)
        console.log(`Job matching completed for job ${jobId}: ${matchResults.length} matches created`)
        return {
          success: true,
          jobId,
          totalMatches: matchResults.length,
          goodMatches: matchResults.filter(m => m.matchQuality === 'good').length,
          mediumMatches: matchResults.filter(m => m.matchQuality === 'medium').length,
          badMatches: matchResults.filter(m => m.matchQuality === 'bad').length,
        }
      } catch (error) {
        console.error(`Job matching failed for job ${jobId}:`, error)
        throw error
      }
    },
    { connection: conn, concurrency: 1 }
  )

  // Email Generation Worker
  emailGenerationWorker = new Worker(
    QUEUE_NAMES.EMAIL_GENERATION,
    async (job) => {
      const { EmailGeneratorService } = await import('./email-generator')
      const { userId, jobId, matchId } = job.data
      console.log(`Processing email generation job ${job.id} for user ${userId}, job ${jobId}`)
      try {
        const { prisma } = await import('./prisma')
        const [jobData, user, match] = await Promise.all([
          prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, title: true, company: true, skills: true, description: true }
          }),
          prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, skills: true, current_role: true, experience_level: true }
          }),
          prisma.jobMatch.findUnique({ where: { id: matchId }, select: { id: true } })
        ])
        if (!jobData || !user || !match) throw new Error('Job, user, or match not found')
        const email = await EmailGeneratorService.generateColdEmail(
          { id: jobData.id, title: jobData.title, company: jobData.company, skills: jobData.skills || [], description: jobData.description },
          { id: user.id, name: user.name, skills: user.skills || [], currentRole: user.current_role, experienceLevel: user.experience_level }
        )
        const draftId = await EmailGeneratorService.saveEmailDraft(userId, jobId, matchId, email)
        console.log(`Email generation completed for user ${userId}, job ${jobId}: draft ${draftId}`)
        return { success: true, userId, jobId, matchId, draftId, subject: email.subject }
      } catch (error) {
        console.error(`Email generation failed for user ${userId}, job ${jobId}:`, error)
        throw error
      }
    },
    { connection: conn, concurrency: 2 }
  )

  // Gmail Sync Worker
  gmailSyncWorker = new Worker(
    QUEUE_NAMES.GMAIL_SYNC,
    async (job) => {
      const { GmailService } = await import('./gmail-service')
      const { userId, sinceTimestamp } = job.data
      console.log(`Processing Gmail sync job ${job.id}`)
      try {
        await GmailService.syncGmailMessages(userId, sinceTimestamp)
        console.log(`Gmail sync completed for user ${userId}`)
        return { success: true, userId, syncedAt: new Date().toISOString() }
      } catch (error) {
        console.error(`Gmail sync failed for user ${userId}:`, error)
        throw error
      }
    },
    { connection: conn, concurrency: 3 }
  )

  // Event listeners
  aiExtractionWorker.on('completed', (job) => console.log(`AI extraction job ${job.id} completed`))
  aiExtractionWorker.on('failed', (job, err) => console.error(`AI extraction job ${job?.id} failed:`, err.message))
  jobMatchingWorker.on('completed', (job) => console.log(`Job matching job ${job.id} completed`))
  jobMatchingWorker.on('failed', (job, err) => console.error(`Job matching job ${job?.id} failed:`, err.message))
  emailGenerationWorker.on('completed', (job) => console.log(`Email generation job ${job.id} completed`))
  emailGenerationWorker.on('failed', (job, err) => console.error(`Email generation job ${job?.id} failed:`, err.message))
  gmailSyncWorker.on('completed', (job) => console.log(`Gmail sync job ${job.id} completed`))
  gmailSyncWorker.on('failed', (job, err) => console.error(`Gmail sync job ${job?.id} failed:`, err.message))
}

// Graceful shutdown (Node.js environments only)
async function shutdown() {
  console.log('Shutting down queue workers...')
  if (aiExtractionWorker) await aiExtractionWorker.close()
  if (jobMatchingWorker) await jobMatchingWorker.close()
  if (emailGenerationWorker) await emailGenerationWorker.close()
  if (gmailSyncWorker) await gmailSyncWorker.close()
  if (_aiExtractionQueue) await _aiExtractionQueue.close()
  if (_jobMatchingQueue) await _jobMatchingQueue.close()
  if (_emailGenerationQueue) await _emailGenerationQueue.close()
  if (_gmailSyncQueue) await _gmailSyncQueue.close()
  if (redisConnection) await redisConnection.quit()
}

// In some runtimes (e.g. Edge / serverless) `process` may not exist or may not support `on`.
// Guard these listeners so importing this module never throws.
if (typeof process !== 'undefined' && typeof (process as any).on === 'function') {
  ; (process as any).on('SIGTERM', shutdown)
    ; (process as any).on('SIGINT', shutdown)
}

export { getRedisConnection as redisConnection }
