import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

/**
 * Helper to get user ID from either session (cookie) or Bearer token (extension)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    // Try Bearer token first (from extension)
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        try {
            // Decode JWT (Node.js compatible version)
            const base64Url = token.split('.')[1]
            if (!base64Url) return null

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            // Add padding if needed
            const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
            const jsonPayload = Buffer.from(padded, 'base64').toString('utf-8')
            const payload = JSON.parse(jsonPayload)

            // Check if token is expired
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                console.warn('[API Auth] Token expired')
                return null
            }

            return payload.id || null
        } catch (error) {
            console.error('[API Auth] Failed to decode Bearer token:', error)
            return null
        }
    }

    // Fallback to session (cookie-based)
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
}
