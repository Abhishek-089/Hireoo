import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GmailService, EmailDraft as GmailEmailDraft } from "@/lib/gmail-service"

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scrapedPostId, coverLetter, hrEmail } = await request.json()

    if (!scrapedPostId || typeof scrapedPostId !== "string") {
      return NextResponse.json(
        { error: "scrapedPostId is required" },
        { status: 400 }
      )
    }

    if (!coverLetter || typeof coverLetter !== "string") {
      return NextResponse.json(
        { error: "coverLetter is required" },
        { status: 400 }
      )
    }

    if (!hrEmail || typeof hrEmail !== "string" || !isValidEmail(hrEmail)) {
      return NextResponse.json(
        { error: "Valid hrEmail is required" },
        { status: 400 }
      )
    }

    // Ensure user has a resume (same requirement as /api/scraping/apply)
    const [user, resume] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { resume_uploaded: true },
      }),
      prisma.resume.findFirst({
        where: { user_id: session.user.id },
        orderBy: { created_at: "desc" },
      }),
    ])

    if (!resume && !user?.resume_uploaded) {
      return NextResponse.json(
        { error: "Resume required", code: "RESUME_REQUIRED" },
        { status: 409 }
      )
    }

    // Ensure Gmail is connected and get from-email
    const credentials = await prisma.gmailCredentials.findUnique({
      where: { user_id: session.user.id },
      select: { email_address: true },
    })

    if (!credentials) {
      return NextResponse.json(
        { error: "Gmail not connected", code: "GMAIL_NOT_CONNECTED" },
        { status: 409 }
      )
    }

    const subject = "Regarding your hiring post on LinkedIn"

    // Prepare email body (no need to append resume URL since we'll attach it)
    const finalBody = coverLetter

    // Download resume PDF from Cloudinary if available
    const attachments: Array<{
      filename: string
      content: Buffer
      contentType: string
    }> = []

    if (resume?.file_url) {
      try {
        const resumeResponse = await fetch(resume.file_url)
        if (resumeResponse.ok) {
          const resumeBuffer = Buffer.from(await resumeResponse.arrayBuffer())
          const fileName = resume.file_name || resume.file_url.split('/').pop() || 'resume.pdf'
          attachments.push({
            filename: fileName,
            content: resumeBuffer,
            contentType: 'application/pdf',
          })
        } else {
          console.warn(`Failed to download resume from ${resume.file_url}: ${resumeResponse.statusText}`)
        }
      } catch (error) {
        console.error('Error downloading resume for attachment:', error)
        // Continue without attachment if download fails
      }
    }

    const emailDraft: GmailEmailDraft = {
      id: `scraped-${scrapedPostId}-${Date.now()}`,
      subject,
      body: finalBody,
      toEmail: hrEmail,
      fromEmail: credentials.email_address,
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    const { messageId, threadId } = await GmailService.sendEmail(
      session.user.id,
      emailDraft
    )

    // Persist application record for analytics and history
    await prisma.scrapedApplication.create({
      data: {
        user_id: session.user.id,
        scraped_post_id: scrapedPostId,
        hr_email: hrEmail,
        cover_letter: finalBody,
        sent_at: new Date(),
        gmail_message_id: messageId || null,
        gmail_thread_id: threadId || null,
      },
    })

    // Mark the ScrapedPostMatch as applied (if it exists)
    await prisma.scrapedPostMatch.updateMany({
      where: {
        user_id: session.user.id,
        scraped_post_id: scrapedPostId,
      },
      data: {
        applied: true,
        applied_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      messageId,
      threadId,
    })
  } catch (error) {
    console.error("Scraping send-application API error:", error)

    // If Gmail tokens are invalid or revoked, prompt user to reconnect
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
    if (errorMessage.includes("invalid_grant")) {
      return NextResponse.json(
        { error: "Gmail access has expired or been revoked. Please reconnect Gmail.", code: "GMAIL_RECONNECT" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}


