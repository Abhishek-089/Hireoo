import { google } from 'googleapis'
import { TokenEncryption } from './encryption'
import { prisma } from './prisma'

export class GmailService {
  private static oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  )

  static async getGmailCredentials(userId: string) {
    const credential = await prisma.gmailCredential.findUnique({
      where: { user_id: userId }
    })

    if (!credential) {
      throw new Error('Gmail not connected')
    }

    return credential
  }

  static async getValidAccessToken(userId: string): Promise<string> {
    const credential = await this.getGmailCredentials(userId)

    // Check if token is expired or will expire soon (within 5 minutes)
    const now = new Date()
    const expiryTime = new Date(credential.token_expiry)
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    if (expiryTime <= fiveMinutesFromNow) {
      // Token is expired or expiring soon, refresh it
      return this.refreshAccessToken(userId)
    }

    // Token is still valid, decrypt and return
    return TokenEncryption.decryptToken(credential.access_token)
  }

  static async refreshAccessToken(userId: string): Promise<string> {
    const credential = await this.getGmailCredentials(userId)

    this.oauth2Client.setCredentials({
      refresh_token: TokenEncryption.decryptToken(credential.refresh_token)
    })

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      const newAccessToken = credentials.access_token!
      const newExpiry = new Date((credentials.expiry_date!))

      // Encrypt new token and update database
      const encryptedAccessToken = TokenEncryption.encryptToken(newAccessToken)

      await prisma.gmailCredential.update({
        where: { user_id: userId },
        data: {
          access_token: encryptedAccessToken,
          token_expiry: newExpiry,
          updated_at: new Date(),
        }
      })

      return newAccessToken
    } catch (error) {
      console.error('Error refreshing Gmail token:', error)
      throw new Error('Failed to refresh Gmail access token')
    }
  }

  static async sendEmail(
    userId: string,
    to: string,
    subject: string,
    htmlBody: string,
    textBody?: string
  ) {
    const accessToken = await this.getValidAccessToken(userId)

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    this.oauth2Client.setCredentials({ access_token: accessToken })

    // Create email content
    const emailLines = [
      'To: ' + to,
      'Subject: ' + subject,
      '',
      textBody || htmlBody.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    ]

    const email = emailLines.join('\r\n')

    // Base64 encode the email
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    try {
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      })

      return result.data
    } catch (error) {
      console.error('Error sending Gmail:', error)
      throw new Error('Failed to send email')
    }
  }

  static async revokeConnection(userId: string) {
    try {
      const credential = await this.getGmailCredentials(userId)

      // Revoke the token with Google
      const accessToken = TokenEncryption.decryptToken(credential.access_token)
      this.oauth2Client.setCredentials({ access_token: accessToken })

      await this.oauth2Client.revokeToken(accessToken)

      // Remove from database
      await prisma.gmailCredential.delete({
        where: { user_id: userId }
      })

      // Update user status
      await prisma.user.update({
        where: { id: userId },
        data: { gmail_connected: false }
      })

      return { success: true }
    } catch (error) {
      console.error('Error revoking Gmail connection:', error)
      throw new Error('Failed to revoke Gmail connection')
    }
  }

  static async getConnectionStatus(userId: string) {
    try {
      const credential = await prisma.gmailCredential.findUnique({
        where: { user_id: userId },
        select: {
          email_address: true,
          token_expiry: true,
          scopes: true,
          connected_at: true,
        }
      })

      if (!credential) {
        return { connected: false }
      }

      const now = new Date()
      const isExpired = new Date(credential.token_expiry) <= now

      return {
        connected: true,
        email: credential.email_address,
        expiry: credential.token_expiry,
        scopes: credential.scopes,
        connectedAt: credential.connected_at,
        isExpired,
      }
    } catch (error) {
      console.error('Error getting Gmail status:', error)
      return { connected: false, error: 'Failed to check status' }
    }
  }
  static getAuthUrl(userId: string) {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: userId,
    })
  }

  static async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    return tokens
  }

  static async storeCredentials(
    userId: string,
    emailAddress: string,
    accessToken: string,
    refreshToken: string | undefined,
    expiryDate: number | null | undefined
  ) {
    const encryptedAccessToken = TokenEncryption.encryptToken(accessToken)

    // Prepare update data
    const updateData: any = {
      email_address: emailAddress,
      access_token: encryptedAccessToken,
      updated_at: new Date(),
    }

    if (expiryDate) {
      updateData.token_expiry = new Date(expiryDate)
    }

    if (refreshToken) {
      updateData.refresh_token = TokenEncryption.encryptToken(refreshToken)
    }

    // Check if exists to determine if we can create (need refresh token)
    const existing = await prisma.gmailCredential.findUnique({
      where: { user_id: userId }
    })

    if (!existing) {
      if (!refreshToken) {
        throw new Error('Refresh token required for initial connection')
      }

      await prisma.gmailCredential.create({
        data: {
          user_id: userId,
          email_address: emailAddress,
          access_token: encryptedAccessToken,
          refresh_token: TokenEncryption.encryptToken(refreshToken),
          token_expiry: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 3600 * 1000),
          scopes: []
        }
      })
    } else {
      await prisma.gmailCredential.update({
        where: { user_id: userId },
        data: updateData
      })
    }
  }
}