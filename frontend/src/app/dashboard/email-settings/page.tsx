"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import {
  Mail,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  AlertCircle,
  Shield,
  Lock,
  RefreshCw,
  Zap,
  KeyRound,
  Calendar,
  AtSign,
} from "lucide-react"

interface GmailStatus {
  connected: boolean
  email?: string
  expiry?: string
  scopes?: string[]
  connectedAt?: string
  isExpired?: boolean
  error?: string
}

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: "Encrypted Tokens",
    desc: "Your Gmail access tokens are encrypted using AES-256-GCM encryption.",
  },
  {
    icon: Shield,
    title: "OAuth 2.0 Security",
    desc: "We use Google's secure OAuth 2.0 flow. Revoke access anytime from your Google account.",
  },
  {
    icon: Zap,
    title: "Minimal Permissions",
    desc: "Only the permissions needed: send emails, read inbox, and modify labels.",
  },
  {
    icon: RefreshCw,
    title: "Automatic Token Refresh",
    desc: "Tokens are refreshed automatically when they expire. No manual action needed.",
  },
]

const SCOPE_LABELS: Record<string, string> = {
  "gmail.send": "Send Emails",
  "gmail.readonly": "Read Inbox",
  "gmail.modify": "Modify Labels",
  "userinfo.email": "Email Address",
  "userinfo.profile": "Profile Info",
}

function formatScope(scope: string): string {
  const key = Object.keys(SCOPE_LABELS).find((k) => scope.includes(k))
  return key ? SCOPE_LABELS[key] : scope.replace("https://www.googleapis.com/auth/", "")
}

export default function EmailSettingsPage() {
  const { data: session, status } = useSession()
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ connected: false })
  const [statusLoading, setStatusLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [testEmailTo, setTestEmailTo] = useState("")
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    if (session?.user) fetchGmailStatus()
  }, [session])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const fetchGmailStatus = async () => {
    setStatusLoading(true)
    try {
      const res = await fetch("/api/gmail/status")
      setGmailStatus(await res.json())
    } catch {
      setGmailStatus({ connected: false, error: "Failed to check status" })
    } finally {
      setStatusLoading(false)
    }
  }

  const handleConnectGmail = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/gmail/connect")
      const data = await res.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setToast({ type: "error", message: data.error || "Failed to start Gmail connection" })
        setLoading(false)
      }
    } catch {
      setToast({ type: "error", message: "Failed to start Gmail connection. Please try again." })
      setLoading(false)
    }
  }

  const handleRevokeGmail = async () => {
    if (!confirm("Disconnect your Gmail account? You won't be able to send emails until reconnected.")) return
    setLoading(true)
    try {
      const res = await fetch("/api/gmail/revoke", { method: "POST" })
      if (res.ok) {
        setGmailStatus({ connected: false })
        setToast({ type: "success", message: "Gmail disconnected successfully." })
      } else {
        setToast({ type: "error", message: "Failed to disconnect Gmail." })
      }
    } catch {
      setToast({ type: "error", message: "Error disconnecting Gmail." })
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailTo) {
      setToast({ type: "error", message: "Please enter a recipient email address." })
      return
    }
    setTestEmailLoading(true)
    try {
      const res = await fetch("/api/gmail/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailTo }),
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ type: "success", message: "Test email sent! Check your inbox." })
        setTestEmailTo("")
      } else {
        setToast({ type: "error", message: data.error || "Failed to send test email." })
      }
    } catch {
      setToast({ type: "error", message: "Error sending test email." })
    } finally {
      setTestEmailLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border transition-all
            ${toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"}`}
        >
          {toast.type === "success"
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your Gmail to send personalized cold emails and track replies.
        </p>
      </div>

      {/* Gmail Connection card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 shrink-0">
            <Mail className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Gmail Connection</h2>
            <p className="text-xs text-gray-400 mt-0.5">Link your account to enable one-click apply</p>
          </div>
        </div>

        <div className="px-6 py-6">
          {statusLoading ? (
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="h-4 w-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              Checking connection…
            </div>
          ) : gmailStatus.connected ? (
            <div className="space-y-5">
              {/* Connected status row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Connected</p>
                    <p className="text-xs text-gray-500">{gmailStatus.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleRevokeGmail}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {loading ? "Disconnecting…" : "Disconnect"}
                </button>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-2 gap-3">
                {gmailStatus.connectedAt && (
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Connected on</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {new Date(gmailStatus.connectedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                )}
                {gmailStatus.email && (
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
                    <AtSign className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Account</p>
                      <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{gmailStatus.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Permissions */}
              {gmailStatus.scopes && gmailStatus.scopes.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Granted Permissions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {gmailStatus.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {formatScope(scope)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expired warning */}
              {gmailStatus.isExpired && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Token expired. Reconnect to restore email sending.
                  <button
                    onClick={handleConnectGmail}
                    className="ml-auto text-xs font-semibold text-amber-800 underline underline-offset-2"
                  >
                    Reconnect
                  </button>
                </div>
              )}

       
            </div>
          ) : (
            /* Not connected */
            <div className="flex flex-col items-center text-center py-6">
              <div className="relative mb-5">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-gray-400" />
                </div>
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                  <XCircle className="h-3 w-3 text-white" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Gmail Not Connected</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                Connect your Gmail to send personalized cold emails directly from your own inbox.
              </p>

              <button
                onClick={handleConnectGmail}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-sm"
              >
                <Mail className="h-4 w-4" />
                {loading ? "Redirecting to Google…" : "Connect Gmail Account"}
              </button>

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-left max-w-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Hireoo requests access to <strong>send emails</strong>, <strong>read your inbox</strong>, and <strong>modify labels</strong>. Your password is never stored.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Privacy */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 shrink-0">
            <KeyRound className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Security & Privacy</h2>
            <p className="text-xs text-gray-400 mt-0.5">How we protect your Gmail credentials</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {SECURITY_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3.5">
                <div className="p-1.5 rounded-lg bg-white border border-gray-200 shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
