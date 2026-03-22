/**
 * Shared helpers for Gmail thread display and sync (bounces vs real replies).
 */

export function parseEmailAddressFromHeader(header: string): string | null {
  const trimmed = header.trim()
  const inAngles = trimmed.match(/<([^>]+@[^>]+)>/)
  if (inAngles?.[1]) return inAngles[1].trim().toLowerCase()
  const bare = trimmed.match(/[^\s<]+@[^\s>]+/)
  return bare ? bare[0].trim().toLowerCase() : null
}

/**
 * Delivery Status Notifications, mailer-daemon bounces, etc. — not recruiter replies.
 */
export function isDeliveryFailureOrSystemMessage(input: {
  fromHeader: string
  subject: string
  snippet: string
}): boolean {
  const fromRaw = (input.fromHeader || '').toLowerCase()
  const fromAddr = parseEmailAddressFromHeader(input.fromHeader || '') || ''
  const subject = (input.subject || '').toLowerCase()
  const snippet = (input.snippet || '').toLowerCase()

  if (fromAddr.includes('mailer-daemon') || fromAddr.startsWith('postmaster@')) return true
  if (/mail delivery subsystem|delivery subsystem/.test(fromRaw)) return true

  if (
    /delivery status notification|undelivered mail|returned mail|address not found|message not delivered|delivery failure|failure notice|could not be delivered|undeliverable/.test(
      subject
    )
  ) {
    return true
  }

  if (
    /wasn['\u2019]t delivered|couldn['\u2019]t be found|address couldn['\u2019]t be found|delivery to the following recipient failed|message was undeliverable|recipient address rejected/i.test(
      snippet
    )
  ) {
    return true
  }

  return false
}

export function isHumanRecruiterReplyMessage(msg: {
  direction: string
  from_email?: string | null
  subject?: string | null
  snippet?: string | null
}): boolean {
  if (msg.direction !== 'received') return false
  return !isDeliveryFailureOrSystemMessage({
    fromHeader: msg.from_email || '',
    subject: msg.subject || '',
    snippet: msg.snippet || '',
  })
}
