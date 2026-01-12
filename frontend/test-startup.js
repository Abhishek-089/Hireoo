// Quick test to see what's blocking
console.log('1. Starting test...')

console.log('2. Loading prisma...')
const { prisma } = require('./src/lib/prisma.ts')
console.log('3. Prisma loaded')

console.log('4. Loading auth...')
const { authOptions } = require('./src/lib/auth.ts')
console.log('5. Auth loaded')

console.log('6. Test complete - no blocking found')

