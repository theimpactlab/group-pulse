import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(request: NextRequest) {
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
    "/favicon.ico",
  ]

  // Dashboard routes that require authentication
  const dashboardRoutes = ["/dashboard", "/sessions", "/analytics", "/settings", "/create-session"]

  const path = request.nextUrl.pathname

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith(`${route}/`))

  // Check if the current path is a dashboard route
  const isDashboardRoute = dashboardRoutes.some((route) => path === route || path.startsWith(`${route}/`))

  // Skip middleware for public routes, static files, and API routes
  if (isPublicRoute || path.startsWith("/_next") || path.startsWith("/api")) {
    return NextResponse.next()
  }

  // Get the session token from the cookies
  const sessionToken = request.cookies.get("next-auth.session-token")?.value

  if (!sessionToken && isDashboardRoute) {
    // If no session token and trying to access dashboard routes, redirect to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    // For dashboard routes, verify the session
    if (isDashboardRoute) {
      // Create a Supabase client with the service role key
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      )

      // Get the user ID from the session
      const { data: session } = await supabaseAdmin.auth.getSession(sessionToken)

      if (!session?.session?.user?.id) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Check if the user's account is locked or trial has expired
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("subscription_tier, is_trial_expired, account_locked")
        .eq("id", session.session.user.id)
        .single()

      // If account is locked or trial is expired (for free trial users), redirect to trial expired page
      if (profile?.account_locked || (profile?.subscription_tier === "free_trial" && profile?.is_trial_expired)) {
        // Only allow access to the subscription page to upgrade
        if (request.nextUrl.pathname === "/settings/subscription") {
          return NextResponse.next()
        }

        // Redirect to the trial expired page
        return NextResponse.redirect(new URL("/trial-expired", request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
