// Test the calculateResetTime function
const now = new Date()
console.log('Current time (UTC):', now.toISOString())
console.log('Current time (IST):', now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))

// Get current time in IST
const userTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
console.log('\nUser time object:', userTime.toISOString())

// Calculate next midnight in user's timezone
const nextMidnight = new Date(userTime)
nextMidnight.setHours(24, 0, 0, 0)
console.log('Next midnight (user timezone):', nextMidnight.toISOString())

// Convert back to UTC for storage
const utcOffset = now.getTimezoneOffset() * 60000
const userOffset = userTime.getTime() - now.getTime()
const resetTime = new Date(nextMidnight.getTime() - userOffset + utcOffset)

console.log('\nCalculated reset time (UTC):', resetTime.toISOString())
console.log('Calculated reset time (IST):', resetTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
console.log('\nHours until reset:', ((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60)).toFixed(2))
