
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch all applications (where we sent an email)
    const applications = await prisma.scrapedApplication.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        scrapedPost: {
          select: {
            post_url: true,
            text: true,
            job: {
              select: {
                company: true,
                title: true,
                location: true,
              }
            }
          }
        }
      },
      orderBy: {
        sent_at: 'desc'
      }
    })

    // 2. Get thread IDs
    const threadIds = applications
      .map((app: any) => app.gmail_thread_id)
      .filter((id: any): id is string => !!id)

    // 3. Fetch threads with messages
    const threads = await prisma.emailThread.findMany({
      where: {
        user_id: session.user.id,
        gmail_thread_id: {
          in: threadIds
        }
      },
      include: {
        messages: {
          orderBy: {
            gmail_timestamp: 'asc'
          }
        }
      }
    })

    // 4. Combine data
    const activityData = applications.map((app: any) => {
      const thread = threads.find((t: any) => t.gmail_thread_id === app.gmail_thread_id)

      // Determine statuc
      let status = 'sent'
      if (thread) {
        const hasReply = thread.messages.some((m: any) => m.direction === 'received')
        if (hasReply) status = 'replied'
      }

      // Create a synthetic message for the sent application (cover letter)
      const sentMessage = {
        id: `sent-${app.id}`,
        gmail_message_id: app.gmail_message_id || `sent-${app.id}`,
        thread_id: app.gmail_thread_id,
        from_email: session.user.email,
        to_email: app.hr_email,
        subject: "Full-Stack Developer Application", // Fallback if no thread subject
        snippet: app.cover_letter, // Store full body here for UI simplicity, though field is named snippet
        body: app.cover_letter, // Custom field we'll use in UI
        direction: 'sent',
        gmail_timestamp: app.sent_at,
        is_reply: false,
        status: 'sent'
      }

      // Combine with actual thread messages, removing duplicates if we logged the sent email
      // My seed script only logs the Reply, so we are safe to prepend.
      // But if sync script ran, it might have logged the sent email too with a snippet.
      // We prefer our synthetic one because it has the FULL cover letter.

      let messages = [sentMessage]

      if (thread) {
        // Filter out sent messages that match our application ID to avoid duplication if logged
        // Or just append received messages. 
        // Realistically, if sync runs, we might have a 'sent' log with a short snippet.
        // We should dedupe based on timestamp or message ID if possible.
        // For now, let's just add all and UI can handle, or just add non-sent messages?
        // No, we want to show subsequent sent messages (follow-ups).

        // Let's just exclude 'sent' messages that are very close to sent_at?
        // Or simplistic approach: Since we are in dev/mock, assume we want all thread messages appearing AFTER our initial send.

        const threadMessages = thread.messages
          .filter((m: any) => {
            // Filter out message if it has same ID as app message ID (if we logged it perfectly)
            if (app.gmail_message_id && m.gmail_message_id === app.gmail_message_id) return false
            return true
          })
          .map((m: any) => ({
            ...m,
            body: m.snippet // Map snippet to body for consistent type
          }))

        messages = [...messages, ...threadMessages]

        // Re-sort just in case
        messages.sort((a: any, b: any) => new Date(a.gmail_timestamp).getTime() - new Date(b.gmail_timestamp).getTime())
      }

      return {
        id: app.id,
        appliedAt: app.sent_at,
        hrEmail: app.hr_email,
        job: {
          title: app.scrapedPost.job?.title || "Unknown Position",
          company: app.scrapedPost.job?.company || "Unknown Company",
          url: app.scrapedPost.post_url
        },
        thread: {
          ...thread,
          messages: messages
        },
        status
      }
    })

    return NextResponse.json(activityData)

  } catch (error) {
    console.error("Error fetching email activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
