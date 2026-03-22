import { Prisma } from "@prisma/client"
import { callGroq } from "./services/ai.service"
import { prisma } from "./prisma"

/**
 * Fixes JSON returned by LLMs that contains raw (unescaped) control characters
 * inside string literals — the most common cause of JSON.parse failures.
 *
 * Walks the string character-by-character, tracking whether we are inside a
 * JSON string, and replaces bare newlines / carriage-returns / tabs with their
 * properly escaped equivalents only within string values.
 */
function sanitizeJsonString(raw: string): string {
  const out: string[] = []
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    const code = raw.charCodeAt(i)

    if (escaped) {
      out.push(ch)
      escaped = false
      continue
    }

    if (ch === "\\" && inString) {
      out.push(ch)
      escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      out.push(ch)
      continue
    }

    if (inString) {
      if (code === 0x0a) { out.push("\\n"); continue }   // raw newline
      if (code === 0x0d) { out.push("\\r"); continue }   // raw carriage-return
      if (code === 0x09) { out.push("\\t"); continue }   // raw tab
      if (code < 0x20)   { continue }                    // drop other control chars
    }

    out.push(ch)
  }

  return out.join("")
}

const EXTRACTION_PROMPT = `You are an expert HR data analyst specializing in extracting structured information from raw, messy LinkedIn job posts.

LinkedIn posts often contain noise: excessive emojis, hashtags, line breaks, promotional filler, ALL CAPS sections, bullet-point clutter, and repeated contact info. Your job is to extract clean, structured data and ignore everything else.

Return ONLY valid JSON with EXACTLY these fields:

{
  "job_title": "Specific job title — infer from context if not stated (e.g. 'Senior React Developer', 'Backend Engineer'). NEVER return 'Unknown' or null.",
  "company": "Company name — check email domain (e.g. '@techcorp.com' → 'TechCorp'), look for 'at [Company]', 'with [Company]', or 'for [Company]'. Null only if truly undetectable.",
  "location": "City and country (e.g. 'Bangalore, India', 'Mumbai, India', 'Delhi NCR', 'Remote'). If hybrid, mention it: 'Hybrid – Pune, India'. Null if not found.",
  "work_mode": "One of: 'Remote', 'Hybrid', 'Onsite'. Infer from keywords like WFH, work from home, hybrid, in-office. Default to 'Onsite' if location is mentioned but no remote/hybrid signals.",
  "skills": ["Array of specific technical skills only — programming languages, frameworks, tools, platforms. Max 10. No soft skills like 'communication' or 'teamwork'. Examples: 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Python', 'Docker'."],
  "experience_required": "Years of experience or level (e.g. '2-4 years', '5+ years', 'Fresher', 'Junior', 'Senior', 'Lead'). Null if not mentioned.",
  "salary_range": "Salary if mentioned (e.g. '₹8-12 LPA', '$80k-100k/yr', '15-20 LPA'). Null if not mentioned.",
  "job_type": "One of: 'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'. Default to 'Full-time' if not specified.",
  "domain": "Industry or domain (e.g. 'FinTech', 'EdTech', 'SaaS', 'E-commerce', 'Healthcare', 'IT Services', 'Gaming'). Infer from company or context. Null if unclear.",
  "hr_name": "Name of the recruiter or hiring manager posting the job. Null if not found.",
  "hr_email": "Contact email address(es) for applying — extract ALL emails present, return as a comma-separated string. Null if none found.",
  "notice_period": "Notice period or joining urgency if mentioned (e.g. 'Immediate joiner', '30 days', '15-30 days'). Null if not mentioned.",
  "description": "A clean, well-structured summary (max 250 words). Use this exact structure:\n\nAbout the Role: [1-2 sentences]\n\nResponsibilities:\n• [key responsibility 1]\n• [key responsibility 2]\n...\n\nRequirements:\n• [requirement 1]\n• [requirement 2]\n...\n\nHow to Apply: [contact/apply instructions]\n\nStrip all hashtags, emojis, excessive whitespace, promotional language, and repeated text. Keep only job-relevant content.",
  "confidence_score": 0.0
}

Rules:
- confidence_score: Float 0.0-1.0. Use 0.9+ for clear job posts, 0.5-0.8 for partial info, below 0.5 for very noisy/unclear posts.
- If a field cannot be determined, use null (not empty string, not "N/A", not "Unknown").
- skills must be an array even if only one skill is found.
- DO NOT include any field not listed above.

Raw Post Text:
"""
{TEXT}
"""

Return ONLY the JSON object. No markdown fences, no explanation, no extra text.`

export interface EnrichedJobData {
  job_title: string | null
  company: string | null
  location: string | null
  work_mode: string | null
  skills: string[]
  experience_required: string | null
  salary_range: string | null
  job_type: string | null
  domain: string | null
  hr_name: string | null
  hr_email: string | null
  notice_period: string | null
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
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content || ""

    let jsonStr = content.trim()
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim()
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim()
    }

    const data = JSON.parse(sanitizeJsonString(jsonStr)) as EnrichedJobData
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
        location: extracted.location || (extracted.work_mode === "Remote" ? "Remote" : null),
        salary_range: extracted.salary_range,
        skills: extracted.skills || [],
        description: extracted.description || postText,
        job_type: extracted.job_type || null,
        experience_level: extracted.experience_required || null,
        posted_date: new Date(),
        source_url: postUrl,
      },
    })

    console.log(`[AI Enrichment] Created Job for ScrapedPost ${scrapedPostId}`)
    return true
  } catch (error) {
    // Two matchers can enrich the same post in parallel; the second create hits unique `scraped_post_id`.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return true
    }
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
