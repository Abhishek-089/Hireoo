
import 'dotenv/config'
import { prisma } from './src/lib/prisma'

async function main() {
    console.log("--- Ensuring All Matches Enriched ---")

    // 1. Get all matches
    const matches = await prisma.scrapedPostMatch.findMany({
        include: {
            scrapedPost: { include: { job: true } }
        }
    })
    console.log(`Total Matches found: ${matches.length}`)

    for (const match of matches) {
        const job = match.scrapedPost.job
        let needsUpdate = false
        let reason = ""

        if (!job) {
            needsUpdate = true
            reason = "Missing Job"
        } else if (job.title === "Unknown Title" || job.company === "Unknown Company") {
            needsUpdate = true
            reason = "Unknown Data"
        }

        if (needsUpdate) {
            console.log(`Fixing Match ${match.id} (${reason})...`)
            const textToProcess = match.text_content || match.scrapedPost.text

            try {
                // Call AI Service
                const response = await fetch("http://localhost:8000/api/v1/extract", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        raw_text: textToProcess,
                        raw_html: "<div></div>"
                    })
                })

                if (!response.ok) {
                    console.error(`AI Error ${response.status}`)
                    continue
                }

                const data = await response.json()
                if (data.success && data.data) {
                    const result = data.data
                    // Upsert Job
                    await prisma.job.upsert({
                        where: { scraped_post_id: match.scraped_post_id },
                        create: {
                            scraped_post_id: match.scraped_post_id,
                            title: result.job_title || "Job Opportunity",
                            company: result.company, // Allow null
                            location: result.location || "Remote",
                            salary_range: result.salary_range,
                            skills: result.skills || [],
                            description: result.description || textToProcess,
                            posted_date: new Date(),
                            source_url: match.scrapedPost.post_url
                        },
                        update: {
                            title: result.job_title || "Job Opportunity",
                            company: result.company, // Allow null
                            location: result.location || "Remote",
                            salary_range: result.salary_range,
                            skills: result.skills || [],
                            description: result.description || textToProcess
                        }
                    })
                    console.log(`✅ Fixed: ${result.job_title || "Job Opportunity"}`)
                }
            } catch (e) {
                console.error("Enrichment failed", e)
            }
        } else {
            console.log(`Match ${match.id} is OK (${job?.title})`)
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
