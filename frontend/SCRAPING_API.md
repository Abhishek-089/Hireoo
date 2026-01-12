# LinkedIn Scraping API

Backend API endpoints for receiving and processing LinkedIn scraping data from the Chrome extension.

## API Endpoints

### POST `/api/scrape/post`

Receives raw LinkedIn post data from the Chrome extension and queues it for AI processing.

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "raw_html": "<div>Raw LinkedIn post HTML...</div>",
  "text": "Clean text content of the post",
  "post_url": "https://www.linkedin.com/posts/company_post_123",
  "timestamp": "2024-01-15T10:30:00Z", // Optional
  "linkedin_id": "urn:li:activity:123456789" // Optional, LinkedIn post ID
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Post stored and queued for processing",
  "postId": "clx123abc456def"
}
```

**Response (Already Exists):**
```json
{
  "success": true,
  "message": "Post already scraped",
  "postId": "clx123abc456def"
}
```

**Error Responses:**
```json
// 401 Unauthorized
{ "error": "Unauthorized" }

// 400 Bad Request
{ "error": "Missing required fields", "required": ["raw_html", "text", "post_url"] }

// 409 Conflict (duplicate)
{ "error": "Post already scraped" }
```

### GET `/api/scrape/post?type=stats`

Get scraping statistics for the authenticated user.

**Query Parameters:**
- `type=stats` - Get statistics
- `type=recent` - Get recent posts
- `limit=10` - Number of recent posts to return (for type=recent)

**Response (Stats):**
```json
{
  "totalPosts": 150,
  "processedPosts": 120,
  "pendingPosts": 30,
  "recentPosts": 25,
  "processingRate": 80
}
```

**Response (Recent Posts):**
```json
{
  "posts": [
    {
      "id": "clx123abc456def",
      "preview": "We're hiring a Senior Software Engineer...",
      "postUrl": "https://www.linkedin.com/posts/company_post_123",
      "linkedinId": "urn:li:activity:123456789",
      "timestamp": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:35:00Z",
      "processed": true
    }
  ]
}
```

## Database Schema

### ScrapedPost Model

```prisma
model ScrapedPost {
  id            String   @id @default(cuid())
  user_id       String
  raw_html      String   @db.Text    // Raw LinkedIn post HTML
  text          String   @db.Text    // Clean text content
  post_url      String                 // LinkedIn post URL
  linkedin_id   String?  @unique      // LinkedIn post ID
  timestamp     DateTime?             // Original post timestamp
  created_at    DateTime @default(now()) // When stored in our DB
  processed     Boolean  @default(false) // AI processing status

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id, created_at])
  @@index([linkedin_id])
  @@index([processed])
}
```

## Queue System (BullMQ)

### AI Extraction Queue

**Queue Name:** `ai_extraction`

**Job Data:**
```typescript
{
  scrapedPostId: string,  // Our database ID
  rawHtml: string,        // Raw HTML for processing
  text: string,           // Clean text
  postUrl: string         // LinkedIn URL
}
```

**Job Processing:**
1. Receives scraped post data
2. Calls AI service (OpenAI/Anthropic) to extract job information
3. Updates ScrapedPost record with extracted data
4. Creates JobMatch records if applicable

### Running the Queue Processor

```bash
# Start the queue processor
npm run process-queue

# Or run directly
npx tsx src/scripts/process-queue.ts
```

## Extension Integration

### From Chrome Extension

```javascript
// Send scraped post to backend
const response = await fetch('/api/scrape/post', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    raw_html: postHtml,
    text: cleanText,
    post_url: linkedinUrl,
    linkedin_id: postId,
    timestamp: postTimestamp
  })
})
```

## Error Handling

- **Duplicate Prevention:** Posts are checked for uniqueness by `linkedin_id` or `post_url`
- **Validation:** Required fields are validated before processing
- **Queue Failures:** Failed jobs are retried up to 3 times with exponential backoff
- **Logging:** All operations are logged for debugging

## Monitoring

### Queue Health
```javascript
import { aiExtractionQueue } from '@/lib/queue'

// Get queue stats
const waiting = await aiExtractionQueue.getWaiting()
const active = await aiExtractionQueue.getActive()
const completed = await aiExtractionQueue.getCompleted()
const failed = await aiExtractionQueue.getFailed()
```

### Database Queries
```sql
-- Total posts by user
SELECT COUNT(*) FROM "ScrapedPost" WHERE user_id = $1

-- Processing status
SELECT processed, COUNT(*) as count
FROM "ScrapedPost"
WHERE user_id = $1
GROUP BY processed

-- Recent activity
SELECT * FROM "ScrapedPost"
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 10
```

## Future Enhancements

- **Batch Processing:** Process multiple posts together for efficiency
- **Priority Queues:** High-priority processing for urgent job matches
- **Rate Limiting:** Prevent API abuse and respect AI service limits
- **Analytics:** Detailed metrics on processing success rates
- **Retry Logic:** Advanced retry strategies for failed extractions


