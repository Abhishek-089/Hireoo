/**
 * Hybrid Job Search Engine
 *
 * Strategy (in priority order):
 * 1. Generate an OpenAI embedding for the user's query.
 * 2. Use pgvector (built into Supabase) to find semantically similar jobs via
 *    cosine similarity — this makes "frontend developer" surface React, Vue,
 *    Angular, HTML jobs even when those exact words aren't in the query.
 * 3. Simultaneously expand the query with the skill taxonomy (keyword expansion)
 *    and run a normal SQL search for jobs that have no embeddings yet.
 * 4. Merge both result sets (semantic first), deduplicate, and return with
 *    relevance scores.
 * 5. If the embedding API fails for any reason, fall back gracefully to pure
 *    expanded keyword search — so search is never broken.
 */

import { Prisma } from "@prisma/client"
import { EmbeddingsService } from "./embeddings"
import { prisma } from "./prisma"
import { expandSearchQuery } from "./skill-taxonomy"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JobSearchOptions {
  query: string
  limit: number
  offset: number
  location?: string
  jobType?: string
  experienceLevel?: string
}

export interface JobResult {
  id: string
  title: string | null
  company: string | null
  location: string | null
  description: string | null
  skills: string[]
  salary_range: string | null
  job_type: string | null
  experience_level: string | null
  source_url: string | null
  application_url: string | null
  posted_date: Date | null
  scraped_at: Date
  relevance_score?: number
}

export interface JobSearchResponse {
  jobs: JobResult[]
  total: number
  limit: number
  offset: number
  query: string
  expandedTerms: string[]
  searchMode: "semantic" | "keyword" | "hybrid"
}

// ─── Cache helpers (Upstash REST API — no extra package needed) ───────────────

const CACHE_TTL_SECONDS = 60 * 60 * 24 // 24 hours

async function cacheGet(key: string): Promise<number[] | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  try {
    // Upstash REST: GET /get/<key>  → { result: "value" | null }
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.result) return null
    return JSON.parse(data.result) as number[]
  } catch {
    return null
  }
}

async function cacheSet(key: string, value: number[]): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return

  try {
    // Upstash REST command POST: ["SET", key, value, "EX", seconds]
    // Using command-based POST to avoid URL-length issues with large vectors
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, JSON.stringify(value), "EX", CACHE_TTL_SECONDS]),
    })
  } catch {
    // Non-critical — ignore cache write failures
  }
}

// ─── Embedding with cache ─────────────────────────────────────────────────────

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  const cacheKey = `embed:q:${query.toLowerCase().trim()}`

  const cached = await cacheGet(cacheKey)
  if (cached) return cached

  try {
    const embedding = await EmbeddingsService.createJobEmbedding(query)
    if (embedding.length > 0) {
      await cacheSet(cacheKey, embedding)
      return embedding
    }
    return null
  } catch (err) {
    console.warn("[SemanticSearch] Failed to generate query embedding:", err)
    return null
  }
}

// ─── pgvector similarity search ───────────────────────────────────────────────

interface VectorSearchOptions {
  embedding: number[]
  expandedTerms: string[]
  fetchLimit: number
  location?: string
  jobType?: string
  experienceLevel?: string
}

async function vectorSearch(opts: VectorSearchOptions): Promise<JobResult[]> {
  const { embedding, expandedTerms, fetchLimit, location, jobType, experienceLevel } = opts

  // Format as pgvector literal: [0.1,0.2,...]
  const vectorLiteral = `[${embedding.join(",")}]`

  // Build safe WHERE conditions
  const conditions: Prisma.Sql[] = [
    Prisma.sql`j.status = 'active'`,
    // Only include rows that have a valid embedding stored
    Prisma.sql`array_length(j.embedding, 1) = 1536`,
  ]

  if (location) {
    conditions.push(Prisma.sql`j.location ILIKE ${"%" + location + "%"}`)
  }
  if (jobType) {
    conditions.push(Prisma.sql`j.job_type ILIKE ${"%" + jobType + "%"}`)
  }
  if (experienceLevel) {
    conditions.push(Prisma.sql`j.experience_level ILIKE ${"%" + experienceLevel + "%"}`)
  }

  const whereClause = Prisma.join(conditions, " AND ")

  // Keyword boost: reward jobs whose title/skills contain expanded terms (top 6)
  // This nudges exact-skill matches slightly higher within the semantic results
  const boostTerms = expandedTerms.slice(0, 6)
  const boostParts = boostTerms.map(
    (term) =>
      Prisma.sql`(CASE WHEN LOWER(j.title) LIKE LOWER(${"%" + term + "%"}) THEN 0.12 ELSE 0 END)
               + (CASE WHEN j.skills::text ILIKE ${"%" + term + "%"} THEN 0.08 ELSE 0 END)`
  )
  const keywordBoost =
    boostParts.length > 0 ? Prisma.join(boostParts, " + ") : Prisma.sql`0`

  /*
   * Score formula:
   *   semantic_score = 1 - cosine_distance  (range 0-1, higher = better)
   *   keyword_boost  = small extra signal from matching expanded terms
   *   final          = semantic_score * 0.8 + keyword_boost * 0.2
   *
   * We cast the stored Float[] column to pgvector's vector type on-the-fly.
   * Supabase enables the pgvector extension for all projects by default.
   */
  const rows = await prisma.$queryRaw<
    Array<{
      id: string
      title: string | null
      company: string | null
      location: string | null
      description: string | null
      skills: string[]
      salary_range: string | null
      job_type: string | null
      experience_level: string | null
      source_url: string | null
      application_url: string | null
      posted_date: Date | null
      scraped_at: Date
      semantic_score: string
    }>
  >(
    Prisma.sql`
      SELECT
        j.id,
        j.title,
        j.company,
        j.location,
        j.description,
        j.skills,
        j.salary_range,
        j.job_type,
        j.experience_level,
        j.source_url,
        j.application_url,
        j.posted_date,
        j.scraped_at,
        ROUND(
          CAST(
            (1 - (j.embedding::vector(1536) <=> ${vectorLiteral}::vector(1536))) * 0.8
            + (${keywordBoost}) * 0.2
          AS NUMERIC), 4
        ) AS semantic_score
      FROM "Job" j
      WHERE ${whereClause}
      ORDER BY j.embedding::vector(1536) <=> ${vectorLiteral}::vector(1536) ASC
      LIMIT ${fetchLimit}
    `
  )

  // Filter out jobs with very low semantic similarity (< 25%)
  return rows
    .filter((r) => parseFloat(r.semantic_score) >= 0.25)
    .map((r) => ({
      ...r,
      description: truncateDescription(r.description),
      relevance_score: Math.round(parseFloat(r.semantic_score) * 100),
    }))
}

// ─── Expanded keyword search ──────────────────────────────────────────────────

interface KeywordSearchOptions {
  expandedTerms: string[]
  limit: number
  offset: number
  location?: string
  jobType?: string
  experienceLevel?: string
  excludeIds?: Set<string>
}

async function keywordSearch(
  opts: KeywordSearchOptions
): Promise<{ jobs: JobResult[]; total: number }> {
  const { expandedTerms, limit, offset, location, jobType, experienceLevel, excludeIds } = opts

  // Build OR conditions: any of the expanded terms matches title/description/skills
  const termConditions = expandedTerms.map((term) => ({
    OR: [
      { title: { contains: term, mode: "insensitive" as const } },
      { description: { contains: term, mode: "insensitive" as const } },
      { requirements: { contains: term, mode: "insensitive" as const } },
      { skills: { hasSome: [term] } },
    ],
  }))

  const where: Prisma.JobWhereInput = {
    status: "active",
    OR: termConditions,
    ...(excludeIds && excludeIds.size > 0 ? { NOT: { id: { in: Array.from(excludeIds) } } } : {}),
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" }
  }
  if (jobType) {
    where.job_type = { contains: jobType, mode: "insensitive" }
  }
  if (experienceLevel) {
    where.experience_level = { contains: experienceLevel, mode: "insensitive" }
  }

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: [{ posted_date: "desc" }, { scraped_at: "desc" }],
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        description: true,
        skills: true,
        salary_range: true,
        job_type: true,
        experience_level: true,
        source_url: true,
        application_url: true,
        posted_date: true,
        scraped_at: true,
      },
    }),
  ])

  return {
    jobs: jobs.map((job) => ({
      ...job,
      description: truncateDescription(job.description),
    })),
    total,
  }
}

// ─── Main hybrid search ───────────────────────────────────────────────────────

export async function hybridJobSearch(options: JobSearchOptions): Promise<JobSearchResponse> {
  const { query, limit, offset, location, jobType, experienceLevel } = options

  const expandedTerms = expandSearchQuery(query)

  // ── Attempt semantic (vector) search ─────────────────────────────────────
  let semanticJobs: JobResult[] = []
  let vectorSearchWorked = false

  const embedding = await getQueryEmbedding(query)

  if (embedding) {
    try {
      // Fetch more than needed so we have room to merge + paginate
      semanticJobs = await vectorSearch({
        embedding,
        expandedTerms,
        fetchLimit: (offset + limit) * 3,
        location,
        jobType,
        experienceLevel,
      })
      vectorSearchWorked = semanticJobs.length > 0
    } catch (err) {
      console.warn("[SemanticSearch] pgvector query failed, falling back to keyword:", err)
    }
  }

  // ── Pure keyword fallback (no embeddings or vector search failed) ──────────
  if (!vectorSearchWorked) {
    const { jobs, total } = await keywordSearch({
      expandedTerms,
      limit,
      offset,
      location,
      jobType,
      experienceLevel,
    })
    return { jobs, total, limit, offset, query, expandedTerms, searchMode: "keyword" }
  }

  // ── Semantic-only: enough results to fill the requested page ──────────────
  if (semanticJobs.length >= offset + limit) {
    const page = semanticJobs.slice(offset, offset + limit)
    return {
      jobs: page,
      total: semanticJobs.length,
      limit,
      offset,
      query,
      expandedTerms,
      searchMode: "semantic",
    }
  }

  // ── Hybrid: semantic results first, keyword supplement for the remainder ───
  const semanticIds = new Set(semanticJobs.map((j) => j.id))
  const needFromKeyword = limit - Math.max(0, semanticJobs.length - offset)

  const { jobs: kwJobs, total: kwTotal } = await keywordSearch({
    expandedTerms,
    limit: needFromKeyword + 10,
    offset: 0,
    location,
    jobType,
    experienceLevel,
    excludeIds: semanticIds,
  })

  const merged = [...semanticJobs, ...kwJobs.filter((j) => !semanticIds.has(j.id))]
  const estimatedTotal = semanticJobs.length + kwTotal
  const page = merged.slice(offset, offset + limit)

  return {
    jobs: page,
    total: estimatedTotal,
    limit,
    offset,
    query,
    expandedTerms,
    searchMode: "hybrid",
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function truncateDescription(desc: string | null, maxChars = 500): string | null {
  if (!desc) return null
  return desc.length > maxChars ? desc.substring(0, maxChars) + "..." : desc
}
