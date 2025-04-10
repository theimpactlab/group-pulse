import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define paths that should always be accessible without authentication
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/api",
    "/_next",
    "/join",
    "/participate",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/trial-expired",
    "/cookies",
    "/gdpr",
    "/favicon.ico",
    "/robots.txt",
  ]

  // Check if the current path should be public
  const isPublicPath = publicPaths.some(
    (publicPath) =>
      path === publicPath || path.startsWith(`${publicPath}/`) || path.includes(".") || path.startsWith("/api/"),
  )

  // If it's a public path, allow access without checking authentication
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, check for authentication
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  // If no token found, redirect to login
  if (!token) {
    // Create the redirect URL with the callback
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(redirectUrl)
  }

  // If token exists, allow access to protected route
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Skip public assets, API routes, and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
