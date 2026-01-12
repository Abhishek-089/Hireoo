# Job Matching System

AI-powered job matching system that matches extracted job postings to users based on semantic similarity and structured signals.

## Overview

The job matching system combines multiple signals to create accurate job-user matches:

1. **Semantic Similarity** (40%): OpenAI embeddings compare job descriptions with user profiles
2. **Skill Overlap** (30%): Structured comparison of required vs. possessed skills
3. **Experience Fit** (15%): Experience level compatibility
4. **Location Fit** (10%): Geographic preferences and remote work options
5. **Job Type Fit** (5%): Employment type preferences

Final scores range from 0-100, categorized as Good (75+), Medium (50-74), or Bad (0-49).

## Architecture

### Core Components

```
Job Matching Pipeline:
├── Embeddings Service → OpenAI text embeddings
├── Structured Matching → Skill/experience/location logic
├── Job Matching Service → Orchestrates matching process
├── BullMQ Queue → Async job processing
└── Database → Persists match results
```

### Data Flow

1. **Job Extraction** → AI service extracts job details from LinkedIn posts
2. **Job Storage** → Jobs stored with embeddings in database
3. **Match Trigger** → `matchJobToUsers(jobId)` queues matching job
4. **Queue Processing** → BullMQ worker processes matches asynchronously
5. **Result Storage** → Match results saved to `JobMatch` table
6. **User Dashboard** → Users see personalized job recommendations

## Database Schema

### Job Model (Enhanced)
```prisma
model Job {
  id              String   @id @default(cuid())
  scraped_post_id String?  @unique
  title           String?
  company         String?
  location        String?
  description     String?  @db.Text
  requirements    String?  @db.Text
  skills          String[] // Extracted skills
  salary_range    String?
  job_type        String?
  experience_level String?
  application_url String?
  posted_date     DateTime?
  scraped_at      DateTime @default(now())
  source_url      String?
  embedding       Float[]  // OpenAI embedding vector
  status          String   @default("active")

  scraped_post    ScrapedPost? @relation(fields: [scraped_post_id], references: [id])
  user_matches    JobMatch[]
}
```

### JobMatch Model (New)
```prisma
model JobMatch {
  id                  String    @id @default(cuid())
  user_id             String
  job_id              String
  embedding_similarity Float     // Cosine similarity 0-1
  skill_overlap_score  Float     // Skill overlap 0-1
  experience_fit_score Float     // Experience fit 0-1
  location_fit_score   Float     // Location fit 0-1
  final_score          Float     // Combined score 0-100
  match_quality        String    // 'good', 'medium', 'bad'
  matched_at           DateTime  @default(now())
  applied              Boolean   @default(false)
  applied_at           DateTime?
  notes                String?

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  job  Job  @relation(fields: [job_id], references: [id], onDelete: Cascade)

  @@unique([user_id, job_id])
  @@index([user_id, matched_at])
  @@index([final_score])
  @@index([match_quality])
}
```

## API Endpoints

### POST `/api/matching/job`

Trigger job matching for a specific job.

**Request:**
```json
{
  "jobId": "clx123abc456def"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job matching queued for job: clx123abc456def",
  "jobQueued": true
}
```

### GET `/api/matching/job?jobId={jobId}`

Get matching statistics for a job.

**Response:**
```json
{
  "totalMatches": 45,
  "goodMatches": 12,
  "mediumMatches": 18,
  "badMatches": 15,
  "appliedCount": 3,
  "topMatches": [
    {
      "userId": "user123",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "finalScore": 92,
      "matchQuality": "good",
      "applied": false,
      "matchedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET `/api/matching/user?limit=20&quality=good`

Get user's job matches.

**Query Parameters:**
- `limit`: Number of matches to return (1-100, default: 20)
- `quality`: Filter by match quality ('good', 'medium', 'bad', or omit for all)

**Response:**
```json
{
  "matches": [...],
  "total": 150,
  "filtered": 35,
  "quality": "good"
}
```

### PATCH `/api/matching/user`

Update match application status.

**Request:**
```json
{
  "matchId": "match123",
  "applied": true,
  "notes": "Applied via company website"
}
```

## Queue System

### Job Matching Queue

**Queue Name:** `job_matching`

**Job Data:**
```typescript
{
  jobId: string
}
```

**Processing:**
1. Validates job exists and has embeddings
2. Retrieves all eligible users (completed onboarding)
3. Calculates matches for each user-job pair
4. Saves results to database with transaction
5. Logs processing statistics

### Worker Configuration

```typescript
// High priority, resource-intensive processing
jobMatchingWorker = new Worker(QUEUE_NAMES.JOB_MATCHING, { concurrency: 1 })
```

## Matching Algorithm

### 1. Semantic Similarity (40%)

Uses OpenAI embeddings to compare job descriptions with user profiles:

```typescript
// Job text: "Senior Python Developer needed for fintech startup"
const jobEmbedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: jobText
})

// User profile: "Python developer with 3 years experience"
const userEmbedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: userProfileText
})

const similarity = cosineSimilarity(jobEmbedding, userEmbedding)
```

### 2. Skill Overlap (30%)

Compares required skills with user skills:

```typescript
const userSkills = ["Python", "JavaScript", "React"]
const jobSkills = ["Python", "Django", "PostgreSQL"]

const matchingSkills = userSkills.filter(skill =>
  jobSkills.some(jobSkill =>
    skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
    jobSkill.toLowerCase().includes(skill.toLowerCase())
  )
)

const overlapScore = matchingSkills.length / Math.max(jobSkills.length, 1)
```

### 3. Experience Fit (15%)

Maps experience levels and calculates compatibility:

```typescript
const experienceLevels = {
  'entry': 1, 'junior': 2, 'mid': 3,
  'senior': 4, 'lead': 5, 'executive': 6
}

const userLevel = experienceLevels[userExperience] || 3
const jobLevel = experienceLevels[jobExperience] || 3

const difference = Math.abs(userLevel - jobLevel)
const fitScore = Math.max(0, 1 - (difference * 0.2)) // 1.0, 0.8, 0.6, 0.4, 0.2
```

### 4. Location Fit (10%)

Handles remote work preferences and location matching:

```typescript
if (userPrefersRemote) {
  return 0.9 // High score for remote-friendly jobs
}

const locationMatch = userLocations.some(userLoc =>
  jobLocation?.toLowerCase().includes(userLoc.toLowerCase())
)

return locationMatch ? 1.0 : 0.2
```

### 5. Job Type Fit (5%)

Matches employment type preferences:

```typescript
const userTypes = ["full-time", "contract"]
const jobType = "full-time"

const typeMatch = userTypes.includes(jobType)
return typeMatch ? 1.0 : 0.3
```

### Final Score Calculation

```typescript
const weights = {
  EMBEDDING: 0.4,    // 40%
  SKILLS: 0.3,       // 30%
  EXPERIENCE: 0.15,  // 15%
  LOCATION: 0.1,     // 10%
  JOB_TYPE: 0.05,    // 5%
}

const finalScore = Math.round(
  embeddingSimilarity * weights.EMBEDDING +
  skillOverlapScore * weights.SKILLS +
  experienceFitScore * weights.EXPERIENCE +
  locationFitScore * weights.LOCATION +
  jobTypeFitScore * weights.JOB_TYPE
) * 100

// Quality categorization
const matchQuality = finalScore >= 75 ? 'good' :
                    finalScore >= 50 ? 'medium' : 'bad'
```

## Usage Examples

### Trigger Job Matching

```typescript
import { matchJobToUsers } from '@/lib/matching-utils'

// Queue matching for a specific job
const result = await matchJobToUsers('job-123')
console.log(result) // { success: true, message: "...", jobQueued: true }
```

### Get User Matches

```typescript
import { JobMatchingService } from '@/lib/job-matching'

// Get user's top matches
const matches = await JobMatchingService.getTopMatchesForUser(userId, 10)

// Filter by quality
const goodMatches = matches.filter(m => m.matchQuality === 'good')
```

### Update Application Status

```typescript
// Mark match as applied
await JobMatchingService.updateMatchApplication(matchId, true, 'Applied via LinkedIn')
```

## Performance Considerations

### Optimizations

- **Batch Processing**: Multiple jobs can be queued simultaneously
- **Async Operations**: Non-blocking embedding calculations
- **Database Indexing**: Optimized queries with proper indexes
- **Queue Concurrency**: Controlled parallelism to prevent resource exhaustion
- **Caching**: Consider caching user embeddings for frequent matches

### Scaling

- **Horizontal Scaling**: Multiple worker instances can process different jobs
- **Database Sharding**: Split users/jobs across multiple database instances
- **Redis Clustering**: Scale queue system for high throughput
- **Embedding Storage**: Consider vector databases for large-scale similarity search

## Monitoring & Analytics

### Queue Health

```typescript
import { jobMatchingQueue } from '@/lib/queue'

const stats = await jobMatchingQueue.getJobCounts()
// { waiting: 5, active: 2, completed: 150, failed: 3 }
```

### Match Quality Metrics

```sql
-- Overall match quality distribution
SELECT match_quality, COUNT(*) as count
FROM "JobMatch"
GROUP BY match_quality

-- Application conversion rates
SELECT
  match_quality,
  COUNT(*) as total_matches,
  SUM(CASE WHEN applied THEN 1 ELSE 0 END) as applied_count,
  ROUND(AVG(final_score), 2) as avg_score
FROM "JobMatch"
GROUP BY match_quality
```

### Performance Monitoring

```sql
-- Average processing time per job
SELECT
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_processing_time
FROM job_processing_logs
WHERE job_type = 'matching'
```

## Future Enhancements

### Advanced Features

- **Real-time Matching**: WebSocket updates when new jobs match user criteria
- **Personalized Scoring**: Machine learning models trained on user feedback
- **Skill Gap Analysis**: Identify skills users need to develop
- **Career Path Recommendations**: Suggest job progression based on user history
- **Diversity Matching**: Ensure diverse candidate pools for employers

### Technical Improvements

- **Vector Database**: Pinecone/Weaviate for faster similarity search
- **A/B Testing**: Compare different matching algorithms
- **Feedback Loop**: User interactions improve match quality over time
- **Explainability**: Show why specific matches were made
- **Bias Detection**: Monitor and reduce algorithmic bias in matching

This job matching system provides accurate, scalable job-user matching powered by AI embeddings and structured data analysis.


