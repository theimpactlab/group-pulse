"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("Dashboard page loaded, session status:", status)
    console.log("Session data:", session)

    // Just set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [status, session])

  // If still checking authentication status, show loading
  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>

          {status === "authenticated" ? (
            <div className="text-center">
              <p className="mb-4">Welcome, {session?.user?.name || "User"}!</p>
              <p className="mb-4">You are successfully logged in.</p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/sessions">Go to Sessions</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/settings">Go to Settings</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">You are not logged in.</p>
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
