import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    // Validate parameters
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      )
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: "Offset must be non-negative" },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { user_id: session.user.id }
    if (activeOnly) {
      where.is_active = true
    }

    // Get email threads
    const [threads, totalCount] = await Promise.all([
      prisma.emailThread.findMany({
        where,
        orderBy: { last_message_at: 'desc' },
        take: limit,
        skip: offset,
        include: {
          messages: {
            orderBy: { sent_at: 'asc' },
            select: {
              id: true,
              from_email: true,
              to_email: true,
              subject: true,
              snippet: true,
              direction: true,
              sent_at: true,
              is_reply: true,
              status: true,
            },
            take: 5, // Last 5 messages for preview
          },
          _count: {
            select: { messages: true }
          }
        }
      }),
      prisma.emailThread.count({ where })
    ])

    return NextResponse.json({
      threads: threads.map(thread => ({
        id: thread.id,
        gmailThreadId: thread.gmail_thread_id,
        subject: thread.subject,
        participants: thread.participants,
        lastMessageAt: thread.last_message_at,
        messageCount: thread._count.messages,
        isActive: thread.is_active,
        createdAt: thread.created_at,
        updatedAt: thread.updated_at,
        recentMessages: thread.messages,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    })

  } catch (error) {
    console.error("Get email threads API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


