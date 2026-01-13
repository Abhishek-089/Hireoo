import { google } from 'googleapis'
import { prisma } from './prisma'
import { TokenEncryption } from './encryption'

// Gmail API scopes we need
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
]

export interface GmailCredentials {
  access_token: string
  refresh_token?: string
  expiry_date?: number
  email_address: string
}

export interface EmailDraft {
  id: string
  subject: string
  body: string
  psLine?: string
  toEmail: string
  fromEmail: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export interface GmailMessage {
  id: string
  threadId: string
  labelIds?: string[]
  snippet: string
  payload: any
  internalDate: string
}

export class GmailService {
  /**
   * Get Gmail API client for a user
   */
  private static async getGmailClient(userId: string): Promise<any> {
    // Get user's Gmail credentials
    const credentials = await prisma.gmailCredentials.findUnique({
      where: { user_id: userId },
    })

    if (!credentials) {
      throw new Error('Gmail credentials not found for user')
    }

    // Decrypt tokens before using them with Google APIs
    const decryptedAccessToken = TokenEncryption.decryptToken(credentials.access_token)
    const decryptedRefreshToken = credentials.refresh_token
      ? TokenEncryption.decryptToken(credentials.refresh_token)
      : undefined

    // Check if token is expired and refresh if needed
    const currentTime = Date.now()
    if (credentials.token_expiry && credentials.token_expiry.getTime() < currentTime) {
      if (!decryptedRefreshToken) {
        throw new Error('Access token expired and no refresh token available')
      }

      // Refresh the token (this may throw invalid_grant error)
      try {
        const refreshedCredentials = await this.refreshAccessToken(decryptedRefreshToken)

        // Encrypt and update in database
        const newEncryptedAccessToken = TokenEncryption.encryptToken(
          refreshedCredentials.access_token
        )

        await prisma.gmailCredentials.update({
          where: { user_id: userId },
          data: {
            access_token: newEncryptedAccessToken,
            token_expiry: new Date(refreshedCredentials.expiry_date),
          },
        })

        // Use refreshed (decrypted) token for this client
        return this.createGmailClient(refreshedCredentials.access_token!, decryptedRefreshToken)
      } catch (refreshError: any) {
        // Re-throw invalid_grant errors so they can be caught by sendEmail
        if (refreshError instanceof Error && refreshError.message === 'invalid_grant') {
          throw refreshError
        }
        throw refreshError
      }
    }

    // Create OAuth2 client
    // Create Gmail API client with decrypted tokens
    return this.createGmailClient(decryptedAccessToken, decryptedRefreshToken)
  }

  /**
   * Refresh access token using refresh token
   */
  private static async refreshAccessToken(refreshToken: string): Promise<any> {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })

    try {
      const { credentials } = await oauth2Client.refreshAccessToken()
      return credentials
    } catch (error: any) {
      console.error('Error refreshing access token:', error)

      // Check if it's an invalid_grant error (token expired/revoked)
      const errorMessage = String(error?.message || '').toLowerCase()
      const errorCode = String(error?.code || '').toLowerCase()
      const responseError = String(error?.response?.data?.error || '').toLowerCase()

      if (errorMessage.includes('invalid_grant') ||
        errorCode.includes('invalid_grant') ||
        responseError.includes('invalid_grant')) {
        throw new Error('invalid_grant')
      }

      throw new Error('Failed to refresh Gmail access token')
    }
  }

  /**
   * Helper to create a Gmail client from raw (decrypted) tokens
   */
  private static createGmailClient(accessToken: string, refreshToken?: string): any {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    return google.gmail({ version: 'v1', auth: oauth2Client })
  }

  /**
   * Send email using Gmail API
   */
  static async sendEmail(userId: string, emailDraft: EmailDraft): Promise<{
    messageId: string
    threadId: string
  }> {
    try {
      const gmail = await this.getGmailClient(userId)

      // Create MIME email message
      const mimeMessage = this.createMimeMessage(emailDraft)

      // Encode to base64url
      const encodedMessage = Buffer.from(mimeMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      // Send the email
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      })

      console.log(`Email sent successfully. Message ID: ${response.data.id}`)

      return {
        messageId: response.data.id!,
        threadId: response.data.threadId!,
      }
    } catch (error: any) {
      console.error('Error sending email:', error)

      // Surface invalid_grant explicitly so callers can prompt user to reconnect Gmail
      const rawMessage = String(error?.message || '').toLowerCase()
      const responseError =
        (error?.response?.data?.error as string | undefined)?.toLowerCase() || ''

      if (rawMessage.includes('invalid_grant') || responseError.includes('invalid_grant')) {
        throw new Error('invalid_grant')
      }

      throw new Error('Failed to send email via Gmail API')
    }
  }

  /**
   * Create MIME message for Gmail API
   */
  private static createMimeMessage(emailDraft: EmailDraft): string {
    const rootBoundary = '----=_NextPart_' + Math.random().toString(36).substr(2, 9)
    const altBoundary = '----=_NextPart_' + Math.random().toString(36).substr(2, 9)

    // Combine body and PS line
    let fullBody = emailDraft.body
    if (emailDraft.psLine) {
      fullBody += `\n\nP.S. ${emailDraft.psLine}`
    }

    const parts: string[] = [
      `From: ${emailDraft.fromEmail}`,
      `To: ${emailDraft.toEmail}`,
      `Subject: ${emailDraft.subject}`,
      'MIME-Version: 1.0',
    ]

    // If we have attachments, use multipart/mixed with nested multipart/alternative
    if (emailDraft.attachments && emailDraft.attachments.length > 0) {
      parts.push(`Content-Type: multipart/mixed; boundary="${rootBoundary}"`)
      parts.push('')

      // Add the message body as multipart/alternative
      parts.push(`--${rootBoundary}`)
      parts.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`)
      parts.push('')

      // Plain text part
      parts.push(`--${altBoundary}`)
      parts.push('Content-Type: text/plain; charset=UTF-8')
      parts.push('Content-Transfer-Encoding: 7bit')
      parts.push('')
      parts.push(fullBody)
      parts.push('')

      // HTML part
      parts.push(`--${altBoundary}`)
      parts.push('Content-Type: text/html; charset=UTF-8')
      parts.push('Content-Transfer-Encoding: 7bit')
      parts.push('')
      parts.push(this.convertToHtml(fullBody))
      parts.push('')

      parts.push(`--${altBoundary}--`)
      parts.push('')

      // Add attachments
      for (const attachment of emailDraft.attachments) {
        parts.push(`--${rootBoundary}`)
        parts.push(`Content-Type: ${attachment.contentType}`)
        parts.push('Content-Transfer-Encoding: base64')
        parts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`)
        parts.push('')
        parts.push(attachment.content.toString('base64'))
        parts.push('')
      }

      parts.push(`--${rootBoundary}--`)
    } else {
      // No attachments, use simple multipart/alternative
      parts.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`)
      parts.push('')

      parts.push(`--${altBoundary}`)
      parts.push('Content-Type: text/plain; charset=UTF-8')
      parts.push('Content-Transfer-Encoding: 7bit')
      parts.push('')
      parts.push(fullBody)
      parts.push('')

      parts.push(`--${altBoundary}`)
      parts.push('Content-Type: text/html; charset=UTF-8')
      parts.push('Content-Transfer-Encoding: 7bit')
      parts.push('')
      parts.push(this.convertToHtml(fullBody))
      parts.push('')

      parts.push(`--${altBoundary}--`)
    }

    return parts.join('\r\n')
  }

  /**
   * Convert plain text to basic HTML
   */
  private static convertToHtml(text: string): string {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
  }

  /**
   * Sync Gmail messages for a user (get replies)
   */
  static async syncGmailMessages(userId: string, sinceTimestamp?: number): Promise<void> {
    try {
      const gmail = await this.getGmailClient(userId)

      // Get all threads that have new messages
      const query = sinceTimestamp
        ? `after:${Math.floor(sinceTimestamp / 1000)}`
        : 'newer_than:10m' // Last 10 minutes by default

      const threadsResponse = await gmail.users.threads.list({
        userId: 'me',
        q: query,
        maxResults: 100,
      })

      if (!threadsResponse.data.threads) {
        console.log('No new threads to sync')
        return
      }

      for (const thread of threadsResponse.data.threads) {
        await this.syncThreadMessages(userId, gmail, thread.id!)
      }

      console.log(`Synced ${threadsResponse.data.threads.length} threads for user ${userId}`)
    } catch (error) {
      console.error('Error syncing Gmail messages:', error)
      throw new Error('Failed to sync Gmail messages')
    }
  }

  /**
   * Sync messages in a specific thread
   */
  private static async syncThreadMessages(userId: string, gmail: any, threadId: string): Promise<void> {
    try {
      // Get thread details
      const threadResponse = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
      })

      const thread = threadResponse.data
      const messages = thread.messages || []

      // Get or create thread record
      let emailThread = await prisma.emailThread.findUnique({
        where: {
          user_id_gmail_thread_id: {
            user_id: userId,
            gmail_thread_id: threadId,
          },
        },
      })

      if (!emailThread) {
        // Extract thread information from first message
        const firstMessage = messages[0]
        const subject = this.extractSubject(firstMessage)
        const participants = this.extractParticipants(messages)

        emailThread = await prisma.emailThread.create({
          data: {
            user_id: userId,
            gmail_thread_id: threadId,
            subject,
            participants,
            last_message_at: new Date(parseInt(firstMessage.internalDate!)),
            message_count: messages.length,
          },
        })
      }

      // Process each message in the thread
      for (const message of messages) {
        await this.processMessage(userId, emailThread.id, message)
      }

      // Update thread metadata
      const lastMessage = messages[messages.length - 1]
      await prisma.emailThread.update({
        where: { id: emailThread.id },
        data: {
          last_message_at: new Date(parseInt(lastMessage.internalDate!)),
          message_count: messages.length,
        },
      })

    } catch (error) {
      console.error(`Error syncing thread ${threadId}:`, error)
    }
  }

  /**
   * Process individual message
   */
  private static async processMessage(userId: string, threadId: string, message: GmailMessage): Promise<void> {
    try {
      // Check if message already exists
      const existingMessage = await prisma.emailLog.findFirst({
        where: { gmail_message_id: message.id! },
      })

      if (existingMessage) {
        return // Already processed
      }

      // Extract message details
      const fromEmail = this.extractFromEmail(message)
      const toEmail = this.extractToEmail(message)
      const subject = this.extractSubject(message)
      const direction = this.determineDirection(userId, fromEmail)
      const isReply = this.isReply(message)

      // Create message log
      await prisma.emailLog.create({
        data: {
          user_id: userId,
          gmail_message_id: message.id!,
          thread_id: threadId,
          from_email: fromEmail,
          to_email: toEmail,
          subject,
          snippet: message.snippet || '',
          direction,
          gmail_timestamp: new Date(parseInt(message.internalDate!)),
          is_reply: isReply,
          status: 'received',
        },
      })

    } catch (error) {
      console.error(`Error processing message ${message.id}:`, error)
    }
  }

  /**
   * Extract subject from Gmail message
   */
  private static extractSubject(message: GmailMessage): string {
    const headers = message.payload?.headers || []
    const subjectHeader = headers.find((h: any) => h.name?.toLowerCase() === 'subject')
    return subjectHeader?.value || 'No Subject'
  }

  /**
   * Extract from email from Gmail message
   */
  private static extractFromEmail(message: GmailMessage): string {
    const headers = message.payload?.headers || []
    const fromHeader = headers.find((h: any) => h.name?.toLowerCase() === 'from')
    return fromHeader?.value || ''
  }

  /**
   * Extract to email from Gmail message
   */
  private static extractToEmail(message: GmailMessage): string {
    const headers = message.payload?.headers || []
    const toHeader = headers.find((h: any) => h.name?.toLowerCase() === 'to')
    return toHeader?.value || ''
  }

  /**
   * Determine if message is sent or received
   */
  private static determineDirection(userId: string, fromEmail: string): 'sent' | 'received' {
    // This is a simplified check - in production, you'd get the user's email from credentials
    // For now, assume any message not from the user's domain is received
    // You should enhance this with proper user email lookup
    return fromEmail.includes('@gmail.com') ? 'sent' : 'received'
  }

  /**
   * Check if message is a reply
   */
  private static isReply(message: GmailMessage): boolean {
    const subject = this.extractSubject(message)
    return subject.toLowerCase().startsWith('re:') ||
      subject.toLowerCase().includes('reply')
  }

  /**
   * Extract all participants from thread messages
   */
  private static extractParticipants(messages: GmailMessage[]): string[] {
    const participants = new Set<string>()

    for (const message of messages) {
      const fromEmail = this.extractFromEmail(message)
      const toEmail = this.extractToEmail(message)

      if (fromEmail) participants.add(fromEmail)
      if (toEmail) participants.add(toEmail)
    }

    return Array.from(participants)
  }

  /**
   * Send email and log it to database
   */
  static async sendEmailWithGmail(
    userId: string,
    emailDraftId: string,
    hrEmail: string
  ): Promise<{
    success: boolean
    messageId?: string
    threadId?: string
    error?: string
  }> {
    try {
      // Get email draft
      const emailDraft = await prisma.emailDraft.findUnique({
        where: { id: emailDraftId },
        include: {
          user: {
            select: { email: true },
          },
        },
      })

      if (!emailDraft) {
        return { success: false, error: 'Email draft not found' }
      }

      if (emailDraft.user_id !== userId) {
        return { success: false, error: 'Unauthorized' }
      }

      // Get user's Gmail credentials
      const credentials = await prisma.gmailCredentials.findUnique({
        where: { user_id: userId },
        select: { email_address: true },
      })

      if (!credentials) {
        return { success: false, error: 'Gmail credentials not found' }
      }

      // Prepare email data
      const emailData = {
        id: emailDraft.id,
        subject: emailDraft.subject,
        body: emailDraft.body,
        psLine: emailDraft.ps_line || undefined,
        toEmail: hrEmail,
        fromEmail: credentials.email_address,
      }

      // Send email
      const { messageId, threadId } = await this.sendEmail(userId, emailData)

      // Create thread if it doesn't exist
      let emailThread = await prisma.emailThread.findFirst({
        where: {
          user_id: userId,
          gmail_thread_id: threadId,
        },
      })

      if (!emailThread) {
        emailThread = await prisma.emailThread.create({
          data: {
            user_id: userId,
            gmail_thread_id: threadId,
            subject: emailDraft.subject,
            participants: [credentials.email_address, hrEmail],
            last_message_at: new Date(),
            message_count: 1,
          },
        })
      }

      // Log the sent email
      await prisma.emailLog.create({
        data: {
          user_id: userId,
          email_draft_id: emailDraftId,
          gmail_message_id: messageId,
          thread_id: emailThread.id,
          from_email: credentials.email_address,
          to_email: hrEmail,
          subject: emailDraft.subject,
          snippet: emailDraft.body.substring(0, 100) + '...',
          direction: 'sent',
          status: 'sent',
          gmail_timestamp: new Date(),
        },
      })

      // Update email draft status
      await prisma.emailDraft.update({
        where: { id: emailDraftId },
        data: {
          status: 'sent',
          used: true,
        },
      })

      return {
        success: true,
        messageId,
        threadId,
      }
    } catch (error) {
      console.error('Error sending email with Gmail:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}


