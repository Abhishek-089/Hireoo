/**
 * Skill Taxonomy — maps job roles and titles to related technologies/skills.
 * Used for query expansion so searching "frontend developer" also surfaces
 * React, Vue.js, Angular, HTML, CSS, TypeScript jobs automatically.
 */

export const ROLE_SKILL_MAP: Record<string, string[]> = {
  // ── Frontend ──────────────────────────────────────────────────────────────
  "frontend": [
    "react", "vue", "angular", "html", "css", "javascript", "typescript",
    "next.js", "nuxt", "svelte", "tailwind", "webpack", "vite", "sass", "less",
  ],
  "frontend developer": [
    "react", "vue", "vue.js", "angular", "html", "css", "javascript", "typescript",
    "next.js", "nextjs", "nuxt", "svelte", "sveltekit", "tailwind", "webpack",
    "vite", "sass", "less", "ui developer", "web developer", "frontend engineer",
  ],
  "frontend engineer": [
    "react", "vue", "angular", "html", "css", "javascript", "typescript",
    "next.js", "vite", "tailwind",
  ],
  "ui developer": [
    "html", "css", "javascript", "react", "vue", "angular", "figma", "tailwind",
    "sass", "bootstrap", "frontend",
  ],
  "web developer": [
    "html", "css", "javascript", "react", "node.js", "php", "wordpress",
    "vue", "angular", "tailwind",
  ],
  "react developer": [
    "react", "react.js", "javascript", "typescript", "next.js", "redux",
    "react query", "hooks", "vite", "tailwind", "frontend",
  ],
  "react engineer": [
    "react", "react.js", "javascript", "typescript", "next.js", "frontend",
  ],
  "next.js developer": [
    "next.js", "nextjs", "react", "javascript", "typescript", "vercel",
    "server-side rendering", "ssr", "frontend",
  ],
  "vue developer": [
    "vue", "vue.js", "nuxt", "javascript", "typescript", "vuex", "pinia", "frontend",
  ],
  "angular developer": [
    "angular", "typescript", "javascript", "rxjs", "ngrx", "angular cli", "frontend",
  ],
  "svelte developer": [
    "svelte", "sveltekit", "javascript", "typescript", "frontend",
  ],

  // ── Backend ───────────────────────────────────────────────────────────────
  "backend": [
    "node.js", "python", "java", "go", "golang", "rust", "php", "ruby",
    "django", "fastapi", "flask", "spring", "express", "nestjs", "laravel",
    "api", "rest", "graphql", "postgresql", "mysql", "mongodb",
  ],
  "backend developer": [
    "node.js", "python", "java", "go", "golang", "rust", "php", "ruby",
    "django", "fastapi", "spring", "express", "nestjs", "backend engineer",
    "api developer", "rest api", "graphql", "postgresql", "mysql",
  ],
  "backend engineer": [
    "node.js", "python", "java", "go", "golang", "django", "fastapi",
    "spring", "express", "nestjs", "rest", "graphql",
  ],
  "node.js developer": [
    "node.js", "nodejs", "express", "nestjs", "javascript", "typescript",
    "mongodb", "postgresql", "backend",
  ],
  "node developer": ["node.js", "express", "nestjs", "javascript", "typescript", "backend"],
  "python developer": [
    "python", "django", "fastapi", "flask", "pandas", "numpy", "sqlalchemy",
    "celery", "postgresql", "backend",
  ],
  "java developer": [
    "java", "spring", "spring boot", "hibernate", "maven", "gradle",
    "microservices", "backend",
  ],
  "go developer": ["golang", "go", "grpc", "microservices", "kubernetes", "backend"],
  "golang developer": ["golang", "go", "grpc", "microservices", "backend"],
  "php developer": ["php", "laravel", "symfony", "wordpress", "mysql", "composer"],
  "ruby developer": ["ruby", "rails", "ruby on rails", "postgresql", "rspec", "backend"],
  "rust developer": ["rust", "tokio", "actix", "backend", "systems programming"],
  "c++ developer": ["c++", "cpp", "embedded", "systems programming", "game development"],
  "c# developer": [".net", "c#", "asp.net", "entity framework", "azure", "backend"],
  "dotnet developer": [".net", "c#", "asp.net", "entity framework", "azure", "backend"],

  // ── Full Stack ────────────────────────────────────────────────────────────
  "full stack": [
    "react", "node.js", "python", "javascript", "typescript", "mongodb",
    "postgresql", "mysql", "frontend", "backend", "full-stack", "fullstack",
  ],
  "full stack developer": [
    "react", "node.js", "python", "javascript", "typescript", "mongodb",
    "postgresql", "mysql", "frontend", "backend", "fullstack", "full-stack developer",
  ],
  "full stack engineer": [
    "react", "node.js", "javascript", "typescript", "full-stack", "database", "api",
  ],
  "fullstack developer": [
    "react", "node.js", "python", "javascript", "typescript", "mongodb", "postgresql",
  ],
  "mern developer": [
    "mongodb", "express", "react", "node.js", "javascript", "full stack", "mern",
  ],
  "mean developer": [
    "mongodb", "express", "angular", "node.js", "javascript", "full stack", "mean",
  ],

  // ── Mobile ────────────────────────────────────────────────────────────────
  "mobile developer": [
    "react native", "flutter", "swift", "kotlin", "android", "ios", "mobile app",
    "dart", "swiftui", "jetpack compose",
  ],
  "mobile engineer": [
    "react native", "flutter", "swift", "kotlin", "android", "ios",
  ],
  "ios developer": [
    "swift", "objective-c", "xcode", "ios", "apple", "swiftui", "core data",
    "combine", "uikit",
  ],
  "ios engineer": ["swift", "objective-c", "xcode", "ios", "swiftui"],
  "android developer": [
    "kotlin", "java", "android studio", "android", "jetpack compose",
    "coroutines", "retrofit",
  ],
  "android engineer": ["kotlin", "java", "android", "jetpack compose"],
  "react native developer": [
    "react native", "javascript", "typescript", "mobile", "ios", "android", "expo",
  ],
  "flutter developer": ["flutter", "dart", "ios", "android", "mobile"],

  // ── Data & AI ─────────────────────────────────────────────────────────────
  "data scientist": [
    "python", "machine learning", "ml", "pandas", "numpy", "scikit-learn",
    "tensorflow", "pytorch", "statistics", "sql", "jupyter", "r",
  ],
  "data engineer": [
    "python", "spark", "hadoop", "kafka", "airflow", "sql", "bigquery",
    "data pipeline", "etl", "dbt", "snowflake", "databricks",
  ],
  "machine learning engineer": [
    "python", "tensorflow", "pytorch", "machine learning", "deep learning",
    "neural networks", "ml", "scikit-learn", "mlops", "kubeflow",
  ],
  "ml engineer": [
    "python", "tensorflow", "pytorch", "machine learning", "scikit-learn", "mlops",
  ],
  "ai engineer": [
    "python", "tensorflow", "pytorch", "openai", "llm", "machine learning",
    "deep learning", "nlp", "langchain", "vector database",
  ],
  "llm engineer": [
    "python", "openai", "llm", "langchain", "rag", "vector database",
    "prompt engineering", "fine-tuning",
  ],
  "data analyst": [
    "python", "sql", "tableau", "power bi", "excel", "analytics",
    "data visualization", "r", "looker",
  ],
  "bi developer": [
    "tableau", "power bi", "sql", "data warehouse", "business intelligence",
    "looker", "dbt",
  ],
  "nlp engineer": [
    "python", "nlp", "natural language processing", "transformers", "bert",
    "spacy", "hugging face", "machine learning",
  ],

  // ── DevOps / Cloud ────────────────────────────────────────────────────────
  "devops": [
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd",
    "jenkins", "linux", "bash", "ansible", "helm",
  ],
  "devops engineer": [
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd",
    "jenkins", "linux", "ansible", "github actions", "gitlab ci",
  ],
  "cloud engineer": [
    "aws", "azure", "gcp", "terraform", "kubernetes", "docker",
    "cloud infrastructure", "serverless",
  ],
  "cloud architect": [
    "aws", "azure", "gcp", "terraform", "kubernetes", "microservices", "cloud",
    "solution architect",
  ],
  "sre": [
    "kubernetes", "docker", "terraform", "monitoring", "aws", "reliability",
    "prometheus", "grafana", "pagerduty",
  ],
  "site reliability engineer": [
    "kubernetes", "docker", "terraform", "monitoring", "aws", "sre",
    "prometheus", "grafana",
  ],
  "platform engineer": [
    "kubernetes", "docker", "terraform", "aws", "azure", "gcp", "platform",
    "developer experience",
  ],
  "infrastructure engineer": [
    "terraform", "kubernetes", "docker", "aws", "linux", "networking", "ansible",
  ],

  // ── Security ──────────────────────────────────────────────────────────────
  "security engineer": [
    "cybersecurity", "penetration testing", "security", "aws", "siem",
    "python", "linux", "owasp", "vulnerability",
  ],
  "cybersecurity engineer": [
    "security", "penetration testing", "ethical hacking", "network security",
    "python", "linux", "siem",
  ],

  // ── Design ────────────────────────────────────────────────────────────────
  "ui/ux designer": [
    "figma", "sketch", "adobe xd", "ui design", "ux design", "design system",
    "user research", "prototyping",
  ],
  "ux designer": [
    "figma", "sketch", "user research", "prototyping", "wireframing", "ux",
    "usability testing",
  ],
  "ui designer": [
    "figma", "sketch", "adobe xd", "html", "css", "design system", "ui",
  ],
  "product designer": [
    "figma", "sketch", "ui/ux", "design system", "user research", "prototyping",
  ],
  "graphic designer": [
    "illustrator", "photoshop", "figma", "design", "branding", "adobe creative suite",
  ],

  // ── General Engineering ───────────────────────────────────────────────────
  "software engineer": [
    "javascript", "python", "java", "go", "typescript", "backend", "frontend",
    "full stack", "algorithms", "data structures",
  ],
  "software developer": [
    "javascript", "python", "java", "go", "typescript", "programming",
  ],
  "software architect": [
    "microservices", "system design", "cloud", "api design", "architecture",
    "distributed systems",
  ],
  "engineering manager": [
    "management", "leadership", "agile", "scrum", "team lead", "hiring",
  ],
  "tech lead": [
    "architecture", "code review", "mentoring", "system design", "leadership",
  ],
  "staff engineer": [
    "system design", "architecture", "distributed systems", "leadership", "mentoring",
  ],

  // ── Database ──────────────────────────────────────────────────────────────
  "database administrator": [
    "postgresql", "mysql", "oracle", "mongodb", "sql", "database",
    "performance tuning", "replication",
  ],
  "dba": ["postgresql", "mysql", "oracle", "mongodb", "sql", "database"],

  // ── QA ────────────────────────────────────────────────────────────────────
  "qa engineer": [
    "testing", "selenium", "cypress", "jest", "automated testing",
    "manual testing", "qa", "playwright",
  ],
  "test engineer": [
    "selenium", "cypress", "jest", "testing", "automation", "qa", "playwright",
  ],
  "automation engineer": [
    "selenium", "cypress", "playwright", "python", "java", "testing", "ci/cd",
  ],

  // ── Product ───────────────────────────────────────────────────────────────
  "product manager": [
    "product management", "agile", "roadmap", "user stories",
    "stakeholder management", "analytics", "jira",
  ],
  "product owner": [
    "agile", "scrum", "user stories", "backlog", "product management", "jira",
  ],

  // ── Blockchain ────────────────────────────────────────────────────────────
  "blockchain developer": [
    "solidity", "ethereum", "web3", "smart contracts", "defi", "nft",
    "hardhat", "truffle", "rust",
  ],
  "smart contract developer": [
    "solidity", "ethereum", "web3", "smart contracts", "hardhat", "blockchain",
  ],
}

/**
 * Expands a search query into a set of related terms using the skill taxonomy.
 * Example: "frontend developer" → ["react", "vue", "angular", "html", "css", ...]
 */
export function expandSearchQuery(query: string): string[] {
  const normalized = query.toLowerCase().trim()
  const terms = new Set<string>([normalized])

  // Add individual words from the query (skip very short noise words)
  normalized.split(/\s+/).forEach((word) => {
    if (word.length > 2) terms.add(word)
  })

  // Direct match: exact role or role contains/is contained by the query
  for (const [role, skills] of Object.entries(ROLE_SKILL_MAP)) {
    if (normalized === role || normalized.includes(role) || role.includes(normalized)) {
      terms.add(role)
      skills.forEach((skill) => terms.add(skill.toLowerCase()))
    }
  }

  // Reverse match: if query contains any known skill → add sibling skills from that role
  for (const [role, skills] of Object.entries(ROLE_SKILL_MAP)) {
    for (const skill of skills) {
      const skillLower = skill.toLowerCase()
      if (normalized.includes(skillLower) || skillLower.includes(normalized)) {
        terms.add(role)
        skills.forEach((s) => terms.add(s.toLowerCase()))
        break
      }
    }
  }

  // Remove very generic single-char or empty strings
  const cleaned = Array.from(terms).filter((t) => t.length > 1)

  // Limit to 30 terms to keep DB queries manageable
  return cleaned.slice(0, 30)
}
