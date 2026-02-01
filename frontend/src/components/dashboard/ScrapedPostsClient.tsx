"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, ExternalLink, Star, CheckCircle2, MessageSquare } from "lucide-react"

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

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString()
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

  const { currentPage, totalPages, showingFrom, showingTo, totalCount } = pagination

  // Auto-trigger matching if no posts are found
  // This helps populate the ScrapedPostMatch table on first load
  useEffect(() => {
    if (posts.length === 0 && totalCount === 0) {
      // Small delay to allow initial load
      const timer = setTimeout(() => {
        console.log("No matches found, triggering auto-match...")
        fetch("/api/scraping/match-posts", { method: "POST" })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.matched > 0) {
              console.log("Matches found! reloading...")
              window.location.reload()
            }
          })
          .catch(err => console.error("Auto-match failed", err))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [posts.length, totalCount])

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
        // Open resume upload modal instead of only showing inline error
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
      setError("No email address found for this post. Please provide an email address.")
      return
    }

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/scraping/send-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrapedPostId: activePost.id,
          coverLetter,
          hrEmail,
        }),
      })

      const data = await res.json()

      if (res.status === 409 && (data.code === "GMAIL_NOT_CONNECTED" || data.code === "GMAIL_RECONNECT")) {
        // Prompt user to connect Gmail instead of only showing error
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
      // Refresh the page to update the applied posts section
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (e: any) {
      setError(e?.message || "Unexpected error while sending email")
    } finally {
      setSending(false)
    }
  }

  function handleConnectGmail() {
    // Simple: trigger Google OAuth via NextAuth and return to dashboard when done
    signIn("google", { callbackUrl: "/dashboard" })
  }

  function validateResumeFile(file: File): string | null {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return "Please select a PDF or Word document (.doc, .docx)"
    }

    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB"
    }

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
      // Upload the actual file to Cloudinary
      const formData = new FormData()
      formData.append("file", resumeFile)

      const uploadRes = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => ({}))
        setResumeError(uploadData.error || "Failed to upload resume. Please try again.")
        return
      }

      const { url: cloudinaryUrl } = await uploadRes.json()

      // Save the real Cloudinary URL to the database
      const res = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 2,
          data: {
            skipped: false,
            fileUrl: cloudinaryUrl,
            fileName: resumeFile.name,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setResumeError(data.error || "Failed to save resume. Please try again.")
        return
      }

      // Close resume modal and immediately try applying again
      setResumeModalOpen(false)
      setResumeFile(null)
      await handleApplyClick(activePost)
    } catch (e: any) {
      setResumeError(e?.message || "Unexpected error while uploading resume")
    } finally {
      setResumeUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-gray-500">
            Showing {showingFrom}-{showingTo} of {totalCount} post
            {totalCount === 1 ? "" : "s"}
          </span>
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
            No jobs discovered yet. Use the Chrome extension to
            find job opportunities.
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const primaryEmail = post.emails[0]

              // Helper to check if we should show the enriched view
              const showEnriched = post.isEnriched && post.jobData;

              const preview =
                post.text.length > 220 ? post.text.slice(0, 220).trim() + "…" : post.text

              return (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 flex flex-col gap-2 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          {showEnriched ? (
                            <div className="mb-2">
                              {/* Enriched Job Header */}
                              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                {post.jobData?.title && post.jobData.title !== "Unknown Title"
                                  ? post.jobData.title
                                  : ""}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                {post.jobData?.company && post.jobData.company !== "Unknown Company" && (
                                  <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                                    {post.jobData.company}
                                  </span>
                                )}
                                {post.jobData?.location && (
                                  <span>• {post.jobData.location}</span>
                                )}
                                {post.jobData?.salary && (
                                  <span className="text-green-700 font-medium">• {post.jobData.salary}</span>
                                )}
                              </div>

                              {/* Skills */}
                              {post.jobData?.skills && post.jobData.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 mb-3">
                                  {post.jobData.skills.slice(0, 5).map(skill => (
                                    <Badge key={skill} variant="outline" className="text-xs py-0 h-5 border-blue-200 bg-blue-50 text-blue-700">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {post.jobData.skills.length > 5 && (
                                    <span className="text-xs text-gray-500 self-center">+{post.jobData.skills.length - 5} more</span>
                                  )}
                                </div>
                              )}

                              {/* Description Preview */}
                              <p className="text-sm text-gray-600 line-clamp-3 mt-1 cursor-pointer hover:text-gray-900 whitespace-pre-line" title="Click to view full description">
                                {post.jobData?.description?.slice(0, 300) || preview}
                              </p>
                            </div>
                          ) : (
                            // Raw Text Fallback
                            <p className="text-sm text-gray-900 whitespace-pre-line">{preview}</p>
                          )}
                        </div>
                        {post.matchScore !== null && post.matchQuality && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={
                                post.matchQuality === 'good'
                                  ? 'default'
                                  : post.matchQuality === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className={`flex items-center gap-1 ${post.matchQuality === 'good'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : post.matchQuality === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                            >
                              <Star className="h-3 w-3" />
                              {Math.round(post.matchScore)}%
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${post.matchQuality === 'good'
                                ? 'border-green-300 text-green-700'
                                : post.matchQuality === 'medium'
                                  ? 'border-yellow-300 text-yellow-700'
                                  : 'border-gray-300 text-gray-700'
                                }`}
                            >
                              {post.matchQuality.charAt(0).toUpperCase() + post.matchQuality.slice(1)} match
                            </Badge>
                          </div>
                        )}
                      </div>
                      {post.emails.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {post.emails.map((email) => (
                            <Badge
                              key={email}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              {email}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {post.emails.length === 0 && (
                        <div className="mt-2 text-xs text-gray-500 italic">
                          No email address found in this post
                        </div>
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
                  <div className="flex items-center justify-between mt-1">
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
                      {post.hasReplies && post.replies && post.replies.length > 0 && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-300"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
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
                        {loading && activePost?.id === post.id ? "Preparing..." : "Apply via email"}
                      </button>
                    )}
                    {post.applied && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Applied
                      </span>
                    )}
                  </div>

                  {/* Show email replies if any */}
                  {post.applied && post.hasReplies && post.replies && post.replies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs font-medium text-gray-700 mb-2">Email Replies:</div>
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
                onClick={() => {
                  setModalOpen(false)
                  setActivePost(null)
                }}
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

      {resumeModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
            <h2 className="text-sm font-semibold mb-2">Upload your resume</h2>
            <p className="text-xs text-gray-500 mb-3">
              You need to upload your resume once before we can send applications on your behalf.
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
                onClick={() => {
                  setResumeModalOpen(false)
                  setResumeFile(null)
                  setResumeError(null)
                }}
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
    </Card>
  )
}



