
import 'dotenv/config'
import { Redis } from '@upstash/redis'

async function main() {
    console.log("Checking Redis Connection to: " + process.env.UPSTASH_REDIS_REST_URL)

    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    try {
        await redis.set('foo', 'bar')
        const data = await redis.get('foo')
        console.log("Redis test success! Value:", data)
    } catch (error) {
        console.error("Redis connection failed:", error)
    }
}

main()
