/**
 * Data migration script for shared post system
 * 
 * This script migrates existing ScrapedPost data to the new shared post model:
 * 1. For each existing ScrapedPost, create a ScrapedPostMatch record
 * 2. Mark the match as scraped_by_user = true
 * 3. Set scraped_at to the post's created_at timestamp
 * 
 * Run this BEFORE applying the Prisma migration to ensure data integrity
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { prisma } from '../src/lib/prisma'


async function migrateScrapedPosts() {
    console.log('Starting scraped posts migration...')

    try {
        // Get all existing scraped posts
        const posts = await prisma.scrapedPost.findMany({
            select: {
                id: true,
                user_id: true,
                created_at: true,
            }
        })

        console.log(`Found ${posts.length} scraped posts to migrate`)

        let migratedCount = 0
        let skippedCount = 0
        let errorCount = 0

        for (const post of posts) {
            try {
                // Check if a match already exists
                const existingMatch = await prisma.scrapedPostMatch.findUnique({
                    where: {
                        user_id_scraped_post_id: {
                            user_id: post.user_id,
                            scraped_post_id: post.id,
                        }
                    }
                })

                if (existingMatch) {
                    // Update existing match to mark as scraped
                    await prisma.scrapedPostMatch.update({
                        where: { id: existingMatch.id },
                        data: {
                            scraped_by_user: true,
                            scraped_at: post.created_at,
                        }
                    })
                    console.log(`Updated existing match for post ${post.id}`)
                    migratedCount++
                } else {
                    // Create new match record
                    await prisma.scrapedPostMatch.create({
                        data: {
                            user_id: post.user_id,
                            scraped_post_id: post.id,
                            match_score: 0,
                            match_quality: 'pending',
                            scraped_by_user: true,
                            scraped_at: post.created_at,
                            matched_at: post.created_at,
                        }
                    })
                    console.log(`Created match for post ${post.id}`)
                    migratedCount++
                }
            } catch (error) {
                console.error(`Error migrating post ${post.id}:`, error)
                errorCount++
            }
        }

        console.log('\nMigration complete!')
        console.log(`Migrated: ${migratedCount}`)
        console.log(`Skipped: ${skippedCount}`)
        console.log(`Errors: ${errorCount}`)

    } catch (error) {
        console.error('Migration failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run migration
migrateScrapedPosts()
    .then(() => {
        console.log('✅ Migration successful!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    })
