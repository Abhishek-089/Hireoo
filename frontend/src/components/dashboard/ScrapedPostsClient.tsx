"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Mail, ExternalLink, Star, CheckCircle2, MessageSquare, Zap, Loader2, MapPin, Briefcase, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { parseLinkedInPost, type ParsedPost } from "@/lib/post-parser"
import posthog from "posthog-js"

type EmailReply = {
  id: string
  from_email: string
  subject: string
  body_text: string
  received_at: Date | string
  is_read: boolean
}

type ScrapedPostItem = {
  id: string
  text: string
  postUrl: string
  emails: string[]
  createdAt: string
  matchScore: number | null
  matchQuality: string | null
  applied?: boolean
  appliedAt?: Date | string | null
  applicationId?: string | null
  hrEmail?: string | null
  threadId?: string | null
  replies?: EmailReply[]
  hasReplies?: boolean
  isEnriched?: boolean
  jobData?: {
    title?: string | null
    company?: string | null
    location?: string | null
    skills?: string[]
    salary?: string | null
    postedDate?: string | null
    description?: string | null
  } | null
}

type PaginationInfo = {
  currentPage: number
  totalPages: number
  showingFrom: number
  showingTo: number
  totalCount: number
}

type AutoApplyStatus = "pending" | "generating" | "sending" | "sent" | "failed" | "skipped"

type AutoApplyItem = {
  post: ScrapedPostItem
  status: AutoApplyStatus
  error?: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString()
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trim() + "…"
}

const STATUS_LABEL: Record<AutoApplyStatus, string> = {
  pending: "Waiting...",
  generating: "Generating cover letter...",
  sending: "Sending email...",
  sent: "Sent",
  failed: "Failed",
  skipped: "Skipped (no email)",
}

const STATUS_COLOR: Record<AutoApplyStatus, string> = {
  pending: "text-gray-400",
  generating: "text-blue-500",
  sending: "text-blue-600",
  sent: "text-green-600",
  failed: "text-red-500",
  skipped: "text-yellow-500",
}

export function ScrapedPostsClient({
  posts,
  pagination,
  title = "Discovered Jobs",
  showAppliedBadge = false,
}: {
  posts: ScrapedPostItem[]
  pagination: PaginationInfo
  title?: string
  showAppliedBadge?: boolean
}) {
  // ── card expand state ──────────────────────────────────────────────────────
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── single-apply state ─────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [activePost, setActivePost] = useState<ScrapedPostItem | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [gmailModalOpen, setGmailModalOpen] = useState(false)

  // ── bulk-select & auto-apply state ────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [autoApplyOpen, setAutoApplyOpen] = useState(false)
  const [autoApplyMinimized, setAutoApplyMinimized] = useState(false)
  const [autoApplyQueue, setAutoApplyQueue] = useState<AutoApplyItem[]>([])
  const [autoApplyRunning, setAutoApplyRunning] = useState(false)
  const [autoApplyDone, setAutoApplyDone] = useState(false)

  // ── lock the dashboard <main> scroll when any modal is open ──────────────
  const anyModalOpen = modalOpen || resumeModalOpen || gmailModalOpen || (autoApplyOpen && !autoApplyMinimized)
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main")
    if (!main) return
    if (anyModalOpen) {
      main.style.overflow = "hidden"
    } else {
      main.style.overflow = ""
    }
    return () => { main.style.overflow = "" }
  }, [anyModalOpen])

  const { currentPage, totalPages, showingFrom, showingTo, totalCount } = pagination

  // Unapplied posts only (checkboxes only make sense for these)
  const unappliedPosts = posts.filter((p) => !p.applied)
  const allSelected =
    unappliedPosts.length > 0 &&
    unappliedPosts.every((p) => selectedIds.has(p.id))

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(unappliedPosts.map((p) => p.id)))
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Auto-trigger matching if no posts are found
  useEffect(() => {
    if (posts.length === 0 && totalCount === 0) {
      const timer = setTimeout(() => {
        fetch("/api/scraping/match-posts", { method: "POST" })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.matched > 0) window.location.reload()
          })
          .catch((err) => console.error("Auto-match failed", err))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [posts.length, totalCount])

  // ── single-apply handlers ─────────────────────────────────────────────────
  async function handleApplyClick(post: ScrapedPostItem) {
    setError(null)
    setSuccess(null)
    setLoading(true)
    setActivePost(post)

    posthog.capture("apply_button_clicked", {
      post_id: post.id,
      match_score: post.matchScore,
      match_quality: post.matchQuality,
      company: post.jobData?.company ?? null,
      job_title: post.jobData?.title ?? null,
    })

    try {
      const res = await fetch("/api/scraping/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scrapedPostId: post.id }),
      })
      const data = await res.json()

      if (res.status === 409 && data.code === "RESUME_REQUIRED") {
        posthog.capture("apply_blocked_resume_missing", { post_id: post.id })
        setResumeModalOpen(true)
        setLoading(false)
        return
      }
      if (!res.ok || !data.success) {
        posthog.capture("cover_letter_generation_failed", {
          post_id: post.id,
          error: data.error,
        })
        setError(data.error || "Failed to generate cover letter")
        setLoading(false)
        setActivePost(null)
        return
      }

      posthog.capture("cover_letter_generated", {
        post_id: post.id,
        match_score: post.matchScore,
      })
      setCoverLetter(data.coverLetter || "")
      setModalOpen(true)
    } catch (e: any) {
      posthog.capture("cover_letter_generation_failed", {
        post_id: post.id,
        error: e?.message,
      })
      setError(e?.message || "Unexpected error while generating cover letter")
      setActivePost(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!activePost) return
    const hrEmail = activePost.emails[0] || activePost.hrEmail
    if (!hrEmail) {
      setError("No email address found for this post.")
      return
    }

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/scraping/send-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scrapedPostId: activePost.id, coverLetter, hrEmail }),
      })
      const data = await res.json()

      if (
        res.status === 409 &&
        (data.code === "GMAIL_NOT_CONNECTED" || data.code === "GMAIL_RECONNECT")
      ) {
        posthog.capture("apply_blocked_gmail_not_connected", { post_id: activePost.id })
        setGmailModalOpen(true)
        return
      }
      if (!res.ok || !data.success) {
        posthog.capture("job_apply_failed", {
          post_id: activePost.id,
          error: data.error,
        })
        setError(data.error || "Failed to send email")
        return
      }

      posthog.capture("job_applied", {
        method: "manual",
        post_id: activePost.id,
        hr_email: hrEmail,
        match_score: activePost.matchScore,
      })
      setSuccess("Application email sent successfully.")
      setModalOpen(false)
      setActivePost(null)
      setTimeout(() => window.location.reload(), 1500)
    } catch (e: any) {
      setError(e?.message || "Unexpected error while sending email")
    } finally {
      setSending(false)
    }
  }

  async function handleConnectGmail() {
    posthog.capture("gmail_connect_clicked", { source: "apply_modal" })
    try {
      const res = await fetch("/api/gmail/connect")
      const data = await res.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch {
      // silently ignore — user stays on page
    }
  }

  function validateResumeFile(file: File): string | null {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type))
      return "Please select a PDF or Word document (.doc, .docx)"
    if (file.size > 10 * 1024 * 1024) return "File size must be less than 10MB"
    return null
  }

  async function handleResumeUpload() {
    if (!resumeFile || !activePost) return

    const fileError = validateResumeFile(resumeFile)
    if (fileError) {
      setResumeError(fileError)
      return
    }

    setResumeUploading(true)
    setResumeError(null)

    try {
      const formData = new FormData()
      formData.append("file", resumeFile)

      const uploadRes = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => ({}))
        setResumeError(uploadData.error || "Failed to upload resume.")
        return
      }

      const { url: cloudinaryUrl } = await uploadRes.json()

      const res = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 2,
          data: { skipped: false, fileUrl: cloudinaryUrl, fileName: resumeFile.name },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setResumeError(data.error || "Failed to save resume.")
        return
      }

      posthog.capture("resume_uploaded", { file_name: resumeFile.name })
      setResumeModalOpen(false)
      setResumeFile(null)
      await handleApplyClick(activePost)
    } catch (e: any) {
      setResumeError(e?.message || "Unexpected error while uploading resume")
    } finally {
      setResumeUploading(false)
    }
  }

  // ── auto-apply ─────────────────────────────────────────────────────────────
  function openAutoApply(ids?: Set<string>) {
    const targetIds = ids ?? selectedIds
    const targetPosts = unappliedPosts.filter((p) => targetIds.has(p.id))
    if (targetPosts.length === 0) return

    setAutoApplyQueue(
      targetPosts.map((post) => ({ post, status: "pending" as AutoApplyStatus }))
    )
    setAutoApplyDone(false)
    setAutoApplyOpen(true)
  }

  async function openAutoApplyAll() {
    try {
      const res = await fetch("/api/scraping/all-matches")
      const data = await res.json()
      const allPosts: ScrapedPostItem[] = data.posts ?? []

      if (allPosts.length === 0) return

      posthog.capture("auto_apply_started", { total_jobs: allPosts.length })
      setAutoApplyQueue(
        allPosts.map((post) => ({ post, status: "pending" as AutoApplyStatus }))
      )
      setAutoApplyDone(false)
      setAutoApplyOpen(true)
    } catch (e) {
      console.error("Failed to fetch all matches for auto-apply", e)
    }
  }

  const updateItemStatus = useCallback(
    (postId: string, update: Partial<AutoApplyItem>) => {
      setAutoApplyQueue((prev) =>
        prev.map((item) =>
          item.post.id === postId ? { ...item, ...update } : item
        )
      )
    },
    []
  )

  async function runAutoApply() {
    if (autoApplyRunning) return
    setAutoApplyRunning(true)

    for (const item of autoApplyQueue) {
      const { post } = item

      // Skip posts without email addresses
      if (post.emails.length === 0) {
        updateItemStatus(post.id, { status: "skipped" })
        continue
      }

      // Step 1: generate cover letter
      updateItemStatus(post.id, { status: "generating" })
      let generatedCoverLetter = ""

      try {
        const applyRes = await fetch("/api/scraping/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scrapedPostId: post.id }),
        })
        const applyData = await applyRes.json()

        if (applyRes.status === 409 && applyData.code === "RESUME_REQUIRED") {
          updateItemStatus(post.id, {
            status: "failed",
            error: "Resume not uploaded. Please upload a resume first.",
          })
          // Resume is missing — abort the whole queue
          break
        }

        if (!applyRes.ok || !applyData.success) {
          updateItemStatus(post.id, {
            status: "failed",
            error: applyData.error || "Failed to generate cover letter",
          })
          continue
        }

        generatedCoverLetter = applyData.coverLetter || ""
      } catch (e: any) {
        updateItemStatus(post.id, {
          status: "failed",
          error: e?.message || "Network error",
        })
        continue
      }

      // Step 2: send email
      updateItemStatus(post.id, { status: "sending" })
      const hrEmail = post.emails[0]

      try {
        const sendRes = await fetch("/api/scraping/send-application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scrapedPostId: post.id,
            coverLetter: generatedCoverLetter,
            hrEmail,
          }),
        })
        const sendData = await sendRes.json()

        if (
          sendRes.status === 409 &&
          (sendData.code === "GMAIL_NOT_CONNECTED" ||
            sendData.code === "GMAIL_RECONNECT")
        ) {
          updateItemStatus(post.id, {
            status: "failed",
            error: "Gmail not connected. Please connect Gmail first.",
          })
          // Gmail not available — abort the whole queue
          break
        }

        if (!sendRes.ok || !sendData.success) {
          updateItemStatus(post.id, {
            status: "failed",
            error: sendData.error || "Failed to send email",
          })
          continue
        }

        updateItemStatus(post.id, { status: "sent" })
      } catch (e: any) {
        updateItemStatus(post.id, {
          status: "failed",
          error: e?.message || "Network error",
        })
      }

      // Small delay between emails to avoid rate limits
      await new Promise((r) => setTimeout(r, 800))
    }

    setAutoApplyRunning(false)
    setAutoApplyDone(true)

    const sentCount = autoApplyQueue.filter((i) => i.status === "sent").length
    const failedCount = autoApplyQueue.filter((i) => i.status === "failed").length
    posthog.capture("auto_apply_completed", {
      total: autoApplyQueue.length,
      sent: sentCount,
      failed: failedCount,
    })
  }

  const autoApplySentCount = autoApplyQueue.filter((i) => i.status === "sent").length
  const autoApplyFailedCount = autoApplyQueue.filter((i) => i.status === "failed").length
  const autoApplyTotal = autoApplyQueue.length

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {!showAppliedBadge && unappliedPosts.length > 0 && (
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
              title="Select all"
            />
          )}
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Showing {showingFrom}–{showingTo} of {totalCount} post{totalCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!showAppliedBadge && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => openAutoApply()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              Apply Selected ({selectedIds.size})
            </button>
          )}
          {!showAppliedBadge && unappliedPosts.length > 0 && selectedIds.size === 0 && (
            <button
              type="button"
              onClick={openAutoApplyAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              Auto Apply All ({totalCount})
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-xs text-green-700">
            {success}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No jobs found yet</p>
            <p className="text-xs text-gray-400 mt-1">Matched jobs will appear here once the system finds opportunities for you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const primaryEmail = post.emails[0]
              const showEnriched = post.isEnriched && post.jobData
              const parsed: ParsedPost = parseLinkedInPost(post.text, post.emails)
              const isSelected = selectedIds.has(post.id)

              const isExpanded = expandedIds.has(post.id)
              const descriptionText = (showEnriched && post.jobData?.description)
                ? post.jobData.description
                : parsed.description
              const COLLAPSE_THRESHOLD = 300
              const isLongDescription = descriptionText.length > COLLAPSE_THRESHOLD

              const qualityAccent =
                post.matchQuality === "good"
                  ? "border-l-emerald-400"
                  : post.matchQuality === "medium"
                  ? "border-l-amber-400"
                  : "border-l-gray-200"

              return (
                <div
                  key={post.id}
                  className={`rounded-2xl border border-l-4 p-4 flex flex-col gap-0 transition-all ${qualityAccent} ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50/30"
                      : post.applied
                      ? "border-gray-100 bg-gray-50/50"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!showAppliedBadge && !post.applied && (
                      <div className="pt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Title + Match Score */}
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="text-base font-semibold text-gray-900 leading-snug">
                          {(showEnriched && post.jobData?.title && post.jobData.title !== "Unknown Title")
                            ? post.jobData.title
                            : parsed.title || "Hiring Post"}
                        </h3>
                        {post.matchScore !== null && post.matchQuality && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                              post.matchQuality === "good"
                                ? "bg-emerald-100 text-emerald-700"
                                : post.matchQuality === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Star className="h-3 w-3" />
                            {Math.round(post.matchScore)}%
                          </span>
                        )}
                      </div>

                      {/* Meta: Company, Location, Experience, Work Mode, Salary */}
                      <div className="flex items-center gap-x-3 gap-y-1 text-sm text-gray-600 flex-wrap mb-2.5">
                        {((showEnriched && post.jobData?.company && post.jobData.company !== "Unknown Company")
                          ? post.jobData.company
                          : parsed.company) && (
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {(showEnriched && post.jobData?.company && post.jobData.company !== "Unknown Company")
                              ? post.jobData.company
                              : parsed.company}
                          </span>
                        )}
                        {((showEnriched && post.jobData?.location) ? post.jobData.location : parsed.location) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {(showEnriched && post.jobData?.location) ? post.jobData.location : parsed.location}
                          </span>
                        )}
                        {parsed.experience && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {parsed.experience}
                          </span>
                        )}
                        {parsed.workMode && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {parsed.workMode}
                          </span>
                        )}
                        {((showEnriched && post.jobData?.salary) || parsed.salary) && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                            {(showEnriched && post.jobData?.salary) ? post.jobData.salary : parsed.salary}
                          </span>
                        )}
                      </div>

                      {/* Skills */}
                      {(() => {
                        const skills = (showEnriched && post.jobData?.skills?.length)
                          ? post.jobData.skills
                          : parsed.skills
                        return skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {skills.slice(0, 8).map((skill) => (
                              <span
                                key={skill}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                              >
                                {skill}
                              </span>
                            ))}
                            {skills.length > 8 && (
                              <span className="text-xs text-gray-400 self-center">
                                +{skills.length - 8} more
                              </span>
                            )}
                          </div>
                        ) : null
                      })()}

                      {/* Description with Show more / Show less */}
                      {descriptionText && (
                        <div className="mb-3">
                          <p
                            className={`text-sm text-gray-600 whitespace-pre-line leading-relaxed ${
                              !isExpanded && isLongDescription ? "line-clamp-3" : ""
                            }`}
                          >
                            {descriptionText}
                          </p>
                          {isLongDescription && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(post.id)}
                              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" />
                                  Show more
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Email + View Post */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex flex-wrap gap-2 items-center">
                          {post.emails.length > 0 ? (
                            post.emails.map((email) => (
                              <span
                                key={email}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                              >
                                <Mail className="h-3 w-3" />
                                {email}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">No email found</span>
                          )}
                        </div>
                        {post.postUrl && (
                          <Link
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => posthog.capture("view_post_on_linkedin", {
                              post_id: post.id,
                              match_score: post.matchScore,
                            })}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
                          >
                            View post
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      {/* Footer: date / status / apply button */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
 
                          {post.applied && post.appliedAt && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Applied {formatDate(post.appliedAt.toString())}
                            </span>
                          )}
                          {post.hasReplies && post.replies && post.replies.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                              <MessageSquare className="h-3 w-3" />
                              {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
                            </span>
                          )}
                        </div>

                        {!post.applied && (
                          <button
                            type="button"
                            disabled={loading && activePost?.id === post.id}
                            onClick={() => handleApplyClick(post)}
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            {loading && activePost?.id === post.id ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Preparing…</>
                            ) : "Apply"}
                          </button>
                        )}
                        {post.applied && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Applied
                          </span>
                        )}
                      </div>

                      {/* Recruiter replies */}
                      {post.applied && post.hasReplies && post.replies && post.replies.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Recruiter Replies</p>
                          <div className="space-y-2">
                            {post.replies.map((reply) => (
                              <div key={reply.id} className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-indigo-400" />
                                    {reply.from_email}
                                  </span>
                                  <span className="text-[11px] text-gray-400">{formatDate(reply.received_at.toString())}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-0.5">
                                  <span className="font-medium">Subject:</span> {reply.subject}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">{reply.body_text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
                <span className="text-xs text-gray-400">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={`/dashboard/job-matches?page=${currentPage - 1}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl border border-gray-100 px-3.5 py-1.5 text-xs text-gray-300 cursor-default">
                      Previous
                    </span>
                  )}
                  {currentPage < totalPages ? (
                    <Link
                      href={`/dashboard/job-matches?page=${currentPage + 1}`}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-xl border border-gray-100 px-3.5 py-1.5 text-xs text-gray-300 cursor-default">
                      Next
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Single Apply: Cover Letter Modal ─────────────────────────────── */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Review Cover Letter</h2>
              <p className="text-xs text-gray-500 mt-0.5">Edit before sending — it will be sent from your Gmail.</p>
            </div>
            <div className="p-5">
              <textarea
                className="w-full h-56 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                onBlur={() => posthog.capture("cover_letter_edited", { post_id: activePost?.id })}
              />
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <button type="button" onClick={() => { setModalOpen(false); setActivePost(null) }} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
              <button type="button" disabled={sending} onClick={handleSend}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
                {sending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : <><Mail className="h-3.5 w-3.5" /> Send Application</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Resume Upload Modal ───────────────────────────────────────────── */}
      {resumeModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Upload Resume</h2>
              <p className="text-xs text-gray-500 mt-0.5">Required once before we can send applications for you.</p>
            </div>
            <div className="p-5 space-y-3">
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                <span className="text-xs text-gray-500">{resumeFile ? resumeFile.name : "Click to select PDF or Word file"}</span>
                <span className="text-[11px] text-gray-400 mt-1">Max 10 MB</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={(e) => { setResumeFile(e.target.files?.[0] || null); setResumeError(null) }} />
              </label>
              {resumeError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{resumeError}</div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <button type="button" onClick={() => { setResumeModalOpen(false); setResumeFile(null); setResumeError(null) }} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
              <button type="button" disabled={!resumeFile || resumeUploading} onClick={handleResumeUpload}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
                {resumeUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</> : "Upload & Continue"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Gmail Connect Modal ───────────────────────────────────────────── */}
      {gmailModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Connect Gmail</h2>
              <p className="text-xs text-gray-500 mt-0.5">Required to send applications on your behalf.</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600">Connect your Gmail account so Hireoo can send application emails directly from your inbox.</p>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <button type="button" onClick={() => setGmailModalOpen(false)} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
              <button type="button" onClick={handleConnectGmail}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer">
                <Mail className="h-3.5 w-3.5" /> Connect Gmail
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Auto Apply Panel ──────────────────────────────────────────────── */}
      {autoApplyOpen && createPortal(
        <div className={`fixed z-[9999] transition-all duration-300 ${
          autoApplyMinimized
            ? "bottom-6 right-6 w-72"
            : "inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        }`}>
        <div className={`rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden ${autoApplyMinimized ? "w-full" : "w-full max-w-lg"}`}>

          {/* Header — always visible */}
          <div className="px-4 py-3 bg-gray-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {autoApplyRunning && !autoApplyDone && (
                <Loader2 className="h-3.5 w-3.5 text-emerald-400 animate-spin shrink-0" />
              )}
              {autoApplyDone && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
              {!autoApplyRunning && !autoApplyDone && (
                <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="text-sm font-semibold text-white truncate">
                {autoApplyDone
                  ? `Done · ${autoApplySentCount} sent${autoApplyFailedCount > 0 ? `, ${autoApplyFailedCount} failed` : ""}`
                  : autoApplyRunning
                  ? "Auto Apply running…"
                  : "Auto Apply"}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Progress pill */}
              <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {autoApplySentCount}/{autoApplyTotal}
              </span>

              {/* Minimize / Maximize */}
              <button
                type="button"
                title={autoApplyMinimized ? "Expand" : "Minimize"}
                onClick={() => setAutoApplyMinimized(!autoApplyMinimized)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {autoApplyMinimized
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Collapsed: just a thin progress bar */}
          {autoApplyMinimized ? (
            <div className="h-1 bg-gray-200">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${autoApplyTotal > 0 ? (autoApplySentCount / autoApplyTotal) * 100 : 0}%` }}
              />
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="h-1 bg-gray-100">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${autoApplyTotal > 0 ? (autoApplySentCount / autoApplyTotal) * 100 : 0}%` }}
                />
              </div>

              {/* Queue list */}
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {autoApplyQueue.map((item, idx) => {
                  const qParsed = parseLinkedInPost(item.post.text, item.post.emails)
                  const qTitle = qParsed.title || truncate(qParsed.description, 60)

                  return (
                    <div key={item.post.id} className="px-4 py-3 flex items-start gap-3">
                      <span className="text-xs text-gray-300 w-4 shrink-0 pt-0.5">{idx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{qTitle}</p>
                        {item.post.emails[0] && (
                          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {item.post.emails[0]}
                          </p>
                        )}
                        {item.error && (
                          <p className="text-[11px] text-red-500 mt-0.5">{item.error}</p>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {(item.status === "generating" || item.status === "sending") && (
                          <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                        )}
                        {item.status === "sent" && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        <span className={`text-[11px] font-medium ${STATUS_COLOR[item.status]}`}>
                          {STATUS_LABEL[item.status]}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                {autoApplyDone ? (
                  <>
                    <p className="text-xs text-gray-500">
                      {autoApplySentCount} sent{autoApplyFailedCount > 0 && `, ${autoApplyFailedCount} failed`}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setAutoApplyOpen(false); window.location.reload() }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </button>
                  </>
                ) : autoApplyRunning ? (
                  <>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                      Running in background — you can browse freely
                    </p>
                    <button
                      type="button"
                      onClick={() => setAutoApplyMinimized(true)}
                      className="text-[11px] text-gray-400 hover:text-gray-600 underline cursor-pointer whitespace-nowrap"
                    >
                      Minimize
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setAutoApplyOpen(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={runAutoApply}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Start Sending ({autoApplyQueue.length})
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        </div>,
        document.body
      )}
    </div>
  )
}
