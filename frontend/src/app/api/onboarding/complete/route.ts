import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Update user's onboarding_step to 7 (complete)
        await prisma.user.update({
            where: { id: session.user.id },
            data: { onboarding_step: 7 }
        })

        return NextResponse.json({
            success: true,
            message: "Onboarding marked as complete"
        })
    } catch (error) {
        console.error("Complete onboarding error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
