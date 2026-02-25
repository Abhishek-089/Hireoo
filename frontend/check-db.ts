import { prisma } from "./src/lib/prisma";
async function main() {
    const posts = await prisma.scrapedPost.count();
    const matches = await prisma.scrapedPostMatch.count();
    console.log("Posts count:", posts);
    console.log("Matches count:", matches);
}
main().finally(() => prisma.$disconnect());
