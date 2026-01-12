#!/usr/bin/env tsx

/**
 * Gmail Sync Script
 * Syncs Gmail messages for all users with Gmail credentials
 * Designed to run every 10 minutes via cron job
 *
 * Usage:
 * npm run sync-gmail
 * or
 * npx tsx src/scripts/sync-gmail.ts
 */

import { prisma } from '../lib/prisma'
import { gmailSyncQueue } from '../lib/queue'

async function syncAllUsersGmail() {
  try {
    console.log('Starting Gmail sync for all users...')

    // Get all users with Gmail credentials
    const usersWithGmail = await prisma.user.findMany({
      where: {
        gmailCredentials: {
          isNot: null
        }
      },
      select: {
        id: true,
        email: true,
        gmailCredentials: {
          select: {
            email_address: true,
            connected_at: true,
          }
        }
      }
    })

    console.log(`Found ${usersWithGmail.length} users with Gmail credentials`)

    let queuedJobs = 0

    for (const user of usersWithGmail) {
      try {
        // Check when we last synced for this user (to avoid too frequent syncs)
        const lastSyncLog = await prisma.emailLog.findFirst({
          where: {
            user_id: user.id,
            direction: 'received', // Only check received messages for sync timing
          },
          orderBy: { sent_at: 'desc' },
          select: { sent_at: true },
        })

        const lastSyncTime = lastSyncLog?.sent_at?.getTime() || 0
        const timeSinceLastSync = Date.now() - lastSyncTime

        // Only sync if it's been more than 9 minutes (to avoid overlapping with cron)
        if (timeSinceLastSync > 9 * 60 * 1000) {
          await gmailSyncQueue.add(
            'sync-gmail-messages',
            {
              userId: user.id,
              sinceTimestamp: lastSyncTime || null,
            },
            {
              priority: 1, // Low priority for background sync
              delay: Math.random() * 30000, // Random delay up to 30 seconds to distribute load
              removeOnComplete: 3,
              removeOnFail: 5,
            }
          )

          queuedJobs++
          console.log(`Queued Gmail sync for user: ${user.email}`)
        } else {
          console.log(`Skipping sync for user ${user.email} - recently synced`)
        }

      } catch (error) {
        console.error(`Error queuing sync for user ${user.id}:`, error)
        // Continue with other users
      }
    }

    console.log(`Gmail sync completed. Queued ${queuedJobs} jobs.`)

  } catch (error) {
    console.error('Error in Gmail sync script:', error)
    process.exit(1)
  }
}

// Run the sync
syncAllUsersGmail()
  .then(() => {
    console.log('Gmail sync script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Gmail sync script failed:', error)
    process.exit(1)
  })


