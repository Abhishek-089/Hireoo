# Gmail Email Sending & Sync System

Complete email automation system using Gmail API for sending personalized cold emails and syncing replies.

## Overview

The email sending system provides:

1. **Gmail API Integration**: Send emails using user's Gmail account
2. **MIME Email Building**: Professional email formatting with HTML/text
3. **Reply Synchronization**: Automatic tracking of email responses
4. **Thread Management**: Organized conversation tracking
5. **Queue Processing**: Asynchronous email operations
6. **Database Logging**: Complete email history and analytics

## Architecture

### Core Components

```
Email Sending Pipeline:
├── Gmail Service → Google API integration
├── Queue System → BullMQ async processing
├── Database → EmailLog and EmailThread storage
├── API Endpoints → Email sending and management
└── Sync Worker → Automatic reply detection
```

### Data Flow

1. **Draft Creation** → User generates AI email draft
2. **Email Sending** → `sendEmailWithGmail()` sends via Gmail API
3. **Message Logging** → Email stored in database with Gmail message ID
4. **Reply Sync** → Background worker checks for responses every 10 minutes
5. **Thread Tracking** → Conversations organized by Gmail thread ID
6. **Status Updates** → Real-time email status tracking

## Database Schema

### EmailLog Model

```prisma
model EmailLog {
  id              String    @id @default(cuid())
  user_id         String
  email_draft_id  String?   // Reference to EmailDraft if sent from our system
  gmail_message_id String   // Gmail API message ID
  thread_id       String    // Gmail thread ID
  from_email      String
  to_email        String
  subject         String
  snippet         String    // Gmail message snippet
  direction       String    // 'sent' or 'received'
  sent_at         DateTime  @default(now())
  gmail_timestamp DateTime  // Original Gmail timestamp
  is_reply        Boolean   @default(false)
  status          String    @default("sent") // sent, delivered, failed, replied

  user User       @relation(fields: [user_id], references: [id], onDelete: Cascade)
  emailDraft      EmailDraft? @relation(fields: [email_draft_id], references: [id])
  thread          EmailThread @relation(fields: [thread_id], references: [id])

  @@index([user_id, sent_at])
  @@index([gmail_message_id])
  @@index([thread_id])
  @@index([direction])
  @@index([status])
}
```

### EmailThread Model

```prisma
model EmailThread {
  id              String    @id @default(cuid())
  user_id         String
  gmail_thread_id String   // Gmail API thread ID
  subject         String
  participants    String[] // Array of email addresses in thread
  last_message_at DateTime
  message_count   Int       @default(0)
  is_active       Boolean   @default(true) // Whether thread is still active
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  user User       @relation(fields: [user_id], references: [id], onDelete: Cascade)
  messages        EmailLog[]

  @@unique([user_id, gmail_thread_id])
  @@index([user_id, last_message_at])
  @@index([is_active])
}
```

## Gmail API Integration

### Authentication & Authorization

**OAuth 2.0 Flow:**
- Uses existing Gmail credentials from `GmailCredentials` table
- Automatic token refresh when expired
- Full Gmail API scopes: `send`, `readonly`, `modify`

**Token Management:**
```typescript
// Automatic refresh when needed
if (credentials.token_expiry < Date.now()) {
  const newTokens = await refreshAccessToken(credentials.refresh_token)
  await updateCredentials(newTokens)
}
```

### Email Sending

**MIME Message Construction:**
```typescript
const mimeMessage = [
  `From: ${fromEmail}`,
  `To: ${toEmail}`,
  `Subject: ${subject}`,
  'MIME-Version: 1.0',
  'Content-Type: multipart/alternative; boundary=boundary',
  '',
  '--boundary',
  'Content-Type: text/plain; charset=UTF-8',
  '',
  emailBody,
  '',
  '--boundary',
  'Content-Type: text/html; charset=UTF-8',
  '',
  convertToHtml(emailBody),
  '',
  '--boundary--'
].join('\r\n')
```

**Gmail API Call:**
```typescript
const response = await gmail.users.messages.send({
  userId: 'me',
  requestBody: {
    raw: base64EncodedMimeMessage
  }
})
```

### Reply Synchronization

**Sync Process:**
1. Query Gmail for recent threads (`newer_than:10m`)
2. Fetch thread messages using `gmail.users.threads.get()`
3. Process each message and create/update EmailLog records
4. Update EmailThread metadata (participant count, last message time)
5. Mark threads as active/inactive based on recent activity

**Reply Detection:**
```typescript
const isReply = message.payload.headers
  .find(h => h.name.toLowerCase() === 'subject')
  ?.value.toLowerCase().startsWith('re:')
```

## Queue System

### Gmail Sync Queue

**Queue Name:** `gmail_sync`

**Job Data:**
```typescript
{
  userId: string,
  sinceTimestamp?: number  // Optional: sync from specific time
}
```

**Worker Configuration:**
```typescript
gmailSyncWorker = new Worker(QUEUE_NAMES.GMAIL_SYNC, {
  concurrency: 3,  // Process multiple users simultaneously
})
```

### Scheduled Sync

**Cron Job Setup:**
```bash
# Run every 10 minutes
*/10 * * * * cd /path/to/project && npm run sync-gmail
```

**Sync Script Features:**
- Processes all users with Gmail credentials
- Respects rate limits and avoids duplicate syncs
- Random delays to distribute API load
- Comprehensive error handling and logging

## API Endpoints

### POST `/api/email/send`

Send email draft via Gmail API.

**Request:**
```json
{
  "emailDraftId": "draft-123",
  "hrEmail": "hr@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "gmail-message-id",
  "threadId": "gmail-thread-id"
}
```

### GET `/api/email/logs`

Get user's email logs with pagination.

**Query Parameters:**
- `limit`: Number of logs (1-100, default: 50)
- `offset`: Pagination offset (default: 0)
- `direction`: Filter by 'sent' or 'received'
- `threadId`: Filter by specific thread

**Response:**
```json
{
  "logs": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET `/api/email/threads`

Get user's email threads.

**Query Parameters:**
- `limit`: Number of threads (1-50, default: 20)
- `offset`: Pagination offset (default: 0)
- `activeOnly`: Filter only active threads (default: false)

**Response:**
```json
{
  "threads": [
    {
      "id": "thread-123",
      "gmailThreadId": "gmail-thread-id",
      "subject": "Senior Developer Position",
      "participants": ["user@gmail.com", "hr@company.com"],
      "lastMessageAt": "2024-01-15T10:30:00Z",
      "messageCount": 3,
      "isActive": true,
      "recentMessages": [...]
    }
  ],
  "pagination": { "total": 25, "limit": 20, "offset": 0, "hasMore": true }
}
```

### POST `/api/email/sync`

Trigger Gmail synchronization.

**Request:**
```json
{
  "sinceTimestamp": 1705123200000  // Optional: sync from specific time
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gmail sync queued successfully",
  "queued": true
}
```

## Core Functions

### `sendEmailWithGmail(userId, emailDraftId, hrEmail)`

Main email sending function:

```typescript
const result = await GmailService.sendEmailWithGmail(userId, emailDraftId, hrEmail)
// Returns: { success: boolean, messageId?: string, threadId?: string, error?: string }
```

**Process:**
1. Validates user and draft ownership
2. Retrieves Gmail credentials and checks validity
3. Constructs MIME email from draft
4. Sends via Gmail API
5. Creates EmailThread if doesn't exist
6. Logs EmailLog entry
7. Updates EmailDraft status to 'sent'

### Gmail Sync Worker

Background worker that processes sync jobs:

```typescript
// Triggered every 10 minutes for all users
await GmailService.syncGmailMessages(userId, sinceTimestamp)
```

**Features:**
- Incremental sync using timestamps
- Thread-based message organization
- Duplicate message prevention
- Automatic thread lifecycle management
- Comprehensive error handling

## Usage Examples

### Send Email Draft

```typescript
// From email draft interface
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailDraftId: 'draft-123',
    hrEmail: 'sarah.johnson@google.com'
  })
})

const result = await response.json()
if (result.success) {
  console.log('Email sent!', result.messageId)
}
```

### Get Email Activity

```typescript
// Get recent email activity
const logs = await fetch('/api/email/logs?limit=20&direction=sent')
const data = await logs.json()

// Show sent emails and their status
data.logs.forEach(log => {
  console.log(`${log.subject} → ${log.status}`)
})
```

### Monitor Conversations

```typescript
// Get active email threads
const threads = await fetch('/api/email/threads?activeOnly=true')
const data = await threads.json()

// Display conversation overview
data.threads.forEach(thread => {
  console.log(`${thread.subject}: ${thread.messageCount} messages`)
})
```

## Security & Privacy

### Data Protection

- **Encrypted Tokens**: Gmail OAuth tokens stored encrypted
- **User Isolation**: All data scoped to authenticated user
- **API Rate Limiting**: Respect Gmail API quotas
- **Secure Headers**: Proper CORS and security headers

### Compliance

- **OAuth Consent**: Users explicitly authorize Gmail access
- **Data Minimization**: Only store necessary email metadata
- **Audit Logging**: Complete activity tracking
- **User Control**: Users can revoke access anytime

## Performance Optimization

### Efficiency Measures

- **Batch Processing**: Multiple sync operations in single job
- **Incremental Sync**: Only process new messages since last sync
- **Connection Pooling**: Reuse Gmail API connections
- **Caching**: User credentials cached in memory
- **Async Operations**: Non-blocking email operations

### Monitoring

```typescript
// Queue health monitoring
const queueStats = await gmailSyncQueue.getJobCounts()
// { waiting: 2, active: 1, completed: 45, failed: 1 }

// Email sending success rate
const sentEmails = await prisma.emailLog.count({
  where: { direction: 'sent', status: 'sent' }
})
const totalEmails = await prisma.emailLog.count({
  where: { direction: 'sent' })
})
const successRate = (sentEmails / totalEmails) * 100
```

## Error Handling

### Common Issues

- **Token Expiration**: Automatic refresh with fallback error
- **API Quotas**: Exponential backoff and user notification
- **Network Issues**: Retry logic with circuit breaker pattern
- **Invalid Emails**: Input validation and user feedback
- **Gmail Errors**: Detailed error messages and recovery suggestions

### Recovery Strategies

- **Failed Sends**: Queue for retry with different priority
- **Sync Failures**: Partial success logging and continuation
- **Connection Issues**: Graceful degradation and user alerts
- **Data Corruption**: Validation and repair mechanisms

## Future Enhancements

### Advanced Features

- **Email Templates**: Pre-built templates for different industries
- **A/B Testing**: Test different email versions for better response rates
- **Smart Scheduling**: Optimal send times based on recipient timezone
- **Response Prediction**: AI-powered response likelihood scoring
- **Follow-up Automation**: Automatic follow-up email sequences

### Integration Points

- **CRM Integration**: Sync email activity with customer relationship tools
- **Analytics Dashboard**: Comprehensive email performance metrics
- **Calendar Integration**: Schedule emails and track response times
- **AI Improvements**: Machine learning for email optimization

This Gmail integration provides a complete email automation solution, transforming job matches into actionable outreach while maintaining full Gmail functionality and security.


