
import { prisma } from '../lib/prisma'

async function verifyPrisma() {
    try {
        const user = await prisma.user.findFirst({
            select: {
                linkedin_connected: true
            }
        })
        console.log('Successfully queried linkedin_connected:', user?.linkedin_connected ?? 'null')
    } catch (error) {
        console.error('Prisma verification failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

verifyPrisma()
