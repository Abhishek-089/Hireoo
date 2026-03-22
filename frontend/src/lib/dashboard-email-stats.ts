import { prisma } from '@/lib/prisma'
import { isHumanRecruiterReplyMessage } from '@/lib/email-thread-filters'

/**
 * Stats for scraped applications sent via Gmail (My Applications / email activity).
 * Uses EmailThread + EmailLog with bounce filtering — not raw gmail_thread_id on EmailLog.
 */
export async function getScrapedApplicationMailStats(userId: string): Promise<{
  applicationsWithGmail: number
  applicationsWithHumanReply: number
}> {
  const apps = await prisma.scrapedApplication.findMany({
    where: { user_id: userId, gmail_thread_id: { not: null } },
    select: { gmail_thread_id: true },
  })

  const gmailThreadIds = [...new Set(apps.map((a) => a.gmail_thread_id!).filter(Boolean))]
  if (gmailThreadIds.length === 0) {
    return { applicationsWithGmail: 0, applicationsWithHumanReply: 0 }
  }

  const threads = await prisma.emailThread.findMany({
    where: {
      user_id: userId,
      gmail_thread_id: { in: gmailThreadIds },
    },
    include: {
      messages: {
        where: { direction: 'received' },
      },
    },
  })

  const gmailIdHasHumanReply = new Set<string>()
  for (const t of threads) {
    if (t.messages.some((m) => isHumanRecruiterReplyMessage(m))) {
      gmailIdHasHumanReply.add(t.gmail_thread_id)
    }
  }

  const applicationsWithHumanReply = apps.filter(
    (a) => a.gmail_thread_id && gmailIdHasHumanReply.has(a.gmail_thread_id)
  ).length

  return {
    applicationsWithGmail: apps.length,
    applicationsWithHumanReply,
  }
}
