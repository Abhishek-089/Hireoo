
import 'dotenv/config'
import { prisma } from './src/lib/prisma'

async function main() {
    console.log("--- Cleaning Unknown Data ---")

    // 1. Update Unknown Company to null
    const companyUpdate = await prisma.job.updateMany({
        where: { company: "Unknown Company" },
        data: { company: null }
    })
    console.log(`Cleared ${companyUpdate.count} unknown companies.`)

    // 2. Find Unknown Titles
    const badTitleJobs = await prisma.job.findMany({
        where: { title: "Unknown Title" },
        select: { id: true, scraped_post_id: true }
    })

    console.log(`Found ${badTitleJobs.length} unknown titles to retry.`)

    // 3. Delete them to force re-enrichment? Or just update them?
    // Let's re-run enrichment for these specific IDs
    for (const job of badTitleJobs) {
        if (!job.scraped_post_id) continue

        // First get the scraped post to find user_id
        const scrapedPost = await prisma.scrapedPost.findUnique({
            where: { id: job.scraped_post_id },
            select: { user_id: true }
        })

        if (!scrapedPost) continue

        // Use compound unique key: user_id + scraped_post_id
        const match = await prisma.scrapedPostMatch.findUnique({
            where: { 
                user_id_scraped_post_id: {
                    user_id: scrapedPost.user_id,
                    scraped_post_id: job.scraped_post_id
                }
            },
            include: { scrapedPost: true }
        })

        if (!match) continue

        console.log(`Retrying enrichment for Job ${job.id} (Match ${match.id})...`)

        const textToProcess = match.text_content || match.scrapedPost.text

        try {
            const response = await fetch("http://localhost:8000/api/v1/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    raw_text: textToProcess,
                    raw_html: "<div></div>"
                })
            })

            if (!response.ok) {
                console.error(`AI Error: ${response.status}`)
                continue
            }

            const data = await response.json()
            if (data.success && data.data) {
                const result = data.data
                await prisma.job.update({
                    where: { id: job.id },
                    data: {
                        // If AI still returns "Unknown", set to null/generic
                        title: (result.job_title && result.job_title !== "Unknown Title") ? result.job_title : "Job Opportunity",
                        company: (result.company && result.company !== "Unknown Company") ? result.company : null,
                        description: result.description || textToProcess
                    }
                })
                console.log(`✅ Fixed: ${result.job_title}`)
            }
        } catch (e) {
            console.error("Retry failed", e)
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
