import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/api-auth'
import { DailyLimitService } from '@/lib/daily-limit-service'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * GET /api/scraping/daily-limit
 * Returns current daily limit status for the authenticated user.
 * CORS headers are included so the Chrome extension can call this endpoint.
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request)

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401, headers: corsHeaders }
            )
        }

        const [limitInfo, tier] = await Promise.all([
            DailyLimitService.getDailyLimitInfo(userId),
            DailyLimitService.getSubscriptionTier(userId)
        ])

        return NextResponse.json({
            success: true,
            data: {
                ...limitInfo,
                tier: tier.name
            }
        }, { headers: corsHeaders })
    } catch (error) {
        console.error('Error fetching daily limit:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500, headers: corsHeaders }
        )
    }
}
