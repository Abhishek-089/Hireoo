#!/usr/bin/env tsx

/**
 * Queue Processor Script
 * Run this script to process AI extraction jobs from the BullMQ queue
 *
 * Usage:
 * npm run process-queue
 * or
 * npx tsx src/scripts/process-queue.ts
 */

import { initializeWorkers } from '../lib/queue'

// Initialize all workers
initializeWorkers()

console.log('🚀 Queue Processor Started')
console.log('📋 Processing jobs from all queues...')
console.log('📋 Processing jobs from ai_extraction queue...')
console.log('⏹️  Press Ctrl+C to stop')

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down queue processor...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down queue processor...')
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})


