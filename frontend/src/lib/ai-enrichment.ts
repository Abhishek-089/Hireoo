import { callGroq } from "./services/ai.service"
import { prisma } from "./prisma"

const EXTRACTION_PROMPT = `You are an expert HR data analyst. Extract structured job information from this LinkedIn hiring post.

Return ONLY valid JSON with these fields:
- job_title: The specific job title (infer from context if not explicit, e.g. "Senior React Developer"). Never use "Unknown".
- company: The hiring company name. Check email domains if not explicit.
- location: Job location (e.g. "Bangalore, India" or "Remote")
- skills: Array of specific technical skills required (max 8)
- experience_required: Years/level (e.g. "3-5 years" or "Senior")
- salary_range: Salary if mentioned, else null
- job_type: "Full-time", "Part-time", "Contract", or "Internship"
- hr_name: Recruiter/poster name if mentioned, else null
- hr_email: Contact email if present, else null
- description: A clean, well-formatted summary of the job (max 300 words). Use plain text with line breaks. Remove hashtags, emojis, and clutter. Structure it as: brief intro, key responsibilities, requirements, and how to apply.
- confidence_score: Float 0.0-1.0 for extraction confidence

Raw Post Text:
"""
{TEXT}
"""

Return ONLY the JSON object. No markdown, no explanation.`

export interface EnrichedJobData {
  job_title: string | null
  company: string | null
  location: string | null
  skills: string[]
  experience_required: string | null
  salary_range: string | null
  job_type: string | null
  hr_name: string | null
  hr_email: string | null
  description: string | null
  confidence_score: number
}

export async function extractJobInfoFromText(
  rawText: string
): Promise<EnrichedJobData | null> {
  try {
    const prompt = EXTRACTION_PROMPT.replace("{TEXT}", rawText.slice(0, 5000))

    const response = await callGroq({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1024,
    })

    const content = response.choices[0]?.message?.content || ""

    let jsonStr = content.trim()
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
    }

    const data = JSON.parse(jsonStr) as EnrichedJobData
    return data
  } catch (error) {
    console.error("[AI Enrichment] Groq extraction failed:", error)
    return null
  }
}

export async function enrichScrapedPost(
  scrapedPostId: string,
  postText: string,
  postUrl: string
): Promise<boolean> {
  try {
    const existingJob = await prisma.job.findUnique({
      where: { scraped_post_id: scrapedPostId },
    })
    if (existingJob) return true

    const extracted = await extractJobInfoFromText(postText)
    if (!extracted) return false

    await prisma.job.create({
      data: {
        scraped_post_id: scrapedPostId,
        title: extracted.job_title || null,
        company: extracted.company || null,
        location: extracted.location || "Remote",
        salary_range: extracted.salary_range,
        skills: extracted.skills || [],
        description: extracted.description || postText,
        posted_date: new Date(),
        source_url: postUrl,
      },
    })

    console.log(`[AI Enrichment] Created Job for ScrapedPost ${scrapedPostId}`)
    return true
  } catch (error) {
    console.error(`[AI Enrichment] Failed for post ${scrapedPostId}:`, error)
    return false
  }
}

export async function enrichUnenrichedPosts(limit = 50): Promise<{
  processed: number
  enriched: number
  failed: number
}> {
  const unenriched = await prisma.scrapedPost.findMany({
    where: {
      text: { contains: "@" },
      job: null,
    },
    orderBy: { created_at: "desc" },
    take: limit,
    select: { id: true, text: true, post_url: true },
  })

  let enriched = 0
  let failed = 0

  for (const post of unenriched) {
    const success = await enrichScrapedPost(
      post.id,
      post.text || "",
      post.post_url || ""
    )
    if (success) enriched++
    else failed++

    // Small delay to avoid rate limiting
    if (unenriched.length > 5) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  return { processed: unenriched.length, enriched, failed }
}
