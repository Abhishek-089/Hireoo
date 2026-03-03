import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VALID_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'in', 'dev', 'ai',
  'info', 'biz', 'me', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp',
  'ru', 'br', 'it', 'es', 'nl', 'se', 'no', 'fi', 'dk', 'ch',
  'at', 'be', 'pl', 'pt', 'cz', 'app', 'xyz', 'tech', 'online',
  'pro', 'site', 'live', 'cloud', 'store', 'design', 'agency',
])

export function extractEmails(text: string): string[] {
  const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  const matches = text.match(regex)
  if (!matches) return []

  const cleaned = matches.map(email => {
    const lastDot = email.lastIndexOf('.')
    const tld = email.substring(lastDot + 1).toLowerCase()

    if (VALID_TLDS.has(tld)) return email

    for (const vt of VALID_TLDS) {
      if (tld.startsWith(vt) && tld.length > vt.length) {
        return email.substring(0, lastDot + 1 + vt.length)
      }
    }

    return email
  })

  return Array.from(new Set(cleaned))
}
