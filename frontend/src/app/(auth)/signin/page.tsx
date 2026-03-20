"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, Suspense, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { sendTokenToExtension } from "@/lib/extension-auth"
import { AlertCircle, Loader2, ArrowRight, Zap, CheckCircle2 } from "lucide-react"
import posthog from "posthog-js"

const LAST_PROVIDER_KEY = "hireoo_last_signin_provider"

export function getLastSignInProvider(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LAST_PROVIDER_KEY)
}

export function setLastSignInProvider(provider: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_PROVIDER_KEY, provider)
}

const highlights = [
  "10 fresh job matches delivered daily",
  "AI cover letters sent from your Gmail",
  "See replies directly in your dashboard",
]

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}

function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastProvider, setLastProvider] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setLastProvider(getLastSignInProvider())
  }, [])

  // Map NextAuth error codes to friendly messages
  const oauthError = searchParams.get("error")
  const oauthErrorMessage =
    oauthError === "OAuthAccountNotLinked"
      ? "This email is already registered with a password. Sign in with your email & password below, or use the same Google account you registered with."
      : oauthError
      ? "Sign-in failed. Please try again."
      : null

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        setLastSignInProvider("credentials")
        posthog.capture("user_logged_in", { method: "email" })
        try {
          const tokenResponse = await fetch("/api/extension/token", { credentials: "include" })
          if (tokenResponse.ok) {
            const { token } = await tokenResponse.json()
            if (token) sendTokenToExtension(token)
          }
        } catch (error) {
          console.debug("Failed to sync with extension:", error)
        }
        router.push("/dashboard")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setLastSignInProvider("google")
    posthog.capture("user_logged_in", { method: "google" })
    signIn("google", { callbackUrl: "/dashboard?syncExtension=true" })
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between relative overflow-hidden bg-[#0f0e17] p-12">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Image src="/Hireo-logo.png" alt="Hireoo" width={550} height={300} className="h-7 w-auto brightness-0 invert" />
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI-powered job search
            </div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Your job search,
              <br />
              <span className="text-indigo-400">on autopilot.</span>
            </h2>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-xs">
              Hireoo matches jobs to your profile and sends personalised applications — while you sleep.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                </div>
                <span className="text-sm text-gray-300">{h}</span>
              </li>
            ))}
          </ul>

          {/* Floating job card preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">Frontend Developer</div>
                <div className="text-xs text-gray-400 mt-0.5">Startup · Remote</div>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-semibold">
                87% match
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10">
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-xs text-indigo-300 font-medium">Application sent via Gmail</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-gray-600">
          Built in India 🇮🇳 &nbsp;·&nbsp; © {new Date().getFullYear()} Hireoo
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Image src="/Hireo-logo.png" alt="Hireoo" width={550} height={300} className="h-6 w-auto" />
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your Hireoo account</p>
          </div>

          {/* OAuth / form errors */}
          {(oauthErrorMessage || error) && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-5">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{oauthErrorMessage ?? error}</p>
            </div>
          )}

          {/* Google */}
          <div className="relative">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
            {lastProvider === "google" && (
              <span className="absolute -top-2 -right-1 inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Last used
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-gray-400 uppercase tracking-widest">or</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {lastProvider === "credentials" && (
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <p className="text-[11px] text-indigo-700 font-medium">You last signed in with email & password</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
