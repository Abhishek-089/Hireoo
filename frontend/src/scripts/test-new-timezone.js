// Test the NEW calculateResetTime function
const now = new Date()
console.log('Current time (UTC):', now.toISOString())
console.log('Current time (IST):', now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))

// IST offset: +5 hours 30 minutes = 330 minutes = 19800000 milliseconds
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

// Get current time in IST
const nowIST = new Date(now.getTime() + IST_OFFSET_MS)
console.log('\nCurrent time + IST offset:', nowIST.toISOString())

// Get today's date in IST
const year = nowIST.getUTCFullYear()
const month = nowIST.getUTCMonth()
const day = nowIST.getUTCDate()

console.log(`Date in IST: ${year}-${month + 1}-${day}`)

// Create tomorrow midnight in IST (as UTC)
const tomorrowMidnightIST = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0))
console.log('\nTomorrow midnight (as UTC):', tomorrowMidnightIST.toISOString())

// Convert back to UTC by subtracting the IST offset
const tomorrowMidnightUTC = new Date(tomorrowMidnightIST.getTime() - IST_OFFSET_MS)

console.log('\n=== RESULT ===')
console.log('Reset time (UTC):', tomorrowMidnightUTC.toISOString())
console.log('Reset time (IST):', tomorrowMidnightUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
console.log('Hours until reset:', ((tomorrowMidnightUTC.getTime() - now.getTime()) / (1000 * 60 * 60)).toFixed(2))
