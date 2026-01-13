import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a connection pool for PostgreSQL - lazy initialization
let prismaInstance: PrismaClient | null = null
let poolInstance: Pool | null = null

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (prismaInstance) {
    return prismaInstance
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.warn('⚠️  DATABASE_URL environment variable is not set. Database features will not work.')
    prismaInstance = new PrismaClient({ log: [] }) as any
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance as PrismaClient
    }
    return prismaInstance as PrismaClient
  }

  try {
    // Create pool with connection timeout and don't connect immediately
    poolInstance = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000, // 2 second timeout
      idleTimeoutMillis: 30000,
      max: 10,
      // Don't connect on pool creation
      allowExitOnIdle: true,
    })

    // Don't test connection on startup
    const adapter = new PrismaPg(poolInstance)
    prismaInstance = new PrismaClient({
      // Prisma 7+ uses `adapter` and reads the datasource URL from `prisma.config.ts`
      adapter,
      log: [], // Disable query logging for faster startup
    } as any)

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance as PrismaClient
    }

    return prismaInstance as PrismaClient
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error)
    // Fallback to regular client without adapter
    prismaInstance = new PrismaClient({
      log: [],
    } as any)
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance as PrismaClient
    }
    return prismaInstance as PrismaClient
  }
}

// Export as a getter to ensure lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const client = getPrismaClient()
    const value = client[prop as keyof PrismaClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})
