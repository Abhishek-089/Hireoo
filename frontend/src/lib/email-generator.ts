import OpenAI from 'openai'
import { prisma } from './prisma'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface JobInfo {
  id: string
  title: string | null
  company: string | null
  skills: string[]
  hrName?: string | null
  description?: string | null
}

export interface UserInfo {
  id: string
  name?: string | null
  skills: string[]
  resumeSummary?: string | null
  portfolio?: string | null
  currentRole?: string | null
  experienceLevel?: string | null
}

export interface GeneratedEmail {
  subject: string
  body: string
  psLine: string
}

export class EmailGeneratorService {
  private static readonly MODEL = 'gpt-4'
  private static readonly MAX_TOKENS = 1500
  private static readonly TEMPERATURE = 0.7

  /**
   * Generate a personalized cold email for a job application
   */
  static async generateColdEmail(
    jobInfo: JobInfo,
    userInfo: UserInfo
  ): Promise<GeneratedEmail> {
    try {
      const prompt = this.buildEmailPrompt(jobInfo, userInfo)

      const response = await openai.chat.completions.create({
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert career counselor and professional copywriter specializing in cold outreach emails for job applications.

Your task is to create personalized, professional cold emails that highlight the candidate's relevant skills and experience while showing genuine interest in the specific role and company.

Guidelines:
- Keep emails concise but impactful (200-300 words)
- Focus on value proposition: what the candidate brings to the table
- Reference specific skills that match the job requirements
- Show knowledge of the company/role through research
- Include a clear call-to-action
- Maintain professional yet approachable tone
- Avoid generic phrases like "I am writing to express my interest"

Structure your response as a JSON object with exactly these fields:
{
  "subject": "Compelling subject line (50 chars max)",
  "body": "Full email body with proper greeting and signature",
  "ps_line": "Short PS line (one sentence, optional but recommended)"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.MAX_TOKENS,
        temperature: this.TEMPERATURE,
        response_format: { type: 'json_object' }
      })

      const result = response.choices[0].message.content
      if (!result) {
        throw new Error('Empty response from OpenAI')
      }

      const parsedResult = JSON.parse(result)

      // Validate the response structure
      if (!parsedResult.subject || !parsedResult.body) {
        throw new Error('Invalid response structure from OpenAI')
      }

      return {
        subject: parsedResult.subject.trim(),
        body: parsedResult.body.trim(),
        psLine: parsedResult.ps_line ? parsedResult.ps_line.trim() : ''
      }

    } catch (error) {
      console.error('Error generating cold email:', error)
      throw new Error('Failed to generate cold email')
    }
  }

  /**
   * Build the prompt for email generation
   */
  private static buildEmailPrompt(jobInfo: JobInfo, userInfo: UserInfo): string {
    const jobSkills = jobInfo.skills.length > 0 ? jobInfo.skills.join(', ') : 'Not specified'
    const userSkills = userInfo.skills.length > 0 ? userInfo.skills.join(', ') : 'Not specified'

    return `
JOB INFORMATION:
- Position: ${jobInfo.title || 'Not specified'}
- Company: ${jobInfo.company || 'Not specified'}
- Required Skills: ${jobSkills}
- HR Contact: ${jobInfo.hrName || 'Not specified'}
- Job Description: ${jobInfo.description || 'Not available'}

CANDIDATE INFORMATION:
- Name: ${userInfo.name || 'Not specified'}
- Current Role: ${userInfo.currentRole || 'Not specified'}
- Experience Level: ${userInfo.experienceLevel || 'Not specified'}
- Skills: ${userSkills}
- Resume Summary: ${userInfo.resumeSummary || 'Not available'}
- Portfolio/Links: ${userInfo.portfolio || 'Not available'}

TASK: Create a personalized cold email that:
1. References specific skills the candidate has that match the job requirements
2. Shows genuine interest in the company/role
3. Highlights relevant experience and achievements
4. Includes a clear next step/call-to-action
5. Maintains professional yet personable tone

The email should feel authentic and specifically tailored to this job and candidate combination.
`
  }

  /**
   * Save generated email draft to database
   */
  static async saveEmailDraft(
    userId: string,
    jobId: string,
    matchId: string,
    email: GeneratedEmail
  ): Promise<string> {
    try {
      const draft = await prisma.emailDraft.create({
        data: {
          user_id: userId,
          job_id: jobId,
          match_id: matchId,
          subject: email.subject,
          body: email.body,
          ps_line: email.psLine,
        }
      })

      console.log(`Saved email draft: ${draft.id}`)
      return draft.id
    } catch (error) {
      console.error('Error saving email draft:', error)
      throw new Error('Failed to save email draft')
    }
  }

  /**
   * Get email drafts for a user
   */
  static async getUserEmailDrafts(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const drafts = await prisma.emailDraft.findMany({
        where: { user_id: userId },
        orderBy: { generated_at: 'desc' },
        take: limit,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              skills: true,
            }
          },
          match: {
            select: {
              final_score: true,
              match_quality: true,
            }
          }
        }
      })

      return drafts.map(draft => ({
        id: draft.id,
        job: draft.job,
        match: {
          score: draft.match.final_score,
          quality: draft.match.match_quality,
        },
        subject: draft.subject,
        body: draft.body,
        psLine: draft.ps_line,
        generatedAt: draft.generated_at,
        status: draft.status,
        used: draft.used,
      }))
    } catch (error) {
      console.error('Error getting user email drafts:', error)
      throw new Error('Failed to get email drafts')
    }
  }

  /**
   * Update email draft status
   */
  static async updateDraftStatus(
    draftId: string,
    status: 'draft' | 'sent' | 'edited' | 'rejected',
    used: boolean = false
  ): Promise<void> {
    try {
      await prisma.emailDraft.update({
        where: { id: draftId },
        data: {
          status,
          used,
        }
      })
    } catch (error) {
      console.error('Error updating draft status:', error)
      throw new Error('Failed to update draft status')
    }
  }

  /**
   * Get email draft by ID
   */
  static async getEmailDraft(draftId: string): Promise<any | null> {
    try {
      const draft = await prisma.emailDraft.findUnique({
        where: { id: draftId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              skills: true,
              location: true,
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
        }
      })

      if (!draft) return null

      return {
        id: draft.id,
        user: draft.user,
        job: draft.job,
        subject: draft.subject,
        body: draft.body,
        psLine: draft.ps_line,
        generatedAt: draft.generated_at,
        status: draft.status,
        used: draft.used,
      }
    } catch (error) {
      console.error('Error getting email draft:', error)
      return null
    }
  }

  /**
   * Generate multiple email drafts for different jobs
   */
  static async generateBatchEmails(
    userInfo: UserInfo,
    jobMatches: Array<{ job: JobInfo; matchId: string }>
  ): Promise<Array<{ jobId: string; email: GeneratedEmail; draftId: string }>> {
    const results = []

    for (const match of jobMatches) {
      try {
        console.log(`Generating email for job: ${match.job.id}`)

        const email = await this.generateColdEmail(match.job, userInfo)
        const draftId = await this.saveEmailDraft(
          userInfo.id,
          match.job.id,
          match.matchId,
          email
        )

        results.push({
          jobId: match.job.id,
          email,
          draftId,
        })
      } catch (error) {
        console.error(`Failed to generate email for job ${match.job.id}:`, error)
        // Continue with other jobs
      }
    }

    return results
  }
}


