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

        const { installed } = await request.json()

        if (typeof installed !== 'boolean') {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            )
        }

        // Update user's extension_installed status
        await prisma.user.update({
            where: { id: session.user.id },
            data: { extension_installed: installed },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Extension status update error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
