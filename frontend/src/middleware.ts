import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If the user is already authenticated and visits the homepage or auth pages,
    // redirect them straight to the dashboard.
    if (token) {
      const isPublicOnlyPath =
        pathname === "/" ||
        pathname.startsWith("/signin") ||
        pathname.startsWith("/signup")

      if (isPublicOnlyPath) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

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
        const { pathname } = req.nextUrl

        // Always allow public/auth pages through — the middleware function above
        // handles redirecting authenticated users away from them.
        if (
          pathname === "/" ||
          pathname.startsWith("/signin") ||
          pathname.startsWith("/signup") ||
          pathname.startsWith("/api/auth")
        ) {
          return true
        }

        // All other matched routes (dashboard, onboarding) require authentication.
        return !!token
      },
    },
  }
)

export const config = {
  // Add "/" and auth pages to the matcher so the redirect logic above can fire.
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/api/onboarding/:path*",
  ],
}
