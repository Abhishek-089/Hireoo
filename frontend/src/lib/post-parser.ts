/**
 * Parses raw LinkedIn hiring post text into structured, readable data.
 * Handles the common patterns found in recruiter/HR posts on LinkedIn.
 */

export interface ParsedPost {
  title: string | null
  company: string | null
  location: string | null
  experience: string | null
  salary: string | null
  workMode: string | null
  skills: string[]
  description: string
  emails: string[]
  noticePeriod: string | null
  qualification: string | null
}

const FIELD_PATTERNS: {
  key: keyof Pick<
    ParsedPost,
    "location" | "experience" | "salary" | "workMode" | "noticePeriod" | "qualification"
  >
  pattern: RegExp
}[] = [
  {
    key: "location",
    pattern:
      /(?:📍|🏢|location|city|place|based\s*(?:in|at))\s*[:\-–—]?\s*(.+)/i,
  },
  {
    key: "experience",
    pattern:
      /(?:👨‍💻|🧑‍💻|experience|exp|yrs?\s*of\s*exp)\s*[:\-–—]?\s*(.+)/i,
  },
  {
    key: "salary",
    pattern:
      /(?:💰|💵|salary|ctc|compensation|pay|package|budget)\s*[:\-–—]?\s*(.+)/i,
  },
  {
    key: "workMode",
    pattern:
      /(?:🏠|work\s*mode|work\s*type|mode\s*of\s*work|arrangement)\s*[:\-–—]?\s*(.+)/i,
  },
  {
    key: "noticePeriod",
    pattern:
      /(?:⏰|notice\s*period|notice|joining)\s*[:\-–—]?\s*(.+)/i,
  },
  {
    key: "qualification",
    pattern:
      /(?:🎓|qualification|education|degree)\s*[:\-–—]?\s*(.+)/i,
  },
]

const TITLE_PATTERNS = [
  /(?:📢|🔔|🚀|⚡|💼|🌟|✨)?\s*(?:position|role|hiring\s*for|opening\s*for|job\s*title)\s*[:\-–—]\s*(.+)/i,
  /(?:hiring|looking\s*for|we\s*need|opening\s*for|urgent\s*(?:requirement|opening|hiring)\s*(?:for)?)\s*[:\-–—]?\s*(?:a\s+)?(.+?)(?:\s*[|\n•📍🏢]|$)/i,
  /^(?:📢|🔔|🚀|⚡|💼)\s*(.+)/i,
]

const COMPANY_PATTERNS = [
  /(?:company|organization|firm)\s*[:\-–—]\s*(.+)/i,
  /(?:at|@)\s+([A-Z][A-Za-z\s&.]+?)(?:\s*[,|•\n]|$)/,
]

const SKILL_PATTERNS = [
  /(?:skills?|tech\s*stack|technologies|requirements?|must\s*have|key\s*skills)\s*[:\-–—]\s*(.+)/i,
]

function cleanText(text: string): string {
  return (
    text
      // Fix concatenated words from textContent extraction
      .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
      // Fix email+word concatenation (e.g. "com hashtag")
      .replace(
        /\.(com|org|net|io|in|co|dev|ai)(#|[A-Z])/gi,
        ".$1 $2"
      )
      // Clean up "hashtag" artifacts
      .replace(/hashtag#?/gi, "#")
      // Normalize multiple spaces
      .replace(/[ \t]{2,}/g, " ")
      // Normalize multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}

function extractTitle(lines: string[]): string | null {
  for (const line of lines.slice(0, 8)) {
    for (const pattern of TITLE_PATTERNS) {
      const match = line.match(pattern)
      if (match) {
        let title = match[1].trim()
        // Clean trailing punctuation and hashtags
        title = title.replace(/[#|•]+$/, "").trim()
        if (title.length > 10 && title.length < 150) return title
      }
    }
  }

  // Fallback: first substantial line that looks like a title
  for (const line of lines.slice(0, 5)) {
    const clean = line.replace(/^[📢🔔🚀⚡💼🌟✨#]+\s*/, "").trim()
    if (
      clean.length > 15 &&
      clean.length < 150 &&
      !clean.startsWith("http") &&
      /(?:developer|engineer|designer|manager|analyst|lead|architect|intern|associate|consultant|specialist|coordinator|executive)/i.test(clean)
    ) {
      return clean
    }
  }

  return null
}

function extractCompany(text: string, emails: string[]): string | null {
  for (const pattern of COMPANY_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const company = match[1].trim()
      if (company.length > 2 && company.length < 80) return company
    }
  }

  // Try to extract from email domain
  if (emails.length > 0) {
    const domain = emails[0].split("@")[1]
    if (domain && !domain.match(/gmail|yahoo|hotmail|outlook|rediffmail|proton/i)) {
      const name = domain.split(".")[0]
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  return null
}

function extractSkills(text: string): string[] {
  const skills = new Set<string>()

  // From explicit skill lines
  for (const pattern of SKILL_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const skillStr = match[1]
      skillStr.split(/[,|•;\/]+/).forEach((s) => {
        const clean = s.trim().replace(/^[-–—•]\s*/, "")
        if (clean.length > 1 && clean.length < 40) skills.add(clean)
      })
    }
  }

  // Known technology keywords
  const techKeywords = [
    "React", "Angular", "Vue", "Node.js", "Python", "Java", "JavaScript",
    "TypeScript", "C\\+\\+", "C#", "Go", "Rust", "Ruby", "PHP", "Swift",
    "Kotlin", "Flutter", "React Native", "AWS", "Azure", "GCP", "Docker",
    "Kubernetes", "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL",
    "REST", "Next.js", "Express", "Django", "Flask", "Spring", "Laravel",
    "Tailwind", "HTML", "CSS", "SASS", "Git", "CI/CD", "Jenkins",
    "Terraform", "Linux", "Figma", "Sketch", "Adobe XD",
    "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch",
    "Pandas", "NumPy", "SQL", "NoSQL", "Elasticsearch", "Kafka",
    "RabbitMQ", "Microservices", "Agile", "Scrum",
  ]

  for (const tech of techKeywords) {
    const regex = new RegExp(`\\b${tech}\\b`, "i")
    if (regex.test(text)) {
      // Use the canonical casing from our list
      skills.add(tech.replace(/\\\+/g, "+"))
    }
  }

  return Array.from(skills).slice(0, 10)
}

function buildCleanDescription(
  lines: string[],
  extractedFields: Set<string>
): string {
  const descLines: string[] = []
  let hashtagCount = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (descLines.length > 0) descLines.push("")
      continue
    }

    // Skip lines we already extracted as structured fields
    if (extractedFields.has(trimmed)) continue

    // Skip pure hashtag lines
    if (/^[#\s]+$/.test(trimmed) || /^(#\w+\s*){3,}$/.test(trimmed)) {
      hashtagCount++
      if (hashtagCount <= 1) {
        // Keep first hashtag line but trim to 3 tags max
        const tags = trimmed.match(/#\w+/g)?.slice(0, 3).join(" ")
        if (tags) descLines.push(tags)
      }
      continue
    }

    // Skip short emoji-only lines
    if (trimmed.length < 5 && /^[\p{Emoji}\s]+$/u.test(trimmed)) continue

    // Clean up the line
    let cleaned = trimmed
      // Remove leading emoji bullets but keep the text
      .replace(/^[📢🔔🚀⚡💼🌟✨🎯📌💡🔥👉👇📩📧📞📋✅❗️]+\s*/, "")
      .trim()

    if (cleaned.length > 0) {
      descLines.push(cleaned)
    }
  }

  return descLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function parseLinkedInPost(rawText: string, emailList: string[]): ParsedPost {
  const text = cleanText(rawText)
  const lines = text.split("\n").map((l) => l.trim())

  const result: ParsedPost = {
    title: null,
    company: null,
    location: null,
    experience: null,
    salary: null,
    workMode: null,
    skills: [],
    description: "",
    emails: emailList,
    noticePeriod: null,
    qualification: null,
  }

  const extractedLines = new Set<string>()

  // Extract structured fields
  for (const line of lines) {
    for (const { key, pattern } of FIELD_PATTERNS) {
      if (result[key]) continue
      const match = line.match(pattern)
      if (match) {
        let value = match[1].trim()
        // Clean trailing hashtags/emojis
        value = value.replace(/[#📢🔔]+.*$/, "").trim()
        if (value.length > 0 && value.length < 200) {
          result[key] = value
          extractedLines.add(line)
        }
      }
    }
  }

  // Extract title
  result.title = extractTitle(lines)

  // Extract company
  result.company = extractCompany(text, emailList)

  // Extract skills
  result.skills = extractSkills(text)

  // Build clean description from remaining lines
  result.description = buildCleanDescription(lines, extractedLines)

  // Detect work mode from text if not explicitly found
  if (!result.workMode) {
    if (/\b(remote|work\s*from\s*home|wfh)\b/i.test(text)) {
      result.workMode = "Remote"
    } else if (/\b(hybrid)\b/i.test(text)) {
      result.workMode = "Hybrid"
    } else if (/\b(onsite|on-site|in-office|office)\b/i.test(text)) {
      result.workMode = "Onsite"
    }
  }

  return result
}
