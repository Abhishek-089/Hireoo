import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GmailService } from "@/lib/gmail"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { to } = await request.json()

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      )
    }

    // Send test email
    const result = await GmailService.sendEmail(
      session.user.id,
      to,
      "Hireoo Test Email",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Hireoo Test Email</h2>
          <p>Hi there!</p>
          <p>This is a test email from Hireoo to verify your Gmail integration is working correctly.</p>
          <p>If you received this email, your Gmail connection is successfully configured and ready to send personalized cold emails.</p>
          <br>
          <p>Best regards,<br>The Hireoo Team</p>
        </div>
      `,
      `Hi there!

This is a test email from Hireoo to verify your Gmail integration is working correctly.

If you received this email, your Gmail connection is successfully configured and ready to send personalized cold emails.

Best regards,
The Hireoo Team`
    )

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.id
    })
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { error: "Failed to send test email. Please check your Gmail connection." },
      { status: 500 }
    )
  }
}