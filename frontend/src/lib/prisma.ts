import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Store the singleton on globalThis so it survives Next.js hot reloads in dev
// and is reused across invocations where the module cache is preserved.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.warn('⚠️  DATABASE_URL is not set. Database features will not work.')
    return new PrismaClient({ log: [] }) as any
  }

  try {
    // Keep the pool small — Supabase Session mode caps total connections at
    // pool_size (typically 15 on the free tier). Use max:2 so multiple
    // concurrent Next.js server functions don't exhaust the limit.
    const pool = new Pool({
      connectionString,
      max: 2,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      allowExitOnIdle: true,
    })

    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter, log: [] } as any)
  } catch (error) {
    console.error('Failed to initialize Prisma client with adapter, falling back:', error)
    return new PrismaClient({ log: [] } as any)
  }
}

// Always use the global singleton — this is the correct pattern for both
// Next.js dev (prevents re-creating pools on hot reload) and production
// (reuses across requests within the same lambda warm instance).
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient())
