import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log("Middleware processing path:", path)

  // Public routes that should always be accessible
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/trial-expired",
    "/forgot-password",
    "/reset-password",
    "/favicon.ico",
    "/join",
    "/participate",
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith(`${route}/`))

  // Skip middleware for public routes, static files, and API routes
  if (
    isPublicRoute ||
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.includes(".") // Skip files with extensions
  ) {
    console.log("Skipping middleware for public route:", path)
    return NextResponse.next()
  }

  // Get the session token from the cookies
  const sessionToken = request.cookies.get("next-auth.session-token")?.value
  console.log("Session token present:", !!sessionToken)

  // If no session token and trying to access protected routes, redirect to login
  if (!sessionToken) {
    console.log("No session token, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  console.log("Session token found, proceeding with request")
  return NextResponse.next()
}

// Limit middleware to specific paths to avoid unnecessary processing
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
