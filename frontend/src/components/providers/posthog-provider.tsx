"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useSession } from "next-auth/react"
import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// ── Bootstrap PostHog once on the client ─────────────────────────────────────
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",

    // Manual page views so we fire them after the URL fully settles
    capture_pageview: false,

    // Capture when user leaves a page (for bounce rate, time-on-page)
    capture_pageleave: true,

    // Full autocapture: every click, form submit, change — powers heatmaps
    autocapture: true,

    // Session recordings — watch exactly what users do
    enable_recording_console_log: true,
    session_recording: {
      maskAllInputs: false,       // keep inputs visible in recordings
      maskInputOptions: {
        password: true,           // always mask passwords
      },
    },

    // Catch unhandled JS errors and report them as PostHog events
    capture_exceptions: true,

    // Keep anonymous→identified stitching across tabs/sessions
    persistence: "localStorage+cookie",

    // Disable in local dev so you don't pollute production data
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") ph.opt_out_capturing()
    },
  })
}

// ── Page-view tracker ─────────────────────────────────────────────────────────
// Fires $pageview on every client-side navigation with the full URL.
// Also fires $pageleave automatically because capture_pageleave:true above.
function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname
    posthog.capture("$pageview", { $current_url: url })
  }, [pathname, searchParams])

  return null
}

// ── User identity + rich person properties ────────────────────────────────────
// Ties every PostHog event to the real Hireoo account.
// Also enriches the person profile with skills, plan, onboarding status, etc.
// so you can slice every chart by "users who have Gmail connected" etc.
function UserIdentifier() {
  const { data: session, status } = useSession()
  const ph = usePostHog()

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return

    const user = session.user as any
    const userId = user.id || user.email

    // Core identity — links this browser to a Hireoo account
    ph.identify(userId, {
      email: user.email,
      name: user.name,
      avatar: user.image,
    })

    // Fetch full profile from our API and set it as person properties.
    // These properties appear on every user's PostHog profile and can be
    // used to filter/break down any chart.
    fetch("/api/onboarding/progress")
      .then((r) => r.json())
      .then((profile) => {
        ph.setPersonProperties(
          // Properties that can change over time (updated on each login)
          {
            onboarding_step: profile.onboarding_step ?? 0,
            onboarding_completed: profile.completed ?? false,
            gmail_connected: profile.gmailConnected ?? false,
            resume_uploaded: !!profile.resume?.fileUrl,
            skills: profile.jobKeywords ?? [],
            experience_level: profile.experienceLevel ?? null,
            plan: profile.plan ?? "free",
          },
          // $set_once properties — only written the very first time
          {
            first_seen_at: new Date().toISOString(),
          }
        )
      })
      .catch(() => {
        // Non-fatal — basic identify already fired above
      })
  }, [status, session, ph])

  // On sign-out reset so the next anonymous session doesn't bleed into this user
  useEffect(() => {
    if (status === "unauthenticated") ph.reset()
  }, [status, ph])

  return null
}

// ── Global JS error tracker ───────────────────────────────────────────────────
// PostHog's capture_exceptions covers most cases, but this catches
// promise rejections too which are easy to miss.
function ErrorTracker() {
  useEffect(() => {
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      posthog.capture("$exception", {
        message: e.reason?.message || String(e.reason),
        type: "UnhandledPromiseRejection",
      })
    }
    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    return () =>
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
  }, [])

  return null
}

// ── Main provider ─────────────────────────────────────────────────────────────
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <UserIdentifier />
      <ErrorTracker />
      {children}
    </PHProvider>
  )
}
