
import 'dotenv/config'
import { prisma } from './src/lib/prisma'

async function main() {
    console.log("--- Inspecting Jobs ---")
    const jobs = await prisma.job.findMany({
        select: { id: true, title: true, company: true, scraped_post_id: true }
    })
    console.log(JSON.stringify(jobs, null, 2))
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
