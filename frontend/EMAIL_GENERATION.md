# AI Email Generation System

GPT-4 powered personalized cold email generation for job applications.

## Overview

The email generation system creates tailored cold outreach emails by combining:

1. **Job Information**: Title, company, required skills, HR contact details
2. **User Profile**: Skills, experience, resume highlights, portfolio
3. **AI Personalization**: GPT-4 generates compelling, personalized content
4. **Professional Formatting**: Subject lines, body text, and PS sections

## Architecture

### Core Components

```
Email Generation Pipeline:
├── Email Generator Service → OpenAI GPT-4 integration
├── Queue System → BullMQ async processing
├── Database → EmailDraft storage
├── API Endpoints → RESTful email management
└── User Dashboard → Email draft interface
```

### Data Flow

1. **User Requests Email** → Selects job match for email generation
2. **Queue Processing** → BullMQ worker handles async generation
3. **AI Generation** → GPT-4 creates personalized email content
4. **Draft Storage** → Email saved to database with metadata
5. **User Access** → Email drafts available in dashboard
6. **Email Sending** → Integration with Gmail API (future)

## Database Schema

### EmailDraft Model

```prisma
model EmailDraft {
  id          String    @id @default(cuid())
  user_id     String
  job_id      String
  match_id    String    // Reference to JobMatch
  subject     String
  body        String    @db.Text
  ps_line     String?   // Postscript line
  generated_at DateTime @default(now())
  status      String    @default("draft") // draft, sent, edited, rejected
  used        Boolean   @default(false)   // Whether draft was used

  user User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  job  Job      @relation(fields: [job_id], references: [id], onDelete: Cascade)
  match JobMatch @relation(fields: [match_id], references: [id], onDelete: Cascade)

  @@index([user_id, generated_at])
  @@index([job_id])
  @@index([match_id])
  @@index([status])
  @@index([used])
}
```

## AI Email Generation

### GPT-4 Integration

**Model**: `gpt-4` (most capable for creative writing)

**Prompt Structure**:
```typescript
const prompt = `
JOB INFORMATION:
- Position: ${jobTitle}
- Company: ${company}
- Required Skills: ${jobSkills}
- HR Contact: ${hrName}

CANDIDATE INFORMATION:
- Name: ${userName}
- Skills: ${userSkills}
- Experience: ${experience}
- Resume Summary: ${resumeSummary}

TASK: Create a personalized cold email that:
1. References specific skills the candidate has that match the job
2. Shows genuine interest in the company/role
3. Includes a clear next step/call-to-action
4. Maintains professional yet personable tone

Return JSON: {"subject": "...", "body": "...", "ps_line": "..."}
`
```

### Email Structure

**Subject Line** (50 chars max):
- Compelling and personalized
- References specific role or company
- Creates curiosity or urgency

**Body** (200-300 words):
- Professional greeting with HR name
- Introduction with relevant background
- Skills matching and value proposition
- Company research and interest demonstration
- Clear call-to-action
- Professional closing

**PS Line** (optional):
- Additional relevant information
- Portfolio links or certifications
- Follow-up availability

### Example Generated Email

```
Subject: Senior Python Developer Opportunity at Google

Dear Sarah Johnson,

I hope this email finds you well. I'm reaching out regarding the Senior Python Developer position at Google that I discovered through my network. As someone who has spent the last 4 years building scalable Python applications and contributing to open-source projects, I'm particularly excited about Google's mission to organize the world's information.

My experience includes:
- 3+ years developing Python microservices using FastAPI and Django
- Leading a team of 5 developers on a high-traffic e-commerce platform
- Contributing to popular open-source libraries with 10k+ GitHub stars

What drew me to Google specifically is your work in AI/ML infrastructure, which aligns perfectly with my background in machine learning model deployment and distributed systems. I'd love to discuss how my skills in Python, Docker, and Kubernetes could contribute to your team's success.

Would you be open to a brief call to discuss the role and my background? I'm available next week at your convenience.

Best regards,
John Smith
Senior Python Developer

P.S. You can view my recent project on GitHub: github.com/johnsmith/ml-platform
```

## Queue System

### Email Generation Queue

**Queue Name:** `email_generation`

**Job Data:**
```typescript
{
  userId: string,
  jobId: string,
  matchId: string
}
```

**Processing:**
1. Validates user, job, and match exist
2. Retrieves job and user profile data
3. Calls OpenAI API for email generation
4. Saves draft to database with metadata
5. Updates job match with email draft reference

### Worker Configuration

```typescript
// High priority, moderate concurrency
emailGenerationWorker = new Worker(QUEUE_NAMES.EMAIL_GENERATION, {
  concurrency: 2,  // Process 2 emails simultaneously
  attempts: 3,     // Retry failed generations
})
```

## API Endpoints

### POST `/api/email/generate`

Generate email draft for a specific job match.

**Request:**
```json
{
  "jobId": "job-123",
  "matchId": "match-456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email generation queued successfully",
  "queued": true
}
```

### GET `/api/email/drafts`

Get user's email drafts.

**Query Parameters:**
- `limit`: Number of drafts (1-50, default: 20)
- `status`: Filter by status ('draft', 'sent', 'edited', 'rejected')

**Response:**
```json
{
  "drafts": [...],
  "total": 25,
  "filtered": 10,
  "status": "draft"
}
```

### GET `/api/email/drafts/{id}`

Get specific email draft.

**Response:**
```json
{
  "draft": {
    "id": "draft-123",
    "subject": "Senior Developer Role at TechCorp",
    "body": "Dear Hiring Manager...",
    "psLine": "Check out my portfolio: example.com",
    "status": "draft",
    "generatedAt": "2024-01-15T10:30:00Z",
    "job": { "title": "Senior Developer", "company": "TechCorp" }
  }
}
```

### PATCH `/api/email/drafts`

Update email draft status.

**Request:**
```json
{
  "draftId": "draft-123",
  "status": "sent",
  "used": true
}
```

## Usage Examples

### Generate Email Draft

```typescript
// From job matches page
const response = await fetch('/api/email/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobId: 'job-123',
    matchId: 'match-456'
  })
})
```

### Get Email Drafts

```typescript
// Get recent drafts
const drafts = await fetch('/api/email/drafts?limit=10&status=draft')
const data = await drafts.json()

// Display in UI
data.drafts.forEach(draft => {
  console.log(`${draft.subject} - ${draft.job.title}`)
})
```

### Update Draft Status

```typescript
// Mark as sent after using
await fetch('/api/email/drafts', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    draftId: 'draft-123',
    status: 'sent',
    used: true
  })
})
```

## Performance Considerations

### Optimization Strategies

- **Batch Processing**: Generate multiple emails in single API calls
- **Caching**: Cache user profiles to reduce database queries
- **Rate Limiting**: Prevent API abuse and OpenAI quota exhaustion
- **Async Processing**: Non-blocking email generation
- **Error Recovery**: Automatic retry with exponential backoff

### Cost Management

- **Token Limits**: Monitor OpenAI token usage
- **Quality Thresholds**: Only generate for high-quality matches
- **Caching**: Reuse similar email templates
- **Batch API Calls**: Reduce individual API requests

### Monitoring

```typescript
// Queue health
const queueStats = await emailGenerationQueue.getJobCounts()
// { waiting: 3, active: 1, completed: 45, failed: 2 }

// Generation success rate
const successRate = (completed / (completed + failed)) * 100
```

## Quality Assurance

### Email Validation

- **Content Check**: Ensure emails are professional and relevant
- **Length Validation**: Appropriate email length and structure
- **Personalization**: Verify specific job and user references
- **Grammar Check**: Basic validation of generated content

### A/B Testing

Future enhancements could include:
- Different prompt variations
- Subject line testing
- Tone optimization
- Length experiments

## Future Enhancements

### Advanced Features

- **Template Library**: Pre-built email templates for different industries
- **Personalization Engine**: Enhanced user profiling for better emails
- **A/B Testing**: Compare email effectiveness
- **Analytics**: Track open rates, responses, and conversions
- **Follow-up Sequences**: Automated follow-up email generation

### Integration Points

- **Gmail API**: Direct sending from generated drafts
- **Calendar Integration**: Schedule sending times
- **CRM Integration**: Track email interactions
- **Analytics Dashboard**: Email performance metrics

### Technical Improvements

- **Streaming Generation**: Real-time email preview
- **Multi-language Support**: Generate emails in different languages
- **Industry Templates**: Specialized templates for tech, finance, etc.
- **Dynamic Personalization**: Real-time company research integration

This AI email generation system transforms job matching into actionable outreach, helping users craft compelling cold emails that convert opportunities into interviews.


