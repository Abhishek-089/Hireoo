import OpenAI from "openai"

const GROQ_BASE_URL = "https://api.groq.com/openai/v1"

/**
 * Model priority list — tried in order. If a model is decommissioned or
 * rate-limited the service automatically falls back to the next one.
 *
 * Free-tier limits (requests / day):
 *   llama-3.1-8b-instant        → 14,400 rq/day  (primary: fastest, highest quota)
 *   llama-3.3-70b-versatile     →  1,000 rq/day  (secondary: best quality)
 *   llama-4-scout-17b-16e-instruct → 1,000 rq/day (tertiary: latest generation)
 */
export const GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "llama-4-scout-17b-16e-instruct",
] as const

export type GroqModel = (typeof GROQ_MODELS)[number]

/** @deprecated use GROQ_MODELS[0] — kept for backward compatibility */
export const GROQ_MODEL = GROQ_MODELS[0]

let groqClient: OpenAI | null = null

export function getGroqClient(): OpenAI {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error("[AI Service] GROQ_API_KEY is not configured")
    }
    groqClient = new OpenAI({
      apiKey,
      baseURL: GROQ_BASE_URL,
    })
  }
  return groqClient
}

/**
 * Calls chat.completions.create trying each model in GROQ_MODELS order.
 * Moves to the next model on 400/model_decommissioned or 429/rate-limit errors.
 * Exported as `callGroq` for use in other modules that need direct Groq access.
 */
export async function callGroq(
  params: Omit<OpenAI.Chat.ChatCompletionCreateParamsNonStreaming, "model">
): Promise<OpenAI.Chat.ChatCompletion> {
  const client = getGroqClient()
  let lastError: unknown

  for (const model of GROQ_MODELS) {
    try {
      const response = await client.chat.completions.create({ ...params, model })
      return response
    } catch (err: any) {
      const code: string = err?.code ?? ""
      const status: number = err?.status ?? 0

      const isRetryable =
        code === "model_decommissioned" ||
        code === "model_not_active" ||
        status === 429 ||
        status === 503

      if (isRetryable) {
        console.warn(`[AI Service] Model "${model}" unavailable (${code || status}), trying next…`)
        lastError = err
        continue
      }

      throw err
    }
  }

  throw lastError
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface EnhancedJobData {
  enhancedTitle: string
  skills: string[]
  shortSummary: string
}

export interface CoverLetterOptions {
  userFirstName?: string
  userLastName?: string
  experienceLevel?: string
  jobType?: string
  toneId?: string
  location?: string
  jobRequiredSkills?: string[]
  hrName?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripMarkdownJson(raw: string): string {
  let s = raw.trim()
  if (s.includes("```json")) {
    s = s.split("```json")[1].split("```")[0].trim()
  } else if (s.includes("```")) {
    s = s.split("```")[1].split("```")[0].trim()
  }
  return s
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract enhanced title, skills array, and short summary from a job posting.
 */
export async function enhanceJobData(
  jobTitle: string,
  jobDescription: string
): Promise<EnhancedJobData> {
  const fallback: EnhancedJobData = {
    enhancedTitle: jobTitle,
    skills: [],
    shortSummary: jobDescription.slice(0, 200),
  }

  try {
    const prompt = `Extract the important information from this job description.

Return JSON with:
- enhancedTitle (string — a clear, specific job title)
- skills (array of strings, max 8 technical skills)
- shortSummary (string — max 2 sentences describing the role)

Job Title:
${jobTitle}

Job Description:
${jobDescription.slice(0, 4000)}

Return ONLY the JSON object. No markdown, no explanation.`

    const response = await callGroq({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 512,
    })

    const content = response.choices[0]?.message?.content || ""
    const parsed = JSON.parse(stripMarkdownJson(content)) as EnhancedJobData

    return {
      enhancedTitle: parsed.enhancedTitle || jobTitle,
      skills: Array.isArray(parsed.skills) ? parsed.skills.slice(0, 8) : [],
      shortSummary: parsed.shortSummary || fallback.shortSummary,
    }
  } catch (error) {
    console.error("[AI Service] enhanceJobData failed:", error)
    return fallback
  }
}

/**
 * Generate a short personalized cover letter (150–200 words).
 */
export async function generateCoverLetter(
  userSkills: string[],
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  options: CoverLetterOptions = {}
): Promise<string> {
  const {
    userFirstName = "",
    userLastName = "",
    experienceLevel,
    jobType,
    toneId = "direct_application",
    location,
    jobRequiredSkills = [],
    hrName = "Hiring Manager",
  } = options

  const candidateName =
    [userFirstName, userLastName].filter(Boolean).join(" ") || "the candidate"

  const toneMap: Record<string, string> = {
    present_yourself: "warm, friendly and approachable",
    direct_application: "professional, formal and concise",
    expressive: "confident, bold and energetic",
  }
  const toneInstruction = toneMap[toneId] ?? toneMap.direct_application

  const skillsOverlap = userSkills.filter((s) =>
    jobRequiredSkills.some(
      (r) =>
        r.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(r.toLowerCase())
    )
  )
  const highlightedSkills =
    skillsOverlap.length > 0
      ? skillsOverlap.slice(0, 5)
      : userSkills.slice(0, 5)

  const fallback = buildFallbackLetter({
    hrName,
    candidateName,
    jobTitle,
    companyName,
    skills: highlightedSkills,
    toneId,
  })

  try {
    const prompt = `You are writing a cold job application email. Write it in first person as if you ARE the job seeker.

TONE: ${toneInstruction}

JOB SEEKER:
- Name: ${candidateName}
- Skills: ${userSkills.join(", ") || "not specified"}
- Relevant skills for this role: ${highlightedSkills.join(", ") || "not specified"}${experienceLevel ? `\n- Experience level: ${experienceLevel}` : ""}${jobType ? `\n- Looking for: ${jobType} work` : ""}

JOB:
- Role: ${jobTitle || "the open position"}
- Company: ${companyName || "your company"}${location ? `\n- Location: ${location}` : ""}
- Required skills: ${jobRequiredSkills.join(", ") || "not listed"}
${jobDescription ? `- Job summary: ${jobDescription.slice(0, 600)}` : ""}

RECIPIENT: ${hrName}

INSTRUCTIONS:
- Write exactly 3 short paragraphs: opening, why I'm a fit, closing with CTA
- Reference the actual role name and company name
- Highlight matching skills naturally (not as a bullet list)
- End with a clear call-to-action
- Sign off with: "${candidateName}"
- Do NOT include a subject line
- Keep it under 200 words total
- Sound human and natural

Write only the email body, nothing else.`

    const response = await callGroq({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
      max_tokens: 512,
    })

    return response.choices[0]?.message?.content?.trim() || fallback
  } catch (error) {
    console.error("[AI Service] generateCoverLetter failed:", error)
    return fallback
  }
}

// ── Fallback template ────────────────────────────────────────────────────────

function buildFallbackLetter(opts: {
  hrName: string
  candidateName: string
  jobTitle: string
  companyName: string
  skills: string[]
  toneId: string
}): string {
  const { hrName, candidateName, jobTitle, companyName, skills, toneId } = opts
  const role = jobTitle || "this position"
  const org = companyName || "your company"
  const skillList = skills.slice(0, 3).join(", ") || "relevant skills"

  if (toneId === "expressive") {
    return `Hi ${hrName},\n\nI came across the ${role} opportunity at ${org} and I'm genuinely excited — this is exactly the kind of role I've been looking for.\n\nI bring hands-on experience in ${skillList}, and a track record of delivering real results. I'd love to jump on a quick call to show you what I can bring to the team.\n\nResume attached. Looking forward to connecting!\n\n${candidateName}`
  }
  if (toneId === "present_yourself") {
    return `Hello ${hrName},\n\nI came across the ${role} opening at ${org} and wanted to reach out. My background in ${skillList} aligns well with what you're looking for, and I'd love to learn more about the team.\n\nI've attached my resume and would be happy to chat at your convenience.\n\nSincerely,\n${candidateName}`
  }
  return `Dear ${hrName},\n\nI am writing to apply for the ${role} position at ${org}. With my experience in ${skillList}, I am confident I can contribute effectively to your team.\n\nPlease find my resume attached. I look forward to the possibility of speaking with you.\n\nBest regards,\n${candidateName}`
}
