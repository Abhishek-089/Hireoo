import { ScrapingService } from "./src/lib/scraping-service";
import { prisma } from "./src/lib/prisma";

async function main() {
    const userId = "cmlp5rwd00000tm0hi0fswvyx"; // from logs
    const postData = {
        raw_html: "<div>I am looking for a Freelance Application Developer...</div>",
        text: "I am looking for a Freelance Application Developer...",
        post_url: "https://www.linkedin.com/feed/update/urn:li:activity:7431939142634127360",
        linkedin_id: "urn:li:activity:7431939142634127360",
        timestamp: "2026-02-24T09:09:09.180Z"
    };

    console.log("Saving post...");
    try {
        const result = await ScrapingService.storeScrapedPost(userId, postData);
        console.log("Result:", result);
    } catch (e) {
        console.error("Exception thrown in storeScrapedPost:");
        console.error(e);
    }
}

main().finally(() => prisma.$disconnect());
