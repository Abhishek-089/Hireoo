"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  CheckCircle,
  XCircle,
  Send,
  Trash2,
  RefreshCw,
  AlertCircle,
  Shield
} from "lucide-react"
import Link from "next/link"

interface GmailStatus {
  connected: boolean
  email?: string
  expiry?: string
  scopes?: string[]
  connectedAt?: string
  isExpired?: boolean
  error?: string
}

export default function EmailSettingsPage() {
  const { data: session, status } = useSession()
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ connected: false })
  const [loading, setLoading] = useState(false)
  const [testEmailTo, setTestEmailTo] = useState("")
  const [testEmailLoading, setTestEmailLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetchGmailStatus()
    }
  }, [session])

  const fetchGmailStatus = async () => {
    try {
      const response = await fetch("/api/gmail/status")
      const status = await response.json()
      setGmailStatus(status)
    } catch (error) {
      console.error("Failed to fetch Gmail status:", error)
      setGmailStatus({ connected: false, error: "Failed to check status" })
    }
  }

  const handleConnectGmail = () => {
    // Redirect to Google OAuth with Gmail scopes
    window.location.href = "/api/auth/signin/google?callbackUrl=/dashboard/email-settings"
  }

  const handleRevokeGmail = async () => {
    if (!confirm("Are you sure you want to disconnect your Gmail account? This will revoke access and you won't be able to send emails.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/gmail/revoke", {
        method: "POST",
      })

      if (response.ok) {
        setMessage("Gmail connection revoked successfully")
        setGmailStatus({ connected: false })
      } else {
        setMessage("Failed to revoke Gmail connection")
      }
    } catch (error) {
      setMessage("Error revoking Gmail connection")
    } finally {
      setLoading(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailTo) {
      setMessage("Please enter a recipient email address")
      return
    }

    setTestEmailLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/gmail/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: testEmailTo }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Test email sent successfully! Check your inbox.")
        setTestEmailTo("")
      } else {
        setMessage(data.error || "Failed to send test email")
      }
    } catch (error) {
      setMessage("Error sending test email")
    } finally {
      setTestEmailLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                Hireoo
              </Link>
              <span className="ml-4 text-gray-500">/ Email Settings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Settings</h1>
          <p className="text-gray-600">
            Connect your Gmail account to send personalized cold emails and track responses.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* Gmail Connection Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Gmail Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gmailStatus.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">Connected to Gmail</p>
                      <p className="text-sm text-gray-600">{gmailStatus.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleRevokeGmail}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {loading ? "Revoking..." : "Disconnect"}
                  </Button>
                </div>

                {/* Connection Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Connection Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Connected:</span>
                      <p className="font-medium">
                        {gmailStatus.connectedAt
                          ? new Date(gmailStatus.connectedAt).toLocaleDateString()
                          : "Unknown"
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Token Expiry:</span>
                      <p className="font-medium">
                        {gmailStatus.expiry
                          ? new Date(gmailStatus.expiry).toLocaleDateString()
                          : "Unknown"
                        }
                        {gmailStatus.isExpired && (
                          <Badge variant="destructive" className="ml-2">Expired</Badge>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Scopes */}
                  {gmailStatus.scopes && (
                    <div className="mt-4">
                      <span className="text-gray-600 text-sm">Granted Permissions:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {gmailStatus.scopes.map((scope, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {scope.replace('https://www.googleapis.com/auth/', '')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Email */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Send Test Email</h4>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter recipient email"
                      value={testEmailTo}
                      onChange={(e) => setTestEmailTo(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendTestEmail}
                      disabled={testEmailLoading}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {testEmailLoading ? "Sending..." : "Send Test"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Send a test email to verify your Gmail integration is working.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gmail Not Connected
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your Gmail account to start sending personalized cold emails.
                  Your emails will be sent from your own Gmail account.
                </p>

                <div className="space-y-4">
                  <Button onClick={handleConnectGmail} size="lg">
                    <Mail className="h-5 w-5 mr-2" />
                    Connect Gmail Account
                  </Button>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-yellow-800">
                          Required Permissions
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Hireoo will request access to send emails, read your inbox, and modify email labels.
                          We never store your password and only use the granted permissions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Encrypted Tokens</h4>
                  <p className="text-sm text-gray-600">
                    Your Gmail access tokens are encrypted using AES-256-GCM encryption.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">OAuth 2.0 Security</h4>
                  <p className="text-sm text-gray-600">
                    We use Google's secure OAuth 2.0 flow. You can revoke access anytime from your Google account.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Minimal Permissions</h4>
                  <p className="text-sm text-gray-600">
                    We only request the minimum permissions needed: send emails, read inbox, and modify labels.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Automatic Token Refresh</h4>
                  <p className="text-sm text-gray-600">
                    Access tokens are automatically refreshed when they expire. No manual intervention required.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}