"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, ExternalLink, Star, CheckCircle2, MessageSquare, Zap, Loader2, MapPin, Briefcase, Clock } from "lucide-react"
import { parseLinkedInPost, type ParsedPost } from "@/lib/post-parser"

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
  const [autoApplyQueue, setAutoApplyQueue] = useState<AutoApplyItem[]>([])
  const [autoApplyRunning, setAutoApplyRunning] = useState(false)
  const [autoApplyDone, setAutoApplyDone] = useState(false)

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

    try {
      const res = await fetch("/api/scraping/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scrapedPostId: post.id }),
      })
      const data = await res.json()

      if (res.status === 409 && data.code === "RESUME_REQUIRED") {
        setResumeModalOpen(true)
        setLoading(false)
        return
      }
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to generate cover letter")
        setLoading(false)
        setActivePost(null)
        return
      }

      setCoverLetter(data.coverLetter || "")
      setModalOpen(true)
    } catch (e: any) {
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
        setGmailModalOpen(true)
        return
      }
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to send email")
        return
      }

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

  function handleConnectGmail() {
    signIn("google", { callbackUrl: "/dashboard" })
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

  function openAutoApplyAll() {
    const allIds = new Set(unappliedPosts.map((p) => p.id))
    openAutoApply(allIds)
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
  }

  const autoApplySentCount = autoApplyQueue.filter((i) => i.status === "sent").length
  const autoApplyFailedCount = autoApplyQueue.filter((i) => i.status === "failed").length
  const autoApplyTotal = autoApplyQueue.length

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {!showAppliedBadge && unappliedPosts.length > 0 && (
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                title="Select all"
              />
            )}
            <span>{title}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Apply Selected */}
            {!showAppliedBadge && selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => openAutoApply()}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                <Zap className="h-3.5 w-3.5" />
                Apply Selected ({selectedIds.size})
              </button>
            )}

            {/* Auto Apply All */}
            {!showAppliedBadge && unappliedPosts.length > 0 && selectedIds.size === 0 && (
              <button
                type="button"
                onClick={openAutoApplyAll}
                className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                <Zap className="h-3.5 w-3.5" />
                Auto Apply All ({unappliedPosts.length})
              </button>
            )}

            <span className="text-sm font-normal text-gray-500">
              Showing {showingFrom}-{showingTo} of {totalCount} post
              {totalCount === 1 ? "" : "s"}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
            {success}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-600">
            No jobs discovered yet. Use the Chrome extension to find job
            opportunities.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const primaryEmail = post.emails[0]
              const showEnriched = post.isEnriched && post.jobData
              const parsed: ParsedPost = parseLinkedInPost(post.text, post.emails)
              const isSelected = selectedIds.has(post.id)

              return (
                <div
                  key={post.id}
                  className={`border rounded-lg p-4 flex flex-col gap-2 bg-white shadow-sm transition-colors ${
                    isSelected ? "border-blue-400 bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!showAppliedBadge && !post.applied && (
                      <div className="pt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(post.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Title + Match Score Row */}
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <h3 className="text-base font-semibold text-gray-900 leading-snug">
                              {(showEnriched && post.jobData?.title && post.jobData.title !== "Unknown Title")
                                ? post.jobData.title
                                : parsed.title || "Hiring Post"}
                            </h3>
                            {post.matchScore !== null && post.matchQuality && (
                              <Badge
                                variant="outline"
                                className={`flex items-center gap-1 shrink-0 ${
                                  post.matchQuality === "good"
                                    ? "bg-green-50 text-green-700 border-green-300"
                                    : post.matchQuality === "medium"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                    : "bg-gray-50 text-gray-600 border-gray-300"
                                }`}
                              >
                                <Star className="h-3 w-3" />
                                {Math.round(post.matchScore)}%
                              </Badge>
                            )}
                          </div>

                          {/* Meta Row: Company, Location, Experience, Work Mode */}
                          <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap mb-2">
                            {((showEnriched && post.jobData?.company && post.jobData.company !== "Unknown Company")
                              ? post.jobData.company
                              : parsed.company) && (
                              <span className="flex items-center gap-1 font-medium text-gray-700">
                                <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                                {(showEnriched && post.jobData?.company && post.jobData.company !== "Unknown Company")
                                  ? post.jobData.company
                                  : parsed.company}
                              </span>
                            )}
                            {((showEnriched && post.jobData?.location)
                              ? post.jobData.location
                              : parsed.location) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                {(showEnriched && post.jobData?.location) ? post.jobData.location : parsed.location}
                              </span>
                            )}
                            {parsed.experience && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                {parsed.experience}
                              </span>
                            )}
                            {parsed.workMode && (
                              <Badge variant="outline" className="text-xs py-0 h-5">
                                {parsed.workMode}
                              </Badge>
                            )}
                            {((showEnriched && post.jobData?.salary) || parsed.salary) && (
                              <span className="text-green-700 font-medium">
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
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {skills.slice(0, 8).map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className="text-xs py-0 h-5 border-blue-200 bg-blue-50 text-blue-700"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                                {skills.length > 8 && (
                                  <span className="text-xs text-gray-500 self-center">
                                    +{skills.length - 8} more
                                  </span>
                                )}
                              </div>
                            ) : null
                          })()}

                          {/* Description */}
                          <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line leading-relaxed">
                            {(showEnriched && post.jobData?.description)
                              ? truncate(post.jobData.description, 350)
                              : truncate(parsed.description, 350)}
                          </p>

                          {/* Email + View Post Row */}
                          <div className="flex items-center justify-between mt-2.5 gap-3">
                            <div className="flex flex-wrap gap-2 items-center">
                              {post.emails.length > 0 ? (
                                post.emails.map((email) => (
                                  <Badge
                                    key={email}
                                    variant="secondary"
                                    className="flex items-center gap-1 text-xs"
                                  >
                                    <Mail className="h-3 w-3" />
                                    {email}
                                  </Badge>
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
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
                              >
                                View post
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">
                            Discovered at {formatDate(post.createdAt)}
                          </span>
                          {post.applied && post.appliedAt && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Applied {formatDate(post.appliedAt.toString())}
                            </Badge>
                          )}
                          {post.hasReplies &&
                            post.replies &&
                            post.replies.length > 0 && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-300"
                              >
                                <MessageSquare className="h-3 w-3" />
                                {post.replies.length}{" "}
                                {post.replies.length === 1 ? "reply" : "replies"}
                              </Badge>
                            )}
                        </div>

                        {!post.applied && (
                          <button
                            type="button"
                            disabled={loading && activePost?.id === post.id}
                            onClick={() => handleApplyClick(post)}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {loading && activePost?.id === post.id
                              ? "Preparing..."
                              : "Apply"}
                          </button>
                        )}
                        {post.applied && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Applied
                          </span>
                        )}
                      </div>

                      {post.applied &&
                        post.hasReplies &&
                        post.replies &&
                        post.replies.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-medium text-gray-700 mb-2">
                              Email Replies:
                            </div>
                            <div className="space-y-2">
                              {post.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="bg-gray-50 rounded-md p-2 border border-gray-200"
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3 text-gray-500" />
                                      <span className="text-xs font-medium text-gray-900">
                                        {reply.from_email}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(reply.received_at.toString())}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">
                                    <strong>Subject:</strong> {reply.subject}
                                  </div>
                                  <div className="text-xs text-gray-700 line-clamp-2">
                                    {reply.body_text}
                                  </div>
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

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={`/dashboard?page=${currentPage - 1}`}
                    className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs text-gray-400 cursor-default">
                    Previous
                  </span>
                )}
                {currentPage < totalPages ? (
                  <Link
                    href={`/dashboard?page=${currentPage + 1}`}
                    className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-md border px-3 py-1 text-xs text-gray-400 cursor-default">
                    Next
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* ── Single Apply: Cover Letter Modal ─────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-lg">
            <h2 className="text-sm font-semibold mb-2">Review your cover letter</h2>
            <p className="text-xs text-gray-500 mb-2">
              You can edit this text before we send it from your connected email account.
            </p>
            <textarea
              className="w-full h-56 border rounded-md p-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setModalOpen(false); setActivePost(null) }}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={handleSend}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Resume Upload Modal ───────────────────────────────────────────── */}
      {resumeModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <h2 className="text-sm font-semibold mb-2">Upload your resume</h2>
            <p className="text-xs text-gray-500 mb-3">
              You need to upload your resume once before we can send applications on
              your behalf.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setResumeFile(file)
                setResumeError(null)
              }}
              className="mb-3 text-xs"
            />
            {resumeError && (
              <div className="mb-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                {resumeError}
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setResumeModalOpen(false); setResumeFile(null); setResumeError(null) }}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!resumeFile || resumeUploading}
                onClick={handleResumeUpload}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {resumeUploading ? "Uploading..." : "Upload resume"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gmail Connect Modal ───────────────────────────────────────────── */}
      {gmailModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <h2 className="text-sm font-semibold mb-2">Connect your Gmail</h2>
            <p className="text-xs text-gray-500 mb-3">
              To send applications automatically, you need to connect your Gmail account.
            </p>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setGmailModalOpen(false)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectGmail}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Connect Gmail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auto Apply Progress Modal ─────────────────────────────────────── */}
      {autoApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  Auto Apply
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sending applications one by one via your Gmail
                </p>
              </div>
              {/* Overall progress */}
              <div className="text-right">
                <span className="text-xl font-bold text-gray-800">
                  {autoApplySentCount}
                </span>
                <span className="text-sm text-gray-400"> / {autoApplyTotal}</span>
                <div className="text-xs text-gray-500">sent</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${autoApplyTotal > 0 ? (autoApplySentCount / autoApplyTotal) * 100 : 0}%`,
                }}
              />
            </div>

            {/* Queue list */}
            <div className="divide-y max-h-80 overflow-y-auto">
              {autoApplyQueue.map((item, idx) => {
                const qParsed = parseLinkedInPost(item.post.text, item.post.emails)
                const qTitle = qParsed.title || truncate(qParsed.description, 80)

                return (
                  <div key={item.post.id} className="px-5 py-3 flex items-start gap-3">
                    <span className="text-xs text-gray-400 w-5 shrink-0 pt-0.5">
                      {idx + 1}.
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 truncate">{qTitle}</p>
                      {item.post.emails[0] && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.post.emails[0]}
                        </p>
                      )}
                      {item.error && (
                        <p className="text-xs text-red-500 mt-0.5">{item.error}</p>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {(item.status === "generating" || item.status === "sending") && (
                        <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                      )}
                      {item.status === "sent" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      )}
                      <span className={`text-xs font-medium ${STATUS_COLOR[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t bg-gray-50 flex items-center justify-between">
              {autoApplyDone ? (
                <>
                  <p className="text-xs text-gray-600">
                    Done — {autoApplySentCount} sent
                    {autoApplyFailedCount > 0 && `, ${autoApplyFailedCount} failed`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoApplyOpen(false)
                      window.location.reload()
                    }}
                    className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Done
                  </button>
                </>
              ) : autoApplyRunning ? (
                <>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    Sending… please keep this window open
                  </p>
                  <span className="text-xs text-gray-400">Do not close</span>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAutoApplyOpen(false)}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={runAutoApply}
                    className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Start Sending ({autoApplyQueue.length} emails)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
