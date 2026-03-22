"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Briefcase, ExternalLink, Clock, Building2, ChevronDown, ChevronUp, Sparkles, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Job {
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
  posted_date: string | null
  scraped_at: string | null
}

interface SearchResult {
  jobs: Job[]
  total: number
  limit: number
  offset: number
  query: string
}

interface UserPreferences {
  jobKeyword: string
  experienceLevel: string
  datePosted: string
}

const SEARCH_PHASES = [
  "Scanning LinkedIn job postings...",
  "Analyzing job descriptions...",
  "Matching your experience level...",
  "Finding the best opportunities...",
  "Almost there...",
]

const EXPERIENCE_LABELS: Record<string, string> = {
  "0-1": "Entry Level",
  "1-3": "Junior",
  "3-5": "Mid-Level",
  "5-10": "Senior",
  "10+": "Lead/Architect",
}

// ─── localStorage cache helpers ───────────────────────────────────────────────
// Persist the last search result per keyword so the user sees their previous
// results immediately on page load while fresh results are being fetched.

const CACHE_VERSION = "v1"

function cacheKey(keyword: string, experienceLevel: string): string {
  return `job_search_cache_${CACHE_VERSION}_${keyword}_${experienceLevel}`
}

function loadCachedResults(keyword: string, experienceLevel: string): SearchResult | null {
  try {
    const raw = localStorage.getItem(cacheKey(keyword, experienceLevel))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { result: SearchResult; savedAt: number }
    // Discard cache entries older than 24 hours
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(cacheKey(keyword, experienceLevel))
      return null
    }
    return parsed.result
  } catch {
    return null
  }
}

function saveCachedResults(keyword: string, experienceLevel: string, result: SearchResult): void {
  try {
    localStorage.setItem(
      cacheKey(keyword, experienceLevel),
      JSON.stringify({ result, savedAt: Date.now() })
    )
  } catch {
    // localStorage might be full or unavailable — ignore silently
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function JobSearchClient({ preferences }: { preferences: UserPreferences }) {
  const [results, setResults] = useState<SearchResult | null>(() =>
    // Immediately restore cached results so the page never starts blank
    loadCachedResults(preferences.jobKeyword, preferences.experienceLevel)
  )
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchPhase, setSearchPhase] = useState(0)
  const [showResults, setShowResults] = useState(
    // If we already have cached data, show it right away without the loading animation
    () => loadCachedResults(preferences.jobKeyword, preferences.experienceLevel) !== null
  )

  const searchJobs = useCallback(async (offset = 0) => {
    setError(null)

    try {
      const params = new URLSearchParams({
        q: preferences.jobKeyword,
        limit: "20",
        offset: offset.toString(),
      })

      if (preferences.experienceLevel) {
        params.set("experience_level", preferences.experienceLevel)
      }

      const response = await fetch(`/api/jobs/search?${params}`)
      if (!response.ok) throw new Error("Search failed")

      const data: SearchResult = await response.json()
      if (offset === 0) {
        setResults(data)
        saveCachedResults(preferences.jobKeyword, preferences.experienceLevel, data)
      } else {
        setResults((prev) => {
          const merged = prev ? { ...data, jobs: [...prev.jobs, ...data.jobs] } : data
          saveCachedResults(preferences.jobKeyword, preferences.experienceLevel, merged)
          return merged
        })
      }
    } catch (err) {
      setError("Failed to load jobs. Please try again.")
      console.error("Search error:", err)
    }
  }, [preferences])

  // On mount: if we have cached results, show them immediately and silently
  // refresh in the background. If no cache, show the full loading animation.
  useEffect(() => {
    let phaseTimer: NodeJS.Timeout
    let mounted = true

    const hasCachedData = loadCachedResults(preferences.jobKeyword, preferences.experienceLevel) !== null

    const runSearch = async () => {
      if (hasCachedData) {
        // Silent background refresh — no loading spinner shown to the user
        setRefreshing(true)
        await searchJobs()
        if (mounted) setRefreshing(false)
        return
      }

      // No cache: show full loading animation
      setLoading(true)
      setShowResults(false)
      setSearchPhase(0)

      phaseTimer = setInterval(() => {
        if (mounted) {
          setSearchPhase((prev) => Math.min(prev + 1, SEARCH_PHASES.length - 1))
        }
      }, 800)

      await searchJobs()

      // Minimum display time for the animation to feel natural
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (mounted) {
        clearInterval(phaseTimer)
        setLoading(false)
        setTimeout(() => {
          if (mounted) setShowResults(true)
        }, 300)
      }
    }

    runSearch()

    return () => {
      mounted = false
      clearInterval(phaseTimer)
    }
  }, [searchJobs, preferences.jobKeyword, preferences.experienceLevel])

  const handleLoadMore = () => {
    if (results) {
      searchJobs(results.offset + results.limit)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    searchJobs().then(() => {
      setRefreshing(false)
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Recently"
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  // Loading animation
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md mx-auto animate-in fade-in duration-500">
          {/* Animated icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30" />
            <div className="absolute inset-2 rounded-full bg-blue-50 animate-pulse" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30">
              <Search className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>

          {/* Phase text */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Finding Your Perfect Jobs
            </h2>
            <div className="h-6">
              <p
                key={searchPhase}
                className="text-gray-500 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {SEARCH_PHASES[searchPhase]}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {SEARCH_PHASES.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i <= searchPhase
                    ? "w-8 bg-blue-500"
                    : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Search context */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>
              Searching for <span className="font-medium text-gray-600">"{preferences.jobKeyword}"</span>
              {preferences.experienceLevel && (
                <> · {EXPERIENCE_LABELS[preferences.experienceLevel] || preferences.experienceLevel}</>
              )}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${showResults ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Results</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              {preferences.jobKeyword}
            </span>
            {preferences.experienceLevel && (
              <Badge variant="secondary" className="text-xs">
                {EXPERIENCE_LABELS[preferences.experienceLevel] || preferences.experienceLevel}
              </Badge>
            )}
            {results && (
              <span className="text-gray-400">
                · {results.total} jobs found
              </span>
            )}
            {refreshing && (
              <span className="flex items-center gap-1 text-blue-500 text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Updating…
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No jobs found yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We're continuously scraping LinkedIn for new postings matching
              "{preferences.jobKeyword}". Check back soon or update your preferences.
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/onboarding"}>
              Update Preferences
            </Button>
          </CardContent>
        </Card>
      ) : results ? (
        <div className="space-y-3">
          {results.jobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                setExpandedJob(expandedJob === job.id ? null : job.id)
              }
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {job.title || "Untitled Position"}
                      </h3>
                      {job.job_type && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {job.job_type}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                      {job.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(job.posted_date)}
                      </span>
                      {job.salary_range && (
                        <Badge variant="outline" className="text-xs">
                          {job.salary_range}
                        </Badge>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {job.skills.slice(0, 6).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Expanded description */}
                    {expandedJob === job.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {job.description && (
                          <p className="text-sm text-gray-600 whitespace-pre-line mb-3">
                            {job.description}
                          </p>
                        )}
                        {job.experience_level && (
                          <p className="text-xs text-gray-500 mb-2">
                            Experience: {job.experience_level}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          {job.source_url && (
                            <a
                              href={job.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View on LinkedIn
                              </Button>
                            </a>
                          )}
                          {job.application_url && job.application_url !== job.source_url && (
                            <a
                              href={job.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button size="sm">Apply</Button>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-3 shrink-0">
                    {expandedJob === job.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More */}
          {results.jobs.length < results.total && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                onClick={handleLoadMore}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
