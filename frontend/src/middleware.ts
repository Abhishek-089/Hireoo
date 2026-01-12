import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // NOTE:
    // We intentionally do NOT gate dashboard/onboarding here based on onboarding_step.
    // Server components (e.g. dashboard layout) already check onboarding completion
    // using the database and redirect appropriately. Keeping this middleware simple
    // avoids issues where the JWT token's onboarding_step gets out of sync with
    // the real DB value and traps users on the onboarding page.
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth-related pages
        if (req.nextUrl.pathname.startsWith("/signin") ||
            req.nextUrl.pathname.startsWith("/signup") ||
            req.nextUrl.pathname.startsWith("/api/auth")) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
      jwt: async ({ token, user }) => {
        if (user) {
          token.onboarding_step = 1 // Default value, will be updated by client-side fetch
        }
        return token
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/api/onboarding/:path*"]
}
