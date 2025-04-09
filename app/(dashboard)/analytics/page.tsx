"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BarChart, PieChart, LineChart } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalResponses: 0,
    averageResponsesPerSession: 0,
    activeSessionsCount: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchAnalytics()
    }
  }, [status, router])

  const fetchAnalytics = async () => {
    try {
      // Fetch sessions for the current user
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id, status")
        .eq("user_id", session?.user?.id)

      if (sessionsError) throw sessionsError

      const sessionIds = sessions?.map((s) => s.id) || []
      const activeSessions = sessions?.filter((s) => s.status === "active") || []

      // Fetch responses for these sessions
      const { data: responses, error: responsesError } = await supabase
        .from("responses")
        .select("id, session_id")
        .in("session_id", sessionIds.length > 0 ? sessionIds : ["no-sessions"])

      if (responsesError) throw responsesError

      // Calculate statistics
      const totalSessions = sessions?.length || 0
      const totalResponses = responses?.length || 0
      const averageResponsesPerSession = totalSessions > 0 ? totalResponses / totalSessions : 0
      const activeSessionsCount = activeSessions.length || 0

      setStats({
        totalSessions,
        totalResponses,
        averageResponsesPerSession,
        activeSessionsCount,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
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
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResponses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Responses</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageResponsesPerSession.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessionsCount}</div>
            </CardContent>
          </Card>
        </div>

        {stats.totalSessions === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No data available</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first session to start collecting analytics data.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Summary of your interactive sessions and participant engagement.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed analytics are available for each individual session. Visit a specific session to view its
                analytics.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
