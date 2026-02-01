
import { prisma } from './src/lib/prisma'

async function main() {
    console.log("Checking ScrapedPostMatch schema...")

    // Find a match
    const match = await prisma.scrapedPostMatch.findFirst()

    if (match) {
        console.log("Found a match record:")
        // console.log(match) // Don't dump full object potentially

        // Explicitly check for property
        if ('text_content' in match) {
            console.log("SUCCESS: 'text_content' field exists in the record.")
            console.log("Value:", (match as any).text_content)
        } else {
            console.error("FAILURE: 'text_content' field is MISSING in the record.")
        }
    } else {
        console.log("No matches found in DB to check.")
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
