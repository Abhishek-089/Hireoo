import { ScrapingService } from './src/lib/scraping-service';

async function test() {
    try {
        const postData = {
            raw_html: "<div>I am looking for a Freelance Application Developer...</div>",
            text: "I am looking for a Freelance Application Developer...",
            post_url: "https://www.linkedin.com/feed/update/urn:li:activity:7431939142634127360",
            linkedin_id: "urn:li:activity:7431939142634127360",
            timestamp: "2026-02-24T09:09:09.180Z"
        };

        // We need a valid user ID! I will use the one from the logs
        // email: 'abhichauhan1540@gmail.com', id: 'cmlp5rwd00000tm0hi0fswvyx'
        const userId = "cmlp5rwd00000tm0hi0fswvyx";

        console.log('Testing ScrapingService...');
        const result = await ScrapingService.storeScrapedPost(userId, postData);
        console.log('Result:', result);

    } catch (error) {
        console.error('EXCEPTION:', error);
    }
}

test().catch(console.error);
