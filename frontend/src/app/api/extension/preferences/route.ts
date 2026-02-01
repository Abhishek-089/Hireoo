import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                skills: true,
                preferred_job_titles: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Combine skills and job titles into a search string
        // Limit to reasonable number of keywords to avoid spamming search
        const keywords = [
            ...(user.preferred_job_titles || []),
            ...(user.skills || [])
        ].slice(0, 5).join(" ")

        // Fallback if no keywords found
        const finalKeywords = keywords.length > 0 ? keywords : "freelance developer project"

        return NextResponse.json({
            keywords: finalKeywords,
            preferences: {
                skills: user.skills,
                titles: user.preferred_job_titles
            }
        })
    } catch (error) {
        console.error("Extension preferences error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
