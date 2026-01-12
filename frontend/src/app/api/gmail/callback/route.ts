import { NextRequest, NextResponse } from "next/server"
import { GmailService } from "@/lib/gmail"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This should be the user ID
    const error = searchParams.get('error')

    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(
        new URL('/dashboard/email-settings?error=oauth_failed', request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/email-settings?error=missing_params', request.url)
      )
    }

    // Verify that the state (user ID) is valid
    const user = await prisma.user.findUnique({
      where: { id: state }
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/dashboard/email-settings?error=invalid_user', request.url)
      )
    }

    // Exchange authorization code for tokens
    const tokens = await GmailService.getTokensFromCode(code)

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL('/dashboard/email-settings?error=no_access_token', request.url)
      )
    }

    // Get user profile to verify email
    const tempAuth = new (await import('googleapis')).google.auth.OAuth2()
    tempAuth.setCredentials({ access_token: tokens.access_token })

    const gmail = (await import('googleapis')).google.gmail({
      version: 'v1',
      auth: tempAuth
    })

    const profile = await gmail.users.getProfile({ userId: 'me' })
    const emailAddress = profile.data.emailAddress!

    // Store the credentials
    await GmailService.storeCredentials(
      state,
      emailAddress,
      tokens.access_token,
      tokens.refresh_token || undefined,
      tokens.expiry_date
    )

    // Update user's gmail_connected status
    await prisma.user.update({
      where: { id: state },
      data: { gmail_connected: true }
    })

    // Redirect back to email settings with success
    return NextResponse.redirect(
      new URL('/dashboard/email-settings?success=connected', request.url)
    )
  } catch (error) {
    console.error("Gmail callback error:", error)
    return NextResponse.redirect(
      new URL('/dashboard/email-settings?error=callback_failed', request.url)
    )
  }
}
