import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, subject, message } = await request.json()

    // Basic validation
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: "First name, email, and message are required." },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    const user = process.env.CONTACT_GMAIL_USER
    const pass = process.env.CONTACT_GMAIL_APP_PASSWORD

    if (!user || !pass) {
      console.error("[Contact] Gmail credentials not configured in environment variables.")
      return NextResponse.json(
        { error: "Email service is not configured. Please reach us directly at hireooai@gmail.com" },
        { status: 503 }
      )
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    })

    const fullName = `${firstName} ${lastName || ""}`.trim()

    // Email to you (Hireoo inbox)
    await transporter.sendMail({
      from: `"Hireoo Contact Form" <${user}>`,
      to: "hireooai@gmail.com",
      replyTo: email,
      subject: subject ? `[Contact] ${subject}` : `[Contact] New message from ${fullName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #1e1b4b; margin-bottom: 4px;">New Contact Form Submission</h2>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">Someone reached out via the Hireoo contact page.</p>

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; width: 120px; background: #f9fafb;">Name</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #111827; font-weight: 500;">${fullName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; background: #f9fafb;">Email</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #4f46e5;">${email}</td>
            </tr>
            ${subject ? `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; background: #f9fafb;">Subject</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #111827;">${subject}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; background: #f9fafb; vertical-align: top;">Message</td>
              <td style="padding: 12px 16px; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-line;">${message}</td>
            </tr>
          </table>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
            Reply directly to this email to respond to ${fullName}.
          </p>
        </div>
      `,
    })

    // Auto-reply to the person who contacted
    await transporter.sendMail({
      from: `"Hireoo" <${user}>`,
      to: email,
      subject: "We got your message — Hireoo",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e1b4b;">Hi ${firstName}, thanks for reaching out!</h2>
          <p style="color: #374151; line-height: 1.6;">
            We've received your message and will get back to you within one business day.
          </p>
          ${subject ? `<p style="color: #6b7280; font-size: 14px;"><strong>Your subject:</strong> ${subject}</p>` : ""}
          <p style="color: #374151; line-height: 1.6;">
            In the meantime, feel free to check out the
            <a href="https://hireoo.com/features" style="color: #4f46e5;">features page</a>
            or follow us on
            <a href="https://x.com/HireooAI" style="color: #4f46e5;">X (@HireooAI)</a>.
          </p>
          <p style="color: #374151;">— The Hireoo Team 🇮🇳</p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated confirmation. Please don't reply to this email directly —
            our team will reach out from hireooai@gmail.com.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Contact] Failed to send email:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email us directly at hireooai@gmail.com" },
      { status: 500 }
    )
  }
}
